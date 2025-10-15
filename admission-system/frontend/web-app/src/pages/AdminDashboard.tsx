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
  Chip,
  Paper,
  Divider,
  Stack,
  CardActionArea,
} from "@mui/material";
import { useAuth } from "../contexts/AuthContext";
import { admissionApi } from "../services/api";
import type { Application } from "../types";
import SchoolIcon from "@mui/icons-material/School";
import AccountCircle from "@mui/icons-material/AccountCircle";
import ListIcon from "@mui/icons-material/List";
import DashboardIcon from "@mui/icons-material/Dashboard";
import AssignmentIcon from "@mui/icons-material/Assignment";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import PeopleIcon from "@mui/icons-material/People";
import SettingsIcon from "@mui/icons-material/Settings";
import EditNoteIcon from "@mui/icons-material/EditNote";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import config from "../config";

interface DashboardStats {
  total: number;
  draft: number;
  submitted: number;
  underReview: number;
  testScheduled: number;
  testCompleted: number;
  interviewScheduled: number;
  decisionMade: number;
  rejected: number;
  enrolled: number;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    total: 0,
    draft: 0,
    submitted: 0,
    underReview: 0,
    testScheduled: 0,
    testCompleted: 0,
    interviewScheduled: 0,
    decisionMade: 0,
    rejected: 0,
    enrolled: 0,
  });

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      const response = await admissionApi.listApplications({
        page: 1,
        page_size: 100, // Load all for accurate stats
      });
      setApplications(response.applications);

      // Calculate comprehensive stats
      const total = response.total;
      const draft = response.applications.filter((app) => app.application_status === "draft").length;
      const submitted = response.applications.filter((app) => app.application_status === "submitted").length;
      const underReview = response.applications.filter((app) => app.application_status === "under_review").length;
      const testScheduled = response.applications.filter((app) => app.application_status === "test_scheduled").length;
      const testCompleted = response.applications.filter((app) => app.application_status === "test_completed").length;
      const interviewScheduled = response.applications.filter((app) => app.application_status === "interview_scheduled").length;
      const decisionMade = response.applications.filter((app) => app.application_status === "decision_made").length;
      const rejected = response.applications.filter((app) => app.application_status === "rejected").length;
      const enrolled = response.applications.filter((app) => app.application_status === "enrolled").length;

      setStats({
        total,
        draft,
        submitted,
        underReview,
        testScheduled,
        testCompleted,
        interviewScheduled,
        decisionMade,
        rejected,
        enrolled,
      });
    } catch (error) {
      console.error("Failed to load applications:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusClick = (status: string) => {
    navigate(`/applications?status=${status}`);
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

  const getStatusColor = (status: string) => {
    const colors: Record<string, "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning"> = {
      draft: "default",
      submitted: "info",
      under_review: "warning",
      test_scheduled: "primary",
      test_completed: "secondary",
      interview_scheduled: "primary",
      decision_made: "success",
      enrolled: "success",
      rejected: "error",
    };
    return colors[status] || "default";
  };

  const pendingReviewCount = stats.submitted + stats.underReview;
  const activeCount = stats.testScheduled + stats.testCompleted + stats.interviewScheduled;

  return (
    <Box sx={{ width: "100vw",minHeight: "100vh", bgcolor: "background.default" }}>
      {/* Header */}
      <AppBar position="static" elevation={1}>
        <Toolbar>
          <SchoolIcon sx={{ mr: 2 }} />
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            {config.schoolName} - Admin Portal
          </Typography>
          <Typography variant="body2" sx={{ mr: 2 }}>
            {user?.email}
          </Typography>
          <IconButton size="large" onClick={handleMenu} color="inherit">
            <AccountCircle />
          </IconButton>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ justifyContent: "center",  py: 4, px: { xs: 2, sm: 3, md: 4 } }}>
        
        {/* Welcome Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom fontWeight={600}>
            <DashboardIcon sx={{ mr: 1, verticalAlign: "middle" }} />
            Admission Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Comprehensive overview of the admission system
          </Typography>
        </Box>

        {/* Key Metrics Cards - Simple Version */}
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          px: { xs: 2, sm: 4, md: 30 },
          mb: 6
        }}>
          {/* Total Applications */}
          <Box
            onClick={() => navigate('/applications?quickFilter=all')}
            sx={{
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'transform 0.2s, opacity 0.2s',
              '&:hover': {
                transform: 'scale(1.05)',
                opacity: 0.8,
              }
            }}
          >
            <Typography
              fontWeight={600}
              sx={{ color: 'black', mb: 1, fontSize: '6rem', lineHeight: 1 }}
            >
              {stats.total}
            </Typography>
            <Typography variant="body1" color="black">
              Total Applications
            </Typography>
          </Box>

          {/* Pending Review */}
          <Box
            onClick={() => navigate('/applications?quickFilter=pending')}
            sx={{
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'transform 0.2s, opacity 0.2s',
              '&:hover': {
                transform: 'scale(1.05)',
                opacity: 0.8,
              }
            }}
          >
            <Typography
              fontWeight={600}
              sx={{ color: 'red', mb: 1, fontSize: '6rem', lineHeight: 1 }}
            >
              {pendingReviewCount}
            </Typography>
            <Typography variant="body1" color="black">
              Pending Review
            </Typography>
          </Box>

          {/* Active Process */}
          <Box
            onClick={() => navigate('/applications?quickFilter=active')}
            sx={{
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'transform 0.2s, opacity 0.2s',
              '&:hover': {
                transform: 'scale(1.05)',
                opacity: 0.8,
              }
            }}
          >
            <Typography
              fontWeight={600}
              sx={{ color: 'orange', mb: 1, fontSize: '6rem', lineHeight: 1 }}
            >
              {activeCount}
            </Typography>
            <Typography variant="body1" color="black">
              Active Process
            </Typography>
          </Box>
        </Box>

        {/* Application Workflow Pipeline */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom fontWeight={600}>
            Application Workflow Pipeline
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Click on any stage to view applications
          </Typography>

          <Paper sx={{ p: 3 }}>
            <Stack direction="row" spacing={0} alignItems="center" sx={{ overflowX: 'auto' }}>
              {/* Submitted */}
              <Box
                onClick={() => handleStatusClick('submitted')}
                sx={{
                  flex: 1,
                  textAlign: 'center',
                  cursor: 'pointer',
                  py: 2,
                  px: 1,
                  transition: 'all 0.2s',
                  '&:hover': {
                    transform: 'scale(1.05)',
                  },
                }}
              >
                <AssignmentIcon sx={{ fontSize: 32, mb: 1, color: 'info.main' }} />
                <Box
                  sx={{
                    display: 'inline-block',
                    bgcolor: stats.submitted > 0 ? 'info.main' : 'grey.300',
                    color: 'white',
                    px: 2,
                    py: 0.5,
                    borderRadius: 2,
                    mb: 1,
                  }}
                >
                  <Typography variant="h4" fontWeight={700}>
                    {stats.submitted}
                  </Typography>
                </Box>
                <Typography variant="caption" fontWeight={600} display="block">
                  Submitted
                </Typography>
              </Box>

              <Box sx={{ px: 1, color: 'text.secondary', fontSize: 24 }}>→</Box>

              {/* Under Review */}
              <Box
                onClick={() => handleStatusClick('under_review')}
                sx={{
                  flex: 1,
                  textAlign: 'center',
                  cursor: 'pointer',
                  py: 2,
                  px: 1,
                  transition: 'all 0.2s',
                  '&:hover': {
                    transform: 'scale(1.05)',
                  },
                }}
              >
                <PendingActionsIcon sx={{ fontSize: 32, mb: 1, color: 'warning.main' }} />
                <Box
                  sx={{
                    display: 'inline-block',
                    bgcolor: stats.underReview > 0 ? 'warning.main' : 'grey.300',
                    color: 'white',
                    px: 2,
                    py: 0.5,
                    borderRadius: 2,
                    mb: 1,
                  }}
                >
                  <Typography variant="h4" fontWeight={700}>
                    {stats.underReview}
                  </Typography>
                </Box>
                <Typography variant="caption" fontWeight={600} display="block">
                  Under Review
                </Typography>
              </Box>

              <Box sx={{ px: 1, color: 'text.secondary', fontSize: 24 }}>→</Box>

              {/* Tests */}
              <Box
                onClick={() => handleStatusClick('test_scheduled')}
                sx={{
                  flex: 1,
                  textAlign: 'center',
                  cursor: 'pointer',
                  py: 2,
                  px: 1,
                  transition: 'all 0.2s',
                  '&:hover': {
                    transform: 'scale(1.05)',
                  },
                }}
              >
                <AssignmentIcon sx={{ fontSize: 32, mb: 1, color: 'primary.main' }} />
                <Box
                  sx={{
                    display: 'inline-block',
                    bgcolor: stats.testScheduled > 0 ? 'primary.main' : 'grey.300',
                    color: 'white',
                    px: 2,
                    py: 0.5,
                    borderRadius: 2,
                    mb: 1,
                  }}
                >
                  <Typography variant="h4" fontWeight={700}>
                    {stats.testScheduled}
                  </Typography>
                </Box>
                <Typography variant="caption" fontWeight={600} display="block">
                  Tests
                </Typography>
              </Box>

              <Box sx={{ px: 1, color: 'text.secondary', fontSize: 24 }}>→</Box>

              {/* Interviews */}
              <Box
                onClick={() => handleStatusClick('interview_scheduled')}
                sx={{
                  flex: 1,
                  textAlign: 'center',
                  cursor: 'pointer',
                  py: 2,
                  px: 1,
                  transition: 'all 0.2s',
                  '&:hover': {
                    transform: 'scale(1.05)',
                  },
                }}
              >
                <PeopleIcon sx={{ fontSize: 32, mb: 1, color: 'secondary.main' }} />
                <Box
                  sx={{
                    display: 'inline-block',
                    bgcolor: stats.interviewScheduled > 0 ? 'secondary.main' : 'grey.300',
                    color: 'white',
                    px: 2,
                    py: 0.5,
                    borderRadius: 2,
                    mb: 1,
                  }}
                >
                  <Typography variant="h4" fontWeight={700}>
                    {stats.interviewScheduled}
                  </Typography>
                </Box>
                <Typography variant="caption" fontWeight={600} display="block">
                  Interviews
                </Typography>
              </Box>

              <Box sx={{ px: 1, color: 'text.secondary', fontSize: 24 }}>→</Box>

              {/* Decision */}
              <Box
                onClick={() => handleStatusClick('decision_made')}
                sx={{
                  flex: 1,
                  textAlign: 'center',
                  cursor: 'pointer',
                  py: 2,
                  px: 1,
                  transition: 'all 0.2s',
                  '&:hover': {
                    transform: 'scale(1.05)',
                  },
                }}
              >
                <CheckCircleIcon sx={{ fontSize: 32, mb: 1, color: 'success.main' }} />
                <Box
                  sx={{
                    display: 'inline-block',
                    bgcolor: stats.decisionMade > 0 ? 'success.main' : 'grey.300',
                    color: 'white',
                    px: 2,
                    py: 0.5,
                    borderRadius: 2,
                    mb: 1,
                  }}
                >
                  <Typography variant="h4" fontWeight={700}>
                    {stats.decisionMade}
                  </Typography>
                </Box>
                <Typography variant="caption" fontWeight={600} display="block">
                  Decision
                </Typography>
              </Box>
            </Stack>

        
          </Paper>
        </Box>

        {/* Management Tools */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom fontWeight={600}>
            Management Tools
          </Typography>
          <Grid container spacing={2}>

            {/* Applications Management */}
            <Grid item xs={12} sm={6} md={4}>
              <Card>
                <CardActionArea onClick={() => navigate('/applications')}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <ListIcon color="action" />
                      <Typography color="text.secondary" fontWeight={500}>Applications</Typography>
                    </Box>
                    <Typography variant="body1" fontWeight={600} sx={{ mt: 1 }}>
                      View All Applications
                    </Typography>
                    <Typography variant="caption" color="text.secondary">Click to review and manage all applications</Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>

            {/* Workflow Settings */}
            <Grid item xs={12} sm={6} md={4}>
              <Card>
                <CardActionArea onClick={() => navigate('/admin/workflow-settings')}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <SettingsIcon color="action" />
                      <Typography color="text.secondary" fontWeight={500}>Workflow Settings</Typography>
                    </Box>
                    <Typography variant="body1" fontWeight={600} sx={{ mt: 1 }}>
                      Configure Steps
                    </Typography>
                    <Typography variant="caption" color="text.secondary">Click to manage admission workflow</Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>

            {/* Form Builder */}
            <Grid item xs={12} sm={6} md={4}>
              <Card>
                <CardActionArea onClick={() => navigate('/admin/forms')}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <EditNoteIcon color="action" />
                      <Typography color="text.secondary" fontWeight={500}>Form Builder</Typography>
                    </Box>
                    <Typography variant="body1" fontWeight={600} sx={{ mt: 1 }}>
                      Manage Forms
                    </Typography>
                    <Typography variant="caption" color="text.secondary">Click to view and configure application forms</Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>

            {/* Fee Management Dashboard */}
            <Grid item xs={12} sm={6} md={4}>
              <Card sx={{ bgcolor: 'primary.lighter', borderLeft: 4, borderColor: 'primary.main' }}>
                <CardActionArea onClick={() => navigate('/admin/fees/dashboard')}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <AccountBalanceWalletIcon sx={{ color: 'primary.main' }} />
                      <Typography color="primary.main" fontWeight={600}>Fee Management</Typography>
                    </Box>
                    <Typography variant="body1" fontWeight={600} sx={{ mt: 1 }}>
                      Fee Dashboard
                    </Typography>
                    <Typography variant="caption" color="text.secondary">Click to manage fees and payments</Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </Box>
  );
};

export default AdminDashboard;
