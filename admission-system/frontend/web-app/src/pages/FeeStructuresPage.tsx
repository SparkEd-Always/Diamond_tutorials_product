import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Button,
  TextField,
  IconButton,
  Box,
  Alert,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Divider,
  InputAdornment,
  AppBar,
  Toolbar,
  Menu,
  MenuItem,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  ArrowBack as ArrowBackIcon,
  School as SchoolIcon,
  AccountCircle,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { feeStructureApi, feeTypeApi } from '../services/feeApi';
import { academicApi } from '../services/api';
import type { FeeStructure, FeeType } from '../types/fees';
import type { AcademicYear, Class } from '../types';
import config from '../config';

// Grouped structure type for display
interface GroupedStructure {
  id: string; // Unique identifier for the group
  name: string; // Custom name assigned by admin
  totalAmount: number;
  structures: FeeStructure[]; // All fee types in this structure
  classId: number;
  academicYearId: number;
}

const FeeStructuresPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const [feeStructures, setFeeStructures] = useState<FeeStructure[]>([]);
  const [groupedStructures, setGroupedStructures] = useState<GroupedStructure[]>([]);
  const [feeTypes, setFeeTypes] = useState<FeeType[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Detail view state
  const [selectedStructure, setSelectedStructure] = useState<GroupedStructure | null>(null);
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [editingFeeType, setEditingFeeType] = useState<FeeStructure | null>(null);
  const [editAmount, setEditAmount] = useState<number>(0);

  // Add fee type state
  const [openAddFeeDialog, setOpenAddFeeDialog] = useState(false);
  const [newFeeTypeId, setNewFeeTypeId] = useState<number | ''>('');
  const [newFeeAmount, setNewFeeAmount] = useState<number>(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [feeTypesData, academicYearsData, classesData, structuresData] = await Promise.all([
        feeTypeApi.list({ is_active: true }),
        academicApi.getAcademicYears(),
        academicApi.getClasses(),
        feeStructureApi.list({}),
      ]);

      setFeeTypes(feeTypesData);
      setAcademicYears(academicYearsData);
      setClasses(classesData);
      setFeeStructures(structuresData);

      // Group structures
      groupStructures(structuresData, classesData, academicYearsData);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const groupStructures = (structures: FeeStructure[], classList: Class[], yearList: AcademicYear[]) => {
    // Group by class_id and academic_year_id
    const grouped = new Map<string, FeeStructure[]>();

    structures.forEach(structure => {
      const key = `${structure.class_id}-${structure.academic_year_id}`;
      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key)!.push(structure);
    });

    // Convert to GroupedStructure array
    const result: GroupedStructure[] = [];
    grouped.forEach((structureList, key) => {
      const [classId, yearId] = key.split('-').map(Number);
      const className = classList.find(c => c.id === classId)?.class_name || 'Unknown';
      const yearName = yearList.find(y => y.id === yearId)?.year_name || 'Unknown';

      const totalAmount = structureList.reduce((sum, s) => sum + Number(s.amount), 0);

      result.push({
        id: key,
        name: `${className} - ${yearName}`, // Default name, admin can customize later
        totalAmount,
        structures: structureList,
        classId,
        academicYearId: yearId,
      });
    });

    setGroupedStructures(result);
  };

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleCardClick = (structure: GroupedStructure) => {
    setSelectedStructure(structure);
    setOpenDetailDialog(true);
  };

  const handleCloseDetailDialog = () => {
    setOpenDetailDialog(false);
    setSelectedStructure(null);
    setEditingFeeType(null);
  };

  const handleEditFeeType = (feeType: FeeStructure) => {
    setEditingFeeType(feeType);
    setEditAmount(feeType.amount);
  };

  const handleSaveEdit = async () => {
    if (!editingFeeType) return;

    try {
      await feeStructureApi.update(editingFeeType.id, {
        ...editingFeeType,
        amount: editAmount,
      });
      setEditingFeeType(null);
      loadData(); // Reload to refresh
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update fee type');
    }
  };

  const handleDeleteFeeType = async (feeTypeId: number) => {
    if (!window.confirm('Are you sure you want to remove this fee type from the structure?')) {
      return;
    }

    try {
      await feeStructureApi.delete(feeTypeId);
      loadData(); // Reload to refresh
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete fee type');
    }
  };

  const handleOpenAddFeeDialog = () => {
    setNewFeeTypeId('');
    setNewFeeAmount(0);
    setOpenAddFeeDialog(true);
  };

  const handleCloseAddFeeDialog = () => {
    setOpenAddFeeDialog(false);
    setNewFeeTypeId('');
    setNewFeeAmount(0);
  };

  const handleAddFeeType = async () => {
    if (!selectedStructure || !newFeeTypeId || newFeeAmount <= 0) {
      setError('Please select a fee type and enter a valid amount');
      return;
    }

    try {
      // Create a new fee structure entry matching backend model
      await feeStructureApi.create({
        academic_year_id: selectedStructure.academicYearId,
        class_id: selectedStructure.classId,
        fee_type_id: newFeeTypeId as number,
        amount: newFeeAmount,
        installments: 1,
        late_fee_applicable: false,
        late_fee_amount: 0,
        late_fee_percentage: 0,
        grace_period_days: 0,
        is_active: true,
      });

      handleCloseAddFeeDialog();
      loadData(); // Reload to refresh
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to add fee type');
    }
  };

  const getFeeTypeName = (feeTypeId: number) => {
    return feeTypes.find(ft => ft.id === feeTypeId)?.type_name || 'Unknown';
  };

  // Get available fee types (not already in this structure)
  const getAvailableFeeTypes = () => {
    if (!selectedStructure) return [];
    const usedFeeTypeIds = selectedStructure.structures.map(s => s.fee_type_id);
    return feeTypes.filter(ft => !usedFeeTypeIds.includes(ft.id));
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  // Filter structures based on search query
  const filteredStructures = groupedStructures.filter(structure =>
    structure.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Header */}
      <AppBar position="static" elevation={1}>
        <Toolbar>
          <IconButton
            color="inherit"
            onClick={() => navigate('/admin/fees/dashboard')}
            sx={{ mr: 1 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <SchoolIcon sx={{ mr: 2 }} />
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            {config.schoolName} - Fee Structures Management
          </Typography>
          <Typography variant="body2" sx={{ mr: 2 }}>
            {user?.email}
          </Typography>
          <IconButton size="large" onClick={handleMenu} color="inherit">
            <AccountCircle />
          </IconButton>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
            <MenuItem onClick={() => navigate('/admin/fees/dashboard')}>
              Fee Dashboard
            </MenuItem>
            <MenuItem onClick={() => navigate('/dashboard')}>
              Main Dashboard
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Box sx={{ py: 4, width: '100%', overflow: 'hidden' }}>
        {/* Page Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, px: 2 }}>
          <Typography variant="h4" component="h1" fontWeight={600}>
            Fee Structures
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              // TODO: Implement create new structure
              alert('Create New Structure - To be implemented next');
            }}
          >
            Create New Structure
          </Button>
        </Box>

        {error && (
          <Box sx={{ px: 2, mb: 2 }}>
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          </Box>
        )}

        {/* Search Bar */}
        <Box sx={{ px: 2, mb: 3 }}>
          <Paper sx={{ p: 2 }}>
            <TextField
              fullWidth
              placeholder="Search fee structures by name..."
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
          </Paper>
        </Box>

        {/* Structure Cards Grid */}
        <Box sx={{ px: 2 }}>
          {loading ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography>Loading...</Typography>
            </Box>
          ) : filteredStructures.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography color="text.secondary">
                {searchQuery ? 'No fee structures found matching your search' : 'No fee structures found'}
              </Typography>
            </Paper>
          ) : (
            <Grid container spacing={3} sx={{ width: '100%', m: 0 }}>
              {filteredStructures.map((structure) => (
                <Grid item xs={12} md={6} lg={4} key={structure.id}>
                  <Card
                    sx={{
                      height: '100%',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 4,
                      },
                    }}
                  >
                    <CardActionArea onClick={() => handleCardClick(structure)} sx={{ height: '100%' }}>
                      <CardContent>
                        <Typography variant="h6" gutterBottom fontWeight={600}>
                          {structure.name}
                        </Typography>
                        <Typography variant="h4" color="primary.main" fontWeight={700}>
                          {formatCurrency(structure.totalAmount)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          {structure.structures.length} fee type{structure.structures.length !== 1 ? 's' : ''}
                        </Typography>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      </Box>

      {/* Detail Dialog */}
      <Dialog
        open={openDetailDialog}
        onClose={handleCloseDetailDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">{selectedStructure?.name}</Typography>
            <Typography variant="h5" color="primary.main" fontWeight={600}>
              Total: {selectedStructure && formatCurrency(selectedStructure.totalAmount)}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <List>
            {selectedStructure?.structures.map((structure, index) => (
              <React.Fragment key={structure.id}>
                {index > 0 && <Divider />}
                <ListItem
                  sx={{ py: 2 }}
                  secondaryAction={
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {editingFeeType?.id === structure.id ? (
                        <>
                          <TextField
                            size="small"
                            type="number"
                            value={editAmount}
                            onChange={(e) => setEditAmount(Number(e.target.value))}
                            sx={{ width: 120 }}
                            InputProps={{
                              startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                            }}
                          />
                          <Button size="small" onClick={handleSaveEdit} variant="contained">
                            Save
                          </Button>
                          <Button size="small" onClick={() => setEditingFeeType(null)}>
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <>
                          <IconButton
                            size="small"
                            onClick={() => handleEditFeeType(structure)}
                            color="primary"
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteFeeType(structure.id)}
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </>
                      )}
                    </Box>
                  }
                >
                  <ListItemText
                    primary={getFeeTypeName(structure.fee_type_id)}
                    secondary={
                      <Box component="span" sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                        <Chip
                          label={formatCurrency(structure.amount)}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                        {structure.installments > 1 && (
                          <Chip
                            label={`${structure.installments} Installments`}
                            size="small"
                            variant="outlined"
                          />
                        )}
                      </Box>
                    }
                    secondaryTypographyProps={{ component: 'div' }}
                  />
                </ListItem>
              </React.Fragment>
            ))}
          </List>

          <Box sx={{ mt: 2 }}>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={handleOpenAddFeeDialog}
            >
              Add Fee Type
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetailDialog}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Add Fee Type Dialog */}
      <Dialog open={openAddFeeDialog} onClose={handleCloseAddFeeDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Add Fee Type to Structure</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              select
              label="Fee Type"
              value={newFeeTypeId}
              onChange={(e) => setNewFeeTypeId(Number(e.target.value))}
              required
              fullWidth
              helperText={getAvailableFeeTypes().length === 0 ? 'All fee types already added to this structure' : 'Select a fee type'}
            >
              {getAvailableFeeTypes().map((feeType) => (
                <MenuItem key={feeType.id} value={feeType.id}>
                  {feeType.type_name}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Amount"
              type="number"
              value={newFeeAmount}
              onChange={(e) => setNewFeeAmount(Number(e.target.value))}
              required
              fullWidth
              InputProps={{
                startAdornment: <InputAdornment position="start">₹</InputAdornment>,
              }}
              helperText="Enter the fee amount"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddFeeDialog}>Cancel</Button>
          <Button
            onClick={handleAddFeeType}
            variant="contained"
            color="primary"
            disabled={!newFeeTypeId || newFeeAmount <= 0}
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FeeStructuresPage;
