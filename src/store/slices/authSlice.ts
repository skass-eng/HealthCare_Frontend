import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { User, AuthState } from '@/types';
import apiService from '@/lib/api';

// Actions asynchrones
export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }: { email: string; password: string }) => {
    const response = await apiService.login(email, password);
    console.log('🔍 Réponse API login:', response);
    
    if (response.success) {
      apiService.setAuthToken(response.data.token);
      // Sauvegarder le token dans localStorage
      localStorage.setItem('token', response.data.token);
    } else {
      console.error('❌ Échec de la connexion:', response);
    }
    return response.data;
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (userData: { email: string; password: string; name: string }) => {
    const response = await apiService.register(userData);
    console.log('🔍 Réponse API register:', response);
    
    if (response.success) {
      apiService.setAuthToken(response.data.token);
      // Sauvegarder le token dans localStorage
      localStorage.setItem('token', response.data.token);
    } else {
      console.error('❌ Échec de l\'inscription:', response);
    }
    return response.data;
  }
);

export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async () => {
    const response = await apiService.getCurrentUser();
    return response.data;
  }
);

// Action pour initialiser l'authentification au démarrage
export const initializeAuth = createAsyncThunk(
  'auth/initializeAuth',
  async (_, { dispatch }) => {
    console.log('🚀 Initialisation de l\'authentification...');
    const token = localStorage.getItem('token');
    console.log('🔑 Token trouvé:', token ? 'Oui' : 'Non');
    
    if (token) {
      // Définir le token dans l'API service
      apiService.setAuthToken(token);
      console.log('🔧 Token défini dans l\'API service');
      
      try {
        // Récupérer les informations de l'utilisateur
        console.log('📡 Appel API getCurrentUser...');
        const response = await apiService.getCurrentUser();
        console.log('✅ Réponse API:', response);
        return {
          user: response.data, // response.data contient l'utilisateur
          token: token
        };
      } catch (error) {
        console.error('❌ Erreur lors de la récupération utilisateur:', error);
        // Si le token est invalide, le supprimer
        localStorage.removeItem('token');
        apiService.removeAuthToken();
        throw error;
      }
    }
    console.log('📭 Aucun token trouvé');
    throw new Error('Aucun token trouvé');
  }
);

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  loading: false, // Commencer avec loading false pour permettre l'affichage immédiat
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      apiService.removeAuthToken();
      localStorage.removeItem('token');
    },
    clearError: (state) => {
      state.error = null;
    },
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
      state.isAuthenticated = true;
      apiService.setAuthToken(action.payload);
      localStorage.setItem('token', action.payload);
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Erreur de connexion';
      });

    // Register
    builder
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Erreur d\'inscription';
      });

    // Get Current User
    builder
      .addCase(getCurrentUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Erreur de récupération utilisateur';
        state.isAuthenticated = false;
      });

    // Initialize Auth
    builder
      .addCase(initializeAuth.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(initializeAuth.rejected, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.token = null;
        state.user = null;
        // Nettoyer le token invalide du localStorage
        localStorage.removeItem('token');
      });
  },
});

export const { logout, clearError, setToken } = authSlice.actions;
export default authSlice.reducer; 