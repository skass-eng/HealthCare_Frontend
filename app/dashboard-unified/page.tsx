'use client'

import React, { useState, useEffect } from 'react'
import { useAppStore } from '@/store'
import DashboardUnifiedFilters from '@/components/Dashboard/DashboardUnifiedFilters'
import DashboardUnifiedStats from '@/components/Dashboard/DashboardUnifiedStats'
import ServicesOverview from '@/components/Dashboard/ServicesOverview'
import DashboardNavigationBar from '@/components/Dashboard/DashboardNavigationBar'
import AnalyticsContent from '@/components/Analytics/AnalyticsContent'
import { apiUnified } from '@/lib/api-unified'

export default function DashboardUnifiedPage() {
  const { ui: { selectedService }, actions } = useAppStore()
  
  // État pour les filtres
  const [filters, setFilters] = useState({
    type_service: '',
    categorie_principale: '',
    sous_categorie: '',
    priorite: '',
    statut: '',
    organisation_id: 1
  })

  // État pour les données
  const [statistiques, setStatistiques] = useState(null)
  const [filtresDisponibles, setFiltresDisponibles] = useState(null)
  const [loading, setLoading] = useState(true)

  const [stats, setStats] = useState({
    total: 0,
    enCours: 0,
    resolues: 0,
    tempsMoyen: '0j'
  })





  // Charger les filtres disponibles
  useEffect(() => {
    const loadFiltresDisponibles = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/v1/dashboard/filtres-disponibles')
        const data = await response.json()
        setFiltresDisponibles(data.filtres)
      } catch (error) {
        console.error('Erreur lors du chargement des filtres:', error)
      }
    }

    loadFiltresDisponibles()
  }, [])

  // Charger les statistiques avec filtres
  const loadStatistiques = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value.toString())
      })

      const response = await fetch(`http://localhost:8000/api/v1/dashboard/statistiques?${params}`)
      const data = await response.json()
      setStatistiques(data)
      
      // Calculer les statistiques pour les cartes
      const total = (data.nouvelles_plaintes || 0) + (data.plaintes_en_attente || 0) + (data.en_cours_traitement || 0) + (data.traitees_ce_mois || 0)
      
      setStats({
        total: total,
        enCours: data.en_cours_traitement || 0,
        resolues: data.traitees_ce_mois || 0,
        tempsMoyen: '3.2j'
      })
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error)
    } finally {
      setLoading(false)
    }
  }

  // Effet pour recharger les données quand les filtres changent
  useEffect(() => {
    if (filtresDisponibles) {
      loadStatistiques()
    }
  }, [filters, filtresDisponibles])

  // Gestionnaire de changement de filtres
  const handleFilterChange = (filterName: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }))
  }

  // Gestionnaire de sélection de service
  const handleServiceSelect = (serviceType: string) => {
    setFilters(prev => ({
      ...prev,
      type_service: serviceType
    }))
  }

  // Réinitialiser les filtres
  const resetFilters = () => {
    setFilters({
      type_service: '',
      categorie_principale: '',
      sous_categorie: '',
      priorite: '',
      statut: '',
      organisation_id: 1
    })
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
    <div className="space-y-6 lg:space-y-8 min-w-0 p-6">

                  {/* Header */}
      <div className="max-w-full mx-auto px-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="relative">
            {/* Effet de fond avec gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10 rounded-2xl blur-xl"></div>
            
            {/* Contenu du titre */}
            <div className="relative bg-white/80 backdrop-blur-sm border border-white/30 rounded-2xl p-6 shadow-2xl">
              <div className="flex items-center gap-4">
                {/* Icône avec effet */}
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-2xl">🛡️</span>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-500 rounded-xl opacity-20 animate-pulse"></div>
                </div>
                
                {/* Texte du titre */}
                <div>
                  <h1 className="text-4xl lg:text-5xl font-extrabold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent leading-tight">
                    Vue d'Ensemble
                  </h1>
                  <p className="mt-2 text-lg lg:text-xl text-gray-700 font-medium">
                    Interface Agent - Suivi et Validation des Réclamations
                  </p>
                  {/* Badge de statut */}
                  <div className="mt-3 inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    <span>Système Actif</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Barre de navigation */}
      <DashboardNavigationBar
        onRefresh={handleRefresh}
        onExport={handleExport}
        onNewComplaint={handleNewComplaint}
      />



      {/* Barre de statistiques */}
      <div className="max-w-full mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold">{stats.total}</div>
                <div className="text-blue-100 text-sm">Total Plaintes</div>
              </div>
              <div className="text-4xl">📋</div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold">{stats.enCours}</div>
                <div className="text-yellow-100 text-sm">En Cours</div>
              </div>
              <div className="text-4xl">⏳</div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold">{stats.resolues}</div>
                <div className="text-green-100 text-sm">Résolues</div>
              </div>
              <div className="text-4xl">✅</div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-indigo-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold">{stats.tempsMoyen}</div>
                <div className="text-indigo-100 text-sm">Temps Moyen</div>
              </div>
              <div className="text-4xl">⏱️</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="max-w-full mx-auto px-4">
        <DashboardUnifiedFilters
          filters={filters}
          filtresDisponibles={filtresDisponibles}
          onFilterChange={handleFilterChange}
          onReset={resetFilters}
        />
      </div>



              {/* Contenu principal */}
        <div className="max-w-full mx-auto px-4">
          <div className="space-y-8">
            {/* Vue d'ensemble des services */}
            <div className="bg-white/95 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-lg">
              <ServicesOverview 
                selectedService={filters.type_service}
                onServiceSelect={handleServiceSelect}
              />
            </div>

            {/* Analytics Content */}
            <div className="bg-white/95 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-lg">
              <AnalyticsContent selectedPeriod="30j" />
            </div>


          </div>
        </div>

    </div>
  )
} 