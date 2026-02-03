import { CheckCircle2, Circle, Loader2 } from "lucide-react";
export const APPT_COUNTS = { Mon: 7, Tue: 5, Wed: 3, Thu: 8, Fri: 4, Sat: 0, Sun: 0 };
export const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
export const WEEKLY_SCHEDULE = {
  Mon: { start: "09:00", end: "13:00" },
  Tue: { start: "09:00", end: "17:00" },
  Wed: { start: "09:00", end: "13:00" },
  Thu: { start: "09:00", end: "17:00" },
  Fri: { start: "09:00", end: "13:00" },
  Sat: { start: "off", end: "off" },
  Sun: { start: "off", end: "off" },
};

export const CURRENT_DOCTOR = {
  id: "doc_1",
  name: "Dr. Arjun Mehta",
  specialty: "General Medicine",
  avatar: "AM",
};

export const TODAYS_APPOINTMENTS = [
  {
    id: "appt_1",
    patientId: "pat_1",
    time: "09:00",
    duration: 20,
    status: "completed",
    type: "Follow-up",
    chief: "Routine BP & Sugar check",
  },
  {
    id: "appt_2",
    patientId: "pat_2",
    time: "09:30",
    duration: 15,
    status: "completed",
    type: "New",
    chief: "Persistent cough for 2 weeks",
  },
  {
    id: "appt_3",
    patientId: "pat_3",
    time: "10:00",
    duration: 25,
    status: "in_progress",
    type: "Follow-up",
    chief: "Chest pain follow-up",
  },
  {
    id: "appt_4",
    patientId: "pat_4",
    time: "10:45",
    duration: 15,
    status: "waiting",
    type: "New",
    chief: "Breathing difficulty",
  },
  {
    id: "appt_5",
    patientId: "pat_5",
    time: "11:15",
    duration: 30,
    status: "Follow-up",
    type: "Follow-up",
    chief: "COPD & BP review",
  },
  {
    id: "appt_6",
    patientId: "pat_6",
    time: "12:00",
    duration: 20,
    status: "waiting",
    type: "Follow-up",
    chief: "Migraine frequency update",
  },
  {
    id: "appt_7",
    patientId: "pat_2",
    time: "14:00",
    duration: 15,
    status: "waiting",
    type: "New",
    chief: "Lab results review",
  },
];

export const STATUS_CFG = {
  completed: {
    label: "Done",
    bg: "bg-emerald-100",
    text: "text-emerald-700",
    Icon: CheckCircle2,
  },
  in_progress: {
    label: "Seeing",
    bg: "bg-blue-100",
    text: "text-blue-700",
    Icon: Loader2,
  },
  waiting: {
    label: "Waiting",
    bg: "bg-amber-100",
    text: "text-amber-700",
    Icon: Circle,
  },
};

export const DOCTOR_SCHEDULES = [
  {
    id: "a2d08eee-8511-4fa2-a828-300d2685b7f3",
    doctorId: "f6995aca-2b26-4e28-8069-c1f486383fd5",
    day: "Mon",
    startTime: "09:00",
    endTime: "12:00",
    createdAt: "2026-02-02T17:52:16.687Z",
    updatedAt: "2026-02-02T17:52:16.687Z",
  },
  {
    id: "b3e19fff-9622-5gb3-b939-411e3796c8g4",
    doctorId: "f6995aca-2b26-4e28-8069-c1f486383fd5",
    day: "Mon",
    startTime: "14:00",
    endTime: "16:00",
    createdAt: "2026-02-02T17:52:16.687Z",
    updatedAt: "2026-02-02T17:52:16.687Z",
  },
  {
    id: "c4f2a001-0733-6hc4-ca4a-522f4807d9h5",
    doctorId: "f6995aca-2b26-4e28-8069-c1f486383fd5",
    day: "Tue",
    startTime: "10:00",
    endTime: "13:00",
    createdAt: "2026-02-02T17:52:16.687Z",
    updatedAt: "2026-02-02T17:52:16.687Z",
  },
  {
    id: "d5g3b112-1844-7id5-db5b-633g5918eai6",
    doctorId: "f6995aca-2b26-4e28-8069-c1f486383fd5",
    day: "Wed",
    startTime: "08:00",
    endTime: "11:00",
    createdAt: "2026-02-02T17:52:16.687Z",
    updatedAt: "2026-02-02T17:52:16.687Z",
  },
  {
    id: "e6h4c223-2955-8je6-ec6c-744h6a29fbj7",
    doctorId: "f6995aca-2b26-4e28-8069-c1f486383fd5",
    day: "Wed",
    startTime: "14:30",
    endTime: "17:00",
    createdAt: "2026-02-02T17:52:16.687Z",
    updatedAt: "2026-02-02T17:52:16.687Z",
  },
  {
    id: "f7i5d334-3a66-9kf7-fd7d-855i9b3agck8",
    doctorId: "f6995aca-2b26-4e28-8069-c1f486383fd5",
    day: "Fri",
    startTime: "09:00",
    endTime: "12:00",
    createdAt: "2026-02-02T17:52:16.687Z",
    updatedAt: "2026-02-02T17:52:16.687Z",
  },
  {
    id: "g8j6e445-4b77-al08-ge8e-966j0c4bhdl9",
    doctorId: "f6995aca-2b26-4e28-8069-c1f486383fd5",
    day: "Fri",
    startTime: "15:00",
    endTime: "17:30",
    createdAt: "2026-02-02T17:52:16.687Z",
    updatedAt: "2026-02-02T17:52:16.687Z",
  },
];
