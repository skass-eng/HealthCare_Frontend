'use client'

import { useEffect } from 'react'
import { useAppStore } from '@/store'
import SuggestionsPanel from '@/components/Dashboard/SuggestionsPanel'


export default function AmeliorationsPage() {
  const { suggestions, loading, actions } = useAppStore()
  
  const aiStats = {
    totalSuggestions: suggestions.total_suggestions || 0,
    totalServices: suggestions.total_services || 0,
    lastAnalysis: new Date().toLocaleDateString('fr-FR') // Ceci devrait idéalement venir du backend
  }

  // Les suggestions sont déjà chargées par le StoreProvider
  // Pas besoin de les recharger ici

  return (
    <div className="space-y-4 lg:space-y-8 min-w-0">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-white text-xl lg:text-3xl font-bold truncate">
              IA & Optimisation
            </h1>
            {!loading.suggestions && aiStats.totalSuggestions > 0 && (
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium">
                <span className="text-lg">🤖</span>
                <span>{aiStats.totalSuggestions} suggestions IA</span>
              </div>
            )}
          </div>
          <p className="text-white/80 text-xs lg:text-sm truncate">
            Analyse intelligente et suggestions d'amélioration par service
          </p>
          {!loading.suggestions && aiStats.lastAnalysis && (
            <p className="text-white/60 text-xs mt-1">
              Dernière analyse IA : {aiStats.lastAnalysis}
            </p>
          )}
        </div>
        
        {/* Stats rapides */}
        {!loading.suggestions && (
          <div className="flex gap-3">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 text-center">
              <div className="text-white font-bold text-lg">{aiStats.totalServices}</div>
              <div className="text-white/80 text-xs">Services analysés</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 text-center">
              <div className="text-white font-bold text-lg">{aiStats.totalSuggestions}</div>
              <div className="text-white/80 text-xs">Suggestions générées</div>
            </div>
          </div>
        )}
      </div>
      
              {/* Suggestions Panel avec tous les onglets */}
      <SuggestionsPanel />
    </div>
  )
} 