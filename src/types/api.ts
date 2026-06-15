/**
 * TYPES API - Frontend ODYSSEE Architecture
 * Interfaces TypeScript pour la communication avec le backend
 * Version: 1.0.0 - Architecture ODYSSEE
 */

// ==================== TYPES DE BASE ====================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  timestamp?: string;
}

export interface PaginatedResponse<T = any> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface ErrorResponse {
  success: false;
  error: string;
  details?: Record<string, any>;
  timestamp: string;
}

// ==================== TYPES WEBSOCKET ====================

export interface IWebsocketMessage {
  state: 'AUTH_SUCCESS' | 'PONG' | 'SUCCESS' | 'FAILURE' | 'PROGRESS';
  task_id?: string;
  result?: {
    taskMeta?: {
      name: string;
      datasources?: string[];
      error?: string;
    };
  };
  data?: Record<string, any>;
  timestamp?: string;
}

// ==================== TYPES HEALTHCARE AI ====================

export interface HealthcareAiSummary {
  total: number;
  in_progress: number;
  resolved: number;
  avg_resolution_time_seconds: number;
  nouvelles?: number;
  filters_applied?: {
    from_date?: string;
    to_date?: string;
    status?: string;
  };
  timestamp: string;
}

export interface HealthcareAiTrends {
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
}

// ==================== TYPES PLAINTES ====================

export enum StatutPlainte {
  RECU = "RECU",
  EN_COURS = "EN_COURS",
  TRAITE = "TRAITE",
  CLOTURE = "CLOTURE"
}

export enum PrioritePlainte {
  URGENT = "URGENT",
  ELEVE = "ELEVE", 
  MOYEN = "MOYEN",
  BAS = "BAS"
}

export interface Plainte {
  id: number;
  numero_plainte: string;
  titre: string;
  description: string;
  statut: StatutPlainte;
  priorite: PrioritePlainte;
  service_id?: number;
  cree_par_id: number;
  
  // Classification automatique
  categorie_principale?: string;
  sous_categorie?: string;
  mots_cles: string[];
  score_sentiment?: number;
  score_urgence_ia?: number;
  analyse_ia: Record<string, any>;
  
  // Dates
  date_incident?: string;
  date_limite_reponse?: string;
  date_resolution?: string;
  created: string;
  updated?: string;
  
  // Relations optionnelles
  service?: Service;
  createur?: User;
  analyses?: Analyse[];
}

export interface PlainteCreate {
  titre: string;
  description: string;
  service_id: number;
  date_incident?: string;
  // Champs additionnels pour le formulaire manuel
  nom_plaignant?: string;
  prenom_plaignant?: string;
  email_plaignant?: string;
  telephone_plaignant?: string;
  mode_reception?: string;
  priorite?: string;
  circonstances?: string;
  consequences?: string;
  demande_plaignant?: string;
  assigned_user_id?: number;
  trigger_analyses?: boolean;
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

// ==================== TYPES UTILISATEUR ====================

export enum UserRole {
  SUPER_ADMIN = "SUPER_ADMIN",
  ADMIN = "ADMIN",
  RESPONSABLE_QUALITE = "RESPONSABLE_QUALITE",
  CHEF_SERVICE = "CHEF_SERVICE",
  MEDECIN = "MEDECIN",
  INFIRMIER = "INFIRMIER",
  TECHNICIEN = "TECHNICIEN",
  SECRETAIRE = "SECRETAIRE",
  PATIENT = "PATIENT",
  UTILISATEUR = "UTILISATEUR"
}

export interface User {
  id: number;
  email: string;
  nom_complet?: string;
  type_utilisateur: UserRole;
  est_actif: boolean;
  email_verifie: boolean;
  configuration: Record<string, any>;
  created: string;
  updated?: string;
}

export interface UserCreate {
  email: string;
  password: string;
  nom_complet?: string;
  type_utilisateur?: UserRole;
}

export interface LoginRequest {
  username: string; // Le backend utilise 'username' pour l'email
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
}

// ==================== TYPES ORGANISATION & SERVICE ====================

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
  categorie?: string;
  configuration: Record<string, any>;
  est_actif: boolean;
  // KPIs du service
  nombre_plaintes_total: number;
  nombre_plaintes_resolues: number;
  temps_moyen_resolution: number;  // en jours
  taux_satisfaction: number;       // pourcentage
  created: string;
  updated?: string;
}

export interface ServiceKPIs {
  nombre_plaintes_total: number;
  nombre_plaintes_resolues: number;
  temps_moyen_resolution: number;
  taux_satisfaction: number;
}

// ==================== TYPES ANALYSE ====================

export enum TypeAnalyse {
  SENTIMENT = "sentiment",
  CLASSIFICATION = "classification",
  PRIORITE = "priorite",
  SERVICE_SUGGESTION = "service_suggestion",
  ACTION_RECOMMENDATION = "action_recommendation"
}

export enum StatutAnalyse {
  EN_ATTENTE = "en_attente",
  EN_COURS = "en_cours",
  TERMINEE = "terminee",
  ECHEC = "echec"
}

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
  
  // Dates
  date_debut?: string;
  date_fin?: string;
  created: string;
  updated?: string;
}

// ==================== TYPES FILTRES ====================

export interface PlainteFilters {
  page?: number;
  limit?: number;
  statut?: StatutPlainte;
  priorite?: PrioritePlainte;
  service_id?: number;
  search?: string;
  from_date?: string;
  to_date?: string;
}

export interface HealthcareAiFilters {
  from_date?: string;
  to_date?: string;
  status?: string;
}

// ==================== TYPES TÂCHES ====================

export interface TaskStatus {
  task_id: string;
  status: 'PENDING' | 'STARTED' | 'SUCCESS' | 'FAILURE' | 'RETRY' | 'REVOKED';
  result?: Record<string, any>;
  error_message?: string;
  progress?: number; // 0-100
}

export interface AnalyseTaskRequest {
  plainte_id: number;
  types_analyse: string[];
  parametres?: Record<string, any>;
  priorite_task?: 'high' | 'normal' | 'low';
}

// ==================== TYPES STATISTIQUES ====================

export interface StatistiquesResponse {
  total_plaintes: number;
  plaintes_nouvelles: number;
  plaintes_en_analyse: number;
  plaintes_resolues: number;
  
  // Métriques de performance
  temps_moyen_analyse: number; // En minutes
  taux_resolution: number; // Pourcentage
  score_satisfaction_moyen?: number;
  
  // Répartitions
  repartition_par_service: Record<string, number>;
  repartition_par_priorite: Record<string, number>;
  
  // Tendances
  evolution_quotidienne: Array<Record<string, any>>;
  
  timestamp: string;
}