'use client'

import React, { useState, useEffect } from 'react'
import { 
  BuildingOfficeIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  StarIcon
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
        const response = await fetch('http://localhost:8000/api/v1/dashboard/services-details')
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
    const icons: { [key: string]: string } = {
      'CARDIOLOGIE': '🫀',
      'URGENCES': '🚨',
      'PEDIATRIE': '👶',
      'CHIRURGIE': '🔪',
      'NEUROLOGIE': '🧠',
      'GYNECOLOGIE': '👩‍⚕️',
      'DERMATOLOGIE': '🦠',
      'ORTHOPÉDIE': '🦴',
      'PSYCHIATRIE': '🧠',
      'RADIOLOGIE': '📷',
      'LABORATOIRE': '🧪',
      'PHARMACIE': '💊',
      'ADMINISTRATION': '📋',
      'DIRECTION': '👔',
      'QUALITE': '✅'
    }
    return icons[serviceType] || '🏥'
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
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <BuildingOfficeIcon className="h-5 w-5 mr-2 text-blue-600" />
          Vue d'ensemble des Services
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Statistiques détaillées par type de service
        </p>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Object.entries(servicesByType).map(([typeService, servicesList]) => {
            const totalPlaintes = servicesList.reduce((sum, service) => sum + service.statistiques.total_plaintes, 0)
            const totalNouvelles = servicesList.reduce((sum, service) => sum + service.statistiques.nouvelles, 0)
            const totalEnCours = servicesList.reduce((sum, service) => sum + service.statistiques.en_cours, 0)
            const totalTraitees = servicesList.reduce((sum, service) => sum + service.statistiques.traitees, 0)
            const satisfactionMoyenne = servicesList.reduce((sum, service) => sum + service.statistiques.satisfaction_moyenne, 0) / servicesList.length

            return (
              <div 
                key={typeService}
                className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
                  selectedService === typeService 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => onServiceSelect?.(typeService)}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">{getServiceIcon(typeService)}</span>
                    <h4 className="font-semibold text-gray-900">{typeService}</h4>
                  </div>
                  {selectedService === typeService && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  )}
                </div>

                {/* Statistiques principales */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <div className="text-lg font-bold text-gray-900">{totalPlaintes}</div>
                    <div className="text-xs text-gray-600">Total</div>
                  </div>
                  <div className="text-center p-2 bg-blue-50 rounded">
                    <div className="text-lg font-bold text-blue-600">{totalNouvelles}</div>
                    <div className="text-xs text-blue-600">Nouvelles</div>
                  </div>
                  <div className="text-center p-2 bg-yellow-50 rounded">
                    <div className="text-lg font-bold text-yellow-600">{totalEnCours}</div>
                    <div className="text-xs text-yellow-600">En cours</div>
                  </div>
                  <div className="text-center p-2 bg-green-50 rounded">
                    <div className="text-lg font-bold text-green-600">{totalTraitees}</div>
                    <div className="text-xs text-green-600">Traitées</div>
                  </div>
                </div>

                {/* Satisfaction */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Satisfaction moyenne:</span>
                  <div className="flex items-center space-x-1">
                    <StarIcon className="h-4 w-4 text-yellow-500" />
                    <span className="font-medium">{satisfactionMoyenne.toFixed(1)}/5</span>
                  </div>
                </div>

                {/* Services dans ce type */}
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="text-xs text-gray-500 mb-2">
                    Services ({servicesList.length}):
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {servicesList.slice(0, 3).map((service) => (
                      <span 
                        key={service.id}
                        className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                      >
                        {service.nom}
                      </span>
                    ))}
                    {servicesList.length > 3 && (
                      <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-500 rounded">
                        +{servicesList.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Résumé global */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-3">Résumé global</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {services.reduce((sum, service) => sum + service.statistiques.total_plaintes, 0)}
              </div>
              <div className="text-sm text-gray-600">Total plaintes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {services.reduce((sum, service) => sum + service.statistiques.nouvelles, 0)}
              </div>
              <div className="text-sm text-gray-600">Nouvelles</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {services.reduce((sum, service) => sum + service.statistiques.en_cours, 0)}
              </div>
              <div className="text-sm text-gray-600">En cours</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {services.reduce((sum, service) => sum + service.statistiques.traitees, 0)}
              </div>
              <div className="text-sm text-gray-600">Traitées</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 