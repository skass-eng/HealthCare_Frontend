/**
 * CLIENT API PAGES - HealthCare AI
 * Client dédié par page avec endpoints spécifiques
 * Version: 1.0.0
 */

const PAGES_API_BASE = process.env.NEXT_PUBLIC_PAGES_API_URL || '/api/v2/pages';

// ==================== TYPES PAR PAGE ====================

// Types communs
export interface PageResponse {
  page: string;
  timestamp: string;
  success: boolean;
  message: string;
}

// ==================== PAGE DASHBOARD (KPIs) ====================

export interface DashboardKPIs {
  // Statistiques principales
  total_plaintes: number;
  nouvelles_plaintes: number;
  plaintes_en_cours: number;
  plaintes_traitees: number;
  plaintes_en_retard: number;
  satisfaction_moyenne: number;
  
  // Métriques de performance
  taux_resolution: number;
  duree_moyenne_traitement: number;
  plaintes_urgentes: number;
  
  // Répartitions
  repartition_par_statut: Record<string, number>;
  repartition_par_priorite: Record<string, number>;
  repartition_par_service: Record<string, number>;
  
  // Alertes
  alertes: Record<string, boolean>;
  
  // APIs utilisées
  apis_utilisees: string[];
}

export interface DashboardResponse extends PageResponse {
  data: DashboardKPIs;
}

// ==================== PAGE NOUVELLES PLAINTES ====================

export interface NouvellePlainte {
  id: number;
  numero_plainte: string;
  titre: string;
  description: string;
  service: string;
  priorite: string;
  date_creation: string;
  date_limite_reponse?: string;
  assignee?: string;
}

export interface NouvellesPlaintesResponse extends PageResponse {
  data: {
    plaintes: NouvellePlainte[];
    total: number;
    page: number;
    limit: number;
    filtres_disponibles: Record<string, any>;
    apis_utilisees: string[];
  };
}

// ==================== PAGE EN COURS ====================

export interface PlainteEnCours {
  id: number;
  numero_plainte: string;
  titre: string;
  description: string;
  service: string;
  priorite: string;
  statut: string;
  date_creation: string;
  date_modification: string;
  date_limite_reponse?: string;
  assignee?: string;
  progression: number;
}

export interface EnCoursResponse extends PageResponse {
  data: {
    plaintes: PlainteEnCours[];
    total: number;
    page: number;
    limit: number;
    statistiques_workflow: Record<string, number>;
    apis_utilisees: string[];
  };
}

// ==================== PAGE TRAITÉES ====================

export interface PlainteTraitee {
  id: number;
  numero_plainte: string;
  titre: string;
  description: string;
  service: string;
  priorite: string;
  statut: string;
  date_creation: string;
  date_resolution: string;
  duree_traitement: number;
  satisfaction?: number;
  resolution_commentaire?: string;
}

export interface TraiteesResponse extends PageResponse {
  data: {
    plaintes: PlainteTraitee[];
    total: number;
    page: number;
    limit: number;
    statistiques_resolution: Record<string, any>;
    apis_utilisees: string[];
  };
}

// ==================== PAGE AMÉLIORATIONS ====================

export interface Amelioration {
  id: number;
  titre: string;
  description: string;
  categorie: string;
  priorite: string;
  statut: string;
  impact_estime: string;
  effort_estime: string;
  date_proposition: string;
  propose_par: string;
}

export interface AmeliorationsResponse extends PageResponse {
  data: {
    ameliorations: Amelioration[];
    total: number;
    categories: string[];
    statistiques_impact: Record<string, any>;
    apis_utilisees: string[];
  };
}

// ==================== PAGE ANALYTICS ====================

export interface AnalyticsData {
  evolution_temps: {
    dates: string[];
    plaintes: number[];
  };
  repartition_geographique: Record<string, number>;
  tendances_priorites: Record<string, number[]>;
  performance_services: Record<string, Record<string, any>>;
}

export interface AnalyticsResponse extends PageResponse {
  data: {
    analytics: AnalyticsData;
    periode_analyse: string;
    apis_utilisees: string[];
  };
}

// ==================== PAGE ANALYTICS V2 ====================

export interface AnalyticsV2Data {
  predictions_ia: Record<string, any>;
  insights_avances: Array<{
    type: string;
    titre: string;
    description: string;
    impact: string;
    recommandation: string;
  }>;
  recommandations: string[];
  metriques_avancees: Record<string, any>;
}

export interface AnalyticsV2Response extends PageResponse {
  data: {
    analytics_v2: AnalyticsV2Data;
    modeles_ia_utilises: string[];
    apis_utilisees: string[];
  };
}

// ==================== PAGE PARAMÈTRES ====================

export interface Parametre {
  id: number;
  nom: string;
  valeur: string;
  categorie: string;
  description: string;
  modifiable: boolean;
}

export interface ParametresResponse extends PageResponse {
  data: {
    parametres: Parametre[];
    categories: string[];
    apis_utilisees: string[];
  };
}

// ==================== CLIENT API PAGES ====================

class ApiPages {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${PAGES_API_BASE}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erreur API Pages: ${response.status} - ${errorText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Erreur lors de l'appel à l'API Pages ${endpoint}:`, error);
      throw error;
    }
  }

  // ==================== ENDPOINTS PAR PAGE ====================

  async healthCheck(): Promise<any> {
    return this.request('/health');
  }

  // ==================== PAGE DASHBOARD ====================

  async getDashboardData(organisation_id?: number): Promise<DashboardResponse> {
    const params = new URLSearchParams();
    if (organisation_id !== undefined) {
      params.set('organisation_id', organisation_id.toString());
    }
    
    const query = params.toString();
    return this.request(`/dashboard${query ? `?${query}` : ''}`);
  }

  // ==================== PAGE NOUVELLES PLAINTES ====================

  async getNouvellesPlaintes(
    page: number = 1,
    limit: number = 10,
    organisation_id?: number,
    priorite?: string,
    service_id?: number
  ): Promise<NouvellesPlaintesResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    if (organisation_id !== undefined) {
      params.set('organisation_id', organisation_id.toString());
    }
    
    if (priorite) {
      params.set('priorite', priorite);
    }
    
    if (service_id !== undefined) {
      params.set('service_id', service_id.toString());
    }
    
    return this.request(`/nouvelles-plaintes?${params.toString()}`);
  }

  // ==================== PAGE EN COURS ====================

  async getEnCoursData(
    page: number = 1,
    limit: number = 10,
    organisation_id?: number,
    statut?: string
  ): Promise<EnCoursResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    if (organisation_id !== undefined) {
      params.set('organisation_id', organisation_id.toString());
    }
    
    if (statut) {
      params.set('statut', statut);
    }
    
    return this.request(`/en-cours?${params.toString()}`);
  }

  // ==================== PAGE TRAITÉES ====================

  async getTraiteesData(
    page: number = 1,
    limit: number = 10,
    organisation_id?: number,
    date_debut?: string,
    date_fin?: string
  ): Promise<TraiteesResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    if (organisation_id !== undefined) {
      params.set('organisation_id', organisation_id.toString());
    }
    
    if (date_debut) {
      params.set('date_debut', date_debut);
    }
    
    if (date_fin) {
      params.set('date_fin', date_fin);
    }
    
    return this.request(`/traitees?${params.toString()}`);
  }

  // ==================== PAGE AMÉLIORATIONS ====================

  async getAmeliorationsData(
    page: number = 1,
    limit: number = 10,
    categorie?: string
  ): Promise<AmeliorationsResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    if (categorie) {
      params.set('categorie', categorie);
    }
    
    return this.request(`/ameliorations?${params.toString()}`);
  }

  // ==================== PAGE ANALYTICS ====================

  async getAnalyticsData(
    periode: string = "30j",
    organisation_id?: number
  ): Promise<AnalyticsResponse> {
    const params = new URLSearchParams({
      periode,
    });
    
    if (organisation_id !== undefined) {
      params.set('organisation_id', organisation_id.toString());
    }
    
    return this.request(`/analytics?${params.toString()}`);
  }

  // ==================== PAGE ANALYTICS V2 ====================

  async getAnalyticsV2Data(organisation_id?: number): Promise<AnalyticsV2Response> {
    const params = new URLSearchParams();
    
    if (organisation_id !== undefined) {
      params.set('organisation_id', organisation_id.toString());
    }
    
    const query = params.toString();
    return this.request(`/analytics-v2${query ? `?${query}` : ''}`);
  }

  // ==================== PAGE PARAMÈTRES ====================

  async getParametresData(): Promise<ParametresResponse> {
    return this.request('/parametres');
  }

  // ==================== ENDPOINT GLOBAL ====================

  async getAllApisUtilisees(): Promise<Record<string, string[]>> {
    return this.request('/apis-utilisees');
  }
}

// ==================== INSTANCE EXPORTÉE ====================

export const apiPages = new ApiPages();

// ==================== HOOKS PAR PAGE ====================

import React from 'react';

export function useDashboardData(organisation_id?: number) {
  const [data, setData] = React.useState<DashboardKPIs | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchData = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiPages.getDashboardData(organisation_id);
      setData(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  }, [organisation_id]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = () => {
    fetchData();
  };

  return { data, loading, error, refetch };
}

export function useNouvellesPlaintes(
  page: number = 1,
  limit: number = 10,
  organisation_id?: number,
  priorite?: string,
  service_id?: number
) {
  const [data, setData] = React.useState<NouvellesPlaintesResponse['data'] | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchData = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiPages.getNouvellesPlaintes(page, limit, organisation_id, priorite, service_id);
      setData(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  }, [page, limit, organisation_id, priorite, service_id]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = () => {
    fetchData();
  };

  return { data, loading, error, refetch };
}

export function useEnCoursData(
  page: number = 1,
  limit: number = 10,
  organisation_id?: number,
  statut?: string
) {
  const [data, setData] = React.useState<EnCoursResponse['data'] | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchData = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiPages.getEnCoursData(page, limit, organisation_id, statut);
      setData(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  }, [page, limit, organisation_id, statut]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = () => {
    fetchData();
  };

  return { data, loading, error, refetch };
}

export function useTraiteesData(
  page: number = 1,
  limit: number = 10,
  organisation_id?: number,
  date_debut?: string,
  date_fin?: string
) {
  const [data, setData] = React.useState<TraiteesResponse['data'] | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchData = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiPages.getTraiteesData(page, limit, organisation_id, date_debut, date_fin);
      setData(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  }, [page, limit, organisation_id, date_debut, date_fin]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = () => {
    fetchData();
  };

  return { data, loading, error, refetch };
}

export function useAmeliorationsData(
  page: number = 1,
  limit: number = 10,
  categorie?: string
) {
  const [data, setData] = React.useState<AmeliorationsResponse['data'] | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchData = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiPages.getAmeliorationsData(page, limit, categorie);
      setData(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  }, [page, limit, categorie]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = () => {
    fetchData();
  };

  return { data, loading, error, refetch };
}

export function useAnalyticsData(
  periode: string = "30j",
  organisation_id?: number
) {
  const [data, setData] = React.useState<AnalyticsResponse['data'] | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchData = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiPages.getAnalyticsData(periode, organisation_id);
      setData(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  }, [periode, organisation_id]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = () => {
    fetchData();
  };

  return { data, loading, error, refetch };
}

export function useAnalyticsV2Data(organisation_id?: number) {
  const [data, setData] = React.useState<AnalyticsV2Response['data'] | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchData = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiPages.getAnalyticsV2Data(organisation_id);
      setData(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  }, [organisation_id]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = () => {
    fetchData();
  };

  return { data, loading, error, refetch };
}

export function useParametresData() {
  const [data, setData] = React.useState<ParametresResponse['data'] | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchData = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiPages.getParametresData();
      setData(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = () => {
    fetchData();
  };

  return { data, loading, error, refetch };
} 