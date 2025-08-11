/**
 * USE MODAL HOOK - Frontend ODYSSEE Architecture
 * Hook personnalisé pour faciliter l'utilisation des modals globaux
 * Version: 1.0.0 - Architecture ODYSSEE
 */

import { useDispatch } from 'react-redux';
import { useAppDispatch } from '../store';
import { 
  openServiceFormModal, 
  openUserFormModal,
  openConfirmationModal, 
  openErrorModal, 
  openLoadingModal,
  closeModal 
} from '../store/slices/modalSlice';
import { Service, User } from '../types/api';

export const useModal = () => {
  const dispatch = useAppDispatch();

  // Ouvrir le modal de formulaire de service
  const openServiceForm = (serviceToEdit?: Service | null) => {
    dispatch(openServiceFormModal({ serviceToEdit }));
  };

  // Ouvrir le modal de formulaire d'utilisateur
  const openUserForm = (userToEdit?: User | null) => {
    dispatch(openUserFormModal({ userToEdit }));
  };

  // Ouvrir le modal de confirmation
  const openConfirmation = (params: {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    actionType: 'delete-service' | 'delete-user' | 'custom';
    actionData?: any;
  }) => {
    dispatch(openConfirmationModal(params));
  };

  // Ouvrir le modal d'erreur
  const openError = (params: {
    title: string;
    message: string;
  }) => {
    dispatch(openErrorModal(params));
  };

  // Ouvrir le modal de chargement
  const openLoading = (message?: string) => {
    dispatch(openLoadingModal({ message }));
  };

  // Fermer le modal
  const close = () => {
    dispatch(closeModal());
  };

  return {
    openServiceForm,
    openUserForm,
    openConfirmation,
    openError,
    openLoading,
    close,
  };
}; 