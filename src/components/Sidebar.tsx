'use client'

import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import {
  Box,
  Typography,
  Avatar,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Chip,
  Fab
} from '@mui/material'
import {
  BarChart as ChartBarIcon,
  Lightbulb as LightBulbIcon,
  Add as PlusIcon,
  Description as ClipboardDocumentListIcon,
  Settings as Cog8ToothIcon,
  Logout as LogoutIcon,
  Security as SecurityIcon
} from '@mui/icons-material'
import { useAuth } from '../lib/AppClientContext'
import { RootState } from '@/store'
import { markAllNotificationsAsRead } from '@/store/slices/plaintesNotificationSlice'

const navigationItems = [
  {
    name: 'Vue d\'Ensemble',
    href: '/dashboard-unified',
    icon: ChartBarIcon,
    badge: 'NEW'
  },
  {
    name: 'Gestionnaire de Plaintes',
    href: '/plaintes-dashboard',
    icon: ClipboardDocumentListIcon,
    badge: 'ACTIF'
  },
  {
    name: 'Création & Saisie',
    href: '/plaintes/nouvelles',
    icon: PlusIcon,
    badge: 12
  },
  {
    name: 'IA & Optimisation',
    href: '/ameliorations',
    icon: LightBulbIcon,
    badge: null
  },
  {
    name: 'Administration',
    href: '/analytics-v2',
    icon: Cog8ToothIcon,
    badge: null
  }
]

export default function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()
  const { logout } = useAuth()
  
  // Récupérer le compteur de notifications depuis le store Redux
  const { unreadCount, pendingTasks } = useSelector(
    (state: RootState) => state.plaintesNotification
  )
  
  // Compteur total = notifications non lues + tâches en cours
  const totalBadgeCount = unreadCount + pendingTasks.length

  const handleLogout = () => {
    logout()
  }
  
  // Marquer les notifications comme lues quand on visite la page Création & Saisie
  useEffect(() => {
    if (location.pathname === '/plaintes/nouvelles' && unreadCount > 0) {
      // Optionnel: marquer toutes les notifications comme lues après un délai
      const timer = setTimeout(() => {
        dispatch(markAllNotificationsAsRead())
      }, 2000) // 2 secondes pour que l'utilisateur voie le badge
      return () => clearTimeout(timer)
    }
  }, [location.pathname, unreadCount, dispatch])

  return (
    <Box
      sx={{
        width: 320,
        height: '100vh',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 1200,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderRight: '1px solid rgba(226, 232, 240, 0.5)',
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
        p: 3
      }}
    >
      {/* Logo - Style Login */}
      <Box
        onClick={() => navigate('/healthcare-ai')}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 3,
          mb: 4,
          cursor: 'pointer',
          transition: 'all 0.3s',
          '&:hover': { transform: 'scale(1.02)' }
        }}
      >
        <Avatar
          sx={{
            width: 64,
            height: 64,
            background: 'linear-gradient(135deg, #3b82f6, #14b8a6)',
            boxShadow: '0 25px 50px -12px rgba(59, 130, 246, 0.4)',
          }}
        >
          <SecurityIcon sx={{ fontSize: 32, color: 'white' }} />
        </Avatar>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, #1e293b, #1d4ed8, #0d9488)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontSize: { xs: '1rem', lg: '1.25rem' },
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            HealthCare AI
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: '#64748b',
              fontWeight: 500,
              fontSize: { xs: '0.875rem', lg: '1rem' },
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            Gestion Plaintes
          </Typography>
        </Box>
      </Box>
      
      {/* Navigation */}
      <List sx={{ flex: 1, py: 0 }}>
        {navigationItems.map((item) => {
          const isActive = location.pathname === item.href
          const Icon = item.icon
          
          // Badge dynamique pour "Création & Saisie"
          let badge: string | number | null = item.badge
          let isNotificationBadge = false
          
          if (item.name === 'Création & Saisie') {
            badge = totalBadgeCount > 0 ? totalBadgeCount : null
            isNotificationBadge = totalBadgeCount > 0
          }
          
          return (
            <ListItem key={item.name} disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                onClick={() => navigate(item.href)}
                sx={{
                  borderRadius: 2,
                  p: 2,
                  transition: 'all 0.3s',
                  ...(isActive ? {
                    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                    color: 'white',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #1d4ed8, #7c3aed)'
                    }
                  } : {
                    '&:hover': {
                      background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1))',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }
                  })
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 40,
                    ...(isActive ? {
                      color: 'white'
                    } : {
                      color: '#3b82f6'
                    })
                  }}
                >
                  <Icon />
                </ListItemIcon>
                <ListItemText
                  primary={item.name}
                  sx={{
                    '& .MuiListItemText-primary': {
                      fontWeight: 600,
                      fontSize: { xs: '0.875rem', lg: '1rem' }
                    }
                  }}
                />
                {badge && (
                  isNotificationBadge ? (
                    // Badge style Instagram pour les notifications de plaintes
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minWidth: '24px',
                        height: '24px',
                        borderRadius: '12px',
                        backgroundColor: '#ef4444', // Rouge vif Instagram
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '0.75rem',
                        padding: '0 6px',
                        boxShadow: '0 2px 8px rgba(239, 68, 68, 0.5)',
                        animation: pendingTasks.length > 0 ? 'pulse 2s infinite' : 'none',
                        '@keyframes pulse': {
                          '0%': { transform: 'scale(1)', boxShadow: '0 2px 8px rgba(239, 68, 68, 0.5)' },
                          '50%': { transform: 'scale(1.1)', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.7)' },
                          '100%': { transform: 'scale(1)', boxShadow: '0 2px 8px rgba(239, 68, 68, 0.5)' },
                        },
                      }}
                    >
                      {badge}
                    </Box>
                  ) : (
                    // Badge standard pour les autres éléments de navigation
                    <Chip
                      label={badge}
                      size="small"
                      sx={{
                        backgroundColor: isActive ? 'rgba(255, 255, 255, 0.2)' : '#3b82f6',
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '0.75rem'
                      }}
                    />
                  )
                )}
              </ListItemButton>
            </ListItem>
          )
        })}
        
        {/* Bouton de déconnexion */}
        <ListItem disablePadding sx={{ mb: 1 }}>
          <ListItemButton
            onClick={handleLogout}
            sx={{
              borderRadius: 2,
              p: 2,
              transition: 'all 0.3s',
              '&:hover': {
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1))',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 40,
                color: '#3b82f6'
              }}
            >
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText
              primary="Déconnexion"
              sx={{
                '& .MuiListItemText-primary': {
                  fontWeight: 600,
                  fontSize: { xs: '0.875rem', lg: '1rem' }
                }
              }}
            />
          </ListItemButton>
        </ListItem>
      </List>
      
      {/* Floating Action Button for Mobile */}
      <Fab
        color="primary"
        size="medium"
        onClick={() => navigate('/plaintes/nouvelles')}
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          display: { xs: 'flex', lg: 'none' },
          background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
          '&:hover': {
            background: 'linear-gradient(135deg, #1d4ed8, #7c3aed)'
          }
        }}
      >
        <PlusIcon />
      </Fab>
    </Box>
  )
} 