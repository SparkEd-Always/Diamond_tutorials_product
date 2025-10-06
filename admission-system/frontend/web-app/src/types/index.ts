// Core type definitions for the admission system

export interface User {
  id: number;
  email: string;
  role: 'parent' | 'admin' | 'super_admin' | 'teacher' | 'student';
  phone?: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
}

export interface UserProfile {
  first_name?: string;
  last_name?: string;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other';
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  phone?: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user?: User;
}

// Application Types
export type ApplicationStatus =
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'documents_pending'
  | 'test_scheduled'
  | 'test_completed'
  | 'interview_scheduled'
  | 'interview_completed'
  | 'decision_made'
  | 'fee_pending'
  | 'enrolled'
  | 'rejected'
  | 'waitlisted';

export interface StudentDetails {
  first_name: string;
  middle_name?: string;
  last_name: string;
  date_of_birth: string;
  gender: 'male' | 'female' | 'other';
  blood_group?: string;
  medical_conditions?: string;
  previous_school_name?: string;
  previous_school_address?: string;
  transport_required: boolean;
}

export interface ParentDetails {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  relationship_type: 'father' | 'mother' | 'guardian' | 'other';
  occupation?: string;
  employer_name?: string;
  annual_income?: number;
  education_qualification?: string;
  is_primary_contact: boolean;
}

export interface Address {
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

export interface ApplicationFormData {
  student_details: StudentDetails;
  parent_details: ParentDetails;
  address: Address;
  class_applying_id: number;
  academic_year_id: number;
  source?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
}

export interface Application {
  id: number;
  application_number: string;
  application_status: ApplicationStatus;
  submission_date?: string;
  review_date?: string;
  decision_date?: string;
  decision_reason?: string;
  source?: string;
  remarks?: string;
  created_at: string;
  updated_at: string;
  student_name?: string;
  parent_name?: string;
  class_name?: string;
}

export interface ApplicationDetails extends Application {
  student: StudentDetails & {
    blood_group?: string;
    medical_conditions?: string;
    previous_school?: string;
  };
  parent: ParentDetails & {
    occupation?: string;
  };
  academic: {
    class_name?: string;
    academic_year?: string;
  };
  status_history: StatusHistoryItem[];
}

export interface StatusHistoryItem {
  previous_status?: string;
  new_status: string;
  change_date: string;
  change_reason?: string;
}

// Document Types
export type VerificationStatus = 'pending' | 'verified' | 'rejected' | 'requires_resubmission';

export interface DocumentType {
  id: number;
  type_name: string;
  is_mandatory: boolean;
  description?: string;
  allowed_formats?: string;
  max_file_size_mb: number;
}

export interface Document {
  id: number;
  application_id: number;
  document_type_id: number;
  original_filename: string;
  stored_filename: string;
  file_size_kb: number;
  verification_status: VerificationStatus;
  verification_notes?: string;
  uploaded_at: string;
}

// Academic Types
export interface AcademicYear {
  id: number;
  year_name: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
  admission_start_date?: string;
  admission_end_date?: string;
}

export interface Class {
  id: number;
  class_name: string;
  class_order: number;
  capacity: number;
  age_min?: number;
  age_max?: number;
  admission_fee?: number;
  annual_fee?: number;
  is_active: boolean;
}

// API Response Types
export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  total: number;
  page: number;
  page_size: number;
  applications: T[];
}

// Filter Types
export interface ApplicationFilters {
  status?: ApplicationStatus;
  class_applying_id?: number;
  academic_year_id?: number;
  date_from?: string;
  date_to?: string;
  search_query?: string;
  page?: number;
  page_size?: number;
}

// Re-export workflow types
export * from './workflow';
