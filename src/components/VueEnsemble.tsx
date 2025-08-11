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
      {/* KPIs Principaux - Version Simplifiée */}
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
          <Typography variant="h6" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', mb: 1 }}>
            <ChartBarIcon sx={{ mr: 1, color: 'primary.main' }} />
            Indicateurs Clés
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ 
              width: 8, 
              height: 8, 
              bgcolor: 'success.main', 
              borderRadius: '50%',
              animation: 'pulse 2s infinite'
            }} />
            <Typography variant="body2" sx={{ color: 'success.main', fontWeight: 500 }}>
              Données en temps réel
            </Typography>
          </Box>
        </Box>
        <Box sx={{ p: 4 }}>
          <Grid container spacing={3}>
            <Grid item xs={6} md={3}>
              <Box sx={{ 
                textAlign: 'center', 
                p: 3, 
                bgcolor: 'grey.50', 
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'grey.200',
                boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
              }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                  <ClipboardDocumentListIcon sx={{ color: 'grey.600', fontSize: 24 }} />
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 600, color: 'grey.800' }}>
                  {analyticsData?.plaintesParService.reduce((sum, service) => sum + service.count, 0) || 48}
                </Typography>
                <Typography variant="body2" sx={{ color: 'grey.600', fontWeight: 500 }}>
                  Total Plaintes
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} md={3}>
              <Box sx={{ 
                textAlign: 'center', 
                p: 3, 
                bgcolor: 'success.50', 
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'success.200',
                boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
              }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                  <CheckCircleIcon sx={{ color: 'success.main', fontSize: 24 }} />
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 600, color: 'success.main' }}>
                  {(analyticsData?.metriquesPerformance?.satisfaction_client || 0).toFixed(2)}%
                </Typography>
                <Typography variant="body2" sx={{ color: 'grey.600', fontWeight: 500 }}>
                  Satisfaction
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} md={3}>
              <Box sx={{ 
                textAlign: 'center', 
                p: 3, 
                bgcolor: 'info.50', 
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'info.200',
                boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
              }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                  <ClockIcon sx={{ color: 'info.main', fontSize: 24 }} />
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 600, color: 'info.main' }}>
                  {(analyticsData?.metriquesPerformance?.temps_traitement_moyen || 0).toFixed(2)}j
                </Typography>
                <Typography variant="body2" sx={{ color: 'grey.600', fontWeight: 500 }}>
                  Temps Moyen
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} md={3}>
              <Box sx={{ 
                textAlign: 'center', 
                p: 3, 
                bgcolor: 'warning.50', 
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'warning.200',
                boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
              }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                  <ExclamationTriangleIcon sx={{ color: 'warning.main', fontSize: 24 }} />
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 600, color: 'warning.main' }}>
                  {analyticsData?.plaintesParPriorite.find(p => p.priorite === 'Urgent')?.count || 5}
                </Typography>
                <Typography variant="body2" sx={{ color: 'grey.600', fontWeight: 500 }}>
                  Urgentes
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Card>

      {/* Graphiques Principaux */}
      <Grid container spacing={3}>
        {/* Répartition par Priorité */}
        <Grid item xs={12} lg={6}>
          <Card sx={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.95), rgba(255,255,255,0.98))',
            backdropFilter: 'blur(20px)',
            borderRadius: 4,
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
            p: 3
          }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              Répartition par Priorité
            </Typography>
            {analyticsData?.plaintesParPriorite && analyticsData.plaintesParPriorite.some(p => p.count > 0) ? (
              <PlotlyChart
                data={[
                  {
                    values: analyticsData.plaintesParPriorite.map(p => p.count),
                    labels: analyticsData.plaintesParPriorite.map(p => p.priorite),
                    type: 'pie',
                    marker: {
                      colors: ['#94a3b8', '#34d399', '#5eead4', '#fb923c'], // Slate, Emerald, Teal, Orange avec même douceur
                      line: { color: '#000000', width: 2 }, // Noir simple
                      pattern: {
                        shape: 'horizontal',
                        size: 2,
                        solidity: 0.15
                      }
                    },
                    textinfo: 'percent',
                    textposition: 'outside',
                    textfont: {
                      size: 12,
                      color: '#374151',
                      family: 'Inter, sans-serif'
                    },
                    hovertemplate: '<b>%{label}</b><br>Plaintes: %{value}<br>Pourcentage: %{percent}<extra></extra>',
                    pull: [0.02, 0.02, 0.02, 0.02], // Séparation subtile
                    rotation: 0
                  }
                ]}
                layout={{
                  margin: { l: 20, r: 20, t: 40, b: 20 },
                  plot_bgcolor: 'rgba(0,0,0,0)',
                  paper_bgcolor: 'rgba(0,0,0,0)',
                  font: { 
                    color: '#374151',
                    family: 'Inter, sans-serif'
                  },
                  showlegend: false
                }}
                className="h-80"
              />
            ) : (
              <Box sx={{ height: 320, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Box sx={{ textAlign: 'center', color: 'text.secondary' }}>
                  <ChartPieIcon sx={{ fontSize: 64, opacity: 0.5, mb: 2 }} />
                  <Typography>Aucune donnée disponible</Typography>
                </Box>
              </Box>
            )}
          </Card>
        </Grid>

        {/* Évolution Temporelle */}
        <Grid item xs={12} lg={6}>
          <Card sx={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.95), rgba(255,255,255,0.98))',
            backdropFilter: 'blur(20px)',
            borderRadius: 4,
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
            p: 3
          }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              Évolution des Plaintes
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
                      color: '#10b981', // Emerald - cohérent avec le design
                      width: 3,
                      shape: 'spline'
                    },
                    marker: { 
                      color: '#10b981', 
                      size: 6,
                      line: { color: 'white', width: 1 }
                    },
                    fill: 'tonexty',
                    fillcolor: 'rgba(16, 185, 129, 0.1)', // Emerald avec transparence
                    hovertemplate: '<b>%{x}</b><br>Plaintes: %{y}<extra></extra>'
                  }
                ]}
                layout={{
                  margin: { l: 50, r: 20, t: 20, b: 60 },
                  xaxis: { 
                    title: { text: 'Date', font: { color: '#6b7280' } },
                    tickfont: { color: '#6b7280' },
                    showgrid: true,
                    gridcolor: 'rgba(0,0,0,0.1)',
                    tickangle: -90
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
            ) : (
              <Box sx={{ height: 320, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Box sx={{ textAlign: 'center', color: 'text.secondary' }}>
                  <ArrowTrendingUpIcon sx={{ fontSize: 64, opacity: 0.5, mb: 2 }} />
                  <Typography>Aucune donnée disponible</Typography>
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