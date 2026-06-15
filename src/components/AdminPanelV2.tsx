'use client';

import React, { useState, useEffect } from 'react';
import { 
  Cog8ToothIcon,
  UsersIcon,
  ChartBarIcon,
  ServerIcon,
  ClockIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import { useModal } from '../hooks/useModal';
import { Service, User } from '../types/api';
import { serviceService } from '../lib/services/ServiceService';
import { userService } from '../lib/services/UserService';
import { useSelector } from 'react-redux';
import { addNotification } from '../store/slices/notificationSlice';
import { 
  fetchUsers, 
  createUser, 
  updateUser, 
  deleteUser,
  clearUserReload,
  selectUsers,
  selectUsersLoading,
  selectUsersError
} from '../store/slices/userSlice';
import { RootState, useAppDispatch } from '../store';
import { fetchServices, deleteService, selectServices, selectServicesLoading, selectServicesError } from '../store/slices/servicesSlice';

interface AdminPanelV2Props {
  className?: string;
}

const AdminPanelV2: React.FC<AdminPanelV2Props> = ({ className = '' }) => {
  const [activeTab, setActiveTab] = useState<'services' | 'utilisateurs' | 'systeme'>('services');
  const { openServiceForm, openUserForm, openConfirmation } = useModal();
  const dispatch = useAppDispatch();
  
  // Sélecteurs Redux pour les utilisateurs
  const users = useSelector(selectUsers);
  const usersLoading = useSelector(selectUsersLoading);
  const usersError = useSelector(selectUsersError);
  const { shouldReload } = useSelector((state: RootState) => state.user);
  
  // Debug logs
  console.log('👥 AdminPanel - Users state:', { users, usersLoading, usersError, shouldReload });
  
  // Sélecteurs Redux pour les services
  const services = useSelector(selectServices);
  const loading = useSelector(selectServicesLoading);
  const error = useSelector(selectServicesError);
  
  // Charger les services depuis l'API
  useEffect(() => {
    dispatch(fetchServices(true)); // Services actifs seulement
  }, [dispatch]);

  // Charger les utilisateurs depuis l'API
  useEffect(() => {
    if (activeTab === 'utilisateurs') {
      console.log('🔄 AdminPanel: Loading users for tab "utilisateurs"');
      dispatch(fetchUsers());
    }
  }, [activeTab, dispatch]);

  // Écouter les changements pour recharger les utilisateurs
  useEffect(() => {
    if (shouldReload && activeTab === 'utilisateurs') {
      dispatch(fetchUsers());
      dispatch(clearUserReload());
    }
  }, [shouldReload, activeTab, dispatch]);

  // Fonctions de gestion des services
  const handleCreateService = () => {
    openServiceForm();
  };

  const handleEditService = (service: any) => {
    openServiceForm(service);
  };

  // Fonctions de gestion des utilisateurs
  const handleCreateUser = () => {
    openUserForm();
  };

  const handleEditUser = (user: User) => {
    openUserForm(user);
  };

  const handleDeleteUser = async (userId: number) => {
    openConfirmation({
      title: 'Supprimer l\'utilisateur',
      message: 'Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.',
      confirmText: 'Supprimer',
      cancelText: 'Annuler',
      actionType: 'delete-user',
      actionData: { userId },
    });
  };

  // Fonction pour supprimer un utilisateur via Redux
  const handleDeleteUserConfirm = async (userId: number) => {
    try {
      await dispatch(deleteUser(userId)).unwrap();
      dispatch(addNotification({
        id: Date.now().toString(),
        type: 'success',
        title: 'Utilisateur supprimé',
        message: 'L\'utilisateur a été supprimé avec succès',
        timestamp: new Date().toISOString(),
        read: false,
      }));
    } catch (error) {
      dispatch(addNotification({
        id: Date.now().toString(),
        type: 'error',
        title: 'Erreur',
        message: error as string || 'Erreur lors de la suppression',
        timestamp: new Date().toISOString(),
        read: false,
      }));
    }
  };

  const handleDeleteService = async (serviceId: number) => {
    openConfirmation({
      title: 'Supprimer le service',
      message: 'Êtes-vous sûr de vouloir supprimer ce service ? Cette action est irréversible.',
      confirmText: 'Supprimer',
      cancelText: 'Annuler',
      actionType: 'delete-service',
      actionData: { serviceId },
    });
  };

  // Fonction pour recharger les services
  const reloadServices = () => {
    dispatch(fetchServices(true));
  };

  const tabs = [
    {
      id: 'services' as const,
      name: 'Services',
      icon: Cog8ToothIcon,
      description: 'Gestion des services médicaux'
    },
    {
      id: 'utilisateurs' as const,
      name: 'Utilisateurs',
      icon: UsersIcon,
      description: 'Gestion des comptes utilisateurs'
    },
    {
      id: 'systeme' as const,
      name: 'Système',
      icon: ServerIcon,
      description: 'Monitoring et configuration'
    }
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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

  const ServicesPanel: React.FC = () => (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Services</h2>
          <p className="text-gray-600 mt-1">
            Gérez les services médicaux et leurs configurations
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleCreateService}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center gap-2"
          >
            <PlusIcon className="w-4 h-4" />
            Nouveau Service
          </button>
        </div>
      </div>

      {/* État de chargement */}
      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-gray-600 mt-2">Chargement des services...</p>
        </div>
      )}

      {/* État d'erreur */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
          <button 
            onClick={reloadServices}
            className="mt-2 text-red-600 hover:text-red-800 underline"
          >
            Réessayer
          </button>
        </div>
      )}

      {/* Liste des services */}
      {!loading && !error && (
        <div className="grid gap-4">
          {services.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Cog8ToothIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>Aucun service trouvé</p>
              <p className="text-sm text-gray-400 mt-1">Créez votre premier service en cliquant sur "Nouveau Service"</p>
            </div>
          ) : (
            services.map((service) => (
              <div key={service.id} className="bg-white p-4 rounded-lg border border-gray-100 hover:shadow-sm transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Cog8ToothIcon className="w-6 h-6 text-green-500" />
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">{service.nom}</h4>
                        <p className="text-sm text-gray-600">{service.categorie || 'Non spécifié'}</p>
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
                    
                    {service.configuration && Object.keys(service.configuration).length > 0 && (
                      <div className="p-3 bg-gray-50 rounded-lg border">
                        <label className="font-medium text-gray-700 mb-2 block">Configuration</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
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
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleEditService(service)}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Modifier"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteService(service.id)}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Supprimer"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );

  const UtilisateursPanel: React.FC = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Utilisateurs</h2>
          <p className="text-gray-600 mt-1">
            Gérez les comptes utilisateurs et leurs permissions
          </p>
        </div>
        <button 
          onClick={handleCreateUser}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center gap-2"
        >
          <PlusIcon className="w-4 h-4" />
          Nouvel Utilisateur
        </button>
      </div>

      {/* État de chargement */}
      {usersLoading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-gray-600 mt-2">Chargement des utilisateurs...</p>
        </div>
      )}

      {/* État d'erreur */}
      {usersError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <XCircleIcon className="w-5 h-5 text-red-500" />
            <p className="text-red-700 font-medium">Erreur de chargement</p>
          </div>
          <p className="text-red-600 text-sm mt-1">{usersError}</p>
          <button 
            onClick={() => dispatch(fetchUsers())}
            className="mt-2 text-sm text-red-600 hover:text-red-700 underline"
          >
            Réessayer
          </button>
        </div>
      )}

      {/* Liste des utilisateurs */}
      {!usersLoading && !usersError && (
        <div className="grid gap-4">
          {!users || users.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <UsersIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>Aucun utilisateur trouvé</p>
              <p className="text-sm text-gray-400 mt-1">Créez votre premier utilisateur en cliquant sur "Nouvel Utilisateur"</p>
            </div>
          ) : (
            users.map((user: User) => (
              <div key={user.id} className="bg-white p-4 rounded-lg border border-gray-100 hover:shadow-sm transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <UserIcon className="w-6 h-6 text-blue-500" />
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">
                          {user.nom_complet || user.email}
                        </h4>
                        <p className="text-sm text-gray-600">{user.email}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Type</label>
                        <p className="text-gray-900">{user.type_utilisateur}</p>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-gray-500">Statut</label>
                        <div className="mt-1">
                          <StatusBadge active={user.est_actif} label={user.est_actif ? 'Actif' : 'Inactif'} />
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-gray-500">Créé le</label>
                        <p className="text-gray-900 text-sm">{formatDate((user as any).date_creation ?? user.created)}</p>
                      </div>
                    </div>
                    
                    {user.configuration && Object.keys(user.configuration).length > 0 && (
                      <div className="p-3 bg-gray-50 rounded-lg border">
                        <label className="font-medium text-gray-700 mb-2 block">Configuration</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                          {user.configuration.fonction && (
                            <div>
                              <span className="font-medium text-gray-600">Fonction:</span>
                              <span className="text-gray-900 ml-2">{user.configuration.fonction}</span>
                            </div>
                          )}
                          {user.configuration.specialite && (
                            <div>
                              <span className="font-medium text-gray-600">Spécialité:</span>
                              <span className="text-gray-900 ml-2">{user.configuration.specialite}</span>
                            </div>
                          )}
                          {user.configuration.telephone && (
                            <div>
                              <span className="font-medium text-gray-600">Téléphone:</span>
                              <span className="text-gray-900 ml-2">{user.configuration.telephone}</span>
                            </div>
                          )}
                          {user.configuration.numero_rpps && (
                            <div>
                              <span className="font-medium text-gray-600">RPPS:</span>
                              <span className="text-gray-900 ml-2">{user.configuration.numero_rpps}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleEditUser(user)}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Modifier"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Supprimer"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );

  const SystemePanel: React.FC = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Système</h2>
          <p className="text-gray-600 mt-1">
            Monitoring et configuration du système
          </p>
        </div>
      </div>
      
      <div className="text-center py-8 text-gray-500">
        <ServerIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
        <p>Monitoring système à venir</p>
      </div>
    </div>
  );

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      {/* Navigation par onglets */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6" aria-label="Tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm
                  ${activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                {tab.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Contenu des onglets */}
      <div className="p-6">
        {activeTab === 'services' && <ServicesPanel />}
        {activeTab === 'utilisateurs' && <UtilisateursPanel />}
        {activeTab === 'systeme' && <SystemePanel />}
      </div>
    </div>
  );
};

export default AdminPanelV2; 