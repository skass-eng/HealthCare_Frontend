import { useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useAppDispatch } from '../store';
import {
  fetchHealthcareAiSummary,
  fetchHealthcareAiTrends,
  fetchDetailedStatistics,
  fetchAiInsights,
  fetchRealTimeMetrics,
  setAutoRefresh,
  setRefreshInterval,
  setFilters,
  clearFilters,
  invalidateSummary,
  invalidateTrends,
  invalidateAll,
  refreshSummary,
  refreshTrends,
  selectHealthcareAiSummary,
  selectHealthcareAiTrends,
  selectHealthcareAiDetailedStats,
  selectHealthcareAiInsights,
  selectHealthcareAiRealTimeMetrics,
  selectHealthcareAiFilters,
  selectHealthcareAiConfig,
  selectFormattedSummaryData,
} from '../store/slices/healthcareAiSlice';
import { HealthcareAiFilters } from '../types/api';

/**
 * Hook personnalisé pour utiliser le store Healthcare AI
 * Remplace useHealthcareAiSummary avec une approche Redux
 */
export const useHealthcareAiStore = () => {
  const dispatch = useAppDispatch();
  
  // Sélecteurs pour les données
  const summary = useSelector(selectHealthcareAiSummary);
  const trends = useSelector(selectHealthcareAiTrends);
  const detailedStats = useSelector(selectHealthcareAiDetailedStats);
  const aiInsights = useSelector(selectHealthcareAiInsights);
  const realTimeMetrics = useSelector(selectHealthcareAiRealTimeMetrics);
  const filters = useSelector(selectHealthcareAiFilters);
  const config = useSelector(selectHealthcareAiConfig);
  const formattedData = useSelector(selectFormattedSummaryData);

  // Actions pour charger les données
  const loadSummary = useCallback((filters?: HealthcareAiFilters) => {
    console.log('📊 Chargement du résumé Healthcare AI depuis le store');
    // Ne pas utiliser le système d'annulation automatique pour les données du store
    dispatch(fetchHealthcareAiSummary({ filters }));
  }, [dispatch]);

  const loadTrends = useCallback((days = 30, organisationId?: number) => {
    console.log('📈 Chargement des tendances Healthcare AI depuis le store');
    dispatch(fetchHealthcareAiTrends({ days, organisationId }));
  }, [dispatch]);

  const loadDetailedStats = useCallback((filters: any) => {
    console.log('📊 Chargement des statistiques détaillées depuis le store');
    dispatch(fetchDetailedStatistics(filters));
  }, [dispatch]);

  const loadAiInsights = useCallback((organisationId?: number) => {
    console.log('🤖 Chargement des insights IA depuis le store');
    dispatch(fetchAiInsights({ organisationId }));
  }, [dispatch]);

  const loadRealTimeMetrics = useCallback((organisationId?: number) => {
    console.log('⚡ Chargement des métriques temps réel depuis le store');
    dispatch(fetchRealTimeMetrics({ organisationId }));
  }, [dispatch]);

  // Actions pour la configuration
  const updateAutoRefresh = useCallback((enabled: boolean) => {
    dispatch(setAutoRefresh(enabled));
  }, [dispatch]);

  const updateRefreshInterval = useCallback((interval: number) => {
    dispatch(setRefreshInterval(interval));
  }, [dispatch]);

  const updateFilters = useCallback((newFilters: HealthcareAiFilters) => {
    dispatch(setFilters(newFilters));
  }, [dispatch]);

  const clearAllFilters = useCallback(() => {
    dispatch(clearFilters());
  }, [dispatch]);

  // Actions pour invalider le cache
  const invalidateSummaryCache = useCallback(() => {
    dispatch(invalidateSummary());
  }, [dispatch]);

  const invalidateTrendsCache = useCallback(() => {
    dispatch(invalidateTrends());
  }, [dispatch]);

  const invalidateAllCache = useCallback(() => {
    dispatch(invalidateAll());
  }, [dispatch]);

  // Actions pour forcer le rafraîchissement
  const refreshSummaryData = useCallback(() => {
    dispatch(refreshSummary());
    loadSummary(filters || undefined);
  }, [dispatch, loadSummary, filters]);

  const refreshTrendsData = useCallback(() => {
    dispatch(refreshTrends());
    loadTrends();
  }, [dispatch, loadTrends]);

  // Chargement automatique des données principales
  useEffect(() => {
    if (!summary.data && !summary.isLoading && !summary.error) {
      loadSummary(filters || undefined);
    }
  }, [summary.data, summary.isLoading, summary.error, filters]);

  // Rafraîchissement automatique
  useEffect(() => {
    if (!config.autoRefresh || config.refreshInterval <= 0) return;

    const interval = setInterval(() => {
      if (summary.data && !summary.isLoading) {
        loadSummary(filters || undefined);
      }
    }, config.refreshInterval);

    return () => clearInterval(interval);
  }, [config.autoRefresh, config.refreshInterval, summary.data, summary.isLoading, filters]);

  return {
    // Données
    summary,
    trends,
    detailedStats,
    aiInsights,
    realTimeMetrics,
    formattedData,
    
    // Configuration
    filters,
    config,
    
    // États utilitaires
    isLoading: summary.isLoading || trends.isLoading || detailedStats.isLoading || aiInsights.isLoading || realTimeMetrics.isLoading,
    hasError: summary.error || trends.error || detailedStats.error || aiInsights.error || realTimeMetrics.error,
    hasData: !!summary.data || !!trends.data || !!detailedStats.data || !!aiInsights.data || !!realTimeMetrics.data,
    
    // Actions pour charger les données
    loadSummary,
    loadTrends,
    loadDetailedStats,
    loadAiInsights,
    loadRealTimeMetrics,
    
    // Actions pour la configuration
    updateAutoRefresh,
    updateRefreshInterval,
    updateFilters,
    clearAllFilters,
    
    // Actions pour invalider le cache
    invalidateSummaryCache,
    invalidateTrendsCache,
    invalidateAllCache,
    
    // Actions pour forcer le rafraîchissement
    refreshSummaryData,
    refreshTrendsData,
  };
};

export default useHealthcareAiStore; 