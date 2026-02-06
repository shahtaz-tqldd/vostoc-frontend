import type { Appointment, DoctorLoad, PatientRecord } from '../types/dashboard'

export const adminAppointments: Appointment[] = [
  {
    id: 'APT-1041',
    patient: 'Harper Lee',
    doctor: 'Dr. M. Ortega',
    department: 'Cardiology',
    time: '09:30 AM',
    status: 'Confirmed',
  },
  {
    id: 'APT-1042',
    patient: 'Noah Patel',
    doctor: 'Dr. K. Ahmed',
    department: 'Neurology',
    time: '10:00 AM',
    status: 'Pending',
  },
  {
    id: 'APT-1043',
    patient: 'Zoe Fischer',
    doctor: 'Dr. L. James',
    department: 'Pediatrics',
    time: '10:30 AM',
    status: 'Confirmed',
  },
  {
    id: 'APT-1044',
    patient: 'Olivia Ross',
    doctor: 'Dr. M. Ortega',
    department: 'Cardiology',
    time: '11:15 AM',
    status: 'Completed',
  },
  {
    id: 'APT-1045',
    patient: 'Nikolas Cage',
    doctor: 'Dr. R. Miller',
    department: 'Cardiology',
    time: '11:15 AM',
    status: 'Completed',
  },
]

export const doctorLoads: DoctorLoad[] = [
  {
    name: 'Dr. M. Ortega',
    department: 'Cardiology',
    slotFill: '94% (16/17)',
    nextAvailable: '02:45 PM',
  },
  {
    name: 'Dr. K. Ahmed',
    department: 'Neurology',
    slotFill: '88% (14/16)',
    nextAvailable: '01:20 PM',
  },
  {
    name: 'Dr. L. James',
    department: 'Pediatrics',
    slotFill: '72% (13/18)',
    nextAvailable: '11:50 AM',
  },
]

export const doctorAppointments: Appointment[] = [
  {
    id: 'APT-2211',
    patient: 'Ava Nguyen',
    doctor: 'Dr. Maya Chen',
    department: 'Internal Medicine',
    time: '08:45 AM',
    status: 'Completed',
  },
  {
    id: 'APT-2212',
    patient: 'Jude Johnson',
    doctor: 'Dr. Maya Chen',
    department: 'Internal Medicine',
    time: '09:20 AM',
    status: 'Confirmed',
  },
  {
    id: 'APT-2213',
    patient: 'Sophia Martinez',
    doctor: 'Dr. Maya Chen',
    department: 'Internal Medicine',
    time: '10:10 AM',
    status: 'Confirmed',
  },
]

export const patientRecords: PatientRecord[] = [
  {
    id: 'P-1093',
    name: 'Jude Johnson',
    lastVisit: 'Nov 02, 2025',
    nextVisit: 'Jan 31, 2026',
    risk: 'Medium',
  },
  {
    id: 'P-1138',
    name: 'Sophia Martinez',
    lastVisit: 'Dec 18, 2025',
    nextVisit: 'Feb 06, 2026',
    risk: 'Low',
  },
  {
    id: 'P-1199',
    name: 'Ava Nguyen',
    lastVisit: 'Jan 28, 2026',
    nextVisit: 'Mar 05, 2026',
    risk: 'High',
  },
]
