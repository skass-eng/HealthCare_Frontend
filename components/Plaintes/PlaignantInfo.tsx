import { UserIcon } from '@heroicons/react/24/outline';

interface PlaignantInfoProps {
  formData: {
    nom_plaignant: string;
    prenom_plaignant: string;
    email_plaignant: string;
    telephone_plaignant: string;
    [key: string]: any;
  };
  errors: { [key: string]: string };
  handleChange: (field: string, value: string) => void;
}

export default function PlaignantInfo({ formData, errors, handleChange }: PlaignantInfoProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-7 h-7 bg-green-500 rounded-lg flex items-center justify-center">
          <UserIcon className="w-4 h-4 text-white" />
        </div>
        <div>
          <h3 className="text-base font-bold text-gray-800">Informations du plaignant</h3>
          <p className="text-gray-600 text-xs">Contact et détails</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Nom *</label>
          <input
            type="text"
            value={formData.nom_plaignant}
            onChange={(e) => handleChange('nom_plaignant', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 bg-white ${
              errors.nom_plaignant 
                ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                : 'border-gray-200 focus:ring-blue-500 focus:border-blue-500'
            }`}
            placeholder="Nom"
          />
          {errors.nom_plaignant && (
            <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.nom_plaignant}
            </p>
          )}
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Prénom *</label>
          <input
            type="text"
            value={formData.prenom_plaignant}
            onChange={(e) => handleChange('prenom_plaignant', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 bg-white ${
              errors.prenom_plaignant 
                ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                : 'border-gray-200 focus:ring-blue-500 focus:border-blue-500'
            }`}
            placeholder="Prénom"
          />
          {errors.prenom_plaignant && (
            <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.prenom_plaignant}
            </p>
          )}
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            value={formData.email_plaignant}
            onChange={(e) => handleChange('email_plaignant', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 bg-white ${
              errors.email_plaignant 
                ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                : 'border-gray-200 focus:ring-blue-500 focus:border-blue-500'
            }`}
            placeholder="email@exemple.com"
          />
          {errors.email_plaignant && (
            <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.email_plaignant}
            </p>
          )}
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Téléphone</label>
          <input
            type="tel"
            value={formData.telephone_plaignant}
            onChange={(e) => handleChange('telephone_plaignant', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 bg-white ${
              errors.telephone_plaignant 
                ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                : 'border-gray-200 focus:ring-blue-500 focus:border-blue-500'
            }`}
            placeholder="01 23 45 67 89"
          />
          {errors.telephone_plaignant && (
            <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.telephone_plaignant}
            </p>
          )}
        </div>
      </div>
    </div>
  );
} 