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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Divider,
  Stack,
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
import CancelIcon from "@mui/icons-material/Cancel";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import PeopleIcon from "@mui/icons-material/People";
import SettingsIcon from "@mui/icons-material/Settings";
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
        page_size: 50, // Load more for admin
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
  const completionRate = stats.total > 0 ? ((stats.decisionMade + stats.enrolled) / stats.total * 100).toFixed(1) : 0;

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
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

      <Container maxWidth="xl" sx={{ py: 4, px: { xs: 2, sm: 3, md: 4 } }}>
        {/* Welcome Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom fontWeight={600}>
            <DashboardIcon sx={{ mr: 1, verticalAlign: "middle" }} />
            Admin Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Comprehensive overview of the admission system
          </Typography>
        </Box>

        {/* Key Metrics Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", color: "white" }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <PeopleIcon sx={{ fontSize: 40 }} />
                  <Box>
                    <Typography variant="h3" fontWeight={600}>
                      {stats.total}
                    </Typography>
                    <Typography variant="body2">Total Applications</Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)", color: "white" }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <PendingActionsIcon sx={{ fontSize: 40 }} />
                  <Box>
                    <Typography variant="h3" fontWeight={600}>
                      {pendingReviewCount}
                    </Typography>
                    <Typography variant="body2">Pending Review</Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)", color: "white" }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <AssignmentIcon sx={{ fontSize: 40 }} />
                  <Box>
                    <Typography variant="h3" fontWeight={600}>
                      {activeCount}
                    </Typography>
                    <Typography variant="body2">Active Process</Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)", color: "white" }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <TrendingUpIcon sx={{ fontSize: 40 }} />
                  <Box>
                    <Typography variant="h3" fontWeight={600}>
                      {completionRate}%
                    </Typography>
                    <Typography variant="body2">Completion Rate</Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Status Breakdown */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                Application Status Distribution
              </Typography>
              <Divider sx={{ mb: 3 }} />
              <Grid container spacing={2}>
                {[
                  { label: "Submitted", value: stats.submitted, color: "info.main" },
                  { label: "Under Review", value: stats.underReview, color: "warning.main" },
                  { label: "Test Scheduled", value: stats.testScheduled, color: "primary.main" },
                  { label: "Test Completed", value: stats.testCompleted, color: "secondary.main" },
                  { label: "Interview Scheduled", value: stats.interviewScheduled, color: "primary.main" },
                  { label: "Decision Made", value: stats.decisionMade, color: "success.main" },
                  { label: "Enrolled", value: stats.enrolled, color: "success.dark" },
                  { label: "Rejected", value: stats.rejected, color: "error.main" },
                ].map((stat) => (
                  <Grid item xs={6} sm={3} key={stat.label}>
                    <Box sx={{ textAlign: "center", p: 2 }}>
                      <Typography variant="h4" fontWeight={600} sx={{ color: stat.color }}>
                        {stat.value}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {stat.label}
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={stats.total > 0 ? (stat.value / stats.total) * 100 : 0}
                        sx={{ mt: 1, height: 6, borderRadius: 1 }}
                        color={stat.color.split(".")[0] as any}
                      />
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, height: "100%" }}>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                Quick Actions
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Stack spacing={2}>
                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  startIcon={<ListIcon />}
                  onClick={() => navigate("/applications")}
                >
                  View All Applications
                </Button>
                <Button
                  variant="outlined"
                  fullWidth
                  size="large"
                  startIcon={<PendingActionsIcon />}
                  onClick={() => navigate("/applications?status=submitted")}
                >
                  Review Pending ({pendingReviewCount})
                </Button>
                <Button
                  variant="outlined"
                  fullWidth
                  size="large"
                  startIcon={<CheckCircleIcon />}
                  color="success"
                >
                  Schedule Tests
                </Button>
                <Button
                  variant="outlined"
                  fullWidth
                  size="large"
                  startIcon={<SettingsIcon />}
                  onClick={() => navigate("/admin/workflow-settings")}
                >
                  Workflow Settings
                </Button>
                <Button
                  variant="outlined"
                  fullWidth
                  size="large"
                  startIcon={<PeopleIcon />}
                  color="info"
                >
                  Schedule Interviews
                </Button>
              </Stack>
            </Paper>
          </Grid>
        </Grid>

        {/* Recent Applications Table */}
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography variant="h6" fontWeight={600}>
              Recent Applications
            </Typography>
            <Button
              variant="text"
              endIcon={<ListIcon />}
              onClick={() => navigate("/applications")}
            >
              View All
            </Button>
          </Box>
          <Divider sx={{ mb: 2 }} />
          {loading ? (
            <Typography>Loading...</Typography>
          ) : applications.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <AssignmentIcon sx={{ fontSize: 60, color: "text.secondary", mb: 2 }} />
              <Typography color="text.secondary">No applications found</Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Application #</strong></TableCell>
                    <TableCell><strong>Student Name</strong></TableCell>
                    <TableCell><strong>Class</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                    <TableCell><strong>Date</strong></TableCell>
                    <TableCell align="right"><strong>Actions</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {applications.slice(0, 10).map((app) => (
                    <TableRow
                      key={app.id}
                      hover
                      sx={{ cursor: "pointer" }}
                      onClick={() => navigate(`/applications/${app.id}`)}
                    >
                      <TableCell>{app.application_number}</TableCell>
                      <TableCell>{app.student_name}</TableCell>
                      <TableCell>{app.class_name}</TableCell>
                      <TableCell>
                        <Chip
                          label={app.application_status?.replace("_", " ").toUpperCase() || "DRAFT"}
                          color={getStatusColor(app.application_status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(app.submitted_at || app.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell align="right">
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/applications/${app.id}`);
                          }}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      </Container>
    </Box>
  );
};

export default AdminDashboard;
