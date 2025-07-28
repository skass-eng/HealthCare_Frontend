'use client'

import { useState, useEffect, useRef } from 'react'
import { ServiceEnum, PrioriteEnum } from '@/types'
import { apiUnified } from '@/lib/api-unified'
import { useAppStore } from '@/store'
import { 
  XMarkIcon, 
  DocumentTextIcon, 
  CalendarIcon,
  BuildingOfficeIcon,
  FlagIcon,
  DocumentArrowUpIcon
} from '@heroicons/react/24/outline'
import FormulaireManuel from './FormulaireManuel';
import UploadPDF from './UploadPDF';

interface SimplePlaintePanelProps {
  onClose: () => void
  onSubmit: (data: any) => void
}

const serviceOptions = [
  { value: ServiceEnum.CARDIOLOGIE, label: 'Cardiologie', icon: '🫀' },
  { value: ServiceEnum.URGENCES, label: 'Urgences', icon: '🚨' },
  { value: ServiceEnum.PEDIATRIE, label: 'Pédiatrie', icon: '👶' },
  { value: ServiceEnum.CHIRURGIE, label: 'Chirurgie', icon: '⚕️' },
  { value: ServiceEnum.RADIOLOGIE, label: 'Radiologie', icon: '📷' },
  { value: ServiceEnum.ONCOLOGIE, label: 'Oncologie', icon: '🔬' },
  { value: ServiceEnum.NEUROLOGIE, label: 'Neurologie', icon: '🧠' },
  { value: ServiceEnum.ORTHOPEDIE, label: 'Orthopédie', icon: '🦴' }
]

const priorityOptions = [
  { value: PrioriteEnum.URGENT, label: 'Urgent', color: 'text-red-500', icon: '🔴' },
  { value: PrioriteEnum.ELEVE, label: 'Élevé', color: 'text-orange-500', icon: '🟠' },
  { value: PrioriteEnum.MOYEN, label: 'Moyen', color: 'text-yellow-500', icon: '🟡' },
  { value: PrioriteEnum.BAS, label: 'Bas', color: 'text-green-500', icon: '🟢' }
]

export default function SimplePlaintePanel({ onClose, onSubmit }: SimplePlaintePanelProps) {
  const { actions } = useAppStore()
  const [mode, setMode] = useState<'form' | 'pdf'>('form')
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [pdfLoading, setPdfLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    titre: '',
    contenu: '',
    service: ServiceEnum.CARDIOLOGIE,
    priorite: PrioriteEnum.MOYEN,
    nom_plaignant: '',
    prenom_plaignant: '',
    email_plaignant: '',
    telephone_plaignant: '',
    date_limite_reponse: ''
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{[key: string]: string}>({})
  
  const modalRef = useRef<HTMLDivElement>(null)

  // Gestionnaire pour fermer le modal en cliquant à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside, { passive: true })
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [onClose])

  // Empêcher le scroll du body quand le modal est ouvert
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {}

    // Validation du titre
    if (!formData.titre.trim()) {
      newErrors.titre = 'Le titre est obligatoire'
    } else if (formData.titre.trim().length < 5) {
      newErrors.titre = 'Le titre doit contenir au moins 5 caractères'
    } else if (formData.titre.trim().length > 100) {
      newErrors.titre = 'Le titre ne peut pas dépasser 100 caractères'
    }

    // Validation de la description
    if (!formData.contenu.trim()) {
      newErrors.contenu = 'La description est obligatoire'
    } else if (formData.contenu.trim().length < 20) {
      newErrors.contenu = 'La description doit contenir au moins 20 caractères'
    } else if (formData.contenu.trim().length > 2000) {
      newErrors.contenu = 'La description ne peut pas dépasser 2000 caractères'
    }

    // Validation du nom
    if (!formData.nom_plaignant.trim()) {
      newErrors.nom_plaignant = 'Le nom est obligatoire'
    } else if (formData.nom_plaignant.trim().length < 2) {
      newErrors.nom_plaignant = 'Le nom doit contenir au moins 2 caractères'
    }

    // Validation du prénom
    if (!formData.prenom_plaignant.trim()) {
      newErrors.prenom_plaignant = 'Le prénom est obligatoire'
    } else if (formData.prenom_plaignant.trim().length < 2) {
      newErrors.prenom_plaignant = 'Le prénom doit contenir au moins 2 caractères'
    }

    // Validation de l'email
    if (formData.email_plaignant.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.email_plaignant.trim())) {
        newErrors.email_plaignant = 'Format d\'email invalide'
      }
    }

    // Validation du téléphone
    if (formData.telephone_plaignant.trim()) {
      const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/
      if (!phoneRegex.test(formData.telephone_plaignant.trim())) {
        newErrors.telephone_plaignant = 'Format de téléphone invalide'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation avant soumission
    if (!validateForm()) {
      actions.showNotification('error', 'Veuillez corriger les erreurs dans le formulaire')
      return
    }

    setLoading(true)
    
    try {
      const dateLimite = formData.date_limite_reponse || 
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      
      const plainteData = {
        ...formData,
        nom_plaignant: `${formData.prenom_plaignant} ${formData.nom_plaignant}`.trim(),
        date_limite_reponse: dateLimite,
        statut: 'EN_ATTENTE_INFORMATION',
        date_creation: new Date().toISOString()
      }
      
      await onSubmit(plainteData)
      actions.showNotification('success', 'Plainte créée avec succès !')
      onClose()
    } catch (error) {
      console.error('Erreur lors de la création de la plainte:', error)
      actions.showNotification('error', 'Erreur lors de la création de la plainte')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Effacer l'erreur du champ modifié
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setPdfFile(selectedFile)
    }
  }

  const handlePdfSubmit = async () => {
    if (!pdfFile) return
    
    setPdfLoading(true)
    try {
      const metadata = {
        organisation_id: 1, // TODO: Récupérer l'organisation depuis le contexte
        service_id: 1, // TODO: Convertir ServiceEnum en ID
        priorite: formData.priorite.toString()
      }
      
      await apiUnified.uploadPlainte(pdfFile, metadata)
      actions.showNotification('success', 'PDF uploadé avec succès !')
      setTimeout(() => {
        onClose()
      }, 1500)
    } catch (error: any) {
      console.error('Erreur lors du traitement du PDF:', error)
      const errorMessage = error.response?.data?.detail || error.message || 'Erreur lors de l\'upload du PDF. Veuillez réessayer.'
      actions.showNotification('error', errorMessage)
    } finally {
      setPdfLoading(false)
    }
  }

  const selectedService = serviceOptions.find(s => s.value === formData.service)
  const selectedPriority = priorityOptions.find(p => p.value === formData.priorite)

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div 
        ref={modalRef}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col"
        style={{height: '90vh'}}
      >
        {/* Header Banner (fixe) */}
        <header className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white flex-shrink-0">
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <DocumentTextIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Nouvelle Plainte</h1>
                <p className="text-white/80">Remplissez le formulaire manuellement ou uploadez un PDF</p>
              </div>
            </div>
            <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
              <div className="bg-white/20 backdrop-blur-sm px-3 py-2 rounded-lg border border-white/30 flex items-center gap-2">
                <span className="text-sm">🫀</span>
                <span className="text-sm font-medium">Service {selectedService?.label}</span>
              </div>
              <div className="bg-white/20 backdrop-blur-sm px-3 py-2 rounded-lg border border-white/30 flex items-center gap-2">
                <span className="text-sm">🟡</span>
                <span className="text-sm font-medium">Priorité {selectedPriority?.label}</span>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center hover:bg-white/30 transition-colors"
              >
                <XMarkIcon className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        </header>

        {/* Section de sélection (fixe) */}
        <section style={{padding: 1}} className="flex-shrink-0">
          <div className="relative mb-4">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-50 to-transparent rounded-2xl"></div>
            <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-2 border border-purple-200/50">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-pulse"></div>
                <span className="text-sm font-semibold text-purple-700">🚀 Nouvelles fonctionnalités à venir</span>
              </div>
              <div className="flex gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => setMode('form')}
                  className={`group relative flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all duration-300 text-xs shadow ${
                    mode === 'form'
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white scale-105 shadow-blue-500/25'
                      : 'bg-white text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:shadow-xl hover:scale-105 border border-gray-200'
                  }`}
                  style={{minHeight: 48}}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                    mode === 'form' ? 'bg-white/20' : 'bg-gradient-to-br from-blue-100 to-purple-100'
                  }`}>
                    <DocumentTextIcon className={`w-4 h-4 ${mode === 'form' ? 'text-white' : 'text-blue-600'}`} />
                  </div>
                  <div className="text-left">
                    <div className="font-bold">✨ Formulaire manuel</div>
                    <div className={`text-xs ${mode === 'form' ? 'text-white/80' : 'text-gray-500'}`}>Saisie directe</div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setMode('pdf')}
                  className={`group relative flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all duration-300 text-xs shadow ${
                    mode === 'pdf'
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white scale-105 shadow-blue-500/25'
                      : 'bg-white text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:shadow-xl hover:scale-105 border border-gray-200'
                  }`}
                  style={{minHeight: 48}}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                    mode === 'pdf' ? 'bg-white/20' : 'bg-gradient-to-br from-blue-100 to-purple-100'
                  }`}>
                    <DocumentArrowUpIcon className={`w-4 h-4 ${mode === 'pdf' ? 'text-white' : 'text-blue-600'}`} />
                  </div>
                  <div className="text-left">
                    <div className="font-bold">📄 Upload PDF</div>
                    <div className={`text-xs ${mode === 'pdf' ? 'text-white/80' : 'text-gray-500'}`}>Traitement automatique</div>
                  </div>
                </button>
                {/* À partir d’une image */}
                <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 p-2 flex items-center gap-2 min-w-[180px] transition-all duration-300 hover:shadow-lg" style={{minHeight: 48}}>
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center">
                    {/* Icône image/photo */}
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" fill="none" />
                      <circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" fill="none" />
                      <path d="M21 15l-5-5L5 21" stroke="currentColor" fill="none" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-gray-700">🖼️ À partir d’une image</div>
                    <div className="text-xs text-gray-500">Importez une plainte via une photo</div>
                  </div>
                  <span className="px-2 py-1 text-xs bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full font-medium absolute top-2 right-2">
                    Bientôt
                  </span>
                </div>
              </div>
              {/* Bloc Informations de la plainte déplacé ici */}
              {/* mode === 'form' && (
                <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-7 h-7 bg-blue-500 rounded-lg flex items-center justify-center">
                      <DocumentTextIcon className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-gray-800">Informations de la plainte</h3>
                      <p className="text-gray-600 text-xs">Détails principaux</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <label className="block text-xs font-semibold text-gray-800 mb-1">
                        Titre de la plainte *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.titre}
                        onChange={(e) => handleChange('titre', e.target.value)}
                        className={`w-full px-3 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all bg-white ${
                          errors.titre 
                            ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                            : 'border-gray-200 focus:ring-blue-500 focus:border-blue-500'
                        }`}
                        placeholder="Résumé court de la plainte"
                      />
                      {errors.titre && (
                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          {errors.titre}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-800 mb-1">
                        Description détaillée *
                      </label>
                      <textarea
                        required
                        value={formData.contenu}
                        onChange={(e) => handleChange('contenu', e.target.value)}
                        className={`w-full px-3 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 resize-none transition-all bg-white ${
                          errors.contenu 
                            ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                            : 'border-gray-200 focus:ring-blue-500 focus:border-blue-500'
                        }`}
                        placeholder="Décrivez en détail la plainte, les faits, les dates, les personnes impliquées..."
                        rows={5}
                      />
                      {errors.contenu && (
                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          {errors.contenu}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ) */}
            </div>
          </div>
        </section>

        {/* Zone centrale scrollable */}
        <div className="flex-1 overflow-y-auto" style={{minHeight: 0}}>
          <main style={{display: 'flex', flexDirection: 'row', gap: 32, padding: 24}}>
            {/* Colonne principale (formulaire) */}
            <section style={{flex: 3, display: 'flex', flexDirection: 'column', gap: 32}}>
              {mode === 'form' && (
                <FormulaireManuel
                  formData={formData}
                  errors={errors}
                  handleChange={handleChange}
                />
              )}
              {mode === 'pdf' && (
                <UploadPDF
                  pdfFile={pdfFile}
                  pdfLoading={pdfLoading}
                  handleFileChange={handleFileChange}
                  handlePdfSubmit={handlePdfSubmit}
                />
              )}
              {/* ... autres sections du formulaire manuel ou PDF si besoin ... */}
            </section>
            {/* Colonne latérale (date limite, config, etc.) */}
            <aside style={{flex: 1, display: 'flex', flexDirection: 'column', gap: 32}}>
              {/* Date limite */}
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <CalendarIcon className="w-5 h-5 text-purple-600" />
                  <h3 className="font-bold text-gray-800">Date limite</h3>
                </div>
                <input
                  type="date"
                  value={formData.date_limite_reponse}
                  onChange={(e) => handleChange('date_limite_reponse', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
                  placeholder="mm/dd/yyyy"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Si non spécifiée, la date limite sera fixée à 7 jours
                </p>
              </div>

              {/* Configuration */}
              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-4">
                  <FlagIcon className="w-5 h-5 text-orange-600" />
                  <h3 className="font-bold text-gray-800">Configuration</h3>
                </div>
                <p className="text-gray-600 text-sm mb-4">Service et priorité</p>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
                      <BuildingOfficeIcon className="w-4 h-4 text-blue-600" />
                      Service concerné *
                    </label>
                    <select
                      value={formData.service}
                      onChange={(e) => handleChange('service', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    >
                      {serviceOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.icon} {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
                      <FlagIcon className="w-4 h-4 text-orange-600" />
                      Priorité *
                    </label>
                    <select
                      value={formData.priorite}
                      onChange={(e) => handleChange('priorite', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white"
                    >
                      {priorityOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.icon} {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {/* <div className="p-6 border-t border-gray-200 bg-gray-50">
                <div className="flex justify-center gap-4">
                  {mode === 'form' ? (
                    <button
                      onClick={handleSubmit}
                      disabled={loading}
                      className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Création en cours...
                        </>
                      ) : (
                        <>
                          <DocumentTextIcon className="w-4 h-4" />
                          Créer la plainte
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={handlePdfSubmit}
                      disabled={!pdfFile || pdfLoading}
                      className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {pdfLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Traitement en cours...
                        </>
                      ) : (
                        <>
                          <DocumentArrowUpIcon className="w-4 h-4" />
                          Traiter le PDF
                        </>
                      )}
                    </button>
                  )}
                  <button
                    onClick={onClose}
                    className="bg-white text-gray-700 px-6 py-3 rounded-lg font-medium border border-gray-300 hover:bg-gray-50 transition-colors"
                  >
                    Annuler
                  </button>
                </div>
              </div> */}
            </aside>
          </main>
        </div>

        {/* Boutons d'action (fixes en bas) */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0">
          <div className="flex justify-center gap-4">
            {mode === 'form' ? (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Création en cours...
                  </>
                ) : (
                  <>
                    <DocumentTextIcon className="w-4 h-4" />
                    Créer la plainte
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handlePdfSubmit}
                disabled={!pdfFile || pdfLoading}
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {pdfLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Traitement en cours...
                  </>
                ) : (
                  <>
                    <DocumentArrowUpIcon className="w-4 h-4" />
                    Traiter le PDF
                  </>
                )}
              </button>
            )}
            <button
              onClick={onClose}
              className="bg-white text-gray-700 px-6 py-3 rounded-lg font-medium border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 