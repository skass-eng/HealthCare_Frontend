/**
 * PlainteNotificationHandler
 * 
 * Composant global qui gère les notifications en temps réel pour les tâches de traitement
 * de plaintes (extraction PDF/Image). Il écoute les événements WebSocket et
 * déclenche des notifications toast + met à jour le badge de la sidebar.
 * 
 * Ce composant doit être monté une seule fois au niveau App.tsx
 */

import React, { useEffect, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { RootState } from '@/store';
import wsService from '@/lib/websocket';
import {
  addPendingTask,
  updateTaskProgress,
  removePendingTask,
  addPlainteNotification,
  markCreationPageVisited,
  PlainteNotification,
} from '@/store/slices/plaintesNotificationSlice';
import { addNotification } from '@/store/slices/notificationSlice';
import {
  updateExtractionProgress,
  extractionComplete,
  extractionFailed,
  selectPdfExtraction,
} from '@/store/slices/pdfExtractionSlice';
import {
  extractionComplete as imageExtractionComplete,
  extractionFailed as imageExtractionFailed,
  selectImageExtraction,
} from '@/store/slices/imageExtractionSlice';

interface PlainteNotificationHandlerProps {
  // Optionnel: callback personnalisé pour les notifications
  onNotification?: (notification: PlainteNotification) => void;
}

const PlainteNotificationHandler: React.FC<PlainteNotificationHandlerProps> = ({ onNotification }) => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { token } = useSelector((state: RootState) => state.auth);
  const pdfState = useSelector(selectPdfExtraction);
  const imageState = useSelector(selectImageExtraction);
  const isListeningRef = useRef(false);
  
  // Référence pour le task_id de l'extraction PDF en cours
  const pdfTaskIdRef = useRef<string | null>(null);
  useEffect(() => {
    pdfTaskIdRef.current = pdfState.extractionTaskId;
  }, [pdfState.extractionTaskId]);
  
  // Référence pour le task_id de l'extraction Image en cours
  const imageTaskIdRef = useRef<string | null>(null);
  useEffect(() => {
    imageTaskIdRef.current = imageState.extractionTaskId;
  }, [imageState.extractionTaskId]);

  // Marquer la page création comme visitée quand on y accède
  useEffect(() => {
    if (location.pathname === '/plaintes/nouvelles') {
      dispatch(markCreationPageVisited());
    }
  }, [location.pathname, dispatch]);

  // Gérer la connexion WebSocket et les événements
  const setupWebSocketListeners = useCallback(() => {
    if (isListeningRef.current) {
      console.log('🔔 PlainteNotificationHandler: Listeners déjà configurés');
      return;
    }

    console.log('🔔 PlainteNotificationHandler: Configuration des listeners WebSocket...');

    // ===== PDF Extraction Events =====
    
    // Démarrage d'extraction PDF
    wsService.onPdfExtractionStarted((data) => {
      console.log('📄 Extraction PDF démarrée:', data);
      
      dispatch(addPendingTask({
        task_id: data.task_id,
        type: 'pdf_extraction',
        filename: data.filename,
        started_at: new Date().toISOString(),
        progress: 0,
        step: data.message || 'Démarrage...',
      }));

      // Notification toast de démarrage
      dispatch(addNotification({
        id: `start_${data.task_id}`,
        type: 'info',
        title: '📄 Traitement en cours',
        message: `Extraction du PDF "${data.filename}" en cours. Vous pouvez continuer à naviguer.`,
        timestamp: new Date().toISOString(),
        read: false,
      }));
    });

    // Progression d'extraction PDF
    wsService.onPdfExtractionProgress((data) => {
      console.log('🔄 Progression PDF:', data);
      
      dispatch(updateTaskProgress({
        task_id: data.task_id,
        step: data.message,
        progress: data.step ? (data.step / 5) * 100 : undefined,
      }));
      
      // Aussi mettre à jour le pdfExtractionSlice si c'est notre tâche en cours
      if (pdfTaskIdRef.current === data.task_id) {
        dispatch(updateExtractionProgress({
          step: data.step || 2,
          message: data.message || 'Traitement en cours...',
        }));
      }
    });

    // Extraction PDF terminée avec succès
    wsService.onPdfExtractionComplete((data) => {
      console.log('✅ Extraction PDF terminée (PlainteNotificationHandler):', data);
      
      dispatch(removePendingTask(data.task_id));

      // Mettre à jour le pdfExtractionSlice avec les données extraites
      // Ceci permet au PdfUploadPanel de récupérer les données même si l'utilisateur a changé de page
      if (data.extraction?.donnees_structurees) {
        console.log('📋 Mise à jour pdfExtractionSlice avec données extraites');
        console.log('📁 Chemin fichier temp:', data.temp_file_path);
        dispatch(extractionComplete({
          extractedData: data.extraction.donnees_structurees,
          extractedText: data.extraction.texte_brut || '',
          tempFilePath: data.temp_file_path || undefined,
        }));
      }

      const notification: PlainteNotification = {
        id: `pdf_complete_${data.task_id}_${Date.now()}`,
        type: 'pdf_extraction',
        status: 'success',
        title: '📄 Extraction terminée !',
        message: `Le PDF "${data.filename}" a été analysé avec succès. Retournez à la page de création pour finaliser.`,
        task_id: data.task_id,
        filename: data.filename,
        timestamp: new Date().toISOString(),
        read: false,
        navigation: {
          href: '/plaintes/nouvelles',
          label: 'Finaliser la plainte',
        },
      };

      dispatch(addPlainteNotification(notification));

      // Toast de succès
      dispatch(addNotification({
        id: `toast_${data.task_id}`,
        type: 'success',
        title: '✅ Plainte créée avec succès',
        message: `Le PDF "${data.filename}" a été traité. Une nouvelle plainte a été créée.`,
        timestamp: new Date().toISOString(),
        read: false,
      }));

      if (onNotification) {
        onNotification(notification);
      }
    });

    // Erreur d'extraction PDF
    wsService.onPdfExtractionFailed((data) => {
      console.log('❌ Extraction PDF échouée:', data);
      
      dispatch(removePendingTask(data.task_id));
      
      // Mettre à jour le pdfExtractionSlice pour signaler l'erreur
      dispatch(extractionFailed(data.error || 'Erreur lors de l\'extraction'));

      const notification: PlainteNotification = {
        id: `pdf_failed_${data.task_id}_${Date.now()}`,
        type: 'pdf_extraction',
        status: 'error',
        title: '❌ Erreur de traitement',
        message: `Échec du traitement du PDF "${data.filename}": ${data.error}`,
        task_id: data.task_id,
        filename: data.filename,
        timestamp: new Date().toISOString(),
        read: false,
      };

      dispatch(addPlainteNotification(notification));

      dispatch(addNotification({
        id: `toast_error_${data.task_id}`,
        type: 'error',
        title: '❌ Erreur de traitement PDF',
        message: data.error || 'Une erreur est survenue lors du traitement.',
        timestamp: new Date().toISOString(),
        read: false,
      }));

      if (onNotification) {
        onNotification(notification);
      }
    });

    // ===== Image Extraction Events =====

    // Démarrage d'extraction Image
    wsService.onImageExtractionStarted((data) => {
      console.log('📷 Extraction Image démarrée:', data);
      
      dispatch(addPendingTask({
        task_id: data.task_id,
        type: 'image_extraction',
        filename: data.filename,
        started_at: new Date().toISOString(),
        progress: 0,
        step: data.message || 'Démarrage...',
      }));

      dispatch(addNotification({
        id: `start_img_${data.task_id}`,
        type: 'info',
        title: '📷 Traitement en cours',
        message: `Analyse de l'image "${data.filename}" en cours. Vous pouvez continuer à naviguer.`,
        timestamp: new Date().toISOString(),
        read: false,
      }));
    });

    // Extraction Image terminée avec succès
    wsService.onImageExtractionComplete((data) => {
      console.log('✅ Extraction Image terminée (PlainteNotificationHandler):', data);
      
      dispatch(removePendingTask(data.task_id));
      
      // Mettre à jour le imageExtractionSlice avec les données extraites
      if (data.extraction?.donnees_structurees) {
        console.log('📋 Mise à jour imageExtractionSlice avec données extraites');
        console.log('📁 Chemin fichier temp:', data.temp_file_path);
        dispatch(imageExtractionComplete({
          extractedData: data.extraction.donnees_structurees,
          extractedText: data.extraction.texte_brut || '',
          ocrInfo: data.ocr_info ? {
            confiance: data.ocr_info.confiance,
            qualite: data.ocr_info.qualite as 'excellent' | 'bon' | 'moyen' | 'faible',
          } : undefined,
          tempFilePath: data.temp_file_path || undefined,
        }));
      }

      const notification: PlainteNotification = {
        id: `img_complete_${data.task_id}_${Date.now()}`,
        type: 'image_extraction',
        status: 'success',
        title: '📷 Extraction terminée !',
        message: `L'image "${data.filename}" a été analysée avec succès. Retournez à la page de création pour finaliser.`,
        task_id: data.task_id,
        filename: data.filename,
        timestamp: new Date().toISOString(),
        read: false,
        navigation: {
          href: '/plaintes/nouvelles',
          label: 'Finaliser la plainte',
        },
      };

      dispatch(addPlainteNotification(notification));

      dispatch(addNotification({
        id: `toast_img_${data.task_id}`,
        type: 'success',
        title: '✅ Plainte créée avec succès',
        message: `L'image "${data.filename}" a été analysée. Une nouvelle plainte a été créée.`,
        timestamp: new Date().toISOString(),
        read: false,
      }));

      if (onNotification) {
        onNotification(notification);
      }
    });

    // Erreur d'extraction Image
    wsService.onImageExtractionFailed((data) => {
      console.log('❌ Extraction Image échouée:', data);
      
      dispatch(removePendingTask(data.task_id));
      
      // Mettre à jour le imageExtractionSlice pour signaler l'erreur
      dispatch(imageExtractionFailed(data.error || 'Erreur lors de l\'extraction'));

      const notification: PlainteNotification = {
        id: `img_failed_${data.task_id}_${Date.now()}`,
        type: 'image_extraction',
        status: 'error',
        title: '❌ Erreur de traitement',
        message: `Échec de l'analyse de l'image "${data.filename}": ${data.error}`,
        task_id: data.task_id,
        filename: data.filename,
        timestamp: new Date().toISOString(),
        read: false,
      };

      dispatch(addPlainteNotification(notification));

      dispatch(addNotification({
        id: `toast_img_error_${data.task_id}`,
        type: 'error',
        title: '❌ Erreur de traitement Image',
        message: data.error || 'Une erreur est survenue lors de l\'analyse.',
        timestamp: new Date().toISOString(),
        read: false,
      }));

      if (onNotification) {
        onNotification(notification);
      }
    });

    isListeningRef.current = true;
    console.log('✅ PlainteNotificationHandler: Listeners WebSocket configurés');
  }, [dispatch, onNotification]);

  // Effet pour initialiser la connexion WebSocket
  useEffect(() => {
    if (!token) {
      console.log('⏳ PlainteNotificationHandler: En attente du token...');
      return;
    }

    const initializeWebSocket = async () => {
      try {
        // S'assurer que la connexion WebSocket est établie
        if (!wsService.isConnected()) {
          console.log('🔌 PlainteNotificationHandler: Connexion WebSocket...');
          await wsService.connect(token);
        }
        
        // Configurer les listeners
        setupWebSocketListeners();
      } catch (error) {
        console.error('❌ PlainteNotificationHandler: Erreur de connexion WebSocket:', error);
      }
    };

    initializeWebSocket();

    // Cleanup
    return () => {
      console.log('🧹 PlainteNotificationHandler: Nettoyage des listeners');
      wsService.cleanupExtractionListeners();
      isListeningRef.current = false;
    };
  }, [token, setupWebSocketListeners]);

  // Ce composant ne rend rien visuellement
  return null;
};

export default PlainteNotificationHandler;
