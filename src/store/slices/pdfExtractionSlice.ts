import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Types pour les données extraites du PDF
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

export interface ServiceOption {
  id: number;
  nom: string;
  code: string;
}

// État éditable par l'utilisateur (basé sur l'extraction mais modifiable)
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

interface PdfExtractionState {
  // Fichier PDF sélectionné (on stocke les métadonnées, pas le File lui-même)
  selectedFileName: string | null;
  selectedFileSize: number | null;
  
  // État de l'extraction
  isExtracting: boolean;
  extractionTaskId: string | null;
  extractionStep: number; // 0 = non démarré, 1-4 = étapes
  extractionMessage: string;
  
  // Données extraites brutes (de l'IA)
  extractedData: ExtractedData | null;
  extractedText: string;
  
  // Services disponibles
  services: ServiceOption[];
  
  // Données du formulaire éditables (basées sur l'extraction mais modifiables)
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
  mode_reception: 'pdf_import',
  date_incident: '',
  priorite: 'MOYEN',
  assigned_user_id: null,
  service_id: null,
};

const initialState: PdfExtractionState = {
  selectedFileName: null,
  selectedFileSize: null,
  isExtracting: false,
  extractionTaskId: null,
  extractionStep: 0,
  extractionMessage: '',
  extractedData: null,
  extractedText: '',
  services: [],
  formData: { ...initialFormData },
  error: null,
  success: null,
};

const pdfExtractionSlice = createSlice({
  name: 'pdfExtraction',
  initialState,
  reducers: {
    // Sélection du fichier
    setSelectedFile: (state, action: PayloadAction<{ name: string; size: number }>) => {
      state.selectedFileName = action.payload.name;
      state.selectedFileSize = action.payload.size;
      state.error = null;
      state.success = null;
      state.extractedData = null;
      state.extractedText = '';
      state.formData = { ...initialFormData };
    },
    
    // Démarrage de l'extraction
    startExtraction: (state, action: PayloadAction<{ taskId: string }>) => {
      state.isExtracting = true;
      state.extractionTaskId = action.payload.taskId;
      state.extractionStep = 1;
      state.extractionMessage = 'Envoi du fichier au serveur...';
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
      services?: ServiceOption[];
    }>) => {
      state.isExtracting = false;
      state.extractionStep = 4;
      state.extractionMessage = 'Analyse terminée !';
      state.extractedData = action.payload.extractedData;
      
      if (action.payload.extractedText) {
        state.extractedText = action.payload.extractedText;
      }
      
      if (action.payload.services) {
        state.services = action.payload.services;
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
      state.formData.mode_reception = plainte?.mode_reception || 'pdf_import';
      
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
      
      state.success = '✅ Analyse IA terminée ! Vérifiez et modifiez les informations si nécessaire.';
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
    },
    
    // Mise à jour d'un champ du formulaire
    updateFormField: (state, action: PayloadAction<{ field: keyof EditableFormData; value: any }>) => {
      (state.formData as any)[action.payload.field] = action.payload.value;
    },
    
    // Mise à jour de plusieurs champs du formulaire
    updateFormFields: (state, action: PayloadAction<Partial<EditableFormData>>) => {
      state.formData = { ...state.formData, ...action.payload };
    },
    
    // Messages
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    
    setSuccess: (state, action: PayloadAction<string | null>) => {
      state.success = action.payload;
    },
    
    // Reset complet
    resetPdfExtraction: () => initialState,
    
    // Reset partiel (garder les services)
    resetForm: (state) => {
      state.selectedFileName = null;
      state.selectedFileSize = null;
      state.extractedData = null;
      state.extractedText = '';
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
  startExtraction,
  updateExtractionProgress,
  extractionComplete,
  extractionFailed,
  setServices,
  updateFormField,
  updateFormFields,
  setError,
  setSuccess,
  resetPdfExtraction,
  resetForm,
} = pdfExtractionSlice.actions;

export default pdfExtractionSlice.reducer;

// Selectors
export const selectPdfExtraction = (state: { pdfExtraction: PdfExtractionState }) => state.pdfExtraction;
export const selectFormData = (state: { pdfExtraction: PdfExtractionState }) => state.pdfExtraction.formData;
export const selectExtractedData = (state: { pdfExtraction: PdfExtractionState }) => state.pdfExtraction.extractedData;
export const selectIsExtracting = (state: { pdfExtraction: PdfExtractionState }) => state.pdfExtraction.isExtracting;
export const selectServices = (state: { pdfExtraction: PdfExtractionState }) => state.pdfExtraction.services;
