'use client'

import React, { useState, useEffect } from 'react'
import { useAppStore } from '@/store'
import DashboardUnifiedFilters from '@/components/Dashboard/DashboardUnifiedFilters'
import DashboardUnifiedPlaintes from '@/components/Dashboard/DashboardUnifiedPlaintes'

export default function PlaintesDashboardPage() {
  const { ui: { selectedService } } = useAppStore()
  
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
  const [plaintes, setPlaintes] = useState([])
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
        console.log('Chargement des filtres disponibles...')
        const response = await fetch('http://localhost:8000/api/v1/dashboard/filtres-disponibles')
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        console.log('Filtres reçus:', data)
        setFiltresDisponibles(data.filtres)
        setLoading(false) // Arrêter le loading une fois les filtres chargés
      } catch (error) {
        console.error('Erreur lors du chargement des filtres:', error)
        setLoading(false) // Arrêter le loading même en cas d'erreur
      }
    }

    loadFiltresDisponibles()
  }, [])

  // Charger les statistiques globales
  const loadGlobalStats = async () => {
    try {
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value.toString())
      })

      console.log('Chargement des statistiques avec params:', params.toString())
      const response = await fetch(`http://localhost:8000/api/v1/dashboard/statistiques?${params}`)
      
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

  // Charger les plaintes avec filtres
  const loadPlaintes = async (type = 'recu', page = 1) => {
    setLoading(true) // Démarrer le loading
    try {
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value.toString())
      })
      params.append('page', page.toString())
      params.append('limit', '20')

      console.log('Chargement des plaintes:', type, 'avec params:', params.toString())
      const response = await fetch(`http://localhost:8000/api/v1/dashboard/plaintes/${type}?${params}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('Données reçues:', data)
      setPlaintes(data.plaintes || [])
    } catch (error) {
      console.error('Erreur lors du chargement des plaintes:', error)
      setPlaintes([]) // Tableau vide en cas d'erreur
    } finally {
      setLoading(false) // Arrêter le loading dans tous les cas
    }
  }

  // Effet pour recharger les données quand les filtres changent
  useEffect(() => {
    if (filtresDisponibles) {
      loadGlobalStats()
      loadPlaintes()
    }
  }, [filters, filtresDisponibles])

  // Gestionnaire de changement de filtres
  const handleFilterChange = (filterName: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
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

  if (loading && !filtresDisponibles) {
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
    <div className="space-y-6 lg:space-y-8 min-w-0 p-6">
      {/* Header */}
      <div className="relative">
        {/* Effet de fond avec gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-pink-600/10 to-red-600/10 rounded-2xl blur-xl"></div>
        
        {/* Contenu du titre */}
        <div className="relative bg-white/80 backdrop-blur-sm border border-white/30 rounded-2xl p-6 shadow-2xl">
          <div className="flex items-center gap-4">
            {/* Icône avec effet */}
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-2xl">🛡️</span>
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl opacity-20 animate-pulse"></div>
            </div>
            
            {/* Texte du titre */}
            <div>
              <h1 className="text-4xl lg:text-5xl font-extrabold bg-gradient-to-r from-gray-900 via-purple-800 to-pink-800 bg-clip-text text-transparent leading-tight">
                Gestionnaire de Plaintes
              </h1>
              <p className="mt-2 text-lg lg:text-xl text-gray-700 font-medium">
                Interface Agent - Suivi et Validation des Réclamations
              </p>
              {/* Badge de statut */}
              <div className="mt-3 inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                <span>Gestion Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Barre de statistiques */}
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

      {/* Contenu principal */}
      <DashboardUnifiedPlaintes
        plaintes={plaintes}
        filters={filters}
        filtresDisponibles={filtresDisponibles}
        onLoadPlaintes={loadPlaintes}
        onFilterChange={handleFilterChange}
        onReset={resetFilters}
        loading={loading}
      />
    </div>
  )
} 