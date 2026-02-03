import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { getCookie } from '@/lib/cookie'

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

export const doctorsApi = createApi({
  reducerPath: 'doctorsApi',
  tagTypes: ['Department', 'Doctor'],
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:6500',
    prepareHeaders: (headers) => {
      const token = getCookie('token')
      if (token) {
        headers.set('authorization', `Bearer ${token}`)
      }
      return headers
    },
  }),
  endpoints: (builder) => ({
    getDepartments: builder.query<DepartmentDetails[], void>({
      query: () => '/departments',
      providesTags: (result) =>
        result
          ? [
            { type: 'Department' as const, id: 'LIST' },
            ...result.map((dept) => ({
              type: 'Department' as const,
              id: dept.id,
            })),
          ]
          : [{ type: 'Department' as const, id: 'LIST' }],
    }),

    createDepartment: builder.mutation<Department, CreateDepartmentPayload>({
      query: (body) => ({
        url: '/departments',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Department', id: 'LIST' }],
    }),
    deleteDepartment: builder.mutation<void, string>({
      query: (departmentId) => ({
        url: `/departments/${departmentId}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Department', id: 'LIST' }],
    }),

    createDoctor: builder.mutation<void, CreateDoctorPayload>({
      query: (payload) => {
        const formData = new FormData()
        formData.append('name', payload.name)
        formData.append('username', payload.username)
        formData.append('password', payload.password)
        formData.append('department_id', payload.department_id)
        formData.append('specialty', payload.specialty)
        formData.append('contact_number', payload.contact_number)
        if (payload.description) {
          formData.append('description', payload.description)
        }
        formData.append('schedules', JSON.stringify(payload.schedules))
        if (payload.image) {
          formData.append('image', payload.image)
        }

        return {
          url: '/doctors/create',
          method: 'POST',
          body: formData,
        }
      },
      invalidatesTags: [{ type: 'Doctor', id: 'LIST' }],
    }),

    getDoctors: builder.query<DoctorDetails[], void>({
      query: () => '/doctors',
      providesTags: (result) =>
        result
          ? [
            { type: 'Doctor' as const, id: 'LIST' },
            ...result.map((doctor) => ({
              type: 'Doctor' as const,
              id: doctor.id,
            })),
          ]
          : [{ type: 'Doctor' as const, id: 'LIST' }],
    }),
  }),
})

export const {
  useCreateDepartmentMutation,
  useGetDepartmentsQuery,
  useDeleteDepartmentMutation,
  useCreateDoctorMutation,
  useGetDoctorsQuery,
} = doctorsApi
