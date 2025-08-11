'use client'

import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
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
  Settings as Cog8ToothIcon
} from '@mui/icons-material'

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
  const [nouvellesPlaintesCount, setNouvellesPlaintesCount] = useState<string | number | null>(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    const fetchNouvellesPlaintes = async () => {
      try {
        setLoading(true)
        // Simulation de l'API call - vous pouvez adapter ceci pour votre API
        // const data = await apiUnified.getPlaintesList({ statut: 'RECU', page: 1, limit: 1 })
        // console.log(data)
        // setNouvellesPlaintesCount(data.total || (data.plaintes ? data.plaintes.length : 0))
        setNouvellesPlaintesCount(12) // Valeur par défaut pour l'instant
      } catch (err) {
        setNouvellesPlaintesCount(null)
      } finally {
        setLoading(false)
      }
    }
    fetchNouvellesPlaintes()
  }, [])

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
      {/* Logo */}
      <Box
        onClick={() => navigate('/healthcare-ai')}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          mb: 4,
          cursor: 'pointer',
          transition: 'all 0.3s',
          '&:hover': { transform: 'scale(1.05)' }
        }}
      >
        <Avatar
          sx={{
            width: 48,
            height: 48,
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            fontSize: '1.5rem',
            fontWeight: 'bold'
          }}
        >
          🏥
        </Avatar>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 'bold',
              color: '#1e293b',
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
          let badge: string | number | null = item.badge
          if (item.name === 'Création & Saisie') {
            badge = loading ? '...' : (nouvellesPlaintesCount !== null ? nouvellesPlaintesCount : 12)
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
                  <Chip
                    label={badge}
                    size="small"
                    sx={{
                      backgroundColor: isActive ? 'rgba(255, 255, 255, 0.2)' : 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '0.75rem'
                    }}
                  />
                )}
              </ListItemButton>
            </ListItem>
          )
        })}
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