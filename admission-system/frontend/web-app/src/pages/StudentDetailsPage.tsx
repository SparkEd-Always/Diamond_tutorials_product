import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Paper,
  AppBar,
  Toolbar,
  IconButton,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Grid,
  Avatar,
  Chip,
  Divider,
  Button,
  Stack,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { studentApi } from '../services/sisApi';
import type { Student } from '../types/student';
import SchoolIcon from '@mui/icons-material/School';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import PersonIcon from '@mui/icons-material/Person';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import EventIcon from '@mui/icons-material/Event';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import FolderIcon from '@mui/icons-material/Folder';
import config from '../config';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`student-tabpanel-${index}`}
      aria-labelledby={`student-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const StudentDetailsPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    if (id) {
      loadStudentDetails();
    }
  }, [id]);

  const loadStudentDetails = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const data = await studentApi.getStudent(id);
      setStudent(data);
      setError(null);
    } catch (err: any) {
      console.error('Failed to load student details:', err);
      setError(err.response?.data?.message || 'Failed to load student details');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const getStatusColor = (status: string): 'success' | 'info' | 'warning' | 'error' | 'default' => {
    switch (status) {
      case 'Active':
        return 'success';
      case 'Alumni':
        return 'info';
      case 'Transferred':
        return 'warning';
      case 'Expelled':
      case 'Withdrawn':
        return 'error';
      default:
        return 'default';
    }
  };

  if (loading) {
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

  if (error || !student) {
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
        <Container maxWidth="md" sx={{ py: 4 }}>
          <Alert severity="error">{error || 'Student not found'}</Alert>
        </Container>
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
            {config.schoolName} - Student Profile
          </Typography>
          <Typography variant="body2" sx={{ mr: 2 }}>
            {user?.email}
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ py: 4, px: { xs: 2, sm: 3, md: 4 } }}>
        {/* Student Header Card */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item>
              <Avatar
                src={student.photo_url || undefined}
                alt={student.full_name}
                sx={{ width: 120, height: 120 }}
              >
                {student.first_name[0]}{student.last_name[0]}
              </Avatar>
            </Grid>
            <Grid item xs>
              <Typography variant="h4" fontWeight={600} gutterBottom>
                {student.full_name}
              </Typography>
              <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                <Chip label={student.student_status} color={getStatusColor(student.student_status)} />
                <Chip label={student.gender} variant="outlined" />
                <Chip label={`Age: ${student.age} years`} variant="outlined" />
              </Stack>
              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}>
                  <Typography variant="caption" color="text.secondary">
                    Admission No
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {student.admission_number}
                  </Typography>
                </Grid>
                {student.roll_number && (
                  <Grid item xs={6} sm={3}>
                    <Typography variant="caption" color="text.secondary">
                      Roll No
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {student.roll_number}
                    </Typography>
                  </Grid>
                )}
                <Grid item xs={6} sm={3}>
                  <Typography variant="caption" color="text.secondary">
                    Class/Section
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {student.current_class_name || '-'}
                    {student.current_section_name && ` / ${student.current_section_name}`}
                  </Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="caption" color="text.secondary">
                    Profile Completeness
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {student.profile_completeness_percentage}%
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
            <Grid item>
              <Button
                variant="contained"
                startIcon={<EditIcon />}
                onClick={() => navigate(`/admin/students/${student.id}/edit`)}
              >
                Edit Profile
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Tabs */}
        <Paper>
          <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
            <Tab icon={<PersonIcon />} label="Personal Info" />
            <Tab icon={<MenuBookIcon />} label="Academic" />
            <Tab icon={<EventIcon />} label="Attendance" />
            <Tab icon={<LocalHospitalIcon />} label="Medical" />
            <Tab icon={<EmojiEventsIcon />} label="Activities" />
            <Tab icon={<FolderIcon />} label="Documents" />
          </Tabs>
          <Divider />

          {/* Tab 0: Personal Info */}
          <TabPanel value={tabValue} index={0}>
            <Grid container spacing={3}>
              {/* Basic Information */}
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      Basic Information
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemText
                          primary="Full Name"
                          secondary={student.full_name}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Date of Birth"
                          secondary={formatDate(student.date_of_birth)}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Gender"
                          secondary={student.gender}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Blood Group"
                          secondary={student.blood_group || '-'}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Nationality"
                          secondary={student.nationality}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Religion"
                          secondary={student.religion || '-'}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Caste Category"
                          secondary={student.caste_category || '-'}
                        />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>

              {/* Government IDs & Academic Info */}
              <Grid item xs={12} md={6}>
                <Card sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      Government IDs
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemText
                          primary="Aadhar Number"
                          secondary={student.aadhar_number || 'Not provided'}
                        />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      Academic Information
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemText
                          primary="Current Class"
                          secondary={student.current_class_name || '-'}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Current Section"
                          secondary={student.current_section_name || '-'}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="House"
                          secondary={student.house_name || '-'}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Admission Date"
                          secondary={formatDate(student.admission_date)}
                        />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Tab 1: Academic */}
          <TabPanel value={tabValue} index={1}>
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <MenuBookIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                Academic Records
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Academic records will be displayed here
              </Typography>
            </Box>
          </TabPanel>

          {/* Tab 2: Attendance */}
          <TabPanel value={tabValue} index={2}>
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <EventIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                Attendance Records
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Attendance records will be displayed here
              </Typography>
            </Box>
          </TabPanel>

          {/* Tab 3: Medical */}
          <TabPanel value={tabValue} index={3}>
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <LocalHospitalIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                Medical Records
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Medical records will be displayed here
              </Typography>
            </Box>
          </TabPanel>

          {/* Tab 4: Activities */}
          <TabPanel value={tabValue} index={4}>
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <EmojiEventsIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                Activities & Achievements
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Activities and achievements will be displayed here
              </Typography>
            </Box>
          </TabPanel>

          {/* Tab 5: Documents */}
          <TabPanel value={tabValue} index={5}>
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <FolderIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                Documents
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Student documents will be displayed here
              </Typography>
            </Box>
          </TabPanel>
        </Paper>
      </Container>
    </Box>
  );
};

export default StudentDetailsPage;
