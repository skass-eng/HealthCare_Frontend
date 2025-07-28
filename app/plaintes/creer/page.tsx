'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ServiceEnum, PrioriteEnum } from '@/types'
import { PlusIcon, ArrowLeftIcon } from '@heroicons/react/24/outline'
import { apiUnified } from '@/lib/api-unified'

const serviceOptions = [
  { value: ServiceEnum.CARDIOLOGIE, label: 'Cardiologie' },
  { value: ServiceEnum.URGENCES, label: 'Urgences' },
  { value: ServiceEnum.PEDIATRIE, label: 'Pédiatrie' },
  { value: ServiceEnum.CHIRURGIE, label: 'Chirurgie' },
  { value: ServiceEnum.RADIOLOGIE, label: 'Radiologie' },
  { value: ServiceEnum.ONCOLOGIE, label: 'Oncologie' },
  { value: ServiceEnum.NEUROLOGIE, label: 'Neurologie' },
  { value: ServiceEnum.ORTHOPEDIE, label: 'Orthopédie' }
]

const priorityOptions = [
  { value: PrioriteEnum.URGENT, label: 'Urgent', color: 'text-red-600' },
  { value: PrioriteEnum.ELEVE, label: 'Élevé', color: 'text-orange-600' },
  { value: PrioriteEnum.MOYEN, label: 'Moyen', color: 'text-yellow-600' },
  { value: PrioriteEnum.BAS, label: 'Bas', color: 'text-green-600' }
]

export default function CreerPlaintePage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    titre: '',
    contenu: '',
    service: ServiceEnum.CARDIOLOGIE,
    priorite: PrioriteEnum.MOYEN,
    nom_plaignant: '',
    email_plaignant: '',
    telephone_plaignant: '',
    date_limite_reponse: ''
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      // Calculer la date limite par défaut (7 jours si pas spécifiée)
      const dateLimite = formData.date_limite_reponse || 
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      
      const plainteData = {
        ...formData,
        date_limite_reponse: dateLimite,
        statut: 'NOUVELLE',
        date_creation: new Date().toISOString()
      }
      
      await apiUnified.createPlainte(plainteData)
      router.push('/plaintes/nouvelles')
    } catch (error) {
      console.error('Erreur lors de la création de la plainte:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto p-4 lg:p-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-800 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            Retour
          </button>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-800">
            Créer une nouvelle plainte
          </h1>
        </div>

        {/* Form */}
        <div className="glass-card">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Titre */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Titre de la plainte *
              </label>
              <input
                type="text"
                required
                value={formData.titre}
                onChange={(e) => handleChange('titre', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Résumé court de la plainte"
              />
            </div>

            {/* Service et Priorité */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Service concerné *
                </label>
                <select
                  required
                  value={formData.service}
                  onChange={(e) => handleChange('service', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {serviceOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Priorité *
                </label>
                <select
                  required
                  value={formData.priorite}
                  onChange={(e) => handleChange('priorite', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {priorityOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Description détaillée */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Description détaillée *
              </label>
              <textarea
                required
                rows={6}
                value={formData.contenu}
                onChange={(e) => handleChange('contenu', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                placeholder="Décrivez en détail la plainte, les faits, les dates, les personnes impliquées..."
              />
            </div>

            {/* Informations du plaignant */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-slate-800">Informations du plaignant</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Nom complet
                  </label>
                  <input
                    type="text"
                    value={formData.nom_plaignant}
                    onChange={(e) => handleChange('nom_plaignant', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Nom et prénom"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email_plaignant}
                    onChange={(e) => handleChange('email_plaignant', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="email@exemple.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Téléphone
                </label>
                <input
                  type="tel"
                  value={formData.telephone_plaignant}
                  onChange={(e) => handleChange('telephone_plaignant', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="01 23 45 67 89"
                />
              </div>
            </div>

            {/* Date limite */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Date limite de réponse
              </label>
              <input
                type="date"
                value={formData.date_limite_reponse}
                onChange={(e) => handleChange('date_limite_reponse', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Si non spécifiée, la date limite sera fixée à 7 jours
              </p>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Création...
                  </>
                ) : (
                  <>
                    <PlusIcon className="w-4 h-4" />
                    Créer la plainte
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
} 