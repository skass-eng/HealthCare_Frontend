import type { Metadata } from 'next'
import './globals.css'
import Sidebar from '@/components/Sidebar'
import StoreProvider from '@/components/StoreProvider'
import GlobalModalsExtended from '@/components/GlobalModalsExtended'
import GlobalNotifications from '@/components/GlobalNotifications'
import NotificationContainer from '@/components/NotificationContainer'

import SimplePlaintePanel from '@/components/Plaintes/SimplePlaintePanel';
import PlaintePanelGlobalClient from '@/components/PlaintePanelGlobalClient';
import { useAppStore } from '@/hooks/useAppStore';

export const metadata: Metadata = {
  title: 'HealthCare AI - Gestion des Plaintes',
  description: 'Système intelligent de gestion des plaintes et réclamations médicales alimenté par IA',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body>
        <StoreProvider>
          <div className="dashboard flex flex-col lg:flex-row">
            <Sidebar />
            <main className="main-content p-4 lg:p-8 bg-white/10 flex-1 lg:ml-[380px]">
              {children}
            </main>
          </div>
          {/* Panel Nouvelle Plainte global */}
          <PlaintePanelGlobalClient />
          <GlobalModalsExtended />
          <GlobalNotifications />
          <NotificationContainer />
        </StoreProvider>
      </body>
    </html>
  )
} 