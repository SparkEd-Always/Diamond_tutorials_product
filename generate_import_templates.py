"""
Generate Excel templates for student and teacher import with sample data from database
"""
import pandas as pd
import sqlite3
from datetime import datetime, date

# Connect to database
conn = sqlite3.connect('avm_tutorial.db')

# Generate Student Import Template with 5 sample students
print("Generating student import template...")

# Sample student data - realistic Indian names and data
student_data = {
    'first_name': ['Aarav', 'Diya', 'Arjun', 'Ananya', 'Vihaan'],
    'last_name': ['Gupta', 'Reddy', 'Malhotra', 'Iyer', 'Desai'],
    'date_of_birth': ['2012-03-15', '2011-07-22', '2013-01-10', '2012-09-05', '2011-11-18'],
    'gender': ['Male', 'Female', 'Male', 'Female', 'Male'],
    'class_name': ['Class 7', 'Class 8', 'Class 7', 'Class 9', 'Class 10'],
    'parent_name': ['Rajesh Gupta', 'Venkat Reddy', 'Sunil Malhotra', 'Krishna Iyer', 'Amit Desai'],
    'parent_phone': ['9876501001', '9876501002', '9876501003', '9876501004', '9876501005'],
    'parent_email': ['rajesh.gupta@email.com', 'venkat.reddy@email.com', 'sunil.malhotra@email.com', 'krishna.iyer@email.com', 'amit.desai@email.com'],
    'address': ['12 MG Road, Bangalore', '45 Jubilee Hills, Hyderabad', '78 CP, Delhi', '23 T Nagar, Chennai', '56 FC Road, Pune'],
    'emergency_contact': ['9876502001', '9876502002', '9876502003', '9876502004', '9876502005'],
}

# Create DataFrame
df_students = pd.DataFrame(student_data)

# Save to Excel
with pd.ExcelWriter('student_import_template.xlsx', engine='openpyxl') as writer:
    df_students.to_excel(writer, index=False, sheet_name='Students')

    # Add instructions sheet
    instructions = pd.DataFrame({
        'Instructions': [
            '1. Fill in student details in the Students sheet',
            '2. Required fields: first_name, last_name, class_name, parent_phone',
            '3. Date format: YYYY-MM-DD (e.g., 2012-05-15)',
            '4. Class names: "Class 7", "Class 8", "Class 9", or "Class 10"',
            '5. Gender: Male or Female',
            '6. Phone numbers: 10 digits (e.g., 9876543210)',
            '7. Leave section empty - AVM Tutorial has no sections',
            '8. Upload this file in Admin Panel -> Import Data',
            '',
            'Note: This template has 5 sample students ready to import!'
        ]
    })
    instructions.to_excel(writer, index=False, sheet_name='Instructions')

print("✅ Created: student_import_template.xlsx (5 students)")

# Generate Teacher Import Template with 5 sample teachers
print("\nGenerating teacher import template...")

# Sample teacher data - realistic Indian names (no email required)
teacher_data = {
    'first_name': ['Priya', 'Ravi', 'Meena', 'Suresh', 'Kavita'],
    'last_name': ['Sharma', 'Verma', 'Nair', 'Patel', 'Joshi'],
    'phone_number': ['9876601001', '9876601002', '9876601003', '9876601004', '9876601005'],
    'subjects': ['Mathematics,Science', 'English,Hindi', 'Social Studies,History', 'Physics,Chemistry', 'Biology,Mathematics'],
    'classes_assigned': ['Class 7,Class 8', 'Class 9,Class 10', 'Class 7,Class 9', 'Class 8,Class 10', 'Class 7,Class 8'],
    'qualification': ['M.Sc Mathematics', 'M.A English Literature', 'M.A History', 'M.Sc Physics', 'M.Sc Zoology'],
    'experience_years': [8, 5, 12, 6, 10],
    'address': ['15 Koramangala, Bangalore', '32 Banjara Hills, Hyderabad', '67 Andheri West, Mumbai', '89 Satellite, Ahmedabad', '44 Sadashiv Peth, Pune'],
    'emergency_contact': ['9876602001', '9876602002', '9876602003', '9876602004', '9876602005'],
}

# Create DataFrame
df_teachers = pd.DataFrame(teacher_data)

# Save to Excel
with pd.ExcelWriter('teacher_import_template.xlsx', engine='openpyxl') as writer:
    df_teachers.to_excel(writer, index=False, sheet_name='Teachers')

    # Add instructions sheet
    instructions = pd.DataFrame({
        'Instructions': [
            '1. Fill in teacher details in the Teachers sheet',
            '2. Required fields: first_name, last_name, phone_number',
            '3. Phone numbers: 10 digits (e.g., 9876543210)',
            '4. Subjects: Comma-separated (e.g., "Mathematics,Science")',
            '5. Classes: Comma-separated (e.g., "Class 7,Class 8")',
            '6. Phone number must be unique',
            '7. Email is auto-generated from phone number',
            '8. Upload this file in Admin Panel -> Import Data',
            '',
            'Note: This template has 5 sample teachers ready to import!',
            '',
            'Login Credentials:',
            '- Teachers log in via mobile app using OTP',
            '- Use the phone number from the import',
            '- No password needed for mobile login',
            '- OTP will be sent to the phone number'
        ]
    })
    instructions.to_excel(writer, index=False, sheet_name='Instructions')

print("✅ Created: teacher_import_template.xlsx (5 teachers)")

# Close connection
conn.close()

print("\n" + "="*60)
print("SUMMARY")
print("="*60)
print("\n📋 Files created:")
print("   1. student_import_template.xlsx - 5 sample students")
print("   2. teacher_import_template.xlsx - 5 sample teachers")
print("\n📱 Teacher Login Credentials (after import):")
print("   Phone numbers: 9876601001, 9876601002, 9876601003, 9876601004, 9876601005")
print("   Use OTP login in mobile app")
print("\n📱 Parent Login Credentials (after import):")
print("   Phone numbers: 9876501001, 9876501002, 9876501003, 9876501004, 9876501005")
print("   Use OTP login in mobile app")
print("\n✅ Ready to import!")
print("="*60)
