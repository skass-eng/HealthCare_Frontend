/**
 * CLIENT API DASHBOARD - HealthCare AI
 * Client dédié aux fonctionnalités du dashboard
 * Version: 1.0.0
 */

import React from 'react';

// Configuration des appels API pour le dashboard unifié

const API_BASE_URL = '/api/v1/dashboard'

export interface DashboardFilters {
  type_service?: string
  categorie_principale?: string
  sous_categorie?: string
  priorite?: string
  statut?: string
  organisation_id?: number
}

export interface ServiceStats {
  total_plaintes: number
  nouvelles: number
  en_cours: number
  traitees: number
  satisfaction_moyenne: number
}

export interface Service {
  id: number
  nom: string
  code_service: string
  type_service: string
  description: string
  statistiques: ServiceStats
}

export interface DashboardStatistiques {
  nouvelles_plaintes: number
  plaintes_en_attente: number
  plaintes_en_retard: number
  en_cours_traitement: number
  traitees_ce_mois: number
  satisfaction_moyenne: number
  progression: Record<string, string>
  statistiques_detaillees: Record<string, any>
  repartitions: Record<string, any[]>
  alertes: Record<string, boolean>
  derniere_mise_a_jour: string
}

export interface DashboardPlainte {
  id: number
  plainte_id: string
  titre: string
  contenu: string
  service: string
  priorite: string
  statut: string
  date_creation: string
  date_limite_reponse?: string
  nom_plaignant?: string
  email_plaignant?: string
  telephone_plaignant?: string
  categorie_principale?: string
  sous_categorie?: string
}

export interface DashboardPlaintesResponse {
  plaintes: DashboardPlainte[]
  total: number
  page: number
  limit: number
  filtres_appliques: Record<string, any>
}

export interface FiltresDisponibles {
  types_services: string[]
  categories_principales: string[]
  sous_categories: string[]
  priorites: string[]
  statuts: string[]
  statistiques: {
    services: Record<string, number>
    categories: Record<string, number>
    sous_categories: Record<string, number>
    priorites: Record<string, number>
    statuts: Record<string, number>
  }
}

// Fonction utilitaire pour construire les paramètres de requête
function buildQueryParams(filters: DashboardFilters): string {
  const params = new URLSearchParams()
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, value.toString())
    }
  })
  
  return params.toString()
}

// API pour récupérer les filtres disponibles
export async function getFiltresDisponibles(organisationId?: number): Promise<FiltresDisponibles> {
  const params = organisationId ? `?organisation_id=${organisationId}` : ''
  const response = await fetch(`${API_BASE_URL}/filtres-disponibles${params}`)
  
  if (!response.ok) {
    throw new Error('Erreur lors de la récupération des filtres disponibles')
  }
  
  const data = await response.json()
  return data.filtres
}

// API pour récupérer les détails des services
export async function getServicesDetails(organisationId?: number): Promise<Service[]> {
  const params = organisationId ? `?organisation_id=${organisationId}` : ''
  const response = await fetch(`${API_BASE_URL}/services-details${params}`)
  
  if (!response.ok) {
    throw new Error('Erreur lors de la récupération des détails des services')
  }
  
  const data = await response.json()
  return data.services
}

// API pour récupérer les statistiques du dashboard
export async function getDashboardStatistiques(filters: DashboardFilters): Promise<DashboardStatistiques> {
  const params = buildQueryParams(filters)
  const response = await fetch(`${API_BASE_URL}/statistiques?${params}`)
  
  if (!response.ok) {
    throw new Error('Erreur lors de la récupération des statistiques')
  }
  
  return await response.json()
}

// API pour récupérer les plaintes en cours
export async function getPlaintesEnCours(
  filters: DashboardFilters,
  page: number = 1,
  limit: number = 20
): Promise<DashboardPlaintesResponse> {
  const params = new URLSearchParams(buildQueryParams(filters))
  params.append('page', page.toString())
  params.append('limit', limit.toString())
  
  const response = await fetch(`${API_BASE_URL}/plaintes/en-cours?${params}`)
  
  if (!response.ok) {
    throw new Error('Erreur lors de la récupération des plaintes en cours')
  }
  
  return await response.json()
}

// API pour récupérer les plaintes traitées
export async function getPlaintesTraitees(
  filters: DashboardFilters,
  page: number = 1,
  limit: number = 20,
  dateDebut?: string,
  dateFin?: string
): Promise<DashboardPlaintesResponse> {
  const params = new URLSearchParams(buildQueryParams(filters))
  params.append('page', page.toString())
  params.append('limit', limit.toString())
  
  if (dateDebut) params.append('date_debut', dateDebut)
  if (dateFin) params.append('date_fin', dateFin)
  
  const response = await fetch(`${API_BASE_URL}/plaintes/traitees?${params}`)
  
  if (!response.ok) {
    throw new Error('Erreur lors de la récupération des plaintes traitées')
  }
  
  return await response.json()
}

// API pour récupérer les plaintes en attente
export async function getPlaintesEnAttente(
  filters: DashboardFilters,
  page: number = 1,
  limit: number = 20
): Promise<DashboardPlaintesResponse> {
  const params = new URLSearchParams(buildQueryParams(filters))
  params.append('page', page.toString())
  params.append('limit', limit.toString())
  
  const response = await fetch(`${API_BASE_URL}/plaintes/en-attente?${params}`)
  
  if (!response.ok) {
    throw new Error('Erreur lors de la récupération des plaintes en attente')
  }
  
  return await response.json()
}

// API pour récupérer les plaintes urgentes
export async function getPlaintesUrgentes(
  filters: DashboardFilters
): Promise<DashboardPlainte[]> {
  const params = buildQueryParams(filters)
  const response = await fetch(`${API_BASE_URL}/plaintes/urgentes?${params}`)
  
  if (!response.ok) {
    throw new Error('Erreur lors de la récupération des plaintes urgentes')
  }
  
  const data = await response.json()
  return data.plaintes
}

// Fonction utilitaire pour formater les filtres pour l'affichage
export function formatFilterLabel(key: string, value: string): string {
  const labels: Record<string, string> = {
    type_service: 'Service',
    categorie_principale: 'Catégorie',
    sous_categorie: 'Sous-catégorie',
    priorite: 'Priorité',
    statut: 'Statut',
    organisation_id: 'Organisation'
  }
  
  return `${labels[key] || key}: ${value}`
}

// Fonction utilitaire pour obtenir l'icône d'un service
export function getServiceIcon(serviceType: string): string {
  const icons: Record<string, string> = {
    'CARDIOLOGIE': '🫀',
    'URGENCES': '🚨',
    'PEDIATRIE': '👶',
    'CHIRURGIE': '🔪',
    'NEUROLOGIE': '🧠',
    'GYNECOLOGIE': '👩‍⚕️',
    'DERMATOLOGIE': '🦠',
    'ORTHOPÉDIE': '🦴',
    'PSYCHIATRIE': '🧠',
    'RADIOLOGIE': '📷',
    'LABORATOIRE': '🧪',
    'PHARMACIE': '💊',
    'ADMINISTRATION': '📋',
    'DIRECTION': '👔',
    'QUALITE': '✅'
  }
  return icons[serviceType] || '🏥'
}

// Fonction utilitaire pour obtenir la couleur de priorité
export function getPriorityColor(priority: string): string {
  const colors: Record<string, string> = {
    'URGENT': 'text-red-600 bg-red-100',
    'ELEVE': 'text-orange-600 bg-orange-100',
    'MOYEN': 'text-yellow-600 bg-yellow-100',
    'BAS': 'text-green-600 bg-green-100'
  }
  return colors[priority] || 'text-gray-600 bg-gray-100'
}

// Fonction utilitaire pour obtenir la couleur de statut
export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    'NOUVELLE': 'text-blue-600 bg-blue-100',
    'EN_COURS': 'text-yellow-600 bg-yellow-100',
    'EN_ATTENTE_INFORMATION': 'text-orange-600 bg-orange-100',
    'EN_COURS_TRAITEMENT': 'text-purple-600 bg-purple-100',
    'TRAITEE': 'text-green-600 bg-green-100',
    'RESOLUE': 'text-green-600 bg-green-100',
    'FERMEE': 'text-gray-600 bg-gray-100',
    'ARCHIVEE': 'text-gray-600 bg-gray-100'
  }
  return colors[status] || 'text-gray-600 bg-gray-100'
} 