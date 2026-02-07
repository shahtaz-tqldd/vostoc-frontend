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
import { Button } from "@/components/ui/button";
import { adminAppointments, doctorLoads } from "@/data/mock";
import { TODAYS_APPOINTMENTS } from "@/pages/doctors/overview/mock_data";
import { cn } from "@/lib/utils";

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
        <DepartmentPerformance />
      </div>
      <div className="col-span-1 space-y-4">
        <ActiveDoctorList />
        <Notification />
        <QuickAction />
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

const DepartmentPerformance = () => {
  const departments = [
    {
      name: "Cardiology",
      completionRate: 94,
      avgWaitTime: "12 min",
      status: "good",
    },
    {
      name: "Neurology",
      completionRate: 88,
      avgWaitTime: "18 min",
      status: "good",
    },
    {
      name: "Orthopedics",
      completionRate: 76,
      avgWaitTime: "28 min",
      status: "warning",
    },
    {
      name: "Pediatrics",
      completionRate: 91,
      avgWaitTime: "15 min",
      status: "good",
    },
  ];

  const topPerformer = departments.reduce((prev, current) =>
    prev.completionRate > current.completionRate ? prev : current,
  );

  const needsAttention = departments.filter((d) => d.status === "warning");

  return (
    <Card>
      <CardHeader>
        <CardTitle>Department performance</CardTitle>
        <CardDescription>
          Real-time metrics across hospital departments
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 mt-6">
        <div className="grid gap-4 md:grid-cols-2">
          {departments.map((dept) => (
            <div
              key={dept.name}
              className="rounded-2xl border border-ink-200/70 bg-white/80 p-4"
            >
              <div className="flex items-start justify-between">
                <div className="text-sm font-semibold text-ink-900">
                  {dept.name}
                </div>
                <div
                  className={cn(
                    "h-2 w-2 rounded-full",
                    dept.status === "good" ? "bg-green-500" : "bg-yellow-500",
                  )}
                />
              </div>
              <div className="mt-3 flex items-baseline gap-1">
                <div className="text-2xl font-semibold text-ink-900">
                  {dept.completionRate}%
                </div>
                <div className="text-xs text-ink-500">completion rate</div>
              </div>
              <div className="mt-2 text-xs text-ink-500">
                Avg wait: {dept.avgWaitTime}
              </div>
            </div>
          ))}
        </div>
        <div className="rounded-2xl border border-ink-200/70 bg-ink-900/95 p-5 text-white">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-sm text-white/70">
                {needsAttention.length > 0
                  ? "Needs attention"
                  : "Top performer"}
              </div>
              <div className="mt-1 text-xl font-semibold">
                {needsAttention.length > 0
                  ? needsAttention.map((d) => d.name).join(", ")
                  : topPerformer.name}
              </div>
            </div>
            <Button variant="secondary" className="bg-white text-ink-900">
              View details
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const QuickAction = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick actions</CardTitle>
        <CardDescription>Common tasks for administrators</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 mt-6">
        <Button className="w-full">Create doctor profile</Button>
        <Button variant="secondary" className="w-full">
          Assign doctor to slot
        </Button>
        <Button variant="ghost" className="w-full">
          View department analytics
        </Button>
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

const Notification = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification</CardTitle>
        <CardDescription>Slots filled, by department</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2.5 mt-6">
        {[
          {
            t: "Mohammad Hasan's stress test results pending",
            u: true,
          },
          { t: "Abdul Karim's pulmonary function test due", u: true },
          { t: "Weekly report submission by Friday", u: false },
          { t: "Staff meeting at 5:00 PM today", u: false },
          { t: "Abdul Karim's pulmonary function test due", u: false },
        ].map((r, i) => (
          <div
            key={i}
            className={`flex items-start gap-2 p-2.5 rounded-lg ${r.u ? "bg-amber-50 border border-amber-200" : "bg-gray-50 border border-gray-100"}`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${r.u ? "bg-amber-500" : "bg-gray-300"}`}
            />
            <p
              className={`text-xs ${r.u ? "text-amber-700" : "text-gray-500"}`}
            >
              {r.t}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
