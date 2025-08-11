/**
 * MODAL SLICE - Frontend ODYSSEE Architecture
 * Gestion globale des modals via Redux
 * Version: 1.0.0 - Architecture ODYSSEE
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Service, User } from '../../types/api';

// Types pour les différents types de modals
export type ModalType = 
  | 'service-form'
  | 'user-form'
  | 'confirmation'
  | 'loading'
  | 'error';

// Types d'actions pour les modals de confirmation
export type ConfirmationAction = 
  | 'delete-service'
  | 'delete-user'
  | 'custom';

// Interface pour les données du modal
export interface ModalData {
  serviceForm?: {
    serviceToEdit?: Service | null;
  };
  userForm?: {
    userToEdit?: User | null;
  };
  confirmation?: {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    actionType: ConfirmationAction;
    actionData?: any; // Données supplémentaires pour l'action
  };
  error?: {
    title: string;
    message: string;
  };
  loading?: {
    message?: string;
  };
}

// Interface pour l'état du modal
export interface ModalState {
  isOpen: boolean;
  type: ModalType | null;
  data: ModalData | null;
}

// État initial
const initialState: ModalState = {
  isOpen: false,
  type: null,
  data: null,
};

// Slice Redux
const modalSlice = createSlice({
  name: 'modal',
  initialState,
  reducers: {
    // Ouvrir un modal
    openModal: (state, action: PayloadAction<{ type: ModalType; data?: ModalData }>) => {
      state.isOpen = true;
      state.type = action.payload.type;
      state.data = action.payload.data || null;
    },

    // Fermer le modal
    closeModal: (state) => {
      state.isOpen = false;
      state.type = null;
      state.data = null;
    },

    // Ouvrir le modal de formulaire de service
    openServiceFormModal: (state, action: PayloadAction<{ serviceToEdit?: Service | null }>) => {
      state.isOpen = true;
      state.type = 'service-form';
      state.data = {
        serviceForm: {
          serviceToEdit: action.payload.serviceToEdit || null,
        },
      };
    },

    // Ouvrir le modal de formulaire d'utilisateur
    openUserFormModal: (state, action: PayloadAction<{ userToEdit?: User | null }>) => {
      state.isOpen = true;
      state.type = 'user-form';
      state.data = {
        userForm: {
          userToEdit: action.payload.userToEdit || null,
        },
      };
    },

    // Ouvrir le modal de confirmation
    openConfirmationModal: (state, action: PayloadAction<{
      title: string;
      message: string;
      confirmText?: string;
      cancelText?: string;
      actionType: ConfirmationAction;
      actionData?: any;
    }>) => {
      state.isOpen = true;
      state.type = 'confirmation';
      state.data = {
        confirmation: {
          title: action.payload.title,
          message: action.payload.message,
          confirmText: action.payload.confirmText || 'Confirmer',
          cancelText: action.payload.cancelText || 'Annuler',
          actionType: action.payload.actionType,
          actionData: action.payload.actionData,
        },
      };
    },

    // Ouvrir le modal d'erreur
    openErrorModal: (state, action: PayloadAction<{
      title: string;
      message: string;
    }>) => {
      state.isOpen = true;
      state.type = 'error';
      state.data = {
        error: {
          title: action.payload.title,
          message: action.payload.message,
        },
      };
    },

    // Ouvrir le modal de chargement
    openLoadingModal: (state, action: PayloadAction<{ message?: string }>) => {
      state.isOpen = true;
      state.type = 'loading';
      state.data = {
        loading: {
          message: action.payload.message || 'Chargement...',
        },
      };
    },
  },
});

// Export des actions
export const {
  openModal,
  closeModal,
  openServiceFormModal,
  openUserFormModal,
  openConfirmationModal,
  openErrorModal,
  openLoadingModal,
} = modalSlice.actions;

// Export du reducer
export default modalSlice.reducer;

// Sélecteurs
export const selectModal = (state: { modal: ModalState }) => state.modal;
export const selectModalIsOpen = (state: { modal: ModalState }) => state.modal.isOpen;
export const selectModalType = (state: { modal: ModalState }) => state.modal.type;
export const selectModalData = (state: { modal: ModalState }) => state.modal.data; 