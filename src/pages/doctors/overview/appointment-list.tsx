import { useMemo, useState } from "react";
import { Bell, ChevronRight, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "@/app/hooks";
import { useGetMyAppointmentsQuery } from "@/features/appointment/appointmentApiSlice";
import { CURRENT_DOCTOR } from "./mock_data";

// ---- Types matching your API ----
type ApiAppointment = {
  appointmentId: string;
  patientName: string;
  time: string; // "17:30"
  appointmentStatus: string; // "new" | ...
  consultationStatus: string; // "pending" | "done" | ...
  notes?: string | null;
};

type ApiResponse = {
  date: string;
  filter: string | null;
  data: ApiAppointment[];
};

// ---- Simple status mapper for the pill ----
function statusPill(consultationStatus: string, appointmentStatus: string) {
  const cs = (consultationStatus || "").toLowerCase();
  const as = (appointmentStatus || "").toLowerCase();

  if (cs === "done" || cs === "complete") {
    return { label: "Done", bg: "bg-green-100", text: "text-green-700" };
  }

  if (cs === "in_progress") {
    return { label: "In progress", bg: "bg-amber-100", text: "text-amber-700" };
  }

  if (as === "cancelled" || as === "canceled") {
    return { label: "Cancelled", bg: "bg-red-100", text: "text-red-700" };
  }

  // default
  return { label: "Pending", bg: "bg-orange-100", text: "text-orange-700" };
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const a = parts[0]?.[0] ?? "?";
  const b = parts.length > 1 ? parts[parts.length - 1]?.[0] : "";
  return (a + b).toUpperCase();
}

const DoctorsAppointmentList = () => {
  const [filter, setFilter] = useState<"all" | "pending" | "done">("all");

  const {
    data,
    isLoading: isAppointmentLoading,
    isFetching: isAppointmentFetching,
    isError,
  } = useGetMyAppointmentsQuery();

  const navigate = useNavigate();
  const me = useAppSelector((state) => state.auth.me);
  console.log((me))
  const doctorName = me?.name ?? CURRENT_DOCTOR.name;

  const api = (data as ApiResponse | undefined) ?? undefined;
  const appts = api?.data ?? [];

  const completedCount = useMemo(
    () =>
      appts.filter((a) =>
        ["done", "complete"].includes(
          (a.consultationStatus || "").toLowerCase(),
        ),
      ).length,
    [appts],
  );

  const totalCount = appts.length;
  const pct =
    totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  const filtered = useMemo(() => {
    if (filter === "pending") {
      return appts.filter(
        (a) =>
          !["done", "complete"].includes(
            (a.consultationStatus || "").toLowerCase(),
          ),
      );
    }
    if (filter === "done") {
      return appts.filter((a) =>
        ["done", "complete"].includes(
          (a.consultationStatus || "").toLowerCase(),
        ),
      );
    }
    return appts;
  }, [appts, filter]);

  const handleConsultation = (appointmentId: string) => {
    navigate(`/consultation/${appointmentId}`);
  };

  const isBusy = isAppointmentLoading || isAppointmentFetching;

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

      <div className="flex flex-col">
        {/* Progress */}
        <div className="pt-3 pb-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Today's Queue
            </span>
            <span className="text-xs text-gray-400">{totalCount} patients</span>
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
              {completedCount} of {totalCount} done
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
              className={`flex-1 text-xs font-semibold py-1.5 rounded-lg transition-all ${
                filter === k
                  ? "bg-slate-800 text-white shadow-sm"
                  : "text-gray-400 hover:bg-gray-100"
              }`}
            >
              {l}
            </button>
          ))}
        </div>

        {/* List */}
        <div
          className="flex-1 overflow-y-auto space-y-1"
          style={{ maxHeight: "calc(100vh - 220px)" }}
        >
          {isError && (
            <div className="rounded-xl border border-red-100 bg-red-50 p-3 text-xs text-red-700">
              Failed to load appointments.
            </div>
          )}

          {isBusy && (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-xl border bg-white p-3 animate-pulse"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-gray-200" />
                    <div className="flex-1">
                      <div className="h-3 w-32 bg-gray-200 rounded mb-2" />
                      <div className="h-3 w-40 bg-gray-200 rounded mb-2" />
                      <div className="h-3 w-24 bg-gray-200 rounded" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!isBusy && !isError && filtered.length === 0 && (
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 text-xs text-gray-500">
              No appointments found for this filter.
            </div>
          )}

          {!isBusy &&
            !isError &&
            filtered.map((appt) => {
              const pill = statusPill(
                appt.consultationStatus,
                appt.appointmentStatus,
              );
              const done = ["done", "complete"].includes(
                (appt.consultationStatus || "").toLowerCase(),
              );

              return (
                <button
                  key={appt.appointmentId}
                  onClick={() => handleConsultation(appt.appointmentId)}
                  className={`w-full text-left rounded-xl border transition-all group ${
                    done
                      ? "border-transparent bg-gray-50/60 hover:bg-gray-50"
                      : "border-transparent hover:border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-start gap-3 p-3">
                    <div
                      className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white mt-0.5 ${
                        done
                          ? "bg-gray-400"
                          : "bg-gradient-to-br from-slate-600 to-slate-800"
                      }`}
                    >
                      {initials(appt.patientName)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span
                          className={`text-sm font-semibold truncate ${
                            done ? "text-gray-400" : "text-gray-800"
                          }`}
                        >
                          {appt.patientName}
                        </span>

                        <span
                          className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${pill.bg} ${pill.text} flex-shrink-0`}
                        >
                          {pill.label}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="flex items-center gap-1 text-xs text-gray-400">
                          <Clock size={10} />
                          {appt.time}
                        </span>

                        <span className="text-gray-300">•</span>

                        <span className="text-xs font-semibold text-indigo-600">
                          {appt.appointmentStatus}
                        </span>
                      </div>

                      <p
                        className={`text-xs mt-0.5 truncate ${
                          done ? "text-gray-300" : "text-gray-500"
                        }`}
                        title={appt.notes ?? ""}
                      >
                        {appt.notes || "—"}
                      </p>
                    </div>

                    <ChevronRight
                      size={14}
                      className="flex-shrink-0 mt-2 text-gray-300 group-hover:text-gray-400"
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
