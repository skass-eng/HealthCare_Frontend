import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Task, TaskState, WidgetType } from '@/types';
import apiService from '@/lib/api';

// Actions asynchrones
export const fetchTasks = createAsyncThunk(
  'task/fetchTasks',
  async ({ page, limit }: { page: number; limit: number }) => {
    const response = await apiService.getTasks(page, limit);
    return response;
  }
);

export const fetchTask = createAsyncThunk(
  'task/fetchTask',
  async (taskId: string) => {
    const response = await apiService.getTask(taskId);
    return response.data;
  }
);

export const createTask = createAsyncThunk(
  'task/createTask',
  async (taskData: {
    type: WidgetType;
    dashboard_id: string;
    widget_id: string;
    parameters: Record<string, any>;
  }) => {
    const response = await apiService.createTask(taskData);
    return response.data;
  }
);

export const cancelTask = createAsyncThunk(
  'task/cancelTask',
  async (taskId: string) => {
    await apiService.cancelTask(taskId);
    return taskId;
  }
);

const initialState: TaskState = {
  tasks: [],
  activeTasks: [],
  loading: false,
  error: null,
};

const taskSlice = createSlice({
  name: 'task',
  initialState,
  reducers: {
    addTask: (state, action: PayloadAction<Task>) => {
      state.tasks.unshift(action.payload);
      if (action.payload.status === 'pending' || action.payload.status === 'running') {
        state.activeTasks.push(action.payload.id);
      }
    },
    updateTask: (state, action: PayloadAction<Task>) => {
      const index = state.tasks.findIndex(t => t.id === action.payload.id);
      if (index !== -1) {
        state.tasks[index] = action.payload;
        
        // Mettre à jour la liste des tâches actives
        if (action.payload.status === 'completed' || action.payload.status === 'failed') {
          state.activeTasks = state.activeTasks.filter(id => id !== action.payload.id);
        } else if (!state.activeTasks.includes(action.payload.id)) {
          state.activeTasks.push(action.payload.id);
        }
      }
    },
    removeTask: (state, action: PayloadAction<string>) => {
      state.tasks = state.tasks.filter(t => t.id !== action.payload);
      state.activeTasks = state.activeTasks.filter(id => id !== action.payload);
    },
    clearTasks: (state) => {
      state.tasks = [];
      state.activeTasks = [];
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Tasks
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = action.payload.items;
        state.activeTasks = action.payload.items
          .filter((task: Task) => task.status === 'pending' || task.status === 'running')
          .map((task: Task) => task.id);
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Erreur de récupération des tâches';
      });

    // Fetch Task
    builder
      .addCase(fetchTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTask.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.tasks.findIndex(t => t.id === action.payload.id);
        if (index !== -1) {
          state.tasks[index] = action.payload;
        } else {
          state.tasks.unshift(action.payload);
        }
      })
      .addCase(fetchTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Erreur de récupération de la tâche';
      });

    // Create Task
    builder
      .addCase(createTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks.unshift(action.payload);
        state.activeTasks.push(action.payload.id);
      })
      .addCase(createTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Erreur de création de la tâche';
      });

    // Cancel Task
    builder
      .addCase(cancelTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cancelTask.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.tasks.findIndex(t => t.id === action.payload);
        if (index !== -1) {
          state.tasks[index].status = 'failed';
          state.tasks[index].error = 'Tâche annulée par l\'utilisateur';
        }
        state.activeTasks = state.activeTasks.filter(id => id !== action.payload);
      })
      .addCase(cancelTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Erreur d\'annulation de la tâche';
      });
  },
});

export const {
  addTask,
  updateTask,
  removeTask,
  clearTasks,
  clearError,
} = taskSlice.actions;

export default taskSlice.reducer; 