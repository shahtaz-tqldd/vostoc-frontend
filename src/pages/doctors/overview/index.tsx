import { useState } from "react";
import { Link } from "react-router-dom";
import moment from "moment";

// components
import { DoctorTopbar } from "@/components/layout/Topbar";
import { Button } from "@/components/ui/button";
import SchedulePanel from "./schedule-panel";
import DoctorsAppointmentList from "./appointment-list";
import MyPatientList from "./my-patient-list";

// services
import { formatTime12, getDurationMinutes } from "@/lib/time";
import { cn } from "@/lib/utils";

// icons
import { Bell, Clock, Play, Square, User } from "lucide-react";

// data
import { PATIENTS } from "../consultation/mock_data";
import { DAYS, DOCTOR_SCHEDULES, TODAYS_APPOINTMENTS } from "./mock_data";
import AppointmentStats from "@/pages/common/components/appointment-status";

type ConsultationStatus = "idle" | "in_progress" | "completed";

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
            <NextPatientCard />
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

const NextPatientCard = () => {
  const [status, setStatus] = useState<ConsultationStatus>("completed");
  const [currentIndex, setCurrentIndex] = useState(0);

  // derive
  const isQueueEmpty = TODAYS_APPOINTMENTS.length === 0;
  const currentAppointment = TODAYS_APPOINTMENTS[currentIndex] ?? null;
  const nextAppointment = TODAYS_APPOINTMENTS[currentIndex + 1] ?? null;
  const currentPatient = currentAppointment
    ? PATIENTS[currentAppointment.patientId]
    : null;
  const nextPatient = nextAppointment
    ? PATIENTS[nextAppointment.patientId]
    : null;
  const currentIssue = currentAppointment?.chief ?? "No chief complaint";
  const waitingSince = currentAppointment?.time ?? "Unknown time";

  const handleEnd = () => {
    if (currentIndex + 1 < TODAYS_APPOINTMENTS.length) {
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
            <p className="text-xs text-gray-500 truncate">{currentIssue}</p>
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

  // COMPLETED: ready to start next consultation
  if (status === "completed" && currentPatient) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
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
            <p className="text-xs text-gray-500 truncate">{currentIssue}</p>
            <p className="text-xs text-gray-400 mt-0.5">
              Age {currentPatient.age} · Waiting since {waitingSince}
            </p>
          </div>
        </div>

        {/* start button */}
        <Link to={`/consultation/${currentPatient.id}`}>
          <Button className="mt-6 w-full">
            <Play size={12} fill="currentColor" /> Start Consultation
          </Button>
        </Link>

        {/* remaining count */}
        {TODAYS_APPOINTMENTS.length - currentIndex - 1 > 0 && (
          <p className="text-xs text-gray-400 text-center mt-4">
            {TODAYS_APPOINTMENTS.length - currentIndex - 1} more patient
            {TODAYS_APPOINTMENTS.length - currentIndex - 1 > 1 ? "s" : ""}{" "}
            waiting
          </p>
        )}
      </div>
    );
  }

  return null;
};

const DoctorSchedule = () => {
  const TODAY_DAY = moment().format("ddd");
  const [selectedDay, setSelectedDay] = useState(TODAY_DAY);

  // build a set of days that have at least one schedule entry
  const scheduledDays = new Set(DOCTOR_SCHEDULES.map((s) => s.day));

  // filter schedules for the selected day, sorted by startTime
  const daySchedules = DOCTOR_SCHEDULES.filter(
    (s) => s.day === selectedDay,
  ).sort((a, b) => a.startTime.localeCompare(b.startTime));

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
        <Clock size={13} className="text-indigo-500" /> My Schedule
      </h3>

      {/* Day pills */}
      <div className="flex gap-1.5 my-6 flex-wrap">
        {DAYS.map((day) => {
          const hasSchedule = scheduledDays.has(day);
          const isToday = day === TODAY_DAY;
          const isSelected = day === selectedDay;

          return (
            <button
              key={day}
              disabled={!hasSchedule}
              onClick={() => setSelectedDay(day)}
              className={cn(
                "relative w-10 h-10 rounded-full text-xs font-bold transition-all flex flex-col items-center justify-center",
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
