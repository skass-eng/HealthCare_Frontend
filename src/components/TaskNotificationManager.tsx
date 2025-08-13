import React, { useEffect, useState } from 'react';
import { Snackbar, Alert, AlertTitle, Slide, LinearProgress } from '@mui/material';
import { CheckCircle, Info, Warning, Error } from '@mui/icons-material';

interface Notification {
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  plainte_id?: number;
}

interface TaskNotificationProps {
  plainteId?: number;
  taskId?: string;
  onComplete?: (result: any) => void;
  autoCheck?: boolean;
  checkInterval?: number;
}

const TaskNotificationManager: React.FC<TaskNotificationProps> = ({
  plainteId,
  taskId,
  onComplete,
  autoCheck = true,
  checkInterval = 3000 // 3 secondes
}) => {
  const [notification, setNotification] = useState<Notification | null>(null);
  const [open, setOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isChecking, setIsChecking] = useState(false);

  // Fonction pour vérifier le statut de la tâche
  const checkTaskStatus = async () => {
    if (!plainteId || isChecking) return;

    setIsChecking(true);
    try {
      // Utiliser fetch directement pour l'appel API
      const response = await fetch(`http://localhost:8000/api/tasks/plainte/${plainteId}/status`);
      const data = await response.json();
      
      // Mettre à jour la barre de progression
      switch (data.status) {
        case 'en_attente':
          setProgress(10);
          break;
        case 'en_cours':
          setProgress(50);
          break;
        case 'complete':
          setProgress(100);
          if (data.notification) {
            showNotification(data.notification);
            onComplete?.(data);
          }
          return; // Arrêter la vérification
        case 'erreur':
          setProgress(100);
          if (data.notification) {
            showNotification(data.notification);
          }
          return; // Arrêter la vérification
      }
    } catch (error) {
      console.error('Erreur lors de la vérification du statut:', error);
    } finally {
      setIsChecking(false);
    }
  };

  // Fonction pour afficher une notification
  const showNotification = (notif: Notification) => {
    setNotification(notif);
    setOpen(true);
  };

  // Effect pour vérifier périodiquement le statut
  useEffect(() => {
    if (!autoCheck || !plainteId) return;

    // Vérification initiale
    checkTaskStatus();

    // Vérification périodique
    const interval = setInterval(checkTaskStatus, checkInterval);

    return () => clearInterval(interval);
  }, [plainteId, autoCheck, checkInterval]);

  // Gestion de la fermeture de la notification
  const handleClose = (_event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  };

  // Icône selon le type de notification
  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle />;
      case 'info':
        return <Info />;
      case 'warning':
        return <Warning />;
      case 'error':
        return <Error />;
      default:
        return <Info />;
    }
  };

  // Couleur selon le type
  const getSeverity = (type: string): 'success' | 'info' | 'warning' | 'error' => {
    return type as 'success' | 'info' | 'warning' | 'error';
  };

  return (
    <>
      {/* Barre de progression pour les tâches en cours */}
      {plainteId && progress > 0 && progress < 100 && (
        <div style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          zIndex: 1400,
          backgroundColor: 'rgba(255,255,255,0.9)',
          padding: '8px 16px'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px',
            fontSize: '14px',
            color: '#666'
          }}>
            <Info fontSize="small" />
            <span>Traitement de la plainte en cours...</span>
          </div>
          <LinearProgress 
            variant="determinate" 
            value={progress} 
            style={{ marginTop: '4px' }}
          />
        </div>
      )}

      {/* Notification Snackbar */}
      <Snackbar
        open={open}
        autoHideDuration={6000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        TransitionComponent={Slide}
        sx={{ marginTop: progress > 0 && progress < 100 ? '60px' : '16px' }}
      >
        <Alert
          onClose={handleClose}
          severity={notification ? getSeverity(notification.type) : 'info'}
          variant="filled"
          icon={notification ? getIcon(notification.type) : undefined}
          sx={{ 
            width: '100%',
            maxWidth: '400px',
            '& .MuiAlert-message': {
              width: '100%'
            }
          }}
        >
          {notification && (
            <>
              <AlertTitle>{notification.title}</AlertTitle>
              {notification.message}
              {notification.plainte_id && (
                <div style={{ 
                  marginTop: '8px', 
                  fontSize: '12px', 
                  opacity: 0.8 
                }}>
                  Plainte #{notification.plainte_id}
                </div>
              )}
            </>
          )}
        </Alert>
      </Snackbar>
    </>
  );
};

export default TaskNotificationManager;
