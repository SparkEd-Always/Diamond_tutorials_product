import api from './api';
import type {
  Message,
  MessageSummary,
  MessageCreateData,
  MessageUpdateData,
  MessageDelivery,
  DeliveryStatusSummary,
  CommunicationPreference,
  CommunicationPreferenceUpdateData,
  EngagementStats,
  MessageFilter,
  UnreadCountResponse,
  ClassOption,
  ParentOption,
} from '../types/communication';

// ============================================================================
// Communication API Service
// ============================================================================

export const communicationApi = {
  // --------------------------------------------------------------------
  // Message CRUD Operations
  // --------------------------------------------------------------------

  /**
   * Create and send a new message
   */
  createMessage: async (data: MessageCreateData): Promise<Message> => {
    const response = await api.post('/communication/messages', data);
    return response.data;
  },

  /**
   * Get list of messages (sent or received based on user role)
   */
  getMessages: async (filters?: MessageFilter): Promise<MessageSummary[]> => {
    const response = await api.get('/communication/messages', { params: filters });
    return response.data;
  },

  /**
   * Get details of a specific message
   */
  getMessage: async (messageId: number): Promise<Message> => {
    const response = await api.get(`/communication/messages/${messageId}`);
    return response.data;
  },

  /**
   * Update a draft message (before sending)
   */
  updateMessage: async (messageId: number, data: MessageUpdateData): Promise<Message> => {
    const response = await api.put(`/communication/messages/${messageId}`, data);
    return response.data;
  },

  /**
   * Delete a draft message
   */
  deleteMessage: async (messageId: number): Promise<{ message: string }> => {
    const response = await api.delete(`/communication/messages/${messageId}`);
    return response.data;
  },

  // --------------------------------------------------------------------
  // Delivery & Read Receipts
  // --------------------------------------------------------------------

  /**
   * Mark a message as read (automatically creates read receipt)
   */
  markAsRead: async (messageId: number): Promise<MessageDelivery> => {
    const response = await api.put(`/communication/messages/${messageId}/read`);
    return response.data;
  },

  /**
   * Get delivery status for all recipients of a message
   */
  getDeliveryStatus: async (messageId: number): Promise<MessageDelivery[]> => {
    const response = await api.get(`/communication/messages/${messageId}/delivery-status`);
    return response.data;
  },

  /**
   * Get delivery summary (aggregate statistics)
   */
  getDeliverySummary: async (messageId: number): Promise<DeliveryStatusSummary> => {
    const response = await api.get(`/communication/messages/${messageId}/delivery-summary`);
    return response.data;
  },

  // --------------------------------------------------------------------
  // Communication Preferences
  // --------------------------------------------------------------------

  /**
   * Get user's communication preferences (auto-creates if doesn't exist)
   */
  getPreferences: async (): Promise<CommunicationPreference> => {
    const response = await api.get('/communication/preferences');
    return response.data;
  },

  /**
   * Update communication preferences
   */
  updatePreferences: async (data: CommunicationPreferenceUpdateData): Promise<CommunicationPreference> => {
    const response = await api.put('/communication/preferences', data);
    return response.data;
  },

  // --------------------------------------------------------------------
  // Statistics & Analytics
  // --------------------------------------------------------------------

  /**
   * Get system-wide engagement statistics (Admin only)
   */
  getEngagementStats: async (): Promise<EngagementStats> => {
    const response = await api.get('/communication/stats/engagement');
    return response.data;
  },

  /**
   * Get user-specific statistics
   */
  getMyStats: async (): Promise<any> => {
    const response = await api.get('/communication/stats/my-stats');
    return response.data;
  },

  // --------------------------------------------------------------------
  // Unread Count (for badge notifications)
  // --------------------------------------------------------------------

  /**
   * Get count of unread messages
   */
  getUnreadCount: async (): Promise<number> => {
    const response = await api.get<UnreadCountResponse>('/communication/unread-count');
    return response.data.unread_count;
  },

  // --------------------------------------------------------------------
  // Utility Endpoints
  // --------------------------------------------------------------------

  /**
   * Health check for communication service
   */
  healthCheck: async (): Promise<{ status: string; message: string }> => {
    const response = await api.get('/communication/health');
    return response.data;
  },

  // --------------------------------------------------------------------
  // Helper Methods (for UI dropdowns/selections)
  // --------------------------------------------------------------------

  /**
   * Get list of classes for broadcast targeting
   * (Uses existing academic API endpoint)
   */
  getClasses: async (): Promise<ClassOption[]> => {
    const response = await api.get('/academic/classes');
    return response.data.map((cls: any) => ({
      id: cls.id,
      name: cls.name,
      student_count: cls.student_count,
    }));
  },

  /**
   * Get list of parents for direct messaging
   * Note: This endpoint may need to be added to backend
   */
  getParents: async (classId?: number): Promise<ParentOption[]> => {
    const params = classId ? { class_id: classId } : {};
    try {
      const response = await api.get('/communication/parents', { params });
      return response.data;
    } catch (error) {
      // Fallback: If endpoint doesn't exist, return empty array
      console.warn('Parents endpoint not available yet:', error);
      return [];
    }
  },
};

export default communicationApi;
