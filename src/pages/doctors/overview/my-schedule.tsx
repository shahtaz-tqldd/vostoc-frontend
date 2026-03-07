import { formatTime12, getDurationMinutes } from "@/lib/time";
import { cn } from "@/lib/utils";
import { Clock } from "lucide-react";
import moment from "moment";
import { useMemo, useState, useEffect } from "react";
import { useGetWeeklySchedulesQuery } from "@/features/doctors/doctorsApi";

type WeeklyDay = {
  date: string; // "2026-02-16"
  totalAppointments: number;
  isToday: boolean;
  isOff: boolean;
  schedules: { start: string; end: string }[];
};

function dayKeyFromDate(dateStr: string) {
  // "Sun", "Mon", ...
  return moment(dateStr, "YYYY-MM-DD").format("ddd");
}

export default function DoctorSchedule() {
  const { data, isLoading, isFetching, isError } = useGetWeeklySchedulesQuery();

  // Your API might return { data: [...] } or [...] directly
  const week: WeeklyDay[] = (data?.data ?? data ?? []) as WeeklyDay[];

  // Sort by date to keep pills stable
  const sortedWeek = useMemo(
    () => [...week].sort((a, b) => a.date.localeCompare(b.date)),
    [week],
  );

  // Build pill models: { key: "Sun", date: "2026-02-16", ... }
  const pills = useMemo(
    () =>
      sortedWeek.map((d) => ({
        key: dayKeyFromDate(d.date), // "Sun"
        date: d.date,
        isToday: d.isToday,
        isOff: d.isOff,
        hasSchedule: (d.schedules?.length ?? 0) > 0 && !d.isOff,
        totalAppointments: d.totalAppointments ?? 0,
        schedules: d.schedules ?? [],
      })),
    [sortedWeek],
  );

  // Default selected: API isToday day, else today's weekday, else first pill
  const todayKey = moment().format("ddd");
  const defaultSelected = useMemo(() => {
    const apiToday = pills.find((p) => p.isToday);
    if (apiToday) return apiToday.key;
    const matchTodayKey = pills.find((p) => p.key === todayKey);
    if (matchTodayKey) return matchTodayKey.key;
    return pills[0]?.key ?? todayKey;
  }, [pills, todayKey]);

  const [selectedDay, setSelectedDay] = useState(defaultSelected);

  // If data loads later, sync default selection once
  useEffect(() => {
    setSelectedDay(defaultSelected);
  }, [defaultSelected]);

  const selected = pills.find((p) => p.key === selectedDay);
  const daySchedules = useMemo(() => {
    const list = selected?.schedules ?? [];
    return [...list].sort((a, b) => a.start.localeCompare(b.start));
  }, [selected]);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
          <Clock size={13} className="text-indigo-500" /> My Schedule
        </h3>

        {/* small right-side meta */}
        <div className="text-xs text-gray-400">
          {selected?.date ? moment(selected.date).format("MMM D, YYYY") : "—"}
        </div>
      </div>

      {/* Day pills */}
      <div className="flex gap-1.5 my-6 flex-wrap">
        {isLoading || isFetching ? (
          Array.from({ length: 7 }).map((_, i) => (
            <div
              key={i}
              className="w-10 h-10 rounded-full bg-gray-100 animate-pulse"
            />
          ))
        ) : isError ? (
          <div className="text-xs text-red-600">Failed to load schedule.</div>
        ) : (
          pills.map((p) => {
            const isSelected = p.key === selectedDay;

            return (
              <button
                key={p.date}
                disabled={p.isOff}
                onClick={() => setSelectedDay(p.key)}
                className={cn(
                  "relative w-10 h-10 rounded-full text-xs font-bold transition-all flex flex-col items-center justify-center",
                  // off day (disabled)
                  p.isOff &&
                    "bg-gray-50 text-gray-300 cursor-not-allowed border border-dashed border-gray-200",
                  // enabled but not selected
                  !p.isOff &&
                    !isSelected &&
                    "bg-gray-100 text-gray-600 hover:bg-gray-200 cursor-pointer border border-transparent",
                  // selected
                  isSelected &&
                    "bg-indigo-500 text-white shadow-md shadow-indigo-200 border border-transparent",
                )}
                title={`${moment(p.date).format("ddd, MMM D")} ${
                  p.isOff ? "(Off)" : ""
                }`}
              >
                {p.key.slice(0, 2)}

                {/* today dot */}
                {p.isToday && !isSelected && (
                  <span className="absolute bottom-0.5 w-1 h-1 rounded-full bg-indigo-400" />
                )}

                {/* schedule dot when not selected (only if has schedule) */}
                {p.hasSchedule && !isSelected && (
                  <span className="absolute top-0 right-0 w-1.5 h-1.5 rounded-full bg-indigo-400" />
                )}

                {/* appointment count badge (top-left) */}
                {p.totalAppointments > 0 && !isSelected && !p.isOff && (
                  <span className="absolute top-0 left-0 -translate-x-1 -translate-y-1 min-w-[18px] h-[18px] px-1 rounded-full bg-slate-800 text-white text-[10px] flex items-center justify-center">
                    {p.totalAppointments}
                  </span>
                )}
              </button>
            );
          })
        )}
      </div>

      {/* Selected day quick summary */}
      {!isLoading && !isFetching && selected && (
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs text-gray-500">
            {selected.isOff ? (
              <span className="font-semibold text-gray-400">Off day</span>
            ) : (
              <>
                <span className="font-semibold text-gray-700">
                  {selected.totalAppointments}
                </span>{" "}
                appointments
              </>
            )}
          </p>
          {!selected.isOff && (
            <p className="text-xs text-gray-400">
              {daySchedules.length} shift{daySchedules.length === 1 ? "" : "s"}
            </p>
          )}
        </div>
      )}

      {/* Schedule list for selected day */}
      {isLoading || isFetching ? (
        <div className="space-y-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <div
              key={i}
              className="h-14 rounded-xl border bg-gray-50 animate-pulse"
            />
          ))}
        </div>
      ) : !selected || selected.isOff || daySchedules.length === 0 ? (
        <div className="py-4 text-center">
          <p className="text-xs text-gray-400">
            {selected?.isOff
              ? "No schedule (Off day)"
              : "No schedule for this day"}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {daySchedules.map((slot, idx) => {
            const duration = getDurationMinutes(slot.start, slot.end);

            const colours = [
              {
                bg: "bg-indigo-50",
                border: "border-indigo-200",
                accent: "bg-indigo-400",
                text: "text-indigo-600",
              },
              {
                bg: "bg-emerald-50",
                border: "border-emerald-200",
                accent: "bg-emerald-400",
                text: "text-emerald-600",
              },
              {
                bg: "bg-sky-50",
                border: "border-sky-200",
                accent: "bg-sky-400",
                text: "text-sky-600",
              },
            ];
            const c = colours[idx % colours.length];

            return (
              <div
                key={`${selected.date}-${slot.start}-${slot.end}-${idx}`}
                className={cn(
                  "flex items-stretch gap-3 p-2.5 rounded-xl border",
                  c.bg,
                  c.border,
                )}
              >
                <div
                  className={cn("w-1 rounded-full flex-shrink-0", c.accent)}
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className={cn("text-xs font-bold", c.text)}>
                      {formatTime12(slot.start)} – {formatTime12(slot.end)}
                    </p>
                    <span className="text-xs text-gray-400 flex-shrink-0">
                      {duration} min
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Scheduled shift
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
