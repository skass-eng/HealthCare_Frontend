'use client'

import { useState, useEffect } from 'react'
import { apiUnified } from '@/lib/api-unified'
import { Statistiques } from '@/types'
import { useAppStore } from '@/store'

interface StatCardProps {
  title: string
  value: string | number
  subtitle: string
  emoji: string
  variant: 'urgent' | 'warning' | 'success' | 'info'
  isLoading?: boolean
  isHighlighted?: boolean
}

function StatCard({ title, value, subtitle, emoji, variant, isLoading = false, isHighlighted = false }: StatCardProps) {
  const variantStyles = {
    urgent: 'stat-card-urgent',
    warning: 'stat-card-warning', 
    success: 'stat-card-success',
    info: 'stat-card-info'
  }

  if (isLoading) {
    return (
      <div className="glass-card p-4 lg:p-6 animate-pulse min-w-0">
        <div className="flex justify-between items-center mb-3">
          <div className="h-4 bg-gradient-to-r from-blue-100 to-purple-100 rounded w-20 lg:w-24"></div>
          <div className="h-6 w-6 bg-gradient-to-r from-blue-200 to-purple-200 rounded flex-shrink-0"></div>
        </div>
        <div className="h-8 bg-gradient-to-r from-blue-200 to-purple-200 rounded w-16 mb-1"></div>
        <div className="h-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded w-20"></div>
      </div>
    )
  }

  return (
    <div className={`glass-card p-4 lg:p-6 min-w-0 transition-all duration-300 ${isHighlighted ? 'ring-2 ring-red-500 shadow-lg' : ''}`}>
      <div className="flex justify-between items-center mb-3">
        <span className="text-slate-600 text-xs lg:text-sm font-medium truncate">{title}</span>
        <span className={`text-xl lg:text-2xl ${variantStyles[variant]} flex-shrink-0 ${isHighlighted ? 'animate-pulse' : ''}`}>{emoji}</span>
      </div>
      <div className={`text-xl lg:text-2xl font-bold mb-1 ${variantStyles[variant]} truncate`}>
        {value}
      </div>
      <p className="text-slate-600 text-xs truncate">{subtitle}</p>
    </div>
  )
}

export default function StatsGrid() {
  const { statistiques, loading } = useAppStore()

  // Utiliser les données du store
  const stats = statistiques

  if (loading.stats && !stats) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 lg:gap-5 min-w-0">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="glass-card p-4 lg:p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-8 bg-gray-200 rounded mb-1"></div>
            <div className="h-3 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    )
  }

  // Utiliser les propriétés du type Statistiques du backend
  const overdueComplaints = stats?.plaintes_en_retard || 0

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 lg:gap-5 min-w-0">
      {/* Plaintes en retard - Mise en évidence */}
      <StatCard
        title="Plaintes en retard"
        value={overdueComplaints}
        subtitle={stats?.progression?.plaintes_en_retard || "Délai dépassé"}
        emoji="🚨"
        variant="urgent"
        isLoading={loading.stats}
        isHighlighted={overdueComplaints > 0}
      />
      
      <StatCard
        title="Nouvelles plaintes"
        value={stats?.nouvelles_plaintes || 0}
        subtitle={stats?.progression?.nouvelles_plaintes || "+0 depuis hier"}
        emoji="📝"
        variant="info"
        isLoading={loading.stats}
      />
      
      <StatCard
        title="En cours"
        value={stats?.en_cours_traitement || 0}
        subtitle={stats?.progression?.en_cours_traitement || "Délai moyen: 0j"}
        emoji="🟡"
        variant="warning"
        isLoading={loading.stats}
      />
      
      <StatCard
        title="Traitées ce mois"
        value={stats?.traitees_ce_mois || 0}
        subtitle={stats?.progression?.traitees_ce_mois || "Total: 0 plaintes"}
        emoji="🟢"
        variant="success"
        isLoading={loading.stats}
      />
      
      <StatCard
        title="Satisfaction"
        value={stats?.satisfaction_moyenne ? `${stats.satisfaction_moyenne.toFixed(1)}/5` : '0/5'}
        subtitle={stats?.progression?.satisfaction_moyenne || "0% IA approuvée"}
        emoji="⭐"
        variant="info"
        isLoading={loading.stats}
      />
    </div>
  )
} 