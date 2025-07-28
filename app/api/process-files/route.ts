import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const response = await fetch(`${process.env.BACKEND_URL || 'http://localhost:8000'}/api/v1/process-files`, {
      method: 'POST'
    })
    
    if (!response.ok) {
      const error = await response.json()
      return NextResponse.json(
        { detail: error.detail || 'Erreur lors du traitement des fichiers' },
        { status: response.status }
      )
    }
    
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Erreur API process-files:', error)
    return NextResponse.json(
      { detail: 'Erreur de connexion au backend' },
      { status: 500 }
    )
  }
} 