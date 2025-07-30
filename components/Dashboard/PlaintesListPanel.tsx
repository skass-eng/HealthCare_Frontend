"use client"

import { useState, useEffect } from 'react'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import { apiUnified } from '@/lib/api-unified'
import { Plainte } from '@/types'
import ComplaintCard from './ComplaintCard'
import { API_CONFIG } from '@/lib/api-config'

interface PlaintesListPanelProps {
  statut: string
  title?: string
}

export default function PlaintesListPanel({ statut, title }: PlaintesListPanelProps) {
  const [complaints, setComplaints] = useState<Plainte[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalComplaints, setTotalComplaints] = useState(0)
  const [pageSize] = useState(10) // 10 plaintes par page

  const fetchComplaints = async (page: number = 1) => {
    try {
      setLoading(true)
      setError(null)
      
      // Utiliser l'endpoint spécifique selon le statut
      if (statut === 'en_cours') {
        const data = await apiUnified.getPlaintesEnCours()
        setComplaints(data.plaintes || [])
        setTotalPages(data.total_pages || 1)
        setTotalComplaints(data.total || 0)
      } else if (statut === 'traite') {
        const data = await apiUnified.getPlaintesTraitees()
        setComplaints(data.plaintes || [])
        setTotalPages(data.total_pages || 1)
        setTotalComplaints(data.total || 0)
      } else if (statut === 'en_attente') {
        const data = await apiUnified.getPlaintesEnAttente()
        setComplaints(data.plaintes || [])
        setTotalPages(data.total_pages || 1)
        setTotalComplaints(data.total || 0)
      } else {
        // Récupérer toutes les plaintes pour les autres filtres
        const data = await apiUnified.getPlaintesList({ page, limit: pageSize })
        setComplaints(data.plaintes || [])
        setTotalPages(data.total_pages || 1)
        setTotalComplaints(data.total || 0)
      }
    } catch (err) {
      setError('Erreur lors du chargement des plaintes')
      setComplaints([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setCurrentPage(1) // Reset à la première page quand le statut change
    fetchComplaints(1)
  }, [statut])

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      const newPage = currentPage - 1
      setCurrentPage(newPage)
      fetchComplaints(newPage)
    }
  }

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      const newPage = currentPage + 1
      setCurrentPage(newPage)
      fetchComplaints(newPage)
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    fetchComplaints(page)
  }

  if (loading) {
    return (
      <div className="glass-card p-8 text-center">
        <div className="h-4 bg-gradient-to-r from-blue-100 to-purple-100 rounded w-3/4 mb-2 mx-auto animate-pulse"></div>
        <div className="h-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded w-full mb-2 mx-auto animate-pulse"></div>
        <div className="h-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded w-2/3 mx-auto animate-pulse"></div>
      </div>
    )
  }
  if (error) {
    return (
      <div className="glass-card p-8 text-center">
        <p className="text-red-500">❌ {error}</p>
        <p className="text-sm text-gray-500 mt-2">Vérifiez que le backend est en marche sur {API_CONFIG.BACKEND_URL}</p>
      </div>
    )
  }
  return (
    <div className="glass-card">
      <div className="flex justify-between items-center p-6 border-b border-gray-200/30">
        <div>
          <h3 className="text-xl font-semibold text-slate-800">
            {title ? title : `Plaintes (${totalComplaints})`}
          </h3>
          <div className="flex items-center space-x-4 mt-2">
            <span className="text-sm text-gray-500">
              Filtré par statut: {statut} ({complaints.length} sur {totalComplaints})
            </span>
            {totalPages > 1 && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                  className={`p-1 rounded transition-colors ${
                    currentPage === 1
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-blue-600 hover:bg-blue-50 hover:text-blue-700'
                  }`}
                >
                  <ChevronLeftIcon className="w-4 h-4" />
                </button>
                
                <span className="text-sm text-gray-600 font-medium">
                  Page {currentPage} sur {totalPages}
                </span>
                
                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className={`p-1 rounded transition-colors ${
                    currentPage === totalPages
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-blue-600 hover:bg-blue-50 hover:text-blue-700'
                  }`}
                >
                  <ChevronRightIcon className="w-4 h-4" />
                </button>
                
                <select
                  value={currentPage}
                  onChange={(e) => handlePageChange(Number(e.target.value))}
                  className="text-sm border border-gray-300 rounded px-2 py-1 bg-white ml-2"
                >
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <option key={page} value={page}>
                      Page {page}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="divide-y divide-gray-200/30">
        {complaints.length > 0 ? (
          complaints.map((complaint: Plainte) => (
            <ComplaintCard key={complaint.id} complaint={complaint} />
          ))
        ) : (
          <div className="p-8 text-center text-gray-500">
            <p>Aucune plainte trouvée avec le statut "{statut}"</p>
            <p className="text-sm mt-1">Total des plaintes: {totalComplaints}</p>
          </div>
        )}
      </div>


    </div>
  )
} 