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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  TextField,
  InputAdornment,
  Divider,
  CircularProgress,
  Alert,
} from "@mui/material";
import { useAuth } from "../contexts/AuthContext";
import { ledgerApi } from "../services/feeApi";
import type { StudentFeeLedger } from "../types/fees";
import SchoolIcon from "@mui/icons-material/School";
import AccountCircle from "@mui/icons-material/AccountCircle";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import SearchIcon from "@mui/icons-material/Search";
import DownloadIcon from "@mui/icons-material/Download";
import VisibilityIcon from "@mui/icons-material/Visibility";
import WarningIcon from "@mui/icons-material/Warning";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import config from "../config";

const AdminStudentLedgers = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [ledgers, setLedgers] = useState<StudentFeeLedger[]>([]);
  const [filteredLedgers, setFilteredLedgers] = useState<StudentFeeLedger[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  useEffect(() => {
    loadLedgers();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, filterStatus, ledgers]);

  const loadLedgers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ledgerApi.listSummaries();
      setLedgers(data);
    } catch (err: any) {
      console.error("Failed to load ledgers:", err);
      setError(err.response?.data?.detail || "Failed to load student ledgers");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...ledgers];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(ledger =>
        ledger.student_id.toString().includes(searchTerm) ||
        ledger.academic_year_id.toString().includes(searchTerm) ||
        (ledger.first_name && ledger.first_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (ledger.last_name && ledger.last_name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Status filter
    if (filterStatus !== "all") {
      if (filterStatus === "defaulter") {
        filtered = filtered.filter(l => l.is_defaulter);
      } else if (filterStatus === "overdue") {
        filtered = filtered.filter(l => getTotalOverdue(l) > 0 && !l.is_defaulter);
      } else if (filterStatus === "outstanding") {
        filtered = filtered.filter(l => Number(l.total_outstanding) > 0 && getTotalOverdue(l) === 0);
      } else if (filterStatus === "clear") {
        filtered = filtered.filter(l => Number(l.total_outstanding) === 0);
      }
    }

    setFilteredLedgers(filtered);
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

  const getTotalOverdue = (ledger: StudentFeeLedger): number => {
    return Number(ledger.overdue_0_30_days) + Number(ledger.overdue_30_60_days) +
           Number(ledger.overdue_60_90_days) + Number(ledger.overdue_90_plus_days);
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getAgingBucket = (ledger: StudentFeeLedger) => {
    if (ledger.overdue_90_plus_days > 0) return { label: "90+ days", color: "error", amount: ledger.overdue_90_plus_days };
    if (ledger.overdue_60_90_days > 0) return { label: "60-90 days", color: "error", amount: ledger.overdue_60_90_days };
    if (ledger.overdue_30_60_days > 0) return { label: "30-60 days", color: "warning", amount: ledger.overdue_30_60_days };
    if (ledger.overdue_0_30_days > 0) return { label: "0-30 days", color: "warning", amount: ledger.overdue_0_30_days };
    return null;
  };

  const getStatusChip = (ledger: StudentFeeLedger) => {
    if (ledger.is_defaulter) {
      return <Chip label="Defaulter" color="error" size="small" />;
    }
    if (getTotalOverdue(ledger) > 0) {
      return <Chip label="Overdue" color="warning" size="small" />;
    }
    if (ledger.total_outstanding > 0) {
      return <Chip label="Outstanding" color="info" size="small" />;
    }
    return <Chip label="Clear" color="success" size="small" />;
  };

  // Calculate aging analysis summary
  const agingSummary = {
    total_0_30: ledgers.reduce((sum, l) => sum + Number(l.overdue_0_30_days), 0),
    total_30_60: ledgers.reduce((sum, l) => sum + Number(l.overdue_30_60_days), 0),
    total_60_90: ledgers.reduce((sum, l) => sum + Number(l.overdue_60_90_days), 0),
    total_90_plus: ledgers.reduce((sum, l) => sum + Number(l.overdue_90_plus_days), 0),
    count_0_30: ledgers.filter(l => Number(l.overdue_0_30_days) > 0).length,
    count_30_60: ledgers.filter(l => Number(l.overdue_30_60_days) > 0).length,
    count_60_90: ledgers.filter(l => Number(l.overdue_60_90_days) > 0).length,
    count_90_plus: ledgers.filter(l => Number(l.overdue_90_plus_days) > 0).length,
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

      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Page Header */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate("/admin/fees/dashboard")}
              sx={{ mr: 2 }}
            >
              Back to Fee Dashboard
            </Button>
          </Box>
          <Typography variant="h5" gutterBottom fontWeight={600} sx={{ display: 'flex', alignItems: 'center' }}>
            <AccountBalanceWalletIcon sx={{ mr: 1, fontSize: 28 }} />
            Student Ledgers & Aging Analysis
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Track outstanding dues with aging buckets and student-wise financial status
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* Aging Analysis Summary Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <AccessTimeIcon sx={{ color: 'info.main', mr: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        0-30 Days Overdue
                      </Typography>
                    </Box>
                    <Typography variant="h5" fontWeight={600} color="info.main">
                      {formatCurrency(agingSummary.total_0_30)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {agingSummary.count_0_30} students
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <WarningIcon sx={{ color: 'warning.main', mr: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        30-60 Days Overdue
                      </Typography>
                    </Box>
                    <Typography variant="h5" fontWeight={600} color="warning.main">
                      {formatCurrency(agingSummary.total_30_60)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {agingSummary.count_30_60} students
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <WarningIcon sx={{ color: 'error.main', mr: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        60-90 Days Overdue
                      </Typography>
                    </Box>
                    <Typography variant="h5" fontWeight={600} color="error.main">
                      {formatCurrency(agingSummary.total_60_90)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {agingSummary.count_60_90} students
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ bgcolor: 'error.lighter', borderLeft: 4, borderColor: 'error.main' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <WarningIcon sx={{ color: 'error.main', mr: 1 }} />
                      <Typography variant="body2" color="error.main" fontWeight={600}>
                        90+ Days (Critical)
                      </Typography>
                    </Box>
                    <Typography variant="h5" fontWeight={600} color="error.main">
                      {formatCurrency(agingSummary.total_90_plus)}
                    </Typography>
                    <Typography variant="caption" color="error.main">
                      {agingSummary.count_90_plus} defaulters
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Filters and Actions */}
            <Paper sx={{ p: 3, mb: 3 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Search by Student ID, Name, or Academic Year"
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
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    select
                    size="small"
                    label="Filter by Status"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    SelectProps={{ native: true }}
                  >
                    <option value="all">All Students</option>
                    <option value="defaulter">Defaulters (90+ days)</option>
                    <option value="overdue">Overdue (1-89 days)</option>
                    <option value="outstanding">Outstanding (Not due)</option>
                    <option value="clear">All Clear</option>
                  </TextField>
                </Grid>
                <Grid item xs={12} md={5} sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                  <Button
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    onClick={() => alert("Export to Excel - Coming Soon")}
                  >
                    Export to Excel
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    onClick={() => alert("Export to PDF - Coming Soon")}
                  >
                    Export to PDF
                  </Button>
                </Grid>
              </Grid>
            </Paper>

            {/* Student Ledgers Table */}
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Student ID</strong></TableCell>
                    <TableCell><strong>Student Name</strong></TableCell>
                    <TableCell><strong>Academic Year</strong></TableCell>
                    <TableCell align="right"><strong>Total Amount</strong></TableCell>
                    <TableCell align="right"><strong>Paid</strong></TableCell>
                    <TableCell align="right"><strong>Outstanding</strong></TableCell>
                    <TableCell align="right"><strong>Overdue</strong></TableCell>
                    <TableCell><strong>Aging Bucket</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                    <TableCell align="center"><strong>Actions</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredLedgers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} align="center" sx={{ py: 4 }}>
                        <Typography variant="body1" color="text.secondary">
                          {searchTerm || filterStatus !== "all" ? "No students found matching filters" : "No ledger records found"}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredLedgers.map((ledger) => {
                      const agingBucket = getAgingBucket(ledger);
                      const fullName = ledger.first_name && ledger.last_name
                        ? `${ledger.first_name} ${ledger.last_name}`
                        : ledger.first_name || ledger.last_name || 'N/A';
                      return (
                        <TableRow key={ledger.id} hover>
                          <TableCell>
                            <Typography variant="body2" fontWeight={600}>
                              {ledger.student_id}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight={500}>
                              {fullName}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              AY {ledger.academic_year_id}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2">
                              {formatCurrency(ledger.total_fees_assigned)}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" color="success.main" fontWeight={500}>
                              {formatCurrency(ledger.total_paid)}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography
                              variant="body2"
                              color={ledger.total_outstanding > 0 ? "error.main" : "text.secondary"}
                              fontWeight={500}
                            >
                              {formatCurrency(ledger.total_outstanding)}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            {getTotalOverdue(ledger) > 0 ? (
                              <Typography variant="body2" color="error.main" fontWeight={600}>
                                {formatCurrency(getTotalOverdue(ledger))}
                              </Typography>
                            ) : (
                              <Typography variant="body2" color="text.secondary">-</Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            {agingBucket ? (
                              <Chip
                                label={agingBucket.label}
                                color={agingBucket.color as any}
                                size="small"
                                sx={{ minWidth: 100 }}
                              />
                            ) : (
                              <Typography variant="body2" color="text.secondary">-</Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            {getStatusChip(ledger)}
                          </TableCell>
                          <TableCell align="center">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => alert(`View detailed ledger for Student ${ledger.student_id} - Coming Soon`)}
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Summary Footer */}
            <Paper sx={{ p: 2, mt: 2, bgcolor: 'grey.50' }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={3}>
                  <Typography variant="caption" color="text.secondary">Total Students</Typography>
                  <Typography variant="h6" fontWeight={600}>{filteredLedgers.length}</Typography>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Typography variant="caption" color="text.secondary">Total Outstanding</Typography>
                  <Typography variant="h6" fontWeight={600} color="error.main">
                    {formatCurrency(filteredLedgers.reduce((sum, l) => sum + Number(l.total_outstanding), 0))}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Typography variant="caption" color="text.secondary">Total Overdue</Typography>
                  <Typography variant="h6" fontWeight={600} color="error.main">
                    {formatCurrency(filteredLedgers.reduce((sum, l) => sum + Number(getTotalOverdue(l)), 0))}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Typography variant="caption" color="text.secondary">Defaulters</Typography>
                  <Typography variant="h6" fontWeight={600} color="error.main">
                    {filteredLedgers.filter(l => l.is_defaulter).length}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </>
        )}
      </Container>
    </Box>
  );
};

export default AdminStudentLedgers;
