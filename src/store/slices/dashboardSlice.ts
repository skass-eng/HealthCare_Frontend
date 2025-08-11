import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Dashboard, DashboardState, WidgetLayout } from '@/types';
import apiService from '@/lib/api';

// Actions asynchrones
export const fetchDashboards = createAsyncThunk(
  'dashboard/fetchDashboards',
  async ({ page, limit }: { page: number; limit: number }) => {
    const response = await apiService.getDashboards(page, limit);
    return response;
  }
);

export const fetchDashboard = createAsyncThunk(
  'dashboard/fetchDashboard',
  async (dashboardId: string) => {
    const response = await apiService.getDashboard(dashboardId);
    return response.data;
  }
);

export const createDashboard = createAsyncThunk(
  'dashboard/createDashboard',
  async (dashboardData: Partial<Dashboard>) => {
    const response = await apiService.createDashboard(dashboardData);
    return response.data;
  }
);

export const updateDashboard = createAsyncThunk(
  'dashboard/updateDashboard',
  async ({ dashboardId, dashboardData }: { dashboardId: string; dashboardData: Partial<Dashboard> }) => {
    const response = await apiService.updateDashboard(dashboardId, dashboardData);
    return response.data;
  }
);

export const deleteDashboard = createAsyncThunk(
  'dashboard/deleteDashboard',
  async (dashboardId: string) => {
    await apiService.deleteDashboard(dashboardId);
    return dashboardId;
  }
);

export const updateWidgetLayout = createAsyncThunk(
  'dashboard/updateWidgetLayout',
  async ({ dashboardId, widgetId, layout }: { dashboardId: string; widgetId: string; layout: Partial<WidgetLayout> }) => {
    const response = await apiService.updateWidgetLayout(dashboardId, widgetId, layout);
    return response.data;
  }
);

// Nouvelles actions pour la page Vue d'ensemble
export const fetchStatistiquesGlobales = createAsyncThunk(
  'dashboard/fetchStatistiquesGlobales',
  async () => {
    const response = await apiService.getStatistiquesGlobales();
    return response.data;
  }
);

export const fetchStatistiquesDepartements = createAsyncThunk(
  'dashboard/fetchStatistiquesDepartements',
  async () => {
    const response = await apiService.getStatistiquesDepartements();
    return response.data;
  }
);

export const fetchStatistiquesPriorites = createAsyncThunk(
  'dashboard/fetchStatistiquesPriorites',
  async () => {
    const response = await apiService.getStatistiquesPriorites();
    return response.data;
  }
);

export const fetchEvolutionPlaintes = createAsyncThunk(
  'dashboard/fetchEvolutionPlaintes',
  async (periode: string = '30j') => {
    const response = await apiService.getEvolutionPlaintes(periode);
    return response.data;
  }
);

const initialState: DashboardState = {
  currentDashboard: null,
  widgets: [],
  layout: [],
  loading: false,
  error: null,
  // Nouvelles propriétés pour la page Vue d'ensemble
  statistiquesGlobales: null,
  statistiquesDepartements: [],
  statistiquesPriorites: [],
  evolutionPlaintes: null,
  loadingStatistiques: false,
  errorStatistiques: null,
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    setCurrentDashboard: (state, action: PayloadAction<Dashboard>) => {
      state.currentDashboard = action.payload;
      state.widgets = action.payload.layout;
    },
    addWidget: (state, action: PayloadAction<WidgetLayout>) => {
      state.widgets.push(action.payload);
      if (state.currentDashboard) {
        state.currentDashboard.layout = state.widgets;
      }
    },
    updateWidget: (state, action: PayloadAction<{ id: string; widget: Partial<WidgetLayout> }>) => {
      const index = state.widgets.findIndex(w => w.id === action.payload.id);
      if (index !== -1) {
        state.widgets[index] = { ...state.widgets[index], ...action.payload.widget };
        if (state.currentDashboard) {
          state.currentDashboard.layout = state.widgets;
        }
      }
    },
    removeWidget: (state, action: PayloadAction<string>) => {
      state.widgets = state.widgets.filter(w => w.id !== action.payload);
      if (state.currentDashboard) {
        state.currentDashboard.layout = state.widgets;
      }
    },
    updateLayout: (state, action: PayloadAction<any[]>) => {
      state.layout = action.payload;
    },
    clearDashboard: (state) => {
      state.currentDashboard = null;
      state.widgets = [];
      state.layout = [];
    },
    clearError: (state) => {
      state.error = null;
    },
    // Nouvelles actions pour la page Vue d'ensemble
    clearStatistiques: (state) => {
      state.statistiquesGlobales = null;
      state.statistiquesDepartements = [];
      state.evolutionPlaintes = null;
    },
    clearErrorStatistiques: (state) => {
      state.errorStatistiques = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Dashboards
    builder
      .addCase(fetchDashboards.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboards.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(fetchDashboards.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Erreur de récupération des dashboards';
      });

    // Fetch Dashboard
    builder
      .addCase(fetchDashboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboard.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.currentDashboard = action.payload;
          state.widgets = action.payload.layout;
        }
      })
      .addCase(fetchDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Erreur de récupération du dashboard';
      });

    // Create Dashboard
    builder
      .addCase(createDashboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createDashboard.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.currentDashboard = action.payload;
          state.widgets = action.payload.layout;
        }
      })
      .addCase(createDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Erreur de création du dashboard';
      });

    // Update Dashboard
    builder
      .addCase(updateDashboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateDashboard.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.currentDashboard = action.payload;
          state.widgets = action.payload.layout;
        }
      })
      .addCase(updateDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Erreur de mise à jour du dashboard';
      });

    // Delete Dashboard
    builder
      .addCase(deleteDashboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteDashboard.fulfilled, (state) => {
        state.loading = false;
        state.currentDashboard = null;
        state.widgets = [];
        state.layout = [];
      })
      .addCase(deleteDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Erreur de suppression du dashboard';
      });

    // Update Widget Layout
    builder
      .addCase(updateWidgetLayout.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateWidgetLayout.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          const index = state.widgets.findIndex(w => w.id === action.payload.id);
          if (index !== -1) {
            state.widgets[index] = action.payload;
          }
        }
      })
      .addCase(updateWidgetLayout.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Erreur de mise à jour du widget';
      });

    // Nouvelles actions pour la page Vue d'ensemble
    // Fetch Statistiques Globales
    builder
      .addCase(fetchStatistiquesGlobales.pending, (state) => {
        state.loadingStatistiques = true;
        state.errorStatistiques = null;
      })
      .addCase(fetchStatistiquesGlobales.fulfilled, (state, action) => {
        state.loadingStatistiques = false;
        if (action.payload) {
          state.statistiquesGlobales = action.payload;
        }
      })
      .addCase(fetchStatistiquesGlobales.rejected, (state, action) => {
        state.loadingStatistiques = false;
        state.errorStatistiques = action.error.message || 'Erreur de récupération des statistiques globales';
      });

    // Fetch Statistiques Départements
    builder
      .addCase(fetchStatistiquesDepartements.pending, (state) => {
        state.loadingStatistiques = true;
        state.errorStatistiques = null;
      })
      .addCase(fetchStatistiquesDepartements.fulfilled, (state, action) => {
        state.loadingStatistiques = false;
        if (action.payload) {
          state.statistiquesDepartements = action.payload;
          console.log('📊 Statistiques départements reçues:', action.payload);
        }
      })
      .addCase(fetchStatistiquesDepartements.rejected, (state, action) => {
        state.loadingStatistiques = false;
        state.errorStatistiques = action.error.message || 'Erreur de récupération des statistiques par département';
        console.error('❌ Erreur statistiques départements:', action.error.message);
      });

    // Fetch Statistiques Priorités
    builder
      .addCase(fetchStatistiquesPriorites.pending, (state) => {
        state.loadingStatistiques = true;
        state.errorStatistiques = null;
      })
      .addCase(fetchStatistiquesPriorites.fulfilled, (state, action) => {
        state.loadingStatistiques = false;
        if (action.payload) {
          state.statistiquesPriorites = action.payload;
          console.log('📊 Statistiques priorités reçues:', action.payload);
        }
      })
      .addCase(fetchStatistiquesPriorites.rejected, (state, action) => {
        state.loadingStatistiques = false;
        state.errorStatistiques = action.error.message || 'Erreur de récupération des statistiques par priorité';
        console.error('❌ Erreur statistiques priorités:', action.error.message);
      });

    // Fetch Évolution Plaintes
    builder
      .addCase(fetchEvolutionPlaintes.pending, (state) => {
        state.loadingStatistiques = true;
        state.errorStatistiques = null;
      })
      .addCase(fetchEvolutionPlaintes.fulfilled, (state, action) => {
        state.loadingStatistiques = false;
        if (action.payload) {
          state.evolutionPlaintes = action.payload;
        }
      })
      .addCase(fetchEvolutionPlaintes.rejected, (state, action) => {
        state.loadingStatistiques = false;
        state.errorStatistiques = action.error.message || 'Erreur de récupération de l\'évolution des plaintes';
      });
  },
});

export const {
  setCurrentDashboard,
  addWidget,
  updateWidget,
  removeWidget,
  updateLayout,
  clearDashboard,
  clearError,
  clearStatistiques,
  clearErrorStatistiques,
} = dashboardSlice.actions;

export default dashboardSlice.reducer; 