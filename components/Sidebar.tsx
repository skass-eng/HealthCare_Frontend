'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { apiUnified } from '@/lib/api-unified'

import {
  ChartBarIcon,
  DocumentTextIcon,
  LightBulbIcon,
  CogIcon,
  PlusIcon,
  SparklesIcon,
  ClipboardDocumentListIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline'

const navigationItems = [
  {
    name: 'Vue d\'Ensemble',
    href: '/dashboard-unified',
    icon: ChartBarIcon,
    badge: 'NEW',
    description: 'Statistiques et métriques globales'
  },
  {
    name: 'Gestionnaire de Plaintes',
    href: '/plaintes-dashboard',
    icon: ClipboardDocumentListIcon,
    badge: null,
    description: 'Gestion complète des plaintes'
  },
  {
    name: 'Création & Saisie',
    href: '/plaintes/nouvelles',
    icon: PlusIcon,
    badge: 12,
    description: 'Créer et saisir de nouvelles plaintes'
  },
  {
    name: 'IA & Optimisation',
    href: '/ameliorations',
    icon: LightBulbIcon,
    badge: null,
    description: 'Suggestions IA et améliorations'
  },
  {
    name: 'Analytics Avancés',
    href: '/analytics-v2',
    icon: SparklesIcon,
    badge: 'NEW',
    description: 'Analyses avancées et rapports'
  },
  {
    name: 'Configuration',
    href: '/parametres',
    icon: CogIcon,
    badge: null,
    description: 'Paramètres et préférences'
  }
]

export default function Sidebar() {
  const pathname = usePathname()
  const [nouvellesPlaintesCount, setNouvellesPlaintesCount] = useState<string | number | null>(null)
  const [loading, setLoading] = useState(true)
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  
  useEffect(() => {
    const fetchNouvellesPlaintes = async () => {
      try {
        setLoading(true)
        // Statut RECU pour correspondre à l'enum backend (StatutPlainteEnum.RECU)
        const data = await apiUnified.getPlaintesList({ statut: 'RECU', page: 1, limit: 1 })
        console.log(data)
        setNouvellesPlaintesCount(data.total || (data.plaintes ? data.plaintes.length : 0))
      } catch (err) {
        setNouvellesPlaintesCount(null)
      } finally {
        setLoading(false)
      }
    }
    fetchNouvellesPlaintes()
  }, [])
  
  return (
    <aside className="sidebar p-6 lg:p-8 w-full lg:w-auto lg:min-w-[380px] lg:max-w-[380px]">
      {/* Logo */}
      <Link href="/healthcare-ai" className="flex items-center gap-4 mb-8 lg:mb-12 group cursor-pointer transition-all duration-300 hover:scale-105">
        <div className="w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-lg lg:text-xl shadow-lg flex-shrink-0 group-hover:shadow-xl transition-all duration-300">
          🏥
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-slate-800 font-bold text-lg lg:text-xl truncate group-hover:text-blue-600 transition-colors duration-300">HealthCare AI</h2>
          <p className="text-slate-600 text-sm lg:text-base truncate font-medium group-hover:text-purple-600 transition-colors duration-300">Gestion Plaintes</p>
        </div>
      </Link>
      
      {/* Navigation */}
      <nav className="space-y-3 lg:space-y-4">
        {navigationItems.map((item) => {
          const isActive = pathname === item.href
          const isHovered = hoveredItem === item.name
          const Icon = item.icon
          let badge: string | number | null = item.badge
          if (item.name === 'Création & Saisie') {
            badge = loading ? '...' : (nouvellesPlaintesCount !== null ? nouvellesPlaintesCount : 12)
          }
          return (
            <Link
              key={item.name}
              href={item.href}
              onMouseEnter={() => setHoveredItem(item.name)}
              onMouseLeave={() => setHoveredItem(null)}
              className={`nav-item relative group transition-all duration-300 ${
                isActive 
                  ? 'bg-gradient-to-r from-blue-600 to-purple-700 text-white shadow-lg border border-white/20 hover:from-blue-700 hover:to-purple-800' 
                  : 'hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:shadow-md border border-transparent'
              } rounded-xl p-4 lg:p-5`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-xl transition-all duration-300 flex-shrink-0 ${
                  isActive 
                    ? 'bg-white/20 text-white shadow-md' 
                    : 'bg-gradient-to-r from-blue-100 to-purple-100 text-blue-600 group-hover:from-blue-200 group-hover:to-purple-200'
                }`}>
                  <Icon className="w-5 h-5 lg:w-6 lg:h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`font-semibold text-sm lg:text-base truncate ${
                      isActive ? 'text-white' : 'text-slate-800'
                    }`}>
                      {item.name}
                    </span>
                    {badge !== null && badge !== undefined && badge !== 0 && (
                      <span className={`px-2 py-1 rounded-full text-xs font-bold flex-shrink-0 ${
                        isActive 
                          ? 'bg-white/20 text-white border border-white/30' 
                          : 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-sm'
                      }`}>
                        {badge}
                      </span>
                    )}
                  </div>
                  <p className={`text-xs lg:text-sm mt-1 line-clamp-2 ${
                    isActive ? 'text-white/90' : 'text-slate-500'
                  }`}>
                    {item.description}
                  </p>
                </div>
              </div>
              
              {/* Tooltip pour les descriptions longues */}
              {(isHovered || isActive) && (
                <div className={`absolute left-full ml-2 top-1/2 transform -translate-y-1/2 z-50 ${
                  isActive ? 'bg-blue-600 text-white' : 'bg-gray-800 text-white'
                } px-3 py-2 rounded-lg shadow-lg text-sm max-w-xs whitespace-normal opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none`}>
                  <div className="font-medium mb-1">{item.name}</div>
                  <div className="text-xs opacity-90">{item.description}</div>
                  <div className={`absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 rotate-45 ${
                    isActive ? 'bg-blue-600' : 'bg-gray-800'
                  }`}></div>
                </div>
              )}
            </Link>
          )
        })}
      </nav>
      
      {/* Floating Action Button for Mobile */}
      <div 
        className="floating-action lg:hidden cursor-pointer"
        onClick={() => window.location.href = '/plaintes/nouvelles'}
      >
        <PlusIcon className="w-6 h-6" />
      </div>
    </aside>
  )
} 