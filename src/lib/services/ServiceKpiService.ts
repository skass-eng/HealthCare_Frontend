/**
 * SERVICE KPI - Frontend ODYSSEE Architecture
 * Client API pour la gestion des services avec KPIs
 * Version: 2.0.0 - Architecture ODYSSEE simplifiée
 */

import { ApiResponse, Service, ServiceKPIs } from '../../types/api';
import { API_CONSTANTS } from '../constants';

export interface ServiceCreateData {
  nom: string;
  code_service: string;
  description?: string;
  categorie?: string;
  configuration?: Record<string, any>;
}

export interface ServiceUpdateData {
  nom?: string;
  description?: string;
  categorie?: string;
  configuration?: Record<string, any>;
}

class ServiceKpiService {
  private baseURL: string;

  constructor() {
    this.baseURL = `${API_CONSTANTS.apiUrlBase}/services`;
  }

  // ==================== CRUD SERVICES ====================

  /**
   * Récupérer tous les services avec leurs KPIs
   */
  async getAllServices(activeOnly: boolean = true): Promise<ApiResponse<Service[]>> {
    try {
      const params = new URLSearchParams();
      if (activeOnly) {
        params.append('actif_seulement', 'true');
      }

      const response = await fetch(`${this.baseURL}?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.detail || 'Erreur lors de la récupération des services',
          data: null
        };
      }

      console.log('✅ Services récupérés avec KPIs:', data.length);
      return {
        success: true,
        data: data,
        message: `${data.length} services récupérés`
      };

    } catch (error) {
      console.error('❌ Erreur ServiceKpiService.getAllServices:', error);
      return {
        success: false,
        error: 'Erreur réseau lors de la récupération des services',
        data: null
      };
    }
  }

  /**
   * Récupérer un service par ID avec ses KPIs
   */
  async getServiceById(serviceId: number): Promise<ApiResponse<Service>> {
    try {
      const response = await fetch(`${this.baseURL}/${serviceId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.detail || 'Service non trouvé',
          data: null
        };
      }

      return {
        success: true,
        data: data,
        message: 'Service récupéré avec succès'
      };

    } catch (error) {
      console.error('❌ Erreur ServiceKpiService.getServiceById:', error);
      return {
        success: false,
        error: 'Erreur réseau lors de la récupération du service',
        data: null
      };
    }
  }

  /**
   * Créer un nouveau service
   */
  async createService(serviceData: ServiceCreateData): Promise<ApiResponse<Service>> {
    try {
      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(serviceData)
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.detail || 'Erreur lors de la création du service',
          data: null
        };
      }

      console.log('✅ Service créé:', data.nom);
      return {
        success: true,
        data: data,
        message: `Service "${data.nom}" créé avec succès`
      };

    } catch (error) {
      console.error('❌ Erreur ServiceKpiService.createService:', error);
      return {
        success: false,
        error: 'Erreur réseau lors de la création du service',
        data: null
      };
    }
  }

  /**
   * Mettre à jour un service
   */
  async updateService(serviceId: number, serviceData: ServiceUpdateData): Promise<ApiResponse<Service>> {
    try {
      const response = await fetch(`${this.baseURL}/${serviceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(serviceData)
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.detail || 'Erreur lors de la mise à jour du service',
          data: null
        };
      }

      console.log('✅ Service mis à jour:', data.nom);
      return {
        success: true,
        data: data,
        message: `Service "${data.nom}" mis à jour avec succès`
      };

    } catch (error) {
      console.error('❌ Erreur ServiceKpiService.updateService:', error);
      return {
        success: false,
        error: 'Erreur réseau lors de la mise à jour du service',
        data: null
      };
    }
  }

  /**
   * Supprimer un service
   */
  async deleteService(serviceId: number): Promise<ApiResponse<{ message: string }>> {
    try {
      const response = await fetch(`${this.baseURL}/${serviceId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.detail || 'Erreur lors de la suppression du service',
          data: null
        };
      }

      console.log('✅ Service supprimé:', data.message);
      return {
        success: true,
        data: data,
        message: data.message
      };

    } catch (error) {
      console.error('❌ Erreur ServiceKpiService.deleteService:', error);
      return {
        success: false,
        error: 'Erreur réseau lors de la suppression du service',
        data: null
      };
    }
  }

  // ==================== KPI MANAGEMENT ====================

  /**
   * Récupérer uniquement les KPIs d'un service
   */
  async getServiceKPIs(serviceId: number, forceRecalculate: boolean = false): Promise<ApiResponse<ServiceKPIs>> {
    try {
      const params = new URLSearchParams();
      if (forceRecalculate) {
        params.append('recalculer', 'true');
      }

      const response = await fetch(`${this.baseURL}/${serviceId}/kpis?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.detail || 'Erreur lors de la récupération des KPIs',
          data: null
        };
      }

      return {
        success: true,
        data: data,
        message: 'KPIs récupérés avec succès'
      };

    } catch (error) {
      console.error('❌ Erreur ServiceKpiService.getServiceKPIs:', error);
      return {
        success: false,
        error: 'Erreur réseau lors de la récupération des KPIs',
        data: null
      };
    }
  }

  /**
   * Recalculer tous les KPIs de tous les services
   */
  async recalculateAllKPIs(): Promise<ApiResponse<{ message: string; services_updated: number }>> {
    try {
      const response = await fetch(`${this.baseURL}/recalculate-all-kpis`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.detail || 'Erreur lors du recalcul des KPIs',
          data: null
        };
      }

      console.log('✅ KPIs recalculés:', data.message);
      return {
        success: true,
        data: data,
        message: data.message
      };

    } catch (error) {
      console.error('❌ Erreur ServiceKpiService.recalculateAllKPIs:', error);
      return {
        success: false,
        error: 'Erreur réseau lors du recalcul des KPIs',
        data: null
      };
    }
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Calculer le taux de résolution d'un service
   */
  calculateResolutionRate(service: Service): number {
    if (service.nombre_plaintes_total === 0) return 0;
    return Math.round((service.nombre_plaintes_resolues / service.nombre_plaintes_total) * 100);
  }

  /**
   * Évaluer la performance d'un service basée sur ses KPIs
   */
  evaluateServicePerformance(service: Service): 'excellent' | 'bon' | 'moyen' | 'faible' {
    const resolutionRate = this.calculateResolutionRate(service);
    const avgResolutionTime = service.temps_moyen_resolution;
    const satisfaction = service.taux_satisfaction;

    if (resolutionRate >= 90 && avgResolutionTime <= 7 && satisfaction >= 80) {
      return 'excellent';
    } else if (resolutionRate >= 75 && avgResolutionTime <= 15 && satisfaction >= 70) {
      return 'bon';
    } else if (resolutionRate >= 60 && avgResolutionTime <= 30 && satisfaction >= 60) {
      return 'moyen';
    } else {
      return 'faible';
    }
  }

  /**
   * Formatter les KPIs pour l'affichage
   */
  formatKPIsForDisplay(service: Service) {
    return {
      totalComplaints: service.nombre_plaintes_total.toLocaleString(),
      resolvedComplaints: service.nombre_plaintes_resolues.toLocaleString(),
      resolutionRate: `${this.calculateResolutionRate(service)}%`,
      avgResolutionTime: `${service.temps_moyen_resolution.toFixed(1)} jours`,
      satisfaction: `${service.taux_satisfaction.toFixed(1)}%`,
      performance: this.evaluateServicePerformance(service)
    };
  }
}

// Export de l'instance singleton
export const serviceKpiService = new ServiceKpiService();
export default serviceKpiService;