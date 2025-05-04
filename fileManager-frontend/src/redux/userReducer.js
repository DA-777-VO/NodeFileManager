import { createSlice } from '@reduxjs/toolkit'
import fileService from '../services/files.js'
import loginService from '../services/login'
import { showNotification } from './notificationReducer'

const userSlice = createSlice({
  name: 'user',
  initialState: null,
  reducers: {
    initUser(state, action) {
      return action.payload
    },
    loginUser(state, action) {
      return action.payload
    },
    logoutUser(state, action) {
      return null
    },
  },
})

export const { initUser, logoutUser, loginUser } = userSlice.actions

export const initializeUser = () => {
  return async (dispatch) => {
    const loggedUserJSON = window.localStorage.getItem('loggedBloglistUser')
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON)
      dispatch(initUser(user))
      fileService.setToken(user.token)
      console.log('user: ', user, ' initialized')
    }
  }
}

export const loginU = (username, password) => {
  return async (dispatch) => {
    try {
      const user = await loginService.login({
        username,
        password,
      })

      window.localStorage.setItem('loggedBloglistUser', JSON.stringify(user))
      fileService.setToken(user.token)
      dispatch(loginUser(user))
      dispatch(showNotification({ type: 'success', message: 'Login successful' }, 5))
      return true
    } catch (error) {
      dispatch(showNotification({ type: 'error', message: 'Login failed: Invalid credentials' }, 5))
      return false
    }
  }
}

export const logoutU = () => {
  return async (dispatch) => {
    window.localStorage.removeItem('loggedBloglistUser')
    dispatch(logoutUser())
    dispatch(showNotification({ type: 'info', message: 'Logged out successfully' }, 3))
  }
}

export default userSlice.reducer