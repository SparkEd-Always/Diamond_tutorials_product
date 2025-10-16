// ============================================================================
// Student Information System (SIS) Types
// ============================================================================

export type Gender = 'Male' | 'Female' | 'Other';
export type CasteCategory = 'General' | 'OBC' | 'SC' | 'ST' | 'Other';
export type StudentStatus = 'Active' | 'Alumni' | 'Transferred' | 'Expelled' | 'Withdrawn';

// Main Student Interface
export interface Student {
  // Primary Key
  id: string;

  // Basic Information
  admission_number: string;
  roll_number?: string | null;
  first_name: string;
  middle_name?: string | null;
  last_name: string;

  // Personal Information
  date_of_birth: string; // ISO date string
  gender: Gender;
  blood_group?: string | null;
  nationality: string;
  religion?: string | null;
  caste_category?: CasteCategory | null;

  // Government IDs
  aadhar_number?: string | null;

  // Photo
  photo_url?: string | null;

  // Academic Information
  current_class_id?: string | null;
  current_class_name?: string; // Computed field from join
  current_section_id?: string | null;
  current_section_name?: string; // Computed field from join
  house_id?: string | null;
  house_name?: string; // Computed field from join
  admission_date: string; // ISO date string

  // Status
  student_status: StudentStatus;

  // Profile Completeness
  profile_completeness_percentage: number;

  // Timestamps
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;

  // Audit Fields
  created_by?: string | null;
  updated_by?: string | null;

  // Computed/Virtual Fields
  full_name?: string;
  age?: number;
  is_active?: boolean;
}

// Student Summary (for list views)
export interface StudentSummary {
  id: string;
  admission_number: string;
  roll_number?: string | null;
  first_name: string;
  middle_name?: string | null;
  last_name: string;
  full_name: string;
  gender: Gender;
  date_of_birth: string;
  age: number;
  current_class_name?: string;
  current_section_name?: string;
  student_status: StudentStatus;
  photo_url?: string | null;
  profile_completeness_percentage: number;
}

// Student Create/Update Data
export interface StudentCreateData {
  // Basic Information (required)
  admission_number: string;
  roll_number?: string | null;
  first_name: string;
  middle_name?: string | null;
  last_name: string;

  // Personal Information (required)
  date_of_birth: string; // YYYY-MM-DD format
  gender: Gender;
  blood_group?: string | null;
  nationality?: string;
  religion?: string | null;
  caste_category?: CasteCategory | null;

  // Government IDs
  aadhar_number?: string | null;

  // Photo
  photo_url?: string | null;

  // Academic Information
  current_class_id?: string | null;
  current_section_id?: string | null;
  house_id?: string | null;
  admission_date: string; // YYYY-MM-DD format

  // Status
  student_status?: StudentStatus;
}

export interface StudentUpdateData extends Partial<StudentCreateData> {
  // All fields are optional for updates
}

// Student Filter Parameters
export interface StudentFilter {
  page?: number;
  per_page?: number;
  search?: string; // Search by name, admission number, or roll number
  class_id?: string;
  section_id?: string;
  status?: StudentStatus;
  gender?: Gender;
  caste_category?: CasteCategory;
  admission_year?: number;
  date_of_birth_from?: string;
  date_of_birth_to?: string;
}

// Student List Response
export interface StudentListResponse {
  success: boolean;
  data: {
    students: StudentSummary[];
    total: number;
    page: number;
    per_page: number;
    total_pages: number;
  };
  message: string;
}

// Single Student Response
export interface StudentResponse {
  success: boolean;
  data: Student;
  message: string;
}

// Class/Section/House Options (for dropdowns)
export interface ClassOption {
  id: string;
  name: string;
  level?: number;
  display_order?: number;
}

export interface SectionOption {
  id: string;
  name: string;
  class_id: string;
  capacity?: number;
}

export interface HouseOption {
  id: string;
  name: string;
  color?: string;
  motto?: string;
}

// Student Statistics (for dashboard)
export interface StudentStats {
  total_students: number;
  active_students: number;
  new_admissions_this_month: number;
  alumni_count: number;
  transferred_count: number;
  male_count: number;
  female_count: number;
  other_gender_count: number;
  average_profile_completeness: number;
}

// Bulk Operations
export interface BulkStudentImportData {
  file: File;
  skip_validation?: boolean;
  update_existing?: boolean;
}

export interface BulkImportResult {
  success: boolean;
  total_records: number;
  successful_imports: number;
  failed_imports: number;
  errors: Array<{
    row: number;
    error: string;
    data?: any;
  }>;
}

// Student Profile Tab Data
export interface StudentProfileData {
  personal: Student;
  parents?: ParentInfo[];
  academics?: AcademicRecord[];
  attendance?: AttendanceRecord[];
  medical?: MedicalRecord[];
  behavioral?: BehavioralRecord[];
  documents?: StudentDocument[];
}

// Parent Information (simplified)
export interface ParentInfo {
  id: string;
  relationship_type: 'Father' | 'Mother' | 'Guardian';
  first_name: string;
  last_name: string;
  occupation?: string;
  phone_primary: string;
  email?: string;
}

// Academic Record (simplified)
export interface AcademicRecord {
  id: string;
  academic_year: string;
  term: string;
  subject: string;
  marks_obtained: number;
  total_marks: number;
  grade: string;
  percentage: number;
}

// Attendance Record (simplified)
export interface AttendanceRecord {
  id: string;
  date: string;
  status: 'Present' | 'Absent' | 'Late' | 'Excused';
  remarks?: string;
}

// Medical Record (simplified)
export interface MedicalRecord {
  id: string;
  date: string;
  type: string;
  description: string;
  doctor_name?: string;
}

// Behavioral Record (simplified)
export interface BehavioralRecord {
  id: string;
  date: string;
  incident_type: string;
  description: string;
  action_taken?: string;
}

// Student Document
export interface StudentDocument {
  id: string;
  document_type: string;
  document_name: string;
  file_url: string;
  uploaded_at: string;
  file_size?: number;
  mime_type?: string;
}
