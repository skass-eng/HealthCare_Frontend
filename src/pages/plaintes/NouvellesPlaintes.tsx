'use client';

import { useState } from 'react';
import { PlusIcon, CloudArrowUpIcon, FolderOpenIcon } from '@heroicons/react/24/outline';
import { DocumentTextIcon } from '@heroicons/react/24/solid';
import ManualFormPanel from '../../components/ManualFormPanel';
import PdfUploadPanel from '../../components/PdfUploadPanel';
import PhotoUploadPanel from '../../components/PhotoUploadPanel';
import ArchiveUploadPanel from '../../components/ArchiveUploadPanel';
import { apiService } from '../../lib/api';
import { toast } from 'sonner';

export default function NouvellesPlaintesPage() {
  const [activePanel, setActivePanel] = useState<'manual' | 'pdf' | 'photo' | 'archive' | null>('manual');
  const [loading, setLoading] = useState(false);

  const handleCreatePlainte = async (plainteData: any) => {
    try {
      setLoading(true);
      
      // Vérifier si la plainte a déjà été créée (cas du PdfUploadPanel qui crée directement)
      // Dans ce cas, plainteData contient { success: true, plainte: {...}, ... }
      if (plainteData.success && plainteData.plainte) {
        console.log('✅ Plainte déjà créée via PdfUploadPanel:', plainteData.plainte);
        const plainteId = plainteData.plainte.numero_plainte || plainteData.plainte.id || 'N/A';
        toast.success(`🎉 Plainte n°${plainteId} créée avec succès ! Les analyses IA sont en cours...`);
        
        // Fermer le panel
        setActivePanel(null);
        
        // Afficher des informations sur le processus
        if (plainteData.analyse_ia?.statut === 'en_cours') {
          toast.info('🤖 Analyse IA et classification automatique en cours...', { duration: 5000 });
        }
        
        setLoading(false);
        return;
      }
      
      // Préparer les données de la plainte selon le schéma attendu
      const plainteCreateData = {
        titre: plainteData.titre,
        description: plainteData.contenu || plainteData.description, // Support pour différents noms de champ
        service_id: plainteData.service_id,
        date_incident: plainteData.date_incident,
        nom_plaignant: plainteData.nom_plaignant,
        prenom_plaignant: plainteData.prenom_plaignant,
        email_plaignant: plainteData.email_plaignant,
        telephone_plaignant: plainteData.telephone_plaignant,
        mode_reception: plainteData.mode_reception || 'manuel',
        assigned_user_id: plainteData.assigned_user,
        trigger_analyses: true // Toujours déclencher les analyses automatiques
      };

      console.log('Création de plainte avec données:', plainteCreateData);

      // Extraire les documents s'ils existent
      const documents = plainteData.documents || [];

      // Créer la plainte avec les documents
      const response = await apiService.createPlainte(plainteCreateData, documents);
      
      if (response.success && response.data) {
        const plainteId = response.data.id || response.data.numero_plainte || 'N/A';
        toast.success(`🎉 Plainte n°${plainteId} créée avec succès ! Les analyses IA sont en cours...`);
        
        // Fermer le panel
        setActivePanel(null);
        
        // Optionnel : Rediriger vers la plainte créée
        console.log('Plainte créée:', response.data);
        
        // Optionnel : Afficher des informations sur le processus
        toast.info('📄 Génération du PDF en cours...', { duration: 3000 });
        toast.info('🤖 Analyse IA et classification automatique en cours...', { duration: 5000 });
        
      } else {
        toast.error('❌ Erreur lors de la création de la plainte');
      }
    } catch (error) {
      console.error('Erreur lors de la création:', error);
      toast.error('❌ Erreur lors de la création de la plainte. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const handlePanelClose = () => {
    setActivePanel(null); // Retour à aucun panel actif
  };

  // Définition centralisée des options - palette Mercury Warm
  type Option = {
    id: 'manual' | 'pdf' | 'photo' | 'archive';
    title: string;
    description: string;
    cta: string;
    accent: string;          // teal / emerald / amber / slate accent
    accentBgTint: string;    // bg quand actif
    accentBorderTint: string;// border quand actif
    Icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
    badge?: string;
  };

  const options: Option[] = [
    {
      id: 'manual',
      title: 'Formulaire manuel',
      description: 'Saisissez directement les informations de votre plainte',
      cta: 'Commencer',
      accent: '#0d9488',
      accentBgTint: 'rgba(13, 148, 136, 0.08)',
      accentBorderTint: 'rgba(13, 148, 136, 0.40)',
      Icon: PlusIcon
    },
    {
      id: 'pdf',
      title: 'Import PDF',
      description: 'Importez un document PDF pour extraction automatique',
      cta: 'Uploader',
      accent: '#059669',
      accentBgTint: 'rgba(5, 150, 105, 0.08)',
      accentBorderTint: 'rgba(5, 150, 105, 0.40)',
      Icon: CloudArrowUpIcon
    },
    {
      id: 'photo',
      title: 'Import photo',
      description: 'Importez une photo de plainte pour analyse automatique',
      cta: 'Importer',
      accent: '#0891b2',
      accentBgTint: 'rgba(8, 145, 178, 0.08)',
      accentBorderTint: 'rgba(8, 145, 178, 0.40)',
      Icon: ({ className, style }) => (
        <svg className={className} style={style} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      id: 'archive',
      title: 'Depuis archive',
      description: 'Importez un dossier complet de plaintes archivées',
      cta: 'Parcourir',
      accent: '#b45309',
      accentBgTint: 'rgba(180, 83, 9, 0.08)',
      accentBorderTint: 'rgba(180, 83, 9, 0.40)',
      Icon: FolderOpenIcon,
      badge: 'Nouveau'
    }
  ];

  return (
    <div style={{ background: '#f5f5f7', padding: '24px', minHeight: '100%' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', paddingTop: '8px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '48px',
            height: '48px',
            background: '#ffffff',
            border: '1px solid #ebebef',
            borderRadius: '12px',
            boxShadow: '0 1px 2px rgba(16, 24, 40, 0.04), 0 1px 3px rgba(16, 24, 40, 0.06)',
            marginBottom: '14px'
          }}>
            <DocumentTextIcon className="w-6 h-6" style={{ color: '#0d9488' }} />
          </div>
          <h1 style={{
            fontSize: '1.75rem',
            fontWeight: 700,
            color: '#1d1d1f',
            letterSpacing: '-0.025em',
            margin: '0 0 6px 0'
          }}>
            Création de plaintes
          </h1>
          <p style={{ color: '#86868b', fontSize: '13px', maxWidth: '40rem', margin: '0 auto' }}>
            Choisissez votre méthode préférée pour créer une nouvelle plainte
          </p>
        </div>

        {/* Options */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
          {options.map((opt) => {
            const isActive = activePanel === opt.id;
            return (
              <div
                key={opt.id}
                onClick={() => setActivePanel(opt.id)}
                style={{
                  position: 'relative',
                  cursor: 'pointer',
                  background: isActive ? opt.accentBgTint : '#ffffff',
                  border: isActive ? `1px solid ${opt.accentBorderTint}` : '1px solid #ebebef',
                  borderRadius: '14px',
                  padding: '20px',
                  boxShadow: isActive
                    ? `0 0 0 3px ${opt.accentBgTint}, 0 1px 3px rgba(16, 24, 40, 0.06)`
                    : '0 1px 2px rgba(16, 24, 40, 0.04), 0 1px 3px rgba(16, 24, 40, 0.06)',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  flexDirection: 'column'
                }}
                onMouseOver={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.borderColor = '#cbd5e1';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }
                }}
                onMouseOut={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.borderColor = '#ebebef';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }
                }}
              >
                {opt.badge && (
                  <span style={{
                    position: 'absolute',
                    top: '-8px',
                    right: '12px',
                    padding: '2px 8px',
                    background: '#0d9488',
                    color: '#ffffff',
                    fontSize: '10px',
                    fontWeight: 700,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    borderRadius: '999px',
                    boxShadow: '0 1px 3px rgba(13, 148, 136, 0.3)'
                  }}>
                    {opt.badge}
                  </span>
                )}

                <div style={{ textAlign: 'center', marginBottom: '12px' }}>
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '40px',
                    height: '40px',
                    background: opt.accentBgTint,
                    border: `1px solid ${opt.accentBorderTint}`,
                    borderRadius: '10px',
                    marginBottom: '10px'
                  }}>
                    <opt.Icon className="w-5 h-5" style={{ color: opt.accent }} />
                  </div>
                  <h3 style={{
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    color: '#1d1d1f',
                    margin: 0,
                    letterSpacing: '-0.01em'
                  }}>
                    {opt.title}
                  </h3>
                </div>

                <p style={{
                  fontSize: '12px',
                  color: '#86868b',
                  textAlign: 'center',
                  lineHeight: 1.45,
                  margin: '0 0 16px 0',
                  flex: 1
                }}>
                  {opt.description}
                </p>

                <button style={{
                  width: '100%',
                  padding: '8px 12px',
                  background: isActive ? opt.accent : '#ffffff',
                  color: isActive ? '#ffffff' : '#334155',
                  border: isActive ? `1px solid ${opt.accent}` : '1px solid #ebebef',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '12.5px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  transition: 'all 0.15s ease'
                }}>
                  <opt.Icon className="w-4 h-4" />
                  <span>{opt.cta}</span>
                </button>
              </div>
            );
          })}
        </div>

        {/* Panels intégrés - seulement affichés si un panel est actif */}
        {activePanel === 'manual' && (
          <ManualFormPanel 
            onSubmit={handleCreatePlainte} 
            onClose={handlePanelClose}
          />
        )}
        
        {activePanel === 'pdf' && (
          <PdfUploadPanel 
            onSubmit={handleCreatePlainte} 
            onClose={handlePanelClose}
          />
        )}
        
        {activePanel === 'photo' && (
          <PhotoUploadPanel 
            onSubmit={handleCreatePlainte} 
            onClose={handlePanelClose}
          />
        )}
        
        {activePanel === 'archive' && (
          <ArchiveUploadPanel 
            onSubmit={handleCreatePlainte} 
            onClose={handlePanelClose}
          />
        )}
      </div>
    </div>
  );
} 