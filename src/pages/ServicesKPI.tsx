/**
 * SERVICES KPI - Frontend ODYSSEE Architecture
 * Page de gestion des services hospitaliers avec KPIs
 * Version: 2.0.0 - Architecture ODYSSEE simplifiée
 */

import React, { useState, useEffect } from 'react';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ChartBarIcon,
  BuildingOfficeIcon,
  ClockIcon,
  CheckCircleIcon,
  FaceSmileIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { Service } from '../types/api';
import { serviceKpiService } from '../lib/services/ServiceKpiService';
import { useDispatch } from 'react-redux';
import { addNotification } from '../store/slices/notificationSlice';

interface ServiceKPICardProps {
  service: Service;
  onEdit: (service: Service) => void;
  onDelete: (service: Service) => void;
  onRefreshKPIs: (serviceId: number) => void;
}

const ServiceKPICard: React.FC<ServiceKPICardProps> = ({ 
  service, 
  onEdit, 
  onDelete, 
  onRefreshKPIs 
}) => {
  const formattedKPIs = serviceKpiService.formatKPIsForDisplay(service);
  const performance = serviceKpiService.evaluateServicePerformance(service);
  
  const getPerformanceColor = (perf: string) => {
    switch (perf) {
      case 'excellent': return 'bg-green-100 text-green-800 border-green-200';
      case 'bon': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'moyen': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'faible': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      {/* En-tête du service */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <BuildingOfficeIcon className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{service.nom}</h3>
            <p className="text-sm text-gray-500">Code: {service.code_service}</p>
            {service.categorie && (
              <span className="inline-block mt-1 px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                {service.categorie}
              </span>
            )}
          </div>
        </div>
        
        {/* Badge de performance */}
        <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getPerformanceColor(performance)}`}>
          {performance.charAt(0).toUpperCase() + performance.slice(1)}
        </span>
      </div>

      {/* Description */}
      {service.description && (
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{service.description}</p>
      )}

      {/* KPIs Grid */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="flex items-center space-x-2 mb-1">
            <ChartBarIcon className="w-4 h-4 text-gray-500" />
            <span className="text-xs font-medium text-gray-700">Total Plaintes</span>
          </div>
          <p className="text-lg font-bold text-gray-900">{formattedKPIs.totalComplaints}</p>
        </div>

        <div className="bg-green-50 p-3 rounded-lg">
          <div className="flex items-center space-x-2 mb-1">
            <CheckCircleIcon className="w-4 h-4 text-green-500" />
            <span className="text-xs font-medium text-green-700">Taux Résolution</span>
          </div>
          <p className="text-lg font-bold text-green-900">{formattedKPIs.resolutionRate}</p>
        </div>

        <div className="bg-blue-50 p-3 rounded-lg">
          <div className="flex items-center space-x-2 mb-1">
            <ClockIcon className="w-4 h-4 text-blue-500" />
            <span className="text-xs font-medium text-blue-700">Temps Moyen</span>
          </div>
          <p className="text-lg font-bold text-blue-900">{formattedKPIs.avgResolutionTime}</p>
        </div>

        <div className="bg-yellow-50 p-3 rounded-lg">
          <div className="flex items-center space-x-2 mb-1">
            <FaceSmileIcon className="w-4 h-4 text-yellow-500" />
            <span className="text-xs font-medium text-yellow-700">Satisfaction</span>
          </div>
          <p className="text-lg font-bold text-yellow-900">{formattedKPIs.satisfaction}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <button
          onClick={() => onRefreshKPIs(service.id)}
          className="flex items-center space-x-1 text-sm text-gray-600 hover:text-blue-600 transition-colors"
        >
          <ArrowPathIcon className="w-4 h-4" />
          <span>Actualiser KPIs</span>
        </button>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => onEdit(service)}
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Modifier"
          >
            <PencilIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(service)}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Supprimer"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

const ServicesKPI: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [showOnlyActive, setShowOnlyActive] = useState(true);
  const dispatch = useDispatch();

  // Charger les services au montage du composant
  useEffect(() => {
    loadServices();
  }, [showOnlyActive]);

  // Charger la liste des services
  const loadServices = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await serviceKpiService.getAllServices(showOnlyActive);
      
      if (response.success && response.data) {
        setServices(response.data);
        dispatch(addNotification({
          type: 'success',
          message: response.message || 'Services chargés avec succès'
        }));
      } else {
        setError(response.error || 'Erreur lors du chargement des services');
        dispatch(addNotification({
          type: 'error',
          message: response.error || 'Erreur lors du chargement des services'
        }));
      }
    } catch (error) {
      console.error('Erreur lors du chargement des services:', error);
      setError('Une erreur inattendue s\'est produite');
      dispatch(addNotification({
        type: 'error',
        message: 'Une erreur inattendue s\'est produite'
      }));
    } finally {
      setIsLoading(false);
    }
  };

  // Actualiser les KPIs d'un service spécifique
  const handleRefreshServiceKPIs = async (serviceId: number) => {
    try {
      const response = await serviceKpiService.getServiceKPIs(serviceId, true);
      
      if (response.success) {
        // Recharger la liste pour voir les KPIs mis à jour
        await loadServices();
        dispatch(addNotification({
          type: 'success',
          message: 'KPIs actualisés avec succès'
        }));
      } else {
        dispatch(addNotification({
          type: 'error',
          message: response.error || 'Erreur lors de l\'actualisation des KPIs'
        }));
      }
    } catch (error) {
      console.error('Erreur lors de l\'actualisation des KPIs:', error);
      dispatch(addNotification({
        type: 'error',
        message: 'Une erreur inattendue s\'est produite'
      }));
    }
  };

  // Recalculer tous les KPIs
  const handleRecalculateAllKPIs = async () => {
    try {
      const response = await serviceKpiService.recalculateAllKPIs();
      
      if (response.success) {
        await loadServices();
        dispatch(addNotification({
          type: 'success',
          message: response.data?.message || 'Tous les KPIs ont été recalculés'
        }));
      } else {
        dispatch(addNotification({
          type: 'error',
          message: response.error || 'Erreur lors du recalcul des KPIs'
        }));
      }
    } catch (error) {
      console.error('Erreur lors du recalcul des KPIs:', error);
      dispatch(addNotification({
        type: 'error',
        message: 'Une erreur inattendue s\'est produite'
      }));
    }
  };

  // Handlers pour les actions CRUD (à implémenter avec des modals)
  const handleCreateService = () => {
    // TODO: Ouvrir modal de création
    console.log('Créer nouveau service');
  };

  const handleEditService = (service: Service) => {
    // TODO: Ouvrir modal d'édition
    console.log('Éditer service:', service);
  };

  const handleDeleteService = async (service: Service) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer le service "${service.nom}" ?`)) {
      return;
    }

    try {
      const response = await serviceKpiService.deleteService(service.id);
      
      if (response.success) {
        await loadServices();
        dispatch(addNotification({
          type: 'success',
          message: response.data?.message || 'Service supprimé avec succès'
        }));
      } else {
        dispatch(addNotification({
          type: 'error',
          message: response.error || 'Erreur lors de la suppression du service'
        }));
      }
    } catch (error) {
      console.error('Erreur lors de la suppression du service:', error);
      dispatch(addNotification({
        type: 'error',
        message: 'Une erreur inattendue s\'est produite'
      }));
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* En-tête */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestion des Services</h1>
            <p className="text-gray-600 mt-1">
              Gérez vos services hospitaliers et suivez leurs KPIs en temps réel
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={handleRecalculateAllKPIs}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ArrowPathIcon className="w-5 h-5" />
              <span>Recalculer KPIs</span>
            </button>
            
            <button
              onClick={handleCreateService}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <PlusIcon className="w-5 h-5" />
              <span>Nouveau Service</span>
            </button>
          </div>
        </div>

        {/* Filtres */}
        <div className="mt-6 flex items-center space-x-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={showOnlyActive}
              onChange={(e) => setShowOnlyActive(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Afficher seulement les services actifs</span>
          </label>
        </div>
      </div>

      {/* Contenu principal */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
          <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      {services.length === 0 ? (
        <div className="text-center py-12">
          <BuildingOfficeIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun service trouvé</h3>
          <p className="text-gray-500 mb-6">
            {showOnlyActive 
              ? "Aucun service actif n'a été trouvé." 
              : "Aucun service n'a été créé pour le moment."
            }
          </p>
          <button
            onClick={handleCreateService}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlusIcon className="w-5 h-5" />
            <span>Créer le premier service</span>
          </button>
        </div>
      ) : (
        <>
          {/* Statistiques globales */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <BuildingOfficeIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Services Actifs</p>
                  <p className="text-2xl font-bold text-gray-900">{services.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <ChartBarIcon className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Plaintes</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {services.reduce((sum, s) => sum + s.nombre_plaintes_total, 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <CheckCircleIcon className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Plaintes Résolues</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {services.reduce((sum, s) => sum + s.nombre_plaintes_resolues, 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <FaceSmileIcon className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Satisfaction Moy.</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {services.length > 0 
                      ? (services.reduce((sum, s) => sum + s.taux_satisfaction, 0) / services.length).toFixed(1)
                      : '0'
                    }%
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Grille des services */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {services.map((service) => (
              <ServiceKPICard
                key={service.id}
                service={service}
                onEdit={handleEditService}
                onDelete={handleDeleteService}
                onRefreshKPIs={handleRefreshServiceKPIs}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ServicesKPI;