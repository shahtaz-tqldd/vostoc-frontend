// components
import { DoctorTopbar } from "@/components/layout/Topbar";
import SchedulePanel from "./schedule-panel";
import DoctorsAppointmentList from "./appointment-list";
import MyPatientList from "./my-patient-list";

// icons
import { Bell } from "lucide-react";

// data
import AppointmentStats from "@/pages/common/components/appointment-status";
import DoctorSchedule from "./my-schedule";
import AppointmentQueue from "./appointment-queue";

export default function OverviewPage() {
  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[340px_1fr]">
      <aside className="border-b border-ink-200/60 bg-white/90 h-screen sticky top-0 overflow-y-auto lg:border-b-0 lg:border-r">
        <div className="h-full px-6 py-8">
          <DoctorsAppointmentList />
        </div>
      </aside>
      <div className="flex-1">
        <div className="px-4 md:px-8 py-4">
          <DoctorTopbar />
        </div>

        <div className="p-4 md:p-8 grid grid-cols-3 gap-4">
          <div className="col-span-2 space-y-5">
            <AppointmentStats />
            <SchedulePanel />
            <MyPatientList />
          </div>
          <div className="col-span-1 space-y-5">
            <AppointmentQueue />
            <Notification />
            <DoctorSchedule />
          </div>
        </div>
      </div>
    </div>
  );
}

const Notification = () => {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
        <Bell size={13} className="text-orange-500" /> Notification
      </h3>
      <div className="space-y-2 mt-4">
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
  );
};
