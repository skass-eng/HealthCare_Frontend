'use client'

import React from 'react'
import { useAppStore } from '../hooks/useAppStore'
import ServiceSelectorModal from './ServiceSelectorModal'

export default function GlobalModals() {
  const { ui, actions } = useAppStore()

  const handleCloseGlobalServiceSelector = () => {
    actions.setShowGlobalServiceSelector(false)
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
    </>
  )
} 