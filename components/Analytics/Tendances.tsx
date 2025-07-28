'use client'

import React from 'react'
import dynamic from 'next/dynamic'
import { ArrowTrendingUpIcon, CheckCircleIcon } from '@heroicons/react/24/outline'

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

interface TendancesProps {
  analyticsData: AnalyticsData | null
}

export default function Tendances({ analyticsData }: TendancesProps) {
  return (
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
            {(!analyticsData?.tendances.augmentation || analyticsData.tendances.augmentation.length === 0) && (
              <li className="text-sm text-slate-400 italic">Aucune tendance en augmentation</li>
            )}
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
            {(!analyticsData?.tendances.diminution || analyticsData.tendances.diminution.length === 0) && (
              <li className="text-sm text-slate-400 italic">Aucune tendance en diminution</li>
            )}
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
            {(!analyticsData?.tendances.stable || analyticsData.tendances.stable.length === 0) && (
              <li className="text-sm text-slate-400 italic">Aucune tendance stable</li>
            )}
          </ul>
        </div>
      </div>

      {/* Analyse des tendances par service */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Tendances par Service</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {analyticsData?.plaintesParService.map((service, index) => {
            const trend = service.count > 10 ? 'up' : service.count > 5 ? 'stable' : 'down'
            const trendColor = trend === 'up' ? 'text-red-500' : trend === 'stable' ? 'text-yellow-500' : 'text-green-500'
            const trendText = trend === 'up' ? 'En hausse' : trend === 'stable' ? 'Stable' : 'En baisse'
            
            return (
              <div key={index} className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{service.service}</h4>
                  <span className={`text-xs font-medium ${trendColor}`}>{trendText}</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">{service.count}</div>
                <div className="text-sm text-gray-500">{service.percentage.toFixed(1)}% du total</div>
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${service.percentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Indicateurs de tendances */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Indicateurs de Tendances</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gradient-to-br from-red-50 to-pink-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">
              {analyticsData?.tendances.augmentation.length || 0}
            </div>
            <div className="text-sm text-gray-600">Tendances en hausse</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {analyticsData?.tendances.diminution.length || 0}
            </div>
            <div className="text-sm text-gray-600">Tendances en baisse</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {analyticsData?.tendances.stable.length || 0}
            </div>
            <div className="text-sm text-gray-600">Tendances stables</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-violet-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {((analyticsData?.tendances.augmentation.length || 0) + 
                (analyticsData?.tendances.diminution.length || 0) + 
                (analyticsData?.tendances.stable.length || 0))}
            </div>
            <div className="text-sm text-gray-600">Total des tendances</div>
          </div>
        </div>
      </div>
    </div>
  )
} 