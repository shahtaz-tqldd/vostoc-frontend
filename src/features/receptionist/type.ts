export type ReceptionistStatus = 'Active' | 'On Break' | 'Off Duty'

export type ReceptionistShift = 'Morning' | 'Evening' | 'Night'

export type Receptionist = {
  id: string
  name: string
  profile_image_url?: string
  contactNumber: string
  department:
    | string
    | {
        id?: string
        name?: string
      }
  status: ReceptionistStatus
  shift: ReceptionistShift
  todaysAppointments: number
}

export type CreateReceptionistPayload = {
  name: string
  username: string
  password: string
  image?: File
  department_id: string
  contact_number: string
  shift: ReceptionistShift
  description?: string
}

export type ReceptionistQueryParams = {
  search?: string
  department?: string
  status?: ReceptionistStatus
  page?: number
  pageSize?: number
}
