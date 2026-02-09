import { useEffect, useId, useMemo, useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { CalendarDays, UserRound, Phone, Stethoscope } from "lucide-react";
import { useGetDoctorsQuery } from "@/features/doctors/doctorsApi";
import {
  useCreateAppointmentMutation,
  useLazyGetPatientByContactNumberQuery,
} from "@/features/appointment/appointmentApiSlice";

type SelectOption = {
  label: string;
  value: string;
};

export type DoctorOption = {
  id: string;
  name: string;
  department: string;
  specialty?: string;
  contact?: string;
  status?: "Active" | "On Leave" | "Unavailable";
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

  const { data: doctors } = useGetDoctorsQuery();
  const [triggerPatientLookup] = useLazyGetPatientByContactNumberQuery();

  const filteredDoctors = useMemo(() => {
    if (!department) return [];
    return doctors?.data
      .filter((d) => d.departmentId === department)
      .filter((d) => (d.status ? d.status === "Active" : true));
  }, [department, doctors]);

  const selectedDoctorId = useMemo(() => {
    if (!doctorId) return "";
    const stillExists = filteredDoctors.some((d) => d.id === doctorId);
    return stillExists ? doctorId : "";
  }, [filteredDoctors, doctorId]);

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

        const resolvedPatient = "data" in data && data.data ? data.data : data;

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

  const isValid = useMemo(() => {
    const phoneOk = patientLocalDigits.length >= 7;
    return (
      patientName.trim() &&
      phoneOk &&
      department &&
      selectedDoctorId &&
      appointmentDate &&
      appointmentTime
    );
  }, [
    patientName,
    patientLocalDigits,
    department,
    selectedDoctorId,
    appointmentDate,
    appointmentTime,
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

  const isLoading = false;

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

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isValid) return;

    const res = createAppointment({
      patientName: patientName.trim(),
      patientPhone: patientPhone.trim(),
      patientAge: patientAge.trim() ? Number(patientAge) : undefined,
      patientGender: patientGender || undefined,
      patientNotes: patientNotes.trim() || undefined,
      department,
      doctorId,
      appointmentDate,
      appointmentTime,
    }).unwrap();

    if (res?.success) {
      console.log("Success!");
      resetForm();
      onOpenChange(false);
    }
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
                  <Select
                    value={patientGender}
                    onValueChange={(v) =>
                      setPatientGender(v as "Male" | "Female" | "Other")
                    }
                    disabled={isLoading}
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
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
                  <Select value={department} onValueChange={setDepartment}>
                    <SelectTrigger className="h-10" disabled={isLoading}>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departmentOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Doctor</label>
                  <Select
                    value={selectedDoctorId}
                    onValueChange={setDoctorId}
                    disabled={!department || isLoading}
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue
                        placeholder={
                          department
                            ? "Select doctor"
                            : "Select department first"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredDoctors.length === 0 ? (
                        <SelectItem value="__none" disabled>
                          No active doctors found
                        </SelectItem>
                      ) : (
                        filteredDoctors.map((doc) => (
                          <SelectItem key={doc.id} value={doc.id}>
                            {doc.name}
                            {doc.specialty ? ` • ${doc.specialty.name}` : ""}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
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
                  <Input
                    type="date"
                    value={appointmentDate}
                    onChange={(e) => setAppointmentDate(e.target.value)}
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Time</label>
                  <Input
                    type="time"
                    value={appointmentTime}
                    onChange={(e) => setAppointmentTime(e.target.value)}
                    disabled={isLoading}
                    step={900}
                  />
                  <div className="text-xs text-black/50">15 minute steps</div>
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
