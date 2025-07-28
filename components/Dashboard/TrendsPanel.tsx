'use client'

import { useState, useEffect } from 'react'
import { apiUnified } from '@/lib/api-unified'
import { Statistiques } from '@/types'

interface TrendData {
  period: string
  nouvelles: number
  traitees: number
  satisfaction: number
}

interface ServiceTrend {
  service: string
  count: number
  evolution: number // pourcentage d'évolution
  color: string
}

interface TendancesData {
  periode: string
  nouvelles_trend: Array<{ period: string; count: number }>
  traitees_trend: Array<{ period: string; count: number }>
  satisfaction_trend: Array<{ period: string; avg_satisfaction: number }>
  service_trends: Array<{ service: string; count: number; evolution: number }>
  insights: {
    pic_jour: string
    evolution_satisfaction: string
    service_attention: string
  }
}

export default function TrendsPanel() {
  const [stats, setStats] = useState<Statistiques | null>(null)
  const [tendancesData, setTendancesData] = useState<TendancesData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState<'7j' | '30j' | '90j'>('30j')

  useEffect(() => {
    const fetchTrendsData = async () => {
      try {
        setLoading(true)
        setError(null)
        console.log('🔄 Chargement des tendances pour la période:', selectedPeriod)
        
        const [statsData, tendancesData] = await Promise.all([
          apiUnified.getStats(),
          apiUnified.getTendances(selectedPeriod)
        ])
        
        console.log('📊 Données statistiques reçues:', statsData)
        console.log('📈 Données tendances reçues:', tendancesData)
        
        setStats(statsData)
        setTendancesData(tendancesData)
      } catch (err) {
        console.error('❌ Erreur lors du chargement des tendances:', err)
        setError('Erreur lors du chargement des données')
      } finally {
        setLoading(false)
      }
    }

    fetchTrendsData()
  }, [selectedPeriod])

  // Fonction pour formater les dates
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr)
      if (selectedPeriod === '7j') {
        return date.toLocaleDateString('fr-FR', { weekday: 'short' })
      } else if (selectedPeriod === '30j') {
        return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
      } else {
        return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
      }
    } catch {
      return dateStr
    }
  }

  // Utiliser les vraies données du backend ou des données par défaut
  const trendData: TrendData[] = tendancesData && tendancesData.nouvelles_trend ? 
    tendancesData.nouvelles_trend.map((item, index) => ({
      period: formatDate(item.period),
      nouvelles: item.count,
      traitees: tendancesData.traitees_trend?.[index]?.count || 0,
      satisfaction: tendancesData.satisfaction_trend?.[index]?.avg_satisfaction || 0
    })) : [
      { period: 'Lun', nouvelles: 12, traitees: 8, satisfaction: 4.2 },
      { period: 'Mar', nouvelles: 15, traitees: 12, satisfaction: 4.1 },
      { period: 'Mer', nouvelles: 8, traitees: 10, satisfaction: 4.3 },
      { period: 'Jeu', nouvelles: 18, traitees: 14, satisfaction: 4.0 },
      { period: 'Ven', nouvelles: 22, traitees: 16, satisfaction: 4.4 },
      { period: 'Sam', nouvelles: 10, traitees: 8, satisfaction: 4.5 },
      { period: 'Dim', nouvelles: 6, traitees: 5, satisfaction: 4.6 }
    ]

  const serviceTrends: ServiceTrend[] = tendancesData && tendancesData.service_trends ? 
    tendancesData.service_trends.map(item => ({
      service: item.service,
      count: item.count,
      evolution: item.evolution,
      color: getServiceColor(item.service)
    })) : [
      { service: 'Cardiologie', count: 15, evolution: 12, color: 'bg-red-500' },
      { service: 'Urgences', count: 28, evolution: -5, color: 'bg-orange-500' },
      { service: 'Pédiatrie', count: 22, evolution: 8, color: 'bg-green-500' },
      { service: 'Chirurgie', count: 18, evolution: 15, color: 'bg-blue-500' },
      { service: 'Radiologie', count: 12, evolution: -2, color: 'bg-purple-500' }
    ]

  console.log('📊 Données de tendances transformées:', trendData)
  console.log('📈 Données de service transformées:', serviceTrends)

  // Fonction pour obtenir la couleur d'un service
  function getServiceColor(service: string): string {
    const colorMap: { [key: string]: string } = {
      'Cardiologie': 'bg-red-500',
      'Urgences': 'bg-orange-500',
      'Pédiatrie': 'bg-green-500',
      'Chirurgie': 'bg-blue-500',
      'Radiologie': 'bg-purple-500',
      'Oncologie': 'bg-pink-500',
      'Neurologie': 'bg-indigo-500',
      'Orthopédie': 'bg-teal-500'
    }
    return colorMap[service] || 'bg-gray-500'
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-6 bg-gradient-to-r from-blue-100 to-purple-100 rounded w-1/3 mb-4"></div>
          <div className="h-32 bg-gradient-to-r from-blue-50 to-purple-50 rounded mb-4"></div>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded w-full"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center text-red-500">
        <p>❌ {error}</p>
        <p className="text-sm text-gray-500 mt-2">Vérifiez que le backend est en marche</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Indicateur de débogage */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm">
          <p><strong>Debug:</strong> Période sélectionnée: {selectedPeriod}</p>
          <p>Données reçues: {tendancesData ? 'Oui' : 'Non'}</p>
          <p>Nombre de points de données: {trendData.length}</p>
          <p>Nombre de services: {serviceTrends.length}</p>
        </div>
      )}
      
      {/* En-tête avec sélecteur de période */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-slate-800">Évolution des plaintes</h3>
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {(['7j', '30j', '90j'] as const).map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                selectedPeriod === period
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      {/* Graphique d'évolution */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4">
        {trendData.length > 0 ? (
          <>
        <div className="flex items-end justify-between h-32 mb-4">
          {trendData.map((data, index) => (
            <div key={index} className="flex flex-col items-center">
              <div className="relative">
                {/* Barre nouvelles plaintes */}
                <div 
                  className="w-6 bg-blue-500 rounded-t-sm mb-1"
                      style={{ height: `${Math.max((data.nouvelles / 25) * 100, 5)}%` }}
                ></div>
                {/* Barre plaintes traitées */}
                <div 
                  className="w-6 bg-green-500 rounded-t-sm"
                      style={{ height: `${Math.max((data.traitees / 25) * 100, 5)}%` }}
                ></div>
              </div>
              <span className="text-xs text-gray-600 mt-2">{data.period}</span>
            </div>
          ))}
        </div>
        <div className="flex justify-center gap-6 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span>Nouvelles</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span>Traitées</span>
          </div>
        </div>
          </>
        ) : (
          <div className="h-32 flex items-center justify-center text-gray-500">
            <p>Aucune donnée disponible pour cette période</p>
          </div>
        )}
      </div>

      {/* Tendances par service */}
      <div>
        <h4 className="text-md font-semibold text-slate-800 mb-3">Tendances par service</h4>
        {serviceTrends.length > 0 ? (
        <div className="space-y-3">
          {serviceTrends.map((trend, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100">
              <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 ${trend.color} rounded-full`}></div>
                <span className="font-medium text-slate-700">{trend.service}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">{trend.count} plaintes</span>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  trend.evolution > 0 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                }`}>
                  {trend.evolution > 0 ? '+' : ''}{trend.evolution}%
                </span>
              </div>
            </div>
          ))}
        </div>
        ) : (
          <div className="text-center text-gray-500 py-4">
            <p>Aucune donnée de service disponible</p>
          </div>
        )}
      </div>

      {/* Métriques clés */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
          <div className="text-2xl font-bold text-blue-600">
            {stats?.nouvelles_plaintes || 0}
          </div>
          <div className="text-sm text-blue-700">Nouvelles (24h)</div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4">
          <div className="text-2xl font-bold text-green-600">
            {stats?.traitees_ce_mois || 0}
          </div>
          <div className="text-sm text-green-700">Traitées (mois)</div>
        </div>
      </div>

      {/* Insights IA */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-4 border border-purple-100">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xl">🤖</span>
          <span className="font-semibold text-purple-800">Insights IA</span>
        </div>
        <div className="text-sm text-purple-700 space-y-1">
          <p>• Pic de plaintes le {tendancesData?.insights.pic_jour || 'Vendredi'} (+25% vs moyenne)</p>
          <p>• Amélioration satisfaction: {tendancesData?.insights.evolution_satisfaction || '+0.3'} points ce mois</p>
          <p>• Service {tendancesData?.insights.service_attention || 'Cardiologie'}: attention aux délais</p>
        </div>
      </div>
    </div>
  )
} 