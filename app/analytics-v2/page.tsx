'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Cog8ToothIcon
} from '@heroicons/react/24/outline';
import AdminPanelV2 from '@/components/Admin/AdminPanelV2';

export default function AdministrationPage() {
  const router = useRouter();
  const [showWelcome, setShowWelcome] = useState(true);

  // Afficher une notification de bienvenue
  useEffect(() => {
    const timer = setTimeout(() => setShowWelcome(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  const currentView = {
    id: 'admin' as const,
    name: 'Administration',
    icon: Cog8ToothIcon,
    description: 'Gestion des organisations et services',
    color: 'bg-purple-500',
    hoverColor: 'hover:bg-purple-600'
  };

    return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-teal-600/10 to-emerald-600/10 blur-3xl"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-300/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-300/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      
      {/* Notification de bienvenue */}
      {showWelcome && (
        <div className="fixed top-4 right-4 z-50 bg-gradient-to-r from-blue-600 to-teal-600 text-white p-4 rounded-lg shadow-lg max-w-sm animate-slide-in-right">
          <div className="flex items-center gap-2 mb-2">
            <Cog8ToothIcon className="w-5 h-5" />
            <span className="font-bold">Bienvenue dans l'Administration !</span>
          </div>
          <p className="text-sm text-white/90">
            Gérez les organisations, services et configurations du système.
          </p>
          <button 
            onClick={() => setShowWelcome(false)}
            className="absolute top-2 right-2 text-white/70 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}
      
      {/* En-tête */}
      <div className="relative z-10 bg-white/90 backdrop-blur-md border-b border-white/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Cog8ToothIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 via-blue-700 to-teal-700 bg-clip-text text-transparent">
                    Administration
                  </h1>
                  <p className="text-slate-600 mt-1">
                    Gestion des organisations et services
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Contenu de la section Administration */}
        <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-xl border border-white/40 overflow-hidden">
          {/* Contenu */}
          <div className="p-8">
            <AdminPanelV2 />
          </div>
        </div>
      </div>

    </div>
  );
} 