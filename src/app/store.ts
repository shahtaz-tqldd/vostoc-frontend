import { configureStore } from '@reduxjs/toolkit'
import authReducer from '@/features/auth/authSlice'
import { authApi } from '@/features/auth/authApi'
import { doctorsApi } from '@/features/doctors/doctorsApi'
import { departmentApi } from '@/features/department/departmentApi'
import { receptionistApi } from '@/features/receptionist/receptionistApi'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [authApi.reducerPath]: authApi.reducer,
    [doctorsApi.reducerPath]: doctorsApi.reducer,
    [departmentApi.reducerPath]: departmentApi.reducer,
    [receptionistApi.reducerPath]: receptionistApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware,
      doctorsApi.middleware,
      departmentApi.middleware,
      receptionistApi.middleware,
    ),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
