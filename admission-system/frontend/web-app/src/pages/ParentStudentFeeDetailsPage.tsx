import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
  Divider,
  Grid,
} from "@mui/material";
import { useAuth } from "../contexts/AuthContext";
import { ledgerApi, assignmentApi } from "../services/feeApi";
import type { StudentFeeLedger, StudentFeeAssignment } from "../types/fees";
import SchoolIcon from "@mui/icons-material/School";
import AccountCircle from "@mui/icons-material/AccountCircle";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import PaymentIcon from "@mui/icons-material/Payment";
import WarningIcon from "@mui/icons-material/Warning";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HistoryIcon from "@mui/icons-material/History";
import config from "../config";

const ParentStudentFeeDetailsPage = () => {
  const navigate = useNavigate();
  const { studentId } = useParams<{ studentId: string }>();
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [ledger, setLedger] = useState<StudentFeeLedger | null>(null);
  const [assignments, setAssignments] = useState<StudentFeeAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (studentId) {
      loadStudentFeeDetails();
    }
  }, [studentId]);

  const loadStudentFeeDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load ledger and assignments
      const studentIdNum = parseInt(studentId!);
      const ledgerData = await ledgerApi.getStudentLedger(studentIdNum);
      const assignmentsData = await assignmentApi.list({ student_id: studentIdNum });

      setLedger(ledgerData);
      setAssignments(assignmentsData);
    } catch (err: any) {
      console.error("Failed to load student fee details:", err);
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

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getTotalOverdue = () => {
    if (!ledger) return 0;
    return ledger.overdue_0_30_days + ledger.overdue_30_60_days +
           ledger.overdue_60_90_days + ledger.overdue_90_plus_days;
  };

  const getPaymentStatus = () => {
    if (!ledger) return null;
    if (ledger.is_defaulter) {
      return { label: "Defaulter", color: "error", icon: <WarningIcon /> };
    }
    if (ledger.has_overdue) {
      return { label: "Overdue", color: "warning", icon: <WarningIcon /> };
    }
    if (ledger.total_outstanding > 0) {
      return { label: "Pending", color: "info", icon: <ReceiptLongIcon /> };
    }
    return { label: "All Paid", color: "success", icon: <CheckCircleIcon /> };
  };

  const status = getPaymentStatus();

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
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : !ledger ? (
          <Alert severity="info">No fee information found for this student.</Alert>
        ) : (
          <>
            {/* Page Header */}
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box>
                  <Typography variant="h5" gutterBottom fontWeight={600} sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                    <ReceiptLongIcon sx={{ mr: 1, fontSize: 28 }} />
                    Fee Invoice - Student #{studentId}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Academic Year #{ledger.academic_year_id}
                  </Typography>
                </Box>
                {status && (
                  <Chip
                    label={status.label}
                    color={status.color as any}
                    icon={status.icon}
                    size="medium"
                    sx={{ px: 1 }}
                  />
                )}
              </Box>
            </Box>

            {/* Alert for Overdue */}
            {ledger.is_defaulter && (
              <Alert severity="error" sx={{ mb: 3 }} icon={<WarningIcon />}>
                <Typography variant="subtitle2" fontWeight={600}>
                  Critical: Payment Overdue for 90+ Days
                </Typography>
                <Typography variant="body2">
                  Please clear the outstanding amount immediately to avoid service disruption.
                </Typography>
              </Alert>
            )}

            {ledger.has_overdue && !ledger.is_defaulter && (
              <Alert severity="warning" sx={{ mb: 3 }}>
                <Typography variant="subtitle2" fontWeight={600}>
                  Payment Past Due Date
                </Typography>
                <Typography variant="body2">
                  Total overdue: {formatCurrency(getTotalOverdue())}. Please make payment at the earliest.
                </Typography>
              </Alert>
            )}

            {/* Summary Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Total Fees Assigned
                    </Typography>
                    <Typography variant="h5" fontWeight={600}>
                      {formatCurrency(ledger.total_fees_assigned)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Total Paid
                    </Typography>
                    <Typography variant="h5" fontWeight={600} color="success.main">
                      {formatCurrency(ledger.total_paid)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {ledger.payment_count} payment(s)
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Outstanding
                    </Typography>
                    <Typography variant="h5" fontWeight={600} color="error.main">
                      {formatCurrency(ledger.total_outstanding)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Overdue Amount
                    </Typography>
                    <Typography variant="h5" fontWeight={600} color={getTotalOverdue() > 0 ? "error.main" : "text.primary"}>
                      {formatCurrency(getTotalOverdue())}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Fee Breakdown */}
            <Paper sx={{ mb: 3 }}>
              <Box sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Fee Breakdown
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Detailed breakdown of all fees assigned to this student.
                </Typography>
              </Box>
              <Divider />
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Fee Type</strong></TableCell>
                      <TableCell><strong>Fee Structure ID</strong></TableCell>
                      <TableCell align="right"><strong>Base Amount</strong></TableCell>
                      <TableCell align="right"><strong>Discount</strong></TableCell>
                      <TableCell align="right"><strong>Final Amount</strong></TableCell>
                      <TableCell><strong>Status</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {assignments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} align="center">
                          <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                            No fee assignments found
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      assignments.map((assignment) => (
                        <TableRow key={assignment.id} hover>
                          <TableCell>
                            <Typography variant="body2" fontWeight={500}>
                              Fee Structure #{assignment.fee_structure_id}
                            </Typography>
                            {assignment.remarks && (
                              <Typography variant="caption" color="text.secondary">
                                {assignment.remarks}
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell>{assignment.fee_structure_id}</TableCell>
                          <TableCell align="right">
                            {formatCurrency(assignment.custom_amount || 0)}
                          </TableCell>
                          <TableCell align="right">
                            {assignment.discount_percentage > 0 ? (
                              <>
                                <Typography variant="body2" color="success.main">
                                  -{assignment.discount_percentage}%
                                </Typography>
                                {assignment.discount_amount && (
                                  <Typography variant="caption" color="text.secondary">
                                    {formatCurrency(assignment.discount_amount)}
                                  </Typography>
                                )}
                              </>
                            ) : (
                              <Typography variant="body2" color="text.secondary">-</Typography>
                            )}
                          </TableCell>
                          <TableCell align="right">
                            <Typography fontWeight={600}>
                              {formatCurrency(assignment.final_amount || assignment.custom_amount || 0)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {assignment.is_waived ? (
                              <Chip label="Waived" color="warning" size="small" />
                            ) : assignment.is_active ? (
                              <Chip label="Active" color="success" size="small" />
                            ) : (
                              <Chip label="Inactive" color="default" size="small" />
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>

            {/* Aging Analysis */}
            {getTotalOverdue() > 0 && (
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Overdue Aging Analysis
                </Typography>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  {ledger.overdue_0_30_days > 0 && (
                    <Grid item xs={12} sm={6} md={3}>
                      <Card sx={{ bgcolor: 'warning.lighter' }}>
                        <CardContent>
                          <Typography variant="caption" color="warning.main" fontWeight={600}>
                            0-30 Days Overdue
                          </Typography>
                          <Typography variant="h6" fontWeight={600} color="warning.main">
                            {formatCurrency(ledger.overdue_0_30_days)}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  )}
                  {ledger.overdue_30_60_days > 0 && (
                    <Grid item xs={12} sm={6} md={3}>
                      <Card sx={{ bgcolor: 'warning.lighter' }}>
                        <CardContent>
                          <Typography variant="caption" color="warning.main" fontWeight={600}>
                            30-60 Days Overdue
                          </Typography>
                          <Typography variant="h6" fontWeight={600} color="warning.main">
                            {formatCurrency(ledger.overdue_30_60_days)}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  )}
                  {ledger.overdue_60_90_days > 0 && (
                    <Grid item xs={12} sm={6} md={3}>
                      <Card sx={{ bgcolor: 'error.lighter' }}>
                        <CardContent>
                          <Typography variant="caption" color="error.main" fontWeight={600}>
                            60-90 Days Overdue
                          </Typography>
                          <Typography variant="h6" fontWeight={600} color="error.main">
                            {formatCurrency(ledger.overdue_60_90_days)}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  )}
                  {ledger.overdue_90_plus_days > 0 && (
                    <Grid item xs={12} sm={6} md={3}>
                      <Card sx={{ bgcolor: 'error.lighter' }}>
                        <CardContent>
                          <Typography variant="caption" color="error.main" fontWeight={600}>
                            90+ Days Overdue
                          </Typography>
                          <Typography variant="h6" fontWeight={600} color="error.main">
                            {formatCurrency(ledger.overdue_90_plus_days)}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  )}
                </Grid>
              </Paper>
            )}

            {/* Payment Information */}
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Payment Information
              </Typography>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Total Invoices
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {ledger.invoice_count} invoices
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Paid Invoices
                  </Typography>
                  <Typography variant="body1" fontWeight={500} color="success.main">
                    {ledger.paid_invoice_count} invoices
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Pending Invoices
                  </Typography>
                  <Typography variant="body1" fontWeight={500} color="warning.main">
                    {ledger.pending_invoice_count} invoices
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Last Payment Date
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {ledger.last_payment_date
                      ? new Date(ledger.last_payment_date).toLocaleDateString('en-IN')
                      : 'No payments yet'}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>

            {/* Actions */}
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                size="large"
                startIcon={<PaymentIcon />}
                onClick={() => navigate("/parent/fees/pay")}
                disabled={ledger.total_outstanding === 0}
              >
                Make Payment
              </Button>
              <Button
                variant="outlined"
                size="large"
                startIcon={<HistoryIcon />}
                onClick={() => navigate("/parent/fees/history")}
              >
                Payment History
              </Button>
              <Button
                variant="outlined"
                size="large"
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate("/parent/fees")}
              >
                Back to Dashboard
              </Button>
            </Box>
          </>
        )}
      </Container>
    </Box>
  );
};

export default ParentStudentFeeDetailsPage;
