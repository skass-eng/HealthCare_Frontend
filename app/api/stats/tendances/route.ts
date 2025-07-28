import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const periode = searchParams.get('periode') || '7j'
    
    const response = await fetch(
      `${process.env.BACKEND_URL || 'http://localhost:8000'}/api/v1/statistiques/tendances?periode=${periode}`
    )
    
    if (!response.ok) {
      const error = await response.json()
      return NextResponse.json(
        { detail: error.detail || 'Erreur lors du chargement des tendances' },
        { status: response.status }
      )
    }
    
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Erreur API tendances:', error)
    return NextResponse.json(
      { detail: 'Erreur de connexion au backend' },
      { status: 500 }
    )
  }
} 