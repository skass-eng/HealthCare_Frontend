'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Tabs,
  Tab,
  CircularProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Alert,
  Tooltip,
  LinearProgress,
  IconButton,
  Snackbar
} from '@mui/material'
import {
  Lightbulb as LightBulbIcon,
  BarChart as ChartBarIcon,
  Bolt as BoltIcon,
  Memory as CpuChipIcon,
  TrendingUp as ArrowTrendingUpIcon,
  Description as DocumentTextIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  AccessTime as ClockIcon,
  Star as StarIcon,
  Business as BusinessIcon,
  Analytics as AnalyticsIcon,
  AutoAwesome as AutoAwesomeIcon
} from '@mui/icons-material'
import apiService from '@/lib/api'
import PlotlyChart from '@/components/PlotlyChart'
import wsService from '@/lib/websocket'

// Types pour les données
interface ComplaintsSummary {
  total: number
  in_progress: number
  resolved: number
  avg_resolution_time_seconds: number
  nouvelles: number
  filters_applied: {
    from_date: string | null
    to_date: string | null
    status: string | null
  }
  timestamp: string
}

interface TrendData {
  date: string
  total: number
  recu: number
  en_cours: number
  traite: number
  cloture: number
}

interface TrendsResponse {
  period: {
    start_date: string
    end_date: string
    days: number
  }
  trends: TrendData[]
  timestamp: string
}

interface ServiceKPI {
  id: number
  nom: string
  code_service: string
  description?: string
  est_actif: boolean
  nombre_plaintes_total: number
  nombre_plaintes_resolues: number
  temps_moyen_resolution: number
  taux_satisfaction: number
}

interface Suggestion {
  id: number
  titre: string
  description: string
  priorite: 'haute' | 'moyenne' | 'basse'
  type: 'performance' | 'processus' | 'satisfaction' | 'ressources'
  service?: string
  impact_estime: string
  action_recommandee: string
}

// Types pour l'analyse IA avancée - Nouvelle structure
interface CauseIdentifiee {
  cause: string
  frequence: number | string
  gravite: string  // Assouplir le type pour compatibilité API
  exemples: string[]
}

interface AnalyseService {
  service: string
  nombre_plaintes: number
  causes_identifiees: CauseIdentifiee[]
  problemes_recurrents: string[]
  sentiment_general: string  // Assouplir le type pour compatibilité API
  recommandations: string[]
  raw_response?: string
}

interface CauseGlobale {
  service: string
  cause: string
  gravite: string
  frequence: number | string
}

interface AIAnalysisResult {
  total_plaintes_analysees: number
  nombre_services: number
  analyses_par_service: AnalyseService[]
  causes_globales: CauseGlobale[]
  services_critiques: string[]
  timestamp: string
  model_used: string
}

// Interface pour le suivi de la tâche d'analyse
interface AIAnalysisTask {
  task_id: string
  status: 'pending' | 'running' | 'completed' | 'error'
  progress: number
  current_step: string
  total_plaintes: number
  total_services: number
  services_analysed: number
  started_at: string
  error: string | null
}

interface AIStatus {
  ollama_available: boolean
  models_available: string[]
  recommended_model: string
  model_ready: boolean
  error?: string
}

// --------------------------------------------------------------------------- //
// Helpers défensifs : le schéma JSON renvoyé par /analyze/latest peut varier
// (objets imbriqués au lieu de chaînes). On normalise tout pour éviter
// l'affichage "[object Object]" et les listes vides non explicitées.
// --------------------------------------------------------------------------- //
const toDisplayText = (value: unknown, ...keys: string[]): string => {
  if (value === null || value === undefined) return ''
  if (typeof value === 'string') return value
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  if (typeof value === 'object') {
    const obj = value as Record<string, unknown>
    const fallbackKeys = keys.length > 0
      ? keys
      : ['cause', 'libelle', 'label', 'service', 'nom', 'name', 'titre', 'description', 'value']
    for (const key of fallbackKeys) {
      const v = obj[key]
      if (typeof v === 'string' && v.trim() !== '') return v
      if (typeof v === 'number' || typeof v === 'boolean') return String(v)
    }
    return ''
  }
  return String(value)
}

// Nom d'un service critique (string ou objet {service|nom})
const serviceCritiqueLabel = (item: unknown): string =>
  toDisplayText(item, 'service', 'nom', 'name', 'libelle', 'label') || 'Service'

// Fonction pour générer des suggestions basées sur les données
const generateSuggestions = (
  summary: ComplaintsSummary | null,
  services: ServiceKPI[],
  trends: TrendData[]
): Suggestion[] => {
  const suggestions: Suggestion[] = []
  let suggestionId = 1

  if (!summary) return suggestions

  // Analyse du temps de résolution moyen
  const avgResolutionDays = summary.avg_resolution_time_seconds / 86400
  if (avgResolutionDays > 7) {
    suggestions.push({
      id: suggestionId++,
      titre: 'Réduire le temps de traitement',
      description: `Le temps moyen de résolution est de ${avgResolutionDays.toFixed(1)} jours, ce qui est supérieur à l'objectif de 7 jours.`,
      priorite: avgResolutionDays > 14 ? 'haute' : 'moyenne',
      type: 'performance',
      impact_estime: 'Amélioration de 30% de la satisfaction client',
      action_recommandee: 'Mettre en place un système de priorisation automatique et d\'escalade'
    })
  }

  // Analyse du taux de résolution
  if (summary.total > 0) {
    const tauxResolution = (summary.resolved / summary.total) * 100
    if (tauxResolution < 70) {
      suggestions.push({
        id: suggestionId++,
        titre: 'Améliorer le taux de résolution',
        description: `Seulement ${tauxResolution.toFixed(1)}% des plaintes sont résolues. Objectif: 85%`,
        priorite: tauxResolution < 50 ? 'haute' : 'moyenne',
        type: 'processus',
        impact_estime: 'Réduction de 40% des plaintes récurrentes',
        action_recommandee: 'Former les équipes sur les procédures de résolution et suivre les cas en attente'
      })
    }
  }

  // Analyse des plaintes en cours
  if (summary.in_progress > summary.resolved * 0.5) {
    suggestions.push({
      id: suggestionId++,
      titre: 'Accélérer le traitement des cas en cours',
      description: `${summary.in_progress} plaintes sont actuellement en cours de traitement.`,
      priorite: 'moyenne',
      type: 'ressources',
      impact_estime: 'Réduction du backlog de 50%',
      action_recommandee: 'Allouer des ressources supplémentaires ou redistribuer la charge de travail'
    })
  }

  // Analyse par service
  services.forEach((service) => {
    if (service.nombre_plaintes_total > 10 && service.taux_satisfaction < 50) {
      suggestions.push({
        id: suggestionId++,
        titre: `Améliorer la satisfaction - ${service.nom}`,
        description: `Le taux de satisfaction du service ${service.nom} est de ${service.taux_satisfaction.toFixed(1)}%`,
        priorite: 'haute',
        type: 'satisfaction',
        service: service.nom,
        impact_estime: 'Amélioration de l\'image du service',
        action_recommandee: 'Audit qualité et formation spécifique pour l\'équipe'
      })
    }

    if (service.temps_moyen_resolution > 10) {
      suggestions.push({
        id: suggestionId++,
        titre: `Optimiser les délais - ${service.nom}`,
        description: `Temps moyen de résolution de ${service.temps_moyen_resolution.toFixed(1)} jours pour ${service.nom}`,
        priorite: 'moyenne',
        type: 'performance',
        service: service.nom,
        impact_estime: 'Gain de productivité de 25%',
        action_recommandee: 'Analyser les goulots d\'étranglement et automatiser les tâches répétitives'
      })
    }
  })

  // Analyse des tendances
  if (trends.length > 7) {
    const lastWeek = trends.slice(-7)
    const previousWeek = trends.slice(-14, -7)
    
    const lastWeekTotal = lastWeek.reduce((sum, t) => sum + t.total, 0)
    const previousWeekTotal = previousWeek.reduce((sum, t) => sum + t.total, 0)
    
    if (previousWeekTotal > 0 && lastWeekTotal > previousWeekTotal * 1.2) {
      suggestions.push({
        id: suggestionId++,
        titre: 'Augmentation des plaintes détectée',
        description: `Les plaintes ont augmenté de ${(((lastWeekTotal - previousWeekTotal) / previousWeekTotal) * 100).toFixed(0)}% cette semaine.`,
        priorite: 'haute',
        type: 'processus',
        impact_estime: 'Prévention d\'une crise potentielle',
        action_recommandee: 'Identifier la cause racine et mettre en place des actions préventives'
      })
    }
  }

  // Ajout de suggestions générales si peu de données
  if (suggestions.length === 0) {
    suggestions.push({
      id: suggestionId++,
      titre: 'Mettre en place un suivi proactif',
      description: 'Les indicateurs actuels sont satisfaisants. Maintenir la qualité de service.',
      priorite: 'basse',
      type: 'processus',
      impact_estime: 'Maintien des bonnes performances',
      action_recommandee: 'Continuer le suivi régulier et anticiper les besoins futurs'
    })
  }

  return suggestions
}

export default function AmeliorationsPage() {
  console.log('🚀 Page Améliorations chargée !')
  
  // États
  const [activeTab, setActiveTab] = useState(0)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Données
  const [summary, setSummary] = useState<ComplaintsSummary | null>(null)
  const [trends, setTrends] = useState<TrendsResponse | null>(null)
  const [services, setServices] = useState<ServiceKPI[]>([])
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [selectedPeriod, setSelectedPeriod] = useState(30)
  
  // États pour l'analyse IA avancée
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisResult | null>(null)
  const [aiStatus, setAiStatus] = useState<AIStatus | null>(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)
  
  // États pour le suivi de la tâche asynchrone
  const [aiTask, setAiTask] = useState<AIAnalysisTask | null>(null)
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null)
  
  // État pour les notifications et WebSocket
  const [notification, setNotification] = useState<{open: boolean, message: string, severity: 'success' | 'info' | 'warning' | 'error'}>({
    open: false,
    message: '',
    severity: 'info'
  })
  const taskIdRef = useRef<string | null>(null)

  // Charger toutes les données
  const loadData = useCallback(async (showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }
      setError(null)

      // Charger les données en parallèle
      const [summaryRes, trendsRes, servicesRes] = await Promise.all([
        apiService.getComplaintsSummary(),
        apiService.getComplaintsTrends(selectedPeriod),
        apiService.getServicesWithKPIs(true)
      ])

      if (summaryRes.success && summaryRes.data) {
        setSummary(summaryRes.data)
      }

      if (trendsRes.success && trendsRes.data) {
        setTrends(trendsRes.data)
      }

      if (servicesRes.success && servicesRes.data) {
        setServices(servicesRes.data)
      }

      // Générer des suggestions basées sur les données
      const newSuggestions = generateSuggestions(
        summaryRes.data,
        servicesRes.data || [],
        trendsRes.data?.trends || []
      )
      setSuggestions(newSuggestions)

      // Charger la dernière analyse IA si disponible
      try {
        const latestAnalysis = await apiService.getLatestAIAnalysis()
        if (latestAnalysis.success && latestAnalysis.data) {
          setAiAnalysis(latestAnalysis.data)
          console.log('📊 Dernière analyse IA chargée:', latestAnalysis.message)
        }
      } catch (aiErr) {
        console.warn('Pas d\'analyse IA disponible:', aiErr)
      }

    } catch (err: any) {
      console.error('Erreur chargement données:', err)
      setError(err.message || 'Erreur lors du chargement des données')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [selectedPeriod])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Recalculer les KPIs
  const handleRecalculateKPIs = async () => {
    try {
      setRefreshing(true)
      const result = await apiService.recalculateAllKPIs()
      if (result.success) {
        await loadData(true)
      }
    } catch (err) {
      console.error('Erreur recalcul KPIs:', err)
    } finally {
      setRefreshing(false)
    }
  }

  // Vérifier le statut de l'IA
  const checkAIStatus = useCallback(async () => {
    try {
      const result = await apiService.checkAIStatus()
      if (result.success && result.data) {
        setAiStatus(result.data)
      }
    } catch (err) {
      console.error('Erreur vérification statut IA:', err)
    }
  }, [])

  // Polling du statut de la tâche d'analyse
  const pollTaskStatus = useCallback(async (taskId: string) => {
    try {
      const statusResult = await apiService.getAIAnalysisStatus(taskId)
      
      if (statusResult.success && statusResult.data) {
        const taskData = statusResult.data
        
        setAiTask({
          task_id: taskData.task_id,
          status: taskData.status,
          progress: taskData.progress,
          current_step: taskData.current_step,
          total_plaintes: taskData.total_plaintes,
          total_services: taskData.total_services,
          services_analysed: taskData.services_analysed,
          started_at: taskData.started_at,
          error: taskData.error
        })
        
        // Si terminé avec succès, récupérer le résultat
        if (taskData.status === 'completed' && taskData.has_result) {
          const resultResponse = await apiService.getAIAnalysisResult(taskId)
          if (resultResponse.success && resultResponse.data) {
            setAiAnalysis(resultResponse.data)
            setAiLoading(false)
            setAiTask(null)
            // Nettoyer l'intervalle
            if (pollingInterval) {
              clearInterval(pollingInterval)
              setPollingInterval(null)
            }
            // Notification de succès (optionnel)
            console.log('✅ Analyse IA terminée!')
          }
        }
        
        // Si erreur, arrêter le polling
        if (taskData.status === 'error') {
          setAiError(taskData.error || 'Erreur lors de l\'analyse')
          setAiLoading(false)
          if (pollingInterval) {
            clearInterval(pollingInterval)
            setPollingInterval(null)
          }
        }
      }
    } catch (err) {
      console.error('Erreur polling statut:', err)
    }
  }, [pollingInterval])

  // Lancer l'analyse IA avancée (version asynchrone)
  const runAIAnalysis = async () => {
    try {
      setAiLoading(true)
      setAiError(null)
      setAiAnalysis(null)
      setActiveTab(3) // Aller directement sur l'onglet analyse
      
      // Démarrer l'analyse asynchrone
      const startResult = await apiService.startAIAnalysis()
      
      if (!startResult.success) {
        setAiError(startResult.message || 'Erreur lors du démarrage de l\'analyse')
        setAiLoading(false)
        return
      }
      
      const taskId = startResult.data?.task_id
      
      // Si pas de task_id, c'est qu'il n'y a pas de plaintes (résultat immédiat)
      if (!taskId && startResult.data?.data) {
        setAiAnalysis(startResult.data.data)
        setAiLoading(false)
        return
      }
      
      if (!taskId) {
        setAiError('Aucun ID de tâche retourné')
        setAiLoading(false)
        return
      }
      
      // Initialiser le suivi de la tâche
      setAiTask({
        task_id: taskId,
        status: 'pending',
        progress: 0,
        current_step: 'Initialisation...',
        total_plaintes: startResult.data?.total_plaintes || 0,
        total_services: startResult.data?.total_services || 0,
        services_analysed: 0,
        started_at: new Date().toISOString(),
        error: null
      })
      
      // Stocker le taskId pour les WebSocket listeners
      taskIdRef.current = taskId
      
      // S'abonner aux événements WebSocket pour cette tâche
      wsService.subscribeToAIAnalysis(taskId)
      
      // Démarrer le polling toutes les 3 secondes (comme fallback si WebSocket ne fonctionne pas)
      const interval = setInterval(() => {
        pollTaskStatus(taskId)
      }, 3000)
      
      setPollingInterval(interval)
      
      // Faire un premier poll immédiat
      pollTaskStatus(taskId)
      
      // Notification que l'analyse démarre
      setNotification({
        open: true,
        message: `🧠 Analyse IA démarrée - ${startResult.data?.total_plaintes || 0} plaintes à analyser`,
        severity: 'info'
      })
      
    } catch (err: any) {
      console.error('Erreur analyse IA:', err)
      setAiError(err.message || 'Erreur lors de l\'analyse IA')
      setAiLoading(false)
    }
  }

  // Nettoyer l'intervalle au démontage du composant
  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval)
      }
    }
  }, [pollingInterval])

  // Vérifier le statut IA au chargement
  useEffect(() => {
    checkAIStatus()
  }, [checkAIStatus])

  // Setup WebSocket listeners pour les notifications d'analyse IA
  useEffect(() => {
    // Connecter au WebSocket si pas déjà fait
    if (!wsService.isConnected()) {
      wsService.connect().catch(() => {
        console.warn('⚠️ WebSocket non disponible, mode polling activé')
      })
    }

    // Écouter les événements de progression
    wsService.onAIAnalysisProgress((data) => {
      console.log('🔄 [WS] Événement ai_analysis_progress reçu:', data)
      if (taskIdRef.current && data.task_id === taskIdRef.current) {
        setAiTask(prev => prev ? {
          ...prev,
          progress: data.progress,
          current_step: data.current_step,
          services_analysed: data.services_analyzed
        } : null)
      }
    })

    // Écouter la complétion d'analyse
    wsService.onAIAnalysisComplete(async (data) => {
      console.log('✅ [WS] Événement ai_analysis_complete reçu:', data)
      if (taskIdRef.current && data.task_id === taskIdRef.current) {
        // Récupérer les résultats complets
        try {
          const resultResponse = await apiService.getAIAnalysisResult(data.task_id)
          if (resultResponse.success && resultResponse.data) {
            setAiAnalysis(resultResponse.data)
            setAiLoading(false)
            setAiTask(null)
            // Arrêter le polling
            if (pollingInterval) {
              clearInterval(pollingInterval)
              setPollingInterval(null)
            }
            // Notification de succès
            setNotification({
              open: true,
              message: '🎉 Analyse IA terminée avec succès!',
              severity: 'success'
            })
          }
        } catch (err) {
          console.error('Erreur récupération résultats:', err)
        }
        taskIdRef.current = null
      }
    })

    // Écouter les erreurs
    wsService.onAIAnalysisFailed((data) => {
      console.log('❌ [WS] Événement ai_analysis_failed reçu:', data)
      if (taskIdRef.current && data.task_id === taskIdRef.current) {
        setAiError(data.error || 'Erreur lors de l\'analyse')
        setAiLoading(false)
        setAiTask(null)
        if (pollingInterval) {
          clearInterval(pollingInterval)
          setPollingInterval(null)
        }
        setNotification({
          open: true,
          message: `❌ Erreur: ${data.error || 'Analyse échouée'}`,
          severity: 'error'
        })
        taskIdRef.current = null
      }
    })

    return () => {
      // Nettoyer les listeners au démontage
      wsService.cleanupAIAnalysisListeners()
    }
  }, [pollingInterval])

  // Formater le temps en jours/heures
  const formatTime = (seconds: number): string => {
    if (seconds < 3600) {
      return `${Math.round(seconds / 60)} min`
    } else if (seconds < 86400) {
      return `${(seconds / 3600).toFixed(1)} h`
    } else {
      return `${(seconds / 86400).toFixed(1)} j`
    }
  }

  // Obtenir la couleur de priorité
  const getPriorityColor = (priorite: string): 'error' | 'warning' | 'success' => {
    switch (priorite) {
      case 'haute': return 'error'
      case 'moyenne': return 'warning'
      default: return 'success'
    }
  }

  // Obtenir l'icône de type
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'performance': return <BoltIcon sx={{ color: 'warning.main' }} />
      case 'processus': return <AnalyticsIcon sx={{ color: 'info.main' }} />
      case 'satisfaction': return <StarIcon sx={{ color: 'success.main' }} />
      case 'ressources': return <BusinessIcon sx={{ color: 'primary.main' }} />
      default: return <LightBulbIcon sx={{ color: 'secondary.main' }} />
    }
  }

  if (loading) {
    return (
      <Box sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: '#f5f5f7'
      }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={60} sx={{ color: 'primary.main', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            Chargement de l'analyse IA...
          </Typography>
        </Box>
      </Box>
    )
  }

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      background: '#f5f5f7',
      p: 3
    }}>
      <Box sx={{ maxWidth: 1600, mx: 'auto' }}>
        
        {/* Header Section */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Box sx={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 56,
            height: 56,
            background: '#ffffff',
            border: '1px solid #ebebef',
            borderRadius: '12px',
            boxShadow: '0 1px 2px rgba(16, 24, 40, 0.04), 0 1px 3px rgba(16, 24, 40, 0.06)',
            mb: 2
          }}>
            <CpuChipIcon sx={{ fontSize: 28, color: '#0d9488' }} />
          </Box>
          <Typography variant="h4" sx={{ 
            fontWeight: 700, 
            color: '#1d1d1f',
            letterSpacing: '-0.02em',
            mb: 1
          }}>
            IA & Optimisation
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
            Analyse intelligente et suggestions d'amélioration par service
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
            <Box sx={{ 
              width: 8, 
              height: 8, 
              bgcolor: 'success.main', 
              borderRadius: '50%',
              animation: 'pulse 2s infinite'
            }} />
            <Typography variant="body2" color="text.secondary">
              Dernière analyse : {summary?.timestamp ? new Date(summary.timestamp).toLocaleString('fr-FR') : new Date().toLocaleString('fr-FR')}
            </Typography>
            <IconButton 
              size="small" 
              onClick={() => loadData(true)}
              disabled={refreshing}
              sx={{ ml: 1 }}
            >
              <RefreshIcon sx={{ 
                fontSize: 20,
                animation: refreshing ? 'spin 1s linear infinite' : 'none',
                '@keyframes spin': {
                  '0%': { transform: 'rotate(0deg)' },
                  '100%': { transform: 'rotate(360deg)' }
                }
              }} />
            </IconButton>
          </Box>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Refreshing indicator */}
        {refreshing && (
          <LinearProgress sx={{ mb: 2, borderRadius: 1 }} />
        )}

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {[
            { Icon: DocumentTextIcon, number: summary?.total || 0, label: 'Total plaintes', accent: '#1d1d1f', subtext: `${summary?.nouvelles || 0} nouvelles` },
            { Icon: ClockIcon, number: summary?.in_progress || 0, label: 'En cours', accent: '#0d9488', subtext: 'En traitement' },
            { Icon: CheckCircleIcon, number: summary?.resolved || 0, label: 'Résolues', accent: '#059669', subtext: summary?.total ? `${((summary.resolved / summary.total) * 100).toFixed(0)}% du total` : '0%' },
            { Icon: BoltIcon, number: formatTime(summary?.avg_resolution_time_seconds || 0), label: 'Temps moyen', accent: '#b45309', subtext: 'Résolution' }
          ].map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card sx={{
                background: '#ffffff',
                border: '1px solid #ebebef',
                borderRadius: 3,
                boxShadow: '0 1px 2px rgba(16, 24, 40, 0.04), 0 1px 3px rgba(16, 24, 40, 0.06)',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.2s ease',
                '&:hover': { borderColor: '#cbd5e1', transform: 'translateY(-1px)' }
              }}>
                <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: stat.accent, opacity: 0.85 }} />
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{
                      width: 40,
                      height: 40,
                      background: `${stat.accent}14`,
                      border: `1px solid ${stat.accent}33`,
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <stat.Icon sx={{ fontSize: 22, color: stat.accent }} />
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography sx={{ fontSize: '1.6rem', fontWeight: 700, color: stat.accent, lineHeight: 1, letterSpacing: '-0.02em' }}>
                        {stat.number}
                      </Typography>
                      <Typography sx={{ fontSize: '11.5px', color: '#86868b', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', mt: 0.5 }}>
                        {stat.label}
                      </Typography>
                      <Typography sx={{ fontSize: '11px', color: '#86868b', fontWeight: 500, mt: 0.25 }}>
                        {stat.subtext}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Main Content with Tabs */}
        <Card sx={{ 
          borderRadius: 4, 
          boxShadow: '0 1px 2px rgba(16, 24, 40, 0.04), 0 1px 3px rgba(16, 24, 40, 0.06)',
          background: '#ffffff',
          border: '1px solid #ebebef'
        }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3, pt: 2 }}>
            <Tabs 
              value={activeTab} 
              onChange={(_, newValue) => setActiveTab(newValue)}
              sx={{
                '& .MuiTab-root': {
                  fontWeight: 600,
                  textTransform: 'none',
                  minHeight: 48,
                  '&.Mui-selected': { color: 'primary.main' }
                }
              }}
            >
              <Tab 
                icon={<LightBulbIcon sx={{ mr: 1 }} />} 
                label={`Suggestions IA (${suggestions.length})`}
                iconPosition="start"
              />
              <Tab 
                icon={<ArrowTrendingUpIcon sx={{ mr: 1 }} />} 
                label="Tendances"
                iconPosition="start"
              />
              <Tab 
                icon={<BusinessIcon sx={{ mr: 1 }} />} 
                label={`Services KPI (${services.length})`}
                iconPosition="start"
              />
              <Tab 
                icon={<CpuChipIcon sx={{ mr: 1, color: aiAnalysis ? 'success.main' : 'inherit' }} />} 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    Analyse IA Avancée
                    {aiLoading && <CircularProgress size={16} />}
                    {aiAnalysis && <CheckCircleIcon sx={{ fontSize: 16, color: 'success.main' }} />}
                  </Box>
                }
                iconPosition="start"
              />
            </Tabs>
          </Box>

          <CardContent sx={{ p: 4 }}>
            {/* Tab 0: Suggestions IA */}
            {activeTab === 0 && (
              <Box>
                {suggestions.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 6 }}>
                    <AutoAwesomeIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">
                      Aucune suggestion d'amélioration
                    </Typography>
                    <Typography color="text.disabled">
                      Les indicateurs actuels sont satisfaisants
                    </Typography>
                  </Box>
                ) : (
                  <Grid container spacing={3}>
                    {suggestions.map((suggestion) => (
                      <Grid item xs={12} md={6} key={suggestion.id}>
                        <Card sx={{ 
                          borderRadius: 3,
                          border: '1px solid',
                          borderColor: 'divider',
                          transition: 'all 0.3s ease',
                          '&:hover': { 
                            boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                            transform: 'translateY(-2px)'
                          }
                        }}>
                          <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
                              <Box sx={{ 
                                p: 1, 
                                bgcolor: 'grey.100', 
                                borderRadius: 2 
                              }}>
                                {getTypeIcon(suggestion.type)}
                              </Box>
                              <Box sx={{ flex: 1 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                  <Typography variant="subtitle1" fontWeight={600}>
                                    {suggestion.titre}
                                  </Typography>
                                  <Chip 
                                    label={suggestion.priorite}
                                    size="small"
                                    color={getPriorityColor(suggestion.priorite)}
                                    sx={{ textTransform: 'capitalize' }}
                                  />
                                </Box>
                                {suggestion.service && (
                                  <Chip 
                                    label={suggestion.service}
                                    size="small"
                                    variant="outlined"
                                    sx={{ mb: 1 }}
                                  />
                                )}
                              </Box>
                            </Box>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                              {suggestion.description}
                            </Typography>
                            <Box sx={{ 
                              bgcolor: 'primary.50', 
                              borderRadius: 2, 
                              p: 2,
                              mb: 2
                            }}>
                              <Typography variant="caption" color="primary.main" fontWeight={600}>
                                💡 Action recommandée
                              </Typography>
                              <Typography variant="body2" color="primary.dark">
                                {suggestion.action_recommandee}
                              </Typography>
                            </Box>
                            <Box sx={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: 1,
                              color: 'success.main'
                            }}>
                              <ArrowTrendingUpIcon sx={{ fontSize: 18 }} />
                              <Typography variant="caption" fontWeight={500}>
                                Impact estimé: {suggestion.impact_estime}
                              </Typography>
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </Box>
            )}

            {/* Tab 1: Tendances */}
            {activeTab === 1 && (
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                  <Typography variant="h6" fontWeight={600}>
                    Évolution des plaintes sur {selectedPeriod} jours
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {[7, 30, 90].map((days) => (
                      <Button
                        key={days}
                        variant={selectedPeriod === days ? 'contained' : 'outlined'}
                        size="small"
                        onClick={() => setSelectedPeriod(days)}
                        sx={{ minWidth: 60 }}
                      >
                        {days}j
                      </Button>
                    ))}
                  </Box>
                </Box>

                {trends?.trends && trends.trends.length > 0 ? (
                  <Grid container spacing={3}>
                    {/* Graphique principal */}
                    <Grid item xs={12}>
                      <Card sx={{ p: 3, borderRadius: 3 }}>
                        <PlotlyChart
                          data={[
                            {
                              x: trends.trends.map(t => new Date(t.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })),
                              y: trends.trends.map(t => t.total),
                              type: 'scatter',
                              mode: 'lines+markers',
                              name: 'Total',
                              line: { color: '#3b82f6', width: 3, shape: 'spline' },
                              marker: { size: 6 },
                              fill: 'tonexty',
                              fillcolor: 'rgba(59, 130, 246, 0.1)'
                            },
                            {
                              x: trends.trends.map(t => new Date(t.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })),
                              y: trends.trends.map(t => t.traite + t.cloture),
                              type: 'scatter',
                              mode: 'lines+markers',
                              name: 'Résolues',
                              line: { color: '#10b981', width: 2, shape: 'spline' },
                              marker: { size: 5 }
                            }
                          ]}
                          layout={{
                            margin: { l: 50, r: 30, t: 30, b: 60 },
                            xaxis: { 
                              title: { text: 'Date', font: { color: '#6b7280' } },
                              tickangle: -45,
                              tickfont: { color: '#6b7280' }
                            },
                            yaxis: { 
                              title: { text: 'Nombre de plaintes', font: { color: '#6b7280' } },
                              tickfont: { color: '#6b7280' }
                            },
                            plot_bgcolor: 'rgba(0,0,0,0)',
                            paper_bgcolor: 'rgba(0,0,0,0)',
                            legend: { 
                              orientation: 'h', 
                              y: -0.2,
                              font: { color: '#374151' }
                            },
                            hovermode: 'x unified'
                          }}
                          className="h-96"
                        />
                      </Card>
                    </Grid>

                    {/* Répartition par statut */}
                    <Grid item xs={12} md={6}>
                      <Card sx={{ p: 3, borderRadius: 3 }}>
                        <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                          Répartition par Statut
                        </Typography>
                        <PlotlyChart
                          data={[
                            {
                              values: [
                                trends.trends.reduce((sum, t) => sum + t.recu, 0),
                                trends.trends.reduce((sum, t) => sum + t.en_cours, 0),
                                trends.trends.reduce((sum, t) => sum + t.traite, 0),
                                trends.trends.reduce((sum, t) => sum + t.cloture, 0)
                              ],
                              labels: ['Reçues', 'En cours', 'Traitées', 'Clôturées'],
                              type: 'pie',
                              marker: {
                                colors: ['#64748b', '#3b82f6', '#10b981', '#14b8a6']
                              },
                              textinfo: 'label+percent',
                              hole: 0.4
                            }
                          ]}
                          layout={{
                            margin: { l: 20, r: 20, t: 20, b: 20 },
                            plot_bgcolor: 'rgba(0,0,0,0)',
                            paper_bgcolor: 'rgba(0,0,0,0)',
                            showlegend: false
                          }}
                          className="h-72"
                        />
                      </Card>
                    </Grid>

                    {/* Stats de la période */}
                    <Grid item xs={12} md={6}>
                      <Card sx={{ p: 3, borderRadius: 3, height: '100%' }}>
                        <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                          Statistiques de la période
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          {[
                            { label: 'Total plaintes', value: trends.trends.reduce((sum, t) => sum + t.total, 0), icon: <DocumentTextIcon /> },
                            { label: 'Nouvelles reçues', value: trends.trends.reduce((sum, t) => sum + t.recu, 0), icon: <WarningIcon sx={{ color: 'warning.main' }} /> },
                            { label: 'Résolues', value: trends.trends.reduce((sum, t) => sum + t.traite + t.cloture, 0), icon: <CheckCircleIcon sx={{ color: 'success.main' }} /> },
                            { label: 'Moyenne/jour', value: (trends.trends.reduce((sum, t) => sum + t.total, 0) / trends.trends.length).toFixed(1), icon: <ChartBarIcon sx={{ color: 'info.main' }} /> }
                          ].map((stat, idx) => (
                            <Box key={idx} sx={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'space-between',
                              p: 2,
                              bgcolor: 'grey.50',
                              borderRadius: 2
                            }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                {stat.icon}
                                <Typography variant="body2" color="text.secondary">
                                  {stat.label}
                                </Typography>
                              </Box>
                              <Typography variant="h6" fontWeight={600}>
                                {stat.value}
                              </Typography>
                            </Box>
                          ))}
                        </Box>
                      </Card>
                    </Grid>
                  </Grid>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 6 }}>
                    <ArrowTrendingUpIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">
                      Aucune donnée de tendance disponible
                    </Typography>
                    <Typography color="text.disabled">
                      Les données apparaîtront après le traitement de plaintes
                    </Typography>
                  </Box>
                )}
              </Box>
            )}

            {/* Tab 2: Services KPI */}
            {activeTab === 2 && (
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                  <Typography variant="h6" fontWeight={600}>
                    Performance par Service
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<RefreshIcon />}
                    onClick={handleRecalculateKPIs}
                    disabled={refreshing}
                  >
                    Recalculer les KPIs
                  </Button>
                </Box>

                {services.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 6 }}>
                    <BusinessIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">
                      Aucun service disponible
                    </Typography>
                  </Box>
                ) : (
                  <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ bgcolor: 'grey.50' }}>
                          <TableCell sx={{ fontWeight: 600 }}>Service</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 600 }}>Total Plaintes</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 600 }}>Résolues</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 600 }}>Taux Résolution</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 600 }}>Temps Moyen</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 600 }}>Satisfaction</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {services.map((service) => {
                          const tauxResolution = service.nombre_plaintes_total > 0 
                            ? (service.nombre_plaintes_resolues / service.nombre_plaintes_total) * 100 
                            : 0
                          
                          return (
                            <TableRow 
                              key={service.id}
                              sx={{ 
                                '&:hover': { bgcolor: 'grey.50' },
                                transition: 'background-color 0.2s'
                              }}
                            >
                              <TableCell>
                                <Box>
                                  <Typography variant="body1" fontWeight={500}>
                                    {service.nom}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {service.code_service}
                                  </Typography>
                                </Box>
                              </TableCell>
                              <TableCell align="center">
                                <Chip 
                                  label={service.nombre_plaintes_total}
                                  size="small"
                                  color={service.nombre_plaintes_total > 20 ? 'error' : 'default'}
                                />
                              </TableCell>
                              <TableCell align="center">
                                <Typography color="success.main" fontWeight={500}>
                                  {service.nombre_plaintes_resolues}
                                </Typography>
                              </TableCell>
                              <TableCell align="center">
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                                  <LinearProgress 
                                    variant="determinate" 
                                    value={tauxResolution}
                                    sx={{ 
                                      width: 60, 
                                      height: 8, 
                                      borderRadius: 4,
                                      bgcolor: 'grey.200',
                                      '& .MuiLinearProgress-bar': {
                                        bgcolor: tauxResolution >= 80 ? 'success.main' : tauxResolution >= 50 ? 'warning.main' : 'error.main'
                                      }
                                    }}
                                  />
                                  <Typography variant="body2" fontWeight={500}>
                                    {tauxResolution.toFixed(0)}%
                                  </Typography>
                                </Box>
                              </TableCell>
                              <TableCell align="center">
                                <Tooltip title="Temps moyen de résolution">
                                  <Chip 
                                    icon={<ClockIcon sx={{ fontSize: 16 }} />}
                                    label={`${service.temps_moyen_resolution.toFixed(1)}j`}
                                    size="small"
                                    color={service.temps_moyen_resolution <= 3 ? 'success' : service.temps_moyen_resolution <= 7 ? 'warning' : 'error'}
                                    variant="outlined"
                                  />
                                </Tooltip>
                              </TableCell>
                              <TableCell align="center">
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                                  <StarIcon sx={{ 
                                    fontSize: 18, 
                                    color: service.taux_satisfaction >= 70 ? 'success.main' : service.taux_satisfaction >= 40 ? 'warning.main' : 'error.main' 
                                  }} />
                                  <Typography 
                                    variant="body2" 
                                    fontWeight={600}
                                    color={service.taux_satisfaction >= 70 ? 'success.main' : service.taux_satisfaction >= 40 ? 'warning.main' : 'error.main'}
                                  >
                                    {service.taux_satisfaction.toFixed(0)}%
                                  </Typography>
                                </Box>
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Box>
            )}

            {/* Tab 3: Analyse IA Avancée */}
            {activeTab === 3 && (
              <Box>
                {/* Statut IA */}
                <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ 
                      p: 1, 
                      bgcolor: aiStatus?.ollama_available ? 'success.100' : 'error.100',
                      borderRadius: 2 
                    }}>
                      <CpuChipIcon sx={{ 
                        fontSize: 24, 
                        color: aiStatus?.ollama_available ? 'success.main' : 'error.main' 
                      }} />
                    </Box>
                    <Box>
                      <Typography variant="subtitle1" fontWeight={600}>
                        Moteur IA: {aiStatus?.ollama_available ? 'Ollama Connecté' : 'Ollama Non Disponible'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Modèle: {aiStatus?.recommended_model || 'llama3.2'}
                        {aiStatus?.model_ready && (
                          <Chip label="Prêt" size="small" color="success" sx={{ ml: 1 }} />
                        )}
                      </Typography>
                    </Box>
                  </Box>
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={aiLoading ? <CircularProgress size={20} color="inherit" /> : <BoltIcon />}
                    onClick={runAIAnalysis}
                    disabled={aiLoading}
                    sx={{ 
                      background: '#0d9488',
                      fontWeight: 600,
                      px: 4,
                      '&:hover': { 
                        background: '#0f766e'
                      }
                    }}
                  >
                    {aiLoading ? 'Analyse en cours...' : 'Lancer l\'analyse IA'}
                  </Button>
                </Box>

                {/* Erreur */}
                {aiError && (
                  <Alert severity="error" sx={{ mb: 3 }} onClose={() => setAiError(null)}>
                    {aiError}
                  </Alert>
                )}

                {/* Progression de l'analyse en cours */}
                {aiTask && aiLoading && (
                  <Card sx={{ mb: 3, borderRadius: 3, border: '2px solid', borderColor: 'info.200', bgcolor: 'info.50' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <CircularProgress size={24} />
                        <Typography variant="h6" fontWeight={600}>
                          Analyse en cours...
                        </Typography>
                        <Chip 
                          label={`${aiTask.progress}%`}
                          color="primary"
                          size="small"
                        />
                      </Box>
                      
                      {/* Barre de progression */}
                      <Box sx={{ mb: 2 }}>
                        <LinearProgress 
                          variant="determinate" 
                          value={aiTask.progress} 
                          sx={{ 
                            height: 12, 
                            borderRadius: 6,
                            bgcolor: 'grey.200',
                            '& .MuiLinearProgress-bar': {
                              background: '#0d9488',
                              borderRadius: 6
                            }
                          }}
                        />
                      </Box>
                      
                      {/* Étape courante */}
                      <Typography variant="body1" fontWeight={500} sx={{ mb: 1 }}>
                        📍 {aiTask.current_step}
                      </Typography>
                      
                      {/* Statistiques */}
                      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', mt: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <DocumentTextIcon fontSize="small" color="primary" />
                          <Typography variant="body2">
                            <strong>{aiTask.total_plaintes}</strong> plaintes à analyser
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <BusinessIcon fontSize="small" color="primary" />
                          <Typography variant="body2">
                            <strong>{aiTask.services_analysed}</strong> / {aiTask.total_services} services analysés
                          </Typography>
                        </Box>
                      </Box>
                      
                      {/* Message d'info */}
                      <Alert severity="info" sx={{ mt: 2 }}>
                        <Typography variant="body2">
                          💡 Vous pouvez naviguer librement sur les autres pages. 
                          Vous serez notifié lorsque l'analyse sera terminée.
                        </Typography>
                      </Alert>
                    </CardContent>
                  </Card>
                )}

                {/* Résultats de l'analyse */}
                {aiAnalysis ? (
                  <Box>
                    {/* Résumé global */}
                    <Card sx={{ mb: 3, borderRadius: 3, border: '2px solid', borderColor: 'primary.100' }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                          <AutoAwesomeIcon sx={{ color: 'primary.main' }} />
                          <Typography variant="h6" fontWeight={600}>
                            Résumé de l'Analyse des Descriptions
                          </Typography>
                          <Chip 
                            label={`Modèle: ${aiAnalysis.model_used}`}
                            size="small"
                            variant="outlined"
                          />
                        </Box>
                        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                          L'IA a analysé les descriptions de {aiAnalysis.total_plaintes_analysees} plaintes 
                          réparties sur {aiAnalysis.nombre_services} services pour identifier les causes des insatisfactions.
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                          <Chip 
                            icon={<DocumentTextIcon />}
                            label={`${aiAnalysis.total_plaintes_analysees} plaintes analysées`}
                            color="primary"
                          />
                          <Chip 
                            icon={<BusinessIcon />}
                            label={`${aiAnalysis.nombre_services} services`}
                            color="info"
                          />
                          <Chip 
                            icon={<WarningIcon />}
                            label={`${aiAnalysis.services_critiques?.length || 0} services critiques`}
                            color={aiAnalysis.services_critiques?.length > 0 ? 'error' : 'success'}
                          />
                        </Box>
                      </CardContent>
                    </Card>

                    {/* Causes globales - Top 10 */}
                    <Card sx={{ mb: 3, borderRadius: 3, border: '1px solid', borderColor: 'warning.200' }}>
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                            <WarningIcon sx={{ color: 'warning.main' }} />
                            <Typography variant="h6" fontWeight={600}>
                              🎯 Top Causes des Plaintes (Tous Services)
                            </Typography>
                          </Box>
                          {!aiAnalysis.causes_globales || aiAnalysis.causes_globales.length === 0 ? (
                            <Typography variant="body2" color="text.secondary">
                              Aucune cause globale identifiée pour le moment.
                            </Typography>
                          ) : (
                          <TableContainer>
                            <Table size="small">
                              <TableHead>
                                <TableRow sx={{ bgcolor: 'warning.50' }}>
                                  <TableCell><strong>Service</strong></TableCell>
                                  <TableCell><strong>Cause Identifiée</strong></TableCell>
                                  <TableCell><strong>Gravité</strong></TableCell>
                                  <TableCell><strong>Fréquence</strong></TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {aiAnalysis.causes_globales.map((cause, idx) => {
                                  const gravite = toDisplayText(cause.gravite, 'gravite', 'niveau').toUpperCase()
                                  return (
                                  <TableRow key={idx} sx={{ '&:hover': { bgcolor: 'grey.50' } }}>
                                    <TableCell>
                                      <Chip label={toDisplayText(cause.service, 'service', 'nom') || '—'} size="small" color="primary" variant="outlined" />
                                    </TableCell>
                                    <TableCell>
                                      <Typography variant="body2">{toDisplayText(cause.cause, 'cause', 'libelle') || 'Cause non précisée'}</Typography>
                                    </TableCell>
                                    <TableCell>
                                      <Chip
                                        label={gravite || 'N/A'}
                                        size="small"
                                        color={
                                          gravite === 'CRITIQUE' ? 'error' :
                                          gravite === 'ELEVEE' ? 'warning' :
                                          gravite === 'MOYENNE' ? 'info' : 'default'
                                        }
                                      />
                                    </TableCell>
                                    <TableCell>
                                      <Typography variant="body2">{toDisplayText(cause.frequence, 'frequence', 'occurrences') || '—'}</Typography>
                                    </TableCell>
                                  </TableRow>
                                  )
                                })}
                              </TableBody>
                            </Table>
                          </TableContainer>
                          )}
                        </CardContent>
                    </Card>

                    {/* Services critiques */}
                    {aiAnalysis.services_critiques && aiAnalysis.services_critiques.length > 0 && (
                      <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                        <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                          ⚠️ Services Nécessitant une Attention Immédiate:
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          {aiAnalysis.services_critiques.map((service, idx) => (
                            <Chip
                              key={idx}
                              label={serviceCritiqueLabel(service)}
                              color="error"
                              variant="filled"
                              icon={<BusinessIcon />}
                            />
                          ))}
                        </Box>
                      </Alert>
                    )}

                    {/* Analyse détaillée par service */}
                    <Typography variant="h6" fontWeight={600} sx={{ mb: 2, mt: 4 }}>
                      📊 Analyse Détaillée par Service
                    </Typography>
                    
                    {(!aiAnalysis.analyses_par_service || aiAnalysis.analyses_par_service.length === 0) && (
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Aucune analyse par service disponible.
                      </Typography>
                    )}
                    <Grid container spacing={3}>
                      {aiAnalysis.analyses_par_service?.map((analyse, idx) => (
                        <Grid item xs={12} md={6} key={idx}>
                          <Card sx={{ 
                            borderRadius: 3, 
                            height: '100%',
                            border: '1px solid',
                            borderColor: analyse.sentiment_general === 'TRES_NEGATIF' ? 'error.300' :
                                        analyse.sentiment_general === 'NEGATIF' ? 'warning.300' : 'grey.200'
                          }}>
                            <CardContent>
                              {/* En-tête du service */}
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <BusinessIcon color="primary" />
                                  <Typography variant="subtitle1" fontWeight={600}>
                                    {analyse.service}
                                  </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                  <Chip 
                                    label={`${analyse.nombre_plaintes} plaintes`}
                                    size="small"
                                    color="primary"
                                    variant="outlined"
                                  />
                                  <Chip 
                                    label={analyse.sentiment_general?.replace('_', ' ') || 'N/A'}
                                    size="small"
                                    color={
                                      analyse.sentiment_general === 'TRES_NEGATIF' ? 'error' :
                                      analyse.sentiment_general === 'NEGATIF' ? 'warning' :
                                      analyse.sentiment_general === 'POSITIF' ? 'success' : 'default'
                                    }
                                  />
                                </Box>
                              </Box>

                              {/* Causes identifiées */}
                              <Typography variant="subtitle2" fontWeight={600} color="warning.dark" sx={{ mb: 1 }}>
                                🔍 Pourquoi les clients se plaignent:
                              </Typography>
                              {analyse.causes_identifiees?.length > 0 ? (
                                <Box sx={{ mb: 2 }}>
                                  {analyse.causes_identifiees.map((cause, cIdx) => {
                                    const gravite = toDisplayText(cause.gravite, 'gravite', 'niveau').toUpperCase()
                                    const libelle = toDisplayText(cause.cause, 'cause', 'libelle') || 'Cause non précisée'
                                    const exemple = Array.isArray(cause.exemples)
                                      ? toDisplayText(cause.exemples[0], 'texte', 'extrait', 'description')
                                      : ''
                                    return (
                                    <Box key={cIdx} sx={{
                                      p: 1.5,
                                      mb: 1,
                                      bgcolor: gravite === 'CRITIQUE' ? 'error.50' :
                                              gravite === 'ELEVEE' ? 'warning.50' : 'grey.50',
                                      borderRadius: 2,
                                      borderLeft: '3px solid',
                                      borderColor: gravite === 'CRITIQUE' ? 'error.main' :
                                                  gravite === 'ELEVEE' ? 'warning.main' : 'grey.400'
                                    }}>
                                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                        <Typography variant="body2" fontWeight={500}>
                                          {libelle}
                                        </Typography>
                                        {gravite && (
                                          <Chip
                                            label={gravite}
                                            size="small"
                                            sx={{ fontSize: '0.65rem', height: 20 }}
                                            color={
                                              gravite === 'CRITIQUE' ? 'error' :
                                              gravite === 'ELEVEE' ? 'warning' : 'default'
                                            }
                                          />
                                        )}
                                      </Box>
                                      {exemple && (
                                        <Typography variant="caption" color="text.secondary" sx={{
                                          display: 'block',
                                          mt: 0.5,
                                          fontStyle: 'italic'
                                        }}>
                                          Ex: "{exemple.slice(0, 100)}..."
                                        </Typography>
                                      )}
                                    </Box>
                                    )
                                  })}
                                </Box>
                              ) : (
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                  Aucune cause spécifique identifiée.
                                </Typography>
                              )}

                              {/* Problèmes récurrents */}
                              {analyse.problemes_recurrents?.length > 0 && (
                                <Box sx={{ mb: 2 }}>
                                  <Typography variant="subtitle2" fontWeight={600} color="error.dark" sx={{ mb: 1 }}>
                                    🔄 Problèmes récurrents:
                                  </Typography>
                                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                    {analyse.problemes_recurrents.map((prob, pIdx) => (
                                      <Chip
                                        key={pIdx}
                                        label={toDisplayText(prob, 'probleme', 'libelle', 'cause') || '—'}
                                        size="small"
                                        variant="outlined"
                                        color="error"
                                        sx={{ fontSize: '0.7rem' }}
                                      />
                                    ))}
                                  </Box>
                                </Box>
                              )}

                              {/* Recommandations */}
                              {analyse.recommandations?.length > 0 && (
                                <Box>
                                  <Typography variant="subtitle2" fontWeight={600} color="success.dark" sx={{ mb: 1 }}>
                                    💡 Actions recommandées:
                                  </Typography>
                                  {analyse.recommandations.map((reco, rIdx) => (
                                    <Box key={rIdx} sx={{
                                      p: 1,
                                      bgcolor: 'success.50',
                                      borderRadius: 1,
                                      mb: 0.5
                                    }}>
                                      <Typography variant="caption">{toDisplayText(reco, 'recommandation', 'action', 'libelle') || '—'}</Typography>
                                    </Box>
                                  ))}
                                </Box>
                              )}
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>

                    {/* Timestamp */}
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 3, textAlign: 'center' }}>
                      Analyse effectuée le {aiAnalysis.timestamp ? new Date(aiAnalysis.timestamp).toLocaleString('fr-FR') : 'N/A'}
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 8 }}>
                    <CpuChipIcon sx={{ fontSize: 80, color: 'text.disabled', mb: 3 }} />
                    <Typography variant="h5" color="text.secondary" sx={{ mb: 2 }}>
                      Analyse IA Avancée
                    </Typography>
                    <Typography color="text.disabled" sx={{ mb: 4, maxWidth: 500, mx: 'auto' }}>
                      Lancez une analyse complète pour obtenir un diagnostic détaillé des plaintes,
                      identifier les patterns récurrents et recevoir des recommandations personnalisées
                      générées par l'intelligence artificielle.
                    </Typography>
                    <Button
                      variant="contained"
                      size="large"
                      startIcon={aiLoading ? <CircularProgress size={20} color="inherit" /> : <BoltIcon />}
                      onClick={runAIAnalysis}
                      disabled={aiLoading}
                      sx={{ 
                        background: '#0d9488',
                        fontWeight: 600,
                        px: 6,
                        py: 1.5,
                        '&:hover': { 
                          background: '#0f766e'
                        }
                      }}
                    >
                      {aiLoading ? 'Analyse en cours...' : 'Démarrer l\'analyse IA'}
                    </Button>
                    {!aiStatus?.ollama_available && (
                      <Alert severity="info" sx={{ mt: 3, maxWidth: 500, mx: 'auto' }}>
                        💡 Ollama n'est pas détecté. Une analyse de base sera effectuée.
                        Pour une analyse avancée, lancez Ollama avec le modèle {aiStatus?.recommended_model || 'llama3.2'}.
                      </Alert>
                    )}
                  </Box>
                )}
              </Box>
            )}
          </CardContent>
        </Card>

        {/* AI Analytics Banner */}
        <Card sx={{ 
          mt: 4,
          background: '#0d9488',
          borderRadius: 4,
          boxShadow: '0 20px 60px rgba(124, 58, 237, 0.3)'
        }}>
          <CardContent sx={{ p: 4 }}>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={8}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Box sx={{ 
                    p: 1.5, 
                    bgcolor: 'rgba(255,255,255,0.2)', 
                    borderRadius: 2 
                  }}>
                    <CpuChipIcon sx={{ fontSize: 28, color: 'white' }} />
                  </Box>
                  <Box>
                    <Typography variant="h5" sx={{ color: 'white', fontWeight: 700 }}>
                      IA Analytics Avancé
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                      Analyse prédictive et détection de patterns avec Ollama
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ 
                  bgcolor: 'rgba(255,255,255,0.15)', 
                  /* backdropFilter removed */
                  borderRadius: 2, 
                  p: 2 
                }}>
                  <Typography sx={{ color: 'white', fontWeight: 500 }}>
                    {aiAnalysis ? (
                      <>
                        ✅ Analyse complète disponible - {aiAnalysis.total_plaintes_analysees || 0} plaintes analysées sur {aiAnalysis.nombre_services || 0} services
                        {aiAnalysis.services_critiques?.length > 0 && (
                          <Chip 
                            label={`${aiAnalysis.services_critiques.length} service${aiAnalysis.services_critiques.length > 1 ? 's' : ''} critique${aiAnalysis.services_critiques.length > 1 ? 's' : ''}`}
                            size="small"
                            sx={{ 
                              ml: 1, 
                              bgcolor: 'rgba(239, 68, 68, 0.8)', 
                              color: 'white',
                              fontWeight: 600
                            }}
                          />
                        )}
                      </>
                    ) : (
                      <>
                        📊 {suggestions.length} suggestion{suggestions.length > 1 ? 's' : ''} d'amélioration identifiée{suggestions.length > 1 ? 's' : ''} 
                        {suggestions.filter(s => s.priorite === 'haute').length > 0 && (
                          <Chip 
                            label={`${suggestions.filter(s => s.priorite === 'haute').length} prioritaire${suggestions.filter(s => s.priorite === 'haute').length > 1 ? 's' : ''}`}
                            size="small"
                            sx={{ 
                              ml: 1, 
                              bgcolor: 'rgba(239, 68, 68, 0.8)', 
                              color: 'white',
                              fontWeight: 600
                            }}
                          />
                        )}
                      </>
                    )}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={aiLoading ? <CircularProgress size={20} color="inherit" /> : <BoltIcon />}
                  onClick={runAIAnalysis}
                  disabled={aiLoading}
                  sx={{ 
                    bgcolor: 'white', 
                    color: 'primary.main',
                    fontWeight: 600,
                    px: 4,
                    '&:hover': { bgcolor: 'grey.100' }
                  }}
                >
                  {aiLoading ? 'Analyse...' : (aiAnalysis ? 'Relancer l\'analyse' : 'Lancer l\'analyse IA')}
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

      </Box>
      
      {/* Snackbar pour les notifications */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setNotification(prev => ({ ...prev, open: false }))} 
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}
