'use client'

import React from 'react'
import dynamic from 'next/dynamic'
import { ChartPieIcon, ArrowTrendingUpIcon } from '@heroicons/react/24/outline'

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

interface VueEnsembleProps {
  analyticsData: AnalyticsData | null
}

export default function VueEnsemble({ analyticsData }: VueEnsembleProps) {
  return (
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
  )
} 