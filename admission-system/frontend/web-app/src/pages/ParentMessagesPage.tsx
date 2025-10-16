import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Chip,
  AppBar,
  Toolbar,
  IconButton,
  CircularProgress,
  Alert,
  TextField,
  InputAdornment,
  Badge,
  Divider,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import communicationApi from '../services/communicationApi';
import type { MessageSummary, MessageType } from '../types/communication';
import InboxIcon from '@mui/icons-material/Inbox';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SchoolIcon from '@mui/icons-material/School';
import SearchIcon from '@mui/icons-material/Search';
import MailIcon from '@mui/icons-material/Mail';
import DraftsIcon from '@mui/icons-material/Drafts';
import CampaignIcon from '@mui/icons-material/Campaign';
import AnnouncementIcon from '@mui/icons-material/Announcement';
import config from '../config';

const ParentMessagesPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [messages, setMessages] = useState<MessageSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadMessages();
    loadUnreadCount();
  }, []);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const data = await communicationApi.getMessages({ view: 'received' });
      setMessages(data);
      setError(null);
    } catch (err: any) {
      console.error('Failed to load messages:', err);
      setError('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const count = await communicationApi.getUnreadCount();
      setUnreadCount(count);
    } catch (err) {
      console.error('Failed to load unread count:', err);
    }
  };

  const getMessageTypeIcon = (type: MessageType) => {
    switch (type) {
      case 'broadcast':
        return <CampaignIcon fontSize="small" />;
      case 'announcement':
        return <AnnouncementIcon fontSize="small" />;
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

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) {
      return 'Just now';
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return new Intl.DateTimeFormat('en-IN', {
        day: '2-digit',
        month: 'short',
      }).format(date);
    }
  };

  const handleMessageClick = (messageId: number) => {
    navigate(`/parent/messages/${messageId}`);
  };

  const filteredMessages = messages.filter(
    (msg) =>
      msg.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.sender_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const unreadMessages = filteredMessages.filter((msg) => !msg.is_read);
  const readMessages = filteredMessages.filter((msg) => msg.is_read);

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
            {config.schoolName} - Messages
          </Typography>
          <Badge badgeContent={unreadCount} color="error" sx={{ mr: 3 }}>
            <InboxIcon />
          </Badge>
          <Typography variant="body2" sx={{ mr: 2 }}>
            {user?.email}
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ py: 4 }}>
        {/* Page Title */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom fontWeight={600}>
            <InboxIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            My Messages
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Messages from school and teachers
          </Typography>
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
            placeholder="Search messages..."
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

        {/* Unread Count Badge */}
        {unreadCount > 0 && (
          <Paper sx={{ p: 2, mb: 2, bgcolor: 'warning.lighter' }}>
            <Typography variant="body2" fontWeight={600}>
              📬 You have {unreadCount} unread message{unreadCount > 1 ? 's' : ''}
            </Typography>
          </Paper>
        )}

        {/* Messages List */}
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
              <InboxIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
              <Typography variant="body1" color="text.secondary">
                {searchTerm ? 'No messages found matching your search' : 'No messages yet'}
              </Typography>
            </Box>
          ) : (
            <List sx={{ p: 0 }}>
              {/* Unread Messages */}
              {unreadMessages.length > 0 && (
                <>
                  <Box sx={{ px: 2, py: 1, bgcolor: 'grey.50' }}>
                    <Typography variant="caption" fontWeight={600} color="text.secondary">
                      UNREAD ({unreadMessages.length})
                    </Typography>
                  </Box>
                  {unreadMessages.map((message, index) => (
                    <Box key={message.id}>
                      <ListItem disablePadding>
                        <ListItemButton
                          onClick={() => handleMessageClick(message.id)}
                          sx={{
                            bgcolor: 'info.lighter',
                            '&:hover': { bgcolor: 'info.light' },
                          }}
                        >
                          <Box sx={{ mr: 2 }}>
                            <Badge color="error" variant="dot">
                              <DraftsIcon color="primary" />
                            </Badge>
                          </Box>
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                <Typography variant="body1" fontWeight={700}>
                                  {message.subject}
                                </Typography>
                                <Chip
                                  icon={getMessageTypeIcon(message.message_type)}
                                  label={message.message_type}
                                  size="small"
                                  color={getMessageTypeColor(message.message_type)}
                                />
                              </Box>
                            }
                            secondary={
                              <Box>
                                <Typography variant="body2" color="text.secondary">
                                  From: {message.sender_name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {formatDate(message.created_at)}
                                </Typography>
                              </Box>
                            }
                          />
                        </ListItemButton>
                      </ListItem>
                      {index < unreadMessages.length - 1 && <Divider />}
                    </Box>
                  ))}
                  {readMessages.length > 0 && <Divider sx={{ my: 1 }} />}
                </>
              )}

              {/* Read Messages */}
              {readMessages.length > 0 && (
                <>
                  <Box sx={{ px: 2, py: 1, bgcolor: 'grey.50' }}>
                    <Typography variant="caption" fontWeight={600} color="text.secondary">
                      READ ({readMessages.length})
                    </Typography>
                  </Box>
                  {readMessages.map((message, index) => (
                    <Box key={message.id}>
                      <ListItem disablePadding>
                        <ListItemButton onClick={() => handleMessageClick(message.id)}>
                          <Box sx={{ mr: 2 }}>
                            <MailIcon color="action" />
                          </Box>
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                <Typography variant="body1" fontWeight={500}>
                                  {message.subject}
                                </Typography>
                                <Chip
                                  icon={getMessageTypeIcon(message.message_type)}
                                  label={message.message_type}
                                  size="small"
                                  color={getMessageTypeColor(message.message_type)}
                                  variant="outlined"
                                />
                              </Box>
                            }
                            secondary={
                              <Box>
                                <Typography variant="body2" color="text.secondary">
                                  From: {message.sender_name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {formatDate(message.created_at)}
                                </Typography>
                              </Box>
                            }
                          />
                        </ListItemButton>
                      </ListItem>
                      {index < readMessages.length - 1 && <Divider />}
                    </Box>
                  ))}
                </>
              )}
            </List>
          )}
        </Paper>
      </Container>
    </Box>
  );
};

export default ParentMessagesPage;
