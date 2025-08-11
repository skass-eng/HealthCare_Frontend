import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  LinearProgress,
  Avatar,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Science as ScienceIcon,
  DataObject as DataObjectIcon,
  Assignment as AssignmentIcon,
  TrendingUp as TrendingUpIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { RootState } from '@/store';
import { fetchDashboards } from '@/store/slices/dashboardSlice';
import { fetchTasks } from '@/store/slices/taskSlice';
import { fetchDatasources } from '@/store/slices/datasourceSlice';
import { fetchProjects } from '@/store/slices/projectSlice';

const Dashboard: React.FC = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const { dashboards } = useSelector((state: RootState) => state.dashboard);
  const { tasks, activeTasks } = useSelector((state: RootState) => state.task);
  const { datasources } = useSelector((state: RootState) => state.datasource);
  const { projects } = useSelector((state: RootState) => state.project);

  useEffect(() => {
    dispatch(fetchDashboards({ page: 1, limit: 5 }));
    dispatch(fetchTasks({ page: 1, limit: 10 }));
    dispatch(fetchDatasources({ page: 1, limit: 5 }));
    dispatch(fetchProjects({ page: 1, limit: 5 }));
  }, [dispatch]);

  const stats = [
    {
      title: 'Projets',
      value: projects.length,
      icon: <DashboardIcon />,
      color: '#3b82f6',
      description: 'Projets actifs',
    },
    {
      title: 'Dashboards',
      value: dashboards.length,
      icon: <ScienceIcon />,
      color: '#8b5cf6',
      description: 'Tableaux de bord',
    },
    {
      title: 'Datasources',
      value: datasources.length,
      icon: <DataObjectIcon />,
      color: '#10b981',
      description: 'Sources de données',
    },
    {
      title: 'Tâches actives',
      value: activeTasks.length,
      icon: <AssignmentIcon />,
      color: '#f59e0b',
      description: 'Calculs en cours',
    },
  ];

  const recentTasks = tasks.slice(0, 5);

  return (
    <Box sx={{ p: 3 }}>
      {/* En-tête */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: 'white', mb: 1 }}>
          Bonjour, {user?.name || 'Utilisateur'} 👋
        </Typography>
        <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
          Bienvenue sur votre tableau de bord ODYSSEE
        </Typography>
      </Box>

      {/* Statistiques */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card
              sx={{
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 30px rgba(0, 0, 0, 0.15)',
                },
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar
                    sx={{
                      backgroundColor: stat.color,
                      mr: 2,
                      width: 48,
                      height: 48,
                    }}
                  >
                    {stat.icon}
                  </Avatar>
                  <Box>
                    <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {stat.description}
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
                  {stat.title}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Contenu principal */}
      <Grid container spacing={3}>
        {/* Tâches récentes */}
        <Grid item xs={12} lg={8}>
          <Card
            sx={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              height: '100%',
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
                  Tâches récentes
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<RefreshIcon />}
                  onClick={() => dispatch(fetchTasks({ page: 1, limit: 10 }))}
                >
                  Actualiser
                </Button>
              </Box>

              {recentTasks.length > 0 ? (
                <Box>
                  {recentTasks.map((task) => (
                    <Box
                      key={task.id}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        p: 2,
                        mb: 2,
                        borderRadius: 2,
                        backgroundColor: 'rgba(59, 130, 246, 0.05)',
                        border: '1px solid rgba(59, 130, 246, 0.1)',
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar
                          sx={{
                            width: 40,
                            height: 40,
                            mr: 2,
                            backgroundColor:
                              task.status === 'completed'
                                ? '#10b981'
                                : task.status === 'running'
                                ? '#3b82f6'
                                : task.status === 'failed'
                                ? '#ef4444'
                                : '#6b7280',
                          }}
                        >
                          <AssignmentIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            {task.type}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {task.status}
                          </Typography>
                        </Box>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip
                          label={task.status}
                          size="small"
                          color={
                            task.status === 'completed'
                              ? 'success'
                              : task.status === 'running'
                              ? 'primary'
                              : task.status === 'failed'
                              ? 'error'
                              : 'default'
                          }
                        />
                        {task.status === 'running' && (
                          <LinearProgress
                            variant="determinate"
                            value={task.progress}
                            sx={{ width: 100, height: 6, borderRadius: 3 }}
                          />
                        )}
                      </Box>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    py: 4,
                    color: 'text.secondary',
                  }}
                >
                  <AssignmentIcon sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    Aucune tâche récente
                  </Typography>
                  <Typography variant="body2">
                    Commencez par créer une nouvelle analyse
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Actions rapides */}
        <Grid item xs={12} lg={4}>
          <Card
            sx={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              height: '100%',
            }}
          >
            <CardContent>
              <Typography variant="h6" component="h2" sx={{ fontWeight: 600, mb: 3 }}>
                Actions rapides
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<AddIcon />}
                  sx={{
                    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #1d4ed8, #7c3aed)',
                    },
                  }}
                >
                  Nouveau projet
                </Button>

                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<DataObjectIcon />}
                  sx={{
                    borderColor: '#10b981',
                    color: '#10b981',
                    '&:hover': {
                      borderColor: '#059669',
                      backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    },
                  }}
                >
                  Importer données
                </Button>

                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<ScienceIcon />}
                  sx={{
                    borderColor: '#f59e0b',
                    color: '#f59e0b',
                    '&:hover': {
                      borderColor: '#d97706',
                      backgroundColor: 'rgba(245, 158, 11, 0.1)',
                    },
                  }}
                >
                  Créer widget
                </Button>

                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<TrendingUpIcon />}
                  sx={{
                    borderColor: '#8b5cf6',
                    color: '#8b5cf6',
                    '&:hover': {
                      borderColor: '#7c3aed',
                      backgroundColor: 'rgba(139, 92, 246, 0.1)',
                    },
                  }}
                >
                  Voir analytics
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard; 