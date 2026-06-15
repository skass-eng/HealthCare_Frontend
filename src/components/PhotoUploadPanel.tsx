'use client';

import { CloudArrowUpIcon, DocumentMagnifyingGlassIcon, CheckCircleIcon, ExclamationCircleIcon, DocumentTextIcon, UserIcon, PhotoIcon } from '@heroicons/react/24/outline';
import { ChangeEvent, useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUsers } from '../store/slices/userSlice';
import { 
  setSelectedFile,
  setImagePreviewUrl,
  startExtraction,
  updateExtractionProgress,
  extractionComplete,
  extractionFailed,
  setServices,
  setTempFilePath,
  updateFormField,
  setError,
  setSuccess,
  resetImageExtraction,
  selectImageExtraction,
  selectFormData,
} from '../store/slices/imageExtractionSlice';
import { addPendingTask } from '../store/slices/plaintesNotificationSlice';
import type { RootState, AppDispatch } from '../store';
import apiService from '@/lib/api';
import wsService from '@/lib/websocket';

interface PhotoUploadPanelProps {
  onSubmit: (data: any) => void;
  onClose: () => void;
}

// Formats d'images acceptés
const acceptedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/tiff', 'image/bmp', 'image/gif'];

export default function PhotoUploadPanel({ onSubmit, onClose }: PhotoUploadPanelProps) {
  const dispatch = useDispatch<AppDispatch>();
  
  // Sélecteurs Redux
  const users = useSelector((state: RootState) => state.user?.users || []);
  const imageState = useSelector(selectImageExtraction);
  const formData = useSelector(selectFormData);
  
  // État local pour le bouton de soumission
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Destructurer les valeurs du state Redux
  const {
    selectedFileName,
    selectedFileSize,
    imagePreviewUrl,
    tempFilePath,
    isExtracting,
    extractionTaskId,
    extractionStep,
    extractionMessage,
    extractedData,
    extractedText,
    ocrInfo,
    services,
    error,
    success,
  } = imageState;
  
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
    console.log('📌 [PhotoUploadPanel] Task ID mis à jour:', extractionTaskId);
  }, [extractionTaskId]);

  // Setup WebSocket listeners pour les extractions d'images
  useEffect(() => {
    // Connecter au WebSocket si pas déjà fait
    if (!wsService.isConnected()) {
      wsService.connect().catch(() => {
        console.warn('⚠️ WebSocket non disponible, mode polling activé');
      });
    }

    // Écouter les événements de démarrage d'extraction image
    wsService.onImageExtractionStarted((data) => {
      console.log('🚀 [WS] Événement image_extraction_started reçu:', data);
      if (taskIdRef.current && data.task_id === taskIdRef.current) {
        console.log('✅ [WS] Task ID correspond, mise à jour étape');
        dispatch(updateExtractionProgress({ 
          step: 2, 
          message: data.message || 'OCR en cours...' 
        }));
      }
    });

    // Écouter les événements de complétion
    wsService.onImageExtractionComplete((data) => {
      console.log('✅ [WS] Événement image_extraction_complete reçu:', data);
      console.log('📌 [WS] taskIdRef.current =', taskIdRef.current, '| data.task_id =', data.task_id);
      
      // Accepter si le task_id correspond OU si on est en cours d'extraction (fallback)
      const shouldProcess = (taskIdRef.current && data.task_id === taskIdRef.current) || 
                           (taskIdRef.current && !data.task_id);
      
      if (shouldProcess || taskIdRef.current) {
        console.log('✅ [WS] Traitement des données d\'extraction image');
        
        if (data.extraction?.donnees_structurees) {
          const extracted = data.extraction.donnees_structurees;
          console.log('📋 [WS] Données structurées reçues:', extracted);
          
          dispatch(extractionComplete({
            extractedData: extracted,
            extractedText: data.extraction.texte_brut || '',
            ocrInfo: data.ocr_info || null,
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

    // Écouter les erreurs
    wsService.onImageExtractionFailed((data) => {
      console.log('❌ [WS] Événement image_extraction_failed reçu:', data);
      if (taskIdRef.current && data.task_id === taskIdRef.current) {
        dispatch(extractionFailed(data.error || 'Erreur lors de l\'analyse OCR'));
        
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
        ocrInfo: data.ocr_info || null,
        services: servicesRef.current,
      }));
    }
  }, [dispatch]);

  // Méthode de prévisualisation asynchrone (OCR + IA)
  const handlePreviewAsync = async (file: File) => {
    dispatch(setError(null));
    dispatch(setSuccess(null));
    
    try {
      console.log('📤 [PhotoUploadPanel] Lancement extraction async:', file.name);
      const response = await apiService.previewImageExtractionAsync(file);
      
      console.log('📥 [PhotoUploadPanel] Réponse async:', response);
      
      if (response.success && response.data) {
        const data = response.data;
        
        // Stocker les services disponibles dans le store
        if (data.services_disponibles) {
          dispatch(setServices(data.services_disponibles));
          servicesRef.current = data.services_disponibles;
        }
        
        // Si c'est une réponse synchrone (fallback), traiter directement
        if (data.async === false && data.extraction) {
          console.log('⚡ [PhotoUploadPanel] Mode synchrone (fallback)');
          handleExtractionComplete({ extraction: data.extraction, ocr_info: data.ocr_info });
          return;
        }
        
        // Mode asynchrone - attendre la notification WebSocket
        if (data.async === true && data.task_id) {
          console.log('🔄 [PhotoUploadPanel] Mode asynchrone, task_id:', data.task_id);
          
          // IMPORTANT: Sauvegarder le temp_file_path immédiatement pour permettre
          // la création de plainte même après un refresh de la page
          if (data.temp_file_path) {
            console.log('📁 [PhotoUploadPanel] Sauvegarde temp_file_path:', data.temp_file_path);
            dispatch(setTempFilePath(data.temp_file_path));
          }
          
          dispatch(startExtraction({ taskId: data.task_id }));
          
          // S'abonner aux notifications pour cette tâche
          if (wsService.isConnected()) {
            wsService.subscribeToExtraction(data.task_id);
          }
          
          // Fallback: si le WebSocket ne répond pas (~90s, le temps de l'OCR + analyse),
          // bascule automatiquement sur l'appel synchrone au lieu de figer l'écran 5 minutes.
          pollingRef.current = setTimeout(() => {
            console.log('⏱️ [PhotoUploadPanel] Timeout WebSocket (90s), fallback sur appel synchrone');
            handlePreviewSync(file);
          }, 90000); // 90s : couvre OCR + analyse IA sans bloquer l'utilisateur 5 minutes
        }
      } else {
        dispatch(setError(response.message || 'Erreur lors du lancement de l\'analyse OCR'));
      }
    } catch (err: any) {
      console.error('❌ [PhotoUploadPanel] Exception:', err);
      dispatch(setError(err.message || 'Erreur lors de la prévisualisation'));
    }
  };

  // Méthode de prévisualisation synchrone (fallback)
  const handlePreviewSync = async (file: File) => {
    dispatch(updateExtractionProgress({ step: 2, message: '🔄 Analyse OCR synchrone en cours...' }));
    
    try {
      const response = await apiService.previewImageExtraction(file);
      
      console.log('📥 [PhotoUploadPanel] Réponse sync reçue:', response);
      
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
            ocrInfo: data.ocr_info || null,
            services: data.services_disponibles || [],
          }));
        } else {
          console.warn('⚠️ [PhotoUploadPanel] Aucune donnée structurée trouvée');
        }
      } else {
        dispatch(setError(response.message || 'Erreur lors de la prévisualisation OCR'));
      }
    } catch (err: any) {
      console.error('❌ [PhotoUploadPanel] Exception:', err);
      dispatch(extractionFailed(err.message || 'Erreur lors de la prévisualisation de l\'image'));
    }
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && acceptedFormats.includes(file.type)) {
      selectedFileRef.current = file;
      
      // Créer l'URL de prévisualisation
      const previewUrl = URL.createObjectURL(file);
      
      dispatch(setSelectedFile({ name: file.name, size: file.size, previewUrl }));
      
      // Lancer la prévisualisation asynchrone
      await handlePreviewAsync(file);
    } else if (file) {
      dispatch(setError('Format d\'image non supporté. Formats acceptés: JPG, PNG, WEBP, TIFF, BMP, GIF'));
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
      dispatch(setError('Veuillez sélectionner une image'));
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
        mode_reception: formData.mode_reception || 'photo_import',
        date_incident: formData.date_incident || null,
        priorite: formData.priorite || 'MOYEN',
        assigned_user_id: formData.assigned_user_id || null,
      };
      
      if (hasFile) {
        // CAS 1: On a le fichier local → utiliser l'endpoint optimisé avec image
        console.log('📤 [handleSubmit] CAS 1: Fichier local disponible, utilisation createPlainteFromImageValidated');
        console.log('📤 [handleSubmit] userData:', JSON.stringify(userData, null, 2));
        
        response = await apiService.createPlainteFromImageValidated(
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
          'image',
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
          dispatch(resetImageExtraction());
          onClose();
        }, 2000);
      } else {
        dispatch(setError(response.message || 'Erreur lors de la création de la plainte'));
      }
    } catch (err: any) {
      console.error('❌ [handleSubmit] Exception:', err);
      dispatch(setError(err.message || 'Erreur lors de la création de la plainte depuis l\'image'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleButtonClick = () => {
    document.getElementById('photo-file-input')?.click();
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
      if (acceptedFormats.includes(file.type)) {
        selectedFileRef.current = file;
        const previewUrl = URL.createObjectURL(file);
        dispatch(setSelectedFile({ name: file.name, size: file.size, previewUrl }));
        await handlePreviewAsync(file);
      } else {
        dispatch(setError('Format d\'image non supporté. Formats acceptés: JPG, PNG, WEBP, TIFF, BMP, GIF'));
      }
    }
  }, [dispatch]);

  const getConfidenceColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600 bg-green-100';
    if (score >= 0.6) return 'text-yellow-600 bg-yellow-100';
    if (score >= 0.4) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const getOcrQualityBadge = (qualite: string) => {
    const badges: Record<string, { color: string; label: string }> = {
      'excellent': { color: 'bg-green-100 text-green-700', label: '✓ Excellent' },
      'bon': { color: 'bg-blue-100 text-blue-700', label: '✓ Bon' },
      'moyen': { color: 'bg-yellow-100 text-yellow-700', label: '⚠ Moyen' },
      'faible': { color: 'bg-red-100 text-red-700', label: '✗ Faible' }
    };
    return badges[qualite] || badges['moyen'];
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

        {/* Zone de drop pour Image */}
        <div 
          className="border-2 border-dashed border-emerald-300 rounded-xl p-8 bg-emerald-50/50 mb-6 hover:border-emerald-400 transition-colors cursor-pointer"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={handleButtonClick}
        >
          <div className="text-center">
            {isExtracting ? (
              <>
                <DocumentMagnifyingGlassIcon className="w-12 h-12 text-emerald-500 mx-auto mb-4 animate-pulse" />
                <h3 className="text-lg font-semibold text-emerald-700 mb-2">
                  {extractionMessage || 'Analyse OCR en cours...'}
                </h3>
                <p className="text-emerald-600 mb-4">Étape {extractionStep}/4 - Extraction du texte et analyse IA</p>
                {/* Barre de progression */}
                <div className="w-full max-w-md mx-auto bg-emerald-200 rounded-full h-2.5 mb-4">
                  <div 
                    className="bg-emerald-600 h-2.5 rounded-full transition-all duration-500" 
                    style={{ width: `${(extractionStep / 4) * 100}%` }}
                  />
                </div>
              </>
            ) : (
              <>
                <PhotoIcon className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-emerald-700 mb-2">Glissez votre image ici</h3>
                <p className="text-emerald-600 mb-4">ou cliquez pour sélectionner une photo</p>
                <p className="text-emerald-500 text-sm mb-4">Formats acceptés: JPG, PNG, WEBP, TIFF, BMP, GIF</p>
              </>
            )}
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp,image/tiff,image/bmp,image/gif"
              onChange={handleFileChange}
              className="hidden"
              id="photo-file-input"
            />
            {!isExtracting && (
              <button 
                onClick={(e) => { e.stopPropagation(); handleButtonClick(); }}
                className="bg-gradient-to-r from-emerald-500 to-green-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
              >
                Sélectionner une photo
              </button>
            )}
            
            {/* Prévisualisation de l'image */}
            {imagePreviewUrl && (
              <div className="mt-4 p-3 bg-emerald-100 rounded-lg">
                <p className="text-emerald-700 text-sm font-medium mb-2">
                  Image sélectionnée : {selectedFileName} ({selectedFileSize && (selectedFileSize / 1024).toFixed(1)} Ko)
                </p>
                <div className="flex justify-center">
                  <img 
                    src={imagePreviewUrl} 
                    alt="Aperçu" 
                    className="max-w-full max-h-48 object-contain rounded-lg border-2 border-emerald-300 shadow-md"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Indicateur de qualité OCR */}
        {ocrInfo && (
          <div className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                  <DocumentMagnifyingGlassIcon className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h4 className="font-medium text-slate-800">Qualité de la reconnaissance OCR</h4>
                  <p className="text-sm text-slate-500">Confiance de l'extraction de texte</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <span className={`text-2xl font-bold ${getConfidenceColor(ocrInfo.confiance).split(' ')[0]}`}>
                    {Math.round(ocrInfo.confiance * 100)}%
                  </span>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getOcrQualityBadge(ocrInfo.qualite).color}`}>
                  {getOcrQualityBadge(ocrInfo.qualite).label}
                </span>
              </div>
            </div>
            
            {ocrInfo.qualite === 'faible' && (
              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-700">
                  <strong>Attention:</strong> La qualité de l'image semble insuffisante. 
                  Essayez avec une image plus nette, mieux éclairée ou à plus haute résolution.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Informations extraites (prévisualisation) */}
        {extractedData && (
          <div className="bg-slate-50 rounded-xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <DocumentMagnifyingGlassIcon className="w-5 h-5 text-emerald-500" />
                Informations extraites par OCR
              </h3>
              {extractedData.confiance_extraction && (
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getConfidenceColor(extractedData.confiance_extraction.score_global)}`}>
                  Confiance: {Math.round(extractedData.confiance_extraction.score_global * 100)}%
                </span>
              )}
            </div>

            {/* Informations du plaignant */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 bg-green-500 rounded-lg flex items-center justify-center">
                  <UserIcon className="w-4 h-4 text-white" />
                </div>
                <h4 className="text-md font-medium text-slate-700">Informations du plaignant</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded-lg p-4 border border-slate-200">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Nom *</label>
                  <input 
                    type="text" 
                    value={formData.nom}
                    onChange={(e) => updateField('nom', e.target.value)}
                    placeholder="Nom du plaignant" 
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
                <div className="bg-white rounded-lg p-4 border border-slate-200">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Prénom *</label>
                  <input 
                    type="text" 
                    value={formData.prenom}
                    onChange={(e) => updateField('prenom', e.target.value)}
                    placeholder="Prénom du plaignant" 
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
                <div className="bg-white rounded-lg p-4 border border-slate-200">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                  <input 
                    type="email" 
                    value={formData.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    placeholder="email@exemple.com" 
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
                <div className="bg-white rounded-lg p-4 border border-slate-200">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Téléphone</label>
                  <input 
                    type="tel" 
                    value={formData.telephone}
                    onChange={(e) => updateField('telephone', e.target.value)}
                    placeholder="01 23 45 67 89" 
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Détails de la plainte */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 bg-blue-500 rounded-lg flex items-center justify-center">
                  <DocumentTextIcon className="w-4 h-4 text-white" />
                </div>
                <h4 className="text-md font-medium text-slate-700">Détails de la plainte</h4>
              </div>
              
              <div className="bg-white rounded-lg p-4 border border-slate-200 mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">Titre de la plainte *</label>
                <input 
                  type="text" 
                  value={formData.titre}
                  onChange={(e) => updateField('titre', e.target.value)}
                  placeholder="Ex: Problème d'accueil aux urgences..." 
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
              
              <div className="bg-white rounded-lg p-4 border border-slate-200 mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">Description détaillée *</label>
                <textarea 
                  rows={4}
                  value={formData.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  placeholder="Décrivez en détail la plainte..." 
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="bg-white rounded-lg p-4 border border-slate-200">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Mode de réception *</label>
                  <select 
                    value={formData.mode_reception}
                    onChange={(e) => updateField('mode_reception', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  >
                    <option value="photo_import">Import Photo/Image</option>
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
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
              </div>
              
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
                      <option key={service.id} value={service.id}>{service.nom}</option>
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
                    <option value="">Sélectionner...</option>
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
              <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg p-4 border border-emerald-200">
                <h4 className="text-md font-medium text-emerald-800 mb-2">Analyse automatique</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-slate-600">Priorité suggérée:</span>
                    <span className={`ml-2 font-semibold ${
                      extractedData.analyse.priorite_suggeree === 'URGENT' ? 'text-red-600' :
                      extractedData.analyse.priorite_suggeree === 'ELEVE' ? 'text-orange-600' :
                      extractedData.analyse.priorite_suggeree === 'MOYEN' ? 'text-yellow-600' : 'text-green-600'
                    }`}>{extractedData.analyse.priorite_suggeree}</span>
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
                </p>
              </div>
            )}
          </div>
        )}

        {/* Texte brut extrait */}
        {extractedText && (
          <details className="mb-6">
            <summary className="cursor-pointer text-sm text-slate-600 hover:text-slate-800">
              Voir le texte brut extrait par OCR ({extractedText.length} caractères)
            </summary>
            <div className="mt-2 p-4 bg-slate-100 rounded-lg max-h-48 overflow-y-auto">
              <pre className="text-xs text-slate-700 whitespace-pre-wrap">{extractedText}</pre>
            </div>
          </details>
        )}

        {/* Boutons d'action */}
        <div className="flex justify-end gap-4">
          <button 
            onClick={onClose}
            disabled={isSubmitting}
            className="px-6 py-3 border border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            Annuler
          </button>
          <button 
            onClick={handleSubmit}
            disabled={!selectedFileName || isExtracting || isSubmitting || !extractedData}
            className={`px-6 py-3 rounded-xl font-semibold shadow-lg transition-all duration-300 flex items-center gap-2 ${
              selectedFileName && !isExtracting && !isSubmitting && extractedData
                ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:shadow-xl transform hover:-translate-y-1' 
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
