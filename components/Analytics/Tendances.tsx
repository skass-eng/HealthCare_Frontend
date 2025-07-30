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
      <div className="bg-white/95 backdrop-blur-2xl rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-500">
        <div className="px-8 py-6 border-b border-white/20">
          <h3 className="text-lg font-semibold text-slate-800 flex items-center">
            <ArrowTrendingUpIcon className="h-6 w-6 mr-3 text-blue-600" />
            Évolution des plaintes
          </h3>
        </div>
        <div className="p-8">
          <PlotlyChart
            data={[
              {
                x: analyticsData?.evolutionTemporelle.map(p => new Date(p.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })) || [],
                y: analyticsData?.evolutionTemporelle.map(p => p.count) || [],
                type: 'scatter',
                mode: 'lines+markers',
                line: { 
                  color: '#0ea5e9', // Sky blue - cohérent avec le thème
                  width: 3,
                  shape: 'spline'
                },
                marker: { 
                  color: '#0ea5e9', 
                  size: 8,
                  line: { color: 'white', width: 2 }
                },
                fill: 'tonexty',
                fillcolor: 'rgba(14, 165, 233, 0.1)', // Sky blue avec transparence
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
        </div>
      </div>

      {/* Tendances détectées */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/95 backdrop-blur-2xl rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-500 p-6">
          <div className="flex items-center gap-2 mb-4">
            <ArrowTrendingUpIcon className="w-6 h-6 text-orange-600" />
            <h4 className="font-semibold text-slate-800">En augmentation</h4>
          </div>
          <ul className="space-y-2">
            {analyticsData?.tendances.augmentation.map((trend, index) => (
              <li key={index} className="text-sm text-slate-600 flex items-center">
                <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
                {trend}
              </li>
            ))}
            {(!analyticsData?.tendances.augmentation || analyticsData.tendances.augmentation.length === 0) && (
              <li className="text-sm text-slate-400 italic">Aucune tendance en augmentation</li>
            )}
          </ul>
        </div>

        <div className="bg-white/95 backdrop-blur-2xl rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-500 p-6">
          <div className="flex items-center gap-2 mb-4">
            <ArrowTrendingUpIcon className="w-6 h-6 text-emerald-600 rotate-180" />
            <h4 className="font-semibold text-slate-800">En diminution</h4>
          </div>
          <ul className="space-y-2">
            {analyticsData?.tendances.diminution.map((trend, index) => (
              <li key={index} className="text-sm text-slate-600 flex items-center">
                <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></div>
                {trend}
              </li>
            ))}
            {(!analyticsData?.tendances.diminution || analyticsData.tendances.diminution.length === 0) && (
              <li className="text-sm text-slate-400 italic">Aucune tendance en diminution</li>
            )}
          </ul>
        </div>

        <div className="bg-white/95 backdrop-blur-2xl rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-500 p-6">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircleIcon className="w-6 h-6 text-teal-600" />
            <h4 className="font-semibold text-slate-800">Stable</h4>
          </div>
          <ul className="space-y-2">
            {analyticsData?.tendances.stable.map((trend, index) => (
              <li key={index} className="text-sm text-slate-600 flex items-center">
                <div className="w-2 h-2 bg-teal-500 rounded-full mr-2"></div>
                {trend}
              </li>
            ))}
            {(!analyticsData?.tendances.stable || analyticsData.tendances.stable.length === 0) && (
              <li className="text-sm text-slate-400 italic">Aucune tendance stable</li>
            )}
          </ul>
        </div>
      </div>

      {/* Analyse des tendances par service */}
      <div className="bg-white/95 backdrop-blur-2xl rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-500">
        <div className="px-8 py-6 border-b border-white/20">
          <h3 className="text-lg font-semibold text-slate-800">Tendances par Service</h3>
        </div>
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {analyticsData?.plaintesParService.map((service, index) => {
              const trend = service.count > 10 ? 'up' : service.count > 5 ? 'stable' : 'down'
              const trendColor = trend === 'up' ? 'text-orange-600' : trend === 'stable' ? 'text-teal-600' : 'text-emerald-600'
              const trendText = trend === 'up' ? 'En hausse' : trend === 'stable' ? 'Stable' : 'En baisse'
              
              return (
                <div key={index} className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-slate-800">{service.service}</h4>
                    <span className={`text-xs font-semibold ${trendColor}`}>{trendText}</span>
                  </div>
                  <div className="text-2xl font-bold text-slate-800">{service.count}</div>
                  <div className="text-sm text-slate-600">{service.percentage.toFixed(1)}% du total</div>
                  <div className="mt-3">
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${service.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Indicateurs de tendances */}
      <div className="bg-white/95 backdrop-blur-2xl rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-500">
        <div className="px-8 py-6 border-b border-white/20">
          <h3 className="text-lg font-semibold text-slate-800">Indicateurs de Tendances</h3>
        </div>
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl border border-orange-200 shadow-lg">
              <div className="text-3xl font-semibold text-orange-600">
                {analyticsData?.tendances.augmentation.length || 0}
              </div>
              <div className="text-sm text-slate-600 font-medium">Tendances en hausse</div>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl border border-emerald-200 shadow-lg">
              <div className="text-3xl font-semibold text-emerald-600">
                {analyticsData?.tendances.diminution.length || 0}
              </div>
              <div className="text-sm text-slate-600 font-medium">Tendances en baisse</div>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-teal-50 to-teal-100 rounded-xl border border-teal-200 shadow-lg">
              <div className="text-3xl font-semibold text-teal-600">
                {analyticsData?.tendances.stable.length || 0}
              </div>
              <div className="text-sm text-slate-600 font-medium">Tendances stables</div>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border border-slate-200 shadow-lg">
              <div className="text-3xl font-semibold text-slate-600">
                {((analyticsData?.tendances.augmentation.length || 0) + 
                  (analyticsData?.tendances.diminution.length || 0) + 
                  (analyticsData?.tendances.stable.length || 0))}
              </div>
              <div className="text-sm text-slate-600 font-medium">Total des tendances</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 