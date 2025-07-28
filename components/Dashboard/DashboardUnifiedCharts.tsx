'use client'

import React, { useEffect, useRef } from 'react'
import Plotly from 'plotly.js-dist'

interface DashboardUnifiedChartsProps {
  statistiques: any
  filters: any
}

export default function DashboardUnifiedCharts({ statistiques, filters }: DashboardUnifiedChartsProps) {
  const servicesChartRef = useRef<HTMLDivElement>(null)
  const prioritiesChartRef = useRef<HTMLDivElement>(null)
  const performanceChartRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!statistiques || !servicesChartRef.current || !prioritiesChartRef.current || !performanceChartRef.current) {
      return
    }

    // Configuration commune pour les graphiques
    const layout = {
      font: { family: 'Inter, sans-serif' },
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(0,0,0,0)',
      margin: { t: 30, b: 30, l: 40, r: 20 },
      showlegend: false,
      height: 300
    }

    const config = {
      displayModeBar: false,
      responsive: true
    }

    // Graphique Répartition par Services (Pie Chart)
    if (statistiques.repartitions?.par_services) {
      const servicesData = statistiques.repartitions.par_services.slice(0, 5)
      const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#6B7280']
      
      const servicesTrace: any = {
        type: 'pie',
        labels: servicesData.map((s: any) => s.service),
        values: servicesData.map((s: any) => s.count),
        marker: {
          colors: colors.slice(0, servicesData.length)
        },
        textinfo: 'label+percent',
        textposition: 'outside',
        hole: 0.4,
        hoverinfo: 'label+value+percent',
        hovertemplate: '<b>%{label}</b><br>Plaintes: %{value}<br>Pourcentage: %{percent}<extra></extra>'
      }

      Plotly.newPlot(servicesChartRef.current, [servicesTrace], {
        ...layout,
        title: {
          text: '🏥 Répartition par Services',
          font: { size: 16, color: '#374151' }
        }
      } as any, config)
    }

    // Graphique Répartition par Priorités (Bar Chart)
    if (statistiques.repartitions?.par_priorites) {
      const prioritiesData = statistiques.repartitions.par_priorites
      const priorityColors = {
        'URGENT': '#EF4444',
        'ELEVE': '#F97316', 
        'MOYEN': '#10B981',
        'BAS': '#F59E0B'
      }
      
      const prioritiesTrace: any = {
        type: 'bar',
        x: prioritiesData.map((p: any) => p.priorite),
        y: prioritiesData.map((p: any) => p.count),
        marker: {
          color: prioritiesData.map((p: any) => priorityColors[p.priorite as keyof typeof priorityColors] || '#6B7280'),
          line: {
            color: 'white',
            width: 1
          }
        },
        text: prioritiesData.map((p: any) => p.count),
        textposition: 'auto',
        hoverinfo: 'x+y',
        hovertemplate: '<b>%{x}</b><br>Plaintes: %{y}<extra></extra>'
      }

      Plotly.newPlot(prioritiesChartRef.current, [prioritiesTrace], {
        ...layout,
        title: {
          text: '🎯 Répartition par Priorités',
          font: { size: 16, color: '#374151' }
        },
        xaxis: {
          title: 'Priorité',
          tickangle: 0
        },
        yaxis: {
          title: 'Nombre de plaintes'
        }
      } as any, config)
    }

    // Graphique Performance IA (Gauge Chart)
    if (statistiques.statistiques_detaillees?.ia_performance) {
      const iaData = statistiques.statistiques_detaillees.ia_performance
      const tauxApprobation = iaData.taux_approbation_pct || 0
      
      const performanceTrace: any = {
        type: 'indicator',
        mode: 'gauge+number+delta',
        value: tauxApprobation,
        domain: { x: [0, 1], y: [0, 1] },
        title: { 
          text: 'Taux d\'Approbation IA (%)',
          font: { size: 14, color: '#374151' }
        },
        delta: { reference: 70 },
        gauge: {
          axis: { range: [null, 100] },
          bar: { color: '#3B82F6' },
          bgcolor: 'white',
          borderwidth: 2,
          bordercolor: 'gray',
          steps: [
            { range: [0, 50], color: '#EF4444' },
            { range: [50, 75], color: '#F59E0B' },
            { range: [75, 100], color: '#10B981' }
          ],
          threshold: {
            line: { color: 'red', width: 4 },
            thickness: 0.75,
            value: 90
          }
        }
      }

      Plotly.newPlot(performanceChartRef.current, [performanceTrace], {
        ...layout,
        title: {
          text: '🤖 Performance IA',
          font: { size: 16, color: '#374151' }
        },
        height: 350
      } as any, config)
    }

    // Cleanup function
    return () => {
      if (servicesChartRef.current) {
        Plotly.purge(servicesChartRef.current)
      }
      if (prioritiesChartRef.current) {
        Plotly.purge(prioritiesChartRef.current)
      }
      if (performanceChartRef.current) {
        Plotly.purge(performanceChartRef.current)
      }
    }
  }, [statistiques])

  if (!statistiques) {
    return null
  }

  return (
    <div className="space-y-8">
      <h2 className="text-lg font-medium text-gray-900">📈 Graphiques et Répartitions</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Répartition par Services - Graphique Plotly */}
        <div className="bg-white shadow rounded-lg p-6">
          <div ref={servicesChartRef} className="w-full h-80"></div>
        </div>

        {/* Répartition par Priorités - Graphique Plotly */}
        <div className="bg-white shadow rounded-lg p-6">
          <div ref={prioritiesChartRef} className="w-full h-80"></div>
        </div>

        {/* Performance IA - Graphique Plotly */}
        <div className="bg-white shadow rounded-lg p-6">
          <div ref={performanceChartRef} className="w-full h-80"></div>
        </div>

        {/* Statistiques Détaillées */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">📊 Statistiques Détaillées</h3>
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Plaintes</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Total:</span>
                  <span className="ml-2 font-medium">{statistiques.statistiques_detaillees?.plaintes?.total || 0}</span>
                </div>
                <div>
                  <span className="text-gray-500">En attente:</span>
                  <span className="ml-2 font-medium">{statistiques.statistiques_detaillees?.plaintes?.en_attente || 0}</span>
                </div>
                <div>
                  <span className="text-gray-500">En cours:</span>
                  <span className="ml-2 font-medium">{statistiques.statistiques_detaillees?.plaintes?.en_cours || 0}</span>
                </div>
                <div>
                  <span className="text-gray-500">Traitées (mois):</span>
                  <span className="ml-2 font-medium">{statistiques.statistiques_detaillees?.plaintes?.traitees_mois || 0}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Fichiers</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Total:</span>
                  <span className="ml-2 font-medium">{statistiques.statistiques_detaillees?.fichiers?.total || 0}</span>
                </div>
                <div>
                  <span className="text-gray-500">En attente:</span>
                  <span className="ml-2 font-medium">{statistiques.statistiques_detaillees?.fichiers?.en_attente_traitement || 0}</span>
                </div>
                <div>
                  <span className="text-gray-500">Traités:</span>
                  <span className="ml-2 font-medium">{statistiques.statistiques_detaillees?.fichiers?.traites || 0}</span>
                </div>
                <div>
                  <span className="text-gray-500">Taux:</span>
                  <span className="ml-2 font-medium">{statistiques.statistiques_detaillees?.fichiers?.taux_traitement_pct || 0}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filtres appliqués */}
      {Object.entries(filters).some(([key, value]) => value && key !== 'organisation_id') && (
        <div className="bg-blue-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-900 mb-2">Filtres appliqués aux graphiques :</h3>
          <div className="flex flex-wrap gap-2">
            {Object.entries(filters).map(([key, value]) => {
              if (value && key !== 'organisation_id') {
                return (
                  <span
                    key={key}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {key}: {value}
                  </span>
                )
              }
              return <React.Fragment key={key}></React.Fragment>
            })}
          </div>
        </div>
      )}
    </div>
  )
} 