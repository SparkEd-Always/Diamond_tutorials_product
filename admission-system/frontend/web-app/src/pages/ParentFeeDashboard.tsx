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
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  Divider,
  CircularProgress,
} from "@mui/material";
import { useAuth } from "../contexts/AuthContext";
import { ledgerApi } from "../services/feeApi";
import type { StudentFeeLedger } from "../types/fees";
import SchoolIcon from "@mui/icons-material/School";
import AccountCircle from "@mui/icons-material/AccountCircle";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import PaymentIcon from "@mui/icons-material/Payment";
import HistoryIcon from "@mui/icons-material/History";
import WarningIcon from "@mui/icons-material/Warning";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import config from "../config";

const ParentFeeDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [ledgerSummaries, setLedgerSummaries] = useState<StudentFeeLedger[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadFeeSummary();
  }, []);

  const loadFeeSummary = async () => {
    try {
      setLoading(true);
      setError(null);
      // Load all ledger summaries for current user's students
      const summaries = await ledgerApi.listSummaries();
      setLedgerSummaries(summaries);
    } catch (err: any) {
      console.error("Failed to load fee summary:", err);
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

  const calculateTotalOutstanding = () => {
    return ledgerSummaries.reduce((sum, ledger) => sum + ledger.total_outstanding, 0);
  };

  const calculateTotalAssigned = () => {
    return ledgerSummaries.reduce((sum, ledger) => sum + ledger.total_fees_assigned, 0);
  };

  const calculateTotalPaid = () => {
    return ledgerSummaries.reduce((sum, ledger) => sum + ledger.total_paid, 0);
  };

  const calculateTotalOverdue = () => {
    return ledgerSummaries.reduce((sum, ledger) =>
      sum + ledger.overdue_0_30_days + ledger.overdue_30_60_days +
      ledger.overdue_60_90_days + ledger.overdue_90_plus_days, 0
    );
  };

  const hasOverdue = ledgerSummaries.some(ledger => ledger.has_overdue);
  const isDefaulter = ledgerSummaries.some(ledger => ledger.is_defaulter);

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      {/* Header */}
      <AppBar position="static" elevation={1}>
        <Toolbar sx={{ minHeight: { xs: 48, sm: 56 } }}>
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

      <Box sx={{ py: 4, width: '100%', overflow: 'hidden' }}>
        {/* Page Header */}
        <Box sx={{ px: 2, mb: 3 }}>
          <Typography variant="h5" gutterBottom fontWeight={600} sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
            <AccountBalanceWalletIcon sx={{ mr: 1, fontSize: 28 }} />
            Fee Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            View and manage your child's school fees and payments.
          </Typography>
        </Box>

        {/* Alerts */}
        {isDefaulter && (
          <Alert severity="error" sx={{ mb: 3 }} icon={<WarningIcon />}>
            <Typography variant="subtitle2" fontWeight={600}>
              Payment Overdue - Action Required
            </Typography>
            <Typography variant="body2">
              You have fees overdue for more than 90 days. Please make payment immediately to avoid service disruption.
            </Typography>
          </Alert>
        )}

        {hasOverdue && !isDefaulter && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            <Typography variant="subtitle2" fontWeight={600}>
              Overdue Payments
            </Typography>
            <Typography variant="body2">
              You have outstanding fees that are past the due date. Please clear them at the earliest.
            </Typography>
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          <>
            {/* Summary Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Total Outstanding
                    </Typography>
                    <Typography variant="h4" fontWeight={600} color="error.main">
                      ₹{calculateTotalOutstanding().toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </Typography>
                    {hasOverdue && (
                      <Chip
                        label="Overdue"
                        color="error"
                        size="small"
                        sx={{ mt: 1 }}
                      />
                    )}
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Total Assigned
                    </Typography>
                    <Typography variant="h4" fontWeight={600} color="primary.main">
                      ₹{calculateTotalAssigned().toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      Total fees
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
                    <Typography variant="h4" fontWeight={600} color="success.main">
                      ₹{calculateTotalPaid().toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </Typography>
                    <Chip
                      label="All time"
                      size="small"
                      variant="outlined"
                      sx={{ mt: 1 }}
                    />
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Payment Status
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1.5 }}>
                      {calculateTotalOutstanding() === 0 ? (
                        <>
                          <CheckCircleIcon sx={{ fontSize: 40, color: 'success.main', mr: 1 }} />
                          <Typography variant="h6" fontWeight={600} color="success.main">
                            All Clear
                          </Typography>
                        </>
                      ) : (
                        <>
                          <WarningIcon sx={{ fontSize: 40, color: 'warning.main', mr: 1 }} />
                          <Typography variant="h6" fontWeight={600} color="warning.main">
                            Pending
                          </Typography>
                        </>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Quick Actions */}
            <Paper sx={{ p: 3, mb: 4 }}>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                Quick Actions
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, mt: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<PaymentIcon />}
                  onClick={() => navigate("/parent/fees/pay")}
                  disabled={calculateTotalOutstanding() === 0}
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
              </Box>
            </Paper>

            {/* Student-wise Fee Breakdown */}
            <Box>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                Student-wise Fee Summary
              </Typography>
              {ledgerSummaries.length === 0 ? (
                <Card sx={{ p: 4, textAlign: "center" }}>
                  <Typography variant="h6" color="text.secondary" paragraph>
                    No fee records found
                  </Typography>
                  <Typography color="text.secondary">
                    Fee information will appear here once fees are assigned to your child.
                  </Typography>
                </Card>
              ) : (
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>Student</strong></TableCell>
                        <TableCell><strong>Assigned Fees</strong></TableCell>
                        <TableCell><strong>Paid</strong></TableCell>
                        <TableCell><strong>Outstanding</strong></TableCell>
                        <TableCell><strong>Overdue</strong></TableCell>
                        <TableCell><strong>Status</strong></TableCell>
                        <TableCell align="right"><strong>Actions</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {ledgerSummaries.map((ledger) => {
                        const totalOverdue = ledger.overdue_0_30_days + ledger.overdue_30_60_days +
                                            ledger.overdue_60_90_days + ledger.overdue_90_plus_days;
                        return (
                          <TableRow key={ledger.id} hover>
                            <TableCell>
                              <Typography variant="body2" fontWeight={600}>
                                Student #{ledger.student_id}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                AY #{ledger.academic_year_id}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              ₹{ledger.total_fees_assigned.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </TableCell>
                            <TableCell>
                              <Typography color="success.main" fontWeight={500}>
                                ₹{ledger.total_paid.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography color={ledger.total_outstanding > 0 ? "error.main" : "text.primary"} fontWeight={500}>
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
                              {ledger.is_defaulter ? (
                                <Chip label="Defaulter" color="error" size="small" />
                              ) : ledger.has_overdue ? (
                                <Chip label="Overdue" color="warning" size="small" />
                              ) : ledger.total_outstanding > 0 ? (
                                <Chip label="Pending" color="info" size="small" />
                              ) : (
                                <Chip label="Paid" color="success" size="small" />
                              )}
                            </TableCell>
                            <TableCell align="right">
                              <Button
                                size="small"
                                variant="outlined"
                                onClick={() => navigate(`/parent/fees/student/${ledger.student_id}`)}
                              >
                                View Details
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
};

export default ParentFeeDashboard;
