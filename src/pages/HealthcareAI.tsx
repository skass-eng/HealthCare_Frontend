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
    navigate('/analytics-v2');
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
        navigate('/parametres');
        break;
      case 'Configuration Flexible':
        navigate('/parametres');
        break;
      default:
        navigate('/dashboard-unified');
    }
  };

  // Données dynamiques des stats basées sur l'API (architecture ODYSSEE)
  const getStatsFromData = () => {
    if (!formattedData) {
      return [
        { icon: DescriptionIcon, number: '---', label: 'Total Plaintes', color: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', isLoading: true, subtitle: undefined },
        { icon: AnalyticsIcon, number: '---', label: 'En Cours', color: 'linear-gradient(135deg, #14b8a6, #0d9488)', isLoading: true, subtitle: undefined },
        { icon: SecurityIcon, number: '---', label: 'Résolues', color: 'linear-gradient(135deg, #10b981, #059669)', isLoading: true, subtitle: undefined },
        { icon: SettingsIcon, number: '---', label: 'Temps Moyen', color: 'linear-gradient(135deg, #64748b, #475569)', isLoading: true, subtitle: undefined }
      ];
    }

    return [
      { 
        icon: DescriptionIcon, 
        number: (formattedData.total || 0).toString(), 
        label: 'Total Plaintes', 
        color: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
        subtitle: `+${formattedData.nouvelles || 0} nouvelles`,
        isLoading: false
      },
      { 
        icon: AnalyticsIcon, 
        number: (formattedData.inProgress || 0).toString(), 
        label: 'En Cours', 
        color: 'linear-gradient(135deg, #14b8a6, #0d9488)',
        subtitle: `${formattedData.progressPercentage || 0}% du total`,
        isLoading: false
      },
      { 
        icon: SecurityIcon, 
        number: (formattedData.resolved || 0).toString(), 
        label: 'Résolues', 
        color: 'linear-gradient(135deg, #10b981, #059669)',
        subtitle: `${formattedData.resolvedPercentage || 0}% du total`,
        isLoading: false
      },
      { 
        icon: SettingsIcon, 
        number: formattedData.avgResolutionTime || 'N/A', 
        label: 'Temps Moyen', 
        color: 'linear-gradient(135deg, #64748b, #475569)',
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
      color: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
      bgColor: 'linear-gradient(135deg, #eff6ff, #dbeafe)'
    },
    {
      icon: LightbulbIcon,
      title: 'IA & Optimisation',
      description: 'Suggestions intelligentes et améliorations continues basées sur l\'analyse des données',
      color: 'linear-gradient(135deg, #14b8a6, #0d9488)',
      bgColor: 'linear-gradient(135deg, #f0fdfa, #ccfbf1)'
    },
    {
      icon: Cog8ToothIcon,
      title: 'Administration',
      description: 'Gestion des organisations et services avec configuration avancée',
      color: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
      bgColor: 'linear-gradient(135deg, #faf5ff, #f3e8ff)'
    },
    {
      icon: FlashIcon,
      title: 'Traitement Rapide',
      description: 'Automatisation des processus pour réduire les délais de traitement des plaintes',
      color: 'linear-gradient(135deg, #64748b, #475569)',
      bgColor: 'linear-gradient(135deg, #f8fafc, #f1f5f9)'
    },
    {
      icon: SecurityIcon,
      title: 'Sécurité Renforcée',
      description: 'Protection des données sensibles avec chiffrement et accès sécurisé',
      color: 'linear-gradient(135deg, #6366f1, #4f46e5)',
      bgColor: 'linear-gradient(135deg, #eef2ff, #e0e7ff)'
    },
    {
      icon: SettingsIcon,
      title: 'Configuration Flexible',
      description: 'Paramètres personnalisables pour adapter la plateforme à vos besoins spécifiques',
      color: 'linear-gradient(135deg, #06b6d4, #0891b2)',
      bgColor: 'linear-gradient(135deg, #ecfeff, #cffafe)'
    }
  ];

  const aiFeatures = [
    {
      icon: FaceSmileIcon,
      title: 'Analyse de Sentiment',
      description: 'Détection automatique du sentiment (positif, négatif, neutre) dans les plaintes',
      color: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
      badge: '+ Disponible avec l\'API V2',
      badgeColor: '#3b82f6',
      badgeIcon: SparklesIcon
    },
    {
      icon: TagIcon,
      title: 'Classification Auto',
      description: 'Catégorisation intelligente des plaintes par type, priorité et service',
      color: 'linear-gradient(135deg, #14b8a6, #0d9488)',
      badge: 'IA Intégrée',
      badgeColor: '#14b8a6',
      badgeIcon: SettingsIcon
    },
    {
      icon: LightbulbIcon,
      title: 'Suggestions IA',
      description: 'Recommandations automatiques pour le traitement des plaintes',
      color: 'linear-gradient(135deg, #6366f1, #4f46e5)',
      badge: 'Machine Learning',
      badgeColor: '#6366f1',
      badgeIcon: SparklesIcon
    },
    {
      icon: AnalyticsIcon,
      title: 'Analytics Prédictive',
      description: 'Prédiction des tendances et identification des risques',
      color: 'linear-gradient(135deg, #64748b, #475569)',
      badge: 'Big Data',
      badgeColor: '#64748b',
      badgeIcon: DescriptionIcon
    },
    {
      icon: ExclamationTriangleIcon,
      title: 'Détection d\'Anomalies',
      description: 'Identification automatique des patterns inhabituels',
      color: 'linear-gradient(135deg, #06b6d4, #0891b2)',
      badge: 'Temps Réel',
      badgeColor: '#06b6d4',
      badgeIcon: FlashIcon
    },
    {
      icon: SummaryIcon,
      title: 'Résumé Auto',
      description: 'Génération automatique de résumés et points clés',
      color: 'linear-gradient(135deg, #10b981, #059669)',
      badge: 'NLP Avancé',
      badgeColor: '#10b981',
      badgeIcon: DescriptionIcon
    }
  ];

  const workflowSteps = [
    { step: '01', title: 'Réception', description: 'Plaintes reçues et enregistrées automatiquement', icon: '📨', color: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' },
    { step: '02', title: 'Analyse', description: 'Évaluation IA et classification des priorités', icon: '🔍', color: 'linear-gradient(135deg, #14b8a6, #0d9488)' },
    { step: '03', title: 'Traitement', description: 'Résolution et suivi des actions correctives', icon: '⚡', color: 'linear-gradient(135deg, #10b981, #059669)' },
    { step: '04', title: 'Validation', description: 'Contrôle qualité et clôture des dossiers', icon: '✅', color: 'linear-gradient(135deg, #64748b, #475569)' }
  ];

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f8fafc, #e2e8f0, #f0fdfa)' }}>
      {/* Header Section */}
      <Box sx={{ position: 'relative', overflow: 'hidden' }}>
        {/* Background Effects */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(20, 184, 166, 0.1), rgba(16, 185, 129, 0.1))',
            filter: 'blur(3rem)',
            zIndex: 0
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: '25%',
            width: '24rem',
            height: '24rem',
            background: 'rgba(147, 197, 253, 0.2)',
            borderRadius: '50%',
            filter: 'blur(3rem)',
            animation: 'pulse 2s infinite',
            zIndex: 0
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            right: '25%',
            width: '24rem',
            height: '24rem',
            background: 'rgba(45, 212, 191, 0.2)',
            borderRadius: '50%',
            filter: 'blur(3rem)',
            animation: 'pulse 2s infinite 1s',
            zIndex: 0
          }}
        />

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, py: 8 }}>
          {/* Logo et Titre */}
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Avatar
              sx={{
                width: 96,
                height: 96,
                background: 'linear-gradient(135deg, #3b82f6, #14b8a6)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                mb: 4,
                mx: 'auto'
              }}
            >
              <SecurityIcon sx={{ fontSize: 48, color: 'white' }} />
            </Avatar>
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: '3rem', md: '5rem', lg: '7rem' },
                fontWeight: 'bold',
                background: 'linear-gradient(135deg, #1e293b, #1d4ed8, #0d9488)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 2
              }}
            >
              HealthCare AI
            </Typography>
            <Typography variant="h2" sx={{ fontSize: { xs: '1.5rem', md: '2rem' }, fontWeight: 600, color: '#475569', mb: 2 }}>
              Gestion Plaintes
            </Typography>
            <Typography variant="h6" sx={{ color: '#64748b', maxWidth: '48rem', mx: 'auto', lineHeight: 1.6 }}>
              Plateforme intelligente de gestion des plaintes médicales avec analyse IA avancée
            </Typography>
          </Box>

          {/* Header avec contrôles */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Box>
              <Typography variant="h6" sx={{ color: '#64748b', mb: 1 }}>
                Données en temps réel
              </Typography>
              {summary.lastUpdated && (
                <Typography variant="body2" sx={{ color: '#94a3b8' }}>
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
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 1)',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
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
                    background: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: 4,
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.4)',
                    transition: 'all 0.5s',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                    }
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Avatar
                      sx={{
                        width: 64,
                        height: 64,
                        background: stat.color,
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                        mb: 2
                      }}
                    >
                      {stat.isLoading ? (
                        <CircularProgress size={24} sx={{ color: 'white' }} />
                      ) : (
                        <stat.icon sx={{ fontSize: 32, color: 'white' }} />
                      )}
                    </Avatar>
                    <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#1e293b', mb: 1 }}>
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
                      <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', mt: 0.5 }}>
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
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: '2rem', md: '3rem' },
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, #1e293b, #1d4ed8, #0d9488)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
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
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.4)',
                  transition: 'all 0.5s',
                  cursor: 'pointer',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                  }
                }}
              >
                <CardContent sx={{ p: 4, flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <Avatar
                    sx={{
                      width: 64,
                      height: 64,
                      background: feature.color,
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                      mb: 3
                    }}
                  >
                    <feature.icon sx={{ fontSize: 32, color: 'white' }} />
                  </Avatar>
                  <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1e293b', mb: 2 }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#64748b', lineHeight: 1.6, flex: 1 }}>
                    {feature.description}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: '#3b82f6',
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
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Avatar
            sx={{
              width: 80,
              height: 80,
              background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              mb: 4,
              mx: 'auto'
            }}
          >
            <SparklesIcon sx={{ fontSize: 40, color: 'white' }} />
          </Avatar>
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: '2rem', md: '3rem' },
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, #1e293b, #1d4ed8, #0d9488)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
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
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.4)',
                  transition: 'all 0.5s',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                  }
                }}
              >
                <CardContent sx={{ p: 4, flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <Avatar
                    sx={{
                      width: 64,
                      height: 64,
                      background: feature.color,
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                      mb: 3
                    }}
                  >
                    <feature.icon sx={{ fontSize: 32, color: 'white' }} />
                  </Avatar>
                  <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1e293b', mb: 2 }}>
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
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: '2rem', md: '3rem' },
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, #1e293b, #1d4ed8, #0d9488)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
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
              top: '50%',
              left: 0,
              right: 0,
              height: 4,
              background: 'linear-gradient(135deg, #3b82f6, #14b8a6, #10b981)',
              borderRadius: 2,
              transform: 'translateY(-50%)',
              display: { xs: 'none', md: 'block' }
            }}
          />

          <Grid container spacing={4}>
            {workflowSteps.map((step, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Box sx={{ textAlign: 'center', height: '100%' }}>
                  <Avatar
                    sx={{
                      width: 80,
                      height: 80,
                      background: step.color,
                      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                      mb: 3,
                      mx: 'auto',
                      fontSize: '2rem'
                    }}
                  >
                    {step.icon}
                  </Avatar>
                  <Card
                    sx={{
                      background: 'rgba(255, 255, 255, 0.9)',
                      backdropFilter: 'blur(10px)',
                      borderRadius: 4,
                      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.4)',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column'
                    }}
                  >
                    <CardContent sx={{ p: 3, flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#64748b', mb: 1 }}>
                        {step.step}
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1e293b', mb: 2 }}>
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

      {/* CTA Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Card
          sx={{
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            borderRadius: 4,
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: '1px solid rgba(255, 255, 255, 0.4)',
            p: 6,
            textAlign: 'center'
          }}
        >
          <Typography
            variant="h3"
            sx={{
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, #1e293b, #1d4ed8, #0d9488)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 3
            }}
          >
            Prêt à révolutionner votre gestion des plaintes ?
          </Typography>
          <Typography variant="h6" sx={{ color: '#64748b', mb: 4, maxWidth: '32rem', mx: 'auto' }}>
            Rejoignez les établissements de santé qui ont déjà adopté HealthCare AI pour une gestion optimale de leurs plaintes
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
            <Button
              onClick={handleStartNow}
              variant="contained"
              size="large"
              sx={{
                background: 'linear-gradient(135deg, #3b82f6, #14b8a6)',
                borderRadius: 2,
                px: 4,
                py: 1.5,
                fontWeight: 600,
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                '&:hover': {
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                  transform: 'translateY(-2px)'
                },
                transition: 'all 0.3s'
              }}
            >
              Commencer Maintenant
            </Button>
            <Button
              onClick={handleLearnMore}
              variant="outlined"
              size="large"
              sx={{
                borderRadius: 2,
                px: 4,
                py: 1.5,
                fontWeight: 600,
                borderColor: '#e2e8f0',
                color: '#475569',
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                '&:hover': {
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                  transform: 'translateY(-2px)'
                },
                transition: 'all 0.3s'
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