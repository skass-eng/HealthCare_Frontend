// Types pour les énumérations backend
export enum ServiceEnum {
  CARDIOLOGIE = 'Cardiologie',
  URGENCES = 'Urgences',
  PEDIATRIE = 'Pédiatrie',
  CHIRURGIE = 'Chirurgie',
  RADIOLOGIE = 'Radiologie',
  ONCOLOGIE = 'Oncologie',
  NEUROLOGIE = 'Neurologie',
  ORTHOPEDIE = 'Orthopédie'
}

export enum PrioriteEnum {
  URGENT = 'Urgent',
  ELEVE = 'Élevé',
  MOYEN = 'Moyen',
  BAS = 'Bas'
}

export enum TypeFichierEnum {
  PDF = 'PDF',
  IMAGE = 'IMAGE',
  WORD = 'WORD',
  EXCEL = 'EXCEL',
  POWERPOINT = 'POWERPOINT',
  VIDEO = 'VIDEO',
  AUDIO = 'AUDIO',
  ARCHIVE = 'ARCHIVE',
  AUTRE = 'AUTRE'
}

// Interface pour une plainte
export interface Plainte {
  id: number;
  plainte_id: string;
  titre: string;
  service?: ServiceEnum;
  priorite: PrioriteEnum;
  status: string;  // Changé de 'statut' à 'status' pour correspondre au backend
  nom_plaignant?: string;
  email_plaignant?: string;
  telephone_plaignant?: string;
  date_creation: string;
  date_incident?: string;
  date_limite_reponse?: string;
  score_sentiment?: string;  // Description textuelle (ex: "Très mécontent")
  score_urgence?: string;    // Description textuelle (ex: "Priorité élevée")
  mots_cles?: string;
  contenu_original?: string;
  contenu_resume?: string;
}

// Interface pour un fichier de plainte
export interface FichierPlainte {
  id: number;
  plainte_id: number;
  nom_original: string;
  nom_systeme: string;
  chemin_fichier: string;
  taille_fichier: number;
  type_fichier: TypeFichierEnum;
  content_type: string;
  date_upload: string;
  checksum_md5?: string;
  texte_extrait?: string;
  est_traite: boolean;
}

// Interface pour une suggestion IA
export interface SuggestionIA {
  id: number;
  plainte_id: number;
  type_suggestion: 'classification' | 'contact' | 'reponse' | 'action' | 'mots_cles' | 'priorite';
  contenu_suggestion: string;
  score_confiance?: number;
  date_generation: string;
  modele_utilise?: string;
  est_approuve: boolean;
  est_utilise: boolean;
}

// Interface pour le détail d'une plainte
export interface PlainteDetail {
  plainte: Plainte;
  fichiers: FichierPlainte[];
  suggestions_ia: SuggestionIA[];
}

// Interface pour la réponse d'upload
export interface UploadResponse {
  message: string;
  plainte_id: string;
  filename: string;
  file_size: number;
  file_type: string;
  file_extension: string;
  content_type: string;
  upload_time: string;
}

// Interface pour les statistiques
export interface Statistiques {
  // Statistiques principales pour les cartes
  nouvelles_plaintes: number;
  plaintes_en_retard: number;
  en_cours_traitement: number;
  traitees_ce_mois: number;
  satisfaction_moyenne: number;
  
  // Progressions et métriques
  progression: {
    nouvelles_plaintes: string;
    plaintes_en_retard: string;
    en_cours_traitement: string;
    traitees_ce_mois: string;
    satisfaction_moyenne: string;
  };
  
  // Statistiques détaillées
  statistiques_detaillees: {
    plaintes: {
      total: number;
      en_attente: number;
      en_cours: number;
      traitees_mois: number;
      nouvelles_7_jours: number;
    };
    fichiers: {
      total: number;
      en_attente_traitement: number;
      traites: number;
      traites_aujourd_hui: number;
      taux_traitement_pct: number;
    };
    ia_performance: {
      total_suggestions: number;
      suggestions_approuvees: number;
      suggestions_utilisees: number;
      taux_approbation_pct: number;
      efficacite_ia: string;
    };
  };
  
  // Répartitions
  repartitions: {
    par_services: Array<{ service: string; count: number }>;
    par_priorites: Array<{ priorite: string; count: number }>;
    par_types_fichiers: Array<{ type: string; count: number }>;
  };
  
  // Alertes
  alertes: {
    fichiers_en_attente_critique: boolean;
    plaintes_urgentes: boolean;
    performance_ia_faible: boolean;
    satisfaction_faible: boolean;
  };
  
  derniere_mise_a_jour: string;
}

// Interface pour les filtres de recherche
export interface PlaintesFilters {
  service?: ServiceEnum;
  priorite?: PrioriteEnum;
  status?: string;  // Changé de 'statut' à 'status'
  date_debut?: string;
  date_fin?: string;
  search?: string;
}

// Interface pour la liste paginée des plaintes
export interface PlaintesListResponse {
  plaintes: Plainte[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

// Interface pour les suggestions par type
export interface SuggestionsParType {
  [key: string]: Array<{
    id: number;
    contenu: string;
    confiance?: number;
    modele?: string;
    date_generation: string;
    est_approuve: boolean;
    est_utilise: boolean;
  }>;
}

// Interface pour les réponses de suggestions
export interface SuggestionsResponse {
  plainte_id: string;
  total_suggestions: number;
  suggestions_par_type: SuggestionsParType;
  types_disponibles: string[];
}

// Interface pour les statistiques de plaintes par service
export interface ServiceStat {
  service: string;
  count: number;
  display_name: string;
}

export interface PlaintesParServiceResponse {
  total_services: number;
  services: ServiceStat[];
}

// Types pour les composants UI
export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

export interface NotificationData {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

// Types pour les props des composants
export interface CardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: JSX.Element;
  variant?: 'default' | 'success' | 'warning' | 'danger';
  loading?: boolean;
}

export interface ButtonProps {
  children: JSX.Element | string;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
} 