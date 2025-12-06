import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { openExportModal } from '@/store/slices/uiSlice';
import { DashboardUnifiedPlaintes } from '@/components';
import { Download as DownloadIcon } from '@mui/icons-material';
import { apiService } from '@/lib/api';
import { Plainte } from '@/types';

interface StatistiquesGlobales {
  total: number;
  nouvelles: number;
  en_cours: number;
  traitees: number;
  cloturees: number;
  mois_courant: number;
  semaine_courante: number;
}

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

const PlaintesDashboard: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const defaultDates = getDefaultDates();
  const [plaintes, setPlaintes] = useState<Plainte[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentStatut, setCurrentStatut] = useState<string>('RECU');
  const [dateDebut, setDateDebut] = useState<string>(defaultDates.dateDebut);
  const [dateFin, setDateFin] = useState<string>(defaultDates.dateFin);
  const [statistiquesGlobales, setStatistiquesGlobales] = useState<StatistiquesGlobales | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 20
  });

  // Charger les statistiques globales avec filtres de dates
  const loadStatistiques = async (dateDebutParam?: string, dateFinParam?: string) => {
    try {
      // Ne pas envoyer undefined si c'est une chaîne vide - laisser le backend appliquer le défaut
      const params: { date_debut?: string; date_fin?: string } = {};
      if (dateDebutParam && dateDebutParam.trim() !== '') {
        params.date_debut = dateDebutParam;
      }
      if (dateFinParam && dateFinParam.trim() !== '') {
        params.date_fin = dateFinParam;
      }
      
      console.log('📊 Chargement des statistiques avec params:', params);
      const response = await apiService.getStatistiquesGlobales(params);
      
      if (response.success && response.data) {
        console.log('✅ Statistiques récupérées et mise à jour du state:', response.data);
        setStatistiquesGlobales(response.data);
      }
    } catch (err) {
      console.error('❌ Erreur lors du chargement des statistiques:', err);
    }
  };

  // Charger les vraies données des plaintes
  const loadPlaintes = async (page: number = 1, statut?: string, dateDebutParam?: string, dateFinParam?: string) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Chargement des vraies données des plaintes...', { page, statut, dateDebut: dateDebutParam, dateFin: dateFinParam });
      const response = await apiService.getPlaintes({
        page,
        limit: 20,
        statut: statut || currentStatut, // Utiliser le statut passé ou le statut actuel
        date_debut: dateDebutParam || dateDebut || undefined,
        date_fin: dateFinParam || dateFin || undefined,
      });
      
      console.log('✅ Plaintes récupérées:', response);
      setPlaintes(response.items || []);
      setPagination({
        currentPage: response.page || 1,
        totalPages: response.pages || 1,
        totalItems: response.total || 0,
        itemsPerPage: response.limit || 20
      });
    } catch (err) {
      console.error('❌ Erreur lors du chargement des plaintes:', err);
      setError('Erreur lors du chargement des plaintes');
    } finally {
      setLoading(false);
    }
  };

  // Charger les données au montage du composant
  useEffect(() => {
    loadStatistiques(dateDebut, dateFin);
    loadPlaintes(1, currentStatut, dateDebut, dateFin);
  }, []);

  // Fonction pour gérer le changement de page
  const handlePageChange = (page: number) => {
    loadPlaintes(page, currentStatut, dateDebut, dateFin);
  };

  // Fonction pour gérer le changement de type de plainte
  const handleTypeChange = (type: string) => {
    console.log('🔄 Changement de type de plainte:', type);
    setCurrentStatut(type);
    loadPlaintes(1, type, dateDebut, dateFin);
  };

  // Fonction pour appliquer le filtre de dates
  const handleDateFilter = () => {
    console.log('🔄 Application du filtre de dates:', { dateDebut, dateFin });
    loadStatistiques(dateDebut, dateFin);
    loadPlaintes(1, currentStatut, dateDebut, dateFin);
  };

  // Fonction pour réinitialiser les filtres de dates (retour à J-3 mois → Aujourd'hui)
  const handleResetDateFilter = () => {
    const resetDates = getDefaultDates();
    setDateDebut(resetDates.dateDebut);
    setDateFin(resetDates.dateFin);
    loadStatistiques(resetDates.dateDebut, resetDates.dateFin);
    loadPlaintes(1, currentStatut, resetDates.dateDebut, resetDates.dateFin);
  };

  // Fonction pour gérer la création d'une nouvelle plainte
  const handleNewComplaint = () => {
    navigate('/plaintes/nouvelles');
  };

  return (
    <div style={{ padding: '24px', minHeight: '100vh' }}>
      {/* Header - Style Healthcare */}
      <div style={{ marginBottom: '32px', position: 'relative' }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(20, 184, 166, 0.1), rgba(16, 185, 129, 0.1))',
          borderRadius: '16px',
          filter: 'blur(20px)',
          zIndex: 0
        }} />
        <div style={{
          position: 'relative',
          background: 'rgba(255,255,255,0.8)',
          backdropFilter: 'blur(4px)',
          border: '1px solid rgba(255,255,255,0.3)',
          borderRadius: '16px',
          padding: '16px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
          zIndex: 1
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                background: 'linear-gradient(135deg, #3b82f6, #14b8a6)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 25px rgba(59, 130, 246, 0.3)',
                position: 'relative'
              }}>
                <span style={{ fontSize: '24px', color: 'white' }}>🛡️</span>
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(135deg, #60a5fa, #2dd4bf)',
                  borderRadius: '12px',
                  opacity: 0.2,
                  animation: 'pulse 2s infinite'
                }} />
              </div>
              <div>
                <h1 style={{
                  margin: 0,
                  fontSize: '2rem',
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #1e293b, #3b82f6, #14b8a6)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  lineHeight: 1.2
                }}>
                  Gestionnaire de Plaintes
                </h1>
                <p style={{
                  marginTop: '8px',
                  color: '#64748b',
                  fontWeight: 500,
                  margin: '8px 0 0 0'
                }}>
                  Interface Agent - Suivi et Validation des Réclamations
                </p>
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
                  fontWeight: '600'
                }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    background: '#10b981',
                    borderRadius: '50%',
                    animation: 'pulse 2s infinite'
                  }} />
                  Gestion Active
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => dispatch(openExportModal())}
                style={{
                  padding: '10px 20px',
                  background: '#374151',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 14px rgba(0, 0, 0, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 14px rgba(0, 0, 0, 0.1)';
                }}
              >
                <DownloadIcon style={{ fontSize: '20px' }} />
                Exporter
              </button>
              <button
                  style={{
                    padding: '10px 20px',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(16, 185, 129, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 14px rgba(16, 185, 129, 0.3)';
                  }}
                  onClick={handleNewComplaint}
                >
                  <span style={{ fontSize: '16px' }}>➕</span>
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
        {(!dateDebut && !dateFin) && (
          <span style={{ 
            color: '#64748b', 
            fontSize: '13px',
            fontStyle: 'italic',
            marginLeft: '8px'
          }}>
            Par défaut : 3 derniers mois
          </span>
        )}
      </div>

      {/* Composant DashboardUnifiedPlaintes */}
      <DashboardUnifiedPlaintes 
        plaintes={plaintes}
        filters={{}}
        filtresDisponibles={{}}
        onLoadPlaintes={handlePageChange}
        onFilterChange={() => {}}
        onReset={() => {}}
        loading={loading}
        activeType={currentStatut.toLowerCase().replace('_', '-')}
        onTypeChange={handleTypeChange}
        total={pagination.totalItems}
        currentPage={pagination.currentPage}
        limit={pagination.itemsPerPage}
        statistiquesGlobales={statistiquesGlobales}
      />
    </div>
  );
};

export default PlaintesDashboard; 