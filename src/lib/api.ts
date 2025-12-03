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
      
      formData.append('service_concerne_id', plainteData.service_id?.toString() || '');
      formData.append('utilisateur_assigne_id', plainteData.assigned_user_id?.toString() || '');
      formData.append('priorite', 'MOYEN');
      
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
  async getStatistiquesGlobales(): Promise<ApiResponse<{
    total: number;
    nouvelles: number;
    en_cours: number;
    traitees: number;
    cloturees: number;
    mois_courant: number;
    semaine_courante: number;
  }>> {
    const response = await this.api.get('/api/v1/plaintes/statistiques/global');
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