/**
 * PendingTasksIndicator
 * 
 * Composant flottant qui affiche les tâches de traitement en cours.
 * Permet à l'utilisateur de voir que le traitement continue même
 * s'il a changé de page.
 */

import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  LinearProgress,
  IconButton,
  Collapse,
  Chip,
  Tooltip,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Description as PdfIcon,
  Image as ImageIcon,
  Refresh as SpinnerIcon,
} from '@mui/icons-material';
import { RootState } from '@/store';

const PendingTasksIndicator: React.FC = () => {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(true);
  
  const { pendingTasks } = useSelector(
    (state: RootState) => state.plaintesNotification
  );
  
  // Ne pas afficher si aucune tâche en cours
  if (pendingTasks.length === 0) {
    return null;
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'pdf_extraction':
        return <PdfIcon sx={{ color: '#ef4444', fontSize: 18 }} />;
      case 'image_extraction':
        return <ImageIcon sx={{ color: '#10b981', fontSize: 18 }} />;
      default:
        return <SpinnerIcon sx={{ color: '#3b82f6', fontSize: 18 }} />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'pdf_extraction':
        return 'PDF';
      case 'image_extraction':
        return 'Image';
      default:
        return 'Traitement';
    }
  };

  return (
    <Paper
      elevation={6}
      sx={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 1300,
        minWidth: 320,
        maxWidth: 400,
        borderRadius: 3,
        overflow: 'hidden',
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(59, 130, 246, 0.3)',
      }}
    >
      {/* Header */}
      <Box
        onClick={() => setIsExpanded(!isExpanded)}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 2,
          cursor: 'pointer',
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(139, 92, 246, 0.2))',
          '&:hover': {
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(139, 92, 246, 0.3))',
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              backgroundColor: '#10b981',
              animation: 'pulse 2s infinite',
              '@keyframes pulse': {
                '0%': { opacity: 1, transform: 'scale(1)' },
                '50%': { opacity: 0.5, transform: 'scale(1.2)' },
                '100%': { opacity: 1, transform: 'scale(1)' },
              },
            }}
          />
          <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 600 }}>
            {pendingTasks.length} traitement{pendingTasks.length > 1 ? 's' : ''} en cours
          </Typography>
        </Box>
        <IconButton size="small" sx={{ color: 'white' }}>
          {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </Box>

      {/* Content */}
      <Collapse in={isExpanded}>
        <Box sx={{ p: 2, pt: 1 }}>
          <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', mb: 1.5 }}>
            Vous pouvez naviguer librement. Vous serez notifié quand le traitement sera terminé.
          </Typography>
          
          {pendingTasks.map((task) => (
            <Box
              key={task.task_id}
              sx={{
                mb: 1.5,
                p: 1.5,
                borderRadius: 2,
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                {getIcon(task.type)}
                <Typography
                  variant="body2"
                  sx={{
                    color: 'white',
                    fontWeight: 500,
                    flex: 1,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {task.filename}
                </Typography>
                <Chip
                  label={getTypeLabel(task.type)}
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: '0.65rem',
                    backgroundColor: task.type === 'pdf_extraction' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                    color: task.type === 'pdf_extraction' ? '#fca5a5' : '#6ee7b7',
                  }}
                />
              </Box>
              
              {/* Progress bar */}
              <LinearProgress
                variant={task.progress ? 'determinate' : 'indeterminate'}
                value={task.progress || 0}
                sx={{
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: task.type === 'pdf_extraction' ? '#ef4444' : '#10b981',
                    borderRadius: 2,
                  },
                }}
              />
              
              {task.step && (
                <Typography variant="caption" sx={{ color: '#94a3b8', mt: 0.5, display: 'block' }}>
                  {task.step}
                </Typography>
              )}
            </Box>
          ))}
          
          <Tooltip title="Retourner à la page de création">
            <Box
              onClick={() => navigate('/plaintes/nouvelles')}
              sx={{
                mt: 1,
                p: 1,
                borderRadius: 1,
                textAlign: 'center',
                cursor: 'pointer',
                color: '#60a5fa',
                fontSize: '0.875rem',
                '&:hover': {
                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                },
              }}
            >
              ← Retourner à la création
            </Box>
          </Tooltip>
        </Box>
      </Collapse>
    </Paper>
  );
};

export default PendingTasksIndicator;
