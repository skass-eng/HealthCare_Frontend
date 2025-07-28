'use client';

import React, { useState, useEffect } from 'react';
import { 
  ChartBarIcon,
  MagnifyingGlassIcon,
  Cog8ToothIcon,
  ShieldCheckIcon,
  SparklesIcon,
  BeakerIcon
} from '@heroicons/react/24/outline';
import DashboardAnalyticsV2 from '@/components/Dashboard/DashboardAnalyticsV2';
import RechercheAvanceeV2 from '@/components/Plaintes/RechercheAvanceeV2';
import AdminPanelV2 from '@/components/Admin/AdminPanelV2';
import AuditLogViewer from '@/components/Audit/AuditLogV2';
import { Plainte } from '@/lib/api-unified';

type ActiveView = 'dashboard' | 'recherche' | 'admin' | 'audit' | 'ia';

export default function AnalyticsV2Page() {
  const [activeView, setActiveView] = useState<ActiveView>('dashboard');
  const [selectedPlainte, setSelectedPlainte] = useState<Plainte | null>(null);
  const [showWelcome, setShowWelcome] = useState(true);

  // Afficher une notification de bienvenue
  useEffect(() => {
    const timer = setTimeout(() => setShowWelcome(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  const views = [
    {
      id: 'dashboard' as const,
      name: 'Dashboard Analytics',
      icon: ChartBarIcon,
      description: 'Statistiques avancées et métriques en temps réel',
      color: 'bg-blue-500',
      hoverColor: 'hover:bg-blue-600'
    },
    {
      id: 'recherche' as const,
      name: 'Recherche Avancée',
      icon: MagnifyingGlassIcon,
      description: 'Recherche et filtrage intelligent des plaintes',
      color: 'bg-green-500',
      hoverColor: 'hover:bg-green-600'
    },
    {
      id: 'admin' as const,
      name: 'Administration',
      icon: Cog8ToothIcon,
      description: 'Gestion des organisations et services',
      color: 'bg-purple-500',
      hoverColor: 'hover:bg-purple-600'
    },
    {
      id: 'audit' as const,
      name: 'Journal d\'Audit',
      icon: ShieldCheckIcon,
      description: 'Traçabilité et historique des actions',
      color: 'bg-orange-500',
      hoverColor: 'hover:bg-orange-600'
    },
    {
      id: 'ia' as const,
      name: 'IA & Analytics',
      icon: SparklesIcon,
      description: 'Intelligence artificielle et analyse prédictive',
      color: 'bg-pink-500',
      hoverColor: 'hover:bg-pink-600'
    }
  ];

  const currentView = views.find(v => v.id === activeView);

  const IAPanel: React.FC = () => (
    <div className="space-y-6">
      <div className="bg-white p-8 rounded-xl border border-gray-100 text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <SparklesIcon className="w-10 h-10 text-white" />
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          Fonctionnalités IA & Analytics Avancées
        </h2>
        
        <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
          Cette section intègre l'intelligence artificielle pour l'analyse automatique des plaintes, 
          la classification intelligente, et les insights prédictifs.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {/* Analyse de Sentiment */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-6 rounded-xl border border-blue-200">
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mb-4">
              <span className="text-xl">🎭</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Analyse de Sentiment
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              Détection automatique du sentiment (positif, négatif, neutre) dans les plaintes
            </p>
            <div className="text-xs text-blue-600 font-medium">
              ✨ Disponible avec l'API V2
            </div>
          </div>

          {/* Classification Automatique */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-6 rounded-xl border border-green-200">
            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mb-4">
              <span className="text-xl">🏷️</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Classification Auto
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              Catégorisation intelligente des plaintes par type, priorité et service
            </p>
            <div className="text-xs text-green-600 font-medium">
              🤖 IA Intégrée
            </div>
          </div>

          {/* Suggestions Intelligentes */}
          <div className="bg-gradient-to-br from-purple-50 to-violet-100 p-6 rounded-xl border border-purple-200">
            <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mb-4">
              <span className="text-xl">💡</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Suggestions IA
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              Recommandations automatiques pour le traitement des plaintes
            </p>
            <div className="text-xs text-purple-600 font-medium">
              🧠 Machine Learning
            </div>
          </div>

          {/* Analyse Prédictive */}
          <div className="bg-gradient-to-br from-orange-50 to-red-100 p-6 rounded-xl border border-orange-200">
            <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center mb-4">
              <span className="text-xl">🔮</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Analytics Prédictive
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              Prédiction des tendances et identification des risques
            </p>
            <div className="text-xs text-orange-600 font-medium">
              📈 Big Data
            </div>
          </div>

          {/* Détection d'Anomalies */}
          <div className="bg-gradient-to-br from-red-50 to-pink-100 p-6 rounded-xl border border-red-200">
            <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center mb-4">
              <span className="text-xl">🚨</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Détection d'Anomalies
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              Identification automatique des patterns inhabituels
            </p>
            <div className="text-xs text-red-600 font-medium">
              ⚡ Temps Réel
            </div>
          </div>

          {/* Résumé Automatique */}
          <div className="bg-gradient-to-br from-yellow-50 to-amber-100 p-6 rounded-xl border border-yellow-200">
            <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center mb-4">
              <span className="text-xl">📄</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Résumé Auto
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              Génération automatique de résumés et points clés
            </p>
            <div className="text-xs text-yellow-600 font-medium">
              📝 NLP Avancé
            </div>
          </div>
        </div>

        <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-center gap-2 text-blue-700 font-medium">
            <BeakerIcon className="w-5 h-5" />
            <span>Architecture V2 avec IA Ready</span>
          </div>
          <p className="text-blue-600 text-sm mt-2">
            Toutes ces fonctionnalités sont prêtes à être intégrées grâce à l'architecture V2 
            et peuvent être activées avec les modèles d'IA appropriés.
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Notification de bienvenue */}
      {showWelcome && (
        <div className="fixed top-4 right-4 z-50 bg-gradient-to-r from-purple-500 to-blue-500 text-white p-4 rounded-lg shadow-lg max-w-sm animate-slide-in-right">
          <div className="flex items-center gap-2 mb-2">
            <SparklesIcon className="w-5 h-5" />
            <span className="font-bold">Bienvenue dans Analytics V2 !</span>
          </div>
          <p className="text-sm text-white/90">
            Découvrez la nouvelle plateforme d'analyse avancée avec toutes ses fonctionnalités.
          </p>
          <button 
            onClick={() => setShowWelcome(false)}
            className="absolute top-2 right-2 text-white/70 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}
      
      {/* En-tête */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  HealthCare AI Analytics Avancés
                </h1>
                <p className="text-gray-600 mt-1">
                  Plateforme avancée d'analyse et de gestion des plaintes avec IA
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  API V2 Active
                </div>
                <div className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  927 Plaintes Migrées
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation par cartes */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {views.map((view) => (
            <button
              key={view.id}
              onClick={() => setActiveView(view.id)}
              className={`p-6 rounded-xl border-2 transition-all duration-200 text-left ${
                activeView === view.id
                  ? `${view.color} text-white border-transparent shadow-lg scale-105`
                  : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:shadow-md'
              }`}
            >
              <view.icon className={`w-8 h-8 mb-3 ${
                activeView === view.id ? 'text-white' : 'text-gray-500'
              }`} />
              <h3 className={`font-semibold mb-2 ${
                activeView === view.id ? 'text-white' : 'text-gray-900'
              }`}>
                {view.name}
              </h3>
              <p className={`text-sm ${
                activeView === view.id ? 'text-white/90' : 'text-gray-600'
              }`}>
                {view.description}
              </p>
            </button>
          ))}
        </div>

        {/* Contenu de la vue active */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {/* En-tête de la section */}
          <div className={`px-8 py-6 ${currentView?.color} text-white`}>
            <div className="flex items-center gap-3">
              {currentView && <currentView.icon className="w-8 h-8" />}
              <div>
                <h2 className="text-2xl font-bold">{currentView?.name}</h2>
                <p className="text-white/90 mt-1">{currentView?.description}</p>
              </div>
            </div>
          </div>

          {/* Contenu */}
          <div className="p-8">
            {activeView === 'dashboard' && <DashboardAnalyticsV2 />}
            {activeView === 'recherche' && (
              <RechercheAvanceeV2 
                onPlainteSelect={setSelectedPlainte}
              />
            )}
            {activeView === 'admin' && <AdminPanelV2 />}
            {activeView === 'audit' && <AuditLogViewer />}
            {activeView === 'ia' && <IAPanel />}
          </div>
        </div>
      </div>

      {/* Modal de détails de plainte */}
      {selectedPlainte && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {selectedPlainte.titre}
                  </h3>
                  <p className="text-gray-600 mt-1">
                    #{selectedPlainte.plainte_id}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedPlainte(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Informations</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Statut</label>
                      <p className="text-gray-900">{selectedPlainte.status}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Priorité</label>
                      <p className="text-gray-900">{selectedPlainte.priorite}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Service</label>
                      <p className="text-gray-900">{selectedPlainte.service_id ? `Service ID: ${selectedPlainte.service_id}` : 'Non assigné'}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Description</h4>
                  <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">
                    {selectedPlainte.description}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 