import { createSlice, createAsyncThunk, PayloadAction, createSelector } from '@reduxjs/toolkit';
import { 
  HealthcareAiSummary, 
  HealthcareAiTrends,
  HealthcareAiFilters,
  ApiResponse 
} from '../../types/api';

// Types pour l'état du slice
interface HealthcareAiState {
  // Données de résumé
  summary: {
    data: HealthcareAiSummary | null;
    isLoading: boolean;
    error: string | null;
    lastUpdated: string | null; // Changé de Date | null à string | null
  };
  
  // Données de tendances
  trends: {
    data: HealthcareAiTrends | null;
    isLoading: boolean;
    error: string | null;
    lastUpdated: string | null; // Changé de Date | null à string | null
  };
  
  // Données de statistiques détaillées
  detailedStats: {
    data: any | null;
    isLoading: boolean;
    error: string | null;
    lastUpdated: string | null; // Changé de Date | null à string | null
  };
  
  // Données d'insights IA
  aiInsights: {
    data: any | null;
    isLoading: boolean;
    error: string | null;
    lastUpdated: string | null; // Changé de Date | null à string | null
  };
  
  // Données temps réel
  realTimeMetrics: {
    data: any | null;
    isLoading: boolean;
    error: string | null;
    lastUpdated: string | null; // Changé de Date | null à string | null
  };
  
  // Configuration
  autoRefresh: boolean;
  refreshInterval: number;
  filters: HealthcareAiFilters | null;
}

// État initial
const initialState: HealthcareAiState = {
  summary: {
    data: null,
    isLoading: false,
    error: null,
    lastUpdated: null,
  },
  trends: {
    data: null,
    isLoading: false,
    error: null,
    lastUpdated: null,
  },
  detailedStats: {
    data: null,
    isLoading: false,
    error: null,
    lastUpdated: null,
  },
  aiInsights: {
    data: null,
    isLoading: false,
    error: null,
    lastUpdated: null,
  },
  realTimeMetrics: {
    data: null,
    isLoading: false,
    error: null,
    lastUpdated: null,
  },
  autoRefresh: true,
  refreshInterval: 30000,
  filters: null,
};

// Thunks pour les appels API
export const fetchHealthcareAiSummary = createAsyncThunk(
  'healthcareAi/fetchSummary',
  async ({ filters }: { filters?: HealthcareAiFilters }, { rejectWithValue }) => {
    try {
      console.log('🔄 Récupération du résumé Healthcare AI');
      
      // Import dynamique pour éviter les dépendances circulaires
      const { AppClient } = await import('../../lib/AppClient');
      const appClient = new AppClient();
      
      const response = await appClient.healthcareAi.getComplaintsSummary(filters);
      
      if (response.success && response.data) {
        console.log('✅ Résumé Healthcare AI récupéré avec succès');
        return response.data;
      } else {
        const errorMessage = response.error || response.message || 'Erreur lors de la récupération des données';
        console.error('❌ Erreur lors de la récupération du résumé:', errorMessage);
        return rejectWithValue(errorMessage);
      }
    } catch (error: any) {
      console.error('❌ Erreur lors de la récupération du résumé:', error);
      
      // Gestion robuste des erreurs
      let errorMessage = 'Erreur de connexion';
      if (error.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error && typeof error === 'object') {
        errorMessage = JSON.stringify(error);
      }
      
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchHealthcareAiTrends = createAsyncThunk(
  'healthcareAi/fetchTrends',
  async ({ days = 30, organisationId }: { days?: number; organisationId?: number }, { rejectWithValue }) => {
    try {
      const { AppClient } = await import('../../lib/AppClient');
      const appClient = new AppClient();
      
      console.log('📈 Récupération des tendances Healthcare AI:', { days, organisationId });
      
      const response = await appClient.healthcareAi.getComplaintsTrends(days, organisationId);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        return rejectWithValue(response.error || 'Erreur lors de la récupération des tendances');
      }
    } catch (error: any) {
      console.error('❌ Erreur lors de la récupération des tendances:', error);
      return rejectWithValue(error.message || 'Erreur de connexion');
    }
  }
);

export const fetchDetailedStatistics = createAsyncThunk(
  'healthcareAi/fetchDetailedStats',
  async (filters: any, { rejectWithValue }) => {
    try {
      const { AppClient } = await import('../../lib/AppClient');
      const appClient = new AppClient();
      
      console.log('📊 Récupération des statistiques détaillées:', filters);
      
      const response = await appClient.healthcareAi.getDetailedStatistics(filters);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        return rejectWithValue(response.error || 'Erreur lors de la récupération des statistiques');
      }
    } catch (error: any) {
      console.error('❌ Erreur lors de la récupération des statistiques:', error);
      return rejectWithValue(error.message || 'Erreur de connexion');
    }
  }
);

export const fetchAiInsights = createAsyncThunk(
  'healthcareAi/fetchAiInsights',
  async ({ organisationId }: { organisationId?: number }, { rejectWithValue }) => {
    try {
      const { AppClient } = await import('../../lib/AppClient');
      const appClient = new AppClient();
      
      console.log('🤖 Récupération des insights IA:', organisationId);
      
      const response = await appClient.healthcareAi.getAiInsights(organisationId);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        return rejectWithValue(response.error || 'Erreur lors de la récupération des insights');
      }
    } catch (error: any) {
      console.error('❌ Erreur lors de la récupération des insights:', error);
      return rejectWithValue(error.message || 'Erreur de connexion');
    }
  }
);

export const fetchRealTimeMetrics = createAsyncThunk(
  'healthcareAi/fetchRealTimeMetrics',
  async ({ organisationId }: { organisationId?: number }, { rejectWithValue }) => {
    try {
      const { AppClient } = await import('../../lib/AppClient');
      const appClient = new AppClient();
      
      console.log('⚡ Récupération des métriques temps réel:', organisationId);
      
      const response = await appClient.healthcareAi.getRealTimeMetrics(organisationId);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        return rejectWithValue(response.error || 'Erreur lors de la récupération des métriques');
      }
    } catch (error: any) {
      console.error('❌ Erreur lors de la récupération des métriques:', error);
      return rejectWithValue(error.message || 'Erreur de connexion');
    }
  }
);

// Slice principal
const healthcareAiSlice = createSlice({
  name: 'healthcareAi',
  initialState,
  reducers: {
    // Actions pour la configuration
    setAutoRefresh: (state, action: PayloadAction<boolean>) => {
      state.autoRefresh = action.payload;
    },
    setRefreshInterval: (state, action: PayloadAction<number>) => {
      state.refreshInterval = action.payload;
    },
    setFilters: (state, action: PayloadAction<HealthcareAiFilters>) => {
      state.filters = action.payload;
    },
    clearFilters: (state) => {
      state.filters = null;
    },
    
    // Actions pour invalider le cache
    invalidateSummary: (state) => {
      state.summary.lastUpdated = null;
    },
    invalidateTrends: (state) => {
      state.trends.lastUpdated = null;
    },
    invalidateAll: (state) => {
      state.summary.lastUpdated = null;
      state.trends.lastUpdated = null;
      state.detailedStats.lastUpdated = null;
      state.aiInsights.lastUpdated = null;
      state.realTimeMetrics.lastUpdated = null;
    },
    
    // Actions pour forcer le rafraîchissement
    refreshSummary: (state) => {
      state.summary.isLoading = true;
      state.summary.error = null;
    },
    refreshTrends: (state) => {
      state.trends.isLoading = true;
      state.trends.error = null;
    },
  },
  extraReducers: (builder) => {
    // Gestion du résumé
    builder
      .addCase(fetchHealthcareAiSummary.pending, (state) => {
        state.summary.isLoading = true;
        state.summary.error = null;
      })
      .addCase(fetchHealthcareAiSummary.fulfilled, (state, action) => {
        state.summary.isLoading = false;
        state.summary.data = action.payload;
        state.summary.lastUpdated = new Date().toISOString();
        console.log('✅ Résumé Healthcare AI mis à jour dans le store');
      })
      .addCase(fetchHealthcareAiSummary.rejected, (state, action) => {
        state.summary.isLoading = false;
        const errorMessage = action.payload as string || action.error?.message || 'Erreur inconnue';
        state.summary.error = errorMessage;
        console.error('❌ Erreur lors de la récupération du résumé:', errorMessage);
      });
    
    // Gestion des tendances
    builder
      .addCase(fetchHealthcareAiTrends.pending, (state) => {
        state.trends.isLoading = true;
        state.trends.error = null;
      })
      .addCase(fetchHealthcareAiTrends.fulfilled, (state, action) => {
        state.trends.isLoading = false;
        state.trends.data = action.payload;
        state.trends.lastUpdated = new Date().toISOString();
        console.log('✅ Tendances Healthcare AI mises à jour dans le store');
      })
      .addCase(fetchHealthcareAiTrends.rejected, (state, action) => {
        state.trends.isLoading = false;
        const errorMessage = action.payload as string || action.error?.message || 'Erreur inconnue';
        state.trends.error = errorMessage;
        console.error('❌ Erreur lors de la récupération des tendances:', errorMessage);
      });
    
    // Gestion des statistiques détaillées
    builder
      .addCase(fetchDetailedStatistics.pending, (state) => {
        state.detailedStats.isLoading = true;
        state.detailedStats.error = null;
      })
      .addCase(fetchDetailedStatistics.fulfilled, (state, action) => {
        state.detailedStats.isLoading = false;
        state.detailedStats.data = action.payload;
        state.detailedStats.lastUpdated = new Date().toISOString();
        console.log('✅ Statistiques détaillées mises à jour dans le store');
      })
      .addCase(fetchDetailedStatistics.rejected, (state, action) => {
        state.detailedStats.isLoading = false;
        const errorMessage = action.payload as string || action.error?.message || 'Erreur inconnue';
        state.detailedStats.error = errorMessage;
        console.error('❌ Erreur lors de la récupération des statistiques:', errorMessage);
      });
    
    // Gestion des insights IA
    builder
      .addCase(fetchAiInsights.pending, (state) => {
        state.aiInsights.isLoading = true;
        state.aiInsights.error = null;
      })
      .addCase(fetchAiInsights.fulfilled, (state, action) => {
        state.aiInsights.isLoading = false;
        state.aiInsights.data = action.payload;
        state.aiInsights.lastUpdated = new Date().toISOString();
        console.log('✅ Insights IA mis à jour dans le store');
      })
      .addCase(fetchAiInsights.rejected, (state, action) => {
        state.aiInsights.isLoading = false;
        const errorMessage = action.payload as string || action.error?.message || 'Erreur inconnue';
        state.aiInsights.error = errorMessage;
        console.error('❌ Erreur lors de la récupération des insights:', errorMessage);
      });
    
    // Gestion des métriques temps réel
    builder
      .addCase(fetchRealTimeMetrics.pending, (state) => {
        state.realTimeMetrics.isLoading = true;
        state.realTimeMetrics.error = null;
      })
      .addCase(fetchRealTimeMetrics.fulfilled, (state, action) => {
        state.realTimeMetrics.isLoading = false;
        state.realTimeMetrics.data = action.payload;
        state.realTimeMetrics.lastUpdated = new Date().toISOString();
        console.log('✅ Métriques temps réel mises à jour dans le store');
      })
      .addCase(fetchRealTimeMetrics.rejected, (state, action) => {
        state.realTimeMetrics.isLoading = false;
        const errorMessage = action.payload as string || action.error?.message || 'Erreur inconnue';
        state.realTimeMetrics.error = errorMessage;
        console.error('❌ Erreur lors de la récupération des métriques:', errorMessage);
      });
  },
});

// Export des actions
export const {
  setAutoRefresh,
  setRefreshInterval,
  setFilters,
  clearFilters,
  invalidateSummary,
  invalidateTrends,
  invalidateAll,
  refreshSummary,
  refreshTrends,
} = healthcareAiSlice.actions;

// Export du reducer
export default healthcareAiSlice.reducer;

// Sélecteurs de base (sélecteurs simples)
export const selectHealthcareAiSummary = (state: any) => state.healthcareAi.summary;
export const selectHealthcareAiTrends = (state: any) => state.healthcareAi.trends;
export const selectHealthcareAiDetailedStats = (state: any) => state.healthcareAi.detailedStats;
export const selectHealthcareAiInsights = (state: any) => state.healthcareAi.aiInsights;
export const selectHealthcareAiRealTimeMetrics = (state: any) => state.healthcareAi.realTimeMetrics;
export const selectHealthcareAiFilters = (state: any) => state.healthcareAi.filters;

// Sélecteurs mémorisés pour éviter les re-renders inutiles
export const selectHealthcareAiConfig = createSelector(
  [(state: any) => state.healthcareAi.autoRefresh, (state: any) => state.healthcareAi.refreshInterval],
  (autoRefresh, refreshInterval) => ({
    autoRefresh,
    refreshInterval,
  })
);

// Sélecteurs utilitaires mémorisés
export const selectFormattedSummaryData = createSelector(
  [selectHealthcareAiSummary],
  (summary) => {
    if (!summary.data) return null;
    
    const data = summary.data;
    return {
      total: data.total || 0,
      inProgress: data.in_progress || 0,
      resolved: data.resolved || 0,
      avgResolutionTime: formatResolutionTime(data.avg_resolution_time_seconds || 0),
      avgResolutionTimeSeconds: data.avg_resolution_time_seconds || 0,
      nouvelles: data.nouvelles || 0,
      progressPercentage: calculatePercentage(data.in_progress || 0, data.total || 0),
      resolvedPercentage: calculatePercentage(data.resolved || 0, data.total || 0),
      timestamp: data.timestamp || new Date().toISOString(),
      filtersApplied: data.filters_applied || {}
    };
  }
);

// Fonctions utilitaires
const formatResolutionTime = (seconds: number): string => {
  if (!seconds || seconds <= 0) {
    return 'N/A';
  }
  
  if (seconds < 60) {
    return `${Math.round(seconds)}s`;
  } else if (seconds < 3600) {
    return `${Math.round(seconds / 60)}min`;
  } else if (seconds < 86400) {
    return `${Math.round(seconds / 3600)}h`;
  } else {
    return `${Math.round(seconds / 86400)}j`;
  }
};

const calculatePercentage = (value: number, total: number): number => {
  if (!value || !total || total <= 0) {
    return 0;
  }
  return Math.round((value / total) * 100);
}; 