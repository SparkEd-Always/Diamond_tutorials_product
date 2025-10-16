import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  AppBar,
  Toolbar,
  IconButton,
  CircularProgress,
  Alert,
  TextField,
  InputAdornment,
  Stack,
  LinearProgress,
  Tooltip,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import communicationApi from '../services/communicationApi';
import type { MessageSummary, MessageType } from '../types/communication';
import HistoryIcon from '@mui/icons-material/History';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SchoolIcon from '@mui/icons-material/School';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SendIcon from '@mui/icons-material/Send';
import CampaignIcon from '@mui/icons-material/Campaign';
import MailIcon from '@mui/icons-material/Mail';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import config from '../config';

const MessageHistoryPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [messages, setMessages] = useState<MessageSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const data = await communicationApi.getMessages({ view: 'sent' });
      setMessages(data);
      setError(null);
    } catch (err: any) {
      console.error('Failed to load messages:', err);
      setError('Failed to load message history');
    } finally {
      setLoading(false);
    }
  };

  const getMessageTypeIcon = (type: MessageType) => {
    switch (type) {
      case 'broadcast':
        return <CampaignIcon fontSize="small" />;
      case 'announcement':
        return <CampaignIcon fontSize="small" />;
      case 'direct':
        return <MailIcon fontSize="small" />;
      default:
        return <MailIcon fontSize="small" />;
    }
  };

  const getMessageTypeColor = (type: MessageType): 'primary' | 'success' | 'info' => {
    switch (type) {
      case 'broadcast':
        return 'primary';
      case 'announcement':
        return 'success';
      case 'direct':
        return 'info';
      default:
        return 'info';
    }
  };

  const getMessageTypeLabel = (type: MessageType) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'Not sent';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const getReadRate = (message: MessageSummary) => {
    if (!message.total_recipients || message.total_recipients === 0) return 0;
    return Math.round(((message.read_count || 0) / message.total_recipients) * 100);
  };

  const filteredMessages = messages.filter(
    (msg) =>
      msg.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (msg.target_class_name && msg.target_class_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
            {config.schoolName} - Message History
          </Typography>
          <Typography variant="body2" sx={{ mr: 2 }}>
            {user?.email}
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ py: 4, px: { xs: 2, sm: 3, md: 4 } }}>
        {/* Page Title */}
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" gutterBottom fontWeight={600}>
              <HistoryIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Message History
            </Typography>
            <Typography variant="body1" color="text.secondary">
              View all messages you have sent
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<SendIcon />}
            onClick={() => navigate('/admin/communication/send')}
          >
            Send New Message
          </Button>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Search Bar */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <TextField
            fullWidth
            placeholder="Search by subject or class name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Paper>

        {/* Messages Table */}
        <Paper>
          {loading ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <CircularProgress />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Loading messages...
              </Typography>
            </Box>
          ) : filteredMessages.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="body1" color="text.secondary">
                {searchTerm ? 'No messages found matching your search' : 'No messages sent yet'}
              </Typography>
              {!searchTerm && (
                <Button
                  variant="contained"
                  startIcon={<SendIcon />}
                  onClick={() => navigate('/admin/communication/send')}
                  sx={{ mt: 2 }}
                >
                  Send Your First Message
                </Button>
              )}
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'grey.50' }}>
                    <TableCell width="10%">
                      <Typography variant="subtitle2" fontWeight={600}>
                        Type
                      </Typography>
                    </TableCell>
                    <TableCell width="35%">
                      <Typography variant="subtitle2" fontWeight={600}>
                        Subject
                      </Typography>
                    </TableCell>
                    <TableCell width="15%">
                      <Typography variant="subtitle2" fontWeight={600}>
                        Target
                      </Typography>
                    </TableCell>
                    <TableCell width="10%" align="center">
                      <Typography variant="subtitle2" fontWeight={600}>
                        Recipients
                      </Typography>
                    </TableCell>
                    <TableCell width="15%">
                      <Typography variant="subtitle2" fontWeight={600}>
                        Read Rate
                      </Typography>
                    </TableCell>
                    <TableCell width="15%">
                      <Typography variant="subtitle2" fontWeight={600}>
                        Sent At
                      </Typography>
                    </TableCell>
                    <TableCell width="10%" align="center">
                      <Typography variant="subtitle2" fontWeight={600}>
                        Action
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredMessages.map((message) => {
                    const readRate = getReadRate(message);
                    return (
                      <TableRow key={message.id} hover>
                        <TableCell>
                          <Chip
                            icon={getMessageTypeIcon(message.message_type)}
                            label={getMessageTypeLabel(message.message_type)}
                            color={getMessageTypeColor(message.message_type)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={500}>
                            {message.subject}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {message.target_class_name || 'All Parents'}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={message.total_recipients || 0}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Stack spacing={0.5}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <LinearProgress
                                variant="determinate"
                                value={readRate}
                                sx={{ flexGrow: 1, height: 6, borderRadius: 1 }}
                                color={readRate > 70 ? 'success' : readRate > 40 ? 'warning' : 'error'}
                              />
                              <Typography variant="caption" fontWeight={600}>
                                {readRate}%
                              </Typography>
                            </Box>
                            <Typography variant="caption" color="text.secondary">
                              {message.read_count || 0} / {message.total_recipients || 0} read
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(message.sent_at)}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => navigate(`/admin/communication/messages/${message.id}`)}
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>

        {/* Statistics Card */}
        {!loading && messages.length > 0 && (
          <Paper sx={{ p: 3, mt: 3 }}>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              📊 Summary Statistics
            </Typography>
            <Stack direction="row" spacing={4} sx={{ mt: 2 }}>
              <Box>
                <Typography variant="h4" fontWeight={600} color="primary.main">
                  {messages.length}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Total Messages Sent
                </Typography>
              </Box>
              <Box>
                <Typography variant="h4" fontWeight={600} color="success.main">
                  {messages.reduce((sum, msg) => sum + (msg.total_recipients || 0), 0)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Total Recipients
                </Typography>
              </Box>
              <Box>
                <Typography variant="h4" fontWeight={600} color="info.main">
                  {messages.reduce((sum, msg) => sum + (msg.read_count || 0), 0)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Total Reads
                </Typography>
              </Box>
            </Stack>
          </Paper>
        )}
      </Container>
    </Box>
  );
};

export default MessageHistoryPage;
