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
  const [activeTab, setActiveTab] = useState<'services' | 'trends' | 'performance'>('services');
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

  const renderServices = () => {
    const services = (analyticsData?.plaintesParService || []).slice().sort((a, b) => b.count - a.count);
    const maxCount = services[0]?.count || 1;
    const totalCount = services.reduce((s, x) => s + x.count, 0);

    return (
      <Card sx={{
        background: '#ffffff',
        border: '1px solid #ebebef',
        borderRadius: 3,
        boxShadow: '0 1px 2px rgba(16, 24, 40, 0.04), 0 1px 3px rgba(16, 24, 40, 0.06)',
        overflow: 'hidden'
      }}>
        {/* Header table */}
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr 2.5fr 1fr',
          gap: 2,
          px: 3,
          py: 1.5,
          borderBottom: '1px solid #ebebef',
          bgcolor: '#fafafa'
        }}>
          <Typography sx={{ fontSize: '11px', fontWeight: 700, color: '#86868b', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Service</Typography>
          <Typography sx={{ fontSize: '11px', fontWeight: 700, color: '#86868b', letterSpacing: '0.06em', textTransform: 'uppercase', textAlign: 'right' }}>Volume</Typography>
          <Typography sx={{ fontSize: '11px', fontWeight: 700, color: '#86868b', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Distribution</Typography>
          <Typography sx={{ fontSize: '11px', fontWeight: 700, color: '#86868b', letterSpacing: '0.06em', textTransform: 'uppercase', textAlign: 'right' }}>% du total</Typography>
        </Box>

        {/* Lignes */}
        {services.length === 0 && (
          <Box sx={{ p: 5, textAlign: 'center', color: '#86868b', fontSize: '13px' }}>
            Aucune donnée disponible
          </Box>
        )}
        {services.map((service, idx) => {
          const pct = totalCount > 0 ? (service.count / totalCount) * 100 : 0;
          const barWidth = (service.count / maxCount) * 100;
          return (
            <Box
              key={service.service}
              sx={{
                display: 'grid',
                gridTemplateColumns: '2fr 1fr 2.5fr 1fr',
                gap: 2,
                px: 3,
                py: 1.75,
                alignItems: 'center',
                borderBottom: idx < services.length - 1 ? '1px solid #f5f5f7' : 'none',
                transition: 'background 0.15s ease',
                '&:hover': { bgcolor: '#fafafa' }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, minWidth: 0 }}>
                <Box sx={{
                  width: 22,
                  height: 22,
                  borderRadius: '6px',
                  bgcolor: '#f5f5f7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#86868b',
                  flexShrink: 0
                }}>{idx + 1}</Box>
                <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#1d1d1f', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {service.service}
                </Typography>
              </Box>
              <Typography sx={{ fontSize: '14px', fontWeight: 700, color: '#1d1d1f', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                {service.count}
              </Typography>
              <Box sx={{ width: '100%', height: 6, bgcolor: '#f1f1f3', borderRadius: '999px', overflow: 'hidden' }}>
                <Box sx={{
                  width: `${barWidth}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #0d9488, #5eead4)',
                  borderRadius: '999px',
                  transition: 'width 0.4s ease'
                }} />
              </Box>
              <Typography sx={{ fontSize: '13px', fontWeight: 500, color: '#86868b', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                {pct.toFixed(1)}%
              </Typography>
            </Box>
          );
        })}
      </Card>
    );
  };

  const renderTrends = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Évolution temporelle - chart hero */}
      <Card sx={{
        background: '#ffffff',
        border: '1px solid #ebebef',
        borderRadius: 3,
        boxShadow: '0 1px 2px rgba(16, 24, 40, 0.04), 0 1px 3px rgba(16, 24, 40, 0.06)',
        p: 3
      }}>
        <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', mb: 2 }}>
          <Box>
            <Typography sx={{ fontSize: '0.95rem', fontWeight: 700, color: '#1d1d1f', letterSpacing: '-0.01em' }}>
              Évolution des plaintes
            </Typography>
            <Typography sx={{ fontSize: '11px', color: '#86868b', fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase', mt: 0.25 }}>
              Volume quotidien · 30 derniers jours
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, fontSize: '12px', color: '#86868b' }}>
            <Box sx={{ width: 8, height: 8, bgcolor: '#0d9488', borderRadius: '2px' }} />
            <span>Plaintes / jour</span>
          </Box>
        </Box>
        <PlotlyChart
          data={[
            {
              x: analyticsData?.evolutionTemporelle.map(p => new Date(p.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })) || [],
              y: analyticsData?.evolutionTemporelle.map(p => p.count) || [],
              type: 'scatter',
              mode: 'lines',
              line: { color: '#0d9488', width: 2.5, shape: 'spline' },
              fill: 'tozeroy',
              fillcolor: 'rgba(13, 148, 136, 0.08)',
              hovertemplate: '<b>%{x}</b><br>%{y} plaintes<extra></extra>'
            }
          ]}
          layout={{
            margin: { l: 40, r: 16, t: 8, b: 40 },
            xaxis: { showgrid: false, tickfont: { color: '#86868b', size: 10 } },
            yaxis: { showgrid: true, gridcolor: '#f1f1f3', tickfont: { color: '#86868b', size: 10 }, zeroline: false },
            plot_bgcolor: 'rgba(0,0,0,0)',
            paper_bgcolor: 'rgba(0,0,0,0)',
            font: { family: 'Inter, sans-serif', color: '#1d1d1f' },
            hovermode: 'x unified',
            showlegend: false
          }}
          className="h-80"
        />
      </Card>

      {/* Distribution par statut */}
      <Card sx={{
        background: '#ffffff',
        border: '1px solid #ebebef',
        borderRadius: 3,
        boxShadow: '0 1px 2px rgba(16, 24, 40, 0.04), 0 1px 3px rgba(16, 24, 40, 0.06)',
        p: 3
      }}>
        <Box sx={{ mb: 2.5 }}>
          <Typography sx={{ fontSize: '0.95rem', fontWeight: 700, color: '#1d1d1f', letterSpacing: '-0.01em' }}>
            Distribution par statut
          </Typography>
          <Typography sx={{ fontSize: '11px', color: '#86868b', fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase', mt: 0.25 }}>
            Pipeline de traitement
          </Typography>
        </Box>
        {(() => {
          const statuts = [
            { key: 'RECU', label: 'Reçues', color: '#86868b' },
            { key: 'EN_COURS', label: 'En cours', color: '#0d9488' },
            { key: 'TRAITE', label: 'Traitées', color: '#059669' },
            { key: 'CLOTURE', label: 'Clôturées', color: '#1d1d1f' }
          ];
          const totals = statistiquesGlobales || { nouvelles: 0, en_cours: 0, traitees: 0, cloturees: 0 } as any;
          const counts: Record<string, number> = {
            RECU: totals.nouvelles || 0,
            EN_COURS: totals.en_cours || 0,
            TRAITE: totals.traitees || 0,
            CLOTURE: totals.cloturees || 0
          };
          const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1;

          return (
            <>
              {/* Barre stack horizontale */}
              <Box sx={{ display: 'flex', height: 14, borderRadius: '999px', overflow: 'hidden', mb: 2.5, bgcolor: '#f1f1f3' }}>
                {statuts.map(s => {
                  const w = (counts[s.key] / total) * 100;
                  if (w === 0) return null;
                  return (
                    <Box key={s.key} sx={{
                      width: `${w}%`,
                      bgcolor: s.color,
                      transition: 'width 0.5s ease'
                    }} />
                  );
                })}
              </Box>
              {/* Légende avec compteurs */}
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2 }}>
                {statuts.map(s => (
                  <Box key={s.key}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.5 }}>
                      <Box sx={{ width: 8, height: 8, bgcolor: s.color, borderRadius: '2px' }} />
                      <Typography sx={{ fontSize: '11px', color: '#86868b', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                        {s.label}
                      </Typography>
                    </Box>
                    <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, color: '#1d1d1f', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
                      {counts[s.key]}
                    </Typography>
                    <Typography sx={{ fontSize: '11px', color: '#86868b', fontWeight: 500, mt: 0.25 }}>
                      {((counts[s.key] / total) * 100).toFixed(1)}% du total
                    </Typography>
                  </Box>
                ))}
              </Box>
            </>
          );
        })()}
      </Card>

    </Box>
  );

  const renderPerformance = () => {
    // Définition des KPIs avec cible, unité, formatage
    type Kpi = { key: string; label: string; value: number; target: number; unit: '%' | 'j' | ''; higherIsBetter: boolean };
    const m = analyticsData?.metriquesPerformance;
    const kpis: Kpi[] = m ? [
      { key: 'taux_resolution', label: 'Taux de résolution', value: m.taux_resolution, target: 80, unit: '%', higherIsBetter: true },
      { key: 'satisfaction_client', label: 'Satisfaction patient', value: (m.satisfaction_client / 5) * 100, target: 80, unit: '%', higherIsBetter: true },
      { key: 'qualite_soins', label: 'Qualité des soins', value: m.qualite_soins, target: 90, unit: '%', higherIsBetter: true },
      { key: 'temps_traitement_moyen', label: 'Délai de traitement', value: m.temps_traitement_moyen, target: 5, unit: 'j', higherIsBetter: false },
      { key: 'temps_reponse_moyen', label: 'Temps de réponse', value: m.temps_reponse_moyen, target: 2, unit: 'j', higherIsBetter: false },
      { key: 'taux_recurrence', label: 'Taux de récurrence', value: m.taux_recurrence, target: 5, unit: '%', higherIsBetter: false }
    ] : [];

    return (
      <Card sx={{
        background: '#ffffff',
        border: '1px solid #ebebef',
        borderRadius: 3,
        boxShadow: '0 1px 2px rgba(16, 24, 40, 0.04), 0 1px 3px rgba(16, 24, 40, 0.06)',
        overflow: 'hidden'
      }}>
        <Box sx={{ px: 3, py: 2, borderBottom: '1px solid #ebebef', display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <Box>
            <Typography sx={{ fontSize: '0.95rem', fontWeight: 700, color: '#1d1d1f', letterSpacing: '-0.01em' }}>
              Indicateurs de performance
            </Typography>
            <Typography sx={{ fontSize: '11px', color: '#86868b', fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase', mt: 0.25 }}>
              Mesure vs objectifs internes
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, fontSize: '11px', color: '#86868b' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box sx={{ width: 7, height: 7, bgcolor: '#059669', borderRadius: '50%' }} />
              <span>Atteint</span>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box sx={{ width: 7, height: 7, bgcolor: '#b45309', borderRadius: '50%' }} />
              <span>Proche</span>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box sx={{ width: 7, height: 7, bgcolor: '#86868b', borderRadius: '50%' }} />
              <span>Hors cible</span>
            </Box>
          </Box>
        </Box>

        {kpis.map((kpi, idx) => {
          // Pour les "moins c'est mieux", on inverse l'échelle visuelle
          const scale = kpi.higherIsBetter ? 100 : Math.max(kpi.target * 2, kpi.value * 1.3);
          const pct = Math.min((kpi.value / scale) * 100, 100);
          const targetPct = Math.min((kpi.target / scale) * 100, 100);

          // Status
          const ratio = kpi.higherIsBetter ? kpi.value / kpi.target : kpi.target / kpi.value;
          const status = ratio >= 1 ? 'on' : ratio >= 0.85 ? 'near' : 'off';
          const statusColor = status === 'on' ? '#059669' : status === 'near' ? '#b45309' : '#86868b';
          const barColor = status === 'on' ? '#0d9488' : status === 'near' ? '#d97706' : '#86868b';

          return (
            <Box
              key={kpi.key}
              sx={{
                display: 'grid',
                gridTemplateColumns: '220px 90px 1fr 90px',
                gap: 3,
                alignItems: 'center',
                px: 3,
                py: 2,
                borderBottom: idx < kpis.length - 1 ? '1px solid #f5f5f7' : 'none',
                transition: 'background 0.15s ease',
                '&:hover': { bgcolor: '#fafafa' }
              }}
            >
              {/* Label + status dot */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 7, height: 7, bgcolor: statusColor, borderRadius: '50%', flexShrink: 0 }} />
                <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#1d1d1f' }}>
                  {kpi.label}
                </Typography>
              </Box>

              {/* Valeur actuelle */}
              <Typography sx={{ fontSize: '1.1rem', fontWeight: 700, color: '#1d1d1f', fontVariantNumeric: 'tabular-nums', textAlign: 'right' }}>
                {kpi.value.toFixed(1)}{kpi.unit}
              </Typography>

              {/* Bullet bar avec target tick */}
              <Box sx={{ position: 'relative', height: 8, bgcolor: '#f1f1f3', borderRadius: '999px', overflow: 'visible' }}>
                <Box sx={{
                  width: `${pct}%`,
                  height: '100%',
                  bgcolor: barColor,
                  borderRadius: '999px',
                  transition: 'width 0.5s ease'
                }} />
                {/* Target tick mark */}
                <Box sx={{
                  position: 'absolute',
                  left: `${targetPct}%`,
                  top: -3,
                  bottom: -3,
                  width: 2,
                  bgcolor: '#1d1d1f',
                  borderRadius: '1px',
                  transform: 'translateX(-1px)'
                }} />
              </Box>

              {/* Cible */}
              <Typography sx={{ fontSize: '11px', fontWeight: 500, color: '#86868b', textAlign: 'right', letterSpacing: '0.02em' }}>
                Cible {kpi.target}{kpi.unit}
              </Typography>
            </Box>
          );
        })}
      </Card>
    );
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, minWidth: 0 }}>
      {/* Tabs - Premium executive style */}
      <Box sx={{
        background: '#ffffff',
        borderRadius: '10px',
        border: '1px solid #ebebef',
        boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
        p: 0.5,
        display: 'inline-flex',
        alignSelf: 'flex-start'
      }}>
        <Box sx={{ display: 'flex', gap: 0.25 }}>
          {[
            { id: 'services', label: 'Par service', icon: ChartPieIcon },
            { id: 'trends', label: 'Tendances', icon: ArrowTrendingUpIcon },
            { id: 'performance', label: 'Performance', icon: ClockIcon }
          ].map((tab) => (
            <Box
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.75,
                px: 2,
                py: 1,
                fontSize: '0.8125rem',
                borderRadius: '7px',
                transition: 'all 0.15s ease',
                fontWeight: 600,
                cursor: 'pointer',
                letterSpacing: '-0.005em',
                ...(activeTab === tab.id
                  ? {
                      background: '#0f172a',
                      color: '#ffffff',
                      '& .MuiSvgIcon-root': { color: '#5eead4' }
                    }
                  : {
                      color: '#64748b',
                      '&:hover': {
                        color: '#1d1d1f',
                        bgcolor: '#f8fafc'
                      },
                      '& .MuiSvgIcon-root': { color: '#94a3b8' }
                    }
                )
              }}
            >
              <tab.icon sx={{ fontSize: 16 }} />
              <Typography variant="body2" sx={{ fontWeight: 'inherit', fontSize: 'inherit' }}>
                {tab.label}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Contenu des tabs - hauteur stabilisée pour éviter le saut visuel */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, minHeight: '600px' }}>
        {activeTab === 'services' && renderServices()}
        {activeTab === 'trends' && renderTrends()}
        {activeTab === 'performance' && renderPerformance()}
      </Box>
    </Box>
  );
};

export default AnalyticsContent; 