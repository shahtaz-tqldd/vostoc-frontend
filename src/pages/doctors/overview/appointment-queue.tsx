import { useGetAppointmentQueueQuery } from "@/features/appointment/appointmentApiSlice";
import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Play, Square, User } from "lucide-react";

type ConsultationStatus = "idle" | "in_progress" | "completed";

// assume these exist on the single queue item
type QueueItem = {
  nextPatient: {
    appointmentId: string;
    patientId: string;
    notes: string;
    name: string;
    age: number | null;
    gender: string | null;
    contact: string | null;
  } | null;
  leftForDoctor: number; // includes current next? your backend decides—UI will just display it
  notes?: string | null;
  appointment_id?: string; // IMPORTANT: use this
};

export default function AppointmentQueue() {
  const { data, isLoading, isError } = useGetAppointmentQueueQuery();

  // API returns array with 1 item, but keep it defensive
  const item: QueueItem | null = useMemo(() => {
    if (Array.isArray(data)) return (data[0] ?? null) as QueueItem | null;
    return ((data?.data?.[0] ?? null) as QueueItem | null) ?? null;
  }, [data]);

  const [status, setStatus] = useState<ConsultationStatus>("completed");

  const nextPatient = item?.nextPatient ?? null;
  const appointmentId = nextPatient?.appointmentId ?? "";
  const notes = nextPatient?.notes ?? "";
  const leftForDoctor = item?.leftForDoctor ?? 0;

  const isQueueEmpty = !nextPatient || !appointmentId;

  const handleEnd = () => {
    // you’ll replace this later with real “end consultation” + refetch queue
    setStatus("completed");
  };

  // ---------- EMPTY ----------
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-4">
        <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
          <User size={13} className="text-blue-500" /> Next Patient
        </h3>
        <div className="flex flex-col items-center justify-center py-6 gap-2 animate-pulse">
          <div className="w-10 h-10 rounded-full bg-gray-100" />
          <div className="h-3 w-40 rounded bg-gray-100" />
          <div className="h-3 w-28 rounded bg-gray-100" />
        </div>
      </div>
    );
  }

  if (isError || isQueueEmpty || status === "idle") {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-4">
        <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
          <User size={13} className="text-blue-500" /> Next Patient
        </h3>
        <div className="flex flex-col items-center justify-center py-6 gap-2">
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
            <User size={18} className="text-gray-300" />
          </div>
          <p className="text-xs text-gray-400 text-center">
            No patients in queue
          </p>
        </div>
      </div>
    );
  }

  // ---------- IN PROGRESS ----------
  if (status === "in_progress") {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-4">
        <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
          <User size={13} className="text-blue-500" /> Next Patient
        </h3>

        <div className="flex items-center gap-1.5 mb-3">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
          </span>
          <span className="text-xs font-semibold text-green-600">
            Consultation in progress
          </span>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-start gap-3">
          <div className="w-9 h-9 rounded-full bg-green-200 flex items-center justify-center flex-shrink-0">
            <User size={16} className="text-green-700" />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-gray-800 truncate">
              {nextPatient.name}
            </p>

            <p className="text-xs text-gray-500 truncate">
              {notes || "No notes"}
            </p>

            <p className="text-xs text-green-600 mt-0.5">
              {nextPatient.age != null ? `Age ${nextPatient.age}` : "Age —"}
              {nextPatient.gender ? ` · ${nextPatient.gender}` : ""}
              {" · Seeing now"}
            </p>
          </div>
        </div>

        <Button onClick={handleEnd} className="w-full mt-6" variant="outline">
          <Square size={12} fill="currentColor" /> End Consultation
        </Button>

        {/* remaining count */}
        {leftForDoctor > 0 && (
          <p className="text-xs text-gray-400 text-center mt-4">
            {leftForDoctor} more patient{leftForDoctor > 1 ? "s" : ""} waiting
          </p>
        )}
      </div>
    );
  }

  // ---------- READY (COMPLETED) ----------
  // "completed" here means “ready to start next consult” in your existing logic
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
        <User size={13} className="text-blue-500" /> Next Patient
      </h3>

      <div className="flex items-center gap-1.5 mb-3">
        <span className="w-2 h-2 rounded-full bg-blue-400" />
        <span className="text-xs font-semibold text-blue-600">
          Ready to consult
        </span>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-start gap-3">
        <div className="w-9 h-9 rounded-full bg-blue-200 flex items-center justify-center flex-shrink-0">
          <User size={16} className="text-blue-700" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-gray-800 truncate">
            {nextPatient.name}
          </p>

          <p className="text-xs text-gray-500 truncate">
            {notes || "No notes"}
          </p>

          <p className="text-xs text-gray-400 mt-0.5">
            {nextPatient.age != null ? `Age ${nextPatient.age}` : "Age —"}
            {nextPatient.gender ? ` · ${nextPatient.gender}` : ""}
          </p>
        </div>
      </div>

      {/* Use appointment_id (NOT patient id) */}
      <Link to={`/consultation/${appointmentId}`}>
        <Button
          className="mt-6 w-full"
          onClick={() => setStatus("in_progress")}
        >
          <Play size={12} fill="currentColor" /> Start Consultation
        </Button>
      </Link>

      {leftForDoctor > 0 && (
        <p className="text-xs text-gray-400 text-center mt-4">
          {leftForDoctor} more patient{leftForDoctor > 1 ? "s" : ""} waiting
        </p>
      )}
    </div>
  );
}
