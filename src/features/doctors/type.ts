import type { Department } from "../department/type"

export type DoctorSchedule = {
  id: string
  doctorId: string
  day: string
  startTime: string
  endTime: string
  createdAt: string
  updatedAt: string
}

export type DoctorDetails = {
  id: string
  name: string
  departmentId: string
  specialtyId: string
  contactNumber: string
  description?: string
  profileImageUrl?: string
  createdAt: string
  updatedAt: string
  department?: {
    id: string
    name: string
    createdAt: string
    updatedAt: string
  }
  specialty?: {
    id: string
    name: string
    departmentId: string
    createdAt: string
    updatedAt: string
  }
  schedules?: DoctorSchedule[]
}

export type DoctorScheduleEntry = {
  [dayName: string]: Array<{ start_time: string; end_time: string }>
}

export type CreateDoctorPayload = {
  name: string
  username: string
  password: string
  department_id: string
  specialty: string
  contact_number: string
  description?: string
  schedules: DoctorScheduleEntry[]
  image?: File
}

export type UpdateDoctorPayload = {
  name?: string
  username?: string
  password?: string
  department_id?: string
  specialty?: string
  contact_number?: string
  description?: string
  schedules?: DoctorScheduleEntry[]
  image?: File
}

export interface ActiveDoctor {
  doctorId: string;
  name: string;
  profileImageUrl: string | null;
  department: Department;
  totalAppointments: number;
  completedAppointments: number;
  todaysSchedules: {
    day: string;
    startTime: string;
    endTime: string;
  }[];
}