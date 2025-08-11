/**
 * SERVICE HEALTHCARE AI - Frontend ODYSSEE Architecture
 * Service dédié aux fonctionnalités de la page healthcare-ai
 * Version: 1.0.0 - Architecture ODYSSEE
 */

import { BaseService } from './BaseService';
import { 
  ApiResponse, 
  HealthcareAiSummary, 
  HealthcareAiTrends,
  HealthcareAiFilters
} from '../../types/api';

export class HealthcareAiService extends BaseService {
  private readonly baseEndpoint = '/healthcare-ai';

  /**
   * Récupère le résumé des plaintes pour les 4 cartes de la page healthcare-ai
   */
  async getComplaintsSummary(filters?: HealthcareAiFilters, abortController?: AbortController): Promise<ApiResponse<HealthcareAiSummary>> {
    const endpoint = this.buildUrl(`${this.baseEndpoint}/complaints/summary`, filters);
    return this.get<HealthcareAiSummary>(endpoint, undefined, abortController);
  }

  /**
   * Récupère les tendances des plaintes pour les graphiques
   */
  async getComplaintsTrends(
    days: number = 30, 
    organisationId?: number,
    abortController?: AbortController
  ): Promise<ApiResponse<HealthcareAiTrends>> {
    console.log('📈 Récupération des tendances des plaintes:', { days, organisationId });
    
    const params: Record<string, any> = { days };
    if (organisationId) {
      params.organisation_id = organisationId;
    }
    
    const endpoint = this.buildUrl(`${this.baseEndpoint}/complaints/trends`, params);
    return this.get<HealthcareAiTrends>(endpoint, undefined, abortController);
  }

  /**
   * Récupère le résumé avec cache pour éviter les appels répétés
   */
  private summaryCache: Map<string, { data: ApiResponse<HealthcareAiSummary>; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 30000; // 30 secondes

  async getComplaintsSummaryWithCache(filters?: HealthcareAiFilters, abortController?: AbortController): Promise<ApiResponse<HealthcareAiSummary>> {
    const cacheKey = JSON.stringify(filters || {});
    const cached = this.summaryCache.get(cacheKey);
    const now = Date.now();

    // Vérifier si le cache est encore valide
    if (cached && (now - cached.timestamp) < this.CACHE_DURATION) {
      console.log('📋 Utilisation du cache pour le résumé des plaintes');
      return cached.data;
    }

    // Récupérer les nouvelles données
    const response = await this.getComplaintsSummary(filters, abortController);
    
    // Mettre en cache si succès
    if (response.success) {
      this.summaryCache.set(cacheKey, {
        data: response,
        timestamp: now
      });
    }

    return response;
  }

  /**
   * Invalide le cache (utile après une mise à jour)
   */
  invalidateCache(): void {
    console.log('🗑️ Invalidation du cache HealthcareAi');
    this.summaryCache.clear();
  }

  /**
   * Récupère les statistiques détaillées avec filtres avancés
   */
  async getDetailedStatistics(filters: {
    from_date?: string;
    to_date?: string;
    organisation_id?: number;
    service_ids?: number[];
    status_filter?: string[];
    group_by?: 'day' | 'week' | 'month';
  }): Promise<ApiResponse<any>> {
    console.log('📊 Récupération des statistiques détaillées:', filters);
    
    // Préparer les paramètres
    const params: Record<string, any> = {};
    
    if (filters.from_date) params.from_date = filters.from_date;
    if (filters.to_date) params.to_date = filters.to_date;
    if (filters.organisation_id) params.organisation_id = filters.organisation_id;
    if (filters.group_by) params.group_by = filters.group_by;
    
    // Gérer les arrays
    if (filters.service_ids?.length) {
      params.service_ids = filters.service_ids.join(',');
    }
    if (filters.status_filter?.length) {
      params.status_filter = filters.status_filter.join(',');
    }
    
    const endpoint = this.buildUrl(`${this.baseEndpoint}/statistics/detailed`, params);
    return this.get(endpoint);
  }

  /**
   * Exporte les données de résumé en CSV
   */
  async exportSummaryToCsv(filters?: HealthcareAiFilters): Promise<ApiResponse<{ download_url: string }>> {
    console.log('📥 Export CSV du résumé des plaintes');
    
    const endpoint = this.buildUrl(`${this.baseEndpoint}/complaints/summary/export`, {
      ...filters,
      format: 'csv'
    });
    
    return this.get<{ download_url: string }>(endpoint);
  }

  /**
   * Récupère les alertes et recommandations IA
   */
  async getAiInsights(organisationId?: number): Promise<ApiResponse<{
    alerts: Array<{
      type: 'warning' | 'info' | 'critical';
      message: string;
      metric: string;
      value: number;
      threshold: number;
    }>;
    recommendations: Array<{
      category: string;
      suggestion: string;
      priority: 'high' | 'medium' | 'low';
      impact_estimate: string;
    }>;
  }>> {
    console.log('🤖 Récupération des insights IA');
    
    const params: Record<string, any> = {};
    if (organisationId) params.organisation_id = organisationId;
    
    const endpoint = this.buildUrl(`${this.baseEndpoint}/ai-insights`, params);
    return this.get(endpoint);
  }

  /**
   * Récupère les métriques en temps réel pour le monitoring
   */
  async getRealTimeMetrics(organisationId?: number): Promise<ApiResponse<{
    active_complaints: number;
    pending_analyses: number;
    avg_response_time_today: number;
    satisfaction_score_today: number;
    last_updated: string;
  }>> {
    console.log('⚡ Récupération des métriques temps réel');
    
    const params: Record<string, any> = {};
    if (organisationId) params.organisation_id = organisationId;
    
    const endpoint = this.buildUrl(`${this.baseEndpoint}/real-time-metrics`, params);
    return this.get(endpoint);
  }

  /**
   * Utilitaire pour formater le temps de résolution
   */
  formatResolutionTime(seconds: number): string {
    if (seconds < 60) {
      return `${Math.round(seconds)}s`;
    } else if (seconds < 3600) {
      return `${Math.round(seconds / 60)}min`;
    } else if (seconds < 86400) {
      return `${Math.round(seconds / 3600)}h`;
    } else {
      return `${Math.round(seconds / 86400)}j`;
    }
  }

  /**
   * Utilitaire pour calculer les pourcentages
   */
  calculatePercentage(value: number, total: number): number {
    return total > 0 ? Math.round((value / total) * 100) : 0;
  }

  /**
   * Utilitaire pour valider les filtres de date
   */
  validateDateRange(fromDate?: string, toDate?: string): { isValid: boolean; error?: string } {
    if (!fromDate && !toDate) {
      return { isValid: true };
    }

    try {
      if (fromDate && toDate) {
        const from = new Date(fromDate);
        const to = new Date(toDate);
        
        if (from > to) {
          return { 
            isValid: false, 
            error: 'La date de début doit être antérieure à la date de fin' 
          };
        }
        
        const diffDays = (to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24);
        if (diffDays > 365) {
          return { 
            isValid: false, 
            error: 'La période ne peut pas dépasser 365 jours' 
          };
        }
      }
      
      return { isValid: true };
    } catch {
      return { 
        isValid: false, 
        error: 'Format de date invalide' 
      };
    }
  }
}