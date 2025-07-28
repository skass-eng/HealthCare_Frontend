/**
 * Composant pour afficher les APIs utilisées par page via l'API unifiée
 * Affiche dans le dashboard les APIs de chaque page
 */

import React, { useState, useEffect } from 'react';
import { apiUnified } from '@/lib/api-unified';

interface ApisUtiliseesCardUnifiedProps {
  className?: string;
}

interface ApisParPage {
  [page: string]: string[];
}

export default function ApisUtiliseesCardUnified({ className = '' }: ApisUtiliseesCardUnifiedProps) {
  const [apisParPage, setApisParPage] = useState<ApisParPage>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPage, setSelectedPage] = useState<string>('dashboard');

  useEffect(() => {
    const fetchApis = async () => {
      try {
        setLoading(true);
        setError(null);
        const apis = await apiUnified.getPagesApisUtilisees();
        setApisParPage(apis);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur lors du chargement des APIs');
      } finally {
        setLoading(false);
      }
    };

    fetchApis();
  }, []);

  const pages = [
    { key: 'dashboard', label: 'Dashboard', icon: '📊' },
    { key: 'nouvelles-plaintes', label: 'Nouvelles Plaintes', icon: '📝' },
    { key: 'en-cours', label: 'En Cours', icon: '⚡' },
    { key: 'traitees', label: 'Traitées', icon: '✅' },
    { key: 'ameliorations', label: 'Améliorations', icon: '💡' },
    { key: 'analytics', label: 'Analytics', icon: '📈' },
    { key: 'analytics-v2', label: 'Analytics V2', icon: '🤖' },
    { key: 'parametres', label: 'Paramètres', icon: '⚙️' }
  ];

  const getApiMethod = (api: string): { method: string; endpoint: string } => {
    const parts = api.split(' ');
    return {
      method: parts[0],
      endpoint: parts.slice(1).join(' ')
    };
  };

  const getMethodColor = (method: string): string => {
    switch (method) {
      case 'GET': return 'bg-green-100 text-green-800';
      case 'POST': return 'bg-blue-100 text-blue-800';
      case 'PUT': return 'bg-yellow-100 text-yellow-800';
      case 'DELETE': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="text-center text-red-600">
          <p>Erreur: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          🔌 APIs Utilisées par Page (Unifié)
        </h3>
        <span className="text-sm text-gray-500">
          {Object.keys(apisParPage).length} pages
        </span>
      </div>

      {/* Sélecteur de page */}
      <div className="mb-6">
        <div className="grid grid-cols-4 gap-2">
          {pages.map((page) => (
            <button
              key={page.key}
              onClick={() => setSelectedPage(page.key)}
              className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                selectedPage === page.key
                  ? 'bg-purple-100 text-purple-700 border-2 border-purple-300'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border-2 border-transparent'
              }`}
            >
              <div className="text-center">
                <div className="text-lg mb-1">{page.icon}</div>
                <div className="text-xs">{page.label}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* APIs de la page sélectionnée */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-md font-medium text-gray-800">
            {pages.find(p => p.key === selectedPage)?.icon} {pages.find(p => p.key === selectedPage)?.label}
          </h4>
          <span className="text-sm text-gray-500">
            {apisParPage[selectedPage]?.length || 0} APIs
          </span>
        </div>

        {apisParPage[selectedPage] ? (
          <div className="space-y-2">
            {apisParPage[selectedPage].map((api, index) => {
              const { method, endpoint } = getApiMethod(api);
              return (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <span className={`px-2 py-1 rounded text-xs font-mono ${getMethodColor(method)}`}>
                      {method}
                    </span>
                    <span className="text-sm font-mono text-gray-700">
                      {endpoint}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">
                      API Unifié
                    </span>
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-8">
            <p>Aucune API trouvée pour cette page</p>
          </div>
        )}
      </div>

      {/* Statistiques globales */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-purple-600">
              {Object.keys(apisParPage).length}
            </div>
            <div className="text-xs text-gray-500">Pages</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-600">
              {Object.values(apisParPage).flat().length}
            </div>
            <div className="text-xs text-gray-500">APIs Total</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">
              {Math.round(Object.values(apisParPage).flat().length / Object.keys(apisParPage).length)}
            </div>
            <div className="text-xs text-gray-500">APIs/Page</div>
          </div>
        </div>
      </div>

      {/* Légende */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
          <div className="flex items-center space-x-1">
            <span className="px-2 py-1 rounded bg-green-100 text-green-800">GET</span>
            <span>Lecture</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="px-2 py-1 rounded bg-blue-100 text-blue-800">POST</span>
            <span>Création</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="px-2 py-1 rounded bg-yellow-100 text-yellow-800">PUT</span>
            <span>Modification</span>
          </div>
        </div>
      </div>

      {/* Info sur l'intégration */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
          <span className="text-xs text-blue-700">
            Intégré via API Unifiée (Port 8000) → API Pages (Port 8002)
          </span>
        </div>
      </div>
    </div>
  );
} 