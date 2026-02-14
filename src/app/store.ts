import { configureStore } from '@reduxjs/toolkit'
import authReducer from '@/features/auth/authSlice'
import departmentReducer from '@/features/department/departmentSlice'
import { authApi } from '@/features/auth/authApi'
import { doctorsApi } from '@/features/doctors/doctorsApi'
import { departmentApi } from '@/features/department/departmentApi'
import { receptionistApi } from '@/features/receptionist/receptionistApi'
import { appointmentApi } from '@/features/appointment/appointmentApiSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    department: departmentReducer,
    [authApi.reducerPath]: authApi.reducer,
    [doctorsApi.reducerPath]: doctorsApi.reducer,
    [departmentApi.reducerPath]: departmentApi.reducer,
    [receptionistApi.reducerPath]: receptionistApi.reducer,
    [appointmentApi.reducerPath]: appointmentApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware,
      doctorsApi.middleware,
      departmentApi.middleware,
      receptionistApi.middleware,
      appointmentApi.middleware,
    ),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
