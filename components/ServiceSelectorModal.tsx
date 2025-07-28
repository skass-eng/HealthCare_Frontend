'use client'

import React from 'react'
import { SparklesIcon } from '@heroicons/react/24/outline'
import { useAppStore } from '../hooks/useAppStore'

interface ServiceSelectorModalProps {
  isOpen: boolean
  onClose: () => void
  onServiceSelect?: (service: string) => void
  onProcessAll?: () => void
  title?: string
  description?: string
  showProcessAllButton?: boolean
  showCancelButton?: boolean
  cancelButtonText?: string
  processAllButtonText?: string
}

const serviceOptions = [
  'Cardiologie',
  'Urgences',
  'Pédiatrie',
  'Chirurgie',
  'Radiologie',
  'Oncologie',
  'Neurologie',
  'Orthopédie'
]

const getServiceColor = (serviceName: string) => {
  const colorMap: { [key: string]: string } = {
    'Cardiologie': 'red',
    'Urgences': 'orange',
    'Pédiatrie': 'green',
    'Chirurgie': 'blue',
    'Radiologie': 'purple',
    'Oncologie': 'pink',
    'Neurologie': 'indigo',
    'Orthopédie': 'teal'
  }
  return colorMap[serviceName] || 'gray'
}

export default function ServiceSelectorModal({
  isOpen,
  onClose,
  onServiceSelect,
  onProcessAll,
  title = "Sélectionner un service pour l'analyse IA",
  description = "Choisissez le service pour lequel vous souhaitez lancer l'analyse IA :",
  showProcessAllButton = true,
  showCancelButton = true,
  cancelButtonText = "Annuler",
  processAllButtonText = "Traiter tous les services"
}: ServiceSelectorModalProps) {
  const { suggestions, loading, ui, actions } = useAppStore()

  const handleServiceSelect = async (service: string) => {
    if (onServiceSelect) {
      onServiceSelect(service)
    } else {
      // Utiliser l'action par défaut du store
      await actions.processService(service)
    }
  }

  const handleProcessAll = async () => {
    if (onProcessAll) {
      onProcessAll()
    } else {
      // Utiliser l'action par défaut du store
      await actions.processAllFiles()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-card p-8 w-full max-w-4xl mx-auto max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-semibold text-slate-800 flex items-center gap-3">
            <SparklesIcon className="w-7 h-7 text-green-600" />
            {title}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            ×
          </button>
        </div>
        
        <p className="text-lg text-gray-600 mb-6">
          {description}
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 flex-1 overflow-y-auto">
          {serviceOptions.map((service) => {
            const color = getServiceColor(service)
            const existingService = suggestions.par_service?.find((s: any) => s.service === service)
            const hasSuggestions = existingService && existingService.total_suggestions > 0
            
                            return (
                  <button
                    key={service}
                    onClick={() => handleServiceSelect(service)}
                    disabled={loading.processing}
                    className={`w-full py-2 px-4 rounded-lg border-2 transition-all hover:shadow-md ${
                      loading.processing && ui.selectedService === service
                        ? 'border-gray-300 bg-gray-100 cursor-not-allowed'
                        : hasSuggestions
                        ? 'border-green-200 bg-green-50 hover:border-green-300 hover:bg-green-100'
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full bg-${color}-500`}></div>
                        <div className="text-left">
                          <span className="font-medium text-sm text-slate-800">{service}</span>
                          {hasSuggestions && (
                            <div className="text-xs text-green-600 mt-0.5">
                              {existingService?.total_suggestions} suggestions
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {loading.processing && ui.selectedService === service ? (
                          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <SparklesIcon className="w-4 h-4 text-green-600" />
                        )}
                      </div>
                    </div>
                  </button>
                )
          })}
        </div>
        
        {(showCancelButton || showProcessAllButton) && (
          <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
            {showCancelButton && (
              <button
                onClick={onClose}
                className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
              >
                {cancelButtonText}
              </button>
            )}
            {showProcessAllButton && (
              <button
                onClick={handleProcessAll}
                disabled={loading.processing}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-colors font-medium"
              >
                {loading.processing ? 'Traitement en cours...' : processAllButtonText}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
} 