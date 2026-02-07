export type CreateDepartmentPayload = {
  name: string
  specialties: string[]
}

export type Department = {
  id: string
  name: string
  specialties: Array<{ id?: string; name: string }>
  doctors?: Array<{ id: string; name: string; image_url?: string }>
}

export type DepartmentDetails = {
  id: string
  name: string
  specialties: { name: string; id: string }[]
  doctors: { name: string; id: string; image_url: string }[]
}
