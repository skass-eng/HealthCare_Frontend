'use client';

import { CloudArrowUpIcon, DocumentMagnifyingGlassIcon, CheckCircleIcon, ExclamationCircleIcon, DocumentTextIcon, UserIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { ChangeEvent, useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUsers } from '../store/slices/userSlice';
import { 
  setSelectedFile,
  startExtraction,
  updateExtractionProgress,
  extractionComplete,
  extractionFailed,
  setServices,
  setTempFilePath,
  updateFormField,
  setError,
  setSuccess,
  resetPdfExtraction,
  selectPdfExtraction,
  selectFormData,
} from '../store/slices/pdfExtractionSlice';
import { addPendingTask } from '../store/slices/plaintesNotificationSlice';
import type { RootState, AppDispatch } from '../store';
import apiService from '@/lib/api';
import wsService from '@/lib/websocket';

interface PdfUploadPanelProps {
  onSubmit: (data: any) => void;
  onClose: () => void;
}

export default function PdfUploadPanel({ onSubmit, onClose }: PdfUploadPanelProps) {
  const dispatch = useDispatch<AppDispatch>();
  
  // Sélecteurs Redux
  const users = useSelector((state: RootState) => state.user?.users || []);
  const pdfState = useSelector(selectPdfExtraction);
  const formData = useSelector(selectFormData);
  
  // État local pour le bouton de soumission
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Destructurer les valeurs du state
  const {
    selectedFileName,
    selectedFileSize,
    tempFilePath,
    isExtracting,
    extractionTaskId,
    extractionStep,
    extractionMessage,
    extractedData,
    extractedText,
    services,
    error,
    success,
  } = pdfState;
  
  // État local pour le fichier (non sérialisable dans Redux)
  const selectedFileRef = useRef<File | null>(null);
  
  // Ref pour le polling
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  
  // Ref pour les services (évite les problèmes de closure dans useEffect)
  const servicesRef = useRef(services);
  useEffect(() => {
    servicesRef.current = services;
  }, [services]);

  // Charger les utilisateurs au montage
  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  // Référence pour le task_id actuel (évite les problèmes de closure)
  const taskIdRef = useRef<string | null>(null);
  useEffect(() => {
    taskIdRef.current = extractionTaskId;
    console.log('📌 [PdfUploadPanel] Task ID mis à jour:', extractionTaskId);
  }, [extractionTaskId]);

  // Setup WebSocket listeners pour les extractions (une seule fois)
  useEffect(() => {
    // Connecter au WebSocket si pas déjà fait
    if (!wsService.isConnected()) {
      wsService.connect().catch(() => {
        console.warn('⚠️ WebSocket non disponible, mode polling activé');
      });
    }

    // Écouter les événements de démarrage
    wsService.onPdfExtractionStarted((data) => {
      console.log('🚀 [WS] Événement pdf_extraction_started reçu:', data);
      if (taskIdRef.current && data.task_id === taskIdRef.current) {
        console.log('✅ [WS] Task ID correspond, mise à jour étape:', data.step);
        dispatch(updateExtractionProgress({ 
          step: data.step || 1, 
          message: data.message || 'Extraction démarrée...' 
        }));
      }
    });

    // Écouter les événements de progression
    wsService.onPdfExtractionProgress((data) => {
      console.log('🔄 [WS] Événement pdf_extraction_progress reçu:', data);
      if (taskIdRef.current && data.task_id === taskIdRef.current) {
        console.log('✅ [WS] Task ID correspond, mise à jour étape:', data.step);
        dispatch(updateExtractionProgress({ 
          step: data.step, 
          message: data.message 
        }));
      }
    });

    // Écouter les événements de complétion
    wsService.onPdfExtractionComplete((data) => {
      console.log('✅ [WS] Événement pdf_extraction_complete reçu:', data);
      console.log('📌 [WS] taskIdRef.current =', taskIdRef.current, '| data.task_id =', data.task_id);
      
      // Accepter si le task_id correspond OU si on est en cours d'extraction (fallback)
      const shouldProcess = (taskIdRef.current && data.task_id === taskIdRef.current) || 
                           (taskIdRef.current && !data.task_id);
      
      if (shouldProcess || taskIdRef.current) {
        console.log('✅ [WS] Traitement des données d\'extraction');
        console.log('📊 [WS] Données extraction:', JSON.stringify(data, null, 2));
        
        if (data.extraction?.donnees_structurees) {
          const extracted = data.extraction.donnees_structurees;
          console.log('📋 [WS] Données structurées reçues:', extracted);
          
          dispatch(extractionComplete({
            extractedData: extracted,
            extractedText: data.extraction.texte_brut || '',
            services: servicesRef.current,
          }));
        } else {
          console.warn('⚠️ [WS] Pas de donnees_structurees dans data.extraction');
        }
        
        // Annuler le polling si actif
        if (pollingRef.current) {
          clearTimeout(pollingRef.current);
          pollingRef.current = null;
        }
      }
    });

    wsService.onPdfExtractionFailed((data) => {
      console.log('❌ [WS] Événement pdf_extraction_failed reçu:', data);
      if (taskIdRef.current && data.task_id === taskIdRef.current) {
        console.log('❌ [WS] Task ID correspond, erreur');
        dispatch(extractionFailed(data.error || 'Erreur lors de l\'analyse IA'));
        
        // Annuler le polling si actif
        if (pollingRef.current) {
          clearTimeout(pollingRef.current);
          pollingRef.current = null;
        }
      }
    });

    return () => {
      // NE PAS nettoyer les listeners ici - ils sont gérés globalement par PlainteNotificationHandler
      // wsService.cleanupExtractionListeners();
      if (pollingRef.current) {
        clearTimeout(pollingRef.current);
      }
    };
  }, [dispatch]);

  // Fonction pour traiter les résultats d'extraction (mode synchrone/fallback)
  const handleExtractionComplete = useCallback((data: any) => {
    if (data.extraction?.donnees_structurees) {
      const extracted = data.extraction.donnees_structurees;
      
      dispatch(extractionComplete({
        extractedData: extracted,
        extractedText: data.extraction.texte_brut || '',
        services: servicesRef.current,
      }));
    }
  }, [dispatch]);

  // Nouvelle méthode de prévisualisation asynchrone
  const handlePreviewAsync = async (file: File) => {
    dispatch(setError(null));
    dispatch(setSuccess(null));
    
    try {
      console.log('📤 [PdfUploadPanel] Lancement extraction async:', file.name);
      const response = await apiService.previewPdfExtractionAsync(file);
      
      console.log('📥 [PdfUploadPanel] Réponse async:', response);
      
      if (response.success && response.data) {
        const data = response.data;
        
        // Stocker les services disponibles dans le store
        if (data.services_disponibles) {
          dispatch(setServices(data.services_disponibles));
          servicesRef.current = data.services_disponibles;
        }
        
        // Si c'est une réponse synchrone (fallback), traiter directement
        if (data.async === false && data.extraction) {
          console.log('⚡ [PdfUploadPanel] Mode synchrone (fallback)');
          handleExtractionComplete({ extraction: data.extraction });
          return;
        }
        
        // Mode asynchrone - attendre la notification WebSocket
        if (data.async === true && data.task_id) {
          console.log('🔄 [PdfUploadPanel] Mode asynchrone, task_id:', data.task_id);
          
          // IMPORTANT: Sauvegarder le temp_file_path immédiatement pour permettre
          // la création de plainte même après un refresh de la page
          if (data.temp_file_path) {
            console.log('📁 [PdfUploadPanel] Sauvegarde temp_file_path:', data.temp_file_path);
            dispatch(setTempFilePath(data.temp_file_path));
          }
          
          dispatch(startExtraction({ taskId: data.task_id }));
          
          // Ajouter la tâche au store de notifications pour l'indicateur global
          dispatch(addPendingTask({
            task_id: data.task_id,
            type: 'pdf_extraction',
            filename: file.name,
            started_at: new Date().toISOString(),
            progress: 0,
            step: 'Envoi du fichier...',
          }));
          
          // S'abonner aux notifications pour cette tâche
          if (wsService.isConnected()) {
            wsService.subscribeToExtraction(data.task_id);
          }
          
          // Fallback: polling si WebSocket ne répond pas dans 5 minutes (Ollama peut être lent)
          pollingRef.current = setTimeout(() => {
            console.log('⏱️ [PdfUploadPanel] Timeout WebSocket (5 min), fallback sur appel synchrone');
            handlePreviewSync(file);
          }, 300000); // 5 minutes au lieu de 60 secondes
        }
      } else {
        dispatch(setError(response.message || 'Erreur lors du lancement de l\'analyse'));
      }
    } catch (err: any) {
      console.error('❌ [PdfUploadPanel] Exception:', err);
      dispatch(setError(err.message || 'Erreur lors de la prévisualisation'));
    }
  };

  // Méthode de prévisualisation synchrone (fallback)
  const handlePreviewSync = async (file: File) => {
    dispatch(updateExtractionProgress({ step: 2, message: '🔄 Analyse synchrone en cours...' }));
    
    try {
      const response = await apiService.previewPdfExtraction(file);
      
      console.log('📥 [PdfUploadPanel] Réponse sync reçue:', response);
      
      if (response.success && response.data) {
        const data = response.data;
        
        // Stocker les services disponibles
        if (data.services_disponibles) {
          dispatch(setServices(data.services_disponibles));
          servicesRef.current = data.services_disponibles;
        }
        
        // Stocker les données extraites
        if (data.extraction?.donnees_structurees) {
          dispatch(extractionComplete({
            extractedData: data.extraction.donnees_structurees,
            extractedText: data.extraction.texte_brut || '',
            services: data.services_disponibles || [],
          }));
        } else {
          console.warn('⚠️ [PdfUploadPanel] Aucune donnée structurée trouvée');
        }
      } else {
        dispatch(setError(response.message || 'Erreur lors de la prévisualisation'));
      }
    } catch (err: any) {
      console.error('❌ [PdfUploadPanel] Exception:', err);
      dispatch(extractionFailed(err.message || 'Erreur lors de la prévisualisation du PDF'));
    }
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      selectedFileRef.current = file;
      dispatch(setSelectedFile({ name: file.name, size: file.size }));
      
      // Lancer la prévisualisation asynchrone
      await handlePreviewAsync(file);
    } else if (file) {
      dispatch(setError('Seuls les fichiers PDF sont acceptés'));
    }
  };

  const handleSubmit = async () => {
    console.log('🔍 [handleSubmit] === DÉBUT SOUMISSION ===');
    console.log('🔍 [handleSubmit] formData depuis le store Redux:', formData);
    console.log('🔍 [handleSubmit] selectedFileRef.current:', selectedFileRef.current);
    console.log('🔍 [handleSubmit] selectedFileName depuis Redux:', selectedFileName);
    console.log('🔍 [handleSubmit] tempFilePath depuis Redux:', tempFilePath);
    
    // Vérifier si on a les données extraites (cas où l'utilisateur a navigué et est revenu)
    const hasExtractedData = extractedData !== null;
    const hasFile = selectedFileRef.current !== null;
    const hasTempFile = tempFilePath !== null && tempFilePath !== undefined;
    
    console.log('🔍 [handleSubmit] hasExtractedData:', hasExtractedData, '| hasFile:', hasFile, '| hasTempFile:', hasTempFile);

    // Si pas de fichier ET pas de fichier temp ET pas de données extraites, erreur
    if (!hasFile && !hasTempFile && !hasExtractedData) {
      dispatch(setError('Veuillez sélectionner un fichier PDF'));
      return;
    }

    // Validation des champs obligatoires depuis le store
    if (!formData.titre.trim()) {
      dispatch(setError('Le titre de la plainte est obligatoire'));
      return;
    }
    if (!formData.description.trim()) {
      dispatch(setError('La description est obligatoire'));
      return;
    }
    if (!formData.nom.trim()) {
      dispatch(setError('Le nom du plaignant est obligatoire'));
      return;
    }
    if (!formData.prenom.trim()) {
      dispatch(setError('Le prénom du plaignant est obligatoire'));
      return;
    }
    if (!formData.service_id) {
      dispatch(setError('Veuillez sélectionner un service'));
      return;
    }

    if (isSubmitting) return;
    setIsSubmitting(true);
    dispatch(setError(null));
    
    try {
      let response;
      
      // Données communes
      const userData = {
        nom: formData.nom.trim() || 'Non renseigné',
        prenom: formData.prenom.trim() || 'Non renseigné',
        email: formData.email.trim() || null,
        telephone: formData.telephone.trim() || null,
        titre: formData.titre.trim() || `Plainte du ${new Date().toLocaleDateString('fr-FR')}`,
        description: formData.description.trim() || 'Description à compléter',
        mode_reception: formData.mode_reception || 'pdf_import',
        date_incident: formData.date_incident || null,
        priorite: formData.priorite || 'MOYEN',
        assigned_user_id: formData.assigned_user_id || null,
      };
      
      if (hasFile) {
        // CAS 1: On a le fichier local → utiliser l'endpoint avec PDF
        console.log('📤 [handleSubmit] CAS 1: Fichier local disponible, utilisation createPlainteFromPdf');
        console.log('📤 [handleSubmit] userData:', JSON.stringify(userData, null, 2));
        
        response = await apiService.createPlainteFromPdf(
          selectedFileRef.current,
          formData.service_id || 1,
          userData
        );
      } else if (hasTempFile) {
        // CAS 2: Fichier temp sur le serveur → utiliser le nouvel endpoint depuis-temp
        console.log('📤 [handleSubmit] CAS 2: Fichier temp disponible, utilisation createPlainteFromTempFile');
        console.log('📤 [handleSubmit] tempFilePath:', tempFilePath);
        console.log('📤 [handleSubmit] userData:', JSON.stringify(userData, null, 2));
        
        response = await apiService.createPlainteFromTempFile(
          tempFilePath,
          'pdf',
          formData.service_id || 1,
          userData
        );
      } else {
        // CAS 3: Fallback - créer la plainte sans document (cas rare)
        console.log('📤 [handleSubmit] CAS 3: Pas de fichier, création plainte sans document');
        
        const plainteData = {
          nom_plaignant: userData.nom,
          prenom_plaignant: userData.prenom,
          email_plaignant: userData.email,
          telephone_plaignant: userData.telephone,
          titre: userData.titre,
          description: userData.description,
          mode_reception: userData.mode_reception,
          date_incident: userData.date_incident,
          priorite: userData.priorite,
          assigned_user_id: userData.assigned_user_id,
          service_id: formData.service_id || 1,
        };
        
        response = await apiService.createPlainte(plainteData);
      }
      
      console.log('📥 [handleSubmit] Réponse API:', response);
      
      if (response.success && response.data) {
        const numeroPlaynte = response.data.plainte?.numero_plainte || response.data.numero_plainte || 'N/A';
        dispatch(setSuccess(`Plainte ${numeroPlaynte} créée avec succès !`));
        
        // Appeler le callback avec les données
        onSubmit(response.data);
        
        // Reset et fermer après un délai
        setTimeout(() => {
          dispatch(resetPdfExtraction());
          onClose();
        }, 2000);
      } else {
        dispatch(setError(response.message || 'Erreur lors de la création de la plainte'));
      }
    } catch (err: any) {
      console.error('❌ [handleSubmit] Exception:', err);
      dispatch(setError(err.message || 'Erreur lors de la création de la plainte depuis le PDF'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleButtonClick = () => {
    document.getElementById('pdf-file-input')?.click();
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type === 'application/pdf') {
        selectedFileRef.current = file;
        dispatch(setSelectedFile({ name: file.name, size: file.size }));
        await handlePreviewAsync(file);
      } else {
        dispatch(setError('Seuls les fichiers PDF sont acceptés'));
      }
    }
  }, [dispatch]);

  const getConfidenceColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600 bg-green-100';
    if (score >= 0.5) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  // Helper pour mettre à jour un champ du formulaire
  const updateField = (field: keyof typeof formData, value: any) => {
    dispatch(updateFormField({ field, value }));
  };

  return (
    <div className="bg-white/95 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/40 mt-8">
      <div className="max-w-4xl mx-auto">
        {/* Messages d'erreur et succès */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
            <ExclamationCircleIcon className="w-5 h-5 text-red-500" />
            <span className="text-red-700">{error}</span>
          </div>
        )}
        
        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
            <CheckCircleIcon className="w-5 h-5 text-green-500" />
            <span className="text-green-700">{success}</span>
          </div>
        )}

        {/* Indicateur d'analyse en cours (overlay plein écran centré) */}
        {isExtracting && (
          <div className="fixed inset-0 bg-gradient-to-br from-slate-900/70 via-slate-800/60 to-teal-900/50 backdrop-blur-md z-[9999] flex items-center justify-center">
            <div className="bg-white rounded-3xl p-8 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.4)] w-full max-w-md -mt-20 border-2 border-teal-100 relative overflow-hidden">
              {/* Effet de brillance en arrière-plan */}
              <div className="absolute inset-0 bg-gradient-to-br from-teal-50/50 via-transparent to-blue-50/30 pointer-events-none"></div>
              
              {/* Contenu */}
              <div className="relative z-10">
                {/* Icône animée */}
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-teal-400 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-teal-500/30 animate-pulse">
                    <DocumentMagnifyingGlassIcon className="w-8 h-8 text-white" />
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-slate-800 mb-6 text-center">Analyse IA en cours</h3>
              
                {/* Indicateur de progression par étapes */}
                <div className="space-y-3 mb-6 bg-slate-50/80 rounded-2xl p-5 border border-slate-100">
                  {/* Étape 1: Envoi du fichier */}
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 shadow-md ${
                      extractionStep >= 1 
                        ? 'bg-gradient-to-br from-teal-400 to-teal-600 text-white shadow-teal-500/40' 
                        : 'bg-slate-200 text-slate-400'
                    }`}>
                      {extractionStep > 1 ? (
                        <CheckCircleIcon className="w-6 h-6" />
                      ) : extractionStep === 1 ? (
                        <ArrowPathIcon className="w-5 h-5 animate-spin" />
                      ) : (
                        <span className="text-sm font-bold">1</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className={`font-medium ${extractionStep >= 1 ? 'text-slate-800' : 'text-slate-400'}`}>
                        Envoi du fichier
                      </p>
                      <p className="text-xs text-slate-500">Upload du PDF au serveur</p>
                    </div>
                  </div>

                  {/* Ligne de connexion */}
                  <div className="ml-5 w-0.5 h-3 bg-slate-200 rounded-full relative overflow-hidden">
                    <div className={`absolute inset-0 bg-gradient-to-b from-teal-400 to-teal-600 transition-all duration-500 ${extractionStep >= 2 ? 'h-full' : 'h-0'}`}></div>
                  </div>

                  {/* Étape 2: Extraction du texte */}
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 shadow-md ${
                      extractionStep >= 2 
                        ? 'bg-gradient-to-br from-teal-400 to-teal-600 text-white shadow-teal-500/40' 
                        : 'bg-slate-200 text-slate-400'
                    }`}>
                      {extractionStep > 2 ? (
                        <CheckCircleIcon className="w-6 h-6" />
                      ) : extractionStep === 2 ? (
                        <ArrowPathIcon className="w-5 h-5 animate-spin" />
                      ) : (
                        <span className="text-sm font-bold">2</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className={`font-medium ${extractionStep >= 2 ? 'text-slate-800' : 'text-slate-400'}`}>
                        Extraction du texte
                      </p>
                      <p className="text-xs text-slate-500">Lecture du contenu du PDF</p>
                    </div>
                  </div>

                  {/* Ligne de connexion */}
                  <div className="ml-5 w-0.5 h-3 bg-slate-200 rounded-full relative overflow-hidden">
                    <div className={`absolute inset-0 bg-gradient-to-b from-teal-400 to-teal-600 transition-all duration-500 ${extractionStep >= 3 ? 'h-full' : 'h-0'}`}></div>
                  </div>

                  {/* Étape 3: Analyse IA */}
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 shadow-md ${
                      extractionStep >= 3 
                        ? 'bg-gradient-to-br from-teal-400 to-teal-600 text-white shadow-teal-500/40' 
                        : 'bg-slate-200 text-slate-400'
                    }`}>
                      {extractionStep > 3 ? (
                        <CheckCircleIcon className="w-6 h-6" />
                      ) : extractionStep === 3 ? (
                        <ArrowPathIcon className="w-5 h-5 animate-spin" />
                      ) : (
                        <span className="text-sm font-bold">3</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className={`font-medium ${extractionStep >= 3 ? 'text-slate-800' : 'text-slate-400'}`}>
                        Analyse IA
                      </p>
                      <p className="text-xs text-slate-500">Extraction intelligente des données</p>
                    </div>
                  </div>

                  {/* Ligne de connexion */}
                  <div className="ml-5 w-0.5 h-3 bg-slate-200 rounded-full relative overflow-hidden">
                    <div className={`absolute inset-0 bg-gradient-to-b from-green-400 to-green-600 transition-all duration-500 ${extractionStep >= 4 ? 'h-full' : 'h-0'}`}></div>
                  </div>

                  {/* Étape 4: Terminé */}
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 shadow-md ${
                      extractionStep >= 4 
                        ? 'bg-gradient-to-br from-green-400 to-green-600 text-white shadow-green-500/40' 
                        : 'bg-slate-200 text-slate-400'
                    }`}>
                      {extractionStep >= 4 ? (
                        <CheckCircleIcon className="w-6 h-6" />
                      ) : (
                        <span className="text-sm font-bold">4</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className={`font-medium ${extractionStep >= 4 ? 'text-green-600' : 'text-slate-400'}`}>
                        Terminé
                      </p>
                      <p className="text-xs text-slate-500">Prêt pour validation</p>
                    </div>
                  </div>
                </div>

                {/* Message de l'étape courante */}
                <div className="text-center bg-gradient-to-r from-teal-50 to-blue-50 rounded-xl p-4 border border-teal-100">
                  <p className="text-slate-700 font-medium">{extractionMessage}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Zone de drop pour PDF */}
        <div 
          className={`border-2 border-dashed rounded-xl p-8 mb-6 transition-colors cursor-pointer ${
            isExtracting 
              ? 'border-teal-400 bg-teal-50/50 pointer-events-none' 
              : 'border-teal-300 bg-teal-50/50 hover:border-teal-400'
          }`}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={isExtracting ? undefined : handleButtonClick}
        >
          <div className="text-center">
            {isExtracting ? (
              <>
                <DocumentMagnifyingGlassIcon className="w-12 h-12 text-teal-500 mx-auto mb-4 animate-pulse" />
                <h3 className="text-lg font-semibold text-teal-700 mb-2">Analyse en cours...</h3>
                <p className="text-teal-600 mb-4">Étape {extractionStep}/4 - {extractionMessage}</p>
                {/* Mini indicateur d'étapes */}
                <div className="flex items-center justify-center gap-2">
                  {[1, 2, 3, 4].map((step) => (
                    <div
                      key={step}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        step < extractionStep 
                          ? 'bg-teal-500' 
                          : step === extractionStep 
                            ? 'bg-teal-500 animate-pulse scale-125' 
                            : 'bg-slate-300'
                      }`}
                    />
                  ))}
                </div>
              </>
            ) : (
              <>
                <CloudArrowUpIcon className="w-12 h-12 text-teal-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-teal-700 mb-2">Glissez votre fichier PDF ici</h3>
                <p className="text-teal-600 mb-4">ou cliquez pour sélectionner un fichier</p>
              </>
            )}
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="hidden"
              id="pdf-file-input"
              disabled={isExtracting}
            />
            {!isExtracting && (
              <button 
                onClick={(e) => { e.stopPropagation(); handleButtonClick(); }}
                className="bg-gradient-to-r from-teal-500 to-teal-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
              >
                Sélectionner un PDF
              </button>
            )}
            {selectedFileName && (
              <div className="mt-4 p-3 bg-teal-100 rounded-lg">
                <p className="text-teal-700 text-sm font-medium">
                  Fichier sélectionné : {selectedFileName} ({selectedFileSize ? (selectedFileSize / 1024).toFixed(1) : 0} Ko)
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Informations extraites (prévisualisation) */}
        {extractedData && (
          <div className="bg-slate-50 rounded-xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <DocumentMagnifyingGlassIcon className="w-5 h-5 text-teal-500" />
                Informations extraites
              </h3>
              {extractedData.confiance_extraction && (
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getConfidenceColor(extractedData.confiance_extraction.score_global)}`}>
                  Confiance: {Math.round(extractedData.confiance_extraction.score_global * 100)}%
                </span>
              )}
            </div>
            
            {/* Scores de confiance par catégorie (multi-prompt) */}
            {extractedData.confiance_extraction?.scores_par_categorie && (
              <div className="mb-4 p-3 bg-slate-100 rounded-lg">
                <h4 className="text-sm font-medium text-slate-600 mb-2">Confiance par catégorie (extraction multi-prompt)</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {Object.entries(extractedData.confiance_extraction.scores_par_categorie).map(([category, score]: [string, any]) => (
                    <div key={category} className="flex items-center gap-2">
                      <span className="text-xs text-slate-500 capitalize">{category}:</span>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getConfidenceColor(score as number)}`}>
                        {Math.round((score as number) * 100)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Informations du plaignant */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-green-500 rounded-lg flex items-center justify-center">
                    <UserIcon className="w-4 h-4 text-white" />
                  </div>
                  <h4 className="text-md font-medium text-slate-700">Informations du plaignant</h4>
                </div>
                {extractedData.confiance_extraction?.scores_par_categorie?.plaignant && (
                  <span className={`text-xs px-2 py-0.5 rounded-full ${getConfidenceColor(extractedData.confiance_extraction.scores_par_categorie.plaignant)}`}>
                    {Math.round(extractedData.confiance_extraction.scores_par_categorie.plaignant * 100)}% confiance
                  </span>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded-lg p-4 border border-slate-200">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Nom *</label>
                  <input 
                    type="text" 
                    value={formData.nom}
                    onChange={(e) => updateField('nom', e.target.value)}
                    placeholder="Nom du plaignant" 
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div className="bg-white rounded-lg p-4 border border-slate-200">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Prénom *</label>
                  <input 
                    type="text" 
                    value={formData.prenom}
                    onChange={(e) => updateField('prenom', e.target.value)}
                    placeholder="Prénom du plaignant" 
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div className="bg-white rounded-lg p-4 border border-slate-200">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                  <input 
                    type="email" 
                    value={formData.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    placeholder="email@exemple.com" 
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div className="bg-white rounded-lg p-4 border border-slate-200">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Téléphone</label>
                  <input 
                    type="tel" 
                    value={formData.telephone}
                    onChange={(e) => updateField('telephone', e.target.value)}
                    placeholder="01 23 45 67 89" 
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Détails de la plainte */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-blue-500 rounded-lg flex items-center justify-center">
                    <DocumentTextIcon className="w-4 h-4 text-white" />
                  </div>
                  <h4 className="text-md font-medium text-slate-700">Détails de la plainte</h4>
                </div>
                {extractedData.confiance_extraction?.scores_par_categorie?.description && (
                  <span className={`text-xs px-2 py-0.5 rounded-full ${getConfidenceColor(extractedData.confiance_extraction.scores_par_categorie.description)}`}>
                    {Math.round(extractedData.confiance_extraction.scores_par_categorie.description * 100)}% confiance
                  </span>
                )}
              </div>
              
              {/* Titre */}
              <div className="bg-white rounded-lg p-4 border border-slate-200 mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">Titre de la plainte *</label>
                <input 
                  type="text" 
                  value={formData.titre}
                  onChange={(e) => updateField('titre', e.target.value)}
                  placeholder="Ex: Problème d'accueil aux urgences..." 
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
              
              {/* Description */}
              <div className="bg-white rounded-lg p-4 border border-slate-200 mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">Description détaillée *</label>
                <textarea 
                  rows={4}
                  value={formData.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  placeholder="Décrivez en détail la plainte..." 
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
              
              {/* Ligne avec Mode réception et Date incident */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="bg-white rounded-lg p-4 border border-slate-200">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Mode de réception *</label>
                  <select 
                    value={formData.mode_reception}
                    onChange={(e) => updateField('mode_reception', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  >
                    <option value="pdf_import">Import PDF</option>
                    <option value="email">Email</option>
                    <option value="papier">Papier/Courrier</option>
                    <option value="telephone">Téléphone</option>
                    <option value="autre">Autre</option>
                  </select>
                </div>
                <div className="bg-white rounded-lg p-4 border border-slate-200">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Date de l'incident</label>
                  <input 
                    type="date" 
                    value={formData.date_incident}
                    onChange={(e) => updateField('date_incident', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              {/* Ligne avec Service, Priorité et Assigné à */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg p-4 border border-slate-200">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Service concerné *</label>
                  <select 
                    value={formData.service_id || ''}
                    onChange={(e) => updateField('service_id', e.target.value ? parseInt(e.target.value) : null)}
                    className="w-full px-3 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Sélectionner un service...</option>
                    {services.map((service) => (
                      <option key={service.id} value={service.id}>
                        {service.nom}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="bg-white rounded-lg p-4 border border-slate-200">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Priorité *</label>
                  <select 
                    value={formData.priorite}
                    onChange={(e) => updateField('priorite', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent ${
                      formData.priorite === 'URGENT' ? 'border-red-300 focus:ring-red-500 text-red-700 font-semibold' :
                      formData.priorite === 'ELEVE' ? 'border-orange-300 focus:ring-orange-500 text-orange-700 font-semibold' :
                      formData.priorite === 'MOYEN' ? 'border-yellow-300 focus:ring-yellow-500 text-yellow-700 font-semibold' :
                      'border-green-300 focus:ring-green-500 text-green-700 font-semibold'
                    }`}
                  >
                    <option value="BAS">BAS</option>
                    <option value="MOYEN">MOYEN</option>
                    <option value="ELEVE">ÉLEVÉ</option>
                    <option value="URGENT">URGENT</option>
                  </select>
                </div>
                <div className="bg-white rounded-lg p-4 border border-slate-200">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Assigné à</label>
                  <select 
                    value={formData.assigned_user_id || ''}
                    onChange={(e) => updateField('assigned_user_id', e.target.value ? parseInt(e.target.value) : null)}
                    className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Sélectionner un utilisateur...</option>
                    {users.map((user: any) => (
                      <option key={user.id} value={user.id}>
                        {user.nom && user.prenom ? `${user.prenom} ${user.nom}` : user.email || `Utilisateur ${user.id}`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Analyse IA */}
            {extractedData.analyse && (
              <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-lg p-4 border border-teal-200">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-md font-medium text-teal-800">Analyse automatique</h4>
                  {extractedData.confiance_extraction?.scores_par_categorie?.analyse && (
                    <span className={`text-xs px-2 py-0.5 rounded-full ${getConfidenceColor(extractedData.confiance_extraction.scores_par_categorie.analyse)}`}>
                      {Math.round(extractedData.confiance_extraction.scores_par_categorie.analyse * 100)}% confiance
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-slate-600">Priorité suggérée:</span>
                    <span className={`ml-2 font-semibold ${
                      extractedData.analyse.priorite_suggeree === 'URGENT' ? 'text-red-600' :
                      extractedData.analyse.priorite_suggeree === 'ELEVE' ? 'text-orange-600' :
                      extractedData.analyse.priorite_suggeree === 'MOYEN' ? 'text-yellow-600' :
                      'text-green-600'
                    }`}>
                      {extractedData.analyse.priorite_suggeree}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-600">Gravité:</span>
                    <span className="ml-2 font-medium text-slate-800">{extractedData.analyse.gravite_estimee}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-600">Mots-clés:</span>
                    <span className="ml-2">{extractedData.analyse.mots_cles?.join(', ') || 'Aucun'}</span>
                  </div>
                </div>
                {extractedData.analyse.resume_court && (
                  <p className="mt-2 text-sm text-slate-600 italic">{extractedData.analyse.resume_court}</p>
                )}
              </div>
            )}

            {/* Champs incertains */}
            {extractedData.confiance_extraction?.champs_incertains?.length > 0 && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-700">
                  <strong>Attention:</strong> Certains champs ont été extraits avec incertitude: {extractedData.confiance_extraction.champs_incertains.join(', ')}. 
                  Veuillez les vérifier avant de créer la plainte.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Texte brut extrait (optionnel, collapsible) */}
        {extractedText && (
          <details className="mb-6">
            <summary className="cursor-pointer text-sm text-slate-600 hover:text-slate-800">
              Voir le texte brut extrait ({extractedText.length} caractères)
            </summary>
            <div className="mt-2 p-4 bg-slate-100 rounded-lg max-h-48 overflow-y-auto">
              <pre className="text-xs text-slate-700 whitespace-pre-wrap">{extractedText}</pre>
            </div>
          </details>
        )}

        {/* Boutons d'action */}
        <div className="flex justify-end gap-4">
          <button 
            onClick={() => {
              dispatch(resetPdfExtraction());
              onClose();
            }}
            disabled={isSubmitting}
            className="px-6 py-3 border border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            Annuler
          </button>
          <button 
            onClick={handleSubmit}
            disabled={!selectedFileName || isExtracting || !extractedData || isSubmitting}
            className={`px-6 py-3 rounded-xl font-semibold shadow-lg transition-all duration-300 flex items-center gap-2 ${
              selectedFileName && !isExtracting && extractedData && !isSubmitting
                ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white hover:shadow-xl transform hover:-translate-y-1' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                Création en cours...
              </>
            ) : (
              'Créer la plainte'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
