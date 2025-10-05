import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { admissionApi } from '../services/api';
import type { Application } from '../types';
import SchoolIcon from '@mui/icons-material/School';
import AccountCircle from '@mui/icons-material/AccountCircle';
import AddIcon from '@mui/icons-material/Add';
import ListIcon from '@mui/icons-material/List';
import DashboardIcon from '@mui/icons-material/Dashboard';
import config from '../config';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user, logout, isAdmin, isParent } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    draft: 0,
    submitted: 0,
    underReview: 0,
  });

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      const response = await admissionApi.listApplications({ page: 1, page_size: 10 });
      setApplications(response.applications);

      // Calculate stats
      const total = response.total;
      const draft = response.applications.filter(app => app.application_status === 'draft').length;
      const submitted = response.applications.filter(app => app.application_status === 'submitted').length;
      const underReview = response.applications.filter(app => app.application_status === 'under_review').length;

      setStats({ total, draft, submitted, underReview });
    } catch (error) {
      console.error('Failed to load applications:', error);
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
    navigate('/login');
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: 'default',
      submitted: 'info',
      under_review: 'warning',
      enrolled: 'success',
      rejected: 'error',
    };
    return colors[status] || 'default';
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
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
          <IconButton
            size="large"
            onClick={handleMenu}
            color="inherit"
          >
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
            <DashboardIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Welcome back! Here's an overview of your {isAdmin ? 'admission system' : 'applications'}.
          </Typography>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Total Applications
                </Typography>
                <Typography variant="h3" fontWeight={600}>
                  {stats.total}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Draft
                </Typography>
                <Typography variant="h3" fontWeight={600} color="text.secondary">
                  {stats.draft}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Submitted
                </Typography>
                <Typography variant="h3" fontWeight={600} color="info.main">
                  {stats.submitted}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Under Review
                </Typography>
                <Typography variant="h3" fontWeight={600} color="warning.main">
                  {stats.underReview}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Action Buttons */}
        <Box sx={{ mb: 4 }}>
          <Grid container spacing={2}>
            {isParent && (
              <Grid item>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => navigate('/apply')}
                  size="large"
                >
                  New Application
                </Button>
              </Grid>
            )}
            <Grid item>
              <Button
                variant="outlined"
                startIcon={<ListIcon />}
                onClick={() => navigate('/applications')}
                size="large"
              >
                View All Applications
              </Button>
            </Grid>
          </Grid>
        </Box>

        {/* Recent Applications */}
        <Box>
          <Typography variant="h6" gutterBottom fontWeight={600}>
            Recent Applications
          </Typography>
          {loading ? (
            <Typography>Loading...</Typography>
          ) : applications.length === 0 ? (
            <Card sx={{ p: 4, textAlign: 'center' }}>
              <Typography color="text.secondary" paragraph>
                No applications found
              </Typography>
              {isParent && (
                <Button variant="contained" onClick={() => navigate('/apply')}>
                  Create Your First Application
                </Button>
              )}
            </Card>
          ) : (
            <Grid container spacing={2}>
              {applications.slice(0, 5).map((app) => (
                <Grid item xs={12} key={app.id}>
                  <Card
                    sx={{
                      cursor: 'pointer',
                      transition: 'transform 0.2s',
                      '&:hover': { transform: 'translateX(4px)' },
                    }}
                    onClick={() => navigate(`/applications/${app.id}`)}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                          <Typography variant="h6" fontWeight={600}>
                            {app.application_number}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {app.student_name} • {app.class_name}
                          </Typography>
                        </Box>
                        <Chip
                          label={app.application_status.replace('_', ' ').toUpperCase()}
                          color={getStatusColor(app.application_status) as any}
                          size="small"
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      </Container>
    </Box>
  );
};

export default DashboardPage;
