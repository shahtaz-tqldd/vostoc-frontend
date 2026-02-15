import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { getCookie } from '@/lib/cookie'
import type {
  CreateReceptionistPayload,
  Receptionist,
  ReceptionistQueryParams,
  UpdateReceptionistPayload,
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
    createReceptionist: builder.mutation<void, CreateReceptionistPayload>({
      query: (payload) => {
        const formData = new FormData()
        formData.append('name', payload.name)
        formData.append('username', payload.username)
        formData.append('password', payload.password)
        const departmentIds =
          payload.department_ids && payload.department_ids.length > 0
            ? payload.department_ids
            : payload.department_id
              ? [payload.department_id]
              : []
        departmentIds.forEach((departmentId) => {
          formData.append('department_ids[]', departmentId)
        })
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

    updateReceptionist: builder.mutation<
      void,
      { receptionistId: string; payload: UpdateReceptionistPayload }
    >({
      query: ({ receptionistId, payload }) => {
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
        if (payload.department_ids !== undefined) {
          payload.department_ids.forEach((departmentId) => {
            formData.append('department_ids[]', departmentId)
          })
        }
        if (payload.contact_number !== undefined) {
          formData.append('contact_number', payload.contact_number)
        }
        if (payload.shift !== undefined) {
          formData.append('shift', payload.shift)
        }
        if (payload.description !== undefined) {
          formData.append('description', payload.description)
        }
        if (payload.image !== undefined) {
          formData.append('image', payload.image)
        }

        return {
          url: `/receptionists/${receptionistId}`,
          method: 'PATCH',
          body: formData,
        }
      },
      invalidatesTags: [{ type: 'Receptionist', id: 'LIST' }],
    }),

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
  useUpdateReceptionistMutation,
  useGetReceptionistsQuery,
  useDeleteReceptionistMutation,
} = receptionistApi
