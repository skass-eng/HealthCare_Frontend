'use client'

import { useState, useEffect } from 'react'
import { 
  XMarkIcon, 
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  ShieldCheckIcon,
  CogIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline'

interface UserConfigModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (userData: any) => void
  user?: any | null
  organisationId: number
  services: any[]
}

export default function UserConfigModal({ 
  isOpen, 
  onClose, 
  onSave, 
  user, 
  organisationId,
  services 
}: UserConfigModalProps) {
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    type_utilisateur: 'UTILISATEUR',  // Changé de "role" à "type_utilisateur"
    fonction: '',
    specialite: '',
    service_id: '',
    statut: 'ACTIF',
    permissions: ['CONSULTER_PLAINTES'],
    configuration: {
      notifications_email: true,
      notifications_sms: false,
      langue_preferee: 'fr',
      theme: 'light'
    }
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (user) {
      setFormData({
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        telephone: user.telephone || '',
        type_utilisateur: user.type_utilisateur || 'UTILISATEUR',
        fonction: user.fonction || '',
        specialite: user.specialite || '',
        service_id: user.service_id || '',
        statut: user.statut,
        permissions: user.permissions || ['CONSULTER_PLAINTES'],
        configuration: {
          notifications_email: user.configuration?.notifications_email ?? true,
          notifications_sms: user.configuration?.notifications_sms ?? false,
          langue_preferee: user.configuration?.langue_preferee || 'fr',
          theme: user.configuration?.theme || 'light'
        }
      })
    } else {
      // Reset pour nouvel utilisateur
      setFormData({
        nom: '',
        prenom: '',
        email: '',
        telephone: '',
        type_utilisateur: 'UTILISATEUR',
        fonction: '',
        specialite: '',
        service_id: '',
        statut: 'ACTIF',
        permissions: ['CONSULTER_PLAINTES'],
        configuration: {
          notifications_email: true,
          notifications_sms: false,
          langue_preferee: 'fr',
          theme: 'light'
        }
      })
    }
    setErrors({})
  }, [user, isOpen])

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.nom.trim()) {
      newErrors.nom = 'Le nom est requis'
    }

    if (!formData.prenom.trim()) {
      newErrors.prenom = 'Le prénom est requis'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'L\'email est requis'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email invalide'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validate()) return

    const userData = {
      ...formData,
      organisation_id: organisationId,
      id: user?.id
    }

    onSave(userData)
  }

  const handlePermissionChange = (permission: string, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        permissions: [...prev.permissions, permission]
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        permissions: prev.permissions.filter(p => p !== permission)
      }))
    }
  }

  const roles = [
    { value: 'ADMINISTRATEUR', label: 'Administrateur', icon: '👑' },
    { value: 'MEDECIN', label: 'Médecin', icon: '👨‍⚕️' },
    { value: 'INFIRMIER', label: 'Infirmier/ère', icon: '👩‍⚕️' },
    { value: 'TECHNICIEN', label: 'Technicien', icon: '🔧' },
    { value: 'SECRETAIRE', label: 'Secrétaire', icon: '📋' },
    { value: 'UTILISATEUR', label: 'Utilisateur', icon: '👤' }
  ]

  const permissions = [
    { value: 'TOUS_DROITS', label: 'Tous les droits', description: 'Accès complet au système' },
    { value: 'CONSULTER_PLAINTES', label: 'Consulter les plaintes', description: 'Voir les plaintes' },
    { value: 'TRAITER_PLAINTES', label: 'Traiter les plaintes', description: 'Modifier le statut et traiter' },
    { value: 'MODIFIER_PLAINTES', label: 'Modifier les plaintes', description: 'Éditer le contenu' },
    { value: 'SUPPRIMER_PLAINTES', label: 'Supprimer les plaintes', description: 'Supprimer définitivement' },
    { value: 'COMMENTER_PLAINTES', label: 'Commenter les plaintes', description: 'Ajouter des commentaires' },
    { value: 'GERER_UTILISATEURS', label: 'Gérer les utilisateurs', description: 'Créer/modifier les comptes' },
    { value: 'GERER_SERVICES', label: 'Gérer les services', description: 'Administrer les services' },
    { value: 'VOIR_ANALYTICS', label: 'Voir les analytics', description: 'Accès aux statistiques' }
  ]

  if (!isOpen) return null

  return (
    <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <UserIcon className="w-6 h-6 text-blue-500" />
            <h2 className="text-xl font-bold text-gray-900">
              {user ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}
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
          {/* Informations personnelles */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <span className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-sm font-bold">1</span>
              Informations personnelles
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prénom *
                </label>
                <input
                  type="text"
                  value={formData.prenom}
                  onChange={(e) => setFormData(prev => ({ ...prev, prenom: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.prenom ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Jean"
                />
                {errors.prenom && <p className="text-red-500 text-xs mt-1">{errors.prenom}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom *
                </label>
                <input
                  type="text"
                  value={formData.nom}
                  onChange={(e) => setFormData(prev => ({ ...prev, nom: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.nom ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Martin"
                />
                {errors.nom && <p className="text-red-500 text-xs mt-1">{errors.nom}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                  <EnvelopeIcon className="w-4 h-4" />
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="j.martin@hopital.fr"
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                  <PhoneIcon className="w-4 h-4" />
                  Téléphone
                </label>
                <input
                  type="tel"
                  value={formData.telephone}
                  onChange={(e) => setFormData(prev => ({ ...prev, telephone: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="01.23.45.67.89"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Spécialité
              </label>
              <input
                type="text"
                value={formData.specialite}
                onChange={(e) => setFormData(prev => ({ ...prev, specialite: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="ex: Cardiologue, Urgentiste, Administration..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fonction
              </label>
              <input
                type="text"
                value={formData.fonction}
                onChange={(e) => setFormData(prev => ({ ...prev, fonction: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="ex: Chef de service, Médecin urgentiste, Infirmier de bloc..."
              />
            </div>
          </div>

          {/* Rôle et affectation */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <span className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center text-green-600 text-sm font-bold">2</span>
              Rôle et affectation
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                  <ShieldCheckIcon className="w-4 h-4" />
                  Rôle
                </label>
                <select
                  value={formData.type_utilisateur}
                  onChange={(e) => setFormData(prev => ({ ...prev, type_utilisateur: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {roles.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.icon} {role.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Service
                </label>
                <select
                  value={formData.service_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, service_id: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Aucun service spécifique</option>
                  {services.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.nom} ({service.code_service})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Statut
              </label>
              <select
                value={formData.statut}
                onChange={(e) => setFormData(prev => ({ ...prev, statut: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ACTIF">✅ Actif</option>
                <option value="INACTIF">❌ Inactif</option>
                <option value="SUSPENDU">⏸️ Suspendu</option>
                <option value="EN_ATTENTE">⏳ En attente</option>
              </select>
            </div>
          </div>

          {/* Permissions */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <span className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 text-sm font-bold">3</span>
              Permissions
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {permissions.map((permission) => (
                <label key={permission.value} className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={formData.permissions.includes(permission.value)}
                    onChange={(e) => handlePermissionChange(permission.value, e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-900">{permission.label}</span>
                    <p className="text-xs text-gray-500">{permission.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Configuration */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <span className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 text-sm font-bold">4</span>
              Préférences
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Langue préférée
                </label>
                <select
                  value={formData.configuration.langue_preferee}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    configuration: { ...prev.configuration, langue_preferee: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="fr">🇫🇷 Français</option>
                  <option value="en">🇺🇸 English</option>
                  <option value="es">🇪🇸 Español</option>
                  <option value="de">🇩🇪 Deutsch</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Thème
                </label>
                <select
                  value={formData.configuration.theme}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    configuration: { ...prev.configuration, theme: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="light">☀️ Clair</option>
                  <option value="dark">🌙 Sombre</option>
                  <option value="auto">🔄 Automatique</option>
                </select>
              </div>
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.configuration.notifications_email}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    configuration: { ...prev.configuration, notifications_email: e.target.checked }
                  }))}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">
                  📧 Notifications par email
                </span>
              </label>

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.configuration.notifications_sms}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    configuration: { ...prev.configuration, notifications_sms: e.target.checked }
                  }))}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">
                  📱 Notifications SMS
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
              <UserIcon className="w-4 h-4" />
              {user ? 'Mettre à jour' : 'Créer l\'utilisateur'}
            </button>
          </div>
        </form>
      </div>
  )
} 