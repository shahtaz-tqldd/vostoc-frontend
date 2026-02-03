import { APPT_COUNTS, DAYS, WEEKLY_SCHEDULE } from "./mock_data";

const SchedulePanel = () => {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <div className="px-4 pt-4 pb-2">
        <h3 className="text-sm font-bold text-gray-700">This Week</h3>
        <p className="text-xs text-gray-400 mt-0.5">Feb 2 – 8, 2026</p>
      </div>
      <div className="px-3 pb-4">
        <div className="grid grid-cols-7 gap-1">
          {DAYS.map((day) => {
            const s = WEEKLY_SCHEDULE[day];
            const isToday = day === "Mon";
            const isOff = s.start === "off";
            const cnt = APPT_COUNTS[day];
            return (
              <div
                key={day}
                className={`rounded-xl p-2 text-center ${isToday ? "shadow-md" : isOff ? "bg-gray-50 opacity-50" : "bg-gray-50"}`}
                style={isToday ? { background: "#1e293b" } : {}}
              >
                <p
                  className={`text-xs font-bold mb-1.5 ${isToday ? "text-white" : "text-gray-400"}`}
                >
                  {day}
                </p>
                <div
                  className={`w-7 h-7 mx-auto rounded-full flex items-center justify-center text-xs font-bold ${isToday ? "text-white" : isOff ? "bg-gray-100 text-gray-300" : cnt > 6 ? "bg-amber-100 text-amber-700" : "bg-teal-50 text-teal-600"}`}
                  style={isToday ? { background: "rgba(255,255,255,0.2)" } : {}}
                >
                  {isOff ? "—" : cnt}
                </div>
                <p
                  className={`text-xs mt-1.5 font-bold ${isToday ? "text-slate-300" : "text-gray-400"}`}
                >
                  {isOff
                    ? "Off"
                    : `${s.start.slice(0, 2)}–${s.end.slice(0, 2)}`}
                </p>
              </div>
            );
          })}
        </div>
        <div className="flex items-center justify-center gap-4 mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-100 border border-teal-300" />
            <span className="text-xs text-gray-400">Normal</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-100 border border-amber-300" />
            <span className="text-xs text-gray-400">Busy</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-800" />
            <span className="text-xs text-gray-400">Today</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchedulePanel;
