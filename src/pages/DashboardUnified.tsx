import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Download as DownloadIcon,
  Add as AddIcon,
  Security as ShieldCheckIcon
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
import {
  setDateDebut as setFilterDateDebut,
  setDateFin as setFilterDateFin,
  resetDateFilters,
  selectFilters
} from '@/store/slices/filtersSlice';
import AnalyticsContent from '@/components/AnalyticsContent';
import PlotlyChart from '@/components/PlotlyChart';
import { scoreSentimentToScale5 } from '@/lib/metrics';

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
  
  // Récupérer les filtres depuis Redux (partagés avec PlaintesDashboard)
  const { dateDebut, dateFin } = useSelector((state: RootState) => selectFilters(state));
  
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

  // Au mount : si les dates persistées sont stales (>30 jours dans le passé),
  // on les réinitialise sur la fenêtre par défaut (3 derniers mois) avant de charger.
  useEffect(() => {
    const today = new Date();
    const persistedFin = dateFin ? new Date(dateFin) : null;
    const isStale = !persistedFin || (today.getTime() - persistedFin.getTime()) > 30 * 24 * 3600 * 1000;

    if (isStale) {
      const defaults = getDefaultDates();
      dispatch(setFilterDateDebut(defaults.dateDebut));
      dispatch(setFilterDateFin(defaults.dateFin));
      loadStatistiquesWithDates(defaults.dateDebut, defaults.dateFin);
    } else {
      loadStatistiquesWithDates(dateDebut, dateFin);
    }
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
    dispatch(resetDateFilters());
    // Utiliser les valeurs par défaut pour le rechargement
    const today = new Date();
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    const formatDate = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const resetDateDebut = formatDate(threeMonthsAgo);
    const resetDateFin = formatDate(today);
    await loadStatistiquesWithDates(resetDateDebut, resetDateFin);
    showNotification('🔄 Filtre réinitialisé aux 3 derniers mois', 'info');
  };

  // Handlers pour les inputs de date (mise à jour du store Redux partagé)
  const handleDateDebutChange = (value: string) => {
    dispatch(setFilterDateDebut(value));
  };

  const handleDateFinChange = (value: string) => {
    dispatch(setFilterDateFin(value));
  };


  if (loadingStatistiques && !statistiquesGlobales) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f5f5f7'
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

      {/* Header - Executive style */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{
          background: '#ffffff',
          borderRadius: '12px',
          padding: '20px 24px',
          boxShadow: '0 1px 3px rgba(15, 23, 42, 0.06), 0 1px 2px rgba(15, 23, 42, 0.04)',
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
                <ShieldCheckIcon style={{ fontSize: '20px', color: '#0d9488' }} />
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
                    Pulse 360 · Vue Exécutive
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
                    <div style={{
                      width: '6px',
                      height: '6px',
                      backgroundColor: '#10b981',
                      borderRadius: '50%',
                      animation: 'pulse 2s infinite'
                    }} />
                    <span>Live</span>
                  </div>
                </div>
                <p style={{
                  marginTop: '4px',
                  color: '#64748b',
                  fontWeight: 500,
                  fontSize: '13px',
                  margin: '4px 0 0 0'
                }}>
                  Pilotage qualité &amp; expérience patient · Plateforme IA d'analyse des plaintes
                </p>
              </div>
            </div>
            
            {/* Boutons d'action */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                onClick={handleExport}
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
                onMouseOut={(e) => { e.currentTarget.style.background = '#ffffff'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
              >
                <DownloadIcon style={{ fontSize: '17px' }} />
                Exporter
              </button>

              <button
                onClick={handleNewComplaint}
                style={{
                  background: '#0f172a',
                  color: 'white',
                  fontWeight: 600,
                  border: '1px solid #0f172a',
                  borderRadius: '8px',
                  padding: '9px 16px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '13px',
                  transition: 'all 0.15s ease'
                }}
                onMouseOver={(e) => { e.currentTarget.style.background = '#1e293b'; }}
                onMouseOut={(e) => { e.currentTarget.style.background = '#0f172a'; }}
              >
                <AddIcon style={{ fontSize: '17px' }} />
                Nouvelle plainte
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filtre période - segmented control premium */}
      {(() => {
        const presets = [
          { id: '7d', label: '7 jours', days: 7 },
          { id: '30d', label: '30 jours', days: 30 },
          { id: '90d', label: '90 jours', days: 90 }
        ];
        // Détecter le preset actif par diff entre dateDebut et dateFin
        const today = new Date();
        const debut = dateDebut ? new Date(dateDebut) : null;
        const diffDays = debut ? Math.round((today.getTime() - debut.getTime()) / (24 * 3600 * 1000)) : 0;
        const activePreset = presets.find(p => Math.abs(p.days - diffDays) <= 1)?.id;

        const applyPreset = (days: number) => {
          const fin = new Date();
          const deb = new Date();
          deb.setDate(deb.getDate() - days);
          const fmt = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
          dispatch(setFilterDateDebut(fmt(deb)));
          dispatch(setFilterDateFin(fmt(fin)));
          loadStatistiquesWithDates(fmt(deb), fmt(fin));
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
              {/* Segmented presets */}
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

            {/* Range affiché + édition custom */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '12px', color: '#86868b', fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>
                {formatRange()}
              </span>
              <details style={{ position: 'relative' }}>
                <summary style={{
                  listStyle: 'none',
                  cursor: 'pointer',
                  padding: '5px 12px',
                  background: '#ffffff',
                  border: '1px solid #ebebef',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#1d1d1f',
                  display: 'inline-block',
                  boxShadow: '0 1px 2px rgba(16, 24, 40, 0.04)'
                }}>
                  Personnalisé
                </summary>
                <div style={{
                  position: 'absolute',
                  right: 0,
                  top: 'calc(100% + 6px)',
                  background: '#ffffff',
                  border: '1px solid #ebebef',
                  borderRadius: '8px',
                  padding: '12px',
                  boxShadow: '0 8px 24px rgba(16, 24, 40, 0.08)',
                  zIndex: 10,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  minWidth: '240px'
                }}>
                  <label style={{ fontSize: '11px', fontWeight: 600, color: '#86868b', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Du</label>
                  <input
                    type="date"
                    value={dateDebut}
                    onChange={(e) => handleDateDebutChange(e.target.value)}
                    style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #ebebef', fontSize: '12px', color: '#1d1d1f' }}
                  />
                  <label style={{ fontSize: '11px', fontWeight: 600, color: '#86868b', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Au</label>
                  <input
                    type="date"
                    value={dateFin}
                    onChange={(e) => handleDateFinChange(e.target.value)}
                    style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #ebebef', fontSize: '12px', color: '#1d1d1f' }}
                  />
                  <button
                    onClick={handleDateFilter}
                    style={{ padding: '6px 12px', background: '#1d1d1f', color: '#ffffff', border: 'none', borderRadius: '6px', fontWeight: 600, fontSize: '12px', cursor: 'pointer' }}
                  >
                    Appliquer
                  </button>
                </div>
              </details>
            </div>
          </div>
        );
      })()}

      {/* Section KPIs Exécutifs */}
      {(() => {
        const total = statistiquesGlobales?.total || 0;
        const traitees = statistiquesGlobales?.traitees || 0;
        const enCours = statistiquesGlobales?.en_cours || 0;
        const nouvelles = statistiquesGlobales?.nouvelles || 0;
        const tauxResolution = total > 0 ? Math.round((traitees / total) * 100) : 0;
        const satisfactionAvg = statistiquesDepartements.length > 0
          ? statistiquesDepartements.reduce((acc, d) => acc + (d.satisfaction_moyenne || 0), 0) / statistiquesDepartements.length
          : 0;

        const kpis = [
          {
            label: 'Plaintes traitées',
            value: total.toLocaleString('fr-FR'),
            sub: `${nouvelles} nouvelles · ${enCours} en cours`,
            accent: '#0f172a'
          },
          {
            label: 'Taux de résolution',
            value: `${tauxResolution}%`,
            sub: `${traitees.toLocaleString('fr-FR')} dossiers clôturés`,
            accent: '#059669'
          },
          {
            label: 'Satisfaction patient',
            // satisfactionAvg = moyenne de score_sentiment brut ∈ [-1,1] (backend plaintes_gestion.py:883).
            // Conversion en note /5 via le helper partagé (cohérent avec VueEnsemble/AnalyticsContent).
            value: `${scoreSentimentToScale5(satisfactionAvg).toFixed(1)}/5`,
            sub: 'Score agrégé multi-services',
            // Seuils sur l'échelle /5 : >=3.5 vert, >=2.5 orange, sinon rouge.
            accent: scoreSentimentToScale5(satisfactionAvg) >= 3.5
              ? '#059669'
              : scoreSentimentToScale5(satisfactionAvg) >= 2.5
                ? '#d97706'
                : '#dc2626'
          },
          {
            label: 'Plaintes en cours',
            value: enCours.toLocaleString('fr-FR'),
            sub: `dont ${nouvelles} nouvelles cette période`,
            accent: '#0f172a'
          }
        ];

        return (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
            {kpis.map((kpi) => (
              <div key={kpi.label} style={{
                background: '#ffffff',
                border: '1px solid #ebebef',
                borderRadius: '12px',
                padding: '20px 22px',
                boxShadow: '0 1px 2px rgba(16, 24, 40, 0.04), 0 1px 3px rgba(16, 24, 40, 0.06)',
                transition: 'border-color 0.2s ease, transform 0.2s ease'
              }}
              onMouseOver={(e) => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseOut={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <div style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#64748b',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  marginBottom: '10px'
                }}>
                  {kpi.label}
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '8px', marginBottom: '8px' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 700, color: kpi.accent, letterSpacing: '-0.02em', lineHeight: 1 }}>
                    {kpi.value}
                  </div>
                </div>
                <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>
                  {kpi.sub}
                </div>
              </div>
            ))}
          </div>
        );
      })()}

      {/* HERO ROW : Évolution (60%) + Top services (40%) */}
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '20px', marginBottom: '24px' }}>

        {/* Graphique évolution - le HÉROS */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #ebebef',
          borderRadius: '12px',
          padding: '20px 24px',
          boxShadow: '0 1px 2px rgba(16, 24, 40, 0.04), 0 1px 3px rgba(16, 24, 40, 0.06)'
        }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1d1d1f', margin: 0, letterSpacing: '-0.01em' }}>
                Évolution des plaintes
              </h3>
              <p style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 500, margin: '2px 0 0 0', letterSpacing: '0.03em', textTransform: 'uppercase' }}>
                30 derniers jours · volume quotidien
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748b' }}>
              <div style={{ width: '8px', height: '8px', background: '#0d9488', borderRadius: '2px' }} />
              <span>Plaintes / jour</span>
            </div>
          </div>
          {evolutionPlaintes?.evolution_journaliere && evolutionPlaintes.evolution_journaliere.length > 0 ? (
            <PlotlyChart
              data={[
                {
                  x: evolutionPlaintes.evolution_journaliere.map(p => new Date(p.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })),
                  y: evolutionPlaintes.evolution_journaliere.map(p => p.count),
                  type: 'scatter',
                  mode: 'lines',
                  line: { color: '#0d9488', width: 2.5, shape: 'spline' },
                  fill: 'tozeroy',
                  fillcolor: 'rgba(13, 148, 136, 0.08)',
                  hovertemplate: '<b>%{x}</b><br>%{y} plaintes<extra></extra>'
                }
              ]}
              layout={{
                margin: { l: 40, r: 16, t: 8, b: 40 },
                xaxis: { showgrid: false, tickfont: { color: '#94a3b8', size: 10 }, tickangle: 0 },
                yaxis: { showgrid: true, gridcolor: '#f1f5f9', tickfont: { color: '#94a3b8', size: 10 }, zeroline: false },
                plot_bgcolor: 'rgba(0,0,0,0)',
                paper_bgcolor: 'rgba(0,0,0,0)',
                font: { family: 'Inter, sans-serif', color: '#1d1d1f' },
                hovermode: 'x unified',
                showlegend: false
              }}
              className="h-72"
            />
          ) : (
            <div style={{ height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '13px' }}>
              Pas de données pour cette période
            </div>
          )}
        </div>

        {/* Top services ranking */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #ebebef',
          borderRadius: '12px',
          padding: '20px 24px',
          boxShadow: '0 1px 2px rgba(16, 24, 40, 0.04), 0 1px 3px rgba(16, 24, 40, 0.06)'
        }}>
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1d1d1f', margin: 0, letterSpacing: '-0.01em' }}>
              Top services par volume
            </h3>
            <p style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 500, margin: '2px 0 0 0', letterSpacing: '0.03em', textTransform: 'uppercase' }}>
              {statistiquesDepartements.length} services suivis
            </p>
          </div>
          {(() => {
            const sorted = [...statistiquesDepartements].sort((a, b) => (b.total || 0) - (a.total || 0)).slice(0, 6);
            const max = sorted[0]?.total || 1;
            if (sorted.length === 0) {
              return (
                <div style={{ height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '13px' }}>
                  Aucun service à afficher
                </div>
              );
            }
            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {sorted.map((d) => {
                  const pct = ((d.total || 0) / max) * 100;
                  // satisfaction_moyenne = score_sentiment brut ∈ [-1,1] -> note /5 via le helper partagé
                  const sat = scoreSentimentToScale5(d.satisfaction_moyenne);
                  const satColor = sat >= 3.5 ? '#059669' : sat >= 2.5 ? '#b45309' : '#b91c1c';
                  return (
                    <div key={d.id}>
                      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: '#1d1d1f', letterSpacing: '-0.005em' }}>
                          {d.nom}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                          <span style={{ fontSize: '11px', color: satColor, fontWeight: 600 }}>★ {sat.toFixed(1)}</span>
                          <span style={{ fontSize: '13px', fontWeight: 700, color: '#1d1d1f' }}>{d.total || 0}</span>
                        </div>
                      </div>
                      <div style={{ width: '100%', height: '6px', background: '#f1f5f9', borderRadius: '999px', overflow: 'hidden' }}>
                        <div style={{
                          width: `${pct}%`,
                          height: '100%',
                          background: 'linear-gradient(90deg, #0d9488, #5eead4)',
                          borderRadius: '999px',
                          transition: 'width 0.5s ease'
                        }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      </div>

      {/* Drill-down (onglets compacts) */}
      <div>
        <div style={{ marginBottom: '12px', padding: '0 4px' }}>
          <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b', margin: 0, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            Analyse détaillée
          </h3>
        </div>
        <AnalyticsContent selectedPeriod="30j" />
      </div>
    </div>
  );
};

export default DashboardUnified; 