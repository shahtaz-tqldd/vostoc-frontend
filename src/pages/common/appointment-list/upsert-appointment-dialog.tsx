import { useCallback, useEffect, useMemo, useState } from "react";
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
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { CalendarDays, CalendarIcon, ChevronDown } from "lucide-react";
import { useGetDoctorsQuery } from "@/features/doctors/doctorsApi";
import { useUpdateAppointmentMutation } from "@/features/appointment/appointmentApiSlice";
import type { CreateAppointmentPayload } from "@/features/appointment/type";

type SelectOption = {
  label: string;
  value: string;
};

export type UpsertAppointmentInitialData = {
  id: string;
  patientName: string;
  patientPhone: string;
  patientAge?: number;
  patientGender?: string;
  departmentId?: string;
  doctorId?: string;
  appointmentDate?: string;
  appointmentTime?: string;
  status?: string;
  previousAppointment?: Record<string, unknown> | null;
};

type UpsertAppointmentDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  departmentOptions: SelectOption[];
  initialData?: UpsertAppointmentInitialData | null;
};

function normalizeEditableStatus(value?: string) {
  if (
    value === "completed" ||
    value === "cancelled" ||
    value === "follow-up" ||
    value === "new"
  ) {
    return value;
  }
  return "";
}

const baseStatusOptions = [
  { label: "Complete", value: "completed" },
  { label: "Cancel", value: "cancelled" },
];

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

const genderToComparable = (value?: string) => value?.trim() || "";

export default function UpsertAppointmentDialog({
  open,
  onOpenChange,
  departmentOptions,
  initialData,
}: UpsertAppointmentDialogProps) {
  const revertStatusOption = useMemo(() => {
    const isFollowUp = Boolean(initialData?.previousAppointment);
    return isFollowUp
      ? { label: "Follow-up", value: "follow-up" }
      : { label: "New", value: "new" };
  }, [initialData?.previousAppointment]);

  const statusOptions = useMemo(
    () => [...baseStatusOptions, revertStatusOption],
    [revertStatusOption],
  );

  const [patientName, setPatientName] = useState(initialData?.patientName ?? "");
  const [patientPhone, setPatientPhone] = useState(initialData?.patientPhone ?? "");
  const [patientAge, setPatientAge] = useState(
    initialData?.patientAge !== undefined ? `${initialData.patientAge}` : "",
  );
  const [patientGender, setPatientGender] = useState(initialData?.patientGender ?? "");
  const [departmentId, setDepartmentId] = useState(initialData?.departmentId ?? "");
  const [doctorId, setDoctorId] = useState(initialData?.doctorId ?? "");
  const [appointmentDate, setAppointmentDate] = useState(initialData?.appointmentDate ?? "");
  const [appointmentTime, setAppointmentTime] = useState(initialData?.appointmentTime ?? "");
  const [status, setStatus] = useState(normalizeEditableStatus(initialData?.status));
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  useEffect(() => {
    if (!open) return;

    setPatientName(initialData?.patientName ?? "");
    setPatientPhone(initialData?.patientPhone ?? "");
    setPatientAge(initialData?.patientAge !== undefined ? `${initialData.patientAge}` : "");
    setPatientGender(initialData?.patientGender ?? "");
    setDepartmentId(initialData?.departmentId ?? "");
    setDoctorId(initialData?.doctorId ?? "");
    setAppointmentDate(initialData?.appointmentDate ?? "");
    setAppointmentTime(initialData?.appointmentTime ?? "");
    setStatus(normalizeEditableStatus(initialData?.status));
    setIsCalendarOpen(false);
  }, [initialData, open]);

  const { data: doctorsData } = useGetDoctorsQuery();
  const doctors = doctorsData?.data ?? [];

  const filteredDoctors = useMemo(() => {
    if (!departmentId) return [];
    return doctors.filter((doctor) => doctor.departmentId === departmentId);
  }, [departmentId, doctors]);

  const selectedDoctorId = useMemo(() => {
    if (!doctorId) return "";
    return filteredDoctors.some((doctor) => doctor.id === doctorId) ? doctorId : "";
  }, [doctorId, filteredDoctors]);

  const selectedDoctor = useMemo(
    () => filteredDoctors.find((doctor) => doctor.id === selectedDoctorId),
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

  const isSelectedDateValid = useMemo(() => {
    if (!selectedDateObject) return false;
    return !isDateDisabled(selectedDateObject);
  }, [selectedDateObject, isDateDisabled]);

  const isSelectedTimeValid = useMemo(
    () => availableTimeOptions.includes(appointmentTime),
    [availableTimeOptions, appointmentTime],
  );

  const selectedDepartmentLabel = useMemo(
    () =>
      departmentOptions.find((option) => option.value === departmentId)?.label ??
      "Select department",
    [departmentId, departmentOptions],
  );

  const selectedDoctorLabel = useMemo(() => {
    if (!departmentId) return "Select department first";
    if (!selectedDoctor) return "Select doctor";

    return `${selectedDoctor.name}${selectedDoctor.specialty ? ` • ${selectedDoctor.specialty.name}` : ""}`;
  }, [departmentId, selectedDoctor]);

  const selectedGenderLabel = patientGender || "Select gender";

  const selectedTimeLabel = useMemo(() => {
    if (!appointmentDate) return "Select date first";
    if (!availableTimeOptions.length) return "No time available";
    return availableTimeOptions.includes(appointmentTime)
      ? formatTimeLabel(appointmentTime)
      : "Select time";
  }, [appointmentDate, appointmentTime, availableTimeOptions]);

  const hasNonStatusChanges = useMemo(() => {
    if (!initialData) return false;

    const initialAge =
      initialData.patientAge !== undefined ? `${initialData.patientAge}` : "";

    return (
      patientName.trim() !== (initialData.patientName ?? "").trim() ||
      patientPhone.trim() !== (initialData.patientPhone ?? "").trim() ||
      patientAge.trim() !== initialAge ||
      genderToComparable(patientGender) !== genderToComparable(initialData.patientGender) ||
      departmentId !== (initialData.departmentId ?? "") ||
      selectedDoctorId !== (initialData.doctorId ?? "") ||
      appointmentDate !== (initialData.appointmentDate ?? "") ||
      appointmentTime !== (initialData.appointmentTime ?? "")
    );
  }, [
    appointmentDate,
    appointmentTime,
    departmentId,
    initialData,
    patientAge,
    patientGender,
    patientName,
    patientPhone,
    selectedDoctorId,
  ]);

  const hasStatusChange = useMemo(() => {
    if (!initialData) return false;
    return status !== normalizeEditableStatus(initialData.status);
  }, [initialData, status]);

  const hasChanges = useMemo(
    () => hasNonStatusChanges || hasStatusChange,
    [hasNonStatusChanges, hasStatusChange],
  );

  const canUpdateDetails = useMemo(
    () =>
      Boolean(
        patientName.trim() &&
          patientPhone.trim() &&
          departmentId &&
          selectedDoctorId &&
          appointmentDate &&
          isSelectedDateValid &&
          appointmentTime &&
          isSelectedTimeValid,
      ),
    [
      appointmentDate,
      appointmentTime,
      departmentId,
      isSelectedDateValid,
      isSelectedTimeValid,
      patientName,
      patientPhone,
      selectedDoctorId,
    ],
  );

  const isValid = useMemo(
    () => Boolean(status && hasChanges && (!hasNonStatusChanges || canUpdateDetails)),
    [
      canUpdateDetails,
      hasChanges,
      hasNonStatusChanges,
      status,
    ],
  );

  const [updateAppointment, { isLoading }] = useUpdateAppointmentMutation();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!initialData?.id || !isValid) {
      return;
    }

    const payload: Partial<CreateAppointmentPayload> & { status?: string } = {};

    const trimmedPatientName = patientName.trim();
    const trimmedPatientPhone = patientPhone.trim();
    const normalizedGender = patientGender.trim();
    const normalizedAge = patientAge.trim();

    if (trimmedPatientName !== (initialData.patientName ?? "").trim()) {
      payload.patientName = trimmedPatientName;
    }
    if (trimmedPatientPhone !== (initialData.patientPhone ?? "").trim()) {
      payload.patientPhone = trimmedPatientPhone;
    }

    const initialAge =
      initialData.patientAge !== undefined ? `${initialData.patientAge}` : "";
    if (normalizedAge !== initialAge) {
      payload.patientAge = normalizedAge ? Number(normalizedAge) : undefined;
    }

    if (normalizedGender !== genderToComparable(initialData.patientGender)) {
      payload.patientGender = normalizedGender || undefined;
    }

    if (departmentId !== (initialData.departmentId ?? "")) {
      payload.department = departmentId;
    }
    if (selectedDoctorId !== (initialData.doctorId ?? "")) {
      payload.doctorId = selectedDoctorId;
    }
    if (appointmentDate !== (initialData.appointmentDate ?? "")) {
      payload.appointmentDate = appointmentDate;
    }
    if (appointmentTime !== (initialData.appointmentTime ?? "")) {
      payload.appointmentTime = appointmentTime;
    }
    if (status !== normalizeEditableStatus(initialData.status)) {
      payload.status = status;
    }

    await updateAppointment({
      appointmentId: initialData.id,
      payload,
    }).unwrap();

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="md:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>Update Appointment</DialogTitle>
          <DialogDescription>
            Edit appointment details and save your changes.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Patient name</label>
              <Input
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                placeholder="Patient name"
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Patient phone</label>
              <Input
                value={patientPhone}
                onChange={(e) => setPatientPhone(e.target.value)}
                placeholder="+880 17xx-xxxxxx"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Patient age</label>
              <Input
                type="number"
                min={0}
                value={patientAge}
                onChange={(e) => setPatientAge(e.target.value)}
                placeholder="Age"
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Gender</label>
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
                      setPatientGender(value === "__none" ? "" : value)
                    }
                  >
                    <DropdownMenuRadioItem value="__none">Unselect</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="Male">Male</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="Female">Female</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="Other">Other</DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
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
                    value={departmentId || "__none"}
                    onValueChange={(value) => {
                      if (value === "__none") {
                        setDepartmentId("");
                        setDoctorId("");
                        setAppointmentDate("");
                        setAppointmentTime("");
                        return;
                      }

                      setDepartmentId(value);
                      setAppointmentDate("");
                      setAppointmentTime("");

                      const nextDoctors = doctors.filter(
                        (doctor) => doctor.departmentId === value,
                      );
                      if (!nextDoctors.some((doctor) => doctor.id === doctorId)) {
                        setDoctorId("");
                      }
                    }}
                  >
                    <DropdownMenuRadioItem value="__none">Unselect</DropdownMenuRadioItem>
                    {departmentOptions.map((option) => (
                      <DropdownMenuRadioItem key={option.value} value={option.value}>
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
                    disabled={!departmentId || isLoading}
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
                    <DropdownMenuRadioItem value="__none">Unselect</DropdownMenuRadioItem>
                    {filteredDoctors.length ? (
                      filteredDoctors.map((doctor) => (
                        <DropdownMenuRadioItem key={doctor.id} value={doctor.id}>
                          {doctor.name}
                        </DropdownMenuRadioItem>
                      ))
                    ) : (
                      <DropdownMenuItem disabled>No doctors found</DropdownMenuItem>
                    )}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
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
                    <span className="truncate">{formatDateLabel(selectedDateObject)}</span>
                    <CalendarIcon className="h-4 w-4 opacity-60" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDateObject}
                    onSelect={(date) => {
                      if (!date) return;
                      const value = formatDateValue(date);
                      setAppointmentDate(value);
                      setAppointmentTime("");
                      setIsCalendarOpen(false);
                    }}
                    disabled={isDateDisabled}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <p className="text-xs text-ink-500">
                {selectedDoctorId
                  ? `Available days are based on ${selectedDoctor?.name || "selected doctor"}'s schedule.`
                  : "Select doctor to enable date selection."}
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Time slot</label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={!appointmentDate || !availableTimeOptions.length || isLoading}
                    className="h-10 w-full justify-between rounded-xl bg-white px-3 font-normal"
                  >
                    <span className="truncate">{selectedTimeLabel}</span>
                    <CalendarDays className="h-4 w-4 opacity-60" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  className="max-h-[240px] w-[var(--radix-dropdown-menu-trigger-width)] overflow-y-auto"
                >
                  <DropdownMenuRadioGroup
                    value={appointmentTime || "__none"}
                    onValueChange={(value) =>
                      setAppointmentTime(value === "__none" ? "" : value)
                    }
                  >
                    <DropdownMenuRadioItem value="__none">Unselect</DropdownMenuRadioItem>
                    {availableTimeOptions.length ? (
                      availableTimeOptions.map((value) => (
                        <DropdownMenuRadioItem key={value} value={value}>
                          {formatTimeLabel(value)}
                        </DropdownMenuRadioItem>
                      ))
                    ) : (
                      <DropdownMenuItem disabled>No time available</DropdownMenuItem>
                    )}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <RadioGroup
              value={status}
              onValueChange={setStatus}
              className="grid grid-cols-3"
              disabled={isLoading}
            >
              {statusOptions.map((option) => {
                const itemId = `appointment-status-${option.value}`;
                return (
                  <div
                    key={option.value}
                    className={cn(
                      "flex items-center gap-2 rounded-xl border bg-white px-3 py-2",
                      status === option.value
                        ? "border-slate-900 bg-slate-50"
                        : "border-slate-200",
                    )}
                  >
                    <RadioGroupItem id={itemId} value={option.value} />
                    <Label htmlFor={itemId} className="cursor-pointer w-full">
                      {option.label}
                    </Label>
                  </div>
                );
              })}
            </RadioGroup>
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
              className={cn(!hasChanges ? "opacity-70" : "")}
            >
              {isLoading ? "Updating..." : "Update Appointment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
