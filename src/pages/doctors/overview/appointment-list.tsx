import { useState } from "react";
import { CURRENT_DOCTOR, STATUS_CFG, TODAYS_APPOINTMENTS } from "./mock_data";
import { Bell, ChevronRight, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PATIENTS } from "../consultation/mock_data";
import { useAppSelector } from "@/app/hooks";

const DoctorsAppointmentList = () => {
  const [selectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "pending" | "done">("all");
  const completedCount = TODAYS_APPOINTMENTS.filter(
    (a) => a.status === "completed",
  ).length;
  const pct = Math.round((completedCount / TODAYS_APPOINTMENTS.length) * 100);

  const filtered = TODAYS_APPOINTMENTS.filter((a) => {
    if (filter === "pending") return a.status !== "completed";
    if (filter === "done") return a.status === "completed";
    return true;
  });

  const navigate = useNavigate();
  const handleConsultation = (patiantId: string) => {
    navigate(`/consultation/${patiantId}`);
  };

  const me = useAppSelector((state) => state.auth.me);
  const doctorName = me?.name ?? CURRENT_DOCTOR.name;

  return (
    <>
      <div className="flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-gray-800 truncate">
            {doctorName}
          </p>
          <p className="text-xs text-gray-400">{CURRENT_DOCTOR.specialty}</p>
        </div>
        <button className="relative p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
          <Bell size={16} className="text-gray-400" />
          <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full" />
        </button>
      </div>
      <div className="flex flex-col ">
        {/* Progress */}
        <div className="pt-3 pb-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Today's Queue
            </span>
            <span className="text-xs text-gray-400">
              {TODAYS_APPOINTMENTS.length} patients
            </span>
          </div>
          <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${pct}%`,
                background: "linear-gradient(90deg,#10b981,#14b8a6)",
              }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-xs text-gray-400">
              {completedCount} of {TODAYS_APPOINTMENTS.length} done
            </span>
            <span className="text-xs font-bold text-teal-600">{pct}%</span>
          </div>
        </div>

        {/* Filter pills */}
        <div className="flex gap-1 py-4">
          {[
            ["all", "All"],
            ["pending", "Pending"],
            ["done", "Done"],
          ].map(([k, l]) => (
            <button
              key={k}
              onClick={() => setFilter(k as "all" | "pending" | "done")}
              className={`flex-1 text-xs font-semibold py-1.5 rounded-lg transition-all ${filter === k ? "bg-slate-800 text-white shadow-sm" : "text-gray-400 hover:bg-gray-100"}`}
            >
              {l}
            </button>
          ))}
        </div>

        {/* Cards */}
        <div
          className="flex-1 overflow-y-auto space-y-1"
          style={{ maxHeight: "calc(100vh - 220px)" }}
        >
          {filtered.map((appt) => {
            const p = PATIENTS[appt.patientId];
            const cfg = STATUS_CFG[appt.status] || STATUS_CFG.waiting;
            const active = selectedId === appt.id;
            return (
              <button
                key={appt.id}
                onClick={() => handleConsultation(appt.patientId)}
                className={`w-full text-left rounded-xl border transition-all group ${active ? "border-slate-300 bg-slate-50 shadow-sm" : "border-transparent hover:border-gray-200 hover:bg-gray-50"}`}
              >
                <div className="flex items-start gap-3 p-3">
                  <div
                    className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white mt-0.5 ${appt.status === "completed" ? "bg-gray-400" : "bg-gradient-to-br from-slate-600 to-slate-800"}`}
                  >
                    {p.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span
                        className={`text-sm font-semibold truncate ${appt.status === "completed" ? "text-gray-400" : "text-gray-800"}`}
                      >
                        {p.name}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.text} flex-shrink-0`}
                      >
                        <cfg.Icon
                          size={10}
                          className={
                            appt.status === "in_progress" ? "animate-spin" : ""
                          }
                        />
                        {cfg.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <Clock size={10} />
                        {appt.time}
                      </span>
                      <span className="text-gray-300">•</span>
                      <span
                        className={`text-xs font-semibold ${appt.type === "Follow-up" ? "text-indigo-600" : "text-emerald-600"}`}
                      >
                        {appt.type}
                      </span>
                    </div>
                    <p
                      className={`text-xs mt-0.5 truncate ${appt.status === "completed" ? "text-gray-300" : "text-gray-500"}`}
                    >
                      {appt.chief}
                    </p>
                  </div>
                  <ChevronRight
                    size={14}
                    className={`flex-shrink-0 mt-2 ${active ? "text-slate-500" : "text-gray-300 group-hover:text-gray-400"}`}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default DoctorsAppointmentList;
