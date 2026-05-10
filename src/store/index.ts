import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { useDispatch } from 'react-redux';
import { 
  persistStore, 
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER
} from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // localStorage

import authReducer from './slices/authSlice';
import dashboardReducer from './slices/dashboardSlice';
import taskReducer from './slices/taskSlice';
import notificationReducer from './slices/notificationSlice';
import projectReducer from './slices/projectSlice';
import datasourceReducer from './slices/datasourceSlice';
import uiReducer from './slices/uiSlice';
import healthcareAiReducer from './slices/healthcareAiSlice';
import modalReducer from './slices/modalSlice';
import userReducer from './slices/userSlice';
import servicesReducer from './slices/servicesSlice';
import pdfExtractionReducer from './slices/pdfExtractionSlice';
import imageExtractionReducer from './slices/imageExtractionSlice';
import plaintesNotificationReducer from './slices/plaintesNotificationSlice';
import archiveExtractionReducer from './slices/archiveExtractionSlice';
import filtersReducer from './slices/filtersSlice';

// Configuration de la persistance - uniquement pour les filtres
const persistConfig = {
  key: 'healthcare-app',
  version: 1,
  storage,
  whitelist: ['filters'], // Seuls les filtres seront persistés dans localStorage
};

// Combiner tous les reducers
const rootReducer = combineReducers({
  auth: authReducer,
  dashboard: dashboardReducer,
  task: taskReducer,
  notification: notificationReducer,
  project: projectReducer,
  datasource: datasourceReducer,
  ui: uiReducer,
  healthcareAi: healthcareAiReducer,
  modal: modalReducer,
  user: userReducer,
  services: servicesReducer,
  pdfExtraction: pdfExtractionReducer,
  imageExtraction: imageExtractionReducer,
  plaintesNotification: plaintesNotificationReducer,
  archiveExtraction: archiveExtractionReducer,
  filters: filtersReducer,
});

// Créer le reducer persisté
const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        ignoredPaths: ['healthcareAi.summary.lastUpdated', 'healthcareAi.trends.lastUpdated', 'healthcareAi.detailedStats.lastUpdated', 'healthcareAi.aiInsights.lastUpdated', 'healthcareAi.realTimeMetrics.lastUpdated'],
      },
    }),
});

// Créer le persistor pour PersistGate
export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Hook typé pour useDispatch
export const useAppDispatch = () => useDispatch<AppDispatch>(); 