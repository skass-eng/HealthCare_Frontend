import { NextRequest, NextResponse } from 'next/server'

// Fonction pour générer des données selon la période
function getDataForPeriod(period: string) {
  switch (period) {
    case '7j':
      return {
        plaintesParService: [
          { service: 'Cardiologie', count: 8, percentage: 22.2 },
          { service: 'Urgences', count: 12, percentage: 33.3 },
          { service: 'Pédiatrie', count: 6, percentage: 16.7 },
          { service: 'Chirurgie', count: 4, percentage: 11.1 },
          { service: 'Radiologie', count: 3, percentage: 8.3 },
          { service: 'Oncologie', count: 3, percentage: 8.3 }
        ],
        plaintesParPriorite: [
          { priorite: 'Urgent', count: 4, color: 'bg-red-500' },
          { priorite: 'Élevé', count: 8, color: 'bg-orange-500' },
          { priorite: 'Moyen', count: 15, color: 'bg-yellow-500' },
          { priorite: 'Bas', count: 9, color: 'bg-green-500' }
        ],
        evolutionTemporelle: [
          { date: '2024-01-01', count: 3 },
          { date: '2024-01-02', count: 5 },
          { date: '2024-01-03', count: 2 },
          { date: '2024-01-04', count: 7 },
          { date: '2024-01-05', count: 4 },
          { date: '2024-01-06', count: 6 },
          { date: '2024-01-07', count: 9 }
        ],
        tempsMoyenTraitement: 2.8,
        tauxSatisfaction: 89.0,
        metriquesPerformance: {
          taux_resolution: 96,
          temps_reponse_moyen: 1.8,
          qualite_soins: 93,
          taux_recurrence: 4,
          satisfaction_client: 89,
          temps_traitement_moyen: 2.8
        },
        tendances: {
          augmentation: ['Plaintes urgentes'],
          diminution: ['Temps de réponse', 'Satisfaction patient'],
          stable: ['Taux de résolution']
        }
      }

    case '30j':
      return {
        plaintesParService: [
          { service: 'Cardiologie', count: 12, percentage: 25 },
          { service: 'Urgences', count: 18, percentage: 37.5 },
          { service: 'Pédiatrie', count: 8, percentage: 16.7 },
          { service: 'Chirurgie', count: 6, percentage: 12.5 },
          { service: 'Radiologie', count: 3, percentage: 6.3 },
          { service: 'Oncologie', count: 1, percentage: 2.1 }
        ],
        plaintesParPriorite: [
          { priorite: 'Urgent', count: 5, color: 'bg-red-500' },
          { priorite: 'Élevé', count: 12, color: 'bg-orange-500' },
          { priorite: 'Moyen', count: 20, color: 'bg-yellow-500' },
          { priorite: 'Bas', count: 11, color: 'bg-green-500' }
        ],
        evolutionTemporelle: [
          { date: '2024-01-01', count: 3 },
          { date: '2024-01-05', count: 5 },
          { date: '2024-01-10', count: 2 },
          { date: '2024-01-15', count: 7 },
          { date: '2024-01-20', count: 4 },
          { date: '2024-01-25', count: 6 },
          { date: '2024-01-30', count: 8 }
        ],
        tempsMoyenTraitement: 3.2,
        tauxSatisfaction: 87.0,
        metriquesPerformance: {
          taux_resolution: 94,
          temps_reponse_moyen: 2.1,
          qualite_soins: 91,
          taux_recurrence: 6,
          satisfaction_client: 87,
          temps_traitement_moyen: 3.2
        },
        tendances: {
          augmentation: ['Plaintes urgentes', 'Temps de réponse'],
          diminution: ['Satisfaction patient', 'Qualité des soins'],
          stable: ['Taux de résolution', 'Récurrence des plaintes']
        }
      }

    case '90j':
      return {
        plaintesParService: [
          { service: 'Cardiologie', count: 35, percentage: 23.3 },
          { service: 'Urgences', count: 52, percentage: 34.7 },
          { service: 'Pédiatrie', count: 25, percentage: 16.7 },
          { service: 'Chirurgie', count: 20, percentage: 13.3 },
          { service: 'Radiologie', count: 12, percentage: 8.0 },
          { service: 'Oncologie', count: 6, percentage: 4.0 }
        ],
        plaintesParPriorite: [
          { priorite: 'Urgent', count: 15, color: 'bg-red-500' },
          { priorite: 'Élevé', count: 35, color: 'bg-orange-500' },
          { priorite: 'Moyen', count: 60, color: 'bg-yellow-500' },
          { priorite: 'Bas', count: 40, color: 'bg-green-500' }
        ],
        evolutionTemporelle: [
          { date: '2024-01-01', count: 8 },
          { date: '2024-01-15', count: 12 },
          { date: '2024-01-30', count: 6 },
          { date: '2024-02-15', count: 18 },
          { date: '2024-02-28', count: 10 },
          { date: '2024-03-15', count: 14 },
          { date: '2024-03-30', count: 22 }
        ],
        tempsMoyenTraitement: 3.8,
        tauxSatisfaction: 84.0,
        metriquesPerformance: {
          taux_resolution: 91,
          temps_reponse_moyen: 2.8,
          qualite_soins: 88,
          taux_recurrence: 9,
          satisfaction_client: 84,
          temps_traitement_moyen: 3.8
        },
        tendances: {
          augmentation: ['Plaintes urgentes', 'Temps de réponse', 'Taux de récurrence'],
          diminution: ['Satisfaction patient', 'Qualité des soins', 'Taux de résolution'],
          stable: []
        }
      }

    default:
      return getDataForPeriod('30j') // Par défaut 30j
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const periode = searchParams.get('periode') || '30j'
    
    // Appeler l'API backend pour récupérer les données analytics
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'
    let backendData = null
    
    try {
      const response = await fetch(`${backendUrl}/api/v2/pages/analytics`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // Ajouter un timeout
        signal: AbortSignal.timeout(5000)
      })

      if (!response.ok) {
        throw new Error(`Erreur backend: ${response.status}`)
      }

      backendData = await response.json()
    } catch (backendError) {
      console.warn('Erreur backend, utilisation des données de démonstration:', backendError)
      // En cas d'erreur backend, on continue avec les données de démonstration
    }

    // Transformer les données du backend pour correspondre au format attendu par le frontend
    const analyticsData = backendData?.data?.analytics ? {
      plaintesParService: backendData.data.analytics.plaintes_par_service || getDataForPeriod(periode).plaintesParService,
      plaintesParPriorite: backendData.data.analytics.plaintes_par_priorite || getDataForPeriod(periode).plaintesParPriorite,
      evolutionTemporelle: backendData.data.analytics.evolution_temporelle || getDataForPeriod(periode).evolutionTemporelle,
      tempsMoyenTraitement: backendData.data.analytics.temps_moyen_traitement || getDataForPeriod(periode).tempsMoyenTraitement,
      tauxSatisfaction: backendData.data.analytics.taux_satisfaction || getDataForPeriod(periode).tauxSatisfaction,
      metriquesPerformance: backendData.data.analytics.metriques_performance || getDataForPeriod(periode).metriquesPerformance,
      tendances: backendData.data.analytics.tendances || getDataForPeriod(periode).tendances
    } : getDataForPeriod(periode)

    return NextResponse.json(analyticsData)
  } catch (error) {
    console.error('Erreur lors de la récupération des analytics:', error)
    
    // Retourner des données par défaut en cas d'erreur
    const defaultData = getDataForPeriod('30j')
    
    return NextResponse.json(defaultData)
  }
} 