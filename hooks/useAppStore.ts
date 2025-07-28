'use client'

import { useAppStore as useStore } from '@/store'

// Hook personnalisé pour accéder facilement au store
export const useAppStore = () => {
  return useStore()
} 