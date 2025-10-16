import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  AppBar,
  Toolbar,
  IconButton,
  CircularProgress,
  Alert,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { studentApi } from '../services/sisApi';
import type { Student, StudentCreateData, StudentUpdateData, Gender, CasteCategory, StudentStatus } from '../types/student';
import SchoolIcon from '@mui/icons-material/School';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import config from '../config';

const StudentFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const isEdit = !!id;

  // Form state
  const [formData, setFormData] = useState<StudentCreateData>({
    admission_number: '',
    roll_number: '',
    first_name: '',
    middle_name: '',
    last_name: '',
    date_of_birth: '',
    gender: 'Male',
    blood_group: '',
    nationality: 'Indian',
    religion: '',
    caste_category: undefined,
    aadhar_number: '',
    photo_url: '',
    current_class_id: undefined,
    current_section_id: undefined,
    house_id: undefined,
    admission_date: new Date().toISOString().split('T')[0],
    student_status: 'Active',
  });

  const [loading, setLoading] = useState(false);
  const [loadingStudent, setLoadingStudent] = useState(isEdit);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (isEdit && id) {
      loadStudent();
    }
  }, [isEdit, id]);

  const loadStudent = async () => {
    if (!id) return;

    try {
      setLoadingStudent(true);
      const student = await studentApi.getStudent(id);

      // Populate form with existing data
      setFormData({
        admission_number: student.admission_number,
        roll_number: student.roll_number || '',
        first_name: student.first_name,
        middle_name: student.middle_name || '',
        last_name: student.last_name,
        date_of_birth: student.date_of_birth,
        gender: student.gender,
        blood_group: student.blood_group || '',
        nationality: student.nationality,
        religion: student.religion || '',
        caste_category: student.caste_category || undefined,
        aadhar_number: student.aadhar_number || '',
        photo_url: student.photo_url || '',
        current_class_id: student.current_class_id || undefined,
        current_section_id: student.current_section_id || undefined,
        house_id: student.house_id || undefined,
        admission_date: student.admission_date,
        student_status: student.student_status,
      });

      setError(null);
    } catch (err: any) {
      console.error('Failed to load student:', err);
      setError('Failed to load student details');
    } finally {
      setLoadingStudent(false);
    }
  };

  const handleChange = (field: keyof StudentCreateData) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | any
  ) => {
    const value = event.target.value;
    setFormData((prev) => ({
      ...prev,
      [field]: value === '' ? undefined : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.admission_number.trim()) {
      setError('Admission number is required');
      return;
    }
    if (!formData.first_name.trim() || !formData.last_name.trim()) {
      setError('First name and last name are required');
      return;
    }
    if (!formData.date_of_birth) {
      setError('Date of birth is required');
      return;
    }
    if (!formData.admission_date) {
      setError('Admission date is required');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (isEdit && id) {
        // Update existing student
        const updateData: StudentUpdateData = { ...formData };
        await studentApi.updateStudent(id, updateData);
        setSuccess('Student updated successfully!');
        setTimeout(() => navigate(`/admin/students/${id}`), 1500);
      } else {
        // Create new student
        const newStudent = await studentApi.createStudent(formData);
        setSuccess('Student created successfully!');
        setTimeout(() => navigate(`/admin/students/${newStudent.id}`), 1500);
      }
    } catch (err: any) {
      console.error('Failed to save student:', err);
      setError(err.response?.data?.message || 'Failed to save student');
    } finally {
      setLoading(false);
    }
  };

  if (loadingStudent) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        <AppBar position="static" elevation={1}>
          <Toolbar>
            <IconButton edge="start" color="inherit" onClick={() => navigate(-1)}>
              <ArrowBackIcon />
            </IconButton>
            <SchoolIcon sx={{ ml: 1, mr: 2 }} />
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              {config.schoolName}
            </Typography>
          </Toolbar>
        </AppBar>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Header */}
      <AppBar position="static" elevation={1}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={() => navigate(-1)}>
            <ArrowBackIcon />
          </IconButton>
          <SchoolIcon sx={{ ml: 1, mr: 2 }} />
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            {config.schoolName} - {isEdit ? 'Edit' : 'Add'} Student
          </Typography>
          <Typography variant="body2" sx={{ mr: 2 }}>
            {user?.email}
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Page Title */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom fontWeight={600}>
            {isEdit ? 'Edit Student' : 'Add New Student'}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Fill in the student information below
          </Typography>
        </Box>

        {/* Success Alert */}
        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          {/* Basic Information */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Basic Information
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  label="Admission Number"
                  value={formData.admission_number}
                  onChange={handleChange('admission_number')}
                  required
                  disabled={isEdit} // Can't change admission number on edit
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  label="Roll Number"
                  value={formData.roll_number}
                  onChange={handleChange('roll_number')}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  label="Admission Date"
                  type="date"
                  value={formData.admission_date}
                  onChange={handleChange('admission_date')}
                  required
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  label="First Name"
                  value={formData.first_name}
                  onChange={handleChange('first_name')}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  label="Middle Name"
                  value={formData.middle_name}
                  onChange={handleChange('middle_name')}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  label="Last Name"
                  value={formData.last_name}
                  onChange={handleChange('last_name')}
                  required
                />
              </Grid>
            </Grid>
          </Paper>

          {/* Personal Information */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Personal Information
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  label="Date of Birth"
                  type="date"
                  value={formData.date_of_birth}
                  onChange={handleChange('date_of_birth')}
                  required
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth required>
                  <InputLabel>Gender</InputLabel>
                  <Select
                    value={formData.gender}
                    onChange={handleChange('gender')}
                    label="Gender"
                  >
                    <MenuItem value="Male">Male</MenuItem>
                    <MenuItem value="Female">Female</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  label="Blood Group"
                  value={formData.blood_group}
                  onChange={handleChange('blood_group')}
                  placeholder="e.g., A+, B-, O+"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  label="Nationality"
                  value={formData.nationality}
                  onChange={handleChange('nationality')}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  label="Religion"
                  value={formData.religion}
                  onChange={handleChange('religion')}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Caste Category</InputLabel>
                  <Select
                    value={formData.caste_category || ''}
                    onChange={handleChange('caste_category')}
                    label="Caste Category"
                  >
                    <MenuItem value="">
                      <em>None</em>
                    </MenuItem>
                    <MenuItem value="General">General</MenuItem>
                    <MenuItem value="OBC">OBC</MenuItem>
                    <MenuItem value="SC">SC</MenuItem>
                    <MenuItem value="ST">ST</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Aadhar Number"
                  value={formData.aadhar_number}
                  onChange={handleChange('aadhar_number')}
                  inputProps={{ maxLength: 12 }}
                  helperText="12-digit Aadhar number"
                />
              </Grid>
            </Grid>
          </Paper>

          {/* Academic Information */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Academic Information
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Class ID"
                  value={formData.current_class_id || ''}
                  onChange={handleChange('current_class_id')}
                  helperText="UUID of the class"
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Section ID"
                  value={formData.current_section_id || ''}
                  onChange={handleChange('current_section_id')}
                  helperText="UUID of the section"
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="House ID"
                  value={formData.house_id || ''}
                  onChange={handleChange('house_id')}
                  helperText="UUID of the house"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Student Status</InputLabel>
                  <Select
                    value={formData.student_status}
                    onChange={handleChange('student_status')}
                    label="Student Status"
                  >
                    <MenuItem value="Active">Active</MenuItem>
                    <MenuItem value="Alumni">Alumni</MenuItem>
                    <MenuItem value="Transferred">Transferred</MenuItem>
                    <MenuItem value="Withdrawn">Withdrawn</MenuItem>
                    <MenuItem value="Expelled">Expelled</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Paper>

          {/* Form Actions */}
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button
              variant="outlined"
              onClick={() => navigate(-1)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
              disabled={loading}
            >
              {loading ? 'Saving...' : isEdit ? 'Update Student' : 'Create Student'}
            </Button>
          </Stack>
        </form>
      </Container>
    </Box>
  );
};

export default StudentFormPage;
