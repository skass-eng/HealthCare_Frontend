'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowDownTrayIcon, PlusIcon, ExclamationTriangleIcon, SparklesIcon, ChartPieIcon } from '@heroicons/react/24/outline'
import { apiUnified } from '@/lib/api-unified'
import { useAppStore } from '@/hooks/useAppStore'
import ExportModal from './ExportModal'

interface DashboardHeaderProps {
  onOpenUpload?: () => void
}

export default function DashboardHeader({ onOpenUpload }: DashboardHeaderProps) {
  const router = useRouter()
  const { statistiques, loading, actions } = useAppStore()

  const openGlobalServiceSelector = () => {
    actions.setShowGlobalServiceSelector(true)
  }

  // Utiliser les données du store au lieu de faire des appels API séparés
  const overdueCount = statistiques?.plaintes_en_retard || 0

  return (
    <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-white text-xl lg:text-3xl font-bold truncate">
            Dashboard Plaintes & Réclamations
          </h1>
          {overdueCount > 0 && !loading && (
            <div className="flex items-center gap-2 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold alert-badge">
              <ExclamationTriangleIcon className="w-4 h-4" />
              <span>{overdueCount} en retard</span>
            </div>
          )}
        </div>
        <p className="text-white/80 text-xs lg:text-sm truncate">
          Gestion intelligente alimentée par IA
        </p>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-2 lg:gap-3 w-full lg:w-auto">
        {/* Bouton Rafraîchir */}
        <button
          onClick={() => actions.fetchStats()}
          disabled={loading.stats}
          className="btn-secondary flex items-center justify-center gap-2 text-sm lg:text-base bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="text-lg">
            {loading.stats ? '⏳' : '🔄'}
          </span>
          <span className="truncate">Rafraîchir</span>
        </button>

        <button 
          onClick={() => router.push('/analytics')}
          className="btn-secondary flex items-center justify-center gap-2 text-sm lg:text-base bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
        >
          <ChartPieIcon className="w-4 h-4 flex-shrink-0" />
          <span className="truncate">Analytics</span>
        </button>
        <button 
          onClick={() => router.push('/analytics-v2')}
          className="btn-secondary flex items-center justify-center gap-2 text-sm lg:text-base bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 relative"
        >
          <SparklesIcon className="w-4 h-4 flex-shrink-0" />
          <span className="truncate">Analytics V2</span>
          <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs px-1 rounded-full">NEW</span>
        </button>
        <button 
          onClick={openGlobalServiceSelector}
          className="btn-secondary flex items-center justify-center gap-2 text-sm lg:text-base bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
        >
          <SparklesIcon className="w-4 h-4 flex-shrink-0" />
          <span className="truncate">Analyse IA</span>
        </button>
        <button 
          onClick={() => actions.openExportModal()}
          className="btn-secondary flex items-center justify-center gap-2 text-sm lg:text-base"
        >
          <ArrowDownTrayIcon className="w-4 h-4 flex-shrink-0" />
          <span className="truncate">Exporter</span>
        </button>
        <button 
          onClick={() => actions.openPlainteModal()}
          className="btn-primary flex items-center justify-center gap-2 text-sm lg:text-base"
        >
          <PlusIcon className="w-4 h-4 flex-shrink-0" />
          <span className="truncate">Nouvelle plainte</span>
        </button>
      </div>
    </header>
  )
} 