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
  UserGroupIcon,
  Cog8ToothIcon
} from '@heroicons/react/24/outline'

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
  const pathname = usePathname()
  const [nouvellesPlaintesCount, setNouvellesPlaintesCount] = useState<string | number | null>(null)
  const [loading, setLoading] = useState(true)
  
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
    <aside className="sidebar bg-white/95 backdrop-blur-md border-r border-slate-200/50 p-4 lg:p-6 flex flex-col h-screen fixed top-0 left-0 z-50 overflow-y-auto">
      {/* Logo */}
      <Link href="/healthcare-ai" className="flex items-center gap-3 mb-6 lg:mb-8 group cursor-pointer transition-all duration-300 hover:scale-105">
        <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-lg lg:text-xl shadow-lg flex-shrink-0 group-hover:shadow-xl transition-all duration-300">
          🏥
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-slate-800 font-bold text-lg lg:text-xl truncate group-hover:text-blue-600 transition-colors duration-300">HealthCare AI</h2>
          <p className="text-slate-600 text-sm lg:text-base truncate group-hover:text-blue-500 transition-colors duration-300">Gestion Plaintes</p>
        </div>
      </Link>
      
      {/* Navigation */}
      <nav className="space-y-2 lg:space-y-3">
        {navigationItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          let badge: string | number | null = item.badge
          if (item.name === 'Création & Saisie') {
            badge = loading ? '...' : (nouvellesPlaintesCount !== null ? nouvellesPlaintesCount : 12)
          }
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`nav-item relative group transition-all duration-300 ${
                isActive 
                  ? 'bg-gradient-to-r from-blue-600 to-purple-700 text-white shadow-lg border border-white/20 hover:from-blue-700 hover:to-purple-800' 
                  : 'hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:shadow-md border border-transparent'
              } rounded-xl p-3 lg:p-4`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-7 h-7 lg:w-9 lg:h-9 rounded-xl flex items-center justify-center transition-all duration-300 ${
                  isActive 
                    ? 'bg-white/20 text-white' 
                    : 'bg-gradient-to-br from-blue-100 to-purple-100 text-blue-600 group-hover:bg-gradient-to-br group-hover:from-blue-200 group-hover:to-purple-200'
                }`}>
                  <Icon className="w-4 h-4 lg:w-5 lg:h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm lg:text-base truncate">{item.name}</div>
                </div>
                {badge && (
                  <div className={`px-2 py-1 rounded-full text-xs font-bold ${
                    isActive 
                      ? 'bg-white/20 text-white' 
                      : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                  }`}>
                    {badge}
                  </div>
                )}
              </div>
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