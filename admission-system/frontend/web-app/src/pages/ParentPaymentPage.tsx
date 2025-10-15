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
  Checkbox,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Chip,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Grid,
} from "@mui/material";
import { useAuth } from "../contexts/AuthContext";
import { ledgerApi } from "../services/feeApi";
import type { StudentFeeLedger } from "../types/fees";
import SchoolIcon from "@mui/icons-material/School";
import AccountCircle from "@mui/icons-material/AccountCircle";
import PaymentIcon from "@mui/icons-material/Payment";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import config from "../config";

interface SelectedFee {
  studentId: number;
  ledgerId: number;
  amount: number;
  studentName: string;
}

const ParentPaymentPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [ledgerSummaries, setLedgerSummaries] = useState<StudentFeeLedger[]>([]);
  const [selectedFees, setSelectedFees] = useState<SelectedFee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'online' | 'offline'>('online');
  const [paymentMode, setPaymentMode] = useState<string>('upi');
  const [customAmounts, setCustomAmounts] = useState<Record<number, string>>({});

  useEffect(() => {
    loadPendingFees();
  }, []);

  const loadPendingFees = async () => {
    try {
      setLoading(true);
      setError(null);
      const summaries = await ledgerApi.listSummaries();
      // Filter only students with outstanding balance
      const pendingSummaries = summaries.filter(s => s.total_outstanding > 0);
      setLedgerSummaries(pendingSummaries);
    } catch (err: any) {
      console.error("Failed to load pending fees:", err);
      setError(err.response?.data?.detail || "Failed to load fee information");
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

  const handleSelectFee = (ledger: StudentFeeLedger, checked: boolean) => {
    if (checked) {
      const customAmount = customAmounts[ledger.id];
      const amount = customAmount ? parseFloat(customAmount) : ledger.total_outstanding;

      setSelectedFees([...selectedFees, {
        studentId: ledger.student_id,
        ledgerId: ledger.id,
        amount: amount,
        studentName: `Student #${ledger.student_id}`
      }]);
    } else {
      setSelectedFees(selectedFees.filter(f => f.ledgerId !== ledger.id));
    }
  };

  const handleCustomAmountChange = (ledgerId: number, value: string) => {
    setCustomAmounts({
      ...customAmounts,
      [ledgerId]: value
    });

    // Update selected fee amount if already selected
    setSelectedFees(selectedFees.map(fee =>
      fee.ledgerId === ledgerId
        ? { ...fee, amount: parseFloat(value) || 0 }
        : fee
    ));
  };

  const calculateTotalPayment = () => {
    return selectedFees.reduce((sum, fee) => sum + fee.amount, 0);
  };

  const handleProceedToPayment = () => {
    if (selectedFees.length === 0) {
      setError("Please select at least one fee to pay");
      return;
    }
    setPaymentDialogOpen(true);
  };

  const handleConfirmPayment = async () => {
    try {
      // TODO: Integrate with actual payment API
      // For now, just show success message

      if (paymentMethod === 'online') {
        // Redirect to payment gateway
        alert(`Redirecting to payment gateway for ₹${calculateTotalPayment().toLocaleString('en-IN', { minimumFractionDigits: 2 })} via ${paymentMode.toUpperCase()}`);
      } else {
        // Show offline payment instructions
        alert(`Please submit ₹${calculateTotalPayment().toLocaleString('en-IN', { minimumFractionDigits: 2 })} to school office. Reference number will be generated.`);
      }

      setPaymentDialogOpen(false);
      setSelectedFees([]);
      setCustomAmounts({});
      navigate("/parent/fees/history");
    } catch (err: any) {
      console.error("Payment failed:", err);
      setError(err.response?.data?.detail || "Payment failed. Please try again.");
    }
  };

  const isSelected = (ledgerId: number) => {
    return selectedFees.some(f => f.ledgerId === ledgerId);
  };

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
            <PaymentIcon sx={{ mr: 1, fontSize: 28 }} />
            Make Payment
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Select fees to pay and proceed with payment.
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
            <CircularProgress />
          </Box>
        ) : ledgerSummaries.length === 0 ? (
          <Card sx={{ p: 4, textAlign: "center" }}>
            <Typography variant="h6" color="text.secondary" paragraph>
              No pending fees
            </Typography>
            <Typography color="text.secondary" paragraph>
              All your fees are paid. Thank you!
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate("/parent/fees")}
            >
              Back to Dashboard
            </Button>
          </Card>
        ) : (
          <>
            {/* Pending Fees List */}
            <TableContainer component={Paper} sx={{ mb: 3 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox">
                      <strong>Select</strong>
                    </TableCell>
                    <TableCell><strong>Student</strong></TableCell>
                    <TableCell><strong>Total Amount</strong></TableCell>
                    <TableCell><strong>Outstanding</strong></TableCell>
                    <TableCell><strong>Overdue</strong></TableCell>
                    <TableCell><strong>Custom Amount</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {ledgerSummaries.map((ledger) => {
                    const totalOverdue = ledger.overdue_0_30_days + ledger.overdue_30_60_days + ledger.overdue_60_90_days + ledger.overdue_90_plus_days;
                    return (
                      <TableRow key={ledger.id} hover>
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={isSelected(ledger.id)}
                          onChange={(e) => handleSelectFee(ledger, e.target.checked)}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          Student #{ledger.student_id}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Academic Year #{ledger.academic_year_id}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        ₹{ledger.total_fees_assigned.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell>
                        <Typography color="error.main" fontWeight={500}>
                          ₹{ledger.total_outstanding.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {totalOverdue > 0 ? (
                          <Typography color="error.main" fontWeight={500}>
                            ₹{totalOverdue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </Typography>
                        ) : (
                          <Typography color="text.secondary">-</Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <TextField
                          type="number"
                          size="small"
                          placeholder={ledger.total_outstanding.toString()}
                          value={customAmounts[ledger.id] || ''}
                          onChange={(e) => handleCustomAmountChange(ledger.id, e.target.value)}
                          inputProps={{
                            min: 0,
                            max: ledger.total_outstanding,
                            step: 0.01
                          }}
                          sx={{ width: 120 }}
                          disabled={!isSelected(ledger.id)}
                        />
                      </TableCell>
                      <TableCell>
                        {ledger.is_defaulter ? (
                          <Chip label="Defaulter" color="error" size="small" />
                        ) : totalOverdue > 0 ? (
                          <Chip label="Overdue" color="warning" size="small" />
                        ) : (
                          <Chip label="Pending" color="info" size="small" />
                        )}
                      </TableCell>
                    </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Payment Summary */}
            <Paper sx={{ p: 3 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Payment Summary
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {selectedFees.length} fee(s) selected for payment
                  </Typography>
                  {selectedFees.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      {selectedFees.map((fee) => (
                        <Box key={fee.ledgerId} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2">{fee.studentName}</Typography>
                          <Typography variant="body2" fontWeight={500}>
                            ₹{fee.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  )}
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card sx={{ bgcolor: 'primary.main', color: 'white' }}>
                    <CardContent>
                      <Typography variant="body2" gutterBottom>
                        Total Amount
                      </Typography>
                      <Typography variant="h4" fontWeight={600}>
                        ₹{calculateTotalPayment().toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </Typography>
                      <Button
                        variant="contained"
                        fullWidth
                        size="large"
                        startIcon={<PaymentIcon />}
                        onClick={handleProceedToPayment}
                        disabled={selectedFees.length === 0}
                        sx={{
                          mt: 2,
                          bgcolor: 'white',
                          color: 'primary.main',
                          '&:hover': { bgcolor: 'grey.100' },
                          '&:disabled': { bgcolor: 'grey.300', color: 'grey.500' }
                        }}
                      >
                        Proceed to Pay
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Paper>
          </>
        )}
      </Container>

      {/* Payment Method Dialog */}
      <Dialog open={paymentDialogOpen} onClose={() => setPaymentDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Typography variant="h6" fontWeight={600}>
            Select Payment Method
          </Typography>
        </DialogTitle>
        <DialogContent>
          <FormControl component="fieldset" fullWidth sx={{ mt: 2 }}>
            <FormLabel component="legend">Payment Method</FormLabel>
            <RadioGroup
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as 'online' | 'offline')}
            >
              <FormControlLabel
                value="online"
                control={<Radio />}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CreditCardIcon sx={{ mr: 1 }} />
                    <Box>
                      <Typography variant="body1" fontWeight={500}>Online Payment</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Pay instantly via UPI, Credit/Debit Card, Net Banking
                      </Typography>
                    </Box>
                  </Box>
                }
              />
              <FormControlLabel
                value="offline"
                control={<Radio />}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <AccountBalanceIcon sx={{ mr: 1 }} />
                    <Box>
                      <Typography variant="body1" fontWeight={500}>Offline Payment</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Pay at school office via Cash, Cheque, Demand Draft
                      </Typography>
                    </Box>
                  </Box>
                }
              />
            </RadioGroup>
          </FormControl>

          {paymentMethod === 'online' && (
            <FormControl component="fieldset" fullWidth sx={{ mt: 3 }}>
              <FormLabel component="legend">Payment Mode</FormLabel>
              <RadioGroup
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value)}
              >
                <FormControlLabel value="upi" control={<Radio />} label="UPI (Google Pay, PhonePe, Paytm)" />
                <FormControlLabel value="card" control={<Radio />} label="Credit/Debit Card" />
                <FormControlLabel value="netbanking" control={<Radio />} label="Net Banking" />
                <FormControlLabel value="wallet" control={<Radio />} label="Wallet (Paytm, PhonePe)" />
              </RadioGroup>
            </FormControl>
          )}

          <Paper sx={{ p: 2, mt: 3, bgcolor: 'grey.50' }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Amount to be paid
            </Typography>
            <Typography variant="h5" fontWeight={600} color="primary">
              ₹{calculateTotalPayment().toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </Typography>
          </Paper>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={() => setPaymentDialogOpen(false)} variant="outlined">
            Cancel
          </Button>
          <Button onClick={handleConfirmPayment} variant="contained" autoFocus>
            Confirm & Pay
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ParentPaymentPage;
