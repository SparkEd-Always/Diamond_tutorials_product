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
  Chip,
  Divider,
} from "@mui/material";
import { useAuth } from "../contexts/AuthContext";
import { ledgerApi } from "../services/feeApi";
import SchoolIcon from "@mui/icons-material/School";
import AccountCircle from "@mui/icons-material/AccountCircle";
import DashboardIcon from "@mui/icons-material/Dashboard";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import CategoryIcon from "@mui/icons-material/Category";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import AssignmentIcon from "@mui/icons-material/Assignment";
import PeopleIcon from "@mui/icons-material/People";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import WarningIcon from "@mui/icons-material/Warning";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EventNoteIcon from "@mui/icons-material/EventNote";
import config from "../config";

const AdminFeeDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOutstanding: 0,
    totalCollected: 0,
    defaultersCount: 0,
    studentsWithFees: 0,
  });

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      setLoading(true);
      // Load ledger summaries to calculate stats
      const summaries = await ledgerApi.listSummaries();

      const totalOutstanding = summaries.reduce((sum, s) => sum + Number(s.total_outstanding), 0);
      const totalCollected = summaries.reduce((sum, s) => sum + Number(s.total_paid), 0);
      const defaultersCount = summaries.filter(s => s.is_defaulter).length;
      const studentsWithFees = summaries.length;

      setStats({
        totalOutstanding,
        totalCollected,
        defaultersCount,
        studentsWithFees,
      });
    } catch (error) {
      console.error("Failed to load dashboard stats:", error);
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

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
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
            {config.schoolName} - Fee Management Dashboard
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

      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Page Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom fontWeight={600} sx={{ display: 'flex', alignItems: 'center' }}>
            <AccountBalanceWalletIcon sx={{ mr: 2, fontSize: 40 }} />
            Fee Management Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Comprehensive overview of fee collection and management
          </Typography>
        </Box>

        {/* Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Total Outstanding
                    </Typography>
                    <Typography variant="h4" fontWeight={600} color="error.main" sx={{ wordBreak: 'break-word' }}>
                      {loading ? "..." : formatCurrency(stats.totalOutstanding)}
                    </Typography>
                  </Box>
                  <WarningIcon sx={{ fontSize: 40, color: 'error.light', opacity: 0.5, ml: 2, flexShrink: 0 }} />
                </Box>
                {stats.defaultersCount > 0 && (
                  <Chip
                    label={`${stats.defaultersCount} Defaulters`}
                    color="error"
                    size="small"
                  />
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Total Collected
                    </Typography>
                    <Typography variant="h4" fontWeight={600} color="success.main" sx={{ wordBreak: 'break-word' }}>
                      {loading ? "..." : formatCurrency(stats.totalCollected)}
                    </Typography>
                  </Box>
                  <TrendingUpIcon sx={{ fontSize: 40, color: 'success.light', opacity: 0.5, ml: 2, flexShrink: 0 }} />
                </Box>
                <Typography variant="caption" color="text.secondary">
                  All time collection
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Students with Fees
                    </Typography>
                    <Typography variant="h4" fontWeight={600} color="primary.main">
                      {loading ? "..." : stats.studentsWithFees}
                    </Typography>
                  </Box>
                  <PeopleIcon sx={{ fontSize: 40, color: 'primary.light', opacity: 0.5, ml: 2, flexShrink: 0 }} />
                </Box>
                <Typography variant="caption" color="text.secondary">
                  Active fee assignments
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Quick Actions */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CategoryIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6" fontWeight={600}>
                  Fee Configuration
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" paragraph>
                Manage fee types, structures, and configurations
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Button
                  variant="outlined"
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => navigate("/admin/fees/types")}
                  fullWidth
                >
                  Fee Types
                </Button>
                <Button
                  variant="outlined"
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => navigate("/admin/fees/structures")}
                  fullWidth
                >
                  Fee Structures
                </Button>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <EventNoteIcon sx={{ mr: 1, color: 'info.main' }} />
                <Typography variant="h6" fontWeight={600}>
                  Fee Sessions
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" paragraph>
                Bulk assign fees and track collections
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Button
                  variant="contained"
                  color="info"
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => navigate("/admin/fees/sessions")}
                  fullWidth
                >
                  Manage Sessions
                </Button>
                <Button
                  variant="outlined"
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => navigate("/admin/fees/sessions/create")}
                  fullWidth
                >
                  Create New Session
                </Button>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AssignmentIcon sx={{ mr: 1, color: 'success.main' }} />
                <Typography variant="h6" fontWeight={600}>
                  Student Management
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" paragraph>
                Assign fees and manage student payments
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Button
                  variant="outlined"
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => navigate("/admin/fees/assignments")}
                  fullWidth
                >
                  Fee Assignments
                </Button>
                <Button
                  variant="outlined"
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => navigate("/admin/fees/ledgers")}
                  fullWidth
                >
                  Student Ledgers
                </Button>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <ReceiptLongIcon sx={{ mr: 1, color: 'warning.main' }} />
                <Typography variant="h6" fontWeight={600}>
                  Payments & Reports
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" paragraph>
                Track payments and generate reports
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Button
                  variant="outlined"
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => navigate("/admin/fees/payments")}
                  fullWidth
                >
                  Payments
                </Button>
                <Button
                  variant="outlined"
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => navigate("/admin/fees/reports")}
                  fullWidth
                >
                  Reports
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* Alerts Section */}
        {stats.defaultersCount > 0 && (
          <Paper sx={{ p: 3, bgcolor: 'error.lighter', borderLeft: 4, borderColor: 'error.main' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <WarningIcon sx={{ mr: 1, color: 'error.main' }} />
              <Typography variant="h6" fontWeight={600} color="error.main">
                Attention Required
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" paragraph>
              {stats.defaultersCount} student(s) have fees overdue for more than 90 days. Immediate action required.
            </Typography>
            <Button
              variant="contained"
              color="error"
              onClick={() => navigate("/admin/fees/assignments")}
            >
              View Defaulters
            </Button>
          </Paper>
        )}

      </Container>
    </Box>
  );
};

export default AdminFeeDashboard;
