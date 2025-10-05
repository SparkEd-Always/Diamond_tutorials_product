import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  AppBar,
  Toolbar,
  IconButton,
  Paper,
  Grid,
  Chip,
  Divider,
  Button,
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  Card,
  CardContent,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { admissionApi } from '../services/api';
import { DetailsSkeleton } from '../components/common/SkeletonLoader';
import DocumentUpload from '../components/common/DocumentUpload';
import type { ApplicationDetails } from '../types';
import SchoolIcon from '@mui/icons-material/School';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const ApplicationDetailsPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { isAdmin } = useAuth();
  const { showError } = useNotification();
  const [application, setApplication] = useState<ApplicationDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadApplication(parseInt(id));
    }
  }, [id]);

  const loadApplication = async (applicationId: number) => {
    try {
      const data = await admissionApi.getApplication(applicationId);
      setApplication(data);
    } catch (error: any) {
      showError(error.response?.data?.detail || 'Failed to load application');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, any> = {
      draft: 'default',
      submitted: 'info',
      under_review: 'warning',
      enrolled: 'success',
      rejected: 'error',
    };
    return colors[status] || 'default';
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        <AppBar position="static" elevation={1}>
          <Toolbar>
            <IconButton edge="start" color="inherit" onClick={() => navigate('/applications')}>
              <ArrowBackIcon />
            </IconButton>
            <SchoolIcon sx={{ mr: 2 }} />
            <Typography variant="h6">Application Details</Typography>
          </Toolbar>
        </AppBar>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <DetailsSkeleton />
        </Container>
      </Box>
    );
  }

  if (!application) {
    return <Box sx={{ p: 4 }}>Application not found</Box>;
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Header */}
      <AppBar position="static" elevation={1}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={() => navigate('/applications')}>
            <ArrowBackIcon />
          </IconButton>
          <SchoolIcon sx={{ mr: 2 }} />
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Application Details
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Application Header */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box>
              <Typography variant="h5" fontWeight={600} gutterBottom>
                {application.application.application_number}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Submitted: {formatDate(application.application.submission_date)}
              </Typography>
            </Box>
            <Chip
              label={application.application.application_status.replace('_', ' ').toUpperCase()}
              color={getStatusColor(application.application.application_status)}
              size="large"
            />
          </Box>
        </Paper>

        <Grid container spacing={3}>
          {/* Student Information */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom fontWeight={600}>
                  Student Information
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Full Name
                    </Typography>
                    <Typography variant="body1">
                      {application.student.first_name} {application.student.last_name}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Date of Birth
                    </Typography>
                    <Typography variant="body1">
                      {formatDate(application.student.date_of_birth)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Gender
                    </Typography>
                    <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
                      {application.student.gender}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Blood Group
                    </Typography>
                    <Typography variant="body1">
                      {application.student.blood_group || '-'}
                    </Typography>
                  </Grid>
                  {application.student.medical_conditions && (
                    <Grid item xs={12}>
                      <Typography variant="caption" color="text.secondary">
                        Medical Conditions
                      </Typography>
                      <Typography variant="body1">
                        {application.student.medical_conditions}
                      </Typography>
                    </Grid>
                  )}
                  {application.student.previous_school && (
                    <Grid item xs={12}>
                      <Typography variant="caption" color="text.secondary">
                        Previous School
                      </Typography>
                      <Typography variant="body1">
                        {application.student.previous_school}
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Parent Information */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom fontWeight={600}>
                  Parent Information
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary">
                      Full Name
                    </Typography>
                    <Typography variant="body1">
                      {application.parent.first_name} {application.parent.last_name}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Email
                    </Typography>
                    <Typography variant="body1">
                      {application.parent.email}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Phone
                    </Typography>
                    <Typography variant="body1">
                      {application.parent.phone}
                    </Typography>
                  </Grid>
                  {application.parent.occupation && (
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">
                        Occupation
                      </Typography>
                      <Typography variant="body1">
                        {application.parent.occupation}
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Academic Information */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom fontWeight={600}>
                  Academic Information
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Class Applying For
                    </Typography>
                    <Typography variant="body1">
                      {application.academic.class_name || '-'}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Academic Year
                    </Typography>
                    <Typography variant="body1">
                      {application.academic.academic_year || '-'}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Document Upload Section */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom fontWeight={600}>
                  Upload Documents
                </Typography>
                <Divider sx={{ my: 2 }} />
                <DocumentUpload
                  applicationId={application.application.id}
                  documentTypeId={1}
                  multiple={true}
                />
              </CardContent>
            </Card>
          </Grid>

          {/* Status History */}
          {application.status_history && application.status_history.length > 0 && (
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom fontWeight={600}>
                    Status History
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  <Timeline position="right">
                    {application.status_history.map((history, index) => (
                      <TimelineItem key={index}>
                        <TimelineSeparator>
                          <TimelineDot color="primary" />
                          {index < application.status_history.length - 1 && <TimelineConnector />}
                        </TimelineSeparator>
                        <TimelineContent>
                          <Typography variant="body2" fontWeight={600}>
                            {history.new_status.replace('_', ' ').toUpperCase()}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(history.change_date)}
                          </Typography>
                          {history.change_reason && (
                            <Typography variant="body2" color="text.secondary">
                              {history.change_reason}
                            </Typography>
                          )}
                        </TimelineContent>
                      </TimelineItem>
                    ))}
                  </Timeline>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>

        {/* Actions */}
        {isAdmin && (
          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button variant="contained" color="success">
              Approve
            </Button>
            <Button variant="outlined" color="error">
              Reject
            </Button>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default ApplicationDetailsPage;
