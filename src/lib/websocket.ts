import { io, Socket } from 'socket.io-client';
import { WebSocketMessage, Task, TaskStatus } from '@/types';

class WebSocketService {
  private socket: Socket | null = null;
  private baseURL: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  constructor() {
    // Configuration forcée pour le développement
    this.baseURL = 'http://localhost:8000';
    console.log('🔌 WebSocket URL configurée:', this.baseURL);
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
    if (!this.socket) return;

    this.socket.on('task_update', (data: Task) => {
      console.log('Task update received:', data);
      callback(data);
    });
  }

  // Écouter la completion de tâches
  onTaskComplete(callback: (task: Task) => void): void {
    if (!this.socket) return;

    this.socket.on('task_complete', (data: Task) => {
      console.log('Task completed:', data);
      callback(data);
    });
  }

  // Écouter les erreurs de tâches
  onTaskError(callback: (error: { taskId: string; error: string }) => void): void {
    if (!this.socket) return;

    this.socket.on('task_error', (data: { taskId: string; error: string }) => {
      console.error('Task error:', data);
      callback(data);
    });
  }

  // Écouter les notifications
  onNotification(callback: (notification: any) => void): void {
    if (!this.socket) return;

    this.socket.on('notification', (data: any) => {
      console.log('Notification received:', data);
      callback(data);
    });
  }

  // S'abonner à une tâche spécifique
  subscribeToTask(taskId: string): void {
    if (!this.socket) return;

    this.socket.emit('subscribe_task', { taskId });
  }

  // Se désabonner d'une tâche
  unsubscribeFromTask(taskId: string): void {
    if (!this.socket) return;

    this.socket.emit('unsubscribe_task', { taskId });
  }

  // S'abonner à un dashboard
  subscribeToDashboard(dashboardId: string): void {
    if (!this.socket) return;

    this.socket.emit('subscribe_dashboard', { dashboardId });
  }

  // Se désabonner d'un dashboard
  unsubscribeFromDashboard(dashboardId: string): void {
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
    if (!this.socket) return;

    this.socket.on(event, callback);
  }

  // Arrêter d'écouter un événement
  off(event: string): void {
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
    if (!this.socket) return;
    this.socket.on('pdf_extraction_started', (data) => {
      console.log('📄 PDF extraction started:', data);
      callback(data);
    });
  }

  // Écouter les événements de progression d'extraction PDF
  onPdfExtractionProgress(callback: (data: { task_id: string; step: number; message: string }) => void): void {
    if (!this.socket) return;
    this.socket.on('pdf_extraction_progress', (data) => {
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
    if (!this.socket) return;
    this.socket.on('pdf_extraction_complete', (data) => {
      console.log('✅ PDF extraction complete:', data);
      callback(data);
    });
  }

  onPdfExtractionFailed(callback: (data: { task_id: string; filename: string; error: string }) => void): void {
    if (!this.socket) return;
    this.socket.on('pdf_extraction_failed', (data) => {
      console.log('❌ PDF extraction failed:', data);
      callback(data);
    });
  }

  // Écouter les événements d'extraction Image
  onImageExtractionStarted(callback: (data: { task_id: string; filename: string; status: string; message: string }) => void): void {
    if (!this.socket) return;
    this.socket.on('image_extraction_started', (data) => {
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
    if (!this.socket) return;
    this.socket.on('image_extraction_complete', (data) => {
      console.log('✅ Image extraction complete:', data);
      callback(data);
    });
  }

  onImageExtractionFailed(callback: (data: { task_id: string; filename: string; error: string }) => void): void {
    if (!this.socket) return;
    this.socket.on('image_extraction_failed', (data) => {
      console.log('❌ Image extraction failed:', data);
      callback(data);
    });
  }

  // S'abonner à une tâche d'extraction spécifique
  subscribeToExtraction(taskId: string): void {
    if (!this.socket) return;
    this.socket.emit('subscribe_extraction', { task_id: taskId });
    console.log('🔔 Subscribed to extraction task:', taskId);
  }

  // Se désabonner d'une tâche d'extraction
  unsubscribeFromExtraction(taskId: string): void {
    if (!this.socket) return;
    this.socket.emit('unsubscribe_extraction', { task_id: taskId });
  }

  // Nettoyer les listeners d'extraction
  cleanupExtractionListeners(): void {
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
  onAIAnalysisStarted(callback: (data: { 
    task_id: string; 
    status: string; 
    message: string;
    total_plaintes: number;
    total_services: number;
  }) => void): void {
    if (!this.socket) return;
    this.socket.on('ai_analysis_started', (data) => {
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
    if (!this.socket) return;
    this.socket.on('ai_analysis_progress', (data) => {
      console.log('🔄 AI analysis progress:', data);
      callback(data);
    });
  }

  // Écouter la complétion d'analyse IA
  onAIAnalysisComplete(callback: (data: {
    task_id: string;
    status: string;
    message: string;
    result?: any;
  }) => void): void {
    if (!this.socket) return;
    this.socket.on('ai_analysis_complete', (data) => {
      console.log('✅ AI analysis complete:', data);
      callback(data);
    });
  }

  // Écouter les erreurs d'analyse IA
  onAIAnalysisFailed(callback: (data: { 
    task_id: string; 
    error: string;
    message: string;
  }) => void): void {
    if (!this.socket) return;
    this.socket.on('ai_analysis_failed', (data) => {
      console.log('❌ AI analysis failed:', data);
      callback(data);
    });
  }

  // S'abonner à une tâche d'analyse IA
  subscribeToAIAnalysis(taskId: string): void {
    if (!this.socket) return;
    this.socket.emit('subscribe_ai_analysis', { task_id: taskId });
    console.log('🔔 Subscribed to AI analysis task:', taskId);
  }

  // Se désabonner d'une tâche d'analyse IA
  unsubscribeFromAIAnalysis(taskId: string): void {
    if (!this.socket) return;
    this.socket.emit('unsubscribe_ai_analysis', { task_id: taskId });
  }

  // Nettoyer les listeners d'analyse IA
  cleanupAIAnalysisListeners(): void {
    if (!this.socket) return;
    this.socket.off('ai_analysis_started');
    this.socket.off('ai_analysis_progress');
    this.socket.off('ai_analysis_complete');
    this.socket.off('ai_analysis_failed');
  }
}

export const wsService = new WebSocketService();
export default wsService; 