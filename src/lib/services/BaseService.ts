/**
 * SERVICE DE BASE - Frontend ODYSSEE Architecture
 * Service de base pour tous les services API avec gestion d'erreurs et retry
 * Version: 1.0.0 - Architecture ODYSSEE
 */

import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { 
  API_CONSTANTS, 
  JWT_STORAGE_KEY, 
  REQUEST_TIMEOUT,
  MAX_RETRY_ATTEMPTS,
  RETRY_DELAY_BASE
} from '../constants';
import { ApiResponse, ErrorResponse } from '../../types/api';

export class BaseService {
  protected api: AxiosInstance;
  protected baseURL: string;

  constructor() {
    this.baseURL = API_CONSTANTS.apiUrlBase;
    
    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: REQUEST_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Intercepteur de requête pour ajouter l'authentification
    this.api.interceptors.request.use(
      (config) => {
        const token = this.getTokenFromLocalStorage();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        
        // Log pour le debug (uniquement en développement)
        if (process.env.NODE_ENV === 'development') {
          console.log('🚀 API Request:', config.method?.toUpperCase(), config.url);
        }
        
        return config;
      },
      (error) => {
        console.error('❌ Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Intercepteur de réponse pour gérer les erreurs
    this.api.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const original = error.config;
        
        // Gestion de l'authentification expirée
        if (error.response?.status === 401) {
          this.removeAuthToken();
          window.location.href = '/login';
          return Promise.reject(error);
        }

        // Retry automatique pour les erreurs temporaires
        if (this.shouldRetry(error) && original && !original._retry) {
          original._retry = true;
          original._retryCount = (original._retryCount || 0) + 1;

          if (original._retryCount <= MAX_RETRY_ATTEMPTS) {
            const delay = RETRY_DELAY_BASE * Math.pow(2, original._retryCount - 1);
            
            console.warn(`🔄 Retry ${original._retryCount}/${MAX_RETRY_ATTEMPTS} after ${delay}ms`);
            
            await new Promise(resolve => setTimeout(resolve, delay));
            return this.api(original);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private shouldRetry(error: AxiosError): boolean {
    // Retry sur les erreurs réseau ou temporaires
    return (
      !error.response || 
      error.response.status >= 500 ||
      error.code === 'NETWORK_ERROR' ||
      error.code === 'TIMEOUT'
    );
  }

  // Gestion du token JWT (comme ODYSSEE)
  // Clé unifiée avec le reste de l'app (login/authSlice/api.ts/websocket utilisent 'token').
  // Lecture en priorité sur 'token', fallback sur l'ancienne clé JWT_STORAGE_KEY pour compat.
  protected getTokenFromLocalStorage(): string | null {
    return localStorage.getItem('token') || localStorage.getItem(JWT_STORAGE_KEY);
  }

  protected storeTokenInLocalStorage(token: string): void {
    localStorage.setItem('token', token);
  }

  protected removeAuthToken(): void {
    localStorage.removeItem('token');
    // Nettoie aussi l'ancienne clé pour éviter qu'un token périmé soit relu via le fallback
    localStorage.removeItem(JWT_STORAGE_KEY);
    delete this.api.defaults.headers.common['Authorization'];
  }

  protected setAuthToken(token: string): void {
    this.storeTokenInLocalStorage(token);
    this.api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  // Méthodes HTTP de base avec gestion d'erreurs standardisée
  protected async get<T>(url: string, params?: Record<string, any>, abortController?: AbortController): Promise<ApiResponse<T>> {
    try {
      const config: any = { params };
      if (abortController) {
        config.signal = abortController.signal;
      }
      
      const response: AxiosResponse<T> = await this.api.get(url, config);
      
      // L'API retourne déjà une structure ApiResponse
      // On retourne directement la réponse de l'API
      return response.data;
    } catch (error) {
      console.error('🌐 BaseService.get - Error caught:', error);
      return this.handleError(error);
    }
  }

  protected async post<T>(url: string, data?: any, abortController?: AbortController): Promise<ApiResponse<T>> {
    try {
      const config: any = {};
      if (abortController) {
        config.signal = abortController.signal;
      }
      
      const response: AxiosResponse<T> = await this.api.post(url, data, config);
      
      // L'API retourne déjà une structure ApiResponse
      // On retourne directement la réponse de l'API
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  protected async put<T>(url: string, data?: any, abortController?: AbortController): Promise<ApiResponse<T>> {
    try {
      const config: any = {};
      if (abortController) {
        config.signal = abortController.signal;
      }
      
      const response: AxiosResponse<T> = await this.api.put(url, data, config);
      
      // L'API retourne déjà une structure ApiResponse
      // On retourne directement la réponse de l'API
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  protected async delete<T>(url: string, abortController?: AbortController): Promise<ApiResponse<T>> {
    try {
      const config: any = {};
      if (abortController) {
        config.signal = abortController.signal;
      }
      
      const response: AxiosResponse<T> = await this.api.delete(url, config);
      
      // L'API retourne déjà une structure ApiResponse
      // On retourne directement la réponse de l'API
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Gestion standardisée des erreurs (comme ODYSSEE)
  private handleError(error: any): ApiResponse<any> {
    console.error('❌ API Error:', error);

    // Gérer les erreurs d'annulation
    if (error.name === 'AbortError' || error.name === 'CanceledError' || error.code === 'ERR_CANCELED') {
      return {
        success: false,
        error: 'Requête annulée',
        message: 'La requête a été annulée'
      };
    }

    if (error.response?.data) {
      // Erreur retournée par le backend
      return {
        success: false,
        error: error.response.data.error || error.response.data.detail || 'Erreur inconnue',
        message: error.response.data.message,
        data: error.response.data
      };
    } else if (error.code === 'NETWORK_ERROR') {
      return {
        success: false,
        error: 'Erreur de connexion réseau',
        message: 'Impossible de contacter le serveur'
      };
    } else if (error.code === 'TIMEOUT') {
      return {
        success: false,
        error: 'Timeout de la requête',
        message: 'La requête a pris trop de temps'
      };
    } else {
      return {
        success: false,
        error: error.message || 'Erreur inconnue',
        message: 'Une erreur inattendue s\'est produite'
      };
    }
  }

  // Utilitaires pour la construction d'URLs
  protected buildUrl(endpoint: string, params?: Record<string, any>): string {
    let url = endpoint;
    
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
      
      const queryString = searchParams.toString();
      if (queryString) {
        url += (url.includes('?') ? '&' : '?') + queryString;
      }
    }
    
    return url;
  }

  // Test de connectivité
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.api.get('/health', { timeout: 5000 });
      return response.status === 200;
    } catch {
      return false;
    }
  }
}

declare module 'axios' {
  export interface AxiosRequestConfig {
    _retry?: boolean;
    _retryCount?: number;
  }
}