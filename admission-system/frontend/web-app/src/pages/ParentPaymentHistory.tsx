import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  AppBar,
  Toolbar,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  CircularProgress,
  Chip,
  TextField,
  Grid,
  Divider,
} from "@mui/material";
import { useAuth } from "../contexts/AuthContext";
import SchoolIcon from "@mui/icons-material/School";
import AccountCircle from "@mui/icons-material/AccountCircle";
import HistoryIcon from "@mui/icons-material/History";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DownloadIcon from "@mui/icons-material/Download";
import ReceiptIcon from "@mui/icons-material/Receipt";
import FilterListIcon from "@mui/icons-material/FilterList";
import config from "../config";

interface Payment {
  id: number;
  payment_date: string;
  amount: number;
  payment_mode: string;
  payment_method: 'online' | 'offline';
  transaction_id: string;
  student_name: string;
  fee_type: string;
  status: 'pending' | 'completed' | 'failed';
  receipt_number?: string;
}

const ParentPaymentHistory = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStartDate, setFilterStartDate] = useState<string>('');
  const [filterEndDate, setFilterEndDate] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    loadPaymentHistory();
  }, []);

  const loadPaymentHistory = async () => {
    try {
      setLoading(true);
      setError(null);

      // TODO: Replace with actual API call
      // const payments = await paymentApi.listPayments({ parent_id: user.id });

      // Dummy data for demonstration
      const dummyPayments: Payment[] = [
        {
          id: 1,
          payment_date: '2025-10-10',
          amount: 25000,
          payment_mode: 'upi',
          payment_method: 'online',
          transaction_id: 'TXN001234567890',
          student_name: 'Student #1',
          fee_type: 'Tuition Fee',
          status: 'completed',
          receipt_number: 'RCP-2025-001'
        },
        {
          id: 2,
          payment_date: '2025-09-15',
          amount: 5000,
          payment_mode: 'cash',
          payment_method: 'offline',
          transaction_id: 'OFF-001',
          student_name: 'Student #1',
          fee_type: 'Transport Fee',
          status: 'completed',
          receipt_number: 'RCP-2025-002'
        },
        {
          id: 3,
          payment_date: '2025-08-20',
          amount: 3000,
          payment_mode: 'netbanking',
          payment_method: 'online',
          transaction_id: 'TXN987654321098',
          student_name: 'Student #2',
          fee_type: 'Activity Fee',
          status: 'completed',
          receipt_number: 'RCP-2025-003'
        },
      ];

      setPayments(dummyPayments);
    } catch (err: any) {
      console.error("Failed to load payment history:", err);
      setError(err.response?.data?.detail || "Failed to load payment history");
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

  const handleDownloadReceipt = (paymentId: number, receiptNumber: string) => {
    // TODO: Implement receipt download
    alert(`Downloading receipt ${receiptNumber} for payment #${paymentId}`);
  };

  const getFilteredPayments = () => {
    return payments.filter(payment => {
      // Filter by date range
      if (filterStartDate && payment.payment_date < filterStartDate) return false;
      if (filterEndDate && payment.payment_date > filterEndDate) return false;

      // Filter by status
      if (filterStatus !== 'all' && payment.status !== filterStatus) return false;

      return true;
    });
  };

  const calculateTotalPaid = () => {
    return getFilteredPayments()
      .filter(p => p.status === 'completed')
      .reduce((sum, payment) => sum + payment.amount, 0);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'pending': return 'warning';
      case 'failed': return 'error';
      default: return 'default';
    }
  };

  const getPaymentMethodLabel = (method: string, mode: string) => {
    if (method === 'online') {
      return mode.toUpperCase();
    }
    return mode.charAt(0).toUpperCase() + mode.slice(1);
  };

  const filteredPayments = getFilteredPayments();

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      {/* Header */}
      <AppBar position="static" elevation={1}>
        <Toolbar sx={{ minHeight: { xs: 48, sm: 56 } }}>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => navigate("/parent/fees")}
            sx={{ mr: 1 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <SchoolIcon sx={{ mr: 1.5, fontSize: 24 }} />
          <Typography variant="h6" sx={{ flexGrow: 1, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
            {config.schoolName}
          </Typography>
          <IconButton onClick={handleMenu} color="inherit" size="medium">
            <AccountCircle />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            <MenuItem disabled>
              <Typography variant="body2" color="text.secondary">
                {user?.email}
              </Typography>
            </MenuItem>
            <MenuItem onClick={() => navigate("/dashboard")}>Dashboard</MenuItem>
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ py: 4, px: { xs: 2, sm: 3, md: 4 } }}>
        {/* Page Header */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" gutterBottom fontWeight={600} sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
            <HistoryIcon sx={{ mr: 1, fontSize: 28 }} />
            Payment History
          </Typography>
          <Typography variant="body2" color="text.secondary">
            View all your fee payment transactions and download receipts.
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Summary Card */}
        <Card sx={{ mb: 3, bgcolor: 'primary.main', color: 'white' }}>
          <CardContent>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={4}>
                <Typography variant="body2" gutterBottom>
                  Total Payments
                </Typography>
                <Typography variant="h4" fontWeight={600}>
                  {filteredPayments.length}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="body2" gutterBottom>
                  Total Amount Paid
                </Typography>
                <Typography variant="h4" fontWeight={600}>
                  ₹{calculateTotalPaid().toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="body2" gutterBottom>
                  Completed Transactions
                </Typography>
                <Typography variant="h4" fontWeight={600}>
                  {filteredPayments.filter(p => p.status === 'completed').length}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Filters */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <FilterListIcon sx={{ mr: 1 }} />
            <Typography variant="h6" fontWeight={600}>
              Filters
            </Typography>
          </Box>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <TextField
                label="From Date"
                type="date"
                fullWidth
                size="small"
                value={filterStartDate}
                onChange={(e) => setFilterStartDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="To Date"
                type="date"
                fullWidth
                size="small"
                value={filterEndDate}
                onChange={(e) => setFilterEndDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Status"
                select
                fullWidth
                size="small"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                SelectProps={{ native: true }}
              >
                <option value="all">All</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </TextField>
            </Grid>
          </Grid>
          {(filterStartDate || filterEndDate || filterStatus !== 'all') && (
            <Button
              size="small"
              onClick={() => {
                setFilterStartDate('');
                setFilterEndDate('');
                setFilterStatus('all');
              }}
              sx={{ mt: 2 }}
            >
              Clear Filters
            </Button>
          )}
        </Paper>

        {/* Payment History Table */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
            <CircularProgress />
          </Box>
        ) : filteredPayments.length === 0 ? (
          <Card sx={{ p: 4, textAlign: "center" }}>
            <Typography variant="h6" color="text.secondary" paragraph>
              No payment history found
            </Typography>
            <Typography color="text.secondary" paragraph>
              Your payment transactions will appear here once you make payments.
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate("/parent/fees/pay")}
            >
              Make Payment
            </Button>
          </Card>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Payment Date</strong></TableCell>
                  <TableCell><strong>Student</strong></TableCell>
                  <TableCell><strong>Fee Type</strong></TableCell>
                  <TableCell><strong>Amount</strong></TableCell>
                  <TableCell><strong>Payment Mode</strong></TableCell>
                  <TableCell><strong>Transaction ID</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell align="right"><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredPayments.map((payment) => (
                  <TableRow key={payment.id} hover>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(payment.payment_date).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>
                        {payment.student_name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {payment.fee_type}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600} color="success.main">
                        ₹{payment.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getPaymentMethodLabel(payment.payment_method, payment.payment_mode)}
                        size="small"
                        variant="outlined"
                        color={payment.payment_method === 'online' ? 'primary' : 'default'}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                        {payment.transaction_id}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={payment.status.toUpperCase()}
                        size="small"
                        color={getStatusColor(payment.status) as any}
                      />
                    </TableCell>
                    <TableCell align="right">
                      {payment.status === 'completed' && payment.receipt_number && (
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<DownloadIcon />}
                          onClick={() => handleDownloadReceipt(payment.id, payment.receipt_number!)}
                        >
                          Receipt
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Container>
    </Box>
  );
};

export default ParentPaymentHistory;
