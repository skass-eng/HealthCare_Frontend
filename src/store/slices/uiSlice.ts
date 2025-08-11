import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  modals: {
    exportModal: {
      isOpen: boolean;
    };
  };
}

const initialState: UIState = {
  modals: {
    exportModal: {
      isOpen: false,
    },
  },
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    openExportModal: (state) => {
      state.modals.exportModal.isOpen = true;
    },
    closeExportModal: (state) => {
      state.modals.exportModal.isOpen = false;
    },
  },
});

export const { openExportModal, closeExportModal } = uiSlice.actions;
export default uiSlice.reducer; 