import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { getCookie } from '@/lib/cookie'
import type { CreateDoctorPayload, DoctorDetails } from './type'
import type { ApiResponse } from '../base-type'

export const doctorsApi = createApi({
  reducerPath: 'doctorsApi',
  tagTypes: ['Doctor'],
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

    getDoctors: builder.query<ApiResponse<DoctorDetails[]>, void>({
      query: () => '/doctors',
      providesTags: (result) =>
        result
          ? [
            { type: 'Doctor' as const, id: 'LIST' },
            ...result.data.map((doctor) => ({
              type: 'Doctor' as const,
              id: doctor.id,
            })),
          ]
          : [{ type: 'Doctor' as const, id: 'LIST' }],
    }),
  }),
})

export const {
  useCreateDoctorMutation,
  useGetDoctorsQuery,
} = doctorsApi
