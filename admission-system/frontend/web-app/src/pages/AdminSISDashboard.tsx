import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  AppBar,
  Toolbar,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Divider,
  CardActionArea,
} from "@mui/material";
import { useAuth } from "../contexts/AuthContext";
import { studentApi } from "../services/sisApi";
import SchoolIcon from "@mui/icons-material/School";
import AccountCircle from "@mui/icons-material/AccountCircle";
import PeopleIcon from "@mui/icons-material/People";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import ListAltIcon from "@mui/icons-material/ListAlt";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import GroupIcon from "@mui/icons-material/Group";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import config from "../config";

interface SISStats {
  totalStudents: number;
  activeStudents: number;
  newAdmissions: number;
  averageAttendance: number;
}

const AdminSISDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<SISStats>({
    totalStudents: 0,
    activeStudents: 0,
    newAdmissions: 0,
    averageAttendance: 0,
  });

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await studentApi.getStudentStats();

      setStats({
        totalStudents: response.total_students || 0,
        activeStudents: response.active_students || 0,
        newAdmissions: response.new_admissions_this_month || 0,
        averageAttendance: response.average_attendance || 0,
      });
    } catch (error) {
      console.error("Failed to load SIS stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      {/* Header */}
      <AppBar position="static" elevation={1}>
        <Toolbar>
          <IconButton
            color="inherit"
            onClick={() => navigate("/dashboard")}
            sx={{ mr: 1 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <SchoolIcon sx={{ mr: 2 }} />
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            {config.schoolName} - Student Information System
          </Typography>
          <Typography variant="body2" sx={{ mr: 2 }}>
            {user?.email}
          </Typography>
          <IconButton size="large" onClick={handleMenu} color="inherit">
            <AccountCircle />
          </IconButton>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
            <MenuItem onClick={() => navigate("/dashboard")}>
              Main Dashboard
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ py: 4, px: { xs: 2, sm: 3, md: 4 } }}>
        {/* Page Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom fontWeight={600} sx={{ display: 'flex', alignItems: 'center' }}>
            <PeopleIcon sx={{ mr: 2, fontSize: 40 }} />
            Student Information System Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Comprehensive student data management and tracking
          </Typography>
        </Box>

        {/* Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Total Students
                    </Typography>
                    <Typography variant="h4" fontWeight={600} color="primary.main">
                      {loading ? "..." : stats.totalStudents}
                    </Typography>
                  </Box>
                  <GroupIcon sx={{ fontSize: 40, color: 'primary.light', opacity: 0.5 }} />
                </Box>
                <Typography variant="caption" color="text.secondary">
                  All enrolled students
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Active Students
                    </Typography>
                    <Typography variant="h4" fontWeight={600} color="success.main">
                      {loading ? "..." : stats.activeStudents}
                    </Typography>
                  </Box>
                  <PeopleIcon sx={{ fontSize: 40, color: 'success.light', opacity: 0.5 }} />
                </Box>
                <Typography variant="caption" color="text.secondary">
                  Currently active
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      New Admissions
                    </Typography>
                    <Typography variant="h4" fontWeight={600} color="info.main">
                      {loading ? "..." : stats.newAdmissions}
                    </Typography>
                  </Box>
                  <PersonAddIcon sx={{ fontSize: 40, color: 'info.light', opacity: 0.5 }} />
                </Box>
                <Typography variant="caption" color="text.secondary">
                  This month
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Avg. Attendance
                    </Typography>
                    <Typography variant="h4" fontWeight={600} color="secondary.main">
                      {loading ? "..." : `${Math.round(stats.averageAttendance)}%`}
                    </Typography>
                  </Box>
                  <TrendingUpIcon sx={{ fontSize: 40, color: 'secondary.light', opacity: 0.5 }} />
                </Box>
                <Typography variant="caption" color="text.secondary">
                  This month
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Quick Actions */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom fontWeight={600}>
            Quick Actions
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card>
                <CardActionArea onClick={() => navigate('/admin/students/create')}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <PersonAddIcon sx={{ fontSize: 48, color: 'primary.main' }} />
                      <Box>
                        <Typography variant="h6" fontWeight={600} gutterBottom>
                          Add New Student
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Register a new student in the system
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card>
                <CardActionArea onClick={() => navigate('/admin/students')}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <ListAltIcon sx={{ fontSize: 48, color: 'success.main' }} />
                      <Box>
                        <Typography variant="h6" fontWeight={600} gutterBottom>
                          View All Students
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Browse and search student records
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card>
                <CardActionArea onClick={() => navigate('/admin/students')}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <FileDownloadIcon sx={{ fontSize: 48, color: 'info.main' }} />
                      <Box>
                        <Typography variant="h6" fontWeight={600} gutterBottom>
                          Export Data
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Download student data as Excel
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          </Grid>
        </Box>

        {/* Student Management Features */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Student Management Features
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ p: 2, bgcolor: 'primary.lighter', borderRadius: 1 }}>
                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                  📋 Personal Information
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Comprehensive student profiles
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ p: 2, bgcolor: 'success.lighter', borderRadius: 1 }}>
                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                  📚 Academic Records
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Grades, exams, and progress tracking
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ p: 2, bgcolor: 'info.lighter', borderRadius: 1 }}>
                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                  ✓ Attendance Tracking
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Daily attendance and reports
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ p: 2, bgcolor: 'warning.lighter', borderRadius: 1 }}>
                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                  🏥 Medical Records
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Health info and medical history
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </Box>
  );
};

export default AdminSISDashboard;
