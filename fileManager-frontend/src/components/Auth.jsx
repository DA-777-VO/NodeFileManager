import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import './Auth.css'

const Auth = ({ isLogin, onSubmit }) => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()

    const success = await onSubmit(username, password)

    if (success && isLogin) {
      navigate('/dashboard')
    } else if (success && !isLogin) {
      navigate('/login')
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