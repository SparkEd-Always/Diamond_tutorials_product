import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  RadioGroup,
  FormControlLabel,
  Radio,
  Alert,
  CircularProgress,
  AppBar,
  Toolbar,
  IconButton,
  Chip,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import communicationApi from '../services/communicationApi';
import type { MessageType, TargetRole, ClassOption } from '../types/communication';
import SendIcon from '@mui/icons-material/Send';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SchoolIcon from '@mui/icons-material/School';
import config from '../config';

const SendMessagePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Form state
  const [messageType, setMessageType] = useState<MessageType>('broadcast');
  const [targetRole, setTargetRole] = useState<TargetRole>('parent');
  const [targetClassId, setTargetClassId] = useState<number | ''>('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  // UI state
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    try {
      const classData = await communicationApi.getClasses();
      setClasses(classData);
    } catch (err) {
      console.error('Failed to load classes:', err);
      setError('Failed to load class list');
    } finally {
      setLoadingClasses(false);
    }
  };

  const handleSendMessage = async () => {
    // Validation
    if (!subject.trim()) {
      setError('Subject is required');
      return;
    }
    if (!body.trim()) {
      setError('Message body is required');
      return;
    }
    if (messageType === 'broadcast' && targetRole === 'parent' && !targetClassId) {
      setError('Please select a class for broadcast message');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const messageData: any = {
        message_type: messageType,
        subject: subject.trim(),
        body: body.trim(),
      };

      // Add targeting based on message type
      if (messageType === 'broadcast') {
        messageData.target_role = targetRole;
        if (targetClassId) {
          messageData.target_class_id = targetClassId;
        }
      } else if (messageType === 'announcement') {
        messageData.target_role = 'parent'; // Announcements always go to all parents
      }

      const result = await communicationApi.createMessage(messageData);

      setSuccess(
        `Message sent successfully to ${result.total_recipients || 0} recipient(s)!`
      );

      // Reset form
      setSubject('');
      setBody('');
      setTargetClassId('');

      // Navigate to history after 2 seconds
      setTimeout(() => {
        navigate('/admin/communication/history');
      }, 2000);
    } catch (err: any) {
      console.error('Failed to send message:', err);
      setError(err.response?.data?.detail || 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  const getRecipientDescription = () => {
    if (messageType === 'announcement') {
      return 'All parents in the school';
    }
    if (messageType === 'broadcast') {
      if (targetClassId) {
        const selectedClass = classes.find(c => c.id === targetClassId);
        return `All parents in ${selectedClass?.name || 'selected class'}`;
      }
      return 'Please select a class';
    }
    return 'Direct message (feature coming soon)';
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Header */}
      <AppBar position="static" elevation={1}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={() => navigate(-1)}>
            <ArrowBackIcon />
          </IconButton>
          <SchoolIcon sx={{ ml: 1, mr: 2 }} />
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            {config.schoolName} - Send Message
          </Typography>
          <Typography variant="body2" sx={{ mr: 2 }}>
            {user?.email}
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ py: 4 }}>
        {/* Page Title */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom fontWeight={600}>
            <SendIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Send Message
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Send messages to parents and teachers
          </Typography>
        </Box>

        {/* Success Alert */}
        {success && (
          <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        )}

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Paper sx={{ p: 4 }}>
          {/* Message Type Selection */}
          <FormControl component="fieldset" fullWidth sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom fontWeight={600}>
              Message Type
            </Typography>
            <RadioGroup
              row
              value={messageType}
              onChange={(e) => setMessageType(e.target.value as MessageType)}
            >
              <FormControlLabel
                value="broadcast"
                control={<Radio />}
                label="Broadcast (To specific class)"
              />
              <FormControlLabel
                value="announcement"
                control={<Radio />}
                label="Announcement (To all parents)"
              />
              <FormControlLabel
                value="direct"
                control={<Radio />}
                label="Direct (Coming soon)"
                disabled
              />
            </RadioGroup>
          </FormControl>

          {/* Class Selection (for broadcast only) */}
          {messageType === 'broadcast' && (
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Select Class</InputLabel>
              <Select
                value={targetClassId}
                onChange={(e) => setTargetClassId(e.target.value as number)}
                label="Select Class"
                disabled={loadingClasses}
              >
                <MenuItem value="">
                  <em>Select a class</em>
                </MenuItem>
                {classes.map((cls) => (
                  <MenuItem key={cls.id} value={cls.id}>
                    {cls.name}
                    {cls.student_count && ` (${cls.student_count} students)`}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {/* Recipient Preview */}
          <Box sx={{ mb: 3, p: 2, bgcolor: 'info.lighter', borderRadius: 1 }}>
            <Typography variant="caption" color="text.secondary" display="block">
              Recipients:
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              {getRecipientDescription()}
            </Typography>
          </Box>

          {/* Subject */}
          <TextField
            fullWidth
            label="Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Enter message subject..."
            sx={{ mb: 3 }}
            required
            inputProps={{ maxLength: 500 }}
            helperText={`${subject.length}/500 characters`}
          />

          {/* Message Body */}
          <TextField
            fullWidth
            label="Message"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Type your message here..."
            multiline
            rows={8}
            required
            sx={{ mb: 3 }}
            helperText="Write a clear and concise message"
          />

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              onClick={() => navigate(-1)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              startIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
              onClick={handleSendMessage}
              disabled={loading || !subject.trim() || !body.trim()}
            >
              {loading ? 'Sending...' : 'Send Message'}
            </Button>
          </Box>
        </Paper>

        {/* Tips Card */}
        <Paper sx={{ p: 3, mt: 3, bgcolor: 'warning.lighter' }}>
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            💡 Tips for Effective Communication
          </Typography>
          <Typography variant="body2" component="ul" sx={{ pl: 2, mb: 0 }}>
            <li>Keep subject lines clear and concise</li>
            <li>Use simple language that all parents can understand</li>
            <li>Include specific dates, times, and action items</li>
            <li>Double-check spelling and grammar before sending</li>
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
};

export default SendMessagePage;
