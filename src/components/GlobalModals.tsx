import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { closeExportModal } from '@/store/slices/uiSlice';
import ExportModal from './ExportModal';
import ModalGlobal from './ModalGlobal';

export default function GlobalModals() {
  const dispatch = useDispatch();
  const { modals } = useSelector((state: RootState) => state.ui);

  const handleCloseExportModal = () => {
    dispatch(closeExportModal());
  };

  return (
    <>
      {/* Modal global d'export */}
      <ExportModal 
        isOpen={modals.exportModal.isOpen} 
        onClose={handleCloseExportModal} 
      />
      
      {/* Modal global Redux */}
      <ModalGlobal />
    </>
  );
} 