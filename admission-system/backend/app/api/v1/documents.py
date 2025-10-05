from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Query
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List
import os
import uuid
from datetime import datetime
from ...core.database import get_db
from ...core.security import get_current_user, require_role
from ...core.config import settings
from ...models.user import User, UserRole
from ...models.student import Parent
from ...models.admission import (
    AdmissionApplication,
    ApplicationDocument,
    DocumentType,
    VerificationStatus
)
from ...schemas.admission import DocumentUploadResponse, DocumentVerification

router = APIRouter()

ALLOWED_EXTENSIONS = settings.ALLOWED_EXTENSIONS.split(',')
MAX_FILE_SIZE = settings.MAX_FILE_SIZE_MB * 1024 * 1024  # Convert to bytes

def validate_file(file: UploadFile) -> None:
    """Validate uploaded file"""
    # Check file extension
    file_ext = file.filename.split('.')[-1].lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"File type not allowed. Allowed types: {', '.join(ALLOWED_EXTENSIONS)}"
        )

def save_upload_file(file: UploadFile, application_id: int, document_type: str) -> dict:
    """Save uploaded file to disk"""
    # Generate unique filename
    file_ext = file.filename.split('.')[-1].lower()
    unique_filename = f"{application_id}_{document_type}_{uuid.uuid4().hex}.{file_ext}"

    # Create directory structure: uploads/applications/{application_id}/
    upload_dir = os.path.join(settings.UPLOAD_DIR, "applications", str(application_id))
    os.makedirs(upload_dir, exist_ok=True)

    # Full file path
    file_path = os.path.join(upload_dir, unique_filename)

    # Save file
    try:
        with open(file_path, "wb") as f:
            content = file.file.read()
            f.write(content)
            file_size = len(content)  # in bytes
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")

    return {
        "stored_filename": unique_filename,
        "file_path": file_path,
        "file_size_kb": file_size // 1024,
        "mime_type": file.content_type
    }

@router.post("/upload", response_model=DocumentUploadResponse, status_code=status.HTTP_201_CREATED)
async def upload_document(
    application_id: int = Query(...),
    document_type_id: int = Query(...),
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Upload document for an application
    """
    # Validate file
    validate_file(file)

    # Get application
    application = db.query(AdmissionApplication).filter(
        AdmissionApplication.id == application_id
    ).first()

    if not application:
        raise HTTPException(status_code=404, detail="Application not found")

    # Check access permissions
    if current_user.role == UserRole.PARENT:
        parent = db.query(Parent).filter(Parent.user_id == current_user.id).first()
        if not parent or application.parent_id != parent.id:
            raise HTTPException(status_code=403, detail="Access denied")

    # Get document type
    doc_type = db.query(DocumentType).filter(DocumentType.id == document_type_id).first()
    if not doc_type:
        raise HTTPException(status_code=404, detail="Document type not found")

    # Check if document already exists
    existing_doc = db.query(ApplicationDocument).filter(
        ApplicationDocument.application_id == application_id,
        ApplicationDocument.document_type_id == document_type_id
    ).first()

    if existing_doc:
        # Delete old file
        if os.path.exists(existing_doc.file_path):
            os.remove(existing_doc.file_path)
        # Remove from database
        db.delete(existing_doc)

    # Save file
    file_info = save_upload_file(file, application_id, doc_type.type_name)

    # Create document record
    document = ApplicationDocument(
        application_id=application_id,
        document_type_id=document_type_id,
        original_filename=file.filename,
        stored_filename=file_info["stored_filename"],
        file_path=file_info["file_path"],
        file_size_kb=file_info["file_size_kb"],
        mime_type=file_info["mime_type"],
        verification_status=VerificationStatus.PENDING
    )
    db.add(document)
    db.commit()
    db.refresh(document)

    return DocumentUploadResponse(
        id=document.id,
        application_id=document.application_id,
        document_type_id=document.document_type_id,
        original_filename=document.original_filename,
        stored_filename=document.stored_filename,
        file_size_kb=document.file_size_kb,
        verification_status=document.verification_status.value,
        uploaded_at=document.uploaded_at
    )

@router.get("/applications/{application_id}/documents", response_model=List[DocumentUploadResponse])
async def list_application_documents(
    application_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    List all documents for an application
    """
    # Get application
    application = db.query(AdmissionApplication).filter(
        AdmissionApplication.id == application_id
    ).first()

    if not application:
        raise HTTPException(status_code=404, detail="Application not found")

    # Check access
    if current_user.role == UserRole.PARENT:
        parent = db.query(Parent).filter(Parent.user_id == current_user.id).first()
        if not parent or application.parent_id != parent.id:
            raise HTTPException(status_code=403, detail="Access denied")

    # Get documents
    documents = db.query(ApplicationDocument).filter(
        ApplicationDocument.application_id == application_id
    ).all()

    return [
        DocumentUploadResponse(
            id=doc.id,
            application_id=doc.application_id,
            document_type_id=doc.document_type_id,
            original_filename=doc.original_filename,
            stored_filename=doc.stored_filename,
            file_size_kb=doc.file_size_kb,
            verification_status=doc.verification_status.value,
            uploaded_at=doc.uploaded_at
        ) for doc in documents
    ]

@router.get("/download/{document_id}")
async def download_document(
    document_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Download a document
    """
    document = db.query(ApplicationDocument).filter(
        ApplicationDocument.id == document_id
    ).first()

    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    # Check access
    application = db.query(AdmissionApplication).filter(
        AdmissionApplication.id == document.application_id
    ).first()

    if current_user.role == UserRole.PARENT:
        parent = db.query(Parent).filter(Parent.user_id == current_user.id).first()
        if not parent or application.parent_id != parent.id:
            raise HTTPException(status_code=403, detail="Access denied")

    # Check if file exists
    if not os.path.exists(document.file_path):
        raise HTTPException(status_code=404, detail="File not found on server")

    return FileResponse(
        path=document.file_path,
        filename=document.original_filename,
        media_type=document.mime_type
    )

@router.put("/verify/{document_id}", response_model=dict)
async def verify_document(
    document_id: int,
    verification: DocumentVerification,
    current_user: User = Depends(require_role(["admin", "super_admin"])),
    db: Session = Depends(get_db)
):
    """
    Verify or reject a document (Admin only)
    """
    document = db.query(ApplicationDocument).filter(
        ApplicationDocument.id == document_id
    ).first()

    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    # Update verification status
    document.verification_status = VerificationStatus(verification.verification_status)
    document.verification_notes = verification.verification_notes
    document.verified_by = current_user.id
    document.verified_at = datetime.now()

    db.commit()

    return {
        "message": "Document verification updated successfully",
        "document_id": document.id,
        "verification_status": document.verification_status.value
    }

@router.delete("/delete/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_document(
    document_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a document
    """
    document = db.query(ApplicationDocument).filter(
        ApplicationDocument.id == document_id
    ).first()

    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    # Check access
    application = db.query(AdmissionApplication).filter(
        AdmissionApplication.id == document.application_id
    ).first()

    if current_user.role == UserRole.PARENT:
        parent = db.query(Parent).filter(Parent.user_id == current_user.id).first()
        if not parent or application.parent_id != parent.id:
            raise HTTPException(status_code=403, detail="Access denied")

    # Delete file from disk
    if os.path.exists(document.file_path):
        os.remove(document.file_path)

    # Delete from database
    db.delete(document)
    db.commit()

    return None

@router.get("/types", response_model=List[dict])
async def list_document_types(db: Session = Depends(get_db)):
    """
    List all document types
    """
    doc_types = db.query(DocumentType).all()

    return [
        {
            "id": dt.id,
            "type_name": dt.type_name,
            "is_mandatory": dt.is_mandatory,
            "description": dt.description,
            "allowed_formats": dt.allowed_formats,
            "max_file_size_mb": dt.max_file_size_mb
        } for dt in doc_types
    ]
