import axios from 'axios'
import { store } from '../main'
import { showNotification } from '../redux/notificationReducer'

// Track connection status
let isOnline = true

// Function to check if server is reachable
const checkServerConnection = async () => {
  try {
    await axios.get('http://localhost:5000/health', { timeout: 5000 })

    // If we were offline and now we're back online
    if (!isOnline) {
      isOnline = true
      store.dispatch(showNotification({
        type: 'success',
        message: 'Connection to server restored!'
      }, 5))
    }

    return true
  } catch (error) {
    // If we were online and now we're offline
    if (isOnline) {
      isOnline = false
      store.dispatch(showNotification({
        type: 'error',
        message: 'Connection to server lost. Please check your internet connection.'
      }, 0)) // 0 means don't auto-clear this notification
    }

    return false
  }
}

// Set up axios interceptors to detect connection issues
const setupConnectionMonitoring = () => {
  // Response interceptor
  axios.interceptors.response.use(
    response => response,
    error => {
      // Network errors indicate connection issues
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

  // Start periodic connection checking
  setInterval(checkServerConnection, 5000) // Check every 30 seconds

  // Also check connection on window online/offline events
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