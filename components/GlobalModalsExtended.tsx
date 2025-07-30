'use client'

import React from 'react'
import { useAppStore } from '@/store'
import ServiceSelectorModal from './ServiceSelectorModal'
import ExportModal from './Dashboard/ExportModal'
import SimplePlaintePanel from './Plaintes/SimplePlaintePanel'
import { apiUnified } from '@/lib/api-unified'

export default function GlobalModalsExtended() {
  const { ui, actions } = useAppStore()

  const handleCloseGlobalServiceSelector = () => {
    actions.setShowGlobalServiceSelector(false)
  }

  const handleCloseExportModal = () => {
    actions.closeExportModal()
  }

  const handleClosePlainteModal = () => {
    actions.closePlainteModal()
  }

  const handleCreatePlainte = async (data: any) => {
    try {
      console.log('Création de la plainte:', data)
      const response = await apiUnified.createPlainte(data)
      console.log('Plainte créée avec succès:', response)
      actions.closePlainteModal()
      // Recharger les statistiques
      actions.fetchStats()
      actions.showNotification('success', 'Plainte créée avec succès !')
    } catch (error) {
      console.error('Erreur lors de la création de la plainte:', error)
      actions.showNotification('error', 'Erreur lors de la création de la plainte')
      throw error
    }
  }

  return (
    <>
      {/* Modal global de sélection de service */}
      <ServiceSelectorModal
        isOpen={ui.showGlobalServiceSelector}
        onClose={handleCloseGlobalServiceSelector}
        title="Sélectionner un service pour l'analyse IA"
        description="Choisissez le service pour lequel vous souhaitez lancer l'analyse IA :"
        showProcessAllButton={true}
        showCancelButton={true}
        cancelButtonText="Annuler"
        processAllButtonText="Traiter tous les services"
      />

      {/* Modal global d'export */}
      {ui.panels?.exportModal?.isOpen && (
        <ExportModal 
          isOpen={ui.panels?.exportModal?.isOpen || false} 
          onClose={handleCloseExportModal} 
        />
      )}

      {/* Modal global de création de plainte */}
      {ui.panels?.plainteModal?.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 pt-8">
          <div className="w-full max-w-6xl max-h-[85vh] overflow-y-auto">
            <SimplePlaintePanel 
              onClose={handleClosePlainteModal} 
              onSubmit={handleCreatePlainte} 
            />
          </div>
        </div>
      )}
    </>
  )
} 