'use client'

import { useState, useEffect } from 'react'
import { PlusIcon } from '@heroicons/react/24/outline'
import PlaintesSemaine from '@/components/Plaintes/PlaintesSemaine'
import SimplePlaintePanel from '../../../components/Plaintes/SimplePlaintePanel'
import FloatingActionButton from '@/components/FloatingActionButton'
import { apiUnified } from '@/lib/api-unified'

export default function NouvellesPlaintesPage() {
  const [showForm, setShowForm] = useState(false) // Ne pas ouvrir le formulaire par défaut

  const handleCreatePlainte = async (plainteData: any) => {
    try {
      console.log('Création de la plainte:', plainteData)
      
      // Appel API pour créer la plainte
      const response = await apiUnified.createPlainte(plainteData)
      console.log('Plainte créée avec succès:', response)
      
      // Fermer le formulaire après création
      setShowForm(false)
      
      // Recharger la liste des plaintes
      window.location.reload()
    } catch (error) {
      console.error('Erreur lors de la création de la plainte:', error)
      throw error
    }
  }

  return (
    <div className="space-y-6">
      {/* Header avec bouton mis en avant */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="flex-1">
          <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">
            Création & Saisie
          </h1>
          <p className="text-white/80 text-sm lg:text-base">
            Gérez les plaintes reçues cette semaine et créez de nouvelles plaintes
          </p>
        </div>
        
        {/* Bouton principal */}
        {/* <button
          onClick={() => setShowForm(true)}
          className="glass-card bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-4 rounded-2xl font-semibold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 flex items-center gap-3"
        >
          <PlusIcon className="w-6 h-6" />
          <span>📝 Nouvelle Plainte</span>
        </button> */}
      </div>


      {/* Section d'appel à l'action */}
      <div className="glass-card p-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-200/20">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-slate-800 mb-2">
              🚀 Prêt à créer une nouvelle plainte ?
            </h2>
            <p className="text-slate-600">
              Utilisez notre formulaire intelligent pour créer rapidement une plainte. 
              L'IA vous aidera à analyser et classer automatiquement le contenu.
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
          >
            <PlusIcon className="w-5 h-5" />
            <span>Commencer</span>
          </button>
        </div>
      </div>

      {/* Section principale */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Liste des plaintes de la semaine - 2/3 de la largeur */}
        <div className="xl:col-span-2">
          <PlaintesSemaine />
        </div>
        
        {/* Section d'aide et statistiques - 1/3 de la largeur */}
        <div className="xl:col-span-1 space-y-6">
          {/* Guide rapide avec bouton mis en avant */}
          <div className="glass-card p-6 bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200/30">
            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              📋 Guide rapide
              <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full">4 étapes</span>
            </h3>
            <div className="space-y-3 text-sm text-slate-600 mb-4">
              <div className="flex items-start gap-2">
                <span className="text-blue-500 font-bold bg-blue-100 rounded-full w-5 h-5 flex items-center justify-center text-xs">1</span>
                <p>Cliquez sur <strong>"Nouvelle Plainte"</strong> pour ouvrir le formulaire</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-blue-500 font-bold bg-blue-100 rounded-full w-5 h-5 flex items-center justify-center text-xs">2</span>
                <p>Remplissez le formulaire manuellement ou uploadez un PDF</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-blue-500 font-bold bg-blue-100 rounded-full w-5 h-5 flex items-center justify-center text-xs">3</span>
                <p>L'IA analysera automatiquement le contenu</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-blue-500 font-bold bg-blue-100 rounded-full w-5 h-5 flex items-center justify-center text-xs">4</span>
                <p>Votre plainte sera créée et apparaîtra dans la liste</p>
              </div>
            </div>
            
            {/* Bouton d'action dans le guide */}
            <button
              onClick={() => setShowForm(true)}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-3 px-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
            >
              <PlusIcon className="w-5 h-5" />
              <span>📝 Créer ma première plainte</span>
            </button>
          </div>

          {/* Statistiques de la semaine */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">
              📊 Cette semaine
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Nouvelles plaintes</span>
                <span className="font-semibold text-blue-600">0</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">En cours</span>
                <span className="font-semibold text-yellow-600">0</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Traitées</span>
                <span className="font-semibold text-green-600">0</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">En retard</span>
                <span className="font-semibold text-red-600">0</span>
              </div>
            </div>
          </div>

          {/* Conseils */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">
              💡 Conseils
            </h3>
            <div className="space-y-3 text-sm text-slate-600">
              <div className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <p>Précisez toujours le service concerné pour un traitement rapide</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <p>Utilisez des descriptions détaillées pour faciliter l'analyse IA</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <p>Vérifiez les informations du plaignant pour le suivi</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Panel de création de plainte */}
      {showForm && (
        <SimplePlaintePanel
          onClose={() => setShowForm(false)}
          onSubmit={handleCreatePlainte}
        />
      )}

      {/* Bouton d'action flottant */}
      <FloatingActionButton 
        onClick={() => setShowForm(true)}
        isVisible={!showForm} // Masquer quand le formulaire est ouvert
      />
    </div>
  )
} 