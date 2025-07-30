'use client'

import React from 'react'
import { useAppStore } from '@/store'
import { LightBulbIcon, ChartBarIcon, BoltIcon, CpuChipIcon, ArrowTrendingUpIcon, DocumentTextIcon } from '@heroicons/react/24/outline'

export default function AmeliorationsPage() {
  const { suggestions, loading, actions } = useAppStore()
  
  const aiStats = {
    totalSuggestions: suggestions.total_suggestions || 0,
    totalServices: suggestions.total_services || 0,
    lastAnalysis: new Date().toLocaleDateString('fr-FR')
  }

  const handleViewFullReport = () => {
    // Navigation vers le rapport complet
    console.log('Voir le rapport complet')
  }

  const handleLaunchAIAnalysis = () => {
    // Lancer l'analyse IA
    console.log('Lancer analyse IA')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50">
      {/* Header Section */}
      <div className="relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-teal-600/10 to-emerald-600/10 blur-3xl"></div>
        <div className="absolute top-0 left-1/4 w-48 h-48 bg-blue-300/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-teal-300/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        
        <div className="relative z-10 container mx-auto px-6 py-6">
          
          {/* Header Content */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-600 to-teal-600 rounded-2xl shadow-xl mb-3">
              <CpuChipIcon className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-slate-800 via-blue-700 to-teal-700 bg-clip-text text-transparent mb-2">
              IA & Optimisation
            </h1>
            <h2 className="text-lg md:text-xl font-semibold text-slate-700 mb-2">
              Analyse intelligente et suggestions d'amélioration par service
            </h2>
            <p className="text-sm text-slate-600 max-w-xl mx-auto">
              Dernière analyse IA : {aiStats.lastAnalysis}
            </p>
          </div>

          {/* Stats Cards - Très compactes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6 max-w-lg mx-auto">
            {[
              { icon: CpuChipIcon, number: aiStats.totalServices.toString(), label: 'Services analysés', color: 'from-blue-500 to-blue-600' },
              { icon: LightBulbIcon, number: aiStats.totalSuggestions.toString(), label: 'Suggestions générées', color: 'from-teal-500 to-teal-600' }
            ].map((stat, index) => (
              <div key={index} className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-teal-600/10 rounded-xl blur-lg group-hover:blur-xl transition-all duration-500"></div>
                <div className="relative bg-white/90 backdrop-blur-md rounded-xl p-3 shadow-lg border border-white/40 hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1">
                  <div className="flex items-center gap-2">
                    <div className={`inline-flex items-center justify-center w-8 h-8 bg-gradient-to-r ${stat.color} rounded-lg shadow-md`}>
                      <stat.icon className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <div className="text-lg font-bold text-slate-800">{stat.number}</div>
                      <div className="text-xs text-slate-600">{stat.label}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Section */}
      <div className="container mx-auto px-6 py-6">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-teal-600/10 to-emerald-600/10 rounded-2xl blur-lg"></div>
          <div className="relative bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/40">
            
            {/* Navigation Tabs */}
            <div className="flex flex-wrap gap-2 mb-4 border-b border-slate-200">
              {[
                { name: 'Améliorations', icon: LightBulbIcon, active: true },
                { name: 'Suggestions IA', icon: CpuChipIcon, active: false },
                { name: 'Tendances', icon: ArrowTrendingUpIcon, active: false }
              ].map((tab, index) => (
                <button
                  key={index}
                  className={`flex items-center gap-1 px-3 py-1 rounded-lg font-semibold transition-all duration-300 ${
                    tab.active
                      ? 'bg-gradient-to-r from-blue-600 to-teal-600 text-white shadow-md'
                      : 'text-slate-600 hover:text-slate-800 hover:bg-slate-100'
                  }`}
                >
                  <tab.icon className="w-3 h-3" />
                  {tab.name}
                </button>
              ))}
            </div>

            {/* Empty State or Content */}
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-slate-200 to-slate-300 rounded-xl mb-3">
                <DocumentTextIcon className="w-6 h-6 text-slate-500" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">
                Aucune donnée d'amélioration disponible
              </h3>
              <p className="text-sm text-slate-600 max-w-sm mx-auto">
                Les données apparaîtront après traitement des plaintes
              </p>
            </div>

            {/* AI Analytics Banner */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-4 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="inline-flex items-center justify-center w-8 h-8 bg-white/20 rounded-lg">
                  <CpuChipIcon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">IA Analytics</h4>
                  <p className="text-white/80 text-xs">Analyse en temps réel</p>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2">
                <p className="text-white font-medium text-xs">
                  Tendance détectée : augmentation des plaintes liées aux temps d'attente (+15% ce mois)
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <button 
                onClick={handleViewFullReport}
                className="flex items-center justify-center gap-1 bg-gradient-to-r from-blue-600 to-teal-600 text-white px-4 py-2 rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
              >
                <ChartBarIcon className="w-3 h-3" />
                Voir le rapport complet
              </button>
              <button 
                onClick={handleLaunchAIAnalysis}
                className="flex items-center justify-center gap-1 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-4 py-2 rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
              >
                <BoltIcon className="w-3 h-3" />
                Lancer analyse IA
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 