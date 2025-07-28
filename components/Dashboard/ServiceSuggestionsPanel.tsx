'use client'

import { useAppStore } from '@/store'
import { ChevronDownIcon, ChevronRightIcon, SparklesIcon, CpuChipIcon } from '@heroicons/react/24/outline'

export default function ServiceSuggestionsPanel() {
  const {
    suggestions,
    loading,
    errors,
    ui,
    actions
  } = useAppStore()
  
  const data = suggestions
  const processing = loading.processing
  const selectedService = ui.selectedService
  const showServiceSelector = ui.showServiceSelector
  const expandedServices = ui.expandedServices

  const handleProcessAllFiles = async () => {
    await actions.processAllFiles()
  }

  const handleProcessService = async (serviceName: string) => {
    await actions.processService(serviceName)
  }

  const openServiceSelector = () => {
    actions.setShowGlobalServiceSelector(true)
    actions.setSelectedService('')
  }

  const toggleServiceExpansion = (serviceName: string) => {
    actions.toggleServiceExpansion(serviceName)
  }

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

  const getTypeIcon = (type: string) => {
    const iconMap: { [key: string]: string } = {
      'classification': '🏷️',
      'contact': '📞',
      'reponse': '💬',
      'action': '⚡',
      'mots_cles': '🔍',
      'priorite': '🎯'
    }
    return iconMap[type] || '📝'
  }

  const getTypeLabel = (type: string) => {
    const labelMap: { [key: string]: string } = {
      'classification': 'Classification',
      'contact': 'Contact',
      'reponse': 'Réponse',
      'action': 'Action',
      'mots_cles': 'Mots-clés',
      'priorite': 'Priorité'
    }
    return labelMap[type] || type
  }

  if (loading.suggestions) {
    return (
      <div className="glass-card p-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
              <div className="h-4 bg-gradient-to-r from-blue-100 to-purple-100 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded w-full mb-2"></div>
              <div className="h-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (errors.suggestions) {
    return (
      <div className="glass-card p-6 text-center">
        <p className="text-red-500">❌ {errors.suggestions}</p>
        <button 
          onClick={() => actions.fetchSuggestionsParService()}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Réessayer
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header avec bouton de traitement IA */}
      <div className="glass-card p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
              <CpuChipIcon className="w-6 h-6 text-blue-600" />
              Suggestions IA par Service
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {data?.total_suggestions || 0} suggestions générées pour {data?.total_services || 0} services
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={openServiceSelector}
              disabled={processing}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                processing
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700'
              } text-white font-medium`}
            >
              {processing && selectedService ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Traitement {selectedService}...
                </>
              ) : (
                <>
                  <SparklesIcon className="w-4 h-4" />
                  Traiter un service
                </>
              )}
            </button>
            <button
              onClick={handleProcessAllFiles}
              disabled={processing}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                processing
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'
              } text-white font-medium`}
            >
              {processing && !selectedService ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Traitement...
                </>
              ) : (
                <>
                  <SparklesIcon className="w-4 h-4" />
                  Traiter tout
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Liste des services ou message par défaut */}
      <div className="space-y-4">
        {data?.par_service && data.par_service.length > 0 ? (
          data.par_service.map((service: any) => {
            const color = getServiceColor(service.service)
            const isExpanded = expandedServices.includes(service.service)
            
            return (
              <div key={service.service} className="glass-card overflow-hidden">
                {/* Header du service */}
                <div 
                  className={`p-4 cursor-pointer hover:bg-${color}-50/30 transition-colors border-l-4 border-${color}-500`}
                  onClick={() => toggleServiceExpansion(service.service)}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      {isExpanded ? (
                        <ChevronDownIcon className="w-5 h-5 text-gray-500" />
                      ) : (
                        <ChevronRightIcon className="w-5 h-5 text-gray-500" />
                      )}
                      <h4 className="font-semibold text-slate-800">{service.service}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium bg-${color}-100 text-${color}-700`}>
                        {service.total_suggestions} suggestions
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-sm text-gray-500">
                        {service.plaintes_analysées} plaintes analysées
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleProcessService(service.service)
                        }}
                        disabled={processing}
                        className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                          processing && selectedService === service.service
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                      >
                        {processing && selectedService === service.service ? (
                          <div className="w-3 h-3 border border-green-600 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          '🔄 Retraiter'
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Contenu détaillé */}
                {isExpanded && (
                  <div className="border-t border-gray-200/30 p-4 bg-gray-50/30">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {service.types_disponibles.map((type: any) => {
                        const suggestions = service.suggestions_par_type[type as keyof typeof service.suggestions_par_type] || []
                        return (
                          <div key={type} className="bg-white rounded-lg p-3 border border-gray-200">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-lg">{getTypeIcon(type)}</span>
                              <h5 className="font-medium text-sm">{getTypeLabel(type)}</h5>
                              <span className="text-xs text-gray-500">({suggestions.length})</span>
                            </div>
                            <div className="space-y-2 max-h-32 overflow-y-auto">
                              {suggestions.slice(0, 3).map((suggestion: any, index: number) => (
                                <div key={index} className="text-xs text-gray-600 p-2 bg-gray-50 rounded">
                                  <div className="font-medium mb-1">Suggestion {index + 1}:</div>
                                  <div className="line-clamp-2">{suggestion.contenu}</div>
                                  {suggestion.score_confiance && (
                                    <div className="text-xs text-gray-500 mt-1">
                                      Confiance: {Math.round(suggestion.score_confiance * 100)}%
                                    </div>
                                  )}
                                </div>
                              ))}
                              {suggestions.length > 3 && (
                                <div className="text-xs text-blue-600 text-center">
                                  +{suggestions.length - 3} autres suggestions
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )
          })
        ) : (
          <div className="glass-card p-8 text-center">
            <div className="text-4xl mb-4">🤖</div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">
              Aucune suggestion IA disponible
            </h3>
            <p className="text-gray-600 mb-4">
              Les suggestions IA apparaîtront après traitement des plaintes avec l'intelligence artificielle.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={openServiceSelector}
                disabled={processing}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-colors font-medium"
              >
                {processing ? 'Traitement en cours...' : 'Traiter un service'}
              </button>
              <button
                onClick={handleProcessAllFiles}
                disabled={processing}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-colors font-medium"
              >
                {processing ? 'Traitement en cours...' : 'Traiter tout'}
              </button>
            </div>
          </div>
        )}
      </div>


    </div>
  )
} 