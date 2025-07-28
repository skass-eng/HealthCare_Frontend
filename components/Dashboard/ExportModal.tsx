'use client'

import { useState } from 'react'
import { XMarkIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline'
import { apiUnified } from '@/lib/api-unified'
import { ServiceEnum } from '@/types'

interface ExportModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function ExportModal({ isOpen, onClose }: ExportModalProps) {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  
  const [exportConfig, setExportConfig] = useState({
    format: 'csv' as 'csv' | 'json',
    statut: '',
    service: '',
    date_debut: '',
    date_fin: ''
  })

  const handleExport = async () => {
    try {
      setLoading(true)
      setMessage(null)
      
      const params: any = { format: exportConfig.format }
      if (exportConfig.statut) params.statut = exportConfig.statut
      if (exportConfig.service) params.service = exportConfig.service
      if (exportConfig.date_debut) params.date_debut = exportConfig.date_debut
      if (exportConfig.date_fin) params.date_fin = exportConfig.date_fin
      
      // Construire l'URL avec les paramètres
      const searchParams = new URLSearchParams()
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
          searchParams.set(key, params[key].toString())
        }
      })
      
      const query = searchParams.toString()
      // Utiliser l'URL de l'API unifiée avec le préfixe /api/v1/
      const url = `http://localhost:8000/api/v1/plaintes/export${query ? `?${query}` : ''}`
      
      // Faire la requête fetch directement pour gérer le téléchargement
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`)
      }
      
      if (exportConfig.format === 'csv') {
        // Pour CSV, télécharger le fichier
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `plaintes_export_${new Date().toISOString().slice(0, 10)}.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        
        setMessage({
          type: 'success',
          text: 'Export CSV téléchargé avec succès !'
        })
      } else {
        // Pour JSON, traiter la réponse JSON
        const data = await response.json()
        
        // Créer et télécharger le fichier JSON
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `plaintes_export_${new Date().toISOString().slice(0, 10)}.json`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        
        setMessage({
          type: 'success',
          text: 'Export JSON téléchargé avec succès !'
        })
      }
      
      // Fermer le modal après 2 secondes
      setTimeout(() => {
        onClose()
        setMessage(null)
      }, 2000)
      
    } catch (error) {
      console.error('Erreur lors de l\'export:', error)
      setMessage({
        type: 'error',
        text: 'Erreur lors de l\'export. Veuillez réessayer.'
      })
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
            <DocumentArrowDownIcon className="w-6 h-6 text-blue-500" />
            Exporter les plaintes
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Configuration */}
        <div className="space-y-4">
          {/* Format */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Format d'export
            </label>
            <select
              value={exportConfig.format}
              onChange={(e) => setExportConfig(prev => ({ ...prev, format: e.target.value as 'csv' | 'json' }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="csv">CSV (Excel) - UTF-8</option>
              <option value="json">JSON</option>
            </select>
            {exportConfig.format === 'csv' && (
              <p className="text-xs text-gray-500 mt-1">
                ✓ Encodage UTF-8 pour support complet du français
              </p>
            )}
          </div>

          {/* Statut */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Statut (optionnel)
            </label>
            <select
              value={exportConfig.statut}
              onChange={(e) => setExportConfig(prev => ({ ...prev, statut: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Tous les statuts</option>
              <option value="en_attente">En attente</option>
              <option value="en_cours">En cours</option>
              <option value="traite">Traitées</option>
            </select>
          </div>

          {/* Service */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Service (optionnel)
            </label>
            <select
              value={exportConfig.service}
              onChange={(e) => setExportConfig(prev => ({ ...prev, service: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Tous les services</option>
              <option value={ServiceEnum.CARDIOLOGIE}>Cardiologie</option>
              <option value={ServiceEnum.URGENCES}>Urgences</option>
              <option value={ServiceEnum.PEDIATRIE}>Pédiatrie</option>
              <option value={ServiceEnum.CHIRURGIE}>Chirurgie</option>
              <option value={ServiceEnum.RADIOLOGIE}>Radiologie</option>
              <option value={ServiceEnum.ONCOLOGIE}>Oncologie</option>
              <option value={ServiceEnum.NEUROLOGIE}>Neurologie</option>
              <option value={ServiceEnum.ORTHOPEDIE}>Orthopédie</option>
            </select>
          </div>

          {/* Période */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Date début
              </label>
              <input
                type="date"
                value={exportConfig.date_debut}
                onChange={(e) => setExportConfig(prev => ({ ...prev, date_debut: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Date fin
              </label>
              <input
                type="date"
                value={exportConfig.date_fin}
                onChange={(e) => setExportConfig(prev => ({ ...prev, date_fin: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`mt-4 p-3 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-700 border border-green-200' 
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {message.text}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleExport}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Export...
              </>
            ) : (
              <>
                <DocumentArrowDownIcon className="w-4 h-4" />
                Exporter
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
} 