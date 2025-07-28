'use client'

import React from 'react'
import dynamic from 'next/dynamic'

const PlotlyChart = dynamic(() => import('@/components/PlotlyChart'), {
  ssr: false,
  loading: () => <div className="h-80 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
})

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

interface AnalyticsServicesProps {
  analyticsData: AnalyticsData | null
}

export default function AnalyticsServices({ analyticsData }: AnalyticsServicesProps) {
  return (
    <div className="glass-card p-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Graphique en barres */}
        <div>
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Répartition par Service</h3>
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
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Pourcentage par Service</h3>
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
  )
} 