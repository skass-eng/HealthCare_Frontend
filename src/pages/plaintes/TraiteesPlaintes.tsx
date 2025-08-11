import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  Typography, 
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  CheckCircle as CheckCircleIcon,
  History as HistoryIcon,
  Download as DownloadIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface PlainteTraitee {
  id: string;
  titre: string;
  description: string;
  service: string;
  dateResolution: string;
  tempsResolution: string;
  resolution: string;
  assigne: string;
}

const TraiteesPlaintes: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [plaintes, setPlaintes] = useState<PlainteTraitee[]>([]);

  // Données mockées
  const mockPlaintes: PlainteTraitee[] = [
    {
      id: '1',
      titre: 'Problème d\'hygiène',
      description: 'Conditions d\'hygiène insatisfaisantes',
      service: 'Hygiène',
      dateResolution: '2024-01-15',
      tempsResolution: '2 jours',
      resolution: 'Nettoyage effectué et protocoles mis à jour',
      assigne: 'M. Bernard'
    },
    {
      id: '2',
      titre: 'Erreur de médication',
      description: 'Erreur dans l\'administration de médicaments',
      service: 'Pharmacie',
      dateResolution: '2024-01-14',
      tempsResolution: '1 jour',
      resolution: 'Médication corrigée et protocole de vérification renforcé',
      assigne: 'Dr. Dubois'
    },
    {
      id: '3',
      titre: 'Retard dans le traitement',
      description: 'Patient signalant un retard dans le traitement prescrit',
      service: 'Cardiologie',
      dateResolution: '2024-01-13',
      tempsResolution: '3 jours',
      resolution: 'Traitement administré et suivi mis en place',
      assigne: 'Dr. Martin'
    }
  ];

  useEffect(() => {
    setTimeout(() => {
      setPlaintes(mockPlaintes);
      setLoading(false);
    }, 1000);
  }, []);

  const handleViewPlainte = (id: string) => {
    navigate(`/plaintes/${id}`);
  };

  const handleDownloadReport = (id: string) => {
    console.log('Télécharger le rapport pour la plainte:', id);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" fontWeight="bold" color="primary" gutterBottom>
          Plaintes Traitées
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Historique des plaintes résolues avec succès
        </Typography>
      </Box>

      {/* Statistiques */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h4" fontWeight="bold" color="success.main">
                {plaintes.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Plaintes traitées
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h4" fontWeight="bold" color="info.main">
                {Math.round(plaintes.reduce((acc, p) => {
                  const jours = parseInt(p.tempsResolution.split(' ')[0]);
                  return acc + jours;
                }, 0) / plaintes.length)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Jours moyens de résolution
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h4" fontWeight="bold" color="warning.main">
                {plaintes.filter(p => p.service === 'Pharmacie').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Erreurs médicales
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h4" fontWeight="bold" color="primary.main">
                {plaintes.filter(p => p.service === 'Hygiène').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Problèmes d'hygiène
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tableau des plaintes */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Historique des Plaintes Traitées
          </Typography>
          <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>ID</strong></TableCell>
                  <TableCell><strong>Titre</strong></TableCell>
                  <TableCell><strong>Service</strong></TableCell>
                  <TableCell><strong>Assigné</strong></TableCell>
                  <TableCell><strong>Date Résolution</strong></TableCell>
                  <TableCell><strong>Temps</strong></TableCell>
                  <TableCell><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {plaintes.map((plainte) => (
                  <TableRow key={plainte.id} hover>
                    <TableCell>{plainte.id}</TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {plainte.titre}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {plainte.description.substring(0, 50)}...
                      </Typography>
                    </TableCell>
                    <TableCell>{plainte.service}</TableCell>
                    <TableCell>{plainte.assigne}</TableCell>
                    <TableCell>{plainte.dateResolution}</TableCell>
                    <TableCell>
                      <Chip
                        label={plainte.tempsResolution}
                        color="success"
                        size="small"
                        icon={<CheckCircleIcon />}
                      />
                    </TableCell>
                    <TableCell>
                      <Tooltip title="Voir détails">
                        <IconButton
                          size="small"
                          onClick={() => handleViewPlainte(plainte.id)}
                          color="primary"
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Télécharger rapport">
                        <IconButton
                          size="small"
                          onClick={() => handleDownloadReport(plainte.id)}
                          color="info"
                        >
                          <DownloadIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Historique">
                        <IconButton
                          size="small"
                          color="secondary"
                        >
                          <HistoryIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

export default TraiteesPlaintes; 