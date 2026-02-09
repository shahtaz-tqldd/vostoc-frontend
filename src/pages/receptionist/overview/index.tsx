import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { adminAppointments, doctorLoads } from "@/data/mock";
import { TODAYS_APPOINTMENTS } from "@/pages/doctors/overview/mock_data";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { PATIENTS } from "@/pages/doctors/consultation/mock_data";
import { Square, User } from "lucide-react";
import { Button } from "@/components/ui/button";

const statusTone: Record<string, "mint" | "coral" | "ink"> = {
  Confirmed: "mint",
  Pending: "coral",
  Completed: "ink",
};

export default function ReceptionistOverviewPage() {
  return (
    <div className="grid grid-cols-3 gap-5">
      <div className="col-span-2 space-y-4">
        <Stats />
        <AppointmentList />
      </div>
      <div className="col-span-1 space-y-4">
        <NextPatientCard />
        <ActiveDoctorList />
      </div>
    </div>
  );
}

const AppointmentList = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Appointment queue</CardTitle>
        <CardDescription>
          Bookings grouped by assigned doctor and time slot.
        </CardDescription>
      </CardHeader>
      <CardContent className="mt-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Appointment</TableHead>
              <TableHead>Patient</TableHead>
              <TableHead>Doctor</TableHead>
              <TableHead>Slot</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {adminAppointments.map((appointment) => (
              <TableRow key={appointment.id}>
                <TableCell className="font-semibold text-ink-900">
                  {appointment.id}
                </TableCell>
                <TableCell>{appointment.patient}</TableCell>
                <TableCell>{appointment.doctor}</TableCell>
                <TableCell>{appointment.time}</TableCell>
                <TableCell>
                  <Badge variant={statusTone[appointment.status]}>
                    {appointment.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

const Stats = () => {
  const completed = TODAYS_APPOINTMENTS.filter(
    (a) => a.status === "completed",
  ).length;
  const waiting = TODAYS_APPOINTMENTS.filter(
    (a) => a.status === "waiting" || a.status === "Follow-up",
  ).length;

  return (
    <div className="grid grid-cols-3 gap-3">
      {[
        {
          label: "Total Today",
          value: TODAYS_APPOINTMENTS.length,
          bg: "bg-blue-200",
          sub: "scheduled",
        },
        {
          label: "Waiting",
          value: waiting,
          bg: "bg-red-200",
          sub: "in queue",
        },
        {
          label: "Completed",
          value: completed,
          bg: "bg-green-200",
          sub: "finished",
        },
      ].map((s) => (
        <div key={s.label} className={cn("rounded-3xl p-6", s.bg)}>
          <p className="text-xs font-bold opacity-70">{s.label}</p>
          <p className="text-3xl font-bold mt-4 leading-none">{s.value}</p>
          <p className="text-xs opacity-50 mt-2">{s.sub}</p>
        </div>
      ))}
    </div>
  );
};

const NextPatientCard = () => {
  const [status, setStatus] = useState("completed");
  const [currentIndex, setCurrentIndex] = useState(0);

  // derive
  const isQueueEmpty = TODAYS_APPOINTMENTS.length === 0;
  const currentAppointment = TODAYS_APPOINTMENTS[currentIndex] ?? null;
  const nextAppointment = TODAYS_APPOINTMENTS[currentIndex + 1] ?? null;
  const currentPatient = currentAppointment
    ? PATIENTS[currentAppointment.patientId]
    : null;
  const nextPatient = nextAppointment
    ? PATIENTS[nextAppointment.patientId]
    : null;
  const currentIssue = currentAppointment?.chief ?? "No chief complaint";
  const waitingSince = currentAppointment?.time ?? "Unknown time";

  const handleEnd = () => {
    if (currentIndex + 1 < TODAYS_APPOINTMENTS.length) {
      setCurrentIndex((i) => i + 1);
      setStatus("completed");
    } else {
      // no more patients
      setCurrentIndex((i) => i + 1);
      setStatus("idle");
    }
  };

  if (isQueueEmpty || (status === "idle" && !currentPatient)) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-4">
        <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
          <User size={13} className="text-blue-500" /> Next Patient
        </h3>
        <div className="flex flex-col items-center justify-center py-6 gap-2">
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
            <User size={18} className="text-gray-300" />
          </div>
          <p className="text-xs text-gray-400 text-center">
            No patients in queue
          </p>
        </div>
      </div>
    );
  }

  if (status === "in_progress" && currentPatient) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-4">
        <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
          <User size={13} className="text-blue-500" /> Next Patient
        </h3>

        {/* live badge */}
        <div className="flex items-center gap-1.5 mb-3">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
          </span>
          <span className="text-xs font-semibold text-green-600">
            Consultation in progress
          </span>
        </div>

        {/* current patient card */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-start gap-3">
          <div className="w-9 h-9 rounded-full bg-green-200 flex items-center justify-center flex-shrink-0">
            <User size={16} className="text-green-700" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-gray-800 truncate">
              {currentPatient.name}
            </p>
            <p className="text-xs text-gray-500 truncate">{currentIssue}</p>
            <p className="text-xs text-green-600 mt-0.5">
              Age {currentPatient.age} · Seeing now
            </p>
          </div>
        </div>

        {/* end button */}
        <Button onClick={handleEnd} className="w-full mt-6" variant="outline">
          <Square size={12} fill="currentColor" /> End Consultation
        </Button>

        {/* next in line preview */}
        {nextPatient && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-400 mb-1.5">Up next</p>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                <User size={11} className="text-gray-400" />
              </div>
              <p className="text-xs text-gray-500">{nextPatient.name}</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  // COMPLETED: ready to start next consultation
  if (status === "completed" && currentPatient) {
    return (
      <Card>
        <CardHeader>
          <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
            <User size={13} className="text-blue-500" /> Next Patient
          </h3>

          {/* ready badge */}
          <div className="flex items-center gap-1.5 mb-3">
            <span className="w-2 h-2 rounded-full bg-blue-400" />
            <span className="text-xs font-semibold text-blue-600">
              Ready to consult
            </span>
          </div>
        </CardHeader>
        <CardContent>
          {/* next patient card */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-blue-200 flex items-center justify-center flex-shrink-0">
              <User size={16} className="text-blue-700" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-gray-800 truncate">
                {currentPatient.name}
              </p>
              <p className="text-xs text-gray-500 truncate">{currentIssue}</p>
              <p className="text-xs text-gray-400 mt-0.5">
                Age {currentPatient.age} · Waiting since {waitingSince}
              </p>
            </div>
          </div>

          {/* remaining count */}
          {TODAYS_APPOINTMENTS.length - currentIndex - 1 > 0 && (
            <p className="text-xs text-gray-400 text-center mt-4">
              {TODAYS_APPOINTMENTS.length - currentIndex - 1} more patient
              {TODAYS_APPOINTMENTS.length - currentIndex - 1 > 1
                ? "s"
                : ""}{" "}
              waiting
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  return null;
};

const ActiveDoctorList = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Doctor load</CardTitle>
        <CardDescription>Slots filled, by department</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2.5 mt-6">
        {doctorLoads.map((doctor) => (
          <div
            key={doctor.name}
            className="rounded-2xl border border-ink-200/70 bg-white/80 p-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-ink-900">
                  {doctor.name}
                </div>
                <div className="text-xs text-ink-500">{doctor.department}</div>
              </div>
              <Badge variant="mint">{doctor.slotFill}</Badge>
            </div>
            <div className="mt-3 text-xs text-ink-500">
              Next available: {doctor.nextAvailable}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
