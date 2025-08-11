/**
 * CONSTANTES API - Frontend ODYSSEE Architecture
 * Configuration des endpoints et URLs selon l'architecture décrite
 * Version: 1.0.0 - Architecture ODYSSEE
 */

export class ApiConstants {
  private _host = 'http://localhost';
  private _wsHost = 'ws://localhost';
  private _port = 8000;

  get apiUrlBase() {
    return `${this._host}:${this._port}/api/v1`;
  }

  get authUrlBase() {
    return `${this._host}:${this._port}/auth`;
  }

  get reactAppWsUrl() {
    return `${this._wsHost}:${this._port}/api/v1/ws/task/`;
  }

  get healthUrl() {
    return `${this._host}:${this._port}/health`;
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