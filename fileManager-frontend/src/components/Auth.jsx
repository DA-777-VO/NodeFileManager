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
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <div className="auth-logo">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="logo-icon">
              <path d="M12 2L4 6V12C4 15.31 6.69 20.23 12 22C17.31 20.23 20 15.31 20 12V6L12 2Z"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 className="auth-title">{isLogin ? 'Вход в систему' : 'Создание аккаунта'}</h1>
          <p className="auth-description">
            {isLogin
              ? 'Введите свои данные для доступа к личному кабинету'
              : 'Заполните форму для создания новой учетной записи'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="username" className="form-label">
              Имя пользователя
            </label>
            <input
              id="username"
              className="form-input"
              type="text"
              placeholder="Введите имя пользователя"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Пароль
            </label>
            <input
              id="password"
              className="form-input"
              type="password"
              placeholder="Введите пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="submit-button">
            {isLogin ? 'Войти' : 'Зарегистрироваться'}
          </button>
        </form>

        <div className="auth-footer">
          {isLogin ? (
            <p className="auth-switch-text">
              Нет учетной записи?
              <Link to="/register" className="auth-link">
                Создать аккаунт
              </Link>
            </p>
          ) : (
            <p className="auth-switch-text">
              Уже есть аккаунт?
              <Link to="/login" className="auth-link">
                Войти
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default Auth