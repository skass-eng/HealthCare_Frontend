'use client'

import React, { useState, useEffect } from 'react'
import { buildApiUrl, API_CONFIG } from '@/lib/api-config'
import { useAppStore } from '@/store'
import DashboardUnifiedStats from '@/components/Dashboard/DashboardUnifiedStats'
import ServicesOverview from '@/components/Dashboard/ServicesOverview'
import AnalyticsContent from '@/components/Analytics/AnalyticsContent'
import { apiUnified } from '@/lib/api-unified'
import { 
  ArrowDownTrayIcon, 
  PlusIcon,
  ShieldCheckIcon,
  ClipboardDocumentListIcon,
  PlayIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline'

export default function DashboardUnifiedPage() {
  const { ui: { selectedService }, actions } = useAppStore()
  
  // État pour les données
  const [statistiques, setStatistiques] = useState(null)
  const [loading, setLoading] = useState(true)

  const [stats, setStats] = useState({
    total: 0,
    enCours: 0,
    resolues: 0,
    tempsMoyen: '0j'
  })

  // Charger les statistiques
  const loadStatistiques = async () => {
    try {
      setLoading(true)
      const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.STATISTIQUES))
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('Statistiques reçues:', data)
      
      // Calculer le total en additionnant tous les statuts
      const total = (data.nouvelles_plaintes || 0) + (data.plaintes_en_attente || 0) + (data.en_cours_traitement || 0) + (data.traitees_ce_mois || 0)
      
      setStats({
        total: total,
        enCours: data.en_cours_traitement || 0,
        resolues: data.traitees_ce_mois || 0,
        tempsMoyen: '3.2j'
      })
      
      setStatistiques(data)
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error)
    } finally {
      setLoading(false)
    }
  }

  // Effet pour recharger les données
  useEffect(() => {
    loadStatistiques()
  }, [])

  // Gestionnaire de sélection de service
  const handleServiceSelect = (serviceType: string) => {
    // Mise à jour du service sélectionné dans le store
    actions.setSelectedService(serviceType)
  }

  // Gestionnaires pour la barre de navigation
  const handleRefresh = () => {
    loadStatistiques()
  }

  const handleExport = () => {
    actions.openExportModal()
  }

  const handleNewComplaint = () => {
    // Utiliser le modal global de création de plainte
    actions.openPlainteModal()
  }

  if (loading && !statistiques) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 lg:space-y-6 min-w-0 p-4">

      {/* Header */}
      <div className="relative">
        {/* Effet de fond avec gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-teal-600/10 to-emerald-600/10 rounded-xl blur-lg"></div>
        
        {/* Contenu du titre */}
        <div className="relative bg-white/80 backdrop-blur-sm border border-white/30 rounded-xl p-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Icône avec effet */}
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-teal-600 rounded-lg flex items-center justify-center shadow-lg">
                  <ShieldCheckIcon className="w-6 h-6 text-white" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-teal-500 rounded-lg opacity-20 animate-pulse"></div>
              </div>
              
              {/* Texte du titre */}
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-slate-800 via-blue-700 to-teal-700 bg-clip-text text-transparent leading-tight">
                  Vue d'Ensemble
                </h1>
                <p className="mt-1 text-sm lg:text-base text-slate-700 font-medium">
                  Interface Agent - Suivi et Validation des Réclamations
                </p>
                {/* Badge de statut */}
                <div className="mt-2 inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-2 py-1 rounded-full text-xs font-semibold shadow-lg">
                  <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                  <span>Système Actif</span>
                </div>
              </div>
            </div>
            
            {/* Boutons d'action */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleExport}
                className="px-4 py-2 bg-gradient-to-r from-slate-500 to-slate-600 text-white rounded-lg font-medium hover:from-slate-600 hover:to-slate-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2"
              >
                <ArrowDownTrayIcon className="h-5 w-5 text-white" />
                <span className="text-sm">Exporter</span>
              </button>
              
              <button
                onClick={handleNewComplaint}
                className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg font-medium hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2"
              >
                <PlusIcon className="h-5 w-5 text-white" />
                <span className="text-sm">Créer une plainte</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Contenu principal */}
      <div className="max-w-full mx-auto">
        <div className="space-y-6">
          {/* Vue d'ensemble des services */}
          <div className="bg-white/95 backdrop-blur-xl border border-white/20 rounded-xl p-4 shadow-lg">
            <ServicesOverview 
              selectedService={selectedService}
              onServiceSelect={handleServiceSelect}
            />
          </div>

          {/* Analytics Content */}
          <div className="bg-white/95 backdrop-blur-xl border border-white/20 rounded-xl p-4 shadow-lg">
            <AnalyticsContent selectedPeriod="30j" />
          </div>
        </div>
      </div>

    </div>
  )
} 