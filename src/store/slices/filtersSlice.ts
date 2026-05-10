import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Fonction helper pour formater une date en YYYY-MM-DD
const formatDateToISO = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Calculer les dates par défaut (J-3 mois à Aujourd'hui)
const getDefaultDates = () => {
  const today = new Date();
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
  return {
    dateDebut: formatDateToISO(threeMonthsAgo),
    dateFin: formatDateToISO(today)
  };
};

const defaultDates = getDefaultDates();

export interface FiltersState {
  // Filtres de dates partagés entre les pages
  dateDebut: string;
  dateFin: string;
  // Statut des plaintes (RECU, EN_COURS, TRAITE, CLOTURE)
  currentStatut: string;
  // Pagination
  currentPage: number;
  itemsPerPage: number;
  // Flag pour savoir si les filtres ont été modifiés par l'utilisateur
  isCustomFilter: boolean;
}

const initialState: FiltersState = {
  dateDebut: defaultDates.dateDebut,
  dateFin: defaultDates.dateFin,
  currentStatut: 'RECU',
  currentPage: 1,
  itemsPerPage: 20,
  isCustomFilter: false,
};

const filtersSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    // Mettre à jour la date de début
    setDateDebut: (state, action: PayloadAction<string>) => {
      state.dateDebut = action.payload;
      state.isCustomFilter = true;
    },
    
    // Mettre à jour la date de fin
    setDateFin: (state, action: PayloadAction<string>) => {
      state.dateFin = action.payload;
      state.isCustomFilter = true;
    },
    
    // Mettre à jour les deux dates en même temps
    setDateRange: (state, action: PayloadAction<{ dateDebut: string; dateFin: string }>) => {
      state.dateDebut = action.payload.dateDebut;
      state.dateFin = action.payload.dateFin;
      state.isCustomFilter = true;
      state.currentPage = 1; // Reset page quand on change les dates
    },
    
    // Mettre à jour le statut
    setCurrentStatut: (state, action: PayloadAction<string>) => {
      state.currentStatut = action.payload;
      state.currentPage = 1; // Reset page quand on change le statut
    },
    
    // Mettre à jour la page courante
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
    
    // Mettre à jour le nombre d'items par page
    setItemsPerPage: (state, action: PayloadAction<number>) => {
      state.itemsPerPage = action.payload;
      state.currentPage = 1; // Reset page quand on change le nombre d'items
    },
    
    // Réinitialiser tous les filtres aux valeurs par défaut
    resetFilters: (state) => {
      const defaults = getDefaultDates();
      state.dateDebut = defaults.dateDebut;
      state.dateFin = defaults.dateFin;
      state.currentStatut = 'RECU';
      state.currentPage = 1;
      state.isCustomFilter = false;
    },
    
    // Réinitialiser uniquement les dates
    resetDateFilters: (state) => {
      const defaults = getDefaultDates();
      state.dateDebut = defaults.dateDebut;
      state.dateFin = defaults.dateFin;
      state.currentPage = 1;
      state.isCustomFilter = false;
    },
    
    // Appliquer les filtres (pour déclencher un rechargement)
    applyFilters: (state) => {
      state.currentPage = 1;
    },
  },
});

export const {
  setDateDebut,
  setDateFin,
  setDateRange,
  setCurrentStatut,
  setCurrentPage,
  setItemsPerPage,
  resetFilters,
  resetDateFilters,
  applyFilters,
} = filtersSlice.actions;

export default filtersSlice.reducer;

// Sélecteurs
export const selectFilters = (state: { filters: FiltersState }) => state.filters;
export const selectDateRange = (state: { filters: FiltersState }) => ({
  dateDebut: state.filters.dateDebut,
  dateFin: state.filters.dateFin,
});
export const selectCurrentStatut = (state: { filters: FiltersState }) => state.filters.currentStatut;
export const selectPagination = (state: { filters: FiltersState }) => ({
  currentPage: state.filters.currentPage,
  itemsPerPage: state.filters.itemsPerPage,
});
