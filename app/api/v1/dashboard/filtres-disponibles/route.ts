import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Construire l'URL avec les paramètres
    const backendUrl = new URL('/api/v1/dashboard/filtres-disponibles', BACKEND_URL)
    searchParams.forEach((value, key) => {
      backendUrl.searchParams.append(key, value)
    })
    
    console.log('🔗 Appel API filtres:', backendUrl.toString())
    
    const response = await fetch(backendUrl.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    if (!response.ok) {
      console.error('❌ Erreur API filtres:', response.status, response.statusText)
      const errorText = await response.text()
      console.error('Détails erreur:', errorText)
      
      return NextResponse.json(
        { 
          error: 'Erreur lors du chargement des filtres',
          details: errorText,
          status: response.status 
        },
        { status: response.status }
      )
    }
    
    const data = await response.json()
    console.log('✅ Filtres reçus du backend')
    
    return NextResponse.json(data)
    
  } catch (error) {
    console.error('❌ Erreur dans l\'API route filtres:', error)
    return NextResponse.json(
      { 
        error: 'Erreur interne du serveur',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    )
  }
} 