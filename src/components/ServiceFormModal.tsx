/**
 * SERVICE FORM MODAL - Frontend ODYSSEE Architecture
 * Composant modal pour la création et édition de services
 * Version: 1.0.0 - Architecture ODYSSEE
 */

import React, { useState, useEffect } from 'react';
import { 
  XMarkIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  Cog8ToothIcon
} from '@heroicons/react/24/outline';
import { Service } from '../types/api';
import { serviceService } from '../lib/services/ServiceService';

// Types pour le formulaire
interface ServiceFormData {
  nom: string;
  categorie: string;
  code_service: string;
  configuration: {
    email_contact: string;
    telephone_contact: string;
  };
}

interface ServiceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  serviceToEdit?: Service | null;
}

// Catégories de services prédéfinies
const SERVICE_CATEGORIES = [
  { value: 'SPECIALITE', label: 'Spécialité médicale' },
  { value: 'URGENCE', label: 'Urgence' },
  { value: 'CONSULTATION', label: 'Consultation' },
  { value: 'CHIRURGIE', label: 'Chirurgie' },
  { value: 'LABORATOIRE', label: 'Laboratoire' },
  { value: 'IMAGERIE', label: 'Imagerie médicale' },
  { value: 'PHARMACIE', label: 'Pharmacie' },
  { value: 'ADMINISTRATIF', label: 'Administratif' },
  { value: 'AUTRE', label: 'Autre' }
];



const ServiceFormModal: React.FC<ServiceFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  serviceToEdit
}) => {
  // États du formulaire
  const [formData, setFormData] = useState<ServiceFormData>({
    nom: '',
    categorie: '',
    code_service: '',
    configuration: {
      email_contact: '',
      telephone_contact: ''
    }
  });

  // États de validation
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string>('');

  // Initialiser le formulaire avec les données du service à éditer
  useEffect(() => {
    if (serviceToEdit) {
      setFormData({
        nom: serviceToEdit.nom,
        categorie: serviceToEdit.configuration?.categorie || '',
        code_service: serviceToEdit.code_service,
        configuration: {
          email_contact: serviceToEdit.configuration?.email_contact || '',
          telephone_contact: serviceToEdit.configuration?.telephone_contact || ''
        }
      });
    } else {
      // Réinitialiser le formulaire pour une nouvelle création
      setFormData({
        nom: '',
        categorie: '',
        code_service: '',
        configuration: {
          email_contact: '',
          telephone_contact: ''
        }
      });
    }
    setErrors({});
    setSubmitError('');
  }, [serviceToEdit, isOpen]);

  // Validation du formulaire
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validation du nom (obligatoire)
    if (!formData.nom.trim()) {
      newErrors.nom = 'Le nom du service est obligatoire';
    } else if (formData.nom.trim().length < 2) {
      newErrors.nom = 'Le nom doit contenir au moins 2 caractères';
    }

    // Validation du code service (obligatoire)
    if (!formData.code_service.trim()) {
      newErrors.code_service = 'Le code service est obligatoire';
    } else if (!/^[A-Z0-9_]{2,10}$/.test(formData.code_service.trim())) {
      newErrors.code_service = 'Le code doit contenir 2-10 caractères (lettres majuscules, chiffres, _)';
    }

    // Validation de la catégorie (obligatoire)
    if (!formData.categorie) {
      newErrors.categorie = 'La catégorie est obligatoire';
    }



    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Gestion des changements de champs
  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof ServiceFormData],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }

    // Effacer l'erreur du champ modifié
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const serviceData = {
        nom: formData.nom.trim(),
        code_service: formData.code_service.trim().toUpperCase(),
        configuration: {
          ...formData.configuration,
          categorie: formData.categorie
        }
      };

      let response;
      
      if (serviceToEdit) {
        // Mise à jour d'un service existant
        response = await serviceService.updateService(serviceToEdit.id, serviceData);
      } else {
        // Création d'un nouveau service
        response = await serviceService.createService(serviceData);
      }

      // Vérifier si la réponse contient des données (indicateur de succès)
      if (response && response.success) {
        // Succès - recharger les services et fermer la modal
        onSuccess();
        onClose();
      } else {
        // Erreur explicite de l'API
        throw new Error(response?.error || 'Erreur lors de la sauvegarde');
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du service:', error);
      setSubmitError(error instanceof Error ? error.message : 'Une erreur inattendue s\'est produite');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fermer la modal
  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={handleClose} />
      
             {/* Modal */}
       <div className="flex min-h-screen items-center justify-center p-4">
         <div className="relative w-full max-w-2xl bg-white rounded-lg shadow-xl transform transition-all ml-12">
          {/* En-tête */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <Cog8ToothIcon className="w-8 h-8 text-blue-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {serviceToEdit ? 'Modifier le service' : 'Nouveau service'}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {serviceToEdit ? 'Modifiez les informations du service' : 'Créez un nouveau service pour votre clinique'}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Informations de base */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nom du service */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom du service <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.nom}
                  onChange={(e) => handleInputChange('nom', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.nom ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Ex: Cardiologie"
                  disabled={isSubmitting}
                />
                {errors.nom && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <ExclamationTriangleIcon className="w-4 h-4" />
                    {errors.nom}
                  </p>
                )}
              </div>

              {/* Code service */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Code service <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.code_service}
                  onChange={(e) => handleInputChange('code_service', e.target.value.toUpperCase())}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.code_service ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Ex: CARDIO"
                  disabled={isSubmitting}
                />
                {errors.code_service && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <ExclamationTriangleIcon className="w-4 h-4" />
                    {errors.code_service}
                  </p>
                )}
              </div>
            </div>

            {/* Catégorie */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Catégorie <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.categorie}
                onChange={(e) => handleInputChange('categorie', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.categorie ? 'border-red-300' : 'border-gray-300'
                }`}
                disabled={isSubmitting}
              >
                <option value="">Sélectionnez une catégorie</option>
                {SERVICE_CATEGORIES.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
              {errors.categorie && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <ExclamationTriangleIcon className="w-4 h-4" />
                  {errors.categorie}
                </p>
              )}
            </div>



            {/* Message d'erreur de soumission */}
            {submitError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
                  <p className="text-sm text-red-600">{submitError}</p>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <ClockIcon className="w-4 h-4 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="w-4 h-4" />
                    {serviceToEdit ? 'Modifier' : 'Créer'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ServiceFormModal; 