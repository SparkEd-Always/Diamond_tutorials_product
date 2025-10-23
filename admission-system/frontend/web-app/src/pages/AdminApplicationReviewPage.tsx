/**
 * Admin Application Review Page - Field-by-field review with comment system
 * Admin can mark fields for correction, add comments, and request changes
 */
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Button,
  IconButton,
  Checkbox,
  TextField,
  Divider,
  Chip,
  Stack,
  Alert,
  Card,
  CardContent,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  ExpandMore as ExpandIcon,
  Send as SendIcon,
  CheckCircle as ApproveIcon,
  Error as ErrorIcon,
  Comment as CommentIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import { useNotification } from '../contexts/NotificationContext';
import { admissionApi } from '../services/api';
import type { ApplicationDetails } from '../types';

interface FieldReview {
  field_name: string;
  field_label: string;
  field_value: string;
  needs_correction: boolean;
  admin_comment: string;
}

const AdminApplicationReviewPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { showNotification, showSuccess, showError } = useNotification();

  const [application, setApplication] = useState<ApplicationDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [fieldReviews, setFieldReviews] = useState<Record<string, FieldReview>>({});
  const [overallRemarks, setOverallRemarks] = useState('');
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'request_changes' | 'approve' | ''>('');

  useEffect(() => {
    if (id) {
      loadApplication(parseInt(id));
    }
  }, [id]);

  const loadApplication = async (applicationId: number) => {
    setLoading(true);
    try {
      const data = await admissionApi.getApplication(applicationId);
      setApplication(data);
      initializeFieldReviews(data);
    } catch (error: any) {
      showError(error.response?.data?.detail || 'Failed to load application');
    } finally {
      setLoading(false);
    }
  };

  const initializeFieldReviews = (data: ApplicationDetails) => {
    const reviews: Record<string, FieldReview> = {};

    // Student fields
    if (data.student) {
      addFieldReview(reviews, 'student_first_name', 'First Name', data.student.first_name || '');
      addFieldReview(reviews, 'student_middle_name', 'Middle Name', data.student.middle_name || '');
      addFieldReview(reviews, 'student_last_name', 'Last Name', data.student.last_name || '');
      addFieldReview(reviews, 'date_of_birth', 'Date of Birth', data.student.date_of_birth || '');
      addFieldReview(reviews, 'gender', 'Gender', data.student.gender || '');
      addFieldReview(reviews, 'blood_group', 'Blood Group', data.student.blood_group || '');
      addFieldReview(reviews, 'nationality', 'Nationality', data.student.nationality || '');
      addFieldReview(reviews, 'religion', 'Religion', data.student.religion || '');
      addFieldReview(reviews, 'caste', 'Caste', data.student.caste || '');
      addFieldReview(reviews, 'mother_tongue', 'Mother Tongue', data.student.mother_tongue || '');
    }

    // Parent fields
    if (data.parent) {
      addFieldReview(reviews, 'father_name', "Father's Name", data.parent.father_name || '');
      addFieldReview(reviews, 'father_occupation', "Father's Occupation", data.parent.father_occupation || '');
      addFieldReview(reviews, 'father_phone', "Father's Phone", data.parent.father_phone || '');
      addFieldReview(reviews, 'father_email', "Father's Email", data.parent.father_email || '');
      addFieldReview(reviews, 'mother_name', "Mother's Name", data.parent.mother_name || '');
      addFieldReview(reviews, 'mother_occupation', "Mother's Occupation", data.parent.mother_occupation || '');
      addFieldReview(reviews, 'mother_phone', "Mother's Phone", data.parent.mother_phone || '');
      addFieldReview(reviews, 'mother_email', "Mother's Email", data.parent.mother_email || '');
      addFieldReview(reviews, 'guardian_name', "Guardian's Name", data.parent.guardian_name || '');
      addFieldReview(reviews, 'annual_income', 'Annual Income', data.parent.annual_income?.toString() || '');
    }

    // Address fields
    addFieldReview(reviews, 'residential_address', 'Residential Address', data.application.residential_address || '');
    addFieldReview(reviews, 'city', 'City', data.application.city || '');
    addFieldReview(reviews, 'state', 'State', data.application.state || '');
    addFieldReview(reviews, 'pincode', 'Pincode', data.application.pincode || '');

    // Academic fields
    addFieldReview(reviews, 'previous_school_name', 'Previous School Name', data.application.previous_school_name || '');
    addFieldReview(reviews, 'previous_class', 'Previous Class', data.application.previous_class || '');
    addFieldReview(reviews, 'previous_school_board', 'Previous School Board', data.application.previous_school_board || '');
    addFieldReview(reviews, 'tc_number', 'TC Number', data.application.tc_number || '');

    setFieldReviews(reviews);
  };

  const addFieldReview = (
    reviews: Record<string, FieldReview>,
    fieldName: string,
    label: string,
    value: string
  ) => {
    reviews[fieldName] = {
      field_name: fieldName,
      field_label: label,
      field_value: value,
      needs_correction: false,
      admin_comment: '',
    };
  };

  const handleToggleCorrection = (fieldName: string) => {
    setFieldReviews(prev => ({
      ...prev,
      [fieldName]: {
        ...prev[fieldName],
        needs_correction: !prev[fieldName].needs_correction,
      },
    }));
  };

  const handleCommentChange = (fieldName: string, comment: string) => {
    setFieldReviews(prev => ({
      ...prev,
      [fieldName]: {
        ...prev[fieldName],
        admin_comment: comment,
      },
    }));
  };

  const handleRequestChanges = () => {
    setActionType('request_changes');
    setConfirmDialogOpen(true);
  };

  const handleApproveApplication = () => {
    setActionType('approve');
    setConfirmDialogOpen(true);
  };

  const handleConfirmAction = async () => {
    if (!application || !id) return;

    try {
      const fieldReviewsList = Object.values(fieldReviews).filter(
        fr => fr.needs_correction || fr.admin_comment
      );

      const reviewData = {
        review_status: actionType === 'request_changes' ? 'changes_requested' : 'approved',
        overall_remarks: overallRemarks,
        field_reviews: fieldReviewsList,
      };

      // Send review to backend
      await fetch(`http://localhost:8000/api/v1/reviews/applications/${id}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(reviewData),
      });

      if (actionType === 'request_changes') {
        showSuccess('Changes requested. Parent will be notified to make corrections.');
      } else {
        showSuccess('Application approved successfully!');
      }

      setConfirmDialogOpen(false);
      navigate('/applications');
    } catch (error: any) {
      showError('Failed to submit review');
    }
  };

  const getCorrectionCount = () => {
    return Object.values(fieldReviews).filter(fr => fr.needs_correction).length;
  };

  const getCommentCount = () => {
    return Object.values(fieldReviews).filter(fr => fr.admin_comment).length;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!application) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error">Application not found</Alert>
      </Box>
    );
  }

  const fieldsBySection = {
    'Student Information': Object.values(fieldReviews).filter(fr => fr.field_name.startsWith('student_') || fr.field_name === 'date_of_birth' || fr.field_name === 'gender' || fr.field_name === 'blood_group' || fr.field_name === 'nationality' || fr.field_name === 'religion' || fr.field_name === 'caste' || fr.field_name === 'mother_tongue'),
    'Parent Information': Object.values(fieldReviews).filter(fr => fr.field_name.includes('father_') || fr.field_name.includes('mother_') || fr.field_name.includes('guardian_') || fr.field_name === 'annual_income'),
    'Address Information': Object.values(fieldReviews).filter(fr => fr.field_name.includes('address') || fr.field_name === 'city' || fr.field_name === 'state' || fr.field_name === 'pincode'),
    'Academic Information': Object.values(fieldReviews).filter(fr => fr.field_name.includes('previous_') || fr.field_name === 'tc_number'),
  };

  return (
    <Box sx={{ py: 4, width: '100%', overflow: 'hidden' }}>
      <Box sx={{ px: 2 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <IconButton onClick={() => navigate('/applications')} sx={{ mr: 2 }}>
            <BackIcon />
          </IconButton>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h4" fontWeight={600}>
              Review Application
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Application #{application.application.application_number} - {application.student?.first_name} {application.student?.last_name}
            </Typography>
          </Box>
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<SendIcon />}
              onClick={handleRequestChanges}
              disabled={getCorrectionCount() === 0}
            >
              Request Changes ({getCorrectionCount()})
            </Button>
            <Button
              variant="contained"
              color="success"
              startIcon={<ApproveIcon />}
              onClick={handleApproveApplication}
            >
              Approve Application
            </Button>
          </Stack>
        </Box>

        {/* Stats */}
        <Stack direction="row" spacing={2}>
          <Chip
            icon={<ErrorIcon />}
            label={`${getCorrectionCount()} fields need correction`}
            color={getCorrectionCount() > 0 ? 'error' : 'default'}
            size="small"
          />
          <Chip
            icon={<CommentIcon />}
            label={`${getCommentCount()} comments added`}
            color="info"
            size="small"
          />
        </Stack>
      </Box>

      {/* Field Review Sections */}
      {Object.entries(fieldsBySection).map(([sectionName, fields]) => (
        <Accordion key={sectionName} defaultExpanded>
          <AccordionSummary expandIcon={<ExpandIcon />}>
            <Typography variant="h6" fontWeight={600}>
              {sectionName}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={2}>
              {fields.map(fieldReview => (
                <Card
                  key={fieldReview.field_name}
                  sx={{
                    border: fieldReview.needs_correction ? 2 : 1,
                    borderColor: fieldReview.needs_correction ? 'error.main' : 'divider',
                    bgcolor: fieldReview.needs_correction ? 'error.50' : 'background.paper',
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="body2" fontWeight={600} color="text.secondary">
                          {fieldReview.field_label}
                        </Typography>
                        <Typography variant="body1" sx={{ mt: 0.5 }}>
                          {fieldReview.field_value || <em style={{ color: '#999' }}>Not provided</em>}
                        </Typography>
                      </Box>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={fieldReview.needs_correction}
                            onChange={() => handleToggleCorrection(fieldReview.field_name)}
                            color="error"
                          />
                        }
                        label="Needs Correction"
                      />
                    </Box>

                    {(fieldReview.needs_correction || fieldReview.admin_comment) && (
                      <TextField
                        fullWidth
                        multiline
                        rows={2}
                        placeholder="Add comment explaining what needs to be corrected..."
                        value={fieldReview.admin_comment}
                        onChange={(e) => handleCommentChange(fieldReview.field_name, e.target.value)}
                        size="small"
                        sx={{ mt: 1 }}
                      />
                    )}
                  </CardContent>
                </Card>
              ))}
            </Stack>
          </AccordionDetails>
        </Accordion>
      ))}

      {/* Overall Remarks */}
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom fontWeight={600}>
          Overall Remarks
        </Typography>
        <TextField
          fullWidth
          multiline
          rows={4}
          placeholder="Add overall comments about the application..."
          value={overallRemarks}
          onChange={(e) => setOverallRemarks(e.target.value)}
          sx={{ mt: 2 }}
        />
      </Paper>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {actionType === 'request_changes' ? 'Request Changes?' : 'Approve Application?'}
        </DialogTitle>
        <DialogContent>
          {actionType === 'request_changes' ? (
            <>
              <Typography variant="body2" gutterBottom>
                You are about to request changes for <strong>{getCorrectionCount()} field(s)</strong>.
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                The parent will receive a notification and can only edit the marked fields.
                After corrections, the application will return to you for review.
              </Typography>
            </>
          ) : (
            <Typography variant="body2">
              Are you sure you want to approve this application? This will move the application to the next step in the admission workflow.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleConfirmAction}
            variant="contained"
            color={actionType === 'request_changes' ? 'primary' : 'success'}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
      </Box>
    </Box>
  );
};

export default AdminApplicationReviewPage;
