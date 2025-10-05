// Application configuration

export const config = {
  // API Configuration
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  apiV1Prefix: '/api/v1',

  // Application Settings
  appName: 'Student Admission Management System',
  schoolName: import.meta.env.VITE_SCHOOL_NAME || 'ABC International School',

  // File Upload Settings
  maxFileSize: 5 * 1024 * 1024, // 5MB
  allowedFileTypes: ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'],
  allowedExtensions: ['.jpg', '.jpeg', '.png', '.pdf'],

  // Pagination
  defaultPageSize: 20,

  // Token storage
  tokenKey: 'admission_token',
  userKey: 'admission_user',
};

export default config;
