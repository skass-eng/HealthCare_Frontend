'use client'

import React, { useState, useEffect } from 'react'
import { XMarkIcon, FunnelIcon, ArrowPathIcon, BuildingOfficeIcon, BoltIcon } from '@heroicons/react/24/outline'

interface DashboardUnifiedFiltersProps {
  filters: {
    type_service: string
    categorie_principale: string
    sous_categorie: string
    priorite: string
    statut: string
    organisation_id: number
  }
  filtresDisponibles: any
  onFilterChange: (filterName: string, value: string) => void
  onReset: () => void
}

export default function DashboardUnifiedFilters({
  filters,
  filtresDisponibles,
  onFilterChange,
  onReset
}: DashboardUnifiedFiltersProps) {
  const [activeFiltersCount, setActiveFiltersCount] = useState(0)

  // Calculer le nombre de filtres actifs
  useEffect(() => {
    const count = Object.entries(filters).filter(([key, value]) => 
      value && key !== 'organisation_id' && value !== ''
    ).length
    setActiveFiltersCount(count)
  }, [filters])

  if (!filtresDisponibles) {
    return (
      <div className="bg-white/95 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-lg">
        <div className="max-w-7xl mx-auto">
                      <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded-xl w-1/4 mb-4"></div>
              <div className="flex flex-col sm:flex-row gap-4">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="flex-1 h-16 bg-gray-200 rounded-lg"></div>
                ))}
              </div>
            </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-lg relative z-30">
      <div className="max-w-7xl mx-auto">
        {/* Header compact avec triangle */}
        <div className="p-6 border-b border-gray-100 relative z-40">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              {/* Titre sans triangle */}
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
                  <FunnelIcon className="h-6 w-6 text-white" />
                </div>
                <div className="text-left">
                  <h2 className="text-xl font-bold text-gray-900">
                    Filtres Avancés
                  </h2>
                  <p className="text-sm text-gray-500">
                    {activeFiltersCount} filtre{activeFiltersCount > 1 ? 's' : ''} actif{activeFiltersCount > 1 ? 's' : ''}
                  </p>
                </div>
              </div>

              {/* Filtres sur la même ligne */}
              <div className="flex items-center space-x-4">
                {/* Type de Service */}
                <div className="flex items-center space-x-3 p-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                  <div className="p-1 bg-blue-500 rounded-md">
                    <BuildingOfficeIcon className="h-3 w-3 text-white" />
                  </div>
                  <div className="flex items-center space-x-2">
                    <label htmlFor="type_service" className="text-xs font-medium text-gray-700 whitespace-nowrap">
                      Service:
                    </label>
                    <div className="relative">
                      <select
                        id="type_service"
                        value={filters.type_service}
                        onChange={(e) => onFilterChange('type_service', e.target.value)}
                        className="block px-2 py-1 text-xs border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white appearance-none min-w-[120px]"
                      >
                        <option value="">Tous</option>
                        {filtresDisponibles.types_services?.map((service: string) => (
                          <option key={service} value={service}>
                            {service}
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-1 pointer-events-none">
                        <svg className="h-2 w-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Priorité */}
                <div className="flex items-center space-x-3 p-2 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg border border-orange-100">
                  <div className="p-1 bg-orange-500 rounded-md">
                    <BoltIcon className="h-3 w-3 text-white" />
                  </div>
                  <div className="flex items-center space-x-2">
                    <label htmlFor="priorite" className="text-xs font-medium text-gray-700 whitespace-nowrap">
                      Priorité:
                    </label>
                    <div className="relative">
                      <select
                        id="priorite"
                        value={filters.priorite}
                        onChange={(e) => onFilterChange('priorite', e.target.value)}
                        className="block px-2 py-1 text-xs border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 bg-white appearance-none min-w-[100px]"
                      >
                        <option value="">Toutes</option>
                        {filtresDisponibles.priorites?.map((priorite: string) => (
                          <option key={priorite} value={priorite}>
                            {priorite}
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-1 pointer-events-none">
                        <svg className="h-2 w-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <button
              onClick={onReset}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-all duration-200 bg-gray-100 hover:bg-gray-200 rounded-xl group relative z-50"
            >
              <ArrowPathIcon className="h-4 w-4 mr-2 group-hover:rotate-180 transition-transform duration-300" />
              Réinitialiser
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 