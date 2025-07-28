'use client'

import { useAppStore } from '@/store'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/solid'

export default function GlobalNotifications() {
  const { 
    notifications: { items },
    actions: { removeNotification }
  } = useAppStore()

  if (items.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-[9999] space-y-2">
      {items.map((notification) => (
        <div
          key={notification.id}
          className={`
            flex items-center gap-3 p-4 rounded-lg shadow-lg min-w-[300px] max-w-[400px]
            transform transition-all duration-300 ease-out
            ${notification.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-800' 
              : 'bg-red-50 border border-red-200 text-red-800'
            }
          `}
        >
          {/* Icon */}
          <div className="flex-shrink-0">
            {notification.type === 'success' ? (
              <CheckCircleIcon className="w-5 h-5 text-green-600" />
            ) : (
              <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
            )}
          </div>

          {/* Message */}
          <p className="flex-1 text-sm font-medium">
            {notification.message}
          </p>

          {/* Close button */}
          <button
            onClick={() => removeNotification(notification.id)}
            className={`
              flex-shrink-0 p-1 rounded transition-colors
              ${notification.type === 'success' 
                ? 'hover:bg-green-100 text-green-600' 
                : 'hover:bg-red-100 text-red-600'
              }
            `}
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  )
} 