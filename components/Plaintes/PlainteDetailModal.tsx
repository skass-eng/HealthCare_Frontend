'use client'

import React, { useState, useEffect } from 'react'
import { 
  XMarkIcon, 
  DocumentTextIcon, 
  UserIcon, 
  CalendarIcon,
  ClockIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  PaperAirplaneIcon,
  SparklesIcon,
  DocumentIcon,
  EyeIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline'
import { apiUnified, Plainte } from '@/lib/api-unified'

interface PlainteDetailModalProps {
  plainte: Plainte | null
  isOpen: boolean
  onClose: () => void
  onStatusUpdate?: (plainteId: string, newStatus: string) => void
}

interface StatusStep {
  id: string
  label: string
  icon: string
  color: string
  bgColor: string
}

const STATUS_STEPS: StatusStep[] = [
  { id: 'RECU', label: 'Reçu', icon: '📬', color: 'text-blue-600', bgColor: 'bg-blue-100' },
  { id: 'EN_COURS', label: 'En Cours', icon: '⏳', color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
  { id: 'TRAITE', label: 'Traité', icon: '✅', color: 'text-green-600', bgColor: 'bg-green-100' },
  { id: 'CLOTURE', label: 'Clôturé', icon: '🔒', color: 'text-gray-600', bgColor: 'bg-gray-100' }
]

export default function PlainteDetailModal({ 
  plainte, 
  isOpen, 
  onClose, 
  onStatusUpdate 
}: PlainteDetailModalProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [aiResponse, setAiResponse] = useState<string>('')
  const [generatingResponse, setGeneratingResponse] = useState(false)
  const [documents, setDocuments] = useState<any[]>([])
  const [loadingDocuments, setLoadingDocuments] = useState(false)

  useEffect(() => {
    if (plainte) {
      // Déterminer l'étape actuelle basée sur le statut
      const statusIndex = STATUS_STEPS.findIndex(step => step.id === plainte.status)
      setCurrentStep(statusIndex >= 0 ? statusIndex : 0)
      
      // Charger les documents liés
      loadDocuments()
    }
  }, [plainte])

  const loadDocuments = async () => {
    if (!plainte) return
    
    try {
      setLoadingDocuments(true)
      // TODO: Implémenter l'API pour récupérer les documents liés
      // const docs = await apiUnified.getPlainteDocuments(plainte.plainte_id)
      // setDocuments(docs)
      
      // Mock data pour l'instant
      setDocuments([
        { id: 1, name: 'plainte_originale.pdf', type: 'pdf', size: '2.3 MB', date: '2025-07-18' },
        { id: 2, name: 'analyse_ia.json', type: 'json', size: '15 KB', date: '2025-07-18' }
      ])
    } catch (error) {
      console.error('Erreur lors du chargement des documents:', error)
    } finally {
      setLoadingDocuments(false)
    }
  }

  const generateAIResponse = async () => {
    if (!plainte) return
    
    try {
      setGeneratingResponse(true)
      const suggestions = await apiUnified.getPlainteSuggestions(plainte.plainte_id)
      
      if (suggestions?.suggestions_par_type?.reponse?.[0]?.contenu) {
        setAiResponse(suggestions.suggestions_par_type.reponse[0].contenu)
      } else {
        setAiResponse('Aucune réponse IA générée pour le moment.')
      }
    } catch (error) {
      console.error('Erreur lors de la génération de la réponse IA:', error)
      setAiResponse('Erreur lors de la génération de la réponse IA.')
    } finally {
      setGeneratingResponse(false)
    }
  }

  const handleStatusChange = (direction: 'next' | 'prev') => {
    if (!plainte || !onStatusUpdate) return
    
    const newStep = direction === 'next' 
      ? Math.min(currentStep + 1, STATUS_STEPS.length - 1)
      : Math.max(currentStep - 1, 0)
    
    const newStatus = STATUS_STEPS[newStep].id
    onStatusUpdate(plainte.plainte_id, newStatus)
    setCurrentStep(newStep)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'bg-red-100 text-red-800'
      case 'ELEVE': return 'bg-orange-100 text-orange-800'
      case 'MOYEN': return 'bg-yellow-100 text-yellow-800'
      case 'BAS': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (!isOpen || !plainte) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <DocumentTextIcon className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Détails de la plainte
              </h2>
              <p className="text-sm text-gray-500">{plainte.plainte_id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="p-6 space-y-6">
            {/* Titre et métadonnées */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                {plainte.titre}
              </h3>
              <div className="flex flex-wrap gap-2 mb-3">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(plainte.priorite)}`}>
                  {plainte.priorite}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {plainte.status ? plainte.status.replace('_', ' ') : 'N/A'}
                </span>
                {plainte.service && (
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    {plainte.service}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <CalendarIcon className="w-4 h-4" />
                  Créé le {formatDate(plainte.date_creation)}
                </div>
                {plainte.date_limite_reponse && (
                  <div className="flex items-center gap-1">
                    <ClockIcon className="w-4 h-4" />
                    Limite: {formatDate(plainte.date_limite_reponse)}
                  </div>
                )}
              </div>
            </div>

            {/* Informations du plaignant */}
            {(plainte.nom_plaignant || plainte.email_plaignant || plainte.telephone_plaignant) && (
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <UserIcon className="w-5 h-5 text-blue-600" />
                  Informations du plaignant
                </h4>
                <div className="space-y-2 text-sm">
                  {plainte.nom_plaignant && (
                    <p><span className="font-medium">Nom:</span> {plainte.nom_plaignant}</p>
                  )}
                  {plainte.email_plaignant && (
                    <p><span className="font-medium">Email:</span> {plainte.email_plaignant}</p>
                  )}
                  {plainte.telephone_plaignant && (
                    <p><span className="font-medium">Téléphone:</span> {plainte.telephone_plaignant}</p>
                  )}
                </div>
              </div>
            )}

            {/* Résumé et description */}
            <div className="space-y-4">
              {plainte.contenu_resume && (
                <div>
                  <h4 className="text-md font-semibold text-gray-900 mb-2">Résumé</h4>
                  <p className="text-gray-700 bg-yellow-50 p-3 rounded-lg">
                    {plainte.contenu_resume}
                  </p>
                </div>
              )}
              
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-2">Description complète</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {plainte.description || plainte.contenu_original || 'Aucune description disponible'}
                  </p>
                </div>
              </div>
            </div>

            {/* Progression du statut */}
            <div>
              <h4 className="text-md font-semibold text-gray-900 mb-4">Progression du traitement</h4>
              <div className="relative">
                {/* Barre de progression */}
                <div className="flex items-center justify-between mb-4">
                  {STATUS_STEPS.map((step, index) => (
                    <div key={step.id} className="flex flex-col items-center flex-1 relative">
                      {/* Ligne de connexion */}
                      {index < STATUS_STEPS.length - 1 && (
                        <div className="absolute top-6 left-1/2 w-full h-0.5 bg-gray-200 -z-10">
                          {index < currentStep && (
                            <div className="h-full bg-green-500 rounded-full transition-all duration-300"></div>
                          )}
                          {index === currentStep && (
                            <div className="h-full bg-blue-500 rounded-full transition-all duration-300 animate-pulse"></div>
                          )}
                        </div>
                      )}

                      {/* Cercle de statut */}
                      <div className={`
                        w-12 h-12 rounded-full flex items-center justify-center text-lg font-medium transition-all duration-300
                        ${index < currentStep ? 'bg-green-500 text-white' : 
                          index === currentStep ? 'bg-blue-500 text-white' : 
                          'bg-gray-200 text-gray-500'}
                      `}>
                        {step.icon}
                      </div>

                      {/* Label */}
                      <span className={`
                        text-xs font-medium text-center mt-2 uppercase tracking-wide
                        ${index < currentStep ? 'text-green-600' : 
                          index === currentStep ? 'text-blue-600' : 
                          'text-gray-400'}
                      `}>
                        {step.label}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Boutons de navigation */}
                <div className="flex justify-center gap-4">
                  <button
                    onClick={() => handleStatusChange('prev')}
                    disabled={currentStep === 0}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ArrowLeftIcon className="w-4 h-4" />
                    Précédent
                  </button>
                  <button
                    onClick={() => handleStatusChange('next')}
                    disabled={currentStep === STATUS_STEPS.length - 1}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Suivant
                    <ArrowRightIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Documents liés */}
            <div>
              <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <DocumentIcon className="w-5 h-5 text-gray-600" />
                Documents liés
              </h4>
              {loadingDocuments ? (
                <div className="animate-pulse space-y-2">
                  {[1, 2].map(i => (
                    <div key={i} className="h-12 bg-gray-200 rounded-lg"></div>
                  ))}
                </div>
              ) : documents.length > 0 ? (
                <div className="space-y-2">
                  {documents.map(doc => (
                    <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <DocumentIcon className="w-5 h-5 text-gray-500" />
                        <div>
                          <p className="font-medium text-gray-900">{doc.name}</p>
                          <p className="text-sm text-gray-500">{doc.size} • {doc.date}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                          <EyeIcon className="w-4 h-4 text-gray-600" />
                        </button>
                        <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                          <ArrowDownTrayIcon className="w-4 h-4 text-gray-600" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">Aucun document lié à cette plainte</p>
              )}
            </div>

            {/* Génération de réponse IA */}
            <div>
              <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <SparklesIcon className="w-5 h-5 text-purple-600" />
                Réponse IA
              </h4>
              <div className="space-y-3">
                <button
                  onClick={generateAIResponse}
                  disabled={generatingResponse}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 disabled:opacity-50 transition-all duration-200"
                >
                  <SparklesIcon className="w-4 h-4" />
                  {generatingResponse ? 'Génération en cours...' : 'Générer une réponse IA'}
                </button>
                
                {aiResponse && (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h5 className="font-medium text-purple-900 mb-2">Réponse suggérée :</h5>
                    <p className="text-purple-800 whitespace-pre-wrap">{aiResponse}</p>
                    <div className="flex gap-2 mt-3">
                      <button className="flex items-center gap-2 px-3 py-1 bg-purple-500 text-white text-sm rounded hover:bg-purple-600 transition-colors">
                        <PaperAirplaneIcon className="w-4 h-4" />
                        Utiliser cette réponse
                      </button>
                      <button className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300 transition-colors">
                        Modifier
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 