import axios from 'axios';
import type {
  Student,
  StudentSummary,
  StudentCreateData,
  StudentUpdateData,
  StudentFilter,
  StudentListResponse,
  StudentResponse,
  StudentStats,
  ClassOption,
  SectionOption,
  HouseOption,
  BulkStudentImportData,
  BulkImportResult,
  StudentProfileData,
} from '../types/student';

// Create separate axios instance for SIS backend
// TODO: Update with actual SIS backend URL when deployed
const SIS_API_BASE_URL = process.env.VITE_SIS_API_URL || 'http://localhost:8001/api/v1';

const sisApi = axios.create({
  baseURL: SIS_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
sisApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
sisApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ============================================================================
// Student Information System (SIS) API Service
// ============================================================================

export const studentApi = {
  // --------------------------------------------------------------------
  // Student CRUD Operations
  // --------------------------------------------------------------------

  /**
   * Get list of students with pagination and filters
   */
  getStudents: async (filters?: StudentFilter): Promise<StudentListResponse> => {
    const response = await sisApi.get('/students', { params: filters });
    return response.data;
  },

  /**
   * Get single student by ID
   */
  getStudent: async (studentId: string): Promise<Student> => {
    const response = await sisApi.get<StudentResponse>(`/students/${studentId}`);
    return response.data.data;
  },

  /**
   * Create new student
   */
  createStudent: async (data: StudentCreateData): Promise<Student> => {
    const response = await sisApi.post<StudentResponse>('/students', data);
    return response.data.data;
  },

  /**
   * Update existing student
   */
  updateStudent: async (studentId: string, data: StudentUpdateData): Promise<Student> => {
    const response = await sisApi.put<StudentResponse>(`/students/${studentId}`, data);
    return response.data.data;
  },

  /**
   * Delete student (soft delete)
   */
  deleteStudent: async (studentId: string): Promise<{ success: boolean; message: string }> => {
    const response = await sisApi.delete(`/students/${studentId}`);
    return response.data;
  },

  // --------------------------------------------------------------------
  // Student Profile Data (Comprehensive View)
  // --------------------------------------------------------------------

  /**
   * Get complete student profile with all related data
   */
  getStudentProfile: async (studentId: string): Promise<StudentProfileData> => {
    const response = await sisApi.get(`/students/${studentId}/profile`);
    return response.data.data;
  },

  // --------------------------------------------------------------------
  // Statistics & Analytics
  // --------------------------------------------------------------------

  /**
   * Get student statistics for dashboard
   */
  getStudentStats: async (): Promise<StudentStats> => {
    const response = await sisApi.get('/students/stats/overview');
    return response.data.data;
  },

  // --------------------------------------------------------------------
  // Bulk Operations
  // --------------------------------------------------------------------

  /**
   * Bulk import students from Excel/CSV
   */
  bulkImportStudents: async (data: BulkStudentImportData): Promise<BulkImportResult> => {
    const formData = new FormData();
    formData.append('file', data.file);
    if (data.skip_validation) {
      formData.append('skip_validation', 'true');
    }
    if (data.update_existing) {
      formData.append('update_existing', 'true');
    }

    const response = await sisApi.post('/students/bulk/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Bulk export students to Excel
   */
  bulkExportStudents: async (filters?: StudentFilter): Promise<Blob> => {
    const response = await sisApi.get('/students/bulk/export', {
      params: filters,
      responseType: 'blob',
    });
    return response.data;
  },

  // --------------------------------------------------------------------
  // Lookup Data (for dropdowns and filters)
  // --------------------------------------------------------------------

  /**
   * Get list of classes
   */
  getClasses: async (): Promise<ClassOption[]> => {
    const response = await sisApi.get('/academic/classes');
    return response.data.data;
  },

  /**
   * Get list of sections for a class
   */
  getSections: async (classId?: string): Promise<SectionOption[]> => {
    const params = classId ? { class_id: classId } : {};
    const response = await sisApi.get('/academic/sections', { params });
    return response.data.data;
  },

  /**
   * Get list of houses
   */
  getHouses: async (): Promise<HouseOption[]> => {
    const response = await sisApi.get('/academic/houses');
    return response.data.data;
  },

  // --------------------------------------------------------------------
  // Search & Advanced Queries
  // --------------------------------------------------------------------

  /**
   * Search students by name, admission number, or roll number
   */
  searchStudents: async (query: string, limit: number = 10): Promise<StudentSummary[]> => {
    const response = await sisApi.get('/students/search', {
      params: { q: query, limit },
    });
    return response.data.data;
  },

  /**
   * Get students by class and section
   */
  getStudentsByClassSection: async (
    classId: string,
    sectionId?: string
  ): Promise<StudentSummary[]> => {
    const params = sectionId ? { class_id: classId, section_id: sectionId } : { class_id: classId };
    const response = await sisApi.get('/students', { params });
    return response.data.data.students;
  },

  // --------------------------------------------------------------------
  // Utility Functions
  // --------------------------------------------------------------------

  /**
   * Generate admission number
   */
  generateAdmissionNumber: async (): Promise<string> => {
    const response = await sisApi.post('/students/generate-admission-number');
    return response.data.data.admission_number;
  },

  /**
   * Check if admission number is available
   */
  checkAdmissionNumber: async (admissionNumber: string): Promise<boolean> => {
    const response = await sisApi.get('/students/check-admission-number', {
      params: { admission_number: admissionNumber },
    });
    return response.data.data.available;
  },
};

export default studentApi;
