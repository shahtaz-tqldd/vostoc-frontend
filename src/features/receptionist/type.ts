export type ReceptionistShift = 'Morning' | 'Evening' | 'Night'

export type Receptionist = {
  id: string
  name: string
  username?: string
  profile_image_url?: string
  contactNumber: string
  departments?: Array<{
    id?: string
    name?: string
  }>
  department:
  | string
  | {
    id?: string
    name?: string
  }
  status: string
  shift: ReceptionistShift
  todaysAppointments: number
  description?: string
}

export type CreateReceptionistPayload = {
  name: string
  username: string
  password: string
  image?: File
  department_id?: string
  department_ids?: string[]
  contact_number: string
  shift: ReceptionistShift
  description?: string
}

export type UpdateReceptionistPayload = {
  name?: string
  username?: string
  password?: string
  image?: File
  department_ids?: string[]
  contact_number?: string
  shift?: ReceptionistShift
  description?: string
}

export type ReceptionistQueryParams = {
  search?: string
  departmentId?: string
  status?: string
  page?: number
  pageSize?: number
}
