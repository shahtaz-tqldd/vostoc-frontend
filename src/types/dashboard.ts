export type AppointmentStatus = 'Confirmed' | 'Pending' | 'Completed'

export type Appointment = {
  id: string
  patient: string
  doctor: string
  department: string
  time: string
  status: AppointmentStatus
}

export type DoctorLoad = {
  name: string
  department: string
  slotFill: string
  nextAvailable: string
}

export type PatientRecord = {
  id: string
  name: string
  lastVisit: string
  nextVisit: string
  risk: 'Low' | 'Medium' | 'High'
}
