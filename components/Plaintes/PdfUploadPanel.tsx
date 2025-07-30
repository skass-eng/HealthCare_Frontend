'use client';

import { CloudArrowUpIcon } from '@heroicons/react/24/outline';
import { ChangeEvent, useState } from 'react';

interface PdfUploadPanelProps {
  onSubmit: (data: any) => void;
  onClose: () => void;
}

export default function PdfUploadPanel({ onSubmit, onClose }: PdfUploadPanelProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
    }
  };

  const handleButtonClick = () => {
    document.getElementById('pdf-file-input')?.click();
  };

  return (
    <div className="bg-white/95 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/40 mt-8">
      <div className="max-w-4xl mx-auto">
        {/* Zone de drop pour PDF */}
        <div className="border-2 border-dashed border-teal-300 rounded-xl p-8 bg-teal-50/50 mb-6 hover:border-teal-400 transition-colors cursor-pointer">
          <div className="text-center">
            <CloudArrowUpIcon className="w-12 h-12 text-teal-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-teal-700 mb-2">Glissez votre fichier PDF ici</h3>
            <p className="text-teal-600 mb-4">ou cliquez pour sélectionner un fichier</p>
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="hidden"
              id="pdf-file-input"
            />
            <button 
              onClick={handleButtonClick}
              className="bg-gradient-to-r from-teal-500 to-teal-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
            >
              Sélectionner un PDF
            </button>
            {selectedFile && (
              <div className="mt-4 p-3 bg-teal-100 rounded-lg">
                <p className="text-teal-700 text-sm font-medium">
                  Fichier sélectionné : {selectedFile.name}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Informations extraites (prévisualisation) */}
        <div className="bg-slate-50 rounded-xl p-6 mb-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Informations extraites
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg p-4 border border-slate-200">
              <label className="block text-sm font-medium text-slate-700 mb-2">Titre de la plainte</label>
              <input 
                type="text" 
                placeholder="Titre extrait du PDF..." 
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
            <div className="bg-white rounded-lg p-4 border border-slate-200">
              <label className="block text-sm font-medium text-slate-700 mb-2">Service concerné</label>
              <input 
                type="text" 
                placeholder="Service détecté..." 
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
            <div className="bg-white rounded-lg p-4 border border-slate-200 md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">Description détaillée</label>
              <textarea 
                rows={4}
                placeholder="Description extraite du PDF..." 
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Boutons d'action */}
        <div className="flex justify-end gap-4">
          <button 
            onClick={onClose}
            className="px-6 py-3 border border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-colors"
          >
            Annuler
          </button>
          <button 
            disabled={!selectedFile}
            className={`px-6 py-3 rounded-xl font-semibold shadow-lg transition-all duration-300 ${
              selectedFile 
                ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white hover:shadow-xl transform hover:-translate-y-1' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Créer la plainte
          </button>
        </div>
      </div>
    </div>
  );
} 