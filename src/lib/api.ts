import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { 
  User, 
  Dashboard, 
  Datasource, 
  Task, 
  Project, 
  PaginatedResponse,
  WidgetLayout,
  WidgetType,
  Plainte,
  PlainteUpdate,
  PlainteCreate,
  Analyse,
  AnalyseTaskRequest,
  Organisation,
  Service
} from '@/types/api';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

// Détection automatique de l'hôte API pour l'accès réseau local ou ngrok/localtunnel
function getApiBaseUrl(): string {
  const currentHost = window.location.hostname;
  
  // Si on accède via localhost ou 127.0.0.1
  if (currentHost === 'localhost' || currentHost === '127.0.0.1') {
    return 'http://localhost:8000';
  }
  
  // Si on accède via le domaine pulse-360.fr (production)
  if (currentHost.includes('pulse-360.fr')) {
    const backendUrl = 'https://api-healthcare.pulse-360.fr';
    console.log('🔗 Mode production pulse-360.fr - Backend URL:', backendUrl);
    return backendUrl;
  }
  
  // Si on accède via un tunnel externe (ngrok, localtunnel, cloudflare)
  if (currentHost.includes('ngrok') || currentHost.includes('loca.lt') || currentHost.includes('trycloudflare.com')) {
    // Vérifier si une URL backend est stockée dans localStorage
    const tunnelBackendUrl = localStorage.getItem('tunnel_backend_url');
    if (tunnelBackendUrl) {
      return tunnelBackendUrl;
    }
    
    // URL par défaut du backend Cloudflare Tunnel
    const defaultBackendUrl = 'https://api-healthcare.pulse-360.fr';
    console.log('🔗 Mode tunnel détecté - Backend URL:', defaultBackendUrl);
    return defaultBackendUrl;
  }
  
  // Sinon, utiliser la même IP que celle utilisée pour accéder au frontend
  return `http://${currentHost}:8000`;
}

class AppClient {
  private api: AxiosInstance;

  constructor() {
    const baseURL = getApiBaseUrl();
    console.log('🔗 AppClient API URL configurée:', baseURL);
    
    this.api = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000, // 30 secondes par défaut
    });
  }

  // Récupérer les services pour assignation
  async getServicesForAssignment(): Promise<ApiResponse<Service[]>> {
    const response = await this.api.get('/api/v1/plaintes/creation/services');
    return {
      success: true,
      data: response.data,
      message: 'Services récupérés avec succès'
    } as ApiResponse<Service[]>;
  }

  // Récupérer le service par défaut
  async getDefaultService(): Promise<ApiResponse<Service>> {
    const response = await this.api.get('/api/v1/plaintes/creation/service-defaut');
    return {
      success: true,
      data: response.data,
      message: 'Service par défaut récupéré avec succès'
    } as ApiResponse<Service>;
  }
}

const appClient = new AppClient();
export { appClient };

class ApiService {
  private api: AxiosInstance;
  private baseURL: string;

  constructor() {
    // Configuration dynamique pour l'accès réseau local
    this.baseURL = getApiBaseUrl();
    console.log('🔗 API URL configurée:', this.baseURL);
    
    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Intercepteur pour ajouter le token d'authentification
    this.api.interceptors.request.use(
      (config) => {
        console.log('🚀 Requête API:', config.method?.toUpperCase(), config.url);
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          console.log('🔑 Token d\'authentification ajouté');
        }
        return config;
      },
      (error) => {
        console.error('❌ Erreur de requête API:', error);
        return Promise.reject(error);
      }
    );

    // Intercepteur pour gérer les erreurs
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        console.log('❌ Erreur API:', error.response?.status, error.response?.data);
        if (error.response?.status === 401) {
          console.log('🔐 Token invalide, nettoyage et déconnexion...');
          localStorage.removeItem('token');

          // Déconnexion propre: rediriger vers /login pour éviter une app "zombie".
          // Garde-fou anti-boucle: ne pas rediriger si on est déjà sur /login,
          // ni si l'erreur provient de l'appel d'authentification lui-même.
          const requestUrl = (error.config?.url || '') as string;
          const isAuthCall = requestUrl.includes('/auth/login') || requestUrl.includes('/auth/register');
          const alreadyOnLogin = typeof window !== 'undefined' && window.location?.pathname === '/login';

          if (!isAuthCall && !alreadyOnLogin && typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // Authentification
  async login(email: string, password: string): Promise<ApiResponse<{ user: User; token: string }>> {
    // Le backend attend du form-urlencoded, pas du JSON
    const formData = new URLSearchParams();
    formData.append('username', email); // Le backend utilise 'username' pour l'email
    formData.append('password', password);
    
    const response = await this.api.post('/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    
    // Adapter la réponse du backend au format attendu par le frontend
    const backendResponse = response.data;
    return {
      success: true,
      data: {
        user: backendResponse.user,
        token: backendResponse.access_token // Le backend retourne 'access_token'
      },
      message: 'Connexion réussie'
    } as ApiResponse<{ user: User; token: string }>;
  }

  // Inscription d'un nouvel utilisateur
  async register(userData: { email: string; password: string; name: string }): Promise<ApiResponse<{ user: User; token: string }>> {
    const response = await this.api.post('/auth/register', userData);
    
    // Adapter la réponse du backend au format attendu par le frontend
    const backendResponse = response.data;
    return {
      success: true,
      data: {
        user: backendResponse.user,
        token: backendResponse.access_token
      },
      message: backendResponse.message || 'Inscription réussie'
    } as ApiResponse<{ user: User; token: string }>;
  }

  async getCurrentUser(): Promise<ApiResponse<User>> {
    const response = await this.api.get('/auth/me');
    
    // Adapter la réponse du backend au format attendu par le frontend
    const backendResponse = response.data;
    return {
      success: true,
      data: backendResponse,
      message: 'Utilisateur récupéré avec succès'
    } as ApiResponse<User>;
  }

  // ==================== GESTION DES PLAINTES ====================

  // Récupérer une plainte par ID avec tous les détails (documents, analyse IA, etc.)
  async getPlainte(plainteId: number): Promise<ApiResponse<any>> {
    const response = await this.api.get(`/api/v1/plaintes/${plainteId}`);
    return {
      success: true,
      data: response.data,
      message: 'Plainte récupérée avec succès'
    } as ApiResponse<any>;
  }

  // Récupérer les documents d'une plainte
  async getPlainteDocuments(plainteId: number): Promise<ApiResponse<{
    plainte_id: number;
    documents: any[];
    pdf_rapport: any;
    total_documents: number;
  }>> {
    const response = await this.api.get(`/api/v1/plaintes/${plainteId}/documents`);
    return {
      success: true,
      data: response.data,
      message: 'Documents récupérés avec succès'
    } as ApiResponse<{
      plainte_id: number;
      documents: any[];
      pdf_rapport: any;
      total_documents: number;
    }>;
  }

  // Télécharger un document d'une plainte
  getDocumentDownloadUrl(plainteId: number, documentId: number): string {
    return `${this.api.defaults.baseURL}/api/v1/plaintes/${plainteId}/documents/${documentId}/download`;
  }

  // Télécharger le PDF rapport d'une plainte
  getPdfRapportDownloadUrl(plainteId: number): string {
    return `${this.api.defaults.baseURL}/api/v1/plaintes/${plainteId}/pdf-rapport/download`;
  }

  // Lister les plaintes avec filtres
  async getPlaintes(params?: {
    page?: number;
    limit?: number;
    statut?: string;
    priorite?: string;
    organisation_id?: number;
    service_id?: number;
    search?: string;
    date_debut?: string;
    date_fin?: string;
  }): Promise<PaginatedResponse<Plainte>> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const response = await this.api.get(`/api/v1/plaintes?${queryParams.toString()}`);
    return response.data;
  }

  // Mettre à jour une plainte
  async updatePlainte(plainteId: number, plainteData: PlainteUpdate): Promise<ApiResponse<Plainte>> {
    const response = await this.api.put(`/api/v1/plaintes/${plainteId}`, plainteData);
    return {
      success: true,
      data: response.data,
      message: 'Plainte mise à jour avec succès'
    } as ApiResponse<Plainte>;
  }

  // Supprimer une plainte
  async deletePlainte(plainteId: number): Promise<ApiResponse<void>> {
    const response = await this.api.delete(`/api/v1/plaintes/${plainteId}`);
    return {
      success: true,
      data: undefined,
      message: 'Plainte supprimée avec succès'
    } as ApiResponse<void>;
  }

  // ==================== SUIVI / RÉPONSE / NOTES / HISTORIQUE ====================

  // Récupérer l'historique des actions d'une plainte
  async getPlainteHistorique(plainteId: number): Promise<ApiResponse<{
    historique: Array<{
      action: string;
      details?: string | null;
      donnees_avant?: any;
      donnees_apres?: any;
      date: string;
    }>;
  }>> {
    const response = await this.api.get(`/api/v1/plaintes/${plainteId}/historique`);
    return {
      success: true,
      data: response.data,
      message: 'Historique récupéré avec succès'
    } as ApiResponse<{
      historique: Array<{
        action: string;
        details?: string | null;
        donnees_avant?: any;
        donnees_apres?: any;
        date: string;
      }>;
    }>;
  }

  // Récupérer les notes d'instruction d'une plainte
  async getPlainteNotes(plainteId: number): Promise<ApiResponse<any[]>> {
    const response = await this.api.get(`/api/v1/plaintes/${plainteId}/notes`);
    return {
      success: true,
      data: response.data,
      message: 'Notes récupérées avec succès'
    } as ApiResponse<any[]>;
  }

  // Ajouter une note d'instruction à une plainte
  async addPlainteNote(plainteId: number, contenu: string, auteurId?: number | null): Promise<ApiResponse<any>> {
    const response = await this.api.post(`/api/v1/plaintes/${plainteId}/notes`, {
      contenu,
      auteur_id: auteurId ?? null
    });
    return {
      success: true,
      data: response.data,
      message: 'Note ajoutée avec succès'
    } as ApiResponse<any>;
  }

  // Enregistrer le brouillon de réponse officielle d'une plainte
  async savePlainteReponse(plainteId: number, contenu: string): Promise<ApiResponse<any>> {
    const response = await this.api.put(`/api/v1/plaintes/${plainteId}/reponse`, { contenu });
    return {
      success: true,
      data: response.data,
      message: 'Réponse enregistrée avec succès'
    } as ApiResponse<any>;
  }

  // Marquer la réponse comme envoyée au plaignant
  async envoyerPlainteReponse(plainteId: number): Promise<ApiResponse<any>> {
    const response = await this.api.post(`/api/v1/plaintes/${plainteId}/reponse/envoyer`);
    return {
      success: true,
      data: response.data,
      message: 'Réponse envoyée avec succès'
    } as ApiResponse<any>;
  }

  // Émettre l'accusé de réception d'une plainte
  async envoyerAccuseReception(plainteId: number): Promise<ApiResponse<any>> {
    const response = await this.api.post(`/api/v1/plaintes/${plainteId}/accuse-reception`);
    return {
      success: true,
      data: response.data,
      message: 'Accusé de réception envoyé avec succès'
    } as ApiResponse<any>;
  }

  // Récupérer les statistiques de performance (délais, retards, satisfaction…)
  async getStatistiquesPerformance(): Promise<ApiResponse<{
    total: number;
    resolues: number;
    taux_resolution: number;
    temps_traitement_moyen_jours: number | null;
    nb_en_retard: number;
    taux_en_retard: number;
    satisfaction_pct: number | null;
    taux_recurrence: number;
    nb_reponses_envoyees: number;
    nb_accuses_reception: number;
  }>> {
    const response = await this.api.get('/api/v1/plaintes/statistiques/performance');
    return {
      success: true,
      data: response.data,
      message: 'Statistiques de performance récupérées avec succès'
    } as ApiResponse<{
      total: number;
      resolues: number;
      taux_resolution: number;
      temps_traitement_moyen_jours: number | null;
      nb_en_retard: number;
      taux_en_retard: number;
      satisfaction_pct: number | null;
      taux_recurrence: number;
      nb_reponses_envoyees: number;
      nb_accuses_reception: number;
    }>;
  }

  // ==================== GESTION DES ANALYSES ====================

  // Déclencher des analyses pour une plainte
  async triggerAnalyses(plainteId: number, analysesRequest: AnalyseTaskRequest): Promise<ApiResponse<{
    message: string;
    task_ids: string[];
    types_analyse: string[];
  }>> {
    const response = await this.api.post(`/api/v1/plaintes/${plainteId}/analyses`, analysesRequest);
    return {
      success: true,
      data: response.data,
      message: 'Analyses déclenchées avec succès'
    } as ApiResponse<{
      message: string;
      task_ids: string[];
      types_analyse: string[];
    }>;
  }

  // Récupérer les analyses d'une plainte
  async getAnalysesPlainte(plainteId: number, type_analyse?: string): Promise<ApiResponse<Analyse[]>> {
    const params = type_analyse ? `?type_analyse=${type_analyse}` : '';
    const response = await this.api.get(`/api/v1/plaintes/${plainteId}/analyses${params}`);
    return {
      success: true,
      data: response.data,
      message: 'Analyses récupérées avec succès'
    } as ApiResponse<Analyse[]>;
  }

  // ==================== GESTION DES ORGANISATIONS ET SERVICES ====================

  // Récupérer les organisations
  async getOrganisations(): Promise<ApiResponse<Organisation[]>> {
    const response = await this.api.get('/api/v1/organisations');
    return {
      success: true,
      data: response.data,
      message: 'Organisations récupérées avec succès'
    } as ApiResponse<Organisation[]>;
  }

  // Récupérer tous les services (plus d'organisation)
  async getServices(organisationId?: number, activeOnly: boolean = true): Promise<ApiResponse<Service[]>> {
    const params = new URLSearchParams();
    if (activeOnly) {
      params.append('actif_seulement', 'true');
    }
    if (organisationId) {
      params.append('organisation_id', organisationId.toString());
    }
    
    const queryString = params.toString();
    const url = `/api/v1/services${queryString ? `?${queryString}` : ''}`;
    
    const response = await this.api.get(url);
    return {
      success: true,
      data: response.data,
      message: 'Services récupérés avec succès'
    } as ApiResponse<Service[]>;
  }

  // ==================== STATISTIQUES ====================

  // Récupérer le total des plaintes pour l'année en cours
  async getTotalPlaintesAnnuelles(): Promise<ApiResponse<number>> {
    const response = await this.api.get('/api/v1/plaintes/creation/total');
    return {
      success: true,
      data: response.data,
      message: 'Total des plaintes récupéré avec succès'
    } as ApiResponse<number>;
  }

  // Créer une nouvelle plainte avec documents
  async createPlainte(plainteData: PlainteCreate, documents?: File[]): Promise<ApiResponse<Plainte>> {
    try {
      const formData = new FormData();
      
      // Ajouter les données de la plainte comme champs individuels (format attendu par le backend)
      formData.append('nom_plaignant', plainteData.nom_plaignant || '');
      formData.append('prenom_plaignant', plainteData.prenom_plaignant || '');
      formData.append('email_plaignant', plainteData.email_plaignant || '');
      formData.append('telephone_plaignant', plainteData.telephone_plaignant || '');
      
      formData.append('objet', plainteData.titre);
      formData.append('description', plainteData.description);
      formData.append('date_incident', plainteData.date_incident || new Date().toISOString().split('T')[0]);
      
      // Ne pas envoyer de chaîne vide pour les IDs - le backend attend des entiers valides
      if (plainteData.service_id) {
        formData.append('service_concerne_id', plainteData.service_id.toString());
      } else {
        // Service par défaut si non spécifié
        formData.append('service_concerne_id', '1');
      }
      
      if (plainteData.assigned_user_id) {
        formData.append('utilisateur_assigne_id', plainteData.assigned_user_id.toString());
      }
      // Si pas d'utilisateur assigné, ne pas envoyer le champ (le backend accepte None)
      
      formData.append('priorite', plainteData.priorite || 'MOYEN');

      // Champs structurés optionnels (alimentent l'analyse IA + la page détail)
      if (plainteData.circonstances) {
        formData.append('circonstances', plainteData.circonstances);
      }
      if (plainteData.consequences) {
        formData.append('consequences', plainteData.consequences);
      }
      if (plainteData.demande_plaignant) {
        formData.append('demande_plaignant', plainteData.demande_plaignant);
      }

      // Ajouter les documents s'il y en a
      if (documents && documents.length > 0) {
        documents.forEach((file) => {
          formData.append('documents', file);
        });
      }

      const response = await this.api.post('/api/v1/plaintes/creation/nouvelle', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return {
        success: true,
        data: response.data,
        message: 'Plainte créée avec succès'
      } as ApiResponse<Plainte>;
    } catch (error: any) {
      console.error('Erreur lors de la création de la plainte:', error);
      return {
        success: false,
        data: null as any,
        message: error.response?.data?.detail || error.message || 'Erreur lors de la création de la plainte'
      } as ApiResponse<Plainte>;
    }
  }

  // Récupérer les utilisateurs pour assignation
  async getUsersForAssignment(): Promise<ApiResponse<User[]>> {
    const response = await this.api.get('/api/v1/plaintes/creation/users');
    return {
      success: true,
      data: response.data,
      message: 'Utilisateurs récupérés avec succès'
    } as ApiResponse<User[]>;
  }

  // Récupérer les services pour plaintes
  async getServicesForComplaint(): Promise<ApiResponse<Service[]>> {
    const response = await this.api.get('/api/v1/plaintes/creation/services');
    return {
      success: true,
      data: response.data,
      message: 'Services récupérés avec succès'
    } as ApiResponse<Service[]>;
  }

  // Récupérer le service par défaut
  async getDefaultService(): Promise<ApiResponse<Service>> {
    const response = await this.api.get('/api/v1/plaintes/creation/service-defaut');
    return {
      success: true,
      data: response.data,
      message: 'Service par défaut récupéré avec succès'
    } as ApiResponse<Service>;
  }

  // ==================== CRÉATION DEPUIS PDF ====================

  // Prévisualiser l'extraction d'un PDF (sans créer la plainte)
  async previewPdfExtraction(pdfFile: File): Promise<ApiResponse<{
    success: boolean;
    filename: string;
    file_size: number;
    extraction: {
      texte_brut: string;
      texte_longueur: number;
      donnees_structurees: {
        plaignant: {
          nom: string | null;
          prenom: string | null;
          email: string | null;
          telephone: string | null;
        };
        plainte: {
          titre: string | null;
          description: string | null;
          date_incident: string | null;
          service_concerne: string | null;
          mode_reception: string;
        };
        analyse: {
          priorite_suggeree: string;
          mots_cles: string[];
          gravite_estimee: string;
          resume_court: string;
        };
        confiance_extraction: {
          score_global: number;
          champs_incertains: string[];
        };
      } | null;
    };
    services_disponibles: Array<{ id: number; nom: string; code: string }>;
    message: string;
  }>> {
    try {
      const formData = new FormData();
      formData.append('pdf_file', pdfFile);

      console.log('📤 Envoi du fichier PDF:', pdfFile.name, pdfFile.size, pdfFile.type);

      const response = await this.api.post('/api/v1/plaintes/creation/depuis-pdf/preview', formData, {
        headers: {
          'Content-Type': undefined, // Laisser axios définir le multipart/form-data avec boundary
        } as any,
        timeout: 180000, // 3 minutes pour l'analyse IA avec Ollama
      });

      return {
        success: true,
        data: response.data,
        message: 'Prévisualisation réussie'
      } as ApiResponse<any>;
    } catch (error: any) {
      console.error('Erreur lors de la prévisualisation PDF:', error);
      
      // Extraire le message d'erreur correctement
      let errorMessage = 'Erreur lors de la prévisualisation';
      if (error.response?.data?.detail) {
        const detail = error.response.data.detail;
        if (typeof detail === 'string') {
          errorMessage = detail;
        } else if (Array.isArray(detail)) {
          // FastAPI validation errors sont un tableau d'objets
          errorMessage = detail.map((d: any) => d.msg || JSON.stringify(d)).join(', ');
        } else if (typeof detail === 'object') {
          errorMessage = detail.msg || JSON.stringify(detail);
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return {
        success: false,
        data: null as any,
        message: errorMessage
      } as ApiResponse<any>;
    }
  }

  // Prévisualiser l'extraction PDF de manière ASYNCHRONE (recommandé)
  async previewPdfExtractionAsync(pdfFile: File): Promise<ApiResponse<{
    success: boolean;
    async: boolean;
    task_id: string;
    celery_task_id?: string;
    filename: string;
    file_size?: number;
    text_length?: number;
    services_disponibles: Array<{ id: number; nom: string; code: string }>;
    message: string;
    websocket_events?: {
      started: string;
      complete: string;
      failed: string;
    };
    // Si async=false (fallback synchrone), les données sont directement disponibles
    extraction?: {
      texte_brut: string;
      texte_longueur: number;
      donnees_structurees: any;
    };
  }>> {
    try {
      const formData = new FormData();
      formData.append('pdf_file', pdfFile);

      console.log('📤 [Async] Envoi du fichier PDF:', pdfFile.name);

      const response = await this.api.post('/api/v1/plaintes/creation/depuis-pdf/preview-async', formData, {
        headers: {
          'Content-Type': undefined,
        } as any,
        timeout: 30000, // 30s suffit car c'est asynchrone
      });

      return {
        success: true,
        data: response.data,
        message: response.data.message || 'Analyse lancée'
      } as ApiResponse<any>;
    } catch (error: any) {
      console.error('Erreur lors du lancement de l\'extraction PDF async:', error);
      
      let errorMessage = 'Erreur lors du lancement de l\'extraction';
      if (error.response?.data?.detail) {
        errorMessage = typeof error.response.data.detail === 'string' 
          ? error.response.data.detail 
          : JSON.stringify(error.response.data.detail);
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return {
        success: false,
        data: null as any,
        message: errorMessage
      } as ApiResponse<any>;
    }
  }

  // Créer une plainte depuis un PDF avec les données VALIDÉES par l'utilisateur
  // Utilise le nouvel endpoint optimisé qui ne refait pas l'analyse IA
  async createPlainteFromPdf(
    pdfFile: File, 
    serviceId: number,
    userData: {
      titre: string;
      description: string;
      nom: string;
      prenom: string;
      email?: string | null;
      telephone?: string | null;
      mode_reception?: string | null;
      date_incident?: string | null;
      priorite?: string | null;
      assigned_user_id?: number | null;
    }
  ): Promise<ApiResponse<{
    success: boolean;
    message: string;
    plainte: {
      id: number;
      numero_plainte: string;
      titre: string;
      description: string;
      statut: string;
      priorite: string;
      service_id: number;
      service_nom: string;
      date_creation: string;
    };
    plaignant: {
      nom: string | null;
      prenom: string | null;
      email: string | null;
      telephone: string | null;
    };
    document: {
      nom_fichier: string;
      taille: number;
      chemin_stockage: string;
    };
    analyse_ia: {
      statut: string;
      message: string;
    };
  }>> {
    try {
      // Créer un FormData propre
      const formData = new FormData();
      
      // 1. Fichier PDF (obligatoire)
      formData.append('pdf_file', pdfFile, pdfFile.name);
      
      // 2. Service ID (obligatoire)
      formData.append('service_id', serviceId.toString());
      
      // 3. Champs obligatoires depuis le store Redux
      formData.append('titre', userData.titre);
      formData.append('description', userData.description);
      formData.append('nom_plaignant', userData.nom);
      formData.append('prenom_plaignant', userData.prenom);
      
      // 4. Champs optionnels - seulement s'ils ont une valeur
      if (userData.email) {
        formData.append('email_plaignant', userData.email);
      }
      if (userData.telephone) {
        formData.append('telephone_plaignant', userData.telephone);
      }
      if (userData.mode_reception) {
        formData.append('mode_reception', userData.mode_reception);
      }
      if (userData.date_incident) {
        formData.append('date_incident', userData.date_incident);
      }
      if (userData.priorite) {
        formData.append('priorite', userData.priorite);
      }
      if (userData.assigned_user_id) {
        formData.append('assigned_user_id', userData.assigned_user_id.toString());
      }

      console.log('📤 [API] Création plainte depuis données validées');
      console.log('📤 [API] PDF:', pdfFile.name, '|', pdfFile.size, 'bytes');
      console.log('📤 [API] Service ID:', serviceId);
      console.log('📤 [API] Données depuis store Redux:', JSON.stringify(userData, null, 2));
      
      // Debug: Afficher tout le contenu du FormData
      console.log('📦 [API] Contenu FormData envoyé:');
      for (const [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(`  - ${key}: [File] ${value.name} (${value.size} bytes, ${value.type})`);
        } else {
          console.log(`  - ${key}: "${value}"`);
        }
      }

      // Utiliser fetch API directement pour un contrôle total sur les headers
      // Cela évite tout problème d'interférence avec les intercepteurs Axios
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${this.baseURL}/api/v1/plaintes/creation/depuis-donnees-validees`,
        {
          method: 'POST',
          headers: {
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            // NE PAS définir Content-Type - le navigateur le fera automatiquement avec le boundary
          },
          body: formData,
        }
      );
      
      const responseData = await response.json();
      
      if (!response.ok) {
        console.error('❌ [API] Erreur HTTP:', response.status, response.statusText);
        console.error('❌ [API] Détails:', JSON.stringify(responseData, null, 2));
        
        let errorMessage = 'Erreur lors de la création depuis le PDF';
        if (responseData.detail) {
          const detail = responseData.detail;
          if (typeof detail === 'string') {
            errorMessage = detail;
          } else if (Array.isArray(detail)) {
            console.error('❌ [API] Erreurs de validation FastAPI:');
            detail.forEach((d: any, i: number) => {
              console.error(`  ${i + 1}. Champ: ${d.loc?.join('.')} | Type: ${d.type} | Message: ${d.msg}`);
            });
            errorMessage = detail.map((d: any) => `${d.loc?.join('.')}: ${d.msg}`).join(', ');
          }
        }
        
        return {
          success: false,
          data: null as any,
          message: errorMessage
        } as ApiResponse<any>;
      }
      
      console.log('✅ [API] Plainte créée avec succès:', responseData);

      return {
        success: true,
        data: responseData,
        message: 'Plainte créée avec succès depuis le PDF'
      } as ApiResponse<any>;
    } catch (error: any) {
      console.error('❌ [API] Exception lors de la création depuis PDF:', error);
      
      return {
        success: false,
        data: null as any,
        message: error.message || 'Erreur lors de la création depuis le PDF'
      } as ApiResponse<any>;
    }
  }

  // [DÉPRÉCIÉ] Ancien endpoint - conservé pour compatibilité
  async createPlainteFromPdfLegacy(
    pdfFile: File, 
    serviceId?: number,
    userData?: {
      titre?: string;
      description?: string;
      nom?: string;
      prenom?: string;
      email?: string;
      telephone?: string;
    }
  ): Promise<ApiResponse<{
    success: boolean;
    message: string;
    plainte: {
      id: number;
      numero_plainte: string;
      titre: string;
      description: string;
      statut: string;
      priorite: string;
      service_id: number;
      service_nom: string;
      date_creation: string;
    };
    plaignant: {
      nom: string | null;
      prenom: string | null;
      email: string | null;
      telephone: string | null;
    };
    extraction: {
      texte_extrait_longueur: number;
      donnees_extraites: boolean;
      confiance: number | null;
      champs_incertains: string[];
    };
    document: {
      nom_fichier: string;
      taille: number;
      chemin_stockage: string;
    };
    analyse_ia: {
      statut: string;
      message: string;
    };
  }>> {
    try {
      const formData = new FormData();
      formData.append('pdf_file', pdfFile);
      
      if (serviceId) {
        formData.append('service_id', serviceId.toString());
      }
      
      // Ajouter les données modifiées par l'utilisateur si fournies
      if (userData) {
        if (userData.titre) formData.append('titre', userData.titre);
        if (userData.description) formData.append('description', userData.description);
        if (userData.nom) formData.append('nom_plaignant', userData.nom);
        if (userData.prenom) formData.append('prenom_plaignant', userData.prenom);
        if (userData.email) formData.append('email_plaignant', userData.email);
        if (userData.telephone) formData.append('telephone_plaignant', userData.telephone);
      }

      console.log('📤 Création plainte depuis PDF:', pdfFile.name, pdfFile.size);
      console.log('📤 Données utilisateur:', userData);

      const response = await this.api.post('/api/v1/plaintes/creation/depuis-pdf', formData, {
        headers: {
          'Content-Type': undefined, // Laisser axios définir le multipart/form-data avec boundary
        } as any,
      });

      return {
        success: true,
        data: response.data,
        message: 'Plainte créée avec succès depuis le PDF'
      } as ApiResponse<any>;
    } catch (error: any) {
      console.error('Erreur lors de la création depuis PDF:', error);
      
      // Extraire le message d'erreur correctement
      let errorMessage = 'Erreur lors de la création depuis le PDF';
      if (error.response?.data?.detail) {
        const detail = error.response.data.detail;
        if (typeof detail === 'string') {
          errorMessage = detail;
        } else if (Array.isArray(detail)) {
          // FastAPI validation errors sont un tableau d'objets
          errorMessage = detail.map((d: any) => d.msg || JSON.stringify(d)).join(', ');
        } else if (typeof detail === 'object') {
          errorMessage = detail.msg || JSON.stringify(detail);
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return {
        success: false,
        data: null as any,
        message: errorMessage
      } as ApiResponse<any>;
    }
  }

  // ==================== CRÉATION DEPUIS IMAGE (PHOTO) ====================

  // Prévisualiser l'extraction d'une image via OCR (sans créer la plainte)
  async previewImageExtraction(imageFile: File): Promise<ApiResponse<{
    success: boolean;
    filename: string;
    file_size: number;
    extraction: {
      texte_brut: string;
      texte_longueur: number;
      donnees_structurees: {
        plaignant: {
          nom: string | null;
          prenom: string | null;
          email: string | null;
          telephone: string | null;
        };
        plainte: {
          titre: string | null;
          description: string | null;
          date_incident: string | null;
          service_concerne: string | null;
          mode_reception: string;
        };
        analyse: {
          priorite_suggeree: string;
          mots_cles: string[];
          gravite_estimee: string;
          resume_court: string;
        };
        confiance_extraction: {
          score_global: number;
          score_ocr?: number;
          qualite_ocr?: string;
          champs_incertains: string[];
        };
      } | null;
    };
    ocr_info: {
      confiance: number;
      qualite: string;
      metadata?: Record<string, any>;
    };
    services_disponibles: Array<{ id: number; nom: string; code: string }>;
    message: string;
  }>> {
    try {
      const formData = new FormData();
      formData.append('image_file', imageFile);

      console.log('📤 Envoi de l\'image pour OCR:', imageFile.name, imageFile.size, imageFile.type);

      const response = await this.api.post('/api/v1/plaintes/creation/depuis-image/preview', formData, {
        headers: {
          'Content-Type': undefined, // Laisser axios définir le multipart/form-data avec boundary
        } as any,
        timeout: 180000, // 3 minutes pour OCR + analyse IA avec Ollama
      });

      return {
        success: true,
        data: response.data,
        message: 'Prévisualisation OCR réussie'
      } as ApiResponse<any>;
    } catch (error: any) {
      console.error('Erreur lors de la prévisualisation image:', error);
      
      let errorMessage = 'Erreur lors de la prévisualisation OCR';
      if (error.response?.data?.detail) {
        const detail = error.response.data.detail;
        if (typeof detail === 'string') {
          errorMessage = detail;
        } else if (Array.isArray(detail)) {
          errorMessage = detail.map((d: any) => d.msg || JSON.stringify(d)).join(', ');
        } else if (typeof detail === 'object') {
          errorMessage = detail.msg || JSON.stringify(detail);
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return {
        success: false,
        data: null as any,
        message: errorMessage
      } as ApiResponse<any>;
    }
  }

  // Prévisualiser l'extraction Image de manière ASYNCHRONE (recommandé pour OCR + IA)
  async previewImageExtractionAsync(imageFile: File): Promise<ApiResponse<{
    success: boolean;
    async: boolean;
    task_id: string;
    celery_task_id?: string;
    filename: string;
    file_size?: number;
    services_disponibles: Array<{ id: number; nom: string; code: string }>;
    message: string;
    // Si async=false (fallback synchrone), les données sont directement disponibles
    extraction?: {
      texte_brut: string;
      texte_longueur: number;
      donnees_structurees: any;
    };
    ocr_info?: {
      confiance: number;
      qualite: string;
    };
  }>> {
    try {
      const formData = new FormData();
      formData.append('image_file', imageFile);

      console.log('📤 [Async] Envoi de l\'image pour OCR:', imageFile.name);

      const response = await this.api.post('/api/v1/plaintes/creation/depuis-image/preview-async', formData, {
        headers: {
          'Content-Type': undefined,
        } as any,
        timeout: 30000, // 30s suffit car c'est asynchrone
      });

      return {
        success: true,
        data: response.data,
        message: response.data.message || 'Analyse OCR lancée'
      } as ApiResponse<any>;
    } catch (error: any) {
      console.error('Erreur lors du lancement de l\'extraction image async:', error);
      
      let errorMessage = 'Erreur lors du lancement de l\'extraction OCR';
      if (error.response?.data?.detail) {
        errorMessage = typeof error.response.data.detail === 'string' 
          ? error.response.data.detail 
          : JSON.stringify(error.response.data.detail);
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return {
        success: false,
        data: null as any,
        message: errorMessage
      } as ApiResponse<any>;
    }
  }

  // Créer une plainte depuis une image avec les données modifiées par l'utilisateur
  async createPlainteFromImage(
    imageFile: File, 
    serviceId?: number,
    userData?: {
      titre?: string;
      description?: string;
      nom?: string;
      prenom?: string;
      email?: string;
      telephone?: string;
      mode_reception?: string;
      date_incident?: string;
      priorite?: string;
      assigned_user_id?: number;
    }
  ): Promise<ApiResponse<{
    success: boolean;
    message: string;
    plainte: {
      id: number;
      numero_plainte: string;
      titre: string;
      description: string;
      statut: string;
      priorite: string;
      service_id: number;
      service_nom: string;
      date_creation: string;
    };
    plaignant: {
      nom: string | null;
      prenom: string | null;
      email: string | null;
      telephone: string | null;
    };
    extraction: {
      texte_extrait_longueur: number;
      donnees_extraites: boolean;
      confiance_ocr: number | null;
      confiance: number | null;
      champs_incertains: string[];
    };
    document: {
      nom_fichier: string;
      taille: number;
      chemin_stockage: string;
    };
    analyse_ia: {
      statut: string;
      message: string;
    };
  }>> {
    try {
      const formData = new FormData();
      formData.append('image_file', imageFile);
      
      if (serviceId) {
        formData.append('service_id', serviceId.toString());
      }
      
      // Ajouter les données modifiées par l'utilisateur si fournies
      if (userData) {
        if (userData.titre) formData.append('titre', userData.titre);
        if (userData.description) formData.append('description', userData.description);
        if (userData.nom) formData.append('nom_plaignant', userData.nom);
        if (userData.prenom) formData.append('prenom_plaignant', userData.prenom);
        if (userData.email) formData.append('email_plaignant', userData.email);
        if (userData.telephone) formData.append('telephone_plaignant', userData.telephone);
        if (userData.mode_reception) formData.append('mode_reception', userData.mode_reception);
        if (userData.date_incident) formData.append('date_incident', userData.date_incident);
        if (userData.priorite) formData.append('priorite', userData.priorite);
        if (userData.assigned_user_id) formData.append('assigned_user_id', userData.assigned_user_id.toString());
      }

      console.log('📤 Création plainte depuis image:', imageFile.name, imageFile.size);
      console.log('📤 Données utilisateur:', userData);

      const response = await this.api.post('/api/v1/plaintes/creation/depuis-image', formData, {
        headers: {
          'Content-Type': undefined, // Laisser axios définir le multipart/form-data avec boundary
        } as any,
        timeout: 90000, // 90 secondes pour la création complète
      });

      return {
        success: true,
        data: response.data,
        message: 'Plainte créée avec succès depuis l\'image'
      } as ApiResponse<any>;
    } catch (error: any) {
      console.error('Erreur lors de la création depuis image:', error);
      
      let errorMessage = 'Erreur lors de la création depuis l\'image';
      if (error.response?.data?.detail) {
        const detail = error.response.data.detail;
        if (typeof detail === 'string') {
          errorMessage = detail;
        } else if (Array.isArray(detail)) {
          errorMessage = detail.map((d: any) => d.msg || JSON.stringify(d)).join(', ');
        } else if (typeof detail === 'object') {
          errorMessage = detail.msg || JSON.stringify(detail);
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return {
        success: false,
        data: null as any,
        message: errorMessage
      } as ApiResponse<any>;
    }
  }

  // Créer une plainte depuis une image avec les données VALIDÉES par l'utilisateur
  // Utilise le nouvel endpoint optimisé qui ne refait pas l'OCR/analyse IA
  async createPlainteFromImageValidated(
    imageFile: File, 
    serviceId: number,
    userData: {
      titre: string;
      description: string;
      nom: string;
      prenom: string;
      email?: string | null;
      telephone?: string | null;
      mode_reception?: string | null;
      date_incident?: string | null;
      priorite?: string | null;
      assigned_user_id?: number | null;
    }
  ): Promise<ApiResponse<{
    success: boolean;
    message: string;
    plainte: {
      id: number;
      numero_plainte: string;
      titre: string;
      description: string;
      statut: string;
      priorite: string;
      service_id: number;
      service_nom: string;
      date_creation: string;
    };
    plaignant: {
      nom: string | null;
      prenom: string | null;
      email: string | null;
      telephone: string | null;
    };
    document: {
      nom_fichier: string;
      taille: number;
      chemin_stockage: string;
      type: string;
    };
    analyse_ia: {
      statut: string;
      message: string;
    };
  }>> {
    try {
      // Créer un FormData propre
      const formData = new FormData();
      
      // 1. Fichier Image (obligatoire)
      formData.append('image_file', imageFile, imageFile.name);
      
      // 2. Service ID (obligatoire)
      formData.append('service_id', serviceId.toString());
      
      // 3. Champs obligatoires depuis le store Redux
      formData.append('titre', userData.titre);
      formData.append('description', userData.description);
      formData.append('nom_plaignant', userData.nom);
      formData.append('prenom_plaignant', userData.prenom);
      
      // 4. Champs optionnels - seulement s'ils ont une valeur
      if (userData.email) {
        formData.append('email_plaignant', userData.email);
      }
      if (userData.telephone) {
        formData.append('telephone_plaignant', userData.telephone);
      }
      if (userData.mode_reception) {
        formData.append('mode_reception', userData.mode_reception);
      }
      if (userData.date_incident) {
        formData.append('date_incident', userData.date_incident);
      }
      if (userData.priorite) {
        formData.append('priorite', userData.priorite);
      }
      if (userData.assigned_user_id) {
        formData.append('assigned_user_id', userData.assigned_user_id.toString());
      }

      console.log('📤 [API] Création plainte depuis image validées');
      console.log('📤 [API] Image:', imageFile.name, '|', imageFile.size, 'bytes');
      console.log('📤 [API] Service ID:', serviceId);
      console.log('📤 [API] Données depuis store Redux:', JSON.stringify(userData, null, 2));
      
      // Debug: Afficher tout le contenu du FormData
      console.log('📦 [API] Contenu FormData envoyé:');
      for (const [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(`  - ${key}: [File] ${value.name} (${value.size} bytes, ${value.type})`);
        } else {
          console.log(`  - ${key}: "${value}"`);
        }
      }

      // Utiliser fetch API directement pour un contrôle total sur les headers
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${this.baseURL}/api/v1/plaintes/creation/depuis-image/donnees-validees`,
        {
          method: 'POST',
          headers: {
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            // NE PAS définir Content-Type - le navigateur le fera automatiquement avec le boundary
          },
          body: formData,
        }
      );
      
      const responseData = await response.json();
      
      if (!response.ok) {
        console.error('❌ [API] Erreur HTTP:', response.status, response.statusText);
        console.error('❌ [API] Détails:', JSON.stringify(responseData, null, 2));
        
        let errorMessage = 'Erreur lors de la création depuis l\'image';
        if (responseData.detail) {
          const detail = responseData.detail;
          if (typeof detail === 'string') {
            errorMessage = detail;
          } else if (Array.isArray(detail)) {
            console.error('❌ [API] Erreurs de validation FastAPI:');
            detail.forEach((d: any, i: number) => {
              console.error(`  ${i + 1}. Champ: ${d.loc?.join('.')} | Type: ${d.type} | Message: ${d.msg}`);
            });
            errorMessage = detail.map((d: any) => `${d.loc?.join('.')}: ${d.msg}`).join(', ');
          }
        }
        
        return {
          success: false,
          data: null as any,
          message: errorMessage
        } as ApiResponse<any>;
      }
      
      console.log('✅ [API] Plainte créée avec succès depuis image:', responseData);

      return {
        success: true,
        data: responseData,
        message: 'Plainte créée avec succès depuis l\'image'
      } as ApiResponse<any>;
    } catch (error: any) {
      console.error('❌ [API] Exception lors de la création depuis image:', error);
      
      return {
        success: false,
        data: null as any,
        message: error.message || 'Erreur lors de la création depuis l\'image'
      } as ApiResponse<any>;
    }
  }

  // ==================== CRÉATION DEPUIS ARCHIVE ====================

  // Créer une plainte depuis un fichier d'archive (PDF ou image) - Mode ASYNC
  // Retourne immédiatement avec un task_id, le résultat arrive via WebSocket
  async createPlainteFromArchiveFile(
    file: File,
    options: {
      source_archive: string;
      batch_id: string;
      processing_order: number;
      auto_assign_service?: boolean;
    }
  ): Promise<ApiResponse<{
    success: boolean;
    async: boolean;
    task_id: string;
    celery_task_id?: string;
    filename: string;
    file_size: number;
    batch_id: string;
    processing_order: number;
    message: string;
    websocket_events?: {
      started: string;
      progress: string;
      complete: string;
      failed: string;
    };
    // Si async=false (fallback synchrone), les données sont directement disponibles
    plainte_id?: number;
    numero_plainte?: string;
    plainte?: {
      id: number;
      numero_plainte: string;
      titre: string;
      statut: string;
      priorite: string;
      service_id: number;
      service_nom: string;
    };
    plaignant?: {
      nom: string;
      prenom: string;
    };
  }>> {
    try {
      const formData = new FormData();
      formData.append('file', file, file.name);
      formData.append('source_archive', options.source_archive);
      formData.append('batch_id', options.batch_id);
      formData.append('processing_order', options.processing_order.toString());
      
      if (options.auto_assign_service !== undefined) {
        formData.append('auto_assign_service', options.auto_assign_service.toString());
      }

      console.log('📤 [API Async] Envoi fichier archive:', file.name);

      const response = await this.api.post('/api/v1/plaintes/creation/depuis-archive/fichier', formData, {
        headers: {
          'Content-Type': undefined,
        } as any,
        timeout: 30000, // 30s suffit car c'est asynchrone
      });

      return {
        success: true,
        data: response.data,
        message: response.data.message || 'Traitement lancé'
      } as ApiResponse<any>;
    } catch (error: any) {
      console.error('❌ [API] Erreur création depuis archive:', error);
      
      let errorMessage = 'Erreur lors de la création depuis l\'archive';
      if (error.response?.data?.detail) {
        const detail = error.response.data.detail;
        errorMessage = typeof detail === 'string' ? detail : JSON.stringify(detail);
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return {
        success: false,
        data: null as any,
        message: errorMessage
      } as ApiResponse<any>;
    }
  }

  // Scanner un dossier d'archive (côté serveur)
  async scanArchiveFolder(folderPath: string): Promise<ApiResponse<{
    success: boolean;
    folder_path: string;
    files: Array<{
      filename: string;
      filepath: string;
      file_size: number;
      file_type: 'pdf' | 'image';
      mime_type: string;
    }>;
    total_files: number;
    message: string;
  }>> {
    try {
      const response = await this.api.post('/api/v1/plaintes/creation/depuis-archive/scan-dossier', {
        folder_path: folderPath
      });

      return {
        success: true,
        data: response.data,
        message: 'Dossier scanné avec succès'
      } as ApiResponse<any>;
    } catch (error: any) {
      console.error('Erreur lors du scan du dossier:', error);
      
      return {
        success: false,
        data: null as any,
        message: error.response?.data?.detail || error.message || 'Erreur lors du scan'
      } as ApiResponse<any>;
    }
  }

  // Lancer le traitement batch d'une archive
  async processArchiveBatch(
    files: Array<{ filepath: string; filename: string }>,
    options: {
      auto_assign_service?: boolean;
      batch_size?: number;
      continue_on_error?: boolean;
    }
  ): Promise<ApiResponse<{
    success: boolean;
    batch_id: string;
    task_id: string;
    total_files: number;
    message: string;
  }>> {
    try {
      const response = await this.api.post('/api/v1/plaintes/creation/depuis-archive/traiter-batch', {
        files,
        options
      });

      return {
        success: true,
        data: response.data,
        message: 'Traitement batch lancé'
      } as ApiResponse<any>;
    } catch (error: any) {
      console.error('Erreur lors du lancement du traitement batch:', error);
      
      return {
        success: false,
        data: null as any,
        message: error.response?.data?.detail || error.message || 'Erreur lors du lancement'
      } as ApiResponse<any>;
    }
  }

  // Annuler le traitement d'archive en cours
  async cancelArchiveProcessing(
    taskIds: string[],
    batchId?: string
  ): Promise<ApiResponse<{
    success: boolean;
    cancelled_count: number;
    cancelled_tasks: string[];
    failed_count: number;
    failed_tasks: Array<{ task_id: string; error: string }>;
    message: string;
  }>> {
    try {
      const response = await this.api.post('/api/v1/plaintes/creation/depuis-archive/annuler', {
        task_ids: taskIds,
        batch_id: batchId
      });

      return {
        success: true,
        data: response.data,
        message: response.data.message || 'Traitement annulé'
      } as ApiResponse<any>;
    } catch (error: any) {
      console.error('Erreur lors de l\'annulation:', error);
      
      return {
        success: false,
        data: null as any,
        message: error.response?.data?.detail || error.message || 'Erreur lors de l\'annulation'
      } as ApiResponse<any>;
    }
  }

  // Créer une plainte depuis un fichier temporaire (après navigation)
  async createPlainteFromTempFile(
    tempFilePath: string,
    fileType: 'pdf' | 'image',
    serviceId: number,
    userData: {
      titre: string;
      description: string;
      nom: string;
      prenom: string;
      email?: string | null;
      telephone?: string | null;
      mode_reception?: string | null;
      date_incident?: string | null;
      priorite?: string | null;
      assigned_user_id?: number | null;
    }
  ): Promise<ApiResponse<any>> {
    try {
      const formData = new FormData();
      
      // Chemin du fichier temp et type
      formData.append('temp_file_path', tempFilePath);
      formData.append('file_type', fileType);
      formData.append('service_id', serviceId.toString());
      
      // Champs obligatoires
      formData.append('titre', userData.titre);
      formData.append('description', userData.description);
      formData.append('nom_plaignant', userData.nom);
      formData.append('prenom_plaignant', userData.prenom);
      
      // Champs optionnels
      if (userData.email) {
        formData.append('email_plaignant', userData.email);
      }
      if (userData.telephone) {
        formData.append('telephone_plaignant', userData.telephone);
      }
      if (userData.mode_reception) {
        formData.append('mode_reception', userData.mode_reception);
      }
      if (userData.date_incident) {
        formData.append('date_incident', userData.date_incident);
      }
      if (userData.priorite) {
        formData.append('priorite', userData.priorite);
      }
      if (userData.assigned_user_id) {
        formData.append('assigned_user_id', userData.assigned_user_id.toString());
      }

      console.log('📤 [API] Création plainte depuis fichier temp:', tempFilePath);
      console.log('📤 [API] Type:', fileType, '| Service:', serviceId);
      console.log('📤 [API] userData:', JSON.stringify(userData, null, 2));

      const response = await this.api.post('/api/v1/plaintes/creation/depuis-temp', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log('✅ [API] Plainte créée depuis fichier temp:', response.data);

      return {
        success: true,
        data: response.data,
        message: 'Plainte créée avec succès'
      } as ApiResponse<any>;
    } catch (error: any) {
      console.error('❌ [API] Exception création depuis fichier temp:', error);
      
      let errorMessage = 'Erreur lors de la création de la plainte';
      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      }
      
      return {
        success: false,
        data: null as any,
        message: errorMessage
      } as ApiResponse<any>;
    }
  }

  // Récupérer le prochain numéro de plainte
  async getNextComplaintNumber(): Promise<ApiResponse<{next_number: number, suggested_title: string}>> {
    const response = await this.api.get('/api/v1/plaintes/creation/next-number');
    return {
      success: true,
      data: response.data,
      message: 'Prochain numéro récupéré avec succès'
    } as ApiResponse<{next_number: number, suggested_title: string}>;
  }

  // Statistiques globales
  async getStatistiquesGlobales(params?: {
    date_debut?: string;
    date_fin?: string;
  }): Promise<ApiResponse<{
    total: number;
    nouvelles: number;
    en_cours: number;
    traitees: number;
    cloturees: number;
    mois_courant: number;
    semaine_courante: number;
  }>> {
    const queryParams = new URLSearchParams();
    if (params) {
      if (params.date_debut) queryParams.append('date_debut', params.date_debut);
      if (params.date_fin) queryParams.append('date_fin', params.date_fin);
    }
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    const response = await this.api.get(`/api/v1/plaintes/statistiques/global${queryString}`);
    return {
      success: true,
      data: response.data,
      message: 'Statistiques globales récupérées avec succès'
    } as ApiResponse<{
      total: number;
      nouvelles: number;
      en_cours: number;
      traitees: number;
      cloturees: number;
      mois_courant: number;
      semaine_courante: number;
    }>;
  }

  // Statistiques par département
  async getStatistiquesDepartements(params?: { date_debut?: string; date_fin?: string }): Promise<ApiResponse<Array<{
    id: number;
    nom: string;
    type_service: string;
    total: number;
    nouvelles: number;
    en_cours: number;
    traitees: number;
    cloturees: number;
    satisfaction_moyenne: number;
  }>>> {
    const queryParams = new URLSearchParams();
    if (params?.date_debut) queryParams.append('date_debut', params.date_debut);
    if (params?.date_fin) queryParams.append('date_fin', params.date_fin);
    const queryString = queryParams.toString();
    const url = `/api/v1/plaintes/statistiques/departements${queryString ? `?${queryString}` : ''}`;
    const response = await this.api.get(url);
    return {
      success: true,
      data: response.data,
      message: 'Statistiques par département récupérées avec succès'
    } as ApiResponse<Array<{
      id: number;
      nom: string;
      type_service: string;
      total: number;
      nouvelles: number;
      en_cours: number;
      traitees: number;
      cloturees: number;
      satisfaction_moyenne: number;
    }>>;
  }

  // Statistiques par priorité
  async getStatistiquesPriorites(): Promise<ApiResponse<Array<{
    priorite: string;
    count: number;
  }>>> {
    const response = await this.api.get('/api/v1/plaintes/statistiques/priorites');
    return {
      success: true,
      data: response.data,
      message: 'Statistiques par priorité récupérées avec succès'
    } as ApiResponse<Array<{
      priorite: string;
      count: number;
    }>>;
  }

  // Évolution des plaintes
  async getEvolutionPlaintes(periode: string = '30j'): Promise<ApiResponse<{
    periode: string;
    evolution_journaliere: Array<{ date: string; count: number }>;
    stats_par_statut: Record<string, number>;
  }>> {
    const response = await this.api.get(`/api/v1/plaintes/statistiques/evolution?periode=${periode}`);
    return {
      success: true,
      data: response.data,
      message: 'Évolution des plaintes récupérée avec succès'
    } as ApiResponse<{
      periode: string;
      evolution_journaliere: Array<{ date: string; count: number }>;
      stats_par_statut: Record<string, number>;
    }>;
  }

  // ==================== MÉTHODES LEGACY (DASHBOARDS) ====================

  // Utilisateurs (non disponibles dans le backend actuel)
  async getUsers(page: number = 1, limit: number = 10): Promise<PaginatedResponse<User>> {
    throw new Error('Users endpoint not available in current backend');
  }

  async updateUser(userId: string, userData: Partial<User>): Promise<ApiResponse<User>> {
    throw new Error('User update endpoint not available in current backend');
  }

  // Plaintes (équivalent des dashboards dans le backend)
  async getDashboards(page: number = 1, limit: number = 10): Promise<PaginatedResponse<Dashboard>> {
    const response = await this.api.get(`/api/v1/plaintes?page=${page}&limit=${limit}`);
    return response.data;
  }

  async getDashboard(dashboardId: string): Promise<ApiResponse<Dashboard>> {
    const response = await this.api.get(`/api/v1/plaintes/${dashboardId}`);
    return response.data;
  }

  async createDashboard(dashboardData: Partial<Dashboard>): Promise<ApiResponse<Dashboard>> {
    const response = await this.api.post('/api/v1/plaintes', dashboardData);
    return response.data;
  }

  async updateDashboard(dashboardId: string, dashboardData: Partial<Dashboard>): Promise<ApiResponse<Dashboard>> {
    const response = await this.api.put(`/api/v1/plaintes/${dashboardId}`, dashboardData);
    return response.data;
  }

  async deleteDashboard(dashboardId: string): Promise<ApiResponse<void>> {
    const response = await this.api.delete(`/api/v1/plaintes/${dashboardId}`);
    return response.data;
  }

  // Datasources (non disponibles dans le backend actuel)
  async getDatasources(page: number = 1, limit: number = 10): Promise<PaginatedResponse<Datasource>> {
    throw new Error('Datasources endpoint not available in current backend');
  }

  async getDatasource(datasourceId: string): Promise<ApiResponse<Datasource>> {
    throw new Error('Datasource endpoint not available in current backend');
  }

  async uploadDatasource(file: File, metadata: Partial<Datasource>): Promise<ApiResponse<Datasource>> {
    throw new Error('Datasource upload endpoint not available in current backend');
  }

  async deleteDatasource(datasourceId: string): Promise<ApiResponse<void>> {
    throw new Error('Datasource delete endpoint not available in current backend');
  }

  // Tâches (analyses des plaintes dans le backend)
  async getTasks(page: number = 1, limit: number = 10): Promise<PaginatedResponse<Task>> {
    throw new Error('Tasks endpoint not available in current backend');
  }

  async getTask(taskId: string): Promise<ApiResponse<Task>> {
    throw new Error('Task endpoint not available in current backend');
  }

  async createTask(taskData: {
    type: WidgetType;
    dashboard_id: string;
    widget_id: string;
    parameters: Record<string, any>;
  }): Promise<ApiResponse<Task>> {
    throw new Error('Task creation endpoint not available in current backend');
  }

  async cancelTask(taskId: string): Promise<ApiResponse<void>> {
    throw new Error('Task cancellation endpoint not available in current backend');
  }

  // Projets (non disponibles dans le backend actuel)
  async getProjects(page: number = 1, limit: number = 10): Promise<PaginatedResponse<Project>> {
    throw new Error('Projects endpoint not available in current backend');
  }

  async getProject(projectId: string): Promise<ApiResponse<Project>> {
    throw new Error('Project endpoint not available in current backend');
  }

  async createProject(projectData: Partial<Project>): Promise<ApiResponse<Project>> {
    throw new Error('Project creation endpoint not available in current backend');
  }

  async updateProject(projectId: string, projectData: Partial<Project>): Promise<ApiResponse<Project>> {
    throw new Error('Project update endpoint not available in current backend');
  }

  async deleteProject(projectId: string): Promise<ApiResponse<void>> {
    throw new Error('Project delete endpoint not available in current backend');
  }

  // Widgets (non disponibles dans le backend actuel)
  async updateWidgetLayout(dashboardId: string, widgetId: string, layout: Partial<WidgetLayout>): Promise<ApiResponse<WidgetLayout>> {
    throw new Error('Widget layout update endpoint not available in current backend');
  }

  async deleteWidget(dashboardId: string, widgetId: string): Promise<ApiResponse<void>> {
    throw new Error('Widget delete endpoint not available in current backend');
  }

  // ==================== HEALTHCARE AI & ANALYTICS ====================

  // Récupérer le résumé des plaintes (statistiques globales)
  async getComplaintsSummary(fromDate?: string, toDate?: string, status?: string): Promise<ApiResponse<{
    total: number;
    in_progress: number;
    resolved: number;
    avg_resolution_time_seconds: number;
    nouvelles: number;
    filters_applied: {
      from_date: string | null;
      to_date: string | null;
      status: string | null;
    };
    timestamp: string;
  }>> {
    try {
      const params = new URLSearchParams();
      if (fromDate) params.append('from_date', fromDate);
      if (toDate) params.append('to_date', toDate);
      if (status) params.append('status', status);

      const queryString = params.toString();
      const url = `/api/v1/healthcare-ai/complaints/summary${queryString ? `?${queryString}` : ''}`;

      const response = await this.api.get(url);
      return {
        success: response.data.success,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error: any) {
      console.error('Erreur lors de la récupération du résumé:', error);
      return {
        success: false,
        data: null as any,
        message: error.response?.data?.detail || 'Erreur lors de la récupération du résumé'
      };
    }
  }

  // Récupérer les tendances des plaintes
  async getComplaintsTrends(days: number = 30): Promise<ApiResponse<{
    period: {
      start_date: string;
      end_date: string;
      days: number;
    };
    trends: Array<{
      date: string;
      total: number;
      recu: number;
      en_cours: number;
      traite: number;
      cloture: number;
    }>;
    timestamp: string;
  }>> {
    try {
      const response = await this.api.get(`/api/v1/healthcare-ai/complaints/trends?days=${days}`);
      return {
        success: response.data.success,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error: any) {
      console.error('Erreur lors de la récupération des tendances:', error);
      return {
        success: false,
        data: null as any,
        message: error.response?.data?.detail || 'Erreur lors de la récupération des tendances'
      };
    }
  }

  // Récupérer les services avec leurs KPIs
  async getServicesWithKPIs(activeOnly: boolean = true): Promise<ApiResponse<Array<{
    id: number;
    nom: string;
    code_service: string;
    description?: string;
    est_actif: boolean;
    nombre_plaintes_total: number;
    nombre_plaintes_resolues: number;
    temps_moyen_resolution: number;
    taux_satisfaction: number;
  }>>> {
    try {
      const params = new URLSearchParams();
      if (activeOnly) params.append('actif_seulement', 'true');

      const queryString = params.toString();
      const url = `/api/v1/services${queryString ? `?${queryString}` : ''}`;

      const response = await this.api.get(url);
      return {
        success: true,
        data: response.data,
        message: 'Services avec KPIs récupérés avec succès'
      };
    } catch (error: any) {
      console.error('Erreur lors de la récupération des services KPIs:', error);
      return {
        success: false,
        data: [],
        message: error.response?.data?.detail || 'Erreur lors de la récupération des services'
      };
    }
  }

  // Recalculer tous les KPIs des services
  async recalculateAllKPIs(): Promise<ApiResponse<{
    message: string;
    services_updated: number;
  }>> {
    try {
      const response = await this.api.post('/api/v1/services/recalculate-all-kpis');
      return {
        success: true,
        data: response.data,
        message: response.data.message
      };
    } catch (error: any) {
      console.error('Erreur lors du recalcul des KPIs:', error);
      return {
        success: false,
        data: null as any,
        message: error.response?.data?.detail || 'Erreur lors du recalcul des KPIs'
      };
    }
  }

  // Récupérer les KPIs d'un service spécifique
  async getServiceKPIs(serviceId: number, recalculate: boolean = false): Promise<ApiResponse<{
    nombre_plaintes_total: number;
    nombre_plaintes_resolues: number;
    temps_moyen_resolution: number;
    taux_satisfaction: number;
  }>> {
    try {
      const params = recalculate ? '?recalculer=true' : '';
      const response = await this.api.get(`/api/v1/services/${serviceId}/kpis${params}`);
      return {
        success: true,
        data: response.data,
        message: 'KPIs du service récupérés avec succès'
      };
    } catch (error: any) {
      console.error('Erreur lors de la récupération des KPIs du service:', error);
      return {
        success: false,
        data: null as any,
        message: error.response?.data?.detail || 'Erreur lors de la récupération des KPIs'
      };
    }
  }

  // ==================== ANALYSE IA AVANCÉE ====================

  // Type pour le résultat d'analyse IA
  private AIAnalysisResultType = null; // Type défini ci-dessous

  // Démarrer une analyse IA asynchrone
  async startAIAnalysis(): Promise<ApiResponse<{
    task_id: string | null;
    message: string;
    estimated_time_seconds?: number;
    total_plaintes?: number;
    total_services?: number;
    data?: any; // Si aucune plainte, retourne directement les données
  }>> {
    try {
      const response = await this.api.post('/api/v1/healthcare-ai/analyze/start');
      return {
        success: response.data.success,
        data: {
          task_id: response.data.task_id,
          message: response.data.message,
          estimated_time_seconds: response.data.estimated_time_seconds,
          total_plaintes: response.data.total_plaintes || response.data.data?.total_plaintes_analysees || 0,
          total_services: response.data.total_services || response.data.data?.nombre_services || 0,
          data: response.data.data
        },
        message: response.data.message
      };
    } catch (error: any) {
      console.error('Erreur démarrage analyse IA:', error);
      return {
        success: false,
        data: null as any,
        message: error.response?.data?.detail || 'Erreur lors du démarrage de l\'analyse'
      };
    }
  }

  // Vérifier le statut d'une analyse en cours
  async getAIAnalysisStatus(taskId: string): Promise<ApiResponse<{
    task_id: string;
    status: 'pending' | 'running' | 'completed' | 'error';
    progress: number;
    current_step: string;
    total_plaintes: number;
    total_services: number;
    services_analysed: number;
    started_at: string;
    has_result: boolean;
    error: string | null;
  }>> {
    try {
      const response = await this.api.get(`/api/v1/healthcare-ai/analyze/status/${taskId}`);
      return {
        success: response.data.success,
        data: response.data,
        message: response.data.message
      };
    } catch (error: any) {
      console.error('Erreur statut analyse IA:', error);
      return {
        success: false,
        data: null as any,
        message: error.response?.data?.detail || 'Erreur lors de la récupération du statut'
      };
    }
  }

  // Récupérer le résultat d'une analyse terminée
  async getAIAnalysisResult(taskId: string): Promise<ApiResponse<{
    total_plaintes_analysees: number;
    nombre_services: number;
    analyses_par_service: Array<{
      service: string;
      nombre_plaintes: number;
      causes_identifiees: Array<{
        cause: string;
        frequence: number | string;
        gravite: string;
        exemples: string[];
      }>;
      problemes_recurrents: string[];
      sentiment_general: string;
      recommandations: string[];
    }>;
    causes_globales: Array<{
      service: string;
      cause: string;
      gravite: string;
      frequence: number | string;
    }>;
    services_critiques: string[];
    timestamp: string;
    model_used: string;
  }>> {
    try {
      const response = await this.api.get(`/api/v1/healthcare-ai/analyze/result/${taskId}`);
      return {
        success: response.data.success,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error: any) {
      console.error('Erreur résultat analyse IA:', error);
      return {
        success: false,
        data: null as any,
        message: error.response?.data?.detail || 'Erreur lors de la récupération du résultat'
      };
    }
  }

  // Récupérer la dernière analyse IA sauvegardée
  async getLatestAIAnalysis(): Promise<ApiResponse<{
    total_plaintes_analysees: number;
    nombre_services: number;
    analyses_par_service: Array<{
      service: string;
      nombre_plaintes: number;
      causes_identifiees: Array<{
        cause: string;
        frequence: number | string;
        gravite: string;
        exemples: string[];
      }>;
      problemes_recurrents: string[];
      sentiment_general: string;
      recommandations: string[];
    }>;
    causes_globales: Array<{
      service: string;
      cause: string;
      gravite: string;
      frequence: number | string;
    }>;
    services_critiques: string[];
    timestamp: string;
    model_used: string;
    duree_secondes?: number;
    task_id?: string;
  } | null>> {
    try {
      const response = await this.api.get('/api/v1/healthcare-ai/analyze/latest');
      return {
        success: response.data.success,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error: any) {
      console.error('Erreur récupération dernière analyse IA:', error);
      return {
        success: false,
        data: null,
        message: error.response?.data?.detail || 'Erreur lors de la récupération de la dernière analyse'
      };
    }
  }

  // Récupérer l'historique des analyses IA
  async getAIAnalysisHistory(limit: number = 10): Promise<ApiResponse<Array<{
    task_id: string;
    total_plaintes_analysees: number;
    nombre_services: number;
    services_critiques_count: number;
    model_used: string;
    duree_secondes: number;
    completed_at: string;
  }>>> {
    try {
      const response = await this.api.get(`/api/v1/healthcare-ai/analyze/history?limit=${limit}`);
      return {
        success: response.data.success,
        data: response.data.data || [],
        message: response.data.message
      };
    } catch (error: any) {
      console.error('Erreur historique analyses IA:', error);
      return {
        success: false,
        data: [],
        message: error.response?.data?.detail || 'Erreur lors de la récupération de l\'historique'
      };
    }
  }

  // [LEGACY] Lancer une analyse IA synchrone (utilise maintenant startAIAnalysis)
  async runAIAnalysis(): Promise<ApiResponse<{
    task_id?: string;
    total_plaintes_analysees: number;
    nombre_services: number;
    analyses_par_service: Array<{
      service: string;
      nombre_plaintes: number;
      causes_identifiees: Array<{
        cause: string;
        frequence: number | string;
        gravite: string;
        exemples: string[];
      }>;
      problemes_recurrents: string[];
      sentiment_general: string;
      recommandations: string[];
    }>;
    causes_globales: Array<{
      service: string;
      cause: string;
      gravite: string;
      frequence: number | string;
    }>;
    services_critiques: string[];
    timestamp: string;
    model_used: string;
  }>> {
    try {
      const response = await this.api.post('/api/v1/healthcare-ai/analyze', {}, {
        timeout: 300000 // 5 minutes max
      });
      return {
        success: response.data.success,
        data: response.data.data || response.data,
        message: response.data.message
      };
    } catch (error: any) {
      console.error('Erreur lors de l\'analyse IA:', error);
      return {
        success: false,
        data: null as any,
        message: error.response?.data?.detail || 'Erreur lors de l\'analyse IA'
      };
    }
  }

  // Vérifier le statut d'Ollama
  async checkAIStatus(): Promise<ApiResponse<{
    ollama_available: boolean;
    models_available: string[];
    recommended_model: string;
    model_ready: boolean;
    error?: string;
  }>> {
    try {
      const response = await this.api.get('/api/v1/healthcare-ai/analyze/status');
      return {
        success: response.data.success,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error: any) {
      console.error('Erreur vérification statut IA:', error);
      return {
        success: false,
        data: {
          ollama_available: false,
          models_available: [],
          recommended_model: 'llama3.2',
          model_ready: false,
          error: error.message
        },
        message: 'Impossible de vérifier le statut de l\'IA'
      };
    }
  }

  // Utilitaires
  setAuthToken(token: string) {
    localStorage.setItem('token', token);
    this.api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  removeAuthToken() {
    localStorage.removeItem('token');
    delete this.api.defaults.headers.common['Authorization'];
  }

  getBaseURL(): string {
    return this.baseURL;
  }
}

export const apiService = new ApiService();
export default apiService; 