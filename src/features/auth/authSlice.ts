import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { MeResponse } from './authApi'

export type Role = 'admin' | 'doctor' | 'receptionist'

export type AuthState = {
  role: Role | null
  me: MeResponse | null
}

const initialState: AuthState = {
  role: null,
  me: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setRole(state, action: PayloadAction<Role>) {
      state.role = action.payload
    },
    setMe(state, action: PayloadAction<MeResponse>) {
      state.me = action.payload
    },
    clearAuth(state) {
      state.role = null
      state.me = null
    },
  },
})

export const { setRole, setMe, clearAuth } = authSlice.actions
export default authSlice.reducer
