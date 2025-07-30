/**
 * SERVICE API UNIFIÉ - HealthCare AI
 * Service unique et propre pour toutes les fonctionnalités
 * Version: 1.0.0 - Architecture Clean
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api/v1';

// ==================== TYPES UNIFIÉS ====================

export interface Organisation {
  id: number;
  uuid: string;
  nom: string;
  nom_court: string;
  code_etablissement: string;
  email?: string;
  telephone?: string;
  adresse?: string;
  site_web?: string;
  siret?: string;
  finess?: string;
  configuration: Record<string, any>;
  date_creation: string;
  date_modification?: string;
  est_actif: boolean;
}

export interface Service {
  id: number;
  uuid: string;
  organisation_id: number;
  nom: string;
  code_service: string;
  type_service: string;
  description?: string;
  batiment?: string;
  etage?: string;
  secteur?: string;
  chef_service_id?: number;
  responsable_qualite_id?: number;
  configuration: Record<string, any>;
  date_creation: string;
  date_modification?: string;
  est_actif: boolean;
}

export interface Utilisateur {
  id: number;
  uuid: string;
  organisation_id: number;
  service_id?: number;
  nom: string;
  prenom: string;
  nom_complet: string;
  email: string;
  telephone?: string;
  telephone_mobile?: string;
  type_utilisateur: string;
  fonction?: string;
  specialite?: string;
  numero_rpps?: string;
  permissions: string[];
  configuration: Record<string, any>;
  statut: string;
  est_actif: boolean;
  email_verifie: boolean;
  derniere_connexion?: string;
  date_creation: string;
}

export interface Plainte {
  id: number;
  uuid: string;
  plainte_id: string;
  numero_interne?: string;
  organisation_id: number;
  service_id?: number;
  service?: string;
  titre: string;
  description: string;
  circonstances?: string;
  consequences?: string;
  demande_plaignant?: string;
  status: string;
  priorite: string;
  categorie_principale?: string;
  sous_categorie?: string;
  mots_cles: string[];
  date_incident?: string;
  date_limite_reponse?: string;
  assignee_a_id?: number;
  cree_par_id?: number;
  score_sentiment?: number;
  score_urgence_ia?: number;
  analyse_ia: Record<string, any>;
  date_creation: string;
  date_modification?: string;
  date_resolution?: string;
  nom_plaignant?: string;
  email_plaignant?: string;
  telephone_plaignant?: string;
  contenu_original?: string;
  contenu_resume?: string;
}

export interface Statistiques {
  total_plaintes: number;
  nouvelles: number;
  en_cours: number;
  traitees: number;
  urgentes: number;
  elevees: number;
  moyennes: number;
  basses: number;
  nouvelles_plaintes: number;
  tendance_nouvelles: number;
  plaintes_en_cours: number;
  plaintes_resolues: number;
  tendance_resolues: number;
  par_statut: Record<string, number>;
  par_priorite: Record<string, number>;
  par_service: Record<string, number>;
}

export interface PlaintesListResponse {
  plaintes: Plainte[];
  total: number;
  skip: number;
  limit: number;
}

export interface AuditLog {
  id: number;
  utilisateur_id?: number;
  session_id?: string;
  action: string;
  ressource_type: string;
  ressource_id?: string;
  description: string;
  donnees_avant?: Record<string, any>;
  donnees_apres?: Record<string, any>;
  adresse_ip?: string;
  user_agent?: string;
  date_action: string;
}

export interface AuditLogResponse {
  logs: AuditLog[];
  total: number;
  skip: number;
  limit: number;
}

// ==================== SERVICE API UNIFIÉ ====================

class ApiUnified {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE}${endpoint}`;
    
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    const response = await fetch(url, { ...defaultOptions, ...options });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Error [${response.status}]:`, errorText);
      throw new Error(`Erreur API: ${response.status} - ${errorText}`);
    }

    return response.json();
  }

  // ==================== SANTÉ API ====================

  async healthCheck(): Promise<any> {
    return this.request('/health');
  }

  async getApiInfo(): Promise<any> {
    return this.request('/');
  }

  // ==================== ORGANISATIONS ====================

  async getOrganisations(params?: {
    skip?: number;
    limit?: number;
    actif_seulement?: boolean;
  }): Promise<Organisation[]> {
    const searchParams = new URLSearchParams();
    if (params?.skip !== undefined) searchParams.set('skip', params.skip.toString());
    if (params?.limit !== undefined) searchParams.set('limit', params.limit.toString());
    if (params?.actif_seulement !== undefined) searchParams.set('actif_seulement', params.actif_seulement.toString());
    
    const query = searchParams.toString();
    return this.request(`/organisations${query ? `?${query}` : ''}`);
  }

  async createOrganisation(data: Partial<Organisation>): Promise<Organisation> {
    return this.request('/organisations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getOrganisation(id: number): Promise<Organisation> {
    return this.request(`/organisations/${id}`);
  }

  async updateOrganisation(id: number, data: Partial<Organisation>): Promise<Organisation> {
    return this.request(`/organisations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // ==================== SERVICES ====================

  async getServices(params?: {
    organisation_id?: number;
    type_service?: string;
    actif_seulement?: boolean;
  }): Promise<Service[]> {
    const searchParams = new URLSearchParams();
    if (params?.organisation_id !== undefined) searchParams.set('organisation_id', params.organisation_id.toString());
    if (params?.type_service) searchParams.set('type_service', params.type_service);
    if (params?.actif_seulement !== undefined) searchParams.set('actif_seulement', params.actif_seulement.toString());
    
    const query = searchParams.toString();
    return this.request(`/services${query ? `?${query}` : ''}`);
  }

  async createService(data: Partial<Service>): Promise<Service> {
    return this.request('/services', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateService(id: number, data: Partial<Service>): Promise<Service> {
    return this.request(`/services/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteService(id: number): Promise<void> {
    return this.request(`/services/${id}`, {
      method: 'DELETE',
    });
  }

  // ==================== UTILISATEURS ====================

  async getUtilisateurs(params?: {
    organisation_id?: number;
    service_id?: number;
    type_utilisateur?: string;
    actif_seulement?: boolean;
  }): Promise<Utilisateur[]> {
    const searchParams = new URLSearchParams();
    if (params?.organisation_id !== undefined) searchParams.set('organisation_id', params.organisation_id.toString());
    if (params?.service_id !== undefined) searchParams.set('service_id', params.service_id.toString());
    if (params?.type_utilisateur) searchParams.set('type_utilisateur', params.type_utilisateur);
    if (params?.actif_seulement !== undefined) searchParams.set('actif_seulement', params.actif_seulement.toString());
    
    const query = searchParams.toString();
    return this.request(`/utilisateurs${query ? `?${query}` : ''}`);
  }

  async createUtilisateur(data: Partial<Utilisateur>): Promise<Utilisateur> {
    return this.request('/utilisateurs', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateUtilisateur(id: number, data: Partial<Utilisateur>): Promise<Utilisateur> {
    return this.request(`/utilisateurs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteUtilisateur(id: number): Promise<void> {
    return this.request(`/utilisateurs/${id}`, {
      method: 'DELETE',
    });
  }

  // ==================== PLAINTES ====================

  async getPlaintes(params?: {
    organisation_id?: number;
    service_id?: number;
    statut?: string;
    priorite?: string;
    skip?: number;
    limit?: number;
  }): Promise<PlaintesListResponse> {
    const searchParams = new URLSearchParams();
    if (params?.organisation_id !== undefined) searchParams.set('organisation_id', params.organisation_id.toString());
    if (params?.service_id !== undefined) searchParams.set('service_id', params.service_id.toString());
    if (params?.statut) searchParams.set('statut', params.statut);
    if (params?.priorite) searchParams.set('priorite', params.priorite);
    if (params?.skip !== undefined) searchParams.set('skip', params.skip.toString());
    if (params?.limit !== undefined) searchParams.set('limit', params.limit.toString());
    
    const query = searchParams.toString();
    return this.request(`/plaintes${query ? `?${query}` : ''}`);
  }

  async createPlainte(data: Partial<Plainte>): Promise<Plainte> {
    return this.request('/plaintes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePlainte(id: number, data: Partial<Plainte>): Promise<Plainte> {
    return this.request(`/plaintes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getPlainteById(plainteId: string): Promise<Plainte> {
    return this.request<Plainte>(`/plaintes/${plainteId}`);
  }

  async rechercherPlaintes(filtres: any): Promise<{
    plaintes: Plainte[];
    total: number;
    total_pages: number;
  }> {
    const searchParams = new URLSearchParams();
    Object.keys(filtres).forEach(key => {
      if (filtres[key] !== undefined && filtres[key] !== null && filtres[key] !== '') {
        searchParams.set(key, filtres[key].toString());
      }
    });
    
    const query = searchParams.toString();
    return this.request(`/plaintes/recherche${query ? `?${query}` : ''}`);
  }

  async getPlaintesPrioritaires(filtres: any): Promise<{
    plaintes: Plainte[];
    total: number;
  }> {
    const searchParams = new URLSearchParams();
    
    if (filtres.service) searchParams.set('service_id', filtres.service);
    if (filtres.page) searchParams.set('skip', ((filtres.page - 1) * (filtres.limit || 1000)).toString());
    if (filtres.limit) searchParams.set('limit', filtres.limit.toString());
    
    const response = await this.request<PlaintesListResponse>(`/plaintes${searchParams.toString() ? `?${searchParams.toString()}` : ''}`);
    
    // Trier les plaintes par priorité côté client
    const plaintesTriees = response.plaintes.sort((a, b) => {
      // Priorité: URGENT > ELEVE > MOYEN > BAS
      const priorites = { 'URGENT': 4, 'ELEVE': 3, 'MOYEN': 2, 'BAS': 1 };
      const prioriteA = priorites[a.priorite as keyof typeof priorites] || 0;
      const prioriteB = priorites[b.priorite as keyof typeof priorites] || 0;
      
      if (prioriteA !== prioriteB) {
        return prioriteB - prioriteA; // Priorité plus élevée en premier
      }
      
      // Si même priorité, trier par date limite
      const dateA = a.date_limite_reponse ? new Date(a.date_limite_reponse).getTime() : 0;
      const dateB = b.date_limite_reponse ? new Date(b.date_limite_reponse).getTime() : 0;
      
      return dateA - dateB; // Date plus proche en premier
    });
    
    return {
      plaintes: plaintesTriees,
      total: response.total
    };
  }

  async getPlainteSuggestions(plainteId: string): Promise<any> {
    return this.request(`/plaintes/${plainteId}/suggestions`);
  }

  async exportPlaintes(params: any): Promise<any> {
    const searchParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        searchParams.set(key, params[key].toString());
      }
    });
    
    const query = searchParams.toString();
    return this.request(`/plaintes/export${query ? `?${query}` : ''}`);
  }

  async getStats(): Promise<any> {
    return this.request('/statistiques');
  }

  async getTendances(periode: string): Promise<any> {
    return this.request(`/statistiques/tendances?periode=${periode}`);
  }

  async getPlaintesList(params?: any): Promise<any> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
          searchParams.set(key, params[key].toString());
        }
      });
    }
    
    const query = searchParams.toString();
    return this.request(`/plaintes${query ? `?${query}` : ''}`);
  }

  async getPlaintesEnCours(): Promise<any> {
    return this.request('/plaintes/en-cours');
  }

  async getPlaintesTraitees(): Promise<any> {
    return this.request('/plaintes/traitees');
  }

  async getPlaintesEnAttente(): Promise<any> {
    return this.request('/plaintes/en-attente');
  }

  // ==================== STATISTIQUES ====================

  async getStatistiques(organisation_id?: number): Promise<Statistiques> {
    const searchParams = new URLSearchParams();
    if (organisation_id !== undefined) searchParams.set('organisation_id', organisation_id.toString());
    
    const query = searchParams.toString();
    return this.request(`/dashboard/statistiques${query ? `?${query}` : ''}`);
  }

  // ==================== UPLOAD ====================

  async uploadPlainte(
    file: File,
    data: {
      organisation_id: number;
      service_id?: number;
      priorite?: string;
    }
  ): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('organisation_id', data.organisation_id.toString());
    if (data.service_id) formData.append('service_id', data.service_id.toString());
    if (data.priorite) formData.append('priorite', data.priorite);

    return this.request('/upload-plainte', {
      method: 'POST',
      body: formData,
      headers: {
        // Ne pas définir Content-Type pour FormData
      },
    });
  }

  // ==================== AUDIT ====================

  async getAuditLog(params?: {
    organisation_id?: number;
    utilisateur_id?: number;
    objet_type?: string;
    action?: string;
    date_debut?: string;
    date_fin?: string;
    skip?: number;
    limit?: number;
  }): Promise<AuditLogResponse> {
    const searchParams = new URLSearchParams();
    if (params?.organisation_id !== undefined) searchParams.set('organisation_id', params.organisation_id.toString());
    if (params?.utilisateur_id !== undefined) searchParams.set('utilisateur_id', params.utilisateur_id.toString());
    if (params?.objet_type) searchParams.set('objet_type', params.objet_type);
    if (params?.action) searchParams.set('action', params.action);
    if (params?.date_debut) searchParams.set('date_debut', params.date_debut);
    if (params?.date_fin) searchParams.set('date_fin', params.date_fin);
    if (params?.skip !== undefined) searchParams.set('skip', params.skip.toString());
    if (params?.limit !== undefined) searchParams.set('limit', params.limit.toString());
    
    const query = searchParams.toString();
    return this.request(`/audit${query ? `?${query}` : ''}`);
  }

  // ==================== AMÉLIORATIONS ET SUGGESTIONS ====================

  async getAmeliorations(): Promise<any> {
    return this.request('/ameliorations');
  }

  async getSuggestionsIA(organisation_id?: number): Promise<any> {
    const searchParams = new URLSearchParams();
    if (organisation_id !== undefined) searchParams.set('organisation_id', organisation_id.toString());
    
    const query = searchParams.toString();
    return this.request(`/suggestions-ia${query ? `?${query}` : ''}`);
  }

  // ==================== INTÉGRATION API PAGES ====================

  async getPagesDashboard(organisation_id?: number): Promise<any> {
    const searchParams = new URLSearchParams();
    if (organisation_id !== undefined) searchParams.set('organisation_id', organisation_id.toString());
    
    const query = searchParams.toString();
    return this.request(`/pages/dashboard${query ? `?${query}` : ''}`);
  }

  async getPagesNouvellesPlaintes(
    page: number = 1,
    limit: number = 10,
    organisation_id?: number,
    priorite?: string,
    service_id?: number
  ): Promise<any> {
    const searchParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    if (organisation_id !== undefined) {
      searchParams.set('organisation_id', organisation_id.toString());
    }
    if (priorite) {
      searchParams.set('priorite', priorite);
    }
    if (service_id !== undefined) {
      searchParams.set('service_id', service_id.toString());
    }
    
    return this.request(`/pages/nouvelles-plaintes?${searchParams.toString()}`);
  }

  async getPagesEnCours(
    page: number = 1,
    limit: number = 10,
    organisation_id?: number,
    statut?: string
  ): Promise<any> {
    const searchParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    if (organisation_id !== undefined) {
      searchParams.set('organisation_id', organisation_id.toString());
    }
    if (statut) {
      searchParams.set('statut', statut);
    }
    
    return this.request(`/pages/en-cours?${searchParams.toString()}`);
  }

  async getPagesTraitees(
    page: number = 1,
    limit: number = 10,
    organisation_id?: number,
    date_debut?: string,
    date_fin?: string
  ): Promise<any> {
    const searchParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    if (organisation_id !== undefined) {
      searchParams.set('organisation_id', organisation_id.toString());
    }
    if (date_debut) {
      searchParams.set('date_debut', date_debut);
    }
    if (date_fin) {
      searchParams.set('date_fin', date_fin);
    }
    
    return this.request(`/pages/traitees?${searchParams.toString()}`);
  }

  async getPagesAmeliorations(
    page: number = 1,
    limit: number = 10,
    categorie?: string
  ): Promise<any> {
    const searchParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    if (categorie) {
      searchParams.set('categorie', categorie);
    }
    
    return this.request(`/pages/ameliorations?${searchParams.toString()}`);
  }

  async getPagesAnalytics(
    periode: string = "30j",
    organisation_id?: number
  ): Promise<any> {
    const searchParams = new URLSearchParams({
      periode,
    });
    
    if (organisation_id !== undefined) {
      searchParams.set('organisation_id', organisation_id.toString());
    }
    
    return this.request(`/pages/analytics?${searchParams.toString()}`);
  }

  async getPagesAdministration(organisation_id?: number): Promise<any> {
    const searchParams = new URLSearchParams();
    
    if (organisation_id !== undefined) {
      searchParams.set('organisation_id', organisation_id.toString());
    }
    
    const query = searchParams.toString();
    return this.request(`/pages/analytics-v2${query ? `?${query}` : ''}`);
  }

  async getPagesParametres(): Promise<any> {
    return this.request('/pages/parametres');
  }

  async getPagesApisUtilisees(): Promise<any> {
    return this.request('/pages/apis-utilisees');
  }

  async getPagesHealth(): Promise<any> {
    return this.request('/pages/health');
  }
}

// Instance unique exportée
export const apiUnified = new ApiUnified();

// ==================== HOOKS REACT UNIFIÉS ====================

import { useState, useEffect } from 'react';

export function useOrganisations() {
  const [organisations, setOrganisations] = useState<Organisation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrganisations = async () => {
      try {
        setLoading(true);
        const data = await apiUnified.getOrganisations();
        setOrganisations(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
        setOrganisations([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrganisations();
  }, []);

  return { organisations, loading, error };
}

export function useServices(organisationId?: number) {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        const data = await apiUnified.getServices({ organisation_id: organisationId });
        setServices(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
        setServices([]);
      } finally {
        setLoading(false);
      }
    };

    if (organisationId) {
      fetchServices();
    } else {
      setServices([]);
      setLoading(false);
    }
  }, [organisationId]);

  return { services, loading, error };
}

export function useUtilisateurs(organisationId?: number, serviceId?: number) {
  const [utilisateurs, setUtilisateurs] = useState<Utilisateur[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUtilisateurs = async () => {
      try {
        setLoading(true);
        const data = await apiUnified.getUtilisateurs({ 
          organisation_id: organisationId,
          service_id: serviceId 
        });
        setUtilisateurs(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
        setUtilisateurs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUtilisateurs();
  }, [organisationId, serviceId]);

  const createUtilisateur = async (userData: Partial<Utilisateur>) => {
    try {
      const newUser = await apiUnified.createUtilisateur(userData);
      setUtilisateurs(prev => [...prev, newUser]);
      return newUser;
    } catch (err) {
      throw err;
    }
  };

  const updateUtilisateur = async (userId: number, userData: Partial<Utilisateur>) => {
    try {
      const updatedUser = await apiUnified.updateUtilisateur(userId, userData);
      setUtilisateurs(prev => 
        prev.map(user => user.id === userId ? updatedUser : user)
      );
      return updatedUser;
    } catch (err) {
      throw err;
    }
  };

  const deleteUtilisateur = async (userId: number) => {
    try {
      await apiUnified.deleteUtilisateur(userId);
      setUtilisateurs(prev => prev.filter(user => user.id !== userId));
    } catch (err) {
      throw err;
    }
  };

  return { 
    utilisateurs, 
    loading, 
    error, 
    createUtilisateur, 
    updateUtilisateur,
    deleteUtilisateur 
  };
}

export function useStatistiques(params?: {
  organisation_id?: number;
  service_id?: number;
  periode_jours?: number;
}) {
  const [statistiques, setStatistiques] = useState<Statistiques | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatistiques = async () => {
    try {
      setLoading(true);
      const data = await apiUnified.getStatistiques(params?.organisation_id);
      setStatistiques(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
      setStatistiques(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatistiques();
  }, [params?.organisation_id, params?.service_id, params?.periode_jours]);

  const refetch = () => {
    fetchStatistiques();
  };

  return { statistiques, loading, error, refetch };
}

export function useApiHealth() {
  const [health, setHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        setLoading(true);
        const data = await apiUnified.healthCheck();
        setHealth(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur lors du check santé');
        setHealth(null);
      } finally {
        setLoading(false);
      }
    };

    fetchHealth();
  }, []);

  return { health, loading, error };
} 