import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const plainteId = params.id
    console.log('API Route: Fetching plainte with ID:', plainteId)
    
    const backendUrl = `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/v1/plaintes/${plainteId}`
    console.log('API Route: Backend URL:', backendUrl)
    
    const response = await fetch(backendUrl)
    
    console.log('API Route: Response status:', response.status)
    
    if (!response.ok) {
      console.log('API Route: Error response')
      if (response.status === 404) {
        console.log('API Route: 404 - Plainte not found')
        return NextResponse.json(
          { detail: 'Plainte non trouvée' },
          { status: 404 }
        )
      }
      
      const error = await response.json()
      console.log('API Route: Error details:', error)
      return NextResponse.json(
        { detail: error.detail || 'Erreur lors du chargement de la plainte' },
        { status: response.status }
      )
    }
    
    const data = await response.json()
    console.log('API Route: Success - Plainte data received')
    return NextResponse.json(data)
  } catch (error) {
    console.error('Erreur API plainte par ID:', error)
    return NextResponse.json(
      { detail: 'Erreur de connexion au backend' },
      { status: 500 }
    )
  }
} 