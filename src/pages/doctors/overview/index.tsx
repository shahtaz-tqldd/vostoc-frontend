import { Bell, Clock, Play, Square, User } from "lucide-react";
import { cn } from "@/lib/utils";

import SchedulePanel from "./schedule-panel";
import { TODAYS_APPOINTMENTS } from "./mock_data";
import DoctorsAppointmentList from "./appointment-list";
import { DoctorTopbar } from "@/components/layout/Topbar";
import MyPatientList from "./my-patient-list";
import { useState } from "react";
import { Button } from "@/components/ui/button";

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
            {/* stats */}
            <Stats />
            <SchedulePanel />
            <MyPatientList />
          </div>
          <div className="col-span-1 space-y-5">
            <NextPatientCard />
            <Notification />
            <DoctorScheduleWidget />
          </div>
        </div>
      </div>
    </div>
  );
}

const Stats = () => {
  const completed = TODAYS_APPOINTMENTS.filter(
    (a) => a.status === "completed",
  ).length;
  const waiting = TODAYS_APPOINTMENTS.filter(
    (a) => a.status === "waiting" || a.status === "Follow-up",
  ).length;

  return (
    <div className="grid grid-cols-3 gap-3">
      {[
        {
          label: "Total Today",
          value: TODAYS_APPOINTMENTS.length,
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
};

const Notification = () => {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-4">
      <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
        <Bell size={13} className="text-orange-500" /> Notification
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
  );
};

// ─── Mock data for Next Patient queue ────────────────────────────────────────
const PATIENT_QUEUE = [
  {
    id: "p1",
    name: "Mohammad Hasan",
    age: 45,
    issue: "Chest pain & shortness of breath",
    waitingSince: "9:15 AM",
  },
  {
    id: "p2",
    name: "Abdul Karim",
    age: 58,
    issue: "Pulmonary function follow-up",
    waitingSince: "9:30 AM",
  },
  {
    id: "p3",
    name: "Fatima Begum",
    age: 32,
    issue: "Routine check-up",
    waitingSince: "9:45 AM",
  },
];

// ─── Mock schedule data ──────────────────────────────────────────────────────
const DOCTOR_SCHEDULES = [
  {
    id: "a2d08eee-8511-4fa2-a828-300d2685b7f3",
    doctorId: "f6995aca-2b26-4e28-8069-c1f486383fd5",
    day: "MON",
    startTime: "09:00",
    endTime: "12:00",
    createdAt: "2026-02-02T17:52:16.687Z",
    updatedAt: "2026-02-02T17:52:16.687Z",
  },
  {
    id: "b3e19fff-9622-5gb3-b939-411e3796c8g4",
    doctorId: "f6995aca-2b26-4e28-8069-c1f486383fd5",
    day: "MON",
    startTime: "14:00",
    endTime: "16:00",
    createdAt: "2026-02-02T17:52:16.687Z",
    updatedAt: "2026-02-02T17:52:16.687Z",
  },
  {
    id: "c4f2a001-0733-6hc4-ca4a-522f4807d9h5",
    doctorId: "f6995aca-2b26-4e28-8069-c1f486383fd5",
    day: "TUE",
    startTime: "10:00",
    endTime: "13:00",
    createdAt: "2026-02-02T17:52:16.687Z",
    updatedAt: "2026-02-02T17:52:16.687Z",
  },
  {
    id: "d5g3b112-1844-7id5-db5b-633g5918eai6",
    doctorId: "f6995aca-2b26-4e28-8069-c1f486383fd5",
    day: "WED",
    startTime: "08:00",
    endTime: "11:00",
    createdAt: "2026-02-02T17:52:16.687Z",
    updatedAt: "2026-02-02T17:52:16.687Z",
  },
  {
    id: "e6h4c223-2955-8je6-ec6c-744h6a29fbj7",
    doctorId: "f6995aca-2b26-4e28-8069-c1f486383fd5",
    day: "WED",
    startTime: "14:30",
    endTime: "17:00",
    createdAt: "2026-02-02T17:52:16.687Z",
    updatedAt: "2026-02-02T17:52:16.687Z",
  },
  {
    id: "f7i5d334-3a66-9kf7-fd7d-855i9b3agck8",
    doctorId: "f6995aca-2b26-4e28-8069-c1f486383fd5",
    day: "FRI",
    startTime: "09:00",
    endTime: "12:00",
    createdAt: "2026-02-02T17:52:16.687Z",
    updatedAt: "2026-02-02T17:52:16.687Z",
  },
  {
    id: "g8j6e445-4b77-al08-ge8e-966j0c4bhdl9",
    doctorId: "f6995aca-2b26-4e28-8069-c1f486383fd5",
    day: "FRI",
    startTime: "15:00",
    endTime: "17:30",
    createdAt: "2026-02-02T17:52:16.687Z",
    updatedAt: "2026-02-02T17:52:16.687Z",
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
const DAYS_OF_WEEK = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

// Today is Tuesday Feb 3, 2026
const TODAY_DAY = "TUE";

function formatTime12(time24: string) {
  const [h, m] = time24.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${m.toString().padStart(2, "0")} ${ampm}`;
}

function getDurationMinutes(start: string, end: string) {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  return eh * 60 + em - (sh * 60 + sm);
}

type ConsultationStatus = "idle" | "in_progress" | "completed";

const NextPatientCard = () => {
  const [status, setStatus] = useState<ConsultationStatus>("completed");
  const [currentIndex, setCurrentIndex] = useState(0);

  // derive
  const isQueueEmpty = PATIENT_QUEUE.length === 0;
  const currentPatient = PATIENT_QUEUE[currentIndex] ?? null;
  const nextPatient = PATIENT_QUEUE[currentIndex + 1] ?? null;

  const handleStart = () => setStatus("in_progress");

  const handleEnd = () => {
    if (currentIndex + 1 < PATIENT_QUEUE.length) {
      setCurrentIndex((i) => i + 1);
      setStatus("completed");
    } else {
      // no more patients
      setCurrentIndex((i) => i + 1);
      setStatus("idle");
    }
  };

  if (isQueueEmpty || (status === "idle" && !currentPatient)) {
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

  if (status === "in_progress" && currentPatient) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-4">
        <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
          <User size={13} className="text-blue-500" /> Next Patient
        </h3>

        {/* live badge */}
        <div className="flex items-center gap-1.5 mb-3">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
          </span>
          <span className="text-xs font-semibold text-green-600">
            Consultation in progress
          </span>
        </div>

        {/* current patient card */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-start gap-3">
          <div className="w-9 h-9 rounded-full bg-green-200 flex items-center justify-center flex-shrink-0">
            <User size={16} className="text-green-700" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-gray-800 truncate">
              {currentPatient.name}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {currentPatient.issue}
            </p>
            <p className="text-xs text-green-600 mt-0.5">
              Age {currentPatient.age} · Seeing now
            </p>
          </div>
        </div>

        {/* end button */}
        <Button onClick={handleEnd} className="w-full mt-6" variant="outline">
          <Square size={12} fill="currentColor" /> End Consultation
        </Button>

        {/* next in line preview */}
        {nextPatient && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-400 mb-1.5">Up next</p>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                <User size={11} className="text-gray-400" />
              </div>
              <p className="text-xs text-gray-500">{nextPatient.name}</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── COMPLETED – ready to start next consultation ───────────────────────
  if (status === "completed" && currentPatient) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-4">
        <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
          <User size={13} className="text-blue-500" /> Next Patient
        </h3>

        {/* ready badge */}
        <div className="flex items-center gap-1.5 mb-3">
          <span className="w-2 h-2 rounded-full bg-blue-400" />
          <span className="text-xs font-semibold text-blue-600">
            Ready to consult
          </span>
        </div>

        {/* next patient card */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-start gap-3">
          <div className="w-9 h-9 rounded-full bg-blue-200 flex items-center justify-center flex-shrink-0">
            <User size={16} className="text-blue-700" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-gray-800 truncate">
              {currentPatient.name}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {currentPatient.issue}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              Age {currentPatient.age} · Waiting since{" "}
              {currentPatient.waitingSince}
            </p>
          </div>
        </div>

        {/* start button */}
        <Button onClick={handleStart} className="mt-6 w-full">
          <Play size={12} fill="currentColor" /> Start Consultation
        </Button>

        {/* remaining count */}
        {PATIENT_QUEUE.length - currentIndex - 1 > 0 && (
          <p className="text-xs text-gray-400 text-center mt-2">
            {PATIENT_QUEUE.length - currentIndex - 1} more patient
            {PATIENT_QUEUE.length - currentIndex - 1 > 1 ? "s" : ""} waiting
          </p>
        )}
      </div>
    );
  }

  return null;
};

const DoctorScheduleWidget = () => {
  const [selectedDay, setSelectedDay] = useState(TODAY_DAY);

  // build a set of days that have at least one schedule entry
  const scheduledDays = new Set(DOCTOR_SCHEDULES.map((s) => s.day));

  // filter schedules for the selected day, sorted by startTime
  const daySchedules = DOCTOR_SCHEDULES.filter(
    (s) => s.day === selectedDay,
  ).sort((a, b) => a.startTime.localeCompare(b.startTime));

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-4">
      <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
        <Clock size={13} className="text-indigo-500" /> My Schedule
      </h3>

      {/* Day pills */}
      <div className="flex gap-1.5 mb-4 flex-wrap">
        {DAYS_OF_WEEK.map((day) => {
          const hasSchedule = scheduledDays.has(day);
          const isToday = day === TODAY_DAY;
          const isSelected = day === selectedDay;

          return (
            <button
              key={day}
              disabled={!hasSchedule}
              onClick={() => setSelectedDay(day)}
              className={cn(
                "relative w-9 h-9 rounded-full text-xs font-bold transition-all flex flex-col items-center justify-center",
                // disabled – no schedule
                !hasSchedule &&
                  "bg-gray-50 text-gray-300 cursor-not-allowed border border-dashed border-gray-200",
                // enabled but not selected
                hasSchedule &&
                  !isSelected &&
                  "bg-gray-100 text-gray-600 hover:bg-gray-200 cursor-pointer border border-transparent",
                // selected
                isSelected &&
                  "bg-indigo-500 text-white shadow-md shadow-indigo-200 border border-transparent",
              )}
            >
              {day.slice(0, 2)}
              {/* today dot */}
              {isToday && !isSelected && (
                <span className="absolute bottom-0.5 w-1 h-1 rounded-full bg-indigo-400" />
              )}
              {/* schedule-count dot when not selected */}
              {hasSchedule && !isSelected && (
                <span className="absolute top-0 right-0 w-1.5 h-1.5 rounded-full bg-indigo-400" />
              )}
            </button>
          );
        })}
      </div>

      {/* Schedule list for selected day */}
      {daySchedules.length === 0 ? (
        <div className="py-4 text-center">
          <p className="text-xs text-gray-400">No schedule for this day</p>
        </div>
      ) : (
        <div className="space-y-2">
          {daySchedules.map((entry, idx) => {
            const duration = getDurationMinutes(entry.startTime, entry.endTime);
            // simple heuristic: colour-rotate the slots
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
                key={entry.id}
                className={cn(
                  "flex items-stretch gap-3 p-2.5 rounded-xl border",
                  c.bg,
                  c.border,
                )}
              >
                {/* left accent bar */}
                <div
                  className={cn("w-1 rounded-full flex-shrink-0", c.accent)}
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className={cn("text-xs font-bold", c.text)}>
                      {formatTime12(entry.startTime)} –{" "}
                      {formatTime12(entry.endTime)}
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
};
