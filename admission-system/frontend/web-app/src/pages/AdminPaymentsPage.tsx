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
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Alert,
  Divider,
  CircularProgress,
} from "@mui/material";
import { useAuth } from "../contexts/AuthContext";
import SchoolIcon from "@mui/icons-material/School";
import AccountCircle from "@mui/icons-material/AccountCircle";
import PaymentIcon from "@mui/icons-material/Payment";
import AddIcon from "@mui/icons-material/Add";
import ReceiptIcon from "@mui/icons-material/Receipt";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import config from "../config";

interface Payment {
  id: number;
  student_id: number;
  amount: number;
  payment_method: 'cash' | 'cheque' | 'dd' | 'bank_transfer';
  payment_date: string;
  reference_number?: string;
  remarks?: string;
  recorded_by: string;
  receipt_number: string;
}

const AdminPaymentsPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    student_id: '',
    amount: '',
    payment_method: 'cash',
    payment_date: new Date().toISOString().split('T')[0],
    reference_number: '',
    remarks: '',
  });

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      // const data = await paymentApi.listOfflinePayments();

      // Dummy data for demonstration
      const dummyPayments: Payment[] = [
        {
          id: 1,
          student_id: 1,
          amount: 25000,
          payment_method: 'cash',
          payment_date: '2025-10-15',
          receipt_number: 'REC/2025-26/001',
          recorded_by: 'Admin',
          remarks: 'Full payment for Q1'
        },
        {
          id: 2,
          student_id: 5,
          amount: 15000,
          payment_method: 'cheque',
          payment_date: '2025-10-14',
          reference_number: 'CHQ123456',
          receipt_number: 'REC/2025-26/002',
          recorded_by: 'Admin',
          remarks: 'Cheque payment'
        },
      ];

      setPayments(dummyPayments);
    } catch (err: any) {
      console.error("Failed to load payments:", err);
      setError("Failed to load payment records");
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

  const handleOpenDialog = () => {
    setOpenDialog(true);
    setError(null);
    setSuccess(null);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData({
      student_id: '',
      amount: '',
      payment_method: 'cash',
      payment_date: new Date().toISOString().split('T')[0],
      reference_number: '',
      remarks: '',
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    try {
      // Validation
      if (!formData.student_id || !formData.amount || !formData.payment_date) {
        setError("Please fill in all required fields");
        return;
      }

      if (parseFloat(formData.amount) <= 0) {
        setError("Amount must be greater than 0");
        return;
      }

      if (formData.payment_method !== 'cash' && !formData.reference_number) {
        setError("Reference number is required for non-cash payments");
        return;
      }

      // TODO: Replace with actual API call
      // await paymentApi.recordOfflinePayment(formData);

      // Simulate successful payment recording
      const newPayment: Payment = {
        id: payments.length + 1,
        student_id: parseInt(formData.student_id),
        amount: parseFloat(formData.amount),
        payment_method: formData.payment_method as any,
        payment_date: formData.payment_date,
        reference_number: formData.reference_number || undefined,
        remarks: formData.remarks || undefined,
        recorded_by: user?.email || 'Admin',
        receipt_number: `REC/2025-26/${String(payments.length + 3).padStart(3, '0')}`,
      };

      setPayments([newPayment, ...payments]);
      setSuccess(`Payment recorded successfully! Receipt: ${newPayment.receipt_number}`);
      handleCloseDialog();

      // Auto-hide success message after 5 seconds
      setTimeout(() => setSuccess(null), 5000);
    } catch (err: any) {
      console.error("Failed to record payment:", err);
      setError(err.response?.data?.detail || "Failed to record payment");
    }
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getPaymentMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      cash: 'Cash',
      cheque: 'Cheque',
      dd: 'Demand Draft',
      bank_transfer: 'Bank Transfer',
    };
    return labels[method] || method;
  };

  const getPaymentMethodColor = (method: string) => {
    const colors: Record<string, "default" | "primary" | "secondary" | "success" | "warning" | "info"> = {
      cash: 'success',
      cheque: 'primary',
      dd: 'secondary',
      bank_transfer: 'info',
    };
    return colors[method] || 'default';
  };

  const getTodayTotal = () => {
    const today = new Date().toISOString().split('T')[0];
    return payments
      .filter(p => p.payment_date === today)
      .reduce((sum, p) => sum + p.amount, 0);
  };

  const getTodayCount = () => {
    const today = new Date().toISOString().split('T')[0];
    return payments.filter(p => p.payment_date === today).length;
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      {/* Header */}
      <AppBar position="static" elevation={1}>
        <Toolbar>
          <SchoolIcon sx={{ mr: 2 }} />
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            {config.schoolName} - Admin Portal
          </Typography>
          <Button
            color="inherit"
            onClick={() => navigate("/admin/fees/dashboard")}
            sx={{ mr: 2 }}
          >
            Fee Dashboard
          </Button>
          <IconButton onClick={handleMenu} color="inherit">
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
            <MenuItem onClick={() => navigate("/admin/dashboard")}>
              Admission Dashboard
            </MenuItem>
            <MenuItem onClick={() => navigate("/admin/fees/dashboard")}>
              Fee Dashboard
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Box sx={{ py: 4, width: '100%', overflow: 'hidden' }}>
        {/* Page Header */}
        <Box sx={{ px: 2, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate("/admin/fees/dashboard")}
              sx={{ mr: 2 }}
            >
              Back to Fee Dashboard
            </Button>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h5" gutterBottom fontWeight={600} sx={{ display: 'flex', alignItems: 'center' }}>
                <PaymentIcon sx={{ mr: 1, fontSize: 28 }} />
                Offline Payments
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Record cash, cheque, and DD payments received at school office
              </Typography>
            </Box>
            <Button
              variant="contained"
              size="large"
              startIcon={<AddIcon />}
              onClick={handleOpenDialog}
            >
              Record Payment
            </Button>
          </Box>
        </Box>

        {/* Alerts */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        )}

        {/* Today's Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 4, width: '100%', m: 0, px: 2 }}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <AccountBalanceIcon sx={{ color: 'success.main', mr: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    Today's Collection
                  </Typography>
                </Box>
                <Typography variant="h4" fontWeight={600} color="success.main">
                  {formatCurrency(getTodayTotal())}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {getTodayCount()} transactions today
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <ReceiptIcon sx={{ color: 'primary.main', mr: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    Total Payments
                  </Typography>
                </Box>
                <Typography variant="h4" fontWeight={600} color="primary.main">
                  {payments.length}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  All recorded payments
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <PaymentIcon sx={{ color: 'info.main', mr: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    Total Amount
                  </Typography>
                </Box>
                <Typography variant="h4" fontWeight={600} color="info.main">
                  {formatCurrency(payments.reduce((sum, p) => sum + p.amount, 0))}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  All time collection
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Payments Table */}
        <Box sx={{ px: 2 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Receipt No.</strong></TableCell>
                  <TableCell><strong>Student ID</strong></TableCell>
                  <TableCell><strong>Payment Date</strong></TableCell>
                  <TableCell align="right"><strong>Amount</strong></TableCell>
                  <TableCell><strong>Payment Method</strong></TableCell>
                  <TableCell><strong>Reference No.</strong></TableCell>
                  <TableCell><strong>Remarks</strong></TableCell>
                  <TableCell><strong>Recorded By</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {payments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                      <Typography variant="body1" color="text.secondary" paragraph>
                        No payments recorded yet
                      </Typography>
                      <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleOpenDialog}
                      >
                        Record First Payment
                      </Button>
                    </TableCell>
                  </TableRow>
                ) : (
                  payments.map((payment) => (
                    <TableRow key={payment.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600} sx={{ fontFamily: 'monospace' }}>
                          {payment.receipt_number}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>
                          {payment.student_id}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {new Date(payment.payment_date).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight={600} color="success.main">
                          {formatCurrency(payment.amount)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getPaymentMethodLabel(payment.payment_method)}
                          color={getPaymentMethodColor(payment.payment_method)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                          {payment.reference_number || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {payment.remarks || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {payment.recorded_by}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
        </Box>
      </Box>

      {/* Record Payment Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Typography variant="h6" fontWeight={600}>
            Record Offline Payment
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Student ID"
                  type="number"
                  required
                  value={formData.student_id}
                  onChange={(e) => handleInputChange('student_id', e.target.value)}
                  helperText="Enter the student ID"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Amount"
                  type="number"
                  required
                  value={formData.amount}
                  onChange={(e) => handleInputChange('amount', e.target.value)}
                  InputProps={{
                    startAdornment: <Typography sx={{ mr: 1 }}>₹</Typography>,
                  }}
                  helperText="Payment amount"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Payment Date"
                  type="date"
                  required
                  value={formData.payment_date}
                  onChange={(e) => handleInputChange('payment_date', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  select
                  label="Payment Method"
                  required
                  value={formData.payment_method}
                  onChange={(e) => handleInputChange('payment_method', e.target.value)}
                  SelectProps={{ native: true }}
                >
                  <option value="cash">Cash</option>
                  <option value="cheque">Cheque</option>
                  <option value="dd">Demand Draft</option>
                  <option value="bank_transfer">Bank Transfer</option>
                </TextField>
              </Grid>

              {formData.payment_method !== 'cash' && (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Reference Number"
                    required
                    value={formData.reference_number}
                    onChange={(e) => handleInputChange('reference_number', e.target.value)}
                    helperText={
                      formData.payment_method === 'cheque' ? 'Cheque number' :
                      formData.payment_method === 'dd' ? 'DD number' :
                      'Transaction reference'
                    }
                  />
                </Grid>
              )}

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Remarks"
                  multiline
                  rows={2}
                  value={formData.remarks}
                  onChange={(e) => handleInputChange('remarks', e.target.value)}
                  helperText="Optional notes about this payment"
                />
              </Grid>
            </Grid>

            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={handleCloseDialog} variant="outlined">
            Cancel
          </Button>
          <Button onClick={handleSubmit} variant="contained" autoFocus>
            Record Payment & Generate Receipt
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminPaymentsPage;
