import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

interface Student {
  id: number;
  unique_id: string;
  full_name: string;
  class_name: string;
  section: string;
  parent_phone: string;
  parent_name: string;
}

interface StudentsState {
  students: Student[];
  isLoading: boolean;
  error: string | null;
}

const initialState: StudentsState = {
  students: [],
  isLoading: false,
  error: null,
};

export const fetchStudents = createAsyncThunk(
  'students/fetchStudents',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: { token: string } };
      const response = await axios.get('/api/v1/students/', {
        headers: {
          Authorization: `Bearer ${state.auth.token}`,
        },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.detail || 'Failed to fetch students'
      );
    }
  }
);

const studentsSlice = createSlice({
  name: 'students',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStudents.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchStudents.fulfilled, (state, action) => {
        state.isLoading = false;
        state.students = action.payload;
        state.error = null;
      })
      .addCase(fetchStudents.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = studentsSlice.actions;
export default studentsSlice.reducer;