'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Cog8ToothIcon, XMarkIcon, ArrowRightIcon } from '@heroicons/react/24/outline'

export default function AdministrationBanner() {
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) return null

  return (
    <div className="relative bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 rounded-xl p-4 lg:p-6 mb-6 overflow-hidden">
      {/* Motif de fond */}
      <div className="absolute inset-0 bg-white/10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)',
          backgroundSize: '20px 20px'
        }}></div>
      </div>
      
      {/* Contenu */}
      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Cog8ToothIcon className="w-6 h-6 text-white" />
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-white font-bold text-lg">
                Administration
              </h3>
              <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                DISPONIBLE
              </span>
            </div>
            <p className="text-white/90 text-sm">
              Gérez les organisations, services et configurations du système avec l'interface d'administration avancée.
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 ml-4">
          <Link 
            href="/analytics-v2"
            className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-all duration-200 hover:scale-105"
          >
            <span>Découvrir</span>
            <ArrowRightIcon className="w-4 h-4" />
          </Link>
          
          <button
            onClick={() => setIsVisible(false)}
            className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-lg transition-all duration-200"
            title="Fermer"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {/* Effet de brillance */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-1/3 h-full bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full animate-[shimmer_3s_ease-in-out_infinite]"></div>
      </div>
    </div>
  )
} 