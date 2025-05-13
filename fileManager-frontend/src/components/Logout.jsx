import React from 'react'
import './Logout.css'

const Logout = ({ username, onLogout }) => {
  return (
    <div className="logout-container">
      <p>{username} logged-in <button onClick={onLogout}>logout</button></p>
    </div>
  )
}

export default Logout