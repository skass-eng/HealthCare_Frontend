import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Project } from '@/types';
import apiService from '@/lib/api';

// Actions asynchrones
export const fetchProjects = createAsyncThunk(
  'project/fetchProjects',
  async ({ page, limit }: { page: number; limit: number }) => {
    const response = await apiService.getProjects(page, limit);
    return response;
  }
);

export const fetchProject = createAsyncThunk(
  'project/fetchProject',
  async (projectId: string) => {
    const response = await apiService.getProject(projectId);
    return response.data;
  }
);

export const createProject = createAsyncThunk(
  'project/createProject',
  async (projectData: Partial<Project>) => {
    const response = await apiService.createProject(projectData);
    return response.data;
  }
);

export const updateProject = createAsyncThunk(
  'project/updateProject',
  async ({ projectId, projectData }: { projectId: string; projectData: Partial<Project> }) => {
    const response = await apiService.updateProject(projectId, projectData);
    return response.data;
  }
);

export const deleteProject = createAsyncThunk(
  'project/deleteProject',
  async (projectId: string) => {
    await apiService.deleteProject(projectId);
    return projectId;
  }
);

interface ProjectState {
  projects: Project[];
  currentProject: Project | null;
  loading: boolean;
  error: string | null;
}

const initialState: ProjectState = {
  projects: [],
  currentProject: null,
  loading: false,
  error: null,
};

const projectSlice = createSlice({
  name: 'project',
  initialState,
  reducers: {
    setCurrentProject: (state, action: PayloadAction<Project>) => {
      state.currentProject = action.payload;
    },
    clearCurrentProject: (state) => {
      state.currentProject = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Projects
    builder
      .addCase(fetchProjects.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.loading = false;
        state.projects = action.payload.items;
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Erreur de récupération des projets';
      });

    // Fetch Project
    builder
      .addCase(fetchProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProject.fulfilled, (state, action) => {
        state.loading = false;
        state.currentProject = action.payload;
      })
      .addCase(fetchProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Erreur de récupération du projet';
      });

    // Create Project
    builder
      .addCase(createProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createProject.fulfilled, (state, action) => {
        state.loading = false;
        state.currentProject = action.payload;
        state.projects.unshift(action.payload);
      })
      .addCase(createProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Erreur de création du projet';
      });

    // Update Project
    builder
      .addCase(updateProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProject.fulfilled, (state, action) => {
        state.loading = false;
        state.currentProject = action.payload;
        const index = state.projects.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.projects[index] = action.payload;
        }
      })
      .addCase(updateProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Erreur de mise à jour du projet';
      });

    // Delete Project
    builder
      .addCase(deleteProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteProject.fulfilled, (state, action) => {
        state.loading = false;
        state.projects = state.projects.filter(p => p.id !== action.payload);
        if (state.currentProject?.id === action.payload) {
          state.currentProject = null;
        }
      })
      .addCase(deleteProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Erreur de suppression du projet';
      });
  },
});

export const {
  setCurrentProject,
  clearCurrentProject,
  clearError,
} = projectSlice.actions;

export default projectSlice.reducer; 