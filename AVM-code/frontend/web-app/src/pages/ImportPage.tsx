import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Alert,
  CircularProgress,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  Collapse,
  IconButton,
} from '@mui/material';
import {
  Upload as UploadIcon,
  Download as DownloadIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Clear as ClearIcon,
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { useToast } from '../contexts/ToastContext';

const API_BASE_URL = 'http://localhost:8000/api/v1';

const ImportPage: React.FC = () => {
  const { token } = useSelector((state: RootState) => state.auth);
  const { showToast } = useToast();

  const [studentFile, setStudentFile] = useState<File | null>(null);
  const [teacherFile, setTeacherFile] = useState<File | null>(null);
  const [studentUploadResult, setStudentUploadResult] = useState<any>(null);
  const [teacherUploadResult, setTeacherUploadResult] = useState<any>(null);
  const [studentUploading, setStudentUploading] = useState(false);
  const [teacherUploading, setTeacherUploading] = useState(false);
  const [studentErrorsExpanded, setStudentErrorsExpanded] = useState(false);
  const [teacherErrorsExpanded, setTeacherErrorsExpanded] = useState(false);
  const [studentDragging, setStudentDragging] = useState(false);
  const [teacherDragging, setTeacherDragging] = useState(false);

  const handleStudentFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setStudentFile(e.target.files[0]);
      setStudentUploadResult(null);
    }
  };

  const handleTeacherFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setTeacherFile(e.target.files[0]);
      setTeacherUploadResult(null);
    }
  };

  // Drag and drop handlers for students
  const handleStudentDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setStudentDragging(true);
  };

  const handleStudentDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setStudentDragging(false);
  };

  const handleStudentDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setStudentDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        setStudentFile(file);
        setStudentUploadResult(null);
      } else {
        showToast('Please upload only Excel files (.xlsx or .xls)', 'error');
      }
    }
  };

  // Drag and drop handlers for teachers
  const handleTeacherDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setTeacherDragging(true);
  };

  const handleTeacherDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setTeacherDragging(false);
  };

  const handleTeacherDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setTeacherDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        setTeacherFile(file);
        setTeacherUploadResult(null);
      } else {
        showToast('Please upload only Excel files (.xlsx or .xls)', 'error');
      }
    }
  };

  const handleStudentUpload = async () => {
    if (!studentFile) return;

    setStudentUploading(true);
    const formData = new FormData();
    formData.append('file', studentFile);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/import/students/import`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      setStudentUploadResult(response.data);
      setStudentFile(null);
    } catch (error: any) {
      setStudentUploadResult({
        error: true,
        message: error.response?.data?.detail || 'Failed to upload file',
      });
    } finally {
      setStudentUploading(false);
    }
  };

  const handleTeacherUpload = async () => {
    if (!teacherFile) return;

    setTeacherUploading(true);
    const formData = new FormData();
    formData.append('file', teacherFile);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/import/teachers/import`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      setTeacherUploadResult(response.data);
      setTeacherFile(null);
    } catch (error: any) {
      setTeacherUploadResult({
        error: true,
        message: error.response?.data?.detail || 'Failed to upload file',
      });
    } finally {
      setTeacherUploading(false);
    }
  };

  const handleDownloadStudentTemplate = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/import/students/template`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob',
        }
      );

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'student_import_template.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error: any) {
      alert(`❌ Error: ${error.response?.data?.detail || 'Failed to download template'}`);
    }
  };

  const handleDownloadTeacherTemplate = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/import/teachers/template`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob',
        }
      );

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'teacher_import_template.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error: any) {
      alert(`❌ Error: ${error.response?.data?.detail || 'Failed to download template'}`);
    }
  };

  const handleClearAllData = async () => {
    if (!window.confirm('⚠️ WARNING: This will delete ALL students and teachers from the database. This action cannot be undone. Are you sure?')) {
      return;
    }

    try {
      const [studentsResponse, teachersResponse] = await Promise.all([
        axios.delete(`${API_BASE_URL}/students/clear-all`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.delete(`${API_BASE_URL}/teachers/clear-all`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      alert(`✅ Successfully cleared:\n- ${studentsResponse.data.deleted_count} students\n- ${teachersResponse.data.deleted_teachers} teachers\n- ${teachersResponse.data.deleted_users} teacher user accounts`);

      // Reset any upload results
      setStudentUploadResult(null);
      setTeacherUploadResult(null);
    } catch (error: any) {
      alert(`❌ Error: ${error.response?.data?.detail || 'Failed to clear data'}`);
    }
  };

  const handleDownloadTemplate = (type: 'students' | 'teachers') => {
    // Create sample data for Excel
    const templates = {
      students: [
        ['first_name', 'last_name', 'class_name', 'date_of_birth', 'gender', 'parent_name', 'parent_phone', 'parent_email', 'address', 'emergency_contact', 'admission_date'],
        ['Rahul', 'Kumar', '8', '2010-05-15', 'Male', 'Mr. Rajesh Kumar', '+91-9876543210', 'rajesh@example.com', '123 Main St, Delhi', '+91-9876543211', '2023-04-01'],
        ['Priya', 'Sharma', '7', '2011-08-22', 'Female', 'Mrs. Sunita Sharma', '+91-9876543212', 'sunita@example.com', '456 Park Ave, Mumbai', '+91-9876543213', '2023-04-01'],
      ],
      teachers: [
        ['first_name', 'last_name', 'email', 'phone_number', 'subjects', 'classes_assigned', 'qualification', 'experience_years', 'address', 'emergency_contact', 'joining_date'],
        ['Priya', 'Patel', 'priya.new@avm.com', '+91-9876543220', 'Mathematics,Science', 'Class 8A,Class 9A', 'M.Sc. Mathematics', '5', '789 School Rd, Delhi', '+91-9876543221', '2023-06-01'],
        ['Amit', 'Singh', 'amit.new@avm.com', '+91-9876543222', 'English,Hindi', 'Class 7A,Class 7B', 'M.A. English', '3', '321 Teacher St, Mumbai', '+91-9876543223', '2023-06-01'],
      ],
    };

    const data = templates[type];

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(data);

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, type === 'students' ? 'Students' : 'Teachers');

    // Generate Excel file and trigger download
    XLSX.writeFile(wb, `${type}_import_template.xlsx`);
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Import Data
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Upload Excel files to import students and teachers
          </Typography>
        </Box>
        <Button
          variant="outlined"
          color="error"
          onClick={handleClearAllData}
          sx={{ height: 'fit-content' }}
        >
          Clear All Data
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Students Import */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Import Students
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={2}>
                Upload an Excel file (.xlsx or .xls) to import multiple students
              </Typography>

              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={handleDownloadStudentTemplate}
                fullWidth
                sx={{ mb: 2 }}
              >
                Download Template
              </Button>

              <Box
                sx={{
                  mb: 2,
                  border: '2px dashed',
                  borderColor: studentDragging ? 'primary.main' : 'grey.300',
                  borderRadius: 2,
                  p: 3,
                  textAlign: 'center',
                  bgcolor: studentDragging ? 'primary.50' : 'grey.50',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                  '&:hover': {
                    borderColor: 'primary.main',
                    bgcolor: 'primary.50',
                  }
                }}
                onDragOver={handleStudentDragOver}
                onDragLeave={handleStudentDragLeave}
                onDrop={handleStudentDrop}
              >
                <input
                  accept=".xlsx,.xls"
                  style={{ display: 'none' }}
                  id="student-file-upload"
                  type="file"
                  onChange={handleStudentFileChange}
                />
                <label htmlFor="student-file-upload" style={{ cursor: 'pointer', display: 'block' }}>
                  <UploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
                  <Typography variant="body1" fontWeight="500" gutterBottom>
                    Drag & drop your file here
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    or click to browse
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Supports: .xlsx, .xls
                  </Typography>
                </label>
              </Box>

              {studentFile && (
                <Paper sx={{ p: 2, mb: 2, bgcolor: 'grey.50' }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2">
                      Selected: {studentFile.name}
                    </Typography>
                    <Button
                      size="small"
                      startIcon={<ClearIcon />}
                      onClick={() => {
                        setStudentFile(null);
                        setStudentUploadResult(null);
                      }}
                    >
                      Clear
                    </Button>
                  </Box>
                </Paper>
              )}

              <Button
                variant="contained"
                color="primary"
                onClick={handleStudentUpload}
                disabled={!studentFile || studentUploading}
                fullWidth
                startIcon={studentUploading ? <CircularProgress size={20} /> : <UploadIcon />}
              >
                {studentUploading ? 'Uploading...' : 'Upload Students'}
              </Button>

              {studentUploadResult && (
                <Box mt={2}>
                  {studentUploadResult.error ? (
                    <Alert severity="error" icon={<ErrorIcon />}>
                      {studentUploadResult.message}
                    </Alert>
                  ) : (
                    <>
                      <Alert severity="success" icon={<CheckCircleIcon />}>
                        {studentUploadResult.message}
                      </Alert>
                      {studentUploadResult.errors && studentUploadResult.errors.length > 0 && (
                        <Alert severity="warning" sx={{ mt: 2 }}>
                          <Box display="flex" justifyContent="space-between" alignItems="center" onClick={() => setStudentErrorsExpanded(!studentErrorsExpanded)} sx={{ cursor: 'pointer' }}>
                            <Typography variant="body2">
                              {studentUploadResult.errors.length} row(s) had errors and were skipped
                            </Typography>
                            <IconButton size="small" sx={{ transform: studentErrorsExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: '0.3s' }}>
                              <ExpandMoreIcon />
                            </IconButton>
                          </Box>
                          <Collapse in={studentErrorsExpanded}>
                            <List dense sx={{ mt: 1 }}>
                              {studentUploadResult.errors.map((err: any, idx: number) => (
                                <ListItem key={idx}>
                                  <ListItemText
                                    primary={`Row ${err.row}`}
                                    secondary={err.error}
                                  />
                                </ListItem>
                              ))}
                            </List>
                          </Collapse>
                        </Alert>
                      )}
                    </>
                  )}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Teachers Import */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Import Teachers
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={2}>
                Upload an Excel file (.xlsx or .xls) to import multiple teachers
              </Typography>

              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={handleDownloadTeacherTemplate}
                fullWidth
                sx={{ mb: 2 }}
              >
                Download Template
              </Button>

              <Box
                sx={{
                  mb: 2,
                  border: '2px dashed',
                  borderColor: teacherDragging ? 'primary.main' : 'grey.300',
                  borderRadius: 2,
                  p: 3,
                  textAlign: 'center',
                  bgcolor: teacherDragging ? 'primary.50' : 'grey.50',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                  '&:hover': {
                    borderColor: 'primary.main',
                    bgcolor: 'primary.50',
                  }
                }}
                onDragOver={handleTeacherDragOver}
                onDragLeave={handleTeacherDragLeave}
                onDrop={handleTeacherDrop}
              >
                <input
                  accept=".xlsx,.xls"
                  style={{ display: 'none' }}
                  id="teacher-file-upload"
                  type="file"
                  onChange={handleTeacherFileChange}
                />
                <label htmlFor="teacher-file-upload" style={{ cursor: 'pointer', display: 'block' }}>
                  <UploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
                  <Typography variant="body1" fontWeight="500" gutterBottom>
                    Drag & drop your file here
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    or click to browse
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Supports: .xlsx, .xls
                  </Typography>
                </label>
              </Box>

              {teacherFile && (
                <Paper sx={{ p: 2, mb: 2, bgcolor: 'grey.50' }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2">
                      Selected: {teacherFile.name}
                    </Typography>
                    <Button
                      size="small"
                      startIcon={<ClearIcon />}
                      onClick={() => {
                        setTeacherFile(null);
                        setTeacherUploadResult(null);
                      }}
                    >
                      Clear
                    </Button>
                  </Box>
                </Paper>
              )}

              <Button
                variant="contained"
                color="primary"
                onClick={handleTeacherUpload}
                disabled={!teacherFile || teacherUploading}
                fullWidth
                startIcon={teacherUploading ? <CircularProgress size={20} /> : <UploadIcon />}
              >
                {teacherUploading ? 'Uploading...' : 'Upload Teachers'}
              </Button>

              {teacherUploadResult && (
                <Box mt={2}>
                  {teacherUploadResult.error ? (
                    <Alert severity="error" icon={<ErrorIcon />}>
                      {teacherUploadResult.message}
                    </Alert>
                  ) : (
                    <>
                      <Alert severity="success" icon={<CheckCircleIcon />}>
                        {teacherUploadResult.message}
                      </Alert>

                      {teacherUploadResult.credentials && teacherUploadResult.credentials.length > 0 && (
                        <Paper sx={{ mt: 2, p: 2, bgcolor: 'info.lighter' }}>
                          <Typography variant="subtitle2" color="info.main" gutterBottom>
                            User Accounts Created ({teacherUploadResult.user_accounts_created}):
                          </Typography>
                          <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                            {teacherUploadResult.password_info}
                          </Typography>
                          <List dense>
                            {teacherUploadResult.credentials.map((cred: any, idx: number) => (
                              <ListItem key={idx}>
                                <ListItemText
                                  primary={cred.name}
                                  secondary={`Email: ${cred.email} | Username: ${cred.username} | Password: ${cred.password}`}
                                />
                              </ListItem>
                            ))}
                          </List>
                        </Paper>
                      )}

                      {teacherUploadResult.errors && teacherUploadResult.errors.length > 0 && (
                        <Alert severity="warning" sx={{ mt: 2 }}>
                          <Box display="flex" justifyContent="space-between" alignItems="center" onClick={() => setTeacherErrorsExpanded(!teacherErrorsExpanded)} sx={{ cursor: 'pointer' }}>
                            <Typography variant="body2">
                              {teacherUploadResult.errors.length} row(s) had errors and were skipped
                            </Typography>
                            <IconButton size="small" sx={{ transform: teacherErrorsExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: '0.3s' }}>
                              <ExpandMoreIcon />
                            </IconButton>
                          </Box>
                          <Collapse in={teacherErrorsExpanded}>
                            <List dense sx={{ mt: 1 }}>
                              {teacherUploadResult.errors.map((err: any, idx: number) => (
                                <ListItem key={idx}>
                                  <ListItemText
                                    primary={`Row ${err.row}`}
                                    secondary={err.error}
                                  />
                                </ListItem>
                              ))}
                            </List>
                          </Collapse>
                        </Alert>
                      )}
                    </>
                  )}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Instructions */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Import Instructions
          </Typography>
          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle2" gutterBottom>
            How to Import:
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            1. <strong>Download Template:</strong> Click the "Download Template" button above to get the Excel template with correct column headers<br />
            2. <strong>Fill Your Data:</strong> Open the downloaded Excel file and add your student/teacher data following the template format<br />
            3. <strong>Validate Data:</strong> Ensure all required fields are filled and data is in the correct format (e.g., phone numbers, email addresses)<br />
            4. <strong>Upload File:</strong> Drag & drop your Excel file or click to browse, then click "Upload" button<br />
            5. <strong>Review Results:</strong> Check the import summary for any errors or warnings
          </Typography>

          <Typography variant="subtitle2" gutterBottom>
            Required Fields:
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            <strong>Students:</strong> first_name, last_name, class_name (7-10), parent_phone<br />
            <strong>Teachers:</strong> first_name, last_name, email, phone_number
          </Typography>

          <Typography variant="subtitle2" gutterBottom>
            Tips:
          </Typography>
          <Typography variant="body2" color="text.secondary">
            • Use only Excel files (.xlsx or .xls format)<br />
            • Class names should be: 7, 8, 9, or 10 (no sections)<br />
            • Phone numbers should include country code (e.g., +91-9876543210)<br />
            • Email addresses must be valid and unique for teachers<br />
            • Review error messages carefully if import fails
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ImportPage;