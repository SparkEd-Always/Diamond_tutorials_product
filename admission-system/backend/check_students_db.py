from app.core.database import SessionLocal
from app.models.student import Student
from app.models.academic import Class

db = SessionLocal()

# Check students
students = db.query(Student).all()
print(f'Total students: {len(students)}')
for s in students[:10]:
    print(f'  ID: {s.id}, Name: {s.first_name} {s.last_name}, Class ID: {s.current_class_id}, Active: {s.is_active}')

# Check classes
classes = db.query(Class).all()
print(f'\nTotal classes: {len(classes)}')
for c in classes[:10]:
    class_name = getattr(c, 'class_name', None) or getattr(c, 'name', 'Unknown')
    print(f'  ID: {c.id}, Name: {class_name}')

db.close()
