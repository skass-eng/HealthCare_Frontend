/**
 * SERVICE SERVICE - Frontend ODYSSEE Architecture
 * Service API pour la gestion des services médicaux
 * Version: 1.0.0 - Architecture ODYSSEE
 */

import { BaseService } from './BaseService';
import { Service, ApiResponse, PaginatedResponse } from '../../types/api';

export interface ServiceCreateRequest {
  nom: string;
  description?: string;
  code_service: string;
  configuration: {
    categorie: string;
    horaires?: string;
    priorite_defaut?: string;
    email_contact?: string;
    telephone_contact?: string;
    capacite_max?: number;
    temps_attente_moyen?: number;
    urgences_uniquement?: boolean;
    rdv_obligatoire?: boolean;
    notifications_actives?: boolean;
  };
}

export interface ServiceUpdateRequest extends Partial<ServiceCreateRequest> {
  id: number;
}

export interface ServiceFilters {
  page?: number;
  limit?: number;
  organisation_id?: number;
  est_actif?: boolean;
  categorie?: string;
  search?: string;
}

export class ServiceService extends BaseService {
  
  /**
   * Récupérer la liste des services (plus d'organisation)
   */
  async getServices(activeOnly: boolean = true, filters?: ServiceFilters): Promise<ApiResponse<PaginatedResponse<Service>>> {
    const params = {
      actif_seulement: activeOnly,
      ...filters
    };
    
    try {
      const response = await this.api.get(`/services`, { params });
      
      // L'API retourne directement un tableau, pas une structure ApiResponse
      const services = response.data;
      
      return {
        success: true,
        data: {
          items: services,
          total: services.length,
          page: 1,
          limit: services.length,
          pages: 1
        },
        message: 'Services récupérés avec succès'
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des services:', error);
      return {
        success: false,
        error: 'Erreur lors de la récupération des services',
        message: 'Impossible de récupérer les services'
      };
    }
  }

  /**
   * Récupérer un service par son ID
   */
  async getService(serviceId: number): Promise<ApiResponse<Service>> {
    return this.get<Service>(`/services/${serviceId}`);
  }

  /**
   * Créer un nouveau service
   */
  async createService(serviceData: ServiceCreateRequest): Promise<ApiResponse<Service>> {
    try {
      const response = await this.post<Service>(`/services`, serviceData);
      
      // La réponse de BaseService.post est déjà un ApiResponse
      if (response.success) {
        return response;
      } else {
        return {
          success: false,
          error: response.error || 'Erreur lors de la création du service',
          message: response.message || 'Impossible de créer le service'
        };
      }
    } catch (error) {
      console.error('Erreur lors de la création du service:', error);
      return {
        success: false,
        error: 'Erreur lors de la création du service',
        message: 'Impossible de créer le service'
      };
    }
  }

  /**
   * Mettre à jour un service existant
   */
  async updateService(serviceId: number, serviceData: ServiceUpdateRequest): Promise<ApiResponse<Service>> {
    try {
      const response = await this.put<Service>(`/services/${serviceId}`, serviceData);
      
      // La réponse de BaseService.put est déjà un ApiResponse
      if (response.success) {
        return response;
      } else {
        return {
          success: false,
          error: response.error || 'Erreur lors de la mise à jour du service',
          message: response.message || 'Impossible de mettre à jour le service'
        };
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du service:', error);
      return {
        success: false,
        error: 'Erreur lors de la mise à jour du service',
        message: 'Impossible de mettre à jour le service'
      };
    }
  }

  /**
   * Supprimer un service
   */
  async deleteService(serviceId: number): Promise<ApiResponse<void>> {
    try {
      const response = await this.delete<{message: string}>(`/services/${serviceId}`);
      
      // L'API retourne {"message": "Service supprimé avec succès"}
      // Si la réponse contient un message, c'est un succès
      if (response.success && response.data && response.data.message) {
        return {
          success: true,
          message: response.data.message,
          data: undefined
        };
      } else {
        return {
          success: false,
          error: 'Erreur lors de la suppression du service',
          message: 'Impossible de supprimer le service'
        };
      }
    } catch (error) {
      console.error('Erreur lors de la suppression du service:', error);
      return {
        success: false,
        error: 'Erreur lors de la suppression du service',
        message: 'Impossible de supprimer le service'
      };
    }
  }

  /**
   * Activer/désactiver un service
   */
  async toggleServiceStatus(serviceId: number, estActif: boolean): Promise<ApiResponse<Service>> {
    return this.put<Service>(`/services/${serviceId}`, {
      est_actif: estActif
    });
  }

  /**
   * Récupérer les statistiques des services d'une clinique
   */
  async getServiceStats(clinicId: number): Promise<ApiResponse<{
    total_services: number;
    services_actifs: number;
    services_inactifs: number;
    repartition_par_categorie: Record<string, number>;
    services_recents: Service[];
  }>> {
    // Pour les stats, on peut filtrer par organisation_id
    const services = await this.getServices(clinicId);
    if (!services.success || !services.data) {
      return services as any;
    }
    
    const allServices = services.data.items;
    const total_services = allServices.length;
    const services_actifs = allServices.filter(s => s.est_actif).length;
    const services_inactifs = total_services - services_actifs;
    const services_recents = allServices.slice(0, 5);
    
    return {
      success: true,
      data: {
        total_services,
        services_actifs,
        services_inactifs,
        repartition_par_categorie: {}, // À implémenter si nécessaire
        services_recents
      },
      message: 'Statistiques récupérées avec succès'
    };
  }

  /**
   * Rechercher des services par nom ou code
   */
  async searchServices(clinicId: number, query: string): Promise<ApiResponse<Service[]>> {
    // Utiliser l'endpoint principal avec filtres
    const response = await this.getServices(clinicId, { search: query });
    if (response.success && response.data) {
      return {
        success: true,
        data: response.data.items,
        message: 'Recherche effectuée avec succès'
      };
    }
    return response as any;
  }

  /**
   * Valider un code de service (vérifier s'il est unique)
   */
  async validateServiceCode(clinicId: number, codeService: string, excludeId?: number): Promise<ApiResponse<{
    is_valid: boolean;
    message?: string;
  }>> {
    // Récupérer tous les services de la clinique
    const services = await this.getServices(clinicId);
    if (!services.success || !services.data) {
      return services as any;
    }
    
    const existingService = services.data.items.find(
      service => service.code_service === codeService && service.id !== excludeId
    );
    
    return {
      success: true,
      data: {
        is_valid: !existingService,
        message: existingService ? 'Code de service déjà utilisé' : 'Code de service disponible'
      },
      message: 'Validation effectuée'
    };
  }

  /**
   * Récupérer les catégories de services disponibles
   */
  async getServiceCategories(): Promise<ApiResponse<Array<{
    value: string;
    label: string;
    description?: string;
  }>>> {
    return this.get('/services/categories');
  }

  /**
   * Récupérer les priorités par défaut
   */
  async getDefaultPriorities(): Promise<ApiResponse<Array<{
    value: string;
    label: string;
    description?: string;
  }>>> {
    return this.get('/services/priorities');
  }
}

// Instance singleton
export const serviceService = new ServiceService(); 