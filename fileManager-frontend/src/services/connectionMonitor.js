import axios from 'axios'
import { store } from '../main'
import { showNotification } from '../redux/notificationReducer'

let isOnline = true

const checkServerConnection = async () => {
  try {
    await axios.get('http://localhost:5000/health', { timeout: 5000 })
    if (!isOnline) {
      isOnline = true
      store.dispatch(showNotification({
        type: 'success',
        message: 'Connection to server restored!'
      }, 5))
    }

    return true
  } catch (error) {
    if (isOnline) {
      isOnline = false
      store.dispatch(showNotification({
        type: 'error',
        message: 'Connection to server lost. Please check your internet connection.'
      }, 0))
    }

    return false
  }
}

const setupConnectionMonitoring = () => {
  axios.interceptors.response.use(
    response => response,
    error => {
      if (error.message === 'Network Error' || !error.response) {
        isOnline = false
        store.dispatch(showNotification({
          type: 'error',
          message: 'Connection to server lost. Please check your internet connection.'
        }, 0))
      }
      return Promise.reject(error)
    }
  )
  setInterval(checkServerConnection, 5000) // Check every 30 seconds

  window.addEventListener('online', () => checkServerConnection())
  window.addEventListener('offline', () => {
    isOnline = false
    store.dispatch(showNotification({
      type: 'error',
      message: 'Your device is offline. Please check your internet connection.'
    }, 0))
  })
}

export default { setupConnectionMonitoring, checkServerConnection, isOnline }