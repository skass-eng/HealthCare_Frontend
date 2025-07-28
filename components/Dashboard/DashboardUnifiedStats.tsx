'use client'

import React from 'react'

interface DashboardUnifiedStatsProps {
  statistiques: any
  loading: boolean
}

export default function DashboardUnifiedStats({ statistiques, loading }: DashboardUnifiedStatsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/3 mt-2"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!statistiques) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <p className="text-gray-500 text-center">Aucune donnée disponible</p>
      </div>
    )
  }

  const stats = [
    {
      name: 'Nouvelles Plaintes',
      value: statistiques.nouvelles_plaintes,
      change: statistiques.progression?.nouvelles_plaintes || '+0%',
      changeType: 'increase',
      icon: '📋',
      color: 'bg-blue-500'
    },
    {
      name: 'En Attente',
      value: statistiques.plaintes_en_attente,
      change: statistiques.progression?.plaintes_en_attente || '+0%',
      changeType: 'decrease',
      icon: '⏳',
      color: 'bg-yellow-500'
    },
    {
      name: 'En Retard',
      value: statistiques.plaintes_en_retard,
      change: statistiques.progression?.plaintes_en_retard || '+0%',
      changeType: 'decrease',
      icon: '🚨',
      color: 'bg-red-500'
    },
    {
      name: 'En Cours',
      value: statistiques.en_cours_traitement,
      change: statistiques.progression?.en_cours_traitement || '+0%',
      changeType: 'increase',
      icon: '🔄',
      color: 'bg-green-500'
    },
    {
      name: 'Traitées (Mois)',
      value: statistiques.traitees_ce_mois,
      change: statistiques.progression?.traitees_ce_mois || '+0%',
      changeType: 'increase',
      icon: '✅',
      color: 'bg-emerald-500'
    },
    {
      name: 'Satisfaction',
      value: statistiques.satisfaction_moyenne?.toFixed(1) || '0.0',
      change: statistiques.progression?.satisfaction_moyenne || '+0%',
      changeType: 'increase',
      icon: '⭐',
      color: 'bg-purple-500'
    }
  ]

  return (
    <div>
      <h2 className="text-lg font-medium text-gray-900 mb-6">📊 Statistiques Principales</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
            <div className="p-5">
              <div className="flex items-center">
                <div className={`flex-shrink-0 w-8 h-8 rounded-full ${stat.color} flex items-center justify-center text-white text-lg`}>
                  {stat.icon}
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium text-gray-500 truncate">
                    {stat.name}
                  </p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {stat.value}
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <span className={`inline-flex items-baseline px-2.5 py-0.5 rounded-full text-sm font-medium ${
                  stat.changeType === 'increase' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {stat.change}
                </span>
                <span className="ml-2 text-sm text-gray-500">
                  vs mois dernier
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Alertes */}
      {statistiques.alertes && (
        <div className="mt-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">🚨 Alertes</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(statistiques.alertes).map(([key, value]) => {
              if (value) {
                const alertConfig = {
                  'fichiers_en_attente_critique': { name: 'Fichiers en attente critique', icon: '📁', color: 'bg-red-100 text-red-800' },
                  'plaintes_urgentes': { name: 'Plaintes urgentes', icon: '🚨', color: 'bg-orange-100 text-orange-800' },
                  'performance_ia_faible': { name: 'Performance IA faible', icon: '🤖', color: 'bg-yellow-100 text-yellow-800' },
                  'satisfaction_faible': { name: 'Satisfaction faible', icon: '😞', color: 'bg-red-100 text-red-800' }
                }
                
                const config = alertConfig[key as keyof typeof alertConfig]
                if (!config) return null

                return (
                  <div key={key} className={`${config.color} rounded-lg p-4`}>
                    <div className="flex items-center">
                      <span className="text-lg mr-2">{config.icon}</span>
                      <span className="text-sm font-medium">{config.name}</span>
                    </div>
                  </div>
                )
              }
              return null
            })}
          </div>
        </div>
      )}
    </div>
  )
} 