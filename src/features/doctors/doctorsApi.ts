import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { getCookie } from '@/lib/cookie'
import type { ActiveDoctor, CreateDoctorPayload, DoctorDetails, UpdateDoctorPayload } from './type'
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

    updateDoctor: builder.mutation<
      void,
      { doctorId: string; payload: UpdateDoctorPayload }
    >({
      query: ({ doctorId, payload }) => {
        const formData = new FormData()
        if (payload.name !== undefined) {
          formData.append('name', payload.name)
        }
        if (payload.username !== undefined) {
          formData.append('username', payload.username)
        }
        if (payload.password !== undefined) {
          formData.append('password', payload.password)
        }
        if (payload.department_id !== undefined) {
          formData.append('department_id', payload.department_id)
        }
        if (payload.specialty !== undefined) {
          formData.append('specialty', payload.specialty)
        }
        if (payload.contact_number !== undefined) {
          formData.append('contact_number', payload.contact_number)
        }
        if (payload.description !== undefined) {
          formData.append('description', payload.description)
        }
        if (payload.schedules !== undefined) {
          formData.append('schedules', JSON.stringify(payload.schedules))
        }
        if (payload.image !== undefined) {
          formData.append('image', payload.image)
        }

        return {
          url: `/doctors/${doctorId}`,
          method: 'PATCH',
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

    deleteDoctor: builder.mutation<void, string>({
      query: (doctorId) => ({
        url: `/doctors/${doctorId}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Doctor', id: 'LIST' }],
    }),

    getActiveDoctors: builder.query<ApiResponse<ActiveDoctor[]>, void>({
      query: () => '/doctors/active/today',
      providesTags: (result) =>
        result
          ? [
            { type: 'Doctor' as const, id: 'LIST' },
            ...result.data.map((doctor) => ({
              type: 'Doctor' as const,
              id: doctor.doctorId,
            })),
          ]
          : [{ type: 'Doctor' as const, id: 'LIST' }],
    }),
  }),
})

export const {
  useCreateDoctorMutation,
  useUpdateDoctorMutation,
  useGetDoctorsQuery,
  useDeleteDoctorMutation,
  useGetActiveDoctorsQuery,
} = doctorsApi
