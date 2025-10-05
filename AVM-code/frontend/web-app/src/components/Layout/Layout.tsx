import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  Badge,
  useTheme,
  useMediaQuery,
  Popover,
  Paper,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  School as SchoolIcon,
  CheckCircle as CheckCircleIcon,
  History as HistoryIcon,
  Message as MessageIcon,
  AccountCircle as AccountCircleIcon,
  Logout as LogoutIcon,
  NotificationsActive as NotificationsIcon,
  CloudUpload as CloudUploadIcon,
  FileUpload as FileUploadIcon,
} from '@mui/icons-material';

import { AppDispatch, RootState } from '../../store/store';
import { logout } from '../../store/slices/authSlice';

const drawerWidth = 280;

const Layout: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();

  const { user } = useSelector((state: RootState) => state.auth);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState<null | HTMLElement>(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [activities, setActivities] = useState<any[]>([]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
    handleProfileMenuClose();
  };

  const handleNotificationClick = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationAnchorEl(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setNotificationAnchorEl(null);
  };

  // Fetch pending attendance count and recent activities
  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://192.168.1.4:8000/api/v1';

      if (!token || !user) return;

      try {
        // Fetch pending attendance count
        const pendingResponse = await axios.get(`${API_BASE_URL}/attendance/pending-approval`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPendingCount(pendingResponse.data.length || 0);

        // Fetch recent activities
        const activitiesResponse = await axios.get(`${API_BASE_URL}/activities/recent?limit=5`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setActivities(activitiesResponse.data.activities || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();

    // Refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const menuItems = [
    {
      text: 'Dashboard',
      icon: <DashboardIcon />,
      path: '/dashboard',
      roles: ['admin', 'teacher'],
    },
    {
      text: 'Students',
      icon: <PeopleIcon />,
      path: '/students',
      roles: ['admin', 'teacher'],
    },
    {
      text: 'Teachers',
      icon: <SchoolIcon />,
      path: '/teachers',
      roles: ['admin'],
    },
    {
      text: 'Attendance Approval',
      icon: <CheckCircleIcon />,
      path: '/attendance',
      roles: ['admin'],
      badge: pendingCount,
    },
    {
      text: 'Attendance History',
      icon: <HistoryIcon />,
      path: '/attendance-history',
      roles: ['admin'],
    },
    {
      text: 'Teacher Attendance',
      icon: <SchoolIcon />,
      path: '/teacher-attendance',
      roles: ['admin'],
    },
    {
      text: 'Communications',
      icon: <MessageIcon />,
      path: '/communications',
      roles: ['admin', 'teacher'],
    },
    {
      text: 'Import Data',
      icon: <FileUploadIcon />,
      path: '/import',
      roles: ['admin'],
    },
  ];

  const filteredMenuItems = menuItems.filter(item =>
    item.roles.includes(user?.role || '')
  );

  const drawer = (
    <Box>
      {/* Logo and Title */}
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Avatar
          sx={{
            bgcolor: 'primary.main',
            width: 56,
            height: 56,
            mx: 'auto',
            mb: 1,
          }}
        >
          <SchoolIcon fontSize="large" />
        </Avatar>
        <Typography variant="h6" fontWeight="bold" color="primary">
          AVM Tutorial
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Management System
        </Typography>
      </Box>

      <Divider />

      {/* Navigation Menu */}
      <List sx={{ mt: 1 }}>
        {filteredMenuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => {
                navigate(item.path);
                if (isMobile) {
                  setMobileOpen(false);
                }
              }}
              sx={{
                mx: 1,
                borderRadius: 1,
                '&.Mui-selected': {
                  bgcolor: 'primary.main',
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'primary.dark',
                  },
                  '& .MuiListItemIcon-root': {
                    color: 'white',
                  },
                },
              }}
            >
              <ListItemIcon>
                {item.badge ? (
                  <Badge badgeContent={item.badge} color="error">
                    {item.icon}
                  </Badge>
                ) : (
                  item.icon
                )}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                primaryTypographyProps={{ fontWeight: 500 }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider sx={{ mt: 'auto' }} />

      {/* User Info */}
      <Box sx={{ p: 2 }}>
        <Typography variant="caption" color="text.secondary" display="block">
          Logged in as:
        </Typography>
        <Typography variant="body2" fontWeight="500">
          {user?.full_name}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {user?.role?.toUpperCase()}
        </Typography>
      </Box>

      <Divider />

      {/* Papaya Production Branding */}
      <Box sx={{ p: 2, textAlign: 'center', bgcolor: '#FFF4E6' }}>
        <Typography variant="caption" color="text.secondary" display="block" sx={{ fontWeight: 500 }}>
          A Papaya Production
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
          © 2025 All Rights Reserved
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {filteredMenuItems.find(item => item.path === location.pathname)?.text || 'Dashboard'}
          </Typography>

          {/* Notifications */}
          <IconButton color="inherit" sx={{ mr: 1 }} onClick={handleNotificationClick}>
            <Badge badgeContent={activities.length} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>

          {/* Profile Menu */}
          <IconButton
            size="large"
            aria-label="account of current user"
            aria-controls="primary-search-account-menu"
            aria-haspopup="true"
            onClick={handleProfileMenuOpen}
            color="inherit"
          >
            <AccountCircleIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Notification Popover */}
      <Popover
        open={Boolean(notificationAnchorEl)}
        anchorEl={notificationAnchorEl}
        onClose={handleNotificationClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <Paper sx={{ width: 350, maxHeight: 400, overflow: 'auto' }}>
          <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white' }}>
            <Typography variant="h6">Recent Activity</Typography>
          </Box>
          <List>
            {activities.length === 0 ? (
              <ListItem>
                <ListItemText
                  primary="No recent activities"
                  secondary="Activity will appear here when users perform actions"
                />
              </ListItem>
            ) : (
              activities.map((activity, index) => (
                <React.Fragment key={activity.id}>
                  <ListItem>
                    <ListItemText
                      primary={activity.description}
                      secondary={activity.time_ago}
                      primaryTypographyProps={{
                        variant: 'body2',
                        sx: { fontWeight: 500 }
                      }}
                      secondaryTypographyProps={{
                        variant: 'caption',
                        color: 'text.secondary'
                      }}
                    />
                  </ListItem>
                  {index < activities.length - 1 && <Divider />}
                </React.Fragment>
              ))
            )}
          </List>
        </Paper>
      </Popover>

      {/* Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        keepMounted
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
      >
        <MenuItem onClick={handleProfileMenuClose}>
          <ListItemIcon>
            <AccountCircleIcon fontSize="small" />
          </ListItemIcon>
          Profile
        </MenuItem>
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>

      {/* Navigation Drawer */}
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>

        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          mt: 8, // Account for AppBar height
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout;