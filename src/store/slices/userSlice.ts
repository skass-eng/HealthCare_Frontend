import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { User } from '../../types/api';
import { userService } from '../../lib/services/UserService';
import { RootState } from '../store';

interface UserState {
  users: User[];
  loading: boolean;
  error: string | null;
  shouldReload: boolean;
  lastReload: number | null;
}

const initialState: UserState = {
  users: [],
  loading: false,
  error: null,
  shouldReload: false,
  lastReload: null,
};

// Action asynchrone pour charger les utilisateurs
export const fetchUsers = createAsyncThunk(
  'user/fetchUsers',
  async (_, { rejectWithValue }) => {
    try {
      console.log('🔄 Fetching users from API...');
      const response = await userService.getUsers();
      console.log('📡 API Response:', response);
      
      if (response.success && response.data) {
        console.log('✅ Users loaded successfully:', response.data.items || []);
        return response.data.items || [];
      } else {
        console.error('❌ API Error:', response.error);
        return rejectWithValue(response.error || 'Erreur lors du chargement des utilisateurs');
      }
    } catch (error) {
      console.error('❌ Network Error:', error);
      return rejectWithValue('Erreur de connexion');
    }
  }
);

// Action asynchrone pour créer un utilisateur
export const createUser = createAsyncThunk(
  'user/createUser',
  async (userData: any, { rejectWithValue }) => {
    try {
      const response = await userService.createUser(userData);
      if (response.success && response.data) {
        return response.data;
      } else {
        return rejectWithValue(response.error || 'Erreur lors de la création');
      }
    } catch (error) {
      return rejectWithValue('Erreur de connexion');
    }
  }
);

// Action asynchrone pour mettre à jour un utilisateur
export const updateUser = createAsyncThunk(
  'user/updateUser',
  async ({ userId, userData }: { userId: number; userData: any }, { rejectWithValue }) => {
    try {
      const response = await userService.updateUser(userId, userData);
      if (response.success && response.data) {
        return response.data;
      } else {
        return rejectWithValue(response.error || 'Erreur lors de la mise à jour');
      }
    } catch (error) {
      return rejectWithValue('Erreur de connexion');
    }
  }
);

// Action asynchrone pour supprimer un utilisateur
export const deleteUser = createAsyncThunk(
  'user/deleteUser',
  async (userId: number, { rejectWithValue }) => {
    try {
      console.log('🗑️ Deleting user with ID:', userId);
      const response = await userService.deleteUser(userId);
      console.log('📡 Delete user response:', response);
      
      if (response.success) {
        console.log('✅ User deleted successfully');
        return userId;
      } else {
        console.error('❌ Delete user error:', response.error);
        return rejectWithValue(response.error || 'Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('❌ Delete user network error:', error);
      return rejectWithValue('Erreur de connexion');
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    triggerUserReload: (state) => {
      state.shouldReload = true;
      state.lastReload = Date.now();
    },
    clearUserReload: (state) => {
      state.shouldReload = false;
    },
    clearUserError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // fetchUsers
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
        state.error = null;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // createUser
    builder
      .addCase(createUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users.push(action.payload);
        state.error = null;
      })
      .addCase(createUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // updateUser
    builder
      .addCase(updateUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.users.findIndex(user => user.id === action.payload.id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
        state.error = null;
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // deleteUser
    builder
      .addCase(deleteUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users = state.users.filter(user => user.id !== action.payload);
        state.error = null;
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { triggerUserReload, clearUserReload, clearUserError } = userSlice.actions;

// Sélecteurs pour les utilisateurs
export const selectUsers = (state: RootState) => state.user.users;
export const selectUsersLoading = (state: RootState) => state.user.loading;
export const selectUsersError = (state: RootState) => state.user.error;
export const selectUserById = (state: RootState, userId: number) => 
  state.user.users.find(user => user.id === userId);

export default userSlice.reducer; 