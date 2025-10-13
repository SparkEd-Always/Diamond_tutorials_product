import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Card,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Avatar,
  IconButton,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  Alert,
  CircularProgress,
  Checkbox,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Phone as PhoneIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { AppDispatch, RootState } from '../store/store';
import { fetchTeachers } from '../store/slices/teachersSlice';
import axios from 'axios';
import { useToast } from '../contexts/ToastContext';

const API_BASE_URL = '/api/v1';

interface Teacher {
  id?: number;
  unique_id?: string;
  first_name: string;
  last_name: string;
  full_name?: string;
  phone_number: string;
  subjects: string[];
  classes_assigned: string[];
  qualification: string;
  experience_years: number;
  address: string;
  emergency_contact: string;
  is_active?: string;
}

const SUBJECTS_LIST = [
  'Mathematics', 'Science', 'English', 'Hindi', 'Social Studies',
  'Physics', 'Chemistry', 'Biology', 'Computer Science', 'Physical Education'
];

const CLASSES_LIST = [
  'Class 5A', 'Class 5B', 'Class 6A', 'Class 6B', 'Class 7A', 'Class 7B',
  'Class 8A', 'Class 8B', 'Class 9A', 'Class 9B', 'Class 10A', 'Class 10B'
];

const TeachersPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { teachers, isLoading, error } = useSelector((state: RootState) => state.teachers);
  const { token } = useSelector((state: RootState) => state.auth);
  const { showToast } = useToast();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [formData, setFormData] = useState<Teacher>({
    first_name: '',
    last_name: '',
    phone_number: '',
    subjects: [],
    classes_assigned: [],
    qualification: '',
    experience_years: 0,
    address: '',
    emergency_contact: '',
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [selectedTeachers, setSelectedTeachers] = useState<number[]>([]);
  const [deletingTeachers, setDeletingTeachers] = useState(false);

  useEffect(() => {
    dispatch(fetchTeachers());
  }, [dispatch]);

  const handleSelectTeacher = (teacherId: number) => {
    setSelectedTeachers(prev =>
      prev.includes(teacherId)
        ? prev.filter(id => id !== teacherId)
        : [...prev, teacherId]
    );
  };

  const handleSelectAll = () => {
    if (selectedTeachers.length === teachers.length) {
      setSelectedTeachers([]);
    } else {
      setSelectedTeachers(teachers.map((t: any) => t.id));
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedTeachers.length === 0) return;

    if (window.confirm(`Are you sure you want to delete ${selectedTeachers.length} teacher(s)?`)) {
      try {
        setDeletingTeachers(true);
        await axios.post(
          `${API_BASE_URL}/teachers/delete-multiple`,
          selectedTeachers,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSelectedTeachers([]);
        dispatch(fetchTeachers()); // Refresh list
        showToast(`Successfully deleted ${selectedTeachers.length} teacher(s)`, 'success');
      } catch (error: any) {
        showToast(error.response?.data?.detail || 'Failed to delete teachers', 'error');
      } finally {
        setDeletingTeachers(false);
      }
    }
  };

  const handleDeleteTeacher = async (teacher: any) => {
    if (window.confirm(`Are you sure you want to delete ${teacher.full_name}?`)) {
      try {
        setDeletingTeachers(true);
        await axios.delete(`${API_BASE_URL}/teachers/${teacher.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        dispatch(fetchTeachers()); // Refresh list
        showToast('Teacher deleted successfully', 'success');
      } catch (error: any) {
        showToast(error.response?.data?.detail || 'Failed to delete teacher', 'error');
      } finally {
        setDeletingTeachers(false);
      }
    }
  };

  const handleOpenDialog = (teacher?: any) => {
    if (teacher) {
      setEditMode(true);
      setSelectedTeacher(teacher);
      // Split full_name into first_name and last_name if needed
      const nameParts = teacher.full_name ? teacher.full_name.split(' ') : ['', ''];
      setFormData({
        ...teacher,
        first_name: teacher.first_name || nameParts[0] || '',
        last_name: teacher.last_name || nameParts.slice(1).join(' ') || '',
        subjects: teacher.subjects || [],
        classes_assigned: teacher.classes_assigned || [],
        qualification: teacher.qualification || '',
        experience_years: teacher.experience_years || 0,
        address: teacher.address || '',
        emergency_contact: teacher.emergency_contact || '',
      });
    } else {
      setEditMode(false);
      setSelectedTeacher(null);
      setFormData({
        first_name: '',
        last_name: '',
        phone_number: '',
        subjects: [],
        classes_assigned: [],
        qualification: '',
        experience_years: 0,
        address: '',
        emergency_contact: '',
      });
    }
    setDialogOpen(true);
    setFormError(null);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditMode(false);
    setSelectedTeacher(null);
    setFormError(null);
  };

  const handleInputChange = (field: keyof Teacher, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setFormError(null);

    try {
      const payload = {
        ...formData,
        full_name: `${formData.first_name} ${formData.last_name}`,
      };

      if (editMode && selectedTeacher?.id) {
        // Update existing teacher
        await axios.put(
          `${API_BASE_URL}/teachers/${selectedTeacher.id}`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        // Create new teacher
        await axios.post(
          `${API_BASE_URL}/teachers/`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      // Refresh teachers list
      dispatch(fetchTeachers());
      handleCloseDialog();
    } catch (error: any) {
      setFormError(error.response?.data?.detail || 'Failed to save teacher');
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Teachers
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage teaching staff and assignments
          </Typography>
        </Box>
        <Box display="flex" gap={2}>
          {selectedTeachers.length > 0 && (
            <Button
              variant="outlined"
              color="error"
              startIcon={deletingTeachers ? <CircularProgress size={20} /> : <DeleteIcon />}
              size="large"
              onClick={handleDeleteSelected}
              disabled={deletingTeachers}
            >
              {deletingTeachers ? 'Deleting...' : `Delete Selected (${selectedTeachers.length})`}
            </Button>
          )}
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            size="large"
            onClick={() => handleOpenDialog()}
          >
            Add Teacher
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Teachers Table */}
      <Card>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={teachers.length > 0 && selectedTeachers.length === teachers.length}
                    indeterminate={selectedTeachers.length > 0 && selectedTeachers.length < teachers.length}
                    onChange={handleSelectAll}
                  />
                </TableCell>
                <TableCell>Teacher</TableCell>
                <TableCell>Teacher ID</TableCell>
                <TableCell>Contact</TableCell>
                <TableCell>Subjects</TableCell>
                <TableCell>Classes Assigned</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {teachers.map((teacher: any) => (
                <TableRow key={teacher.id} hover selected={selectedTeachers.includes(teacher.id)}>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedTeachers.includes(teacher.id)}
                      onChange={() => handleSelectTeacher(teacher.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                        {teacher.full_name.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="body1" fontWeight="500">
                          {teacher.full_name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Teacher
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={teacher.unique_id}
                      variant="outlined"
                      color="primary"
                    />
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <PhoneIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                      <Typography variant="caption" color="text.secondary">
                        {teacher.phone_number}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={0.5} flexWrap="wrap">
                      {teacher.subjects.map((subject: string) => (
                        <Chip
                          key={subject}
                          label={subject}
                          size="small"
                          color="secondary"
                        />
                      ))}
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={0.5} flexWrap="wrap">
                      {teacher.classes_assigned.map((className: string) => (
                        <Chip
                          key={className}
                          label={className}
                          size="small"
                          color="secondary"
                        />
                      ))}
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <IconButton
                      color="primary"
                      onClick={() => handleOpenDialog(teacher)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleDeleteTeacher(teacher)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {teachers.length === 0 && !isLoading && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      No teachers yet
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Click "Add Teacher" to create your first teacher record
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">
              {editMode ? 'Edit Teacher' : 'Add New Teacher'}
            </Typography>
            <IconButton onClick={handleCloseDialog}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {formError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {formError}
            </Alert>
          )}
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="First Name"
                required
                value={formData.first_name}
                onChange={(e) => handleInputChange('first_name', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Last Name"
                required
                value={formData.last_name}
                onChange={(e) => handleInputChange('last_name', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Phone Number"
                required
                value={formData.phone_number}
                onChange={(e) => handleInputChange('phone_number', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Subjects *</InputLabel>
                <Select
                  multiple
                  value={formData.subjects}
                  onChange={(e) => handleInputChange('subjects', e.target.value)}
                  input={<OutlinedInput label="Subjects *" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} size="small" />
                      ))}
                    </Box>
                  )}
                >
                  {SUBJECTS_LIST.map((subject) => (
                    <MenuItem key={subject} value={subject}>
                      {subject}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Classes Assigned *</InputLabel>
                <Select
                  multiple
                  value={formData.classes_assigned}
                  onChange={(e) => handleInputChange('classes_assigned', e.target.value)}
                  input={<OutlinedInput label="Classes Assigned *" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} size="small" />
                      ))}
                    </Box>
                  )}
                >
                  {CLASSES_LIST.map((className) => (
                    <MenuItem key={className} value={className}>
                      {className}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Qualification"
                value={formData.qualification}
                onChange={(e) => handleInputChange('qualification', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Experience (Years)"
                type="number"
                value={formData.experience_years}
                onChange={(e) => handleInputChange('experience_years', parseInt(e.target.value) || 0)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Emergency Contact"
                value={formData.emergency_contact}
                onChange={(e) => handleInputChange('emergency_contact', e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                multiline
                rows={2}
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={submitting}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={
              submitting ||
              !formData.first_name ||
              !formData.last_name ||
              !formData.phone_number ||
              formData.subjects.length === 0 ||
              formData.classes_assigned.length === 0
            }
            startIcon={submitting ? <CircularProgress size={20} /> : null}
          >
            {submitting ? (editMode ? 'Updating...' : 'Adding...') : (editMode ? 'Update' : 'Add Teacher')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TeachersPage;