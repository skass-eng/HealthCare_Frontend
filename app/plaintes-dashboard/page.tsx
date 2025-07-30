'use client'

import React, { useState, useEffect } from 'react'
import { buildApiUrl, API_CONFIG } from '@/lib/api-config'
import { useAppStore } from '@/store'
import DashboardUnifiedPlaintes from '@/components/Dashboard/DashboardUnifiedPlaintes'
import { 
  ArrowDownTrayIcon, 
  PlusIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline'

export default function PlaintesDashboardPage() {
  const { ui: { selectedService }, actions } = useAppStore()
  
  // État pour les données
  const [plaintes, setPlaintes] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeType, setActiveType] = useState('recu')
  const [pagination, setPagination] = useState({
    total: 0,
    currentPage: 1,
    limit: 20
  })
  const [stats, setStats] = useState({
    total: 0,
    enCours: 0,
    resolues: 0,
    tempsMoyen: '0j'
  })



  // Charger les statistiques globales
  const loadGlobalStats = async () => {
    try {
      console.log('Chargement des statistiques...')
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
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error)
      // Valeurs par défaut en cas d'erreur
      setStats({
        total: 0,
        enCours: 0,
        resolues: 0,
        tempsMoyen: '0j'
      })
    }
  }

  // Charger les plaintes
  const loadPlaintes = async (type = activeType, page = 1) => {
    setLoading(true) // Démarrer le loading
    try {
      const params = new URLSearchParams()
      params.append('page', page.toString())
      params.append('limit', '20')

      console.log('Chargement des plaintes:', type)
      // Utiliser les bons endpoints backend avec le préfixe correct
      const endpoint = `/api/v1/dashboard/plaintes/${type}`
      const response = await fetch(buildApiUrl(endpoint, Object.fromEntries(params)))
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('Données reçues:', data)
      setPlaintes(data.plaintes || [])
      
      // Mettre à jour les informations de pagination
      setPagination({
        total: data.total || 0,
        currentPage: data.page || 1,
        limit: data.limit || 20
      })
    } catch (error) {
      console.error('Erreur lors du chargement des plaintes:', error)
      setPlaintes([]) // Tableau vide en cas d'erreur
    } finally {
      setLoading(false) // Arrêter le loading dans tous les cas
    }
  }

  // Fonction pour gérer le changement de type de plainte
  const handleTypeChange = (type: string) => {
    console.log('Changement de type vers:', type)
    setActiveType(type)
    loadPlaintes(type, 1)
  }

  // Effet pour recharger les données
  useEffect(() => {
    loadGlobalStats()
    loadPlaintes()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des plaintes...</p>
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
                  Gestionnaire de Plaintes
                </h1>
                <p className="mt-1 text-sm lg:text-base text-slate-700 font-medium">
                  Interface Agent - Suivi et Validation des Réclamations
                </p>
                {/* Badge de statut */}
                <div className="mt-2 inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-2 py-1 rounded-full text-xs font-semibold shadow-lg">
                  <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                  <span>Gestion Active</span>
                </div>
              </div>
            </div>
            
            {/* Boutons d'action */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => actions.openExportModal()}
                className="px-4 py-2 bg-gradient-to-r from-slate-500 to-slate-600 text-white rounded-lg font-medium hover:from-slate-600 hover:to-slate-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2"
              >
                <ArrowDownTrayIcon className="h-5 w-5 text-white" />
                <span className="text-sm">Exporter</span>
              </button>
              
              <button
                onClick={() => actions.openPlainteModal()}
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
          {/* Suivi des plaintes */}
          <div className="bg-white/95 backdrop-blur-xl border border-white/20 rounded-xl p-4 shadow-lg">
            <DashboardUnifiedPlaintes
              plaintes={plaintes}
              filters={{}}
              filtresDisponibles={null}
              onLoadPlaintes={loadPlaintes}
              onFilterChange={() => {}}
              onReset={() => {}}
              loading={loading}
              activeType={activeType}
              onTypeChange={handleTypeChange}
              total={pagination.total}
              currentPage={pagination.currentPage}
              limit={pagination.limit}
            />
          </div>
        </div>
      </div>
    </div>
  )
} 