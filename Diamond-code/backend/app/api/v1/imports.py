from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, BackgroundTasks
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
import csv
import io
import pandas as pd
from app.core.database import get_db
from app.core.dependencies import get_current_admin_user
from app.models.student import Student
from app.models.teacher import Teacher
from app.models.user import User, UserRole
from app.services.unique_id_generator import UniqueIdGenerator
from app.services.whatsapp_service import WhatsAppService
from datetime import datetime

router = APIRouter()
whatsapp_service = WhatsAppService()

@router.get("/students/template")
async def download_students_template(
    current_user: User = Depends(get_current_admin_user)
):
    """Download Excel template for bulk student import"""
    # Create sample data for template
    template_data = {
        'first_name': ['John', 'Jane'],
        'last_name': ['Doe', 'Smith'],
        'date_of_birth': ['2010-01-15', '2011-05-20'],
        'gender': ['Male', 'Female'],
        'class_name': ['7', '8'],
        'parent_name': ['Mr. John Doe Sr.', 'Mrs. Mary Smith'],
        'parent_phone': ['9876543210', '9876543211'],
        'parent_email': ['john.doe@example.com', 'mary.smith@example.com'],
        'address': ['123 Main St, City', '456 Oak Ave, Town'],
        'emergency_contact': ['9876543212', '9876543213'],
        'blood_group': ['O+', 'A+']
    }

    df = pd.DataFrame(template_data)

    # Create Excel file in memory
    output = io.BytesIO()
    with pd.ExcelWriter(output, engine='openpyxl') as writer:
        df.to_excel(writer, index=False, sheet_name='Students')
    output.seek(0)

    return StreamingResponse(
        output,
        media_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        headers={'Content-Disposition': 'attachment; filename=student_import_template.xlsx'}
    )

@router.get("/teachers/template")
async def download_teachers_template(
    current_user: User = Depends(get_current_admin_user)
):
    """Download Excel template for bulk teacher import"""
    # Create sample data for template
    template_data = {
        'first_name': ['Priya', 'Ravi', 'Meena', 'Suresh', 'Kavita'],
        'last_name': ['Sharma', 'Verma', 'Nair', 'Patel', 'Joshi'],
        'phone_number': ['9876601001', '9876601002', '9876601003', '9876601004', '9876601005'],
        'subjects': ['Mathematics,Science', 'English,Hindi', 'Social Studies,History', 'Physics,Chemistry', 'Biology,Mathematics'],
        'classes_assigned': ['Class 7,Class 8', 'Class 9,Class 10', 'Class 7,Class 9', 'Class 8,Class 10', 'Class 7,Class 8'],
        'qualification': ['M.Sc Mathematics', 'M.A English Literature', 'M.A History', 'M.Sc Physics', 'M.Sc Zoology'],
        'experience_years': [8, 5, 12, 6, 10],
        'address': ['15 Koramangala, Bangalore', '32 Banjara Hills, Hyderabad', '67 Andheri West, Mumbai', '89 Satellite, Ahmedabad', '44 Sadashiv Peth, Pune'],
        'emergency_contact': ['9876602001', '9876602002', '9876602003', '9876602004', '9876602005']
    }

    df = pd.DataFrame(template_data)

    # Create Excel file in memory
    output = io.BytesIO()
    with pd.ExcelWriter(output, engine='openpyxl') as writer:
        df.to_excel(writer, index=False, sheet_name='Teachers')
    output.seek(0)

    return StreamingResponse(
        output,
        media_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        headers={'Content-Disposition': 'attachment; filename=teacher_import_template.xlsx'}
    )

@router.post("/students/import")
async def import_students(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Import students from CSV or Excel file (admin only)"""
    try:
        contents = await file.read()

        # Read Excel file only
        if file.filename.endswith('.xlsx') or file.filename.endswith('.xls'):
            df = pd.read_excel(io.BytesIO(contents))
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid file type. Only Excel files (.xlsx, .xls) are supported."
            )

        imported_count = 0
        errors = []
        imported_students = []  # Track imported students

        for idx, row in df.iterrows():
            row_num = idx + 2  # Account for 0-based index and header row
            try:
                # Validate required fields
                required_fields = ['first_name', 'last_name', 'class_name', 'parent_phone']
                missing_fields = [field for field in required_fields if pd.isna(row.get(field))]

                if missing_fields:
                    errors.append({
                        'row': row_num,
                        'error': f"Missing required fields: {', '.join(missing_fields)}"
                    })
                    continue

                # Check if student already exists by parent_phone and full_name
                parent_phone = str(row['parent_phone']).strip()
                full_name = f"{str(row['first_name']).strip()} {str(row['last_name']).strip()}"
                existing_student = db.query(Student).filter(
                    Student.parent_phone == parent_phone,
                    Student.full_name == full_name
                ).first()

                if existing_student:
                    errors.append({
                        'row': row_num,
                        'error': f"Student '{full_name}' with parent phone {parent_phone} already exists (ID: {existing_student.unique_id})"
                    })
                    continue

                # Generate unique ID for student
                unique_id = UniqueIdGenerator.generate_student_id(db)

                # Create student record
                # Note: section is optional and left empty as Diamond Tutorial has only one section per class (7, 8, 9, 10)
                student = Student(
                    unique_id=unique_id,
                    first_name=str(row['first_name']).strip(),
                    last_name=str(row['last_name']).strip(),
                    full_name=f"{str(row['first_name']).strip()} {str(row['last_name']).strip()}",
                    class_name=str(row['class_name']).strip(),
                    section=None,  # No sections - only one section per class
                    date_of_birth=pd.to_datetime(row['date_of_birth']).date() if not pd.isna(row.get('date_of_birth')) else None,
                    gender=str(row.get('gender', '')).strip() if not pd.isna(row.get('gender')) else '',
                    parent_name=str(row.get('parent_name', '')).strip() if not pd.isna(row.get('parent_name')) else '',
                    parent_phone=str(row['parent_phone']).strip(),
                    parent_email=str(row.get('parent_email', '')).strip() if not pd.isna(row.get('parent_email')) else '',
                    address=str(row.get('address', '')).strip() if not pd.isna(row.get('address')) else '',
                    emergency_contact=str(row.get('emergency_contact', '')).strip() if not pd.isna(row.get('emergency_contact')) else '',
                    admission_date=pd.to_datetime(row['admission_date']).date() if not pd.isna(row.get('admission_date')) else datetime.now().date(),
                )

                db.add(student)
                db.flush()  # Flush to get the ID without committing transaction

                # Track imported student
                imported_students.append({
                    'name': student.full_name,
                    'phone': student.parent_phone
                })

                imported_count += 1

            except Exception as e:
                errors.append({
                    'row': row_num,
                    'error': str(e)
                })

        db.commit()

        return {
            "message": f"Successfully imported {imported_count} students",
            "imported_count": imported_count,
            "total_rows": len(df),
            "imported_students": imported_students,  # Add student list
            "errors": errors if errors else None
        }

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error importing file: {str(e)}"
        )

@router.get("/students/csv-template")
async def download_students_csv_template():
    """Download CSV template for students import"""
    template = """first_name,last_name,class_name,date_of_birth,gender,parent_name,parent_phone,parent_email,address,emergency_contact,admission_date
Rahul,Kumar,8,2010-05-15,Male,Mr. Rajesh Kumar,+91-9876543210,rajesh@example.com,"123 Main St, Delhi",+91-9876543211,2023-04-01
Priya,Sharma,7,2011-08-22,Female,Mrs. Sunita Sharma,+91-9876543212,sunita@example.com,"456 Park Ave, Mumbai",+91-9876543213,2023-04-01"""

    return {
        "filename": "students_import_template.csv",
        "content": template
    }

async def send_credentials_to_teachers(credentials_list):
    """Background task to send credentials to teachers via WhatsApp"""
    for cred in credentials_list:
        try:
            await whatsapp_service.send_teacher_credentials(
                teacher_name=cred['name'],
                teacher_email=cred['email'],
                username=cred['username'],
                password=cred['password'],
                phone_number=cred['phone_number']
            )
        except Exception as e:
            print(f"Failed to send credentials to {cred['name']}: {str(e)}")

@router.post("/teachers/import")
async def import_teachers(
    file: UploadFile = File(...),
    background_tasks: BackgroundTasks = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Import teachers from CSV or Excel file (admin only)"""
    try:
        contents = await file.read()

        # Read Excel file only
        if file.filename.endswith('.xlsx') or file.filename.endswith('.xls'):
            df = pd.read_excel(io.BytesIO(contents))
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid file type. Only Excel files (.xlsx, .xls) are supported."
            )

        imported_count = 0
        errors = []
        created_users = []  # Track created user accounts with their credentials
        imported_teachers = []  # Track imported teachers (name + phone only)

        for idx, row in df.iterrows():
            row_num = idx + 2  # Account for 0-based index and header row
            try:
                required_fields = ['first_name', 'last_name', 'phone_number']
                missing_fields = [field for field in required_fields if pd.isna(row.get(field))]

                if missing_fields:
                    errors.append({
                        'row': row_num,
                        'error': f"Missing required fields: {', '.join(missing_fields)}"
                    })
                    continue

                phone_num = str(row['phone_number']).strip()

                # Check if teacher already exists by phone number
                existing_teacher = db.query(Teacher).filter(Teacher.phone_number == phone_num).first()

                if existing_teacher:
                    errors.append({
                        'row': row_num,
                        'error': f"Teacher with phone number {phone_num} already exists (ID: {existing_teacher.unique_id})"
                    })
                    continue

                # Generate unique ID for teacher
                unique_id = UniqueIdGenerator.generate_teacher_id(db)

                # Auto-generate email from phone number (last 10 digits)
                phone_digits = ''.join(filter(str.isdigit, phone_num))
                auto_email = f"teacher_{phone_digits[-10:]}@avm.com"

                # Parse subjects and classes (comma-separated)
                subjects = [s.strip() for s in str(row.get('subjects', '')).split(',') if s.strip()] if not pd.isna(row.get('subjects')) else []
                classes_assigned = [c.strip() for c in str(row.get('classes_assigned', '')).split(',') if c.strip()] if not pd.isna(row.get('classes_assigned')) else []

                teacher = Teacher(
                    unique_id=unique_id,
                    first_name=str(row['first_name']).strip(),
                    last_name=str(row['last_name']).strip(),
                    full_name=f"{str(row['first_name']).strip()} {str(row['last_name']).strip()}",
                    email=auto_email,  # Auto-generated email
                    phone_number=phone_num,
                    phone=phone_num,  # Set phone field for mobile login compatibility
                    subjects=subjects,
                    classes_assigned=classes_assigned,
                    qualification=str(row.get('qualification', '')).strip() if not pd.isna(row.get('qualification')) else '',
                    experience_years=int(row.get('experience_years', 0)) if not pd.isna(row.get('experience_years')) else 0,
                    address=str(row.get('address', '')).strip() if not pd.isna(row.get('address')) else '',
                    emergency_contact=str(row.get('emergency_contact', '')).strip() if not pd.isna(row.get('emergency_contact')) else '',
                    joining_date=pd.to_datetime(row.get('joining_date')) if (row.get('joining_date') is not None and not pd.isna(row.get('joining_date'))) else datetime.now(),
                )

                db.add(teacher)
                db.flush()  # Flush to get the ID without committing transaction

                # Create User account for teacher with default password
                # Check if user already exists by phone number
                existing_user = db.query(User).filter(User.phone_number == teacher.phone_number).first()
                if not existing_user:
                    from app.core.security import get_password_hash

                    # Generate simple default password from last 4 digits of phone
                    phone_digits = ''.join(filter(str.isdigit, teacher.phone_number))
                    default_password = phone_digits[-4:] if len(phone_digits) >= 4 else "1234"

                    # Create username from phone number
                    username = f"teacher_{phone_digits[-10:]}"

                    user = User(
                        unique_id=unique_id,  # Same as teacher unique_id
                        email=teacher.email,
                        phone_number=teacher.phone_number,
                        username=username,
                        full_name=teacher.full_name,
                        hashed_password=get_password_hash(default_password),  # Properly hash the password
                        role=UserRole.TEACHER,
                        is_active=True,
                        is_verified=True
                    )
                    db.add(user)
                    db.flush()

                    # Track created user credentials (including phone for WhatsApp)
                    created_users.append({
                        'name': teacher.full_name,
                        'email': teacher.email,
                        'username': username,
                        'password': default_password,
                        'phone_number': teacher.phone_number
                    })

                # Track imported teacher (simple list for display)
                imported_teachers.append({
                    'name': teacher.full_name,
                    'phone': teacher.phone_number
                })

                imported_count += 1

            except Exception as e:
                errors.append({
                    'row': row_num,
                    'error': str(e)
                })

        db.commit()

        response = {
            "message": f"Successfully imported {imported_count} teachers",
            "imported_count": imported_count,
            "total_rows": len(df),
            "imported_teachers": imported_teachers,  # Simple list with name + phone only
            "errors": errors if errors else None
        }

        # Send credentials via WhatsApp in background (if needed)
        if created_users and background_tasks:
            background_tasks.add_task(send_credentials_to_teachers, created_users)

        return response

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error importing file: {str(e)}"
        )

@router.get("/teachers/csv-template")
async def download_teachers_csv_template():
    """Download CSV template for teachers import"""
    template = """first_name,last_name,email,phone_number,subjects,classes_assigned,qualification,experience_years,address,emergency_contact,joining_date
Priya,Patel,priya.new@avm.com,+91-9876543220,"Mathematics,Science","Class 8A,Class 9A",M.Sc. Mathematics,5,"789 School Rd, Delhi",+91-9876543221,2023-06-01
Amit,Singh,amit.new@avm.com,+91-9876543222,"English,Hindi","Class 7A,Class 7B",M.A. English,3,"321 Teacher St, Mumbai",+91-9876543223,2023-06-01"""

    return {
        "filename": "teachers_import_template.csv",
        "content": template
    }