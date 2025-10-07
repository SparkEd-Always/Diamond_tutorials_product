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
  CardActionArea,
  Chip,
} from "@mui/material";
import { useAuth } from "../contexts/AuthContext";
import { admissionApi } from "../services/api";
import type { Application } from "../types";
import SchoolIcon from "@mui/icons-material/School";
import AccountCircle from "@mui/icons-material/AccountCircle";
import AddIcon from "@mui/icons-material/Add";
import ListIcon from "@mui/icons-material/List";
import DashboardIcon from "@mui/icons-material/Dashboard";
import AssignmentIcon from "@mui/icons-material/Assignment";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import config from "../config";

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user, logout, isAdmin, isParent } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    draft: 0,
    submitted: 0,
    underReview: 0,
    approved: 0,
    rejected: 0,
  });

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      const response = await admissionApi.listApplications({
        page: 1,
        page_size: 100, // Get all for accurate stats
      });

      // Calculate stats
      const total = response.total;
      const draft = response.applications.filter(
        (app) => app.application_status === "draft"
      ).length;
      const submitted = response.applications.filter(
        (app) => app.application_status === "submitted"
      ).length;
      const underReview = response.applications.filter(
        (app) => app.application_status === "under_review"
      ).length;
      const approved = response.applications.filter(
        (app) => app.application_status === "decision_made" || app.application_status === "approved"
      ).length;
      const rejected = response.applications.filter(
        (app) => app.application_status === "rejected"
      ).length;

      setStats({ total, draft, submitted, underReview, approved, rejected });
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


  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      {/* Header */}
      <AppBar position="static" elevation={1}>
        <Toolbar>
          <SchoolIcon sx={{ mr: 2 }} />
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            {config.schoolName}
          </Typography>
          <Typography variant="body2" sx={{ mr: 2 }}>
            {user?.email}
          </Typography>
          <IconButton size="large" onClick={handleMenu} color="inherit">
            <AccountCircle />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ py: 4, px: { xs: 2, sm: 3, md: 4 } }}>
        {/* Welcome Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom fontWeight={600}>
            <DashboardIcon sx={{ mr: 1, verticalAlign: "middle" }} />
            Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Welcome back! Here's an overview of your{" "}
            {isAdmin ? "admission system" : "applications"}.
          </Typography>
        </Box>

        {/* Action Overview Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom fontWeight={600}>
            Application Status Overview
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Click on any status to view and take action on applications
          </Typography>

          <Grid container spacing={2}>
            {/* Total Applications */}
            <Grid item xs={12} sm={6} md={4}>
              <Card sx={{ height: '100%' }}>
                <CardActionArea onClick={() => navigate('/applications')}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <ListIcon color="action" />
                      <Typography color="text.secondary" fontWeight={500}>
                        Total Applications
                      </Typography>
                    </Box>
                    <Typography variant="h3" fontWeight={600}>
                      {stats.total}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Click to view all applications
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>

            {/* Needs Review */}
            <Grid item xs={12} sm={6} md={4}>
              <Card sx={{ height: '100%', bgcolor: 'warning.light', color: 'warning.contrastText' }}>
                <CardActionArea onClick={() => handleStatusClick('under_review')}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <PendingActionsIcon />
                      <Typography fontWeight={500}>
                        Needs Review
                      </Typography>
                    </Box>
                    <Typography variant="h3" fontWeight={600}>
                      {stats.underReview}
                    </Typography>
                    <Typography variant="caption">
                      Click to review pending applications
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>

            {/* Submitted - Needs Action */}
            <Grid item xs={12} sm={6} md={4}>
              <Card sx={{ height: '100%', bgcolor: 'info.light', color: 'info.contrastText' }}>
                <CardActionArea onClick={() => handleStatusClick('submitted')}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <AssignmentIcon />
                      <Typography fontWeight={500}>
                        New Submissions
                      </Typography>
                    </Box>
                    <Typography variant="h3" fontWeight={600}>
                      {stats.submitted}
                    </Typography>
                    <Typography variant="caption">
                      Click to start review process
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>

            {/* Approved */}
            <Grid item xs={12} sm={6} md={4}>
              <Card sx={{ height: '100%' }}>
                <CardActionArea onClick={() => handleStatusClick('decision_made')}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <CheckCircleIcon color="success" />
                      <Typography color="text.secondary" fontWeight={500}>
                        Approved
                      </Typography>
                    </Box>
                    <Typography variant="h3" fontWeight={600} color="success.main">
                      {stats.approved}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Click to view approved applications
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>

            {/* Rejected */}
            <Grid item xs={12} sm={6} md={4}>
              <Card sx={{ height: '100%' }}>
                <CardActionArea onClick={() => handleStatusClick('rejected')}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <ErrorIcon color="error" />
                      <Typography color="text.secondary" fontWeight={500}>
                        Rejected
                      </Typography>
                    </Box>
                    <Typography variant="h3" fontWeight={600} color="error.main">
                      {stats.rejected}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Click to view rejected applications
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>

            {/* Assign Tasks - Coming Soon */}
            <Grid item xs={12} sm={6} md={4}>
              <Card sx={{ height: '100%', bgcolor: 'grey.100', position: 'relative' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <AssignmentIcon color="disabled" />
                    <Typography color="text.secondary" fontWeight={500}>
                      Assign Tasks
                    </Typography>
                  </Box>
                  <Chip
                    label="COMING SOON"
                    size="small"
                    color="primary"
                    sx={{ mt: 1 }}
                  />
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 2 }}>
                    Delegate application reviews to team members
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>

        {/* Quick Actions */}
        {isParent && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              Quick Actions
            </Typography>
            <Grid container spacing={2}>
              <Grid item>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => navigate("/apply")}
                  size="large"
                >
                  New Application
                </Button>
              </Grid>
              <Grid item>
                <Button
                  variant="outlined"
                  startIcon={<ListIcon />}
                  onClick={() => navigate("/applications")}
                  size="large"
                >
                  View All Applications
                </Button>
              </Grid>
            </Grid>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default DashboardPage;
