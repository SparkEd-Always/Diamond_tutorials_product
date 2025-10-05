import axios from 'axios';
import type { AxiosInstance, AxiosError } from 'axios';
import config from '../config';
import type {
  LoginCredentials,
  RegisterData,
  AuthResponse,
  User,
  ApplicationFormData,
  Application,
  ApplicationDetails,
  ApplicationFilters,
  PaginatedResponse,
  DocumentType,
  Document,
  AcademicYear,
  Class,
} from '../types';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: `${config.apiBaseUrl}${config.apiV1Prefix}`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (axiosConfig) => {
    const token = localStorage.getItem(config.tokenKey);
    if (token) {
      axiosConfig.headers.Authorization = `Bearer ${token}`;
    }
    return axiosConfig;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem(config.tokenKey);
      localStorage.removeItem(config.userKey);
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ============================================================================
// Authentication API
// ============================================================================

export const authApi = {
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  getProfile: async (): Promise<{ user: User; profile: any }> => {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  updateProfile: async (profileData: any): Promise<any> => {
    const response = await api.put('/auth/profile', profileData);
    return response.data;
  },
};

// ============================================================================
// Admission Application API
// ============================================================================

export const admissionApi = {
  createApplication: async (data: ApplicationFormData): Promise<{ message: string; application: Application }> => {
    const response = await api.post('/admissions/applications', data);
    return response.data;
  },

  listApplications: async (filters?: ApplicationFilters): Promise<PaginatedResponse<Application>> => {
    const response = await api.get('/admissions/applications', { params: filters });
    return response.data;
  },

  getApplication: async (id: number): Promise<ApplicationDetails> => {
    const response = await api.get(`/admissions/applications/${id}`);
    return response.data;
  },

  submitApplication: async (id: number): Promise<{ message: string }> => {
    const response = await api.put(`/admissions/applications/${id}/submit`);
    return response.data;
  },

  updateApplicationStatus: async (
    id: number,
    status: string,
    reason?: string
  ): Promise<{ message: string }> => {
    const response = await api.put(`/admissions/applications/${id}/status`, {
      status,
      reason,
    });
    return response.data;
  },

  deleteApplication: async (id: number): Promise<void> => {
    await api.delete(`/admissions/applications/${id}`);
  },
};

// ============================================================================
// Document API
// ============================================================================

export const documentApi = {
  uploadDocument: async (
    applicationId: number,
    documentTypeId: number,
    file: File
  ): Promise<Document> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post(
      `/documents/upload?application_id=${applicationId}&document_type_id=${documentTypeId}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  listDocuments: async (applicationId: number): Promise<Document[]> => {
    const response = await api.get(`/documents/applications/${applicationId}/documents`);
    return response.data;
  },

  downloadDocument: async (documentId: number): Promise<Blob> => {
    const response = await api.get(`/documents/download/${documentId}`, {
      responseType: 'blob',
    });
    return response.data;
  },

  verifyDocument: async (
    documentId: number,
    verificationStatus: string,
    notes?: string
  ): Promise<{ message: string }> => {
    const response = await api.put(`/documents/verify/${documentId}`, {
      verification_status: verificationStatus,
      verification_notes: notes,
    });
    return response.data;
  },

  deleteDocument: async (documentId: number): Promise<void> => {
    await api.delete(`/documents/delete/${documentId}`);
  },

  getDocumentTypes: async (): Promise<DocumentType[]> => {
    const response = await api.get('/documents/types');
    return response.data;
  },
};

// ============================================================================
// Academic Data API
// ============================================================================

export const academicApi = {
  getAcademicYears: async (): Promise<AcademicYear[]> => {
    // Note: This endpoint needs to be added to backend
    const response = await api.get('/academic/years');
    return response.data;
  },

  getClasses: async (academicYearId?: number): Promise<Class[]> => {
    // Note: This endpoint needs to be added to backend
    const params = academicYearId ? { academic_year_id: academicYearId } : {};
    const response = await api.get('/academic/classes', { params });
    return response.data;
  },
};

// ============================================================================
// Utility Functions
// ============================================================================

export const setAuthToken = (token: string): void => {
  localStorage.setItem(config.tokenKey, token);
};

export const removeAuthToken = (): void => {
  localStorage.removeItem(config.tokenKey);
  localStorage.removeItem(config.userKey);
};

export const getAuthToken = (): string | null => {
  return localStorage.getItem(config.tokenKey);
};

export default api;
