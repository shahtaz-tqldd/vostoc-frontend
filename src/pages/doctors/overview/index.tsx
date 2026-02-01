import { StatCard } from "@/components/dashboard/StatCard";
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
import { doctorAppointments, patientRecords } from "@/data/mock";

const riskTone: Record<string, "mint" | "coral" | "ink"> = {
  Low: "mint",
  Medium: "ink",
  High: "coral",
};

export default function OverviewPage() {
  return (
    <div className="space-y-8">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Appointments"
          value="14"
          trend="3 follow-ups scheduled"
          tone="mint"
        />
        <StatCard
          label="Patients seen"
          value="9"
          trend="Average consult: 22 min"
          tone="ink"
        />
        <StatCard
          label="Clinical tasks"
          value="6"
          trend="2 notes pending review"
          tone="coral"
        />
        <StatCard
          label="Next shift"
          value="02:45 PM"
          trend="Evening clinic rotation"
          tone="ink"
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>Today&#39;s appointments</CardTitle>
            <CardDescription>Patient queue for Dr. Maya Chen</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Slot</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {doctorAppointments.map((appointment) => (
                  <TableRow key={appointment.id}>
                    <TableCell className="font-semibold text-ink-900">
                      {appointment.patient}
                    </TableCell>
                    <TableCell>{appointment.time}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          appointment.status === "Completed" ? "ink" : "mint"
                        }
                      >
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
            <CardTitle>Care reminders</CardTitle>
            <CardDescription>
              High-impact notes before next consult
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl border border-ink-200/70 bg-white/80 p-4">
              <div className="text-sm font-semibold text-ink-900">
                Chronic care plan updates
              </div>
              <p className="mt-2 text-sm text-ink-600">
                4 patients have overdue care plan adjustments. Confirm lab
                results before today&#39;s afternoon block.
              </p>
              <Button variant="outline" size="sm" className="mt-4">
                Review care plans
              </Button>
            </div>
            <div className="rounded-2xl border border-ink-200/70 bg-white/80 p-4">
              <div className="text-sm font-semibold text-ink-900">
                New imaging results
              </div>
              <p className="mt-2 text-sm text-ink-600">
                2 MRI reports landed in the last 24 hours and need sign-off.
              </p>
              <Button variant="outline" size="sm" className="mt-4">
                View results
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <Card>
          <CardHeader>
            <CardTitle>Patient history</CardTitle>
            <CardDescription>
              Recent visits and upcoming follow-ups
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Last visit</TableHead>
                  <TableHead>Next visit</TableHead>
                  <TableHead>Risk</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {patientRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-semibold text-ink-900">
                      {record.name}
                    </TableCell>
                    <TableCell>{record.lastVisit}</TableCell>
                    <TableCell>{record.nextVisit}</TableCell>
                    <TableCell>
                      <Badge variant={riskTone[record.risk]}>
                        {record.risk}
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
            <CardTitle>Team messages</CardTitle>
            <CardDescription>Updates from clinic operations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl border border-ink-200/70 bg-white/80 p-4">
              <div className="text-xs uppercase tracking-wide text-ink-500">
                Nursing station
              </div>
              <p className="mt-2 text-sm font-semibold text-ink-900">
                Room 3 is ready for the 11:00 AM intake.
              </p>
            </div>
            <div className="rounded-2xl border border-ink-200/70 bg-white/80 p-4">
              <div className="text-xs uppercase tracking-wide text-ink-500">
                Radiology
              </div>
              <p className="mt-2 text-sm font-semibold text-ink-900">
                Imaging slot opened at 2:30 PM for urgent cases.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
