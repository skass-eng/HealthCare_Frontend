import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Container,
  Avatar,
  Chip,
  Paper,
  Stack,
  CircularProgress,
  Alert,
  Skeleton
} from '@mui/material';
import {
  Security as SecurityIcon,
  Analytics as AnalyticsIcon,
  Description as DescriptionIcon,
  Settings as SettingsIcon,
  Lightbulb as LightbulbIcon,
  FlashOn as FlashIcon,
  AutoAwesome as SparklesIcon,
  SentimentSatisfiedAlt as FaceSmileIcon,
  LocalOffer as TagIcon,
  Warning as ExclamationTriangleIcon,
  Summarize as SummaryIcon,
  Settings as Cog8ToothIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

// Imports pour l'architecture ODYSSEE
import { useHealthcareAiStore } from '../hooks/useHealthcareAiStore';
import { useAppClient } from '../lib/AppClientContext';

const HealthcareAI: React.FC = () => {
  const navigate = useNavigate();
  const { setCurrentPage } = useAppClient();
  
  // Définir la page courante au montage du composant
  useEffect(() => {
    setCurrentPage('healthcare-ai');
  }, [setCurrentPage]);
  
  // Hook pour récupérer les données depuis le store Redux
  const {
    summary,
    formattedData,
    isLoading,
    hasError,
    hasData,
    refreshSummaryData,
    updateAutoRefresh,
    updateRefreshInterval
  } = useHealthcareAiStore();



  // Forcer le chargement des données si elles ne sont pas présentes
  useEffect(() => {
    if (!summary.data && !summary.isLoading && !summary.error) {
      console.log('🔄 Forçage du chargement des données Healthcare AI');
      refreshSummaryData();
    }
  }, [summary.data, summary.isLoading, summary.error, refreshSummaryData]);



  // Configuration du rafraîchissement automatique
  useEffect(() => {
    updateAutoRefresh(true);
    updateRefreshInterval(30000); // 30 secondes
  }, [updateAutoRefresh, updateRefreshInterval]);

  const handleStartNow = () => {
    navigate('/dashboard-unified');
  };

  const handleLearnMore = () => {
    navigate('/services-kpi');
  };

  const handleFeatureClick = (featureTitle: string) => {
    switch (featureTitle) {
      case 'Gestion Complète':
        navigate('/plaintes-dashboard');
        break;
      case 'IA & Optimisation':
        navigate('/ameliorations');
        break;
      case 'Administration':
        navigate('/analytics-v2');
        break;
      case 'Traitement Rapide':
        navigate('/plaintes/nouvelles');
        break;
      case 'Sécurité Renforcée':
        navigate('/settings');
        break;
      case 'Configuration Flexible':
        navigate('/settings');
        break;
      default:
        navigate('/dashboard-unified');
    }
  };

  // Données dynamiques des stats basées sur l'API (architecture ODYSSEE)
  const getStatsFromData = () => {
    if (!formattedData) {
      return [
        { icon: DescriptionIcon, number: '---', label: 'Total Plaintes', color: '#1d1d1f', isLoading: true, subtitle: undefined },
        { icon: AnalyticsIcon, number: '---', label: 'En Cours', color: '#0d9488', isLoading: true, subtitle: undefined },
        { icon: SecurityIcon, number: '---', label: 'Résolues', color: '#059669', isLoading: true, subtitle: undefined },
        { icon: SettingsIcon, number: '---', label: 'Temps Moyen', color: '#86868b', isLoading: true, subtitle: undefined }
      ];
    }

    return [
      { 
        icon: DescriptionIcon, 
        number: (formattedData.total || 0).toString(), 
        label: 'Total Plaintes', 
        color: '#1d1d1f',
        subtitle: `+${formattedData.nouvelles || 0} nouvelles`,
        isLoading: false
      },
      { 
        icon: AnalyticsIcon, 
        number: (formattedData.inProgress || 0).toString(), 
        label: 'En Cours', 
        color: '#0d9488',
        subtitle: `${formattedData.progressPercentage || 0}% du total`,
        isLoading: false
      },
      { 
        icon: SecurityIcon, 
        number: (formattedData.resolved || 0).toString(), 
        label: 'Résolues', 
        color: '#059669',
        subtitle: `${formattedData.resolvedPercentage || 0}% du total`,
        isLoading: false
      },
      { 
        icon: SettingsIcon, 
        number: formattedData.avgResolutionTime || 'N/A', 
        label: 'Temps Moyen', 
        color: '#86868b',
        subtitle: 'de résolution',
        isLoading: false
      }
    ];
  };

  const stats = getStatsFromData();

  const features = [
    {
      icon: DescriptionIcon,
      title: 'Gestion Complète',
      description: 'Interface intuitive pour le suivi et la validation des réclamations avec workflow automatisé',
      color: '#1d1d1f',
      bgColor: '#ffffff'
    },
    {
      icon: LightbulbIcon,
      title: 'IA & Optimisation',
      description: 'Suggestions intelligentes et améliorations continues basées sur l\'analyse des données',
      color: '#0d9488',
      bgColor: '#ffffff'
    },
    {
      icon: Cog8ToothIcon,
      title: 'Administration',
      description: 'Gestion des organisations et services avec configuration avancée',
      color: '#0d9488',
      bgColor: '#ffffff'
    },
    {
      icon: FlashIcon,
      title: 'Traitement Rapide',
      description: 'Automatisation des processus pour réduire les délais de traitement des plaintes',
      color: '#86868b',
      bgColor: '#ffffff'
    },
    {
      icon: SecurityIcon,
      title: 'Sécurité Renforcée',
      description: 'Protection des données sensibles avec chiffrement et accès sécurisé',
      color: '#1d1d1f',
      bgColor: '#ffffff'
    },
    {
      icon: SettingsIcon,
      title: 'Configuration Flexible',
      description: 'Paramètres personnalisables pour adapter la plateforme à vos besoins spécifiques',
      color: '#0d9488',
      bgColor: '#ffffff'
    }
  ];

  const aiFeatures = [
    {
      icon: FaceSmileIcon,
      title: 'Analyse de Sentiment',
      description: 'Détection automatique du sentiment (positif, négatif, neutre) dans les plaintes',
      color: '#1d1d1f',
      badge: '+ Disponible avec l\'API V2',
      badgeColor: '#3b82f6',
      badgeIcon: SparklesIcon
    },
    {
      icon: TagIcon,
      title: 'Classification Auto',
      description: 'Catégorisation intelligente des plaintes par type, priorité et service',
      color: '#0d9488',
      badge: 'IA Intégrée',
      badgeColor: '#14b8a6',
      badgeIcon: SettingsIcon
    },
    {
      icon: LightbulbIcon,
      title: 'Suggestions IA',
      description: 'Recommandations automatiques pour le traitement des plaintes',
      color: '#1d1d1f',
      badge: 'Machine Learning',
      badgeColor: '#6366f1',
      badgeIcon: SparklesIcon
    },
    {
      icon: AnalyticsIcon,
      title: 'Analytics Prédictive',
      description: 'Prédiction des tendances et identification des risques',
      color: '#86868b',
      badge: 'Big Data',
      badgeColor: '#64748b',
      badgeIcon: DescriptionIcon
    },
    {
      icon: ExclamationTriangleIcon,
      title: 'Détection d\'Anomalies',
      description: 'Identification automatique des patterns inhabituels',
      color: '#0d9488',
      badge: 'Temps Réel',
      badgeColor: '#06b6d4',
      badgeIcon: FlashIcon
    },
    {
      icon: SummaryIcon,
      title: 'Résumé Auto',
      description: 'Génération automatique de résumés et points clés',
      color: '#059669',
      badge: 'NLP Avancé',
      badgeColor: '#10b981',
      badgeIcon: DescriptionIcon
    }
  ];

  const workflowSteps = [
    { step: '01', title: 'Réception', description: 'Plaintes reçues et enregistrées automatiquement', icon: '📨', color: '#1d1d1f' },
    { step: '02', title: 'Analyse', description: 'Évaluation IA et classification des priorités', icon: '🔍', color: '#0d9488' },
    { step: '03', title: 'Traitement', description: 'Résolution et suivi des actions correctives', icon: '⚡', color: '#059669' },
    { step: '04', title: 'Validation', description: 'Contrôle qualité et clôture des dossiers', icon: '✅', color: '#86868b' }
  ];

  return (
    <Box sx={{ minHeight: '100vh', background: '#f5f5f7' }}>
      {/* Header Section - hero avec subtle teal wash pour donner de la vie */}
      <Box sx={{
        position: 'relative',
        background: 'radial-gradient(ellipse at top, rgba(94, 234, 212, 0.18), transparent 60%), radial-gradient(ellipse at 80% 0%, rgba(13, 148, 136, 0.10), transparent 50%)',
        overflow: 'hidden'
      }}>
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, py: 5 }}>
          {/* Logo et Titre */}
          <Box sx={{ textAlign: 'center', mb: 5 }}>
            {/* Pill badge "PLATEFORME IA" pour donner de l'âme */}
            <Box sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.75,
              bgcolor: '#ffffff',
              border: '1px solid #ebebef',
              boxShadow: '0 1px 2px rgba(16, 24, 40, 0.04)',
              borderRadius: '999px',
              px: 1.5,
              py: 0.5,
              mb: 2.5
            }}>
              <Box sx={{ width: 6, height: 6, bgcolor: '#10b981', borderRadius: '50%', animation: 'pulse 2s infinite' }} />
              <Typography sx={{ fontSize: '11px', fontWeight: 700, color: '#0d9488', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Plateforme IA · Healthcare
              </Typography>
            </Box>

            <Box
              sx={{
                width: 64,
                height: 64,
                background: '#ffffff',
                border: '1px solid #ebebef',
                borderRadius: '14px',
                boxShadow: '0 1px 2px rgba(16, 24, 40, 0.04), 0 1px 3px rgba(16, 24, 40, 0.06)',
                mb: 3,
                mx: 'auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <SecurityIcon sx={{ fontSize: 32, color: '#0d9488' }} />
            </Box>
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: '2rem', md: '2.75rem', lg: '3.25rem' },
                fontWeight: 700,
                color: '#1d1d1f',
                letterSpacing: '-0.03em',
                mb: 1
              }}
            >
              HealthCare <Box component="span" sx={{ color: '#0d9488' }}>AI</Box>
            </Typography>
            <Typography sx={{ fontSize: { xs: '1rem', md: '1.125rem' }, fontWeight: 500, color: '#86868b', mb: 1.5, letterSpacing: '-0.005em' }}>
              Gestion intelligente des plaintes hospitalières
            </Typography>
            <Typography sx={{ fontSize: '14px', color: '#86868b', maxWidth: '40rem', mx: 'auto', lineHeight: 1.5 }}>
              Une plateforme IA qui transforme la gestion des plaintes patient en moteur de qualité opérationnelle
            </Typography>
          </Box>

          {/* Header avec contrôles */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Box>
              <Typography variant="h6" sx={{ color: '#64748b', mb: 1 }}>
                Données en temps réel
              </Typography>
              {summary.lastUpdated && (
                <Typography variant="body2" sx={{ color: '#86868b' }}>
                  Dernière mise à jour: {new Date(summary.lastUpdated).toLocaleTimeString('fr-FR')}
                </Typography>
              )}
            </Box>
            <Button
              onClick={refreshSummaryData}
              startIcon={<RefreshIcon />}
              disabled={isLoading}
              sx={{
                borderRadius: 2,
                px: 3,
                py: 1,
                color: '#64748b',
                backgroundColor: '#ffffff',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 1)',
                  boxShadow: '0 1px 3px rgba(16, 24, 40, 0.06)'
                }
              }}
            >
              Actualiser
            </Button>
          </Box>

          {/* Gestion des erreurs */}
          {hasError && (
            <Alert 
              severity="error" 
              sx={{ mb: 4, borderRadius: 2 }}
              action={
                <Button color="inherit" size="small" onClick={refreshSummaryData}>
                  Réessayer
                </Button>
              }
            >
              {summary.error}
            </Alert>
          )}

          {/* Stats Cards */}
          <Grid container spacing={3} sx={{ mb: 8 }}>
            {stats.map((stat, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card
                  sx={{
                    background: '#ffffff',
                    borderRadius: 3,
                    boxShadow: '0 1px 2px rgba(16, 24, 40, 0.04), 0 1px 3px rgba(16, 24, 40, 0.06)',
                    border: '1px solid #ebebef',
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      borderColor: '#cbd5e1',
                      boxShadow: '0 4px 12px rgba(16, 24, 40, 0.08)'
                    }
                  }}
                >
                  {/* Accent line top */}
                  <Box sx={{
                    position: 'absolute', top: 0, left: 0, right: 0, height: 3,
                    background: stat.color,
                    opacity: 0.85
                  }} />
                  <CardContent sx={{ p: 3 }}>
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        background: `${stat.color}14`,
                        border: `1px solid ${stat.color}33`,
                        borderRadius: '8px',
                        mb: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {stat.isLoading ? (
                        <CircularProgress size={18} sx={{ color: stat.color }} />
                      ) : (
                        <stat.icon sx={{ fontSize: 20, color: stat.color }} />
                      )}
                    </Box>
                    <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#1d1d1f', mb: 1 }}>
                      {stat.isLoading ? (
                        <Skeleton width="60%" />
                      ) : (
                        stat.number
                      )}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#64748b' }}>
                      {stat.label}
                    </Typography>
                    {stat.subtitle && !stat.isLoading && (
                      <Typography variant="caption" sx={{ color: '#86868b', display: 'block', mt: 0.5 }}>
                        {stat.subtitle}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Box sx={{ textAlign: 'center', mb: 5 }}>
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: '2rem', md: '3rem' },
              fontWeight: 'bold',
              color: '#1d1d1f',
              letterSpacing: '-0.02em',
              mb: 3
            }}
          >
            Fonctionnalités Principales
          </Typography>
          <Typography variant="h6" sx={{ color: '#64748b', maxWidth: '32rem', mx: 'auto' }}>
            Découvrez les outils avancés qui révolutionnent la gestion des plaintes médicales
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} lg={4} key={index}>
              <Card
                onClick={() => handleFeatureClick(feature.title)}
                sx={{
                  background: feature.bgColor,
                  borderRadius: 4,
                  boxShadow: '0 1px 2px rgba(16, 24, 40, 0.04), 0 1px 3px rgba(16, 24, 40, 0.06)',
                  border: '1px solid #ebebef',
                  transition: 'all 0.5s',
                  cursor: 'pointer',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 4px 12px rgba(16, 24, 40, 0.08)'
                  }
                }}
              >
                <CardContent sx={{ p: 4, flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      background: `${feature.color}14`,
                      border: `1px solid ${feature.color}33`,
                      borderRadius: '8px',
                      mb: 2.5,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <feature.icon sx={{ fontSize: 22, color: feature.color }} />
                  </Box>
                  <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1d1d1f', mb: 2 }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#64748b', lineHeight: 1.6, flex: 1 }}>
                    {feature.description}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: '#0d9488',
                      fontWeight: 500,
                      mt: 2,
                      opacity: 0,
                      transition: 'opacity 0.3s',
                      '&:hover': { opacity: 1 }
                    }}
                  >
                    Cliquer pour explorer →
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Fonctionnalités IA & Analytics Avancées */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Box sx={{ textAlign: 'center', mb: 5 }}>
          <Box
            sx={{
              width: 56,
              height: 56,
              background: '#ffffff',
              border: '1px solid #ebebef',
              borderRadius: '12px',
              boxShadow: '0 1px 2px rgba(16, 24, 40, 0.04), 0 1px 3px rgba(16, 24, 40, 0.06)',
              mb: 3,
              mx: 'auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <SparklesIcon sx={{ fontSize: 28, color: '#0d9488' }} />
          </Box>
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: '2rem', md: '3rem' },
              fontWeight: 'bold',
              color: '#1d1d1f',
              letterSpacing: '-0.02em',
              mb: 3
            }}
          >
            Fonctionnalités IA & Analytics Avancées
          </Typography>
          <Typography variant="h6" sx={{ color: '#64748b', maxWidth: '32rem', mx: 'auto' }}>
            Cette section intègre l'intelligence artificielle pour l'analyse automatique des plaintes, la classification intelligente, et les insights prédictifs.
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {aiFeatures.map((feature, index) => (
            <Grid item xs={12} sm={6} lg={4} key={index}>
              <Card
                sx={{
                  background: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: 4,
                  boxShadow: '0 1px 2px rgba(16, 24, 40, 0.04), 0 1px 3px rgba(16, 24, 40, 0.06)',
                  border: '1px solid #ebebef',
                  transition: 'all 0.5s',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 4px 12px rgba(16, 24, 40, 0.08)'
                  }
                }}
              >
                <CardContent sx={{ p: 4, flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      background: `${feature.color}14`,
                      border: `1px solid ${feature.color}33`,
                      borderRadius: '8px',
                      mb: 2.5,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <feature.icon sx={{ fontSize: 22, color: feature.color }} />
                  </Box>
                  <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1d1d1f', mb: 2 }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#64748b', lineHeight: 1.6, mb: 3, flex: 1 }}>
                    {feature.description}
                  </Typography>
                  <Chip
                    icon={<feature.badgeIcon sx={{ fontSize: 16 }} />}
                    label={feature.badge}
                    sx={{
                      backgroundColor: `${feature.badgeColor}20`,
                      color: feature.badgeColor,
                      fontWeight: 500,
                      alignSelf: 'flex-start'
                    }}
                  />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Process Flow Section */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Box sx={{ textAlign: 'center', mb: 5 }}>
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: '2rem', md: '3rem' },
              fontWeight: 'bold',
              color: '#1d1d1f',
              letterSpacing: '-0.02em',
              mb: 3
            }}
          >
            Workflow de Traitement
          </Typography>
          <Typography variant="h6" sx={{ color: '#64748b', maxWidth: '32rem', mx: 'auto' }}>
            Processus optimisé pour une gestion efficace des plaintes
          </Typography>
        </Box>

        <Box sx={{ position: 'relative' }}>
          {/* Connection Line */}
          <Box
            sx={{
              position: 'absolute',
              top: 'calc(16px + 50px)',
              left: 0,
              right: 0,
              height: 4,
              background: '#0d9488',
              borderRadius: 2,
              display: { xs: 'none', md: 'block' },
              zIndex: 0
            }}
          />
          {/* Arrow at the end */}
          <Box
            sx={{
              position: 'absolute',
              top: 'calc(16px + 50px - 6px)',
              right: -4,
              width: 0,
              height: 0,
              borderTop: '8px solid transparent',
              borderBottom: '8px solid transparent',
              borderLeft: '12px solid #10b981',
              display: { xs: 'none', md: 'block' },
              zIndex: 1
            }}
          />

          <Grid container spacing={4}>
            {workflowSteps.map((step, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Box sx={{ textAlign: 'center', height: '100%' }}>
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      background: '#ffffff',
                      border: '1px solid #ebebef',
                      borderRadius: '14px',
                      boxShadow: '0 1px 2px rgba(16, 24, 40, 0.04), 0 1px 3px rgba(16, 24, 40, 0.06)',
                      mb: 2.5,
                      mx: 'auto',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.5rem',
                      position: 'relative',
                      zIndex: 2
                    }}
                  >
                    {step.icon}
                  </Box>
                  <Card
                    sx={{
                      background: 'rgba(255, 255, 255, 0.9)',
                      backdropFilter: 'blur(10px)',
                      borderRadius: 4,
                      boxShadow: '0 1px 2px rgba(16, 24, 40, 0.04), 0 1px 3px rgba(16, 24, 40, 0.06)',
                      border: '1px solid #ebebef',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column'
                    }}
                  >
                    <CardContent sx={{ p: 3, flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#64748b', mb: 1 }}>
                        {step.step}
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1d1d1f', mb: 2 }}>
                        {step.title}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#64748b', flex: 1 }}>
                        {step.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>

      {/* CTA Section - dark hero finale (Linear/Stripe pattern) */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Card
          sx={{
            background: 'linear-gradient(135deg, #0f172a 0%, #1d1d1f 100%)',
            borderRadius: 4,
            boxShadow: '0 8px 32px rgba(15, 23, 42, 0.18)',
            border: '1px solid #1d1d1f',
            p: 6,
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Subtle teal glow top-right */}
          <Box sx={{
            position: 'absolute',
            top: -100, right: -100,
            width: 320, height: 320,
            background: 'radial-gradient(circle, rgba(94, 234, 212, 0.18), transparent 60%)',
            pointerEvents: 'none'
          }} />
          <Box sx={{
            position: 'absolute',
            bottom: -80, left: -80,
            width: 240, height: 240,
            background: 'radial-gradient(circle, rgba(13, 148, 136, 0.14), transparent 60%)',
            pointerEvents: 'none'
          }} />

          {/* Pill teal */}
          <Box sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.75,
            background: 'rgba(94, 234, 212, 0.12)',
            border: '1px solid rgba(94, 234, 212, 0.25)',
            borderRadius: '999px',
            px: 1.5,
            py: 0.5,
            mb: 2.5,
            position: 'relative'
          }}>
            <Box sx={{ width: 6, height: 6, bgcolor: '#5eead4', borderRadius: '50%', animation: 'pulse 2s infinite' }} />
            <Typography sx={{ fontSize: '11px', fontWeight: 700, color: '#5eead4', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Prêt en 5 minutes
            </Typography>
          </Box>

          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              color: '#ffffff',
              letterSpacing: '-0.025em',
              fontSize: { xs: '1.75rem', md: '2.25rem' },
              mb: 2,
              position: 'relative'
            }}
          >
            Prêt à révolutionner votre gestion des plaintes&nbsp;?
          </Typography>
          <Typography sx={{ color: 'rgba(255, 255, 255, 0.72)', mb: 4, maxWidth: '36rem', mx: 'auto', fontSize: '0.95rem', lineHeight: 1.55, position: 'relative' }}>
            Rejoignez les établissements de santé qui ont déjà adopté HealthCare AI pour une gestion optimale de leurs plaintes patient.
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} justifyContent="center" sx={{ position: 'relative' }}>
            <Button
              onClick={handleStartNow}
              variant="contained"
              size="large"
              sx={{
                background: '#ffffff',
                color: '#0f172a',
                borderRadius: 2,
                px: 3.5,
                py: 1.25,
                fontWeight: 700,
                fontSize: '14px',
                textTransform: 'none',
                boxShadow: '0 4px 12px rgba(255, 255, 255, 0.15)',
                '&:hover': {
                  background: '#f5f5f7',
                  boxShadow: '0 6px 18px rgba(255, 255, 255, 0.22)',
                  transform: 'translateY(-1px)'
                },
                transition: 'all 0.2s'
              }}
            >
              Commencer maintenant →
            </Button>
            <Button
              onClick={handleLearnMore}
              variant="outlined"
              size="large"
              sx={{
                borderRadius: 2,
                px: 3.5,
                py: 1.25,
                fontWeight: 600,
                fontSize: '14px',
                textTransform: 'none',
                borderColor: 'rgba(255, 255, 255, 0.18)',
                color: 'rgba(255, 255, 255, 0.92)',
                backgroundColor: 'transparent',
                '&:hover': {
                  borderColor: 'rgba(255, 255, 255, 0.35)',
                  background: 'rgba(255, 255, 255, 0.05)'
                },
                transition: 'all 0.2s'
              }}
            >
              En savoir plus
            </Button>
          </Stack>
        </Card>
      </Container>
    </Box>
  );
};

export default HealthcareAI; 