import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Download as DownloadIcon,
  Add as AddIcon,
  Security as ShieldCheckIcon,
  Assignment as AssignmentIcon,
  BarChart as BarChartIcon,
  Favorite as HeartIcon,
  LocalHospital as EmergencyIcon
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { openExportModal } from '@/store/slices/uiSlice';
import { 
  fetchStatistiquesGlobales, 
  fetchStatistiquesDepartements, 
  fetchStatistiquesPriorites,
  fetchEvolutionPlaintes 
} from '@/store/slices/dashboardSlice';
import AnalyticsContent from '@/components/AnalyticsContent';

// Fonction helper pour formater une date en YYYY-MM-DD
const formatDateToISO = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Calculer les dates par défaut (J-3 mois à Aujourd'hui)
const getDefaultDates = () => {
  const today = new Date();
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
  return {
    dateDebut: formatDateToISO(threeMonthsAgo),
    dateFin: formatDateToISO(today)
  };
};

const DashboardUnified: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const defaultDates = getDefaultDates();
  const [dateDebut, setDateDebut] = useState<string>(defaultDates.dateDebut);
  const [dateFin, setDateFin] = useState<string>(defaultDates.dateFin);
  const [notification, setNotification] = useState<{ show: boolean; message: string; type: 'success' | 'info' }>({
    show: false,
    message: '',
    type: 'success'
  });
  
  const { 
    statistiquesGlobales, 
    statistiquesDepartements, 
    evolutionPlaintes,
    loadingStatistiques,
    errorStatistiques 
  } = useSelector((state: RootState) => state.dashboard);

  // Fonction pour charger les statistiques avec les filtres de dates
  const loadStatistiquesWithDates = async (dateDebutParam?: string, dateFinParam?: string) => {
    try {
      console.log('🔄 Chargement des statistiques avec dates:', { dateDebutParam, dateFinParam });
      const params: { date_debut?: string; date_fin?: string } = {};
      if (dateDebutParam && dateDebutParam.trim() !== '') {
        params.date_debut = dateDebutParam;
      }
      if (dateFinParam && dateFinParam.trim() !== '') {
        params.date_fin = dateFinParam;
      }
      
      await Promise.all([
        dispatch(fetchStatistiquesGlobales(params)),
        dispatch(fetchStatistiquesDepartements(params)),
        dispatch(fetchStatistiquesPriorites()),
        dispatch(fetchEvolutionPlaintes('30j'))
      ]);
      console.log('✅ Statistiques chargées avec succès');
    } catch (error) {
      console.error('❌ Erreur lors du chargement des statistiques:', error);
    }
  };

  // Charger les statistiques au montage du composant avec les dates par défaut
  useEffect(() => {
    loadStatistiquesWithDates(dateDebut, dateFin);
  }, [dispatch]);

  // Debug: Afficher les données Redux
  useEffect(() => {
    console.log('📊 Données Redux actuelles:', {
      statistiquesGlobales,
      statistiquesDepartements,
      loadingStatistiques,
      errorStatistiques
    });
  }, [statistiquesGlobales, statistiquesDepartements, loadingStatistiques, errorStatistiques]);

  // Gestionnaires pour les actions
  const handleExport = () => {
    dispatch(openExportModal());
  };

  const handleNewComplaint = () => {
    navigate('/plaintes/nouvelles');
  };

  // Fonction pour afficher une notification
  const showNotification = (message: string, type: 'success' | 'info' = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  // Gestionnaire pour appliquer le filtre de dates
  const handleDateFilter = async () => {
    await loadStatistiquesWithDates(dateDebut, dateFin);
    const dateDebutFormatted = new Date(dateDebut).toLocaleDateString('fr-FR');
    const dateFinFormatted = new Date(dateFin).toLocaleDateString('fr-FR');
    showNotification(`✅ Filtre appliqué : du ${dateDebutFormatted} au ${dateFinFormatted}`, 'success');
  };

  // Gestionnaire pour réinitialiser les filtres de dates
  const handleResetDateFilter = async () => {
    const resetDates = getDefaultDates();
    setDateDebut(resetDates.dateDebut);
    setDateFin(resetDates.dateFin);
    await loadStatistiquesWithDates(resetDates.dateDebut, resetDates.dateFin);
    showNotification('🔄 Filtre réinitialisé aux 3 derniers mois', 'info');
  };

  // Fonction pour obtenir l'icône et la couleur selon le type de service
  const getServiceIcon = (typeService: string) => {
    switch (typeService?.toLowerCase()) {
      case 'cardiologie':
        return { icon: HeartIcon, color: '#dc2626', bgColor: '#fef2f2', borderColor: '#fecaca' };
      case 'urgences':
        return { icon: EmergencyIcon, color: '#ea580c', bgColor: '#fff7ed', borderColor: '#fed7aa' };
      default:
        return { icon: AssignmentIcon, color: '#3b82f6', bgColor: '#eff6ff', borderColor: '#bfdbfe' };
    }
  };

  if (loadingStatistiques && !statistiquesGlobales) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
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
            Chargement des données...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh',
      padding: '24px'
    }}>
      {/* Notification */}
      {notification.show && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: notification.type === 'success' 
            ? 'linear-gradient(135deg, #10b981, #059669)' 
            : 'linear-gradient(135deg, #3b82f6, #2563eb)',
          color: 'white',
          padding: '14px 24px',
          borderRadius: '12px',
          boxShadow: '0 8px 25px rgba(0,0,0,0.2)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontWeight: 500,
          fontSize: '14px',
          animation: 'slideInRight 0.4s ease-out'
        }}>
          <span>{notification.message}</span>
        </div>
      )}

      {/* Animation CSS pour la notification */}
      <style>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>

      {/* Header - Style Healthcare */}
      <div style={{ marginBottom: '32px', position: 'relative' }}>
        {/* Effet de fond avec gradient */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(20, 184, 166, 0.1), rgba(16, 185, 129, 0.1))',
          borderRadius: '16px',
          filter: 'blur(20px)',
          zIndex: 0
        }} />
        
        {/* Contenu du titre */}
        <div style={{
          position: 'relative',
          background: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
          zIndex: 1,
          border: '1px solid rgba(255,255,255,0.3)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              {/* Icône avec effet */}
              <div style={{ position: 'relative' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: 'linear-gradient(135deg, #3b82f6, #14b8a6)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 25px rgba(59, 130, 246, 0.3)'
                }}>
                  <ShieldCheckIcon style={{ fontSize: '24px', color: 'white' }} />
                </div>
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(135deg, #60a5fa, #2dd4bf)',
                  borderRadius: '12px',
                  opacity: 0.2,
                  animation: 'pulse 2s infinite'
                }} />
              </div>
              
              {/* Texte du titre */}
              <div>
                <h1 style={{ 
                  fontSize: '2rem',
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #1e293b, #3b82f6, #14b8a6)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  lineHeight: 1.2,
                  margin: 0
                }}>
                  Vue d'Ensemble
                </h1>
                <p style={{ 
                  marginTop: '8px', 
                  color: '#64748b',
                  fontWeight: 500,
                  margin: '8px 0 0 0'
                }}>
                  Interface Agent - Suivi et Validation des Réclamations
                </p>
                {/* Badge de statut */}
                <div style={{ 
                  marginTop: '16px', 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '8px',
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  color: 'white',
                  padding: '4px 16px',
                  borderRadius: '16px',
                  boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)',
                  fontSize: '12px',
                  fontWeight: 600
                }}>
                  <div style={{ 
                    width: '6px', 
                    height: '6px', 
                    backgroundColor: 'white', 
                    borderRadius: '50%',
                    animation: 'pulse 2s infinite'
                  }} />
                  <span>Système Actif</span>
                </div>
              </div>
            </div>
            
            {/* Boutons d'action */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <button
                onClick={handleExport}
                style={{
                  background: 'linear-gradient(135deg, #64748b, #475569)',
                  color: 'white',
                  fontWeight: 600,
                  boxShadow: '0 8px 25px rgba(100, 116, 139, 0.3)',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px 24px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #475569, #334155)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 12px 35px rgba(100, 116, 139, 0.4)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #64748b, #475569)';
                  e.currentTarget.style.transform = 'translateY(0px)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(100, 116, 139, 0.3)';
                }}
              >
                <DownloadIcon style={{ fontSize: '20px' }} />
                Exporter
              </button>
              
              <button
                onClick={handleNewComplaint}
                style={{
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  color: 'white',
                  fontWeight: 600,
                  boxShadow: '0 8px 25px rgba(16, 185, 129, 0.3)',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px 24px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #059669, #047857)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 12px 35px rgba(16, 185, 129, 0.4)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #10b981, #059669)';
                  e.currentTarget.style.transform = 'translateY(0px)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(16, 185, 129, 0.3)';
                }}
              >
                <AddIcon style={{ fontSize: '20px' }} />
                Créer une plainte
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filtre par dates */}
      <div style={{
        marginBottom: '24px',
        background: 'white',
        borderRadius: '12px',
        padding: '16px 24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        border: '1px solid #f1f5f9',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontWeight: 500, color: '#374151', fontSize: '14px' }}>📅 Période :</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ color: '#64748b', fontSize: '14px' }}>Du</label>
          <input
            type="date"
            value={dateDebut}
            onChange={(e) => setDateDebut(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid #d1d5db',
              fontSize: '14px',
              outline: 'none',
              transition: 'border-color 0.2s ease'
            }}
            onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
            onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ color: '#64748b', fontSize: '14px' }}>Au</label>
          <input
            type="date"
            value={dateFin}
            onChange={(e) => setDateFin(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid #d1d5db',
              fontSize: '14px',
              outline: 'none',
              transition: 'border-color 0.2s ease'
            }}
            onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
            onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
          />
        </div>
        <button
          onClick={handleDateFilter}
          style={{
            padding: '8px 16px',
            background: 'linear-gradient(135deg, #3b82f6, #14b8a6)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            fontSize: '14px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          Filtrer
        </button>
        <button
          onClick={handleResetDateFilter}
          style={{
            padding: '8px 16px',
            background: '#f1f5f9',
            color: '#64748b',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            fontSize: '14px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#e2e8f0';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#f1f5f9';
          }}
        >
          Réinitialiser
        </button>
      </div>

      {/* Section Résumé global - Données réelles */}
      <div style={{
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(20px)',
        borderRadius: '16px',
        padding: '32px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        border: '1px solid rgba(255,255,255,0.3)',
        marginBottom: '32px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <BarChartIcon style={{ color: '#3b82f6', fontSize: '24px' }} />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>
            Résumé global
          </h2>
        </div>

        {/* Cartes des statistiques - Données réelles */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
          <div style={{ 
            textAlign: 'center',
            padding: '24px',
            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
            transition: 'all 0.2s ease'
          }}>
            <div style={{ fontSize: '3rem', fontWeight: 700, color: '#1e293b', marginBottom: '8px' }}>
              {statistiquesGlobales?.total || 0}
            </div>
            <div style={{ fontSize: '14px', color: '#64748b', fontWeight: 500 }}>
              Total plaintes
            </div>
          </div>
          
          <div style={{ 
            textAlign: 'center',
            padding: '24px',
            background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
            borderRadius: '12px',
            border: '1px solid #93c5fd',
            boxShadow: '0 4px 6px rgba(59, 130, 246, 0.1)',
            transition: 'all 0.2s ease'
          }}>
            <div style={{ fontSize: '3rem', fontWeight: 700, color: '#2563eb', marginBottom: '8px' }}>
              {statistiquesGlobales?.nouvelles || 0}
            </div>
            <div style={{ fontSize: '14px', color: '#1e40af', fontWeight: 500 }}>
              Nouvelles
            </div>
          </div>
          
          <div style={{ 
            textAlign: 'center',
            padding: '24px',
            background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
            borderRadius: '12px',
            border: '1px solid #6ee7b7',
            boxShadow: '0 4px 6px rgba(16, 185, 129, 0.1)',
            transition: 'all 0.2s ease'
          }}>
            <div style={{ fontSize: '3rem', fontWeight: 700, color: '#059669', marginBottom: '8px' }}>
              {statistiquesGlobales?.en_cours || 0}
            </div>
            <div style={{ fontSize: '14px', color: '#047857', fontWeight: 500 }}>
              En cours
            </div>
          </div>
          
          <div style={{ 
            textAlign: 'center',
            padding: '24px',
            background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)',
            borderRadius: '12px',
            border: '1px solid #86efac',
            boxShadow: '0 4px 6px rgba(34, 197, 94, 0.1)',
            transition: 'all 0.2s ease'
          }}>
            <div style={{ fontSize: '3rem', fontWeight: 700, color: '#16a34a', marginBottom: '8px' }}>
              {statistiquesGlobales?.traitees || 0}
            </div>
            <div style={{ fontSize: '14px', color: '#15803d', fontWeight: 500 }}>
              Traitées
            </div>
          </div>
        </div>
      </div>

      {/* Section Analyse par Départements - Données réelles */}
      <div style={{
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(20px)',
        borderRadius: '16px',
        padding: '32px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        border: '1px solid rgba(255,255,255,0.3)',
        marginBottom: '32px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <AssignmentIcon style={{ color: '#3b82f6', fontSize: '24px' }} />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>
            Analyse par Départements
          </h2>
        </div>
        <p style={{ fontSize: '14px', color: '#64748b', fontWeight: 500, marginBottom: '32px', margin: '0 0 32px 0' }}>
          Performance et métriques détaillées par spécialité médicale
        </p>

        {/* Départements - Données réelles */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
          {statistiquesDepartements.map((departement) => {
            const { icon: ServiceIcon, color, bgColor, borderColor } = getServiceIcon(departement.type_service);
            
            return (
              <div key={departement.id} style={{
                border: '2px solid #e2e8f0',
                borderRadius: '16px',
                padding: '24px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                background: 'rgba(255,255,255,0.8)',
                backdropFilter: 'blur(4px)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ 
                      color: color, 
                      background: bgColor, 
                      padding: '12px', 
                      borderRadius: '12px',
                      border: `1px solid ${borderColor}`
                    }}>
                      <ServiceIcon style={{ fontSize: '24px' }} />
                    </div>
                    <h4 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#1e293b', margin: 0 }}>
                      {departement.nom.toUpperCase()}
                    </h4>
                  </div>
                </div>

                {/* Statistiques principales */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '24px' }}>
                  <div style={{ 
                    textAlign: 'center',
                    padding: '16px',
                    background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 600, color: '#1e293b' }}>{departement.total}</div>
                    <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>Total</div>
                  </div>
                  <div style={{ 
                    textAlign: 'center',
                    padding: '16px',
                    background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
                    borderRadius: '12px',
                    border: '1px solid #93c5fd'
                  }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 600, color: '#2563eb' }}>{departement.nouvelles}</div>
                    <div style={{ fontSize: '12px', color: '#1e40af', fontWeight: 500 }}>Nouvelles</div>
                  </div>
                  <div style={{ 
                    textAlign: 'center',
                    padding: '16px',
                    background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
                    borderRadius: '12px',
                    border: '1px solid #6ee7b7'
                  }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 600, color: '#059669' }}>{departement.en_cours}</div>
                    <div style={{ fontSize: '12px', color: '#047857', fontWeight: 500 }}>En cours</div>
                  </div>
                  <div style={{ 
                    textAlign: 'center',
                    padding: '16px',
                    background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)',
                    borderRadius: '12px',
                    border: '1px solid #86efac'
                  }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 600, color: '#16a34a' }}>{departement.cloturees}</div>
                    <div style={{ fontSize: '12px', color: '#15803d', fontWeight: 500 }}>Cloturées</div>
                  </div>
                </div>

                {/* Satisfaction */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '14px' }}>
                  <span style={{ color: '#64748b', fontWeight: 500 }}>Satisfaction moyenne:</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ color: '#fbbf24', fontSize: '16px' }}>⭐</div>
                    <span style={{ fontWeight: 600 }}>{departement.satisfaction_moyenne.toFixed(1)}/5</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Contenu principal - Analytics */}
      <div style={{ maxWidth: '100%', margin: '0 auto' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Analytics Content */}
          <div style={{
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: '16px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
            border: '1px solid rgba(255,255,255,0.3)'
          }}>
            <AnalyticsContent selectedPeriod="30j" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardUnified; 