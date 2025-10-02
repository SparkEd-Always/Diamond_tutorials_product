import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiService } from '../../services/apiService';

interface User {
  unique_id: string;
  full_name: string;
  email: string;
  role: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

interface LoginCredentials {
  username: string;
  password: string;
}

interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: false,
  error: null,
  isAuthenticated: false,
};

// Async thunk for login
export const login = createAsyncThunk<LoginResponse, LoginCredentials>(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await apiService.login(credentials);
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.detail || 'Login failed'
      );
    }
  }
);

// Async thunk for logout
export const logout = createAsyncThunk('auth/logout', async () => {
  return null;
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCredentials: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login cases
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.access_token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      })
      // Logout cases
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = null;
      });
  },
});

export const { clearError, setCredentials } = authSlice.actions;
export default authSlice.reducer;