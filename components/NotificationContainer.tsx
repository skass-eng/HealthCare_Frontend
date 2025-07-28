'use client'

import { useAppStore } from '@/store'
import Notification from './Notification'

export default function NotificationContainer() {
  const { notifications, actions } = useAppStore()

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.items.map((notification, index) => (
        <div
          key={notification.id}
          style={{ transform: `translateY(${index * 80}px)` }}
          className="absolute right-0"
        >
          <Notification
            type={notification.type}
            message={notification.message}
            onClose={() => actions.removeNotification(notification.id)}
            duration={notification.duration}
          />
        </div>
      ))}
    </div>
  )
} 