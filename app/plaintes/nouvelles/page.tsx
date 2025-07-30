'use client';

import { useState } from 'react';
import { PlusIcon, CloudArrowUpIcon } from '@heroicons/react/24/outline';
import { DocumentTextIcon } from '@heroicons/react/24/solid';
import ManualFormPanel from '@/components/Plaintes/ManualFormPanel';
import PdfUploadPanel from '@/components/Plaintes/PdfUploadPanel';
import PhotoUploadPanel from '@/components/Plaintes/PhotoUploadPanel';

export default function NouvellesPlaintesPage() {
  const [activePanel, setActivePanel] = useState<'manual' | 'pdf' | 'photo'>('manual');

  const handleCreatePlainte = async (plainteData: any) => {
    // Logique de création de plainte
    console.log('Nouvelle plainte créée:', plainteData);
  };

  const handlePanelClose = () => {
    setActivePanel('manual'); // Retour à la création manuelle par défaut
  };

  return (
    <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-500 to-teal-600 rounded-xl shadow-lg mb-3">
            <DocumentTextIcon className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 via-blue-700 to-teal-700 bg-clip-text text-transparent mb-2">
            Création de Plaintes
          </h1>
          <p className="text-slate-600 max-w-3xl mx-auto text-sm">
            Choisissez votre méthode préférée pour créer une nouvelle plainte
          </p>
        </div>

        {/* Options de création */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          
          {/* Création manuelle */}
          <div className="relative group cursor-pointer h-full" onClick={() => setActivePanel('manual')}>
            <div className={`absolute inset-0 rounded-2xl blur-xl transition-all duration-500 ${
              activePanel === 'manual' 
                ? 'bg-gradient-to-r from-blue-500/40 to-blue-600/40 blur-2xl' 
                : 'bg-gradient-to-r from-blue-600/10 to-teal-600/10 group-hover:blur-2xl'
            }`}></div>
            <div className={`relative backdrop-blur-md rounded-2xl p-6 shadow-xl border-2 transition-all duration-500 transform hover:-translate-y-1 h-full flex flex-col ${
              activePanel === 'manual'
                ? 'bg-gradient-to-br from-blue-50 to-blue-100/80 border-blue-400 shadow-2xl scale-[1.02]'
                : 'bg-white/95 border-white/40 hover:shadow-2xl'
            }`}>
              <div className="flex flex-col h-full">
                {/* Section Icône et Titre */}
                <div className="text-center mb-4">
                  <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl shadow-lg mb-3 transition-all duration-300 ${
                    activePanel === 'manual'
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 shadow-xl scale-110 ring-4 ring-blue-200'
                      : 'bg-gradient-to-r from-blue-500 to-blue-600'
                  }`}>
                    <PlusIcon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className={`text-lg font-bold mb-2 transition-all duration-300 ${
                    activePanel === 'manual'
                      ? 'text-blue-900'
                      : 'text-slate-800'
                  }`}>Formulaire Manuel</h3>
                </div>

                {/* Section Description */}
                <div className="mb-4">
                  <p className={`text-xs leading-relaxed text-center transition-all duration-300 ${
                    activePanel === 'manual'
                      ? 'text-blue-700'
                      : 'text-slate-600'
                  }`}>
                    Saisissez directement les informations de votre plainte
                  </p>
                </div>

                {/* Section Bouton */}
                <div className="mt-auto">
                  <button className={`w-full px-4 py-2 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2 text-sm ${
                    activePanel === 'manual'
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-xl ring-2 ring-blue-300'
                      : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                  }`}>
                    <PlusIcon className="w-4 h-4" />
                    <span>Commencer</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Upload PDF */}
          <div className="relative group cursor-pointer h-full" onClick={() => setActivePanel('pdf')}>
            <div className={`absolute inset-0 rounded-2xl blur-xl transition-all duration-500 ${
              activePanel === 'pdf' 
                ? 'bg-gradient-to-r from-teal-500/40 to-emerald-500/40 blur-2xl' 
                : 'bg-gradient-to-r from-teal-600/10 to-emerald-600/10 group-hover:blur-2xl'
            }`}></div>
            <div className={`relative backdrop-blur-md rounded-2xl p-6 shadow-xl border-2 transition-all duration-500 transform hover:-translate-y-1 h-full flex flex-col ${
              activePanel === 'pdf'
                ? 'bg-gradient-to-br from-teal-50 to-emerald-100/80 border-teal-400 shadow-2xl scale-[1.02]'
                : 'bg-white/95 border-white/40 hover:shadow-2xl'
            }`}>
              <div className="flex flex-col h-full">
                {/* Section Icône et Titre */}
                <div className="text-center mb-4">
                  <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl shadow-lg mb-3 transition-all duration-300 ${
                    activePanel === 'pdf'
                      ? 'bg-gradient-to-r from-teal-600 to-teal-700 shadow-xl scale-110 ring-4 ring-teal-200'
                      : 'bg-gradient-to-r from-teal-500 to-teal-600'
                  }`}>
                    <CloudArrowUpIcon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className={`text-lg font-bold mb-2 transition-all duration-300 ${
                    activePanel === 'pdf'
                      ? 'text-teal-900'
                      : 'text-slate-800'
                  }`}>Import PDF</h3>
                </div>

                {/* Section Description */}
                <div className="mb-4">
                  <p className={`text-xs leading-relaxed text-center transition-all duration-300 ${
                    activePanel === 'pdf'
                      ? 'text-teal-700'
                      : 'text-slate-600'
                  }`}>
                    Importez un document PDF pour extraction automatique
                  </p>
                </div>

                {/* Section Bouton */}
                <div className="mt-auto">
                  <button className={`w-full px-4 py-2 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2 text-sm ${
                    activePanel === 'pdf'
                      ? 'bg-gradient-to-r from-teal-600 to-teal-700 text-white shadow-xl ring-2 ring-teal-300'
                      : 'bg-gradient-to-r from-teal-500 to-teal-600 text-white'
                  }`}>
                    <CloudArrowUpIcon className="w-4 h-4" />
                    <span>Uploader</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Import Photo */}
          <div className="relative group cursor-pointer h-full" onClick={() => setActivePanel('photo')}>
            <div className={`absolute inset-0 rounded-2xl blur-xl transition-all duration-500 ${
              activePanel === 'photo' 
                ? 'bg-gradient-to-r from-emerald-500/40 to-green-500/40 blur-2xl' 
                : 'bg-gradient-to-r from-emerald-600/10 to-green-600/10 group-hover:blur-2xl'
            }`}></div>
            <div className={`relative backdrop-blur-md rounded-2xl p-6 shadow-xl border-2 transition-all duration-500 transform hover:-translate-y-1 h-full flex flex-col ${
              activePanel === 'photo'
                ? 'bg-gradient-to-br from-emerald-50 to-green-100/80 border-emerald-400 shadow-2xl scale-[1.02]'
                : 'bg-white/95 border-white/40 hover:shadow-2xl'
            }`}>
              <div className="flex flex-col h-full">
                {/* Section Icône et Titre */}
                <div className="text-center mb-4">
                  <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl shadow-lg mb-3 transition-all duration-300 ${
                    activePanel === 'photo'
                      ? 'bg-gradient-to-r from-emerald-600 to-green-700 shadow-xl scale-110 ring-4 ring-emerald-200'
                      : 'bg-gradient-to-r from-emerald-500 to-green-600'
                  }`}>
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className={`text-lg font-bold mb-2 transition-all duration-300 ${
                    activePanel === 'photo'
                      ? 'text-emerald-900'
                      : 'text-slate-800'
                  }`}>Import Photo</h3>
                </div>

                {/* Section Description */}
                <div className="mb-4">
                  <p className={`text-xs leading-relaxed text-center transition-all duration-300 ${
                    activePanel === 'photo'
                      ? 'text-emerald-700'
                      : 'text-slate-600'
                  }`}>
                    Importez une photo de plainte pour analyse automatique
                  </p>
                </div>

                {/* Section Bouton */}
                <div className="mt-auto">
                  <div className="relative">
                    <button className={`w-full px-4 py-2 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2 text-sm ${
                      activePanel === 'photo'
                        ? 'bg-gradient-to-r from-emerald-600 to-green-700 text-white shadow-xl ring-2 ring-emerald-300'
                        : 'bg-gradient-to-r from-emerald-500 to-green-600 text-white'
                    } opacity-60 cursor-not-allowed`}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>Bientôt</span>
                    </button>
                    <div className="absolute -top-2 -right-2 bg-emerald-500 text-white text-xs px-2 py-1 rounded-full font-bold shadow-lg">
                      Bientôt
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Panels intégrés */}
        {activePanel === 'manual' && (
          <ManualFormPanel 
            onSubmit={handleCreatePlainte} 
            onClose={handlePanelClose}
          />
        )}

        {activePanel === 'pdf' && (
          <PdfUploadPanel 
            onSubmit={handleCreatePlainte} 
            onClose={handlePanelClose}
          />
        )}

        {activePanel === 'photo' && (
          <PhotoUploadPanel 
            onSubmit={handleCreatePlainte} 
            onClose={handlePanelClose}
          />
        )}
      </div>
    </div>
  );
} 