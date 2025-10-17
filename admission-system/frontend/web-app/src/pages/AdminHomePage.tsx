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
    {
      title: "Communication",
      description: "Send messages and announcements to parents and students",
      icon: <ForumIcon sx={{ fontSize: 60 }} />,
      color: "info",
      path: "/admin/communication/dashboard",
      stats: "Broadcast updates and track engagement",
    },
    {
      title: "Student Information",
      description: "Comprehensive student data and academic records management",
      icon: <PeopleIcon sx={{ fontSize: 60 }} />,
      color: "secondary",
      path: "/admin/sis/dashboard",
      stats: "Maintain complete student profiles",
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

      <Container maxWidth="xl" sx={{ py: 6, px: { xs: 2, sm: 3, md: 4 } }}>
        {/* Welcome Section */}
        <Box sx={{ mb: 6, textAlign: "center" }}>
          <Typography variant="h3" gutterBottom fontWeight={700}>
            <DashboardIcon sx={{ mr: 2, fontSize: 48, verticalAlign: "middle" }} />
            Welcome to Admin Portal
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>
            Select a module to manage your school operations
          </Typography>
        </Box>

        {/* Module Cards */}
        <Grid container spacing={4}>
          {modules.map((module, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Card
                sx={{
                  height: "100%",
                  transition: "all 0.3s ease",
                  borderLeft: 6,
                  borderColor: `${module.color}.main`,
                  "&:hover": {
                    transform: "translateY(-8px)",
                    boxShadow: 6,
                  },
                }}
              >
                <CardActionArea
                  onClick={() => navigate(module.path)}
                  sx={{ height: "100%", p: 3 }}
                >
                  <CardContent>
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
      </Container>
    </Box>
  );
};

export default AdminHomePage;
