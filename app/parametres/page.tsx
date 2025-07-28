'use client'

import { useState } from 'react'
import { 
  Cog6ToothIcon, 
  UserIcon, 
  BellIcon, 
  ShieldCheckIcon, 
  ChartBarIcon,
  DocumentTextIcon,
  GlobeAltIcon,
  KeyIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline'

interface SettingsSection {
  id: string
  title: string
  icon: React.ComponentType<any>
  description: string
}

const settingsSections: SettingsSection[] = [
  {
    id: 'profile',
    title: 'Profil utilisateur',
    icon: UserIcon,
    description: 'Gérez vos informations personnelles et préférences'
  },
  {
    id: 'notifications',
    title: 'Notifications',
    icon: BellIcon,
    description: 'Configurez vos alertes et notifications'
  },
  {
    id: 'security',
    title: 'Sécurité',
    icon: ShieldCheckIcon,
    description: 'Paramètres de sécurité et authentification'
  },
  {
    id: 'analytics',
    title: 'Analytics & Rapports',
    icon: ChartBarIcon,
    description: 'Configuration des analyses et exports'
  },
  {
    id: 'plaintes',
    title: 'Gestion des plaintes',
    icon: DocumentTextIcon,
    description: 'Paramètres de traitement des plaintes'
  },
  {
    id: 'system',
    title: 'Système',
    icon: Cog6ToothIcon,
    description: 'Configuration système et maintenance'
  }
]

export default function ParametresPage() {
  const [activeSection, setActiveSection] = useState('profile')
  const [showPassword, setShowPassword] = useState(false)

  const renderProfileSection = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Informations personnelles</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nom complet</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Votre nom complet"
              defaultValue="Dr. Marie Dupont"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="votre.email@clinique.fr"
              defaultValue="marie.dupont@clinique.fr"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Service</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option>Cardiologie</option>
              <option>Urgences</option>
              <option>Pédiatrie</option>
              <option>Chirurgie</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Rôle</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Votre rôle"
              defaultValue="Responsable qualité"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Préférences d'affichage</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-700">Mode sombre</p>
              <p className="text-sm text-gray-500">Activer le thème sombre</p>
            </div>
            <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
              <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1"></span>
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-700">Notifications push</p>
              <p className="text-sm text-gray-500">Recevoir des notifications en temps réel</p>
            </div>
            <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
              <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6"></span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  const renderNotificationsSection = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Alertes par email</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-700">Nouvelles plaintes</p>
              <p className="text-sm text-gray-500">Recevoir un email pour chaque nouvelle plainte</p>
            </div>
            <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
              <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6"></span>
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-700">Plaintes en retard</p>
              <p className="text-sm text-gray-500">Alertes pour les plaintes dépassant le délai</p>
            </div>
            <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
              <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6"></span>
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-700">Rapports hebdomadaires</p>
              <p className="text-sm text-gray-500">Résumé hebdomadaire des activités</p>
            </div>
            <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
              <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1"></span>
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Fréquence des notifications</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Rappels de plaintes</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option>Immédiat</option>
              <option>Quotidien</option>
              <option>Hebdomadaire</option>
              <option>Mensuel</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  )

  const renderSecuritySection = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Changer le mot de passe</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mot de passe actuel</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10"
                placeholder="Votre mot de passe actuel"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                ) : (
                  <EyeIcon className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nouveau mot de passe</label>
            <input
              type="password"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Nouveau mot de passe"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Confirmer le mot de passe</label>
            <input
              type="password"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Confirmer le nouveau mot de passe"
            />
          </div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Changer le mot de passe
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Authentification à deux facteurs</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-700">2FA</p>
            <p className="text-sm text-gray-500">Sécurisez votre compte avec l'authentification à deux facteurs</p>
          </div>
          <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
            <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1"></span>
          </button>
        </div>
      </div>
    </div>
  )

  const renderAnalyticsSection = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Exports automatiques</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-700">Rapports mensuels</p>
              <p className="text-sm text-gray-500">Générer automatiquement les rapports mensuels</p>
            </div>
            <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
              <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6"></span>
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-700">Exports CSV</p>
              <p className="text-sm text-gray-500">Inclure les exports CSV dans les rapports</p>
            </div>
            <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
              <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6"></span>
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Format des rapports</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Format par défaut</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option>PDF</option>
              <option>Excel</option>
              <option>CSV</option>
              <option>JSON</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  )

  const renderPlaintesSection = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Traitement automatique</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-700">Analyse IA automatique</p>
              <p className="text-sm text-gray-500">Analyser automatiquement les nouvelles plaintes</p>
            </div>
            <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
              <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6"></span>
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-700">Classification automatique</p>
              <p className="text-sm text-gray-500">Classifier automatiquement les plaintes par service</p>
            </div>
            <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
              <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6"></span>
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Délais de traitement</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Délai par défaut (jours)</label>
            <input
              type="number"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              defaultValue="30"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Délai urgent (jours)</label>
            <input
              type="number"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              defaultValue="7"
            />
          </div>
        </div>
      </div>
    </div>
  )

  const renderSystemSection = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Maintenance</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-700">Mode maintenance</p>
              <p className="text-sm text-gray-500">Activer le mode maintenance pour les mises à jour</p>
            </div>
            <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
              <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1"></span>
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-700">Sauvegarde automatique</p>
              <p className="text-sm text-gray-500">Sauvegarder automatiquement les données</p>
            </div>
            <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
              <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6"></span>
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Informations système</h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Version de l'application</span>
            <span className="font-medium">v2.1.0</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Dernière mise à jour</span>
            <span className="font-medium">23/07/2025</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Statut du serveur</span>
            <span className="text-green-600 font-medium">● En ligne</span>
          </div>
        </div>
      </div>
    </div>
  )

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'profile':
        return renderProfileSection()
      case 'notifications':
        return renderNotificationsSection()
      case 'security':
        return renderSecuritySection()
      case 'analytics':
        return renderAnalyticsSection()
      case 'plaintes':
        return renderPlaintesSection()
      case 'system':
        return renderSystemSection()
      default:
        return renderProfileSection()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Configuration</h1>
          <p className="mt-2 text-gray-600">Configurez votre expérience et les préférences du système</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <nav className="space-y-2">
              {settingsSections.map((section) => {
                const Icon = section.icon
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all ${
                      activeSection === section.id
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'text-gray-700 hover:bg-white hover:shadow-sm'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <div>
                      <div className="font-medium">{section.title}</div>
                      <div className={`text-xs ${
                        activeSection === section.id ? 'text-white/80' : 'text-gray-500'
                      }`}>
                        {section.description}
                      </div>
                    </div>
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {renderSectionContent()}
          </div>
        </div>
      </div>
    </div>
  )
} 