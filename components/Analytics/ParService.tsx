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

interface ParServiceProps {
  analyticsData: AnalyticsData | null
}

export default function ParService({ analyticsData }: ParServiceProps) {
  return (
    <div className="glass-card p-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Graphique en barres */}
        <div>
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Répartition par Service (Barres)</h3>
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
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Répartition par Service (Circulaire)</h3>
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

      {/* Tableau détaillé des services */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Détails par Service</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg overflow-hidden shadow-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Service
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre de Plaintes
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pourcentage
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {analyticsData?.plaintesParService.map((service, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {service.service}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {service.count}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {service.percentage.toFixed(1)}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      service.count > 10 ? 'bg-red-100 text-red-800' :
                      service.count > 5 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {service.count > 10 ? 'Élevé' : service.count > 5 ? 'Moyen' : 'Faible'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
} 