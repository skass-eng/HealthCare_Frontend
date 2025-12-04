'use client';

import { CloudArrowUpIcon, DocumentMagnifyingGlassIcon, CheckCircleIcon, ExclamationCircleIcon, DocumentTextIcon, UserIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { ChangeEvent, useState, useCallback, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUsers } from '../store/slices/userSlice';
import apiService from '@/lib/api';
import wsService from '@/lib/websocket';

interface ExtractedData {
  plaignant: {
    nom: string | null;
    prenom: string | null;
    email: string | null;
    telephone: string | null;
  };
  plainte: {
    titre: string | null;
    description: string | null;
    date_incident: string | null;
    service_concerne: string | null;
    mode_reception: string;
  };
  analyse: {
    priorite_suggeree: string;
    mots_cles: string[];
    gravite_estimee: string;
    resume_court: string;
  };
  confiance_extraction: {
    score_global: number;
    champs_incertains: string[];
  };
}

interface ServiceOption {
  id: number;
  nom: string;
  code: string;
}

interface PdfUploadPanelProps {
  onSubmit: (data: any) => void;
  onClose: () => void;
}

export default function PdfUploadPanel({ onSubmit, onClose }: PdfUploadPanelProps) {
  const dispatch = useDispatch<any>();
  const users = useSelector((state: any) => state.user?.users || []);
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [isAnalysisInProgress, setIsAnalysisInProgress] = useState(false);
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
  const [analysisMessage, setAnalysisMessage] = useState<string>('');
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [extractedText, setExtractedText] = useState<string>('');
  const [services, setServices] = useState<ServiceOption[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Champs éditables - Plaignant
  const [editedNom, setEditedNom] = useState('');
  const [editedPrenom, setEditedPrenom] = useState('');
  const [editedEmail, setEditedEmail] = useState('');
  const [editedTelephone, setEditedTelephone] = useState('');
  
  // Champs éditables - Plainte
  const [editedTitre, setEditedTitre] = useState('');
  const [editedDescription, setEditedDescription] = useState('');
  const [editedModeReception, setEditedModeReception] = useState('pdf_import');
  const [editedDateIncident, setEditedDateIncident] = useState('');
  const [editedPriorite, setEditedPriorite] = useState('MOYEN');
  const [editedAssignedUser, setEditedAssignedUser] = useState<number | null>(null);
  
  // Ref pour le polling
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // Charger les utilisateurs au montage
  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  // Setup WebSocket listeners pour les extractions
  useEffect(() => {
    // Connecter au WebSocket si pas déjà fait
    if (!wsService.isConnected()) {
      wsService.connect().catch(err => {
        console.warn('⚠️ WebSocket non disponible, mode polling activé');
      });
    }

    // Écouter les événements d'extraction PDF
    wsService.onPdfExtractionComplete((data) => {
      if (currentTaskId && data.task_id === currentTaskId) {
        console.log('✅ [WS] Extraction PDF terminée:', data);
        handleExtractionComplete(data);
      }
    });

    wsService.onPdfExtractionFailed((data) => {
      if (currentTaskId && data.task_id === currentTaskId) {
        console.log('❌ [WS] Extraction PDF échouée:', data);
        setIsAnalysisInProgress(false);
        setError(data.error || 'Erreur lors de l\'analyse IA');
        setAnalysisMessage('');
      }
    });

    return () => {
      wsService.cleanupExtractionListeners();
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [currentTaskId]);

  // Fonction pour traiter les résultats d'extraction
  const handleExtractionComplete = (data: any) => {
    setIsAnalysisInProgress(false);
    setAnalysisMessage('');
    
    if (data.extraction?.donnees_structurees) {
      const extracted = data.extraction.donnees_structurees;
      setExtractedData(extracted);
      
      if (data.extraction.texte_brut) {
        setExtractedText(data.extraction.texte_brut);
      }
      
      // Pré-remplir les champs
      setEditedNom(extracted.plaignant?.nom || '');
      setEditedPrenom(extracted.plaignant?.prenom || '');
      setEditedEmail(extracted.plaignant?.email || '');
      setEditedTelephone(extracted.plaignant?.telephone || '');
      setEditedTitre(extracted.plainte?.titre || '');
      setEditedDescription(extracted.plainte?.description || '');
      setEditedDateIncident(extracted.plainte?.date_incident || '');
      setEditedModeReception(extracted.plainte?.mode_reception || 'pdf_import');
      
      if (extracted.analyse?.priorite_suggeree) {
        setEditedPriorite(extracted.analyse.priorite_suggeree);
      }
      
      // Trouver le service correspondant
      if (extracted.plainte?.service_concerne && services.length > 0) {
        const matchingService = services.find(
          (s) => s.nom.toLowerCase().includes(extracted.plainte?.service_concerne?.toLowerCase() || '')
        );
        if (matchingService) {
          setSelectedServiceId(matchingService.id);
        }
      }
      
      setSuccess('✅ Analyse IA terminée ! Vérifiez et modifiez les informations si nécessaire.');
    }
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
      setError(null);
      setSuccess(null);
      setExtractedData(null);
      
      // Lancer la prévisualisation asynchrone
      await handlePreviewAsync(file);
    } else if (file) {
      setError('Seuls les fichiers PDF sont acceptés');
    }
  };

  // Nouvelle méthode de prévisualisation asynchrone
  const handlePreviewAsync = async (file: File) => {
    setIsPreviewLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      console.log('📤 [PdfUploadPanel] Lancement extraction async:', file.name);
      const response = await apiService.previewPdfExtractionAsync(file);
      
      console.log('📥 [PdfUploadPanel] Réponse async:', response);
      
      if (response.success && response.data) {
        const data = response.data;
        
        // Stocker les services disponibles
        if (data.services_disponibles) {
          setServices(data.services_disponibles);
        }
        
        // Si c'est une réponse synchrone (fallback), traiter directement
        if (data.async === false && data.extraction) {
          console.log('⚡ [PdfUploadPanel] Mode synchrone (fallback)');
          handleExtractionComplete({
            extraction: data.extraction
          });
          setIsPreviewLoading(false);
          return;
        }
        
        // Mode asynchrone - attendre la notification WebSocket
        if (data.async === true && data.task_id) {
          console.log('🔄 [PdfUploadPanel] Mode asynchrone, task_id:', data.task_id);
          setCurrentTaskId(data.task_id);
          setIsAnalysisInProgress(true);
          setAnalysisMessage('🤖 Analyse IA en cours... Veuillez patienter');
          
          // S'abonner aux notifications pour cette tâche
          if (wsService.isConnected()) {
            wsService.subscribeToExtraction(data.task_id);
          }
          
          // Fallback: polling si WebSocket ne répond pas dans 60s
          pollingRef.current = setTimeout(() => {
            if (isAnalysisInProgress) {
              console.log('⏱️ [PdfUploadPanel] Timeout WebSocket, fallback sur appel synchrone');
              // Appeler l'ancienne méthode synchrone comme fallback
              handlePreviewSync(file);
            }
          }, 60000);
        }
      } else {
        setError(response.message || 'Erreur lors du lancement de l\'analyse');
      }
    } catch (err: any) {
      console.error('❌ [PdfUploadPanel] Exception:', err);
      setError(err.message || 'Erreur lors de la prévisualisation');
    } finally {
      setIsPreviewLoading(false);
    }
  };

  // Méthode de prévisualisation synchrone (fallback)
  const handlePreviewSync = async (file: File) => {
    setAnalysisMessage('🔄 Analyse synchrone en cours...');
    
    try {
      const response = await apiService.previewPdfExtraction(file);
      
      console.log('📥 [PdfUploadPanel] Réponse reçue:', response);
      console.log('📥 [PdfUploadPanel] response.success:', response.success);
      console.log('📥 [PdfUploadPanel] response.data:', response.data);
      
      if (response.success && response.data) {
        const data = response.data;
        
        console.log('📊 [PdfUploadPanel] Data complète:', JSON.stringify(data, null, 2));
        
        // Stocker les services disponibles
        if (data.services_disponibles) {
          console.log('🏥 [PdfUploadPanel] Services disponibles:', data.services_disponibles);
          setServices(data.services_disponibles);
        }
        
        // Stocker le texte extrait
        if (data.extraction?.texte_brut) {
          console.log('📝 [PdfUploadPanel] Texte brut extrait:', data.extraction.texte_brut.substring(0, 200) + '...');
          setExtractedText(data.extraction.texte_brut);
        }
        
        // Stocker les données structurées
        console.log('🔍 [PdfUploadPanel] Données structurées:', data.extraction?.donnees_structurees);
        
        if (data.extraction?.donnees_structurees) {
          const extracted = data.extraction.donnees_structurees;
          console.log('✅ [PdfUploadPanel] Données extraites trouvées:', extracted);
          console.log('👤 [PdfUploadPanel] Plaignant:', extracted.plaignant);
          console.log('📋 [PdfUploadPanel] Plainte:', extracted.plainte);
          console.log('🎯 [PdfUploadPanel] Analyse:', extracted.analyse);
          
          setExtractedData(extracted);
          
          // Pré-remplir les champs éditables - Plaignant
          const nom = extracted.plaignant?.nom || '';
          const prenom = extracted.plaignant?.prenom || '';
          const email = extracted.plaignant?.email || '';
          const telephone = extracted.plaignant?.telephone || '';
          
          setEditedNom(nom);
          setEditedPrenom(prenom);
          setEditedEmail(email);
          setEditedTelephone(telephone);
          
          // Pré-remplir les champs éditables - Plainte
          const titre = extracted.plainte?.titre || '';
          const description = extracted.plainte?.description || '';
          const dateIncident = extracted.plainte?.date_incident || '';
          const modeReception = extracted.plainte?.mode_reception || 'pdf_import';
          
          setEditedTitre(titre);
          setEditedDescription(description);
          setEditedDateIncident(dateIncident);
          setEditedModeReception(modeReception);
          
          // Pré-remplir la priorité depuis l'analyse IA
          if (extracted.analyse?.priorite_suggeree) {
            setEditedPriorite(extracted.analyse.priorite_suggeree);
          }
          
          console.log('📝 [PdfUploadPanel] Pré-remplissage des champs:');
          console.log('  - Nom:', nom, '| Prénom:', prenom);
          console.log('  - Email:', email, '| Téléphone:', telephone);
          console.log('  - Titre:', titre);
          console.log('  - Date incident:', dateIncident);
          console.log('  - Mode réception:', modeReception);
          console.log('  - Priorité suggérée:', extracted.analyse?.priorite_suggeree);
          
          // Sélectionner le service détecté si possible
          if (extracted.plainte?.service_concerne && data.services_disponibles) {
            console.log('🔎 [PdfUploadPanel] Recherche du service:', extracted.plainte.service_concerne);
            const matchingService = data.services_disponibles.find(
              (s: ServiceOption) => s.nom.toLowerCase().includes(extracted.plainte?.service_concerne?.toLowerCase() || '')
            );
            if (matchingService) {
              console.log('✅ [PdfUploadPanel] Service trouvé:', matchingService);
              setSelectedServiceId(matchingService.id);
            }
          }
        } else {
          console.warn('⚠️ [PdfUploadPanel] Aucune donnée structurée trouvée dans data.extraction.donnees_structurees');
        }
      } else {
        console.error('❌ [PdfUploadPanel] Réponse non réussie:', response.message);
        setError(response.message || 'Erreur lors de la prévisualisation');
      }
    } catch (err: any) {
      console.error('❌ [PdfUploadPanel] Exception:', err);
      setError(err.message || 'Erreur lors de la prévisualisation du PDF');
    } finally {
      setIsPreviewLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      setError('Veuillez sélectionner un fichier PDF');
      return;
    }

    // Validation des champs obligatoires
    if (!editedTitre.trim()) {
      setError('Le titre de la plainte est obligatoire');
      return;
    }
    if (!editedDescription.trim()) {
      setError('La description est obligatoire');
      return;
    }
    if (!editedNom.trim()) {
      setError('Le nom du plaignant est obligatoire');
      return;
    }
    if (!editedPrenom.trim()) {
      setError('Le prénom du plaignant est obligatoire');
      return;
    }
    if (!selectedServiceId) {
      setError('Veuillez sélectionner un service');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      // Préparer les données modifiées par l'utilisateur
      const userData = {
        // Plaignant
        nom: editedNom || undefined,
        prenom: editedPrenom || undefined,
        email: editedEmail || undefined,
        telephone: editedTelephone || undefined,
        // Plainte
        titre: editedTitre || undefined,
        description: editedDescription || undefined,
        mode_reception: editedModeReception || 'pdf_import',
        date_incident: editedDateIncident || undefined,
        priorite: editedPriorite || 'MOYEN',
        assigned_user_id: editedAssignedUser || undefined,
      };
      
      console.log('📤 [PdfUploadPanel] Soumission avec données utilisateur:', userData);
      
      const response = await apiService.createPlainteFromPdf(
        selectedFile,
        selectedServiceId || undefined,
        userData
      );
      
      if (response.success && response.data) {
        setSuccess(`Plainte ${response.data.plainte?.numero_plainte} créée avec succès !`);
        
        // Appeler le callback avec les données
        onSubmit(response.data);
        
        // Fermer après un délai
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        setError(response.message || 'Erreur lors de la création de la plainte');
      }
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la création de la plainte depuis le PDF');
    } finally {
      setIsLoading(false);
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
        setSelectedFile(file);
        setError(null);
        await handlePreview(file);
      } else {
        setError('Seuls les fichiers PDF sont acceptés');
      }
    }
  }, []);

  const getConfidenceColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600 bg-green-100';
    if (score >= 0.5) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
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

        {/* Indicateur d'analyse en cours (overlay plein écran) */}
        {isAnalysisInProgress && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-md mx-4 text-center">
              <div className="relative mb-6">
                {/* Cercle animé externe */}
                <div className="w-20 h-20 mx-auto border-4 border-teal-200 rounded-full animate-pulse"></div>
                {/* Spinner interne */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <ArrowPathIcon className="w-10 h-10 text-teal-600 animate-spin" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Analyse IA en cours</h3>
              <p className="text-slate-600 mb-4">{analysisMessage}</p>
              <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
                <span className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
              {currentTaskId && (
                <p className="mt-4 text-xs text-slate-400 font-mono">
                  Task: {currentTaskId.slice(0, 8)}...
                </p>
              )}
            </div>
          </div>
        )}

        {/* Zone de drop pour PDF */}
        <div 
          className={`border-2 border-dashed rounded-xl p-8 mb-6 transition-colors cursor-pointer ${
            isAnalysisInProgress 
              ? 'border-amber-400 bg-amber-50/50' 
              : 'border-teal-300 bg-teal-50/50 hover:border-teal-400'
          }`}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={isAnalysisInProgress ? undefined : handleButtonClick}
        >
          <div className="text-center">
            {isAnalysisInProgress ? (
              <>
                <ArrowPathIcon className="w-12 h-12 text-amber-500 mx-auto mb-4 animate-spin" />
                <h3 className="text-lg font-semibold text-amber-700 mb-2">Analyse IA en cours...</h3>
                <p className="text-amber-600 mb-4">{analysisMessage}</p>
                <div className="flex items-center justify-center gap-1">
                  <span className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </>
            ) : isPreviewLoading ? (
              <>
                <DocumentMagnifyingGlassIcon className="w-12 h-12 text-teal-500 mx-auto mb-4 animate-pulse" />
                <h3 className="text-lg font-semibold text-teal-700 mb-2">Téléchargement du PDF...</h3>
                <p className="text-teal-600 mb-4">Envoi du fichier au serveur</p>
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
              disabled={isAnalysisInProgress}
            />
            {!isPreviewLoading && !isAnalysisInProgress && (
              <button 
                onClick={(e) => { e.stopPropagation(); handleButtonClick(); }}
                className="bg-gradient-to-r from-teal-500 to-teal-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
              >
                Sélectionner un PDF
              </button>
            )}
            {selectedFile && (
              <div className="mt-4 p-3 bg-teal-100 rounded-lg">
                <p className="text-teal-700 text-sm font-medium">
                  Fichier sélectionné : {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} Ko)
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
                    value={editedNom}
                    onChange={(e) => setEditedNom(e.target.value)}
                    placeholder="Nom du plaignant" 
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div className="bg-white rounded-lg p-4 border border-slate-200">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Prénom *</label>
                  <input 
                    type="text" 
                    value={editedPrenom}
                    onChange={(e) => setEditedPrenom(e.target.value)}
                    placeholder="Prénom du plaignant" 
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div className="bg-white rounded-lg p-4 border border-slate-200">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                  <input 
                    type="email" 
                    value={editedEmail}
                    onChange={(e) => setEditedEmail(e.target.value)}
                    placeholder="email@exemple.com" 
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div className="bg-white rounded-lg p-4 border border-slate-200">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Téléphone</label>
                  <input 
                    type="tel" 
                    value={editedTelephone}
                    onChange={(e) => setEditedTelephone(e.target.value)}
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
                  value={editedTitre}
                  onChange={(e) => setEditedTitre(e.target.value)}
                  placeholder="Ex: Problème d'accueil aux urgences..." 
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
              
              {/* Description */}
              <div className="bg-white rounded-lg p-4 border border-slate-200 mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">Description détaillée *</label>
                <textarea 
                  rows={4}
                  value={editedDescription}
                  onChange={(e) => setEditedDescription(e.target.value)}
                  placeholder="Décrivez en détail la plainte..." 
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
              
              {/* Ligne avec Mode réception et Date incident */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="bg-white rounded-lg p-4 border border-slate-200">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Mode de réception *</label>
                  <select 
                    value={editedModeReception}
                    onChange={(e) => setEditedModeReception(e.target.value)}
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
                    value={editedDateIncident}
                    onChange={(e) => setEditedDateIncident(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              {/* Ligne avec Service, Priorité et Assigné à */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg p-4 border border-slate-200">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Service concerné *</label>
                  <select 
                    value={selectedServiceId || ''}
                    onChange={(e) => setSelectedServiceId(e.target.value ? parseInt(e.target.value) : null)}
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
                    value={editedPriorite}
                    onChange={(e) => setEditedPriorite(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent ${
                      editedPriorite === 'URGENT' ? 'border-red-300 focus:ring-red-500 text-red-700 font-semibold' :
                      editedPriorite === 'ELEVE' ? 'border-orange-300 focus:ring-orange-500 text-orange-700 font-semibold' :
                      editedPriorite === 'MOYEN' ? 'border-yellow-300 focus:ring-yellow-500 text-yellow-700 font-semibold' :
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
                    value={editedAssignedUser || ''}
                    onChange={(e) => setEditedAssignedUser(e.target.value ? parseInt(e.target.value) : null)}
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
            onClick={onClose}
            disabled={isLoading}
            className="px-6 py-3 border border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            Annuler
          </button>
          <button 
            onClick={handleSubmit}
            disabled={!selectedFile || isLoading || !extractedData}
            className={`px-6 py-3 rounded-xl font-semibold shadow-lg transition-all duration-300 flex items-center gap-2 ${
              selectedFile && !isLoading && extractedData
                ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white hover:shadow-xl transform hover:-translate-y-1' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isLoading ? (
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