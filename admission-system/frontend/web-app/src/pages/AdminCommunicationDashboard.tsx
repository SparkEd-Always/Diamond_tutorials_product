import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  AppBar,
  Toolbar,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Divider,
  CardActionArea,
} from "@mui/material";
import { useAuth } from "../contexts/AuthContext";
import { communicationApi } from "../services/communicationApi";
import SchoolIcon from "@mui/icons-material/School";
import AccountCircle from "@mui/icons-material/AccountCircle";
import ForumIcon from "@mui/icons-material/Forum";
import SendIcon from "@mui/icons-material/Send";
import HistoryIcon from "@mui/icons-material/History";
import MarkEmailReadIcon from "@mui/icons-material/MarkEmailRead";
import MessageIcon from "@mui/icons-material/Message";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import config from "../config";

interface CommunicationStats {
  totalMessagesSent: number;
  messagesThisMonth: number;
  averageReadRate: number;
  totalRecipients: number;
}

const AdminCommunicationDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<CommunicationStats>({
    totalMessagesSent: 0,
    messagesThisMonth: 0,
    averageReadRate: 0,
    totalRecipients: 0,
  });

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await communicationApi.getStatistics();

      setStats({
        totalMessagesSent: response.total_messages || 0,
        messagesThisMonth: response.messages_this_month || 0,
        averageReadRate: response.average_read_rate || 0,
        totalRecipients: response.total_recipients || 0,
      });
    } catch (error) {
      console.error("Failed to load communication stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      {/* Header */}
      <AppBar position="static" elevation={1}>
        <Toolbar>
          <IconButton
            color="inherit"
            onClick={() => navigate("/dashboard")}
            sx={{ mr: 1 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <SchoolIcon sx={{ mr: 2 }} />
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            {config.schoolName} - Communication Dashboard
          </Typography>
          <Typography variant="body2" sx={{ mr: 2 }}>
            {user?.email}
          </Typography>
          <IconButton size="large" onClick={handleMenu} color="inherit">
            <AccountCircle />
          </IconButton>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
            <MenuItem onClick={() => navigate("/dashboard")}>
              Main Dashboard
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ py: 4, px: { xs: 2, sm: 3, md: 4 } }}>
        {/* Page Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom fontWeight={600} sx={{ display: 'flex', alignItems: 'center' }}>
            <ForumIcon sx={{ mr: 2, fontSize: 40 }} />
            Parent Communication Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage and track communication with parents and students
          </Typography>
        </Box>

        {/* Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Total Messages
                    </Typography>
                    <Typography variant="h4" fontWeight={600} color="primary.main">
                      {loading ? "..." : stats.totalMessagesSent}
                    </Typography>
                  </Box>
                  <MessageIcon sx={{ fontSize: 40, color: 'primary.light', opacity: 0.5 }} />
                </Box>
                <Typography variant="caption" color="text.secondary">
                  All time messages sent
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      This Month
                    </Typography>
                    <Typography variant="h4" fontWeight={600} color="info.main">
                      {loading ? "..." : stats.messagesThisMonth}
                    </Typography>
                  </Box>
                  <SendIcon sx={{ fontSize: 40, color: 'info.light', opacity: 0.5 }} />
                </Box>
                <Typography variant="caption" color="text.secondary">
                  Messages sent this month
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Read Rate
                    </Typography>
                    <Typography variant="h4" fontWeight={600} color="success.main">
                      {loading ? "..." : `${Math.round(stats.averageReadRate)}%`}
                    </Typography>
                  </Box>
                  <MarkEmailReadIcon sx={{ fontSize: 40, color: 'success.light', opacity: 0.5 }} />
                </Box>
                <Typography variant="caption" color="text.secondary">
                  Average message read rate
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Total Recipients
                    </Typography>
                    <Typography variant="h4" fontWeight={600} color="secondary.main">
                      {loading ? "..." : stats.totalRecipients}
                    </Typography>
                  </Box>
                  <AccountCircle sx={{ fontSize: 40, color: 'secondary.light', opacity: 0.5 }} />
                </Box>
                <Typography variant="caption" color="text.secondary">
                  Unique parent recipients
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Quick Actions */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom fontWeight={600}>
            Quick Actions
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardActionArea onClick={() => navigate('/admin/communication/send')}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <SendIcon sx={{ fontSize: 48, color: 'primary.main' }} />
                      <Box>
                        <Typography variant="h6" fontWeight={600} gutterBottom>
                          Send New Message
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Broadcast messages to specific classes or send direct messages to parents
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardActionArea onClick={() => navigate('/admin/communication/history')}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <HistoryIcon sx={{ fontSize: 48, color: 'success.main' }} />
                      <Box>
                        <Typography variant="h6" fontWeight={600} gutterBottom>
                          Message History
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          View all sent messages, delivery status, and read receipts
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          </Grid>
        </Box>

        {/* Communication Features */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Communication Features
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4}>
              <Box sx={{ p: 2, bgcolor: 'primary.lighter', borderRadius: 1 }}>
                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                  📢 Broadcast Messaging
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Send messages to entire classes or specific groups
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Box sx={{ p: 2, bgcolor: 'success.lighter', borderRadius: 1 }}>
                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                  ✅ Read Receipts
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Track which parents have read your messages
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Box sx={{ p: 2, bgcolor: 'info.lighter', borderRadius: 1 }}>
                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                  📊 Engagement Analytics
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Monitor message delivery and engagement rates
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </Box>
  );
};

export default AdminCommunicationDashboard;
