import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate, Link } from 'react-router-dom'
import './Auth.css'
import { showNotification } from '../redux/notificationReducer.js'
import { loginU } from '../redux/userReducer.js'
import loginService from '../services/login'

const Auth = ({ isLogin }) => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()


    if (isLogin) {
      const success = await dispatch(loginU(username, password))
      if (success) {
        navigate('/dashboard')
      }
    } else {
      // Registration logic
      try {
        const response = await loginService.register({ username, password })
        const data = await response.json()

        if (response.ok) {
          dispatch(showNotification({ type: 'success', message: 'Registration successful! You can now log in.' }, 5))
          navigate('/login')
        } else {
          dispatch(showNotification({ type: 'error', message: data.error || 'Registration failed' }, 5))
        }
      } catch (error) {
        console.error('Registration error:', error)
        dispatch(showNotification({ type: 'error', message: 'Registration failed. Please try again.' }, 5))
      }
    }
  }

  return (
    <div className="auth-container">
      <form onSubmit={handleSubmit}>
        <h2>{isLogin ? 'Login' : 'Register'}</h2>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">{isLogin ? 'Login' : 'Register'}</button>

        {/* Добавляем ссылку для перехода */}
        <div className="auth-switch">
          {isLogin ? (
            <span>
              Dont have an account?{' '}
              <Link to="/register">Register here</Link>
            </span>
          ) : (
            <span>
              Already have an account?{' '}
              <Link to="/login">Login here</Link>
            </span>
          )}
        </div>
      </form>
    </div>
  )
}

export default Auth