'use client'

import React, { useState, useEffect } from 'react'
import { 
  ChartBarIcon, 
  ChartPieIcon, 
  ArrowTrendingUpIcon, 
  ClockIcon
} from '@heroicons/react/24/outline'
import VueEnsemble from './VueEnsemble'
import ParService from './ParService'
import Tendances from './Tendances'
import Performance from './Performance'

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

interface AnalyticsContentProps {
  selectedPeriod?: '7j' | '30j' | '90j'
  className?: string
}

export default function AnalyticsContent({ selectedPeriod = '30j', className = '' }: AnalyticsContentProps) {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'services' | 'trends' | 'performance'>('overview')
  const [analyticsLoading, setAnalyticsLoading] = useState(false)

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

  if (analyticsLoading) {
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
    <div className={`space-y-4 lg:space-y-8 min-w-0 ${className}`}>
      {/* Tabs */}
      <div className="bg-white/95 backdrop-blur-2xl rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-500 p-2">
        <div className="flex gap-1">
          {[
            { id: 'overview', label: 'Vue d\'ensemble', icon: ChartBarIcon },
            { id: 'services', label: 'Par Service', icon: ChartPieIcon },
            { id: 'trends', label: 'Tendances', icon: ArrowTrendingUpIcon },
            { id: 'performance', label: 'Performance', icon: ClockIcon }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-3 text-sm rounded-xl transition-all duration-300 font-medium ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg transform scale-105'
                  : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50 hover:shadow-md'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Contenu des tabs */}
      <div className="space-y-6">
        {activeTab === 'overview' && (
          <VueEnsemble analyticsData={analyticsData} />
        )}

        {activeTab === 'services' && (
          <ParService analyticsData={analyticsData} />
        )}

        {activeTab === 'trends' && (
          <Tendances analyticsData={analyticsData} />
        )}

        {activeTab === 'performance' && (
          <Performance analyticsData={analyticsData} />
        )}
      </div>
    </div>
  )
} 