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
  Card,
  CardContent,
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
import HomeIcon from '@mui/icons-material/Home';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import DescriptionIcon from '@mui/icons-material/Description';
import HistoryIcon from '@mui/icons-material/History';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import UploadFileIcon from '@mui/icons-material/UploadFile';

const ApplicationDetailsPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { isAdmin } = useAuth();
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

  const handleApprove = async () => {
    if (!application || !id) return;
    try {
      await admissionApi.updateApplicationStatus(
        parseInt(id),
        'accepted',
        'Application approved by admin'
      );
      showNotification('Application approved successfully', 'success');
      loadApplication(parseInt(id));
    } catch (error: any) {
      showError(error.response?.data?.detail || 'Failed to approve application');
    }
  };

  const handleReject = async () => {
    if (!application || !id) return;
    try {
      await admissionApi.updateApplicationStatus(
        parseInt(id),
        'rejected',
        'Application rejected by admin'
      );
      showNotification('Application rejected', 'info');
      loadApplication(parseInt(id));
    } catch (error: any) {
      showError(error.response?.data?.detail || 'Failed to reject application');
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
    // Scroll to the documents section
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

  // Helper component for displaying field information
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
            Application Details
          </Typography>
        </Toolbar>
      </AppBar>

      <Box sx={{ py: 4, width: '100%', overflow: 'hidden' }}>
        <Box sx={{ px: 2 }}>
          {/* Application Overview - Prominent Status Card */}
        <Paper
          sx={{
            p: 4,
            mb: 3,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white'
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2 }}>
            <Box>
              <Typography variant="overline" sx={{ opacity: 0.9, display: 'block' }}>
                Application Number
              </Typography>
              <Typography variant="h4" fontWeight={700} gutterBottom>
                {application.application.application_number}
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Submitted: {formatDate(application.application.submission_date)}
              </Typography>
            </Box>
            <Chip
              label={application.application.status?.replace('_', ' ').toUpperCase() || 'DRAFT'}
              color={getStatusColor(application.application.status)}
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

        {/* Student Information */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
            <PersonIcon color="primary" sx={{ fontSize: 28 }} />
            <Typography variant="h6" fontWeight={600}>
              Student Information
            </Typography>
          </Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 3 }}>
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
            {application.student.medical_conditions && (
              <Box sx={{ gridColumn: { sm: '1 / -1' } }}>
                <InfoField
                  label="Medical Conditions"
                  value={application.student.medical_conditions}
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
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 3 }}>
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

        {/* Document Upload Section */}
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
                Status History
              </Typography>
            </Box>
            <Box sx={{ position: 'relative', pl: 3 }}>
              {/* Timeline line */}
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
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {formatDate(history.change_date)}
                    </Typography>
                    {history.change_reason && (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        {history.change_reason}
                      </Typography>
                    )}
                  </Box>
                </Box>
              ))}
            </Box>
          </Paper>
        )}

        {/* Actions */}
        {isAdmin ? (
          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              color="success"
              onClick={handleApprove}
              disabled={application.application.status === 'accepted' || application.application.status === 'rejected'}
            >
              Approve
            </Button>
            <Button
              variant="outlined"
              color="error"
              onClick={handleReject}
              disabled={application.application.status === 'accepted' || application.application.status === 'rejected'}
            >
              Reject
            </Button>
          </Box>
        ) : (
          <Box sx={{ mt: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            {/* Continue Filling - Show for draft applications */}
            {application.application.status === 'draft' && (
              <Button
                variant="contained"
                color="primary"
                startIcon={<EditIcon />}
                onClick={handleContinueFilling}
              >
                Continue Filling
              </Button>
            )}

            {/* Upload Documents - Show for submitted, under_review, or documents_pending */}
            {['documents_pending', 'submitted', 'under_review'].includes(application.application.status) && (
              <Button
                variant="outlined"
                color="primary"
                startIcon={<UploadFileIcon />}
                onClick={handleUploadDocuments}
              >
                Upload Documents
              </Button>
            )}

            {/* Delete Application - Show for draft or submitted (early stage) */}
            {['draft', 'submitted'].includes(application.application.status) && (
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={() => setDeleteDialogOpen(true)}
              >
                Delete Application
              </Button>
            )}
          </Box>
        )}
        </Box>
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          Delete Application
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
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
          <Button onClick={handleDeleteApplication} color="error" variant="contained" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ApplicationDetailsPage;
