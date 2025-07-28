'use client'

import { useState, useEffect } from 'react'
import StatsGrid from '@/components/Dashboard/StatsGrid'
import ComplaintsPanel from '@/components/Dashboard/ComplaintsPanel'
import SuggestionsPanel from '@/components/Dashboard/SuggestionsPanel'
import DashboardHeader from '@/components/Dashboard/DashboardHeader'
import UploadSection from '@/components/Dashboard/UploadSection'
import AnalyticsV2Banner from '@/components/AnalyticsV2Banner'

export default function DashboardPage() {
  const [showUploadSection, setShowUploadSection] = useState(false)

  // Fonction pour ouvrir la section upload
  const openUploadSection = () => {
    setShowUploadSection(true)
    // Faire défiler vers la section après un court délai
    setTimeout(() => {
      const uploadSection = document.getElementById('upload-section')
      if (uploadSection) {
        uploadSection.scrollIntoView({ behavior: 'smooth' })
      }
    }, 100)
  }

  return (
    <div className="space-y-4 lg:space-y-8 min-w-0">
      {/* Header */}
      <DashboardHeader onOpenUpload={openUploadSection} />
      
      {/* Bannière Analytics V2 */}
      <AnalyticsV2Banner />
      
      {/* Stats Grid */}
      <StatsGrid />
      
      {/* Section Upload - Conditionnelle */}
      {showUploadSection && (
        <div id="upload-section">
          <UploadSection onClose={() => setShowUploadSection(false)} />
        </div>
      )}
      
      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 lg:gap-8">
        {/* Complaints Panel - 2/3 width on xl screens */}
        <div className="xl:col-span-2">
          <ComplaintsPanel />
        </div>
        
        {/* Suggestions Panel - 1/3 width on xl screens */}
        <div className="xl:col-span-1">
          <SuggestionsPanel />
        </div>
      </div>
    </div>
  )
} 