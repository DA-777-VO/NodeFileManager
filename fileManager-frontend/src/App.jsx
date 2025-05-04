import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Auth from './components/Auth.jsx'
import FileUpload from './components/FileUpload.jsx'
import PrivateRoute from './components/PrivateRoute.jsx'
import Notification from './components/Notification'
import { useDispatch } from 'react-redux'
import { initializeUser } from './redux/userReducer'


function App() {

  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(initializeUser())
  }, [dispatch])

  return (
    <div>
      <Notification />

      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />

          <Route path="/login" element={<Auth isLogin />} />
          <Route path="/register" element={<Auth />} />
          <Route path="/dashboard" element={
            <PrivateRoute>
              <FileUpload />
            </PrivateRoute>
          } />
        </Routes>
      </Router>
    </div>
  )
}

export default App