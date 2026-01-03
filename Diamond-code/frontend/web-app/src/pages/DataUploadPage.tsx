import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Stack,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  Download as DownloadIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';

interface UploadData {
  students?: any[];
  teachers?: any[];
}

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  data: any[];
}

const DataUploadPage: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [activeTab, setActiveTab] = useState(0);
  const [uploadedData, setUploadedData] = useState<UploadData>({});
  const [validationResults, setValidationResults] = useState<{
    students?: ValidationResult;
    teachers?: ValidationResult;
  }>({});
  const [uploading, setUploading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [previewDialog, setPreviewDialog] = useState(false);
  const [previewData, setPreviewData] = useState<any[]>([]);

  const steps = ['Select Files', 'Review Data', 'Validate', 'Import'];

  // CSV parsing function
  const parseCSV = (csvText: string): any[] => {
    const lines = csvText.split('\n').filter(line => line.trim());
    if (lines.length === 0) return [];

    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const data = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
      if (values.length === headers.length) {
        const row: any = {};
        headers.forEach((header, index) => {
          row[header] = values[index];
        });
        data.push(row);
      }
    }

    return data;
  };

  // Validation functions
  const validateStudentData = (data: any[]): ValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];
    const requiredFields = ['full_name', 'class_name', 'parent_name', 'parent_phone'];

    // Check required fields
    const firstRow = data[0] || {};
    requiredFields.forEach(field => {
      if (!firstRow.hasOwnProperty(field)) {
        errors.push(`Missing required column: ${field}`);
      }
    });

    // Validate each row
    data.forEach((row, index) => {
      requiredFields.forEach(field => {
        if (!row[field] || row[field].trim() === '') {
          errors.push(`Row ${index + 2}: Missing ${field}`);
        }
      });

      // Validate phone number format
      if (row.parent_phone && !/^\+?[0-9]{10,15}$/.test(row.parent_phone.replace(/\s/g, ''))) {
        warnings.push(`Row ${index + 2}: Invalid phone number format: ${row.parent_phone}`);
      }

      // Validate class name format
      const validClasses = ['Class 7', 'Class 8', 'Class 9', 'Class 10'];
      if (row.class_name && !validClasses.includes(row.class_name)) {
        warnings.push(`Row ${index + 2}: Unusual class name: ${row.class_name}`);
      }
    });

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      data
    };
  };

  const validateTeacherData = (data: any[]): ValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];
    const requiredFields = ['full_name', 'email', 'phone', 'subject_specialization'];

    // Check required fields
    const firstRow = data[0] || {};
    requiredFields.forEach(field => {
      if (!firstRow.hasOwnProperty(field)) {
        errors.push(`Missing required column: ${field}`);
      }
    });

    // Validate each row
    data.forEach((row, index) => {
      requiredFields.forEach(field => {
        if (!row[field] || row[field].trim() === '') {
          errors.push(`Row ${index + 2}: Missing ${field}`);
        }
      });

      // Validate email format
      if (row.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email)) {
        errors.push(`Row ${index + 2}: Invalid email format: ${row.email}`);
      }

      // Validate phone number format
      if (row.phone && !/^\+?[0-9]{10,15}$/.test(row.phone.replace(/\s/g, ''))) {
        warnings.push(`Row ${index + 2}: Invalid phone number format: ${row.phone}`);
      }
    });

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      data
    };
  };

  // File drop handlers
  const onStudentDrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const csvData = parseCSV(e.target?.result as string);
        const validation = validateStudentData(csvData);
        setUploadedData(prev => ({ ...prev, students: csvData }));
        setValidationResults(prev => ({ ...prev, students: validation }));
        setActiveStep(1);
      };
      reader.readAsText(file);
    }
  };

  const onTeacherDrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const csvData = parseCSV(e.target?.result as string);
        const validation = validateTeacherData(csvData);
        setUploadedData(prev => ({ ...prev, teachers: csvData }));
        setValidationResults(prev => ({ ...prev, teachers: validation }));
        setActiveStep(1);
      };
      reader.readAsText(file);
    }
  };

  const studentDropzone = useDropzone({
    onDrop: onStudentDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.csv']
    },
    multiple: false
  });

  const teacherDropzone = useDropzone({
    onDrop: onTeacherDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.csv']
    },
    multiple: false
  });

  const handlePreview = (data: any[]) => {
    setPreviewData(data);
    setPreviewDialog(true);
  };

  const handleImport = async () => {
    setUploading(true);
    setActiveStep(3);

    try {
      // Simulate API calls for import
      if (uploadedData.students) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        console.log('Importing students:', uploadedData.students);
      }

      if (uploadedData.teachers) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log('Importing teachers:', uploadedData.teachers);
      }

      setUploadComplete(true);
    } catch (error) {
      console.error('Import failed:', error);
    } finally {
      setUploading(false);
    }
  };

  const downloadTemplate = (type: 'students' | 'teachers') => {
    let csvContent = '';

    if (type === 'students') {
      csvContent = `full_name,unique_id,class_name,date_of_birth,gender,parent_name,parent_phone,address,emergency_contact
Rahul Sharma,AVM-STU-001,Class 7,2010-05-15,Male,Rajesh Sharma,+919876543210,"123 Main St, Mumbai",+919876543211
Priya Patel,AVM-STU-002,Class 8,2009-08-22,Female,Amit Patel,+919876543212,"456 Park Ave, Delhi",+919876543213`;
    } else {
      csvContent = `full_name,email,phone,date_of_birth,gender,subject_specialization,qualification,experience_years,address
Dr. Rajesh Kumar,rajesh.kumar@email.com,+919876543214,1985-03-10,Male,Mathematics,"M.Sc Mathematics, B.Ed",8,"789 Teacher Colony, Pune"
Ms. Sunita Singh,sunita.singh@email.com,+919876543215,1990-07-25,Female,English,"M.A English, B.Ed",5,"321 Educator Street, Chennai"`;
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${type}_template.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderValidationSummary = (validation: ValidationResult, type: string) => (
    <Card sx={{ mt: 2 }}>
      <CardContent>
        <Stack direction="row" alignItems="center" spacing={2}>
          {validation.valid ? (
            <CheckCircleIcon color="success" />
          ) : (
            <ErrorIcon color="error" />
          )}
          <Typography variant="h6">
            {type} Validation {validation.valid ? 'Passed' : 'Failed'}
          </Typography>
          <Chip
            label={`${validation.data.length} records`}
            color="primary"
            variant="outlined"
          />
          <Button
            startIcon={<VisibilityIcon />}
            onClick={() => handlePreview(validation.data)}
            variant="outlined"
            size="small"
          >
            Preview Data
          </Button>
        </Stack>

        {validation.errors.length > 0 && (
          <Alert severity="error" sx={{ mt: 2 }}>
            <Typography variant="subtitle2">Errors:</Typography>
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              {validation.errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </Alert>
        )}

        {validation.warnings.length > 0 && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            <Typography variant="subtitle2">Warnings:</Typography>
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              {validation.warnings.map((warning, index) => (
                <li key={index}>{warning}</li>
              ))}
            </ul>
          </Alert>
        )}
      </CardContent>
    </Card>
  );

  return (
    <Box>
      {/* Header */}
      <Box mb={3}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Data Import Wizard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Import student and teacher data from CSV files
        </Typography>
      </Box>

      {/* Stepper */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </CardContent>
      </Card>

      {/* Step Content */}
      {activeStep === 0 && (
        <Box>
          <Tabs value={activeTab} onChange={(_, value) => setActiveTab(value)} sx={{ mb: 3 }}>
            <Tab label="Students" />
            <Tab label="Teachers" />
          </Tabs>

          {activeTab === 0 && (
            <Card>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                  <Typography variant="h6">Import Students</Typography>
                  <Button
                    startIcon={<DownloadIcon />}
                    onClick={() => downloadTemplate('students')}
                    variant="outlined"
                  >
                    Download Template
                  </Button>
                </Stack>

                <Box
                  {...studentDropzone.getRootProps()}
                  sx={{
                    border: 2,
                    borderColor: studentDropzone.isDragActive ? 'primary.main' : 'grey.300',
                    borderStyle: 'dashed',
                    borderRadius: 2,
                    p: 4,
                    textAlign: 'center',
                    cursor: 'pointer',
                    backgroundColor: studentDropzone.isDragActive ? 'grey.50' : 'transparent'
                  }}
                >
                  <input {...studentDropzone.getInputProps()} />
                  <CloudUploadIcon sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Drop your student CSV file here
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    or click to browse files
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          )}

          {activeTab === 1 && (
            <Card>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                  <Typography variant="h6">Import Teachers</Typography>
                  <Button
                    startIcon={<DownloadIcon />}
                    onClick={() => downloadTemplate('teachers')}
                    variant="outlined"
                  >
                    Download Template
                  </Button>
                </Stack>

                <Box
                  {...teacherDropzone.getRootProps()}
                  sx={{
                    border: 2,
                    borderColor: teacherDropzone.isDragActive ? 'primary.main' : 'grey.300',
                    borderStyle: 'dashed',
                    borderRadius: 2,
                    p: 4,
                    textAlign: 'center',
                    cursor: 'pointer',
                    backgroundColor: teacherDropzone.isDragActive ? 'grey.50' : 'transparent'
                  }}
                >
                  <input {...teacherDropzone.getInputProps()} />
                  <CloudUploadIcon sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Drop your teacher CSV file here
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    or click to browse files
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          )}
        </Box>
      )}

      {activeStep === 1 && (
        <Box>
          <Typography variant="h6" gutterBottom>
            Review Uploaded Data
          </Typography>

          {validationResults.students && renderValidationSummary(validationResults.students, 'Students')}
          {validationResults.teachers && renderValidationSummary(validationResults.teachers, 'Teachers')}

          <Stack direction="row" spacing={2} mt={3}>
            <Button
              variant="outlined"
              onClick={() => setActiveStep(0)}
            >
              Back
            </Button>
            <Button
              variant="contained"
              onClick={() => setActiveStep(2)}
              disabled={
                (validationResults.students && !validationResults.students.valid) ||
                (validationResults.teachers && !validationResults.teachers.valid)
              }
            >
              Proceed to Import
            </Button>
          </Stack>
        </Box>
      )}

      {activeStep === 2 && (
        <Box>
          <Typography variant="h6" gutterBottom>
            Confirm Import
          </Typography>

          <Alert severity="info" sx={{ mb: 3 }}>
            You are about to import:
            <ul style={{ margin: '8px 0', paddingLeft: 20 }}>
              {uploadedData.students && <li>{uploadedData.students.length} students</li>}
              {uploadedData.teachers && <li>{uploadedData.teachers.length} teachers</li>}
            </ul>
            This action cannot be undone. Please review the data carefully before proceeding.
          </Alert>

          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              onClick={() => setActiveStep(1)}
            >
              Back
            </Button>
            <Button
              variant="contained"
              color="success"
              onClick={handleImport}
            >
              Start Import
            </Button>
          </Stack>
        </Box>
      )}

      {activeStep === 3 && (
        <Box>
          <Typography variant="h6" gutterBottom>
            {uploadComplete ? 'Import Complete!' : 'Importing Data...'}
          </Typography>

          {!uploadComplete && (
            <Box sx={{ mb: 3 }}>
              <LinearProgress />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Please wait while we import your data...
              </Typography>
            </Box>
          )}

          {uploadComplete && (
            <Alert severity="success" sx={{ mb: 3 }}>
              <Typography variant="subtitle1">
                Data imported successfully!
              </Typography>
              <ul style={{ margin: '8px 0', paddingLeft: 20 }}>
                {uploadedData.students && <li>{uploadedData.students.length} students imported</li>}
                {uploadedData.teachers && <li>{uploadedData.teachers.length} teachers imported</li>}
              </ul>
            </Alert>
          )}

          {uploadComplete && (
            <Button
              variant="contained"
              onClick={() => {
                setActiveStep(0);
                setUploadedData({});
                setValidationResults({});
                setUploadComplete(false);
              }}
            >
              Import More Data
            </Button>
          )}
        </Box>
      )}

      {/* Preview Dialog */}
      <Dialog
        open={previewDialog}
        onClose={() => setPreviewDialog(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>Data Preview</DialogTitle>
        <DialogContent>
          <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  {previewData.length > 0 && Object.keys(previewData[0]).map((header) => (
                    <TableCell key={header}>{header}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {previewData.slice(0, 10).map((row, index) => (
                  <TableRow key={index}>
                    {Object.values(row).map((value: any, cellIndex) => (
                      <TableCell key={cellIndex}>{value}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          {previewData.length > 10 && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              Showing first 10 rows of {previewData.length} total records
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DataUploadPage;