'use client'

import { useState, useEffect } from 'react'
import { apiUnified } from '@/lib/api-unified'
import { Plainte, ServiceEnum, PrioriteEnum } from '@/types'
import { ChevronDownIcon } from '@heroicons/react/24/outline'
import { API_CONFIG } from '@/lib/api-config'

const serviceDisplayNames = {
  [ServiceEnum.CARDIOLOGIE]: 'Cardiologie',
  [ServiceEnum.URGENCES]: 'Urgences',
  [ServiceEnum.PEDIATRIE]: 'Pédiatrie',
  [ServiceEnum.CHIRURGIE]: 'Chirurgie',
  [ServiceEnum.RADIOLOGIE]: 'Radiologie',
  [ServiceEnum.ONCOLOGIE]: 'Oncologie',
  [ServiceEnum.NEUROLOGIE]: 'Neurologie',
  [ServiceEnum.ORTHOPEDIE]: 'Orthopédie'
}

const priorityDisplayNames = {
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

// Fonction pour obtenir le début de la semaine (lundi)
const getStartOfWeek = () => {
  const today = new Date()
  const dayOfWeek = today.getDay()
  const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1 // 0 = dimanche, 1 = lundi
  const startOfWeek = new Date(today)
  startOfWeek.setDate(today.getDate() - daysToSubtract)
  startOfWeek.setHours(0, 0, 0, 0)
  return startOfWeek.toISOString()
}

// Fonction pour formater la date
const formatDate = (dateStr?: string) => {
  if (!dateStr) return 'Non défini'
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function PlainteCard({ plainte }: { plainte: Plainte }) {
  const serviceColors = {
    [ServiceEnum.CARDIOLOGIE]: 'service-cardiologie',
    [ServiceEnum.URGENCES]: 'service-urgences',
    [ServiceEnum.PEDIATRIE]: 'service-pediatrie',
    [ServiceEnum.CHIRURGIE]: 'service-chirurgie',
    [ServiceEnum.RADIOLOGIE]: 'service-general',
    [ServiceEnum.ONCOLOGIE]: 'service-general',
    [ServiceEnum.NEUROLOGIE]: 'service-general',
    [ServiceEnum.ORTHOPEDIE]: 'service-general'
  }

  const priorityColors = {
    [PrioriteEnum.URGENT]: 'priority-urgent',
    [PrioriteEnum.ELEVE]: 'priority-eleve',
    [PrioriteEnum.MOYEN]: 'priority-moyen',
    [PrioriteEnum.BAS]: 'priority-faible'
  }

  const daysInfo = calculateDaysRemaining(plainte.date_limite_reponse)

  return (
    <div className={`p-4 lg:p-6 border-b border-gray-200/30 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50 transition-colors relative ${daysInfo.isOverdue ? 'overdue-card' : ''}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 mb-3">
        <span className="font-semibold text-slate-800 text-sm lg:text-base truncate">{plainte.plainte_id}</span>
        <div className="flex items-center gap-3 flex-wrap">
          {plainte.service && (
            <span className={`service-tag ${serviceColors[plainte.service]} flex-shrink-0`}>
              {serviceDisplayNames[plainte.service]}
            </span>
          )}
          <span className={`px-2 py-1 rounded-xl text-xs font-semibold ${priorityColors[plainte.priorite]} flex-shrink-0`}>
            {priorityDisplayNames[plainte.priorite]}
          </span>
          {daysInfo.isOverdue && (
            <span className="bg-red-500 text-white text-xs px-3 py-1 rounded-full font-bold flex-shrink-0">
              ⚠️ EN RETARD
            </span>
          )}
        </div>
      </div>

      {/* Title and Content */}
      <h4 className="font-medium text-slate-800 mb-2 text-sm lg:text-base truncate">{plainte.titre}</h4>
      <p className="text-slate-600 text-xs lg:text-sm mb-3 leading-relaxed line-clamp-3">
        {plainte.contenu_resume || plainte.contenu_original?.substring(0, 200) + '...' || 'Contenu en cours d\'analyse...'}
      </p>

      {/* Metadata */}
      {(plainte.nom_plaignant || plainte.email_plaignant) && (
        <div className="mb-3">
          <p className="text-xs text-slate-500">
            {plainte.nom_plaignant && `Plaignant: ${plainte.nom_plaignant}`}
            {plainte.email_plaignant && ` • ${plainte.email_plaignant}`}
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs mb-3 gap-2">
        <div className="flex flex-wrap gap-2 sm:gap-4">
          <span className="text-blue-500 font-medium truncate">📅 Créé: {formatDate(plainte.date_creation)}</span>
          <span className={`font-medium truncate ${daysInfo.isOverdue ? 'text-red-600 font-bold' : 'text-green-500'}`}>
            ⏰ {daysInfo.text}
          </span>
        </div>
      </div>
    </div>
  )
}

export default function PlaintesSemaine() {
  const [selectedService, setSelectedService] = useState<string>('all')
  const [plaintes, setPlaintes] = useState<Plainte[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPlaintesSemaine = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const startOfWeek = getStartOfWeek()
        
        const filters: any = {
          page: 1,
          limit: 50,
          date_debut: startOfWeek,
          statut: 'RECU'
        }
        
        if (selectedService !== 'all') {
          filters.service = selectedService as ServiceEnum
        }

        const data = await apiUnified.getPlaintesList(filters)
        setPlaintes(data.plaintes || [])
      } catch (err) {
        console.error('Erreur lors du chargement des plaintes de la semaine:', err)
        setError('Erreur lors du chargement des plaintes')
        setPlaintes([])
      } finally {
        setLoading(false)
      }
    }

    fetchPlaintesSemaine()
  }, [selectedService])

  // Compter les plaintes en retard
  const overduePlaintes = plaintes.filter(plainte => 
    calculateDaysRemaining(plainte.date_limite_reponse).isOverdue
  )

  // Obtenir le début et la fin de la semaine pour l'affichage
  const getWeekRange = () => {
    const startOfWeek = getStartOfWeek()
    const startDate = new Date(startOfWeek)
    const endDate = new Date()
    
    return {
      start: startDate.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
      end: endDate.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
    }
  }

  const weekRange = getWeekRange()

  if (loading) {
    return (
      <div className="glass-card">
        <div className="flex justify-between items-center p-6 border-b border-gray-200/30">
          <h3 className="text-xl font-semibold text-slate-800">Plaintes de la semaine</h3>
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
        <p className="text-sm text-gray-500 mt-2">Vérifiez que le backend est en marche sur {API_CONFIG.BACKEND_URL}</p>
      </div>
    )
  }

  return (
    <div className="glass-card">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center p-4 lg:p-6 border-b border-gray-200/30 gap-3">
        <div className="flex flex-col gap-1">
          <h3 className="text-lg lg:text-xl font-semibold text-slate-800">
            Plaintes de la semaine ({plaintes.length})
          </h3>
          <p className="text-sm text-slate-600">
            Du {weekRange.start} au {weekRange.end}
          </p>
          {overduePlaintes.length > 0 && (
            <p className="text-red-600 text-sm font-medium">
              ⚠️ {overduePlaintes.length} plainte{overduePlaintes.length > 1 ? 's' : ''} en retard
            </p>
          )}
        </div>
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

      {/* Plaintes List */}
      <div className="divide-y divide-gray-200/30">
        {plaintes.length > 0 ? (
          plaintes.map((plainte) => (
            <PlainteCard key={plainte.id} plainte={plainte} />
          ))
        ) : (
          <div className="p-8 text-center text-gray-500">
            <p>Aucune plainte reçue cette semaine</p>
            <p className="text-sm mt-1">Les plaintes apparaîtront ici dès qu'elles seront créées</p>
          </div>
        )}
      </div>
    </div>
  )
} 