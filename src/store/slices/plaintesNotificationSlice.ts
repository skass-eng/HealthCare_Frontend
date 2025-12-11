import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Interface pour une notification de plainte (PDF/Image extraction terminée)
export interface PlainteNotification {
  id: string;
  type: 'pdf_extraction' | 'image_extraction' | 'plainte_created';
  status: 'success' | 'error' | 'pending';
  title: string;
  message: string;
  plainte_id?: number;
  task_id: string;
  filename?: string;
  timestamp: string;
  read: boolean;
  // Données supplémentaires pour la navigation
  navigation?: {
    href: string;
    label: string;
  };
}

// Interface pour une tâche de traitement en cours
export interface PendingTask {
  task_id: string;
  type: 'pdf_extraction' | 'image_extraction';
  filename: string;
  started_at: string;
  progress?: number;
  step?: string;
}

interface PlaintesNotificationState {
  // Notifications de plaintes terminées (non lues)
  notifications: PlainteNotification[];
  // Nombre de nouvelles notifications non lues
  unreadCount: number;
  // Tâches en cours de traitement
  pendingTasks: PendingTask[];
  // Dernière visite de la page "Création & Saisie"
  lastVisitedCreationPage: string | null;
}

// Récupérer l'état persisté du localStorage
const loadPersistedState = (): Partial<PlaintesNotificationState> => {
  try {
    const persisted = localStorage.getItem('plaintesNotificationState');
    if (persisted) {
      const parsed = JSON.parse(persisted);
      return {
        unreadCount: parsed.unreadCount || 0,
        notifications: parsed.notifications || [],
        lastVisitedCreationPage: parsed.lastVisitedCreationPage || null,
      };
    }
  } catch (error) {
    console.error('Erreur lors du chargement de l\'état persisté:', error);
  }
  return {};
};

const persistedState = loadPersistedState();

const initialState: PlaintesNotificationState = {
  notifications: persistedState.notifications || [],
  unreadCount: persistedState.unreadCount || 0,
  pendingTasks: [],
  lastVisitedCreationPage: persistedState.lastVisitedCreationPage || null,
};

// Fonction pour persister l'état dans localStorage
const persistState = (state: PlaintesNotificationState) => {
  try {
    localStorage.setItem('plaintesNotificationState', JSON.stringify({
      notifications: state.notifications,
      unreadCount: state.unreadCount,
      lastVisitedCreationPage: state.lastVisitedCreationPage,
    }));
  } catch (error) {
    console.error('Erreur lors de la persistance de l\'état:', error);
  }
};

const plaintesNotificationSlice = createSlice({
  name: 'plaintesNotification',
  initialState,
  reducers: {
    // Ajouter une tâche en cours de traitement
    addPendingTask: (state, action: PayloadAction<PendingTask>) => {
      // Éviter les doublons
      if (!state.pendingTasks.find(t => t.task_id === action.payload.task_id)) {
        state.pendingTasks.push(action.payload);
      }
    },

    // Mettre à jour la progression d'une tâche
    updateTaskProgress: (state, action: PayloadAction<{ task_id: string; progress?: number; step?: string }>) => {
      const task = state.pendingTasks.find(t => t.task_id === action.payload.task_id);
      if (task) {
        if (action.payload.progress !== undefined) task.progress = action.payload.progress;
        if (action.payload.step !== undefined) task.step = action.payload.step;
      }
    },

    // Supprimer une tâche terminée de la liste des pending
    removePendingTask: (state, action: PayloadAction<string>) => {
      state.pendingTasks = state.pendingTasks.filter(t => t.task_id !== action.payload);
    },

    // Ajouter une notification de plainte terminée
    addPlainteNotification: (state, action: PayloadAction<PlainteNotification>) => {
      // Éviter les doublons
      if (!state.notifications.find(n => n.id === action.payload.id)) {
        state.notifications.unshift(action.payload);
        if (!action.payload.read) {
          state.unreadCount++;
        }
        persistState(state);
      }
    },

    // Marquer une notification comme lue
    markNotificationAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification && !notification.read) {
        notification.read = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
        persistState(state);
      }
    },

    // Marquer toutes les notifications comme lues
    markAllNotificationsAsRead: (state) => {
      state.notifications.forEach(n => {
        n.read = true;
      });
      state.unreadCount = 0;
      persistState(state);
    },

    // Supprimer une notification
    removeNotification: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification && !notification.read) {
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
      state.notifications = state.notifications.filter(n => n.id !== action.payload);
      persistState(state);
    },

    // Effacer toutes les notifications
    clearAllNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
      persistState(state);
    },

    // Marquer la visite de la page Création & Saisie
    markCreationPageVisited: (state) => {
      state.lastVisitedCreationPage = new Date().toISOString();
      // Optionnel: marquer toutes les notifications comme lues quand on visite la page
      // state.notifications.forEach(n => { n.read = true; });
      // state.unreadCount = 0;
      persistState(state);
    },

    // Incrémenter le compteur (pour les tests ou mises à jour manuelles)
    incrementUnreadCount: (state) => {
      state.unreadCount++;
      persistState(state);
    },

    // Réinitialiser le compteur
    resetUnreadCount: (state) => {
      state.unreadCount = 0;
      persistState(state);
    },

    // Définir le compteur à une valeur spécifique
    setUnreadCount: (state, action: PayloadAction<number>) => {
      state.unreadCount = action.payload;
      persistState(state);
    },
  },
});

export const {
  addPendingTask,
  updateTaskProgress,
  removePendingTask,
  addPlainteNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  removeNotification,
  clearAllNotifications,
  markCreationPageVisited,
  incrementUnreadCount,
  resetUnreadCount,
  setUnreadCount,
} = plaintesNotificationSlice.actions;

export default plaintesNotificationSlice.reducer;
