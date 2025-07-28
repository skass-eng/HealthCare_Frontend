"use client"

import { useState, useEffect } from 'react'
import { apiUnified } from '@/lib/api-unified'
import { Plainte } from '@/types'

export default function ComplaintCard({ complaint }: { complaint: Plainte }) {
  const [suggestions, setSuggestions] = useState<any>(null)
  const [loadingSuggestions, setLoadingSuggestions] = useState(false)

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        setLoadingSuggestions(true)
        const data = await apiUnified.getPlainteSuggestions(complaint.plainte_id)
        setSuggestions(data)
      } catch (err) {
        // ignore
      } finally {
        setLoadingSuggestions(false)
      }
    }
    if (complaint.plainte_id) fetchSuggestions()
  }, [complaint.plainte_id])

  const getResponseSuggestion = () => {
    if (!suggestions?.suggestions_par_type) return null
    const responseSuggestions = suggestions.suggestions_par_type.reponse || []
    const actionSuggestions = suggestions.suggestions_par_type.action || []
    return {
      response: responseSuggestions[0]?.contenu || 'Aucune suggestion de réponse générée',
      actions: actionSuggestions[0]?.contenu || 'Aucune action suggérée'
    }
  }
  const suggestionData = getResponseSuggestion()

  // Réécriture du return pour éviter les erreurs JSX
  return (
    <div className="p-6 border-b border-gray-200/30 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50 transition-colors">
      <div className="flex items-center justify-between gap-3 mb-3">
        <span className="font-semibold text-slate-800">{complaint.plainte_id}</span>
        {complaint.service && (
          <span className="service-tag">{complaint.service}</span>
        )}
        <span className="px-2 py-1 rounded-xl text-xs font-semibold">{complaint.priorite}</span>
      </div>
      <h4 className="font-medium text-slate-800 mb-2">{complaint.titre}</h4>
      <p className="text-slate-600 text-sm mb-3 leading-relaxed">
        {complaint.contenu_resume || (complaint.contenu_original ? complaint.contenu_original.substring(0, 200) + '...' : 'Contenu en cours d\'analyse...')}
      </p>
      <div className="ai-suggestion">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs">🤖</span>
          </div>
          <span className="text-blue-600 font-semibold text-sm">
            {loadingSuggestions ? 'Génération des suggestions IA...' : 'Suggestions IA de traitement'}
          </span>
        </div>
        {loadingSuggestions ? (
          <div className="animate-pulse">
            <div className="h-3 bg-gradient-to-r from-blue-100 to-purple-100 rounded w-full mb-2"></div>
            <div className="h-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded w-3/4"></div>
          </div>
        ) : suggestionData ? (
          <p className="text-slate-600 text-xs leading-relaxed">
            <strong>Réponse suggérée:</strong> {suggestionData.response}<br />
            <strong>Actions:</strong> {suggestionData.actions}
          </p>
        ) : (
          <p className="text-slate-500 text-xs italic">
            Suggestions IA en cours de génération...
          </p>
        )}
      </div>
    </div>
  )
} 