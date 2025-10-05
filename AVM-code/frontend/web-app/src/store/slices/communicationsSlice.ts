import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

interface CommunicationHistory {
  id: number;
  subject: string;
  message: string;
  message_type: string;
  sent_at: string;
  delivery_status: string;
}

interface CommunicationsState {
  history: CommunicationHistory[];
  isLoading: boolean;
  error: string | null;
  sendingMessage: boolean;
}

const initialState: CommunicationsState = {
  history: [],
  isLoading: false,
  error: null,
  sendingMessage: false,
};

export const fetchCommunicationHistory = createAsyncThunk(
  'communications/fetchHistory',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: { token: string } };
      const response = await axios.get('http://192.168.1.4:8000/api/v1/communications/history', {
        headers: {
          Authorization: `Bearer ${state.auth.token}`,
        },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.detail || 'Failed to fetch communication history'
      );
    }
  }
);

export const sendWhatsAppMessage = createAsyncThunk(
  'communications/sendWhatsApp',
  async (messageData: any, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: { token: string } };
      const response = await axios.post('http://192.168.1.4:8000/api/v1/communications/send-whatsapp', messageData, {
        headers: {
          Authorization: `Bearer ${state.auth.token}`,
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.detail || 'Failed to send WhatsApp message'
      );
    }
  }
);

const communicationsSlice = createSlice({
  name: 'communications',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch history
      .addCase(fetchCommunicationHistory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCommunicationHistory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.history = action.payload;
        state.error = null;
      })
      .addCase(fetchCommunicationHistory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Send WhatsApp message
      .addCase(sendWhatsAppMessage.pending, (state) => {
        state.sendingMessage = true;
        state.error = null;
      })
      .addCase(sendWhatsAppMessage.fulfilled, (state, action) => {
        state.sendingMessage = false;
        state.error = null;
      })
      .addCase(sendWhatsAppMessage.rejected, (state, action) => {
        state.sendingMessage = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = communicationsSlice.actions;
export default communicationsSlice.reducer;