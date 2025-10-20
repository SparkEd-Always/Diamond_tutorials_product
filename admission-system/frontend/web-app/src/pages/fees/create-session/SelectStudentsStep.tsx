import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  Chip,
  Alert,
  CircularProgress,
  InputAdornment,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';
import { feeSessionApi } from '../../../services/feeApi';
import api from '../../../services/api';
import type { FilteredStudent } from '../../../types/fees';

interface SelectStudentsStepProps {
  academicYearId: number;
  selectedStudents: FilteredStudent[];
  onStudentsChange: (students: FilteredStudent[]) => void;
}

interface Class {
  id: number;
  class_name: string;
  academic_year_id: number;
  class_order?: number;
  capacity?: number;
  is_active: boolean;
}

const SelectStudentsStep: React.FC<SelectStudentsStepProps> = ({
  academicYearId,
  selectedStudents,
  onStudentsChange,
}) => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<FilteredStudent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter state
  const [selectedClassId, setSelectedClassId] = useState<number | ''>('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadClasses();
  }, []);

  useEffect(() => {
    // Update filtered students with selected state from props
    setFilteredStudents(prevStudents =>
      prevStudents.map(student => ({
        ...student,
        is_selected: selectedStudents.some(s => s.id === student.id && s.is_selected)
      }))
    );
  }, [selectedStudents]);

  const loadClasses = async () => {
    try {
      const response = await api.get('/academic/classes');
      setClasses(response.data);
    } catch (err) {
      console.error('Failed to load classes:', err);
    }
  };

  const handleFilter = async () => {
    if (!selectedClassId && !searchQuery) {
      setError('Please select a class or enter a search query');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log('i am here');

      const criteria = {
        class_id: selectedClassId || undefined,
        search_query: searchQuery || undefined,
      };
      console.log("criteria for search", criteria);
      const students = await feeSessionApi.filterStudents(criteria);
      console.log("filtered students", students);
      // Preserve selection state
      const studentsWithSelection = students.map(student => ({
        ...student,
        is_selected: selectedStudents.some(s => s.id === student.id && s.is_selected)
      }));

      setFilteredStudents(studentsWithSelection);
    } catch (err: any) {
      console.error('Failed to filter students:', err);
      setError(err.response?.data?.detail || 'Failed to filter students');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    const updatedStudents = filteredStudents.map(student => ({
      ...student,
      is_selected: checked
    }));
    setFilteredStudents(updatedStudents);
    onStudentsChange(updatedStudents);
  };

  const handleStudentToggle = (studentId: number) => {
    const updatedStudents = filteredStudents.map(student =>
      student.id === studentId
        ? { ...student, is_selected: !student.is_selected }
        : student
    );
    setFilteredStudents(updatedStudents);
    onStudentsChange(updatedStudents);
  };

  const selectedCount = filteredStudents.filter(s => s.is_selected).length;
  const allSelected = filteredStudents.length > 0 && selectedCount === filteredStudents.length;
  const someSelected = selectedCount > 0 && selectedCount < filteredStudents.length;

  return (
    <Box>
      <Typography variant="h6" gutterBottom fontWeight="medium">
        Select Students
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Filter students by class and/or search by name to select who should be assigned to this session
      </Typography>

      {/* Filters */}
      <Paper variant="outlined" sx={{ p: 3, mt: 3, mb: 3 }}>
        <Box display="flex" alignItems="center" gap={1} mb={2}>
          <FilterIcon color="primary" />
          <Typography variant="subtitle2" fontWeight="medium">
            Filter Students
          </Typography>
        </Box>

        <Box display="flex" gap={2} alignItems="flex-end">
          <FormControl sx={{ minWidth: 250 }}>
            <InputLabel>Select Class</InputLabel>
            <Select
              value={selectedClassId}
              label="Select Class"
              onChange={(e) => setSelectedClassId(e.target.value as number)}
            >
              <MenuItem value="">All Classes</MenuItem>
              {classes.map((cls) => (
                <MenuItem key={cls.id} value={cls.id}>
                  {cls.class_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Search by Name"
            placeholder="Enter student name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ minWidth: 300 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleFilter();
              }
            }}
          />

          <Button
            variant="contained"
            onClick={handleFilter}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <FilterIcon />}
            sx={{ height: 56 }}
          >
            {loading ? 'Filtering...' : 'Filter'}
          </Button>
        </Box>

        <Alert severity="info" sx={{ mt: 2 }}>
          <Typography variant="body2">
            <strong>Tip:</strong> You can filter by class only, search by name only, or combine both for precise filtering
          </Typography>
        </Alert>
      </Paper>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Students Table */}
      {filteredStudents.length > 0 && (
        <>
          {/* Selection Summary */}
          <Paper sx={{ p: 2, mb: 2, bgcolor: 'primary.50', borderLeft: 4, borderColor: 'primary.main' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box display="flex" gap={2} alignItems="center">
                <Typography variant="body2" fontWeight="medium">
                  {selectedCount} student{selectedCount !== 1 ? 's' : ''} selected
                </Typography>
                <Chip label={`Total: ${filteredStudents.length}`} size="small" variant="outlined" />
              </Box>
              <Box display="flex" gap={1}>
                <Button
                  size="small"
                  onClick={() => handleSelectAll(true)}
                  disabled={allSelected}
                >
                  Select All
                </Button>
                <Button
                  size="small"
                  onClick={() => handleSelectAll(false)}
                  disabled={selectedCount === 0}
                >
                  Deselect All
                </Button>
              </Box>
            </Box>
          </Paper>

          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.100' }}>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={allSelected}
                      indeterminate={someSelected}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      color="primary"
                    />
                  </TableCell>
                  <TableCell><strong>Student Name</strong></TableCell>
                  <TableCell><strong>Admission No.</strong></TableCell>
                  <TableCell><strong>Roll No.</strong></TableCell>
                  <TableCell><strong>Class</strong></TableCell>
                  <TableCell><strong>Section</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredStudents.map((student) => (
                  <TableRow
                    key={student.id}
                    hover
                    onClick={() => handleStudentToggle(student.id)}
                    sx={{
                      cursor: 'pointer',
                      bgcolor: student.is_selected ? 'action.selected' : 'inherit',
                    }}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={student.is_selected}
                        onChange={() => handleStudentToggle(student.id)}
                        color="primary"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={student.is_selected ? 'medium' : 'regular'}>
                        {student.full_name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{student.admission_number}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{student.roll_number || '-'}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{student.class_name}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{student.section || '-'}</Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      {/* No Results */}
      {!loading && filteredStudents.length === 0 && (selectedClassId || searchQuery) && (
        <Alert severity="info">
          No students found matching your filters. Try adjusting your search criteria.
        </Alert>
      )}

      {/* Selection Confirmation */}
      {selectedCount > 0 && (
        <Paper sx={{ mt: 3, p: 3, bgcolor: 'success.50', borderLeft: 4, borderColor: 'success.main' }}>
          <Box display="flex" alignItems="center" gap={1} mb={1}>
            <CheckIcon color="success" />
            <Typography variant="h6" color="success.main">
              {selectedCount} Student{selectedCount !== 1 ? 's' : ''} Selected
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            These students will be assigned to the fee session. You can proceed to review and confirm.
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default SelectStudentsStep;
