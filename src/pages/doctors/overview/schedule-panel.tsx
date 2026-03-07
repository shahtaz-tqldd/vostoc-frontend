import { useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useGetWeeklySchedulesQuery } from "@/features/doctors/doctorsApi";
import type { WeeklySchedule } from "@/features/doctors/type";

function weekdayLabel(dateStr: string) {
  const d = new Date(`${dateStr}T00:00:00`);
  return d.toLocaleDateString(undefined, { weekday: "short" });
}

function monthDayLabel(dateStr: string) {
  const d = new Date(`${dateStr}T00:00:00`);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function weekRangeLabel(dates: string[]) {
  if (!dates.length) return "";
  const sorted = [...dates].sort();
  const start = new Date(`${sorted[0]}T00:00:00`);
  const end = new Date(`${sorted[sorted.length - 1]}T00:00:00`);

  const startText = start.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });

  const endText = end.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return `${startText} – ${endText}`;
}

const SchedulePanel = () => {
  const { data, isLoading } = useGetWeeklySchedulesQuery();

  const days: WeeklySchedule[] = (data?.data ?? data ?? []) as WeeklySchedule[];

  const rangeText = useMemo(
    () => weekRangeLabel(days.map((d) => d.date)),
    [days],
  );

  const legend = (
    <div className="flex items-center justify-center gap-4 mt-3 pt-3 border-t border-gray-100">
      <div className="flex items-center gap-1.5">
        <span className="w-2.5 h-2.5 rounded-full bg-teal-50 border border-teal-200" />
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
      <div className="flex items-center gap-1.5">
        <span className="w-2.5 h-2.5 rounded-full bg-gray-200 border border-gray-300" />
        <span className="text-xs text-gray-400">Off</span>
      </div>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>This Week</CardTitle>
        <CardDescription className="!opacity-60 !text-xs mt-1">
          {isLoading ? "Loading…" : rangeText || "—"}
        </CardDescription>
      </CardHeader>

      <CardContent className="mt-4">
        {isLoading ? (
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="rounded-xl p-2 bg-gray-50 animate-pulse">
                <div className="h-3 w-10 mx-auto bg-gray-200 rounded mb-2" />
                <div className="h-7 w-7 mx-auto bg-gray-200 rounded-full mb-2" />
                <div className="h-3 w-14 mx-auto bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-7 gap-1">
              {days.map((d) => {
                const isToday = d.isToday;
                const isOff = d.isOff;

                const cnt = d.totalAppointments ?? 0;

                const countPillClass = isToday
                  ? "text-white"
                  : isOff
                    ? "bg-gray-100 text-gray-300"
                    : cnt >= 7
                      ? "bg-amber-100 text-amber-700"
                      : cnt === 0
                        ? "bg-teal-50 text-teal-600"
                        : "bg-teal-50 text-teal-600";

                const tileClass = isToday
                  ? "shadow-md ring-1 ring-slate-700/20"
                  : isOff
                    ? "bg-gray-50 opacity-55"
                    : "bg-gray-50";

                const scheduleText = isOff
                  ? "Off"
                  : (d.schedules?.length ?? 0) === 0
                    ? "—"
                    : d.schedules.map((s) => `${s.start}–${s.end}`).join(", ");

                return (
                  <div
                    key={d.date}
                    className={`rounded-xl p-2 text-center ${tileClass}`}
                    style={isToday ? { background: "#1e293b" } : {}}
                    title={`${d.date}${isOff ? " (Off)" : ""}`}
                  >
                    <p
                      className={`text-xs font-bold mb-1.5 ${
                        isToday ? "text-white" : "text-gray-400"
                      }`}
                    >
                      {weekdayLabel(d.date)}
                    </p>

                    <div
                      className={`w-7 h-7 mx-auto rounded-full flex items-center justify-center text-xs font-bold ${countPillClass}`}
                      style={
                        isToday ? { background: "rgba(255,255,255,0.2)" } : {}
                      }
                    >
                      {isOff ? "—" : cnt}
                    </div>

                    <p
                      className={`text-[11px] mt-1.5 font-semibold truncate ${
                        isToday ? "text-slate-300" : "text-gray-400"
                      }`}
                    >
                      {scheduleText}
                    </p>

                    <p
                      className={`text-[10px] mt-0.5 ${
                        isToday ? "text-slate-400" : "text-gray-300"
                      }`}
                    >
                      {monthDayLabel(d.date)}
                    </p>
                  </div>
                );
              })}
            </div>

            {legend}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default SchedulePanel;
