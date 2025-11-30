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
} from '@mui/material';
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

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #3b82f6, #8b5cf6, #7c3aed)',
        p: 2,
      }}
    >
      <Card
        sx={{
          maxWidth: 400,
          width: '100%',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        }}
      >
        <CardContent sx={{ p: 4 }}>
          {/* Logo et titre */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Avatar
              sx={{
                width: 64,
                height: 64,
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                fontSize: '2rem',
                fontWeight: 'bold',
                mx: 'auto',
                mb: 2,
              }}
            >
              🧬
            </Avatar>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: 1 }}>
              ODYSSEE
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Créer votre compte
            </Typography>
          </Box>

          {/* Formulaire */}
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {/* Nom complet avec label fixe */}
            <Box sx={{ mb: 2 }}>
              <Typography 
                variant="body2" 
                sx={{ 
                  mb: 1, 
                  fontWeight: 600,
                  color: 'rgba(0, 0, 0, 0.87)',
                  fontSize: '0.875rem'
                }}
              >
                Nom complet *
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
                InputLabelProps={{ shrink: false }}
                sx={{ 
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'white',
                    '& fieldset': {
                      borderColor: formErrors.name ? '#d32f2f' : 'rgba(0, 0, 0, 0.23)',
                    },
                    '&:hover fieldset': {
                      borderColor: formErrors.name ? '#d32f2f' : 'rgba(0, 0, 0, 0.87)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: formErrors.name ? '#d32f2f' : '#3b82f6',
                      borderWidth: '2px',
                    },
                  },
                  '& .MuiInputBase-input': {
                    backgroundColor: 'white',
                    color: 'black',
                    padding: '12px 14px',
                    fontSize: '1rem',
                    '&::placeholder': {
                      color: 'rgba(0, 0, 0, 0.4)',
                      opacity: 1,
                    }
                  }
                }}
              />
            </Box>

            {/* Adresse email avec label fixe */}
            <Box sx={{ mb: 2 }}>
              <Typography 
                variant="body2" 
                sx={{ 
                  mb: 1, 
                  fontWeight: 600,
                  color: 'rgba(0, 0, 0, 0.87)',
                  fontSize: '0.875rem'
                }}
              >
                Adresse email *
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
                InputLabelProps={{ shrink: false }}
                sx={{ 
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'white',
                    '& fieldset': {
                      borderColor: formErrors.email ? '#d32f2f' : 'rgba(0, 0, 0, 0.23)',
                    },
                    '&:hover fieldset': {
                      borderColor: formErrors.email ? '#d32f2f' : 'rgba(0, 0, 0, 0.87)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: formErrors.email ? '#d32f2f' : '#3b82f6',
                      borderWidth: '2px',
                    },
                  },
                  '& .MuiInputBase-input': {
                    backgroundColor: 'white',
                    color: 'black',
                    padding: '12px 14px',
                    fontSize: '1rem',
                    '&::placeholder': {
                      color: 'rgba(0, 0, 0, 0.4)',
                      opacity: 1,
                    }
                  }
                }}
              />
            </Box>

            {/* Mot de passe avec label fixe */}
            <Box sx={{ mb: 2 }}>
              <Typography 
                variant="body2" 
                sx={{ 
                  mb: 1, 
                  fontWeight: 600,
                  color: 'rgba(0, 0, 0, 0.87)',
                  fontSize: '0.875rem'
                }}
              >
                Mot de passe *
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
                InputLabelProps={{ shrink: false }}
                sx={{ 
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'white',
                    '& fieldset': {
                      borderColor: formErrors.password ? '#d32f2f' : 'rgba(0, 0, 0, 0.23)',
                    },
                    '&:hover fieldset': {
                      borderColor: formErrors.password ? '#d32f2f' : 'rgba(0, 0, 0, 0.87)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: formErrors.password ? '#d32f2f' : '#3b82f6',
                      borderWidth: '2px',
                    },
                  },
                  '& .MuiInputBase-input': {
                    backgroundColor: 'white',
                    color: 'black',
                    padding: '12px 14px',
                    fontSize: '1rem',
                    '&::placeholder': {
                      color: 'rgba(0, 0, 0, 0.4)',
                      opacity: 1,
                    }
                  }
                }}
              />
            </Box>

            {/* Confirmer mot de passe avec label fixe */}
            <Box sx={{ mb: 3 }}>
              <Typography 
                variant="body2" 
                sx={{ 
                  mb: 1, 
                  fontWeight: 600,
                  color: 'rgba(0, 0, 0, 0.87)',
                  fontSize: '0.875rem'
                }}
              >
                Confirmer le mot de passe *
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
                InputLabelProps={{ shrink: false }}
                sx={{ 
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'white',
                    '& fieldset': {
                      borderColor: formErrors.confirmPassword ? '#d32f2f' : 'rgba(0, 0, 0, 0.23)',
                    },
                    '&:hover fieldset': {
                      borderColor: formErrors.confirmPassword ? '#d32f2f' : 'rgba(0, 0, 0, 0.87)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: formErrors.confirmPassword ? '#d32f2f' : '#3b82f6',
                      borderWidth: '2px',
                    },
                  },
                  '& .MuiInputBase-input': {
                    backgroundColor: 'white',
                    color: 'black',
                    padding: '12px 14px',
                    fontSize: '1rem',
                    '&::placeholder': {
                      color: 'rgba(0, 0, 0, 0.4)',
                      opacity: 1,
                    }
                  }
                }}
              />
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{
                py: 1.5,
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #1d4ed8, #7c3aed)',
                },
                '&:disabled': {
                  background: 'rgba(59, 130, 246, 0.5)',
                },
              }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Créer un compte'
              )}
            </Button>

            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Déjà un compte ?{' '}
                <Link
                  href="/login"
                  variant="body2"
                  sx={{
                    color: '#3b82f6',
                    textDecoration: 'none',
                    '&:hover': {
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
    </Box>
  );
};

export default Register; 