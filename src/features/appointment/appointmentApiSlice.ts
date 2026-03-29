import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { getCookie } from '@/lib/cookie'
import type {
  CreateAppointmentPayload,
  Appointment,
  AppointmentDetails,
  AppointmentPatientLookup,
  AppointmentPatientLookupResponse,
  AppointmentQueueItem,
  ConsultationData,
  UpdateAppointmentPayload,
} from './type'
import type { ApiResponse } from '../base-type'

export type AppointmentQueryParams = {
  startDate?: string
  endDate?: string
  pageSize?: number
  search?: string
  departmentId?: string
  status?: string
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
      AppointmentPatientLookup | AppointmentPatientLookupResponse | ApiResponse<AppointmentPatientLookup | AppointmentPatientLookupResponse>,
      string
    >({
      query: (contactNumber) =>
        `/appointments/patients?contactNumber=${encodeURIComponent(contactNumber)}`,
    }),

    getStats: builder.query({
      query: () =>
        `/appointments/stats/today`,
    }),

    getAppointmentQueue: builder.query<
      AppointmentQueueItem[] | ApiResponse<AppointmentQueueItem[]>,
      void
    >({
      query: () =>
        `/appointments/queue/next`,
    }),

    createAppointment: builder.mutation<Appointment, CreateAppointmentPayload>({
      query: (body) => ({
        url: '/appointments',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Appointment', id: 'LIST' }],
    }),

    updateAppointment: builder.mutation<
      void,
      { appointmentId: string; payload: UpdateAppointmentPayload | FormData }
    >({
      query: ({ appointmentId, payload }) => ({
        url: `/appointments/${appointmentId}`,
        method: 'PATCH',
        body: payload,
      }),
      invalidatesTags: [{ type: 'Appointment', id: 'LIST' }],
    }),


    completeConsultation: builder.mutation<
      void,
      { appointmentId: string; payload: UpdateAppointmentPayload | FormData }
    >({
      query: ({ appointmentId, payload }) => ({
        url: `/appointments/${appointmentId}/consultation`,
        method: 'PATCH',
        body: payload,
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

    // doctors
    getMyAppointments: builder.query<
      ApiResponse<AppointmentDetails[]>,
      AppointmentQueryParams | void
    >({
      query: (params) => {
        const searchParams = new URLSearchParams()

        if (params?.status) {
          searchParams.set('status', params.status)
        }

        const queryString = searchParams.toString()
        return queryString ? `/doctors/appointments/today?${queryString}` : '/doctors/appointments/today'
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

    getConsultationData: builder.query<ConsultationData, string | undefined>({
      query: (appointmentId) => {
        return `/appointments/${appointmentId}`
      }
    }),
  }),
})

export const {
  useCreateAppointmentMutation,
  useUpdateAppointmentMutation,
  useGetAppointmentsQuery,
  useLazyGetPatientByContactNumberQuery,
  useDeleteAppointmentMutation,
  useGetStatsQuery,
  useGetAppointmentQueueQuery,
  useGetMyAppointmentsQuery,
  useGetConsultationDataQuery,
  useCompleteConsultationMutation
} = appointmentApi
