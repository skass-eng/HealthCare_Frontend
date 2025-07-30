'use client'

import React from 'react'
import { useEffect, useRef } from 'react'
import { useAppStore } from '@/store'
import { useServices, useUtilisateurs } from '@/lib/api-unified'
import ServiceConfigModal from './ServiceConfigModal'
import UserConfigModal from './UserConfigModal'
import ToastNotification from './ToastNotification'
import { buildApiUrl, API_CONFIG } from '@/lib/api-config'

export default function GlobalModals() {
  const { 
    ui: { panels },
    actions: { 
      closeServiceConfigPanel, 
      closeUserConfigPanel, 
      closeAllPanels,
      showNotification 
    } 
  } = useAppStore()

  const { services } = useServices(panels?.serviceConfig?.organisationId || undefined)
  const { createUtilisateur, updateUtilisateur, deleteUtilisateur } = useUtilisateurs(panels?.userConfig?.organisationId || undefined)

  // Refs pour détecter les clics en dehors
  const serviceModalRef = useRef<HTMLDivElement>(null)
  const userModalRef = useRef<HTMLDivElement>(null)

  // Fermeture en cliquant dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Service Modal
      if (panels?.serviceConfig?.isOpen && serviceModalRef.current) {
        const modalContent = serviceModalRef.current.querySelector('[data-modal-content]')
        if (modalContent && !modalContent.contains(event.target as Node)) {
          closeServiceConfigPanel()
        }
      }

      // User Modal
      if (panels?.userConfig?.isOpen && userModalRef.current) {
        const modalContent = userModalRef.current.querySelector('[data-modal-content]')
        if (modalContent && !modalContent.contains(event.target as Node)) {
          closeUserConfigPanel()
        }
      }
    }

    // Ajouter l'event listener seulement si au moins un modal est ouvert
    if (panels?.serviceConfig?.isOpen || panels?.userConfig?.isOpen) {
      document.addEventListener('mousedown', handleClickOutside, { passive: true })
      
      // Prévenir le scroll du body
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.body.style.overflow = 'unset'
    }
  }, [panels?.serviceConfig?.isOpen, panels?.userConfig?.isOpen, closeServiceConfigPanel, closeUserConfigPanel])

  // Fermeture avec Escape
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeAllPanels()
      }
    }

    if (panels?.serviceConfig?.isOpen || panels?.userConfig?.isOpen) {
      document.addEventListener('keydown', handleEscapeKey, { passive: true })
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey)
    }
  }, [panels?.serviceConfig?.isOpen, panels?.userConfig?.isOpen, closeAllPanels])

  // Handlers pour les services
  const handleSaveService = async (serviceData: any) => {
    try {
              const url = buildApiUrl(API_CONFIG.ENDPOINTS.SERVICES + (panels?.serviceConfig?.editingService ? `/${panels.serviceConfig.editingService.id}` : ''))
      const method = panels?.serviceConfig?.editingService ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(serviceData),
      })

      if (response.ok) {
        showNotification(
          'success',
          panels?.serviceConfig?.editingService ? 'Service modifié avec succès !' : 'Service créé avec succès !'
        )
        closeServiceConfigPanel()
        // Forcer le rechargement pour voir les changements
        window.location.reload()
      } else {
        throw new Error('Erreur lors de la sauvegarde du service')
      }
    } catch (error) {
      console.error('Erreur:', error)
      showNotification('error', 'Erreur lors de la sauvegarde du service')
    }
  }

  // Handlers pour les utilisateurs
  const handleSaveUser = async (userData: any) => {
    try {
      if (panels?.userConfig?.editingUser) {
        await updateUtilisateur(panels.userConfig.editingUser.id, userData)
        showNotification('success', 'Utilisateur modifié avec succès !')
      } else {
        await createUtilisateur(userData)
        showNotification('success', 'Utilisateur créé avec succès !')
      }
      closeUserConfigPanel()
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de l\'utilisateur:', error)
      showNotification('error', 'Erreur lors de la sauvegarde de l\'utilisateur')
    }
  }

  return (
    <>
      {/* Service Config Modal */}
      {panels?.serviceConfig?.isOpen && (
        <div ref={serviceModalRef} className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 p-4 pt-8">
          <div data-modal-content>
            <ServiceConfigModal
              isOpen={panels.serviceConfig.isOpen}
              onClose={closeServiceConfigPanel}
              onSave={handleSaveService}
              service={panels.serviceConfig.editingService}
              organisationId={panels.serviceConfig.organisationId || 1}
            />
          </div>
        </div>
      )}

      {/* User Config Modal */}
      {panels?.userConfig?.isOpen && (
        <div ref={userModalRef} className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 p-4 pt-8">
          <div data-modal-content>
            <UserConfigModal
              isOpen={panels.userConfig.isOpen}
              onClose={closeUserConfigPanel}
              onSave={handleSaveUser}
              user={panels.userConfig.editingUser}
              organisationId={panels.userConfig.organisationId || 1}
              services={services}
            />
          </div>
        </div>
      )}
    </>
  )
} 