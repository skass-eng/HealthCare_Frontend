/**
 * SERVICES SLICE - Frontend ODYSSEE Architecture
 * Gestion de l'état des services via Redux
 * Version: 1.0.0 - Architecture ODYSSEE
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Service } from '../../types/api';
import { serviceService } from '../../lib/services/ServiceService';

// Interface pour l'état des services
export interface ServicesState {
  services: Service[];
  loading: boolean;
  error: string | null;
  selectedService: Service | null;
}

// État initial
const initialState: ServicesState = {
  services: [],
  loading: false,
  error: null,
  selectedService: null,
};

// Thunk pour récupérer les services
export const fetchServices = createAsyncThunk(
  'services/fetchServices',
  async (activeOnly: boolean = true) => {
    const response = await serviceService.getServices(activeOnly);
    return response.data.items || response.data; // Fallback si pas de structure paginée
  }
);

// Thunk pour créer un service
export const createService = createAsyncThunk(
  'services/createService',
  async (serviceData: any, { rejectWithValue }) => {
    try {
      const response = await serviceService.createService(serviceData);
      if (response.success && response.data) {
        return response.data;
      } else {
        return rejectWithValue(response.error || 'Erreur lors de la création du service');
      }
    } catch (error) {
      return rejectWithValue('Erreur lors de la création du service');
    }
  }
);

// Thunk pour mettre à jour un service
export const updateService = createAsyncThunk(
  'services/updateService',
  async ({ serviceId, serviceData }: { serviceId: number; serviceData: any }, { rejectWithValue }) => {
    try {
      const response = await serviceService.updateService(serviceId, serviceData);
      if (response.success && response.data) {
        return response.data;
      } else {
        return rejectWithValue(response.error || 'Erreur lors de la mise à jour du service');
      }
    } catch (error) {
      return rejectWithValue('Erreur lors de la mise à jour du service');
    }
  }
);

// Thunk pour supprimer un service
export const deleteService = createAsyncThunk(
  'services/deleteService',
  async (serviceId: number, { rejectWithValue }) => {
    try {
      const response = await serviceService.deleteService(serviceId);
      if (response.success) {
        return serviceId;
      } else {
        return rejectWithValue(response.error || 'Erreur lors de la suppression du service');
      }
    } catch (error) {
      return rejectWithValue('Erreur lors de la suppression du service');
    }
  }
);

// Slice Redux
const servicesSlice = createSlice({
  name: 'services',
  initialState,
  reducers: {
    // Réinitialiser l'état
    resetServices: (state) => {
      state.services = [];
      state.loading = false;
      state.error = null;
    },
    
    // Définir le service sélectionné
    setSelectedService: (state, action: PayloadAction<Service | null>) => {
      state.selectedService = action.payload;
    },
    
    // Effacer les erreurs
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Services
    builder
      .addCase(fetchServices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchServices.fulfilled, (state, action) => {
        state.loading = false;
        state.services = action.payload;
      })
      .addCase(fetchServices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Erreur lors du chargement des services';
      });

    // Create Service
    builder
      .addCase(createService.fulfilled, (state, action) => {
        state.services.push(action.payload);
      })
      .addCase(createService.rejected, (state, action) => {
        state.error = action.payload as string || 'Erreur lors de la création du service';
      });

    // Update Service
    builder
      .addCase(updateService.fulfilled, (state, action) => {
        const index = state.services.findIndex(service => service.id === action.payload.id);
        if (index !== -1) {
          state.services[index] = action.payload;
        }
      })
      .addCase(updateService.rejected, (state, action) => {
        state.error = action.payload as string || 'Erreur lors de la mise à jour du service';
      });

    // Delete Service
    builder
      .addCase(deleteService.fulfilled, (state, action) => {
        state.services = state.services.filter(service => service.id !== action.payload);
      })
      .addCase(deleteService.rejected, (state, action) => {
        state.error = action.payload as string || 'Erreur lors de la suppression du service';
      });
  },
});

// Export des actions
export const { resetServices, setSelectedService, clearError } = servicesSlice.actions;

// Export du reducer
export default servicesSlice.reducer;

// Sélecteurs
export const selectServices = (state: { services: ServicesState }) => state.services.services;
export const selectServicesLoading = (state: { services: ServicesState }) => state.services.loading;
export const selectServicesError = (state: { services: ServicesState }) => state.services.error;
export const selectSelectedService = (state: { services: ServicesState }) => state.services.selectedService; 