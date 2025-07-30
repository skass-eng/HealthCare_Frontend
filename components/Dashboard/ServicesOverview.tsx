'use client'

import React, { useState, useEffect } from 'react'
import { buildApiUrl, API_CONFIG } from '@/lib/api-config'
import { 
  BuildingOfficeIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  StarIcon,
  HeartIcon,
  ExclamationTriangleIcon as AlertIcon,
  UserIcon,
  ScissorsIcon,
  CpuChipIcon,
  UserGroupIcon,
  BeakerIcon,
  CameraIcon,
  BeakerIcon as FlaskIcon,
  BeakerIcon as PillIcon,
  ClipboardDocumentListIcon,
  UserIcon as DirectorIcon,
  ShieldCheckIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'

interface ServiceStats {
  total_plaintes: number
  nouvelles: number
  en_cours: number
  traitees: number
  satisfaction_moyenne: number
}

interface Service {
  id: number
  nom: string
  code_service: string
  type_service: string
  description: string
  statistiques: ServiceStats
}

interface ServicesOverviewProps {
  selectedService?: string
  onServiceSelect?: (serviceType: string) => void
}

export default function ServicesOverview({ 
  selectedService, 
  onServiceSelect 
}: ServicesOverviewProps) {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true)
        const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.SERVICES_DETAILS))
        const data = await response.json()
        
        if (data.success) {
          setServices(data.services)
        } else {
          setError('Erreur lors du chargement des services')
        }
      } catch (err) {
        setError('Erreur de connexion')
        console.error('Erreur lors du chargement des services:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchServices()
  }, [])

  // Fonction pour obtenir l'icône du service
  const getServiceIcon = (serviceType: string) => {
    const icons: { [key: string]: React.ComponentType<any> } = {
      'CARDIOLOGIE': HeartIcon,
      'URGENCES': AlertIcon,
      'PEDIATRIE': UserIcon,
      'CHIRURGIE': ScissorsIcon,
      'NEUROLOGIE': CpuChipIcon,
      'GYNECOLOGIE': UserGroupIcon,
      'DERMATOLOGIE': BeakerIcon,
      'ORTHOPÉDIE': ShieldCheckIcon,
      'PSYCHIATRIE': CpuChipIcon,
      'RADIOLOGIE': CameraIcon,
      'LABORATOIRE': FlaskIcon,
      'PHARMACIE': PillIcon,
      'ADMINISTRATION': ClipboardDocumentListIcon,
      'DIRECTION': DirectorIcon,
      'QUALITE': ShieldCheckIcon
    }
    const IconComponent = icons[serviceType] || BuildingOfficeIcon
    return <IconComponent className="w-6 h-6" />
  }

  // Fonction pour obtenir la couleur de statut
  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      'NOUVELLE': 'text-blue-600 bg-blue-100',
      'EN_COURS': 'text-yellow-600 bg-yellow-100',
      'EN_ATTENTE_INFORMATION': 'text-orange-600 bg-orange-100',
      'EN_COURS_TRAITEMENT': 'text-purple-600 bg-purple-100',
      'TRAITEE': 'text-green-600 bg-green-100',
      'RESOLUE': 'text-green-600 bg-green-100',
      'FERMEE': 'text-gray-600 bg-gray-100',
      'ARCHIVEE': 'text-gray-600 bg-gray-100'
    }
    return colors[status] || 'text-gray-600 bg-gray-100'
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center text-red-600">
          <ExclamationTriangleIcon className="h-12 w-12 mx-auto mb-4" />
          <p>{error}</p>
        </div>
      </div>
    )
  }

  // Grouper les services par type
  const servicesByType = services.reduce((acc, service) => {
    if (!acc[service.type_service]) {
      acc[service.type_service] = []
    }
    acc[service.type_service].push(service)
    return acc
  }, {} as { [key: string]: Service[] })

  return (
    <div className="bg-white/95 backdrop-blur-2xl rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-500">
      {/* Résumé global intégré */}
      <div className="px-8 py-6 border-b border-white/20">
        <h4 className="font-semibold text-slate-800 mb-6 text-lg flex items-center">
          <ChartBarIcon className="h-6 w-6 mr-3 text-blue-600" />
          Résumé global
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center p-4 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border border-slate-200 shadow-lg">
            <div className="text-3xl font-semibold text-slate-800">
              {services.reduce((sum, service) => sum + service.statistiques.total_plaintes, 0)}
            </div>
            <div className="text-sm text-slate-600 font-medium">Total plaintes</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 shadow-lg">
            <div className="text-3xl font-semibold text-blue-600">
              {services.reduce((sum, service) => sum + service.statistiques.nouvelles, 0)}
            </div>
            <div className="text-sm text-slate-600 font-medium">Nouvelles</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-teal-50 to-teal-100 rounded-xl border border-teal-200 shadow-lg">
            <div className="text-3xl font-semibold text-teal-600">
              {services.reduce((sum, service) => sum + service.statistiques.en_cours, 0)}
            </div>
            <div className="text-sm text-slate-600 font-medium">En cours</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl border border-emerald-200 shadow-lg">
            <div className="text-3xl font-semibold text-emerald-600">
              {services.reduce((sum, service) => sum + service.statistiques.traitees, 0)}
            </div>
            <div className="text-sm text-slate-600 font-medium">Traitées</div>
          </div>
        </div>
      </div>

      {/* Header de la section des services */}
      <div className="px-8 py-6 border-b border-white/20">
        <h3 className="text-xl font-semibold text-slate-800 flex items-center">
          <BuildingOfficeIcon className="h-6 w-6 mr-3 text-blue-600" />
          Analyse par Départements
        </h3>
        <p className="text-sm text-slate-600 mt-2 font-medium">
          Performance et métriques détaillées par spécialité médicale
        </p>
      </div>

      <div className="p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {Object.entries(servicesByType).map(([typeService, servicesList]) => {
            const totalPlaintes = servicesList.reduce((sum, service) => sum + service.statistiques.total_plaintes, 0)
            const totalNouvelles = servicesList.reduce((sum, service) => sum + service.statistiques.nouvelles, 0)
            const totalEnCours = servicesList.reduce((sum, service) => sum + service.statistiques.en_cours, 0)
            const totalTraitees = servicesList.reduce((sum, service) => sum + service.statistiques.traitees, 0)
            const satisfactionMoyenne = servicesList.reduce((sum, service) => sum + service.statistiques.satisfaction_moyenne, 0) / servicesList.length

            return (
              <div 
                key={typeService}
                className={`border-2 rounded-2xl p-6 cursor-pointer transition-all duration-500 hover:shadow-2xl transform hover:-translate-y-1 ${
                  selectedService === typeService 
                    ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 shadow-xl' 
                    : 'border-slate-200 hover:border-slate-300 bg-white/80 backdrop-blur-sm'
                }`}
                onClick={() => onServiceSelect?.(typeService)}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="text-blue-600 bg-blue-100 p-3 rounded-xl">
                      {getServiceIcon(typeService)}
                    </div>
                    <h4 className="font-semibold text-slate-800 text-lg">{typeService}</h4>
                  </div>
                  {selectedService === typeService && (
                    <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                  )}
                </div>

                {/* Statistiques principales */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="text-center p-4 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border border-slate-200">
                    <div className="text-2xl font-semibold text-slate-800">{totalPlaintes}</div>
                    <div className="text-sm text-slate-600 font-medium">Total</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                    <div className="text-2xl font-semibold text-blue-600">{totalNouvelles}</div>
                    <div className="text-sm text-blue-600 font-medium">Nouvelles</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-teal-50 to-teal-100 rounded-xl border border-teal-200">
                    <div className="text-2xl font-semibold text-teal-600">{totalEnCours}</div>
                    <div className="text-sm text-teal-600 font-medium">En cours</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl border border-emerald-200">
                    <div className="text-2xl font-semibold text-emerald-600">{totalTraitees}</div>
                    <div className="text-sm text-emerald-600 font-medium">Traitées</div>
                  </div>
                </div>

                {/* Satisfaction */}
                <div className="flex items-center justify-between text-sm mb-4">
                  <span className="text-slate-600 font-medium">Satisfaction moyenne:</span>
                  <div className="flex items-center space-x-2">
                    <StarIcon className="h-5 w-5 text-yellow-500" />
                    <span className="font-semibold">{satisfactionMoyenne.toFixed(1)}/5</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
} 