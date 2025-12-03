// Types pour l'application ODYSSEE

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  created: string;
  updated: string;
}

export enum UserRole {
  LOW_COST = 'low_cost',
  NORMAL = 'normal',
  ADMIN = 'admin'
}

// ==================== TYPES PLAINTES ====================

export interface Plainte {
  id: number;
  numero_plainte: string;
  titre: string;
  description: string;
  service_id: number; // Service obligatoire maintenant
  cree_par_id: number;
  
  // Statut et classification
  statut: StatutPlainte;
  priorite: PrioritePlainte;
  categorie_principale?: string;
  mots_cles: string[];
  
  // Scores IA
  score_sentiment?: number;
  score_urgence_ia?: number;
  
  // Métadonnées d'analyse IA
  analyse_ia: Record<string, any>;
  
  // Dates
  date_incident?: string;
  date_limite_reponse?: string;
  date_creation: string;
  date_modification?: string;
  
  // Relations
  service?: Service;
  createur?: User;
  analyses?: Analyse[];
}

export enum StatutPlainte {
  RECU = 'RECU',
  EN_COURS = 'EN_COURS',
  TRAITE = 'TRAITE',
  CLOTURE = 'CLOTURE'
}

export enum PrioritePlainte {
  URGENT = 'URGENT',
  ELEVE = 'ELEVE',
  MOYEN = 'MOYEN',
  BAS = 'BAS'
}

export interface Organisation {
  id: number;
  nom: string;
  code_etablissement: string;
  configuration: Record<string, any>;
  est_actif: boolean;
  created: string;
  updated?: string;
}

export interface Service {
  id: number;
  nom: string;
  code_service: string;
  description?: string;
  configuration: Record<string, any>;
  est_actif: boolean;
  created: string;
  updated?: string;
}

// ==================== TYPES ANALYSES ====================

export interface Analyse {
  id: number;
  plainte_id: number;
  type_analyse: TypeAnalyse;
  statut: StatutAnalyse;
  parametres_entree: Record<string, any>;
  resultats: Record<string, any>;
  
  // Métadonnées d'exécution
  task_id?: string;
  duree_execution?: number;
  erreur_message?: string;
  analyste_id?: number;
  
  // Dates d'exécution
  date_debut?: string;
  date_fin?: string;
  created: string;
  updated?: string;
}

export enum TypeAnalyse {
  SENTIMENT = 'sentiment',
  CLASSIFICATION = 'classification',
  PRIORITE = 'priorite',
  SERVICE_SUGGESTION = 'service_suggestion',
  ACTION_RECOMMENDATION = 'action_recommendation'
}

export enum StatutAnalyse {
  EN_ATTENTE = 'en_attente',
  EN_COURS = 'en_cours',
  TERMINEE = 'terminee',
  ECHEC = 'echec'
}

// ==================== TYPES DASHBOARD (LEGACY) ====================

export interface Dashboard {
  id: string;
  name: string;
  description?: string;
  layout: WidgetLayout[];
  created: string;
  updated: string;
  user_id: string;
}

export interface WidgetLayout {
  id: string;
  type: WidgetType;
  position: { x: number; y: number; w: number; h: number };
  config: WidgetConfig;
  data?: any;
}

export enum WidgetType {
  PCA = 'pca',
  KMEANS = 'kmeans',
  CORRELATION = 'correlation',
  SCATTER = 'scatter',
  HEATMAP = 'heatmap',
  BAR_CHART = 'bar_chart',
  LINE_CHART = 'line_chart',
  PIE_CHART = 'pie_chart',
  TABLE = 'table',
  STATS = 'stats'
}

export interface WidgetConfig {
  title: string;
  datasource_id?: string;
  parameters?: Record<string, any>;
  display_options?: Record<string, any>;
}

export interface Datasource {
  id: string;
  name: string;
  description?: string;
  source: string;
  file_path?: string;
  meta_data: MetaData;
  created: string;
  updated: string;
  user_id: string;
}

export interface MetaData {
  columns: string[];
  rows: number;
  file_size: number;
  file_type: string;
  encoding?: string;
  delimiter?: string;
}

export interface Task {
  id: string;
  type: WidgetType;
  status: TaskStatus;
  progress: number;
  result?: any;
  error?: string;
  created: string;
  updated: string;
  user_id: string;
  dashboard_id: string;
  widget_id: string;
}

export enum TaskStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  dashboards: Dashboard[];
  datasources: Datasource[];
  meta_data: ProjectMetaData;
  created: string;
  updated: string;
  user_id: string;
}

export interface ProjectMetaData {
  author: string;
  organisation?: string;
  keywords: string[];
  version: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: 'success' | 'error';
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface WebSocketMessage {
  type: 'task_update' | 'task_complete' | 'task_error' | 'notification';
  data: any;
  timestamp: string;
}

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export interface AppState {
  user: User | null;
  currentProject: Project | null;
  dashboards: Dashboard[];
  datasources: Datasource[];
  tasks: Task[];
  notifications: Notification[];
  loading: boolean;
  error: string | null;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export interface DashboardState {
  currentDashboard: Dashboard | null;
  widgets: WidgetLayout[];
  layout: any[];
  loading: boolean;
  error: string | null;
  // Nouvelles propriétés pour la page Vue d'ensemble
  statistiquesGlobales: StatistiquesGlobales | null;
  statistiquesDepartements: StatistiquesDepartement[];
  statistiquesPriorites: StatistiquesPriorite[];
  evolutionPlaintes: EvolutionPlaintes | null;
  loadingStatistiques: boolean;
  errorStatistiques: string | null;
}

export interface StatistiquesGlobales {
  total: number;
  nouvelles: number;
  en_cours: number;
  traitees: number;
  cloturees: number;
  mois_courant: number;
  semaine_courante: number;
}

export interface StatistiquesDepartement {
  id: number;
  nom: string;
  type_service: string;
  total: number;
  nouvelles: number;
  en_cours: number;
  traitees: number;
  cloturees: number;
  satisfaction_moyenne: number;
}

export interface StatistiquesPriorite {
  priorite: string;
  count: number;
}

export interface EvolutionPlaintes {
  periode: string;
  evolution_journaliere: Array<{ date: string; count: number }>;
  stats_par_statut: Record<string, number>;
}

export interface TaskState {
  tasks: Task[];
  activeTasks: string[];
  loading: boolean;
  error: string | null;
}

// ==================== TYPES POUR CRÉATION DE PLAINTES ====================

export interface PlainteCreate {
  titre: string;
  description: string;
  service_id: number; // Service obligatoire maintenant
  date_incident?: string;
}

export interface PlainteUpdate {
  titre?: string;
  description?: string;
  statut?: StatutPlainte;
  priorite?: string;
  service_id?: number;
  date_incident?: string;
  // Informations du plaignant
  nom_plaignant?: string;
  prenom_plaignant?: string;
  email_plaignant?: string;
  telephone_plaignant?: string;
}

export interface AnalyseTaskRequest {
  plainte_id: number;
  types_analyse: string[];
  parametres?: Record<string, any>;
  priorite_task?: string;
}

export interface AnalyseTaskResult {
  plainte_id: number;
  analyses_completees: Analyse[];
  analyses_echouees: Record<string, any>[];
  duree_totale: number;
  timestamp: string;
} 