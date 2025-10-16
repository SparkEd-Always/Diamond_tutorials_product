import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Paper,
  Chip,
  AppBar,
  Toolbar,
  IconButton,
  CircularProgress,
  Alert,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Stack,
  Card,
  CardContent,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import communicationApi from '../services/communicationApi';
import type { Message, MessageDelivery, MessageType } from '../types/communication';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SchoolIcon from '@mui/icons-material/School';
import MailIcon from '@mui/icons-material/Mail';
import CampaignIcon from '@mui/icons-material/Campaign';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SendIcon from '@mui/icons-material/Send';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ErrorIcon from '@mui/icons-material/Error';
import config from '../config';

const MessageDetailsPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const [message, setMessage] = useState<Message | null>(null);
  const [deliveries, setDeliveries] = useState<MessageDelivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isParent, setIsParent] = useState(false);

  useEffect(() => {
    if (id) {
      loadMessageDetails();
      // Check if user is parent (simplified check)
      setIsParent(user?.role === 'parent' || window.location.pathname.includes('/parent/'));
    }
  }, [id]);

  const loadMessageDetails = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const messageData = await communicationApi.getMessage(parseInt(id));
      setMessage(messageData);

      // Mark as read if parent is viewing
      if (window.location.pathname.includes('/parent/')) {
        await communicationApi.markAsRead(parseInt(id));
      }

      // Load delivery status if teacher/admin is viewing
      if (!window.location.pathname.includes('/parent/')) {
        const deliveryData = await communicationApi.getDeliveryStatus(parseInt(id));
        setDeliveries(deliveryData);
      }

      setError(null);
    } catch (err: any) {
      console.error('Failed to load message details:', err);
      setError(err.response?.data?.detail || 'Failed to load message details');
    } finally {
      setLoading(false);
    }
  };

  const getMessageTypeIcon = (type: MessageType) => {
    switch (type) {
      case 'broadcast':
      case 'announcement':
        return <CampaignIcon />;
      case 'direct':
        return <MailIcon />;
      default:
        return <MailIcon />;
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

  const getDeliveryStatusIcon = (status: string) => {
    switch (status) {
      case 'read':
        return <CheckCircleIcon color="success" fontSize="small" />;
      case 'delivered':
        return <VisibilityIcon color="info" fontSize="small" />;
      case 'sent':
        return <SendIcon color="action" fontSize="small" />;
      case 'failed':
        return <ErrorIcon color="error" fontSize="small" />;
      default:
        return <SendIcon color="action" fontSize="small" />;
    }
  };

  const getDeliveryStatusColor = (status: string): 'success' | 'info' | 'warning' | 'error' | 'default' => {
    switch (status) {
      case 'read':
        return 'success';
      case 'delivered':
        return 'info';
      case 'sent':
        return 'warning';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        <AppBar position="static" elevation={1}>
          <Toolbar>
            <IconButton edge="start" color="inherit" onClick={() => navigate(-1)}>
              <ArrowBackIcon />
            </IconButton>
            <SchoolIcon sx={{ ml: 1, mr: 2 }} />
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              {config.schoolName}
            </Typography>
          </Toolbar>
        </AppBar>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  if (error || !message) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        <AppBar position="static" elevation={1}>
          <Toolbar>
            <IconButton edge="start" color="inherit" onClick={() => navigate(-1)}>
              <ArrowBackIcon />
            </IconButton>
            <SchoolIcon sx={{ ml: 1, mr: 2 }} />
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              {config.schoolName}
            </Typography>
          </Toolbar>
        </AppBar>
        <Container maxWidth="md" sx={{ py: 4 }}>
          <Alert severity="error">{error || 'Message not found'}</Alert>
        </Container>
      </Box>
    );
  }

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
            {config.schoolName} - Message Details
          </Typography>
          <Typography variant="body2" sx={{ mr: 2 }}>
            {user?.email}
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4, px: { xs: 2, sm: 3, md: 4 } }}>
        {/* Message Card */}
        <Paper sx={{ p: 4, mb: 3 }}>
          {/* Message Header */}
          <Box sx={{ mb: 3 }}>
            <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
              <Chip
                icon={getMessageTypeIcon(message.message_type)}
                label={message.message_type.toUpperCase()}
                color={getMessageTypeColor(message.message_type)}
              />
              {message.target_class_name && (
                <Chip label={message.target_class_name} variant="outlined" />
              )}
            </Stack>
            <Typography variant="h4" fontWeight={600} gutterBottom>
              {message.subject}
            </Typography>
            <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                <strong>From:</strong> {message.sender_name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Sent:</strong> {formatDate(message.sent_at)}
              </Typography>
            </Stack>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Message Body */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>
              {message.body}
            </Typography>
          </Box>

          {/* Attachments (if any) */}
          {message.attachments && message.attachments.length > 0 && (
            <>
              <Divider sx={{ my: 3 }} />
              <Box>
                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                  Attachments:
                </Typography>
                {message.attachments.map((attachment, index) => (
                  <Chip key={index} label={attachment} sx={{ mr: 1, mb: 1 }} />
                ))}
              </Box>
            </>
          )}
        </Paper>

        {/* Delivery Statistics (for teachers/admins only) */}
        {!isParent && (
          <>
            {/* Stats Cards */}
            <Box sx={{ mb: 3 }}>
              <Stack direction="row" spacing={2}>
                <Card sx={{ flex: 1 }}>
                  <CardContent>
                    <Typography variant="h3" fontWeight={600} color="primary.main">
                      {message.total_recipients || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Recipients
                    </Typography>
                  </CardContent>
                </Card>
                <Card sx={{ flex: 1 }}>
                  <CardContent>
                    <Typography variant="h3" fontWeight={600} color="info.main">
                      {message.delivered_count || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Delivered
                    </Typography>
                  </CardContent>
                </Card>
                <Card sx={{ flex: 1 }}>
                  <CardContent>
                    <Typography variant="h3" fontWeight={600} color="success.main">
                      {message.read_count || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Read
                    </Typography>
                  </CardContent>
                </Card>
                <Card sx={{ flex: 1 }}>
                  <CardContent>
                    <Typography variant="h3" fontWeight={600} color="error.main">
                      {message.failed_count || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Failed
                    </Typography>
                  </CardContent>
                </Card>
              </Stack>
            </Box>

            {/* Delivery Details Table */}
            <Paper>
              <Box sx={{ p: 2, bgcolor: 'grey.50' }}>
                <Typography variant="h6" fontWeight={600}>
                  Delivery Status
                </Typography>
              </Box>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>
                        <Typography variant="subtitle2" fontWeight={600}>
                          Recipient
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="subtitle2" fontWeight={600}>
                          Status
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="subtitle2" fontWeight={600}>
                          Delivered At
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="subtitle2" fontWeight={600}>
                          Read At
                        </Typography>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {deliveries.map((delivery) => (
                      <TableRow key={delivery.id} hover>
                        <TableCell>
                          <Typography variant="body2">{delivery.recipient_name}</Typography>
                          {delivery.recipient_email && (
                            <Typography variant="caption" color="text.secondary" display="block">
                              {delivery.recipient_email}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={getDeliveryStatusIcon(delivery.status)}
                            label={delivery.status.toUpperCase()}
                            color={getDeliveryStatusColor(delivery.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(delivery.delivered_at)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(delivery.read_at)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </>
        )}
      </Container>
    </Box>
  );
};

export default MessageDetailsPage;
