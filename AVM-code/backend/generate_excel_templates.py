#!/usr/bin/env python3
"""
Generate Excel templates with sample student and teacher data
for AVM Tutorial Management System
"""

import pandas as pd
from datetime import date, datetime
from pathlib import Path

def generate_student_template():
    """Generate student data Excel template with sample data"""

    # Sample student data for classes 7th, 8th, 9th, 10th
    students_data = []

    # Class-wise distribution
    classes = [
        ("7th", "A"), ("7th", "B"),
        ("8th", "A"), ("8th", "B"),
        ("9th", "A"), ("9th", "B"),
        ("10th", "A"), ("10th", "B")
    ]

    student_names = [
        ("Rahul", "Sharma"), ("Priya", "Singh"), ("Arjun", "Patel"), ("Kavya", "Gupta"),
        ("Rohan", "Kumar"), ("Anita", "Verma"), ("Vikram", "Joshi"), ("Sneha", "Agarwal"),
        ("Karan", "Malhotra"), ("Ritu", "Saxena"), ("Aditya", "Rao"), ("Divya", "Mishra"),
        ("Harsh", "Tiwari"), ("Shruti", "Pandey"), ("Nikhil", "Dubey"), ("Manisha", "Chawla"),
        ("Gaurav", "Bansal"), ("Pooja", "Kapoor"), ("Rohit", "Yadav"), ("Swati", "Bhargava"),
        ("Akash", "Mehta"), ("Nisha", "Goyal"), ("Vishal", "Khanna"), ("Preeti", "Sood"),
        ("Sachin", "Arora"), ("Rashmi", "Jain"), ("Ankit", "Chauhan"), ("Deepika", "Sethi"),
        ("Rahul", "Bhatia"), ("Simran", "Kohli"), ("Aryan", "Shah"), ("Komal", "Aggarwal"),
        ("Tarun", "Goel"), ("Pallavi", "Chopra"), ("Mukesh", "Sinha"), ("Anjali", "Rastogi"),
        ("Deepak", "Mittal"), ("Shikha", "Oberoi"), ("Varun", "Bajaj"), ("Kirti", "Wadhwa")
    ]

    parent_names = [
        "Mr. Rajesh Sharma", "Mrs. Sunita Singh", "Mr. Kiran Patel", "Mrs. Meera Gupta",
        "Mr. Suresh Kumar", "Mrs. Rekha Verma", "Mr. Prakash Joshi", "Mrs. Pooja Agarwal",
        "Mr. Vinod Malhotra", "Mrs. Shilpa Saxena", "Mr. Mohan Rao", "Mrs. Neeta Mishra",
        "Mr. Ramesh Tiwari", "Mrs. Kiran Pandey", "Mr. Ashok Dubey", "Mrs. Seema Chawla",
        "Mr. Raman Bansal", "Mrs. Renu Kapoor", "Mr. Sunil Yadav", "Mrs. Asha Bhargava",
        "Mr. Deepak Mehta", "Mrs. Sushma Goyal", "Mr. Ravi Khanna", "Mrs. Kavita Sood",
        "Mr. Ankit Arora", "Mrs. Preeti Jain", "Mr. Manoj Chauhan", "Mrs. Neha Sethi",
        "Mr. Vikash Bhatia", "Mrs. Manjeet Kohli", "Mr. Hitesh Shah", "Mrs. Sunita Aggarwal",
        "Mr. Rajat Goel", "Mrs. Ruchi Chopra", "Mr. Anil Sinha", "Mrs. Maya Rastogi",
        "Mr. Pawan Mittal", "Mrs. Anita Oberoi", "Mr. Rohit Bajaj", "Mrs. Vandana Wadhwa"
    ]

    # Generate 77 students (approximately 10 per class)
    student_count = 0
    for i in range(77):
        class_idx = i % len(classes)
        class_name, section = classes[class_idx]

        if i < len(student_names):
            first_name, last_name = student_names[i]
            parent_name = parent_names[i]
        else:
            first_name = f"Student{i+1}"
            last_name = "Kumar"
            parent_name = f"Parent {i+1}"

        full_name = f"{first_name} {last_name}"

        student_count += 1
        students_data.append({
            "unique_id": f"AVM-STU-{student_count:03d}",
            "first_name": first_name,
            "last_name": last_name,
            "full_name": full_name,
            "date_of_birth": "2008-01-01",
            "gender": "Male" if i % 2 == 0 else "Female",
            "class_name": class_name,
            "section": section,
            "roll_number": str((i % 10) + 1),
            "admission_date": "2024-04-01",
            "parent_name": parent_name,
            "parent_phone": f"+91-9777700{i+1:03d}",
            "parent_email": f"parent{i+1}@example.com",
            "address": f"{i+1}, Model Town, Delhi - 110009",
            "emergency_contact": f"+91-9777700{i+1:03d}",
            "blood_group": ["A+", "B+", "O+", "AB+"][i % 4],
            "is_active": "Active"
        })

    # Create DataFrame
    df_students = pd.DataFrame(students_data)

    return df_students


def generate_teacher_template():
    """Generate teacher data Excel template with sample data"""

    teachers_data = [
        {
            "unique_id": "AVM-TCH-001",
            "first_name": "Priya",
            "last_name": "Patel",
            "full_name": "Mrs. Priya Patel",
            "email": "priya.patel@avm.com",
            "phone_number": "+91-9888800001",
            "date_of_birth": "1985-05-15",
            "gender": "Female",
            "subjects": "Mathematics, Science",
            "classes_assigned": "7th A, 8th A",
            "qualification": "B.Sc, B.Ed",
            "experience_years": 8,
            "joining_date": "2020-06-01",
            "address": "123, Green Park, Delhi",
            "emergency_contact": "+91-9888800001",
            "is_active": "Active"
        },
        {
            "unique_id": "AVM-TCH-002",
            "first_name": "Amit",
            "last_name": "Singh",
            "full_name": "Mr. Amit Singh",
            "email": "amit.singh@avm.com",
            "phone_number": "+91-9888800002",
            "date_of_birth": "1982-08-22",
            "gender": "Male",
            "subjects": "English, Social Studies",
            "classes_assigned": "7th B, 8th B",
            "qualification": "M.A. English, B.Ed",
            "experience_years": 10,
            "joining_date": "2019-04-15",
            "address": "456, South Extension, Delhi",
            "emergency_contact": "+91-9888800002",
            "is_active": "Active"
        },
        {
            "unique_id": "AVM-TCH-003",
            "first_name": "Kavita",
            "last_name": "Sharma",
            "full_name": "Mrs. Kavita Sharma",
            "email": "kavita.sharma@avm.com",
            "phone_number": "+91-9888800003",
            "date_of_birth": "1987-03-10",
            "gender": "Female",
            "subjects": "Science, Computer Science",
            "classes_assigned": "9th A, 10th A",
            "qualification": "M.Sc Computer Science, B.Ed",
            "experience_years": 7,
            "joining_date": "2021-01-10",
            "address": "789, Vasant Vihar, Delhi",
            "emergency_contact": "+91-9888800003",
            "is_active": "Active"
        },
        {
            "unique_id": "AVM-TCH-004",
            "first_name": "Ravi",
            "last_name": "Kumar",
            "full_name": "Mr. Ravi Kumar",
            "email": "ravi.kumar@avm.com",
            "phone_number": "+91-9888800004",
            "date_of_birth": "1980-11-28",
            "gender": "Male",
            "subjects": "Mathematics, Physics",
            "classes_assigned": "9th B, 10th B",
            "qualification": "M.Sc Physics, B.Ed",
            "experience_years": 12,
            "joining_date": "2018-07-01",
            "address": "321, Saket, Delhi",
            "emergency_contact": "+91-9888800004",
            "is_active": "Active"
        },
        {
            "unique_id": "AVM-TCH-005",
            "first_name": "Neha",
            "last_name": "Gupta",
            "full_name": "Ms. Neha Gupta",
            "email": "neha.gupta@avm.com",
            "phone_number": "+91-9888800005",
            "date_of_birth": "1990-07-18",
            "gender": "Female",
            "subjects": "Hindi, Sanskrit",
            "classes_assigned": "7th A, 7th B, 8th A, 8th B",
            "qualification": "M.A. Hindi, B.Ed",
            "experience_years": 5,
            "joining_date": "2022-06-15",
            "address": "654, Lajpat Nagar, Delhi",
            "emergency_contact": "+91-9888800005",
            "is_active": "Active"
        }
    ]

    # Create DataFrame
    df_teachers = pd.DataFrame(teachers_data)

    return df_teachers


def main():
    """Generate both student and teacher Excel templates"""

    print("🚀 Generating Excel templates for AVM Tutorial Management System...")
    print("=" * 70)

    # Create output directory
    output_dir = Path("excel_templates")
    output_dir.mkdir(exist_ok=True)

    # Generate Student Template
    print("\n1. Generating Student Data Template...")
    df_students = generate_student_template()
    student_file = output_dir / "students_template.xlsx"

    with pd.ExcelWriter(student_file, engine='openpyxl') as writer:
        df_students.to_excel(writer, sheet_name='Students', index=False)

        # Auto-adjust column widths
        worksheet = writer.sheets['Students']
        for idx, col in enumerate(df_students.columns):
            max_length = max(
                df_students[col].astype(str).apply(len).max(),
                len(col)
            ) + 2
            worksheet.column_dimensions[chr(65 + idx)].width = min(max_length, 50)

    print(f"   ✅ Created: {student_file}")
    print(f"   📊 Total Students: {len(df_students)}")
    print(f"   📚 Classes: 7th, 8th, 9th, 10th (Sections A & B)")

    # Generate Teacher Template
    print("\n2. Generating Teacher Data Template...")
    df_teachers = generate_teacher_template()
    teacher_file = output_dir / "teachers_template.xlsx"

    with pd.ExcelWriter(teacher_file, engine='openpyxl') as writer:
        df_teachers.to_excel(writer, sheet_name='Teachers', index=False)

        # Auto-adjust column widths
        worksheet = writer.sheets['Teachers']
        for idx, col in enumerate(df_teachers.columns):
            max_length = max(
                df_teachers[col].astype(str).apply(len).max(),
                len(col)
            ) + 2
            worksheet.column_dimensions[chr(65 + idx)].width = min(max_length, 50)

    print(f"   ✅ Created: {teacher_file}")
    print(f"   👨‍🏫 Total Teachers: {len(df_teachers)}")

    # Print summary
    print("\n" + "=" * 70)
    print("🎉 Excel templates generated successfully!")
    print("\n📂 Files created:")
    print(f"   1. {student_file}")
    print(f"   2. {teacher_file}")

    print("\n📋 Class Distribution (Students):")
    class_dist = df_students.groupby(['class_name', 'section']).size()
    for (cls, sec), count in class_dist.items():
        print(f"   {cls} {sec}: {count} students")

    print("\n👨‍🏫 Teacher Assignments:")
    for _, teacher in df_teachers.iterrows():
        print(f"   {teacher['full_name']}: {teacher['subjects']} ({teacher['classes_assigned']})")

    print("\n💡 Usage:")
    print("   1. Use these templates as-is for testing")
    print("   2. Modify the data as needed")
    print("   3. Upload via Admin Panel → Import Students/Teachers")
    print("   4. All students have unique IDs (AVM-STU-XXX)")
    print("   5. All teachers have unique IDs (AVM-TCH-XXX)")

    return True


if __name__ == "__main__":
    success = main()
    if success:
        print("\n✅ Template generation completed successfully!")
    else:
        print("\n❌ Template generation failed!")
