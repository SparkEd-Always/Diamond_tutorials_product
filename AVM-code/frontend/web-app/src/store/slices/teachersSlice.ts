import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

interface Teacher {
  id: number;
  unique_id: string;
  full_name: string;
  email: string;
  phone_number: string;
  subjects: string[];
  classes_assigned: string[];
}

interface TeachersState {
  teachers: Teacher[];
  isLoading: boolean;
  error: string | null;
}

const initialState: TeachersState = {
  teachers: [],
  isLoading: false,
  error: null,
};

export const fetchTeachers = createAsyncThunk(
  'teachers/fetchTeachers',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: { token: string } };
      const response = await axios.get('/api/v1/teachers/', {
        headers: {
          Authorization: `Bearer ${state.auth.token}`,
        },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.detail || 'Failed to fetch teachers'
      );
    }
  }
);

const teachersSlice = createSlice({
  name: 'teachers',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTeachers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTeachers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.teachers = action.payload;
        state.error = null;
      })
      .addCase(fetchTeachers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = teachersSlice.actions;
export default teachersSlice.reducer;