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

export type DoctorScheduleEntry = {
  [dayName: string]: Array<{ start_time: string; end_time: string }>
}

export type CreateDoctorPayload = {
  name: string
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
  }),
})

export const {
  useCreateDepartmentMutation,
  useGetDepartmentsQuery,
  useDeleteDepartmentMutation,
  useCreateDoctorMutation,
} = doctorsApi
