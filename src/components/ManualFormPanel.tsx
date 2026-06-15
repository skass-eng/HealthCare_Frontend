'use client';

import { useState } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import FormulaireManuel from './FormulaireManuel';

interface ManualFormPanelProps {
  onSubmit: (data: any) => void;
  onClose: () => void;
}

export default function ManualFormPanel({ onSubmit, onClose }: ManualFormPanelProps) {
  // État local du formulaire
  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    circonstances: '',
    consequences: '',
    demande_plaignant: '',
    nom_plaignant: '',
    prenom_plaignant: '',
    email_plaignant: '',
    telephone_plaignant: '',
    mode_reception: '',
    priority: 'MOYEN', // Priorité par défaut (transmise au backend, modifiable)
    date_incident: new Date().toISOString().split('T')[0], // Date par défaut aujourd'hui
    documents: [] as File[],
    assigned_user: '',
    service_id: undefined as number | undefined
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Gestionnaire de changement pour les champs
  const handleChange = (field: string, value: string) => {
    console.log(`Changement ${field}:`, value);
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Effacer l'erreur si le champ est maintenant rempli
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  // Gestionnaire de changement pour les fichiers
  const handleFileChange = (field: string, files: File[]) => {
    console.log(`Changement fichiers ${field}:`, files);
    setFormData(prev => ({
      ...prev,
      [field]: files
    }));
  };

  // Validation du formulaire
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!formData.titre.trim()) {
      newErrors.titre = 'Le titre est obligatoire';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'La description est obligatoire';
    }
    
    if (!formData.nom_plaignant.trim()) {
      newErrors.nom_plaignant = 'Le nom est obligatoire';
    }
    
    if (!formData.prenom_plaignant.trim()) {
      newErrors.prenom_plaignant = 'Le prénom est obligatoire';
    }

    if (!formData.mode_reception.trim()) {
      newErrors.mode_reception = 'Le mode de réception est obligatoire';
    }

    if (!formData.service_id) {
      newErrors.service_id = 'Le service concerné est obligatoire';
    }

    if (!formData.assigned_user) {
      newErrors.assigned_user = 'L\'assignation à un utilisateur est obligatoire';
    }

    if (!formData.priority) {
      newErrors.priority = 'La priorité est obligatoire';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Gestionnaire de soumission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      console.log('Soumission du formulaire:', formData);
      onSubmit(formData);
    } else {
      console.log('Erreurs de validation:', errors);
    }
  };

  return (
    <div className="bg-white/95 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/40 mt-8">
      <div className="max-w-4xl mx-auto">
        {/* Utilisation du composant FormulaireManuel */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <FormulaireManuel 
            formData={formData}
            errors={errors}
            handleChange={handleChange}
            handleFileChange={handleFileChange}
          />

          {/* Boutons d'action */}
          <div className="flex justify-end gap-4 mt-8">
            <button 
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-colors"
            >
              Annuler
            </button>
            <button 
              type="submit"
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 flex items-center gap-2"
            >
              <PlusIcon className="w-4 h-4" />
              Créer la plainte
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}