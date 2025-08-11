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
} from '@mui/material';
import { Science as ScienceIcon } from '@mui/icons-material';
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
              Connexion à votre compte
            </Typography>
          </Box>

          {/* Formulaire */}
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Adresse email"
              name="email"
              autoComplete="email"
              autoFocus
              value={formData.email}
              onChange={handleChange}
              sx={{ mb: 2 }}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Mot de passe"
              type="password"
              id="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              sx={{ mb: 3 }}
            />

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
                'Se connecter'
              )}
            </Button>

            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Pas encore de compte ?{' '}
                <Link
                  href="/register"
                  variant="body2"
                  sx={{
                    color: '#3b82f6',
                    textDecoration: 'none',
                    '&:hover': {
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
    </Box>
  );
};

export default Login; 