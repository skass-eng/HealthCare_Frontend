import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Clé pour le localStorage
const STORAGE_KEY = 'imageExtraction_state';

// Fonction pour charger l'état depuis localStorage
const loadFromStorage = (): Partial<ImageExtractionState> | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      console.log('📂 [ImageExtraction] État restauré depuis localStorage');
      return parsed;
    }
  } catch (error) {
    console.warn('⚠️ [ImageExtraction] Erreur lors du chargement depuis localStorage:', error);
  }
  return null;
};

// Fonction pour sauvegarder l'état dans localStorage
const saveToStorage = (state: ImageExtractionState) => {
  try {
    // Sauvegarder si on a des données extraites OU un fichier temp (pour reprise après refresh)
    if (!state.extractedData && !state.formData.titre && !state.tempFilePath) {
      return;
    }
    const toSave = {
      selectedFileName: state.selectedFileName,
      selectedFileSize: state.selectedFileSize,
      imagePreviewUrl: state.imagePreviewUrl,
      tempFilePath: state.tempFilePath,
      extractedData: state.extractedData,
      extractedText: state.extractedText,
      ocrInfo: state.ocrInfo,
      services: state.services,
      formData: state.formData,
      extractionStep: state.extractionStep,
      extractionTaskId: state.extractionTaskId,  // Sauvegarder aussi le task_id
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    console.log('💾 [ImageExtraction] État sauvegardé dans localStorage');
  } catch (error) {
    console.warn('⚠️ [ImageExtraction] Erreur lors de la sauvegarde dans localStorage:', error);
  }
};

// Fonction pour effacer le localStorage
export const clearImageExtractionStorage = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    console.log('🗑️ [ImageExtraction] LocalStorage effacé');
  } catch (error) {
    console.warn('⚠️ [ImageExtraction] Erreur lors de l\'effacement du localStorage:', error);
  }
};

// Types pour les données extraites de l'image
export interface ExtractedPlaignant {
  nom: string | null;
  prenom: string | null;
  email: string | null;
  telephone: string | null;
}

export interface ExtractedPlainte {
  titre: string | null;
  description: string | null;
  date_incident: string | null;
  service_concerne: string | null;
  mode_reception: string;
}

export interface ExtractedAnalyse {
  priorite_suggeree: string;
  mots_cles: string[];
  gravite_estimee: string;
  resume_court: string;
}

export interface ConfianceExtraction {
  score_global: number;
  score_ocr?: number;
  qualite_ocr?: string;
  champs_incertains: string[];
  scores_par_categorie?: {
    plaignant?: number;
    description?: number;
    analyse?: number;
  };
}

export interface ExtractedData {
  plaignant: ExtractedPlaignant;
  plainte: ExtractedPlainte;
  analyse: ExtractedAnalyse;
  confiance_extraction: ConfianceExtraction;
}

export interface OcrInfo {
  confiance: number;
  qualite: 'excellent' | 'bon' | 'moyen' | 'faible';
  metadata?: Record<string, any>;
}

export interface ServiceOption {
  id: number;
  nom: string;
  code: string;
}

// État éditable par l'utilisateur
export interface EditableFormData {
  // Plaignant
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  // Plainte
  titre: string;
  description: string;
  mode_reception: string;
  date_incident: string;
  priorite: string;
  assigned_user_id: number | null;
  service_id: number | null;
}

interface ImageExtractionState {
  // Fichier Image sélectionné (métadonnées seulement)
  selectedFileName: string | null;
  selectedFileSize: number | null;
  imagePreviewUrl: string | null;
  
  // Chemin du fichier temporaire sur le serveur (pour création après navigation)
  tempFilePath: string | null;
  
  // État de l'extraction
  isExtracting: boolean;
  extractionTaskId: string | null;
  extractionStep: number; // 0 = non démarré, 1 = envoi, 2 = OCR, 3 = IA, 4 = terminé
  extractionMessage: string;
  
  // Données extraites brutes (de l'OCR + IA)
  extractedData: ExtractedData | null;
  extractedText: string;
  
  // Informations OCR
  ocrInfo: OcrInfo | null;
  
  // Services disponibles
  services: ServiceOption[];
  
  // Données du formulaire éditables
  formData: EditableFormData;
  
  // Messages
  error: string | null;
  success: string | null;
}

const initialFormData: EditableFormData = {
  nom: '',
  prenom: '',
  email: '',
  telephone: '',
  titre: '',
  description: '',
  mode_reception: 'photo_import',
  date_incident: '',
  priorite: 'MOYEN',
  assigned_user_id: null,
  service_id: null,
};

const baseInitialState: ImageExtractionState = {
  selectedFileName: null,
  selectedFileSize: null,
  imagePreviewUrl: null,
  tempFilePath: null,
  isExtracting: false,
  extractionTaskId: null,
  extractionStep: 0,
  extractionMessage: '',
  extractedData: null,
  extractedText: '',
  ocrInfo: null,
  services: [],
  formData: { ...initialFormData },
  error: null,
  success: null,
};

// Charger l'état initial depuis localStorage si disponible
const getInitialState = (): ImageExtractionState => {
  const stored = loadFromStorage();
  if (stored) {
    return {
      ...baseInitialState,
      ...stored,
      // Ne pas restaurer les états transitoires
      isExtracting: false,
      extractionTaskId: null,
      extractionMessage: stored.extractionStep === 4 ? 'Données restaurées' : '',
      error: null,
      success: stored.extractedData ? '✅ Données précédemment extraites restaurées' : null,
    };
  }
  return baseInitialState;
};

const initialState: ImageExtractionState = getInitialState();

const imageExtractionSlice = createSlice({
  name: 'imageExtraction',
  initialState,
  reducers: {
    // Sélection du fichier image
    setSelectedFile: (state, action: PayloadAction<{ name: string; size: number; previewUrl?: string }>) => {
      state.selectedFileName = action.payload.name;
      state.selectedFileSize = action.payload.size;
      state.imagePreviewUrl = action.payload.previewUrl || null;
      state.error = null;
      state.success = null;
      state.extractedData = null;
      state.extractedText = '';
      state.ocrInfo = null;
      state.formData = { ...initialFormData };
    },
    
    // Mise à jour de l'URL de prévisualisation
    setImagePreviewUrl: (state, action: PayloadAction<string | null>) => {
      state.imagePreviewUrl = action.payload;
    },
    
    // Démarrage de l'extraction
    startExtraction: (state, action: PayloadAction<{ taskId: string }>) => {
      state.isExtracting = true;
      state.extractionTaskId = action.payload.taskId;
      state.extractionStep = 1;
      state.extractionMessage = 'Envoi de l\'image au serveur...';
      state.error = null;
    },
    
    // Mise à jour de la progression
    updateExtractionProgress: (state, action: PayloadAction<{ step: number; message: string }>) => {
      state.extractionStep = action.payload.step;
      state.extractionMessage = action.payload.message;
    },
    
    // Extraction terminée avec succès
    extractionComplete: (state, action: PayloadAction<{
      extractedData: ExtractedData;
      extractedText?: string;
      ocrInfo?: OcrInfo;
      services?: ServiceOption[];
      tempFilePath?: string;
    }>) => {
      state.isExtracting = false;
      state.extractionStep = 4;
      state.extractionMessage = 'Analyse OCR et IA terminée !';
      state.extractedData = action.payload.extractedData;
      
      if (action.payload.extractedText) {
        state.extractedText = action.payload.extractedText;
      }
      
      if (action.payload.ocrInfo) {
        state.ocrInfo = action.payload.ocrInfo;
      }
      
      if (action.payload.services) {
        state.services = action.payload.services;
      }
      
      // Stocker le chemin du fichier temporaire pour la création après navigation
      if (action.payload.tempFilePath) {
        state.tempFilePath = action.payload.tempFilePath;
      }
      
      // Pré-remplir les champs du formulaire avec les données extraites
      const { plaignant, plainte, analyse } = action.payload.extractedData;
      
      // Plaignant
      state.formData.nom = plaignant?.nom || '';
      state.formData.prenom = plaignant?.prenom || '';
      state.formData.email = plaignant?.email || '';
      state.formData.telephone = plaignant?.telephone || '';
      
      // Plainte - titre automatique si vide
      const dateAujourdhui = new Date().toLocaleDateString('fr-FR', { 
        day: '2-digit', month: '2-digit', year: 'numeric' 
      });
      state.formData.titre = plainte?.titre || `Plainte du ${dateAujourdhui}`;
      state.formData.description = plainte?.description || '';
      state.formData.date_incident = plainte?.date_incident || '';
      state.formData.mode_reception = plainte?.mode_reception || 'photo_import';
      
      // Priorité depuis l'analyse IA
      if (analyse?.priorite_suggeree) {
        state.formData.priorite = analyse.priorite_suggeree;
      }
      
      // Trouver le service correspondant si disponible
      if (plainte?.service_concerne && state.services.length > 0) {
        const matchingService = state.services.find(
          (s) => s.nom.toLowerCase().includes(plainte.service_concerne?.toLowerCase() || '')
        );
        if (matchingService) {
          state.formData.service_id = matchingService.id;
        }
      }
      
      state.success = '✅ Analyse OCR et IA terminée ! Vérifiez et modifiez les informations si nécessaire.';
      
      // Sauvegarder dans localStorage
      saveToStorage(state);
    },
    
    // Extraction échouée
    extractionFailed: (state, action: PayloadAction<string>) => {
      state.isExtracting = false;
      state.extractionStep = 0;
      state.extractionMessage = '';
      state.error = action.payload;
    },
    
    // Mise à jour des services disponibles
    setServices: (state, action: PayloadAction<ServiceOption[]>) => {
      state.services = action.payload;
      // Sauvegarder si on a des données extraites
      if (state.extractedData) {
        saveToStorage(state);
      }
    },
    
    // Mise à jour du chemin du fichier temporaire
    setTempFilePath: (state, action: PayloadAction<string | null>) => {
      state.tempFilePath = action.payload;
      // IMPORTANT: Sauvegarder immédiatement le tempFilePath pour permettre
      // la reprise après refresh même si l'extraction n'est pas terminée
      if (action.payload) {
        saveToStorage(state);
      }
    },
    
    // Mise à jour d'un champ du formulaire
    updateFormField: (state, action: PayloadAction<{ field: keyof EditableFormData; value: any }>) => {
      (state.formData as any)[action.payload.field] = action.payload.value;
      // Sauvegarder les modifications du formulaire
      if (state.extractedData) {
        saveToStorage(state);
      }
    },
    
    // Mise à jour de plusieurs champs du formulaire
    updateFormFields: (state, action: PayloadAction<Partial<EditableFormData>>) => {
      state.formData = { ...state.formData, ...action.payload };
      // Sauvegarder les modifications du formulaire
      if (state.extractedData) {
        saveToStorage(state);
      }
    },
    
    // Messages
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    
    setSuccess: (state, action: PayloadAction<string | null>) => {
      state.success = action.payload;
    },
    
    // Reset complet (après création de plainte réussie)
    resetImageExtraction: () => {
      clearImageExtractionStorage();
      return baseInitialState;
    },
    
    // Reset partiel (garder les services)
    resetForm: (state) => {
      clearImageExtractionStorage();
      state.selectedFileName = null;
      state.selectedFileSize = null;
      state.imagePreviewUrl = null;
      state.tempFilePath = null;
      state.extractedData = null;
      state.extractedText = '';
      state.ocrInfo = null;
      state.formData = { ...initialFormData };
      state.error = null;
      state.success = null;
      state.isExtracting = false;
      state.extractionStep = 0;
      state.extractionMessage = '';
      state.extractionTaskId = null;
    },
  },
});

export const {
  setSelectedFile,
  setImagePreviewUrl,
  startExtraction,
  updateExtractionProgress,
  extractionComplete,
  extractionFailed,
  setServices,
  setTempFilePath,
  updateFormField,
  updateFormFields,
  setError,
  setSuccess,
  resetImageExtraction,
  resetForm,
} = imageExtractionSlice.actions;

export default imageExtractionSlice.reducer;

// Selectors
export const selectImageExtraction = (state: { imageExtraction: ImageExtractionState }) => state.imageExtraction;
export const selectFormData = (state: { imageExtraction: ImageExtractionState }) => state.imageExtraction.formData;
export const selectExtractedData = (state: { imageExtraction: ImageExtractionState }) => state.imageExtraction.extractedData;
export const selectIsExtracting = (state: { imageExtraction: ImageExtractionState }) => state.imageExtraction.isExtracting;
export const selectServices = (state: { imageExtraction: ImageExtractionState }) => state.imageExtraction.services;
export const selectOcrInfo = (state: { imageExtraction: ImageExtractionState }) => state.imageExtraction.ocrInfo;
export const selectTempFilePath = (state: { imageExtraction: ImageExtractionState }) => state.imageExtraction.tempFilePath;
