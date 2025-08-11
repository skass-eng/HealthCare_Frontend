/**
 * USER SERVICE - Frontend ODYSSEE Architecture
 * Service API pour la gestion des utilisateurs
 * Version: 1.0.0 - Architecture ODYSSEE
 */

import { BaseService } from './BaseService';
import { User, ApiResponse, PaginatedResponse } from '../../types/api';

export interface UserCreateRequest {
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  telephone_mobile?: string;
  type_utilisateur: string;
  fonction?: string;
  specialite?: string;
  numero_rpps?: string;
  mot_de_passe: string;
  permissions?: Record<string, any>;
  configuration?: Record<string, any>;
}

export interface UserUpdateRequest extends Partial<UserCreateRequest> {
  id: number;
  mot_de_passe?: string; // Optionnel pour la mise à jour
}

export interface UserFilters {
  page?: number;
  limit?: number;
  organisation_id?: number;
  est_actif?: boolean;
  type_utilisateur?: string;
  search?: string;
}

export class UserService extends BaseService {
  
  /**
   * Récupérer la liste des utilisateurs
   */
  async getUsers(filters?: UserFilters): Promise<ApiResponse<PaginatedResponse<User>>> {
    return this.get<PaginatedResponse<User>>('/users/', filters);
  }

  /**
   * Récupérer un utilisateur par son ID
   */
  async getUser(userId: number): Promise<ApiResponse<User>> {
    return this.get<User>(`/users/${userId}/`);
  }

  /**
   * Créer un nouvel utilisateur
   */
  async createUser(userData: UserCreateRequest): Promise<ApiResponse<User>> {
    return this.post<User>('/users/', userData);
  }

  /**
   * Mettre à jour un utilisateur existant
   */
  async updateUser(userId: number, userData: UserUpdateRequest): Promise<ApiResponse<User>> {
    return this.put<User>(`/users/${userId}/`, userData);
  }

  /**
   * Supprimer un utilisateur
   */
  async deleteUser(userId: number): Promise<ApiResponse<void>> {
    return this.delete<void>(`/users/${userId}/`);
  }

  /**
   * Activer/désactiver un utilisateur
   */
  async toggleUserStatus(userId: number, estActif: boolean): Promise<ApiResponse<User>> {
    return this.put<User>(`/users/${userId}/status/`, {
      est_actif: estActif
    });
  }

  /**
   * Réinitialiser le mot de passe d'un utilisateur
   */
  async resetPassword(userId: number, newPassword: string): Promise<ApiResponse<User>> {
    return this.put<User>(`/users/${userId}/password/`, {
      mot_de_passe: newPassword
    });
  }

  /**
   * Rechercher des utilisateurs
   */
  async searchUsers(query: string): Promise<ApiResponse<User[]>> {
    return this.get<User[]>('/users/search/', {
      q: query,
      limit: 10
    });
  }

  /**
   * Récupérer les types d'utilisateurs disponibles
   */
  async getUserTypes(): Promise<ApiResponse<Array<{
    value: string;
    label: string;
    description?: string;
  }>>> {
    return this.get('/users/types/');
  }

  /**
   * Récupérer les statistiques des utilisateurs
   */
  async getUserStats(): Promise<ApiResponse<{
    total_users: number;
    users_actifs: number;
    users_inactifs: number;
    repartition_par_type: Record<string, number>;
    users_recents: User[];
  }>> {
    return this.get('/users/stats/');
  }

  /**
   * Valider un email (vérifier s'il est unique)
   */
  async validateEmail(email: string, excludeId?: number): Promise<ApiResponse<{
    is_valid: boolean;
    message?: string;
  }>> {
    return this.get('/users/validate-email/', {
      email: email,
      exclude_id: excludeId
    });
  }
}

// Instance singleton
export const userService = new UserService(); 