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
  const [unreadCount, setUnreadCount] = useState(0);

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

  const handleNotificationClick = async (event: React.MouseEvent<HTMLElement>) => {
    setNotificationAnchorEl(event.currentTarget);

    // Mark activities as viewed when notification is opened
    const token = localStorage.getItem('token');

    if (token && user) {
      try {
        await axios.post('/api/v1/activities/mark-viewed', null, {
          headers: { Authorization: `Bearer ${token}` }
        });
        // Clear the unread count badge
        setUnreadCount(0);
      } catch (error) {
        console.error('Error marking activities as viewed:', error);
      }
    }
  };

  const handleNotificationClose = () => {
    setNotificationAnchorEl(null);
  };

  // Fetch pending attendance count and recent activities
  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');

      if (!token || !user) return;

      try {
        // Fetch pending attendance count
        const pendingResponse = await axios.get('/api/v1/attendance/pending-approval', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPendingCount(pendingResponse.data.length || 0);

        // Fetch all recent activities (for display in popover)
        const activitiesResponse = await axios.get('/api/v1/activities/recent?limit=10', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setActivities(activitiesResponse.data.activities || []);

        // Fetch unread activities count (for badge)
        const unreadResponse = await axios.get('/api/v1/activities/recent?unread_only=true&limit=100', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUnreadCount(unreadResponse.data.count || 0);
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
        <Box
          component="img"
          src={require('../../assets/sparked-logo.png')}
          alt="Sparky Logo"
          sx={{
            width: 56,
            height: 56,
            mx: 'auto',
            mb: 1,
            borderRadius: '50%',
            objectFit: 'contain',
          }}
        />
        <Typography
          variant="h6"
          fontWeight="bold"
          color="primary"
        >
          Sparky
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

      {/* Sparky Branding */}
      <Box sx={{ p: 2, textAlign: 'center', bgcolor: '#F3F4F6' }}>
        <Typography variant="caption" color="text.secondary" display="block" sx={{ fontWeight: 500 }}>
          © 2025 Sparky from SparkEd
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
            <Badge badgeContent={unreadCount} color="error">
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
        <Paper sx={{ width: 350, maxHeight: 400, overflow: 'auto', borderRadius: 0 }}>
          <Box sx={{
            p: 2,
            background: 'linear-gradient(180deg, #3A5A8A 0%, #203C64 70%, #0E1826 100%)',
            color: '#ffffff',
          }}>
            <Typography variant="h6" sx={{ color: '#ffffff' }}>Recent Activity</Typography>
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