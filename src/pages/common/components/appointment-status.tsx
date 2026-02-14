import { useGetStatsQuery } from "@/features/appointment/appointmentApiSlice";
import { cn } from "@/lib/utils";

export default function AppointmentStats() {
  const { data } = useGetStatsQuery({});
  const total = data?.total ?? 0;
  const completed = data?.completed ?? 0;
  const waiting = data?.pending ?? 0;

  return (
    <div className="grid grid-cols-3 gap-3">
      {[
        {
          label: "Total Today",
          value: total,
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
}
