export type CreateAppointmentPayload = {
  patientName: string;
  patientPhone: string;
  patientAge: number | undefined;
  patientGender: string | undefined;
  patientNotes: string | undefined;

  department: string;
  doctorId: string;

  appointmentDate: string;
  appointmentTime: string;
}

export type LatestVitals = {
  blood_group?: string
  blood_pressure?: string
  weight?: string
  heart_rate?: string
  bmi?: string
  respiratory_rate?: string
  temperature?: string
  oxygen_saturation?: string
  blood_glucose?: string
  [key: string]: unknown
}

export type UpdateAppointmentPayload = Partial<CreateAppointmentPayload> & {
  status?: string
  latest_vitals?: LatestVitals | Record<string, unknown> | null
  info?: {
    vitals?: LatestVitals | Record<string, unknown> | null
    [key: string]: unknown
  }
}

export type Appointment = {
  id: string
  name: string
  specialties: Array<{ id?: string; name: string }>
  doctors?: Array<{ id: string; name: string; image_url?: string }>
}

export type AppointmentDetails = {
  id: string
  patientName?: string
  patientPhone?: string
  patientAge?: number
  patientGender?: string
  appointmentDate?: string
  appointmentTime?: string
  appointmentStatus?: string
  latest_vitals?: LatestVitals | Record<string, unknown> | string | null
  previousAppointment?: Record<string, unknown> | null
  doctor?: {
    id: string
    name: string
    image_url?: string
    department?: {
      id?: string
      name?: string
    }
    specialty?: {
      id?: string
      name?: string
    }
  }
}

export type AppointmentPatientLookup = {
  patientId?: string
  patientName?: string
  patientAge?: number
  patientGender?: string
  patientPhone?: string
  department?: string
  departmentId?: string
  doctorId?: string
  doctorName?: string
}

export type AppointmentPatientLookupResponse = {
  patients?: AppointmentPatientLookup[]
}

export type AppointmentQueueItem = {
  nextPatient?: {
    name?: string
    age?: number
    gender?: string
    contact?: string
  }
  department?: {
    id?: string
    name?: string
  }
  doctor?: {
    id?: string
    name?: string
    profileImageUrl?: string
    specialty?: {
      id?: string
      name?: string
    }
  }
  leftForDoctor?: number
}

export type ConsultationAppointment = {
  id: string
  appointmentDate?: string
  appointmentTime?: string
  appointmentStatus?: string
  consultationStatus?: string
  patientId?: string
  patientName?: string
  patientAge?: number
  patientGender?: string
  patientPhone?: string
  patientNotes?: string
  allergies?: string[] | string | null
  chronicConditions?: string[] | string | null
  chronic_conditions?: string[] | string | null
  currentMedications?: string[] | string | null
  current_medications?: string[] | string | null
  info?: Record<string, unknown> | string | null
  latest_vitals?: LatestVitals | Record<string, unknown> | string | null
  department?: {
    id?: string
    name?: string
  }
  doctor?: {
    id?: string
    name?: string
    specialty?: {
      id?: string
      name?: string
    }
  }
  createdAt?: string
  updatedAt?: string
}

export type ConsultationPastAppointment = {
  date?: string
  appointment?: ConsultationAppointment
}

export type ConsultationData = {
  current_appointment?: ConsultationAppointment | null
  past_appointments?: ConsultationPastAppointment[]
}
