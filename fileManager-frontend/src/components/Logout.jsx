import React, { useState, useRef, useEffect } from 'react'
import './Logout.css'

const Logout = ({ username, onLogout }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <div className="profile-container" ref={dropdownRef}>
      <button
        className="profile-button"
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        aria-label="User profile"
      >
        <div className="user-avatar">
          {username ? username.charAt(0).toUpperCase() : 'U'}
        </div>
      </button>

      {isDropdownOpen && (
        <div className="profile-dropdown">
          <div className="dropdown-header">
            <div className="user-avatar dropdown-avatar">
              {username ? username.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="dropdown-user-info">
              <span className="dropdown-username">{username}</span>
              <span className="dropdown-email">{username}@example.com</span>
            </div>
          </div>

          <div className="dropdown-divider"></div>

          <button className="dropdown-item" onClick={() => alert('Profile settings would open here')}>
            <span className="dropdown-item-icon">⚙️</span>
            <span>Settings</span>
          </button>

          <button className="dropdown-item logout-item" onClick={onLogout}>
            <span className="dropdown-item-icon">🚪</span>
            <span>Sign Out</span>
          </button>
        </div>
      )}
    </div>
  )
}

export default Logout
