import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { Assignment as DocumentTextIcon } from '@mui/icons-material';

interface Plainte {
  id: number;
  numero_plainte: string;
  titre: string;
  description: string;
  service_id: number;
  cree_par_id: number;
  statut: string;
  priorite: string;
  categorie_principale?: string;
  mots_cles: string[];
  score_sentiment?: number;
  score_urgence_ia?: number;
  analyse_ia: Record<string, any>;
  date_incident?: string;
  date_limite_reponse?: string;
  date_creation: string;
  date_modification?: string;
  service?: {
    id: number;
    nom: string;
    code_service: string;
  };
  createur?: {
    id: number;
    name: string;
    email: string;
  };
}

interface DashboardUnifiedPlaintesProps {
  plaintes: Plainte[];
  filters: any;
  filtresDisponibles: any;
  onLoadPlaintes: (type: string, page: number) => void;
  onFilterChange: (filterName: string, value: string) => void;
  onReset: () => void;
  loading: boolean;
  activeType?: string;
  onTypeChange?: (type: string) => void;
  total?: number;
  currentPage?: number;
  limit?: number;
}

const DashboardUnifiedPlaintes: React.FC<DashboardUnifiedPlaintesProps> = ({
  plaintes,
  filters,
  onLoadPlaintes,
  loading,
  activeType = 'recu',
  onTypeChange,
  total = 0,
  currentPage: externalCurrentPage = 1,
  limit = 20
}) => {
  // Récupérer les vraies données Redux
  const { statistiquesGlobales } = useSelector((state: RootState) => state.dashboard);
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(externalCurrentPage);
  const [notification, setNotification] = useState<{ show: boolean; message: string }>({
    show: false,
    message: ''
  });

  const handleTypeChange = (type: string) => {
    setCurrentPage(1);
    console.log('🔄 Changement de type dans DashboardUnifiedPlaintes:', type);
    
    // Mapper les types vers les statuts du backend (en majuscules)
    const statutMap: { [key: string]: string } = {
      'recu': 'RECU',
      'en-cours': 'EN_COURS',
      'traite': 'TRAITE',
      'cloture': 'CLOTURE'
    };
    
    const statut = statutMap[type] || 'RECU';
    console.log('🔄 Statut mappé:', statut);
    
    if (onTypeChange) {
      onTypeChange(statut);
    } else {
      onLoadPlaintes(statut, 1);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    onLoadPlaintes(activeType, page);
  };

  const showNotification = (message: string) => {
    setNotification({ show: true, message });
    setTimeout(() => {
      setNotification({ show: false, message: '' });
    }, 3000);
  };

  const handleStatusUpdate = (plainteId: string, newStatus: number) => {
    console.log(`Mise à jour du statut pour ${plainteId} vers ${newStatus}`);
    showNotification('Statut mis à jour avec succès !');
  };

  const handlePlainteClick = (plainte: Plainte) => {
    navigate(`/plaintes/${plainte.id}`);
  };

  useEffect(() => {
    setCurrentPage(externalCurrentPage);
  }, [externalCurrentPage]);

  const getPriorityColor = (priorite: string) => {
    switch (priorite) {
      case 'URGENT':
        return 'bg-red-500 text-white';
      case 'ELEVE':
        return 'bg-orange-500 text-white';
      case 'MOYENNE':
        return 'bg-yellow-500 text-white';
      case 'BASSE':
        return 'bg-green-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getStatusColor = (statut: string) => {
    switch (statut) {
      case 'RECU':
        return 'bg-yellow-100 text-yellow-800';
      case 'EN_COURS':
        return 'bg-blue-100 text-blue-800';
      case 'TRAITE':
        return 'bg-green-100 text-green-800';
      case 'CLOTURE':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getStatusNumber = (statut: string) => {
    switch (statut) {
      case 'RECU':
        return 1;
      case 'EN_COURS':
        return 2;
      case 'TRAITE':
        return 3;
      case 'CLOTURE':
        return 4;
      default:
        return 1;
    }
  };

  const createComplaintCard = (plainte: Plainte) => {
    const statusNumber = getStatusNumber(plainte.statut);
    const progressWidth = (statusNumber / 4) * 100;
    const statusLabels = ['Reçu', 'En cours', 'Traité', 'Clôturé'];

    return (
      <div
        key={plainte.id}
        style={{
          background: 'white',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #f1f5f9',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          position: 'relative',
          overflow: 'hidden'
        }}
        onClick={() => handlePlainteClick(plainte)}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
        }}
      >
        {/* Header de la carte */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
                         <h3 style={{
               fontSize: '18px',
               fontWeight: '600',
               color: '#1e293b',
               margin: '0 0 8px 0',
               overflow: 'hidden',
               textOverflow: 'ellipsis',
               whiteSpace: 'nowrap'
             }}>
               {plainte.numero_plainte}
             </h3>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{
                padding: '4px 12px',
                borderRadius: '16px',
                fontSize: '12px',
                fontWeight: 500,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '100px'
              }} className={getPriorityColor(plainte.priorite)}>
                {plainte.priorite}
              </span>
              <span style={{
                padding: '4px 12px',
                borderRadius: '16px',
                fontSize: '12px',
                fontWeight: 500,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '100px'
              }} className={getStatusColor(plainte.statut)}>
                {plainte.statut.replace('_', ' ')}
              </span>
            </div>
          </div>
        </div>

        {/* Informations de la plainte */}
        <div style={{ marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '8px', minWidth: 0 }}>
                     <p style={{ color: '#64748b', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
             <span style={{ fontWeight: 500, color: '#1e293b' }}>Titre:</span> {plainte.titre}
           </p>
          <p style={{ color: '#64748b', margin: 0 }}>
            <span style={{ fontWeight: 500, color: '#1e293b' }}>Date:</span> {formatDate(plainte.date_creation)}
          </p>
                     <p style={{ color: '#64748b', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
             <span style={{ fontWeight: 500, color: '#1e293b' }}>Service:</span> {plainte.service?.nom || `Service ID: ${plainte.service_id}`}
           </p>
          {plainte.categorie_principale && (
            <p style={{ color: '#64748b', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              <span style={{ fontWeight: 500, color: '#1e293b' }}>Catégorie:</span> {plainte.categorie_principale}
            </p>
          )}
                     <p style={{ 
             color: '#64748b', 
             margin: 0, 
             display: '-webkit-box',
             WebkitLineClamp: 2,
             WebkitBoxOrient: 'vertical',
             overflow: 'hidden'
           }}>
             <span style={{ fontWeight: 500, color: '#1e293b' }}>Description:</span> {plainte.description}
           </p>
        </div>

        {/* Barre de progression */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
            <div 
              style={{
                height: '100%',
                background: 'linear-gradient(90deg, #3b82f6, #14b8a6)',
                borderRadius: '4px',
                transition: 'width 0.8s ease',
                width: `${progressWidth}%`,
                position: 'relative'
              }}
            >
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                animation: 'pulse 2s infinite'
              }} />
            </div>
          </div>
        </div>

        {/* Étapes de statut */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
            {statusLabels.map((label, index) => {
              const isCompleted = index < statusNumber;
              const isActive = index === statusNumber;

              return (
                <div key={index} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, position: 'relative' }}>
                  {/* Ligne de connexion */}
                  {index < statusLabels.length - 1 && (
                    <div style={{
                      position: 'absolute',
                      top: '24px',
                      left: '50%',
                      width: '100%',
                      height: '2px',
                      background: '#e2e8f0',
                      zIndex: 0
                    }}>
                      {isCompleted && (
                        <div style={{
                          height: '100%',
                          background: 'linear-gradient(90deg, #10b981, #10b981)',
                          borderRadius: '2px',
                          transition: 'all 0.8s ease'
                        }} />
                      )}
                      {isActive && (
                        <div style={{
                          height: '100%',
                          background: 'linear-gradient(90deg, #3b82f6, #14b8a6)',
                          borderRadius: '2px',
                          transition: 'all 0.8s ease',
                          width: '50%'
                        }} />
                      )}
                    </div>
                  )}

                  {/* Cercle de statut */}
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '8px',
                    position: 'relative',
                    zIndex: 1,
                    background: isCompleted ? '#10b981' : isActive ? '#3b82f6' : '#e2e8f0',
                    color: isCompleted || isActive ? 'white' : '#94a3b8',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    transition: 'all 0.3s ease'
                  }}>
                    {isCompleted ? '✓' : isActive ? '●' : '○'}
                  </div>

                  {/* Label de statut */}
                  <div style={{
                    fontSize: '12px',
                    color: isCompleted ? '#10b981' : isActive ? '#3b82f6' : '#64748b',
                    fontWeight: isActive ? '600' : '500',
                    textAlign: 'center'
                  }}>
                    {label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handlePlainteClick(plainte);
            }}
            style={{
              flex: 1,
              background: '#f1f5f9',
              color: '#475569',
              padding: '12px 16px',
              borderRadius: '24px',
              fontWeight: 500,
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = '#e2e8f0';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = '#f1f5f9';
            }}
          >
            Voir détails →
          </button>
        </div>
      </div>
    );
  };

  return (
    <div>
      {/* Notification */}
      {notification.show && (
        <div style={{
          position: 'fixed',
          top: '16px',
          right: '16px',
          background: '#10b981',
          color: 'white',
          padding: '12px 24px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 50,
          animation: 'slideInRight 0.5s ease-out'
        }}>
          {notification.message}
        </div>
      )}

      {/* Section Suivi des Plaintes - Style exact de l'image */}
      <div style={{ 
        background: 'white', 
        borderRadius: '16px', 
        padding: '32px', 
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        marginBottom: '32px'
      }}>
        {/* Titre de la section */}
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#1e293b',
            margin: '0 0 8px 0'
          }}>
            Suivi des Plaintes
          </h2>
          <p style={{
            fontSize: '14px',
            color: '#64748b',
            margin: 0
          }}>
            Vue d'ensemble de l'état de traitement des réclamations
          </p>
        </div>

        {/* Barre de suivi des étapes */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          marginBottom: '32px',
          position: 'relative'
        }}>
          {/* Ligne de connexion */}
          <div style={{
            position: 'absolute',
            top: '32px',
            left: '40px',
            right: '40px',
            height: '2px',
            background: '#e2e8f0',
            zIndex: 1
          }} />

          {/* Étape REÇU - Active */}
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            position: 'relative',
            zIndex: 2,
            cursor: 'pointer'
          }}
          onClick={() => handleTypeChange('recu')}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
          >
            <div style={{
              width: '64px',
              height: '64px',
              background: activeType === 'recu' ? '#3b82f6' : '#e2e8f0',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: activeType === 'recu' ? '0 0 0 4px rgba(59, 130, 246, 0.2)' : 'none',
              marginBottom: '12px',
              transition: 'all 0.3s ease'
            }}>
              <span style={{ fontSize: '24px', color: activeType === 'recu' ? 'white' : '#94a3b8' }}>📨</span>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '14px',
                fontWeight: 'bold',
                color: activeType === 'recu' ? '#3b82f6' : '#64748b',
                marginBottom: '4px'
              }}>
                REÇU
              </div>
              <div style={{
                fontSize: '12px',
                color: '#64748b',
                maxWidth: '120px'
              }}>
                Plaintes nouvellement reçues
              </div>
            </div>
          </div>

          {/* Étape EN COURS - Cliquable */}
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            position: 'relative',
            zIndex: 2,
            cursor: 'pointer'
          }}
          onClick={() => handleTypeChange('en-cours')}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
          >
            <div style={{
              width: '64px',
              height: '64px',
              background: activeType === 'en-cours' ? '#3b82f6' : '#e2e8f0',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '12px',
              transition: 'all 0.3s ease'
            }}>
              <span style={{ fontSize: '24px', color: activeType === 'en-cours' ? 'white' : '#94a3b8' }}>⏳</span>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '14px',
                fontWeight: 'bold',
                color: activeType === 'en-cours' ? '#3b82f6' : '#64748b',
                marginBottom: '4px'
              }}>
                EN COURS
              </div>
              <div style={{
                fontSize: '12px',
                color: '#64748b',
                maxWidth: '120px'
              }}>
                Plaintes en cours de traitement
              </div>
            </div>
          </div>

          {/* Étape TRAITÉ - Cliquable */}
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            position: 'relative',
            zIndex: 2,
            cursor: 'pointer'
          }}
          onClick={() => handleTypeChange('traite')}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
          >
            <div style={{
              width: '64px',
              height: '64px',
              background: activeType === 'traite' ? '#3b82f6' : '#e2e8f0',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '12px',
              transition: 'all 0.3s ease'
            }}>
              <span style={{ fontSize: '24px', color: activeType === 'traite' ? 'white' : '#94a3b8' }}>✅</span>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '14px',
                fontWeight: 'bold',
                color: activeType === 'traite' ? '#3b82f6' : '#64748b',
                marginBottom: '4px'
              }}>
                TRAITÉ
              </div>
              <div style={{
                fontSize: '12px',
                color: '#64748b',
                maxWidth: '120px'
              }}>
                Plaintes traitées avec succès
              </div>
            </div>
          </div>

          {/* Étape CLÔTURÉ - Cliquable */}
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            position: 'relative',
            zIndex: 2,
            cursor: 'pointer'
          }}
          onClick={() => handleTypeChange('cloture')}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
          >
            <div style={{
              width: '64px',
              height: '64px',
              background: activeType === 'cloture' ? '#3b82f6' : '#e2e8f0',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '12px',
              transition: 'all 0.3s ease'
            }}>
              <span style={{ fontSize: '24px', color: activeType === 'cloture' ? 'white' : '#94a3b8' }}>🔒</span>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '14px',
                fontWeight: 'bold',
                color: activeType === 'cloture' ? '#3b82f6' : '#64748b',
                marginBottom: '4px'
              }}>
                CLÔTURÉ
              </div>
              <div style={{
                fontSize: '12px',
                color: '#64748b',
                maxWidth: '120px'
              }}>
                Plaintes clôturées définitivement
              </div>
            </div>
          </div>
        </div>

        {/* Cartes de statistiques */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(4, 1fr)', 
          gap: '24px',
          marginBottom: '32px'
        }}>
          {/* Carte REÇU */}
          <div style={{
            textAlign: 'center',
            padding: '20px',
            background: activeType === 'recu' ? '#eff6ff' : '#f8fafc',
            borderRadius: '12px',
            border: activeType === 'recu' ? '2px solid #3b82f6' : '1px solid #e2e8f0',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
          onClick={() => handleTypeChange('recu')}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
          >
            <div style={{
              fontSize: '32px',
              fontWeight: 'bold',
              color: activeType === 'recu' ? '#3b82f6' : '#64748b',
              marginBottom: '8px'
            }}>
              {statistiquesGlobales?.nouvelles || 0}
            </div>
            <div style={{
              fontSize: '14px',
              color: '#64748b',
              fontWeight: '500'
            }}>
              Plaintes reçues
            </div>
          </div>

          {/* Carte EN COURS */}
          <div style={{
            textAlign: 'center',
            padding: '20px',
            background: activeType === 'en-cours' ? '#eff6ff' : '#f8fafc',
            borderRadius: '12px',
            border: activeType === 'en-cours' ? '2px solid #3b82f6' : '1px solid #e2e8f0',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
          onClick={() => handleTypeChange('en-cours')}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
          >
            <div style={{
              fontSize: '32px',
              fontWeight: 'bold',
              color: activeType === 'en-cours' ? '#3b82f6' : '#64748b',
              marginBottom: '8px'
            }}>
              {statistiquesGlobales?.en_cours || 0}
            </div>
            <div style={{
              fontSize: '14px',
              color: '#64748b',
              fontWeight: '500'
            }}>
              Plaintes en cours
            </div>
          </div>

          {/* Carte TRAITÉ */}
          <div style={{
            textAlign: 'center',
            padding: '20px',
            background: activeType === 'traite' ? '#eff6ff' : '#f8fafc',
            borderRadius: '12px',
            border: activeType === 'traite' ? '2px solid #3b82f6' : '1px solid #e2e8f0',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
          onClick={() => handleTypeChange('traite')}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
          >
            <div style={{
              fontSize: '32px',
              fontWeight: 'bold',
              color: activeType === 'traite' ? '#3b82f6' : '#64748b',
              marginBottom: '8px'
            }}>
              {statistiquesGlobales?.traitees || 0}
            </div>
            <div style={{
              fontSize: '14px',
              color: '#64748b',
              fontWeight: '500'
            }}>
              Plaintes traitées
            </div>
          </div>

          {/* Carte CLÔTURÉ */}
          <div style={{
            textAlign: 'center',
            padding: '20px',
            background: activeType === 'cloture' ? '#eff6ff' : '#f8fafc',
            borderRadius: '12px',
            border: activeType === 'cloture' ? '2px solid #3b82f6' : '1px solid #e2e8f0',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
          onClick={() => handleTypeChange('cloture')}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
          >
            <div style={{
              fontSize: '32px',
              fontWeight: 'bold',
              color: activeType === 'cloture' ? '#3b82f6' : '#64748b',
              marginBottom: '8px'
            }}>
              {statistiquesGlobales?.cloturees || 0}
            </div>
            <div style={{
              fontSize: '14px',
              color: '#64748b',
              fontWeight: '500'
            }}>
              Plaintes clôturées
            </div>
          </div>
        </div>

        {/* Barre de progression globale */}
        <div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '12px'
          }}>
            <span style={{
              fontSize: '14px',
              fontWeight: '600',
              color: '#1e293b'
            }}>
              Progression globale
            </span>
            <span style={{
              fontSize: '14px',
              fontWeight: '600',
              color: '#64748b'
            }}>
              29%
            </span>
          </div>
          <div style={{
            height: '8px',
            background: '#e2e8f0',
            borderRadius: '4px',
            overflow: 'hidden'
          }}>
            <div style={{
              height: '100%',
              width: '29%',
              background: 'linear-gradient(90deg, #3b82f6, #14b8a6)',
              borderRadius: '4px',
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>
      </div>

      {/* Liste des plaintes */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px' }}>
          {[...Array(6)].map((_, i) => (
            <div key={i} style={{
              background: 'white',
              borderRadius: '12px',
              padding: '24px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              border: '1px solid #f1f5f9',
              animation: 'pulse 2s infinite'
            }}>
              <div style={{ height: '24px', background: '#e2e8f0', borderRadius: '4px', marginBottom: '16px' }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
                <div style={{ height: '16px', background: '#e2e8f0', borderRadius: '4px' }} />
                <div style={{ height: '16px', background: '#e2e8f0', borderRadius: '4px', width: '75%' }} />
                <div style={{ height: '16px', background: '#e2e8f0', borderRadius: '4px', width: '50%' }} />
              </div>
              <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', marginBottom: '24px' }} />
              <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
                <div style={{ width: '48px', height: '48px', background: '#e2e8f0', borderRadius: '50%' }} />
                <div style={{ width: '48px', height: '48px', background: '#e2e8f0', borderRadius: '50%' }} />
                <div style={{ width: '48px', height: '48px', background: '#e2e8f0', borderRadius: '50%' }} />
                <div style={{ width: '48px', height: '48px', background: '#e2e8f0', borderRadius: '50%' }} />
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ flex: 1, height: '40px', background: '#e2e8f0', borderRadius: '24px' }} />
                <div style={{ flex: 1, height: '40px', background: '#e2e8f0', borderRadius: '24px' }} />
              </div>
            </div>
          ))}
        </div>
      ) : plaintes.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 0' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
          <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#1e293b', margin: '0 0 8px 0' }}>
            Aucune plainte trouvée
          </h3>
          <p style={{ color: '#64748b', margin: 0 }}>
            Aucune plainte ne correspond aux critères de recherche actuels.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px' }}>
          {plaintes.map(createComplaintCard)}
        </div>
      )}

      {/* Pagination */}
      {!loading && plaintes.length > 0 && (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          gap: '16px',
          marginTop: '32px',
          padding: '24px'
        }}>
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            style={{
              padding: '8px 16px',
              background: currentPage <= 1 ? '#f1f5f9' : '#3b82f6',
              color: currentPage <= 1 ? '#94a3b8' : 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            Précédent
          </button>
          
          <span style={{ color: '#64748b', fontWeight: '500' }}>
            Page {currentPage} sur {Math.ceil(total / limit)}
          </span>
          
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= Math.ceil(total / limit)}
            style={{
              padding: '8px 16px',
              background: currentPage >= Math.ceil(total / limit) ? '#f1f5f9' : '#3b82f6',
              color: currentPage >= Math.ceil(total / limit) ? '#94a3b8' : 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: currentPage >= Math.ceil(total / limit) ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            Suivant
          </button>
        </div>
      )}
    </div>
  );
};

export default DashboardUnifiedPlaintes; 