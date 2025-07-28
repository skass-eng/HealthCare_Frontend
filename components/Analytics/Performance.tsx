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

interface PerformanceProps {
  analyticsData: AnalyticsData | null
}

export default function Performance({ analyticsData }: PerformanceProps) {
  return (
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

      {/* Tableau de synthèse des performances */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Synthèse des Performances</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg overflow-hidden shadow-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Indicateur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valeur Actuelle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Objectif
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Taux de Résolution
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {(analyticsData?.metriquesPerformance?.taux_resolution || 0).toFixed(1)}%
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">95%</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    (analyticsData?.metriquesPerformance?.taux_resolution || 0) >= 95 ? 'bg-green-100 text-green-800' :
                    (analyticsData?.metriquesPerformance?.taux_resolution || 0) >= 85 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {(analyticsData?.metriquesPerformance?.taux_resolution || 0) >= 95 ? 'Atteint' :
                     (analyticsData?.metriquesPerformance?.taux_resolution || 0) >= 85 ? 'En cours' : 'À améliorer'}
                  </span>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Temps de Réponse
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {(analyticsData?.metriquesPerformance?.temps_reponse_moyen || 0).toFixed(1)}h
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">2h</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    (analyticsData?.metriquesPerformance?.temps_reponse_moyen || 0) <= 2 ? 'bg-green-100 text-green-800' :
                    (analyticsData?.metriquesPerformance?.temps_reponse_moyen || 0) <= 4 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {(analyticsData?.metriquesPerformance?.temps_reponse_moyen || 0) <= 2 ? 'Atteint' :
                     (analyticsData?.metriquesPerformance?.temps_reponse_moyen || 0) <= 4 ? 'En cours' : 'À améliorer'}
                  </span>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Qualité des Soins
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {(analyticsData?.metriquesPerformance?.qualite_soins || 0).toFixed(1)}%
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">90%</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    (analyticsData?.metriquesPerformance?.qualite_soins || 0) >= 90 ? 'bg-green-100 text-green-800' :
                    (analyticsData?.metriquesPerformance?.qualite_soins || 0) >= 80 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {(analyticsData?.metriquesPerformance?.qualite_soins || 0) >= 90 ? 'Atteint' :
                     (analyticsData?.metriquesPerformance?.qualite_soins || 0) >= 80 ? 'En cours' : 'À améliorer'}
                  </span>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Satisfaction Client
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {(analyticsData?.metriquesPerformance?.satisfaction_client || 0).toFixed(1)}%
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">85%</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    (analyticsData?.metriquesPerformance?.satisfaction_client || 0) >= 85 ? 'bg-green-100 text-green-800' :
                    (analyticsData?.metriquesPerformance?.satisfaction_client || 0) >= 75 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {(analyticsData?.metriquesPerformance?.satisfaction_client || 0) >= 85 ? 'Atteint' :
                     (analyticsData?.metriquesPerformance?.satisfaction_client || 0) >= 75 ? 'En cours' : 'À améliorer'}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
} 