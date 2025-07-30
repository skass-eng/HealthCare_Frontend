'use client';

import React, { useState } from 'react';
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
  XCircleIcon
} from '@heroicons/react/24/outline';
import { useServices, useUtilisateurs, apiUnified, useApiHealth } from '@/lib/api-unified';
import { Service } from '@/lib/api-unified';
import { useAppStore } from '@/store';

interface AdminPanelV2Props {
  className?: string;
}

const AdminPanelV2: React.FC<AdminPanelV2Props> = ({ className = '' }) => {
  const [activeTab, setActiveTab] = useState<'services' | 'utilisateurs' | 'systeme'>('services');

  
  const { actions: { openServiceConfigPanel, openUserConfigPanel, showNotification } } = useAppStore();


  const { services, loading: servicesLoading, error: servicesError } = useServices();
  const { utilisateurs, loading: usersLoading, error: usersError, createUtilisateur, updateUtilisateur, deleteUtilisateur } = useUtilisateurs();
  
  // Pour avoir les vraies données système
  const { services: allServices } = useServices(); // Tous les services
  const { utilisateurs: allUsers } = useUtilisateurs(); // Tous les utilisateurs

  // Fonctions de gestion des services
  const handleCreateService = () => {
    openServiceConfigPanel(null, 1);
  };

  const handleEditService = (service: Service) => {
    openServiceConfigPanel(service, 1);
  };

  // Cette fonction n'est plus nécessaire, gérée par GlobalModals

  const handleDeleteService = async (serviceId: number) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce service ?')) {
      try {
        await apiUnified.deleteService(serviceId);
        showNotification('success', 'Service supprimé avec succès');
        // Refresh services list
      } catch (error) {
        console.error('Erreur suppression service:', error);
        showNotification('error', 'Erreur lors de la suppression du service');
      }
    }
  };

  // Fonctions de gestion des utilisateurs
  const handleCreateUser = () => {
    openUserConfigPanel(null, 1);
  };

  const handleEditUser = (user: any) => {
    openUserConfigPanel(user, 1);
  };

  const handleDeleteUser = async (userId: number) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      try {
        await deleteUtilisateur(userId);
        showNotification('success', 'Utilisateur supprimé avec succès !');
      } catch (error) {
        console.error('Erreur lors de la suppression de l\'utilisateur:', error);
        showNotification('error', 'Erreur lors de la suppression de l\'utilisateur');
      }
    }
  };
  
  const { health, loading: healthLoading, error: healthError } = useApiHealth();

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

      {/* Liste des services */}
      {servicesLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
          <p className="text-gray-600 mt-2">Chargement des services...</p>
        </div>
      ) : servicesError ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">Erreur : {servicesError}</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {services.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Cog8ToothIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>Aucun service trouvé</p>
              
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
                        <p className="text-sm text-gray-600">{service.type_service}</p>
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
                        <p className="text-gray-900 text-sm">{formatDate(service.date_creation)}</p>
                      </div>
                    </div>
                    
                    {service.description && (
                      <p className="text-gray-600 text-sm mb-3">{service.description}</p>
                    )}
                    
                    {service.configuration && Object.keys(service.configuration).length > 0 && (
                      <div className="p-3 bg-gray-50 rounded-lg border">
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
            ))
          )}
        </div>
      )}
    </div>
  );

  const SystemePanel: React.FC = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Système</h2>
        <p className="text-gray-600 mt-1">
          Monitoring et configuration du système
        </p>
      </div>

      {/* État du système */}
      <div className="bg-white p-6 rounded-xl border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">État du Système</h3>
        
        {healthLoading ? (
          <div className="text-center py-4">
            <div className="animate-spin w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
            <p className="text-gray-600 mt-2">Vérification de l'état...</p>
          </div>
        ) : healthError ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">Erreur : {healthError}</p>
          </div>
        ) : health ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 ${
                health.status === 'OK' ? 'bg-green-100' : 'bg-red-100'
              }`}>
                {health.status === 'OK' ? (
                  <CheckCircleIcon className="w-6 h-6 text-green-600" />
                ) : (
                  <XCircleIcon className="w-6 h-6 text-red-600" />
                )}
              </div>
              <h4 className="font-medium text-gray-900">API Status</h4>
              <p className={`text-sm ${health.status === 'OK' ? 'text-green-600' : 'text-red-600'}`}>
                {health.status}
              </p>
            </div>
            
            <div className="text-center">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 ${
                health.database === 'Connected' ? 'bg-green-100' : 'bg-red-100'
              }`}>
                <ServerIcon className="w-6 h-6 text-gray-600" />
              </div>
              <h4 className="font-medium text-gray-900">Base de Données</h4>
              <p className={`text-sm ${health.database === 'Connected' ? 'text-green-600' : 'text-red-600'}`}>
                {health.database}
              </p>
            </div>
            
            
            
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-3">
                <span className="text-lg font-bold text-purple-600">{allServices.length}</span>
              </div>
              <h4 className="font-medium text-gray-900">Services</h4>
              <p className="text-sm text-gray-600">Configurés</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                <span className="text-lg font-bold text-green-600">{allUsers.length}</span>
              </div>
              <h4 className="font-medium text-gray-900">Utilisateurs</h4>
              <p className="text-sm text-gray-600">Actifs</p>
            </div>
          </div>
        ) : null}
      </div>

      {/* Informations détaillées sur le système */}
      {health && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Informations sur la version */}
          <div className="bg-white p-6 rounded-xl border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">🔧 Informations Système</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Version API</label>
                <p className="text-gray-900 font-mono text-lg">{health.version}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Statut</label>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-green-700 font-medium">{health.status}</span>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Dernière vérification</label>
                <p className="text-gray-900">{formatDate(health.timestamp)}</p>
              </div>
            </div>
          </div>

          

          {/* Services par type */}
          <div className="bg-white p-6 rounded-xl border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">⚙️ Services par Type</h3>
            <div className="space-y-3">
              {Array.from(new Set(allServices.map(s => s.type_service))).map((type) => {
                const servicesOfType = allServices.filter(s => s.type_service === type);
                return (
                  <div key={type} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium text-gray-900">{type}</span>
                    <span className="text-blue-600 font-bold">{servicesOfType.length}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Utilisateurs par rôle */}
          <div className="bg-white p-6 rounded-xl border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">👥 Utilisateurs par Rôle</h3>
            <div className="space-y-3">
              {Array.from(new Set(allUsers.map(u => u.type_utilisateur))).map((role) => {
                const usersOfRole = allUsers.filter(u => u.type_utilisateur === role);
                const roleIcon = role === 'MEDECIN' ? '👨‍⚕️' : 
                                role === 'INFIRMIER' ? '👩‍⚕️' : 
                                role === 'ADMINISTRATEUR' ? '👑' : '👤';
                return (
                  <div key={role} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{roleIcon}</span>
                      <span className="font-medium text-gray-900">{role}</span>
                    </div>
                    <span className="text-blue-600 font-bold">{usersOfRole.length}</span>
                  </div>
                );
              })}
            </div>
          </div>
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
            Gestion des comptes utilisateurs et permissions
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

      {usersError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">❌ Erreur: {usersError}</p>
        </div>
      )}

      {usersLoading ? (
        <div className="bg-white p-8 rounded-xl border border-gray-100 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des utilisateurs...</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {utilisateurs.length === 0 ? (
            <div className="bg-white p-8 rounded-xl border border-gray-100 text-center">
              <UsersIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun utilisateur</h3>
                             <p className="text-gray-600 mb-4">
                 Aucun utilisateur trouvé
               </p>
              <button 
                onClick={handleCreateUser}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center gap-2 mx-auto"
              >
                <PlusIcon className="w-4 h-4" />
                Créer le premier utilisateur
              </button>
            </div>
          ) : (
            utilisateurs.map((user) => {
              const service = services.find(s => s.id === user.service_id);
              
              return (
                <div key={user.id} className="bg-white rounded-xl border border-gray-100 p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-lg">
                          {user.prenom[0]}{user.nom[0]}
                        </span>
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{user.nom_complet}</h3>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            user.statut === 'ACTIF' ? 'bg-green-100 text-green-800' :
                            user.statut === 'INACTIF' ? 'bg-gray-100 text-gray-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {user.statut}
                          </span>
                        </div>
                        
                        <div className="space-y-1 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">📧 {user.email}</span>
                          </div>
                          {user.telephone && (
                            <div className="flex items-center gap-2">
                              <span>📞 {user.telephone}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{user.type_utilisateur || 'Non défini'}</span>
                            {user.fonction && (
                              <span className="text-xs text-gray-500">• {user.fonction}</span>
                            )}
                          </div>
                          {service && (
                            <div className="flex items-center gap-2">
                              <span>🏥 {service.nom} ({service.code_service})</span>
                            </div>
                          )}
                        </div>

                        {/* Permissions */}
                        <div className="mt-3">
                          <div className="flex flex-wrap gap-1">
                            {user.permissions.slice(0, 3).map((permission: string) => (
                              <span key={permission} className="inline-flex items-center px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded">
                                {permission.replace('_', ' ')}
                              </span>
                            ))}
                            {user.permissions.length > 3 && (
                              <span className="inline-flex items-center px-2 py-1 bg-gray-50 text-gray-700 text-xs rounded">
                                +{user.permissions.length - 3} autres
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditUser(user)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Modifier"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Supprimer"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className={`${className} space-y-6`}>
      {/* Navigation par onglets */}
      <div className="bg-white p-1 rounded-xl border border-gray-100">
        <nav className="flex space-x-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span className="hidden sm:inline">{tab.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Contenu de l'onglet actif */}
      <div className="min-h-[600px]">
        {activeTab === 'services' && <ServicesPanel />}
        {activeTab === 'utilisateurs' && <UtilisateursPanel />}
        {activeTab === 'systeme' && <SystemePanel />}
      </div>

      {/* Les modals sont maintenant gérés par GlobalModals */}
    </div>
  );
};

export default AdminPanelV2; 