'use client'

import React from 'react'
import { useRouter } from 'next/navigation'

interface DashboardUnifiedHeaderProps {
  selectedService: string
  onTabChange: (tab: string) => void
  activeTab: string
}

export default function DashboardUnifiedHeader({ 
  selectedService, 
  onTabChange, 
  activeTab 
}: DashboardUnifiedHeaderProps) {
  const router = useRouter()

  return (
    <div className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-6">
          {/* Titre et description */}
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-gray-900">
              Dashboard Unifié
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Statistiques et métriques avancées
            </p>
            {selectedService && (
              <div className="mt-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Service: {selectedService}
                </span>
              </div>
            )}
          </div>

          {/* Boutons d'action */}
          <div className="mt-4 sm:mt-0 sm:ml-6">
            <div className="flex space-x-4">
              <button
                onClick={() => onTabChange('statistiques')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'statistiques'
                    ? 'bg-blue-100 text-blue-700 border-b-2 border-blue-500'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                📊 Statistiques
              </button>
              <button
                onClick={() => router.push('/plaintes-dashboard')}
                className="px-4 py-2 text-sm font-medium rounded-md transition-colors bg-green-100 text-green-700 hover:bg-green-200 border-b-2 border-green-500"
              >
                📋 Plaintes Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 