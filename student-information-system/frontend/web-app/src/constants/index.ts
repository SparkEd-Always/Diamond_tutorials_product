/**
 * Application constants
 */

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
export const API_VERSION = import.meta.env.VITE_API_VERSION || 'v1';
export const API_URL = `${API_BASE_URL}/api/${API_VERSION}`;

export const APP_NAME = import.meta.env.VITE_APP_NAME || 'Student Information System';
export const APP_VERSION = import.meta.env.VITE_APP_VERSION || '1.0.0';

export const DEFAULT_PAGE_SIZE = Number(import.meta.env.VITE_DEFAULT_PAGE_SIZE) || 50;
export const MAX_PAGE_SIZE = Number(import.meta.env.VITE_MAX_PAGE_SIZE) || 100;

export const MAX_FILE_SIZE = Number(import.meta.env.VITE_MAX_FILE_SIZE) || 10 * 1024 * 1024; // 10MB
export const ALLOWED_FILE_TYPES = (import.meta.env.VITE_ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/jpg,application/pdf').split(',');

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'sis_access_token',
  REFRESH_TOKEN: 'sis_refresh_token',
  USER: 'sis_user',
  THEME: 'sis_theme',
} as const;

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_STUDENTS: '/admin/students',
  ADMIN_STUDENT_DETAIL: '/admin/students/:id',
  ADMIN_STUDENT_CREATE: '/admin/students/create',
  ADMIN_STUDENT_EDIT: '/admin/students/:id/edit',
  PARENT_DASHBOARD: '/parent/dashboard',
  PARENT_CHILDREN: '/parent/children',
} as const;

export const GENDERS = [
  { value: 'Male', label: 'Male' },
  { value: 'Female', label: 'Female' },
  { value: 'Other', label: 'Other' },
] as const;

export const BLOOD_GROUPS = [
  { value: 'A+', label: 'A+' },
  { value: 'A-', label: 'A-' },
  { value: 'B+', label: 'B+' },
  { value: 'B-', label: 'B-' },
  { value: 'AB+', label: 'AB+' },
  { value: 'AB-', label: 'AB-' },
  { value: 'O+', label: 'O+' },
  { value: 'O-', label: 'O-' },
] as const;

export const CASTE_CATEGORIES = [
  { value: 'General', label: 'General' },
  { value: 'OBC', label: 'OBC' },
  { value: 'SC', label: 'SC' },
  { value: 'ST', label: 'ST' },
  { value: 'Other', label: 'Other' },
] as const;

export const STUDENT_STATUSES = [
  { value: 'Active', label: 'Active' },
  { value: 'Alumni', label: 'Alumni' },
  { value: 'Transferred', label: 'Transferred' },
  { value: 'Expelled', label: 'Expelled' },
  { value: 'Withdrawn', label: 'Withdrawn' },
] as const;

export const RELATIONSHIPS = [
  { value: 'Father', label: 'Father' },
  { value: 'Mother', label: 'Mother' },
  { value: 'Guardian', label: 'Guardian' },
  { value: 'Other', label: 'Other' },
] as const;

export const ADDRESS_TYPES = [
  { value: 'Current', label: 'Current Address' },
  { value: 'Permanent', label: 'Permanent Address' },
] as const;

export const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
] as const;
