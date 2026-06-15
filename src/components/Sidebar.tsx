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
  Security as SecurityIcon,
  Assessment as AssessmentIcon
} from '@mui/icons-material'
import { useAuth } from '../lib/AppClientContext'
import { RootState } from '@/store'
import { markAllNotificationsAsRead } from '@/store/slices/plaintesNotificationSlice'

const navigationItems = [
  {
    name: 'Vue d\'Ensemble',
    href: '/dashboard-unified',
    icon: ChartBarIcon,
    badge: null
  },
  {
    name: 'Gestionnaire de Plaintes',
    href: '/plaintes-dashboard',
    icon: ClipboardDocumentListIcon,
    badge: null
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
    name: 'Services KPI',
    href: '/services-kpi',
    icon: AssessmentIcon,
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
        width: 232,
        height: '100vh',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 1200,
        backgroundColor: '#ffffff',
        borderRight: '1px solid #ebebef',
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
        px: 1.5,
        py: 2
      }}
    >
      {/* Logo */}
      <Box
        onClick={() => navigate('/dashboard-unified')}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.25,
          mb: 3,
          px: 1,
          py: 0.5,
          cursor: 'pointer',
          borderRadius: 1.5,
          transition: 'background 0.15s ease',
          '&:hover': { bgcolor: '#f5f5f7' }
        }}
      >
        <Box
          sx={{
            width: 32,
            height: 32,
            background: '#ffffff',
            border: '1px solid #ebebef',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 1px 2px rgba(16, 24, 40, 0.04)'
          }}
        >
          <SecurityIcon sx={{ fontSize: 16, color: '#0d9488' }} />
        </Box>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography
            sx={{
              fontWeight: 700,
              color: '#1d1d1f',
              fontSize: '0.875rem',
              lineHeight: 1.2,
              letterSpacing: '-0.01em',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            Pulse 360
          </Typography>
          <Typography
            sx={{
              color: '#86868b',
              fontWeight: 500,
              fontSize: '0.7rem',
              letterSpacing: '0.02em',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            Gestion plaintes
          </Typography>
        </Box>
      </Box>

      {/* Navigation */}
      <List sx={{ flex: 1, py: 0 }}>
        {navigationItems.map((item) => {
          const isActive = location.pathname === item.href
          const Icon = item.icon

          let badge: string | number | null = item.badge
          let isNotificationBadge = false

          if (item.name === 'Création & Saisie') {
            badge = totalBadgeCount > 0 ? totalBadgeCount : null
            isNotificationBadge = totalBadgeCount > 0
          }

          return (
            <ListItem key={item.name} disablePadding sx={{ mb: 0.25 }}>
              <ListItemButton
                onClick={() => navigate(item.href)}
                sx={{
                  borderRadius: 1.5,
                  px: 1.25,
                  py: 0.875,
                  minHeight: 0,
                  transition: 'all 0.12s ease',
                  ...(isActive ? {
                    backgroundColor: '#1d1d1f',
                    color: '#ffffff',
                    '&:hover': { backgroundColor: '#1d1d1f' }
                  } : {
                    color: '#86868b',
                    '&:hover': { backgroundColor: '#f5f5f7', color: '#1d1d1f' }
                  })
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 28,
                    color: isActive ? '#5eead4' : '#86868b'
                  }}
                >
                  <Icon sx={{ fontSize: 17 }} />
                </ListItemIcon>
                <ListItemText
                  primary={item.name}
                  sx={{
                    m: 0,
                    '& .MuiListItemText-primary': {
                      fontWeight: 500,
                      fontSize: '0.8125rem',
                      letterSpacing: '-0.005em',
                      color: 'inherit'
                    }
                  }}
                />
                {badge && (
                  isNotificationBadge ? (
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minWidth: 18,
                        height: 18,
                        borderRadius: '999px',
                        backgroundColor: '#dc2626',
                        color: '#ffffff',
                        fontWeight: 700,
                        fontSize: '0.65rem',
                        padding: '0 5px',
                        animation: pendingTasks.length > 0 ? 'pulse 2s infinite' : 'none',
                        '@keyframes pulse': {
                          '0%': { transform: 'scale(1)' },
                          '50%': { transform: 'scale(1.1)' },
                          '100%': { transform: 'scale(1)' },
                        },
                      }}
                    >
                      {badge}
                    </Box>
                  ) : (
                    <Chip
                      label={badge}
                      size="small"
                      sx={{
                        height: 17,
                        backgroundColor: isActive ? 'rgba(255, 255, 255, 0.14)' : '#f5f5f7',
                        color: isActive ? '#ffffff' : '#86868b',
                        fontWeight: 600,
                        fontSize: '0.625rem',
                        letterSpacing: '0.04em',
                        '& .MuiChip-label': { px: 0.75 }
                      }}
                    />
                  )
                )}
              </ListItemButton>
            </ListItem>
          )
        })}
      </List>

      {/* Logout en bas, séparé */}
      <Box sx={{ borderTop: '1px solid #ebebef', pt: 1, mt: 1 }}>
        <ListItem disablePadding>
          <ListItemButton
            onClick={handleLogout}
            sx={{
              borderRadius: 1.5,
              px: 1.25,
              py: 0.875,
              minHeight: 0,
              color: '#86868b',
              transition: 'all 0.12s ease',
              '&:hover': { backgroundColor: '#f5f5f7', color: '#1d1d1f' }
            }}
          >
            <ListItemIcon sx={{ minWidth: 28, color: '#86868b' }}>
              <LogoutIcon sx={{ fontSize: 17 }} />
            </ListItemIcon>
            <ListItemText
              primary="Déconnexion"
              sx={{
                m: 0,
                '& .MuiListItemText-primary': {
                  fontWeight: 500,
                  fontSize: '0.8125rem',
                  color: 'inherit'
                }
              }}
            />
          </ListItemButton>
        </ListItem>
      </Box>

      {/* Floating Action Button - Mobile only */}
      <Fab
        size="small"
        onClick={() => navigate('/plaintes/nouvelles')}
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          display: { xs: 'flex', lg: 'none' },
          backgroundColor: '#1d1d1f',
          color: '#ffffff',
          boxShadow: '0 4px 12px rgba(16, 24, 40, 0.15)',
          '&:hover': { backgroundColor: '#0f172a' }
        }}
      >
        <PlusIcon />
      </Fab>
    </Box>
  )
} 