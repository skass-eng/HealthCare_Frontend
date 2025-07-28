import { DocumentTextIcon } from '@heroicons/react/24/outline';
import PlaignantInfo from './PlaignantInfo';

interface FormulaireManuelProps {
  formData: {
    titre: string;
    contenu: string;
    nom_plaignant: string;
    prenom_plaignant: string;
    email_plaignant: string;
    telephone_plaignant: string;
    [key: string]: any;
  };
  errors: { [key: string]: string };
  handleChange: (field: string, value: string) => void;
}

export default function FormulaireManuel({ formData, errors, handleChange }: FormulaireManuelProps) {
  return (
    <>
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-7 h-7 bg-blue-500 rounded-lg flex items-center justify-center">
            <DocumentTextIcon className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-800">Informations de la plainte</h3>
            <p className="text-gray-600 text-xs">Détails principaux</p>
          </div>
        </div>
        <div className="space-y-2">
          <div>
            <label className="block text-xs font-semibold text-gray-800 mb-1">
              Titre de la plainte *
            </label>
            <input
              type="text"
              required
              value={formData.titre}
              onChange={(e) => handleChange('titre', e.target.value)}
              className={`w-full px-3 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all bg-white ${
                errors.titre 
                  ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                  : 'border-gray-200 focus:ring-blue-500 focus:border-blue-500'
              }`}
              placeholder="Résumé court de la plainte"
            />
            {errors.titre && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.titre}
              </p>
            )}
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-800 mb-1">
              Description détaillée *
            </label>
            <textarea
              required
              value={formData.contenu}
              onChange={(e) => handleChange('contenu', e.target.value)}
              className={`w-full px-3 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 resize-none transition-all bg-white ${
                errors.contenu 
                  ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                  : 'border-gray-200 focus:ring-blue-500 focus:border-blue-500'
              }`}
              placeholder="Décrivez en détail la plainte, les faits, les dates, les personnes impliquées..."
              rows={5}
            />
            {errors.contenu && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.contenu}
              </p>
            )}
          </div>
        </div>
      </div>
      <PlaignantInfo formData={formData} errors={errors} handleChange={handleChange} />
    </>
  );
} 