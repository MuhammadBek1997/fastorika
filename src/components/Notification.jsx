import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import './Notification.css'

const NotificationContext = createContext()

let notifyGlobal = null

export const useNotification = () => {
  const context = useContext(NotificationContext)
  if (context) return context
  // Fallback for usage outside provider (e.g. Context.jsx initialization)
  return { success: notifyGlobal?.success || (() => {}), error: notifyGlobal?.error || (() => {}), info: notifyGlobal?.info || (() => {}) }
}

// For Context.jsx where hooks can't always be used directly
export const getNotify = () => notifyGlobal

const icons = {
  success: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M10 0C4.48 0 0 4.48 0 10s4.48 10 10 10 10-4.48 10-10S15.52 0 10 0zm-1 15l-5-5 1.41-1.41L9 12.17l7.59-7.59L18 6l-9 9z" fill="currentColor"/>
    </svg>
  ),
  error: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M10 0C4.48 0 0 4.48 0 10s4.48 10 10 10 10-4.48 10-10S15.52 0 10 0zm1 15H9v-2h2v2zm0-4H9V5h2v6z" fill="currentColor"/>
    </svg>
  ),
  info: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M10 0C4.48 0 0 4.48 0 10s4.48 10 10 10 10-4.48 10-10S15.52 0 10 0zm1 15H9V9h2v6zm0-8H9V5h2v2z" fill="currentColor"/>
    </svg>
  )
}

let idCounter = 0

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([])

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, exiting: true } : n))
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id))
    }, 300)
  }, [])

  const addNotification = useCallback((type, message) => {
    const id = ++idCounter
    setNotifications(prev => [...prev, { id, type, message, exiting: false }])
    setTimeout(() => removeNotification(id), 3000)
    return id
  }, [removeNotification])

  const notify = {
    success: useCallback((msg) => addNotification('success', msg), [addNotification]),
    error: useCallback((msg) => addNotification('error', msg), [addNotification]),
    info: useCallback((msg) => addNotification('info', msg), [addNotification])
  }

  useEffect(() => {
    notifyGlobal = notify
    return () => { notifyGlobal = null }
  }, [notify])

  return (
    <NotificationContext.Provider value={notify}>
      {children}
      <div className="notification-container">
        {notifications.map((n) => (
          <div key={n.id} className={`notification notification-${n.type}${n.exiting ? ' notification-exit' : ''}`}>
            <div className="notification-icon">{icons[n.type]}</div>
            <span className="notification-message">{n.message}</span>
            <button className="notification-close" onClick={() => removeNotification(n.id)}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  )
}
