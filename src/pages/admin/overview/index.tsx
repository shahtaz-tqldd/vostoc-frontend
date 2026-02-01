import { StatCard } from "@/components/dashboard/StatCard";
import { MiniSparkline } from "@/components/dashboard/MiniSparkline";
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

const statusTone: Record<string, "mint" | "coral" | "ink"> = {
  Confirmed: "mint",
  Pending: "coral",
  Completed: "ink",
};

export default function AdminOverviewPage() {
  return (
    <div className="space-y-8">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Active doctors"
          value="24"
          trend="2 new specialists onboarded this week"
          tone="mint"
        />
        <StatCard
          label="Appointments today"
          value="186"
          trend="+12% from last Saturday"
          tone="ink"
        />
        <StatCard
          label="Average wait"
          value="08 min"
          trend="Best-in-quarter performance"
          tone="mint"
        />
        <StatCard
          label="No-show rate"
          value="3.1%"
          trend="Down 0.8% from last month"
          tone="coral"
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Appointment flow</CardTitle>
            <CardDescription>
              Live look at slot utilization across the hospital.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-ink-200/70 bg-white/80 p-4">
                <div className="text-xs uppercase tracking-wide text-ink-500">
                  Cardiology throughput
                </div>
                <div className="mt-2 text-2xl font-semibold text-ink-900">
                  42 patients
                </div>
                <MiniSparkline points={[12, 18, 15, 22, 26, 30, 28]} />
              </div>
              <div className="rounded-2xl border border-ink-200/70 bg-white/80 p-4">
                <div className="text-xs uppercase tracking-wide text-ink-500">
                  Neurology throughput
                </div>
                <div className="mt-2 text-2xl font-semibold text-ink-900">
                  31 patients
                </div>
                <MiniSparkline points={[8, 10, 12, 14, 16, 18, 19]} />
              </div>
            </div>
            <div className="rounded-2xl border border-ink-200/70 bg-ink-900/95 p-5 text-white">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-sm text-white/70">Peak load window</div>
                  <div className="mt-1 text-xl font-semibold">
                    10:00 AM - 02:00 PM
                  </div>
                </div>
                <Button variant="secondary" className="bg-white text-ink-900">
                  Rebalance slots
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="h-full">
          <CardHeader>
            <CardTitle>Doctor load</CardTitle>
            <CardDescription>Slots filled, by department</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
                    <div className="text-xs text-ink-500">
                      {doctor.department}
                    </div>
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
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <Card>
          <CardHeader>
            <CardTitle>Appointment queue</CardTitle>
            <CardDescription>
              Bookings grouped by assigned doctor and time slot.
            </CardDescription>
          </CardHeader>
          <CardContent>
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

        <Card>
          <CardHeader>
            <CardTitle>Quick actions</CardTitle>
            <CardDescription>Common tasks for administrators</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full">Create doctor profile</Button>
            <Button variant="secondary" className="w-full">
              Assign doctor to slot
            </Button>
            <Button variant="outline" className="w-full">
              Manage appointment templates
            </Button>
            <Button variant="ghost" className="w-full">
              View department analytics
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
