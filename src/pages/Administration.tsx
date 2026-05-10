'use client';

import React, { useState, useEffect } from 'react';
import { 
  Cog8ToothIcon
} from '@heroicons/react/24/outline';
import AdminPanelV2 from '../components/AdminPanelV2';

export default function AdministrationPage() {
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
    <div style={{ minHeight: '100vh', background: '#f5f5f7' }}>
      {/* Notification de bienvenue */}
      {showWelcome && (
        <div style={{
          position: 'fixed',
          top: '16px',
          right: '16px',
          zIndex: 50,
          background: '#1d1d1f',
          color: '#ffffff',
          padding: '14px 18px',
          paddingRight: '36px',
          borderRadius: '10px',
          boxShadow: '0 8px 24px rgba(16, 24, 40, 0.18)',
          maxWidth: '360px',
          border: '1px solid #1d1d1f',
          animation: 'slide-in-right 0.3s ease-out'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Cog8ToothIcon className="w-4 h-4" style={{ color: '#5eead4' }} />
            <span style={{ fontWeight: 700, fontSize: '13px' }}>Bienvenue dans l'administration</span>
          </div>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.72)', margin: 0 }}>
            Gérez les organisations, services et configurations du système.
          </p>
          <button
            onClick={() => setShowWelcome(false)}
            style={{
              position: 'absolute',
              top: '8px',
              right: '10px',
              background: 'transparent',
              border: 'none',
              color: 'rgba(255,255,255,0.55)',
              cursor: 'pointer',
              fontSize: '14px',
              padding: 0
            }}
          >
            ✕
          </button>
        </div>
      )}

      {/* En-tête */}
      <div style={{ padding: '24px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{
            background: '#ffffff',
            border: '1px solid #ebebef',
            borderRadius: '12px',
            padding: '20px 24px',
            boxShadow: '0 1px 2px rgba(16, 24, 40, 0.04), 0 1px 3px rgba(16, 24, 40, 0.06)',
            marginBottom: '20px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{
                width: '44px',
                height: '44px',
                background: '#ffffff',
                border: '1px solid #ebebef',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 1px 2px rgba(16, 24, 40, 0.04)'
              }}>
                <Cog8ToothIcon className="w-5 h-5" style={{ color: '#0d9488' }} />
              </div>
              <div>
                <h1 style={{
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  color: '#1d1d1f',
                  margin: 0,
                  letterSpacing: '-0.02em',
                  lineHeight: 1.2
                }}>
                  Administration
                </h1>
                <p style={{
                  fontSize: '13px',
                  color: '#86868b',
                  fontWeight: 500,
                  margin: '4px 0 0 0'
                }}>
                  Gestion des organisations, services &amp; configurations système
                </p>
              </div>
            </div>
          </div>

          {/* Contenu principal */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #ebebef',
            borderRadius: '12px',
            boxShadow: '0 1px 2px rgba(16, 24, 40, 0.04), 0 1px 3px rgba(16, 24, 40, 0.06)',
            padding: '24px'
          }}>
            <AdminPanelV2 />
          </div>
        </div>
      </div>
    </div>
  );
} 