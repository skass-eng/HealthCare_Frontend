import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const response = await fetch(`${process.env.BACKEND_URL || 'http://localhost:8000'}/api/v1/plaintes`)
    
    if (!response.ok) {
      const error = await response.json()
      return NextResponse.json(
        { detail: error.detail || 'Erreur lors du chargement des plaintes' },
        { status: response.status }
      )
    }
    
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Erreur API plaintes:', error)
    return NextResponse.json(
      { detail: 'Erreur de connexion au backend' },
      { status: 500 }
    )
  }
} 