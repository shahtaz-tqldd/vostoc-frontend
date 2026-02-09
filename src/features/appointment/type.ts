export type CreateAppointmentPayload = {
  patientName: string;
  patientPhone: string;
  patientAge: number | undefined;
  patientGender: string | undefined;
  patientNotes: string | undefined;

  department: string;
  doctorId: string;

  appointmentDate: Date;
  appointmentTime: Date;
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
  appointmentDate?: string
  appointmentTime?: string
  status?: string
  doctor?: {
    id: string
    name: string
    image_url?: string
  }
}

export type AppointmentPatientLookup = {
  patientName?: string
  patientAge?: number
  patientGender?: string
  department?: string
  departmentId?: string
  doctorId?: string
}
