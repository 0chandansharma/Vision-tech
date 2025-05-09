// src/store/admin/adminSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import usersApi from '../../api/usersApi';
import rolesApi from '../../api/rolesApi';
import { User, UserCreate, UserUpdate } from '../../types/user.types';
import { Role, RoleCreate, RoleUpdate } from '../../types/role.types';

interface AdminState {
  users: User[];
  roles: Role[];
  isLoading: boolean;
  error: string | null;
}

const initialState: AdminState = {
  users: [],
  roles: [],
  isLoading: false,
  error: null,
};

// User thunks
export const fetchUsers = createAsyncThunk(
  'admin/fetchUsers',
  async (_, { rejectWithValue }) => {
    try {
      return await usersApi.getUsers();
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch users');
    }
  }
);

export const createUser = createAsyncThunk(
  'admin/createUser',
  async (userData: UserCreate, { rejectWithValue }) => {
    try {
      return await usersApi.createUser(userData);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to create user');
    }
  }
);

export const updateUser = createAsyncThunk(
  'admin/updateUser',
  async ({ id, data }: { id: number; data: UserUpdate }, { rejectWithValue }) => {
    try {
      return await usersApi.updateUser(id, data);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to update user');
    }
  }
);

export const deleteUser = createAsyncThunk(
  'admin/deleteUser',
  async (userId: number, { rejectWithValue }) => {
    try {
      await usersApi.deleteUser(userId);
      return userId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to delete user');
    }
  }
);

// Role thunks
export const fetchRoles = createAsyncThunk(
  'admin/fetchRoles',
  async (_, { rejectWithValue }) => {
    try {
      return await rolesApi.getRoles();
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch roles');
    }
  }
);

export const createRole = createAsyncThunk(
  'admin/createRole',
  async (roleData: RoleCreate, { rejectWithValue }) => {
    try {
      return await rolesApi.createRole(roleData);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to create role');
    }
  }
);

export const updateRole = createAsyncThunk(
  'admin/updateRole',
  async ({ id, data }: { id: number; data: RoleUpdate }, { rejectWithValue }) => {
    try {
      return await rolesApi.updateRole(id, data);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to update role');
    }
  }
);

export const deleteRole = createAsyncThunk(
  'admin/deleteRole',
  async (roleId: number, { rejectWithValue }) => {
    try {
      await rolesApi.deleteRole(roleId);
      return roleId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to delete role');
    }
  }
);

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    clearAdminError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Users
      .addCase(fetchUsers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action: PayloadAction<User[]>) => {
        state.isLoading = false;
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Create User
      .addCase(createUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createUser.fulfilled, (state, action: PayloadAction<User>) => {
        state.isLoading = false;
        state.users.unshift(action.payload);
      })
      .addCase(createUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Update User
      .addCase(updateUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action: PayloadAction<User>) => {
        state.isLoading = false;
        state.users = state.users.map((user) =>
          user.id === action.payload.id ? action.payload : user
        );
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Delete User
      .addCase(deleteUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteUser.fulfilled, (state, action: PayloadAction<number>) => {
        state.isLoading = false;
        state.users = state.users.filter((user) => user.id !== action.payload);
      })
      // src/store/admin/adminSlice.ts (continued)
      .addCase(deleteUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Fetch Roles
      .addCase(fetchRoles.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRoles.fulfilled, (state, action: PayloadAction<Role[]>) => {
        state.isLoading = false;
        state.roles = action.payload;
      })
      .addCase(fetchRoles.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Create Role
      .addCase(createRole.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createRole.fulfilled, (state, action: PayloadAction<Role>) => {
        state.isLoading = false;
        state.roles.unshift(action.payload);
      })
      .addCase(createRole.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Update Role
      .addCase(updateRole.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateRole.fulfilled, (state, action: PayloadAction<Role>) => {
        state.isLoading = false;
        state.roles = state.roles.map((role) =>
          role.id === action.payload.id ? action.payload : role
        );
      })
      .addCase(updateRole.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Delete Role
      .addCase(deleteRole.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteRole.fulfilled, (state, action: PayloadAction<number>) => {
        state.isLoading = false;
        state.roles = state.roles.filter((role) => role.id !== action.payload);
      })
      .addCase(deleteRole.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearAdminError } = adminSlice.actions;
export default adminSlice.reducer;