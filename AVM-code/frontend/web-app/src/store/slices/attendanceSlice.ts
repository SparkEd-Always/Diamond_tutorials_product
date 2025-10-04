import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

interface AttendanceRecord {
  id: number;
  student_name: string;
  student_unique_id: string;
  class_name: string;
  date: string;
  status: string;
  remarks: string;
  marked_at: string;
  parent_phone: string;
}

interface AttendanceState {
  pendingApproval: AttendanceRecord[];
  groupedByClass: Record<string, AttendanceRecord[]>;
  isLoading: boolean;
  error: string | null;
  approvalInProgress: boolean;
}

const initialState: AttendanceState = {
  pendingApproval: [],
  groupedByClass: {},
  isLoading: false,
  error: null,
  approvalInProgress: false,
};

export const fetchPendingAttendance = createAsyncThunk(
  'attendance/fetchPendingAttendance',
  async (date: string | undefined, thunkAPI) => {
    const { getState, rejectWithValue } = thunkAPI;
    try {
      const state = getState() as { auth: { token: string } };
      const params = date ? `?attendance_date=${date}` : '';
      const response = await axios.get(`/api/v1/attendance/pending-approval${params}`, {
        headers: {
          Authorization: `Bearer ${state.auth.token}`,
        },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.detail || 'Failed to fetch pending attendance'
      );
    }
  }
);

export const approveAttendance = createAsyncThunk(
  'attendance/approveAttendance',
  async (attendanceIds: number[], thunkAPI) => {
    const { getState, rejectWithValue } = thunkAPI;
    try {
      const state = getState() as { auth: { token: string } };
      const response = await axios.post('/api/v1/attendance/approve', attendanceIds, {
        headers: {
          Authorization: `Bearer ${state.auth.token}`,
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.detail || 'Failed to approve attendance'
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
    groupAttendanceByClass: (state) => {
      const grouped: Record<string, AttendanceRecord[]> = {};
      state.pendingApproval.forEach((record) => {
        if (!grouped[record.class_name]) {
          grouped[record.class_name] = [];
        }
        grouped[record.class_name].push(record);
      });
      state.groupedByClass = grouped;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch pending attendance
      .addCase(fetchPendingAttendance.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPendingAttendance.fulfilled, (state, action) => {
        state.isLoading = false;
        state.pendingApproval = action.payload;
        state.error = null;
        // Auto-group by class
        const grouped: Record<string, AttendanceRecord[]> = {};
        action.payload.forEach((record: AttendanceRecord) => {
          if (!grouped[record.class_name]) {
            grouped[record.class_name] = [];
          }
          grouped[record.class_name].push(record);
        });
        state.groupedByClass = grouped;
      })
      .addCase(fetchPendingAttendance.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Approve attendance
      .addCase(approveAttendance.pending, (state) => {
        state.approvalInProgress = true;
        state.error = null;
      })
      .addCase(approveAttendance.fulfilled, (state, action) => {
        state.approvalInProgress = false;
        state.error = null;
        // Remove approved items from pending list
        // This will be handled by refetching data
      })
      .addCase(approveAttendance.rejected, (state, action) => {
        state.approvalInProgress = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, groupAttendanceByClass } = attendanceSlice.actions;
export default attendanceSlice.reducer;