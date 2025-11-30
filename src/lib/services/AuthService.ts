/**
 * SERVICE AUTHENTIFICATION - Frontend ODYSSEE Architecture
 * Gestion de l'authentification JWT selon l'architecture ODYSSEE
 * Version: 1.0.0 - Architecture ODYSSEE
 */

import { BaseService } from './BaseService';
import { API_CONSTANTS, USER_STORAGE_KEY } from '../constants';
import { 
  ApiResponse, 
  User, 
  LoginRequest, 
  LoginResponse, 
  UserCreate 
} from '../../types/api';

export class AuthService extends BaseService {
  constructor() {
    super();
    // Le service auth utilise une base URL différente
    this.api.defaults.baseURL = API_CONSTANTS.authUrlBase;
  }

  /**
   * Connexion utilisateur (comme ODYSSEE)
   */
  async login(email: string, password: string): Promise<ApiResponse<{ user: User; token: string }>> {
    try {
      // Le backend attend du form-urlencoded, pas du JSON
      const formData = new URLSearchParams();
      formData.append('username', email); // Le backend utilise 'username' pour l'email
      formData.append('password', password);
      
      const response = await this.api.post<LoginResponse>('/login', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      
      const loginData = response.data;
      
      // Stocker le token et l'utilisateur
      this.setAuthToken(loginData.access_token);
      this.storeUserInLocalStorage(loginData.user);
      
      return {
        success: true,
        data: {
          user: loginData.user,
          token: loginData.access_token
        },
        message: 'Connexion réussie'
      };
      
    } catch (error) {
      console.error('❌ Erreur de connexion:', error);
      return this.handleAuthError(error);
    }
  }

  /**
   * Déconnexion utilisateur
   */
  logout(): void {
    console.log('👋 AuthService.logout() - Nettoyage complet');
    this.removeAuthToken();
    this.removeUserFromLocalStorage();
    
    // Supprimer aussi le token utilisé par Redux/authSlice
    localStorage.removeItem('token');
    
    // Redirection vers la page de connexion
    window.location.href = '/login';
  }

  /**
   * Récupération de l'utilisateur actuellement connecté
   */
  async getCurrentUser(): Promise<ApiResponse<User>> {
    try {
      const response = await this.api.get<User>('/me');
      
      // Mettre à jour les données utilisateur en local
      this.storeUserInLocalStorage(response.data);
      
      return {
        success: true,
        data: response.data,
        message: 'Utilisateur récupéré avec succès'
      };
      
    } catch (error) {
      console.error('❌ Erreur récupération utilisateur:', error);
      return this.handleAuthError(error);
    }
  }

  /**
   * Inscription d'un nouvel utilisateur (si disponible)
   */
  async register(userData: UserCreate): Promise<ApiResponse<User>> {
    try {
      const response = await this.api.post<User>('/register', userData);
      
      return {
        success: true,
        data: response.data,
        message: 'Utilisateur créé avec succès'
      };
      
    } catch (error) {
      console.error('❌ Erreur inscription:', error);
      return this.handleAuthError(error);
    }
  }

  /**
   * Vérification si l'utilisateur est connecté
   */
  isAuthenticated(): boolean {
    const token = this.getTokenFromLocalStorage();
    const user = this.getUserFromLocalStorage();
    
    return !!(token && user);
  }

  /**
   * Récupération de l'utilisateur depuis le localStorage
   */
  getUserFromLocalStorage(): User | null {
    try {
      const userStr = localStorage.getItem(USER_STORAGE_KEY);
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  }

  /**
   * Stockage de l'utilisateur dans localStorage
   */
  private storeUserInLocalStorage(user: User): void {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  }

  /**
   * Suppression de l'utilisateur du localStorage
   */
  private removeUserFromLocalStorage(): void {
    localStorage.removeItem(USER_STORAGE_KEY);
  }

  /**
   * Rafraîchissement du token (si l'endpoint existe)
   */
  async refreshToken(): Promise<ApiResponse<{ token: string }>> {
    try {
      const response = await this.api.post<{ access_token: string }>('/refresh');
      
      this.setAuthToken(response.data.access_token);
      
      return {
        success: true,
        data: { token: response.data.access_token },
        message: 'Token rafraîchi avec succès'
      };
      
    } catch (error) {
      console.error('❌ Erreur rafraîchissement token:', error);
      // Si le refresh échoue, déconnecter l'utilisateur
      this.logout();
      return this.handleAuthError(error);
    }
  }

  /**
   * Vérification de la validité du token
   */
  async verifyToken(): Promise<boolean> {
    try {
      const response = await this.getCurrentUser();
      return response.success;
    } catch {
      return false;
    }
  }

  /**
   * Demande de réinitialisation de mot de passe
   */
  async requestPasswordReset(email: string): Promise<ApiResponse<void>> {
    try {
      await this.api.post('/password-reset/request', { email });
      
      return {
        success: true,
        message: 'Email de réinitialisation envoyé'
      };
      
    } catch (error) {
      return this.handleAuthError(error);
    }
  }

  /**
   * Réinitialisation du mot de passe
   */
  async resetPassword(token: string, newPassword: string): Promise<ApiResponse<void>> {
    try {
      await this.api.post('/password-reset/confirm', {
        token,
        new_password: newPassword
      });
      
      return {
        success: true,
        message: 'Mot de passe réinitialisé avec succès'
      };
      
    } catch (error) {
      return this.handleAuthError(error);
    }
  }

  /**
   * Gestion spécialisée des erreurs d'authentification
   */
  private handleAuthError(error: any): ApiResponse<any> {
    // Si erreur 401, nettoyer les données locales
    if (error.response?.status === 401) {
      this.removeAuthToken();
      this.removeUserFromLocalStorage();
    }

    if (error.response?.data) {
      return {
        success: false,
        error: error.response.data.detail || error.response.data.error || 'Erreur d\'authentification',
        message: error.response.data.message
      };
    } else if (error.code === 'NETWORK_ERROR') {
      return {
        success: false,
        error: 'Erreur de connexion réseau',
        message: 'Impossible de contacter le serveur d\'authentification'
      };
    } else {
      return {
        success: false,
        error: error.message || 'Erreur d\'authentification inconnue',
        message: 'Une erreur s\'est produite lors de l\'authentification'
      };
    }
  }

  /**
   * Initialisation automatique depuis localStorage au démarrage
   */
  initializeFromStorage(): User | null {
    const token = this.getTokenFromLocalStorage();
    const user = this.getUserFromLocalStorage();
    
    if (token && user) {
      this.setAuthToken(token);
      return user;
    }
    
    return null;
  }
}