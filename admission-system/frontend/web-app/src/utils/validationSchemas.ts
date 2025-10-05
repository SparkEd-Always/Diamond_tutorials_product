import * as yup from 'yup';

// Student Details Validation Schema
export const studentDetailsSchema = yup.object({
  first_name: yup
    .string()
    .required('First name is required')
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must not exceed 50 characters')
    .matches(/^[a-zA-Z\s]+$/, 'First name can only contain letters'),
  middle_name: yup
    .string()
    .max(50, 'Middle name must not exceed 50 characters')
    .matches(/^[a-zA-Z\s]*$/, 'Middle name can only contain letters'),
  last_name: yup
    .string()
    .required('Last name is required')
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must not exceed 50 characters')
    .matches(/^[a-zA-Z\s]+$/, 'Last name can only contain letters'),
  date_of_birth: yup
    .string()
    .required('Date of birth is required')
    .test('age', 'Student must be between 3 and 18 years old', (value) => {
      if (!value) return false;
      const birthDate = new Date(value);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        return age - 1 >= 3 && age - 1 <= 18;
      }
      return age >= 3 && age <= 18;
    }),
  gender: yup
    .string()
    .required('Gender is required')
    .oneOf(['male', 'female', 'other'], 'Invalid gender selection'),
  blood_group: yup
    .string()
    .matches(/^(A|B|AB|O)[+-]?$/, 'Invalid blood group format (e.g., A+, O-, AB+)'),
  medical_conditions: yup.string().max(500, 'Medical conditions must not exceed 500 characters'),
  previous_school_name: yup.string().max(100, 'School name must not exceed 100 characters'),
  previous_school_address: yup.string().max(200, 'School address must not exceed 200 characters'),
  transport_required: yup.boolean(),
});

// Parent Details Validation Schema
export const parentDetailsSchema = yup.object({
  first_name: yup
    .string()
    .required('First name is required')
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must not exceed 50 characters')
    .matches(/^[a-zA-Z\s]+$/, 'First name can only contain letters'),
  last_name: yup
    .string()
    .required('Last name is required')
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must not exceed 50 characters')
    .matches(/^[a-zA-Z\s]+$/, 'Last name can only contain letters'),
  email: yup
    .string()
    .required('Email is required')
    .email('Invalid email format')
    .max(100, 'Email must not exceed 100 characters'),
  phone: yup
    .string()
    .required('Phone number is required')
    .matches(/^[6-9]\d{9}$/, 'Invalid Indian phone number (10 digits, starting with 6-9)'),
  relationship_type: yup
    .string()
    .required('Relationship is required')
    .oneOf(['father', 'mother', 'guardian', 'other'], 'Invalid relationship type'),
  occupation: yup.string().max(100, 'Occupation must not exceed 100 characters'),
  employer_name: yup.string().max(100, 'Employer name must not exceed 100 characters'),
  education_qualification: yup.string().max(100, 'Qualification must not exceed 100 characters'),
  is_primary_contact: yup.boolean(),
});

// Address Validation Schema
export const addressSchema = yup.object({
  address_line1: yup
    .string()
    .required('Address line 1 is required')
    .min(5, 'Address must be at least 5 characters')
    .max(200, 'Address must not exceed 200 characters'),
  address_line2: yup.string().max(200, 'Address must not exceed 200 characters'),
  city: yup
    .string()
    .required('City is required')
    .min(2, 'City name must be at least 2 characters')
    .max(50, 'City name must not exceed 50 characters')
    .matches(/^[a-zA-Z\s]+$/, 'City name can only contain letters'),
  state: yup
    .string()
    .required('State is required')
    .min(2, 'State name must be at least 2 characters')
    .max(50, 'State name must not exceed 50 characters')
    .matches(/^[a-zA-Z\s]+$/, 'State name can only contain letters'),
  postal_code: yup
    .string()
    .required('Postal code is required')
    .matches(/^\d{6}$/, 'Invalid Indian postal code (6 digits)'),
  country: yup
    .string()
    .required('Country is required')
    .max(50, 'Country name must not exceed 50 characters'),
});

// Academic Details Validation Schema
export const academicDetailsSchema = yup.object({
  class_applying_id: yup
    .number()
    .required('Class is required')
    .positive('Class ID must be positive')
    .integer('Class ID must be an integer'),
  academic_year_id: yup
    .number()
    .required('Academic year is required')
    .positive('Academic year ID must be positive')
    .integer('Academic year ID must be an integer'),
  emergency_contact_name: yup
    .string()
    .max(100, 'Emergency contact name must not exceed 100 characters')
    .matches(/^[a-zA-Z\s]*$/, 'Name can only contain letters'),
  emergency_contact_phone: yup
    .string()
    .matches(/^[6-9]\d{9}$|^$/, 'Invalid Indian phone number (10 digits, starting with 6-9)'),
});

// Complete Application Form Validation Schema
export const applicationFormSchema = yup.object({
  student_details: studentDetailsSchema,
  parent_details: parentDetailsSchema,
  address: addressSchema,
  class_applying_id: yup.number().required('Class is required').positive().integer(),
  academic_year_id: yup.number().required('Academic year is required').positive().integer(),
  source: yup.string().oneOf(['online', 'offline', 'referral', 'walk_in'], 'Invalid source'),
  emergency_contact_name: yup.string().max(100),
  emergency_contact_phone: yup.string().matches(/^[6-9]\d{9}$|^$/),
});

// Login Validation Schema
export const loginSchema = yup.object({
  email: yup
    .string()
    .required('Email is required')
    .email('Invalid email format'),
  password: yup
    .string()
    .required('Password is required')
    .min(6, 'Password must be at least 6 characters'),
});

// Register Validation Schema
export const registerSchema = yup.object({
  email: yup
    .string()
    .required('Email is required')
    .email('Invalid email format')
    .max(100, 'Email must not exceed 100 characters'),
  password: yup
    .string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
  first_name: yup
    .string()
    .required('First name is required')
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must not exceed 50 characters')
    .matches(/^[a-zA-Z\s]+$/, 'First name can only contain letters'),
  last_name: yup
    .string()
    .required('Last name is required')
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must not exceed 50 characters')
    .matches(/^[a-zA-Z\s]+$/, 'Last name can only contain letters'),
  phone: yup
    .string()
    .required('Phone number is required')
    .matches(/^[6-9]\d{9}$/, 'Invalid Indian phone number (10 digits, starting with 6-9)'),
});
