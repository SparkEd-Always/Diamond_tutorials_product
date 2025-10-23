-- Create test students for Fee Sessions testing
-- These students will have the minimum required fields

-- Clear existing data
DELETE FROM student_parent_relationships;
DELETE FROM parents_guardians;
DELETE FROM students;

-- Insert students for Class 1 (class_id=4 from admission database)
INSERT INTO students (first_name, last_name, date_of_birth, gender, blood_group, nationality, email, phone, current_class_id, admission_number, admission_date, roll_number, status, is_active, profile_completeness)
VALUES
('Aarav', 'Sharma', '2018-05-15', 'male', 'O+', 'Indian', 'aarav.sharma@example.com', '9876543210', 4, 'ADM2024001', '2024-04-01', 'R001', 'active', 1, 85),
('Diya', 'Patel', '2018-07-22', 'female', 'A+', 'Indian', 'diya.patel@example.com', '9876543211', 4, 'ADM2024002', '2024-04-01', 'R002', 'active', 1, 90),
('Arjun', 'Kumar', '2018-03-10', 'male', 'B+', 'Indian', 'arjun.kumar@example.com', '9876543212', 4, 'ADM2024003', '2024-04-01', 'R003', 'active', 1, 88);

-- Insert students for Class 2 (class_id=5)
INSERT INTO students (first_name, last_name, date_of_birth, gender, blood_group, nationality, email, phone, current_class_id, admission_number, admission_date, roll_number, status, is_active, profile_completeness)
VALUES
('Saanvi', 'Reddy', '2017-06-18', 'female', 'AB+', 'Indian', 'saanvi.reddy@example.com', '9876543213', 5, 'ADM2024004', '2024-04-01', 'R001', 'active', 1, 92),
('Vivaan', 'Singh', '2017-08-25', 'male', 'O-', 'Indian', 'vivaan.singh@example.com', '9876543214', 5, 'ADM2024005', '2024-04-01', 'R002', 'active', 1, 87),
('Kiara', 'Gupta', '2017-04-12', 'female', 'A-', 'Indian', 'kiara.gupta@example.com', '9876543215', 5, 'ADM2024006', '2024-04-01', 'R003', 'active', 1, 95);

-- Insert students for Class 3 (class_id=6)
INSERT INTO students (first_name, last_name, date_of_birth, gender, blood_group, nationality, email, phone, current_class_id, admission_number, admission_date, roll_number, status, is_active, profile_completeness)
VALUES
('Aditya', 'Verma', '2016-09-20', 'male', 'B-', 'Indian', 'aditya.verma@example.com', '9876543216', 6, 'ADM2024007', '2024-04-01', 'R001', 'active', 1, 89),
('Ananya', 'Iyer', '2016-11-05', 'female', 'AB-', 'Indian', 'ananya.iyer@example.com', '9876543217', 6, 'ADM2024008', '2024-04-01', 'R002', 'active', 1, 91),
('Sai', 'Nair', '2016-02-14', 'male', 'O+', 'Indian', 'sai.nair@example.com', '9876543218', 6, 'ADM2024009', '2024-04-01', 'R003', 'active', 1, 86);

-- Insert students for Class 4 (class_id=7)
INSERT INTO students (first_name, last_name, date_of_birth, gender, blood_group, nationality, email, phone, current_class_id, admission_number, admission_date, roll_number, status, is_active, profile_completeness)
VALUES
('Ishaan', 'Joshi', '2015-10-30', 'male', 'A+', 'Indian', 'ishaan.joshi@example.com', '9876543219', 7, 'ADM2024010', '2024-04-01', 'R001', 'active', 1, 93),
('Navya', 'Desai', '2015-12-08', 'female', 'B+', 'Indian', 'navya.desai@example.com', '9876543220', 7, 'ADM2024011', '2024-04-01', 'R002', 'active', 1, 88),
('Kartik', 'Shah', '2015-07-19', 'male', 'AB+', 'Indian', 'kartik.shah@example.com', '9876543221', 7, 'ADM2024012', '2024-04-01', 'R003', 'active', 1, 90);

-- Insert students for Class 5 (class_id=8)
INSERT INTO students (first_name, last_name, date_of_birth, gender, blood_group, nationality, email, phone, current_class_id, admission_number, admission_date, roll_number, status, is_active, profile_completeness)
VALUES
('Myra', 'Mehta', '2014-03-22', 'female', 'O-', 'Indian', 'myra.mehta@example.com', '9876543222', 8, 'ADM2024013', '2024-04-01', 'R001', 'active', 1, 94),
('Dhruv', 'Agarwal', '2014-05-16', 'male', 'A-', 'Indian', 'dhruv.agarwal@example.com', '9876543223', 8, 'ADM2024014', '2024-04-01', 'R002', 'active', 1, 87),
('Riya', 'Bansal', '2014-09-11', 'female', 'B-', 'Indian', 'riya.bansal@example.com', '9876543224', 8, 'ADM2024015', '2024-04-01', 'R003', 'active', 1, 91);
