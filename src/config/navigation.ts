import type { LucideIcon } from "lucide-react";
import {
  Calendar,
  ChartNoAxesGantt,
  Layers,
  MessagesSquare,
  Stethoscope,
  Users,
} from "lucide-react";
import type { Role } from "@/features/auth/authSlice";

export type NavMenuItem = {
  label: string;
  description?: string;
  to: string;
  icon?: LucideIcon;
};

export const adminSidebarItems: NavMenuItem[] = [
  {
    label: "Overview",
    description: "Hospital performance",
    to: "/",
    icon: Layers,
  },
  {
    label: "Doctors",
    description: "Credentials and schedules",
    to: "/doctors/list",
    icon: Stethoscope,
  },
  {
    label: "Appointments",
    description: "Slots and assignments",
    to: "/appointment-list",
    icon: ChartNoAxesGantt,
  },
  {
    label: "Receptionist",
    description: "Capacity planning",
    to: "/receptionist",
    icon: Users,
  },
];

export const receptionistSidebarItems: NavMenuItem[] = [
  {
    label: "My day",
    description: "Appointments and tasks",
    to: "/",
    icon: Calendar,
  },
  {
    label: "Appointment List",
    description: "History and notes",
    to: "/appointment-list",
    icon: ChartNoAxesGantt,
  },
  {
    label: "Messages",
    description: "Team updates",
    to: "/messages",
    icon: MessagesSquare,
  },
];

export const doctorProfileItems: NavMenuItem[] = [
  {
    label: "Overview",
    to: "/",
  },
];

export function getSidebarItemsByRole(role: Role): NavMenuItem[] {
  if (role === "admin") return adminSidebarItems;
  if (role === "receptionist") return receptionistSidebarItems;
  return doctorProfileItems;
}

export function getProfileItemsByRole(role: Role | null): NavMenuItem[] {
  if (role === "admin") return adminSidebarItems;
  if (role === "receptionist") return receptionistSidebarItems;
  if (role === "doctor") return doctorProfileItems;
  return [];
}
