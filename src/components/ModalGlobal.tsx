/**
 * MODAL GLOBAL - Frontend ODYSSEE Architecture
 * Composant modal global géré par Redux
 * Version: 1.0.0 - Architecture ODYSSEE
 */

import React from 'react';
import { useSelector } from 'react-redux';
import { 
  XMarkIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { RootState } from '../store';
import { closeModal } from '../store/slices/modalSlice';
import { useAppDispatch } from '../store';
import { triggerUserReload, deleteUser, fetchUsers } from '../store/slices/userSlice';
import { deleteService, fetchServices } from '../store/slices/servicesSlice';
import { addNotification } from '../store/slices/notificationSlice';
import ServiceFormModal from './ServiceFormModal';
import UserFormModal from './UserFormModal';

const ModalGlobal: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isOpen, type, data } = useSelector((state: RootState) => state.modal);

  const handleClose = () => {
    dispatch(closeModal());
  };

  const handleConfirmationAction = async () => {
    if (!data?.confirmation) return;

    const { actionType, actionData } = data.confirmation;

    try {
      switch (actionType) {
        case 'delete-service':
          if (actionData?.serviceId) {
            await dispatch(deleteService(actionData.serviceId)).unwrap();
            
            // Recharger la liste des services après suppression
            await dispatch(fetchServices(true)).unwrap();
            
            dispatch(addNotification({
              id: Date.now().toString(),
              type: 'success',
              title: 'Service supprimé',
              message: 'Le service a été supprimé avec succès',
              timestamp: new Date().toISOString(),
              read: false,
            }));
          }
          break;
        case 'delete-user':
          if (actionData?.userId) {
            console.log('🗑️ Suppression de l\'utilisateur:', actionData.userId);
            await dispatch(deleteUser(actionData.userId)).unwrap();
            
            // Recharger la liste des utilisateurs après suppression
            await dispatch(fetchUsers()).unwrap();
            
            dispatch(addNotification({
              id: Date.now().toString(),
              type: 'success',
              title: 'Utilisateur supprimé',
              message: 'L\'utilisateur a été supprimé avec succès',
              timestamp: new Date().toISOString(),
              read: false,
            }));
          }
          break;
        default:
          console.log('Action non reconnue:', actionType);
      }
    } catch (error) {
      console.error('Erreur lors de l\'exécution de l\'action:', error);
      dispatch(addNotification({
        id: Date.now().toString(),
        type: 'error',
        title: 'Erreur',
        message: 'Une erreur s\'est produite lors de l\'exécution de l\'action',
        timestamp: new Date().toISOString(),
        read: false,
      }));
    }
  };

  // Callback de succès pour les services
  const handleServiceSuccess = async () => {
    try {
      // Recharger la liste des services
      await dispatch(fetchServices(true)).unwrap();
      
      // Afficher une notification de succès
      dispatch(addNotification({
        id: Date.now().toString(),
        type: 'success',
        title: 'Service sauvegardé',
        message: 'Le service a été créé/modifié avec succès',
        timestamp: new Date().toISOString(),
        read: false,
      }));
      
      console.log('Service créé/modifié avec succès');
      handleClose();
    } catch (error) {
      console.error('Erreur lors du rechargement des services:', error);
      // Fermer quand même la modal même si le rechargement échoue
      handleClose();
    }
  };

  // Si aucun modal n'est ouvert, ne rien afficher
  if (!isOpen || !type) {
    return null;
  }

  // Rendu du modal selon le type
  switch (type) {
    case 'service-form':
      return (
        <ServiceFormModal
          isOpen={isOpen}
          onClose={handleClose}
          onSuccess={handleServiceSuccess}
          serviceToEdit={data?.serviceForm?.serviceToEdit || null}
        />
      );

    case 'user-form':
      return (
        <UserFormModal
          isOpen={isOpen}
          onClose={handleClose}
          onSuccess={() => {
            // Déclencher le rechargement des utilisateurs
            dispatch(triggerUserReload());
            console.log('Utilisateur créé/modifié avec succès');
            handleClose();
          }}
          user={data?.userForm?.userToEdit || null}
        />
      );

    case 'confirmation':
      return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={handleClose} />
          
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="relative w-full max-w-md bg-white rounded-lg shadow-xl transform transition-all">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {data?.confirmation?.title}
                  </h3>
                  <button
                    onClick={handleClose}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>
                
                <p className="text-gray-600 mb-6">
                  {data?.confirmation?.message}
                </p>
                
                <div className="flex justify-end gap-3">
                  <button
                    onClick={handleClose}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    {data?.confirmation?.cancelText || 'Annuler'}
                  </button>
                  <button
                    onClick={async () => {
                      await handleConfirmationAction();
                      handleClose();
                    }}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    {data?.confirmation?.confirmText || 'Confirmer'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      );

    case 'error':
      return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={handleClose} />
          
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="relative w-full max-w-md bg-white rounded-lg shadow-xl transform transition-all">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <ExclamationTriangleIcon className="w-6 h-6 text-red-500" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    {data?.error?.title}
                  </h3>
                  <button
                    onClick={handleClose}
                    className="ml-auto text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>
                
                <p className="text-gray-600 mb-6">
                  {data?.error?.message}
                </p>
                
                <div className="flex justify-end">
                  <button
                    onClick={handleClose}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      );

    case 'loading':
      return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />
          
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="relative w-full max-w-sm bg-white rounded-lg shadow-xl transform transition-all">
              <div className="p-6 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-600">
                  {data?.loading?.message || 'Chargement...'}
                </p>
              </div>
            </div>
          </div>
        </div>
      );

    default:
      return null;
  }
};

export default ModalGlobal; 