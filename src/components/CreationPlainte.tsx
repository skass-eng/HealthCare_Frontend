import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@mui/material';
import { Button } from '@mui/material';
import { Box, Typography, Alert, CircularProgress } from '@mui/material';
import { 
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { apiService } from '@/lib/api';
import { PlainteCreate, Service } from '@/types';
import { toast } from 'sonner';

interface CreationPlainteProps {
  onPlainteCreated?: (plainteId: number) => void;
  onCancel?: () => void;
}

export default function CreationPlainte({ onPlainteCreated, onCancel }: CreationPlainteProps) {
  const [loading, setLoading] = useState(false);
  const [analysing, setAnalysing] = useState(false);
  const [services, setServices] = useState<Service[]>([]);

  // État du formulaire
  const [formData, setFormData] = useState<PlainteCreate>({
    titre: '',
    description: '',
    service_id: undefined,
    date_incident: undefined
  });

  // Charger les services au montage
  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      const response = await apiService.getServices();
      if (response.success && response.data) {
        setServices(response.data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des services:', error);
      toast.error('Erreur lors du chargement des services');
    }
  };

  const handleInputChange = (field: keyof PlainteCreate, value: any) => {
    console.log(`Changement ${field}:`, value);
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.titre.trim()) {
      toast.error('Le titre est obligatoire');
      return false;
    }
    if (!formData.description.trim()) {
      toast.error('La description est obligatoire');
      return false;
    }
    if (!formData.service_id) {
      toast.error('Veuillez sélectionner un service');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setAnalysing(false);

    try {
      const response = await apiService.createPlainte(formData);
      
      if (response.success && response.data) {
        toast.success('Plainte créée avec succès !');
        
        if (onPlainteCreated) {
          onPlainteCreated(response.data.id);
        }

        setFormData({
          titre: '',
          description: '',
          service_id: undefined,
          date_incident: undefined
        });
      } else {
        toast.error('Erreur lors de la création de la plainte');
      }
    } catch (error) {
      console.error('Erreur lors de la création:', error);
      toast.error('Erreur lors de la création de la plainte');
    } finally {
      setLoading(false);
      setAnalysing(false);
    }
  };

  return (
    <Card sx={{ maxWidth: 800, mx: 'auto', mt: 2 }}>
      <CardHeader
        title={
          <Box display="flex" alignItems="center" gap={1}>
            <CheckCircleIcon className="h-5 w-5 text-green-600" />
            <Typography variant="h5">Test Formulaire - Création d'une nouvelle plainte</Typography>
          </Box>
        }
      />
      
      <CardContent>
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          
          {/* Test avec champs HTML natifs */}
          <Box sx={{ p: 2, border: '2px solid red', backgroundColor: 'yellow' }}>
            <Typography variant="h6" gutterBottom>Test avec champs HTML natifs:</Typography>
            
            <Box sx={{ mb: 2 }}>
              <label htmlFor="titre-test">Titre (HTML natif):</label>
              <input
                id="titre-test"
                type="text"
                value={formData.titre}
                onChange={(e) => {
                  console.log('Input HTML natif change:', e.target.value);
                  handleInputChange('titre', e.target.value);
                }}
                placeholder="Titre de la plainte"
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  backgroundColor: 'white',
                  color: 'black'
                }}
              />
            </Box>

            <Box sx={{ mb: 2 }}>
              <label htmlFor="description-test">Description (HTML natif):</label>
              <textarea
                id="description-test"
                value={formData.description}
                onChange={(e) => {
                  console.log('Textarea HTML natif change:', e.target.value);
                  handleInputChange('description', e.target.value);
                }}
                placeholder="Description de la plainte"
                rows={4}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  backgroundColor: 'white',
                  color: 'black'
                }}
              />
            </Box>

            <Box sx={{ mb: 2 }}>
              <label htmlFor="service-test">Service (HTML natif):</label>
              <select
                id="service-test"
                value={formData.service_id?.toString() || ''}
                onChange={(e) => {
                  console.log('Select HTML natif change:', e.target.value);
                  handleInputChange('service_id', e.target.value ? parseInt(e.target.value) : undefined);
                }}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  backgroundColor: 'white',
                  color: 'black'
                }}
              >
                <option value="">Sélectionner un service</option>
                {services.map((service) => (
                  <option key={service.id} value={service.id.toString()}>
                    {service.nom}
                  </option>
                ))}
              </select>
            </Box>
          </Box>

          {/* Affichage des valeurs actuelles */}
          <Box sx={{ p: 2, border: '2px solid blue', backgroundColor: 'lightblue' }}>
            <Typography variant="h6" gutterBottom>Valeurs actuelles du formulaire:</Typography>
            <pre style={{ fontSize: '12px' }}>
              {JSON.stringify(formData, null, 2)}
            </pre>
          </Box>

          {/* Actions */}
          <Box display="flex" justifyContent="flex-end" gap={2} pt={2}>
            <Button
              variant="outlined"
              onClick={onCancel}
              disabled={loading}
            >
              Annuler
            </Button>
            
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <PlusIcon className="h-4 w-4" />}
            >
              {loading ? 'Création...' : 'Créer la plainte'}
            </Button>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
} 