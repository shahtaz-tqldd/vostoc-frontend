import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { getCookie } from '@/lib/cookie'
import type {
  CreateAppointmentPayload,
  Appointment,
  AppointmentDetails,
  AppointmentPatientLookup,
} from './type'
import type { ApiResponse } from '../base-type'

export type AppointmentQueryParams = {
  startDate?: string
  endDate?: string
  pageSize?: number
  search?: string
  departmentId?: string
}

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
    getAppointments: builder.query<
      ApiResponse<AppointmentDetails[]>,
      AppointmentQueryParams | void
    >({
      query: (params) => {
        const searchParams = new URLSearchParams()
        if (params?.startDate) {
          searchParams.set('startDate', params.startDate)
        }
        if (params?.pageSize) {
          searchParams.set('pageSize', params.pageSize.toString())
        }
        if (params?.endDate) {
          searchParams.set('endDate', params.endDate)
        }
        if (params?.search) {
          searchParams.set('search', params.search)
        }
        if (params?.departmentId) {
          searchParams.set('departmentId', params.departmentId)
        }
        const queryString = searchParams.toString()
        return queryString ? `/appointments?${queryString}` : '/appointments'
      },
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
