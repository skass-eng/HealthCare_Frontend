import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { openExportModal } from '@/store/slices/uiSlice';
import { DashboardUnifiedPlaintes } from '@/components';
import { Download as DownloadIcon } from '@mui/icons-material';
import { fetchStatistiquesGlobales } from '@/store/slices/dashboardSlice';
import { apiService } from '@/lib/api';
import { Plainte } from '@/types';

const PlaintesDashboard: React.FC = () => {
  const dispatch = useDispatch();
  const [plaintes, setPlaintes] = useState<Plainte[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentStatut, setCurrentStatut] = useState<string>('RECU');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 20
  });

  // Charger les vraies données des plaintes
  const loadPlaintes = async (page: number = 1, statut?: string) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Chargement des vraies données des plaintes...', { page, statut });
      const response = await apiService.getPlaintes({
        page,
        limit: 20,
        statut: statut || currentStatut, // Utiliser le statut passé ou le statut actuel
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
    dispatch(fetchStatistiquesGlobales());
    loadPlaintes(1, currentStatut);
  }, [dispatch]);

  // Fonction pour gérer le changement de page
  const handlePageChange = (page: number) => {
    loadPlaintes(page, currentStatut);
  };

  // Fonction pour gérer le changement de type de plainte
  const handleTypeChange = (type: string) => {
    console.log('🔄 Changement de type de plainte:', type);
    setCurrentStatut(type);
    loadPlaintes(1, type);
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
              >
                <span style={{ fontSize: '16px' }}>➕</span>
                Créer une plainte
              </button>
            </div>
          </div>
        </div>
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
      />
    </div>
  );
};

export default PlaintesDashboard; 