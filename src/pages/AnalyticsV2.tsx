/**
 * ANALYTICS V2 - Frontend ODYSSEE Architecture
 * Page d'analytics avec gestion des services
 * Version: 1.0.0 - Architecture ODYSSEE
 */

import React, { useState, useEffect } from 'react';
import { 
  Cog8ToothIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChartBarIcon,
  UsersIcon
} from '@heroicons/react/24/outline';
import { Service } from '../types/api';
import { serviceService } from '../lib/services/ServiceService';
import { useModal } from '../hooks/useModal';
import { useDispatch } from 'react-redux';
import { addNotification } from '../store/slices/notificationSlice';

const AnalyticsV2: React.FC = () => {
  // États pour la gestion des services
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  
  // Hook pour les modals
  const { openServiceForm, openConfirmation } = useModal();
  const dispatch = useDispatch();
  
  // Charger les services au montage du composant
  useEffect(() => {
    loadServices();
  }, []);

  // Charger la liste des services
  const loadServices = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await serviceService.getServices(true); // Seulement les services actifs
      
      if (response.success && response.data) {
        setServices(response.data.items || []);
      } else {
        setError(response.error || 'Erreur lors du chargement des services');
      }
    } catch (error) {
      console.error('Erreur lors du chargement des services:', error);
      setError('Une erreur inattendue s\'est produite');
    } finally {
      setIsLoading(false);
    }
  };

  // Ouvrir le modal pour créer un nouveau service
  const handleCreateService = () => {
    openServiceForm(); // Plus besoin de clinicId
  };

  // Ouvrir le modal pour éditer un service
  const handleEditService = (service: Service) => {
    openServiceForm(service); // Plus besoin de clinicId
  };

  // Supprimer un service
  const handleDeleteService = async (serviceId: number) => {
    openConfirmation({
      title: 'Supprimer le service',
      message: 'Êtes-vous sûr de vouloir supprimer ce service ? Cette action est irréversible.',
      confirmText: 'Supprimer',
      cancelText: 'Annuler',
      onConfirm: async () => {
        try {
          const response = await serviceService.deleteService(serviceId);
          
          if (response.success) {
            // Recharger la liste des services
            await loadServices();
            dispatch(addNotification({
              id: Date.now().toString(),
              type: 'success',
              title: 'Service supprimé',
              message: 'Le service a été supprimé avec succès',
              timestamp: new Date().toISOString(),
              read: false,
            }));
          } else {
            // Afficher l'erreur dans un toast
            dispatch(addNotification({
              id: Date.now().toString(),
              type: 'error',
              title: 'Erreur de suppression',
              message: response.error || 'Erreur lors de la suppression du service',
              timestamp: new Date().toISOString(),
              read: false,
            }));
          }
        } catch (error) {
          console.error('Erreur lors de la suppression:', error);
          dispatch(addNotification({
            id: Date.now().toString(),
            type: 'error',
            title: 'Erreur inattendue',
            message: 'Une erreur inattendue s\'est produite lors de la suppression',
            timestamp: new Date().toISOString(),
            read: false,
          }));
        }
      },
    });
  };

  // Formater la date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Composant pour le badge de statut
  const StatusBadge: React.FC<{ active: boolean; label: string }> = ({ active, label }) => (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
      active 
        ? 'bg-green-100 text-green-800' 
        : 'bg-red-100 text-red-800'
    }`}>
      {active ? <CheckCircleIcon className="w-3 h-3" /> : <XCircleIcon className="w-3 h-3" />}
      {label}
    </span>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* En-tête */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Analytics V2</h1>
              <p className="text-gray-600 mt-1">
                Gestion des services et analyses avancées
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <UsersIcon className="w-4 h-4" />
                <span>Clinique #{clinicId}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Section Services */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Services</h2>
                <p className="text-gray-600 mt-1">
                  Gérez les services médicaux de votre clinique
                </p>
              </div>
              <button 
                onClick={handleCreateService}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
              >
                <PlusIcon className="w-4 h-4" />
                Nouveau Service
              </button>
            </div>
          </div>

          {/* Liste des services */}
          <div className="p-6">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                <p className="text-gray-500 mt-2">Chargement des services...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-600">{error}</p>
                  <button 
                    onClick={loadServices}
                    className="mt-2 text-blue-600 hover:text-blue-800"
                  >
                    Réessayer
                  </button>
                </div>
              </div>
            ) : services.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Cog8ToothIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>Aucun service trouvé</p>
                <p className="text-sm mt-1">Commencez par créer votre premier service</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {services.map((service) => (
                  <div key={service.id} className="bg-gray-50 p-4 rounded-lg border border-gray-100 hover:shadow-sm transition-shadow">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Cog8ToothIcon className="w-6 h-6 text-green-500" />
                          <div>
                            <h4 className="text-lg font-semibold text-gray-900">{service.nom}</h4>
                            <p className="text-sm text-gray-600">
                              {service.configuration?.categorie || 'Non catégorisé'}
                            </p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                          <div>
                            <label className="text-sm font-medium text-gray-500">Code Service</label>
                            <p className="text-gray-900 font-mono">{service.code_service}</p>
                          </div>
                          
                          <div>
                            <label className="text-sm font-medium text-gray-500">Statut</label>
                            <div className="mt-1">
                              <StatusBadge active={service.est_actif} label={service.est_actif ? 'Actif' : 'Inactif'} />
                            </div>
                          </div>
                          
                          <div>
                            <label className="text-sm font-medium text-gray-500">Créé le</label>
                            <p className="text-gray-900 text-sm">{formatDate(service.created)}</p>
                          </div>
                        </div>
                        
                        {service.description && (
                          <p className="text-gray-600 text-sm mb-3">{service.description}</p>
                        )}
                        
                        {service.configuration && Object.keys(service.configuration).length > 0 && (
                          <div className="p-3 bg-white rounded-lg border">
                            <label className="font-medium text-gray-700 mb-2 block">Configuration</label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                              {service.configuration.horaires && (
                                <div>
                                  <span className="font-medium text-gray-600">Horaires:</span>
                                  <span className="text-gray-900 ml-2">{service.configuration.horaires}</span>
                                </div>
                              )}
                              {service.configuration.priorite_defaut && (
                                <div>
                                  <span className="font-medium text-gray-600">Priorité par défaut:</span>
                                  <span className="text-gray-900 ml-2">{service.configuration.priorite_defaut}</span>
                                </div>
                              )}
                              {service.configuration.email_contact && (
                                <div>
                                  <span className="font-medium text-gray-600">Email:</span>
                                  <span className="text-blue-600 ml-2">{service.configuration.email_contact}</span>
                                </div>
                              )}
                              {service.configuration.telephone_contact && (
                                <div>
                                  <span className="font-medium text-gray-600">Téléphone:</span>
                                  <span className="text-gray-900 ml-2">{service.configuration.telephone_contact}</span>
                                </div>
                              )}
                              {service.configuration.capacite_max && (
                                <div>
                                  <span className="font-medium text-gray-600">Capacité max:</span>
                                  <span className="text-gray-900 ml-2">{service.configuration.capacite_max}</span>
                                </div>
                              )}
                              {service.configuration.temps_attente_moyen && (
                                <div>
                                  <span className="font-medium text-gray-600">Temps d'attente:</span>
                                  <span className="text-gray-900 ml-2">{service.configuration.temps_attente_moyen} min</span>
                                </div>
                              )}
                            </div>
                            
                            {/* Options spéciales */}
                            <div className="mt-3 pt-3 border-t border-gray-200">
                              <div className="flex flex-wrap gap-2">
                                {service.configuration.urgences_uniquement && (
                                  <span className="inline-flex items-center px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded">
                                    🚨 Urgences uniquement
                                  </span>
                                )}
                                {service.configuration.rdv_obligatoire && (
                                  <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                                    📅 RDV obligatoire
                                  </span>
                                )}
                                {service.configuration.notifications_actives && (
                                  <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                                    🔔 Notifications actives
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex gap-1 ml-4">
                        <button 
                          onClick={() => handleEditService(service)}
                          className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors" 
                          title="Modifier"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        
                        <button 
                          onClick={() => handleDeleteService(service.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors" 
                          title="Supprimer"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Section Analytics */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <ChartBarIcon className="w-6 h-6 text-blue-500" />
              <h2 className="text-2xl font-bold text-gray-900">Analytics</h2>
            </div>
            <p className="text-gray-600 mt-1">
              Statistiques et analyses des services
            </p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-900">Total Services</h3>
                <p className="text-3xl font-bold text-blue-600">{services.length}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-green-900">Services Actifs</h3>
                <p className="text-3xl font-bold text-green-600">
                  {services.filter(s => s.est_actif).length}
                </p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-orange-900">Services Inactifs</h3>
                <p className="text-3xl font-bold text-orange-600">
                  {services.filter(s => !s.est_actif).length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default AnalyticsV2; 