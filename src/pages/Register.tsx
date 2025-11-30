import React, { useState } from 'react';
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
  Person as PersonIcon,
  PersonAdd as PersonAddIcon,
  CheckCircle as CheckCircleIcon,
  Verified as VerifiedIcon,
  Support as SupportIcon
} from '@mui/icons-material';
import { RootState } from '@/store';
import { register } from '@/store/slices/authSlice';

const Register: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state: RootState) => state.auth);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Effacer l'erreur du champ modifié
    if (formErrors[e.target.name]) {
      setFormErrors({
        ...formErrors,
        [e.target.name]: '',
      });
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = 'Le nom est requis';
    }

    if (!formData.email.trim()) {
      errors.email = 'L\'email est requis';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'L\'email n\'est pas valide';
    }

    if (!formData.password) {
      errors.password = 'Le mot de passe est requis';
    } else if (formData.password.length < 6) {
      errors.password = 'Le mot de passe doit contenir au moins 6 caractères';
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await dispatch(register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      })).unwrap();
      navigate('/healthcare-ai');
    } catch (error) {
      // L'erreur est gérée par le slice
    }
  };

  const benefits = [
    { icon: CheckCircleIcon, title: 'Accès Complet', description: 'Toutes les fonctionnalités disponibles' },
    { icon: VerifiedIcon, title: 'Données Sécurisées', description: 'Chiffrement de bout en bout' },
    { icon: SupportIcon, title: 'Support 24/7', description: 'Assistance technique dédiée' },
  ];

  // Style commun pour les champs de texte - style doux et apaisant
  const getTextFieldStyles = (hasError: boolean) => ({
    '& .MuiOutlinedInput-root': {
      backgroundColor: '#fafafa',
      borderRadius: '12px',
      transition: 'all 0.25s ease',
      borderStyle: 'solid',
      borderWidth: '1.5px',
      borderColor: hasError ? '#fca5a5' : '#e5e7eb',
      '& fieldset': {
        display: 'none',
      },
      '&:hover': {
        backgroundColor: '#ffffff',
        borderColor: hasError ? '#f87171' : '#a7f3d0',
      },
      '&.Mui-focused': {
        backgroundColor: '#ffffff',
        borderColor: hasError ? '#f87171' : '#6ee7b7',
        boxShadow: hasError ? '0 0 0 3px rgba(252, 165, 165, 0.2)' : '0 0 0 3px rgba(110, 231, 183, 0.15)',
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
    },
    '& .MuiFormHelperText-root': {
      marginLeft: 0,
      marginTop: '6px',
    }
  });

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
        py: 4,
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

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
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
                Rejoignez notre plateforme de gestion médicale
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
                Créez votre compte pour accéder à l'ensemble des outils d'analyse IA, 
                de suivi en temps réel et de reporting avancé.
              </Typography>

              {/* Benefits cards */}
              <Grid container spacing={2}>
                {benefits.map((benefit, index) => {
                  const Icon = benefit.icon;
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
                            background: 'linear-gradient(135deg, #10b981, #14b8a6)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Icon sx={{ color: 'white', fontSize: 24 }} />
                        </Box>
                        <Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1e293b' }}>
                            {benefit.title}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#64748b' }}>
                            {benefit.description}
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
                      background: 'linear-gradient(135deg, #10b981, #14b8a6)',
                      boxShadow: '0 20px 40px -10px rgba(16, 185, 129, 0.4)',
                      mx: 'auto',
                      mb: 3,
                    }}
                  >
                    <PersonAddIcon sx={{ fontSize: 36, color: 'white' }} />
                  </Avatar>
                  <Typography 
                    variant="h4" 
                    sx={{ 
                      fontWeight: 'bold', 
                      mb: 1,
                      background: 'linear-gradient(135deg, #1e293b, #10b981)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    Inscription
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#64748b' }}>
                    Créez votre compte en quelques secondes
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

                  {/* Nom complet */}
                  <Box sx={{ mb: 2.5 }}>
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
                      <PersonIcon sx={{ fontSize: 18, color: '#10b981' }} />
                      Nom complet
                    </Typography>
                    <TextField
                      required
                      fullWidth
                      id="name"
                      name="name"
                      autoComplete="name"
                      autoFocus
                      value={formData.name}
                      onChange={handleChange}
                      error={!!formErrors.name}
                      helperText={formErrors.name}
                      placeholder="Votre nom complet"
                      variant="outlined"
                      sx={getTextFieldStyles(!!formErrors.name)}
                    />
                  </Box>

                  {/* Email */}
                  <Box sx={{ mb: 2.5 }}>
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
                      <EmailIcon sx={{ fontSize: 18, color: '#10b981' }} />
                      Adresse email
                    </Typography>
                    <TextField
                      required
                      fullWidth
                      id="email"
                      name="email"
                      autoComplete="email"
                      value={formData.email}
                      onChange={handleChange}
                      error={!!formErrors.email}
                      helperText={formErrors.email}
                      placeholder="votre.email@exemple.com"
                      variant="outlined"
                      sx={getTextFieldStyles(!!formErrors.email)}
                    />
                  </Box>

                  {/* Mot de passe */}
                  <Box sx={{ mb: 2.5 }}>
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
                      <LockIcon sx={{ fontSize: 18, color: '#10b981' }} />
                      Mot de passe
                    </Typography>
                    <TextField
                      required
                      fullWidth
                      name="password"
                      type="password"
                      id="password"
                      autoComplete="new-password"
                      value={formData.password}
                      onChange={handleChange}
                      error={!!formErrors.password}
                      helperText={formErrors.password}
                      placeholder="••••••••"
                      variant="outlined"
                      sx={getTextFieldStyles(!!formErrors.password)}
                    />
                  </Box>

                  {/* Confirmer mot de passe */}
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
                      <LockIcon sx={{ fontSize: 18, color: '#10b981' }} />
                      Confirmer le mot de passe
                    </Typography>
                    <TextField
                      required
                      fullWidth
                      name="confirmPassword"
                      type="password"
                      id="confirmPassword"
                      autoComplete="new-password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      error={!!formErrors.confirmPassword}
                      helperText={formErrors.confirmPassword}
                      placeholder="••••••••"
                      variant="outlined"
                      sx={getTextFieldStyles(!!formErrors.confirmPassword)}
                    />
                  </Box>

                  {/* Bouton d'inscription */}
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
                      background: 'linear-gradient(135deg, #10b981, #14b8a6)',
                      boxShadow: '0 10px 40px -10px rgba(16, 185, 129, 0.5)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #059669, #0d9488)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 15px 50px -10px rgba(16, 185, 129, 0.6)',
                      },
                      '&:disabled': {
                        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.5), rgba(20, 184, 166, 0.5))',
                      },
                    }}
                  >
                    {loading ? (
                      <CircularProgress size={24} sx={{ color: 'white' }} />
                    ) : (
                      'Créer mon compte'
                    )}
                  </Button>

                  {/* Lien de connexion */}
                  <Box sx={{ mt: 4, textAlign: 'center' }}>
                    <Typography variant="body2" sx={{ color: '#64748b' }}>
                      Déjà un compte ?{' '}
                      <Link
                        href="/login"
                        sx={{
                          color: '#10b981',
                          fontWeight: 600,
                          textDecoration: 'none',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            color: '#059669',
                            textDecoration: 'underline',
                          },
                        }}
                      >
                        Se connecter
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

export default Register;
