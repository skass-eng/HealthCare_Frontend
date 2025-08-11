import { configureStore } from '@reduxjs/toolkit';
import { useDispatch } from 'react-redux';
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

export const store = configureStore({
  reducer: {
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
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
        ignoredPaths: ['healthcareAi.summary.lastUpdated', 'healthcareAi.trends.lastUpdated', 'healthcareAi.detailedStats.lastUpdated', 'healthcareAi.aiInsights.lastUpdated', 'healthcareAi.realTimeMetrics.lastUpdated'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Hook typé pour useDispatch
export const useAppDispatch = () => useDispatch<AppDispatch>(); 