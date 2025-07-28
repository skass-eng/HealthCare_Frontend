'use client'

import { useEffect } from 'react'
import { useAppStore } from '@/store'
import { ServiceStat } from '@/types'
import TrendsPanel from './TrendsPanel'
import ServiceSuggestionsPanel from './ServiceSuggestionsPanel'

interface ImprovementItem {
  service: string
  count: number
  description: string
  color: string
}

// Descriptions d'amélioration par service
const improvementDescriptions = {
  'Cardiologie': 'Réduire les temps d\'attente: mise en place d\'un système de rendez-vous plus efficace',
  'Urgences': 'Améliorer l\'hygiène: audit hebdomadaire + formation équipe nettoyage',
  'Pédiatrie': 'Communication parents: création de supports visuels explicatifs',
  'Chirurgie': 'Suivi post-opératoire: améliorer la communication avec les patients',
  'Radiologie': 'Optimiser les délais de rendu: mise en place d\'un système de priorisation',
  'Oncologie': 'Améliorer l\'accompagnement psychologique: formation des équipes',
  'Neurologie': 'Réduire les temps d\'attente: optimisation des créneaux de consultation',
  'Orthopédie': 'Améliorer la rééducation: partenariat avec des centres spécialisés'
}

function ImprovementCard({ item }: { item: ImprovementItem }) {
  const colorStyles = {
    cardiologie: { 
      bg: 'bg-red-50', 
      border: 'border border-red-200', 
      text: 'text-red-700', 
      badge: 'bg-red-100 text-red-700',
      accent: 'bg-red-500'
    },
    urgences: { 
      bg: 'bg-orange-50', 
      border: 'border border-orange-200', 
      text: 'text-orange-700', 
      badge: 'bg-orange-100 text-orange-700',
      accent: 'bg-orange-500'
    },
    pediatrie: { 
      bg: 'bg-green-50', 
      border: 'border border-green-200', 
      text: 'text-green-700', 
      badge: 'bg-green-100 text-green-700',
      accent: 'bg-green-500'
    },
    chirurgie: { 
      bg: 'bg-blue-50', 
      border: 'border border-blue-200', 
      text: 'text-blue-700', 
      badge: 'bg-blue-100 text-blue-700',
      accent: 'bg-blue-500'
    },
    radiologie: { 
      bg: 'bg-purple-50', 
      border: 'border border-purple-200', 
      text: 'text-purple-700', 
      badge: 'bg-purple-100 text-purple-700',
      accent: 'bg-purple-500'
    },
    oncologie: { 
      bg: 'bg-pink-50', 
      border: 'border border-pink-200', 
      text: 'text-pink-700', 
      badge: 'bg-pink-100 text-pink-700',
      accent: 'bg-pink-500'
    },
    neurologie: { 
      bg: 'bg-indigo-50', 
      border: 'border border-indigo-200', 
      text: 'text-indigo-700', 
      badge: 'bg-indigo-100 text-indigo-700',
      accent: 'bg-indigo-500'
    },
    orthopedie: { 
      bg: 'bg-teal-50', 
      border: 'border border-teal-200', 
      text: 'text-teal-700', 
      badge: 'bg-teal-100 text-teal-700',
      accent: 'bg-teal-500'
    },
    general: { 
      bg: 'bg-gradient-to-r from-blue-50 to-purple-50', 
      border: 'border border-blue-200', 
      text: 'text-slate-700', 
      badge: 'bg-gradient-to-r from-blue-100 to-purple-100 text-slate-700',
      accent: 'bg-gradient-to-r from-blue-500 to-purple-500'
    }
  }

  const style = colorStyles[item.color as keyof typeof colorStyles]

  return (
    <div className={`p-3 lg:p-4 m-2 lg:m-3 rounded-lg ${style.bg} ${style.border} relative overflow-hidden`}>
      {/* Accent color dot instead of border */}
      <div className={`absolute top-3 left-3 w-2 h-2 ${style.accent} rounded-full`}></div>
      
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-2 pl-6">
        <strong className={`${style.text} text-sm lg:text-base truncate`}>{item.service}</strong>
        <span className={`px-2 lg:px-3 py-1 rounded-full text-xs font-medium ${style.badge} flex-shrink-0`}>
          {item.count} plainte{item.count > 1 ? 's' : ''}
        </span>
      </div>
      <p className="text-slate-600 text-xs lg:text-sm leading-relaxed pl-6 line-clamp-2">{item.description}</p>
    </div>
  )
}

export default function SuggestionsPanel() {
  const { ui, loading, errors, actions } = useAppStore()
  
  // Convertir les données du store en format ImprovementItem
  const improvements: ImprovementItem[] = (ui.activeTab === 'improvements' ? [] : []).map((serviceStat: any) => {
    const serviceName = serviceStat.display_name
    const description = improvementDescriptions[serviceName as keyof typeof improvementDescriptions] || 
                      'Amélioration en cours d\'analyse pour ce service'
    
    // Mapper les noms de service vers les couleurs
    const colorMap: { [key: string]: string } = {
      'Cardiologie': 'cardiologie',
      'Urgences': 'urgences',
      'Pédiatrie': 'pediatrie',
      'Chirurgie': 'chirurgie',
      'Radiologie': 'radiologie',
      'Oncologie': 'oncologie',
      'Neurologie': 'neurologie',
      'Orthopédie': 'orthopedie'
    }
    
    return {
      service: serviceName,
      count: serviceStat.count,
      description: description,
      color: colorMap[serviceName] || 'general'
    }
  })

  if (loading.suggestions) {
    return (
      <div className="suggestions-panel">
        <div className="tab-container">
          <button className="tab-button active">Améliorations</button>
          <button className="tab-button">Suggestions IA</button>
          <button className="tab-button">Tendances</button>
        </div>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                <div className="h-4 bg-gradient-to-r from-blue-100 to-purple-100 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded w-full mb-2"></div>
                <div className="h-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (errors.suggestions) {
    return (
      <div className="suggestions-panel">
        <div className="tab-container">
          <button className="tab-button active">Améliorations</button>
          <button className="tab-button">Suggestions IA</button>
          <button className="tab-button">Tendances</button>
        </div>
        <div className="p-6 text-center">
          <p className="text-red-500">❌ {errors.suggestions}</p>
          <p className="text-sm text-gray-500 mt-2">Vérifiez que le backend est en marche</p>
        </div>
      </div>
    )
  }

  return (
    <div className="suggestions-panel">
      {/* Tabs */}
      <div className="tab-container">
        <button
          onClick={() => actions.setActiveTab('improvements')}
          className={`tab-button ${ui.activeTab === 'improvements' ? 'active' : ''}`}
        >
          💡 Améliorations
        </button>
        <button
          onClick={() => actions.setActiveTab('suggestions')}
          className={`tab-button ${ui.activeTab === 'suggestions' ? 'active' : ''}`}
        >
          🤖 Suggestions IA
        </button>
        <button
          onClick={() => actions.setActiveTab('trends')}
          className={`tab-button ${ui.activeTab === 'trends' ? 'active' : ''}`}
        >
          📈 Tendances
        </button>
      </div>

      {/* Content */}
      <div className="p-0">
        {ui.activeTab === 'improvements' ? (
          <div>
            {/* Improvements List */}
            <div className="divide-y divide-gray-200/30">
              {improvements.length > 0 ? (
                improvements.map((item, index) => (
                  <ImprovementCard key={index} item={item} />
                ))
              ) : (
                <div className="p-6 text-center text-gray-500">
                  <p>Aucune donnée d'amélioration disponible</p>
                  <p className="text-sm mt-1">Les données apparaîtront après traitement des plaintes</p>
                </div>
              )}
            </div>

            {/* AI Analytics */}
            <div className="ai-analytics-section">
              <div className="ai-card">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="text-2xl">🤖</span>
                  <strong className="font-semibold">IA Analytics</strong>
                </div>
                <p className="text-sm opacity-90 leading-relaxed">
                  Tendance détectée: augmentation des plaintes liées aux temps d'attente (+15% ce mois)
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                <button className="ai-button">
                  📊 Voir le rapport complet
                </button>
                <button 
                  onClick={() => actions.setShowGlobalServiceSelector(true)}
                  className="ai-button bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                >
                  🚀 Lancer analyse IA
                </button>
              </div>
            </div>
          </div>
        ) : ui.activeTab === 'suggestions' ? (
          <div className="p-6">
            <ServiceSuggestionsPanel />
          </div>
        ) : (
          <div className="p-6">
            <TrendsPanel />
          </div>
        )}
      </div>
    </div>
  )
} 