import { createSlice, PayloadAction } from '@reduxjs/toolkit';

/**
 * Redux Slice pour la gestion de l'import d'archives de plaintes
 * Permet de traiter plusieurs fichiers PDF/images d'un dossier
 */

// Clé pour le localStorage
const STORAGE_KEY = 'archiveExtraction_state';

// Interface pour un fichier détecté dans l'archive
export interface DetectedFile {
  id: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  fileType: 'pdf' | 'image';
  mimeType: string;
  selected: boolean;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  error?: string;
  extractedPreview?: string;
  createdPlainteId?: number;
  createdPlainteNumero?: string;
}

// Interface pour les résultats de traitement
export interface ProcessingResult {
  fileId: string;
  fileName: string;
  success: boolean;
  plainteId?: number;
  plainteNumero?: string;
  error?: string;
  processingTime?: number;
}

// Interface pour les options de traitement
export interface ArchiveProcessingOptions {
  autoAssignService: boolean;
  batchSize: number;
  skipDuplicates: boolean;
  continueOnError: boolean;
}

// Interface pour les statistiques de progression
export interface ProcessingProgress {
  current: number;
  total: number;
  currentFileName: string;
  startTime?: number;
  estimatedTimeRemaining?: number;
  successCount: number;
  failCount: number;
}

// État du slice
interface ArchiveExtractionState {
  // Dossier sélectionné
  selectedFolderPath: string | null;
  selectedFolderName: string | null;
  
  // Fichiers détectés
  detectedFiles: DetectedFile[];
  totalFilesCount: number;
  selectedFilesCount: number;
  
  // État du scan
  isScanning: boolean;
  scanError: string | null;
  
  // État du traitement
  isProcessing: boolean;
  processingTaskId: string | null;
  processingBatchId: string | null;
  
  // Progression
  progress: ProcessingProgress;
  
  // Résultats
  results: ProcessingResult[];
  
  // Options
  options: ArchiveProcessingOptions;
  
  // Services disponibles
  services: Array<{ id: number; nom: string; code: string }>;
  
  // Messages
  error: string | null;
  success: string | null;
}

const initialProgress: ProcessingProgress = {
  current: 0,
  total: 0,
  currentFileName: '',
  successCount: 0,
  failCount: 0,
};

const initialOptions: ArchiveProcessingOptions = {
  autoAssignService: true,
  batchSize: 5,
  skipDuplicates: true,
  continueOnError: true,
};

const initialState: ArchiveExtractionState = {
  selectedFolderPath: null,
  selectedFolderName: null,
  detectedFiles: [],
  totalFilesCount: 0,
  selectedFilesCount: 0,
  isScanning: false,
  scanError: null,
  isProcessing: false,
  processingTaskId: null,
  processingBatchId: null,
  progress: { ...initialProgress },
  results: [],
  options: { ...initialOptions },
  services: [],
  error: null,
  success: null,
};

// Fonction pour sauvegarder l'état dans localStorage
const saveToStorage = (state: ArchiveExtractionState) => {
  try {
    if (state.results.length > 0 || state.detectedFiles.length > 0) {
      const toSave = {
        selectedFolderPath: state.selectedFolderPath,
        selectedFolderName: state.selectedFolderName,
        results: state.results,
        options: state.options,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
      console.log('💾 [ArchiveExtraction] État sauvegardé dans localStorage');
    }
  } catch (error) {
    console.warn('⚠️ [ArchiveExtraction] Erreur lors de la sauvegarde:', error);
  }
};

// Fonction pour effacer le localStorage
export const clearArchiveExtractionStorage = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    console.log('🗑️ [ArchiveExtraction] LocalStorage effacé');
  } catch (error) {
    console.warn('⚠️ [ArchiveExtraction] Erreur lors de l\'effacement:', error);
  }
};

const archiveExtractionSlice = createSlice({
  name: 'archiveExtraction',
  initialState,
  reducers: {
    // === Actions pour la sélection de dossier ===
    setSelectedFolder: (state, action: PayloadAction<{ path: string; name: string }>) => {
      state.selectedFolderPath = action.payload.path;
      state.selectedFolderName = action.payload.name;
      state.detectedFiles = [];
      state.results = [];
      state.error = null;
      state.success = null;
    },
    
    clearSelectedFolder: (state) => {
      state.selectedFolderPath = null;
      state.selectedFolderName = null;
      state.detectedFiles = [];
      state.totalFilesCount = 0;
      state.selectedFilesCount = 0;
      state.results = [];
      state.error = null;
      state.success = null;
    },
    
    // === Actions pour le scan ===
    startScanning: (state) => {
      state.isScanning = true;
      state.scanError = null;
      state.detectedFiles = [];
    },
    
    scanComplete: (state, action: PayloadAction<DetectedFile[]>) => {
      state.isScanning = false;
      state.detectedFiles = action.payload;
      state.totalFilesCount = action.payload.length;
      state.selectedFilesCount = action.payload.filter(f => f.selected).length;
      state.scanError = null;
    },
    
    scanFailed: (state, action: PayloadAction<string>) => {
      state.isScanning = false;
      state.scanError = action.payload;
      state.detectedFiles = [];
    },
    
    // === Actions pour la sélection de fichiers ===
    toggleFileSelection: (state, action: PayloadAction<string>) => {
      const file = state.detectedFiles.find(f => f.id === action.payload);
      if (file) {
        file.selected = !file.selected;
        state.selectedFilesCount = state.detectedFiles.filter(f => f.selected).length;
      }
    },
    
    selectAllFiles: (state) => {
      state.detectedFiles.forEach(f => {
        if (f.status === 'pending') {
          f.selected = true;
        }
      });
      state.selectedFilesCount = state.detectedFiles.filter(f => f.selected).length;
    },
    
    deselectAllFiles: (state) => {
      state.detectedFiles.forEach(f => {
        f.selected = false;
      });
      state.selectedFilesCount = 0;
    },
    
    // === Actions pour le traitement ===
    startProcessing: (state, action: PayloadAction<{ taskId: string; batchId: string }>) => {
      state.isProcessing = true;
      state.processingTaskId = action.payload.taskId;
      state.processingBatchId = action.payload.batchId;
      // On ne (re)traite que les fichiers sélectionnés PAS déjà complétés: évite de
      // recréer des plaintes en double si on relance après un batch partiel.
      const aTraiter = (f: DetectedFile) => f.selected && f.status !== 'completed';
      state.progress = {
        ...initialProgress,
        total: state.detectedFiles.filter(aTraiter).length,
        startTime: Date.now(),
      };
      state.results = [];
      state.error = null;

      // Marquer les fichiers à traiter comme "pending" (sans toucher aux déjà complétés)
      state.detectedFiles.forEach(f => {
        if (aTraiter(f)) {
          f.status = 'pending';
          f.progress = 0;
        }
      });
    },
    
    updateFileProgress: (state, action: PayloadAction<{
      fileId: string;
      status: 'pending' | 'processing' | 'completed' | 'failed';
      progress: number;
      error?: string;
      extractedPreview?: string;
    }>) => {
      const file = state.detectedFiles.find(f => f.id === action.payload.fileId);
      if (file) {
        file.status = action.payload.status;
        file.progress = action.payload.progress;
        if (action.payload.error) file.error = action.payload.error;
        if (action.payload.extractedPreview) file.extractedPreview = action.payload.extractedPreview;
      }
    },
    
    updateOverallProgress: (state, action: PayloadAction<{
      current: number;
      currentFileName: string;
    }>) => {
      state.progress.current = action.payload.current;
      state.progress.currentFileName = action.payload.currentFileName;
      
      // Calculer le temps restant estimé
      if (state.progress.startTime && action.payload.current > 0) {
        const elapsed = Date.now() - state.progress.startTime;
        const avgTimePerFile = elapsed / action.payload.current;
        const remaining = state.progress.total - action.payload.current;
        state.progress.estimatedTimeRemaining = Math.round(avgTimePerFile * remaining / 1000);
      }
    },
    
    fileProcessingComplete: (state, action: PayloadAction<{
      fileId: string;
      plainteId: number;
      plainteNumero: string;
    }>) => {
      const file = state.detectedFiles.find(f => f.id === action.payload.fileId);
      if (file) {
        file.status = 'completed';
        file.progress = 100;
        file.createdPlainteId = action.payload.plainteId;
        file.createdPlainteNumero = action.payload.plainteNumero;
      }
      state.progress.successCount++;
      
      // Ajouter au résultat
      state.results.push({
        fileId: action.payload.fileId,
        fileName: file?.fileName || '',
        success: true,
        plainteId: action.payload.plainteId,
        plainteNumero: action.payload.plainteNumero,
      });
    },
    
    fileProcessingFailed: (state, action: PayloadAction<{
      fileId: string;
      error: string;
    }>) => {
      const file = state.detectedFiles.find(f => f.id === action.payload.fileId);
      if (file) {
        file.status = 'failed';
        file.error = action.payload.error;
      }
      state.progress.failCount++;
      
      // Ajouter au résultat
      state.results.push({
        fileId: action.payload.fileId,
        fileName: file?.fileName || '',
        success: false,
        error: action.payload.error,
      });
    },
    
    processingComplete: (state, action: PayloadAction<{ message: string }>) => {
      state.isProcessing = false;
      state.processingTaskId = null;
      state.success = action.payload.message;
      saveToStorage(state);
    },
    
    processingFailed: (state, action: PayloadAction<string>) => {
      state.isProcessing = false;
      state.processingTaskId = null;
      state.error = action.payload;
    },
    
    cancelProcessing: (state) => {
      state.isProcessing = false;
      state.processingTaskId = null;
      // Ne pas effacer les résultats partiels
    },
    
    // === Actions pour les options ===
    updateOptions: (state, action: PayloadAction<Partial<ArchiveProcessingOptions>>) => {
      state.options = { ...state.options, ...action.payload };
    },
    
    // === Actions pour les services ===
    setServices: (state, action: PayloadAction<Array<{ id: number; nom: string; code: string }>>) => {
      state.services = action.payload;
    },
    
    // === Actions pour les messages ===
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.success = null;
    },
    
    setSuccess: (state, action: PayloadAction<string | null>) => {
      state.success = action.payload;
      state.error = null;
    },
    
    // === Reset complet ===
    resetArchiveExtraction: (state) => {
      Object.assign(state, initialState);
      clearArchiveExtractionStorage();
    },
  },
});

export const {
  setSelectedFolder,
  clearSelectedFolder,
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
  setError,
  setSuccess,
  resetArchiveExtraction,
} = archiveExtractionSlice.actions;

export default archiveExtractionSlice.reducer;

// Selectors
export const selectArchiveExtraction = (state: { archiveExtraction: ArchiveExtractionState }) => state.archiveExtraction;
export const selectDetectedFiles = (state: { archiveExtraction: ArchiveExtractionState }) => state.archiveExtraction.detectedFiles;
export const selectSelectedFiles = (state: { archiveExtraction: ArchiveExtractionState }) => 
  state.archiveExtraction.detectedFiles.filter(f => f.selected);
export const selectIsProcessing = (state: { archiveExtraction: ArchiveExtractionState }) => state.archiveExtraction.isProcessing;
export const selectProgress = (state: { archiveExtraction: ArchiveExtractionState }) => state.archiveExtraction.progress;
export const selectResults = (state: { archiveExtraction: ArchiveExtractionState }) => state.archiveExtraction.results;
export const selectOptions = (state: { archiveExtraction: ArchiveExtractionState }) => state.archiveExtraction.options;
