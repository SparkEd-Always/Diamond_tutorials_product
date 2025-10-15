import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Box,
  Typography,
  Button,
  Paper,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  Grid,
  TextField,
  MenuItem,
  Chip,
  IconButton,
  AppBar,
  Toolbar,
  Menu,
  MenuItem as MenuItemMUI,
  Divider,
} from "@mui/material";
import { useAuth } from "../contexts/AuthContext";
import { ledgerApi } from "../services/feeApi";
import type { StudentFeeLedger } from "../types/fees";
import SchoolIcon from "@mui/icons-material/School";
import AccountCircle from "@mui/icons-material/AccountCircle";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DownloadIcon from "@mui/icons-material/Download";
import PrintIcon from "@mui/icons-material/Print";
import WarningIcon from "@mui/icons-material/Warning";
import GroupIcon from "@mui/icons-material/Group";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import config from "../config";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`report-tabpanel-${index}`}
      aria-labelledby={`report-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const AdminReportsPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [tabValue, setTabValue] = useState(0);

  // Outstanding Report State
  const [outstandingData, setOutstandingData] = useState<StudentFeeLedger[]>([]);
  const [outstandingLoading, setOutstandingLoading] = useState(true);
  const [outstandingFilter, setOutstandingFilter] = useState<string>("all"); // all, 0-30, 30-60, 60-90, 90+
  const [outstandingSearch, setOutstandingSearch] = useState("");

  // Class-wise Report State
  const [classWiseData, setClassWiseData] = useState<any[]>([]);
  const [classWiseLoading, setClassWiseLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState<string>("all");

  useEffect(() => {
    loadOutstandingReport();
    loadClassWiseReport();
  }, []);

  const loadOutstandingReport = async () => {
    try {
      setOutstandingLoading(true);
      const ledgers = await ledgerApi.listSummaries();
      // Filter only students with outstanding amounts
      const withOutstanding = ledgers.filter(l => l.total_outstanding > 0);
      setOutstandingData(withOutstanding);
    } catch (error) {
      console.error("Failed to load outstanding report:", error);
    } finally {
      setOutstandingLoading(false);
    }
  };

  const loadClassWiseReport = async () => {
    try {
      setClassWiseLoading(true);
      const ledgers = await ledgerApi.listSummaries();

      // Group by class (using student_id as proxy for class - in real app would get from student table)
      // For demo purposes, we'll create mock classes
      const classes = ["Pre-KG", "LKG", "UKG", "Class 1", "Class 2", "Class 3", "Class 4", "Class 5"];

      const classData = classes.map(className => {
        // Simulate class assignment (every 10 students belong to a class)
        const classLedgers = ledgers.filter((_, idx) =>
          Math.floor(idx / 10) === classes.indexOf(className)
        );

        const totalStudents = classLedgers.length;
        const totalAssigned = classLedgers.reduce((sum, l) => sum + l.total_fees_assigned, 0);
        const totalCollected = classLedgers.reduce((sum, l) => sum + l.total_paid, 0);
        const totalOutstanding = classLedgers.reduce((sum, l) => sum + l.total_outstanding, 0);
        const studentsWithOutstanding = classLedgers.filter(l => l.total_outstanding > 0).length;

        return {
          className,
          totalStudents,
          totalAssigned,
          totalCollected,
          totalOutstanding,
          studentsWithOutstanding,
        };
      }).filter(c => c.totalStudents > 0); // Only show classes with students

      setClassWiseData(classData);
    } catch (error) {
      console.error("Failed to load class-wise report:", error);
    } finally {
      setClassWiseLoading(false);
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

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getTotalOverdue = (ledger: StudentFeeLedger): number => {
    return ledger.overdue_0_30_days + ledger.overdue_30_60_days +
           ledger.overdue_60_90_days + ledger.overdue_90_plus_days;
  };

  const getAgingBucket = (ledger: StudentFeeLedger) => {
    if (ledger.overdue_90_plus_days > 0) return { label: "90+ days", color: "error", amount: ledger.overdue_90_plus_days };
    if (ledger.overdue_60_90_days > 0) return { label: "60-90 days", color: "error", amount: ledger.overdue_60_90_days };
    if (ledger.overdue_30_60_days > 0) return { label: "30-60 days", color: "warning", amount: ledger.overdue_30_60_days };
    if (ledger.overdue_0_30_days > 0) return { label: "0-30 days", color: "warning", amount: ledger.overdue_0_30_days };
    return null;
  };

  // Filter outstanding data
  const filteredOutstandingData = outstandingData.filter(ledger => {
    // Search filter
    const matchesSearch = outstandingSearch === "" ||
      ledger.student_id.toString().includes(outstandingSearch);

    // Aging filter
    let matchesAging = true;
    if (outstandingFilter === "0-30") matchesAging = ledger.overdue_0_30_days > 0;
    else if (outstandingFilter === "30-60") matchesAging = ledger.overdue_30_60_days > 0;
    else if (outstandingFilter === "60-90") matchesAging = ledger.overdue_60_90_days > 0;
    else if (outstandingFilter === "90+") matchesAging = ledger.overdue_90_plus_days > 0;

    return matchesSearch && matchesAging;
  });

  // Calculate outstanding summary
  const outstandingSummary = {
    total: filteredOutstandingData.reduce((sum, l) => sum + l.total_outstanding, 0),
    count: filteredOutstandingData.length,
    overdue_0_30: filteredOutstandingData.reduce((sum, l) => sum + l.overdue_0_30_days, 0),
    overdue_30_60: filteredOutstandingData.reduce((sum, l) => sum + l.overdue_30_60_days, 0),
    overdue_60_90: filteredOutstandingData.reduce((sum, l) => sum + l.overdue_60_90_days, 0),
    overdue_90_plus: filteredOutstandingData.reduce((sum, l) => sum + l.overdue_90_plus_days, 0),
  };

  // Filter class-wise data
  const filteredClassWiseData = selectedClass === "all"
    ? classWiseData
    : classWiseData.filter(c => c.className === selectedClass);

  // Calculate class-wise summary
  const classWiseSummary = {
    totalStudents: filteredClassWiseData.reduce((sum, c) => sum + c.totalStudents, 0),
    totalAssigned: filteredClassWiseData.reduce((sum, c) => sum + c.totalAssigned, 0),
    totalCollected: filteredClassWiseData.reduce((sum, c) => sum + c.totalCollected, 0),
    totalOutstanding: filteredClassWiseData.reduce((sum, c) => sum + c.totalOutstanding, 0),
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
          <IconButton onClick={handleMenu} color="inherit">
            <AccountCircle />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            <MenuItemMUI disabled>
              <Typography variant="body2" color="text.secondary">
                {user?.email}
              </Typography>
            </MenuItemMUI>
            <MenuItemMUI onClick={() => navigate("/admin/dashboard")}>
              Admission Dashboard
            </MenuItemMUI>
            <MenuItemMUI onClick={() => navigate("/admin/fees/dashboard")}>
              Fee Dashboard
            </MenuItemMUI>
            <Divider />
            <MenuItemMUI onClick={handleLogout}>Logout</MenuItemMUI>
          </Menu>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Page Header */}
        <Box sx={{ mb: 3, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate("/admin/fees/dashboard")}
              sx={{ mr: 2 }}
            >
              Back to Fee Dashboard
            </Button>
            <Box>
              <Typography variant="h4" fontWeight={600}>
                Fee Reports
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Comprehensive fee collection and outstanding reports
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Tabs */}
        <Paper sx={{ mb: 3 }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="report tabs">
            <Tab label="Outstanding Report" />
            <Tab label="Class-wise Report" />
          </Tabs>
        </Paper>

        {/* Outstanding Report Tab */}
        <TabPanel value={tabValue} index={0}>
          {/* Summary Cards */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Total Outstanding
                  </Typography>
                  <Typography variant="h5" fontWeight={600} color="error.main">
                    {formatCurrency(outstandingSummary.total)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {outstandingSummary.count} students
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    0-30 Days Overdue
                  </Typography>
                  <Typography variant="h5" fontWeight={600} color="warning.main">
                    {formatCurrency(outstandingSummary.overdue_0_30)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    30-60 Days Overdue
                  </Typography>
                  <Typography variant="h5" fontWeight={600} color="warning.main">
                    {formatCurrency(outstandingSummary.overdue_30_60)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    60-90 Days Overdue
                  </Typography>
                  <Typography variant="h5" fontWeight={600} color="error.main">
                    {formatCurrency(outstandingSummary.overdue_60_90)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    90+ Days Overdue
                  </Typography>
                  <Typography variant="h5" fontWeight={600} color="error.main">
                    {formatCurrency(outstandingSummary.overdue_90_plus)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Filters and Actions */}
          <Paper sx={{ p: 2, mb: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  label="Search Student ID"
                  value={outstandingSearch}
                  onChange={(e) => setOutstandingSearch(e.target.value)}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  select
                  label="Aging Filter"
                  value={outstandingFilter}
                  onChange={(e) => setOutstandingFilter(e.target.value)}
                  size="small"
                >
                  <MenuItem value="all">All Outstanding</MenuItem>
                  <MenuItem value="0-30">0-30 Days</MenuItem>
                  <MenuItem value="30-60">30-60 Days</MenuItem>
                  <MenuItem value="60-90">60-90 Days</MenuItem>
                  <MenuItem value="90+">90+ Days</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={12} md={4}>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Button
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    fullWidth
                  >
                    Export Excel
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<PrintIcon />}
                    fullWidth
                  >
                    Print
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Paper>

          {/* Outstanding Table */}
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Student ID</TableCell>
                  <TableCell>Academic Year</TableCell>
                  <TableCell align="right">Total Assigned</TableCell>
                  <TableCell align="right">Total Paid</TableCell>
                  <TableCell align="right">Total Outstanding</TableCell>
                  <TableCell align="right">0-30 Days</TableCell>
                  <TableCell align="right">30-60 Days</TableCell>
                  <TableCell align="right">60-90 Days</TableCell>
                  <TableCell align="right">90+ Days</TableCell>
                  <TableCell>Priority</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {outstandingLoading ? (
                  <TableRow>
                    <TableCell colSpan={10} align="center">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : filteredOutstandingData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} align="center">
                      No outstanding fees found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOutstandingData.map((ledger) => {
                    const agingBucket = getAgingBucket(ledger);
                    return (
                      <TableRow key={ledger.id} hover>
                        <TableCell>{ledger.student_id}</TableCell>
                        <TableCell>{ledger.academic_year_id}</TableCell>
                        <TableCell align="right">{formatCurrency(ledger.total_fees_assigned)}</TableCell>
                        <TableCell align="right">{formatCurrency(ledger.total_paid)}</TableCell>
                        <TableCell align="right">
                          <Typography fontWeight={600} color="error.main">
                            {formatCurrency(ledger.total_outstanding)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          {ledger.overdue_0_30_days > 0 ? formatCurrency(ledger.overdue_0_30_days) : "-"}
                        </TableCell>
                        <TableCell align="right">
                          {ledger.overdue_30_60_days > 0 ? formatCurrency(ledger.overdue_30_60_days) : "-"}
                        </TableCell>
                        <TableCell align="right">
                          {ledger.overdue_60_90_days > 0 ? formatCurrency(ledger.overdue_60_90_days) : "-"}
                        </TableCell>
                        <TableCell align="right">
                          {ledger.overdue_90_plus_days > 0 ? formatCurrency(ledger.overdue_90_plus_days) : "-"}
                        </TableCell>
                        <TableCell>
                          {agingBucket && (
                            <Chip
                              label={agingBucket.label}
                              color={agingBucket.color as "warning" | "error"}
                              size="small"
                              icon={<WarningIcon />}
                            />
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Class-wise Report Tab */}
        <TabPanel value={tabValue} index={1}>
          {/* Summary Cards */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                    <GroupIcon color="primary" />
                    <Typography variant="body2" color="text.secondary">
                      Total Students
                    </Typography>
                  </Box>
                  <Typography variant="h5" fontWeight={600}>
                    {classWiseSummary.totalStudents}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Total Assigned
                  </Typography>
                  <Typography variant="h5" fontWeight={600}>
                    {formatCurrency(classWiseSummary.totalAssigned)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Total Collected
                  </Typography>
                  <Typography variant="h5" fontWeight={600} color="success.main">
                    {formatCurrency(classWiseSummary.totalCollected)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Total Outstanding
                  </Typography>
                  <Typography variant="h5" fontWeight={600} color="error.main">
                    {formatCurrency(classWiseSummary.totalOutstanding)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Filters and Actions */}
          <Paper sx={{ p: 2, mb: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  select
                  label="Select Class"
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  size="small"
                >
                  <MenuItem value="all">All Classes</MenuItem>
                  {classWiseData.map(c => (
                    <MenuItem key={c.className} value={c.className}>
                      {c.className}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6} md={8}>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Button
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    fullWidth
                  >
                    Export Excel
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<PrintIcon />}
                    fullWidth
                  >
                    Print
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Paper>

          {/* Class-wise Table */}
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Class</TableCell>
                  <TableCell align="right">Total Students</TableCell>
                  <TableCell align="right">Total Assigned</TableCell>
                  <TableCell align="right">Total Collected</TableCell>
                  <TableCell align="right">Total Outstanding</TableCell>
                  <TableCell align="right">Students with Outstanding</TableCell>
                  <TableCell align="right">Average Outstanding</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {classWiseLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : filteredClassWiseData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      No data found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredClassWiseData.map((classData) => {
                    const avgOutstanding = classData.studentsWithOutstanding > 0
                      ? classData.totalOutstanding / classData.studentsWithOutstanding
                      : 0;

                    return (
                      <TableRow key={classData.className} hover>
                        <TableCell>
                          <Typography fontWeight={600}>{classData.className}</Typography>
                        </TableCell>
                        <TableCell align="right">{classData.totalStudents}</TableCell>
                        <TableCell align="right">{formatCurrency(classData.totalAssigned)}</TableCell>
                        <TableCell align="right">
                          <Typography color="success.main">
                            {formatCurrency(classData.totalCollected)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography color="error.main" fontWeight={600}>
                            {formatCurrency(classData.totalOutstanding)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Chip
                            label={classData.studentsWithOutstanding}
                            size="small"
                            color={classData.studentsWithOutstanding > 0 ? "error" : "success"}
                          />
                        </TableCell>
                        <TableCell align="right">
                          {classData.studentsWithOutstanding > 0 ? formatCurrency(avgOutstanding) : "-"}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
      </Container>
    </Box>
  );
};

export default AdminReportsPage;
