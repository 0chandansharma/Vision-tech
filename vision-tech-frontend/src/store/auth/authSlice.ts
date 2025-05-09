import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import authApi from '../../api/authApi';
import { User, LoginCredentials } from '../../types/user.types';
import { setAuthToken, clearAuthToken, getAuthToken } from '../../api/axiosConfig';

// Token storage key
const TOKEN_STORAGE_KEY = 'vision_tech_token';

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  token: getAuthToken(),
  user: null,
  isAuthenticated: !!getAuthToken(),
  isLoading: false,
  error: null,
};

interface LoginResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export const login = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const response = await authApi.login(credentials);

      // Store token with expiration
      setAuthToken(response.access_token, response.expires_in || 3600);

      // Fetch user details
      const user = await authApi.getCurrentUser();
      return { token: response.access_token, user };
    } catch (error: any) {
      // Handle common error formats from the backend
      if (error.response) {
        // If it's a validation error (e.g., missing fields)
        if (error.response.status === 422 && error.response.data?.detail) {
          return rejectWithValue(error.response.data.detail);
        }
        // If there's a specific error message
        if (error.response.data?.detail) {
          return rejectWithValue(error.response.data.detail);
        }
        // If there's a message in the response
        if (error.response.data?.message) {
          return rejectWithValue(error.response.data.message);
        }
        // Return the raw data if it exists
        if (error.response.data) {
          return rejectWithValue(error.response.data);
        }
      }

      // Default error message
      return rejectWithValue('Failed to login. Please check your credentials and try again.');
    }
  }
);

export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const user = await authApi.getCurrentUser();
      return user;
    } catch (error: any) {
      // If the request fails, the token might be invalid
      clearAuthToken();
      return rejectWithValue(error.response?.data?.detail || 'Failed to get user');
    }
  }
);

export const logout = createAsyncThunk('auth/logout', async () => {
  // Clear token on logout
  clearAuthToken();
  return null;
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuthError: (state) => {
      state.error = null;
    },
    checkAuthStatus: (state) => {
      // Update authentication status based on token
      const token = getAuthToken();
      state.isAuthenticated = !!token;
      state.token = token;
      if (!token) {
        state.user = null;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action: PayloadAction<{ token: string; user: User }>) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        // Ensure error is a string
        state.error = action.payload
          ? (typeof action.payload === 'object'
              ? JSON.stringify(action.payload)
              : String(action.payload))
          : 'Login failed';
      })

      // Fetch current user
      .addCase(fetchCurrentUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action: PayloadAction<User>) => {
        state.isLoading = false;
        state.user = action.payload;
        // If we successfully fetched the user, we're authenticated
        state.isAuthenticated = true;
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.token = null;
        state.user = null;
        // Add error handling for fetchCurrentUser
        state.error = action.payload
          ? (typeof action.payload === 'object'
              ? JSON.stringify(action.payload)
              : String(action.payload))
          : 'Failed to fetch user data';
      })

      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.token = null;
        state.user = null;
      });
  },
});

export const { clearAuthError, checkAuthStatus } = authSlice.actions;
export default authSlice.reducer;