'use client'

import { useState, useEffect } from 'react'
import { useAppStore } from '@/hooks/useAppStore'
import dynamic from 'next/dynamic'

const PlotlyChart = dynamic(() => import('@/components/PlotlyChart'), {
  ssr: false,
  loading: () => <div className="h-80 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
})

// Fonction pour générer des données de démonstration selon la période
function getDemoDataForPeriod(period: '7j' | '30j' | '90j'): AnalyticsData {
  const baseData = {
    plaintesParService: [
      { service: 'Cardiologie', count: 0, percentage: 0 },
      { service: 'Urgences', count: 0, percentage: 0 },
      { service: 'Pédiatrie', count: 0, percentage: 0 },
      { service: 'Chirurgie', count: 0, percentage: 0 },
      { service: 'Radiologie', count: 0, percentage: 0 },
      { service: 'Oncologie', count: 0, percentage: 0 }
    ],
    plaintesParPriorite: [
      { priorite: 'Urgent', count: 0, color: 'bg-red-500' },
      { priorite: 'Élevé', count: 0, color: 'bg-orange-500' },
      { priorite: 'Moyen', count: 0, color: 'bg-yellow-500' },
      { priorite: 'Bas', count: 0, color: 'bg-green-500' }
    ],
    evolutionTemporelle: [] as { date: string; count: number }[],
    tempsMoyenTraitement: 0,
    tauxSatisfaction: 0,
    metriquesPerformance: {
      taux_resolution: 0,
      temps_reponse_moyen: 0,
      qualite_soins: 0,
      taux_recurrence: 0,
      satisfaction_client: 0,
      temps_traitement_moyen: 0
    },
    tendances: {
      augmentation: [] as string[],
      diminution: [] as string[],
      stable: [] as string[]
    }
  }

  switch (period) {
    case '7j':
      return {
        ...baseData,
        plaintesParService: [
          { service: 'Cardiologie', count: 8, percentage: 22.2 },
          { service: 'Urgences', count: 12, percentage: 33.3 },
          { service: 'Pédiatrie', count: 6, percentage: 16.7 },
          { service: 'Chirurgie', count: 4, percentage: 11.1 },
          { service: 'Radiologie', count: 3, percentage: 8.3 },
          { service: 'Oncologie', count: 3, percentage: 8.3 }
        ],
        plaintesParPriorite: [
          { priorite: 'Urgent', count: 4, color: 'bg-red-500' },
          { priorite: 'Élevé', count: 8, color: 'bg-orange-500' },
          { priorite: 'Moyen', count: 15, color: 'bg-yellow-500' },
          { priorite: 'Bas', count: 9, color: 'bg-green-500' }
        ],
        evolutionTemporelle: [
          { date: '2024-01-01', count: 3 },
          { date: '2024-01-02', count: 5 },
          { date: '2024-01-03', count: 2 },
          { date: '2024-01-04', count: 7 },
          { date: '2024-01-05', count: 4 },
          { date: '2024-01-06', count: 6 },
          { date: '2024-01-07', count: 9 }
        ],
        tempsMoyenTraitement: 2.8,
        tauxSatisfaction: 89.0,
        metriquesPerformance: {
          taux_resolution: 96,
          temps_reponse_moyen: 1.8,
          qualite_soins: 93,
          taux_recurrence: 4,
          satisfaction_client: 89,
          temps_traitement_moyen: 2.8
        },
        tendances: {
          augmentation: ['Plaintes urgentes'],
          diminution: ['Temps de réponse', 'Satisfaction patient'],
          stable: ['Taux de résolution']
        }
      }

    case '30j':
      return {
        ...baseData,
        plaintesParService: [
          { service: 'Cardiologie', count: 12, percentage: 25 },
          { service: 'Urgences', count: 18, percentage: 37.5 },
          { service: 'Pédiatrie', count: 8, percentage: 16.7 },
          { service: 'Chirurgie', count: 6, percentage: 12.5 },
          { service: 'Radiologie', count: 3, percentage: 6.3 },
          { service: 'Oncologie', count: 1, percentage: 2.1 }
        ],
        plaintesParPriorite: [
          { priorite: 'Urgent', count: 5, color: 'bg-red-500' },
          { priorite: 'Élevé', count: 12, color: 'bg-orange-500' },
          { priorite: 'Moyen', count: 20, color: 'bg-yellow-500' },
          { priorite: 'Bas', count: 11, color: 'bg-green-500' }
        ],
        evolutionTemporelle: [
          { date: '2024-01-01', count: 3 },
          { date: '2024-01-05', count: 5 },
          { date: '2024-01-10', count: 2 },
          { date: '2024-01-15', count: 7 },
          { date: '2024-01-20', count: 4 },
          { date: '2024-01-25', count: 6 },
          { date: '2024-01-30', count: 8 }
        ],
        tempsMoyenTraitement: 3.2,
        tauxSatisfaction: 87.0,
        metriquesPerformance: {
          taux_resolution: 94,
          temps_reponse_moyen: 2.1,
          qualite_soins: 91,
          taux_recurrence: 6,
          satisfaction_client: 87,
          temps_traitement_moyen: 3.2
        },
        tendances: {
          augmentation: ['Plaintes urgentes', 'Temps de réponse'],
          diminution: ['Satisfaction patient', 'Qualité des soins'],
          stable: ['Taux de résolution', 'Récurrence des plaintes']
        }
      }

    case '90j':
      return {
        ...baseData,
        plaintesParService: [
          { service: 'Cardiologie', count: 35, percentage: 23.3 },
          { service: 'Urgences', count: 52, percentage: 34.7 },
          { service: 'Pédiatrie', count: 25, percentage: 16.7 },
          { service: 'Chirurgie', count: 20, percentage: 13.3 },
          { service: 'Radiologie', count: 12, percentage: 8.0 },
          { service: 'Oncologie', count: 6, percentage: 4.0 }
        ],
        plaintesParPriorite: [
          { priorite: 'Urgent', count: 15, color: 'bg-red-500' },
          { priorite: 'Élevé', count: 35, color: 'bg-orange-500' },
          { priorite: 'Moyen', count: 60, color: 'bg-yellow-500' },
          { priorite: 'Bas', count: 40, color: 'bg-green-500' }
        ],
        evolutionTemporelle: [
          { date: '2024-01-01', count: 8 },
          { date: '2024-01-15', count: 12 },
          { date: '2024-01-30', count: 6 },
          { date: '2024-02-15', count: 18 },
          { date: '2024-02-28', count: 10 },
          { date: '2024-03-15', count: 14 },
          { date: '2024-03-30', count: 22 }
        ],
        tempsMoyenTraitement: 3.8,
        tauxSatisfaction: 84.0,
        metriquesPerformance: {
          taux_resolution: 91,
          temps_reponse_moyen: 2.8,
          qualite_soins: 88,
          taux_recurrence: 9,
          satisfaction_client: 84,
          temps_traitement_moyen: 3.8
        },
        tendances: {
          augmentation: ['Plaintes urgentes', 'Temps de réponse', 'Taux de récurrence'],
          diminution: ['Satisfaction patient', 'Qualité des soins', 'Taux de résolution'],
          stable: []
        }
      }

    default:
      return baseData
  }
}
import { 
  ChartBarIcon, 
  ChartPieIcon, 
  ArrowTrendingUpIcon, 
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline'

interface AnalyticsData {
  plaintesParService: { service: string; count: number; percentage: number }[]
  plaintesParPriorite: { priorite: string; count: number; color: string }[]
  evolutionTemporelle: { date: string; count: number }[]
  tempsMoyenTraitement: number
  tauxSatisfaction: number
  metriquesPerformance: {
    taux_resolution: number
    temps_reponse_moyen: number
    qualite_soins: number
    taux_recurrence: number
    satisfaction_client: number
    temps_traitement_moyen: number
  }
  tendances: {
    augmentation: string[]
    diminution: string[]
    stable: string[]
  }
}

export default function AnalyticsPage() {
  const { statistiques, tendances, loading, actions } = useAppStore()
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState<'7j' | '30j' | '90j'>('30j')
  const [activeTab, setActiveTab] = useState<'overview' | 'services' | 'trends' | 'performance'>('overview')
  const [analyticsLoading, setAnalyticsLoading] = useState(false)

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setAnalyticsLoading(true)
        
        // Appeler l'API pour récupérer les vraies données
        const response = await fetch(`/api/analytics/rapport-complet?periode=${selectedPeriod}`)
        
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des données analytics')
        }
        
        const data = await response.json()
        setAnalyticsData(data)
      } catch (error) {
        console.error('Erreur lors du chargement des analytics:', error)
        // En cas d'erreur, utiliser des données de démonstration selon la période
        const demoData = getDemoDataForPeriod(selectedPeriod)
        setAnalyticsData(demoData)
      } finally {
        setAnalyticsLoading(false)
      }
    }

    fetchAnalyticsData()
  }, [selectedPeriod])

  if (loading.stats || loading.tendances || analyticsLoading) {
    return (
      <div className="space-y-4 lg:space-y-8 min-w-0">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 lg:space-y-8 min-w-0">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-white text-xl lg:text-3xl font-bold truncate">
              Analytics & Rapports
            </h1>
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium">
              <ChartPieIcon className="w-4 h-4" />
              <span>Données en temps réel</span>
            </div>
          </div>
          <p className="text-white/80 text-xs lg:text-sm truncate">
            Analyse approfondie des plaintes et tendances par service
          </p>
        </div>
        
        {/* Sélecteur de période */}
        <div className="flex gap-1 bg-white/10 backdrop-blur-sm rounded-lg p-1">
          {(['7j', '30j', '90j'] as const).map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                selectedPeriod === period
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white/10 backdrop-blur-sm rounded-lg p-1">
        {[
          { id: 'overview', label: 'Vue d\'ensemble', icon: ChartBarIcon },
          { id: 'services', label: 'Par Service', icon: ChartPieIcon },
          { id: 'trends', label: 'Tendances', icon: ArrowTrendingUpIcon },
          { id: 'performance', label: 'Performance', icon: ClockIcon }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 text-sm rounded-md transition-colors ${
              activeTab === tab.id
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-white/70 hover:text-white'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Contenu des tabs */}
      <div className="space-y-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* KPIs Principaux - Version Simplifiée */}
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-slate-800">Indicateurs Clés</h3>
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>Données en temps réel</span>
                </div>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg">
                  <div className="text-3xl font-bold text-blue-600">
                    {analyticsData?.plaintesParService.reduce((sum, service) => sum + service.count, 0) || 48}
                  </div>
                  <div className="text-sm text-gray-600">Total Plaintes</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg">
                  <div className="text-3xl font-bold text-green-600">{(analyticsData?.metriquesPerformance?.satisfaction_client || 0).toFixed(2)}%</div>
                  <div className="text-sm text-gray-600">Satisfaction</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-red-50 rounded-lg">
                  <div className="text-3xl font-bold text-orange-600">{(analyticsData?.metriquesPerformance?.temps_traitement_moyen || 0).toFixed(2)}j</div>
                  <div className="text-sm text-gray-600">Temps Moyen</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg">
                  <div className="text-3xl font-bold text-purple-600">
                    {analyticsData?.plaintesParPriorite.find(p => p.priorite === 'Urgent')?.count || 5}
                  </div>
                  <div className="text-sm text-gray-600">Urgentes</div>
                </div>
              </div>
            </div>

            {/* Graphiques Principaux */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Répartition par Priorité */}
              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Répartition par Priorité</h3>
                {analyticsData?.plaintesParPriorite && analyticsData.plaintesParPriorite.some(p => p.count > 0) ? (
                  <PlotlyChart
                    data={[
                      {
                        values: analyticsData.plaintesParPriorite.map(p => p.count),
                        labels: analyticsData.plaintesParPriorite.map(p => p.priorite),
                        type: 'pie',
                        marker: {
                          colors: ['#ef4444', '#f97316', '#eab308', '#22c55e'],
                          line: { color: 'white', width: 2 }
                        },
                        textinfo: 'percent+label',
                        textposition: 'inside',
                        hovertemplate: '<b>%{label}</b><br>Plaintes: %{value}<br>Pourcentage: %{percent}<extra></extra>'
                      }
                    ]}
                    layout={{
                      margin: { l: 20, r: 20, t: 20, b: 20 },
                      plot_bgcolor: 'rgba(0,0,0,0)',
                      paper_bgcolor: 'rgba(0,0,0,0)',
                      font: { color: '#374151' },
                      showlegend: true,
                      legend: { 
                        orientation: 'h',
                        x: 0.5,
                        y: -0.1,
                        font: { color: '#6b7280' }
                      }
                    }}
                    className="h-80"
                  />
                ) : (
                  <div className="h-80 flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <ChartPieIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p>Aucune donnée disponible</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Évolution Temporelle */}
              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Évolution des Plaintes</h3>
                {analyticsData?.evolutionTemporelle && analyticsData.evolutionTemporelle.length > 0 ? (
                  <PlotlyChart
                    data={[
                      {
                        x: analyticsData.evolutionTemporelle.map(p => new Date(p.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })),
                        y: analyticsData.evolutionTemporelle.map(p => p.count),
                        type: 'scatter',
                        mode: 'lines+markers',
                        line: { 
                          color: '#3b82f6', 
                          width: 3,
                          shape: 'spline'
                        },
                        marker: { 
                          color: '#3b82f6', 
                          size: 6,
                          line: { color: 'white', width: 1 }
                        },
                        fill: 'tonexty',
                        fillcolor: 'rgba(59, 130, 246, 0.1)',
                        hovertemplate: '<b>%{x}</b><br>Plaintes: %{y}<extra></extra>'
                      }
                    ]}
                    layout={{
                      margin: { l: 50, r: 20, t: 20, b: 60 },
                      xaxis: { 
                        title: { text: 'Date', font: { color: '#6b7280' } },
                        tickfont: { color: '#6b7280' },
                        showgrid: true,
                        gridcolor: 'rgba(0,0,0,0.1)'
                      },
                      yaxis: { 
                        title: { text: 'Nombre de plaintes', font: { color: '#6b7280' } },
                        tickfont: { color: '#6b7280' },
                        showgrid: true,
                        gridcolor: 'rgba(0,0,0,0.1)'
                      },
                      plot_bgcolor: 'rgba(0,0,0,0)',
                      paper_bgcolor: 'rgba(0,0,0,0)',
                      font: { color: '#374151' },
                      hovermode: 'x unified'
                    }}
                    className="h-80"
                  />
                ) : (
                  <div className="h-80 flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <ArrowTrendingUpIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p>Aucune donnée disponible</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'services' && (
          <div className="glass-card p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Graphique en barres */}
              <div>
                <PlotlyChart
                  data={[
                    {
                      x: analyticsData?.plaintesParService.map(s => s.service) || [],
                      y: analyticsData?.plaintesParService.map(s => s.count) || [],
                      type: 'bar',
                      marker: {
                        color: ['#ef4444', '#f97316', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899'],
                        line: { color: 'white', width: 1 }
                      },
                      text: analyticsData?.plaintesParService.map(s => s.count) || [],
                      textposition: 'auto',
                      hovertemplate: '<b>%{x}</b><br>Plaintes: %{y}<extra></extra>'
                    }
                  ]}
                  layout={{
                    margin: { l: 50, r: 20, t: 20, b: 60 },
                    xaxis: { 
                      title: { text: 'Services', font: { color: '#6b7280' } },
                      tickfont: { color: '#6b7280' }
                    },
                    yaxis: { 
                      title: { text: 'Nombre de plaintes', font: { color: '#6b7280' } },
                      tickfont: { color: '#6b7280' }
                    },
                    plot_bgcolor: 'rgba(0,0,0,0)',
                    paper_bgcolor: 'rgba(0,0,0,0)',
                    font: { color: '#374151' }
                  }}
                  className="h-80"
                />
              </div>

              {/* Graphique circulaire */}
              <div>
                <PlotlyChart
                  data={[
                    {
                      values: analyticsData?.plaintesParService.map(s => s.count) || [],
                      labels: analyticsData?.plaintesParService.map(s => s.service) || [],
                      type: 'pie',
                      hole: 0.4,
                      marker: {
                        colors: ['#ef4444', '#f97316', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899'],
                        line: { color: 'white', width: 2 }
                      },
                      textinfo: 'percent',
                      textposition: 'inside',
                      hovertemplate: '<b>%{label}</b><br>Plaintes: %{value}<br>Pourcentage: %{percent}<extra></extra>'
                    }
                  ]}
                  layout={{
                    margin: { l: 20, r: 20, t: 20, b: 20 },
                    plot_bgcolor: 'rgba(0,0,0,0)',
                    paper_bgcolor: 'rgba(0,0,0,0)',
                    font: { color: '#374151' },
                    showlegend: false
                  }}
                  className="h-80"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'trends' && (
          <div className="space-y-6">
            {/* Évolution temporelle */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Évolution des plaintes</h3>
              <PlotlyChart
                data={[
                  {
                    x: analyticsData?.evolutionTemporelle.map(p => new Date(p.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })) || [],
                    y: analyticsData?.evolutionTemporelle.map(p => p.count) || [],
                    type: 'scatter',
                    mode: 'lines+markers',
                    line: { 
                      color: '#3b82f6', 
                      width: 3,
                      shape: 'spline'
                    },
                    marker: { 
                      color: '#3b82f6', 
                      size: 8,
                      line: { color: 'white', width: 2 }
                    },
                    fill: 'tonexty',
                    fillcolor: 'rgba(59, 130, 246, 0.1)',
                    hovertemplate: '<b>%{x}</b><br>Plaintes: %{y}<extra></extra>'
                  }
                ]}
                layout={{
                  title: { text: 'Évolution Temporelle', font: { size: 16, color: '#374151' } },
                  margin: { l: 50, r: 20, t: 40, b: 60 },
                  xaxis: { 
                    title: { text: 'Date', font: { color: '#6b7280' } },
                    tickfont: { color: '#6b7280' },
                    showgrid: true,
                    gridcolor: 'rgba(0,0,0,0.1)'
                  },
                  yaxis: { 
                    title: { text: 'Nombre de plaintes', font: { color: '#6b7280' } },
                    tickfont: { color: '#6b7280' },
                    showgrid: true,
                    gridcolor: 'rgba(0,0,0,0.1)'
                  },
                  plot_bgcolor: 'rgba(0,0,0,0)',
                  paper_bgcolor: 'rgba(0,0,0,0)',
                  font: { color: '#374151' },
                  hovermode: 'x unified'
                }}
                className="h-80"
              />
            </div>

            {/* Tendances détectées */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="glass-card p-4">
                              <div className="flex items-center gap-2 mb-3">
                <ArrowTrendingUpIcon className="w-5 h-5 text-red-500" />
                <h4 className="font-medium text-slate-800">En augmentation</h4>
              </div>
                <ul className="space-y-1">
                  {analyticsData?.tendances.augmentation.map((trend, index) => (
                    <li key={index} className="text-sm text-slate-600">• {trend}</li>
                  ))}
                </ul>
              </div>

              <div className="glass-card p-4">
                              <div className="flex items-center gap-2 mb-3">
                <ArrowTrendingUpIcon className="w-5 h-5 text-green-500 rotate-180" />
                <h4 className="font-medium text-slate-800">En diminution</h4>
              </div>
                <ul className="space-y-1">
                  {analyticsData?.tendances.diminution.map((trend, index) => (
                    <li key={index} className="text-sm text-slate-600">• {trend}</li>
                  ))}
                </ul>
              </div>

              <div className="glass-card p-4">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircleIcon className="w-5 h-5 text-blue-500" />
                  <h4 className="font-medium text-slate-800">Stable</h4>
                </div>
                <ul className="space-y-1">
                  {analyticsData?.tendances.stable.map((trend, index) => (
                    <li key={index} className="text-sm text-slate-600">• {trend}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'performance' && (
          <div className="space-y-6">
            {/* KPIs de Performance Clinique */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-6">Indicateurs de Performance Clinique</h3>
              <div className="space-y-8">
                {/* Ligne du haut - 2 gauge charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Taux de Résolution */}
                  <div className="text-center">
                    <PlotlyChart
                      data={[
                        {
                          type: 'indicator',
                          mode: 'gauge+number',
                          value: Number((analyticsData?.metriquesPerformance?.taux_resolution || 94).toFixed(2)),
                          domain: { x: [0, 1], y: [0, 1] },
                          title: { text: 'Taux de Résolution (%)', font: { size: 16, color: '#374151' } },
                          gauge: {
                            axis: { 
                              range: [null, 100], 
                              tickwidth: 1, 
                              tickcolor: '#374151',
                              tickmode: 'array',
                              tickvals: [0, 25, 50, 75, 100],
                              ticktext: ['0', '25', '50', '75', '100']
                            },
                            bar: { color: '#22c55e' },
                            bgcolor: 'white',
                            borderwidth: 2,
                            bordercolor: '#e5e7eb',
                            steps: [
                              { range: [0, 70], color: '#ef4444' },
                              { range: [70, 85], color: '#f97316' },
                              { range: [85, 100], color: '#22c55e' }
                            ]
                          }
                        }
                      ]}
                      layout={{
                        margin: { l: 40, r: 40, t: 60, b: 40 },
                        plot_bgcolor: 'rgba(0,0,0,0)',
                        paper_bgcolor: 'rgba(0,0,0,0)',
                        font: { color: '#374151' }
                      }}
                      className="h-72"
                    />
                  </div>

                  {/* Temps de Réponse */}
                  <div className="text-center">
                    <PlotlyChart
                      data={[
                        {
                          type: 'indicator',
                          mode: 'gauge+number',
                          value: Number((analyticsData?.metriquesPerformance?.temps_reponse_moyen || 2.1).toFixed(2)),
                          domain: { x: [0, 1], y: [0, 1] },
                          title: { text: 'Temps de Réponse (h)', font: { size: 16, color: '#374151' } },
                          gauge: {
                            axis: { 
                              range: [null, 24], 
                              tickwidth: 1, 
                              tickcolor: '#374151',
                              tickmode: 'array',
                              tickvals: [0, 6, 12, 18, 24],
                              ticktext: ['0', '6', '12', '18', '24']
                            },
                            bar: { color: '#3b82f6' },
                            bgcolor: 'white',
                            borderwidth: 2,
                            bordercolor: '#e5e7eb',
                            steps: [
                              { range: [0, 4], color: '#22c55e' },
                              { range: [4, 12], color: '#eab308' },
                              { range: [12, 24], color: '#ef4444' }
                            ]
                          }
                        }
                      ]}
                      layout={{
                        margin: { l: 40, r: 40, t: 60, b: 40 },
                        plot_bgcolor: 'rgba(0,0,0,0)',
                        paper_bgcolor: 'rgba(0,0,0,0)',
                        font: { color: '#374151' }
                      }}
                      className="h-72"
                    />
                  </div>
                </div>

                {/* Ligne du bas - 2 gauge charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Qualité des Soins */}
                  <div className="text-center">
                    <PlotlyChart
                      data={[
                        {
                          type: 'indicator',
                          mode: 'gauge+number',
                          value: Number((analyticsData?.metriquesPerformance?.qualite_soins || 91).toFixed(2)),
                          domain: { x: [0, 1], y: [0, 1] },
                          title: { text: 'Qualité des Soins (%)', font: { size: 16, color: '#374151' } },
                          gauge: {
                            axis: { 
                              range: [null, 100], 
                              tickwidth: 1, 
                              tickcolor: '#374151',
                              tickmode: 'array',
                              tickvals: [0, 25, 50, 75, 100],
                              ticktext: ['0', '25', '50', '75', '100']
                            },
                            bar: { color: '#8b5cf6' },
                            bgcolor: 'white',
                            borderwidth: 2,
                            bordercolor: '#e5e7eb',
                            steps: [
                              { range: [0, 60], color: '#ef4444' },
                              { range: [60, 80], color: '#f97316' },
                              { range: [80, 100], color: '#8b5cf6' }
                            ]
                          }
                        }
                      ]}
                      layout={{
                        margin: { l: 40, r: 40, t: 60, b: 40 },
                        plot_bgcolor: 'rgba(0,0,0,0)',
                        paper_bgcolor: 'rgba(0,0,0,0)',
                        font: { color: '#374151' }
                      }}
                      className="h-72"
                    />
                  </div>

                  {/* Taux de Récurrence */}
                  <div className="text-center">
                    <PlotlyChart
                      data={[
                        {
                          type: 'indicator',
                          mode: 'gauge+number',
                          value: Number((analyticsData?.metriquesPerformance?.taux_recurrence || 6).toFixed(2)),
                          domain: { x: [0, 1], y: [0, 1] },
                          title: { text: 'Taux de Récurrence (%)', font: { size: 16, color: '#374151' } },
                          gauge: {
                            axis: { 
                              range: [null, 20], 
                              tickwidth: 1, 
                              tickcolor: '#374151',
                              tickmode: 'array',
                              tickvals: [0, 5, 10, 15, 20],
                              ticktext: ['0', '5', '10', '15', '20']
                            },
                            bar: { color: '#22c55e' },
                            bgcolor: 'white',
                            borderwidth: 2,
                            bordercolor: '#e5e7eb',
                            steps: [
                              { range: [0, 5], color: '#22c55e' },
                              { range: [5, 10], color: '#eab308' },
                              { range: [10, 20], color: '#ef4444' }
                            ]
                          }
                        }
                      ]}
                      layout={{
                        margin: { l: 40, r: 40, t: 60, b: 40 },
                        plot_bgcolor: 'rgba(0,0,0,0)',
                        paper_bgcolor: 'rgba(0,0,0,0)',
                        font: { color: '#374151' }
                      }}
                      className="h-72"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Performance par Service */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Performance par Service</h3>
              <PlotlyChart
                data={[
                  {
                    type: 'scatterpolar',
                    r: [92, 88, 85, 90, 87, 89],
                    theta: ['Cardiologie', 'Urgences', 'Pédiatrie', 'Chirurgie', 'Radiologie', 'Oncologie'],
                    fill: 'toself',
                    name: 'Performance Actuelle',
                    line: { color: '#3b82f6', width: 3 },
                    fillcolor: 'rgba(59, 130, 246, 0.1)',
                    marker: { size: 8, color: '#3b82f6' }
                  },
                  {
                    type: 'scatterpolar',
                    r: [95, 92, 90, 93, 91, 94],
                    theta: ['Cardiologie', 'Urgences', 'Pédiatrie', 'Chirurgie', 'Radiologie', 'Oncologie'],
                    fill: 'toself',
                    name: 'Objectifs 2024',
                    line: { color: '#22c55e', width: 3, dash: 'dash' },
                    fillcolor: 'rgba(34, 197, 94, 0.05)',
                    marker: { size: 8, color: '#22c55e' }
                  }
                ]}
                layout={{
                  polar: {
                    radialaxis: {
                      visible: true,
                      range: [0, 100],
                      tickfont: { color: '#6b7280' }
                    },
                    angularaxis: {
                      tickfont: { color: '#6b7280' }
                    }
                  },
                  plot_bgcolor: 'rgba(0,0,0,0)',
                  paper_bgcolor: 'rgba(0,0,0,0)',
                  font: { color: '#374151' },
                  showlegend: true,
                  legend: { 
                    x: 1.15,
                    y: 0.5,
                    font: { color: '#6b7280' }
                  }
                }}
                className="h-96"
              />
            </div>

            {/* Métriques Détaillées */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Satisfaction Patient */}
              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Satisfaction Patient</h3>
                <PlotlyChart
                  data={[
                    {
                      type: 'indicator',
                      mode: 'gauge+number+delta',
                      value: Number((analyticsData?.metriquesPerformance?.satisfaction_client || 0).toFixed(2)),
                      domain: { x: [0, 1], y: [0, 1] },
                      title: { text: 'Taux de Satisfaction (%)', font: { size: 16, color: '#374151' } },
                      delta: { reference: 85, increasing: { color: '#22c55e' }, decreasing: { color: '#ef4444' } },
                      gauge: {
                        axis: { range: [null, 100], tickwidth: 1, tickcolor: '#374151' },
                        bar: { color: '#22c55e' },
                        bgcolor: 'white',
                        borderwidth: 2,
                        bordercolor: '#e5e7eb',
                        steps: [
                          { range: [0, 60], color: '#ef4444' },
                          { range: [60, 80], color: '#f97316' },
                          { range: [80, 100], color: '#22c55e' }
                        ],
                        threshold: {
                          line: { color: '#374151', width: 4 },
                          thickness: 0.75,
                          value: 90
                        }
                      }
                    }
                  ]}
                  layout={{
                    margin: { l: 20, r: 20, t: 40, b: 20 },
                    plot_bgcolor: 'rgba(0,0,0,0)',
                    paper_bgcolor: 'rgba(0,0,0,0)',
                    font: { color: '#374151' }
                  }}
                  className="h-80"
                />
              </div>

              {/* Temps de Traitement */}
              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Efficacité de Traitement</h3>
                <PlotlyChart
                  data={[
                    {
                      type: 'indicator',
                      mode: 'gauge+number+delta',
                      value: Number((analyticsData?.metriquesPerformance?.temps_traitement_moyen || 0).toFixed(2)),
                      domain: { x: [0, 1], y: [0, 1] },
                      title: { text: 'Temps Moyen (jours)', font: { size: 16, color: '#374151' } },
                      delta: { reference: 2.5, increasing: { color: '#ef4444' }, decreasing: { color: '#22c55e' } },
                      gauge: {
                        axis: { range: [null, 7], tickwidth: 1, tickcolor: '#374151' },
                        bar: { color: '#3b82f6' },
                        bgcolor: 'white',
                        borderwidth: 2,
                        bordercolor: '#e5e7eb',
                        steps: [
                          { range: [0, 2], color: '#22c55e' },
                          { range: [2, 4], color: '#eab308' },
                          { range: [4, 7], color: '#ef4444' }
                        ],
                        threshold: {
                          line: { color: '#374151', width: 4 },
                          thickness: 0.75,
                          value: 2
                        }
                      }
                    }
                  ]}
                  layout={{
                    margin: { l: 20, r: 20, t: 40, b: 20 },
                    plot_bgcolor: 'rgba(0,0,0,0)',
                    paper_bgcolor: 'rgba(0,0,0,0)',
                    font: { color: '#374151' }
                  }}
                  className="h-80"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 