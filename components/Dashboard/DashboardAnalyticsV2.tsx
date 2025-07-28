'use client';

import React, { useState, useEffect } from 'react';
import { 
  ChartBarIcon, 
  ArrowTrendingUpIcon, 
  ArrowTrendingDownIcon,
  CalendarIcon,
  BuildingOfficeIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { useOrganisations, useServices } from '@/lib/api-unified';
import { Organisation, Service } from '@/lib/api-unified';
import { useAppStore } from '@/hooks/useAppStore';

interface DashboardAnalyticsV2Props {
  className?: string;
}

const DashboardAnalyticsV2: React.FC<DashboardAnalyticsV2Props> = ({ className = '' }) => {
  const [selectedOrganisation, setSelectedOrganisation] = useState<number | undefined>();
  const [selectedService, setSelectedService] = useState<number | undefined>();
  const [periodeJours, setPeriodeJours] = useState(30);

  const { organisations } = useOrganisations();
  const { services } = useServices(selectedOrganisation);
  const { statistiques, loading, errors, actions } = useAppStore();
  
  // Charger les statistiques au montage du composant
  useEffect(() => {
    console.log('🔄 DashboardAnalyticsV2: Chargement des statistiques...');
    actions.fetchStats();
  }, [actions]);
  
  // Log de débogage pour voir l'état
  useEffect(() => {
    console.log('📊 DashboardAnalyticsV2 - État actuel:', {
      loading: loading.stats,
      errors: errors.stats,
      statistiques: statistiques,
      hasData: !!statistiques
    });
  }, [loading.stats, errors.stats, statistiques]);
  
  const refetch = () => actions.fetchStats();

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('fr-FR').format(num);
  };

  const formatPercentage = (num: number | null | undefined) => {
    if (num === null || num === undefined) return 'N/A';
    const sign = num > 0 ? '+' : '';
    return `${sign}${num.toFixed(1)}%`;
  };

  const getTrendIcon = (trend: number | null | undefined) => {
    if (trend === null || trend === undefined) return null;
    return trend > 0 ? 
      <ArrowTrendingUpIcon className="w-4 h-4 text-green-500" /> : 
      <ArrowTrendingDownIcon className="w-4 h-4 text-red-500" />;
  };

  const StatCard: React.FC<{
    title: string;
    value: number | string;
    icon: React.ReactNode;
    trend?: number | null;
    color: string;
    description?: string;
  }> = ({ title, value, icon, trend, color, description }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`text-2xl font-bold ${color} mt-1`}>
            {typeof value === 'number' ? formatNumber(value) : value}
          </p>
          {description && (
            <p className="text-xs text-gray-500 mt-1">{description}</p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color.replace('text-', 'bg-').replace('-600', '-100')}`}>
          {icon}
        </div>
      </div>
      {trend !== null && trend !== undefined && (
        <div className="flex items-center mt-3 text-sm">
          {getTrendIcon(trend)}
          <span className={`ml-1 ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatPercentage(trend)}
          </span>
          <span className="text-gray-500 ml-1">vs période précédente</span>
        </div>
      )}
    </div>
  );

  const ChartCard: React.FC<{
    title: string;
    data: Record<string, number>;
    color: string;
    type: 'bar' | 'pie';
  }> = ({ title, data, color, type }) => {
    const values = Object.values(data);
    const maxValue = values.length > 0 ? Math.max(...values) : 0;
    const total = values.reduce((sum, val) => sum + val, 0);

    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
        
        {type === 'bar' && (
          <div className="space-y-3">
            {Object.entries(data).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 capitalize">
                  {key.toLowerCase().replace('_', ' ')}
                </span>
                <div className="flex items-center space-x-3 flex-1 ml-4">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${color}`}
                      style={{ width: `${(value / maxValue) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold text-gray-900 w-12 text-right">
                    {formatNumber(value)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {type === 'pie' && (
          <div className="space-y-2">
            {Object.entries(data).map(([key, value]) => {
              const percentage = ((value / total) * 100).toFixed(1);
              return (
                <div key={key} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${color}`} />
                    <span className="text-sm font-medium text-gray-700 capitalize">
                      {key.toLowerCase().replace('_', ' ')}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-gray-900">
                      {formatNumber(value)}
                    </span>
                    <span className="text-xs text-gray-500 ml-1">
                      ({percentage}%)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  // Test simple pour vérifier le store
  console.log('🔍 DashboardAnalyticsV2 - État complet:', {
    loading,
    errors,
    statistiques,
    hasData: !!statistiques,
    statistiquesKeys: statistiques ? Object.keys(statistiques) : []
  });

  if (loading) {
    return (
      <div className={`${className} flex items-center justify-center p-8`}>
        <div className="flex items-center space-x-3">
          <ArrowPathIcon className="w-6 h-6 animate-spin text-blue-500" />
          <span className="text-gray-600">Chargement des statistiques...</span>
        </div>
        {/* Debug info */}
        <div className="mt-4 text-xs text-gray-500">
          <p>Loading: {JSON.stringify(loading)}</p>
          <p>Errors: {JSON.stringify(errors)}</p>
          <p>Has Data: {statistiques ? 'Yes' : 'No'}</p>
          <button 
            onClick={refetch}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded text-sm"
          >
            Forcer le rechargement
          </button>
        </div>
      </div>
    );
  }

  if (errors.stats) {
    return (
      <div className={`${className} bg-red-50 border border-red-200 rounded-lg p-6`}>
        <div className="flex items-center space-x-3">
          <ExclamationTriangleIcon className="w-6 h-6 text-red-500" />
          <div>
            <h3 className="text-red-800 font-medium">Erreur de chargement</h3>
            <p className="text-red-600 text-sm mt-1">{errors.stats}</p>
            <button 
              onClick={refetch}
              className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
            >
              Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!statistiques) {
    return (
      <div className={`${className} text-center text-gray-500 p-8`}>
        Aucune donnée disponible
        <button 
          onClick={refetch}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded text-sm"
        >
          Recharger
        </button>
      </div>
    );
  }

  return (
    <div className={`${className} space-y-6`}>
      {/* Filtres */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <CalendarIcon className="w-5 h-5 text-gray-400" />
            <select 
              value={periodeJours}
              onChange={(e) => setPeriodeJours(Number(e.target.value))}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={7}>7 derniers jours</option>
              <option value={30}>30 derniers jours</option>
              <option value={90}>90 derniers jours</option>
              <option value={365}>1 an</option>
            </select>
          </div>

          {organisations.length > 0 && (
            <div className="flex items-center space-x-2">
              <BuildingOfficeIcon className="w-5 h-5 text-gray-400" />
              <select 
                value={selectedOrganisation || ''}
                onChange={(e) => setSelectedOrganisation(e.target.value ? Number(e.target.value) : undefined)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Toutes les organisations</option>
                {organisations.map(org => (
                  <option key={org.id} value={org.id}>{org.nom}</option>
                ))}
              </select>
            </div>
          )}

          {services.length > 0 && (
            <div className="flex items-center space-x-2">
              <ClockIcon className="w-5 h-5 text-gray-400" />
              <select 
                value={selectedService || ''}
                onChange={(e) => setSelectedService(e.target.value ? Number(e.target.value) : undefined)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tous les services</option>
                {services.map(service => (
                  <option key={service.id} value={service.id}>{service.nom}</option>
                ))}
              </select>
            </div>
          )}

          <button 
            onClick={refetch}
            className="ml-auto flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <ArrowPathIcon className="w-4 h-4" />
            <span>Actualiser</span>
          </button>
        </div>
      </div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Plaintes"
          value={statistiques?.statistiques_detaillees?.plaintes?.total || 0}
          icon={<ChartBarIcon className="w-6 h-6" />}
          color="text-blue-600"
          description={`Sur ${periodeJours} jours`}
        />
        
        <StatCard
          title="Nouvelles Plaintes"
          value={statistiques?.nouvelles_plaintes || 0}
          icon={<ExclamationTriangleIcon className="w-6 h-6" />}
          trend={statistiques?.progression?.nouvelles_plaintes ? parseInt(statistiques.progression.nouvelles_plaintes.replace('+', '').replace('%', '')) : null}
          color="text-orange-600"
        />
        
        <StatCard
          title="En Cours"
          value={statistiques?.en_cours_traitement || 0}
          icon={<ClockIcon className="w-6 h-6" />}
          color="text-yellow-600"
        />
        
        <StatCard
          title="Résolues"
          value={statistiques?.traitees_ce_mois || 0}
          icon={<CheckCircleIcon className="w-6 h-6" />}
          trend={statistiques?.progression?.traitees_ce_mois ? parseInt(statistiques.progression.traitees_ce_mois.replace('+', '').replace('%', '')) : null}
          color="text-green-600"
        />
      </div>

      {/* Graphiques de répartition */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ChartCard
          title="Répartition par Statut"
          data={Object.fromEntries(statistiques?.repartitions?.par_services?.map((item: any) => [item.service, item.count]) || [])}
          color="bg-blue-500"
          type="pie"
        />
        
        <ChartCard
          title="Répartition par Priorité"
          data={Object.fromEntries(statistiques?.repartitions?.par_priorites?.map((item: any) => [item.priorite, item.count]) || [])}
          color="bg-orange-500"
          type="bar"
        />
        
        <ChartCard
          title="Répartition par Service"
          data={Object.fromEntries(statistiques?.repartitions?.par_services?.map((item: any) => [item.service, item.count]) || [])}
          color="bg-green-500"
          type="bar"
        />
      </div>

      {/* Métriques avancées */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatCard
          title="Durée Moyenne de Résolution"
          value="3.2 jours"
          icon={<ClockIcon className="w-6 h-6" />}
          color="text-purple-600"
        />
        
        <StatCard
          title="Satisfaction Moyenne"
          value="85.2%"
          icon={<CheckCircleIcon className="w-6 h-6" />}
          color="text-indigo-600"
        />
      </div>

      {/* Informations sur la dernière mise à jour */}
      <div className="text-center text-sm text-gray-500">
        Dernière mise à jour : {new Date().toLocaleString('fr-FR')}
      </div>
    </div>
  );
};

export default DashboardAnalyticsV2; 