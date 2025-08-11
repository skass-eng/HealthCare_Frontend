/**
 * APP CLIENT PRINCIPAL - Frontend ODYSSEE Architecture
 * Client API principal qui regroupe tous les services selon l'architecture ODYSSEE
 * Version: 1.0.0 - Architecture ODYSSEE
 */

import { AuthService } from './services/AuthService';
import { HealthcareAiService } from './services/HealthcareAiService';
import { API_CONSTANTS, PageKey } from './constants';

export class AppClient {
  // Services principaux selon l'architecture ODYSSEE
  public readonly auth: AuthService;
  public readonly healthcareAi: HealthcareAiService;
  
  // TODO: Ajouter d'autres services selon les besoins
  // public readonly dashboard: DashboardService;
  // public readonly datasource: DatasourceService;
  // public readonly task: TaskService;
  // public readonly users: UsersService;
  // public readonly project: ProjectService;
  // public readonly settings: SettingsService;
  // public readonly help: HelpService;

  // Configuration et état
  private currentPageKey: PageKey | null = null;
  private requestControllers: Map<string, AbortController> = new Map();

  constructor() {
    console.log('🔧 Initialisation AppClient - Architecture ODYSSEE');
    
    // Initialisation des services
    this.auth = new AuthService();
    this.healthcareAi = new HealthcareAiService();
    
    // Auto-initialisation depuis localStorage si disponible
    this.initializeFromStorage();
    
    console.log('✅ AppClient initialisé avec succès');
  }

  /**
   * Configuration du client API (comme ODYSSEE)
   */
  configure(options: {
    host?: string;
    wsHost?: string;
    port?: number;
  }): void {
    console.log('⚙️ Configuration AppClient:', options);
    API_CONSTANTS.configure(options);
  }

  /**
   * Gestion des pages selon l'architecture ODYSSEE
   */
  setCurrentPage(pageKey: PageKey): void {
    console.log('📄 Changement de page:', pageKey);
    
    // Annuler les requêtes de la page précédente
    if (this.currentPageKey) {
      this.cancelPageRequests(this.currentPageKey);
    }
    
    this.currentPageKey = pageKey;
  }

  getCurrentPage(): PageKey | null {
    return this.currentPageKey;
  }

  /**
   * Gestion des requêtes par page (annulation automatique)
   */
  createPageController(pageKey: PageKey, requestKey: string = 'default'): AbortController {
    const controllerKey = `${pageKey}-${requestKey}`;
    
    // Annuler le contrôleur existant s'il y en a un
    const existingController = this.requestControllers.get(controllerKey);
    if (existingController) {
      existingController.abort();
    }
    
    // Créer un nouveau contrôleur
    const controller = new AbortController();
    this.requestControllers.set(controllerKey, controller);
    
    return controller;
  }

  cancelPageRequests(pageKey: PageKey): void {
    console.log('🚫 Annulation des requêtes pour la page:', pageKey);
    
    for (const [key, controller] of this.requestControllers.entries()) {
      if (key.startsWith(pageKey)) {
        controller.abort();
        this.requestControllers.delete(key);
      }
    }
  }

  /**
   * Initialisation depuis localStorage
   */
  private initializeFromStorage(): void {
    try {
      // Initialiser l'authentification depuis le stockage local
      const user = this.auth.initializeFromStorage();
      
      if (user) {
        console.log('👤 Utilisateur restauré depuis localStorage:', user.email);
      }
      
    } catch (error) {
      console.warn('⚠️ Erreur lors de l\'initialisation depuis localStorage:', error);
    }
  }

  /**
   * Vérification de l'état de santé de l'API
   */
  async healthCheck(): Promise<{
    api: boolean;
    auth: boolean;
    database: boolean;
  }> {
    try {
      console.log('🏥 Vérification de l\'état de santé de l\'API');
      
      // Test de connectivité de base
      const apiHealth = await this.healthcareAi.healthCheck();
      
      // Test d'authentification
      let authHealth = false;
      if (this.auth.isAuthenticated()) {
        const userResponse = await this.auth.getCurrentUser();
        authHealth = userResponse.success;
      }
      
      // Pour la base de données, on teste via un appel simple
      let databaseHealth = false;
      try {
        const summaryResponse = await this.healthcareAi.getComplaintsSummary();
        databaseHealth = summaryResponse.success;
      } catch {
        databaseHealth = false;
      }
      
      const health = {
        api: apiHealth,
        auth: authHealth,
        database: databaseHealth
      };
      
      console.log('📊 État de santé:', health);
      return health;
      
    } catch (error) {
      console.error('❌ Erreur lors de la vérification de santé:', error);
      return {
        api: false,
        auth: false,
        database: false
      };
    }
  }

  /**
   * Invalidation de tous les caches
   */
  invalidateAllCaches(): void {
    console.log('🗑️ Invalidation de tous les caches');
    this.healthcareAi.invalidateCache();
    // TODO: Ajouter d'autres services quand ils seront créés
  }

  /**
   * Déconnexion complète et nettoyage
   */
  logout(): void {
    console.log('👋 Déconnexion AppClient');
    
    // Annuler toutes les requêtes en cours
    for (const controller of this.requestControllers.values()) {
      controller.abort();
    }
    this.requestControllers.clear();
    
    // Invalider tous les caches
    this.invalidateAllCaches();
    
    // Déconnecter l'utilisateur
    this.auth.logout();
  }

  /**
   * Utilitaires pour le debug
   */
  getDebugInfo(): {
    currentPage: PageKey | null;
    activeRequests: string[];
    isAuthenticated: boolean;
    apiBaseUrl: string;
  } {
    return {
      currentPage: this.currentPageKey,
      activeRequests: Array.from(this.requestControllers.keys()),
      isAuthenticated: this.auth.isAuthenticated(),
      apiBaseUrl: API_CONSTANTS.apiUrlBase
    };
  }

  /**
   * Méthode pour tester la connectivité réseau
   */
  async testConnectivity(): Promise<boolean> {
    try {
      const response = await fetch(API_CONSTANTS.apiUrlBase.replace('/api/v1', '/health'), {
        method: 'GET',
        timeout: 5000
      } as any);
      
      return response.ok;
    } catch {
      return false;
    }
  }
}

// Instance singleton de l'AppClient (comme ODYSSEE)
export const appClient = new AppClient();

// Export par défaut pour la compatibilité
export default appClient;