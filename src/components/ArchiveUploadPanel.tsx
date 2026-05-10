'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  FolderOpenIcon,
  DocumentTextIcon,
  PhotoIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ArrowPathIcon,
  XMarkIcon,
  PlayIcon,
  StopIcon,
  TrashIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';
import {
  setSelectedFolder,
  startScanning,
  scanComplete,
  scanFailed,
  toggleFileSelection,
  selectAllFiles,
  deselectAllFiles,
  startProcessing,
  updateFileProgress,
  updateOverallProgress,
  fileProcessingComplete,
  fileProcessingFailed,
  processingComplete,
  processingFailed,
  cancelProcessing,
  updateOptions,
  setServices,
  resetArchiveExtraction,
  selectArchiveExtraction,
  type DetectedFile,
} from '@/store/slices/archiveExtractionSlice';
import type { AppDispatch } from '@/store';
import apiService from '@/lib/api';
import wsService from '@/lib/websocket';
import { toast } from 'sonner';

interface ArchiveUploadPanelProps {
  onSubmit: (data: any) => void;
  onClose: () => void;
}

export default function ArchiveUploadPanel({ onClose }: ArchiveUploadPanelProps) {
  const dispatch = useDispatch<AppDispatch>();
  
  // Sélecteurs Redux
  const archiveState = useSelector(selectArchiveExtraction);
  const {
    selectedFolderPath,
    selectedFolderName,
    detectedFiles,
    totalFilesCount,
    selectedFilesCount,
    isScanning,
    isProcessing,
    processingTaskId,
    progress,
    results,
    options,
    error,
    success,
  } = archiveState;

  // États locaux
  const [showOptions, setShowOptions] = useState(false);
  const [showResults, setShowResults] = useState(false);
  
  // Refs
  const folderInputRef = useRef<HTMLInputElement>(null);
  const taskIdRef = useRef<string | null>(null);

  // Mise à jour du taskId ref
  useEffect(() => {
    taskIdRef.current = processingTaskId;
  }, [processingTaskId]);

  // Charger les services au montage
  useEffect(() => {
    const loadServices = async () => {
      try {
        const response = await apiService.getServices();
        if (response.success && response.data) {
          dispatch(setServices(response.data.map((s: { id: number; nom: string; code?: string }) => ({
            id: s.id,
            nom: s.nom,
            code: s.code || s.nom.substring(0, 3).toUpperCase(),
          }))));
        }
      } catch (err) {
        console.error('Erreur chargement services:', err);
      }
    };
    loadServices();
  }, [dispatch]);

  // Map pour suivre les task_ids par fichier
  const taskToFileMapRef = useRef<Map<string, string>>(new Map());
  // Compteurs pour le batch
  const batchCountersRef = useRef({ success: 0, fail: 0, total: 0 });

  // Configurer les listeners WebSocket pour le traitement batch
  useEffect(() => {
    if (!wsService.isConnected()) {
      wsService.connect().catch(() => {
        console.warn('⚠️ WebSocket non disponible');
      });
    }

    // Événement: démarrage du traitement d'un fichier
    const handleArchiveFileStarted = (data: any) => {
      console.log('📂 [WS] archive_file_started:', data);
      const fileId = taskToFileMapRef.current.get(data.task_id);
      if (fileId) {
        dispatch(updateFileProgress({
          fileId,
          status: 'processing',
          progress: 25,
        }));
      }
    };

    // Événement: progression du traitement
    const handleArchiveFileProgress = (data: any) => {
      console.log('🔄 [WS] archive_file_progress:', data);
      const fileId = taskToFileMapRef.current.get(data.task_id);
      if (fileId) {
        const progressPercent = data.step ? (data.step / 4) * 100 : 50;
        dispatch(updateFileProgress({
          fileId,
          status: 'processing',
          progress: progressPercent,
        }));
      }
    };

    // Événement: fichier traité avec succès
    const handleArchiveFileComplete = (data: any) => {
      console.log('✅ [WS] archive_file_complete:', data);
      const fileId = taskToFileMapRef.current.get(data.task_id);
      if (fileId) {
        dispatch(fileProcessingComplete({
          fileId,
          plainteId: data.plainte_id,
          plainteNumero: data.numero_plainte,
        }));
        toast.success(`✅ ${data.filename}: Plainte n°${data.numero_plainte} créée`);
        batchCountersRef.current.success++;
        
        // Vérifier si tous les fichiers sont traités
        checkBatchComplete();
      }
    };

    // Événement: échec du traitement d'un fichier
    const handleArchiveFileFailed = (data: any) => {
      console.log('❌ [WS] archive_file_failed:', data);
      const fileId = taskToFileMapRef.current.get(data.task_id);
      if (fileId) {
        dispatch(fileProcessingFailed({
          fileId,
          error: data.error || 'Erreur inconnue',
        }));
        toast.error(`❌ ${data.filename}: ${data.error}`);
        batchCountersRef.current.fail++;
        
        // Vérifier si tous les fichiers sont traités
        checkBatchComplete();
      }
    };

    // Événement: fichier annulé
    const handleArchiveFileCancelled = (data: any) => {
      console.log('🛑 [WS] archive_file_cancelled:', data);
      const fileId = taskToFileMapRef.current.get(data.task_id);
      if (fileId) {
        dispatch(fileProcessingFailed({
          fileId,
          error: 'Annulé',
        }));
        toast.info(`🛑 ${data.filename}: Annulé`);
        batchCountersRef.current.fail++;
        
        // Vérifier si tous les fichiers sont traités
        checkBatchComplete();
      }
    };

    // Vérifier si le batch est terminé
    const checkBatchComplete = () => {
      const { success, fail, total } = batchCountersRef.current;
      if (success + fail >= total && total > 0) {
        dispatch(processingComplete({
          message: `Traitement terminé: ${success} réussies, ${fail} échecs`,
        }));
        if (success > 0) {
          toast.success(`🎉 ${success} plaintes créées avec succès !`);
        }
        setShowResults(true);
        // Reset counters
        batchCountersRef.current = { success: 0, fail: 0, total: 0 };
      }
    };

    // Enregistrer les listeners
    wsService.on('archive_file_started', handleArchiveFileStarted);
    wsService.on('archive_file_progress', handleArchiveFileProgress);
    wsService.on('archive_file_complete', handleArchiveFileComplete);
    wsService.on('archive_file_failed', handleArchiveFileFailed);
    wsService.on('archive_file_cancelled', handleArchiveFileCancelled);

    return () => {
      // Nettoyer les listeners
      wsService.off('archive_file_started');
      wsService.off('archive_file_progress');
      wsService.off('archive_file_complete');
      wsService.off('archive_file_failed');
      wsService.off('archive_file_cancelled');
    };
  }, [dispatch]);

  // Gérer la sélection de dossier
  const handleFolderSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    // Récupérer le chemin du dossier depuis le premier fichier
    const firstFile = files[0];
    const relativePath = (firstFile as any).webkitRelativePath || firstFile.name;
    const folderName = relativePath.split('/')[0];

    dispatch(setSelectedFolder({
      path: folderName,
      name: folderName,
    }));
    dispatch(startScanning());

    try {
      // Scanner les fichiers sélectionnés
      const detectedFilesArray: DetectedFile[] = [];
      const validExtensions = ['.pdf', '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff', '.webp'];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const ext = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
        
        if (validExtensions.includes(ext)) {
          const isPdf = ext === '.pdf';
          detectedFilesArray.push({
            id: `file_${i}_${Date.now()}`,
            fileName: file.name,
            filePath: (file as any).webkitRelativePath || file.name,
            fileSize: file.size,
            fileType: isPdf ? 'pdf' : 'image',
            mimeType: file.type,
            selected: true,
            status: 'pending',
            progress: 0,
          });
        }
      }

      if (detectedFilesArray.length === 0) {
        dispatch(scanFailed('Aucun fichier PDF ou image valide trouvé dans le dossier'));
        return;
      }

      dispatch(scanComplete(detectedFilesArray));
      toast.success(`📁 ${detectedFilesArray.length} fichiers détectés dans "${folderName}"`);
      
      // Stocker les fichiers pour le traitement ultérieur
      (window as any).__archiveFiles = files;
      
    } catch (error: any) {
      console.error('Erreur scan dossier:', error);
      dispatch(scanFailed(error.message || 'Erreur lors du scan du dossier'));
    }
  }, [dispatch]);

  // Lancer le traitement batch (mode async avec WebSocket)
  const handleStartProcessing = async () => {
    const selectedFiles = detectedFiles.filter(f => f.selected);
    if (selectedFiles.length === 0) {
      toast.warning('⚠️ Veuillez sélectionner au moins un fichier');
      return;
    }

    const storedFiles = (window as any).__archiveFiles;
    if (!storedFiles) {
      toast.error('❌ Fichiers non disponibles. Veuillez resélectionner le dossier.');
      return;
    }

    // Générer un batch ID
    const batchId = `batch_${Date.now()}`;
    dispatch(startProcessing({ taskId: batchId, batchId }));

    // Initialiser les compteurs
    batchCountersRef.current = { success: 0, fail: 0, total: selectedFiles.length };
    taskToFileMapRef.current.clear();

    try {
      // Envoyer tous les fichiers de manière asynchrone
      // L'API retourne rapidement avec un task_id, le résultat arrive via WebSocket
      
      for (let i = 0; i < selectedFiles.length; i++) {
        const detectedFile = selectedFiles[i];
        
        // Trouver le fichier original
        let originalFile: File | null = null;
        for (let j = 0; j < storedFiles.length; j++) {
          const f = storedFiles[j];
          const path = (f as any).webkitRelativePath || f.name;
          if (path === detectedFile.filePath || f.name === detectedFile.fileName) {
            originalFile = f;
            break;
          }
        }

        if (!originalFile) {
          dispatch(fileProcessingFailed({
            fileId: detectedFile.id,
            error: 'Fichier non trouvé',
          }));
          batchCountersRef.current.fail++;
          continue;
        }

        // Mettre à jour l'UI immédiatement
        dispatch(updateFileProgress({
          fileId: detectedFile.id,
          status: 'processing',
          progress: 10,
        }));

        dispatch(updateOverallProgress({
          current: i + 1,
          currentFileName: detectedFile.fileName,
        }));

        try {
          // Appeler l'API async - retourne rapidement avec task_id
          console.log(`📤 [Archive] Envoi fichier ${i + 1}/${selectedFiles.length}: ${detectedFile.fileName}`);
          
          const response = await apiService.createPlainteFromArchiveFile(
            originalFile,
            {
              source_archive: selectedFolderName || 'archive',
              batch_id: batchId,
              processing_order: i + 1,
              auto_assign_service: options.autoAssignService,
            }
          );

          if (response.success && response.data) {
            const data = response.data;
            
            // Mode async: stocker le mapping task_id -> fileId pour le WebSocket
            if (data.async === true && data.task_id) {
              console.log(`🔄 [Archive] Mode async - task_id: ${data.task_id} -> fileId: ${detectedFile.id}`);
              taskToFileMapRef.current.set(data.task_id, detectedFile.id);
              
              // Mettre à jour la progression
              dispatch(updateFileProgress({
                fileId: detectedFile.id,
                status: 'processing',
                progress: 25,
              }));
              
              // S'abonner aux notifications pour cette tâche
              if (wsService.isConnected()) {
                wsService.subscribeToExtraction(data.task_id);
              }
            } 
            // Mode sync (fallback): traiter directement le résultat
            else if (data.async === false || data.plainte_id) {
              console.log(`⚡ [Archive] Mode sync - plainte créée: ${data.numero_plainte}`);
              dispatch(fileProcessingComplete({
                fileId: detectedFile.id,
                plainteId: data.plainte_id || 0,
                plainteNumero: data.numero_plainte || 'N/A',
              }));
              toast.success(`✅ ${detectedFile.fileName}: Plainte créée`);
              batchCountersRef.current.success++;
            }
          } else {
            throw new Error(response.message || 'Erreur lors de l\'envoi');
          }
        } catch (fileError: any) {
          console.error(`❌ [Archive] Erreur envoi ${detectedFile.fileName}:`, fileError);
          dispatch(fileProcessingFailed({
            fileId: detectedFile.id,
            error: fileError.message || 'Erreur d\'envoi',
          }));
          batchCountersRef.current.fail++;
          
          if (!options.continueOnError) {
            dispatch(processingFailed(`Arrêt sur erreur: ${fileError.message}`));
            return;
          }
        }
        
        // Petite pause entre les envois pour ne pas surcharger
        if (i < selectedFiles.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      }

      // Vérifier si tous les fichiers sont en mode sync (traitement immédiat terminé)
      const { success, fail, total } = batchCountersRef.current;
      const asyncPending = taskToFileMapRef.current.size;
      
      if (asyncPending === 0 && success + fail >= total) {
        // Tout est terminé en mode sync
        dispatch(processingComplete({
          message: `Traitement terminé: ${success} réussies, ${fail} échecs`,
        }));
        if (success > 0) {
          toast.success(`🎉 ${success} plaintes créées avec succès !`);
        }
        if (fail > 0) {
          toast.warning(`⚠️ ${fail} fichiers en échec`);
        }
        setShowResults(true);
      } else if (asyncPending > 0) {
        // Des fichiers sont en cours de traitement async
        toast.info(`📤 ${asyncPending} fichiers en cours de traitement...`);
      }

    } catch (error: any) {
      console.error('Erreur traitement batch:', error);
      dispatch(processingFailed(error.message || 'Erreur lors du traitement'));
      toast.error('❌ Erreur lors du traitement batch');
    }
  };

  // Annuler le traitement
  const handleCancelProcessing = async () => {
    // Récupérer tous les task_ids en cours
    const taskIds = Array.from(taskToFileMapRef.current.keys());
    
    if (taskIds.length > 0) {
      try {
        toast.info('⏳ Annulation des tâches en cours...');
        
        // Appeler l'API pour annuler les tâches Celery
        const response = await apiService.cancelArchiveProcessing(taskIds, processingTaskId || undefined);
        
        if (response.success && response.data) {
          toast.success(`🛑 ${response.data.cancelled_count} tâche(s) annulée(s)`);
        }
      } catch (error) {
        console.error('Erreur annulation:', error);
        toast.warning('⚠️ Certaines tâches n\'ont pas pu être annulées');
      }
    }
    
    // Nettoyer les références locales
    taskToFileMapRef.current.clear();
    batchCountersRef.current = { success: 0, fail: 0, total: 0 };
    
    // Mettre à jour le state Redux
    dispatch(cancelProcessing());
    toast.info('⏹️ Traitement arrêté');
  };

  // Reset complet
  const handleReset = () => {
    dispatch(resetArchiveExtraction());
    (window as any).__archiveFiles = null;
    if (folderInputRef.current) {
      folderInputRef.current.value = '';
    }
  };

  // Formater la taille de fichier
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Formater le temps restant
  const formatTimeRemaining = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  // Obtenir l'icône selon le type de fichier
  const getFileIcon = (file: DetectedFile) => {
    if (file.fileType === 'pdf') {
      return <DocumentTextIcon className="w-5 h-5 text-red-500" />;
    }
    return <PhotoIcon className="w-5 h-5 text-blue-500" />;
  };

  // Obtenir l'icône de statut
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <ExclamationCircleIcon className="w-5 h-5 text-red-500" />;
      case 'processing':
        return <ArrowPathIcon className="w-5 h-5 text-blue-500 animate-spin" />;
      default:
        return null;
    }
  };

  return (
    <div className="relative backdrop-blur-md bg-white/95 rounded-2xl p-6 shadow-xl border border-purple-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
            <FolderOpenIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">Import depuis Archive</h2>
            <p className="text-xs text-slate-500">Traitez plusieurs fichiers d'un dossier</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <XMarkIcon className="w-5 h-5 text-slate-500" />
        </button>
      </div>

      {/* Messages d'erreur/succès */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center gap-2">
          <ExclamationCircleIcon className="w-5 h-5 flex-shrink-0" />
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm flex items-center gap-2">
          <CheckCircleIcon className="w-5 h-5 flex-shrink-0" />
          {success}
        </div>
      )}

      {/* Zone de sélection de dossier */}
      <div className="mb-6">
        <input
          ref={folderInputRef}
          type="file"
          /* @ts-ignore */
          webkitdirectory=""
          directory=""
          multiple
          onChange={handleFolderSelect}
          className="hidden"
          id="folder-input"
        />
        
        {!selectedFolderPath ? (
          <label
            htmlFor="folder-input"
            className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-purple-300 rounded-xl cursor-pointer hover:border-purple-500 hover:bg-purple-50 transition-all group"
          >
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-purple-200 transition-colors">
              <FolderOpenIcon className="w-8 h-8 text-purple-600" />
            </div>
            <p className="text-lg font-semibold text-slate-700 mb-1">Sélectionnez un dossier</p>
            <p className="text-sm text-slate-500 text-center">
              Cliquez pour parcourir votre archive de plaintes (PDF, images)
            </p>
          </label>
        ) : (
          <div className="flex items-center justify-between p-4 bg-purple-50 rounded-xl border border-purple-200">
            <div className="flex items-center gap-3">
              <FolderOpenIcon className="w-6 h-6 text-purple-600" />
              <div>
                <p className="font-semibold text-slate-800">{selectedFolderName}</p>
                <p className="text-sm text-slate-500">
                  {totalFilesCount} fichier{totalFilesCount > 1 ? 's' : ''} détecté{totalFilesCount > 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <label
                htmlFor="folder-input"
                className="px-3 py-1.5 text-sm bg-white border border-purple-300 rounded-lg cursor-pointer hover:bg-purple-50 transition-colors"
              >
                Changer
              </label>
              <button
                onClick={handleReset}
                className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                title="Réinitialiser"
              >
                <TrashIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Indicateur de scan */}
      {isScanning && (
        <div className="mb-6 flex items-center justify-center gap-3 p-4 bg-blue-50 rounded-xl">
          <ArrowPathIcon className="w-5 h-5 text-blue-600 animate-spin" />
          <p className="text-blue-700">Scan du dossier en cours...</p>
        </div>
      )}

      {/* Liste des fichiers détectés */}
      {detectedFiles.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-slate-800">
              Fichiers ({selectedFilesCount}/{totalFilesCount} sélectionnés)
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => dispatch(selectAllFiles())}
                className="text-xs text-purple-600 hover:text-purple-800"
                disabled={isProcessing}
              >
                Tout sélectionner
              </button>
              <span className="text-slate-300">|</span>
              <button
                onClick={() => dispatch(deselectAllFiles())}
                className="text-xs text-slate-500 hover:text-slate-700"
                disabled={isProcessing}
              >
                Tout désélectionner
              </button>
            </div>
          </div>

          <div className="max-h-64 overflow-y-auto border border-slate-200 rounded-xl">
            {detectedFiles.map((file) => (
              <div
                key={file.id}
                className={`flex items-center gap-3 p-3 border-b border-slate-100 last:border-b-0 hover:bg-slate-50 transition-colors ${
                  file.status === 'completed' ? 'bg-green-50' :
                  file.status === 'failed' ? 'bg-red-50' :
                  file.status === 'processing' ? 'bg-blue-50' : ''
                }`}
              >
                <input
                  type="checkbox"
                  checked={file.selected}
                  onChange={() => dispatch(toggleFileSelection(file.id))}
                  disabled={isProcessing || file.status === 'completed'}
                  className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                />
                
                {getFileIcon(file)}
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700 truncate">
                    {file.fileName}
                  </p>
                  <p className="text-xs text-slate-500">
                    {formatFileSize(file.fileSize)}
                    {file.createdPlainteNumero && (
                      <span className="ml-2 text-green-600">
                        → Plainte {file.createdPlainteNumero}
                      </span>
                    )}
                    {file.error && (
                      <span className="ml-2 text-red-600">
                        → {file.error}
                      </span>
                    )}
                  </p>
                </div>
                
                {/* Barre de progression pour le fichier en cours */}
                {file.status === 'processing' && (
                  <div className="w-20">
                    <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 transition-all duration-300"
                        style={{ width: `${file.progress}%` }}
                      />
                    </div>
                  </div>
                )}
                
                {getStatusIcon(file.status)}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Options de traitement */}
      {detectedFiles.length > 0 && !isProcessing && (
        <div className="mb-6">
          <button
            onClick={() => setShowOptions(!showOptions)}
            className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-800 mb-2"
          >
            <Cog6ToothIcon className="w-4 h-4" />
            Options de traitement
            {showOptions ? (
              <ChevronUpIcon className="w-4 h-4" />
            ) : (
              <ChevronDownIcon className="w-4 h-4" />
            )}
          </button>
          
          {showOptions && (
            <div className="p-4 bg-slate-50 rounded-xl space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.autoAssignService}
                  onChange={(e) => dispatch(updateOptions({ autoAssignService: e.target.checked }))}
                  className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                />
                <span className="text-sm text-slate-700">
                  Assigner automatiquement au service détecté
                </span>
              </label>
              
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.continueOnError}
                  onChange={(e) => dispatch(updateOptions({ continueOnError: e.target.checked }))}
                  className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                />
                <span className="text-sm text-slate-700">
                  Continuer en cas d'erreur sur un fichier
                </span>
              </label>
              
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.skipDuplicates}
                  onChange={(e) => dispatch(updateOptions({ skipDuplicates: e.target.checked }))}
                  className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                />
                <span className="text-sm text-slate-700">
                  Ignorer les doublons potentiels
                </span>
              </label>
            </div>
          )}
        </div>
      )}

      {/* Barre de progression globale */}
      {isProcessing && (
        <div className="mb-6 p-4 bg-blue-50 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-700">
              Traitement en cours: {progress.currentFileName}
            </span>
            <span className="text-sm text-blue-600">
              {progress.current}/{progress.total}
            </span>
          </div>
          <div className="h-3 bg-blue-200 rounded-full overflow-hidden mb-2">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
              style={{ width: `${(progress.current / progress.total) * 100}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs text-slate-600">
            <span>
              ✅ {progress.successCount} réussies | ❌ {progress.failCount} échecs
            </span>
            {progress.estimatedTimeRemaining && (
              <span>
                Temps restant estimé: {formatTimeRemaining(progress.estimatedTimeRemaining)}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Résultats */}
      {showResults && results.length > 0 && (
        <div className="mb-6">
          <button
            onClick={() => setShowResults(!showResults)}
            className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2"
          >
            Résultats du traitement
            {showResults ? (
              <ChevronUpIcon className="w-4 h-4" />
            ) : (
              <ChevronDownIcon className="w-4 h-4" />
            )}
          </button>
          
          <div className="p-4 bg-slate-50 rounded-xl">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="p-3 bg-green-100 rounded-lg text-center">
                <p className="text-2xl font-bold text-green-700">
                  {results.filter(r => r.success).length}
                </p>
                <p className="text-sm text-green-600">Plaintes créées</p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg text-center">
                <p className="text-2xl font-bold text-red-700">
                  {results.filter(r => !r.success).length}
                </p>
                <p className="text-sm text-red-600">Échecs</p>
              </div>
            </div>
            
            {results.filter(r => r.success).length > 0 && (
              <div className="text-sm text-slate-600">
                <p className="font-medium mb-1">Plaintes créées:</p>
                <div className="flex flex-wrap gap-2">
                  {results.filter(r => r.success).map(r => (
                    <span
                      key={r.fileId}
                      className="px-2 py-1 bg-green-200 text-green-800 rounded text-xs"
                    >
                      {r.plainteNumero}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Boutons d'action */}
      <div className="flex items-center justify-end gap-3">
        <button
          onClick={onClose}
          className="px-4 py-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
          disabled={isProcessing}
        >
          Fermer
        </button>
        
        {isProcessing ? (
          <button
            onClick={handleCancelProcessing}
            className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold flex items-center gap-2 transition-colors"
          >
            <StopIcon className="w-5 h-5" />
            Arrêter
          </button>
        ) : (
          <button
            onClick={handleStartProcessing}
            disabled={selectedFilesCount === 0 || isScanning}
            className="px-6 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white rounded-lg font-semibold flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <PlayIcon className="w-5 h-5" />
            Traiter {selectedFilesCount} fichier{selectedFilesCount > 1 ? 's' : ''}
          </button>
        )}
      </div>
    </div>
  );
}
