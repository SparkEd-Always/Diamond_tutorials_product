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
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { admissionApi } from '../services/api';
import { DetailsSkeleton } from '../components/common/SkeletonLoader';
import DocumentUpload from '../components/common/DocumentUpload';
import type { ApplicationDetails } from '../types';
import SchoolIcon from '@mui/icons-material/School';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PersonIcon from '@mui/icons-material/Person';
import FamilyRestroomIcon from '@mui/icons-material/FamilyRestroom';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import DescriptionIcon from '@mui/icons-material/Description';
import HistoryIcon from '@mui/icons-material/History';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import UploadFileIcon from '@mui/icons-material/UploadFile';

const ParentApplicationDetailsPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { showError, showNotification } = useNotification();
  const [application, setApplication] = useState<ApplicationDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

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

  const handleContinueFilling = () => {
    if (!id) return;
    navigate(`/apply/${id}`);
  };

  const handleDeleteApplication = async () => {
    if (!id) return;
    try {
      await admissionApi.deleteApplication(parseInt(id));
      showNotification('Application deleted successfully', 'success');
      navigate('/applications');
    } catch (error: any) {
      showError(error.response?.data?.detail || 'Failed to delete application');
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  const handleUploadDocuments = () => {
    const documentsSection = document.getElementById('documents-section');
    if (documentsSection) {
      documentsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, any> = {
      draft: 'default',
      submitted: 'info',
      under_review: 'warning',
      test_scheduled: 'warning',
      test_completed: 'info',
      interview_scheduled: 'warning',
      interview_completed: 'info',
      decision_made: 'primary',
      accepted: 'success',
      enrolled: 'success',
      rejected: 'error',
    };
    return colors[status] || 'default';
  };

  const InfoField = ({ label, value }: { label: string; value: string | null | undefined }) => (
    <Box sx={{ mb: 2 }}>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
        {label}
      </Typography>
      <Typography variant="body1" fontWeight={500}>
        {value || '-'}
      </Typography>
    </Box>
  );

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
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
        <Box sx={{ py: 4, width: '100%', overflow: 'hidden' }}>
          <Box sx={{ px: 2 }}>
            <DetailsSkeleton />
          </Box>
        </Box>
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
            My Application
          </Typography>
        </Toolbar>
      </AppBar>

      <Box sx={{ py: 4, width: '100%', overflow: 'hidden' }}>
        <Box sx={{ px: 2 }}>
          {/* Application Overview */}
        <Paper
          variant="outlined"
          sx={{
            p: 4,
            mb: 3,
            borderWidth: 2,
            borderColor: 'primary.main'
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, textAlign: 'center' }}>
            <Box>


            <Typography variant="body2" color="text.secondary">
              Application Number
            </Typography>
            <Typography variant="body1" fontWeight={500}>
              {application.application.application_number}
            </Typography>
            </Box>
            
            <Box>
              <Typography variant="body2" color="text.secondary">
                {application.application.application_status === 'draft' ? 'Last Edited:' : 'Submitted:'}
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {application.application.application_status === 'draft'
                  ? formatDateTime(application.application.updated_at)
                  : formatDate(application.application.submission_date)
                }
              </Typography>
            </Box>
            <Chip
              label={application.application.application_status?.replace('_', ' ').toUpperCase() || 'DRAFT'}
              color={getStatusColor(application.application.application_status)}
              size="large"
              sx={{
                fontSize: '1rem',
                fontWeight: 700,
                height: 48,
                px: 3
              }}
            />
          </Box>
        </Paper>



        {/* Action Buttons */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
          {application.application.application_status === 'draft' &&
            <Button
              variant="contained"
              color="primary"
              size="large"
              startIcon={<EditIcon />}
              onClick={handleContinueFilling}
            >
              Continue Filling
            </Button>
          }

          {['documents_pending', 'submitted', 'under_review'].includes(application.application.application_status) && (
            <Button
              variant="outlined"
              color="primary"
              size="large"
              startIcon={<UploadFileIcon />}
              onClick={handleUploadDocuments}
            >
              Upload Documents
            </Button>
          )}

          {/* {['draft', 'submitted'].includes(application.application.application_status) && (
            <Button
              variant="outlined"
              color="error"
              size="large"
              startIcon={<DeleteIcon />}
              onClick={() => setDeleteDialogOpen(true)}
            >
              Delete Application
            </Button>
          )} */}
        </Box>

        {/* Student Information */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
            <PersonIcon color="primary" sx={{ fontSize: 28 }} />
            <Typography variant="h6" fontWeight={600}>
              Student Information
            </Typography>
          </Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
            <InfoField
              label="Full Name"
              value={`${application.student.first_name} ${application.student.last_name}`}
            />
            <InfoField
              label="Date of Birth"
              value={formatDate(application.student.date_of_birth)}
            />
            <InfoField
              label="Gender"
              value={application.student.gender ? application.student.gender.charAt(0).toUpperCase() + application.student.gender.slice(1) : '-'}
            />
            <InfoField
              label="Blood Group"
              value={application.student.blood_group}
            />
            {application.student.previous_school && (
              <Box sx={{ gridColumn: { sm: '1 / -1' } }}>
                <InfoField
                  label="Previous School"
                  value={application.student.previous_school}
                />
              </Box>
            )}
          </Box>
        </Paper>

        {/* Parent Information */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
            <FamilyRestroomIcon color="primary" sx={{ fontSize: 28 }} />
            <Typography variant="h6" fontWeight={600}>
              Parent Information
            </Typography>
          </Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
            <InfoField
              label="Full Name"
              value={`${application.parent.first_name} ${application.parent.last_name}`}
            />
            <InfoField
              label="Email"
              value={application.parent.email}
            />
            <InfoField
              label="Phone"
              value={application.parent.phone}
            />
            {application.parent.occupation && (
              <InfoField
                label="Occupation"
                value={application.parent.occupation}
              />
            )}
          </Box>
        </Paper>

        {/* Academic Information */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
            <MenuBookIcon color="primary" sx={{ fontSize: 28 }} />
            <Typography variant="h6" fontWeight={600}>
              Academic Information
            </Typography>
          </Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
            <InfoField
              label="Class Applying For"
              value={application.academic.class_name}
            />
            <InfoField
              label="Academic Year"
              value={application.academic.academic_year}
            />
          </Box>
        </Paper>

        {/* Documents */}
        <Paper id="documents-section" sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
            <DescriptionIcon color="primary" sx={{ fontSize: 28 }} />
            <Typography variant="h6" fontWeight={600}>
              Documents
            </Typography>
          </Box>
          <DocumentUpload
            applicationId={application.application.id}
            documentTypeId={1}
            multiple={true}
          />
        </Paper>

        {/* Status History */}
        {application.status_history && application.status_history.length > 0 && (
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
              <HistoryIcon color="primary" sx={{ fontSize: 28 }} />
              <Typography variant="h6" fontWeight={600}>
                Application Timeline
              </Typography>
            </Box>
            <Box sx={{ position: 'relative', pl: 3 }}>
              <Box
                sx={{
                  position: 'absolute',
                  left: 10,
                  top: 8,
                  bottom: 8,
                  width: 2,
                  bgcolor: 'divider'
                }}
              />
              {application.status_history.map((history, index) => (
                <Box
                  key={index}
                  sx={{
                    position: 'relative',
                    display: 'flex',
                    gap: 2,
                    mb: 3,
                    '&:last-child': { mb: 0 }
                  }}
                >
                  <Box
                    sx={{
                      position: 'absolute',
                      left: -20,
                      width: 20,
                      height: 20,
                      borderRadius: '50%',
                      bgcolor: 'primary.main',
                      border: '4px solid',
                      borderColor: 'background.paper',
                      zIndex: 1
                    }}
                  />
                  <Box sx={{ flex: 1, pt: 0.5 }}>
                    <Typography variant="body1" fontWeight={600} gutterBottom>
                      {history.new_status?.replace('_', ' ').toUpperCase() || 'UNKNOWN'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(history.change_date)}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Paper>
        )}
        </Box>
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Application</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this application? This action cannot be undone.
          </DialogContentText>
          {application && (
            <Box sx={{ mt: 2, p: 2, bgcolor: '#fee', border: '1px solid #f44336', borderRadius: 1 }}>
              <Typography variant="body2" fontWeight={600}>
                Application: {application.application.application_number}
              </Typography>
              <Typography variant="body2">
                Student: {application.student.first_name} {application.student.last_name}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleDeleteApplication} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ParentApplicationDetailsPage;
