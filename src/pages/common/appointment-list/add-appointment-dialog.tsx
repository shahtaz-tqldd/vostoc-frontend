import { useCallback, useEffect, useId, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  CalendarDays,
  CalendarIcon,
  ChevronDown,
  UserRound,
  Phone,
  Stethoscope,
} from "lucide-react";
import { useGetDoctorsQuery } from "@/features/doctors/doctorsApi";
import {
  useCreateAppointmentMutation,
  useLazyGetPatientByContactNumberQuery,
} from "@/features/appointment/appointmentApiSlice";
import type { AppointmentPatientLookup } from "@/features/appointment/type";

type SelectOption = {
  label: string;
  value: string;
};

export type AppointmentBookingPayload = {
  patientName: string;
  patientPhone: string;
  patientAge?: number;
  patientGender?: "Male" | "Female" | "Other";
  patientNotes?: string;

  department: string;
  doctorId: string;

  appointmentDate: string;
  appointmentTime: string;
};

type AppointmentBookingDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  departmentOptions: SelectOption[];
};

const DAY_CODES = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"] as const;
const MINUTES_STEP = 15;

function dayCodeFromDate(date: Date) {
  return DAY_CODES[date.getDay()];
}

function parseDateValue(value?: string) {
  if (!value) return undefined;
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function formatDateValue(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDateLabel(date?: Date) {
  if (!date) return "Select date";
  return date.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function minutesFromTime(value: string) {
  const [h, m] = value.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  return h * 60 + m;
}

function timeFromMinutes(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${`${hours}`.padStart(2, "0")}:${`${mins}`.padStart(2, "0")}`;
}

function formatTimeLabel(value: string) {
  const minutes = minutesFromTime(value);
  if (minutes === null) return value;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const suffix = hours >= 12 ? "PM" : "AM";
  const normalizedHour = hours % 12 || 12;
  return `${normalizedHour}:${`${mins}`.padStart(2, "0")} ${suffix}`;
}

export default function AppointmentBookingDialog({
  open,
  onOpenChange,
  departmentOptions,
}: AppointmentBookingDialogProps) {
  const DEFAULT_PHONE_PREFIX = "+880";
  const formId = useId();

  // Patient info
  const [patientName, setPatientName] = useState("");
  const [patientPhone, setPatientPhone] = useState(DEFAULT_PHONE_PREFIX);
  const [patientAge, setPatientAge] = useState<string>("");
  const [patientGender, setPatientGender] = useState<
    "Male" | "Female" | "Other" | ""
  >("");
  const [patientNotes, setPatientNotes] = useState("");

  // Assignment
  const [department, setDepartment] = useState("");
  const [doctorId, setDoctorId] = useState("");

  // Schedule
  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("");
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const { data: doctors } = useGetDoctorsQuery();
  const [triggerPatientLookup] = useLazyGetPatientByContactNumberQuery();

  const filteredDoctors = useMemo(() => {
    if (!department) return [];
    return (doctors?.data ?? []).filter((d) => d.departmentId === department);
  }, [department, doctors]);

  const selectedDoctorId = useMemo(() => {
    if (!doctorId) return "";
    const stillExists = filteredDoctors.some((d) => d.id === doctorId);
    return stillExists ? doctorId : "";
  }, [filteredDoctors, doctorId]);

  const selectedDoctor = useMemo(
    () => filteredDoctors.find((doc) => doc.id === selectedDoctorId),
    [filteredDoctors, selectedDoctorId],
  );

  const scheduleByDay = useMemo(() => {
    const mapped = new Map<string, Array<{ startTime: string; endTime: string }>>();
    (selectedDoctor?.schedules ?? []).forEach((entry) => {
      const dayCode = entry.day.toUpperCase();
      const current = mapped.get(dayCode) ?? [];
      current.push({ startTime: entry.startTime, endTime: entry.endTime });
      mapped.set(dayCode, current);
    });
    return mapped;
  }, [selectedDoctor]);

  const availableDayCodes = useMemo(
    () => new Set(scheduleByDay.keys()),
    [scheduleByDay],
  );

  const selectedDateObject = useMemo(
    () => parseDateValue(appointmentDate),
    [appointmentDate],
  );

  const selectedDayCode = useMemo(() => {
    if (!selectedDateObject) return "";
    return dayCodeFromDate(selectedDateObject);
  }, [selectedDateObject]);

  const availableTimeOptions = useMemo(() => {
    if (!selectedDayCode) return [];

    const slots = scheduleByDay.get(selectedDayCode) ?? [];
    const values = new Set<string>();

    slots.forEach((slot) => {
      const start = minutesFromTime(slot.startTime);
      const end = minutesFromTime(slot.endTime);
      if (start === null || end === null || end <= start) return;

      for (let cursor = start; cursor < end; cursor += MINUTES_STEP) {
        values.add(timeFromMinutes(cursor));
      }
    });

    return [...values].sort((a, b) => a.localeCompare(b));
  }, [scheduleByDay, selectedDayCode]);

  const isDateDisabled = useCallback(
    (date: Date) => {
      if (!selectedDoctorId || availableDayCodes.size === 0) return true;
      const today = new Date();
      const currentDate = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
      );
      const todayDate = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
      );
      if (currentDate < todayDate) return true;
      return !availableDayCodes.has(dayCodeFromDate(date));
    },
    [selectedDoctorId, availableDayCodes],
  );

  const scheduleDaysLabel = useMemo(() => {
    if (!selectedDoctor) return "Select doctor to view available days.";
    if (!availableDayCodes.size) return "No weekly schedule found for this doctor.";

    const labels = DAY_CODES.filter((day) => availableDayCodes.has(day)).map(
      (day) =>
        ({
          SUN: "Sun",
          MON: "Mon",
          TUE: "Tue",
          WED: "Wed",
          THU: "Thu",
          FRI: "Fri",
          SAT: "Sat",
        })[day],
    );
    return `Available days: ${labels.join(", ")}`;
  }, [selectedDoctor, availableDayCodes]);

  const selectedGenderLabel = patientGender || "Select gender";

  const selectedDepartmentLabel = useMemo(() => {
    return (
      departmentOptions.find((option) => option.value === department)?.label ??
      "Select department"
    );
  }, [department, departmentOptions]);

  const selectedDoctorLabel = useMemo(() => {
    if (!department) return "Select department first";
    if (!selectedDoctor) return "Select doctor";

    return `${selectedDoctor.name}${selectedDoctor.specialty ? ` • ${selectedDoctor.specialty.name}` : ""}`;
  }, [department, selectedDoctor]);

  const selectedTimeLabel = useMemo(() => {
    if (!appointmentDate) return "Select date first";
    if (!availableTimeOptions.length) return "No time available";
    return availableTimeOptions.includes(appointmentTime)
      ? formatTimeLabel(appointmentTime)
      : "Select time";
  }, [appointmentDate, appointmentTime, availableTimeOptions]);

  const patientPhoneDigits = useMemo(
    () => patientPhone.replace(/\D/g, ""),
    [patientPhone],
  );

  const patientLocalDigits = useMemo(() => {
    if (patientPhoneDigits.startsWith("880")) {
      return patientPhoneDigits.slice(3);
    }
    return patientPhoneDigits;
  }, [patientPhoneDigits]);

  useEffect(() => {
    if (patientLocalDigits.length < 7) return;

    const timer = window.setTimeout(async () => {
      try {
        const data = await triggerPatientLookup(patientPhone.trim()).unwrap();
        if (!data) return;

        const resolvedPatient = (
          "data" in data && data.data ? data.data : data
        ) as AppointmentPatientLookup;

        if (resolvedPatient.patientName) {
          setPatientName(resolvedPatient.patientName);
        }

        const nextDepartment =
          resolvedPatient.departmentId || resolvedPatient.department;
        if (nextDepartment) {
          setDepartment(nextDepartment);
        }

        if (resolvedPatient.doctorId) {
          setDoctorId(resolvedPatient.doctorId);
        }
      } catch {
        // Ignore lookup failures and allow manual entry.
      }
    }, 500);

    return () => window.clearTimeout(timer);
  }, [patientLocalDigits, patientPhone, triggerPatientLookup]);

  const isSelectedDateValid = useMemo(() => {
    if (!selectedDateObject) return false;
    return !isDateDisabled(selectedDateObject);
  }, [selectedDateObject, isDateDisabled]);

  const isSelectedTimeValid = useMemo(
    () => availableTimeOptions.includes(appointmentTime),
    [availableTimeOptions, appointmentTime],
  );

  const isValid = useMemo(() => {
    const phoneOk = patientLocalDigits.length >= 7;
    return (
      patientName.trim() &&
      phoneOk &&
      department &&
      selectedDoctorId &&
      appointmentDate &&
      isSelectedDateValid &&
      appointmentTime &&
      isSelectedTimeValid
    );
  }, [
    patientName,
    patientLocalDigits,
    department,
    selectedDoctorId,
    appointmentDate,
    appointmentTime,
    isSelectedDateValid,
    isSelectedTimeValid,
  ]);

  const resetForm = () => {
    setPatientName("");
    setPatientPhone(DEFAULT_PHONE_PREFIX);
    setPatientAge("");
    setPatientGender("");
    setPatientNotes("");
    setDepartment("");
    setDoctorId("");
    setAppointmentDate("");
    setAppointmentTime("");
  };

  const handlePatientPhoneChange = (value: string) => {
    if (!value) {
      setPatientPhone(DEFAULT_PHONE_PREFIX);
      return;
    }

    const digits = value.replace(/\D/g, "");
    const normalizedDigits = digits.startsWith("880")
      ? digits
      : `880${digits.slice(0)}`;

    setPatientPhone(`+${normalizedDigits}`);
  };

  const [createAppointment, { isLoading: appointmentCreateLoading }] =
    useCreateAppointmentMutation();
  const isLoading = appointmentCreateLoading;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isValid) return;

    await createAppointment({
      patientName: patientName.trim(),
      patientPhone: patientPhone.trim(),
      patientAge: patientAge.trim() ? Number(patientAge) : undefined,
      patientGender: patientGender || undefined,
      patientNotes: patientNotes.trim() || undefined,
      department,
      doctorId: selectedDoctorId,
      appointmentDate,
      appointmentTime,
    }).unwrap();
    resetForm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="md:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>Book Appointment</DialogTitle>
          <DialogDescription>
            Enter patient details and assign a doctor in one step.
          </DialogDescription>
        </DialogHeader>

        <form id={formId} onSubmit={handleSubmit}>
          <div className="max-h-[72vh] overflow-y-auto space-y-4 py-2.5">
            {/* Patient */}
            <div className="rounded-xl border border-ink-200 bg-white/70 p-3">
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-ink-900">
                <UserRound className="h-4 w-4" />
                Patient Information
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Patient name</label>
                  <Input
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    placeholder="Full name"
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Phone number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500" />
                    <Input
                      value={patientPhone}
                      onChange={(e) => handlePatientPhoneChange(e.target.value)}
                      placeholder="+880 17xx-xxxxxx"
                      disabled={isLoading}
                      className="pl-9"
                    />
                  </div>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 mt-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Age (optional)</label>
                  <Input
                    value={patientAge}
                    onChange={(e) => setPatientAge(e.target.value)}
                    placeholder="e.g. 35"
                    inputMode="numeric"
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Gender (optional)
                  </label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        disabled={isLoading}
                        className="h-10 w-full justify-between rounded-xl bg-white px-3 font-normal"
                      >
                        <span className="truncate">{selectedGenderLabel}</span>
                        <ChevronDown className="h-4 w-4 opacity-60" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="start"
                      className="w-[var(--radix-dropdown-menu-trigger-width)]"
                    >
                      <DropdownMenuRadioGroup
                        value={patientGender || "__none"}
                        onValueChange={(value) =>
                          setPatientGender(
                            value === "__none"
                              ? ""
                              : (value as "Male" | "Female" | "Other"),
                          )
                        }
                      >
                        <DropdownMenuRadioItem value="__none">
                          Unselect
                        </DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="Male">
                          Male
                        </DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="Female">
                          Female
                        </DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="Other">
                          Other
                        </DropdownMenuRadioItem>
                      </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>

            {/* Doctor assignment */}
            <div className="rounded-xl border border-ink-200 bg-white/70 p-3">
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-ink-900">
                <Stethoscope className="h-4 w-4" />
                Assign Doctor
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Department</label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        disabled={isLoading}
                        className="h-10 w-full justify-between rounded-xl bg-white px-3 font-normal"
                      >
                        <span className="truncate">{selectedDepartmentLabel}</span>
                        <ChevronDown className="h-4 w-4 opacity-60" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="start"
                      className="w-[var(--radix-dropdown-menu-trigger-width)]"
                    >
                      <DropdownMenuRadioGroup
                        value={department || "__none"}
                        onValueChange={(value) => {
                          if (value === "__none") {
                            setDepartment("");
                            setDoctorId("");
                            setAppointmentDate("");
                            setAppointmentTime("");
                            return;
                          }
                          setDepartment(value);
                          if (value !== department) {
                            setDoctorId("");
                            setAppointmentDate("");
                            setAppointmentTime("");
                          }
                        }}
                      >
                        <DropdownMenuRadioItem value="__none">
                          Unselect
                        </DropdownMenuRadioItem>
                      {departmentOptions.map((option) => (
                        <DropdownMenuRadioItem
                          key={option.value}
                          value={option.value}
                        >
                          {option.label}
                        </DropdownMenuRadioItem>
                      ))}
                      </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Doctor</label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        disabled={!department || isLoading}
                        className="h-10 w-full justify-between rounded-xl bg-white px-3 font-normal"
                      >
                        <span className="truncate">{selectedDoctorLabel}</span>
                        <ChevronDown className="h-4 w-4 opacity-60" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="start"
                      className="w-[var(--radix-dropdown-menu-trigger-width)]"
                    >
                      <DropdownMenuRadioGroup
                        value={selectedDoctorId || "__none"}
                        onValueChange={(value) => {
                          const nextDoctorId = value === "__none" ? "" : value;
                          setDoctorId(nextDoctorId);
                          setAppointmentDate("");
                          setAppointmentTime("");
                        }}
                      >
                        <DropdownMenuRadioItem value="__none">
                          Unselect
                        </DropdownMenuRadioItem>
                        {filteredDoctors.length === 0 ? (
                          <DropdownMenuItem disabled>
                            No active doctors found
                          </DropdownMenuItem>
                        ) : (
                          filteredDoctors.map((doc) => (
                            <DropdownMenuRadioItem key={doc.id} value={doc.id}>
                              {doc.name}
                              {doc.specialty ? ` • ${doc.specialty.name}` : ""}
                            </DropdownMenuRadioItem>
                          ))
                        )}
                      </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              <div className="space-y-2 mt-3">
                <label className="text-sm font-medium">Problem / Notes</label>
                <textarea
                  value={patientNotes}
                  onChange={(e) => setPatientNotes(e.target.value)}
                  placeholder="Symptoms, reason for visit, important notes..."
                  className="min-h-[90px] w-full rounded-xl border border-ink-200 px-3 py-2 text-sm text-ink-900 outline-none placeholder:text-ink-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Date & time */}
            <div className="rounded-xl border border-ink-200 bg-white/70 p-3">
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-ink-900">
                <CalendarDays className="h-4 w-4" />
                Appointment Time
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date</label>
                  <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        disabled={!selectedDoctorId || isLoading}
                        className="h-10 w-full justify-between rounded-xl bg-white px-3 font-normal"
                      >
                        <span className="truncate">
                          {selectedDoctorId
                            ? formatDateLabel(selectedDateObject)
                            : "Select doctor first"}
                        </span>
                        <CalendarIcon className="h-4 w-4 opacity-60" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      align="start"
                      className="w-auto overflow-hidden p-0 bg-white"
                    >
                      <Calendar
                        mode="single"
                        selected={selectedDateObject}
                        className="bg-white"
                        disabled={isDateDisabled}
                        onSelect={(date) => {
                          if (!date || isDateDisabled(date)) return;
                          setAppointmentDate(formatDateValue(date));
                          setAppointmentTime("");
                          setIsCalendarOpen(false);
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                  <div className="text-xs text-black/50">{scheduleDaysLabel}</div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Time</label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        disabled={
                          !appointmentDate ||
                          !availableTimeOptions.length ||
                          isLoading
                        }
                        className="h-10 w-full justify-between rounded-xl bg-white px-3 font-normal"
                      >
                        <span className="truncate">{selectedTimeLabel}</span>
                        <ChevronDown className="h-4 w-4 opacity-60" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="start"
                      className="w-[var(--radix-dropdown-menu-trigger-width)]"
                    >
                      <DropdownMenuRadioGroup
                        value={appointmentTime || "__none"}
                        onValueChange={(value) =>
                          setAppointmentTime(value === "__none" ? "" : value)
                        }
                      >
                        <DropdownMenuRadioItem value="__none">
                          Unselect
                        </DropdownMenuRadioItem>
                        {availableTimeOptions.length === 0 ? (
                          <DropdownMenuItem disabled>
                            No slots on selected day
                          </DropdownMenuItem>
                        ) : (
                          availableTimeOptions.map((time) => (
                            <DropdownMenuRadioItem key={time} value={time}>
                              {formatTimeLabel(time)}
                            </DropdownMenuRadioItem>
                          ))
                        )}
                      </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <div className="text-xs text-black/50">
                    15 minute slots from doctor schedule
                  </div>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isValid || isLoading}
              className={cn(!isValid && "opacity-50")}
            >
              {isLoading ? "Booking..." : "Book Appointment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
