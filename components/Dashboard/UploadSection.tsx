'use client'

import SimplePlaintePanel from '@/components/Plaintes/SimplePlaintePanel'

interface UploadSectionProps {
  onClose: () => void
}

export default function UploadSection({ onClose }: UploadSectionProps) {
  const handleSubmit = (data: any) => {
    console.log('Plainte créée:', data)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <SimplePlaintePanel onClose={onClose} onSubmit={handleSubmit} />
      </div>
    </div>
  )
} 