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

class AppClient {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: 'http://localhost:8000',
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
    // Configuration forcée pour le développement
    this.baseURL = 'http://localhost:8000';
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
          console.log('🔐 Token invalide, nettoyage...');
          localStorage.removeItem('token');
          // Ne pas rediriger automatiquement, laisser le composant gérer
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
  async getStatistiquesDepartements(): Promise<ApiResponse<Array<{
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
    const response = await this.api.get('/api/v1/plaintes/statistiques/departements');
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