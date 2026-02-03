import { Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

import SchedulePanel from "./schedule-panel";
import { CURRENT_DOCTOR, TODAYS_APPOINTMENTS } from "./mock_data";
import DoctorsAppointmentList from "./appointment-list";
import { Topbar } from "@/components/layout/Topbar";

export default function OverviewPage() {
  const completed = TODAYS_APPOINTMENTS.filter(
    (a) => a.status === "completed",
  ).length;
  const waiting = TODAYS_APPOINTMENTS.filter(
    (a) => a.status === "waiting" || a.status === "Follow-up",
  ).length;
  const inProg = TODAYS_APPOINTMENTS.filter(
    (a) => a.status === "in_progress",
  ).length;

  const topbarTitle = "Doctor dashboard";

  const topbarSubtitle =
    "See upcoming appointments and review patient history.";
  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[340px_1fr]">
      <aside className="border-b border-ink-200/60 bg-white/90 h-screen sticky top-0 overflow-y-auto lg:border-b-0 lg:border-r">
        <div className="h-full px-6 py-8">
          <DoctorsAppointmentList />
        </div>
      </aside>
      <div className="flex-1">
        <div className="px-4 md:px-8 py-4">
          <Topbar title={topbarTitle} subtitle={topbarSubtitle} />
        </div>
        <div className="p-4 md:p-8">
          {/* Greeting + stats */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h1 className="text-xl font-bold text-gray-800">
                  Good morning,{" "}
                  <span className="text-slate-500">
                    {CURRENT_DOCTOR.name.split(" ").pop()}
                  </span>
                </h1>
                <p className="text-sm text-gray-400 mt-0.5">
                  Monday, February 2 · 2026
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500 bg-white border border-gray-200 rounded-xl px-3 py-2 shadow-sm">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                <span className="font-bold">Online</span>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-3">
              {[
                {
                  label: "Total Today",
                  value: TODAYS_APPOINTMENTS.length,
                  bg: "bg-orange-200",
                  sub: "scheduled",
                },
                {
                  label: "Completed",
                  value: completed,
                  bg: "bg-green-200",
                  sub: "finished",
                },
                {
                  label: "In Progress",
                  value: inProg,
                  bg: "bg-blue-200",
                  sub: "seeing now",
                },
                {
                  label: "Waiting",
                  value: waiting,
                  bg: "bg-red-200",
                  sub: "in queue",
                },
              ].map((s) => (
                <div key={s.label} className={cn("rounded-2xl p-6", s.bg)}>
                  <p className="text-xs font-bold opacity-70">{s.label}</p>
                  <p className="text-3xl font-bold mt-4 leading-none">
                    {s.value}
                  </p>
                  <p className="text-xs opacity-50 mt-2">{s.sub}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Schedule + Reminders */}
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <SchedulePanel />
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-4">
              <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                <Calendar size={13} className="text-indigo-500" /> Reminders
              </h3>
              <div className="space-y-2">
                {[
                  {
                    t: "Mohammad Hasan's stress test results pending",
                    u: true,
                  },
                  { t: "Abdul Karim's pulmonary function test due", u: true },
                  { t: "Weekly report submission by Friday", u: false },
                  { t: "Staff meeting at 5:00 PM today", u: false },
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
