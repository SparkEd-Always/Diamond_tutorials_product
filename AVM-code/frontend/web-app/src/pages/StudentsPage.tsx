import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
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
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Checkbox,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Phone as PhoneIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import axios from 'axios';
import { useToast } from '../contexts/ToastContext';

const API_BASE_URL = 'http://localhost:8000/api/v1';

interface Student {
  id: number;
  unique_id: string;
  full_name: string;
  class_name: string;
  parent_phone: string;
  parent_name: string;
}

const StudentsPage: React.FC = () => {
  const { token } = useSelector((state: RootState) => state.auth);
  const { showToast } = useToast();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<Student>>({});
  const [addFormData, setAddFormData] = useState<Partial<Student>>({});
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [addingStudent, setAddingStudent] = useState(false);
  const [updatingStudent, setUpdatingStudent] = useState(false);
  const [deletingStudent, setDeletingStudent] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch students from API
  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/students/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStudents(response.data);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (student: Student) => {
    setSelectedStudent(student);
    setEditFormData(student);
    setEditDialogOpen(true);
  };

  const handleEditClose = () => {
    setEditDialogOpen(false);
    setSelectedStudent(null);
    setEditFormData({});
  };

  const handleEditSave = async () => {
    if (!selectedStudent) return;

    try {
      setUpdatingStudent(true);
      await axios.put(
        `${API_BASE_URL}/students/${selectedStudent.id}`,
        editFormData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchStudents(); // Refresh list
      handleEditClose();
      showToast('Student updated successfully', 'success');
    } catch (error: any) {
      showToast(error.response?.data?.detail || 'Failed to update student', 'error');
    } finally {
      setUpdatingStudent(false);
    }
  };

  const handleFormChange = (field: keyof Student, value: string) => {
    setEditFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDeleteClick = async (student: Student) => {
    if (window.confirm(`Are you sure you want to delete ${student.full_name}?`)) {
      try {
        setDeletingStudent(true);
        await axios.delete(`${API_BASE_URL}/students/${student.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchStudents(); // Refresh list
        showToast('Student deleted successfully', 'success');
      } catch (error: any) {
        showToast(error.response?.data?.detail || 'Failed to delete student', 'error');
      } finally {
        setDeletingStudent(false);
      }
    }
  };

  const handleSelectStudent = (studentId: number) => {
    setSelectedStudents(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleSelectAll = () => {
    const allFilteredIds = filteredStudents.map(s => s.id);
    const allSelected = allFilteredIds.every(id => selectedStudents.includes(id));

    if (allSelected) {
      // Deselect all filtered students
      setSelectedStudents(prev => prev.filter(id => !allFilteredIds.includes(id)));
    } else {
      // Select all filtered students (add to existing selection)
      setSelectedStudents(prev => Array.from(new Set([...prev, ...allFilteredIds])));
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedStudents.length === 0) return;

    if (window.confirm(`Are you sure you want to delete ${selectedStudents.length} student(s)?`)) {
      try {
        setDeletingStudent(true);
        await axios.post(
          `${API_BASE_URL}/students/delete-multiple`,
          selectedStudents,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSelectedStudents([]);
        fetchStudents(); // Refresh list
        showToast(`Successfully deleted ${selectedStudents.length} student(s)`, 'success');
      } catch (error: any) {
        showToast(error.response?.data?.detail || 'Failed to delete students', 'error');
      } finally {
        setDeletingStudent(false);
      }
    }
  };

  const handleAddClose = () => {
    setAddDialogOpen(false);
    setAddFormData({});
  };

  const handleAddSave = async () => {
    try {
      setAddingStudent(true);
      await axios.post(
        `${API_BASE_URL}/students/`,
        addFormData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchStudents(); // Refresh list
      handleAddClose();
      showToast('Student added successfully', 'success');
    } catch (error: any) {
      showToast(error.response?.data?.detail || 'Failed to create student', 'error');
    } finally {
      setAddingStudent(false);
    }
  };

  const handleAddFormChange = (field: keyof Student, value: string) => {
    setAddFormData(prev => ({ ...prev, [field]: value }));
  };

  // Filter students based on search query
  const filteredStudents = students.filter(student => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      student.full_name.toLowerCase().includes(query) ||
      student.unique_id.toLowerCase().includes(query) ||
      student.class_name.toLowerCase().includes(query) ||
      student.parent_name.toLowerCase().includes(query) ||
      student.parent_phone.toLowerCase().includes(query)
    );
  });

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Students
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage student records and information
          </Typography>
        </Box>
        <Box display="flex" gap={2}>
          {selectedStudents.length > 0 && (
            <Button
              variant="outlined"
              color="error"
              startIcon={deletingStudent ? <CircularProgress size={20} /> : <DeleteIcon />}
              size="large"
              onClick={handleDeleteSelected}
              disabled={deletingStudent}
            >
              {deletingStudent ? 'Deleting...' : `Delete Selected (${selectedStudents.length})`}
            </Button>
          )}
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            size="large"
            onClick={() => setAddDialogOpen(true)}
          >
            Add Student
          </Button>
        </Box>
      </Box>

      {/* Search and Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <TextField
            fullWidth
            placeholder="Search students by name, ID, class, parent..."
            variant="outlined"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </CardContent>
      </Card>

      {/* Students Table */}
      <Card>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={filteredStudents.length > 0 && selectedStudents.length === filteredStudents.length}
                    indeterminate={selectedStudents.length > 0 && selectedStudents.length < filteredStudents.length}
                    onChange={handleSelectAll}
                  />
                </TableCell>
                <TableCell>Student</TableCell>
                <TableCell>Student ID</TableCell>
                <TableCell>Class</TableCell>
                <TableCell>Parent Contact</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                    <CircularProgress />
                    <Typography variant="body2" color="text.secondary" mt={2}>
                      Loading students...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : filteredStudents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      {searchQuery ? 'No students found' : 'No students yet'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {searchQuery ? 'Try adjusting your search query' : 'Click "Add Student" to create your first student record'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredStudents.map((student) => (
                <TableRow key={student.id} hover selected={selectedStudents.includes(student.id)}>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedStudents.includes(student.id)}
                      onChange={() => handleSelectStudent(student.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                        {student.full_name.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="body1" fontWeight="500">
                          {student.full_name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Student
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={student.unique_id}
                      variant="outlined"
                      color="primary"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={student.class_name}
                      color="secondary"
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight="500">
                        {student.parent_name}
                      </Typography>
                      <Box display="flex" alignItems="center">
                        <PhoneIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                        <Typography variant="caption" color="text.secondary">
                          {student.parent_phone}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleEditClick(student)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDeleteClick(student)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              )))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Edit Student Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={handleEditClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Edit Student</Typography>
            <IconButton onClick={handleEditClose} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Student ID"
                value={editFormData.unique_id || ''}
                disabled
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Full Name"
                value={editFormData.full_name || ''}
                onChange={(e) => handleFormChange('full_name', e.target.value)}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Class (7, 8, 9, or 10)"
                value={editFormData.class_name || ''}
                onChange={(e) => handleFormChange('class_name', e.target.value)}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Parent Name"
                value={editFormData.parent_name || ''}
                onChange={(e) => handleFormChange('parent_name', e.target.value)}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Parent Phone"
                value={editFormData.parent_phone || ''}
                onChange={(e) => handleFormChange('parent_phone', e.target.value)}
                variant="outlined"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditClose} color="inherit" disabled={updatingStudent}>
            Cancel
          </Button>
          <Button
            onClick={handleEditSave}
            variant="contained"
            color="primary"
            disabled={updatingStudent}
            startIcon={updatingStudent ? <CircularProgress size={20} /> : null}
          >
            {updatingStudent ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Student Dialog */}
      <Dialog
        open={addDialogOpen}
        onClose={handleAddClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Add New Student</Typography>
            <IconButton onClick={handleAddClose} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Full Name *"
                required
                value={addFormData.full_name || ''}
                onChange={(e) => handleAddFormChange('full_name', e.target.value)}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Class *"
                required
                value={addFormData.class_name || ''}
                onChange={(e) => handleAddFormChange('class_name', e.target.value)}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Parent Name *"
                required
                value={addFormData.parent_name || ''}
                onChange={(e) => handleAddFormChange('parent_name', e.target.value)}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Parent Phone *"
                required
                value={addFormData.parent_phone || ''}
                onChange={(e) => handleAddFormChange('parent_phone', e.target.value)}
                variant="outlined"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAddClose} color="inherit" disabled={addingStudent}>
            Cancel
          </Button>
          <Button
            onClick={handleAddSave}
            variant="contained"
            color="primary"
            disabled={
              addingStudent ||
              !addFormData.full_name ||
              !addFormData.class_name ||
              !addFormData.parent_name ||
              !addFormData.parent_phone
            }
            startIcon={addingStudent ? <CircularProgress size={20} /> : null}
          >
            {addingStudent ? 'Adding...' : 'Add Student'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StudentsPage;