import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

export type Role = 'admin' | 'doctor' | 'receptionist'

export type AuthState = {
  role: Role | null
}

const initialState: AuthState = {
  role: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setRole(state, action: PayloadAction<Role>) {
      state.role = action.payload
    },
    clearAuth(state) {
      state.role = null
    },
  },
})

export const { setRole, clearAuth } = authSlice.actions
export default authSlice.reducer
