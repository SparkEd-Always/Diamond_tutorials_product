import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiService } from '../../services/apiService';
import { RootState } from '../index';

interface AttendanceRecord {
  student_id: number;
  student_name: string;
  status: 'present' | 'absent' | 'late' | 'leave';
  remarks?: string;
}

interface AttendanceState {
  todayAttendance: AttendanceRecord[];
  isLoading: boolean;
  error: string | null;
  submitting: boolean;
}

const initialState: AttendanceState = {
  todayAttendance: [],
  isLoading: false,
  error: null,
  submitting: false,
};

export const markAttendance = createAsyncThunk(
  'attendance/markAttendance',
  async ({ attendanceData, date, is_draft }: { attendanceData: AttendanceRecord[], date: string, is_draft?: boolean }, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const token = state.auth.token;
      if (!token) {
        throw new Error('No authentication token');
      }
      const response = await apiService.markAttendance(attendanceData, date, token, is_draft);
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.detail || 'Failed to mark attendance'
      );
    }
  }
);

const attendanceSlice = createSlice({
  name: 'attendance',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    updateStudentAttendance: (state, action) => {
      const { student_id, status, remarks } = action.payload;
      const existingRecord = state.todayAttendance.find(
        record => record.student_id === student_id
      );

      if (existingRecord) {
        existingRecord.status = status;
        existingRecord.remarks = remarks;
      } else {
        state.todayAttendance.push({
          student_id,
          student_name: '', // Will be filled from students data
          status,
          remarks,
        });
      }
    },
    clearTodayAttendance: (state) => {
      state.todayAttendance = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(markAttendance.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(markAttendance.fulfilled, (state, action) => {
        state.submitting = false;
        state.error = null;
        state.todayAttendance = [];
      })
      .addCase(markAttendance.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, updateStudentAttendance, clearTodayAttendance } = attendanceSlice.actions;
export default attendanceSlice.reducer;