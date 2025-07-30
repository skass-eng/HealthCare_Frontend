// Configuration centralisée des URLs API
export const API_CONFIG = {
  // URLs de base
  BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000',
  FRONTEND_URL: process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:4000',
  API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/v1',
  
  // Endpoints spécifiques
  ENDPOINTS: {
    // Dashboard
    STATISTIQUES: '/api/v1/dashboard/statistiques',
    FILTRES_DISPONIBLES: '/api/v1/dashboard/filtres-disponibles',
    SERVICES_DETAILS: '/api/v1/dashboard/services-details',
    
    // Plaintes
    PLAINTES: '/api/v1/plaintes',
    PLAINTES_TRAITEES: '/api/v1/plaintes/traitees',
    PLAINTES_EN_COURS: '/api/v1/plaintes/en-cours',
    PLAINTES_EN_ATTENTE: '/api/v1/plaintes/en-attente',
    EXPORT_PLAINTES: '/api/v1/plaintes/export',
    
    // Services
    SERVICES: '/api/v2/services',
    
    // Statistiques
    STATS: '/api/v1/statistiques',
    TENDANCES: '/api/v1/statistiques/tendances',
    
    // Suggestions
    SUGGESTIONS: '/api/v1/suggestions/par-service',
    
    // Process
    PROCESS_SERVICE: '/api/v1/process-service',
    PROCESS_FILES: '/api/v1/process-files',
    
    // Analytics
    ANALYTICS: '/api/v1/analytics/rapport-complet',
  }
}

// Fonction utilitaire pour construire les URLs complètes
export const buildApiUrl = (endpoint: string, params?: Record<string, string>): string => {
  const baseUrl = API_CONFIG.BACKEND_URL
  let url = `${baseUrl}${endpoint}`
  
  if (params && Object.keys(params).length > 0) {
    const searchParams = new URLSearchParams(params)
    url += `?${searchParams.toString()}`
  }
  
  return url
}

// Fonction pour les appels API avec gestion d'erreur
export const apiCall = async (endpoint: string, options?: RequestInit, params?: Record<string, string>) => {
  const url = buildApiUrl(endpoint, params)
  
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    })
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error(`Erreur API pour ${endpoint}:`, error)
    throw error
  }
} 