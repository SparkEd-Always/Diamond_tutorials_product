/**
 * Parent Application List Page - Simple view for parents to see their applications
 */
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Chip,
  IconButton,
  Stack,
  CircularProgress,
  Alert,
  Divider,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Add as AddIcon,
  Visibility as ViewIcon,
  Schedule as ClockIcon,
  CheckCircle as CheckIcon,
  Cancel as RejectIcon,
} from '@mui/icons-material';
import { useNotification } from '../contexts/NotificationContext';
import { admissionApi } from '../services/api';
import type { Application } from '../types';

const ParentApplicationListPage: React.FC = () => {
  const navigate = useNavigate();
  const { showError } = useNotification();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    setLoading(true);
    try {
      const response = await admissionApi.listApplications({ page: 1, page_size: 100 });
      setApplications(response.applications);
    } catch (error: any) {
      showError(error.response?.data?.detail || 'Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, any> = {
      draft: 'default',
      submitted: 'info',
      under_review: 'warning',
      test_scheduled: 'primary',
      test_completed: 'primary',
      interview_scheduled: 'primary',
      interview_completed: 'primary',
      decision_made: 'success',
      accepted: 'success',
      enrolled: 'success',
      rejected: 'error',
      waitlisted: 'warning',
    };
    return colors[status] || 'default';
  };

  const getStatusIcon = (status: string) => {
    if (status === 'rejected') return <RejectIcon fontSize="small" />;
    if (status === 'accepted' || status === 'enrolled' || status === 'decision_made') return <CheckIcon fontSize="small" />;
    return <ClockIcon fontSize="small" />;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not submitted';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Box width="100vw" sx={{ py: 4, px: { xs: 2, sm: 3, md: 4 } }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <IconButton onClick={() => navigate('/dashboard')} sx={{ mr: 2 }}>
            <BackIcon />
          </IconButton>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h4" fontWeight={600}>
              My Applications
            </Typography>
            <Typography variant="body2" color="text.secondary">
              View and manage your admission applications
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/applications/new')}
            size="large"
          >
            New Application
          </Button>
        </Box>
      </Box>

      {/* Applications List */}
      {applications.length === 0 ? (
        <Card sx={{ textAlign: 'center', py: 8 }}>
          <CardContent>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No applications yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Start your admission process by creating a new application
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/applications/new')}
            >
              Create Application
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Stack spacing={2}>
          {applications.map((app) => (
            <Card
              key={app.id}
              sx={{
                transition: 'all 0.2s',
                '&:hover': {
                  boxShadow: 4,
                  transform: 'translateY(-2px)',
                },
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      Application #{app.application_number}
                    </Typography>
                    <Typography variant="h6" fontWeight={600} sx={{ mt: 0.5 }}>
                      {app.student_name || 'Draft Application'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {app.class_name ? `Applying for ${app.class_name}` : 'Class not specified'}
                    </Typography>
                  </Box>
                  <Chip
                    icon={getStatusIcon(app.application_status)}
                    label={app.application_status?.replace('_', ' ').toUpperCase() || 'DRAFT'}
                    color={getStatusColor(app.application_status)}
                    sx={{ ml: 2 }}
                  />
                </Box>

                <Divider sx={{ my: 2 }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Submitted: {formatDate(app.submission_date)}
                    </Typography>
                    {app.updated_at && (
                      <Typography variant="caption" color="text.secondary" display="block">
                        Last updated: {formatDate(app.updated_at)}
                      </Typography>
                    )}
                  </Box>
                  <Button
                    variant="outlined"
                    startIcon={<ViewIcon />}
                    onClick={() => navigate(`/applications/${app.id}`)}
                  >
                    View Details
                  </Button>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}

      {/* Helper Alert */}
      {applications.length > 0 && (
        <Alert severity="info" sx={{ mt: 3 }}>
          <Typography variant="body2">
            <strong>Need help?</strong> Contact the admissions office if you have questions about your application status.
          </Typography>
        </Alert>
      )}
    </Box>
  );
};

export default ParentApplicationListPage;
