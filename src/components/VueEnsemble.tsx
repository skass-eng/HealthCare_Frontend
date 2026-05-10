import React from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Grid,
  CircularProgress
} from '@mui/material';
import {
  PieChart as ChartPieIcon,
  TrendingUp as ArrowTrendingUpIcon,
  BarChart as ChartBarIcon,
  Assignment as ClipboardDocumentListIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ClockIcon,
  Warning as ExclamationTriangleIcon
} from '@mui/icons-material';
import PlotlyChart from './PlotlyChart';

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

interface VueEnsembleProps {
  analyticsData: AnalyticsData | null;
}

const VueEnsemble: React.FC<VueEnsembleProps> = ({ analyticsData }) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* KPIs Principaux - flat, sans card wrapper */}
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5, px: 0.5 }}>
          <Typography sx={{ fontWeight: 700, color: '#1d1d1f', fontSize: '0.95rem', letterSpacing: '-0.01em' }}>
            Indicateurs clés
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <Box sx={{
              width: 6,
              height: 6,
              bgcolor: '#10b981',
              borderRadius: '50%',
              animation: 'pulse 2s infinite'
            }} />
            <Typography sx={{ color: '#64748b', fontWeight: 500, fontSize: '11px', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              Temps réel
            </Typography>
          </Box>
        </Box>
        <Grid container spacing={2}>
            {([
              {
                Icon: ClipboardDocumentListIcon,
                value: (analyticsData?.plaintesParService.reduce((sum, service) => sum + service.count, 0) || 48).toString(),
                label: 'Total plaintes',
                accent: '#0f172a'
              },
              {
                Icon: CheckCircleIcon,
                value: `${(analyticsData?.metriquesPerformance?.satisfaction_client || 0).toFixed(1)}%`,
                label: 'Satisfaction',
                accent: '#059669'
              },
              {
                Icon: ClockIcon,
                value: `${(analyticsData?.metriquesPerformance?.temps_traitement_moyen || 0).toFixed(1)}j`,
                label: 'Temps moyen',
                accent: '#0d9488'
              },
              {
                Icon: ExclamationTriangleIcon,
                value: (analyticsData?.plaintesParPriorite.find(p => p.priorite === 'Urgent')?.count || 5).toString(),
                label: 'Urgentes',
                accent: '#b45309'
              }
            ] as const).map((kpi) => (
              <Grid item xs={6} md={3} key={kpi.label}>
                <Box sx={{
                  p: 2.5,
                  bgcolor: '#ffffff',
                  borderRadius: 2,
                  border: '1px solid #ebebef',
                  boxShadow: '0 1px 2px rgba(15, 23, 42, 0.03)',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    borderColor: '#cbd5e1',
                    transform: 'translateY(-1px)'
                  }
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                    <Box sx={{
                      width: 32,
                      height: 32,
                      borderRadius: 1.5,
                      bgcolor: '#f8fafc',
                      border: '1px solid #ebebef',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <kpi.Icon sx={{ color: kpi.accent, fontSize: 17 }} />
                    </Box>
                  </Box>
                  <Typography sx={{ fontWeight: 700, color: kpi.accent, fontSize: '1.875rem', lineHeight: 1, letterSpacing: '-0.02em', mb: 0.5 }}>
                    {kpi.value}
                  </Typography>
                  <Typography sx={{ color: '#64748b', fontWeight: 500, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {kpi.label}
                  </Typography>
                </Box>
              </Grid>
            ))}
        </Grid>
      </Box>

      {/* Graphiques Principaux */}
      <Grid container spacing={3}>
        {/* Répartition par Priorité */}
        <Grid item xs={12} lg={6}>
          <Card sx={{
            background: '#ffffff',
            border: '1px solid #ebebef',
            borderRadius: 3,
            boxShadow: '0 1px 2px rgba(16, 24, 40, 0.04), 0 1px 3px rgba(16, 24, 40, 0.06)',
            p: 3
          }}>
            <Typography sx={{ fontWeight: 700, mb: 2.5, color: '#1d1d1f', fontSize: '1.05rem', letterSpacing: '-0.01em' }}>
              Répartition par priorité
            </Typography>
            {analyticsData?.plaintesParPriorite && analyticsData.plaintesParPriorite.some(p => p.count > 0) ? (
              <PlotlyChart
                data={[
                  {
                    values: analyticsData.plaintesParPriorite.map(p => p.count),
                    labels: analyticsData.plaintesParPriorite.map(p => p.priorite),
                    type: 'pie',
                    hole: 0.55,
                    marker: {
                      colors: ['#0f172a', '#b45309', '#0d9488', '#94a3b8'],
                      line: { color: '#ffffff', width: 2 }
                    },
                    textinfo: 'percent',
                    textposition: 'outside',
                    textfont: {
                      size: 12,
                      color: '#1d1d1f',
                      family: 'Inter, sans-serif'
                    },
                    hovertemplate: '<b>%{label}</b><br>Plaintes: %{value}<br>Pourcentage: %{percent}<extra></extra>'
                  }
                ]}
                layout={{
                  margin: { l: 20, r: 20, t: 20, b: 20 },
                  plot_bgcolor: 'rgba(0,0,0,0)',
                  paper_bgcolor: 'rgba(0,0,0,0)',
                  font: {
                    color: '#1d1d1f',
                    family: 'Inter, sans-serif'
                  },
                  showlegend: true,
                  legend: {
                    orientation: 'h',
                    y: -0.05,
                    font: { size: 11, color: '#64748b' }
                  }
                }}
                className="h-80"
              />
            ) : (
              <Box sx={{ height: 320, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Box sx={{ textAlign: 'center', color: '#94a3b8' }}>
                  <ChartPieIcon sx={{ fontSize: 56, opacity: 0.4, mb: 1.5 }} />
                  <Typography sx={{ fontSize: '13px' }}>Aucune donnée disponible</Typography>
                </Box>
              </Box>
            )}
          </Card>
        </Grid>

        {/* Évolution Temporelle */}
        <Grid item xs={12} lg={6}>
          <Card sx={{
            background: '#ffffff',
            border: '1px solid #ebebef',
            borderRadius: 3,
            boxShadow: '0 1px 2px rgba(16, 24, 40, 0.04), 0 1px 3px rgba(16, 24, 40, 0.06)',
            p: 3
          }}>
            <Typography sx={{ fontWeight: 700, mb: 2.5, color: '#1d1d1f', fontSize: '1.05rem', letterSpacing: '-0.01em' }}>
              Évolution des plaintes
            </Typography>
            {analyticsData?.evolutionTemporelle && analyticsData.evolutionTemporelle.length > 0 ? (
              <PlotlyChart
                data={[
                  {
                    x: analyticsData.evolutionTemporelle.map(p => new Date(p.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })),
                    y: analyticsData.evolutionTemporelle.map(p => p.count),
                    type: 'scatter',
                    mode: 'lines+markers',
                    line: {
                      color: '#0d9488',
                      width: 2.5,
                      shape: 'spline'
                    },
                    marker: {
                      color: '#0d9488',
                      size: 6,
                      line: { color: '#ffffff', width: 1.5 }
                    },
                    fill: 'tozeroy',
                    fillcolor: 'rgba(13, 148, 136, 0.08)',
                    hovertemplate: '<b>%{x}</b><br>Plaintes: %{y}<extra></extra>'
                  }
                ]}
                layout={{
                  margin: { l: 50, r: 20, t: 20, b: 60 },
                  xaxis: {
                    title: { text: '', font: { color: '#94a3b8', size: 11 } },
                    tickfont: { color: '#94a3b8', size: 11 },
                    showgrid: false,
                    tickangle: -45
                  },
                  yaxis: {
                    title: { text: '', font: { color: '#94a3b8', size: 11 } },
                    tickfont: { color: '#94a3b8', size: 11 },
                    showgrid: true,
                    gridcolor: '#f1f5f9'
                  },
                  plot_bgcolor: 'rgba(0,0,0,0)',
                  paper_bgcolor: 'rgba(0,0,0,0)',
                  font: { color: '#1d1d1f', family: 'Inter, sans-serif' },
                  hovermode: 'x unified'
                }}
                className="h-80"
              />
            ) : (
              <Box sx={{ height: 320, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Box sx={{ textAlign: 'center', color: '#94a3b8' }}>
                  <ArrowTrendingUpIcon sx={{ fontSize: 56, opacity: 0.4, mb: 1.5 }} />
                  <Typography sx={{ fontSize: '13px' }}>Aucune donnée disponible</Typography>
                </Box>
              </Box>
            )}
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default VueEnsemble; 