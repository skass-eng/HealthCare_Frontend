'use client'

import React, { useState, useEffect } from 'react'
import { DocumentTextIcon } from '@heroicons/react/24/outline'
import PlainteDetailModal from '@/components/Plaintes/PlainteDetailModal'
import DashboardUnifiedFilters from '@/components/Dashboard/DashboardUnifiedFilters'
import { Plainte } from '@/lib/api-unified'

interface DashboardUnifiedPlaintesProps {
  plaintes: any[]
  filters: any
  filtresDisponibles: any
  onLoadPlaintes: (type: string, page: number) => void
  onFilterChange: (filterName: string, value: string) => void
  onReset: () => void
  loading: boolean
}

export default function DashboardUnifiedPlaintes({
  plaintes,
  filters,
  filtresDisponibles,
  onLoadPlaintes,
  onFilterChange,
  onReset,
  loading
}: DashboardUnifiedPlaintesProps) {
  const [activeType, setActiveType] = useState('recu')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedPlainte, setSelectedPlainte] = useState<Plainte | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [notification, setNotification] = useState<{ show: boolean; message: string }>({
    show: false,
    message: ''
  })
  const [statusCounts, setStatusCounts] = useState({
    recu: 0,
    enCours: 0,
    traite: 0,
    cloture: 0
  })

  const handleTypeChange = (type: string) => {
    setActiveType(type)
    setCurrentPage(1)
    // Mapper les types vers les endpoints backend
    const endpointMap: { [key: string]: string } = {
      'recu': 'recu',
      'en-cours': 'en-cours',
      'traite': 'traite',
      'cloture': 'cloture'
    }
    onLoadPlaintes(endpointMap[type] || 'recu', 1)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    onLoadPlaintes(activeType, page)
  }

  const showNotification = (message: string) => {
    setNotification({ show: true, message })
    setTimeout(() => {
      setNotification({ show: false, message: '' })
    }, 3000)
  }

  const handleStatusUpdate = (plainteId: string, newStatus: number) => {
    // Ici vous pouvez ajouter la logique pour mettre à jour le statut
    console.log(`Mise à jour du statut pour ${plainteId} vers ${newStatus}`)
    showNotification('Statut mis à jour avec succès !')
  }

  const handlePlainteClick = (plainte: Plainte) => {
    setSelectedPlainte(plainte)
    setIsModalOpen(true)
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setSelectedPlainte(null)
  }

  const handleStatusUpdateInModal = (plainteId: string, newStatus: string) => {
    // Mettre à jour le statut de la plainte
    console.log(`Mise à jour du statut pour ${plainteId} vers ${newStatus}`)
    showNotification('Statut mis à jour avec succès !')
    
    // Fermer le modal après la mise à jour
    handleModalClose()
    
    // Recharger les plaintes pour refléter les changements
    onLoadPlaintes(activeType, currentPage)
  }

  // Charger les compteurs de statut
  const loadStatusCounts = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/v1/dashboard/statistiques')
      const data = await response.json()
      
      setStatusCounts({
        recu: data.nouvelles_plaintes || 0,
        enCours: data.en_cours_traitement || 0,
        traite: data.traitees_ce_mois || 0,
        cloture: data.plaintes_en_attente || 0 // Utiliser un autre champ si disponible
      })
    } catch (error) {
      console.error('Erreur lors du chargement des compteurs:', error)
    }
  }

  // Charger les compteurs au montage du composant
  useEffect(() => {
    loadStatusCounts()
  }, [])

  const getPriorityColor = (priorite: string) => {
    switch (priorite) {
      case 'URGENT':
        return 'bg-red-500 text-white'
      case 'ELEVE':
        return 'bg-orange-500 text-white'
      case 'MOYEN':
        return 'bg-yellow-500 text-white'
      case 'BAS':
        return 'bg-green-500 text-white'
      default:
        return 'bg-gray-500 text-white'
    }
  }

  const getStatusColor = (statut: string) => {
    switch (statut) {
      case 'RECU':
        return 'bg-blue-500 text-white'
      case 'EN_COURS':
        return 'bg-yellow-500 text-white'
      case 'TRAITE':
        return 'bg-green-500 text-white'
      case 'CLOTURE':
        return 'bg-emerald-500 text-white'
      default:
        return 'bg-gray-500 text-white'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  // Fonction pour déterminer le statut numérique basé sur le statut textuel
  const getStatusNumber = (statut: string) => {
    switch (statut) {
      case 'RECU':
        return 0
      case 'EN_COURS':
        return 1
      case 'TRAITE':
        return 2
      case 'CLOTURE':
        return 3
      default:
        return 0
    }
  }

  const statusLabels = ['Reçu', 'En Cours', 'Traité', 'Clôturé']
  const statusIcons = ['📨' as string, '⏳' as string, '✅' as string, '🔒' as string]

  const createComplaintCard = (plainte: any) => {
    const statusNumber = getStatusNumber(plainte.statut)
    const progressWidth = ((statusNumber + 1) / 4) * 100

    return (
      <div 
        key={plainte.id} 
        className="complaint-card cursor-pointer hover:shadow-lg transition-all duration-200"
        onClick={() => handlePlainteClick(plainte)}
      >
        {/* Header de la plainte */}
        <div className="flex justify-between items-center mb-5">
          <span className="font-semibold text-lg text-gray-800">{plainte.plainte_id}</span>
          <div className="flex gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(plainte.priorite)}`}>
              {plainte.priorite}
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(plainte.statut)}`}>
              {plainte.statut.replace('_', ' ')}
            </span>
          </div>
        </div>

        {/* Informations de la plainte */}
        <div className="mb-6 space-y-2">
          <p className="text-gray-600"><span className="font-medium text-gray-800">Type:</span> {plainte.type_service || 'N/A'}</p>
          <p className="text-gray-600"><span className="font-medium text-gray-800">Date:</span> {formatDate(plainte.date_creation)}</p>
          <p className="text-gray-600"><span className="font-medium text-gray-800">Service:</span> {plainte.service}</p>
          {plainte.categorie_principale && (
            <p className="text-gray-600"><span className="font-medium text-gray-800">Catégorie:</span> {plainte.categorie_principale}</p>
          )}
          {plainte.contenu && (
            <p className="text-gray-600"><span className="font-medium text-gray-800">Description:</span> {plainte.contenu}</p>
          )}
        </div>

        {/* Barre de progression */}
        <div className="mb-6">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-800 relative"
              style={{ width: `${progressWidth}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Étapes de statut */}
        <div className="mb-6">
          <div className="flex justify-between items-center relative">
            {statusLabels.map((label, index) => {
              const isCompleted = index < statusNumber
              const isActive = index === statusNumber
              const isPending = index > statusNumber

              return (
                <div key={index} className="flex flex-col items-center flex-1 relative">
                  {/* Ligne de connexion */}
                  {index < statusLabels.length - 1 && (
                    <div className="absolute top-6 left-1/2 w-full h-0.5 bg-gray-200 -z-10">
                      {isCompleted && (
                        <div className="h-full bg-gradient-to-r from-green-500 to-green-500 rounded-full transition-all duration-800"></div>
                      )}
                      {isActive && (
                        <div className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-800 animate-pulse"></div>
                      )}
                    </div>
                  )}

                  {/* Cercle de statut */}
                  <div className={`
                    progress-step
                    ${isCompleted ? 'completed' : isActive ? 'active' : 'pending'}
                  `}>
                    <span>{statusIcons[index]}</span>
                    {/* Effet de brillance pour les étapes actives */}
                    {isActive && (
                      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
                    )}
                  </div>

                  {/* Label de l'étape */}
                  <span className={`
                    text-xs font-medium text-center uppercase tracking-wide
                    ${isCompleted 
                      ? 'text-green-600 font-semibold' 
                      : isActive 
                        ? 'text-blue-600 font-semibold' 
                        : 'text-gray-400'
                    }
                  `}>
                    {label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          {statusNumber < 3 && (
            <button 
              onClick={() => handleStatusUpdate(plainte.id, statusNumber + 1)}
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 px-4 rounded-full font-medium hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
            >
              Avancer
            </button>
          )}
          <button 
            onClick={(e) => {
              e.stopPropagation()
              handlePlainteClick(plainte)
            }}
            className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-full font-medium hover:bg-gray-200 transition-colors duration-200"
          >
            Voir détails →
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Notification */}
      {notification.show && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-slide-in-right">
          {notification.message}
        </div>
      )}

      {/* === COMPOSANT DE SUIVI DE STATUT PLEINE LARGEUR === */}
      <div className="w-full mb-8">
        <div className="relative">
          {/* Glow de fond */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-blue-600/20 rounded-2xl blur-xl" />

          {/* Carte pleine largeur */}
          <div className="relative bg-white/90 backdrop-blur-md border border-white/40 rounded-2xl p-8 shadow-2xl">

            {/* Titre du tracker */}
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-purple-800 to-pink-800 bg-clip-text text-transparent mb-2">
                Suivi des Plaintes
              </h3>
              <p className="text-gray-600 text-sm">
                Vue d'ensemble de l'état de traitement des plaintes
              </p>
            </div>

            {/* === RANGÉE DES CERCLES + LIGNE CENTRÉE === */}
            <div className="relative mb-8">
              {/* piste grise */}
              <div className="pointer-events-none absolute left-8 right-8 top-1/2 -translate-y-1/2 h-1 bg-gray-200 rounded-full z-0" />
              {/* remplissage progressif */}
              <div
                className="pointer-events-none absolute left-8 top-1/2 -translate-y-1/2 h-1 bg-gradient-to-r from-emerald-400 via-amber-400 to-teal-400 rounded-full z-0 transition-all duration-700"
                style={{ width: `calc(${((['recu', 'en-cours', 'traite', 'cloture'].indexOf(activeType) + 1) / 4) * 100}% * (100% - 4rem) / 100 + 2rem)` }} 
              />

              {/* rangée des cercles — hauteur = diamètre (16 = 64px) */}
              <div className="flex items-center justify-between relative gap-8 h-16 z-10">
                {[
                  { key: 'recu',     label: 'REÇU',     icon: '📨', activeColor: 'bg-emerald-400', inactiveColor: 'bg-gray-200', textColor: 'text-emerald-600', glowColor: 'shadow-emerald-400/50', description: 'Plaintes nouvellement reçues' },
                  { key: 'en-cours', label: 'EN COURS', icon: '⏳', activeColor: 'bg-amber-400',   inactiveColor: 'bg-gray-200', textColor: 'text-amber-600',   glowColor: 'shadow-amber-400/50', description: 'Plaintes en cours de traitement' },
                  { key: 'traite',   label: 'TRAITÉ',   icon: '✅', activeColor: 'bg-teal-400',    inactiveColor: 'bg-gray-200', textColor: 'text-teal-600',    glowColor: 'shadow-teal-400/50', description: 'Plaintes traitées avec succès' },
                  { key: 'cloture',  label: 'CLÔTURÉ',  icon: '🔒', activeColor: 'bg-slate-400',   inactiveColor: 'bg-gray-200', textColor: 'text-slate-600',   glowColor: 'shadow-slate-400/50', description: 'Plaintes clôturées définitivement' },
                ].map((type, idx) => {
                  const isActive = activeType === type.key;
                  return (
                    <div key={type.key} className="relative flex-1 flex flex-col items-center justify-center">

                      {/* cercle */}
                      <button
                        onClick={() => handleTypeChange(type.key)}
                        className={[
                          "w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg mb-3",
                          "transition-all duration-700 transform hover:scale-110 relative z-20",
                          isActive
                            ? `${type.activeColor} shadow-2xl ${type.glowColor} ring-4 ring-white/30`
                            : `${type.inactiveColor} text-gray-500 hover:bg-gray-300 hover:scale-105`,
                        ].join(" ")}
                        aria-current={isActive ? "step" : undefined}
                        aria-label={type.label}
                      >
                        <span>{type.icon}</span>

                        {/* effets actifs */}
                        {isActive && (
                          <>
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent rounded-full animate-pulse" />
                            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-ping" />
                          </>
                        )}
                      </button>

                      {/* Label et description */}
                      <div className="text-center">
                        <button
                          onClick={() => handleTypeChange(type.key)}
                          className={`text-sm font-bold uppercase tracking-wide transition-all duration-300 mb-1 block ${
                            isActive ? `${type.textColor} scale-110` : "text-gray-400 hover:text-gray-500"
                          }`}
                        >
                          {type.label}
                        </button>
                        <p className="text-xs text-gray-500 leading-tight">
                          {type.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Statistiques détaillées */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
              <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-emerald-600">{statusCounts.recu}</div>
                <div className="text-sm text-emerald-700">Nouvelles plaintes</div>
              </div>
              <div className="bg-gradient-to-r from-amber-50 to-amber-100 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-amber-600">{statusCounts.enCours}</div>
                <div className="text-sm text-amber-700">En cours</div>
              </div>
              <div className="bg-gradient-to-r from-teal-50 to-teal-100 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-teal-600">{statusCounts.traite}</div>
                <div className="text-sm text-teal-700">Traitées</div>
              </div>
              <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-slate-600">{statusCounts.cloture}</div>
                <div className="text-sm text-slate-700">Clôturées</div>
              </div>
            </div>

            {/* === FILTRES INTÉGRÉS DANS LE SUIVI === */}
            <div className="mt-8 pt-6 border-t border-gray-200 relative z-10">
              <div className="relative z-20">
                <DashboardUnifiedFilters
                  filters={filters}
                  filtresDisponibles={filtresDisponibles}
                  onFilterChange={onFilterChange}
                  onReset={onReset}
                />
              </div>
            </div>

            {/* Barre de progression globale */}
            <div className="mt-6">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Progression globale</span>
                <span>{Math.round(((statusCounts.traite + statusCounts.cloture) / (statusCounts.recu + statusCounts.enCours + statusCounts.traite + statusCounts.cloture)) * 100)}%</span>
              </div>
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-400 via-amber-400 to-teal-400 rounded-full transition-all duration-1000"
                  style={{ 
                    width: `${Math.round(((statusCounts.traite + statusCounts.cloture) / (statusCounts.recu + statusCounts.enCours + statusCounts.traite + statusCounts.cloture)) * 100)}%` 
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Barre de progression des filtres - Version Premium */}
      {Object.entries(filters).some(([key, value]) => value && key !== 'organisation_id') && (
        <div className="relative mb-6">
          {/* Effet de fond avec gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-pink-600/10 to-blue-600/10 rounded-2xl blur-xl"></div>
          
          {/* Conteneur principal */}
          <div className="relative bg-white/90 backdrop-blur-md border border-white/40 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold bg-gradient-to-r from-gray-900 via-purple-800 to-pink-800 bg-clip-text text-transparent">
                Filtres Actifs
              </h3>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-gray-600">Filtrage en cours</span>
              </div>
            </div>
            
            {/* Barre de progression */}
            <div className="relative">
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full transition-all duration-1000 animate-pulse">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
                </div>
              </div>
            </div>
            
            {/* Filtres avec style premium */}
            <div className="mt-4 flex flex-wrap gap-3">
              {Object.entries(filters)
                .filter(([key, value]) => value && key !== 'organisation_id')
                .map(([key, value]) => (
                  <div
                    key={key}
                    className="relative bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-xl"></div>
                    <span className="relative font-semibold text-sm">
                      {key}: {String(value)}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Grille des plaintes */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="complaint-card animate-pulse">
              <div className="h-6 bg-gray-200 rounded mb-4"></div>
              <div className="space-y-2 mb-6">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
              <div className="h-2 bg-gray-200 rounded-full mb-6"></div>
              <div className="flex gap-2 mb-6">
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
              </div>
              <div className="flex gap-3">
                <div className="flex-1 h-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1 h-10 bg-gray-200 rounded-full"></div>
              </div>
            </div>
          ))}
        </div>
      ) : plaintes.length === 0 ? (
        <div className="text-center py-12">
          <DocumentTextIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg">Aucune plainte trouvée avec les filtres actuels</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plaintes.map(createComplaintCard)}
        </div>
      )}

      {/* Pagination */}
      {plaintes.length > 0 && (
        <div className="mt-8 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Page {currentPage} sur {Math.ceil(plaintes.length / 20)}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Précédent
            </button>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={plaintes.length < 20}
              className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Suivant
            </button>
          </div>
        </div>
      )}

      {/* Modal de détails de la plainte */}
      <PlainteDetailModal
        plainte={selectedPlainte}
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onStatusUpdate={handleStatusUpdateInModal}
      />
    </div>
  )
} 