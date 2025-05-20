import ReactDOM from 'react-dom/client'
import App from './App'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import fileReducer from './redux/fileReducer'
import notificationReducer from './redux/notificationReducer'
import userReducer from './redux/userReducer'
import connectionMonitor from './services/connectionMonitor'

const store = configureStore({
  reducer: {
    file: fileReducer,
    notification: notificationReducer,
    user: userReducer
  }
})

connectionMonitor.setupConnectionMonitoring()

ReactDOM.createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <App />
  </Provider>
)
//
export { store }