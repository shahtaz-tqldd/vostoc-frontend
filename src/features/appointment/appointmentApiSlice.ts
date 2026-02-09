import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { getCookie } from '@/lib/cookie'
import type {
  CreateAppointmentPayload,
  Appointment,
  AppointmentDetails,
  AppointmentPatientLookup,
} from './type'
import type { ApiResponse } from '../base-type'

export const appointmentApi = createApi({
  reducerPath: 'appointmentApi',
  tagTypes: ['Appointment'],
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
    getAppointments: builder.query<ApiResponse<AppointmentDetails[]>, void>({
      query: () => '/appointments',
      providesTags: (result) =>
        result
          ? [
            { type: 'Appointment' as const, id: 'LIST' },
            ...result.data.map((dept) => ({
              type: 'Appointment' as const,
              id: dept.id,
            })),
          ]
          : [{ type: 'Appointment' as const, id: 'LIST' }],
    }),

    getPatientByContactNumber: builder.query<
      AppointmentPatientLookup,
      string
    >({
      query: (contactNumber) =>
        `/appointments/patients?contactNumber=${encodeURIComponent(contactNumber)}`,
    }),

    createAppointment: builder.mutation<Appointment, CreateAppointmentPayload>({
      query: (body) => ({
        url: '/appointments',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Appointment', id: 'LIST' }],
    }),

    deleteAppointment: builder.mutation<void, string>({
      query: (appointmentId) => ({
        url: `/appointments/${appointmentId}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Appointment', id: 'LIST' }],
    }),
  }),
})

export const {
  useCreateAppointmentMutation,
  useGetAppointmentsQuery,
  useLazyGetPatientByContactNumberQuery,
  useDeleteAppointmentMutation,
} = appointmentApi
