import { useSelector } from 'react-redux'
import './Notification.css'

const Notification = () => {
  const notification = useSelector(state => state.notification)

  if (!notification) return null

  const { type, message } = notification

  return (
    <div id={type} className={`notification notification-${type}`}>
      <div className="notification-content">
        {message}
      </div>
    </div>
  )
}

export default Notification