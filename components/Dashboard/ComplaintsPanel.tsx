'use client'

import { useState, useEffect } from 'react'
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import { apiUnified } from '@/lib/api-unified'
import { ServiceEnum, PrioriteEnum } from '@/types'
import { Plainte } from '@/lib/api-unified'

interface ComplaintItemWithSuggestions extends Plainte {
  aiSuggestion?: {
    response?: string
    actions?: string
  }
}

const serviceDisplayNames: Record<string, string> = {
  [ServiceEnum.CARDIOLOGIE]: 'Cardiologie',
  [ServiceEnum.URGENCES]: 'Urgences',
  [ServiceEnum.PEDIATRIE]: 'Pédiatrie',
  [ServiceEnum.CHIRURGIE]: 'Chirurgie',
  [ServiceEnum.RADIOLOGIE]: 'Radiologie',
  [ServiceEnum.ONCOLOGIE]: 'Oncologie',
  [ServiceEnum.NEUROLOGIE]: 'Neurologie',
  [ServiceEnum.ORTHOPEDIE]: 'Orthopédie'
}

const priorityDisplayNames: Record<string, string> = {
  [PrioriteEnum.URGENT]: 'Urgent',
  [PrioriteEnum.ELEVE]: 'Élevé',
  [PrioriteEnum.MOYEN]: 'Moyen',
  [PrioriteEnum.BAS]: 'Bas'
}

// Fonction pour calculer les jours restants
const calculateDaysRemaining = (dateLimite?: string) => {
  if (!dateLimite) return { days: 999, text: 'Non défini', isOverdue: false }
  
  const limitDate = new Date(dateLimite)
  const today = new Date()
  const diffTime = limitDate.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  let text = ''
  if (diffDays < 0) {
    text = `Dépassé de ${Math.abs(diffDays)} jours`
  } else if (diffDays === 0) {
    text = 'Aujourd\'hui'
  } else {
    text = `Reste: ${diffDays} jours`
  }
  
  return { days: diffDays, text, isOverdue: diffDays <= 0 }
}

// Fonction pour trier les plaintes par priorité (retard > jours restants > priorité)
const sortComplaintsByPriority = (complaints: Plainte[]) => {
  return [...complaints].sort((a, b) => {
    const aDays = calculateDaysRemaining(a.date_limite_reponse)
    const bDays = calculateDaysRemaining(b.date_limite_reponse)
    
    // 1. Plaintes en retard en premier (du plus en retard au moins en retard)
    if (aDays.isOverdue && !bDays.isOverdue) return -1
    if (!aDays.isOverdue && bDays.isOverdue) return 1
    
    // 2. Si les deux sont en retard, trier par nombre de jours de retard (plus de retard = plus prioritaire)
    if (aDays.isOverdue && bDays.isOverdue) {
      return aDays.days - bDays.days // Plus négatif = plus de retard
    }
    
    // 3. Si aucune n'est en retard, trier par nombre de jours restants (moins de jours = plus prioritaire)
    if (aDays.days !== bDays.days) {
      return aDays.days - bDays.days
    }
    
    // 4. Même nombre de jours restants, trier par priorité
    const priorityOrder: Record<string, number> = { 
      [PrioriteEnum.URGENT]: 4, 
      [PrioriteEnum.ELEVE]: 3, 
      [PrioriteEnum.MOYEN]: 2, 
      [PrioriteEnum.BAS]: 1 
    }
    const aPriority = priorityOrder[a.priorite] || 0
    const bPriority = priorityOrder[b.priorite] || 0
    
    return bPriority - aPriority // Priorité plus élevée en premier
  })
}

function ComplaintCard({ complaint }: { complaint: ComplaintItemWithSuggestions }) {
  const [suggestions, setSuggestions] = useState<any>(null)
  const [loadingSuggestions, setLoadingSuggestions] = useState(false)

  const serviceColors: Record<string, string> = {
    [ServiceEnum.CARDIOLOGIE]: 'service-cardiologie',
    [ServiceEnum.URGENCES]: 'service-urgences',
    [ServiceEnum.PEDIATRIE]: 'service-pediatrie',
    [ServiceEnum.CHIRURGIE]: 'service-chirurgie',
    [ServiceEnum.RADIOLOGIE]: 'service-general',
    [ServiceEnum.ONCOLOGIE]: 'service-general',
    [ServiceEnum.NEUROLOGIE]: 'service-general',
    [ServiceEnum.ORTHOPEDIE]: 'service-general'
  }

  const priorityColors: Record<string, string> = {
    [PrioriteEnum.URGENT]: 'priority-urgent',
    [PrioriteEnum.ELEVE]: 'priority-eleve',
    [PrioriteEnum.MOYEN]: 'priority-moyen',
    [PrioriteEnum.BAS]: 'priority-faible'
  }

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        setLoadingSuggestions(true)
        const data = await apiUnified.getPlainteSuggestions(complaint.plainte_id)
        setSuggestions(data)
      } catch (err) {
        console.error('Erreur lors du chargement des suggestions:', err)
      } finally {
        setLoadingSuggestions(false)
      }
    }

    if (complaint.plainte_id) {
      fetchSuggestions()
    }
  }, [complaint.plainte_id])

  const daysInfo = calculateDaysRemaining(complaint.date_limite_reponse)

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Non défini'
    return new Date(dateStr).toLocaleDateString('fr-FR')
  }

  // Extraire les suggestions de réponse et d'actions
  const getResponseSuggestion = () => {
    if (!suggestions?.suggestions_par_type) return null
    
    const responseSuggestions = suggestions.suggestions_par_type.reponse || []
    const actionSuggestions = suggestions.suggestions_par_type.action || []
    
    return {
      response: responseSuggestions[0]?.contenu || 'Aucune suggestion de réponse générée',
      actions: actionSuggestions[0]?.contenu || 'Aucune action suggérée'
    }
  }

  const suggestionData = getResponseSuggestion()

  return (
    <div className={`p-4 lg:p-6 border-b border-gray-200/30 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50 transition-colors relative ${daysInfo.isOverdue ? 'overdue-card' : ''}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 mb-3">
        <span className="font-semibold text-slate-800 text-sm lg:text-base truncate">{complaint.plainte_id}</span>
        <div className="flex items-center gap-3 flex-wrap">
          {complaint.service && (
            <span className={`service-tag ${serviceColors[complaint.service]} flex-shrink-0`}>
              {serviceDisplayNames[complaint.service]}
            </span>
          )}
          <span className={`px-2 py-1 rounded-xl text-xs font-semibold ${priorityColors[complaint.priorite]} flex-shrink-0`}>
            {priorityDisplayNames[complaint.priorite]}
          </span>
          {daysInfo.isOverdue && (
            <span className="bg-red-500 text-white text-xs px-3 py-1 rounded-full font-bold flex-shrink-0">
              ⚠️ EN RETARD
            </span>
          )}
        </div>
      </div>

      {/* Title and Content */}
      <h4 className="font-medium text-slate-800 mb-2 text-sm lg:text-base truncate">{complaint.titre}</h4>
      <p className="text-slate-600 text-xs lg:text-sm mb-3 leading-relaxed line-clamp-3">
        {complaint.contenu_resume || complaint.contenu_original?.substring(0, 200) + '...' || 'Contenu en cours d\'analyse...'}
      </p>

      {/* Metadata */}
      {(complaint.nom_plaignant || complaint.email_plaignant) && (
        <div className="mb-3">
          <p className="text-xs text-slate-500">
            {complaint.nom_plaignant && `Plaignant: ${complaint.nom_plaignant}`}
            {complaint.email_plaignant && ` • ${complaint.email_plaignant}`}
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs mb-3 gap-2">
        <div className="flex flex-wrap gap-2 sm:gap-4">
          <span className="text-blue-500 font-medium truncate">📅 Créé: {formatDate(complaint.date_creation)}</span>
          <span className={`font-medium truncate ${daysInfo.isOverdue ? 'text-red-600 font-bold' : 'text-green-500'}`}>
            ⏰ {daysInfo.text}
          </span>
        </div>
      </div>

      {/* AI Suggestion */}
      <div className="ai-suggestion">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs">🤖</span>
          </div>
          <span className="text-blue-600 font-semibold text-sm">
            {loadingSuggestions ? 'Génération des suggestions IA...' : 'Suggestions IA de traitement'}
          </span>
        </div>
        {loadingSuggestions ? (
          <div className="animate-pulse">
            <div className="h-3 bg-gradient-to-r from-blue-100 to-purple-100 rounded w-full mb-2"></div>
            <div className="h-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded w-3/4"></div>
          </div>
        ) : suggestionData ? (
          <p className="text-slate-600 text-xs leading-relaxed">
            <strong>Réponse suggérée:</strong> {suggestionData.response}<br />
            <strong>Actions:</strong> {suggestionData.actions}
          </p>
        ) : (
          <p className="text-slate-500 text-xs italic">
            Suggestions IA en cours de génération...
          </p>
        )}
      </div>
    </div>
  )
}

export default function ComplaintsPanel() {
  const [selectedService, setSelectedService] = useState<string>('all')
  const [allComplaints, setAllComplaints] = useState<Plainte[]>([]) // Toutes les plaintes triées
  const [complaints, setComplaints] = useState<Plainte[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalComplaints, setTotalComplaints] = useState(0)
  const [pageSize] = useState(10) // 10 plaintes par page

  // Récupérer toutes les plaintes quand le service change
  useEffect(() => {
    const fetchAllComplaints = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Récupérer TOUTES les plaintes pour un tri global
        const filters: any = {
          page: 1,
          limit: 1000 // Récupérer un grand nombre de plaintes
        }
        
        if (selectedService !== 'all') {
          filters.service = selectedService as ServiceEnum
        }

        const data = await apiUnified.getPlaintesPrioritaires(filters)
        
        // Les plaintes sont déjà triées par le backend
        const allComplaints = data.plaintes || []
        
        // Debug: afficher les premiers éléments triés
        console.log('Plaintes triées par le backend:', allComplaints.slice(0, 5).map((c: Plainte) => ({
          id: c.plainte_id,
          days: calculateDaysRemaining(c.date_limite_reponse),
          priority: c.priorite
        })))
        
        setAllComplaints(allComplaints)
        setTotalComplaints(allComplaints.length)
        setCurrentPage(1) // Retour à la première page
      } catch (err) {
        console.error('Erreur lors du chargement des plaintes:', err)
        setError('Erreur lors du chargement des plaintes')
        setAllComplaints([])
      } finally {
        setLoading(false)
      }
    }

    fetchAllComplaints()
  }, [selectedService])

  // Pagination côté client quand la page change
  useEffect(() => {
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    const paginatedComplaints = allComplaints.slice(startIndex, endIndex)
    
    setComplaints(paginatedComplaints)
    setTotalPages(Math.ceil(allComplaints.length / pageSize))
  }, [allComplaints, currentPage, pageSize])

  // Compter les plaintes en retard
  const overdueComplaints = complaints.filter(complaint => 
    calculateDaysRemaining(complaint.date_limite_reponse).isOverdue
  )

  // Fonctions de navigation
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  if (loading) {
    return (
      <div className="glass-card">
        <div className="flex justify-between items-center p-6 border-b border-gray-200/30">
          <h3 className="text-xl font-semibold text-slate-800">Plaintes prioritaires</h3>
          <div className="w-32 h-8 bg-gradient-to-r from-blue-200 to-purple-200 rounded animate-pulse"></div>
        </div>
        <div className="divide-y divide-gray-200/30">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-6 animate-pulse">
              <div className="h-4 bg-gradient-to-r from-blue-100 to-purple-100 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded w-full mb-2"></div>
              <div className="h-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="glass-card p-6 text-center">
        <p className="text-red-500">❌ {error}</p>
        <p className="text-sm text-gray-500 mt-2">Vérifiez que le backend est en marche sur http://localhost:8000</p>
      </div>
    )
  }

  return (
    <div className="glass-card">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center p-4 lg:p-6 border-b border-gray-200/30 gap-3">
        <div className="flex flex-col gap-1">
          <h3 className="text-lg lg:text-xl font-semibold text-slate-800">
            Plaintes prioritaires ({totalComplaints})
          </h3>
          {overdueComplaints.length > 0 && (
            <p className="text-red-600 text-sm font-medium">
              ⚠️ {overdueComplaints.length} plainte{overdueComplaints.length > 1 ? 's' : ''} en retard sur cette page
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          {/* Pagination en haut */}
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              {/* Bouton Précédent */}
              <button
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                className={`p-2 rounded-lg border transition-all ${
                  currentPage === 1
                    ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                    : 'border-gray-300 text-gray-600 hover:bg-white hover:border-blue-500 hover:text-blue-600'
                }`}
              >
                <ChevronLeftIcon className="w-4 h-4" />
              </button>

              {/* Numéros de page */}
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum
                  if (totalPages <= 5) {
                    pageNum = i + 1
                  } else if (currentPage <= 3) {
                    pageNum = i + 1
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i
                  } else {
                    pageNum = currentPage - 2 + i
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                        currentPage === pageNum
                          ? 'bg-blue-500 text-white border-blue-500'
                          : 'border-gray-300 text-gray-600 hover:bg-white hover:border-blue-500 hover:text-blue-600'
                      }`}
                    >
                      {pageNum}
                    </button>
                  )
                })}
              </div>

              {/* Bouton Suivant */}
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className={`p-2 rounded-lg border transition-all ${
                  currentPage === totalPages
                    ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                    : 'border-gray-300 text-gray-600 hover:bg-white hover:border-blue-500 hover:text-blue-600'
                }`}
              >
                <ChevronRightIcon className="w-4 h-4" />
              </button>
            </div>
          )}
          
          <div className="custom-select-container w-full lg:w-auto">
            <select 
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              className="custom-select w-full lg:w-auto"
            >
              <option value="all">Tous les services</option>
              <option value={ServiceEnum.CARDIOLOGIE}>Cardiologie</option>
              <option value={ServiceEnum.URGENCES}>Urgences</option>
              <option value={ServiceEnum.PEDIATRIE}>Pédiatrie</option>
              <option value={ServiceEnum.CHIRURGIE}>Chirurgie</option>
              <option value={ServiceEnum.RADIOLOGIE}>Radiologie</option>
              <option value={ServiceEnum.ONCOLOGIE}>Oncologie</option>
              <option value={ServiceEnum.NEUROLOGIE}>Neurologie</option>
              <option value={ServiceEnum.ORTHOPEDIE}>Orthopédie</option>
            </select>
            <div className="custom-select-icon">
              <ChevronDownIcon className="w-4 h-4 text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Complaints List */}
      <div className="divide-y divide-gray-200/30">
        {complaints.length > 0 ? (
          complaints.map((complaint) => (
            <ComplaintCard key={complaint.id} complaint={complaint} />
          ))
        ) : (
          <div className="p-8 text-center text-gray-500">
            <p>Aucune plainte trouvée</p>
            <p className="text-sm mt-1">Essayez de changer le filtre de service ou uploadez des plaintes</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between p-4 lg:p-6 border-t border-gray-200/30 bg-gray-50/30">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>
              Page {currentPage} sur {totalPages} • {totalComplaints} plainte{totalComplaints > 1 ? 's' : ''} au total
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Bouton Précédent */}
            <button
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              className={`p-2 rounded-lg border transition-all ${
                currentPage === 1
                  ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                  : 'border-gray-300 text-gray-600 hover:bg-white hover:border-blue-500 hover:text-blue-600'
              }`}
            >
              <ChevronLeftIcon className="w-4 h-4" />
            </button>

            {/* Numéros de page */}
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum
                if (totalPages <= 5) {
                  pageNum = i + 1
                } else if (currentPage <= 3) {
                  pageNum = i + 1
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i
                } else {
                  pageNum = currentPage - 2 + i
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                      currentPage === pageNum
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'border-gray-300 text-gray-600 hover:bg-white hover:border-blue-500 hover:text-blue-600'
                    }`}
                  >
                    {pageNum}
                  </button>
                )
              })}
            </div>

            {/* Bouton Suivant */}
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className={`p-2 rounded-lg border transition-all ${
                currentPage === totalPages
                  ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                  : 'border-gray-300 text-gray-600 hover:bg-white hover:border-blue-500 hover:text-blue-600'
              }`}
            >
              <ChevronRightIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
} 