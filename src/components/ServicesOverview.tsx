import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Grid,
  CircularProgress,
  Alert,
  Chip,
  Avatar
} from '@mui/material';
import {
  Business as BusinessIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Star as StarIcon,
  Favorite as HeartIcon,
  Warning as AlertIcon,
  Person as UserIcon,
  ContentCut as ScissorsIcon,
  Memory as CpuChipIcon,
  Group as UserGroupIcon,
  Science as BeakerIcon,
  CameraAlt as CameraIcon,
  LocalHospital as PillIcon,
  Assignment as ClipboardDocumentListIcon,
  Security as ShieldCheckIcon,
  BarChart as ChartBarIcon
} from '@mui/icons-material';

interface ServiceStats {
  total_plaintes: number;
  nouvelles: number;
  en_cours: number;
  traitees: number;
  satisfaction_moyenne: number;
}

interface Service {
  id: number;
  nom: string;
  code_service: string;
  type_service: string;
  description: string;
  statistiques: ServiceStats;
}

interface ServicesOverviewProps {
  selectedService?: string;
  onServiceSelect?: (serviceType: string) => void;
}

const ServicesOverview: React.FC<ServicesOverviewProps> = ({ 
  selectedService, 
  onServiceSelect 
}) => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        // Données de démonstration pour reproduire l'interface Healthcare
        const mockServices: Service[] = [
          {
            id: 1,
            nom: 'Service Cardiologie',
            code_service: 'CARD',
            type_service: 'CARDIOLOGIE',
            description: 'Service de cardiologie',
            statistiques: {
              total_plaintes: 25,
              nouvelles: 8,
              en_cours: 12,
              traitees: 5,
              satisfaction_moyenne: 4.2
            }
          },
          {
            id: 2,
            nom: 'Service Urgences',
            code_service: 'URG',
            type_service: 'URGENCES',
            description: 'Service d\'urgences',
            statistiques: {
              total_plaintes: 45,
              nouvelles: 15,
              en_cours: 20,
              traitees: 10,
              satisfaction_moyenne: 3.8
            }
          },
          {
            id: 3,
            nom: 'Service Pédiatrie',
            code_service: 'PED',
            type_service: 'PEDIATRIE',
            description: 'Service de pédiatrie',
            statistiques: {
              total_plaintes: 18,
              nouvelles: 6,
              en_cours: 8,
              traitees: 4,
              satisfaction_moyenne: 4.5
            }
          },
          {
            id: 4,
            nom: 'Service Chirurgie',
            code_service: 'CHIR',
            type_service: 'CHIRURGIE',
            description: 'Service de chirurgie',
            statistiques: {
              total_plaintes: 32,
              nouvelles: 10,
              en_cours: 15,
              traitees: 7,
              satisfaction_moyenne: 4.1
            }
          },
          {
            id: 5,
            nom: 'Service Neurologie',
            code_service: 'NEURO',
            type_service: 'NEUROLOGIE',
            description: 'Service de neurologie',
            statistiques: {
              total_plaintes: 22,
              nouvelles: 7,
              en_cours: 10,
              traitees: 5,
              satisfaction_moyenne: 4.3
            }
          },
          {
            id: 6,
            nom: 'Service Gynécologie',
            code_service: 'GYN',
            type_service: 'GYNECOLOGIE',
            description: 'Service de gynécologie',
            statistiques: {
              total_plaintes: 28,
              nouvelles: 9,
              en_cours: 12,
              traitees: 7,
              satisfaction_moyenne: 4.0
            }
          }
        ];
        
        setServices(mockServices);
      } catch (err) {
        setError('Erreur de connexion');
        console.error('Erreur lors du chargement des services:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  // Fonction pour obtenir l'icône du service
  const getServiceIcon = (serviceType: string) => {
    const icons: { [key: string]: React.ComponentType<any> } = {
      'CARDIOLOGIE': HeartIcon,
      'URGENCES': AlertIcon,
      'PEDIATRIE': UserIcon,
      'CHIRURGIE': ScissorsIcon,
      'NEUROLOGIE': CpuChipIcon,
      'GYNECOLOGIE': UserGroupIcon,
      'DERMATOLOGIE': BeakerIcon,
      'ORTHOPÉDIE': ShieldCheckIcon,
      'PSYCHIATRIE': CpuChipIcon,
      'RADIOLOGIE': CameraIcon,
      'LABORATOIRE': BeakerIcon,
      'PHARMACIE': PillIcon,
      'ADMINISTRATION': ClipboardDocumentListIcon,
      'DIRECTION': BusinessIcon,
      'QUALITE': ShieldCheckIcon
    };
    const IconComponent = icons[serviceType] || BusinessIcon;
    return <IconComponent />;
  };

  if (loading) {
    return (
      <Card sx={{ p: 3 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
        </Box>
      </Card>
    );
  }

  if (error) {
    return (
      <Card sx={{ p: 3 }}>
        <Alert severity="error" icon={<WarningIcon />}>
          {error}
        </Alert>
      </Card>
    );
  }

  // Grouper les services par type
  const servicesByType = services.reduce((acc, service) => {
    if (!acc[service.type_service]) {
      acc[service.type_service] = [];
    }
    acc[service.type_service].push(service);
    return acc;
  }, {} as { [key: string]: Service[] });

  return (
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
      {/* Résumé global intégré */}
      <Box sx={{ p: 4, borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
        <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center', fontWeight: 600 }}>
          <ChartBarIcon sx={{ mr: 1, color: 'primary.main' }} />
          Résumé global
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={6} md={3}>
            <Box sx={{ 
              textAlign: 'center', 
              p: 2, 
              bgcolor: 'grey.50', 
              borderRadius: 2, 
              border: '1px solid',
              borderColor: 'grey.200'
            }}>
              <Typography variant="h4" sx={{ fontWeight: 600, color: 'grey.800' }}>
                {services.reduce((sum, service) => sum + service.statistiques.total_plaintes, 0)}
              </Typography>
              <Typography variant="body2" sx={{ color: 'grey.600', fontWeight: 500 }}>
                Total plaintes
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} md={3}>
            <Box sx={{ 
              textAlign: 'center', 
              p: 2, 
              bgcolor: 'primary.50', 
              borderRadius: 2, 
              border: '1px solid',
              borderColor: 'primary.200'
            }}>
              <Typography variant="h4" sx={{ fontWeight: 600, color: 'primary.main' }}>
                {services.reduce((sum, service) => sum + service.statistiques.nouvelles, 0)}
              </Typography>
              <Typography variant="body2" sx={{ color: 'grey.600', fontWeight: 500 }}>
                Nouvelles
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} md={3}>
            <Box sx={{ 
              textAlign: 'center', 
              p: 2, 
              bgcolor: 'info.50', 
              borderRadius: 2, 
              border: '1px solid',
              borderColor: 'info.200'
            }}>
              <Typography variant="h4" sx={{ fontWeight: 600, color: 'info.main' }}>
                {services.reduce((sum, service) => sum + service.statistiques.en_cours, 0)}
              </Typography>
              <Typography variant="body2" sx={{ color: 'grey.600', fontWeight: 500 }}>
                En cours
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} md={3}>
            <Box sx={{ 
              textAlign: 'center', 
              p: 2, 
              bgcolor: 'success.50', 
              borderRadius: 2, 
              border: '1px solid',
              borderColor: 'success.200'
            }}>
              <Typography variant="h4" sx={{ fontWeight: 600, color: 'success.main' }}>
                {services.reduce((sum, service) => sum + service.statistiques.traitees, 0)}
              </Typography>
              <Typography variant="body2" sx={{ color: 'grey.600', fontWeight: 500 }}>
                Traitées
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Header de la section des services */}
      <Box sx={{ p: 4, borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
        <Typography variant="h5" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center' }}>
          <BusinessIcon sx={{ mr: 1, color: 'primary.main' }} />
          Analyse par Départements
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1, fontWeight: 500 }}>
          Performance et métriques détaillées par spécialité médicale
        </Typography>
      </Box>

      <Box sx={{ p: 4 }}>
        <Grid container spacing={4}>
          {Object.entries(servicesByType).map(([typeService, servicesList]) => {
            const totalPlaintes = servicesList.reduce((sum, service) => sum + service.statistiques.total_plaintes, 0);
            const totalNouvelles = servicesList.reduce((sum, service) => sum + service.statistiques.nouvelles, 0);
            const totalEnCours = servicesList.reduce((sum, service) => sum + service.statistiques.en_cours, 0);
            const totalTraitees = servicesList.reduce((sum, service) => sum + service.statistiques.traitees, 0);
            const satisfactionMoyenne = servicesList.reduce((sum, service) => sum + service.statistiques.satisfaction_moyenne, 0) / servicesList.length;

            return (
              <Grid item xs={12} lg={6} key={typeService}>
                <Card 
                  sx={{ 
                    p: 3,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    border: selectedService === typeService ? '2px solid' : '2px solid',
                    borderColor: selectedService === typeService ? 'primary.main' : 'grey.200',
                    bgcolor: selectedService === typeService ? 'primary.50' : 'background.paper',
                    '&:hover': {
                      boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                      transform: 'translateY(-4px)'
                    }
                  }}
                  onClick={() => onServiceSelect?.(typeService)}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        {getServiceIcon(typeService)}
                      </Avatar>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {typeService}
                      </Typography>
                    </Box>
                    {selectedService === typeService && (
                      <Box sx={{ 
                        width: 12, 
                        height: 12, 
                        bgcolor: 'primary.main', 
                        borderRadius: '50%',
                        animation: 'pulse 2s infinite'
                      }} />
                    )}
                  </Box>

                  {/* Statistiques principales */}
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={6}>
                      <Box sx={{ 
                        textAlign: 'center', 
                        p: 2, 
                        bgcolor: 'grey.50', 
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: 'grey.200'
                      }}>
                        <Typography variant="h5" sx={{ fontWeight: 600, color: 'grey.800' }}>
                          {totalPlaintes}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'grey.600', fontWeight: 500 }}>
                          Total
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ 
                        textAlign: 'center', 
                        p: 2, 
                        bgcolor: 'primary.50', 
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: 'primary.200'
                      }}>
                        <Typography variant="h5" sx={{ fontWeight: 600, color: 'primary.main' }}>
                          {totalNouvelles}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'primary.main', fontWeight: 500 }}>
                          Nouvelles
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ 
                        textAlign: 'center', 
                        p: 2, 
                        bgcolor: 'info.50', 
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: 'info.200'
                      }}>
                        <Typography variant="h5" sx={{ fontWeight: 600, color: 'info.main' }}>
                          {totalEnCours}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'info.main', fontWeight: 500 }}>
                          En cours
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ 
                        textAlign: 'center', 
                        p: 2, 
                        bgcolor: 'success.50', 
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: 'success.200'
                      }}>
                        <Typography variant="h5" sx={{ fontWeight: 600, color: 'success.main' }}>
                          {totalTraitees}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'success.main', fontWeight: 500 }}>
                          Traitées
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>

                  {/* Satisfaction */}
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                      Satisfaction moyenne:
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <StarIcon sx={{ color: 'warning.main', fontSize: 20 }} />
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {satisfactionMoyenne.toFixed(1)}/5
                      </Typography>
                    </Box>
                  </Box>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Box>
    </Card>
  );
};

export default ServicesOverview; 