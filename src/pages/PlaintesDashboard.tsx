import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { openExportModal } from '@/store/slices/uiSlice';
import { 
  setDateDebut, 
  setDateFin, 
  setCurrentStatut, 
  setCurrentPage,
  resetDateFilters,
  selectFilters 
} from '@/store/slices/filtersSlice';
import { DashboardUnifiedPlaintes } from '@/components';
import { Download as DownloadIcon } from '@mui/icons-material';
import { apiService } from '@/lib/api';
import { Plainte } from '@/types';
import { AppDispatch, RootState } from '@/store';

interface StatistiquesGlobales {
  total: number;
  nouvelles: number;
  en_cours: number;
  traitees: number;
  cloturees: number;
  mois_courant: number;
  semaine_courante: number;
}

const PlaintesDashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  
  // Récupérer les filtres depuis Redux
  const { dateDebut, dateFin, currentStatut, currentPage, itemsPerPage } = useSelector((state: RootState) => selectFilters(state));
  
  const [plaintes, setPlaintes] = useState<Plainte[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statistiquesGlobales, setStatistiquesGlobales] = useState<StatistiquesGlobales | null>(null);
  const [notification, setNotification] = useState<{ show: boolean; message: string; type: 'success' | 'info' }>({
    show: false,
    message: '',
    type: 'success'
  });
  const [pagination, setPagination] = useState({
    currentPage: currentPage,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: itemsPerPage
  });

  // Charger les statistiques globales avec filtres de dates
  const loadStatistiques = async (dateDebutParam?: string, dateFinParam?: string) => {
    try {
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
        limit: itemsPerPage,
        statut: statut || currentStatut,
        date_debut: dateDebutParam || dateDebut || undefined,
        date_fin: dateFinParam || dateFin || undefined,
      });
      
      console.log('✅ Plaintes récupérées:', response);
      setPlaintes(response.items || []);
      setPagination({
        currentPage: response.page || 1,
        totalPages: response.pages || 1,
        totalItems: response.total || 0,
        itemsPerPage: response.limit || itemsPerPage
      });
    } catch (err) {
      console.error('❌ Erreur lors du chargement des plaintes:', err);
      setError('Erreur lors du chargement des plaintes');
    } finally {
      setLoading(false);
    }
  };

  // Charger les données au montage du composant avec les valeurs du store Redux
  useEffect(() => {
    console.log('🔄 Chargement initial avec filtres Redux:', { currentPage, currentStatut, dateDebut, dateFin });
    loadStatistiques(dateDebut, dateFin);
    loadPlaintes(currentPage, currentStatut, dateDebut, dateFin);
  }, []);

  // Fonction pour gérer le changement de page (appelée par DashboardUnifiedPlaintes avec type, page)
  const handlePageChange = (_typeIgnored: string, page: number) => {
    dispatch(setCurrentPage(page));
    loadPlaintes(page, currentStatut, dateDebut, dateFin);
  };

  // Fonction pour gérer le changement de type de plainte
  const handleTypeChange = (type: string) => {
    console.log('🔄 Changement de type de plainte:', type);
    dispatch(setCurrentStatut(type));
    dispatch(setCurrentPage(1));
    loadPlaintes(1, type, dateDebut, dateFin);
  };

  // Fonction pour afficher une notification
  const showNotification = (message: string, type: 'success' | 'info' = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }));
    }, 3000);
  };

  // Fonction pour formater une date en format lisible DD/MM/YYYY
  const formatDateDisplay = (dateStr: string): string => {
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  // Fonction pour appliquer le filtre de dates
  const handleDateFilter = () => {
    console.log('🔄 Application du filtre de dates:', { dateDebut, dateFin });
    dispatch(setCurrentPage(1));
    loadStatistiques(dateDebut, dateFin);
    loadPlaintes(1, currentStatut, dateDebut, dateFin);
    showNotification(`✅ Filtre appliqué : du ${formatDateDisplay(dateDebut)} au ${formatDateDisplay(dateFin)}`, 'success');
  };

  // Fonction pour réinitialiser les filtres de dates (retour à J-3 mois → Aujourd'hui)
  const handleResetDateFilter = () => {
    dispatch(resetDateFilters());
    // On doit attendre que le state Redux soit mis à jour, donc on utilise les valeurs par défaut
    const today = new Date();
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    const formatDate = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const resetDateDebut = formatDate(threeMonthsAgo);
    const resetDateFin = formatDate(today);
    
    loadStatistiques(resetDateDebut, resetDateFin);
    loadPlaintes(1, currentStatut, resetDateDebut, resetDateFin);
    showNotification('🔄 Filtre réinitialisé aux 3 derniers mois', 'info');
  };

  // Fonction pour gérer la création d'une nouvelle plainte
  const handleNewComplaint = () => {
    navigate('/plaintes/nouvelles');
  };

  // Handlers pour les inputs de date (mise à jour du store Redux)
  const handleDateDebutChange = (value: string) => {
    dispatch(setDateDebut(value));
  };

  const handleDateFinChange = (value: string) => {
    dispatch(setDateFin(value));
  };

  return (
    <div style={{ padding: '24px', minHeight: '100vh' }}>
      {/* Notification */}
      {notification.show && (
        <div
          style={{
            position: 'fixed',
            top: '24px',
            right: '24px',
            zIndex: 1000,
            padding: '16px 24px',
            borderRadius: '12px',
            background: notification.type === 'success' 
              ? 'linear-gradient(135deg, #10b981, #059669)' 
              : 'linear-gradient(135deg, #3b82f6, #2563eb)',
            color: 'white',
            boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            animation: 'slideInRight 0.3s ease-out',
            fontWeight: 500
          }}
        >
          <span style={{ fontSize: '18px' }}>{notification.message}</span>
        </div>
      )}
      <style>{`
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(100px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>

      {/* Header Executive - cohérent avec /dashboard-unified */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{
          background: '#ffffff',
          borderRadius: '12px',
          padding: '20px 24px',
          boxShadow: '0 1px 2px rgba(16, 24, 40, 0.04), 0 1px 3px rgba(16, 24, 40, 0.06)',
          border: '1px solid #ebebef'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{
                width: '44px',
                height: '44px',
                background: '#ffffff',
                border: '1px solid #ebebef',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 1px 2px rgba(16, 24, 40, 0.04)'
              }}>
                <span style={{ fontSize: '20px', color: '#0d9488' }}>📋</span>
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <h1 style={{
                    fontSize: '1.5rem',
                    fontWeight: 700,
                    color: '#1d1d1f',
                    lineHeight: 1.2,
                    margin: 0,
                    letterSpacing: '-0.02em'
                  }}>
                    Gestionnaire de plaintes
                  </h1>
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: '#ecfdf5',
                    color: '#047857',
                    padding: '3px 10px',
                    borderRadius: '999px',
                    fontSize: '11px',
                    fontWeight: 600,
                    border: '1px solid #a7f3d0'
                  }}>
                    <div style={{ width: '6px', height: '6px', backgroundColor: '#10b981', borderRadius: '50%', animation: 'pulse 2s infinite' }} />
                    <span>Gestion active</span>
                  </div>
                </div>
                <p style={{ marginTop: '4px', color: '#86868b', fontWeight: 500, fontSize: '13px', margin: '4px 0 0 0' }}>
                  Suivi opérationnel · Triage · Validation des réclamations
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                onClick={() => dispatch(openExportModal())}
                style={{
                  background: '#ffffff',
                  color: '#334155',
                  fontWeight: 600,
                  border: '1px solid #ebebef',
                  borderRadius: '8px',
                  padding: '9px 16px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '13px',
                  transition: 'all 0.15s ease'
                }}
                onMouseOver={(e) => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#cbd5e1'; }}
                onMouseOut={(e) => { e.currentTarget.style.background = '#ffffff'; e.currentTarget.style.borderColor = '#ebebef'; }}
              >
                <DownloadIcon style={{ fontSize: '17px' }} />
                Exporter
              </button>
              <button
                onClick={handleNewComplaint}
                style={{
                  background: '#1d1d1f',
                  color: 'white',
                  fontWeight: 600,
                  border: '1px solid #1d1d1f',
                  borderRadius: '8px',
                  padding: '9px 16px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '13px',
                  transition: 'all 0.15s ease'
                }}
                onMouseOver={(e) => { e.currentTarget.style.background = '#0f172a'; }}
                onMouseOut={(e) => { e.currentTarget.style.background = '#1d1d1f'; }}
              >
                <span style={{ fontSize: '14px' }}>+</span>
                Nouvelle plainte
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filtre période - segmented control */}
      {(() => {
        const presets = [
          { id: '7d', label: '7 jours', days: 7 },
          { id: '30d', label: '30 jours', days: 30 },
          { id: '90d', label: '90 jours', days: 90 }
        ];
        const today = new Date();
        const debut = dateDebut ? new Date(dateDebut) : null;
        const diffDays = debut ? Math.round((today.getTime() - debut.getTime()) / (24 * 3600 * 1000)) : 0;
        const activePreset = presets.find(p => Math.abs(p.days - diffDays) <= 1)?.id;

        const applyPreset = (days: number) => {
          const fin = new Date();
          const deb = new Date();
          deb.setDate(deb.getDate() - days);
          const fmt = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
          dispatch(setDateDebut(fmt(deb)));
          dispatch(setDateFin(fmt(fin)));
          loadStatistiques(fmt(deb), fmt(fin));
          loadPlaintes(1, currentStatut, fmt(deb), fmt(fin));
        };

        const formatRange = () => {
          if (!dateDebut || !dateFin) return 'Définir une période';
          const d1 = new Date(dateDebut);
          const d2 = new Date(dateFin);
          const opts: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short' };
          return `${d1.toLocaleDateString('fr-FR', opts)} – ${d2.toLocaleDateString('fr-FR', { ...opts, year: 'numeric' })}`;
        };

        return (
          <div style={{
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 4px',
            flexWrap: 'wrap',
            gap: '10px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#86868b', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Période</span>
              <div style={{
                display: 'inline-flex',
                background: '#ffffff',
                border: '1px solid #ebebef',
                borderRadius: '8px',
                padding: '3px',
                boxShadow: '0 1px 2px rgba(16, 24, 40, 0.04)'
              }}>
                {presets.map((p) => {
                  const active = activePreset === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => applyPreset(p.days)}
                      style={{
                        padding: '5px 12px',
                        background: active ? '#1d1d1f' : 'transparent',
                        color: active ? '#ffffff' : '#86868b',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                      onMouseOver={(e) => { if (!active) { e.currentTarget.style.color = '#1d1d1f'; e.currentTarget.style.background = '#f5f5f7'; } }}
                      onMouseOut={(e) => { if (!active) { e.currentTarget.style.color = '#86868b'; e.currentTarget.style.background = 'transparent'; } }}
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <span style={{ fontSize: '12px', color: '#86868b', fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>
              {formatRange()}
            </span>
          </div>
        );
      })()}

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
