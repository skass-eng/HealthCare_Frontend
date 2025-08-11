import React, { useState, useEffect } from 'react';
import { 
  XMarkIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  KeyIcon,
  ShieldCheckIcon,
  CogIcon
} from '@heroicons/react/24/outline';
import { UserCreateRequest, UserUpdateRequest, userService } from '../lib/services/UserService';
import { useDispatch } from 'react-redux';
import { addNotification } from '../store/slices/notificationSlice';

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: any; // Pour l'édition
  onSuccess?: () => void;
}

const UserFormModal: React.FC<UserFormModalProps> = ({ 
  isOpen, 
  onClose, 
  user, 
  onSuccess 
}) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [userTypes, setUserTypes] = useState<Array<{value: string, label: string}>>([]);
  const [formData, setFormData] = useState<UserCreateRequest>({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    telephone_mobile: '',
    type_utilisateur: '',
    fonction: '',
    specialite: '',
    numero_rpps: '',
    mot_de_passe: '',
    permissions: {},
    configuration: {}
  });

  const isEditing = !!user;

  // Charger les types d'utilisateurs
  useEffect(() => {
    const loadUserTypes = async () => {
      try {
        const response = await userService.getUserTypes();
        if (response.success && response.data) {
          setUserTypes(response.data);
        } else {
          setUserTypes([]);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des types:', error);
        setUserTypes([]);
      }
    };

    if (isOpen) {
      loadUserTypes();
    }
  }, [isOpen]);

  // Initialiser le formulaire avec les données de l'utilisateur si en mode édition
  useEffect(() => {
    if (user) {
      setFormData({
        nom: user.nom || '',
        prenom: user.prenom || '',
        email: user.email || '',
        telephone: user.telephone || '',
        telephone_mobile: user.telephone_mobile || '',
        type_utilisateur: user.type_utilisateur || '',
        fonction: user.fonction || '',
        specialite: user.specialite || '',
        numero_rpps: user.numero_rpps || '',
        mot_de_passe: '', // Pas de mot de passe en édition
        permissions: user.permissions || {},
        configuration: user.configuration || {}
      });
    } else {
      // Réinitialiser le formulaire pour la création
      setFormData({
        nom: '',
        prenom: '',
        email: '',
        telephone: '',
        telephone_mobile: '',
        type_utilisateur: '',
        fonction: '',
        specialite: '',
        numero_rpps: '',
        mot_de_passe: '',
        permissions: {},
        configuration: {}
      });
    }
  }, [user, isOpen]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let response;
      
      if (isEditing) {
        // Mode édition
        const updateData: UserUpdateRequest = {
          id: user.id,
          ...formData
        };
        // Ne pas envoyer le mot de passe s'il est vide
        if (!formData.mot_de_passe) {
          delete updateData.mot_de_passe;
        }
        
        response = await userService.updateUser(user.id, updateData);
      } else {
        // Mode création
        response = await userService.createUser(formData);
      }

      if (response.success) {
        dispatch(addNotification({
          id: Date.now().toString(),
          type: 'success',
          title: isEditing ? 'Utilisateur modifié' : 'Utilisateur créé',
          message: isEditing 
            ? 'L\'utilisateur a été modifié avec succès'
            : 'L\'utilisateur a été créé avec succès',
          timestamp: new Date().toISOString(),
          read: false,
        }));
        
        onSuccess?.();
        onClose();
      } else {
        dispatch(addNotification({
          id: Date.now().toString(),
          type: 'error',
          title: 'Erreur',
          message: response.error || 'Une erreur s\'est produite',
          timestamp: new Date().toISOString(),
          read: false,
        }));
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      dispatch(addNotification({
        id: Date.now().toString(),
        type: 'error',
        title: 'Erreur inattendue',
        message: 'Une erreur inattendue s\'est produite',
        timestamp: new Date().toISOString(),
        read: false,
      }));
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* En-tête */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <UserIcon className="w-6 h-6 text-blue-500" />
            <h2 className="text-xl font-semibold text-gray-900">
              {isEditing ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Informations personnelles */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
              <UserIcon className="w-5 h-5" />
              Informations personnelles
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom *
                </label>
                <input
                  type="text"
                  value={formData.nom}
                  onChange={(e) => handleInputChange('nom', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prénom *
                </label>
                <input
                  type="text"
                  value={formData.prenom}
                  onChange={(e) => handleInputChange('prenom', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <div className="relative">
                <EnvelopeIcon className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Téléphone fixe
                </label>
                <div className="relative">
                  <PhoneIcon className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    value={formData.telephone}
                    onChange={(e) => handleInputChange('telephone', e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Téléphone mobile
                </label>
                <div className="relative">
                  <PhoneIcon className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    value={formData.telephone_mobile}
                    onChange={(e) => handleInputChange('telephone_mobile', e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Informations professionnelles */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
              <CogIcon className="w-5 h-5" />
              Informations professionnelles
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type d'utilisateur *
              </label>
              <select
                value={formData.type_utilisateur}
                onChange={(e) => handleInputChange('type_utilisateur', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Sélectionner un type</option>
                {userTypes && userTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fonction
                </label>
                <input
                  type="text"
                  value={formData.fonction}
                  onChange={(e) => handleInputChange('fonction', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Spécialité
                </label>
                <input
                  type="text"
                  value={formData.specialite}
                  onChange={(e) => handleInputChange('specialite', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Numéro RPPS
              </label>
              <input
                type="text"
                value={formData.numero_rpps}
                onChange={(e) => handleInputChange('numero_rpps', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Numéro RPPS (pour les professionnels de santé)"
              />
            </div>
          </div>

          {/* Sécurité */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
              <ShieldCheckIcon className="w-5 h-5" />
              Sécurité
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {isEditing ? 'Nouveau mot de passe (laisser vide pour ne pas changer)' : 'Mot de passe *'}
              </label>
              <div className="relative">
                <KeyIcon className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={formData.mot_de_passe}
                  onChange={(e) => handleInputChange('mot_de_passe', e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required={!isEditing}
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Sauvegarde...
                </>
              ) : (
                isEditing ? 'Modifier' : 'Créer'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserFormModal; 