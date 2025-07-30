'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  ArrowLeftIcon,
  DocumentTextIcon, 
  UserIcon, 
  ClockIcon,
  ArrowRightIcon,
  PaperAirplaneIcon,
  SparklesIcon,
  DocumentIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  PencilIcon,
  XMarkIcon,
  CheckIcon
} from '@heroicons/react/24/outline'
import { apiUnified, Plainte } from '@/lib/api-unified'

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
  { id: 'TRAITE', label: 'Traité', icon: '✅', color: 'text-emerald-600', bgColor: 'bg-emerald-100' },
  { id: 'CLOTURE', label: 'Clôturé', icon: '🔒', color: 'text-slate-600', bgColor: 'bg-slate-100' }
]

interface EditFormData {
  titre: string
  description: string
  service: string
  priorite: string
  nom_plaignant: string
  prenom_plaignant: string
  telephone_plaignant: string
}

export default function PlainteDetailPage() {
  const params = useParams()
  const router = useRouter()
  const plainteId = params.id as string
  
  const [plainte, setPlainte] = useState<Plainte | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentStep, setCurrentStep] = useState(0)
  const [aiResponse, setAiResponse] = useState<string>('')
  const [generatingResponse, setGeneratingResponse] = useState(false)
  const [documents, setDocuments] = useState<any[]>([])
  const [loadingDocuments, setLoadingDocuments] = useState(false)
  
  // États pour l'édition
  const [showEditModal, setShowEditModal] = useState(false)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [editFormData, setEditFormData] = useState<EditFormData>({
    titre: '',
    description: '',
    service: '',
    priorite: '',
    nom_plaignant: '',
    prenom_plaignant: '',
    telephone_plaignant: ''
  })
  const [saving, setSaving] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState(false)

  // États pour l'édition inline
  const [editingSection, setEditingSection] = useState<string | null>(null)
  const [currentPriority, setCurrentPriority] = useState('HAUTE')
  const [currentStatus, setCurrentStatus] = useState('TRAITE')
  const [manualResponse, setManualResponse] = useState<string>('')
  const [showResponseEditor, setShowResponseEditor] = useState<boolean>(false)

  useEffect(() => {
    if (plainteId) {
      loadPlainte()
    }
  }, [plainteId])

  const loadPlainte = async () => {
    try {
      setLoading(true)
      const plainteData = await apiUnified.getPlainteById(plainteId)
      setPlainte(plainteData)
      
      const statusIndex = STATUS_STEPS.findIndex(step => step.id === plainteData.status)
      setCurrentStep(statusIndex >= 0 ? statusIndex : 0)
      
      loadDocuments()
    } catch (error) {
      console.error('Erreur lors du chargement de la plainte:', error)
      
      const testPlainte: Plainte = {
        id: 1,
        uuid: "test-uuid",
        plainte_id: plainteId,
        organisation_id: 1,
        titre: "Plainte de test - Temps d'attente",
        description: "Cette plainte concerne un temps d'attente trop long aux urgences. Le patient a attendu plus de 4 heures avant d'être pris en charge.",
        service: "Urgences",
        status: "EN_COURS",
        priorite: "HAUTE",
        mots_cles: ["urgences", "attente"],
        analyse_ia: {},
        date_creation: "2025-07-30T10:00:00Z",
        nom_plaignant: "Dupont Jean",
        telephone_plaignant: "0123456789"
      }
      
      setPlainte(testPlainte)
      setCurrentStep(1)
    } finally {
      setLoading(false)
    }
  }

  const loadDocuments = async () => {
    if (!plainte) return
    
    try {
      setLoadingDocuments(true)
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
    if (!plainte) return
    
    const newStep = direction === 'next' 
      ? Math.min(currentStep + 1, STATUS_STEPS.length - 1)
      : Math.max(currentStep - 1, 0)
    
    setCurrentStep(newStep)
    const newStatus = STATUS_STEPS[newStep].id
    console.log(`Mise à jour du statut vers: ${newStatus}`)
  }

  const openEditModal = () => {
    if (!plainte) return
    
    // Séparer le nom complet en nom et prénom
    const nameParts = (plainte.nom_plaignant || '').split(' ')
    const prenom = nameParts.slice(1).join(' ') || ''
    const nom = nameParts[0] || ''
    
    setEditFormData({
      titre: plainte.titre || '',
      description: plainte.description || '',
      service: plainte.service || '',
      priorite: plainte.priorite || '',
      nom_plaignant: nom,
      prenom_plaignant: prenom,
      telephone_plaignant: plainte.telephone_plaignant || ''
    })
    setShowEditModal(true)
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!plainte) return
    
    try {
      setSaving(true)
      
      const updatedPlainte = {
        ...plainte,
        ...editFormData
      }
      
      setPlainte(updatedPlainte)
      setShowEditModal(false)
      
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
    } finally {
      setSaving(false)
    }
  }

  const updateStatus = async (newStatus: string) => {
    if (!plainte) return
    
    try {
      setUpdatingStatus(true)
      
      const updatedPlainte = {
        ...plainte,
        status: newStatus
      }
      
      setPlainte(updatedPlainte)
      const statusIndex = STATUS_STEPS.findIndex(step => step.id === newStatus)
      setCurrentStep(statusIndex >= 0 ? statusIndex : 0)
      setShowStatusModal(false)
      
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error)
    } finally {
      setUpdatingStatus(false)
    }
  }

  const toggleEdit = (section: string) => {
    setEditingSection(editingSection === section ? null : section)
  }

  const cancelEdit = () => {
    setEditingSection(null)
  }

  const savePatientInfo = () => {
    // Logique de sauvegarde des informations patient
    setEditingSection(null)
    showNotification('Informations du patient mises à jour ✅')
  }

  const saveProgress = () => {
    // Logique de sauvegarde du statut
    setEditingSection(null)
    showNotification('Statut de progression mis à jour ✅')
  }

  const selectPriority = (priority: string) => {
    setCurrentPriority(priority)
  }

  const selectStatus = (status: string) => {
    setCurrentStatus(status)
  }

  const saveStatus = () => {
    if (!plainte) return
    
    setPlainte(prev => prev ? { ...prev, priorite: currentPriority } : null)
    setShowStatusModal(false)
    showNotification('Priorité mise à jour ✅')
  }

  const saveManualResponse = () => {
    if (!manualResponse.trim()) {
      showNotification('Veuillez saisir une réponse')
      return
    }
    
    setShowResponseEditor(false)
    showNotification('Réponse manuelle sauvegardée ✅')
  }

  const generateAIResponseAndFill = async () => {
    if (!plainte) return
    
    try {
      setGeneratingResponse(true)
      const suggestions = await apiUnified.getPlainteSuggestions(plainte.plainte_id)
      
      if (suggestions?.suggestions_par_type?.reponse?.[0]?.contenu) {
        setManualResponse(suggestions.suggestions_par_type.reponse[0].contenu)
        showNotification('Réponse IA générée et ajoutée au rédacteur ✅')
      } else {
        setManualResponse('Aucune réponse IA générée pour le moment.')
        showNotification('Aucune réponse IA disponible')
      }
    } catch (error) {
      console.error('Erreur lors de la génération de la réponse IA:', error)
      setManualResponse('Erreur lors de la génération de la réponse IA.')
      showNotification('Erreur lors de la génération IA')
    } finally {
      setGeneratingResponse(false)
    }
  }

  const showNotification = (message: string) => {
    // Créer une notification temporaire
    const notification = document.createElement('div')
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #51cf66, #40c057);
      color: white;
      padding: 15px 20px;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.1);
      z-index: 1001;
      font-weight: 600;
      transform: translateX(400px);
      transition: transform 0.3s ease;
    `
    notification.textContent = message
    document.body.appendChild(notification)

    setTimeout(() => {
      notification.style.transform = 'translateX(0)'
    }, 100)

    setTimeout(() => {
      notification.style.transform = 'translateX(400px)'
      setTimeout(() => {
        document.body.removeChild(notification)
      }, 300)
    }, 3000)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'haute':
        return 'bg-gradient-to-r from-red-500 to-red-600'
      case 'moyenne':
        return 'bg-gradient-to-r from-yellow-500 to-yellow-600'
      case 'basse':
        return 'bg-gradient-to-r from-emerald-500 to-emerald-600'
      default:
        return 'bg-gradient-to-r from-slate-500 to-slate-600'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'traite':
        return 'bg-gradient-to-r from-green-500 to-green-600'
      case 'en_cours':
        return 'bg-gradient-to-r from-blue-500 to-blue-600'
      case 'cloture':
        return 'bg-gradient-to-r from-slate-500 to-slate-600'
      default:
        return 'bg-gradient-to-r from-purple-500 to-purple-600'
    }
  }

  const handleBack = () => {
    router.back()
  }

  const getPatientInitials = (name: string) => {
    if (!name) return '?'
    const parts = name.split(' ')
    return parts.map(part => part.charAt(0)).join('').toUpperCase()
  }

  const getFullName = (nom: string, prenom: string) => {
    return `${nom} ${prenom}`.trim()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de la plainte...</p>
        </div>
      </div>
    )
  }

  if (!plainte) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Plainte non trouvée</h2>
          <p className="text-gray-600 mb-6">La plainte demandée n'existe pas ou a été supprimée.</p>
          <button
            onClick={handleBack}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retour
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-6xl mx-auto p-5">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={handleBack}
                className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-xl flex items-center justify-center transition-all duration-300 transform hover:scale-105 hover:shadow-lg shadow-md"
              >
                <ArrowLeftIcon className="h-6 w-6 text-white" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Plainte #{plainte.plainte_id}
                </h1>
                <p className="text-gray-500 text-sm">
                  Créée le {formatDate(plainte.date_creation)}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <span className={`px-4 py-2 rounded-full text-sm font-semibold text-white ${getPriorityColor(plainte.priorite)}`}>
                {plainte.priorite}
              </span>
              <span className={`px-4 py-2 rounded-full text-sm font-semibold text-white ${getStatusColor(plainte.status)}`}>
                {STATUS_STEPS.find(s => s.id === plainte.status)?.label}
              </span>
              <button
                onClick={() => setShowStatusModal(true)}
                className="w-8 h-8 text-blue-600 hover:bg-blue-50 rounded-lg flex items-center justify-center transition-colors"
                title="Modifier le statut"
              >
                <PencilIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Contenu principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Colonne principale */}
          <div className="lg:col-span-2 space-y-6">
            {/* Informations de base */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                  <DocumentTextIcon className="h-6 w-6 text-blue-600" />
                  Informations de la plainte
                </h2>
                <button
                  onClick={() => toggleEdit('complaint-info')}
                  className="w-8 h-8 text-blue-600 hover:bg-blue-50 rounded-lg flex items-center justify-center transition-colors"
                  title="Modifier"
                >
                  <PencilIcon className="h-4 w-4" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Titre</label>
                  <p className="text-lg font-semibold text-gray-900">{plainte.titre}</p>
                </div>
                
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Service</label>
                  <p className="text-lg font-semibold text-gray-900">{plainte.service}</p>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-xl border-l-4 border-blue-500">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Description</label>
                <p className="text-gray-800 leading-relaxed">{plainte.description}</p>
              </div>
            </div>

            {/* Progression du statut */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                  <ClockIcon className="h-6 w-6 text-blue-600" />
                  Progression du traitement
                </h2>
                <button
                  onClick={() => toggleEdit('progress')}
                  className="w-8 h-8 text-blue-600 hover:bg-blue-50 rounded-lg flex items-center justify-center transition-colors"
                  title="Modifier le statut"
                >
                  <PencilIcon className="h-4 w-4" />
                </button>
              </div>
              
              {editingSection !== 'progress' ? (
                <div>
                  <div className="flex items-center justify-between relative mb-8">
                    <div className="absolute top-1/2 left-12 right-12 h-1 bg-gradient-to-r from-blue-500 to-blue-500 rounded-full"></div>
                    {STATUS_STEPS.map((step, index) => (
                      <div key={step.id} className="relative z-10">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-semibold ${
                          index <= currentStep 
                            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg' 
                            : 'bg-gray-100 text-gray-400 border-2 border-gray-200'
                        }`}>
                          {index <= currentStep ? step.icon : step.icon}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex justify-between text-xs text-gray-500">
                    {STATUS_STEPS.map(step => (
                      <span key={step.id}>{step.label}</span>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Changer le statut</label>
                    
                    {/* Progression raffinée */}
                    <div className="flex items-center justify-between relative mb-4">
                      <div className="absolute top-1/2 left-10 right-10 h-0.5 bg-gray-200 rounded-full"></div>
                      {STATUS_STEPS.map((step, index) => (
                        <div key={step.id} className="relative z-10 flex flex-col items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                            index < currentStep 
                              ? 'bg-green-500 text-white shadow-md' 
                              : index === currentStep
                              ? 'bg-blue-500 text-white shadow-lg'
                              : 'bg-gray-200 text-gray-500 border-2 border-gray-300'
                          }`}>
                            {index + 1}
                          </div>
                          
                          <span className="text-xs text-gray-600 mt-1 font-medium">{step.label}</span>
                        </div>
                      ))}
                    </div>
                    
                    {/* Indicateur d'étape actuelle */}
                    <div className="text-center mb-3">
                      <p className="text-xs text-gray-600">
                        Étape {currentStep + 1} sur {STATUS_STEPS.length} - {STATUS_STEPS[currentStep].label}
                      </p>
                    </div>
                    
                    {/* Boutons de navigation raffinés */}
                    <div className="flex gap-2 mb-3">
                      <button
                        onClick={() => handleStatusChange('prev')}
                        disabled={currentStep === 0}
                        className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
                      >
                        <ArrowLeftIcon className="h-3 w-3" />
                        Précédent
                      </button>
                      
                      <button
                        onClick={() => handleStatusChange('next')}
                        disabled={currentStep === STATUS_STEPS.length - 1}
                        className="flex-1 px-3 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
                      >
                        Suivant
                        <ArrowRightIcon className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Bouton de sauvegarde */}
                  <button
                    onClick={saveProgress}
                    className="w-full px-4 py-3 bg-green-500 text-white rounded-lg text-sm font-semibold hover:bg-green-600 transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <CheckIcon className="h-4 w-4" />
                    Sauvegarder
                  </button>
                </div>
              )}
            </div>

            {/* Réponse IA */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3 mb-6">
                <SparklesIcon className="h-6 w-6 text-blue-600" />
                Rédaction de réponse
              </h2>
              
              <div className="bg-gray-50 rounded-xl p-6">
                <p className="mb-4 text-gray-700">Rédigez une réponse personnalisée ou utilisez l'IA pour générer une réponse basée sur les meilleures pratiques.</p>
                
                {!showResponseEditor ? (
                  <div className="space-y-3">
                    <button
                      onClick={() => setShowResponseEditor(true)}
                      className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all flex items-center justify-center gap-2"
                    >
                      <PencilIcon className="h-5 w-5" />
                      Rédiger une réponse manuelle
                    </button>
                    
                    <button
                      onClick={generateAIResponseAndFill}
                      disabled={generatingResponse}
                      className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-600 hover:to-purple-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {generatingResponse ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      ) : (
                        <SparklesIcon className="h-5 w-5" />
                      )}
                      {generatingResponse ? 'Génération en cours...' : 'Générer avec l\'IA'}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <textarea
                      value={manualResponse}
                      onChange={(e) => setManualResponse(e.target.value)}
                      placeholder="Rédigez votre réponse ici..."
                      className="w-full h-32 p-4 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 resize-none"
                    />
                    
                    <div className="flex gap-3">
                      <button
                        onClick={saveManualResponse}
                        className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-4 py-2 rounded-xl font-semibold hover:from-emerald-600 hover:to-emerald-700 transition-all flex items-center justify-center gap-2"
                      >
                        <CheckIcon className="h-4 w-4" />
                        Sauvegarder
                      </button>
                      
                      <button
                        onClick={() => setShowResponseEditor(false)}
                        className="flex-1 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 px-4 py-2 rounded-xl font-semibold hover:from-gray-200 hover:to-gray-300 transition-all flex items-center justify-center gap-2"
                      >
                        <XMarkIcon className="h-4 w-4" />
                        Annuler
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Informations du patient */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <UserIcon className="h-6 w-6 text-blue-600" />
                  <h2 className="text-xl font-bold text-gray-900">Patient</h2>
                </div>
                <button
                  onClick={() => toggleEdit('patient-info')}
                  className="w-8 h-8 text-blue-600 hover:bg-blue-50 rounded-lg flex items-center justify-center transition-colors"
                  title="Modifier"
                >
                  <PencilIcon className="h-4 w-4" />
                </button>
              </div>
              
              {editingSection !== 'patient-info' ? (
                <div>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Nom</label>
                      <p className="text-base font-semibold text-gray-900">{plainte.nom_plaignant?.split(' ')[0] || ''}</p>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Prénom</label>
                      <p className="text-base font-semibold text-gray-900">{plainte.nom_plaignant?.split(' ').slice(1).join(' ') || ''}</p>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Téléphone</label>
                      <p className="text-base font-semibold text-gray-900">{plainte.telephone_plaignant}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Nom</label>
                    <input
                      type="text"
                      defaultValue={plainte.nom_plaignant?.split(' ')[0] || ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Prénom</label>
                    <input
                      type="text"
                      defaultValue={plainte.nom_plaignant?.split(' ').slice(1).join(' ') || ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Téléphone</label>
                    <input
                      type="tel"
                      defaultValue={plainte.telephone_plaignant}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                    />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={savePatientInfo}
                      className="flex-1 px-3 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg text-sm font-semibold hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg flex items-center justify-center gap-2"
                    >
                      <CheckIcon className="h-4 w-4" />
                      Sauvegarder
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="flex-1 px-3 py-2 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-lg text-sm font-semibold hover:from-gray-200 hover:to-gray-300 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg flex items-center justify-center gap-2"
                    >
                      <XMarkIcon className="h-4 w-4" />
                      Annuler
                    </button>
                  </div>
                </div>
              )}
            </div>



            {/* Documents */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3 mb-6">
                <DocumentIcon className="h-6 w-6 text-blue-600" />
                Documents liés
              </h2>
              
              <div className="text-center text-gray-500 py-8">
                <p>Aucun document lié pour le moment.</p>
              </div>
            </div>


            
          </div>
        </div>

        {/* Modal de changement de statut */}
        {showStatusModal && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowStatusModal(false)}
          >
            <div 
              className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Modifier la priorité</h2>
                <button
                  onClick={() => setShowStatusModal(false)}
                  className="w-8 h-8 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Priorité</label>
                    <div className="flex gap-3">
                      <button
                        onClick={() => selectPriority('HAUTE')}
                        className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                          currentPriority === 'HAUTE' ? 'bg-gradient-to-r from-red-500 to-red-600 text-white scale-105 shadow-lg' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        Haute
                      </button>
                      <button
                        onClick={() => selectPriority('MOYENNE')}
                        className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                          currentPriority === 'MOYENNE' ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white scale-105 shadow-lg' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        Moyenne
                      </button>
                      <button
                        onClick={() => selectPriority('BASSE')}
                        className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                          currentPriority === 'BASSE' ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white scale-105 shadow-lg' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        Faible
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={saveStatus}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-semibold hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg flex items-center justify-center"
                    title="Sauvegarder"
                  >
                    <CheckIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setShowStatusModal(false)}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-xl font-semibold hover:from-gray-200 hover:to-gray-300 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg flex items-center justify-center"
                    title="Annuler"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 