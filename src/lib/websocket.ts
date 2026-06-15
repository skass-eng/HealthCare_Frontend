import { io, Socket } from 'socket.io-client';
import { WebSocketMessage, Task, TaskStatus } from '@/types';

// Détection automatique de l'hôte pour l'accès réseau local ou tunnel
function getWebSocketBaseUrl(): string {
  const currentHost = window.location.hostname;
  
  // Si on accède via localhost ou 127.0.0.1
  if (currentHost === 'localhost' || currentHost === '127.0.0.1') {
    return 'http://localhost:8000';
  }
  
  // Si on accède via le domaine pulse-360.fr (production)
  if (currentHost.includes('pulse-360.fr')) {
    return 'https://api-healthcare.pulse-360.fr';
  }
  
  // Si on accède via un tunnel externe (ngrok, localtunnel, cloudflare)
  if (currentHost.includes('ngrok') || currentHost.includes('loca.lt') || currentHost.includes('trycloudflare.com')) {
    const tunnelBackendUrl = localStorage.getItem('tunnel_backend_url');
    if (tunnelBackendUrl) {
      return tunnelBackendUrl;
    }
    // URL par défaut du backend Cloudflare Tunnel
    return 'https://api-healthcare.pulse-360.fr';
  }
  
  // Sinon, utiliser la même IP que celle utilisée pour accéder au frontend
  return `http://${currentHost}:8000`;
}

class WebSocketService {
  private socket: Socket | null = null;
  private baseURL: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  // ===== M14: registres pour survivre aux reconnexions =====
  // Tous les handlers enregistrés par les composants sont mémorisés ici afin
  // d'être ré-attachés automatiquement après une reconnexion (nouveau socket
  // ou re-connexion du même socket). Sans cela, un événement de fin d'analyse
  // ('ai_analysis_complete' / 'ai_analysis_failed') émis pendant/juste après une
  // coupure réseau était perdu → l'UI restait figée sur "en cours".
  // Map<eventName, Set<callback>> — on garde un Set pour permettre plusieurs
  // abonnés au même événement et pouvoir tous les ré-attacher.
  private eventHandlers: Map<string, Set<(data: any) => void>> = new Map();
  // Tâches d'analyse IA auxquelles on est abonné (rooms task_{task_id}).
  private subscribedAIAnalysisTasks: Set<string> = new Set();
  // Tâches d'extraction auxquelles on est abonné.
  private subscribedExtractionTasks: Set<string> = new Set();
  // Tâches génériques auxquelles on est abonné.
  private subscribedTasks: Set<string> = new Set();
  // Dashboards auxquels on est abonné.
  private subscribedDashboards: Set<string> = new Set();

  constructor() {
    // Configuration dynamique pour l'accès réseau local
    this.baseURL = getWebSocketBaseUrl();
    console.log('🔌 WebSocket URL configurée:', this.baseURL);
  }

  // ===== M14: helpers internes de gestion des handlers =====

  // Mémorise un handler et l'attache au socket courant (s'il existe).
  // Centralise toute la logique `socket.on` afin que `reattachHandlers()`
  // puisse tout ré-enregistrer après une reconnexion.
  private registerHandler(event: string, callback: (data: any) => void): void {
    let handlers = this.eventHandlers.get(event);
    if (!handlers) {
      handlers = new Set();
      this.eventHandlers.set(event, handlers);
    }
    handlers.add(callback);

    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  // Ré-attache tous les handlers mémorisés sur le socket courant.
  // Appelé à chaque (re)connexion pour garantir qu'aucun listener n'est perdu.
  private reattachHandlers(): void {
    if (!this.socket) return;
    this.eventHandlers.forEach((handlers, event) => {
      handlers.forEach((callback) => {
        // off d'abord pour éviter un double-enregistrement du même callback.
        this.socket!.off(event, callback);
        this.socket!.on(event, callback);
      });
    });
  }

  // Ré-émet tous les abonnements (rooms) après une reconnexion afin que le
  // serveur nous replace dans les rooms task_{task_id} concernées.
  private resubscribeRooms(): void {
    if (!this.socket) return;
    this.subscribedTasks.forEach((taskId) => {
      this.socket!.emit('subscribe_task', { taskId });
    });
    this.subscribedDashboards.forEach((dashboardId) => {
      this.socket!.emit('subscribe_dashboard', { dashboardId });
    });
    this.subscribedExtractionTasks.forEach((taskId) => {
      this.socket!.emit('subscribe_extraction', { task_id: taskId });
    });
    this.subscribedAIAnalysisTasks.forEach((taskId) => {
      this.socket!.emit('subscribe_ai_analysis', { task_id: taskId });
    });
    if (
      this.subscribedAIAnalysisTasks.size > 0 ||
      this.subscribedExtractionTasks.size > 0 ||
      this.subscribedTasks.size > 0 ||
      this.subscribedDashboards.size > 0
    ) {
      console.log('🔁 Abonnements ré-émis après reconnexion:', {
        tasks: [...this.subscribedTasks],
        dashboards: [...this.subscribedDashboards],
        extractions: [...this.subscribedExtractionTasks],
        aiAnalysis: [...this.subscribedAIAnalysisTasks],
      });
    }
  }

  // M14: à chaque (re)connexion, on ré-attache handlers + abonnements.
  private restoreAfterConnect(): void {
    this.reattachHandlers();
    this.resubscribeRooms();
  }

  connect(token?: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // Si déjà connecté, résoudre immédiatement
        if (this.socket?.connected) {
          console.log('✅ WebSocket déjà connecté');
          resolve();
          return;
        }

        // Déconnecter l'ancien socket s'il existe
        if (this.socket) {
          this.socket.disconnect();
          this.socket = null;
        }

        this.socket = io(this.baseURL, {
          auth: {
            token: token || localStorage.getItem('token'),
          },
          transports: ['polling', 'websocket'],  // Polling d'abord (plus fiable), puis upgrade vers WebSocket
          timeout: 30000,  // 30 secondes timeout
          reconnection: true,
          reconnectionAttempts: this.maxReconnectAttempts,
          reconnectionDelay: this.reconnectDelay,
          reconnectionDelayMax: 5000,
          forceNew: true,  // Forcer une nouvelle connexion
          upgrade: true,   // Permettre l'upgrade vers WebSocket après connexion polling
        });

        // Timeout manuel pour la connexion initiale
        const connectionTimeout = setTimeout(() => {
          if (!this.socket?.connected) {
            console.warn('⚠️ Timeout de connexion WebSocket (30s), fonctionnement en mode dégradé');
            // Ne pas rejeter - le mode polling peut fonctionner
            resolve();
          }
        }, 30000);

        this.socket.on('connect', () => {
          clearTimeout(connectionTimeout);
          console.log('✅ WebSocket connecté avec succès');
          console.log('🆔 Socket ID:', this.socket?.id);
          this.reconnectAttempts = 0;
          // M14: ré-attacher les handlers et ré-émettre les abonnements à chaque
          // (re)connexion pour ne jamais perdre un événement de fin d'analyse.
          this.restoreAfterConnect();
          resolve();
        });

        this.socket.on('connected', (data) => {
          console.log('📡 Confirmation serveur:', data);
        });

        this.socket.on('disconnect', (reason) => {
          console.log('📡 WebSocket déconnecté:', reason);
          if (reason === 'io server disconnect') {
            // Le serveur a déconnecté, on reconnecte
            this.socket?.connect();
          }
        });

        this.socket.on('connect_error', (error) => {
          clearTimeout(connectionTimeout);
          console.error('❌ Erreur de connexion WebSocket:', error.message);
          console.error('🔍 Détails:', {
            message: error.message,
            description: (error as any).description,
            context: (error as any).context
          });
          // Ne pas rejeter immédiatement - socket.io va réessayer automatiquement
          // On résout quand même pour permettre au reste de l'app de fonctionner
          if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.warn('⚠️ Max tentatives atteintes, fonctionnement en mode dégradé (sans temps réel)');
            resolve();
          }
        });

        this.socket.on('reconnect', (attemptNumber) => {
          console.log('WebSocket reconnected after', attemptNumber, 'attempts');
          // M14: la reconnexion du Manager socket.io réutilise le même socket,
          // mais on ré-affirme handlers + abonnements par sécurité (idempotent).
          this.restoreAfterConnect();
        });

        this.socket.on('reconnect_error', (error) => {
          console.error('WebSocket reconnection error:', error);
        });

        this.socket.on('reconnect_failed', () => {
          console.error('WebSocket reconnection failed');
        });

      } catch (error) {
        console.error('Error creating WebSocket connection:', error);
        reject(error);
      }
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // Écouter les mises à jour de tâches
  onTaskUpdate(callback: (task: Task) => void): void {
    // M14: passe par registerHandler pour survivre aux reconnexions.
    this.registerHandler('task_update', (data: Task) => {
      console.log('Task update received:', data);
      callback(data);
    });
  }

  // Écouter la completion de tâches
  onTaskComplete(callback: (task: Task) => void): void {
    this.registerHandler('task_complete', (data: Task) => {
      console.log('Task completed:', data);
      callback(data);
    });
  }

  // Écouter les erreurs de tâches
  onTaskError(callback: (error: { taskId: string; error: string }) => void): void {
    this.registerHandler('task_error', (data: { taskId: string; error: string }) => {
      console.error('Task error:', data);
      callback(data);
    });
  }

  // Écouter les notifications
  onNotification(callback: (notification: any) => void): void {
    this.registerHandler('notification', (data: any) => {
      console.log('Notification received:', data);
      callback(data);
    });
  }

  // S'abonner à une tâche spécifique
  subscribeToTask(taskId: string): void {
    // M14: mémoriser l'abonnement pour le ré-émettre après reconnexion.
    this.subscribedTasks.add(taskId);
    if (!this.socket) return;

    this.socket.emit('subscribe_task', { taskId });
  }

  // Se désabonner d'une tâche
  unsubscribeFromTask(taskId: string): void {
    this.subscribedTasks.delete(taskId);
    if (!this.socket) return;

    this.socket.emit('unsubscribe_task', { taskId });
  }

  // S'abonner à un dashboard
  subscribeToDashboard(dashboardId: string): void {
    this.subscribedDashboards.add(dashboardId);
    if (!this.socket) return;

    this.socket.emit('subscribe_dashboard', { dashboardId });
  }

  // Se désabonner d'un dashboard
  unsubscribeFromDashboard(dashboardId: string): void {
    this.subscribedDashboards.delete(dashboardId);
    if (!this.socket) return;

    this.socket.emit('unsubscribe_dashboard', { dashboardId });
  }

  // Envoyer un message personnalisé
  emit(event: string, data: any): void {
    if (!this.socket) {
      console.warn('WebSocket not connected');
      return;
    }

    this.socket.emit(event, data);
  }

  // Écouter un événement personnalisé
  on(event: string, callback: (data: any) => void): void {
    // M14: enregistrement durable (ré-attaché après reconnexion).
    this.registerHandler(event, callback);
  }

  // Arrêter d'écouter un événement
  off(event: string): void {
    // M14: purger aussi le registre pour ne pas ré-attacher après reconnexion.
    this.eventHandlers.delete(event);
    if (!this.socket) return;

    this.socket.off(event);
  }

  // Obtenir l'état de la connexion
  getConnectionState(): string {
    if (!this.socket) return 'disconnected';
    return this.socket.connected ? 'connected' : 'connecting';
  }

  // Reconnecter manuellement
  reconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        this.connect();
      }, this.reconnectDelay * this.reconnectAttempts);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  // Nettoyer tous les listeners
  cleanup(): void {
    // M14: purger aussi le registre pour éviter un ré-attachement post-reconnexion.
    ['task_update', 'task_complete', 'task_error', 'notification'].forEach((evt) =>
      this.eventHandlers.delete(evt)
    );
    if (!this.socket) return;

    this.socket.off('task_update');
    this.socket.off('task_complete');
    this.socket.off('task_error');
    this.socket.off('notification');
    this.socket.off('connect');
    this.socket.off('disconnect');
    this.socket.off('connect_error');
    this.socket.off('reconnect');
    this.socket.off('reconnect_error');
    this.socket.off('reconnect_failed');
  }

  // ===== MÉTHODES POUR LES EXTRACTIONS PDF/IMAGE =====

  // Écouter les événements d'extraction PDF
  onPdfExtractionStarted(callback: (data: { task_id: string; filename: string; status: string; message: string; step?: number }) => void): void {
    this.registerHandler('pdf_extraction_started', (data) => {
      console.log('📄 PDF extraction started:', data);
      callback(data);
    });
  }

  // Écouter les événements de progression d'extraction PDF
  onPdfExtractionProgress(callback: (data: { task_id: string; step: number; message: string }) => void): void {
    this.registerHandler('pdf_extraction_progress', (data) => {
      console.log('🔄 PDF extraction progress:', data);
      callback(data);
    });
  }

  onPdfExtractionComplete(callback: (data: {
    success: boolean;
    task_id: string;
    filename: string;
    temp_file_path?: string;
    extraction: {
      donnees_structurees: any;
      texte_brut: string;
      texte_longueur: number;
    };
    confidence: number;
    message: string;
  }) => void): void {
    this.registerHandler('pdf_extraction_complete', (data) => {
      console.log('✅ PDF extraction complete:', data);
      callback(data);
    });
  }

  onPdfExtractionFailed(callback: (data: { task_id: string; filename: string; error: string }) => void): void {
    this.registerHandler('pdf_extraction_failed', (data) => {
      console.log('❌ PDF extraction failed:', data);
      callback(data);
    });
  }

  // Écouter les événements d'extraction Image
  onImageExtractionStarted(callback: (data: { task_id: string; filename: string; status: string; message: string }) => void): void {
    this.registerHandler('image_extraction_started', (data) => {
      console.log('📷 Image extraction started:', data);
      callback(data);
    });
  }

  onImageExtractionComplete(callback: (data: {
    success: boolean;
    task_id: string;
    filename: string;
    temp_file_path?: string;
    extraction: {
      donnees_structurees: any;
      texte_brut: string;
      texte_longueur: number;
    };
    ocr_info: {
      confiance: number;
      qualite: string;
    };
    confidence: number;
    message: string;
  }) => void): void {
    this.registerHandler('image_extraction_complete', (data) => {
      console.log('✅ Image extraction complete:', data);
      callback(data);
    });
  }

  onImageExtractionFailed(callback: (data: { task_id: string; filename: string; error: string }) => void): void {
    this.registerHandler('image_extraction_failed', (data) => {
      console.log('❌ Image extraction failed:', data);
      callback(data);
    });
  }

  // S'abonner à une tâche d'extraction spécifique
  subscribeToExtraction(taskId: string): void {
    // M14: mémoriser pour ré-émettre l'abonnement après reconnexion.
    this.subscribedExtractionTasks.add(taskId);
    if (!this.socket) return;
    this.socket.emit('subscribe_extraction', { task_id: taskId });
    console.log('🔔 Subscribed to extraction task:', taskId);
  }

  // Se désabonner d'une tâche d'extraction
  unsubscribeFromExtraction(taskId: string): void {
    this.subscribedExtractionTasks.delete(taskId);
    if (!this.socket) return;
    this.socket.emit('unsubscribe_extraction', { task_id: taskId });
  }

  // Nettoyer les listeners d'extraction
  cleanupExtractionListeners(): void {
    // M14: purger aussi le registre.
    [
      'pdf_extraction_started',
      'pdf_extraction_progress',
      'pdf_extraction_complete',
      'pdf_extraction_failed',
      'image_extraction_started',
      'image_extraction_complete',
      'image_extraction_failed',
    ].forEach((evt) => this.eventHandlers.delete(evt));
    if (!this.socket) return;
    this.socket.off('pdf_extraction_started');
    this.socket.off('pdf_extraction_progress');
    this.socket.off('pdf_extraction_complete');
    this.socket.off('pdf_extraction_failed');
    this.socket.off('image_extraction_started');
    this.socket.off('image_extraction_complete');
    this.socket.off('image_extraction_failed');
  }

  // ===== MÉTHODES POUR L'ANALYSE IA =====

  // Écouter les événements de démarrage d'analyse IA
  // Note: le worker publie au format CONTRAT { plainte_id } pour une plainte unitaire,
  // mais l'analyse globale (services) publie task_id/total_*. Les champs sont donc optionnels.
  onAIAnalysisStarted(callback: (data: {
    plainte_id?: number;
    task_id?: string;
    status?: string;
    message?: string;
    total_plaintes?: number;
    total_services?: number;
  }) => void): void {
    // M14 + CONTRAT: handler durable ré-attaché après reconnexion.
    this.registerHandler('ai_analysis_started', (data) => {
      console.log('🧠 AI analysis started:', data);
      callback(data);
    });
  }

  // Écouter les événements de progression d'analyse IA
  onAIAnalysisProgress(callback: (data: { 
    task_id: string; 
    progress: number;
    current_step: string;
    services_analyzed: number;
    total_services: number;
    total_plaintes: number;
    estimated_remaining_seconds: number;
  }) => void): void {
    // M14 + CONTRAT: handler durable ré-attaché après reconnexion.
    this.registerHandler('ai_analysis_progress', (data) => {
      console.log('🔄 AI analysis progress:', data);
      callback(data);
    });
  }

  // Écouter la complétion d'analyse IA
  // Format CONTRAT pour une plainte unitaire: { plainte_id, statut: 'complete', success }
  // (les champs task_id/status/message restent supportés pour l'analyse globale)
  onAIAnalysisComplete(callback: (data: {
    plainte_id?: number;
    statut?: string;
    success?: boolean;
    task_id?: string;
    status?: string;
    message?: string;
    result?: any;
  }) => void): void {
    // M14 + CONTRAT: handler durable. C'est précisément cet événement de fin
    // qui était perdu lors d'une reconnexion → UI figée sur "en cours".
    this.registerHandler('ai_analysis_complete', (data) => {
      console.log('✅ AI analysis complete:', data);
      callback(data);
    });
  }

  // Écouter les erreurs d'analyse IA
  // M15 + CONTRAT: 'ai_analysis_failed' doit TOUJOURS être émis en cas d'échec.
  // Le payload contient au minimum { plainte_id } pour permettre un refetch ciblé
  // (task_id reste optionnel pour l'analyse globale/services).
  onAIAnalysisFailed(callback: (data: {
    plainte_id?: number;
    task_id?: string;
    error?: string;
    message?: string;
  }) => void): void {
    // M14: handler durable ré-attaché après reconnexion.
    this.registerHandler('ai_analysis_failed', (data) => {
      console.log('❌ AI analysis failed:', data);
      callback(data);
    });
  }

  // S'abonner à une tâche d'analyse IA (rejoint la room task_{task_id} côté serveur)
  subscribeToAIAnalysis(taskId: string): void {
    // M14: mémoriser pour ré-émettre l'abonnement (re-join room) après reconnexion.
    this.subscribedAIAnalysisTasks.add(taskId);
    if (!this.socket) return;
    this.socket.emit('subscribe_ai_analysis', { task_id: taskId });
    console.log('🔔 Subscribed to AI analysis task:', taskId);
  }

  // Se désabonner d'une tâche d'analyse IA
  unsubscribeFromAIAnalysis(taskId: string): void {
    this.subscribedAIAnalysisTasks.delete(taskId);
    if (!this.socket) return;
    this.socket.emit('unsubscribe_ai_analysis', { task_id: taskId });
  }

  // Nettoyer les listeners d'analyse IA
  cleanupAIAnalysisListeners(): void {
    // M14: purger aussi le registre pour éviter un ré-attachement post-reconnexion.
    ['ai_analysis_started', 'ai_analysis_progress', 'ai_analysis_complete', 'ai_analysis_failed'].forEach(
      (evt) => this.eventHandlers.delete(evt)
    );
    if (!this.socket) return;
    this.socket.off('ai_analysis_started');
    this.socket.off('ai_analysis_progress');
    this.socket.off('ai_analysis_complete');
    this.socket.off('ai_analysis_failed');
  }
}

export const wsService = new WebSocketService();
export default wsService; 