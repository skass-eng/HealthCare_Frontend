'use client'

import { useEffect } from 'react'
import { useAppStore } from '@/store'

interface StoreProviderProps {
  children: React.ReactNode
}

export default function StoreProvider({ children }: StoreProviderProps) {
  const { actions } = useAppStore()

  useEffect(() => {
    // Charger les données initiales au démarrage de l'application
    const initializeStore = async () => {
      console.log('🚀 Initialisation du store...')
      try {
        // Charger les statistiques
        console.log('📊 Chargement des statistiques...')
        await actions.fetchStats()
        
        // Charger les suggestions IA (une seule fois)
        console.log('🤖 Chargement des suggestions IA...')
        await actions.fetchSuggestionsParService()
        
        // Charger les tendances
        console.log('📈 Chargement des tendances...')
        await actions.fetchTendances()
        console.log('✅ Store initialisé avec succès')
      } catch (error) {
        console.error('❌ Erreur lors de l\'initialisation du store:', error)
      }
    }

    // Vérifier si les données sont déjà chargées pour éviter les appels multiples
    const { statistiques, suggestions, tendances } = useAppStore.getState()
    if (!statistiques && !suggestions.par_service.length && !tendances) {
      initializeStore()
    }
  }, []) // Pas de dépendances pour éviter la boucle infinie

  return <>{children}</>
} 