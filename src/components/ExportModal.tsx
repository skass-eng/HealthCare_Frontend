import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  Select,
  MenuItem,
  Box,
  Typography,
  Alert,
  CircularProgress,
  IconButton,
  Skeleton
} from '@mui/material';
import {
  Close as CloseIcon,
  FileDownload as FileDownloadIcon,
  CloudDownload as CloudDownloadIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { apiService } from '@/lib/api';
import { API_CONSTANTS, JWT_STORAGE_KEY } from '@/lib/constants';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ExportConfig {
  format: 'csv' | 'json' | 'xlsx';
  statut: string;
  service: string;
  date_debut: string;
  date_fin: string;
}

// Statuts disponibles (depuis l'enum StatutPlainte du backend)
const STATUTS_PLAINTES = [
  { value: '', label: 'Toutes les plaintes' },
  { value: 'RECU', label: 'Reçues (Nouvelles)' },
  { value: 'EN_COURS', label: 'En cours de traitement' },
  { value: 'TRAITE', label: 'Traitées' },
  { value: 'CLOTURE', label: 'Clôturées' }
];

interface ServiceOption {
  id: number;
  nom: string;
  description?: string;
  actif?: boolean;
}

export default function ExportModal({ isOpen, onClose }: ExportModalProps) {
  const [loading, setLoading] = useState(false);
  const [loadingServices, setLoadingServices] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [services, setServices] = useState<ServiceOption[]>([]);
  
  const [exportConfig, setExportConfig] = useState<ExportConfig>({
    format: 'csv',
    statut: '',
    service: '',
    date_debut: '',
    date_fin: ''
  });

  // Charger les services depuis l'API
  const loadServices = async () => {
    try {
      setLoadingServices(true);
      const response = await apiService.getServicesForComplaint();
      if (response.success && response.data) {
        setServices(response.data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des services:', error);
    } finally {
      setLoadingServices(false);
    }
  };

  // Charger les services et définir les dates par défaut à l'ouverture
  useEffect(() => {
    if (isOpen) {
      loadServices();
      
      // Définir les dates par défaut (1 mois en arrière jusqu'à aujourd'hui)
      const today = new Date();
      const oneMonthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
      
      setExportConfig(prev => ({
        ...prev,
        date_debut: oneMonthAgo.toISOString().split('T')[0],
        date_fin: today.toISOString().split('T')[0]
      }));
    }
  }, [isOpen]);

  const handleExport = async () => {
    try {
      setLoading(true);
      setMessage(null);
      
      // Construire les paramètres selon ce que le backend attend
      const params: Record<string, string> = { format: exportConfig.format };
      if (exportConfig.statut) params.statut = exportConfig.statut;
      if (exportConfig.service) params.service_id = exportConfig.service; // Backend attend service_id
      if (exportConfig.date_debut) params.date_debut = exportConfig.date_debut;
      if (exportConfig.date_fin) params.date_fin = exportConfig.date_fin;
      
      // Construire l'URL avec les paramètres
      const searchParams = new URLSearchParams();
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
          searchParams.set(key, params[key].toString());
        }
      });
      
      const query = searchParams.toString();
      const url = `${API_CONSTANTS.apiUrlBase}/plaintes/export${query ? `?${query}` : ''}`;
      
      // Récupérer le token d'authentification
      const token = localStorage.getItem(JWT_STORAGE_KEY);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      if (exportConfig.format === 'csv') {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `plaintes_export_${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        setMessage({
          type: 'success',
          text: 'Export CSV téléchargé avec succès !'
        });
      } else {
        const data = await response.json();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `plaintes_export_${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        setMessage({
          type: 'success',
          text: 'Export JSON téléchargé avec succès !'
        });
      }
      
      setTimeout(() => {
        onClose();
        setMessage(null);
      }, 2000);
      
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
      setMessage({
        type: 'error',
        text: 'Erreur lors de l\'export. Veuillez réessayer.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog 
      open={isOpen} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          overflow: 'hidden',
          animation: 'slideIn 0.3s ease-out'
        }
      }}
    >
      {/* Header avec gradient */}
      <DialogTitle sx={{ 
        background: 'linear-gradient(135deg, #4f8ff7 0%, #6b73ff 100%)',
        color: 'white',
        padding: '24px 32px',
        position: 'relative'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <CloudDownloadIcon sx={{ fontSize: 24, color: 'white' }} />
            <Typography variant="h6" sx={{ fontWeight: 600, color: 'white' }}>
              Exporter les plaintes
            </Typography>
          </Box>
          <IconButton 
            onClick={onClose} 
            sx={{ 
              background: 'rgba(255,255,255,0.2)',
              color: 'white',
              width: 32,
              height: 32,
              '&:hover': {
                background: 'rgba(255,255,255,0.3)'
              }
            }}
          >
            <CloseIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>
        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 400, mt: 0.5 }}>
          Téléchargez vos données au format CSV ou JSON
        </Typography>
      </DialogTitle>

      {/* Body */}
      <DialogContent sx={{ padding: '24px' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Format */}
          <Box sx={{ mt: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, color: '#374151', mb: 1 }}>
              Format d'export
            </Typography>
            <FormControl fullWidth>
              <Select
                value={exportConfig.format}
                onChange={(e) => setExportConfig(prev => ({ 
                  ...prev, 
                  format: e.target.value as 'csv' | 'json' | 'xlsx' 
                }))}
                sx={{
                  borderRadius: 3,
                  background: '#fafbfc',
                  '& .MuiOutlinedInput-notchedOutline': {
                    border: '2px solid #e5e7eb',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#4f8ff7'
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#4f8ff7',
                    borderWidth: '2px'
                  }
                }}
              >
                <MenuItem value="csv">CSV (Excel) - UTF-8</MenuItem>
                <MenuItem value="json">JSON</MenuItem>
                <MenuItem value="xlsx">Excel (.xlsx)</MenuItem>
              </Select>
            </FormControl>
            {exportConfig.format === 'csv' && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5, mb: 1 }}>
          <InfoIcon sx={{ fontSize: 12, color: '#6b7280' }} />
          <Typography variant="caption" sx={{ color: '#6b7280', fontSize: '12px' }}>
            Encodage UTF-8 pour support complet du français
          </Typography>
        </Box>
            )}
          </Box>

          {/* Statut */}
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600, color: '#374151', mb: 1 }}>
              Statut des plaintes
            </Typography>
            <FormControl fullWidth>
              <Select
                value={exportConfig.statut}
                onChange={(e) => setExportConfig(prev => ({ ...prev, statut: e.target.value }))}
                displayEmpty
                sx={{
                  borderRadius: 3,
                  background: '#fafbfc',
                  '& .MuiOutlinedInput-notchedOutline': {
                    border: '2px solid #e5e7eb',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#4f8ff7'
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#4f8ff7',
                    borderWidth: '2px'
                  }
                }}
              >
                {STATUTS_PLAINTES.map((statut) => (
                  <MenuItem key={statut.value} value={statut.value}>
                    {statut.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Catégorie / Service */}
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600, color: '#374151', mb: 1 }}>
              Catégorie
            </Typography>
            <FormControl fullWidth>
              {loadingServices ? (
                <Skeleton variant="rounded" height={56} sx={{ borderRadius: 3 }} />
              ) : (
                <Select
                  value={exportConfig.service}
                  onChange={(e) => setExportConfig(prev => ({ ...prev, service: e.target.value }))}
                  displayEmpty
                  sx={{
                    borderRadius: 3,
                    background: '#fafbfc',
                    '& .MuiOutlinedInput-notchedOutline': {
                      border: '2px solid #e5e7eb',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#4f8ff7'
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#4f8ff7',
                      borderWidth: '2px'
                    }
                  }}
                >
                  <MenuItem value="">Toutes les catégories</MenuItem>
                  {services.map((service) => (
                    <MenuItem key={service.id} value={service.id.toString()}>
                      {service.nom}
                    </MenuItem>
                  ))}
                </Select>
              )}
            </FormControl>
          </Box>

          {/* Période */}
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600, color: '#374151', mb: 1 }}>
              Période
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <Box>
                <Typography variant="caption" sx={{ color: '#6b7280', fontSize: '12px', display: 'block', mb: 0.5 }}>
                  Date début
                </Typography>
                <TextField
                  type="date"
                  value={exportConfig.date_debut}
                  onChange={(e) => setExportConfig(prev => ({ ...prev, date_debut: e.target.value }))}
                  fullWidth
                  InputProps={{
                    sx: {
                      borderRadius: 3,
                      background: '#fafbfc',
                      '& .MuiOutlinedInput-notchedOutline': {
                        border: '2px solid #e5e7eb',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#4f8ff7'
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#4f8ff7',
                        borderWidth: '2px'
                      }
                    }
                  }}
                />
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#6b7280', fontSize: '12px', display: 'block', mb: 0.5 }}>
                  Date fin
                </Typography>
                <TextField
                  type="date"
                  value={exportConfig.date_fin}
                  onChange={(e) => setExportConfig(prev => ({ ...prev, date_fin: e.target.value }))}
                  fullWidth
                  InputProps={{
                    sx: {
                      borderRadius: 3,
                      background: '#fafbfc',
                      '& .MuiOutlinedInput-notchedOutline': {
                        border: '2px solid #e5e7eb',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#4f8ff7'
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#4f8ff7',
                        borderWidth: '2px'
                      }
                    }
                  }}
                />
              </Box>
            </Box>
          </Box>

          {/* Message */}
          {message && (
            <Alert 
              severity={message.type === 'success' ? 'success' : 'error'}
              sx={{ mt: 2 }}
            >
              {message.text}
            </Alert>
          )}
        </Box>
      </DialogContent>

      {/* Footer */}
      <DialogActions sx={{ 
        padding: '20px 24px', 
        background: '#f9fafb', 
        borderTop: '1px solid #e5e7eb',
        gap: 2
      }}>
        <Button 
          onClick={onClose} 
          variant="outlined"
          sx={{
            borderRadius: 2.5,
            textTransform: 'none',
            fontWeight: 600,
            px: 3,
            py: 1.5,
            borderColor: '#e5e7eb',
            color: '#374151',
            '&:hover': {
              background: '#e5e7eb',
              borderColor: '#d1d5db'
            }
          }}
        >
          Annuler
        </Button>
        <Button
          onClick={handleExport}
          disabled={loading}
          variant="contained"
          startIcon={loading ? <CircularProgress size={16} /> : <FileDownloadIcon />}
          sx={{
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
              transform: 'translateY(-1px)',
              boxShadow: '0 8px 20px rgba(16, 185, 129, 0.4)'
            },
            '&:disabled': {
              background: '#9ca3af'
            },
            borderRadius: 2.5,
            px: 3,
            py: 1.5,
            fontWeight: 600,
            textTransform: 'none',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
          }}
        >
          {loading ? 'Génération...' : 'Télécharger l\'export'}
        </Button>
      </DialogActions>
    </Dialog>
  );
} 