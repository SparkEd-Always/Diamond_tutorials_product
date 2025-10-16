// ============================================================================
// Communication System Types
// ============================================================================

export type MessageType = 'broadcast' | 'direct' | 'announcement';
export type DeliveryStatus = 'sent' | 'delivered' | 'read' | 'failed';
export type TargetRole = 'parent' | 'teacher' | 'all';

// Main Message Interface
export interface Message {
  id: number;
  sender_id: number;
  sender_name: string;
  message_type: MessageType;
  target_role?: TargetRole;
  target_class_id?: number;
  target_class_name?: string;
  recipient_id?: number;
  recipient_name?: string;
  subject: string;
  body: string;
  attachments?: string[] | null;
  scheduled_at?: string | null;
  sent_at?: string | null;
  is_deleted: boolean;
  deleted_at?: string | null;
  created_at: string;
  updated_at?: string;

  // Computed fields (for sent messages)
  total_recipients?: number;
  delivered_count?: number;
  read_count?: number;
  failed_count?: number;
}

// Message Summary (for list views)
export interface MessageSummary {
  id: number;
  sender_id: number;
  sender_name: string;
  subject: string;
  message_type: MessageType;
  target_class_name?: string;
  recipient_name?: string;
  total_recipients?: number;
  read_count?: number;
  sent_at?: string | null;
  created_at: string;

  // For parent inbox
  is_read?: boolean;
  read_at?: string | null;
}

// Message Delivery (per recipient)
export interface MessageDelivery {
  id: number;
  message_id: number;
  recipient_id: number;
  recipient_name: string;
  recipient_email?: string;
  status: DeliveryStatus;
  delivered_at?: string | null;
  read_at?: string | null;
  channel_app: boolean;
  channel_sms: boolean;
  channel_email: boolean;
  failure_reason?: string | null;
  retry_count: number;
  created_at: string;
  updated_at?: string;
}

// Delivery Summary (aggregate stats)
export interface DeliveryStatusSummary {
  total_recipients: number;
  sent_count: number;
  delivered_count: number;
  read_count: number;
  failed_count: number;
  delivery_rate: number;
  read_rate: number;
}

// Communication Preferences
export interface CommunicationPreference {
  id: number;
  user_id: number;
  app_notifications_enabled: boolean;
  email_notifications_enabled: boolean;
  sms_notifications_enabled: boolean;
  preferred_language: string;
  daily_digest_enabled: boolean;
  instant_notifications: boolean;
  dnd_start_time?: string | null;
  dnd_end_time?: string | null;
  created_at: string;
  updated_at?: string;
}

// Engagement Statistics (for admin dashboard)
export interface EngagementStats {
  total_messages: number;
  total_broadcasts: number;
  total_direct: number;
  total_announcements: number;
  total_recipients: number;
  total_delivered: number;
  total_read: number;
  total_failed: number;
  average_delivery_rate: number;
  average_read_rate: number;
  active_parents_count: number;
  messages_sent_today: number;
  messages_sent_this_week: number;
  messages_sent_this_month: number;
}

// Form Data Types (for creating/updating)
export interface MessageCreateData {
  message_type: MessageType;
  subject: string;
  body: string;
  target_role?: TargetRole;
  target_class_id?: number;
  recipient_id?: number;
  attachments?: string[] | null;
  scheduled_at?: string | null;
}

export interface MessageUpdateData {
  subject?: string;
  body?: string;
  attachments?: string[] | null;
  scheduled_at?: string | null;
}

export interface CommunicationPreferenceUpdateData {
  app_notifications_enabled?: boolean;
  email_notifications_enabled?: boolean;
  sms_notifications_enabled?: boolean;
  preferred_language?: string;
  daily_digest_enabled?: boolean;
  instant_notifications?: boolean;
  dnd_start_time?: string | null;
  dnd_end_time?: string | null;
}

// Filter/Query Parameters
export interface MessageFilter {
  message_type?: MessageType;
  view?: 'sent' | 'received';
  search?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  page_size?: number;
}

// API Response Types
export interface UnreadCountResponse {
  unread_count: number;
}

export interface MessageResponse extends Message {
  // Full message response with all fields
}

export interface MessageListResponse {
  messages: MessageSummary[];
  total: number;
  page: number;
  page_size: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface DeliveryListResponse {
  deliveries: MessageDelivery[];
  summary: DeliveryStatusSummary;
}

// Class selection options
export interface ClassOption {
  id: number;
  name: string;
  student_count?: number;
}

// Parent selection options
export interface ParentOption {
  id: number;
  name: string;
  email: string;
  student_name?: string;
  class_name?: string;
}
