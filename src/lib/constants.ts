/**
 * CONSTANTES API - Frontend ODYSSEE Architecture
 * Configuration des endpoints et URLs selon l'architecture décrite
 * Version: 1.0.0 - Architecture ODYSSEE
 */

// Configuration des domaines Cloudflare (production)
const CLOUDFLARE_CONFIG = {
  frontendDomain: 'healthcare.pulse-360.fr',
  backendDomain: 'api-healthcare.pulse-360.fr',
};

// Détection si on est en mode Cloudflare (production)
function isCloudflareMode(): boolean {
  if (typeof window === 'undefined') return false;
  const currentHost = window.location.hostname;
  return currentHost.includes('pulse-360.fr') || currentHost.includes('trycloudflare.com');
}

// Détection automatique de l'hôte pour l'accès réseau local
function getApiHost(): string {
  if (typeof window === 'undefined') return 'http://localhost';
  
  const currentHost = window.location.hostname;
  
  // Mode Cloudflare (production) - utiliser le sous-domaine API dédié
  if (currentHost.includes('pulse-360.fr')) {
    return `https://${CLOUDFLARE_CONFIG.backendDomain}`;
  }
  
  // Mode Cloudflare temporaire (trycloudflare.com)
  if (currentHost.includes('trycloudflare.com')) {
    // Vérifier si une URL backend est stockée dans localStorage
    const storedBackendUrl = localStorage.getItem('cloudflare_backend_url');
    if (storedBackendUrl) {
      return storedBackendUrl.replace(/\/$/, ''); // Enlever le slash final
    }
  }
  
  // Si l'utilisateur accède via localhost ou 127.0.0.1
  if (currentHost === 'localhost' || currentHost === '127.0.0.1') {
    return 'http://localhost';
  }
  
  // Sinon, utiliser la même IP que celle utilisée pour accéder au frontend
  return `http://${currentHost}`;
}

function getWsHost(): string {
  if (typeof window === 'undefined') return 'ws://localhost';
  
  const currentHost = window.location.hostname;
  
  // Mode Cloudflare (production) - utiliser WSS
  if (currentHost.includes('pulse-360.fr')) {
    return `wss://${CLOUDFLARE_CONFIG.backendDomain}`;
  }
  
  // Mode Cloudflare temporaire
  if (currentHost.includes('trycloudflare.com')) {
    const storedBackendUrl = localStorage.getItem('cloudflare_backend_url');
    if (storedBackendUrl) {
      return storedBackendUrl.replace('https://', 'wss://').replace('http://', 'ws://').replace(/\/$/, '');
    }
  }
  
  if (currentHost === 'localhost' || currentHost === '127.0.0.1') {
    return 'ws://localhost';
  }
  
  return `ws://${currentHost}`;
}

// Détection si on doit utiliser un port ou non
function shouldUsePort(): boolean {
  if (typeof window === 'undefined') return true;
  const currentHost = window.location.hostname;
  // Pas de port pour les domaines Cloudflare (HTTPS standard = 443)
  return !currentHost.includes('pulse-360.fr') && !currentHost.includes('trycloudflare.com');
}

export class ApiConstants {
  private _host = getApiHost();
  private _wsHost = getWsHost();
  private _port = 8000;
  private _usePort = shouldUsePort();

  get apiUrlBase() {
    if (this._usePort) {
      return `${this._host}:${this._port}/api/v1`;
    }
    return `${this._host}/api/v1`;
  }

  get authUrlBase() {
    if (this._usePort) {
      return `${this._host}:${this._port}/auth`;
    }
    return `${this._host}/auth`;
  }

  get reactAppWsUrl() {
    if (this._usePort) {
      return `${this._wsHost}:${this._port}/api/v1/ws/task/`;
    }
    return `${this._wsHost}/api/v1/ws/task/`;
  }

  get healthUrl() {
    if (this._usePort) {
      return `${this._host}:${this._port}/health`;
    }
    return `${this._host}/health`;
  }

  get host() {
    return this._host;
  }

  get wsHost() {
    return this._wsHost;
  }

  get port() {
    return this._port;
  }

  get isCloudflare() {
    return !this._usePort;
  }

  // Configuration personnalisable
  configure(options: {
    host?: string;
    wsHost?: string;
    port?: number;
  }) {
    if (options.host) this._host = options.host;
    if (options.wsHost) this._wsHost = options.wsHost;
    if (options.port) this._port = options.port;
  }
}

export const API_CONSTANTS = new ApiConstants();

// Clés de stockage local (comme ODYSSEE)
export const JWT_STORAGE_KEY = 'odyssee_healthcare_jwt_token';
export const USER_STORAGE_KEY = 'odyssee_healthcare_user';

// Configuration des timeouts
export const REQUEST_TIMEOUT = 30000; // 30 secondes
export const WEBSOCKET_HEARTBEAT_INTERVAL = 30000; // 30 secondes

// Retry configuration
export const MAX_RETRY_ATTEMPTS = 3;
export const RETRY_DELAY_BASE = 1000; // 1 seconde

// Configuration des pages pour l'AppClient
export const PAGE_KEYS = {
  HEALTHCARE_AI: 'healthcare-ai',
  PLAINTES_DASHBOARD: 'plaintes-dashboard',
  ANALYTICS: 'analytics',
  ADMINISTRATION: 'administration',
  AMELIORATIONS: 'ameliorations',
} as const;

export type PageKey = typeof PAGE_KEYS[keyof typeof PAGE_KEYS];