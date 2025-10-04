import axios, { AxiosInstance } from 'axios';
import Constants from 'expo-constants';

const API_BASE_URL = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:8000';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: `${API_BASE_URL}/api/v1`,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor for adding auth token
    this.api.interceptors.request.use(
      (config) => {
        // Token will be added per request
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for handling errors
    this.api.interceptors.response.use(
      (response) => {
        return response;
      },
      (error) => {
        if (error.response?.status === 401) {
          // Handle unauthorized access - could dispatch logout action
        }
        return Promise.reject(error);
      }
    );
  }

  // Authentication endpoints
  async login(credentials: { username: string; password: string }) {
    const formData = new FormData();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);

    const response = await this.api.post('/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return response.data;
  }

  // Students endpoints
  async getStudents(token: string) {
    const response = await this.api.get('/students/', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  }

  // Attendance endpoints
  async markAttendance(attendanceData: any[], date: string, token: string, is_draft?: boolean) {
    const payload = {
      student_records: attendanceData,
      date: date,
      is_draft: is_draft || false
    };
    const response = await this.api.post('/attendance/mark', payload, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  }

  async getPendingAttendance(date: string, token: string) {
    const response = await this.api.get(`/attendance/pending-approval?attendance_date=${date}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  }

  // Test connectivity
  async testConnection() {
    try {
      const response = await axios.get(`${API_BASE_URL}/health`);
      return response.data;
    } catch (error) {
      throw new Error('Cannot connect to API server');
    }
  }
}

export const apiService = new ApiService();
export default apiService;