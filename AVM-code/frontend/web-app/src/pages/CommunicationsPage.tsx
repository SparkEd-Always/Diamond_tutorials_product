import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  IconButton,
  Tabs,
  Tab,
  CircularProgress,
} from '@mui/material';
import {
  Send as SendIcon,
  WhatsApp as WhatsAppIcon,
  Close as CloseIcon,
  Notifications as NotificationsIcon,
  Message as MessageIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';

const API_BASE_URL = 'http://192.168.1.4:8000/api/v1';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`communications-tabpanel-${index}`}
      aria-labelledby={`communications-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

interface ClassOption {
  value: string;
  label: string;
}

const CommunicationsPage: React.FC = () => {
  const { token } = useSelector((state: RootState) => state.auth);
  const [tabValue, setTabValue] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [communicationHistory, setCommunicationHistory] = useState<any[]>([]);
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  // Form state
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [recipients, setRecipients] = useState('all_parents');

  // Fetch communication history and classes from API
  useEffect(() => {
    fetchCommunicationHistory();
    fetchClasses();

    // Auto-refresh every 30 seconds for real-time updates
    const interval = setInterval(() => {
      fetchCommunicationHistory();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, []);

  const fetchCommunicationHistory = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/communications/history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCommunicationHistory(response.data);
    } catch (error) {
      console.error('Error fetching communication history:', error);
      setCommunicationHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/students/classes`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setClasses(response.data);
    } catch (error) {
      console.error('Error fetching classes:', error);
      setClasses([]);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleSendMessage = async () => {
    // Validation
    if (!subject.trim() || !message.trim()) {
      alert('Please fill in both subject and message');
      return;
    }

    try {
      setSending(true);
      const response = await axios.post(
        `${API_BASE_URL}/messages/send-to-parents`,
        {
          subject,
          message,
          recipients
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // Show success message
      alert(response.data.message || 'Messages sent successfully!');

      // Reset form
      setSubject('');
      setMessage('');
      setRecipients('all_parents');
      setOpenDialog(false);

      // Refresh communication history
      fetchCommunicationHistory();
    } catch (error: any) {
      console.error('Error sending messages:', error);
      alert(
        error.response?.data?.detail || 'Failed to send messages. Please try again.'
      );
    } finally {
      setSending(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'success';
      case 'sent':
        return 'info';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'WHATSAPP':
        return <WhatsAppIcon />;
      case 'IN_APP':
        return <MessageIcon />;
      default:
        return <NotificationsIcon />;
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Communications
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Send messages and track communication history
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<SendIcon />}
          size="large"
          onClick={() => setOpenDialog(true)}
        >
          Send Message
        </Button>
      </Box>

      {/* Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="Message History" />
            <Tab label="Message Analytics" />
            <Tab label="Templates" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          {/* Message History */}
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Type</TableCell>
                  <TableCell>Subject</TableCell>
                  <TableCell>Recipient</TableCell>
                  <TableCell>Sent At</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {communicationHistory.map((comm) => (
                  <TableRow key={comm.id} hover>
                    <TableCell>
                      <Chip
                        icon={getTypeIcon(comm.message_type)}
                        label={comm.message_type}
                        size="small"
                        color="primary"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="500">
                        {comm.subject}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {comm.message.substring(0, 50)}...
                      </Typography>
                    </TableCell>
                    <TableCell>{comm.recipient}</TableCell>
                    <TableCell>
                      {format(new Date(comm.sent_at), 'dd MMM yyyy, HH:mm')}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={comm.delivery_status.toUpperCase()}
                        color={getStatusColor(comm.delivery_status) as any}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          {/* WhatsApp Analytics */}
          <Typography variant="h6" gutterBottom>
            WhatsApp Analytics (Coming Soon)
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Track message delivery rates, engagement metrics, and communication effectiveness.
          </Typography>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          {/* Templates */}
          <Typography variant="h6" gutterBottom>
            Message Templates (Coming Soon)
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Create and manage reusable message templates for common communications.
          </Typography>
        </TabPanel>
      </Card>

      {/* Send Message Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            Send Message
            <IconButton onClick={() => setOpenDialog(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Message Type
              </Typography>
              <Box display="flex" alignItems="center" sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                <MessageIcon sx={{ mr: 1, color: '#4F46E5' }} />
                <Typography variant="body1" fontWeight="500">
                  In-App Message + Push Notification
                </Typography>
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Messages will be delivered to parent mobile app with push notification
              </Typography>
            </Box>

            <FormControl fullWidth>
              <InputLabel>Recipients</InputLabel>
              <Select
                label="Recipients"
                value={recipients}
                onChange={(e) => setRecipients(e.target.value)}
              >
                <MenuItem value="all_parents">All Parents</MenuItem>
                {classes.map((classOption) => (
                  <MenuItem key={classOption.value} value={classOption.value}>
                    {classOption.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Subject"
              variant="outlined"
              placeholder="Enter message subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />

            <TextField
              fullWidth
              label="Message"
              multiline
              rows={4}
              variant="outlined"
              placeholder="Enter your message here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} disabled={sending}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSendMessage}
            startIcon={<SendIcon />}
            disabled={sending}
          >
            {sending ? 'Sending...' : 'Send Message'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CommunicationsPage;