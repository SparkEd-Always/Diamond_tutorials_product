import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  AppBar,
  Toolbar,
  IconButton,
  Menu,
  MenuItem,
  CardActionArea,
  Divider,
} from "@mui/material";
import { useAuth } from "../contexts/AuthContext";
import SchoolIcon from "@mui/icons-material/School";
import AccountCircle from "@mui/icons-material/AccountCircle";
import DashboardIcon from "@mui/icons-material/Dashboard";
import AssignmentIcon from "@mui/icons-material/Assignment";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import ForumIcon from "@mui/icons-material/Forum";
import PeopleIcon from "@mui/icons-material/People";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import config from "../config";

const AdminHomePage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

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

  const modules = [
    {
      title: "Admission System",
      description: "Manage student admissions, applications, and enrollment process",
      icon: <AssignmentIcon sx={{ fontSize: 60 }} />,
      color: "primary",
      path: "/admin/admission/dashboard",
      stats: "Track applications from submission to enrollment",
    },
    {
      title: "Fee Management",
      description: "Handle fee structures, payments, and financial tracking",
      icon: <AccountBalanceWalletIcon sx={{ fontSize: 60 }} />,
      color: "success",
      path: "/admin/fees/dashboard",
      stats: "Monitor collections and outstanding fees",
    },
  ];

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      {/* Header */}
      <AppBar position="static" elevation={1}>
        <Toolbar>
          <SchoolIcon sx={{ mr: 2 }} />
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            {config.schoolName} - Admin Portal
          </Typography>
          <Typography variant="body2" sx={{ mr: 2 }}>
            {user?.email}
          </Typography>
          <IconButton size="large" onClick={handleMenu} color="inherit">
            <AccountCircle />
          </IconButton>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
            <MenuItem disabled>
              <Typography variant="body2" color="text.secondary">
                {user?.email}
              </Typography>
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Box sx={{ py: 6, width: '100%', overflow: 'hidden' }}>
        {/* Welcome Section */}
        <Box sx={{ mb: 6, textAlign: "center", px: 2 }}>
          <Typography variant="h3" gutterBottom fontWeight={700}>
            <DashboardIcon sx={{ mr: 2, fontSize: 48, verticalAlign: "middle" }} />
            Welcome to Admin Portal
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>
            Select a module to manage your school operations
          </Typography>
        </Box>

        {/* Module Cards */}
        <Grid container spacing={4} sx={{ width: '100%', m: 0, px: 2 }}>
          {modules.map((module, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Card
                elevation={2}
                sx={{
                  height: "100%",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  borderTop: 4,
                  borderColor: `${module.color}.main`,
                  background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                  "&:hover": {
                    transform: "translateY(-12px)",
                    boxShadow: 8,
                    borderColor: `${module.color}.dark`,
                    background: 'linear-gradient(135deg, #ffffff 0%, #ffffff 100%)',
                  },
                }}
              >
                <CardActionArea
                  onClick={() => navigate(module.path)}
                  sx={{ height: "100%", p: 3 }}
                >
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 3,
                        mb: 2,
                      }}
                    >
                      <Box
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          bgcolor: `${module.color}.lighter`,
                          color: `${module.color}.main`,
                        }}
                      >
                        {module.icon}
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h5" fontWeight={700} gutterBottom>
                          {module.title}
                        </Typography>
                        <Typography variant="body1" color="text.secondary" paragraph>
                          {module.description}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            color: `${module.color}.main`,
                            fontWeight: 600,
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                          }}
                        >
                          {module.stats}
                          <ArrowForwardIcon fontSize="small" />
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Quick Info */}
        <Box sx={{ mt: 6, textAlign: "center" }}>
          <Typography variant="body2" color="text.secondary">
            💡 Each module has its own dashboard with detailed analytics and management tools
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default AdminHomePage;
