'use client'

import { useEffect, useState } from 'react'
import { CheckCircleIcon, XCircleIcon, XMarkIcon } from '@heroicons/react/24/outline'

interface NotificationProps {
  type: 'success' | 'error'
  message: string
  onClose: () => void
  duration?: number
}

export default function Notification({ type, message, onClose, duration = 5000 }: NotificationProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(onClose, 300) // Attendre l'animation de sortie
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(onClose, 300)
  }

  const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500'
  const borderColor = type === 'success' ? 'border-green-600' : 'border-red-600'
  const Icon = type === 'success' ? CheckCircleIcon : XCircleIcon

  return (
    <div className={`fixed top-4 right-4 z-50 transform transition-all duration-300 ${
      isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
    }`}>
      <div className={`${bgColor} text-white px-6 py-4 rounded-lg shadow-lg border ${borderColor} max-w-sm`}>
        <div className="flex items-center gap-3">
          <Icon className="w-6 h-6 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-medium">
              {type === 'success' ? 'Succès !' : 'Erreur !'}
            </p>
            <p className="text-sm opacity-90">{message}</p>
          </div>
          <button
            onClick={handleClose}
            className="text-white/80 hover:text-white transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
} 