import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { getCookie } from '@/lib/cookie'
import type {
  CreateDepartmentPayload,
  Department,
  DepartmentDetails,
} from './type'

const baseUrl = import.meta.env.VITE_API_BASE_URL

export const departmentApi = createApi({
  reducerPath: 'departmentApi',
  tagTypes: ['Department'],
  baseQuery: fetchBaseQuery({
    baseUrl: baseUrl,
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
  }),
})

export const {
  useCreateDepartmentMutation,
  useGetDepartmentsQuery,
  useDeleteDepartmentMutation,
} = departmentApi
