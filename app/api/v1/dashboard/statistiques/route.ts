import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Construire l'URL avec les paramètres
    const backendUrl = new URL('/api/v1/dashboard/statistiques', BACKEND_URL)
    searchParams.forEach((value, key) => {
      backendUrl.searchParams.append(key, value)
    })
    
    console.log('🔗 Appel API backend:', backendUrl.toString())
    
    const response = await fetch(backendUrl.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    if (!response.ok) {
      console.error('❌ Erreur API backend:', response.status, response.statusText)
      const errorText = await response.text()
      console.error('Détails erreur:', errorText)
      
      return NextResponse.json(
        { 
          error: 'Erreur lors du chargement des statistiques',
          details: errorText,
          status: response.status 
        },
        { status: response.status }
      )
    }
    
    const data = await response.json()
    console.log('✅ Données reçues du backend')
    
    return NextResponse.json(data)
    
  } catch (error) {
    console.error('❌ Erreur dans l\'API route:', error)
    return NextResponse.json(
      { 
        error: 'Erreur interne du serveur',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    )
  }
} 