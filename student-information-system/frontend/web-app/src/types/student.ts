/**
 * Student-related TypeScript types and interfaces
 */

export interface Student {
  id: string;
  admission_number: string;
  roll_number?: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  date_of_birth: string;
  gender: 'Male' | 'Female' | 'Other';
  blood_group?: string;
  nationality?: string;
  religion?: string;
  caste_category?: 'General' | 'OBC' | 'SC' | 'ST' | 'Other';
  aadhar_number?: string;
  photo_url?: string;
  current_class_id?: string;
  current_section_id?: string;
  house_id?: string;
  admission_date: string;
  student_status: 'Active' | 'Alumni' | 'Transferred' | 'Expelled' | 'Withdrawn';
  profile_completeness_percentage?: number;
  created_at: string;
  updated_at: string;
}

export interface StudentCreate {
  admission_number: string;
  roll_number?: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  date_of_birth: string;
  gender: 'Male' | 'Female' | 'Other';
  blood_group?: string;
  nationality?: string;
  religion?: string;
  caste_category?: 'General' | 'OBC' | 'SC' | 'ST' | 'Other';
  aadhar_number?: string;
  current_class_id?: string;
  current_section_id?: string;
  house_id?: string;
  admission_date: string;
}

export interface StudentUpdate extends Partial<StudentCreate> {
  student_status?: 'Active' | 'Alumni' | 'Transferred' | 'Expelled' | 'Withdrawn';
}

export interface StudentListResponse {
  data: Student[];
  total: number;
  page: number;
  per_page: number;
}

export interface StudentSearchParams {
  page?: number;
  per_page?: number;
  search?: string;
  class_id?: string;
  section_id?: string;
  status?: string;
  gender?: string;
}

export interface StudentDetail extends Student {
  parents?: Parent[];
  addresses?: Address[];
  documents?: Document[];
  emergency_contacts?: EmergencyContact[];
}

export interface Parent {
  id: string;
  title?: string;
  first_name: string;
  last_name: string;
  relationship: 'Father' | 'Mother' | 'Guardian' | 'Other';
  email?: string;
  phone_primary: string;
  phone_secondary?: string;
  occupation?: string;
  annual_income?: number;
  is_primary_contact: boolean;
}

export interface Address {
  id: string;
  address_type: 'Current' | 'Permanent';
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  is_primary: boolean;
}

export interface EmergencyContact {
  id: string;
  contact_name: string;
  relationship: string;
  phone_primary: string;
  phone_secondary?: string;
  email?: string;
  priority_order: number;
  can_pickup_student: boolean;
}

export interface Document {
  id: string;
  document_type: string;
  document_name: string;
  file_path: string;
  file_size: number;
  file_mime_type: string;
  document_category: string;
  created_at: string;
}
