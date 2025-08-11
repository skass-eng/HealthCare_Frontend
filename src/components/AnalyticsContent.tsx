import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Grid,
  CircularProgress,
  Tabs,
  Tab,
  LinearProgress,
  Chip
} from '@mui/material';
import VueEnsemble from './VueEnsemble';
import PlotlyChart from './PlotlyChart';
import {
  BarChart as ChartBarIcon,
  PieChart as ChartPieIcon,
  TrendingUp as ArrowTrendingUpIcon,
  Schedule as ClockIcon,
  Star as StarIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  TrendingDown as TrendingDownIcon,
  Remove as RemoveIcon
} from '@mui/icons-material';

interface AnalyticsData {
  plaintesParService: { service: string; count: number; percentage: number }[];
  plaintesParPriorite: { priorite: string; count: number; color: string }[];
  evolutionTemporelle: { date: string; count: number }[];
  tempsMoyenTraitement: number;
  tauxSatisfaction: number;
  metriquesPerformance: {
    taux_resolution: number;
    temps_reponse_moyen: number;
    qualite_soins: number;
    taux_recurrence: number;
    satisfaction_client: number;
    temps_traitement_moyen: number;
  };
  tendances: {
    augmentation: string[];
    diminution: string[];
    stable: string[];
  };
}

interface AnalyticsContentProps {
  selectedPeriod?: '7j' | '30j' | '90j';
  className?: string;
}

const AnalyticsContent: React.FC<AnalyticsContentProps> = ({ 
  selectedPeriod = '30j', 
  className = '' 
}) => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'services' | 'trends' | 'performance'>('overview');
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  // Récupérer les données Redux
  const { statistiquesGlobales, statistiquesDepartements, statistiquesPriorites, evolutionPlaintes } = useSelector((state: RootState) => state.dashboard);

  // Fonction pour obtenir la couleur selon la priorité
  const getPrioriteColor = (priorite: string) => {
    switch (priorite) {
      case 'URGENT':
        return 'error.main';
      case 'ELEVE':
        return 'warning.main';
      case 'MOYEN':
        return 'info.main';
      case 'BAS':
        return 'success.main';
      default:
        return 'grey.main';
    }
  };

  // Fonction pour générer des données basées sur les vraies données Redux
  function generateAnalyticsDataFromRedux(): AnalyticsData {
    // Calculer les pourcentages pour les services
    const totalPlaintes = statistiquesGlobales?.total || 0;
    console.log('📊 Statistiques globales:', statistiquesGlobales);
    console.log('🏥 Statistiques départements:', statistiquesDepartements);
    
    const plaintesParService = statistiquesDepartements.map(dept => ({
      service: dept.nom,
      count: dept.total,
      percentage: totalPlaintes > 0 ? (dept.total / totalPlaintes) * 100 : 0
    }));
    
    console.log('📈 Plaintes par service calculées:', plaintesParService);

    // Calculer la répartition par priorité (utiliser les vraies données de priorité)
    const plaintesParPriorite = statistiquesPriorites.length > 0 ? 
      statistiquesPriorites.map(stat => ({
        priorite: stat.priorite,
        count: stat.count,
        color: getPrioriteColor(stat.priorite)
      })) : [
        { priorite: 'URGENT', count: 0, color: 'error.main' },
        { priorite: 'ELEVE', count: 0, color: 'warning.main' },
        { priorite: 'MOYEN', count: 0, color: 'info.main' },
        { priorite: 'BAS', count: 0, color: 'success.main' }
      ];

    // Utiliser l'évolution temporelle des données Redux si disponible
    const evolutionTemporelle = evolutionPlaintes?.evolution_journaliere || [];
    console.log('📈 Données d\'évolution temporelle:', evolutionTemporelle);

    // Calculer les métriques de performance
    const tauxResolution = totalPlaintes > 0 ? 
      ((statistiquesGlobales?.traitees || 0) + (statistiquesGlobales?.cloturees || 0)) / totalPlaintes * 100 : 0;
    
    const satisfactionMoyenne = statistiquesDepartements.length > 0 ? 
      statistiquesDepartements.reduce((sum, dept) => sum + dept.satisfaction_moyenne, 0) / statistiquesDepartements.length : 0;

    console.log('📊 Métriques de performance calculées:');
    console.log('- Taux de résolution:', tauxResolution);
    console.log('- Satisfaction moyenne:', satisfactionMoyenne);
    console.log('- Statistiques globales:', statistiquesGlobales);

    return {
      plaintesParService,
      plaintesParPriorite,
      evolutionTemporelle,
      tempsMoyenTraitement: 2.8, // Placeholder
      tauxSatisfaction: satisfactionMoyenne,
      metriquesPerformance: {
        taux_resolution: tauxResolution, // ✅ Vraies données calculées
        temps_reponse_moyen: 1.8, // ⚠️ Valeur fixe - nécessite données supplémentaires
        qualite_soins: 93, // ⚠️ Valeur fixe - nécessite données supplémentaires
        taux_recurrence: 4, // ⚠️ Valeur fixe - nécessite données supplémentaires
        satisfaction_client: satisfactionMoyenne, // ✅ Vraies données calculées
        temps_traitement_moyen: 2.8 // ⚠️ Valeur fixe - nécessite données supplémentaires
      },
      tendances: {
        augmentation: totalPlaintes > 0 ? ['Plaintes reçues'] : [],
        diminution: tauxResolution > 80 ? ['Temps de réponse'] : [],
        stable: ['Taux de résolution']
      }
    };
  }

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setAnalyticsLoading(true);
        
        // Toujours utiliser les vraies données Redux si disponibles
        if (statistiquesGlobales && statistiquesDepartements.length > 0) {
          console.log('✅ Utilisation des vraies données Redux');
          const realData = generateAnalyticsDataFromRedux();
          setAnalyticsData(realData);
        } else {
          console.log('⚠️ Données Redux non disponibles - attente du chargement...');
          // Attendre que les données soient chargées plutôt que d'utiliser des données de démonstration
          setAnalyticsData(null);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des analytics:', error);
        setAnalyticsData(null);
      } finally {
        setAnalyticsLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [selectedPeriod, statistiquesGlobales, statistiquesDepartements, statistiquesPriorites, evolutionPlaintes]);

  // Fonction pour générer des données de démonstration selon la période (fallback)
  function getDemoDataForPeriod(period: '7j' | '30j' | '90j'): AnalyticsData {
    const baseData = {
      plaintesParService: [
        { service: 'Cardiologie', count: 0, percentage: 0 },
        { service: 'Urgences', count: 0, percentage: 0 },
        { service: 'Pédiatrie', count: 0, percentage: 0 },
        { service: 'Chirurgie', count: 0, percentage: 0 },
        { service: 'Radiologie', count: 0, percentage: 0 },
        { service: 'Oncologie', count: 0, percentage: 0 }
      ],
      plaintesParPriorite: [
        { priorite: 'Urgent', count: 0, color: 'error.main' },
        { priorite: 'Élevé', count: 0, color: 'warning.main' },
        { priorite: 'Moyen', count: 0, color: 'info.main' },
        { priorite: 'Bas', count: 0, color: 'success.main' }
      ],
      evolutionTemporelle: [] as { date: string; count: number }[],
      tempsMoyenTraitement: 0,
      tauxSatisfaction: 0,
      metriquesPerformance: {
        taux_resolution: 0,
        temps_reponse_moyen: 0,
        qualite_soins: 0,
        taux_recurrence: 0,
        satisfaction_client: 0,
        temps_traitement_moyen: 0
      },
      tendances: {
        augmentation: [] as string[],
        diminution: [] as string[],
        stable: [] as string[]
      }
    };

    switch (period) {
      case '7j':
        return {
          ...baseData,
          plaintesParService: [
            { service: 'Cardiologie', count: 8, percentage: 22.2 },
            { service: 'Urgences', count: 12, percentage: 33.3 },
            { service: 'Pédiatrie', count: 6, percentage: 16.7 },
            { service: 'Chirurgie', count: 4, percentage: 11.1 },
            { service: 'Radiologie', count: 3, percentage: 8.3 },
            { service: 'Oncologie', count: 3, percentage: 8.3 }
          ],
          plaintesParPriorite: [
            { priorite: 'Urgent', count: 4, color: 'error.main' },
            { priorite: 'Élevé', count: 8, color: 'warning.main' },
            { priorite: 'Moyen', count: 15, color: 'info.main' },
            { priorite: 'Bas', count: 9, color: 'success.main' }
          ],
          evolutionTemporelle: [
            { date: '2024-01-01', count: 3 },
            { date: '2024-01-02', count: 5 },
            { date: '2024-01-03', count: 2 },
            { date: '2024-01-04', count: 7 },
            { date: '2024-01-05', count: 4 },
            { date: '2024-01-06', count: 6 },
            { date: '2024-01-07', count: 9 }
          ],
          tempsMoyenTraitement: 2.8,
          tauxSatisfaction: 89.0,
          metriquesPerformance: {
            taux_resolution: 96,
            temps_reponse_moyen: 1.8,
            qualite_soins: 93,
            taux_recurrence: 4,
            satisfaction_client: 89,
            temps_traitement_moyen: 2.8
          },
          tendances: {
            augmentation: ['Plaintes urgentes'],
            diminution: ['Temps de réponse', 'Satisfaction patient'],
            stable: ['Taux de résolution']
          }
        };

      case '30j':
        return {
          ...baseData,
          plaintesParService: [
            { service: 'Cardiologie', count: 25, percentage: 20.8 },
            { service: 'Urgences', count: 35, percentage: 29.2 },
            { service: 'Pédiatrie', count: 20, percentage: 16.7 },
            { service: 'Chirurgie', count: 15, percentage: 12.5 },
            { service: 'Radiologie', count: 15, percentage: 12.5 },
            { service: 'Oncologie', count: 10, percentage: 8.3 }
          ],
          plaintesParPriorite: [
            { priorite: 'Urgent', count: 12, color: 'error.main' },
            { priorite: 'Élevé', count: 25, color: 'warning.main' },
            { priorite: 'Moyen', count: 45, color: 'info.main' },
            { priorite: 'Bas', count: 38, color: 'success.main' }
          ],
          evolutionTemporelle: [
            { date: '2024-01-01', count: 5 },
            { date: '2024-01-05', count: 8 },
            { date: '2024-01-10', count: 12 },
            { date: '2024-01-15', count: 6 },
            { date: '2024-01-20', count: 15 },
            { date: '2024-01-25', count: 9 },
            { date: '2024-01-30', count: 18 }
          ],
          tempsMoyenTraitement: 3.2,
          tauxSatisfaction: 86.5,
          metriquesPerformance: {
            taux_resolution: 94,
            temps_reponse_moyen: 2.1,
            qualite_soins: 90,
            taux_recurrence: 6,
            satisfaction_client: 86.5,
            temps_traitement_moyen: 3.2
          },
          tendances: {
            augmentation: ['Plaintes urgentes', 'Temps de réponse'],
            diminution: ['Satisfaction patient'],
            stable: ['Taux de résolution', 'Qualité des soins']
          }
        };

      case '90j':
        return {
          ...baseData,
          plaintesParService: [
            { service: 'Cardiologie', count: 35, percentage: 23.3 },
            { service: 'Urgences', count: 52, percentage: 34.7 },
            { service: 'Pédiatrie', count: 25, percentage: 16.7 },
            { service: 'Chirurgie', count: 20, percentage: 13.3 },
            { service: 'Radiologie', count: 12, percentage: 8.0 },
            { service: 'Oncologie', count: 6, percentage: 4.0 }
          ],
          plaintesParPriorite: [
            { priorite: 'Urgent', count: 15, color: 'error.main' },
            { priorite: 'Élevé', count: 35, color: 'warning.main' },
            { priorite: 'Moyen', count: 60, color: 'info.main' },
            { priorite: 'Bas', count: 40, color: 'success.main' }
          ],
          evolutionTemporelle: [
            { date: '2024-01-01', count: 8 },
            { date: '2024-01-15', count: 12 },
            { date: '2024-01-30', count: 6 },
            { date: '2024-02-15', count: 18 },
            { date: '2024-02-28', count: 10 },
            { date: '2024-03-15', count: 14 },
            { date: '2024-03-30', count: 22 }
          ],
          tempsMoyenTraitement: 3.8,
          tauxSatisfaction: 84.0,
          metriquesPerformance: {
            taux_resolution: 91,
            temps_reponse_moyen: 2.8,
            qualite_soins: 88,
            taux_recurrence: 9,
            satisfaction_client: 84,
            temps_traitement_moyen: 3.8
          },
          tendances: {
            augmentation: ['Plaintes urgentes', 'Temps de réponse', 'Taux de récurrence'],
            diminution: ['Satisfaction patient', 'Qualité des soins', 'Taux de résolution'],
            stable: []
          }
        };

      default:
        return baseData;
    }
  }

  if (analyticsLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  if (!analyticsData) {
    return (
      <Box sx={{ p: 3 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <Typography variant="h6" color="text.secondary">
            Chargement des données...
          </Typography>
        </Box>
      </Box>
    );
  }

  const renderOverview = () => (
    <VueEnsemble analyticsData={analyticsData} />
  );

  const renderServices = () => (
    <Card sx={{
      background: 'linear-gradient(135deg, rgba(255,255,255,0.95), rgba(255,255,255,0.98))',
      backdropFilter: 'blur(20px)',
      borderRadius: 4,
      boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
      '&:hover': {
        boxShadow: '0 25px 50px rgba(0,0,0,0.15)',
        transform: 'translateY(-2px)',
        transition: 'all 0.5s ease'
      }
    }}>
      <Box sx={{ p: 4, borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
        <Typography variant="h6" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center' }}>
          <ChartPieIcon sx={{ mr: 1, color: 'primary.main' }} />
          Analyse Détaillée par Service
        </Typography>
      </Box>
      
      <Box sx={{ p: 4 }}>
        <Grid container spacing={3}>
          {analyticsData?.plaintesParService.map((service, index) => (
            <Grid item xs={12} md={6} lg={4} key={index}>
              <Card sx={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.95), rgba(255,255,255,0.98))',
                backdropFilter: 'blur(10px)',
                borderRadius: 3,
                boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
                border: '1px solid rgba(255,255,255,0.3)',
                p: 3,
                height: '100%',
                '&:hover': {
                  boxShadow: '0 12px 35px rgba(0,0,0,0.15)',
                  transform: 'translateY(-2px)',
                  transition: 'all 0.3s ease'
                }
              }}>
                <Typography variant="h6" sx={{ 
                  fontWeight: 600, 
                  mb: 3,
                  color: '#1e293b',
                  fontSize: '1.125rem'
                }}>
                  {service.service}
                </Typography>
                
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" sx={{ 
                      color: '#64748b',
                      fontWeight: 500
                    }}>
                      Plaintes:
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      fontWeight: 600,
                      color: '#1e293b'
                    }}>
                      {service.count}
                    </Typography>
                  </Box>
                </Box>
                
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" sx={{ 
                      color: '#64748b',
                      fontWeight: 500
                    }}>
                      Pourcentage:
                    </Typography>
                                         <Typography variant="body2" sx={{ 
                       fontWeight: 600,
                       color: '#1e293b'
                     }}>
                       {service.percentage.toFixed(2)}%
                     </Typography>
                  </Box>
                </Box>
                
                <LinearProgress 
                  variant="determinate" 
                  value={service.percentage} 
                  sx={{ 
                    height: 8, 
                    borderRadius: 4,
                    bgcolor: '#e2e8f0',
                    '& .MuiLinearProgress-bar': {
                      background: 'linear-gradient(90deg, #3b82f6, #1d4ed8)',
                      borderRadius: 4
                    }
                  }}
                />
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Card>
  );

  const renderTrends = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Évolution temporelle */}
      <Card sx={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.95), rgba(255,255,255,0.98))',
        backdropFilter: 'blur(20px)',
        borderRadius: 4,
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        '&:hover': {
          boxShadow: '0 25px 50px rgba(0,0,0,0.15)',
          transform: 'translateY(-2px)',
          transition: 'all 0.5s ease'
        }
      }}>
        <Box sx={{ p: 4, borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
          <Typography variant="h6" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center' }}>
            <ArrowTrendingUpIcon sx={{ mr: 1, color: 'primary.main' }} />
            Évolution des plaintes
          </Typography>
        </Box>
        <Box sx={{ p: 4 }}>
          <PlotlyChart
            data={[
              {
                x: analyticsData?.evolutionTemporelle.map(p => new Date(p.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })) || [],
                y: analyticsData?.evolutionTemporelle.map(p => p.count) || [],
                type: 'scatter',
                mode: 'lines+markers',
                line: { 
                  color: '#0ea5e9', // Sky blue - cohérent avec le thème
                  width: 3,
                  shape: 'spline'
                },
                marker: { 
                  color: '#0ea5e9', 
                  size: 8,
                  line: { color: 'white', width: 2 }
                },
                fill: 'tonexty',
                fillcolor: 'rgba(14, 165, 233, 0.1)', // Sky blue avec transparence
                hovertemplate: '<b>%{x}</b><br>Plaintes: %{y}<extra></extra>'
              }
            ]}
            layout={{
              margin: { l: 50, r: 20, t: 20, b: 60 },
              xaxis: { 
                title: { text: 'Date', font: { color: '#6b7280' } },
                tickfont: { color: '#6b7280' },
                showgrid: true,
                gridcolor: 'rgba(0,0,0,0.1)'
              },
              yaxis: { 
                title: { text: 'Nombre de plaintes', font: { color: '#6b7280' } },
                tickfont: { color: '#6b7280' },
                showgrid: true,
                gridcolor: 'rgba(0,0,0,0.1)'
              },
              plot_bgcolor: 'rgba(0,0,0,0)',
              paper_bgcolor: 'rgba(0,0,0,0)',
              font: { color: '#374151' },
              hovermode: 'x unified'
            }}
            className="h-80"
          />
        </Box>
      </Card>

      {/* Tendances détectées */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card sx={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.95), rgba(255,255,255,0.98))',
            backdropFilter: 'blur(20px)',
            borderRadius: 4,
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
            '&:hover': {
              boxShadow: '0 25px 50px rgba(0,0,0,0.15)',
              transform: 'translateY(-2px)',
              transition: 'all 0.5s ease'
            },
            p: 3
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <ArrowTrendingUpIcon sx={{ color: '#ea580c', mr: 1 }} />
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b' }}>
                En augmentation
              </Typography>
            </Box>
            <Box component="ul" sx={{ m: 0, p: 0, listStyle: 'none' }}>
              {analyticsData?.tendances.augmentation.map((trend, index) => (
                <Box component="li" key={index} sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  mb: 1,
                  fontSize: '0.875rem',
                  color: '#64748b'
                }}>
                  <Box sx={{ 
                    width: 8, 
                    height: 8, 
                    bgcolor: '#ea580c', 
                    borderRadius: '50%', 
                    mr: 1 
                  }} />
                  {trend}
                </Box>
              ))}
              {(!analyticsData?.tendances.augmentation || analyticsData.tendances.augmentation.length === 0) && (
                <Box component="li" sx={{ 
                  fontSize: '0.875rem', 
                  color: '#94a3b8', 
                  fontStyle: 'italic' 
                }}>
                  Aucune tendance en augmentation
                </Box>
              )}
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.95), rgba(255,255,255,0.98))',
            backdropFilter: 'blur(20px)',
            borderRadius: 4,
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
            '&:hover': {
              boxShadow: '0 25px 50px rgba(0,0,0,0.15)',
              transform: 'translateY(-2px)',
              transition: 'all 0.5s ease'
            },
            p: 3
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <ArrowTrendingUpIcon sx={{ color: '#059669', mr: 1, transform: 'rotate(180deg)' }} />
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b' }}>
                En diminution
              </Typography>
            </Box>
            <Box component="ul" sx={{ m: 0, p: 0, listStyle: 'none' }}>
              {analyticsData?.tendances.diminution.map((trend, index) => (
                <Box component="li" key={index} sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  mb: 1,
                  fontSize: '0.875rem',
                  color: '#64748b'
                }}>
                  <Box sx={{ 
                    width: 8, 
                    height: 8, 
                    bgcolor: '#059669', 
                    borderRadius: '50%', 
                    mr: 1 
                  }} />
                  {trend}
                </Box>
              ))}
              {(!analyticsData?.tendances.diminution || analyticsData.tendances.diminution.length === 0) && (
                <Box component="li" sx={{ 
                  fontSize: '0.875rem', 
                  color: '#94a3b8', 
                  fontStyle: 'italic' 
                }}>
                  Aucune tendance en diminution
                </Box>
              )}
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.95), rgba(255,255,255,0.98))',
            backdropFilter: 'blur(20px)',
            borderRadius: 4,
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
            '&:hover': {
              boxShadow: '0 25px 50px rgba(0,0,0,0.15)',
              transform: 'translateY(-2px)',
              transition: 'all 0.5s ease'
            },
            p: 3
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <CheckCircleIcon sx={{ color: '#0d9488', mr: 1 }} />
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b' }}>
                Stable
              </Typography>
            </Box>
            <Box component="ul" sx={{ m: 0, p: 0, listStyle: 'none' }}>
              {analyticsData?.tendances.stable.map((trend, index) => (
                <Box component="li" key={index} sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  mb: 1,
                  fontSize: '0.875rem',
                  color: '#64748b'
                }}>
                  <Box sx={{ 
                    width: 8, 
                    height: 8, 
                    bgcolor: '#0d9488', 
                    borderRadius: '50%', 
                    mr: 1 
                  }} />
                  {trend}
                </Box>
              ))}
              {(!analyticsData?.tendances.stable || analyticsData.tendances.stable.length === 0) && (
                <Box component="li" sx={{ 
                  fontSize: '0.875rem', 
                  color: '#94a3b8', 
                  fontStyle: 'italic' 
                }}>
                  Aucune tendance stable
                </Box>
              )}
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Analyse des tendances par service */}
      <Card sx={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.95), rgba(255,255,255,0.98))',
        backdropFilter: 'blur(20px)',
        borderRadius: 4,
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        '&:hover': {
          boxShadow: '0 25px 50px rgba(0,0,0,0.15)',
          transform: 'translateY(-2px)',
          transition: 'all 0.5s ease'
        }
      }}>
        <Box sx={{ p: 4, borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Tendances par Service
          </Typography>
        </Box>
        <Box sx={{ p: 4 }}>
          <Grid container spacing={3}>
            {analyticsData?.plaintesParService.map((service, index) => {
              const trend = service.count > 10 ? 'up' : service.count > 5 ? 'stable' : 'down'
              const trendColor = trend === 'up' ? '#ea580c' : trend === 'stable' ? '#0d9488' : '#059669'
              const trendText = trend === 'up' ? 'En hausse' : trend === 'stable' ? 'Stable' : 'En baisse'
              
              return (
                <Grid item xs={12} md={6} lg={4} key={index}>
                  <Card sx={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.95), rgba(255,255,255,0.98))',
                    backdropFilter: 'blur(10px)',
                    borderRadius: 3,
                    boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    p: 3,
                    '&:hover': {
                      boxShadow: '0 12px 35px rgba(0,0,0,0.15)',
                      transform: 'translateY(-2px)',
                      transition: 'all 0.3s ease'
                    }
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b' }}>
                        {service.service}
                      </Typography>
                      <Typography variant="caption" sx={{ 
                        fontWeight: 600, 
                        color: trendColor,
                        fontSize: '0.75rem'
                      }}>
                        {trendText}
                      </Typography>
                    </Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#1e293b', mb: 1 }}>
                      {service.count}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#64748b', mb: 2 }}>
                      {service.percentage.toFixed(1)}% du total
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                      <Box sx={{ 
                        width: '100%', 
                        bgcolor: '#e2e8f0', 
                        borderRadius: 1, 
                        height: 8 
                      }}>
                        <Box 
                          sx={{ 
                            background: 'linear-gradient(90deg, #3b82f6, #1d4ed8)',
                            height: 8,
                            borderRadius: 1,
                            transition: 'all 0.3s ease'
                          }}
                          style={{ width: `${service.percentage}%` }}
                        />
                      </Box>
                    </Box>
                  </Card>
                </Grid>
              )
            })}
          </Grid>
        </Box>
      </Card>

      {/* Indicateurs de tendances */}
      <Card sx={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.95), rgba(255,255,255,0.98))',
        backdropFilter: 'blur(20px)',
        borderRadius: 4,
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        '&:hover': {
          boxShadow: '0 25px 50px rgba(0,0,0,0.15)',
          transform: 'translateY(-2px)',
          transition: 'all 0.5s ease'
        }
      }}>
        <Box sx={{ p: 4, borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Indicateurs de Tendances
          </Typography>
        </Box>
        <Box sx={{ p: 4 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6} lg={3}>
              <Box sx={{
                textAlign: 'center',
                p: 3,
                background: 'linear-gradient(135deg, rgba(254, 215, 170, 0.3), rgba(251, 191, 36, 0.3))',
                borderRadius: 3,
                border: '1px solid rgba(251, 191, 36, 0.3)',
                boxShadow: '0 8px 25px rgba(0,0,0,0.1)'
              }}>
                <Typography variant="h3" sx={{ fontWeight: 600, color: '#ea580c' }}>
                  {analyticsData?.tendances.augmentation.length || 0}
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>
                  Tendances en hausse
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={6} lg={3}>
              <Box sx={{
                textAlign: 'center',
                p: 3,
                background: 'linear-gradient(135deg, rgba(167, 243, 208, 0.3), rgba(34, 197, 94, 0.3))',
                borderRadius: 3,
                border: '1px solid rgba(34, 197, 94, 0.3)',
                boxShadow: '0 8px 25px rgba(0,0,0,0.1)'
              }}>
                <Typography variant="h3" sx={{ fontWeight: 600, color: '#059669' }}>
                  {analyticsData?.tendances.diminution.length || 0}
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>
                  Tendances en baisse
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={6} lg={3}>
              <Box sx={{
                textAlign: 'center',
                p: 3,
                background: 'linear-gradient(135deg, rgba(153, 246, 228, 0.3), rgba(20, 184, 166, 0.3))',
                borderRadius: 3,
                border: '1px solid rgba(20, 184, 166, 0.3)',
                boxShadow: '0 8px 25px rgba(0,0,0,0.1)'
              }}>
                <Typography variant="h3" sx={{ fontWeight: 600, color: '#0d9488' }}>
                  {analyticsData?.tendances.stable.length || 0}
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>
                  Tendances stables
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={6} lg={3}>
              <Box sx={{
                textAlign: 'center',
                p: 3,
                background: 'linear-gradient(135deg, rgba(241, 245, 249, 0.3), rgba(148, 163, 184, 0.3))',
                borderRadius: 3,
                border: '1px solid rgba(148, 163, 184, 0.3)',
                boxShadow: '0 8px 25px rgba(0,0,0,0.1)'
              }}>
                <Typography variant="h3" sx={{ fontWeight: 600, color: '#64748b' }}>
                  {((analyticsData?.tendances.augmentation.length || 0) + 
                    (analyticsData?.tendances.diminution.length || 0) + 
                    (analyticsData?.tendances.stable.length || 0))}
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>
                  Total des tendances
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Card>
    </Box>
  );

  const renderPerformance = () => (
    <Card sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
        Métriques de Performance
      </Typography>
      <Grid container spacing={3} sx={{ mt: 2 }}>
        {analyticsData && Object.entries(analyticsData.metriquesPerformance).map(([key, value]) => (
          <Grid item xs={12} md={6} key={key}>
            <Box sx={{ p: 2, border: '1px solid', borderColor: 'grey.200', borderRadius: 2 }}>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                {typeof value === 'number' ? value.toFixed(1) : value}
                {key.includes('taux') || key.includes('satisfaction') ? '%' : key.includes('temps') ? 'j' : ''}
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={typeof value === 'number' ? Math.min(value, 100) : 0}
                sx={{ mt: 1, height: 6, borderRadius: 3 }}
              />
            </Box>
          </Grid>
        ))}
      </Grid>
    </Card>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, minWidth: 0 }}>
      {/* Tabs - Style exact du projet Healthcare */}
      <Card sx={{ 
        background: 'linear-gradient(135deg, rgba(255,255,255,0.95), rgba(255,255,255,0.98))',
        backdropFilter: 'blur(20px)',
        borderRadius: 4,
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        '&:hover': {
          boxShadow: '0 25px 50px rgba(0,0,0,0.15)',
          transform: 'translateY(-2px)',
          transition: 'all 0.5s ease'
        },
        p: 1
      }}>
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          {[
            { id: 'overview', label: 'VUE D\'ENSEMBLE', icon: ChartBarIcon },
            { id: 'services', label: 'PAR SERVICE', icon: ChartPieIcon },
            { id: 'trends', label: 'TENDANCES', icon: ArrowTrendingUpIcon },
            { id: 'performance', label: 'PERFORMANCE', icon: ClockIcon }
          ].map((tab) => (
            <Box
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                px: 3,
                py: 1.5,
                fontSize: '0.875rem',
                borderRadius: 3,
                transition: 'all 0.3s ease',
                fontWeight: 600,
                cursor: 'pointer',
                textTransform: 'uppercase',
                letterSpacing: '0.025em',
                ...(activeTab === tab.id
                  ? {
                      background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                      color: 'white',
                      boxShadow: '0 8px 25px rgba(59, 130, 246, 0.3)',
                      transform: 'scale(1.05)',
                      '& .MuiSvgIcon-root': {
                        color: 'white'
                      }
                    }
                  : {
                      color: '#64748b',
                      '&:hover': {
                        color: '#1e293b',
                        bgcolor: 'grey.50',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                      },
                      '& .MuiSvgIcon-root': {
                        color: '#64748b'
                      }
                    }
                )
              }}
            >
              <tab.icon sx={{ fontSize: 20 }} />
              <Typography variant="body2" sx={{ fontWeight: 'inherit', fontSize: 'inherit' }}>
                {tab.label}
              </Typography>
            </Box>
          ))}
        </Box>
      </Card>

      {/* Contenu des tabs */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'services' && renderServices()}
        {activeTab === 'trends' && renderTrends()}
        {activeTab === 'performance' && renderPerformance()}
      </Box>
    </Box>
  );
};

export default AnalyticsContent; 