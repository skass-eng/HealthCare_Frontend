'use client'

import { PlusIcon } from '@heroicons/react/24/outline'
import { useAppStore } from '@/hooks/useAppStore';

interface FloatingActionButtonProps {
  onClick: () => void
  isVisible?: boolean
}

export default function FloatingActionButton({ onClick, isVisible = true }: FloatingActionButtonProps) {
  const { actions } = useAppStore();
  if (!isVisible) return null

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Bouton principal flottant */}
      <button
        onClick={() => actions.openPlaintePanel()}
        className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white w-16 h-16 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-110 flex items-center justify-center group"
        title="Créer une nouvelle plainte"
      >
        <PlusIcon className="w-8 h-8 group-hover:rotate-90 transition-transform duration-300" />
      </button>
      
      {/* Effet de pulsation */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full animate-ping opacity-20"></div>
      
      {/* Indicateur de texte */}
      <div className="absolute right-20 top-1/2 transform -translate-y-1/2 bg-white/95 backdrop-blur-sm text-slate-800 px-3 py-2 rounded-lg shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <span className="text-sm font-medium">Nouvelle Plainte</span>
        <div className="absolute left-full top-1/2 transform -translate-y-1/2 w-0 h-0 border-l-4 border-l-white/95 border-t-4 border-t-transparent border-b-4 border-b-transparent"></div>
      </div>
    </div>
  )
} 