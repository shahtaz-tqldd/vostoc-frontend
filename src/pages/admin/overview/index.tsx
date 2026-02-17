import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import AppointmentStats from "@/pages/common/components/appointment-status";
import TodaysAppointmentList from "@/pages/common/components/todays-appointment";
import TodaysSchedule from "./todays-schedule";

export default function AdminOverviewPage() {
  return (
    <div className="grid grid-cols-3 gap-5">
      <div className="col-span-2 space-y-4">
        <AppointmentStats />
        <TodaysAppointmentList />
        <DepartmentPerformance />
      </div>
      <div className="col-span-1 space-y-4">
        <TodaysSchedule />
        <Notification />
        <QuickAction />
      </div>
    </div>
  );
}

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
