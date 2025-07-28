'use client'

import { useState, useCallback } from 'react'

interface NotificationData {
  id: string
  type: 'success' | 'error'
  message: string
  duration?: number
}

export const useNotification = () => {
  const [notifications, setNotifications] = useState<NotificationData[]>([])

  const showNotification = useCallback((type: 'success' | 'error', message: string, duration = 5000) => {
    const id = Date.now().toString()
    const newNotification: NotificationData = { id, type, message, duration }
    
    setNotifications(prev => [...prev, newNotification])
    
    // Auto-remove after duration
    setTimeout(() => {
      removeNotification(id)
    }, duration)
  }, [])

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id))
  }, [])

  const showSuccess = useCallback((message: string, duration?: number) => {
    showNotification('success', message, duration)
  }, [showNotification])

  const showError = useCallback((message: string, duration?: number) => {
    showNotification('error', message, duration)
  }, [showNotification])

  return {
    notifications,
    showNotification,
    showSuccess,
    showError,
    removeNotification
  }
} 