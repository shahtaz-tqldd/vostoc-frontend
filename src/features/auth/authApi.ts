import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { getCookie } from '@/lib/cookie'

export type LoginPayload = {
  email?: string
  phone?: string
  username?: string
  password: string
}

export type LoginResponse = {
  token: string
}

export type MeResponse = {
  id: string
  username: string
  email: string | null
  phone: string | null
  name: string
  role: string
}

const baseUrl = import.meta.env.VITE_API_BASE_URL


export const authApi = createApi({
  reducerPath: 'authApi',
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
    login: builder.mutation<LoginResponse, LoginPayload>({
      query: (body) => ({
        url: '/auth/login',
        method: 'POST',
        body,
      }),
    }),
    me: builder.query<MeResponse, void>({
      query: () => '/users/me',
    }),
  }),
})

export const { useLoginMutation, useMeQuery, useLazyMeQuery } = authApi
