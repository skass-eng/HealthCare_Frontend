/**
 * DevNotificationTester
 * 
 * Composant de développement pour tester les notifications de plaintes
 * sans avoir besoin du backend WebSocket.
 * 
 * À SUPPRIMER EN PRODUCTION
 */

import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Box, 
  Button, 
  Typography, 
  Paper, 
  Stack,
  Divider,
  IconButton,
  Collapse
} from '@mui/material';
import { 
  BugReport as BugIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon
} from '@mui/icons-material';
import { RootState } from '@/store';
import {
  addPendingTask,
  removePendingTask,
  addPlainteNotification,
  markAllNotificationsAsRead,
  clearAllNotifications,
  PlainteNotification,
} from '@/store/slices/plaintesNotificationSlice';
import { addNotification } from '@/store/slices/notificationSlice';

const DevNotificationTester: React.FC = () => {
  const dispatch = useDispatch();
  const [isExpanded, setIsExpanded] = useState(false);
  const { unreadCount, pendingTasks, notifications } = useSelector(
    (state: RootState) => state.plaintesNotification
  );

  // Simuler le démarrage d'une extraction PDF
  const simulatePdfStart = () => {
    const taskId = `test_pdf_${Date.now()}`;
    
    dispatch(addPendingTask({
      task_id: taskId,
      type: 'pdf_extraction',
      filename: 'plainte_test.pdf',
      started_at: new Date().toISOString(),
      progress: 0,
      step: 'Démarrage...',
    }));

    dispatch(addNotification({
      id: `start_${taskId}`,
      type: 'info',
      title: '📄 Traitement en cours',
      message: 'Extraction du PDF "plainte_test.pdf" en cours...',
      timestamp: new Date().toISOString(),
      read: false,
    }));

    // Simuler la completion après 3 secondes
    setTimeout(() => {
      dispatch(removePendingTask(taskId));
      
      const notification: PlainteNotification = {
        id: `pdf_complete_${taskId}`,
        type: 'pdf_extraction',
        status: 'success',
        title: '📄 Nouvelle plainte créée !',
        message: 'Le PDF "plainte_test.pdf" a été traité avec succès.',
        task_id: taskId,
        filename: 'plainte_test.pdf',
        timestamp: new Date().toISOString(),
        read: false,
        navigation: {
          href: '/plaintes/nouvelles',
          label: 'Voir la plainte',
        },
      };

      dispatch(addPlainteNotification(notification));
      
      dispatch(addNotification({
        id: `toast_${taskId}`,
        type: 'success',
        title: '✅ Plainte créée avec succès',
        message: 'Le PDF "plainte_test.pdf" a été traité.',
        timestamp: new Date().toISOString(),
        read: false,
      }));
    }, 3000);
  };

  // Simuler le démarrage d'une extraction Image
  const simulateImageStart = () => {
    const taskId = `test_img_${Date.now()}`;
    
    dispatch(addPendingTask({
      task_id: taskId,
      type: 'image_extraction',
      filename: 'photo_plainte.jpg',
      started_at: new Date().toISOString(),
      progress: 0,
      step: 'Démarrage OCR...',
    }));

    dispatch(addNotification({
      id: `start_img_${taskId}`,
      type: 'info',
      title: '📷 Traitement en cours',
      message: 'Analyse de l\'image "photo_plainte.jpg" en cours...',
      timestamp: new Date().toISOString(),
      read: false,
    }));

    // Simuler la completion après 3 secondes
    setTimeout(() => {
      dispatch(removePendingTask(taskId));
      
      const notification: PlainteNotification = {
        id: `img_complete_${taskId}`,
        type: 'image_extraction',
        status: 'success',
        title: '📷 Nouvelle plainte créée !',
        message: 'L\'image "photo_plainte.jpg" a été analysée avec succès.',
        task_id: taskId,
        filename: 'photo_plainte.jpg',
        timestamp: new Date().toISOString(),
        read: false,
        navigation: {
          href: '/plaintes/nouvelles',
          label: 'Voir la plainte',
        },
      };

      dispatch(addPlainteNotification(notification));
      
      dispatch(addNotification({
        id: `toast_img_${taskId}`,
        type: 'success',
        title: '✅ Plainte créée avec succès',
        message: 'L\'image "photo_plainte.jpg" a été analysée.',
        timestamp: new Date().toISOString(),
        read: false,
      }));
    }, 3000);
  };

  // Simuler une erreur
  const simulateError = () => {
    const taskId = `test_error_${Date.now()}`;
    
    const notification: PlainteNotification = {
      id: `error_${taskId}`,
      type: 'pdf_extraction',
      status: 'error',
      title: '❌ Erreur de traitement',
      message: 'Échec du traitement: Le fichier est corrompu.',
      task_id: taskId,
      filename: 'fichier_corrompu.pdf',
      timestamp: new Date().toISOString(),
      read: false,
    };

    dispatch(addPlainteNotification(notification));
    
    dispatch(addNotification({
      id: `toast_error_${taskId}`,
      type: 'error',
      title: '❌ Erreur de traitement',
      message: 'Le fichier est corrompu.',
      timestamp: new Date().toISOString(),
      read: false,
    }));
  };

  // Ne pas afficher en production
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <Paper
      sx={{
        position: 'fixed',
        bottom: 16,
        left: 340,
        zIndex: 9999,
        maxWidth: 350,
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        backdropFilter: 'blur(10px)',
        borderRadius: 2,
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 1.5,
          backgroundColor: 'rgba(239, 68, 68, 0.2)',
          cursor: 'pointer',
        }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <BugIcon sx={{ color: '#ef4444', fontSize: 20 }} />
          <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 'bold' }}>
            🧪 Dev Notification Tester
          </Typography>
        </Box>
        <IconButton size="small" sx={{ color: 'white' }}>
          {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </Box>

      <Collapse in={isExpanded}>
        <Box sx={{ p: 2 }}>
          {/* Status */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" sx={{ color: '#94a3b8' }}>
              Notifications non lues: <strong style={{ color: '#ef4444' }}>{unreadCount}</strong>
            </Typography>
            <br />
            <Typography variant="caption" sx={{ color: '#94a3b8' }}>
              Tâches en cours: <strong style={{ color: '#f59e0b' }}>{pendingTasks.length}</strong>
            </Typography>
            <br />
            <Typography variant="caption" sx={{ color: '#94a3b8' }}>
              Total notifications: <strong style={{ color: '#3b82f6' }}>{notifications.length}</strong>
            </Typography>
          </Box>

          <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', mb: 2 }} />

          {/* Buttons */}
          <Stack spacing={1}>
            <Button
              variant="contained"
              size="small"
              onClick={simulatePdfStart}
              sx={{
                backgroundColor: '#3b82f6',
                '&:hover': { backgroundColor: '#2563eb' },
                textTransform: 'none',
              }}
            >
              📄 Simuler PDF (3s)
            </Button>
            
            <Button
              variant="contained"
              size="small"
              onClick={simulateImageStart}
              sx={{
                backgroundColor: '#10b981',
                '&:hover': { backgroundColor: '#059669' },
                textTransform: 'none',
              }}
            >
              📷 Simuler Image (3s)
            </Button>
            
            <Button
              variant="contained"
              size="small"
              onClick={simulateError}
              sx={{
                backgroundColor: '#ef4444',
                '&:hover': { backgroundColor: '#dc2626' },
                textTransform: 'none',
              }}
            >
              ❌ Simuler Erreur
            </Button>

            <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />

            <Button
              variant="outlined"
              size="small"
              onClick={() => dispatch(markAllNotificationsAsRead())}
              sx={{
                borderColor: '#64748b',
                color: '#94a3b8',
                '&:hover': { borderColor: '#94a3b8', backgroundColor: 'rgba(148, 163, 184, 0.1)' },
                textTransform: 'none',
              }}
            >
              ✓ Tout marquer comme lu
            </Button>
            
            <Button
              variant="outlined"
              size="small"
              onClick={() => dispatch(clearAllNotifications())}
              sx={{
                borderColor: '#ef4444',
                color: '#ef4444',
                '&:hover': { borderColor: '#f87171', backgroundColor: 'rgba(239, 68, 68, 0.1)' },
                textTransform: 'none',
              }}
            >
              🗑️ Effacer tout
            </Button>
          </Stack>
        </Box>
      </Collapse>
    </Paper>
  );
};

export default DevNotificationTester;
