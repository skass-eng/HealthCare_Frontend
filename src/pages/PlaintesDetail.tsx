import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiService } from '../lib/api';
import { 
  ArrowLeft as ArrowLeftIcon,
  Assignment as DocumentTextIcon, 
  Person as UserIcon, 
  Schedule as ClockIcon,
  ArrowForward as ArrowRightIcon,
  Send as PaperAirplaneIcon,
  AutoAwesome as SparklesIcon,
  Description as DocumentIcon,
  Visibility as EyeIcon,
  Download as ArrowDownTrayIcon,
  Edit as PencilIcon,
  Close as XMarkIcon,
  Check as CheckIcon
} from '@mui/icons-material';

interface StatusStep {
  id: string;
  label: string;
  icon: string;
  color: string;
  bgColor: string;
}

const STATUS_STEPS: StatusStep[] = [
  { id: 'RECU', label: 'Reçu', icon: '📬', color: 'text-blue-600', bgColor: 'bg-blue-100' },
  { id: 'EN_COURS', label: 'En Cours', icon: '⏳', color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
  { id: 'TRAITE', label: 'Traité', icon: '✅', color: 'text-emerald-600', bgColor: 'bg-emerald-100' },
  { id: 'CLOTURE', label: 'Clôturé', icon: '🔒', color: 'text-slate-600', bgColor: 'bg-slate-100' }
];

interface PlainteDocument {
  id: number;
  nom_fichier: string;
  nom_stockage: string;
  chemin_fichier: string;
  type_fichier: string;
  taille_fichier: number;
  mime_type: string;
  est_piece_jointe_originale: boolean;
  date_upload: string;
  fichier_existe?: boolean;
}

interface PdfRapport {
  nom_fichier: string;
  chemin: string;
  type: string;
  taille?: number;
  date_creation: string;
}

interface AnalyseIA {
  id: number;
  sentiment: string;
  score_sentiment: number;
  service_suggere: string;
  priorite_ia: string;
  resume_ia: string;
  reponse_suggeree: string;
  mots_cles_detectes: string[];
  statut_analyse: string;
  date_analyse: string;
}

interface Plainte {
  id: string | number;
  numero_plainte?: string;
  plainte_id?: string;
  titre: string;
  description: string;
  service: string | { id: number; nom: string; code_service: string } | null;
  service_id?: number;
  statut: string;
  priorite: string;
  date_creation: string;
  date_modification?: string;
  nom_plaignant: string;
  prenom_plaignant?: string;
  email_plaignant?: string;
  telephone_plaignant: string;
  mode_reception?: string;
  type_service?: string;
  categorie_principale?: string;
  contenu?: string;
  documents?: PlainteDocument[];
  pdf_rapport?: PdfRapport | null;
  analyse_ia?: AnalyseIA | null;
  assigned_user?: { id: number; nom: string; prenom: string; email: string } | null;
}

interface EditFormData {
  titre: string;
  description: string;
  service: string;
  priorite: string;
  nom_plaignant: string;
  prenom_plaignant: string;
  telephone_plaignant: string;
}

const PlaintesDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [plainte, setPlainte] = useState<Plainte | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [aiResponse, setAiResponse] = useState<string>('');
  const [generatingResponse, setGeneratingResponse] = useState(false);
  const [documents, setDocuments] = useState<PlainteDocument[]>([]);
  const [pdfRapport, setPdfRapport] = useState<PdfRapport | null>(null);
  const [analyseIA, setAnalyseIA] = useState<AnalyseIA | null>(null);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  
  // États pour l'édition
  const [showEditModal, setShowEditModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [editFormData, setEditFormData] = useState<EditFormData>({
    titre: '',
    description: '',
    service: '',
    priorite: '',
    nom_plaignant: '',
    prenom_plaignant: '',
    telephone_plaignant: ''
  });
  const [saving, setSaving] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // États pour l'édition inline
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [currentPriority, setCurrentPriority] = useState('MOYEN');
  const [currentStatus, setCurrentStatus] = useState('TRAITE');
  const [manualResponse, setManualResponse] = useState<string>('');
  const [showResponseEditor, setShowResponseEditor] = useState<boolean>(false);

  useEffect(() => {
    if (id) {
      loadPlainte();
    }
  }, [id]);

  const loadPlainte = async () => {
    try {
      setLoading(true);
      
      // Appel API réel pour récupérer la plainte avec ses documents
      const plainteId = parseInt(id || '0');
      if (!plainteId) {
        console.error('ID de plainte invalide');
        return;
      }

      const response = await apiService.getPlainte(plainteId);
      
      if (response.success && response.data) {
        const data = response.data;
        
        // Formater les données de la plainte
        const plainteData: Plainte = {
          id: data.id,
          numero_plainte: data.numero_plainte,
          plainte_id: data.numero_plainte || `PL-${data.id}`,
          titre: data.titre,
          description: data.description,
          contenu: data.contenu || data.description,
          service: data.service,
          service_id: data.service_id,
          statut: data.statut,
          priorite: data.priorite,
          date_creation: data.date_creation,
          date_modification: data.date_modification,
          nom_plaignant: data.nom_plaignant || '',
          prenom_plaignant: data.prenom_plaignant || '',
          email_plaignant: data.email_plaignant || '',
          telephone_plaignant: data.telephone_plaignant || '',
          mode_reception: data.mode_reception,
          type_service: typeof data.service === 'object' ? data.service?.code_service : undefined,
          categorie_principale: data.categorie_principale,
          documents: data.documents || [],
          pdf_rapport: data.pdf_rapport,
          analyse_ia: data.analyse_ia,
          assigned_user: data.assigned_user
        };
        
        setPlainte(plainteData);
        
        // Mettre à jour les documents
        if (data.documents && data.documents.length > 0) {
          setDocuments(data.documents);
        }
        
        // Mettre à jour le PDF rapport
        if (data.pdf_rapport) {
          setPdfRapport(data.pdf_rapport);
        }
        
        // Mettre à jour l'analyse IA et pré-remplir la réponse suggérée
        if (data.analyse_ia) {
          setAnalyseIA(data.analyse_ia);
          if (data.analyse_ia.reponse_suggeree) {
            setAiResponse(data.analyse_ia.reponse_suggeree);
          }
        }
        
        // Mettre à jour le statut
        const statusIndex = STATUS_STEPS.findIndex(step => step.id === data.statut);
        setCurrentStep(statusIndex >= 0 ? statusIndex : 0);
        setCurrentPriority(data.priorite || 'MOYEN');
        setCurrentStatus(data.statut || 'RECU');
      } else {
        console.error('Erreur lors du chargement de la plainte:', response.message);
        showNotification('Erreur lors du chargement de la plainte');
      }
    } catch (error) {
      console.error('Erreur lors du chargement de la plainte:', error);
      showNotification('Erreur lors du chargement de la plainte');
    } finally {
      setLoading(false);
    }
  };

  const loadDocuments = async () => {
    if (!id) return;
    
    try {
      setLoadingDocuments(true);
      const plainteId = parseInt(id);
      
      const response = await apiService.getPlainteDocuments(plainteId);
      
      if (response.success && response.data) {
        setDocuments(response.data.documents || []);
        if (response.data.pdf_rapport) {
          setPdfRapport(response.data.pdf_rapport);
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement des documents:', error);
    } finally {
      setLoadingDocuments(false);
    }
  };

  // Fonction pour télécharger un document
  const downloadDocument = (doc: PlainteDocument) => {
    if (!id) return;
    const url = apiService.getDocumentDownloadUrl(parseInt(id), doc.id);
    window.open(url, '_blank');
  };

  // Fonction pour télécharger le PDF rapport
  const downloadPdfRapport = () => {
    if (!id) return;
    const url = apiService.getPdfRapportDownloadUrl(parseInt(id));
    window.open(url, '_blank');
  };

  // Fonction pour formater la taille du fichier
  const formatFileSize = (bytes: number): string => {
    if (!bytes) return 'N/A';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const generateAIResponse = async () => {
    if (!plainte) return;
    
    try {
      setGeneratingResponse(true);
      // Utiliser la réponse suggérée de l'analyse IA si disponible
      if (analyseIA?.reponse_suggeree) {
        setAiResponse(analyseIA.reponse_suggeree);
        setGeneratingResponse(false);
        showNotification('Réponse IA récupérée avec succès ✅');
        return;
      }
      
      // Sinon, simulation d'une réponse IA
      setTimeout(() => {
        setAiResponse('Cher(e) ' + plainte.nom_plaignant + ',\n\nNous vous remercions de nous avoir fait part de votre préoccupation concernant le temps d\'attente aux urgences. Nous comprenons votre frustration et nous nous excusons pour ce désagrément.\n\nNous avons transmis votre plainte à l\'équipe de direction des urgences qui va examiner les circonstances de votre visite et prendre les mesures nécessaires pour améliorer nos délais de prise en charge.\n\nUn responsable vous contactera dans les 48 heures pour un suivi personnalisé.\n\nCordialement,\nService Qualité');
        setGeneratingResponse(false);
      }, 2000);
    } catch (error) {
      console.error('Erreur lors de la génération de la réponse IA:', error);
      setAiResponse('Erreur lors de la génération de la réponse IA.');
      setGeneratingResponse(false);
    }
  };

  const handleStatusChange = async (direction: 'next' | 'prev') => {
    if (!plainte || !id) return;
    
    const newStep = direction === 'next' 
      ? Math.min(currentStep + 1, STATUS_STEPS.length - 1)
      : Math.max(currentStep - 1, 0);
    
    const newStatus = STATUS_STEPS[newStep].id;
    
    try {
      setSaving(true);
      const response = await apiService.updatePlainte(parseInt(id), {
        statut: newStatus as any
      });
      
      if (response.success) {
        setCurrentStep(newStep);
        setCurrentStatus(newStatus);
        setPlainte(prev => prev ? { ...prev, statut: newStatus } : null);
        showNotification(`Statut mis à jour vers "${STATUS_STEPS[newStep].label}" ✅`);
      } else {
        showNotification('Erreur lors de la mise à jour du statut ❌');
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      showNotification('Erreur lors de la mise à jour du statut ❌');
    } finally {
      setSaving(false);
    }
  };

  const toggleEdit = (section: string) => {
    setEditingSection(editingSection === section ? null : section);
  };

  const cancelEdit = () => {
    setEditingSection(null);
  };

  const savePatientInfo = async () => {
    if (!plainte || !id) return;
    
    // Récupérer les valeurs des inputs
    const nomInput = document.querySelector('input[placeholder="Nom"]') as HTMLInputElement;
    const prenomInput = document.querySelector('input[placeholder="Prénom"]') as HTMLInputElement;
    const telephoneInput = document.querySelector('input[placeholder="Téléphone"]') as HTMLInputElement;
    
    const updatedData: any = {};
    
    if (nomInput?.value) updatedData.nom_plaignant = nomInput.value;
    if (prenomInput?.value) updatedData.prenom_plaignant = prenomInput.value;
    if (telephoneInput?.value) updatedData.telephone_plaignant = telephoneInput.value;
    
    if (Object.keys(updatedData).length === 0) {
      setEditingSection(null);
      return;
    }
    
    try {
      setSaving(true);
      const response = await apiService.updatePlainte(parseInt(id), updatedData);
      
      if (response.success) {
        setPlainte(prev => prev ? { 
          ...prev, 
          nom_plaignant: updatedData.nom_plaignant || prev.nom_plaignant,
          prenom_plaignant: updatedData.prenom_plaignant || prev.prenom_plaignant,
          telephone_plaignant: updatedData.telephone_plaignant || prev.telephone_plaignant
        } : null);
        setEditingSection(null);
        showNotification('Informations du patient mises à jour ✅');
      } else {
        showNotification('Erreur lors de la mise à jour ❌');
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour des infos patient:', error);
      showNotification('Erreur lors de la mise à jour ❌');
    } finally {
      setSaving(false);
    }
  };

  const saveProgress = async () => {
    if (!plainte || !id) return;
    
    const newStatus = STATUS_STEPS[currentStep].id;
    
    try {
      setSaving(true);
      const response = await apiService.updatePlainte(parseInt(id), {
        statut: newStatus as any
      });
      
      if (response.success) {
        setPlainte(prev => prev ? { ...prev, statut: newStatus } : null);
        setCurrentStatus(newStatus);
        setEditingSection(null);
        showNotification('Statut de progression mis à jour ✅');
      } else {
        showNotification('Erreur lors de la mise à jour ❌');
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      showNotification('Erreur lors de la mise à jour ❌');
    } finally {
      setSaving(false);
    }
  };

  const selectPriority = (priority: string) => {
    setCurrentPriority(priority);
  };

  const saveStatus = async () => {
    if (!plainte || !id) return;
    
    try {
      setSaving(true);
      const response = await apiService.updatePlainte(parseInt(id), {
        priorite: currentPriority
      });
      
      if (response.success) {
        setPlainte(prev => prev ? { ...prev, priorite: currentPriority } : null);
        setShowStatusModal(false);
        showNotification('Priorité mise à jour ✅');
      } else {
        showNotification('Erreur lors de la mise à jour de la priorité ❌');
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la priorité:', error);
      showNotification('Erreur lors de la mise à jour de la priorité ❌');
    } finally {
      setSaving(false);
    }
  };

  const saveManualResponse = () => {
    if (!manualResponse.trim()) {
      showNotification('Veuillez saisir une réponse');
      return;
    }
    
    // Sauvegarde locale uniquement (la colonne reponse_manuelle n'existe pas en BDD)
    setShowResponseEditor(false);
    showNotification('Réponse sauvegardée localement ✅');
  };

  const generateAIResponseAndFill = async () => {
    if (!plainte) return;
    
    try {
      setGeneratingResponse(true);
      // Simulation d'une réponse IA
      setTimeout(() => {
        const response = 'Cher(e) ' + plainte.nom_plaignant + ',\n\nNous vous remercions de nous avoir fait part de votre préoccupation. Nous allons examiner votre dossier avec attention et vous tenir informé(e) des suites données.\n\nCordialement,\nService Qualité';
        setManualResponse(response);
        setShowResponseEditor(true);
        showNotification('Réponse IA générée et ajoutée au rédacteur ✅');
        setGeneratingResponse(false);
      }, 2000);
    } catch (error) {
      console.error('Erreur lors de la génération de la réponse IA:', error);
      setGeneratingResponse(false);
    }
  };

  const showNotification = (message: string) => {
    // Créer une notification temporaire
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #51cf66, #40c057);
      color: white;
      padding: 15px 20px;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.1);
      z-index: 1001;
      font-weight: 600;
      transform: translateX(400px);
      transition: transform 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
    }, 100);

    setTimeout(() => {
      notification.style.transform = 'translateX(400px)';
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPriorityColor = (priority: string) => {
    const p = priority?.toUpperCase();
    switch (p) {
      case 'URGENT':
      case 'ELEVE':
      case 'HAUTE':
        return 'linear-gradient(135deg, #ef4444, #dc2626)';
      case 'MOYEN':
      case 'MOYENNE':
        return 'linear-gradient(135deg, #f59e0b, #d97706)';
      case 'BAS':
      case 'BASSE':
        return 'linear-gradient(135deg, #10b981, #059669)';
      default:
        return 'linear-gradient(135deg, #64748b, #475569)';
    }
  };

  const getStatusColor = (status: string) => {
    const s = status?.toUpperCase();
    switch (s) {
      case 'TRAITE':
        return 'linear-gradient(135deg, #10b981, #059669)';
      case 'EN_COURS':
        return 'linear-gradient(135deg, #3b82f6, #2563eb)';
      case 'CLOTURE':
        return 'linear-gradient(135deg, #64748b, #475569)';
      case 'RECU':
        return 'linear-gradient(135deg, #8b5cf6, #7c3aed)';
      default:
        return 'linear-gradient(135deg, #8b5cf6, #7c3aed)';
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '4px solid #f3f4f6',
            borderTop: '4px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px auto'
          }} />
          <p style={{ color: '#64748b', fontSize: '16px', margin: 0 }}>
            Chargement de la plainte...
          </p>
        </div>
      </div>
    );
  }

  if (!plainte) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <DocumentTextIcon style={{ fontSize: '48px', color: '#9ca3af', marginBottom: '16px' }} />
          <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#1f2937', marginBottom: '8px' }}>
            Plainte non trouvée
          </h2>
          <p style={{ color: '#6b7280', marginBottom: '24px' }}>
            La plainte demandée n'existe pas ou a été supprimée.
          </p>
          <button
            onClick={handleBack}
            style={{
              padding: '8px 16px',
              background: '#3b82f6',
              color: 'white',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              transition: 'background 0.2s ease'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = '#2563eb'}
            onMouseOut={(e) => e.currentTarget.style.background = '#3b82f6'}
          >
            Retour
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          background: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: '16px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
          border: '1px solid rgba(255,255,255,0.3)',
          padding: '24px',
          marginBottom: '32px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <button
                onClick={handleBack}
                style={{
                  width: '48px',
                  height: '48px',
                  background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                  borderRadius: '12px',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.4)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
                }}
              >
                <ArrowLeftIcon style={{ fontSize: '24px', color: 'white' }} />
              </button>
              <div>
                <h1 style={{
                  fontSize: '2rem',
                  fontWeight: 700,
                  color: '#1f2937',
                  margin: 0
                }}>
                  Plainte #{plainte.plainte_id}
                </h1>
                <p style={{
                  color: '#6b7280',
                  fontSize: '14px',
                  margin: 0
                }}>
                  Créée le {formatDate(plainte.date_creation)}
                </p>
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{
                padding: '8px 16px',
                borderRadius: '24px',
                fontSize: '14px',
                fontWeight: 600,
                color: 'white',
                background: getPriorityColor(plainte.priorite)
              }}>
                {plainte.priorite}
              </span>
              <span style={{
                padding: '8px 16px',
                borderRadius: '24px',
                fontSize: '14px',
                fontWeight: 600,
                color: 'white',
                background: getStatusColor(plainte.statut)
              }}>
                {STATUS_STEPS.find(s => s.id === plainte.statut)?.label}
              </span>
              <button
                onClick={() => setShowStatusModal(true)}
                style={{
                  width: '32px',
                  height: '32px',
                  color: '#3b82f6',
                  background: 'rgba(59, 130, 246, 0.1)',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(59, 130, 246, 0.2)'}
                onMouseOut={(e) => e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)'}
                title="Modifier le statut"
              >
                <PencilIcon style={{ fontSize: '16px' }} />
              </button>
            </div>
          </div>
        </div>

        {/* Contenu principal */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '32px' }}>
          {/* Colonne principale */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Informations de base */}
            <div style={{
              background: 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(20px)',
              borderRadius: '16px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
              border: '1px solid rgba(255,255,255,0.3)',
              padding: '32px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                <h2 style={{
                  fontSize: '20px',
                  fontWeight: 700,
                  color: '#1f2937',
                  margin: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <DocumentTextIcon style={{ fontSize: '24px', color: '#3b82f6' }} />
                  Informations de la plainte
                </h2>
                <button
                  onClick={() => toggleEdit('complaint-info')}
                  style={{
                    width: '32px',
                    height: '32px',
                    color: '#3b82f6',
                    background: 'rgba(59, 130, 246, 0.1)',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = 'rgba(59, 130, 246, 0.2)'}
                  onMouseOut={(e) => e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)'}
                  title="Modifier"
                >
                  <PencilIcon style={{ fontSize: '16px' }} />
                </button>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#6b7280',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginBottom: '8px'
                  }}>
                    Titre
                  </label>
                  <p style={{ fontSize: '18px', fontWeight: 600, color: '#1f2937', margin: 0 }}>
                    {plainte.titre}
                  </p>
                </div>
                
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#6b7280',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginBottom: '8px'
                  }}>
                    Service
                  </label>
                  <p style={{ fontSize: '18px', fontWeight: 600, color: '#1f2937', margin: 0 }}>
                    {typeof plainte.service === 'object' && plainte.service !== null 
                      ? plainte.service.nom 
                      : plainte.service || 'Non défini'}
                  </p>
                </div>
              </div>
              
              <div style={{
                background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                padding: '24px',
                borderRadius: '12px',
                borderLeft: '4px solid #3b82f6'
              }}>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#6b7280',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: '12px'
                }}>
                  Description
                </label>
                <p style={{ color: '#374151', lineHeight: 1.6, margin: 0 }}>
                  {plainte.description}
                </p>
              </div>
            </div>

            {/* Progression du statut */}
            <div style={{
              background: 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(20px)',
              borderRadius: '16px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
              border: '1px solid rgba(255,255,255,0.3)',
              padding: '32px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                <h2 style={{
                  fontSize: '20px',
                  fontWeight: 700,
                  color: '#1f2937',
                  margin: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <ClockIcon style={{ fontSize: '24px', color: '#3b82f6' }} />
                  Progression du traitement
                </h2>
                <button
                  onClick={() => toggleEdit('progress')}
                  style={{
                    width: '32px',
                    height: '32px',
                    color: '#3b82f6',
                    background: 'rgba(59, 130, 246, 0.1)',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = 'rgba(59, 130, 246, 0.2)'}
                  onMouseOut={(e) => e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)'}
                  title="Modifier le statut"
                >
                  <PencilIcon style={{ fontSize: '16px' }} />
                </button>
              </div>
              
              {editingSection !== 'progress' ? (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', marginBottom: '32px' }}>
                    <div style={{
                      position: 'absolute',
                      top: '50%',
                      left: '48px',
                      right: '48px',
                      height: '4px',
                      background: 'linear-gradient(90deg, #3b82f6, #3b82f6)',
                      borderRadius: '2px',
                      transform: 'translateY(-50%)'
                    }} />
                    {STATUS_STEPS.map((step, index) => (
                      <div key={step.id} style={{ position: 'relative', zIndex: 10 }}>
                        <div style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '18px',
                          fontWeight: 600,
                          background: index <= currentStep 
                            ? 'linear-gradient(135deg, #3b82f6, #2563eb)' 
                            : '#f1f5f9',
                          color: index <= currentStep ? 'white' : '#9ca3af',
                          border: index <= currentStep ? 'none' : '2px solid #e5e7eb',
                          boxShadow: index <= currentStep ? '0 4px 12px rgba(59, 130, 246, 0.3)' : 'none'
                        }}>
                          {step.icon}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#6b7280' }}>
                    {STATUS_STEPS.map(step => (
                      <span key={step.id}>{step.label}</span>
                    ))}
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: '#6b7280',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      marginBottom: '8px'
                    }}>
                      Changer le statut
                    </label>
                    
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', marginBottom: '16px' }}>
                      <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '40px',
                        right: '40px',
                        height: '2px',
                        background: '#e5e7eb',
                        borderRadius: '1px',
                        transform: 'translateY(-50%)'
                      }} />
                      {STATUS_STEPS.map((step, index) => (
                        <div key={step.id} style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '12px',
                            fontWeight: 700,
                            background: index < currentStep 
                              ? '#10b981'
                              : index === currentStep
                              ? '#3b82f6'
                              : '#e5e7eb',
                            color: index <= currentStep ? 'white' : '#6b7280',
                            border: index <= currentStep ? 'none' : '2px solid #d1d5db',
                            boxShadow: index <= currentStep ? '0 2px 8px rgba(59, 130, 246, 0.3)' : 'none'
                          }}>
                            {index + 1}
                          </div>
                          
                          <span style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px', fontWeight: 500 }}>
                            {step.label}
                          </span>
                        </div>
                      ))}
                    </div>
                    
                    <div style={{ textAlign: 'center', marginBottom: '12px' }}>
                      <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
                        Étape {currentStep + 1} sur {STATUS_STEPS.length} - {STATUS_STEPS[currentStep].label}
                      </p>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                      <button
                        onClick={() => handleStatusChange('prev')}
                        disabled={currentStep === 0}
                        style={{
                          flex: 1,
                          padding: '8px 12px',
                          background: '#f1f5f9',
                          color: '#475569',
                          borderRadius: '8px',
                          fontSize: '14px',
                          fontWeight: 500,
                          border: 'none',
                          cursor: currentStep === 0 ? 'not-allowed' : 'pointer',
                          opacity: currentStep === 0 ? 0.5 : 1,
                          transition: 'all 0.2s ease',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '4px'
                        }}
                        onMouseOver={(e) => {
                          if (currentStep > 0) e.currentTarget.style.background = '#e2e8f0';
                        }}
                        onMouseOut={(e) => {
                          if (currentStep > 0) e.currentTarget.style.background = '#f1f5f9';
                        }}
                      >
                        <ArrowLeftIcon style={{ fontSize: '12px' }} />
                        Précédent
                      </button>
                      
                      <button
                        onClick={() => handleStatusChange('next')}
                        disabled={currentStep === STATUS_STEPS.length - 1}
                        style={{
                          flex: 1,
                          padding: '8px 12px',
                          background: currentStep === STATUS_STEPS.length - 1 ? '#f1f5f9' : '#3b82f6',
                          color: currentStep === STATUS_STEPS.length - 1 ? '#475569' : 'white',
                          borderRadius: '8px',
                          fontSize: '14px',
                          fontWeight: 500,
                          border: 'none',
                          cursor: currentStep === STATUS_STEPS.length - 1 ? 'not-allowed' : 'pointer',
                          opacity: currentStep === STATUS_STEPS.length - 1 ? 0.5 : 1,
                          transition: 'all 0.2s ease',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '4px'
                        }}
                        onMouseOver={(e) => {
                          if (currentStep < STATUS_STEPS.length - 1) e.currentTarget.style.background = '#2563eb';
                        }}
                        onMouseOut={(e) => {
                          if (currentStep < STATUS_STEPS.length - 1) e.currentTarget.style.background = '#3b82f6';
                        }}
                      >
                        Suivant
                        <ArrowRightIcon style={{ fontSize: '12px' }} />
                      </button>
                    </div>
                  </div>
                  
                  <button
                    onClick={saveProgress}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      background: 'linear-gradient(135deg, #10b981, #059669)',
                      color: 'white',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: 600,
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = 'linear-gradient(135deg, #059669, #047857)'}
                    onMouseOut={(e) => e.currentTarget.style.background = 'linear-gradient(135deg, #10b981, #059669)'}
                  >
                    <CheckIcon style={{ fontSize: '16px' }} />
                    Sauvegarder
                  </button>
                </div>
              )}
            </div>

            {/* Réponse IA */}
            <div style={{
              background: 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(20px)',
              borderRadius: '16px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
              border: '1px solid rgba(255,255,255,0.3)',
              padding: '32px'
            }}>
              <h2 style={{
                fontSize: '20px',
                fontWeight: 700,
                color: '#1f2937',
                margin: '0 0 24px 0',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <SparklesIcon style={{ fontSize: '24px', color: '#3b82f6' }} />
                Rédaction de réponse
              </h2>
              
              <div style={{
                background: '#f8fafc',
                borderRadius: '12px',
                padding: '24px'
              }}>
                <p style={{ marginBottom: '16px', color: '#475569' }}>
                  Rédigez une réponse personnalisée ou utilisez l'IA pour générer une réponse basée sur les meilleures pratiques.
                </p>
                
                {!showResponseEditor ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <button
                      onClick={() => setShowResponseEditor(true)}
                      style={{
                        width: '100%',
                        background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                        color: 'white',
                        padding: '12px 24px',
                        borderRadius: '12px',
                        fontWeight: 600,
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.background = 'linear-gradient(135deg, #2563eb, #1d4ed8)'}
                      onMouseOut={(e) => e.currentTarget.style.background = 'linear-gradient(135deg, #3b82f6, #2563eb)'}
                    >
                      <PencilIcon style={{ fontSize: '20px' }} />
                      Rédiger une réponse manuelle
                    </button>
                    
                    <button
                      onClick={generateAIResponseAndFill}
                      disabled={generatingResponse}
                      style={{
                        width: '100%',
                        background: generatingResponse ? '#9ca3af' : 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                        color: 'white',
                        padding: '12px 24px',
                        borderRadius: '12px',
                        fontWeight: 600,
                        border: 'none',
                        cursor: generatingResponse ? 'not-allowed' : 'pointer',
                        opacity: generatingResponse ? 0.5 : 1,
                        transition: 'all 0.3s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                      }}
                      onMouseOver={(e) => {
                        if (!generatingResponse) e.currentTarget.style.background = 'linear-gradient(135deg, #7c3aed, #6d28d9)';
                      }}
                      onMouseOut={(e) => {
                        if (!generatingResponse) e.currentTarget.style.background = 'linear-gradient(135deg, #8b5cf6, #7c3aed)';
                      }}
                    >
                      {generatingResponse ? (
                        <div style={{
                          width: '20px',
                          height: '20px',
                          border: '2px solid #f3f4f6',
                          borderTop: '2px solid #8b5cf6',
                          borderRadius: '50%',
                          animation: 'spin 1s linear infinite'
                        }} />
                      ) : (
                        <SparklesIcon style={{ fontSize: '20px' }} />
                      )}
                      {generatingResponse ? 'Génération en cours...' : 'Générer avec l\'IA'}
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <textarea
                      value={manualResponse}
                      onChange={(e) => setManualResponse(e.target.value)}
                      placeholder="Rédigez votre réponse ici..."
                      style={{
                        width: '100%',
                        height: '128px',
                        padding: '16px',
                        background: 'white',
                        border: '1px solid #d1d5db',
                        borderRadius: '12px',
                        color: '#1f2937',
                        fontSize: '14px',
                        fontFamily: 'inherit',
                        resize: 'none',
                        outline: 'none',
                        transition: 'border-color 0.2s ease'
                      }}
                      onFocus={(e) => e.currentTarget.style.borderColor = '#3b82f6'}
                      onBlur={(e) => e.currentTarget.style.borderColor = '#d1d5db'}
                    />
                    
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button
                        onClick={saveManualResponse}
                        style={{
                          flex: 1,
                          background: 'linear-gradient(135deg, #10b981, #059669)',
                          color: 'white',
                          padding: '8px 16px',
                          borderRadius: '12px',
                          fontWeight: 600,
                          border: 'none',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.background = 'linear-gradient(135deg, #059669, #047857)'}
                        onMouseOut={(e) => e.currentTarget.style.background = 'linear-gradient(135deg, #10b981, #059669)'}
                      >
                        <CheckIcon style={{ fontSize: '16px' }} />
                        Sauvegarder
                      </button>
                      
                      <button
                        onClick={() => setShowResponseEditor(false)}
                        style={{
                          flex: 1,
                          background: 'linear-gradient(135deg, #f1f5f9, #e2e8f0)',
                          color: '#475569',
                          padding: '8px 16px',
                          borderRadius: '12px',
                          fontWeight: 600,
                          border: 'none',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.background = 'linear-gradient(135deg, #e2e8f0, #cbd5e1)'}
                        onMouseOut={(e) => e.currentTarget.style.background = 'linear-gradient(135deg, #f1f5f9, #e2e8f0)'}
                      >
                        <XMarkIcon style={{ fontSize: '16px' }} />
                        Annuler
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Informations du patient */}
            <div style={{
              background: 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(20px)',
              borderRadius: '16px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
              border: '1px solid rgba(255,255,255,0.3)',
              padding: '24px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <UserIcon style={{ fontSize: '24px', color: '#3b82f6' }} />
                  <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#1f2937', margin: 0 }}>
                    Patient
                  </h2>
                </div>
                <button
                  onClick={() => toggleEdit('patient-info')}
                  style={{
                    width: '32px',
                    height: '32px',
                    color: '#3b82f6',
                    background: 'rgba(59, 130, 246, 0.1)',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = 'rgba(59, 130, 246, 0.2)'}
                  onMouseOut={(e) => e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)'}
                  title="Modifier"
                >
                  <PencilIcon style={{ fontSize: '16px' }} />
                </button>
              </div>
              
              {editingSection !== 'patient-info' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: '#6b7280',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      marginBottom: '4px'
                    }}>
                      Nom
                    </label>
                    <p style={{ fontSize: '16px', fontWeight: 600, color: '#1f2937', margin: 0 }}>
                      {plainte.nom_plaignant?.split(' ')[0] || ''}
                    </p>
                  </div>
                  
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: '#6b7280',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      marginBottom: '4px'
                    }}>
                      Prénom
                    </label>
                    <p style={{ fontSize: '16px', fontWeight: 600, color: '#1f2937', margin: 0 }}>
                      {plainte.nom_plaignant?.split(' ').slice(1).join(' ') || ''}
                    </p>
                  </div>
                  
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: '#6b7280',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      marginBottom: '4px'
                    }}>
                      Téléphone
                    </label>
                    <p style={{ fontSize: '16px', fontWeight: 600, color: '#1f2937', margin: 0 }}>
                      {plainte.telephone_plaignant}
                    </p>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: '#6b7280',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      marginBottom: '4px'
                    }}>
                      Nom
                    </label>
                    <input
                      type="text"
                      defaultValue={plainte.nom_plaignant?.split(' ')[0] || ''}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '14px',
                        outline: 'none',
                        transition: 'border-color 0.2s ease'
                      }}
                      onFocus={(e) => e.currentTarget.style.borderColor = '#3b82f6'}
                      onBlur={(e) => e.currentTarget.style.borderColor = '#d1d5db'}
                    />
                  </div>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: '#6b7280',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      marginBottom: '4px'
                    }}>
                      Prénom
                    </label>
                    <input
                      type="text"
                      defaultValue={plainte.nom_plaignant?.split(' ').slice(1).join(' ') || ''}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '14px',
                        outline: 'none',
                        transition: 'border-color 0.2s ease'
                      }}
                      onFocus={(e) => e.currentTarget.style.borderColor = '#3b82f6'}
                      onBlur={(e) => e.currentTarget.style.borderColor = '#d1d5db'}
                    />
                  </div>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: '#6b7280',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      marginBottom: '4px'
                    }}>
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      defaultValue={plainte.telephone_plaignant}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '14px',
                        outline: 'none',
                        transition: 'border-color 0.2s ease'
                      }}
                      onFocus={(e) => e.currentTarget.style.borderColor = '#3b82f6'}
                      onBlur={(e) => e.currentTarget.style.borderColor = '#d1d5db'}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '12px', paddingTop: '8px' }}>
                    <button
                      onClick={savePatientInfo}
                      style={{
                        flex: 1,
                        padding: '8px 12px',
                        background: 'linear-gradient(135deg, #10b981, #059669)',
                        color: 'white',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: 600,
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.background = 'linear-gradient(135deg, #059669, #047857)';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.background = 'linear-gradient(135deg, #10b981, #059669)';
                        e.currentTarget.style.transform = 'translateY(0px)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      <CheckIcon style={{ fontSize: '16px' }} />
                      Sauvegarder
                    </button>
                    <button
                      onClick={cancelEdit}
                      style={{
                        flex: 1,
                        padding: '8px 12px',
                        background: 'linear-gradient(135deg, #f1f5f9, #e2e8f0)',
                        color: '#475569',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: 600,
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.background = 'linear-gradient(135deg, #e2e8f0, #cbd5e1)';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(148, 163, 184, 0.3)';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.background = 'linear-gradient(135deg, #f1f5f9, #e2e8f0)';
                        e.currentTarget.style.transform = 'translateY(0px)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      <XMarkIcon style={{ fontSize: '16px' }} />
                      Annuler
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Documents */}
            <div style={{
              background: 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(20px)',
              borderRadius: '16px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
              border: '1px solid rgba(255,255,255,0.3)',
              padding: '32px'
            }}>
              <h2 style={{
                fontSize: '20px',
                fontWeight: 700,
                color: '#1f2937',
                margin: '0 0 24px 0',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <DocumentIcon style={{ fontSize: '24px', color: '#3b82f6' }} />
                Documents liés ({documents.length + (pdfRapport ? 1 : 0)})
              </h2>
              
              {/* PDF Rapport généré */}
              {pdfRapport && (
                <div style={{ marginBottom: '16px' }}>
                  <h3 style={{ 
                    fontSize: '14px', 
                    fontWeight: 600, 
                    color: '#059669', 
                    marginBottom: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    📄 Rapport PDF généré
                  </h3>
                  <div 
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '16px',
                      padding: '16px',
                      background: 'linear-gradient(135deg, #ecfdf5, #d1fae5)',
                      borderRadius: '12px',
                      border: '1px solid #a7f3d0',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      flexWrap: 'wrap'
                    }}
                    onClick={downloadPdfRapport}
                    onMouseOver={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(5, 150, 105, 0.2)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: '1', minWidth: '200px' }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        minWidth: '40px',
                        background: '#059669',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '18px'
                      }}>
                        📊
                      </div>
                      <div style={{ overflow: 'hidden', flex: 1 }}>
                        <p style={{ 
                          margin: 0, 
                          fontWeight: 600, 
                          color: '#065f46',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {pdfRapport.nom_fichier}
                        </p>
                        <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#047857' }}>
                          Créé le {new Date(pdfRapport.date_creation).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    </div>
                    <button
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '8px 16px',
                        background: '#059669',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        flexShrink: 0,
                        fontSize: '13px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.background = '#047857'}
                      onMouseOut={(e) => e.currentTarget.style.background = '#059669'}
                    >
                      <ArrowDownTrayIcon style={{ fontSize: '16px' }} />
                      Télécharger
                    </button>
                  </div>
                </div>
              )}

              {/* Documents pièces jointes */}
              {documents.length > 0 ? (
                <div>
                  <h3 style={{ 
                    fontSize: '14px', 
                    fontWeight: 600, 
                    color: '#3b82f6', 
                    marginBottom: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    📎 Pièces jointes ({documents.length})
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {documents.map((doc) => (
                      <div 
                        key={doc.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '16px',
                          padding: '16px',
                          background: '#f8fafc',
                          borderRadius: '12px',
                          border: '1px solid #e2e8f0',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          flexWrap: 'wrap',
                          overflow: 'hidden'
                        }}
                        onClick={() => downloadDocument(doc)}
                        onMouseOver={(e) => {
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                          e.currentTarget.style.background = '#f1f5f9';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = 'none';
                          e.currentTarget.style.background = '#f8fafc';
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: '1', minWidth: '200px', overflow: 'hidden' }}>
                          <div style={{
                            width: '40px',
                            height: '40px',
                            minWidth: '40px',
                            background: doc.type_fichier === 'PDF' ? '#ef4444' : 
                                        doc.type_fichier === 'IMAGE' ? '#8b5cf6' : 
                                        doc.type_fichier === 'DOC' || doc.type_fichier === 'DOCX' ? '#3b82f6' : '#6b7280',
                            borderRadius: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: '14px',
                            fontWeight: 700
                          }}>
                            {doc.type_fichier === 'PDF' ? 'PDF' : 
                             doc.type_fichier === 'IMAGE' ? '🖼️' : 
                             doc.type_fichier === 'DOC' || doc.type_fichier === 'DOCX' ? 'DOC' : 
                             doc.type_fichier === 'TXT' ? 'TXT' : '📄'}
                          </div>
                          <div style={{ overflow: 'hidden', flex: 1 }}>
                            <p style={{ 
                              margin: 0, 
                              fontWeight: 600, 
                              color: '#1f2937',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}>
                              {doc.nom_fichier}
                            </p>
                            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#6b7280', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '4px' }}>
                              <span>{formatFileSize(doc.taille_fichier)} • {doc.date_upload ? new Date(doc.date_upload).toLocaleDateString('fr-FR') : 'N/A'}</span>
                              {doc.est_piece_jointe_originale && (
                                <span style={{ 
                                  padding: '2px 6px', 
                                  background: '#dbeafe', 
                                  color: '#1d4ed8', 
                                  borderRadius: '4px',
                                  fontSize: '10px',
                                  fontWeight: 600
                                }}>
                                  Original
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                          <button
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '8px 12px',
                              background: '#3b82f6',
                              color: 'white',
                              border: 'none',
                              borderRadius: '8px',
                              fontSize: '13px',
                              fontWeight: 600,
                              cursor: 'pointer',
                              transition: 'all 0.2s ease'
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              downloadDocument(doc);
                            }}
                            onMouseOver={(e) => e.currentTarget.style.background = '#2563eb'}
                            onMouseOut={(e) => e.currentTarget.style.background = '#3b82f6'}
                          >
                            <ArrowDownTrayIcon style={{ fontSize: '16px' }} />
                          </button>
                          <button
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '8px 12px',
                              background: '#f1f5f9',
                              color: '#475569',
                              border: '1px solid #e2e8f0',
                              borderRadius: '8px',
                              fontSize: '13px',
                              fontWeight: 600,
                              cursor: 'pointer',
                              transition: 'all 0.2s ease'
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              downloadDocument(doc);
                            }}
                            onMouseOver={(e) => e.currentTarget.style.background = '#e2e8f0'}
                            onMouseOut={(e) => e.currentTarget.style.background = '#f1f5f9'}
                          >
                            <EyeIcon style={{ fontSize: '16px' }} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : !pdfRapport ? (
                <div style={{ textAlign: 'center', color: '#6b7280', padding: '32px 0' }}>
                  <div style={{ fontSize: '48px', marginBottom: '12px' }}>📂</div>
                  <p style={{ margin: 0 }}>Aucun document lié pour le moment.</p>
                  <p style={{ margin: '8px 0 0 0', fontSize: '13px', color: '#9ca3af' }}>
                    Les documents seront affichés ici une fois ajoutés à la plainte.
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {/* Modal de changement de statut */}
        {showStatusModal && (
          <div 
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 50
            }}
            onClick={() => setShowStatusModal(false)}
          >
            <div 
              style={{
                background: 'white',
                borderRadius: '16px',
                boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
                maxWidth: '400px',
                width: '100%',
                margin: '16px'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '24px',
                borderBottom: '1px solid #e5e7eb'
              }}>
                <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#1f2937', margin: 0 }}>
                  Modifier la priorité
                </h2>
                <button
                  onClick={() => setShowStatusModal(false)}
                  style={{
                    width: '32px',
                    height: '32px',
                    color: '#9ca3af',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'color 0.2s ease'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.color = '#6b7280'}
                  onMouseOut={(e) => e.currentTarget.style.color = '#9ca3af'}
                >
                  <XMarkIcon style={{ fontSize: '20px' }} />
                </button>
              </div>
              
              <div style={{ padding: '24px' }}>
                <div style={{ marginBottom: '24px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#6b7280',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginBottom: '12px'
                  }}>
                    Priorité
                  </label>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                      onClick={() => selectPriority('URGENT')}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '24px',
                        fontSize: '14px',
                        fontWeight: 600,
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        background: currentPriority === 'URGENT' 
                          ? 'linear-gradient(135deg, #ef4444, #dc2626)' 
                          : '#f1f5f9',
                        color: currentPriority === 'URGENT' ? 'white' : '#6b7280',
                        transform: currentPriority === 'URGENT' ? 'scale(1.05)' : 'scale(1)',
                        boxShadow: currentPriority === 'URGENT' ? '0 4px 12px rgba(239, 68, 68, 0.3)' : 'none'
                      }}
                      onMouseOver={(e) => {
                        if (currentPriority !== 'URGENT') e.currentTarget.style.background = '#e2e8f0';
                      }}
                      onMouseOut={(e) => {
                        if (currentPriority !== 'URGENT') e.currentTarget.style.background = '#f1f5f9';
                      }}
                    >
                      Urgent
                    </button>
                    <button
                      onClick={() => selectPriority('MOYEN')}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '24px',
                        fontSize: '14px',
                        fontWeight: 600,
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        background: currentPriority === 'MOYEN' 
                          ? 'linear-gradient(135deg, #f59e0b, #d97706)' 
                          : '#f1f5f9',
                        color: currentPriority === 'MOYEN' ? 'white' : '#6b7280',
                        transform: currentPriority === 'MOYEN' ? 'scale(1.05)' : 'scale(1)',
                        boxShadow: currentPriority === 'MOYEN' ? '0 4px 12px rgba(245, 158, 11, 0.3)' : 'none'
                      }}
                      onMouseOver={(e) => {
                        if (currentPriority !== 'MOYEN') e.currentTarget.style.background = '#e2e8f0';
                      }}
                      onMouseOut={(e) => {
                        if (currentPriority !== 'MOYEN') e.currentTarget.style.background = '#f1f5f9';
                      }}
                    >
                      Moyen
                    </button>
                    <button
                      onClick={() => selectPriority('BAS')}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '24px',
                        fontSize: '14px',
                        fontWeight: 600,
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        background: currentPriority === 'BAS' 
                          ? 'linear-gradient(135deg, #10b981, #059669)' 
                          : '#f1f5f9',
                        color: currentPriority === 'BAS' ? 'white' : '#6b7280',
                        transform: currentPriority === 'BAS' ? 'scale(1.05)' : 'scale(1)',
                        boxShadow: currentPriority === 'BAS' ? '0 4px 12px rgba(16, 185, 129, 0.3)' : 'none'
                      }}
                      onMouseOver={(e) => {
                        if (currentPriority !== 'BAS') e.currentTarget.style.background = '#e2e8f0';
                      }}
                      onMouseOut={(e) => {
                        if (currentPriority !== 'BAS') e.currentTarget.style.background = '#f1f5f9';
                      }}
                    >
                      Bas
                    </button>
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    onClick={saveStatus}
                    style={{
                      flex: 1,
                      padding: '12px 16px',
                      background: 'linear-gradient(135deg, #10b981, #059669)',
                      color: 'white',
                      borderRadius: '12px',
                      fontWeight: 600,
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(135deg, #059669, #047857)';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(135deg, #10b981, #059669)';
                      e.currentTarget.style.transform = 'translateY(0px)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                    title="Sauvegarder"
                  >
                    <CheckIcon style={{ fontSize: '20px' }} />
                  </button>
                  <button
                    onClick={() => setShowStatusModal(false)}
                    style={{
                      flex: 1,
                      padding: '12px 16px',
                      background: 'linear-gradient(135deg, #f1f5f9, #e2e8f0)',
                      color: '#475569',
                      borderRadius: '12px',
                      fontWeight: 600,
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(135deg, #e2e8f0, #cbd5e1)';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(148, 163, 184, 0.3)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(135deg, #f1f5f9, #e2e8f0)';
                      e.currentTarget.style.transform = 'translateY(0px)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                    title="Annuler"
                  >
                    <XMarkIcon style={{ fontSize: '20px' }} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlaintesDetail;