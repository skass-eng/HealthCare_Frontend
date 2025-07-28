/**
 * Module pour les appels API analytics
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api'

export interface AnalyticsData {
  plaintesParService: { service: string; count: number; percentage: number }[]
  plaintesParPriorite: { priorite: string; count: number; color: string }[]
  evolutionTemporelle: { date: string; count: number }[]
  tempsMoyenTraitement: number
  tauxSatisfaction: number
  tendances: {
    augmentation: string[]
    diminution: string[]
    stable: string[]
  }
}

export interface AnalyticsResponse {
  success: boolean
  data: AnalyticsData
  periode: string
  date_generation?: string
}

/**
 * Récupérer le rapport complet d'analytics
 */
export async function getAnalyticsRapportComplet(periode: string = '30j'): Promise<AnalyticsResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/analytics/rapport-complet?periode=${periode}`)
    
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`)
    }
    
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Erreur lors de la récupération du rapport analytics:', error)
    throw error
  }
}

/**
 * Récupérer les plaintes par service
 */
export async function getAnalyticsPlaintesParService(periode: string = '30j') {
  try {
    const response = await fetch(`${API_BASE_URL}/analytics/plaintes-par-service?periode=${periode}`)
    
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`)
    }
    
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Erreur lors de la récupération des plaintes par service:', error)
    throw error
  }
}

/**
 * Récupérer les plaintes par priorité
 */
export async function getAnalyticsPlaintesParPriorite(periode: string = '30j') {
  try {
    const response = await fetch(`${API_BASE_URL}/analytics/plaintes-par-priorite?periode=${periode}`)
    
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`)
    }
    
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Erreur lors de la récupération des plaintes par priorité:', error)
    throw error
  }
}

/**
 * Récupérer l'évolution temporelle
 */
export async function getAnalyticsEvolutionTemporelle(periode: string = '30j') {
  try {
    const response = await fetch(`${API_BASE_URL}/analytics/evolution-temporelle?periode=${periode}`)
    
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`)
    }
    
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'évolution temporelle:', error)
    throw error
  }
}

/**
 * Récupérer les métriques de performance
 */
export async function getAnalyticsPerformance(periode: string = '30j') {
  try {
    const response = await fetch(`${API_BASE_URL}/analytics/performance?periode=${periode}`)
    
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`)
    }
    
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Erreur lors de la récupération des métriques de performance:', error)
    throw error
  }
}

/**
 * Récupérer les tendances
 */
export async function getAnalyticsTendances(periode: string = '30j') {
  try {
    const response = await fetch(`${API_BASE_URL}/analytics/tendances?periode=${periode}`)
    
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`)
    }
    
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Erreur lors de la récupération des tendances:', error)
    throw error
  }
} 