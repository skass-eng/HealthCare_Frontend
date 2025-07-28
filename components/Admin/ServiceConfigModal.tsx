'use client'

import React, { useState, useEffect } from 'react'
import { useAppStore } from '@/store'
import { Service } from '@/lib/api-unified'
import { 
  XMarkIcon, 
  Cog8ToothIcon,
  ClockIcon,
  EnvelopeIcon,
  PhoneIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

interface ServiceConfigModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (serviceData: Partial<Service>) => void
  service?: Service | null
  organisationId: number
}

export default function ServiceConfigModal({ 
  isOpen, 
  onClose, 
  onSave, 
  service, 
  organisationId 
}: ServiceConfigModalProps) {
  const [formData, setFormData] = useState({
    nom: '',
    code_service: '',
    type_service: 'MEDICAL',
    description: '',
    est_actif: true,
    configuration: {
      horaires: '',
      priorite_defaut: 'MOYEN',
      email_contact: '',
      telephone_contact: '',
      capacite_max: '',
      temps_attente_moyen: '',
      urgences_uniquement: false,
      rdv_obligatoire: false,
      notifications_actives: true
    }
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (service) {
      setFormData({
        nom: service.nom,
        code_service: service.code_service,
        type_service: service.type_service,
        description: service.description || '',
        est_actif: service.est_actif,
        configuration: {
          horaires: service.configuration?.horaires || '',
          priorite_defaut: service.configuration?.priorite_defaut || 'MOYEN',
          email_contact: service.configuration?.email_contact || '',
          telephone_contact: service.configuration?.telephone_contact || '',
          capacite_max: service.configuration?.capacite_max || '',
          temps_attente_moyen: service.configuration?.temps_attente_moyen || '',
          urgences_uniquement: service.configuration?.urgences_uniquement || false,
          rdv_obligatoire: service.configuration?.rdv_obligatoire || false,
          notifications_actives: service.configuration?.notifications_actives ?? true
        }
      })
    } else {
      // Reset pour nouveau service
      setFormData({
        nom: '',
        code_service: '',
        type_service: 'MEDICAL',
        description: '',
        est_actif: true,
        configuration: {
          horaires: '',
          priorite_defaut: 'MOYEN',
          email_contact: '',
          telephone_contact: '',
          capacite_max: '',
          temps_attente_moyen: '',
          urgences_uniquement: false,
          rdv_obligatoire: false,
          notifications_actives: true
        }
      })
    }
    setErrors({})
  }, [service, isOpen])

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.nom.trim()) {
      newErrors.nom = 'Le nom du service est requis'
    }

    if (!formData.code_service.trim()) {
      newErrors.code_service = 'Le code service est requis'
    } else if (!/^[A-Z0-9_]{2,10}$/.test(formData.code_service)) {
      newErrors.code_service = 'Code invalide (2-10 caractères, A-Z, 0-9, _)'
    }

    if (formData.configuration.email_contact && 
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.configuration.email_contact)) {
      newErrors.email_contact = 'Email invalide'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validate()) return

    const serviceData = {
      ...formData,
      organisation_id: organisationId,
      id: service?.id
    }

    onSave(serviceData)
  }

  if (!isOpen) return null

  return (
    <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Cog8ToothIcon className="w-6 h-6 text-blue-500" />
            <h2 className="text-xl font-bold text-gray-900">
              {service ? 'Modifier le Service' : 'Nouveau Service'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Informations de base */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <span className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-sm font-bold">1</span>
              Informations de base
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom du service *
                </label>
                <input
                  type="text"
                  value={formData.nom}
                  onChange={(e) => setFormData(prev => ({ ...prev, nom: e.target.value.toUpperCase() }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.nom ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="ex: URGENCES"
                />
                {errors.nom && <p className="text-red-500 text-xs mt-1">{errors.nom}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Code service *
                </label>
                <input
                  type="text"
                  value={formData.code_service}
                  onChange={(e) => setFormData(prev => ({ ...prev, code_service: e.target.value.toUpperCase() }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.code_service ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="ex: URG"
                />
                {errors.code_service && <p className="text-red-500 text-xs mt-1">{errors.code_service}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type de service
                </label>
                <select
                  value={formData.type_service}
                  onChange={(e) => setFormData(prev => ({ ...prev, type_service: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="MEDICAL">Médical</option>
                  <option value="CHIRURGICAL">Chirurgical</option>
                  <option value="TECHNIQUE">Technique</option>
                  <option value="ADMINISTRATIF">Administratif</option>
                  <option value="URGENCE">Urgence</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priorité par défaut
                </label>
                <select
                  value={formData.configuration.priorite_defaut}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    configuration: { ...prev.configuration, priorite_defaut: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="BAS">Basse</option>
                  <option value="MOYEN">Moyenne</option>
                  <option value="ELEVE">Élevée</option>
                  <option value="URGENT">Urgente</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Description du service..."
              />
            </div>
          </div>

          {/* Configuration avancée */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <span className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center text-green-600 text-sm font-bold">2</span>
              Configuration avancée
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                  <ClockIcon className="w-4 h-4" />
                  Horaires
                </label>
                <input
                  type="text"
                  value={formData.configuration.horaires}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    configuration: { ...prev.configuration, horaires: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="ex: 08h-18h ou 24h/24"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Capacité maximale
                </label>
                <input
                  type="number"
                  value={formData.configuration.capacite_max}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    configuration: { ...prev.configuration, capacite_max: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="ex: 50"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                  <EnvelopeIcon className="w-4 h-4" />
                  Email de contact
                </label>
                <input
                  type="email"
                  value={formData.configuration.email_contact}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    configuration: { ...prev.configuration, email_contact: e.target.value }
                  }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.email_contact ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="service@hopital.fr"
                />
                {errors.email_contact && <p className="text-red-500 text-xs mt-1">{errors.email_contact}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                  <PhoneIcon className="w-4 h-4" />
                  Téléphone
                </label>
                <input
                  type="tel"
                  value={formData.configuration.telephone_contact}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    configuration: { ...prev.configuration, telephone_contact: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="01.23.45.67.89"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Temps d'attente moyen (minutes)
              </label>
              <input
                type="number"
                value={formData.configuration.temps_attente_moyen}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  configuration: { ...prev.configuration, temps_attente_moyen: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="ex: 15"
              />
            </div>
          </div>

          {/* Options */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <span className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 text-sm font-bold">3</span>
              Options de fonctionnement
            </h3>

            <div className="space-y-3">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.configuration.urgences_uniquement}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    configuration: { ...prev.configuration, urgences_uniquement: e.target.checked }
                  }))}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">
                  Service d'urgences uniquement
                </span>
              </label>

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.configuration.rdv_obligatoire}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    configuration: { ...prev.configuration, rdv_obligatoire: e.target.checked }
                  }))}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">
                  Rendez-vous obligatoire
                </span>
              </label>

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.configuration.notifications_actives}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    configuration: { ...prev.configuration, notifications_actives: e.target.checked }
                  }))}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">
                  Notifications automatiques activées
                </span>
              </label>

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.est_actif}
                  onChange={(e) => setFormData(prev => ({ ...prev, est_actif: e.target.checked }))}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">
                  Service actif
                </span>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white hover:bg-blue-600 rounded-lg transition-colors flex items-center gap-2"
            >
              <Cog8ToothIcon className="w-4 h-4" />
              {service ? 'Mettre à jour' : 'Créer le service'}
            </button>
          </div>
        </form>
      </div>
  )
} 