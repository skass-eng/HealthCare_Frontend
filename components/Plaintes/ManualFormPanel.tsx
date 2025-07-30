'use client';

import { PlusIcon } from '@heroicons/react/24/outline';
import FormulaireManuel from './FormulaireManuel';
import PlaignantInfo from './PlaignantInfo';

interface ManualFormPanelProps {
  onSubmit: (data: any) => void;
  onClose: () => void;
}

export default function ManualFormPanel({ onSubmit, onClose }: ManualFormPanelProps) {
  return (
    <div className="bg-white/95 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/40 mt-8">
      <div className="max-w-4xl mx-auto">
        {/* Utilisation du composant FormulaireManuel */}
        <div className="space-y-6">
          <FormulaireManuel 
            formData={{
              titre: '',
              contenu: '',
              nom_plaignant: '',
              prenom_plaignant: '',
              email_plaignant: '',
              telephone_plaignant: ''
            }}
            errors={{}}
            handleChange={() => {}}
          />
        </div>

        {/* Boutons d'action */}
        <div className="flex justify-end gap-4 mt-8">
          <button 
            onClick={onClose}
            className="px-6 py-3 border border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-colors"
          >
            Annuler
          </button>
          <button className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
            Créer la plainte
          </button>
        </div>
      </div>
    </div>
  );
} 