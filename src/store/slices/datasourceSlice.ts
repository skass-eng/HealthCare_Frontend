import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Datasource } from '@/types';
import apiService from '@/lib/api';

// Actions asynchrones
export const fetchDatasources = createAsyncThunk(
  'datasource/fetchDatasources',
  async ({ page, limit }: { page: number; limit: number }) => {
    const response = await apiService.getDatasources(page, limit);
    return response;
  }
);

export const fetchDatasource = createAsyncThunk(
  'datasource/fetchDatasource',
  async (datasourceId: string) => {
    const response = await apiService.getDatasource(datasourceId);
    return response.data;
  }
);

export const uploadDatasource = createAsyncThunk(
  'datasource/uploadDatasource',
  async ({ file, metadata }: { file: File; metadata: Partial<Datasource> }) => {
    const response = await apiService.uploadDatasource(file, metadata);
    return response.data;
  }
);

export const deleteDatasource = createAsyncThunk(
  'datasource/deleteDatasource',
  async (datasourceId: string) => {
    await apiService.deleteDatasource(datasourceId);
    return datasourceId;
  }
);

interface DatasourceState {
  datasources: Datasource[];
  currentDatasource: Datasource | null;
  loading: boolean;
  error: string | null;
}

const initialState: DatasourceState = {
  datasources: [],
  currentDatasource: null,
  loading: false,
  error: null,
};

const datasourceSlice = createSlice({
  name: 'datasource',
  initialState,
  reducers: {
    setCurrentDatasource: (state, action: PayloadAction<Datasource>) => {
      state.currentDatasource = action.payload;
    },
    clearCurrentDatasource: (state) => {
      state.currentDatasource = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Datasources
    builder
      .addCase(fetchDatasources.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDatasources.fulfilled, (state, action) => {
        state.loading = false;
        state.datasources = action.payload.items;
      })
      .addCase(fetchDatasources.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Erreur de récupération des datasources';
      });

    // Fetch Datasource
    builder
      .addCase(fetchDatasource.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDatasource.fulfilled, (state, action) => {
        state.loading = false;
        state.currentDatasource = action.payload;
      })
      .addCase(fetchDatasource.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Erreur de récupération de la datasource';
      });

    // Upload Datasource
    builder
      .addCase(uploadDatasource.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadDatasource.fulfilled, (state, action) => {
        state.loading = false;
        state.currentDatasource = action.payload;
        state.datasources.unshift(action.payload);
      })
      .addCase(uploadDatasource.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Erreur d\'upload de la datasource';
      });

    // Delete Datasource
    builder
      .addCase(deleteDatasource.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteDatasource.fulfilled, (state, action) => {
        state.loading = false;
        state.datasources = state.datasources.filter(d => d.id !== action.payload);
        if (state.currentDatasource?.id === action.payload) {
          state.currentDatasource = null;
        }
      })
      .addCase(deleteDatasource.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Erreur de suppression de la datasource';
      });
  },
});

export const {
  setCurrentDatasource,
  clearCurrentDatasource,
  clearError,
} = datasourceSlice.actions;

export default datasourceSlice.reducer; 