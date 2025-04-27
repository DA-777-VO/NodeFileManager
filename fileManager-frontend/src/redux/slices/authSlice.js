import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  username: null,
  token: null
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login(state, action) {
      state.username = action.payload.username
      state.token = action.payload.token
    },
    logout(state) {
      return initialState
    }
  }
})

export const { login, logout } = authSlice.actions
export default authSlice.reducer