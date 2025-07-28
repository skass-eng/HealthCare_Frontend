'use client';

import React, { useState, useEffect } from 'react';
import { 
  ClockIcon,
  UserIcon,
  DocumentTextIcon,
  FunnelIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  CalendarDaysIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { apiUnified, AuditLog, AuditLogResponse } from '@/lib/api-unified';

interface AuditLogV2Props {
  className?: string;
}

const AuditLogViewer: React.FC<AuditLogV2Props> = ({ className = '' }) => {
  const [auditEntries, setAuditEntries] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Filtres
  const [filtres, setFiltres] = useState({
    action: '',
    ressource_type: '',
    limit: 50,
    skip: 0
  });
  
  const [showFilters, setShowFilters] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<AuditLog | null>(null);

  // Charger les entrées d'audit
  const chargerAuditLog = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        ...filtres,
        ...(filtres.action && { action: filtres.action }),
        ...(filtres.ressource_type && { objet_type: filtres.ressource_type })
      };
      
      const response: AuditLogResponse = await apiUnified.getAuditLog(params);
      setAuditEntries(response.logs || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
      setAuditEntries([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    chargerAuditLog();
  }, []);

  const handleFiltreChange = (key: string, value: any) => {
    setFiltres(prev => ({ ...prev, [key]: value, skip: 0 }));
  };

  const handlePageChange = (direction: 'prev' | 'next') => {
    const newSkip = direction === 'prev' 
      ? Math.max(0, filtres.skip - filtres.limit)
      : filtres.skip + filtres.limit;
    
    setFiltres(prev => ({ ...prev, skip: newSkip }));
    chargerAuditLog();
  };

  const getActionColor = (action: string) => {
    switch (action.toLowerCase()) {
      case 'create': return 'bg-green-100 text-green-800';
      case 'update': return 'bg-blue-100 text-blue-800';
      case 'delete': return 'bg-red-100 text-red-800';
      case 'read': return 'bg-gray-100 text-gray-800';
      case 'login': return 'bg-purple-100 text-purple-800';
      case 'logout': return 'bg-orange-100 text-orange-800';
      case 'migration': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getActionIcon = (action: string) => {
    switch (action.toLowerCase()) {
      case 'create': return '➕';
      case 'update': return '✏️';
      case 'delete': return '🗑️';
      case 'read': return '👁️';
      case 'login': return '🔐';
      case 'logout': return '🚪';
      case 'migration': return '🔄';
      default: return '📋';
    }
  };

  const getResourceIcon = (resourceType: string) => {
    switch (resourceType.toLowerCase()) {
      case 'plainte': return '📝';
      case 'user': return '👤';
      case 'organisation': return '🏥';
      case 'service': return '⚙️';
      case 'system': return '🖥️';
      default: return '📄';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMinutes < 1) return 'À l\'instant';
    if (diffMinutes < 60) return `Il y a ${diffMinutes} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays} jour(s)`;
    
    return formatDate(dateString);
  };

  return (
    <div className={`${className} space-y-6`}>
      {/* En-tête */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <ShieldCheckIcon className="w-8 h-8 text-blue-500" />
              Journal d'Audit
            </h2>
            <p className="text-gray-600 mt-1">
              Traçabilité complète des actions effectuées dans le système
            </p>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2 border rounded-lg flex items-center gap-2 transition-colors ${
                showFilters 
                  ? 'bg-blue-50 border-blue-300 text-blue-700' 
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <FunnelIcon className="w-4 h-4" />
              Filtres
            </button>
            
            <button
              onClick={chargerAuditLog}
              disabled={loading}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 flex items-center gap-2"
            >
              <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Actualiser
            </button>
          </div>
        </div>

        {/* Filtres */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Action
              </label>
              <select
                value={filtres.action}
                onChange={(e) => handleFiltreChange('action', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Toutes les actions</option>
                <option value="CREATE">Création</option>
                <option value="UPDATE">Modification</option>
                <option value="DELETE">Suppression</option>
                <option value="READ">Lecture</option>
                <option value="LOGIN">Connexion</option>
                <option value="LOGOUT">Déconnexion</option>
                <option value="MIGRATION">Migration</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type de Ressource
              </label>
              <select
                value={filtres.ressource_type}
                onChange={(e) => handleFiltreChange('ressource_type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tous les types</option>
                <option value="PLAINTE">Plainte</option>
                <option value="USER">Utilisateur</option>
                <option value="ORGANISATION">Organisation</option>
                <option value="SERVICE">Service</option>
                <option value="SYSTEM">Système</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Éléments par page
              </label>
              <select
                value={filtres.limit}
                onChange={(e) => handleFiltreChange('limit', Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={200}>200</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setFiltres({ action: '', ressource_type: '', limit: 50, skip: 0 });
                  chargerAuditLog();
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2"
              >
                Réinitialiser
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Contenu principal */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <ExclamationTriangleIcon className="w-6 h-6 text-red-500" />
            <div>
              <h3 className="text-red-800 font-medium">Erreur de chargement</h3>
              <p className="text-red-600 text-sm mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="text-center py-8">
          <ArrowPathIcon className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-3" />
          <p className="text-gray-600">Chargement du journal d'audit...</p>
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Statistiques rapides */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <DocumentTextIcon className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Entrées</p>
                  <p className="text-xl font-bold text-gray-900">{auditEntries.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <span className="text-lg">➕</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Créations</p>
                  <p className="text-xl font-bold text-gray-900">
                    {auditEntries.filter(e => e.action === 'CREATE').length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <span className="text-lg">✏️</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Modifications</p>
                  <p className="text-xl font-bold text-gray-900">
                    {auditEntries.filter(e => e.action === 'UPDATE').length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <span className="text-lg">🗑️</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Suppressions</p>
                  <p className="text-xl font-bold text-gray-900">
                    {auditEntries.filter(e => e.action === 'DELETE').length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Liste des entrées d'audit */}
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            {auditEntries.length === 0 ? (
              <div className="text-center py-12">
                <ShieldCheckIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune entrée d'audit</h3>
                <p className="text-gray-600">
                  Aucune activité trouvée avec les filtres actuels
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {auditEntries.map((entry) => (
                  <div 
                    key={entry.id} 
                    className="p-6 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => setSelectedEntry(entry)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        {/* Icône d'action */}
                        <div className="flex-shrink-0 mt-1">
                          <span className="text-2xl">{getActionIcon(entry.action)}</span>
                        </div>
                        
                        {/* Contenu principal */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getActionColor(entry.action)}`}>
                              {entry.action}
                            </span>
                            
                            <span className="text-sm text-gray-500 flex items-center gap-1">
                              {getResourceIcon(entry.ressource_type)}
                              {entry.ressource_type}
                            </span>
                            
                            {entry.ressource_id && (
                              <span className="text-sm font-mono text-gray-600 bg-gray-100 px-2 py-1 rounded">
                                #{entry.ressource_id}
                              </span>
                            )}
                          </div>
                          
                          <p className="text-gray-900 font-medium mb-1">
                            {entry.description}
                          </p>
                          
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <ClockIcon className="w-4 h-4" />
                              {formatRelativeTime(entry.date_action)}
                            </span>
                            
                            {entry.utilisateur_id && (
                              <span className="flex items-center gap-1">
                                <UserIcon className="w-4 h-4" />
                                Utilisateur #{entry.utilisateur_id}
                              </span>
                            )}
                            
                            {entry.adresse_ip && (
                              <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                                {entry.adresse_ip}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Bouton détails */}
                      <button className="flex-shrink-0 p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <EyeIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
                              Affichage de {filtres.skip + 1} à {Math.min(filtres.skip + filtres.limit, filtres.skip + auditEntries.length)} entrées
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange('prev')}
                disabled={filtres.skip === 0}
                className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                <ChevronLeftIcon className="w-5 h-5" />
              </button>
              
              <button
                onClick={() => handlePageChange('next')}
                disabled={auditEntries.length < filtres.limit}
                className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                <ChevronRightIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </>
      )}

      {/* Modal de détails */}
      {selectedEntry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-semibold text-gray-900">
                  Détails de l'Audit #{selectedEntry.id}
                </h3>
                <button
                  onClick={() => setSelectedEntry(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Action</label>
                  <p className="text-gray-900 mt-1">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getActionColor(selectedEntry.action)}`}>
                      {getActionIcon(selectedEntry.action)} {selectedEntry.action}
                    </span>
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Type de Ressource</label>
                  <p className="text-gray-900 mt-1">{selectedEntry.ressource_type}</p>
                </div>
                
                {selectedEntry.ressource_id && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">ID Ressource</label>
                    <p className="text-gray-900 mt-1 font-mono">{selectedEntry.ressource_id}</p>
                  </div>
                )}
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Date et Heure</label>
                  <p className="text-gray-900 mt-1">{formatDate(selectedEntry.date_action)}</p>
                </div>
                
                {selectedEntry.utilisateur_id && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Utilisateur</label>
                    <p className="text-gray-900 mt-1">#{selectedEntry.utilisateur_id}</p>
                  </div>
                )}
                
                {selectedEntry.adresse_ip && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Adresse IP</label>
                    <p className="text-gray-900 mt-1 font-mono">{selectedEntry.adresse_ip}</p>
                  </div>
                )}
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Description</label>
                <p className="text-gray-900 mt-1 p-3 bg-gray-50 rounded-lg">
                  {selectedEntry.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditLogViewer; 