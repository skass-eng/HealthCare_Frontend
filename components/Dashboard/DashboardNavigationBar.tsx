'use client'

import { useAppStore } from '@/store'
import { 
  ArrowPathIcon, 
  ArrowDownTrayIcon, 
  PlusIcon,
  Cog8ToothIcon,
  LightBulbIcon
} from '@heroicons/react/24/outline'

interface DashboardNavigationBarProps {
  onRefresh: () => void
  onExport: () => void
  onNewComplaint: () => void
}

export default function DashboardNavigationBar({
  onRefresh,
  onExport,
  onNewComplaint
}: DashboardNavigationBarProps) {
  const { actions } = useAppStore()

  const handleNewComplaint = () => {
    actions.openPlainteModal()
  }

  return (
    <div className="max-w-full mx-auto">
      <div className="bg-gradient-to-r from-blue-50/80 to-purple-50/80 border border-blue-200/30 rounded-xl p-4 lg:p-6 shadow-lg">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-3">
          {/* Titre de la section */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-400/90 to-purple-500/90 rounded-lg flex items-center justify-center text-white">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-base lg:text-lg font-bold text-slate-800">Actions Rapides</h3>
              <p className="text-xs text-slate-600">Accédez rapidement aux fonctionnalités principales</p>
            </div>
          </div>

          {/* Boutons de navigation */}
          <div className="flex flex-wrap items-center gap-2 lg:gap-3">
            {/* Administration */}
            <button className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-3 py-2 rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 flex items-center gap-2 text-sm">
              <Cog8ToothIcon className="w-4 h-4" />
              <span>Administration</span>
            </button>

            {/* IA & Optimisation */}
            <button className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-2 rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 flex items-center gap-2 text-sm">
              <LightBulbIcon className="w-4 h-4" />
              <span>IA & Optimisation</span>
            </button>

            {/* Exporter */}
            <button 
              onClick={onExport}
              className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-3 py-2 rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 flex items-center gap-2 text-sm"
            >
              <ArrowDownTrayIcon className="w-4 h-4" />
              <span>Exporter</span>
            </button>

            {/* Créer une plainte */}
            <button 
              onClick={handleNewComplaint}
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 flex items-center gap-2 text-sm"
            >
              <PlusIcon className="w-4 h-4" />
              <span>Créer une plainte</span>
            </button>

            {/* Rafraîchir */}
            <button 
              onClick={onRefresh}
              className="bg-white/80 backdrop-blur-sm border border-gray-200 text-gray-700 px-3 py-2 rounded-lg font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 flex items-center gap-2 text-sm hover:bg-white"
            >
              <ArrowPathIcon className="w-4 h-4" />
              <span>Rafraîchir</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 