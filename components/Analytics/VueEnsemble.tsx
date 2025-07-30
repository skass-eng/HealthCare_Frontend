'use client'

import React from 'react'
import dynamic from 'next/dynamic'
import { ChartPieIcon, ArrowTrendingUpIcon, ChartBarIcon, ClipboardDocumentListIcon, CheckCircleIcon, ClockIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'

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
      <div className="bg-white/95 backdrop-blur-2xl rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-500">
        <div className="px-8 py-6 border-b border-white/20">
          <h3 className="text-lg font-semibold text-slate-800 flex items-center">
            <ChartBarIcon className="h-6 w-6 mr-3 text-blue-600" />
            Indicateurs Clés
          </h3>
          <div className="flex items-center gap-2 text-sm text-green-600 mt-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Données en temps réel</span>
          </div>
        </div>
        <div className="p-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border border-slate-200 shadow-lg">
              <div className="flex items-center justify-center mb-2">
                <ClipboardDocumentListIcon className="h-6 w-6 text-slate-600 mr-2" />
              </div>
              <div className="text-3xl font-semibold text-slate-800">
                {analyticsData?.plaintesParService.reduce((sum, service) => sum + service.count, 0) || 48}
              </div>
              <div className="text-sm text-slate-600 font-medium">Total Plaintes</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl border border-emerald-200 shadow-lg">
              <div className="flex items-center justify-center mb-2">
                <CheckCircleIcon className="h-6 w-6 text-emerald-600 mr-2" />
              </div>
              <div className="text-3xl font-semibold text-emerald-600">{(analyticsData?.metriquesPerformance?.satisfaction_client || 0).toFixed(2)}%</div>
              <div className="text-sm text-slate-600 font-medium">Satisfaction</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-teal-50 to-teal-100 rounded-xl border border-teal-200 shadow-lg">
              <div className="flex items-center justify-center mb-2">
                <ClockIcon className="h-6 w-6 text-teal-600 mr-2" />
              </div>
              <div className="text-3xl font-semibold text-teal-600">{(analyticsData?.metriquesPerformance?.temps_traitement_moyen || 0).toFixed(2)}j</div>
              <div className="text-sm text-slate-600 font-medium">Temps Moyen</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl border border-orange-200 shadow-lg">
              <div className="flex items-center justify-center mb-2">
                <ExclamationTriangleIcon className="h-6 w-6 text-orange-600 mr-2" />
              </div>
              <div className="text-3xl font-semibold text-orange-600">
                {analyticsData?.plaintesParPriorite.find(p => p.priorite === 'Urgent')?.count || 5}
              </div>
              <div className="text-sm text-slate-600 font-medium">Urgentes</div>
            </div>
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
                    colors: ['#94a3b8', '#34d399', '#5eead4', '#fb923c'], // Slate, Emerald, Teal, Orange avec même douceur
                    line: { color: '#000000', width: 2 }, // Noir simple
                    pattern: {
                      shape: 'horizontal',
                      size: 2,
                      solidity: 0.15
                    }
                  },
                  textinfo: 'percent',
                  textposition: 'outside',
                  textfont: {
                    size: 12,
                    color: '#374151',
                    family: 'Inter, sans-serif'
                  },
                  hovertemplate: '<b>%{label}</b><br>Plaintes: %{value}<br>Pourcentage: %{percent}<extra></extra>',
                  pull: [0.02, 0.02, 0.02, 0.02], // Séparation subtile
                  rotation: 0
                }
              ]}
              layout={{
                margin: { l: 20, r: 20, t: 40, b: 20 },
                plot_bgcolor: 'rgba(0,0,0,0)',
                paper_bgcolor: 'rgba(0,0,0,0)',
                font: { 
                  color: '#374151',
                  family: 'Inter, sans-serif'
                },
                showlegend: false
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
                    color: '#10b981', // Emerald - cohérent avec le design
                    width: 3,
                    shape: 'spline'
                  },
                  marker: { 
                    color: '#10b981', 
                    size: 6,
                    line: { color: 'white', width: 1 }
                  },
                  fill: 'tonexty',
                  fillcolor: 'rgba(16, 185, 129, 0.1)', // Emerald avec transparence
                  hovertemplate: '<b>%{x}</b><br>Plaintes: %{y}<extra></extra>'
                }
              ]}
              layout={{
                margin: { l: 50, r: 20, t: 20, b: 60 },
                xaxis: { 
                  title: { text: 'Date', font: { color: '#6b7280' } },
                  tickfont: { color: '#6b7280' },
                  showgrid: true,
                  gridcolor: 'rgba(0,0,0,0.1)',
                  tickangle: -90
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