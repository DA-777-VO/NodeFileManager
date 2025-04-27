import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { login } from '../redux/slices/authSlice'
import { useNavigate, Link } from 'react-router-dom'
import './Auth.css'

const Auth = ({ isLogin }) => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    const endpoint = isLogin ? '/login' : '/register'

    try {
      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })

      const data = await response.json()
      if (response.ok) {
        if (isLogin) {
          dispatch(login({ username, token: data.token }))
          localStorage.setItem('jwtToken', data.token)
          navigate('/dashboard')
        } else {
          navigate('/login')
        }
      }
    } catch (error) {
      console.error('Auth error:', error)
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
              Don't have an account?{' '}
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