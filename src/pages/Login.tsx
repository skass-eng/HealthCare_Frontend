import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Link,
  Alert,
  CircularProgress,
  Avatar,
  Container,
  Grid,
  Paper,
} from '@mui/material';
import { 
  Security as SecurityIcon,
  Lock as LockIcon,
  Email as EmailIcon,
  Analytics as AnalyticsIcon,
  Speed as SpeedIcon,
  Shield as ShieldIcon
} from '@mui/icons-material';
import { RootState } from '@/store';
import { login } from '@/store/slices/authSlice';

const Login: React.FC = () => {
  console.log('🔐 Composant Login - Chargement');
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated } = useSelector((state: RootState) => state.auth);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  // Rediriger si déjà connecté
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/healthcare-ai');
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🔐 Tentative de connexion avec:', formData);
    
    try {
      const result = await dispatch(login(formData)).unwrap();
      console.log('✅ Connexion réussie:', result);
      
      // Attendre un peu pour que le token soit sauvegardé
      setTimeout(() => {
        console.log('💾 Token sauvegardé:', localStorage.getItem('token'));
      }, 100);
      
      navigate('/healthcare-ai');
    } catch (error) {
      console.error('❌ Erreur de connexion:', error);
      // L'erreur est gérée par le slice
    }
  };

  // Si déjà connecté, ne pas afficher le formulaire
  if (isAuthenticated) {
    return null;
  }

  const features = [
    { icon: AnalyticsIcon, title: 'Analyse IA', description: 'Intelligence artificielle avancée' },
    { icon: SpeedIcon, title: 'Temps Réel', description: 'Suivi instantané des plaintes' },
    { icon: ShieldIcon, title: 'Sécurisé', description: 'Protection des données médicales' },
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f8fafc, #e2e8f0, #f0fdfa)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background Effects - comme HealthcareAI */}
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
          top: '-10%',
          left: '10%',
          width: '30rem',
          height: '30rem',
          background: 'rgba(147, 197, 253, 0.3)',
          borderRadius: '50%',
          filter: 'blur(4rem)',
          animation: 'pulse 4s infinite',
          zIndex: 0
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '-10%',
          right: '10%',
          width: '35rem',
          height: '35rem',
          background: 'rgba(45, 212, 191, 0.25)',
          borderRadius: '50%',
          filter: 'blur(4rem)',
          animation: 'pulse 4s infinite 2s',
          zIndex: 0
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '50rem',
          height: '50rem',
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, transparent 70%)',
          zIndex: 0
        }}
      />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, py: 4 }}>
        <Grid container spacing={6} alignItems="center" justifyContent="center">
          {/* Section gauche - Branding */}
          <Grid item xs={12} md={6} sx={{ display: { xs: 'none', md: 'block' } }}>
            <Box sx={{ pr: 4 }}>
              {/* Logo animé */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 4 }}>
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    background: 'linear-gradient(135deg, #3b82f6, #14b8a6)',
                    boxShadow: '0 25px 50px -12px rgba(59, 130, 246, 0.4)',
                  }}
                >
                  <SecurityIcon sx={{ fontSize: 40, color: 'white' }} />
                </Avatar>
                <Box>
                  <Typography
                    variant="h3"
                    sx={{
                      fontWeight: 'bold',
                      background: 'linear-gradient(135deg, #1e293b, #1d4ed8, #0d9488)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    HealthCare AI
                  </Typography>
                  <Typography variant="h6" sx={{ color: '#64748b', fontWeight: 500 }}>
                    Gestion Plaintes
                  </Typography>
                </Box>
              </Box>

              {/* Description */}
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  color: '#1e293b',
                  mb: 2,
                  lineHeight: 1.3
                }}
              >
                Plateforme intelligente de gestion des plaintes médicales
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: '#64748b',
                  mb: 4,
                  fontSize: '1.1rem',
                  lineHeight: 1.7
                }}
              >
                Connectez-vous pour accéder à votre espace de gestion avec analyse IA avancée, 
                suivi en temps réel et tableaux de bord personnalisés.
              </Typography>

              {/* Features cards */}
              <Grid container spacing={2}>
                {features.map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <Grid item xs={12} key={index}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 2,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 2,
                          background: 'rgba(255, 255, 255, 0.7)',
                          backdropFilter: 'blur(10px)',
                          borderRadius: 3,
                          border: '1px solid rgba(255, 255, 255, 0.5)',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateX(8px)',
                            boxShadow: '0 10px 40px -10px rgba(59, 130, 246, 0.2)',
                          }
                        }}
                      >
                        <Box
                          sx={{
                            width: 48,
                            height: 48,
                            borderRadius: 2,
                            background: 'linear-gradient(135deg, #3b82f6, #14b8a6)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Icon sx={{ color: 'white', fontSize: 24 }} />
                        </Box>
                        <Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1e293b' }}>
                            {feature.title}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#64748b' }}>
                            {feature.description}
                          </Typography>
                        </Box>
                      </Paper>
                    </Grid>
                  );
                })}
              </Grid>
            </Box>
          </Grid>

          {/* Section droite - Formulaire */}
          <Grid item xs={12} md={6} lg={5}>
            <Card
              sx={{
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.5)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
                borderRadius: 4,
                overflow: 'visible',
              }}
            >
              <CardContent sx={{ p: { xs: 3, sm: 5 } }}>
                {/* Header du formulaire */}
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                  <Avatar
                    sx={{
                      width: 72,
                      height: 72,
                      background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                      boxShadow: '0 20px 40px -10px rgba(59, 130, 246, 0.4)',
                      mx: 'auto',
                      mb: 3,
                    }}
                  >
                    <LockIcon sx={{ fontSize: 36, color: 'white' }} />
                  </Avatar>
                  <Typography 
                    variant="h4" 
                    sx={{ 
                      fontWeight: 'bold', 
                      mb: 1,
                      background: 'linear-gradient(135deg, #1e293b, #3b82f6)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    Connexion
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#64748b' }}>
                    Accédez à votre espace sécurisé
                  </Typography>
                </Box>

                {/* Formulaire */}
                <Box component="form" onSubmit={handleSubmit}>
                  {error && (
                    <Alert 
                      severity="error" 
                      sx={{ 
                        mb: 3, 
                        borderRadius: 2,
                        '& .MuiAlert-icon': {
                          color: '#ef4444'
                        }
                      }}
                    >
                      {error}
                    </Alert>
                  )}

                  {/* Email */}
                  <Box sx={{ mb: 3 }}>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        mb: 1, 
                        fontWeight: 600,
                        color: '#374151',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                      }}
                    >
                      <EmailIcon sx={{ fontSize: 18, color: '#3b82f6' }} />
                      Adresse email
                    </Typography>
                    <TextField
                      required
                      fullWidth
                      id="email"
                      name="email"
                      autoComplete="email"
                      autoFocus
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="votre.email@exemple.com"
                      variant="outlined"
                      sx={{ 
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: '#fafafa',
                          borderRadius: '12px',
                          transition: 'all 0.25s ease',
                          borderStyle: 'solid',
                          borderWidth: '1.5px',
                          borderColor: '#e5e7eb',
                          '& fieldset': {
                            display: 'none',
                          },
                          '&:hover': {
                            backgroundColor: '#ffffff',
                            borderColor: '#bfdbfe',
                          },
                          '&.Mui-focused': {
                            backgroundColor: '#ffffff',
                            borderColor: '#93c5fd',
                            boxShadow: '0 0 0 3px rgba(147, 197, 253, 0.15)',
                          },
                        },
                        '& .MuiInputBase-input': {
                          color: '#374151',
                          padding: '14px 16px',
                          fontSize: '0.95rem',
                          fontWeight: 400,
                          '&::placeholder': {
                            color: '#b0b7c3',
                            opacity: 1,
                          }
                        }
                      }}
                    />
                  </Box>

                  {/* Mot de passe */}
                  <Box sx={{ mb: 4 }}>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        mb: 1, 
                        fontWeight: 600,
                        color: '#374151',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                      }}
                    >
                      <LockIcon sx={{ fontSize: 18, color: '#3b82f6' }} />
                      Mot de passe
                    </Typography>
                    <TextField
                      required
                      fullWidth
                      name="password"
                      type="password"
                      id="password"
                      autoComplete="current-password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      variant="outlined"
                      sx={{ 
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: '#fafafa',
                          borderRadius: '12px',
                          transition: 'all 0.25s ease',
                          borderStyle: 'solid',
                          borderWidth: '1.5px',
                          borderColor: '#e5e7eb',
                          '& fieldset': {
                            display: 'none',
                          },
                          '&:hover': {
                            backgroundColor: '#ffffff',
                            borderColor: '#bfdbfe',
                          },
                          '&.Mui-focused': {
                            backgroundColor: '#ffffff',
                            borderColor: '#93c5fd',
                            boxShadow: '0 0 0 3px rgba(147, 197, 253, 0.15)',
                          },
                        },
                        '& .MuiInputBase-input': {
                          color: '#374151',
                          padding: '14px 16px',
                          fontSize: '0.95rem',
                          fontWeight: 400,
                          '&::placeholder': {
                            color: '#b0b7c3',
                            opacity: 1,
                          }
                        }
                      }}
                    />
                  </Box>

                  {/* Bouton de connexion */}
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    disabled={loading}
                    sx={{
                      py: 1.75,
                      fontSize: '1rem',
                      fontWeight: 600,
                      borderRadius: 2,
                      background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                      boxShadow: '0 10px 40px -10px rgba(59, 130, 246, 0.5)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #1d4ed8, #7c3aed)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 15px 50px -10px rgba(59, 130, 246, 0.6)',
                      },
                      '&:disabled': {
                        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.5), rgba(139, 92, 246, 0.5))',
                      },
                    }}
                  >
                    {loading ? (
                      <CircularProgress size={24} sx={{ color: 'white' }} />
                    ) : (
                      'Se connecter'
                    )}
                  </Button>

                  {/* Lien d'inscription */}
                  <Box sx={{ mt: 4, textAlign: 'center' }}>
                    <Typography variant="body2" sx={{ color: '#64748b' }}>
                      Pas encore de compte ?{' '}
                      <Link
                        href="/register"
                        sx={{
                          color: '#3b82f6',
                          fontWeight: 600,
                          textDecoration: 'none',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            color: '#1d4ed8',
                            textDecoration: 'underline',
                          },
                        }}
                      >
                        Créer un compte
                      </Link>
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {/* Footer mobile */}
            <Box sx={{ display: { xs: 'block', md: 'none' }, mt: 4, textAlign: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 2 }}>
                <Avatar
                  sx={{
                    width: 40,
                    height: 40,
                    background: 'linear-gradient(135deg, #3b82f6, #14b8a6)',
                  }}
                >
                  <SecurityIcon sx={{ fontSize: 20, color: 'white' }} />
                </Avatar>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 'bold',
                    background: 'linear-gradient(135deg, #1e293b, #3b82f6)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  HealthCare AI
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: '#64748b' }}>
                Gestion intelligente des plaintes médicales
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* CSS Animations */}
      <style>
        {`
          @keyframes pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.7; transform: scale(1.05); }
          }
        `}
      </style>
    </Box>
  );
};

export default Login; 