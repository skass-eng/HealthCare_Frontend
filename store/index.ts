import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { apiUnified } from '@/lib/api-unified'

// Types pour l'état
export interface Plainte {
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
}

export interface SuggestionIA {
  id: number
  contenu: string
  score_confiance?: number
  date_generation: string
  modele_utilise?: string
  est_approuve: boolean
  est_utilise: boolean
  type: 'classification' | 'contact' | 'reponse' | 'action' | 'mots_cles' | 'priorite'
}

export interface ServiceSuggestion {
  service: string
  total_suggestions: number
  plaintes_analysées: number
  suggestions_par_type: {
    classification: SuggestionIA[]
    contact: SuggestionIA[]
    reponse: SuggestionIA[]
    action: SuggestionIA[]
    mots_cles: SuggestionIA[]
    priorite: SuggestionIA[]
  }
  types_disponibles: string[]
}

export interface Statistiques {
  // Statistiques principales pour les cartes
  nouvelles_plaintes: number
  plaintes_en_attente: number
  plaintes_en_retard: number
  en_cours_traitement: number
  traitees_ce_mois: number
  satisfaction_moyenne: number
  
  // Progressions et métriques
  progression: {
    nouvelles_plaintes: string
    plaintes_en_attente: string
    plaintes_en_retard: string
    en_cours_traitement: string
    traitees_ce_mois: string
    satisfaction_moyenne: string
  }
  
  // Statistiques détaillées
  statistiques_detaillees: {
    plaintes: {
      total: number
      en_attente: number
      en_cours: number
      traitees_mois: number
      nouvelles_7_jours: number
    }
    fichiers: {
      total: number
      en_attente_traitement: number
      traites: number
      traites_aujourd_hui: number
      taux_traitement_pct: number
    }
    ia_performance: {
      total_suggestions: number
      suggestions_approuvees: number
      suggestions_utilisees: number
      taux_approbation_pct: number
      efficacite_ia: string
    }
  }
  
  // Répartitions
  repartitions: {
    par_services: Array<{ service: string; count: number }>
    par_priorites: Array<{ priorite: string; count: number }>
    par_types_fichiers: Array<{ type: string; count: number }>
  }
  
  // Alertes
  alertes: {
    fichiers_en_attente_critique: boolean
    plaintes_urgentes: boolean
    performance_ia_faible: boolean
    satisfaction_faible: boolean
  }
  
  // Timestamp
  derniere_mise_a_jour: string
}

export interface Tendances {
  plaintes_par_jour: { date: string; count: number }[]
  plaintes_par_service: { service: string; count: number }[]
  satisfaction_trend: { date: string; score: number }[]
  priorite_distribution: { priorite: string; count: number }[]
}

// Interface du store
interface AppState {
  // État de chargement
  loading: {
    stats: boolean
    plaintes: boolean
    suggestions: boolean
    tendances: boolean
    processing: boolean
  }
  
  // Erreurs
  errors: {
    stats: string | null
    plaintes: string | null
    suggestions: string | null
    tendances: string | null
    processing: string | null
  }
  
  // Données principales
  statistiques: Statistiques | null
  plaintes: {
    en_cours: Plainte[]
    traitees: Plainte[]
    en_attente: Plainte[]
    toutes: Plainte[]
  }
  suggestions: {
    par_service: ServiceSuggestion[]
    total_services: number
    total_suggestions: number
  }
  tendances: Tendances | null
  
  // Pagination
  pagination: {
    en_cours: { page: number; total: number; limit: number }
    traitees: { page: number; total: number; limit: number }
    en_attente: { page: number; total: number; limit: number }
  }
  
  // UI State
  ui: {
    selectedService: string
    showServiceSelector: boolean
    showGlobalServiceSelector: boolean
    expandedServices: string[]
    activeTab: 'improvements' | 'suggestions' | 'trends'
    isPlaintePanelOpen: boolean
    
    // Panels globaux
    panels: {
      serviceConfig: {
        isOpen: boolean
        editingService: any | null
        organisationId: number | null | undefined
      }
      userConfig: {
        isOpen: boolean
        editingUser: any | null
        organisationId: number | null | undefined
      }
      exportModal: {
        isOpen: boolean
      }
      plainteModal: {
        isOpen: boolean
      }
    }
  }
  
  // Notifications
  notifications: {
    items: Array<{
      id: string
      type: 'success' | 'error'
      message: string
      duration?: number
    }>
  }
  
  // Actions
  actions: {
    // Statistiques
    fetchStats: () => Promise<void>
    
    // Plaintes
    fetchPlaintesEnCours: (page?: number, limit?: number) => Promise<void>
    fetchPlaintesTraitees: (page?: number, limit?: number) => Promise<void>
    fetchPlaintesEnAttente: (page?: number, limit?: number) => Promise<void>
    fetchAllPlaintes: () => Promise<void>
    
    // Suggestions IA
    fetchSuggestionsParService: () => Promise<void>
    processAllFiles: () => Promise<void>
    processService: (serviceName: string) => Promise<void>
    
    // Tendances
    fetchTendances: (periode?: string) => Promise<void>
    
    // UI Actions
    setSelectedService: (service: string) => void
    setShowServiceSelector: (show: boolean) => void
    setShowGlobalServiceSelector: (show: boolean) => void
    toggleServiceExpansion: (serviceName: string) => void
    setActiveTab: (tab: 'improvements' | 'suggestions' | 'trends') => void
    openPlaintePanel: () => void
    closePlaintePanel: () => void
    
    // Panels globaux
    openServiceConfigPanel: (editingService?: any, organisationId?: number) => void
    closeServiceConfigPanel: () => void
    openUserConfigPanel: (editingUser?: any, organisationId?: number) => void
    closeUserConfigPanel: () => void
    closeAllPanels: () => void
    
    // Modals globaux
    openExportModal: () => void
    closeExportModal: () => void
    openPlainteModal: () => void
    closePlainteModal: () => void
    
    // Utilitaires
    clearErrors: () => void
    setLoading: (key: keyof AppState['loading'], value: boolean) => void
    setError: (key: keyof AppState['errors'], error: string | null) => void
    
    // Notifications
    showNotification: (type: 'success' | 'error', message: string, duration?: number) => void
    removeNotification: (id: string) => void
  }
}

// Store principal
export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set, get) => ({
        // État initial
        loading: {
          stats: false,
          plaintes: false,
          suggestions: false,
          tendances: false,
          processing: false
        },
        
        errors: {
          stats: null,
          plaintes: null,
          suggestions: null,
          tendances: null,
          processing: null
        },
        
        statistiques: null,
        plaintes: {
          en_cours: [],
          traitees: [],
          en_attente: [],
          toutes: []
        },
        suggestions: {
          par_service: [],
          total_services: 0,
          total_suggestions: 0
        },
        tendances: null,
        
        pagination: {
          en_cours: { page: 1, total: 0, limit: 10 },
          traitees: { page: 1, total: 0, limit: 10 },
          en_attente: { page: 1, total: 0, limit: 10 }
        },
        
        ui: {
          selectedService: '',
          showServiceSelector: false,
          showGlobalServiceSelector: false,
          expandedServices: [],
          activeTab: 'improvements',
          isPlaintePanelOpen: false,
          
          // Panels globaux
          panels: {
            serviceConfig: {
              isOpen: false,
              editingService: null,
              organisationId: null
            },
            userConfig: {
              isOpen: false,
              editingUser: null,
              organisationId: null
            },
            exportModal: {
              isOpen: false
            },
            plainteModal: {
              isOpen: false
            }
          }
        },
        
        notifications: {
          items: []
        },
        
        // Actions
        actions: {
          // Statistiques
          fetchStats: async () => {
            // Éviter les appels multiples si déjà en cours
            const currentState = get()
            if (currentState.loading.stats) {
              console.log('⏳ fetchStats déjà en cours, ignoré')
              return
            }
            console.log('🚀 fetchStats: Début de la récupération des statistiques')
            set(state => ({ 
              loading: { ...state.loading, stats: true },
              errors: { ...state.errors, stats: null }
            }))
            
            try {
              console.log('📡 fetchStats: Appel de l\'API...')
              const data = await apiUnified.getStatistiques()
              console.log('📊 Données reçues de l\'API Unifiée:', data)
              
              // Les données de l'API unifiée sont déjà dans le bon format
              console.log('📊 Données pour le store:', data)
              console.log('✅ fetchStats: Mise à jour du store avec les données')
              set({ statistiques: data as unknown as Statistiques })
            } catch (error) {
              console.error('❌ fetchStats: Erreur lors de la récupération:', error)
              set(state => ({ 
                errors: { ...state.errors, stats: error instanceof Error ? error.message : 'Erreur inconnue' }
              }))
            } finally {
              console.log('🏁 fetchStats: Fin de la récupération')
              set(state => ({ loading: { ...state.loading, stats: false } }))
            }
          },
          
          // Plaintes
          fetchPlaintesEnCours: async (page = 1, limit = 10) => {
            set(state => ({ 
              loading: { ...state.loading, plaintes: true },
              errors: { ...state.errors, plaintes: null }
            }))
            
            try {
              const data = await apiUnified.getPlaintesEnCours()
              
              set(state => ({
                plaintes: { ...state.plaintes, en_cours: data.plaintes },
                pagination: { 
                  ...state.pagination, 
                  en_cours: { page, total: data.total, limit } 
                }
              }))
            } catch (error) {
              set(state => ({ 
                errors: { ...state.errors, plaintes: error instanceof Error ? error.message : 'Erreur inconnue' }
              }))
            } finally {
              set(state => ({ loading: { ...state.loading, plaintes: false } }))
            }
          },
          
          fetchPlaintesTraitees: async (page = 1, limit = 10) => {
            set(state => ({ 
              loading: { ...state.loading, plaintes: true },
              errors: { ...state.errors, plaintes: null }
            }))
            
            try {
              const data = await apiUnified.getPlaintesTraitees()
              
              set(state => ({
                plaintes: { ...state.plaintes, traitees: data.plaintes },
                pagination: { 
                  ...state.pagination, 
                  traitees: { page, total: data.total, limit } 
                }
              }))
            } catch (error) {
              set(state => ({ 
                errors: { ...state.errors, plaintes: error instanceof Error ? error.message : 'Erreur inconnue' }
              }))
            } finally {
              set(state => ({ loading: { ...state.loading, plaintes: false } }))
            }
          },
          
          fetchPlaintesEnAttente: async (page = 1, limit = 10) => {
            set(state => ({ 
              loading: { ...state.loading, plaintes: true },
              errors: { ...state.errors, plaintes: null }
            }))
            
            try {
              const data = await apiUnified.getPlaintesEnAttente()
              
              set(state => ({
                plaintes: { ...state.plaintes, en_attente: data.plaintes },
                pagination: { 
                  ...state.pagination, 
                  en_attente: { page, total: data.total, limit } 
                }
              }))
            } catch (error) {
              set(state => ({ 
                errors: { ...state.errors, plaintes: error instanceof Error ? error.message : 'Erreur inconnue' }
              }))
            } finally {
              set(state => ({ loading: { ...state.loading, plaintes: false } }))
            }
          },
          
          fetchAllPlaintes: async () => {
            set(state => ({ 
              loading: { ...state.loading, plaintes: true },
              errors: { ...state.errors, plaintes: null }
            }))
            
            try {
              const data = await apiUnified.getPlaintes()
              
              // Adapter les données de l'API unifiée au format du store
              const adaptedPlaintes = (data.plaintes || []).map((p: any) => ({
                id: p.id,
                plainte_id: p.plainte_id,
                titre: p.titre,
                contenu: p.description || '',
                service: p.service || '',
                priorite: p.priorite || '',
                statut: p.status || '',
                date_creation: p.date_creation,
                date_limite_reponse: p.date_limite_reponse,
                nom_plaignant: p.nom_plaignant,
                email_plaignant: p.email_plaignant,
                telephone_plaignant: p.telephone_plaignant
              }))
              
              set(state => ({
                plaintes: { ...state.plaintes, toutes: adaptedPlaintes }
              }))
            } catch (error) {
              set(state => ({ 
                errors: { ...state.errors, plaintes: error instanceof Error ? error.message : 'Erreur inconnue' }
              }))
            } finally {
              set(state => ({ loading: { ...state.loading, plaintes: false } }))
            }
          },
          
          // Suggestions IA
          fetchSuggestionsParService: async () => {
            const state = get()
            // Éviter les appels multiples si déjà en cours de chargement ou si déjà des données
            if (state.loading.suggestions || state.suggestions.par_service.length > 0) {
              console.log('Suggestions déjà chargées ou en cours, skip')
              return
            }
            
            console.log('Chargement des suggestions...')
            set(state => ({ 
              loading: { ...state.loading, suggestions: true },
              errors: { ...state.errors, suggestions: null }
            }))
            
            try {
              const data = await apiUnified.getSuggestionsIA()
              
              // Adapter les données au format attendu par le store
              const adaptedServices = (data.suggestions || []).map((s: any) => ({
                service: s.type || 'Général',
                total_suggestions: 1,
                plaintes_analysées: 1,
                suggestions_par_type: {
                  classification: s.type === 'classification' ? [s] : [],
                  contact: s.type === 'contact' ? [s] : [],
                  reponse: s.type === 'reponse' ? [s] : [],
                  action: s.type === 'action' ? [s] : [],
                  mots_cles: s.type === 'mots_cles' ? [s] : [],
                  priorite: s.type === 'priorite' ? [s] : []
                },
                types_disponibles: [s.type]
              }))
              
              set({
                suggestions: {
                  par_service: adaptedServices,
                  total_services: adaptedServices.length,
                  total_suggestions: data.total || adaptedServices.length
                }
              })
              console.log('Suggestions chargées avec succès')
            } catch (error) {
              set(state => ({ 
                errors: { ...state.errors, suggestions: error instanceof Error ? error.message : 'Erreur inconnue' }
              }))
            } finally {
              set(state => ({ loading: { ...state.loading, suggestions: false } }))
            }
          },
          
          processAllFiles: async () => {
            set(state => ({ 
              loading: { ...state.loading, processing: true },
              errors: { ...state.errors, processing: null }
            }))
            
            try {
              const response = await fetch('/api/process-files', { method: 'POST' })
              const data = await response.json()
              
              if (!response.ok) throw new Error(data.detail || 'Erreur lors du traitement')
              
              // Recharger les suggestions après traitement
              await get().actions.fetchSuggestionsParService()
            } catch (error) {
              set(state => ({ 
                errors: { ...state.errors, processing: error instanceof Error ? error.message : 'Erreur inconnue' }
              }))
            } finally {
              set(state => ({ loading: { ...state.loading, processing: false } }))
            }
          },
          
          processService: async (serviceName: string) => {
            set(state => ({ 
              loading: { ...state.loading, processing: true },
              errors: { ...state.errors, processing: null },
              ui: { ...state.ui, selectedService: serviceName }
            }))
            
            try {
              const response = await fetch('/api/process-service', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ service: serviceName })
              })
              const data = await response.json()
              
              if (!response.ok) throw new Error(data.detail || 'Erreur lors du traitement du service')
              
              // Recharger les suggestions après traitement
              await get().actions.fetchSuggestionsParService()
              set(state => ({ ui: { ...state.ui, showServiceSelector: false, selectedService: '' } }))
            } catch (error) {
              set(state => ({ 
                errors: { ...state.errors, processing: error instanceof Error ? error.message : 'Erreur inconnue' }
              }))
            } finally {
              set(state => ({ 
                loading: { ...state.loading, processing: false },
                ui: { ...state.ui, selectedService: '' }
              }))
            }
          },
          
          // Tendances
          fetchTendances: async (periode = '7j') => {
            set(state => ({ 
              loading: { ...state.loading, tendances: true },
              errors: { ...state.errors, tendances: null }
            }))
            
            try {
              const response = await fetch(`/api/stats/tendances?periode=${periode}`)
              const data = await response.json()
              
              if (!response.ok) throw new Error(data.detail || 'Erreur lors du chargement des tendances')
              
              set({ tendances: data })
            } catch (error) {
              set(state => ({ 
                errors: { ...state.errors, tendances: error instanceof Error ? error.message : 'Erreur inconnue' }
              }))
            } finally {
              set(state => ({ loading: { ...state.loading, tendances: false } }))
            }
          },
          
          // UI Actions
          setSelectedService: (service: string) => {
            set(state => ({ ui: { ...state.ui, selectedService: service } }))
          },
          
          setShowServiceSelector: (show: boolean) => {
            set(state => ({ ui: { ...state.ui, showServiceSelector: show } }))
          },
          
          setShowGlobalServiceSelector: (show: boolean) => {
            set(state => ({ ui: { ...state.ui, showGlobalServiceSelector: show } }))
          },
          
          toggleServiceExpansion: (serviceName: string) => {
            set(state => {
              const newExpanded = state.ui.expandedServices.includes(serviceName)
                ? state.ui.expandedServices.filter(s => s !== serviceName)
                : [...state.ui.expandedServices, serviceName]
              return { ui: { ...state.ui, expandedServices: newExpanded } }
            })
          },
          
          setActiveTab: (tab: 'improvements' | 'suggestions' | 'trends') => {
            set(state => ({ ui: { ...state.ui, activeTab: tab } }))
          },
          openPlaintePanel: () => {
            set(state => ({ ui: { ...state.ui, isPlaintePanelOpen: true } }))
          },
          closePlaintePanel: () => {
            set(state => ({ ui: { ...state.ui, isPlaintePanelOpen: false } }))
          },
          
          // Panels globaux
          openServiceConfigPanel: (editingService = null, organisationId = undefined) => {
            set(state => ({ 
              ui: { 
                ...state.ui, 
                panels: {
                  ...state.ui.panels,
                  serviceConfig: {
                    isOpen: true,
                    editingService,
                    organisationId
                  }
                }
              } 
            }))
          },
          
          closeServiceConfigPanel: () => {
            set(state => ({ 
              ui: { 
                ...state.ui, 
                panels: {
                  ...state.ui.panels,
                  serviceConfig: {
                    isOpen: false,
                    editingService: null,
                    organisationId: null
                  }
                }
              } 
            }))
          },
          
          openUserConfigPanel: (editingUser = null, organisationId = undefined) => {
            set(state => ({ 
              ui: { 
                ...state.ui, 
                panels: {
                  ...state.ui.panels,
                  userConfig: {
                    isOpen: true,
                    editingUser,
                    organisationId
                  }
                }
              } 
            }))
          },
          
          closeUserConfigPanel: () => {
            set(state => ({ 
              ui: { 
                ...state.ui, 
                panels: {
                  ...state.ui.panels,
                  userConfig: {
                    isOpen: false,
                    editingUser: null,
                    organisationId: null
                  }
                }
              } 
            }))
          },
          
          closeAllPanels: () => {
            set(state => ({ 
              ui: { 
                ...state.ui, 
                panels: {
                  serviceConfig: {
                    isOpen: false,
                    editingService: null,
                    organisationId: null
                  },
                  userConfig: {
                    isOpen: false,
                    editingUser: null,
                    organisationId: null
                  },
                  exportModal: {
                    isOpen: false
                  },
                  plainteModal: {
                    isOpen: false
                  }
                }
              } 
            }))
          },
          
          // Modals globaux
          openExportModal: () => {
            set(state => ({ 
              ui: { 
                ...state.ui, 
                panels: {
                  ...state.ui.panels,
                  exportModal: {
                    isOpen: true
                  }
                }
              } 
            }))
          },
          
          closeExportModal: () => {
            set(state => ({ 
              ui: { 
                ...state.ui, 
                panels: {
                  ...state.ui.panels,
                  exportModal: {
                    isOpen: false
                  }
                }
              } 
            }))
          },
          
          openPlainteModal: () => {
            set(state => ({ 
              ui: { 
                ...state.ui, 
                panels: {
                  ...state.ui.panels,
                  plainteModal: {
                    isOpen: true
                  }
                }
              } 
            }))
          },
          
          closePlainteModal: () => {
            set(state => ({ 
              ui: { 
                ...state.ui, 
                panels: {
                  ...state.ui.panels,
                  plainteModal: {
                    isOpen: false
                  }
                }
              } 
            }))
          },
          
          // Utilitaires
          clearErrors: () => {
            set({
              errors: {
                stats: null,
                plaintes: null,
                suggestions: null,
                tendances: null,
                processing: null
              }
            })
          },
          
          setLoading: (key: keyof AppState['loading'], value: boolean) => {
            set(state => ({ 
              loading: { ...state.loading, [key]: value } 
            }))
          },
          
          setError: (key: keyof AppState['errors'], error: string | null) => {
            set(state => ({ 
              errors: { ...state.errors, [key]: error } 
            }))
          },
          
          // Notifications
          showNotification: (type: 'success' | 'error', message: string, duration = 5000) => {
            const id = Date.now().toString()
            const newNotification = { id, type, message, duration }
            
            set(state => ({
              notifications: {
                items: [...state.notifications.items, newNotification]
              }
            }))
            
            // Auto-remove after duration
            setTimeout(() => {
              get().actions.removeNotification(id)
            }, duration)
          },
          
          removeNotification: (id: string) => {
            set(state => ({
              notifications: {
                items: state.notifications.items.filter(notification => notification.id !== id)
              }
            }))
          }
        }
      }),
      {
        name: 'healthcare-ai-store',
        partialize: (state) => ({
          ui: state.ui,
          pagination: state.pagination
        })
      }
    ),
    {
      name: 'healthcare-ai-store'
    }
  )
) 