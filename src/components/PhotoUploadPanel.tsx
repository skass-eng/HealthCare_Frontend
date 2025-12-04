'use client';

import { CloudArrowUpIcon, DocumentMagnifyingGlassIcon, CheckCircleIcon, ExclamationCircleIcon, DocumentTextIcon, UserIcon, PhotoIcon } from '@heroicons/react/24/outline';
import { ChangeEvent, useState, useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUsers } from '../store/slices/userSlice';
import apiService from '@/lib/api';

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
    score_ocr?: number;
    qualite_ocr?: string;
    champs_incertains: string[];
    scores_par_categorie?: Record<string, number>;
  };
}

interface ServiceOption {
  id: number;
  nom: string;
  code: string;
}

interface OcrInfo {
  confiance: number;
  qualite: string;
  metadata?: Record<string, any>;
}

interface PhotoUploadPanelProps {
  onSubmit: (data: any) => void;
  onClose: () => void;
}

export default function PhotoUploadPanel({ onSubmit, onClose }: PhotoUploadPanelProps) {
  const dispatch = useDispatch<any>();
  const users = useSelector((state: any) => state.user?.users || []);
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [extractedText, setExtractedText] = useState<string>('');
  const [ocrInfo, setOcrInfo] = useState<OcrInfo | null>(null);
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
  const [editedModeReception, setEditedModeReception] = useState('photo_import');
  const [editedDateIncident, setEditedDateIncident] = useState('');
  const [editedPriorite, setEditedPriorite] = useState('MOYEN');
  const [editedAssignedUser, setEditedAssignedUser] = useState<number | null>(null);

  // Charger les utilisateurs au montage
  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  // Formats d'image acceptés
  const acceptedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/tiff', 'image/bmp', 'image/gif'];

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && acceptedFormats.includes(file.type)) {
      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file));
      setError(null);
      setSuccess(null);
      setExtractedData(null);
      setOcrInfo(null);
      
      // Lancer automatiquement la prévisualisation
      await handlePreview(file);
    } else if (file) {
      setError('Format d\'image non supporté. Formats acceptés: JPG, PNG, WEBP, TIFF, BMP, GIF');
    }
  };

  const handlePreview = async (file: File) => {
    setIsPreviewLoading(true);
    setError(null);
    
    try {
      console.log('📤 [PhotoUploadPanel] Envoi de l\'image pour OCR:', file.name, file.size);
      const response = await apiService.previewImageExtraction(file);
      
      console.log('📥 [PhotoUploadPanel] Réponse reçue:', response);
      
      if (response.success && response.data) {
        const data = response.data;
        
        // Stocker les informations OCR
        if (data.ocr_info) {
          setOcrInfo(data.ocr_info);
        }
        
        // Stocker les services disponibles
        if (data.services_disponibles) {
          setServices(data.services_disponibles);
        }
        
        // Stocker le texte extrait
        if (data.extraction?.texte_brut) {
          setExtractedText(data.extraction.texte_brut);
        }
        
        // Stocker les données structurées
        if (data.extraction?.donnees_structurees) {
          const extracted = data.extraction.donnees_structurees;
          setExtractedData(extracted);
          
          // Pré-remplir les champs éditables - Plaignant
          setEditedNom(extracted.plaignant?.nom || '');
          setEditedPrenom(extracted.plaignant?.prenom || '');
          setEditedEmail(extracted.plaignant?.email || '');
          setEditedTelephone(extracted.plaignant?.telephone || '');
          
          // Pré-remplir les champs éditables - Plainte
          setEditedTitre(extracted.plainte?.titre || '');
          setEditedDescription(extracted.plainte?.description || '');
          setEditedDateIncident(extracted.plainte?.date_incident || '');
          setEditedModeReception(extracted.plainte?.mode_reception || 'photo_import');
          
          // Pré-remplir la priorité depuis l'analyse IA
          if (extracted.analyse?.priorite_suggeree) {
            setEditedPriorite(extracted.analyse.priorite_suggeree);
          }
          
          // Sélectionner le service détecté si possible
          if (extracted.plainte?.service_concerne && data.services_disponibles) {
            const matchingService = data.services_disponibles.find(
              (s: ServiceOption) => s.nom.toLowerCase().includes(extracted.plainte?.service_concerne?.toLowerCase() || '')
            );
            if (matchingService) {
              setSelectedServiceId(matchingService.id);
            }
          }
        }
      } else {
        setError(response.message || 'Erreur lors de la prévisualisation');
      }
    } catch (err: any) {
      console.error('❌ [PhotoUploadPanel] Exception:', err);
      setError(err.message || 'Erreur lors de l\'extraction OCR de l\'image');
    } finally {
      setIsPreviewLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      setError('Veuillez sélectionner une image');
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
      const userData = {
        nom: editedNom || undefined,
        prenom: editedPrenom || undefined,
        email: editedEmail || undefined,
        telephone: editedTelephone || undefined,
        titre: editedTitre || undefined,
        description: editedDescription || undefined,
        mode_reception: editedModeReception || 'photo_import',
        date_incident: editedDateIncident || undefined,
        priorite: editedPriorite || 'MOYEN',
        assigned_user_id: editedAssignedUser || undefined,
      };
      
      const response = await apiService.createPlainteFromImage(
        selectedFile,
        selectedServiceId || undefined,
        userData
      );
      
      if (response.success && response.data) {
        setSuccess(`Plainte ${response.data.plainte?.numero_plainte} créée avec succès !`);
        onSubmit(response.data);
        setTimeout(() => { onClose(); }, 2000);
      } else {
        setError(response.message || 'Erreur lors de la création de la plainte');
      }
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la création de la plainte depuis l\'image');
    } finally {
      setIsLoading(false);
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
        setSelectedFile(file);
        setImagePreview(URL.createObjectURL(file));
        setError(null);
        await handlePreview(file);
      } else {
        setError('Format d\'image non supporté. Formats acceptés: JPG, PNG, WEBP, TIFF, BMP, GIF');
      }
    }
  }, []);

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
            {isPreviewLoading ? (
              <>
                <DocumentMagnifyingGlassIcon className="w-12 h-12 text-emerald-500 mx-auto mb-4 animate-pulse" />
                <h3 className="text-lg font-semibold text-emerald-700 mb-2">Analyse OCR en cours...</h3>
                <p className="text-emerald-600 mb-4">Extraction du texte et analyse IA</p>
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
            {!isPreviewLoading && (
              <button 
                onClick={(e) => { e.stopPropagation(); handleButtonClick(); }}
                className="bg-gradient-to-r from-emerald-500 to-green-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
              >
                Sélectionner une photo
              </button>
            )}
            
            {/* Prévisualisation de l'image */}
            {imagePreview && (
              <div className="mt-4 p-3 bg-emerald-100 rounded-lg">
                <p className="text-emerald-700 text-sm font-medium mb-2">
                  Image sélectionnée : {selectedFile?.name} ({selectedFile && (selectedFile.size / 1024).toFixed(1)} Ko)
                </p>
                <div className="flex justify-center">
                  <img 
                    src={imagePreview} 
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
                    value={editedNom}
                    onChange={(e) => setEditedNom(e.target.value)}
                    placeholder="Nom du plaignant" 
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
                <div className="bg-white rounded-lg p-4 border border-slate-200">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Prénom *</label>
                  <input 
                    type="text" 
                    value={editedPrenom}
                    onChange={(e) => setEditedPrenom(e.target.value)}
                    placeholder="Prénom du plaignant" 
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
                <div className="bg-white rounded-lg p-4 border border-slate-200">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                  <input 
                    type="email" 
                    value={editedEmail}
                    onChange={(e) => setEditedEmail(e.target.value)}
                    placeholder="email@exemple.com" 
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
                <div className="bg-white rounded-lg p-4 border border-slate-200">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Téléphone</label>
                  <input 
                    type="tel" 
                    value={editedTelephone}
                    onChange={(e) => setEditedTelephone(e.target.value)}
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
                  value={editedTitre}
                  onChange={(e) => setEditedTitre(e.target.value)}
                  placeholder="Ex: Problème d'accueil aux urgences..." 
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
              
              <div className="bg-white rounded-lg p-4 border border-slate-200 mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">Description détaillée *</label>
                <textarea 
                  rows={4}
                  value={editedDescription}
                  onChange={(e) => setEditedDescription(e.target.value)}
                  placeholder="Décrivez en détail la plainte..." 
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="bg-white rounded-lg p-4 border border-slate-200">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Mode de réception *</label>
                  <select 
                    value={editedModeReception}
                    onChange={(e) => setEditedModeReception(e.target.value)}
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
                    value={editedDateIncident}
                    onChange={(e) => setEditedDateIncident(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
              </div>
              
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
                      <option key={service.id} value={service.id}>{service.nom}</option>
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
                ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:shadow-xl transform hover:-translate-y-1' 
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