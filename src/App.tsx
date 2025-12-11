import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';
import { store } from '@/store';
import Sidebar from '@/components/Sidebar';
import Dashboard from '@/pages/Dashboard';
import DashboardUnified from '@/pages/DashboardUnified';
import HealthcareAI from '@/pages/HealthcareAI';
import PlaintesDashboard from '@/pages/PlaintesDashboard';
import PlaintesDetail from '@/pages/PlaintesDetail';
import NouvellesPlaintes from '@/pages/plaintes/NouvellesPlaintes';
import EnCoursPlaintes from '@/pages/plaintes/EnCoursPlaintes';
import TraiteesPlaintes from '@/pages/plaintes/TraiteesPlaintes';
import CreationPlaintePage from '@/pages/CreationPlainte';
import Ameliorations from '@/pages/Ameliorations';
import Administration from '@/pages/Administration';
import Projects from '@/pages/Projects';
import Analytics from '@/pages/Analytics';
import Datasources from '@/pages/Datasources';
import Tasks from '@/pages/Tasks';
import Settings from '@/pages/Settings';
import ServicesKPI from '@/pages/ServicesKPI';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import wsService from '@/lib/websocket';
import { addTask, updateTask } from '@/store/slices/taskSlice';
import { addNotification } from '@/store/slices/notificationSlice';
import { getCurrentUser, setToken, initializeAuth } from '@/store/slices/authSlice';
import GlobalModals from '@/components/GlobalModals';
import NotificationContainer from '@/components/NotificationToast';
import PlainteNotificationHandler from '@/components/PlainteNotificationHandler';
import PendingTasksIndicator from '@/components/PendingTasksIndicator';
import DevNotificationTester from '@/components/DevNotificationTester';
import { AppClientProvider } from '@/lib/AppClientContext';

// Thème personnalisé inspiré de HealthCare
const theme = createTheme({
  palette: {
    primary: {
      main: '#3b82f6',
      light: '#60a5fa',
      dark: '#1d4ed8',
    },
    secondary: {
      main: '#8b5cf6',
      light: '#a78bfa',
      dark: '#7c3aed',
    },
    success: {
      main: '#10b981',
      light: '#34d399',
      dark: '#059669',
    },
    warning: {
      main: '#f59e0b',
      light: '#fbbf24',
      dark: '#d97706',
    },
    error: {
      main: '#ef4444',
      light: '#f87171',
      dark: '#dc2626',
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 600,
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 8,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
      },
    },
  },
});

// Composant pour initialiser l'authentification au démarrage
const AuthInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, loading } = useSelector((state: RootState) => state.auth);
  const [initialized, setInitialized] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    console.log('🚀 AuthInitializer - Démarrage');
    console.log('📊 État actuel:', { isAuthenticated, loading, initialized });
    
    const initializeAuthState = async () => {
      if (initialized) {
        console.log('⏭️ Déjà initialisé, sortie');
        return;
      }
      
      const storedToken = localStorage.getItem('token');
      console.log('🔍 Vérification de l\'authentification...');
      console.log('📦 Token stocké:', storedToken ? 'Oui' : 'Non');
      console.log('🔐 État authentifié:', isAuthenticated);
      
      if (storedToken) {
        console.log('🔄 Tentative d\'authentification automatique...');
        try {
          const result = await dispatch(initializeAuth()).unwrap();
          console.log('✅ Authentification automatique réussie:', result);
        } catch (error) {
          console.error('❌ Échec de l\'authentification automatique:', error);
          // En cas d'échec, supprimer le token invalide
          localStorage.removeItem('token');
        }
      } else {
        console.log('📭 Aucun token trouvé');
        // Marquer comme non authentifié mais ne pas rediriger ici
        // La redirection sera gérée par ProtectedRoute
      }
      
      setInitialized(true);
      setIsInitializing(false);
      console.log('✅ Initialisation terminée');
    };

    initializeAuthState();
  }, [dispatch, initialized]);

  console.log('🔄 AuthInitializer - Render:', { isAuthenticated, loading, initialized, isInitializing });

  // Afficher le loading si on a un token ET qu'on n'a pas encore terminé l'initialisation
  const storedToken = localStorage.getItem('token');
  const shouldShowLoading = storedToken && isInitializing;

  if (shouldShowLoading) {
    console.log('⏳ Chargement de l\'authentification...');
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          background: 'linear-gradient(135deg, #3b82f6, #8b5cf6, #7c3aed)',
        }}
      >
        <Box
          sx={{
            width: 60,
            height: 60,
            borderRadius: '50%',
            background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
            backgroundSize: '200% 100%',
            animation: 'loading 1.5s infinite',
            '@keyframes loading': {
              '0%': {
                backgroundPosition: '200% 0',
              },
              '100%': {
                backgroundPosition: '-200% 0',
              },
            },
          }}
        />
      </Box>
    );
  }

  return <>{children}</>;
};

// Composant pour gérer l'authentification
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useSelector((state: RootState) => state.auth);

  console.log('🛡️ ProtectedRoute - État:', { isAuthenticated, loading });

  // Si on est en train de charger ET qu'on a un token, afficher le loading
  // Note: Le loading devrait déjà être géré par AuthInitializer, mais on garde cette protection
  const storedToken = localStorage.getItem('token');
  if (loading && storedToken) {
    console.log('⏳ ProtectedRoute - Chargement avec token...');
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          background: 'linear-gradient(135deg, #3b82f6, #8b5cf6, #7c3aed)',
        }}
      >
        <Box
          sx={{
            width: 60,
            height: 60,
            borderRadius: '50%',
            background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
            backgroundSize: '200% 100%',
            animation: 'loading 1.5s infinite',
            '@keyframes loading': {
              '0%': {
                backgroundPosition: '200% 0',
              },
              '100%': {
                backgroundPosition: '-200% 0',
              },
            },
          }}
        />
      </Box>
    );
  }

  if (!isAuthenticated) {
    console.log('🚫 ProtectedRoute - Non authentifié, redirection vers login');
    return <Navigate to="/login" replace />;
  }

  console.log('✅ ProtectedRoute - Authentifié, affichage du contenu');
  return <>{children}</>;
};

// Composant pour gérer les WebSockets
const WebSocketManager: React.FC = () => {
  const dispatch = useDispatch();
  const { token } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (token) {
      // Connexion WebSocket
      wsService.connect(token).then(() => {
        console.log('WebSocket connected successfully');
        
        // Écouter les mises à jour de tâches
        wsService.onTaskUpdate((task) => {
          dispatch(updateTask(task));
        });

        // Écouter la completion de tâches
        wsService.onTaskComplete((task) => {
          dispatch(updateTask(task));
          dispatch(addNotification({
            id: Date.now().toString(),
            type: 'success',
            title: 'Tâche terminée',
            message: `La tâche "${task.type}" a été terminée avec succès`,
            timestamp: new Date().toISOString(),
            read: false,
          }));
        });

        // Écouter les erreurs de tâches
        wsService.onTaskError((error) => {
          dispatch(addNotification({
            id: Date.now().toString(),
            type: 'error',
            title: 'Erreur de tâche',
            message: `Erreur lors de l'exécution de la tâche: ${error.error}`,
            timestamp: new Date().toISOString(),
            read: false,
          }));
        });

        // Écouter les notifications
        wsService.onNotification((notification) => {
          dispatch(addNotification(notification));
        });

      }).catch((error) => {
        console.error('WebSocket connection failed:', error);
      });
    }

    return () => {
      wsService.cleanup();
      wsService.disconnect();
    };
  }, [token, dispatch]);

  return null;
};

// Layout principal de l'application
const AppLayout: React.FC = () => {
  return (
          <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        <Sidebar />
        <PlainteNotificationHandler />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            marginLeft: '320px',
            minHeight: '100vh',
          }}
        >
          <Box
            sx={{
              p: 3,
              height: '100vh',
              overflow: 'auto',
            }}
          >
            <Routes>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/dashboard-unified" element={<DashboardUnified />} />
              <Route path="/healthcare-ai" element={<HealthcareAI />} />
              <Route path="/plaintes-dashboard" element={<PlaintesDashboard />} />
              <Route path="/plaintes/nouvelles" element={<NouvellesPlaintes />} />
              <Route path="/plaintes/en-cours" element={<EnCoursPlaintes />} />
              <Route path="/plaintes/traitees" element={<TraiteesPlaintes />} />
              <Route path="/plaintes/creer" element={<CreationPlaintePage />} />
              <Route path="/plaintes/:id" element={<PlaintesDetail />} />
              <Route path="/ameliorations" element={<Ameliorations />} />
              <Route path="/analytics-v2" element={<Administration />} />
              <Route path="/services-kpi" element={<ServicesKPI />} />
              <Route path="/projects/*" element={<Projects />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/datasources/*" element={<Datasources />} />
              <Route path="/tasks" element={<Tasks />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/" element={<Navigate to="/healthcare-ai" replace />} />
            </Routes>
          </Box>
        </Box>
        <GlobalModals />
        <NotificationContainer />
        <PendingTasksIndicator />
        <DevNotificationTester />
      </Box>
  );
};

const App: React.FC = () => {
  console.log('🚀 Application ODYSSEE - Démarrage');
  
  return (
    <Provider store={store}>
      <AppClientProvider>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Router>
            <AuthInitializer>
              {/* <WebSocketManager /> */}
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route
                  path="/*"
                  element={
                    <ProtectedRoute>
                      <AppLayout />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </AuthInitializer>
          </Router>
        </ThemeProvider>
      </AppClientProvider>
    </Provider>
  );
};

export default App; 