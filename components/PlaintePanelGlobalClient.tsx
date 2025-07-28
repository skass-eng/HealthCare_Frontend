"use client";

import SimplePlaintePanel from '@/components/Plaintes/SimplePlaintePanel';
import { useAppStore } from '@/hooks/useAppStore';

export default function PlaintePanelGlobalClient() {
  const { ui, actions } = useAppStore();

  if (!ui.isPlaintePanelOpen) return null;

  return (
    <SimplePlaintePanel
      onClose={actions.closePlaintePanel}
      onSubmit={() => {}}
    />
  );
} 