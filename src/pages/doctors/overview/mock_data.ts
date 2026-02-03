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

import { CheckCircle2, Circle, Loader2 } from "lucide-react";

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
