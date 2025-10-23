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
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
  Alert,
} from '@mui/material';
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
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import ChangeCircleIcon from '@mui/icons-material/ChangeCircle';
import EventIcon from '@mui/icons-material/Event';
import CommentIcon from '@mui/icons-material/Comment';

const AdminApplicationDetailsPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { showError, showNotification } = useNotification();
  const [application, setApplication] = useState<ApplicationDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [commentDialogOpen, setCommentDialogOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [statusReason, setStatusReason] = useState('');
  const [comment, setComment] = useState('');

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

  const handleChangeStatus = async () => {
    if (!id || !selectedStatus) return;
    try {
      await admissionApi.updateApplicationStatus(
        parseInt(id),
        selectedStatus,
        statusReason || `Status changed to ${selectedStatus}`
      );
      showNotification('Status updated successfully', 'success');
      setStatusDialogOpen(false);
      setSelectedStatus('');
      setStatusReason('');
      loadApplication(parseInt(id));
    } catch (error: any) {
      showError(error.response?.data?.detail || 'Failed to update status');
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, any> = {
      draft: 'default',
      submitted: 'info',
      under_review: 'warning',
      documents_pending: 'warning',
      test_scheduled: 'warning',
      test_completed: 'info',
      interview_scheduled: 'warning',
      interview_completed: 'info',
      decision_made: 'primary',
      accepted: 'success',
      enrolled: 'success',
      rejected: 'error',
      waitlisted: 'warning',
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

  if (loading) {
    return (
      <Box sx={{ width: '100vw',minHeight: '100vh', bgcolor: 'background.default' }}>
        <AppBar position="static" elevation={1}>
          <Toolbar>
            <IconButton edge="start" color="inherit" onClick={() => navigate('/applications')}>
              <ArrowBackIcon />
            </IconButton>
            <SchoolIcon sx={{ mr: 2 }} />
            <Typography variant="h6">Application Details (Admin)</Typography>
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

  const isFinalized = ['accepted', 'rejected', 'enrolled'].includes(application.application.application_status);

  return (
    <Box sx={{ width:'100vw',minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Header */}
      <AppBar position="static" elevation={1}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={() => navigate('/applications')}>
            <ArrowBackIcon />
          </IconButton>
          <SchoolIcon sx={{ mr: 2 }} />
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Application Review (Admin)
          </Typography>
          <Chip
            label="ADMIN MODE"
            color="secondary"
            size="small"
            sx={{ fontWeight: 600 }}
          />
        </Toolbar>
      </AppBar>

      <Box sx={{ py: 4, width: '100%', overflow: 'hidden' }}>
        <Box sx={{ px: 2 }}>
          {/* Application Overview */}
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

        {/* Admin Action Buttons */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Admin Actions
          </Typography>
          <Divider sx={{ mb: 2 }} />

          {isFinalized && (
            <Alert severity="info" sx={{ mb: 2 }}>
              This application has been finalized. Status: {application.application.application_status.toUpperCase()}
            </Alert>
          )}

          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              color="success"
              size="large"
              startIcon={<CheckCircleIcon />}
              onClick={handleApprove}
              disabled={isFinalized}
            >
              Approve Application
            </Button>
            <Button
              variant="contained"
              color="error"
              size="large"
              startIcon={<CancelIcon />}
              onClick={handleReject}
              disabled={isFinalized}
            >
              Reject Application
            </Button>
            <Button
              variant="outlined"
              color="primary"
              size="large"
              startIcon={<ChangeCircleIcon />}
              onClick={() => setStatusDialogOpen(true)}
            >
              Change Status
            </Button>
            <Button
              variant="outlined"
              color="info"
              size="large"
              startIcon={<CommentIcon />}
              onClick={() => setCommentDialogOpen(true)}
            >
              Add Comment
            </Button>
            <Button
              variant="outlined"
              color="warning"
              size="large"
              startIcon={<EventIcon />}
              onClick={() => showNotification('Test scheduling feature coming soon', 'info')}
            >
              Schedule Test
            </Button>
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

        {/* Documents */}
        <Paper sx={{ p: 3, mb: 3 }}>
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
                Status History & Audit Trail
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
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {formatDate(history.change_date)}
                    </Typography>
                    {history.change_reason && (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Reason: {history.change_reason}
                      </Typography>
                    )}
                  </Box>
                </Box>
              ))}
            </Box>
          </Paper>
        )}
        </Box>
      </Box>

      {/* Change Status Dialog */}
      <Dialog
        open={statusDialogOpen}
        onClose={() => setStatusDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Change Application Status</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>New Status</InputLabel>
              <Select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                label="New Status"
              >
                <MenuItem value="submitted">Submitted</MenuItem>
                <MenuItem value="under_review">Under Review</MenuItem>
                <MenuItem value="documents_pending">Documents Pending</MenuItem>
                <MenuItem value="test_scheduled">Test Scheduled</MenuItem>
                <MenuItem value="test_completed">Test Completed</MenuItem>
                <MenuItem value="interview_scheduled">Interview Scheduled</MenuItem>
                <MenuItem value="interview_completed">Interview Completed</MenuItem>
                <MenuItem value="decision_made">Decision Made</MenuItem>
                <MenuItem value="waitlisted">Waitlisted</MenuItem>
                <MenuItem value="accepted">Accepted</MenuItem>
                <MenuItem value="rejected">Rejected</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Reason for Change (Optional)"
              value={statusReason}
              onChange={(e) => setStatusReason(e.target.value)}
              placeholder="Explain why you're changing the status..."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusDialogOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleChangeStatus}
            variant="contained"
            disabled={!selectedStatus}
          >
            Update Status
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Comment Dialog */}
      <Dialog
        open={commentDialogOpen}
        onClose={() => setCommentDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add Internal Comment</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add internal notes about this application..."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCommentDialogOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={() => {
              showNotification('Comment feature coming soon', 'info');
              setCommentDialogOpen(false);
            }}
            variant="contained"
            disabled={!comment}
          >
            Save Comment
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminApplicationDetailsPage;
