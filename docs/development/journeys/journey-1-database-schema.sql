-- Journey 1: Admission to Enrollment - Database Schema
-- PostgreSQL Schema for Student Admission Management

-- =============================================================================
-- CORE AUTHENTICATION & USER MANAGEMENT
-- =============================================================================

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('parent', 'student', 'teacher', 'admin', 'super_admin')),
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100),
    date_of_birth DATE,
    gender VARCHAR(20) CHECK (gender IN ('male', 'female', 'other')),
    address_line1 TEXT,
    address_line2 TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100) DEFAULT 'India',
    avatar_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- ACADEMIC STRUCTURE (FOUNDATION)
-- =============================================================================

CREATE TABLE academic_years (
    id SERIAL PRIMARY KEY,
    year_name VARCHAR(20) NOT NULL, -- e.g., "2024-25"
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_current BOOLEAN DEFAULT false,
    admission_start_date DATE,
    admission_end_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE classes (
    id SERIAL PRIMARY KEY,
    academic_year_id INTEGER REFERENCES academic_years(id),
    class_name VARCHAR(50) NOT NULL, -- e.g., "Class 1", "Class 10", "Pre-KG"
    class_order INTEGER, -- For sorting: 1, 2, 3... 10, 11, 12
    capacity INTEGER DEFAULT 30,
    age_min INTEGER, -- Minimum age for admission
    age_max INTEGER, -- Maximum age for admission
    admission_fee DECIMAL(10,2),
    annual_fee DECIMAL(10,2),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE sections (
    id SERIAL PRIMARY KEY,
    class_id INTEGER REFERENCES classes(id),
    section_name VARCHAR(10) NOT NULL, -- A, B, C, etc.
    capacity INTEGER DEFAULT 30,
    class_teacher_id INTEGER REFERENCES users(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- STUDENT & FAMILY INFORMATION
-- =============================================================================

CREATE TABLE students (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    student_id VARCHAR(20) UNIQUE, -- Generated student ID
    admission_number VARCHAR(20) UNIQUE, -- Official admission number
    status VARCHAR(50) DEFAULT 'applicant' CHECK (status IN ('applicant', 'enrolled', 'graduated', 'transferred', 'dropped')),
    blood_group VARCHAR(10),
    medical_conditions TEXT,
    emergency_contact_name VARCHAR(100),
    emergency_contact_phone VARCHAR(20),
    previous_school_name VARCHAR(200),
    previous_school_address TEXT,
    transport_required BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE parents (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    occupation VARCHAR(100),
    employer_name VARCHAR(200),
    annual_income DECIMAL(12,2),
    education_qualification VARCHAR(100),
    is_primary_contact BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE student_parents (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
    parent_id INTEGER REFERENCES parents(id) ON DELETE CASCADE,
    relationship_type VARCHAR(20) NOT NULL CHECK (relationship_type IN ('father', 'mother', 'guardian', 'other')),
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, parent_id)
);

-- =============================================================================
-- ADMISSION APPLICATION PROCESS
-- =============================================================================

CREATE TABLE admission_applications (
    id SERIAL PRIMARY KEY,
    application_number VARCHAR(20) UNIQUE NOT NULL, -- Generated application number
    student_id INTEGER REFERENCES students(id),
    parent_id INTEGER REFERENCES parents(id),
    academic_year_id INTEGER REFERENCES academic_years(id),
    class_applying_id INTEGER REFERENCES classes(id),
    application_status VARCHAR(50) DEFAULT 'draft' CHECK (
        application_status IN (
            'draft', 'submitted', 'under_review', 'documents_pending',
            'test_scheduled', 'test_completed', 'interview_scheduled',
            'interview_completed', 'decision_made', 'fee_pending',
            'enrolled', 'rejected', 'waitlisted'
        )
    ),
    submission_date TIMESTAMP,
    review_date TIMESTAMP,
    decision_date TIMESTAMP,
    decision_reason TEXT,
    assigned_section_id INTEGER REFERENCES sections(id),
    priority_level INTEGER DEFAULT 1, -- 1=High, 2=Medium, 3=Low
    source VARCHAR(50), -- online, walk-in, referral, etc.
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- DOCUMENT MANAGEMENT
-- =============================================================================

CREATE TABLE document_types (
    id SERIAL PRIMARY KEY,
    type_name VARCHAR(100) NOT NULL,
    is_mandatory BOOLEAN DEFAULT true,
    description TEXT,
    allowed_formats VARCHAR(100), -- pdf,jpg,png
    max_file_size_mb INTEGER DEFAULT 5,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default document types
INSERT INTO document_types (type_name, is_mandatory, description, allowed_formats) VALUES
('birth_certificate', true, 'Student Birth Certificate', 'pdf,jpg,png'),
('previous_school_tc', true, 'Transfer Certificate from Previous School', 'pdf,jpg,png'),
('photo_student', true, 'Recent Passport Size Photo of Student', 'jpg,png'),
('photo_family', false, 'Family Photo', 'jpg,png'),
('address_proof', true, 'Address Proof (Electricity Bill/Rent Agreement)', 'pdf,jpg,png'),
('income_proof', false, 'Income Certificate/Salary Slip', 'pdf,jpg,png'),
('caste_certificate', false, 'Caste Certificate (if applicable)', 'pdf,jpg,png'),
('medical_certificate', false, 'Medical Fitness Certificate', 'pdf,jpg,png');

CREATE TABLE application_documents (
    id SERIAL PRIMARY KEY,
    application_id INTEGER REFERENCES admission_applications(id) ON DELETE CASCADE,
    document_type_id INTEGER REFERENCES document_types(id),
    original_filename VARCHAR(255),
    stored_filename VARCHAR(255) UNIQUE NOT NULL,
    file_path TEXT NOT NULL,
    file_size_kb INTEGER,
    mime_type VARCHAR(100),
    verification_status VARCHAR(50) DEFAULT 'pending' CHECK (
        verification_status IN ('pending', 'verified', 'rejected', 'requires_resubmission')
    ),
    verification_notes TEXT,
    verified_by INTEGER REFERENCES users(id),
    verified_at TIMESTAMP,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- ADMISSION TESTING & INTERVIEWS
-- =============================================================================

CREATE TABLE admission_tests (
    id SERIAL PRIMARY KEY,
    application_id INTEGER REFERENCES admission_applications(id),
    test_type VARCHAR(50) NOT NULL, -- entrance, aptitude, oral, written
    test_date DATE NOT NULL,
    test_time TIME NOT NULL,
    duration_minutes INTEGER DEFAULT 60,
    venue TEXT,
    max_score DECIMAL(5,2) DEFAULT 100.00,
    score_obtained DECIMAL(5,2),
    grade VARCHAR(10), -- A+, A, B+, B, C, F
    conducted_by INTEGER REFERENCES users(id),
    remarks TEXT,
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'absent', 'cancelled')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE interviews (
    id SERIAL PRIMARY KEY,
    application_id INTEGER REFERENCES admission_applications(id),
    interview_date DATE NOT NULL,
    interview_time TIME NOT NULL,
    duration_minutes INTEGER DEFAULT 30,
    interviewer_id INTEGER REFERENCES users(id),
    venue TEXT,
    rating DECIMAL(3,2), -- Out of 5.00
    communication_skills INTEGER CHECK (communication_skills BETWEEN 1 AND 5),
    confidence_level INTEGER CHECK (confidence_level BETWEEN 1 AND 5),
    general_knowledge INTEGER CHECK (general_knowledge BETWEEN 1 AND 5),
    parent_interaction INTEGER CHECK (parent_interaction BETWEEN 1 AND 5),
    overall_impression VARCHAR(20) CHECK (overall_impression IN ('excellent', 'good', 'average', 'poor')),
    feedback TEXT,
    recommendation VARCHAR(20) CHECK (recommendation IN ('strongly_recommend', 'recommend', 'neutral', 'not_recommend')),
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'rescheduled', 'cancelled')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- APPLICATION WORKFLOW TRACKING
-- =============================================================================

CREATE TABLE application_status_history (
    id SERIAL PRIMARY KEY,
    application_id INTEGER REFERENCES admission_applications(id) ON DELETE CASCADE,
    previous_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    changed_by INTEGER REFERENCES users(id),
    change_reason TEXT,
    change_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- INDEXES FOR PERFORMANCE
-- =============================================================================

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_students_student_id ON students(student_id);
CREATE INDEX idx_students_admission_number ON students(admission_number);
CREATE INDEX idx_admission_applications_status ON admission_applications(application_status);
CREATE INDEX idx_admission_applications_academic_year ON admission_applications(academic_year_id);
CREATE INDEX idx_admission_applications_number ON admission_applications(application_number);
CREATE INDEX idx_application_documents_application ON application_documents(application_id);
CREATE INDEX idx_admission_tests_date ON admission_tests(test_date);
CREATE INDEX idx_interviews_date ON interviews(interview_date);

-- =============================================================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- =============================================================================

-- Update timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admission_applications_updated_at BEFORE UPDATE ON admission_applications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- APPLICATION NUMBER GENERATION FUNCTION
-- =============================================================================

CREATE OR REPLACE FUNCTION generate_application_number()
RETURNS TRIGGER AS $$
DECLARE
    year_suffix VARCHAR(4);
    counter INTEGER;
    new_number VARCHAR(20);
BEGIN
    -- Get current academic year suffix (last 2 digits)
    SELECT RIGHT(year_name, 2) INTO year_suffix
    FROM academic_years
    WHERE is_current = true
    LIMIT 1;

    -- Get next counter for this academic year
    SELECT COUNT(*) + 1 INTO counter
    FROM admission_applications a
    JOIN academic_years ay ON a.academic_year_id = ay.id
    WHERE ay.is_current = true;

    -- Generate application number: APP24001, APP24002, etc.
    new_number := 'APP' || year_suffix || LPAD(counter::TEXT, 3, '0');

    NEW.application_number := new_number;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for auto-generating application numbers
CREATE TRIGGER generate_application_number_trigger
    BEFORE INSERT ON admission_applications
    FOR EACH ROW
    WHEN (NEW.application_number IS NULL)
    EXECUTE FUNCTION generate_application_number();

-- =============================================================================
-- SAMPLE DATA FOR TESTING
-- =============================================================================

-- Insert current academic year
INSERT INTO academic_years (year_name, start_date, end_date, is_current, admission_start_date, admission_end_date)
VALUES ('2024-25', '2024-04-01', '2025-03-31', true, '2024-01-01', '2024-03-31');

-- Insert classes
INSERT INTO classes (academic_year_id, class_name, class_order, capacity, age_min, age_max, admission_fee, annual_fee)
VALUES
    (1, 'Pre-KG', 0, 25, 3, 4, 5000.00, 45000.00),
    (1, 'LKG', 1, 30, 4, 5, 5000.00, 50000.00),
    (1, 'UKG', 2, 30, 5, 6, 5000.00, 50000.00),
    (1, 'Class 1', 3, 35, 6, 7, 6000.00, 55000.00),
    (1, 'Class 2', 4, 35, 7, 8, 6000.00, 55000.00),
    (1, 'Class 3', 5, 35, 8, 9, 6000.00, 60000.00),
    (1, 'Class 4', 6, 35, 9, 10, 6000.00, 60000.00),
    (1, 'Class 5', 7, 35, 10, 11, 7000.00, 65000.00);

-- Insert sections for each class
INSERT INTO sections (class_id, section_name, capacity)
SELECT id, section_name, 30
FROM classes c
CROSS JOIN (VALUES ('A'), ('B'), ('C')) AS sections(section_name)
WHERE c.academic_year_id = 1;