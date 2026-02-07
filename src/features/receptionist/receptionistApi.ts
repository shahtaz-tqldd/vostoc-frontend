import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { getCookie } from '@/lib/cookie'
import type {
  CreateReceptionistPayload,
  Receptionist,
  ReceptionistQueryParams,
} from './type'
import type { ApiResponse } from '../base-type'

export const receptionistApi = createApi({
  reducerPath: 'receptionistApi',
  tagTypes: ['Receptionist'],
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
    getReceptionists: builder.query<
      ApiResponse<Receptionist[]>,
      ReceptionistQueryParams | void
    >({
      query: (params) => {
        const cleanedParams = params
          ? Object.fromEntries(
              Object.entries(params).filter(
                ([, value]) => value !== undefined && value !== '',
              ),
            )
          : undefined

        return {
          url: '/receptionists',
          params: cleanedParams,
        }
      },
      providesTags: (result) =>
        result
          ? [
            { type: 'Receptionist' as const, id: 'LIST' },
            ...result.data.map((rec) => ({
              type: 'Receptionist' as const,
              id: rec.id,
            })),
          ]
          : [{ type: 'Receptionist' as const, id: 'LIST' }],
    }),

    createReceptionist: builder.mutation<void, CreateReceptionistPayload>({
      query: (payload) => {
        const formData = new FormData()
        formData.append('name', payload.name)
        formData.append('username', payload.username)
        formData.append('password', payload.password)
        formData.append('department_id', payload.department_id)
        formData.append('contact_number', payload.contact_number)
        formData.append('shift', payload.shift)
        if (payload.description) {
          formData.append('description', payload.description)
        }
        if (payload.image) {
          formData.append('image', payload.image)
        }

        return {
          url: '/receptionists/create',
          method: 'POST',
          body: formData,
        }
      },
      invalidatesTags: [{ type: 'Receptionist', id: 'LIST' }],
    }),

    deleteReceptionist: builder.mutation<void, string>({
      query: (receptionistId) => ({
        url: `/receptionists/${receptionistId}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Receptionist', id: 'LIST' }],
    }),
  }),
})

export const {
  useCreateReceptionistMutation,
  useGetReceptionistsQuery,
  useDeleteReceptionistMutation,
} = receptionistApi
