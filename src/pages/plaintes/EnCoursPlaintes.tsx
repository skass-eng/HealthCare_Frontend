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
  CircularProgress,
  LinearProgress
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  PlayArrow as PlayArrowIcon,
  Pause as PauseIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface PlainteEnCours {
  id: string;
  titre: string;
  description: string;
  service: string;
  priorite: 'basse' | 'moyenne' | 'haute';
  dateDebut: string;
  progression: number;
  assigne: string;
}

const EnCoursPlaintes: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [plaintes, setPlaintes] = useState<PlainteEnCours[]>([]);

  // Données mockées
  const mockPlaintes: PlainteEnCours[] = [
    {
      id: '1',
      titre: 'Retard dans le traitement',
      description: 'Patient signalant un retard dans le traitement prescrit',
      service: 'Cardiologie',
      priorite: 'haute',
      dateDebut: '2024-01-15',
      progression: 75,
      assigne: 'Dr. Martin'
    },
    {
      id: '2',
      titre: 'Erreur de médication',
      description: 'Erreur dans l\'administration de médicaments',
      service: 'Pharmacie',
      priorite: 'haute',
      dateDebut: '2024-01-14',
      progression: 45,
      assigne: 'Dr. Dubois'
    },
    {
      id: '3',
      titre: 'Problème d\'hygiène',
      description: 'Conditions d\'hygiène insatisfaisantes',
      service: 'Hygiène',
      priorite: 'moyenne',
      dateDebut: '2024-01-13',
      progression: 90,
      assigne: 'M. Bernard'
    }
  ];

  useEffect(() => {
    setTimeout(() => {
      setPlaintes(mockPlaintes);
      setLoading(false);
    }, 1000);
  }, []);

  const getPrioriteColor = (priorite: string) => {
    switch (priorite) {
      case 'haute':
        return 'error';
      case 'moyenne':
        return 'warning';
      case 'basse':
        return 'success';
      default:
        return 'default';
    }
  };

  const handleViewPlainte = (id: string) => {
    navigate(`/plaintes/${id}`);
  };

  const handlePausePlainte = (id: string) => {
    console.log('Mettre en pause la plainte:', id);
  };

  const handleResumePlainte = (id: string) => {
    console.log('Reprendre la plainte:', id);
  };

  const handleCompletePlainte = (id: string) => {
    console.log('Terminer la plainte:', id);
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
          Plaintes En Cours
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Suivi des plaintes en cours de traitement
        </Typography>
      </Box>

      {/* Statistiques */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h4" fontWeight="bold" color="primary">
                {plaintes.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                En cours de traitement
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h4" fontWeight="bold" color="warning.main">
                {plaintes.filter(p => p.priorite === 'haute').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Priorité haute
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h4" fontWeight="bold" color="info.main">
                {Math.round(plaintes.reduce((acc, p) => acc + p.progression, 0) / plaintes.length)}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Progression moyenne
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h4" fontWeight="bold" color="success.main">
                {plaintes.filter(p => p.progression >= 90).length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Prêtes à terminer
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tableau des plaintes */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Liste des Plaintes En Cours
          </Typography>
          <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>ID</strong></TableCell>
                  <TableCell><strong>Titre</strong></TableCell>
                  <TableCell><strong>Service</strong></TableCell>
                  <TableCell><strong>Assigné</strong></TableCell>
                  <TableCell><strong>Priorité</strong></TableCell>
                  <TableCell><strong>Progression</strong></TableCell>
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
                    <TableCell>
                      <Chip
                        label={plainte.priorite}
                        color={getPrioriteColor(plainte.priorite) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ width: '100%', mr: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={plainte.progression}
                          sx={{ height: 8, borderRadius: 5 }}
                        />
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        {plainte.progression}%
                      </Typography>
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
                      <Tooltip title="Mettre en pause">
                        <IconButton
                          size="small"
                          onClick={() => handlePausePlainte(plainte.id)}
                          color="warning"
                        >
                          <PauseIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Reprendre">
                        <IconButton
                          size="small"
                          onClick={() => handleResumePlainte(plainte.id)}
                          color="info"
                        >
                          <PlayArrowIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Terminer">
                        <IconButton
                          size="small"
                          onClick={() => handleCompletePlainte(plainte.id)}
                          color="success"
                        >
                          <CheckCircleIcon />
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

export default EnCoursPlaintes; 