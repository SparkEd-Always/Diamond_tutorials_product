import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
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
} from "@mui/material";
import { useAuth } from "../contexts/AuthContext";
import { admissionApi } from "../services/api";
import type { Application } from "../types";
import SchoolIcon from "@mui/icons-material/School";
import AccountCircle from "@mui/icons-material/AccountCircle";
import AddIcon from "@mui/icons-material/Add";
import ListIcon from "@mui/icons-material/List";
import DashboardIcon from "@mui/icons-material/Dashboard";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import ForumIcon from "@mui/icons-material/Forum";
import config from "../config";

const ParentDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    draft: 0,
    submitted: 0,
    underReview: 0,
  });

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      const response = await admissionApi.listApplications({
        page: 1,
        page_size: 10,
      });
      setApplications(response.applications);

      // Calculate stats
      const total = response.total;
      const draft = response.applications.filter(
        (app) => app.application_status === "draft"
      ).length;
      const submitted = response.applications.filter(
        (app) => app.application_status === "submitted"
      ).length;
      const underReview = response.applications.filter(
        (app) => app.application_status === "under_review"
      ).length;

      setStats({ total, draft, submitted, underReview });
    } catch (error) {
      console.error("Failed to load applications:", error);
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

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: "default",
      submitted: "info",
      under_review: "warning",
      enrolled: "success",
      rejected: "error",
    };
    return colors[status] || "default";
  };

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
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Box sx={{ py: 4, width: '100%', overflow: 'hidden' }}>
        {/* Welcome Section */}
        <Box sx={{ px: 2, mb: 3 }}>
          <Typography variant="h5" gutterBottom fontWeight={600} sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
            <DashboardIcon sx={{ mr: 1, fontSize: 28 }} />
            Parent Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Welcome back! Manage your child's admission applications.
          </Typography>
        </Box>

        {/* Quick Actions */}
        <Box sx={{ px: 2, mb: 4 }}>
          <Paper sx={{ p: 3, bgcolor: "primary.main", color: "white" }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1, alignItems: 'center' }}>
              <Button
                variant="contained"
                fullWidth
                size="large"
                startIcon={<AddIcon />}
                onClick={() => navigate("/apply")}
                sx={{
                  maxWidth: 400,
                  bgcolor: "white",
                  color: "primary.main",
                  "&:hover": { bgcolor: "grey.100" }
                }}
              >
                New Application
              </Button>
              <Button
                variant="outlined"
                fullWidth
                size="large"
                startIcon={<ListIcon />}
                onClick={() => navigate("/applications")}
                sx={{
                  maxWidth: 400,
                  borderColor: "white",
                  color: "white",
                  "&:hover": { borderColor: "grey.100", bgcolor: "rgba(255,255,255,0.1)" }
                }}
              >
                View All Applications
              </Button>
              <Button
                variant="outlined"
                fullWidth
                size="large"
                startIcon={<AccountBalanceWalletIcon />}
                onClick={() => navigate("/parent/fees")}
                sx={{
                  maxWidth: 400,
                  borderColor: "white",
                  color: "white",
                  "&:hover": { borderColor: "grey.100", bgcolor: "rgba(255,255,255,0.1)" }
                }}
              >
                Fee Management
              </Button>
              <Button
                variant="outlined"
                fullWidth
                size="large"
                startIcon={<ForumIcon />}
                onClick={() => navigate("/parent/messages")}
                sx={{
                  maxWidth: 400,
                  borderColor: "white",
                  color: "white",
                  "&:hover": { borderColor: "grey.100", bgcolor: "rgba(255,255,255,0.1)" }
                }}
              >
                Messages
              </Button>
            </Box>
          </Paper>
        </Box>

        {/* Stats Badge Pills */}
        <Box sx={{ px: 2, mb: 4 }}>
          <Box
            sx={{
              display: "flex",
              gap: 1.5,
              flexWrap: "wrap",
              justifyContent: "center",
              py: 1.5,
              px: 2,
              bgcolor: "grey.50",
              borderRadius: 2,
              border: "1px solid",
              borderColor: "grey.200"
            }}
          >
          <Chip
            label={`${stats.total} Total`}
            variant="outlined"
            size="small"
            sx={{
              fontSize: "0.813rem",
              fontWeight: 500,
              borderColor: "grey.400",
              color: "text.primary"
            }}
          />
          <Chip
            label={`${stats.draft} Draft`}
            variant="outlined"
            size="small"
            sx={{
              fontSize: "0.813rem",
              fontWeight: 500,
              borderColor: "grey.400",
              color: "text.secondary"
            }}
          />
          <Chip
            label={`${stats.submitted} Submitted`}
            variant="outlined"
            size="small"
            sx={{
              fontSize: "0.813rem",
              fontWeight: 500,
              borderColor: "info.light",
              color: "info.main"
            }}
          />
          <Chip
            label={`${stats.underReview} Under Review`}
            variant="outlined"
            size="small"
            sx={{
              fontSize: "0.813rem",
              fontWeight: 500,
              borderColor: "warning.light",
              color: "warning.main"
            }}
          />
          </Box>
        </Box>

        {/* Recent Applications */}
        <Box sx={{ px: 2 }}>
          <Typography variant="h6" gutterBottom fontWeight={600}>
            Recent Applications
          </Typography>
          {loading ? (
            <Typography>Loading...</Typography>
          ) : applications.length === 0 ? (
            <Card sx={{ p: 4, textAlign: "center" }}>
              <Typography variant="h6" color="text.secondary" paragraph>
                No applications found
              </Typography>
              <Typography color="text.secondary" paragraph>
                Start your child's admission journey by creating your first application.
              </Typography>
              <Button
                variant="contained"
                size="large"
                startIcon={<AddIcon />}
                onClick={() => navigate("/apply")}
              >
                Create Your First Application
              </Button>
            </Card>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {applications.slice(0, 5).map((app) => (
                <Card
                  key={app.id}
                  sx={{
                    cursor: "pointer",
                    transition: "all 0.2s",
                    "&:hover": {
                      transform: "translateX(4px)",
                      boxShadow: 3
                    },
                  }}
                  onClick={() => navigate(`/applications/${app.id}`)}
                >
                  <CardContent sx={{ py: 2, px: 2.5, '&:last-child': { pb: 2 } }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="subtitle1" fontWeight={600} noWrap>
                          {app.application_number}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {app.student_name} • {app.class_name}
                        </Typography>
                      </Box>

                      <Chip
                        label={app.application_status
                          ?.replace("_", " ")
                          .toUpperCase() || "DRAFT"}
                        color={getStatusColor(app.application_status) as any}
                        size="small"
                        sx={{ ml: 2, flexShrink: 0 }}
                      />
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default ParentDashboard;
