'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  PencilIcon,
  ArrowPathIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  DocumentIcon
} from '@heroicons/react/24/outline';
import { apiUnified, Plainte, useOrganisations, useServices } from '@/lib/api-unified';
import { useAppStore } from '@/hooks/useAppStore';

interface RechercheAvanceeV2Props {
  className?: string;
  onPlainteSelect?: (plainte: Plainte) => void;
}

const RechercheAvanceeV2: React.FC<RechercheAvanceeV2Props> = ({ 
  className = '', 
  onPlainteSelect 
}) => {
  const { actions } = useAppStore();
  
  // États pour la recherche
  const [filtres, setFiltres] = useState<any>({
    page: 1,
    limit: 20,
    tri_par: 'date_creation',
    tri_ordre: 'desc'
  });
  
  const [resultats, setResultats] = useState<{
    plaintes: Plainte[];
    total: number;
    total_pages: number;
    agregations?: Record<string, any>;
  } | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  
  // Données pour les filtres
  const { organisations } = useOrganisations();
  const { services } = useServices(filtres.organisation_id);

  // Fonction de recherche
  const effectuerRecherche = useCallback(async (nouveauxFiltres?: Partial<any>) => {
    try {
      setLoading(true);
      setError(null);
      
      const filtresFinaux = { ...filtres, ...nouveauxFiltres };
      const response = await apiUnified.rechercherPlaintes(filtresFinaux);
      
      setResultats({
        plaintes: response.plaintes,
        total: response.total,
        total_pages: response.total_pages
      });
      
      setFiltres(filtresFinaux);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la recherche');
      setResultats(null);
    } finally {
      setLoading(false);
    }
  }, [filtres]);

  // Recherche initiale
  useEffect(() => {
    effectuerRecherche();
  }, []);

  // Gestionnaires d'événements
  const handleFiltreChange = (key: keyof any, value: any) => {
    const nouveauxFiltres = { ...filtres, [key]: value, page: 1 };
    setFiltres(nouveauxFiltres);
  };

  const handleRechercheSubmit = () => {
    effectuerRecherche();
  };

  const handlePageChange = (nouvellePage: number) => {
    effectuerRecherche({ page: nouvellePage });
  };

  const resetFiltres = () => {
    const filtresVides: any = {
      page: 1,
      limit: 20,
      tri_par: 'date_creation',
      tri_ordre: 'desc'
    };
    setFiltres(filtresVides);
    effectuerRecherche(filtresVides);
  };

  const getStatusColor = (statut: string) => {
    switch (statut.toLowerCase()) {
      case 'nouvelle': return 'bg-blue-100 text-blue-800';
      case 'en_cours_traitement': return 'bg-yellow-100 text-yellow-800';
      case 'en_attente_validation': return 'bg-orange-100 text-orange-800';
      case 'resolue': return 'bg-green-100 text-green-800';
      case 'fermee': return 'bg-gray-100 text-gray-800';
      case 'archivee': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priorite: string) => {
    switch (priorite.toLowerCase()) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'eleve': return 'bg-orange-100 text-orange-800';
      case 'moyen': return 'bg-yellow-100 text-yellow-800';
      case 'bas': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={`${className} space-y-6`}>
      {/* Barre de recherche et filtres */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        {/* Recherche textuelle */}
        <div className="flex gap-4 mb-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher dans les plaintes (titre, description, numéro)..."
              value={filtres.recherche || ''}
              onChange={(e) => handleFiltreChange('recherche', e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              onKeyDown={(e) => e.key === 'Enter' && handleRechercheSubmit()}
            />
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-3 border rounded-lg flex items-center gap-2 transition-colors ${
              showFilters 
                ? 'bg-blue-50 border-blue-300 text-blue-700' 
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <FunnelIcon className="w-5 h-5" />
            Filtres
          </button>
          
          <button
            onClick={handleRechercheSubmit}
            disabled={loading}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
              <ArrowPathIcon className="w-5 h-5 animate-spin" />
            ) : (
              <MagnifyingGlassIcon className="w-5 h-5" />
            )}
            Rechercher
          </button>
        </div>

        {/* Filtres avancés */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
            {/* Organisation */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Organisation
              </label>
              <select
                value={filtres.organisation_id || ''}
                onChange={(e) => handleFiltreChange('organisation_id', e.target.value ? Number(e.target.value) : undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Toutes</option>
                {organisations.map(org => (
                  <option key={org.id} value={org.id}>{org.nom}</option>
                ))}
              </select>
            </div>

            {/* Service */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Service
              </label>
              <select
                value={filtres.service_id || ''}
                onChange={(e) => handleFiltreChange('service_id', e.target.value ? Number(e.target.value) : undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tous</option>
                {services.map(service => (
                  <option key={service.id} value={service.id}>{service.nom}</option>
                ))}
              </select>
            </div>

            {/* Statut */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Statut
              </label>
              <select
                value={filtres.statut || ''}
                onChange={(e) => handleFiltreChange('statut', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tous</option>
                <option value="RECU">Nouvelle</option>
                <option value="EN_COURS">En cours</option>
                <option value="EN_ATTENTE_INFORMATION">En attente information</option>
                <option value="EN_COURS_TRAITEMENT">En cours traitement</option>
                <option value="TRAITEE">Traitée</option>
                <option value="RESOLUE">Résolue</option>
                <option value="FERMEE">Fermée</option>
                <option value="ARCHIVEE">Archivée</option>
              </select>
            </div>

            {/* Priorité */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priorité
              </label>
              <select
                value={filtres.priorite || ''}
                onChange={(e) => handleFiltreChange('priorite', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Toutes</option>
                <option value="URGENT">Urgent</option>
                <option value="ELEVE">Élevé</option>
                <option value="MOYEN">Moyen</option>
                <option value="BAS">Bas</option>
              </select>
            </div>

            {/* Date début */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date début
              </label>
              <input
                type="date"
                value={filtres.date_debut || ''}
                onChange={(e) => handleFiltreChange('date_debut', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Date fin */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date fin
              </label>
              <input
                type="date"
                value={filtres.date_fin || ''}
                onChange={(e) => handleFiltreChange('date_fin', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Tri */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Trier par
              </label>
              <select
                value={`${filtres.tri_par}:${filtres.tri_ordre}`}
                onChange={(e) => {
                  const [tri_par, tri_ordre] = e.target.value.split(':');
                  handleFiltreChange('tri_par', tri_par);
                  handleFiltreChange('tri_ordre', tri_ordre);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="date_creation:desc">Date création ↓</option>
                <option value="date_creation:asc">Date création ↑</option>
                <option value="date_modification:desc">Date modification ↓</option>
                <option value="date_modification:asc">Date modification ↑</option>
                <option value="priorite:desc">Priorité ↓</option>
                <option value="priorite:asc">Priorité ↑</option>
              </select>
            </div>

            {/* Bouton reset */}
            <div className="flex items-end">
              <button
                onClick={resetFiltres}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2"
              >
                <XMarkIcon className="w-4 h-4" />
                Réinitialiser
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Résultats de recherche */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <ExclamationTriangleIcon className="w-6 h-6 text-red-500" />
            <div>
              <h3 className="text-red-800 font-medium">Erreur de recherche</h3>
              <p className="text-red-600 text-sm mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="text-center py-8">
          <ArrowPathIcon className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-3" />
          <p className="text-gray-600">Recherche en cours...</p>
        </div>
      )}

      {resultats && !loading && (
        <>
          {/* Informations sur les résultats */}
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              <strong>{resultats.total}</strong> plainte(s) trouvée(s)
              {filtres.page && filtres.limit && (
                <span className="ml-2">
                  (Page {filtres.page} sur {resultats.total_pages})
                </span>
              )}
            </div>
            
            {/* Taille de page */}
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Afficher :</label>
              <select
                value={filtres.limit}
                onChange={(e) => handleFiltreChange('limit', Number(e.target.value))}
                className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span className="text-sm text-gray-600">par page</span>
            </div>
          </div>

          {/* Liste des plaintes */}
          <div className="space-y-3">
            {resultats.plaintes.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <DocumentIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>Aucune plainte trouvée avec ces critères</p>
              </div>
            ) : (
              resultats.plaintes.map((plainte) => (
                <div
                  key={plainte.id}
                  className="bg-white p-6 rounded-xl border border-gray-100 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                          {plainte.titre}
                        </h3>
                        <span className="text-sm text-gray-500 font-mono">
                          #{plainte.plainte_id}
                        </span>
                      </div>
                      
                      <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                        {plainte.description}
                      </p>
                      
                      <div className="flex flex-wrap items-center gap-3 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(plainte.status)}`}>
                          {plainte.status.replace('_', ' ')}
                        </span>
                        
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(plainte.priorite)}`}>
                          {plainte.priorite}
                        </span>
                        
                        {plainte.service_id && (
                          <span className="text-gray-500">
                            📋 Service ID: {plainte.service_id}
                          </span>
                        )}
                        
                        <span className="text-gray-500 flex items-center gap-1">
                          <ClockIcon className="w-4 h-4" />
                          {formatDate(plainte.date_creation)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => onPlainteSelect?.(plainte)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Voir les détails"
                      >
                        <EyeIcon className="w-5 h-5" />
                      </button>
                      
                      <button
                        onClick={() => {
                          // Action pour éditer
                          console.log('Éditer plainte:', plainte.id);
                        }}
                        className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Modifier"
                      >
                        <PencilIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          {resultats.total_pages > 1 && (
            <div className="flex justify-center items-center gap-2 pt-6">
              <button
                onClick={() => handlePageChange((filtres.page || 1) - 1)}
                disabled={!filtres.page || filtres.page <= 1}
                className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                <ChevronLeftIcon className="w-5 h-5" />
              </button>
              
              <div className="flex gap-1">
                {Array.from({ length: Math.min(resultats.total_pages, 7) }, (_, i) => {
                  const page = i + 1;
                  const isActive = page === filtres.page;
                  
                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium ${
                        isActive
                          ? 'bg-blue-500 text-white'
                          : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => handlePageChange((filtres.page || 1) + 1)}
                disabled={!filtres.page || filtres.page >= resultats.total_pages}
                className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                <ChevronRightIcon className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Agrégations */}
          {resultats.agregations && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              {resultats.agregations.total_par_statut && (
                <div className="bg-white p-4 rounded-lg border border-gray-100">
                  <h4 className="font-medium text-gray-900 mb-3">Par Statut</h4>
                  <div className="space-y-2">
                    {Object.entries(resultats.agregations.total_par_statut).map(([statut, count]) => (
                      <div key={statut} className="flex justify-between text-sm">
                        <span className="capitalize">{statut.replace('_', ' ').toLowerCase()}</span>
                        <span className="font-medium">{count as number}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {resultats.agregations.total_par_priorite && (
                <div className="bg-white p-4 rounded-lg border border-gray-100">
                  <h4 className="font-medium text-gray-900 mb-3">Par Priorité</h4>
                  <div className="space-y-2">
                    {Object.entries(resultats.agregations.total_par_priorite).map(([priorite, count]) => (
                      <div key={priorite} className="flex justify-between text-sm">
                        <span className="capitalize">{priorite.toLowerCase()}</span>
                        <span className="font-medium">{count as number}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default RechercheAvanceeV2; 