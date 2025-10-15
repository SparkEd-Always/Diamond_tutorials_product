import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Container,
  Stack,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Link,
} from '@mui/material';
import axios from 'axios';

import { AppDispatch, RootState } from '../store/store';
import { login, clearError } from '../store/slices/authSlice';

const LoginPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, error, isAuthenticated } = useSelector((state: RootState) => state.auth);

  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [changePasswordData, setChangePasswordData] = useState({
    username: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [changePasswordError, setChangePasswordError] = useState('');
  const [changePasswordSuccess, setChangePasswordSuccess] = useState('');
  const [changePasswordLoading, setChangePasswordLoading] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    // Clear error when user starts typing
    if (error) {
      dispatch(clearError());
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.username && formData.password) {
      dispatch(login(formData));
    }
  };

  const handleChangePasswordOpen = () => {
    setChangePasswordOpen(true);
    setChangePasswordError('');
    setChangePasswordSuccess('');
  };

  const handleChangePasswordClose = () => {
    setChangePasswordOpen(false);
    setChangePasswordData({
      username: '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    setChangePasswordError('');
    setChangePasswordSuccess('');
  };

  const handleChangePasswordInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setChangePasswordData({
      ...changePasswordData,
      [e.target.name]: e.target.value,
    });
    setChangePasswordError('');
  };

  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangePasswordError('');
    setChangePasswordSuccess('');

    // Validation
    if (!changePasswordData.username || !changePasswordData.currentPassword ||
        !changePasswordData.newPassword || !changePasswordData.confirmPassword) {
      setChangePasswordError('All fields are required');
      return;
    }

    if (changePasswordData.newPassword !== changePasswordData.confirmPassword) {
      setChangePasswordError('New passwords do not match');
      return;
    }

    if (changePasswordData.newPassword.length < 6) {
      setChangePasswordError('New password must be at least 6 characters');
      return;
    }

    setChangePasswordLoading(true);

    try {
      // First, login to get the token
      const API_BASE_URL = process.env.REACT_APP_API_URL || '/api/v1';
      const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`,
        new URLSearchParams({
          username: changePasswordData.username,
          password: changePasswordData.currentPassword,
        }),
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }
      );

      const token = loginResponse.data.access_token;

      // Then, change the password
      await axios.post(
        `${API_BASE_URL}/auth/change-password`,
        {
          current_password: changePasswordData.currentPassword,
          new_password: changePasswordData.newPassword,
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setChangePasswordSuccess('Password changed successfully! You can now login with your new password.');

      // Clear form after 2 seconds
      setTimeout(() => {
        handleChangePasswordClose();
      }, 2000);
    } catch (err: any) {
      setChangePasswordError(err.response?.data?.detail || 'Failed to change password');
    } finally {
      setChangePasswordLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Card
          sx={{
            width: '100%',
            maxWidth: 400,
            boxShadow: 3,
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Stack spacing={3} alignItems="center">
              {/* Logo and Title */}
              <Box
                component="img"
                src={require('../assets/sparked-logo.png')}
                alt="Sparky Logo"
                sx={{
                  width: 80,
                  height: 80,
                  objectFit: 'contain',
                }}
              />

              <Box textAlign="center">
                <Typography variant="h4" fontWeight="bold" color="primary">
                  Sparky
                </Typography>
              </Box>

              <Divider sx={{ width: '100%' }} />

              {/* Login Form */}
              <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
                <Stack spacing={3}>
                  <Typography variant="h6" textAlign="center">
                    Sign In to Your Account
                  </Typography>

                  {error && (
                    <Alert severity="error" sx={{ mt: 2 }}>
                      {error}
                    </Alert>
                  )}

                  <TextField
                    fullWidth
                    label="Username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    variant="outlined"
                    required
                    placeholder="Enter your username"
                  />

                  <TextField
                    fullWidth
                    label="Password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    variant="outlined"
                    required
                    placeholder="Enter your password"
                  />

                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    disabled={isLoading || !formData.username || !formData.password}
                    sx={{ mt: 3 }}
                  >
                    {isLoading ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      'Sign In'
                    )}
                  </Button>

                  {/* Change Password Link */}
                  <Box textAlign="center" mt={2}>
                    <Link
                      component="button"
                      variant="body2"
                      onClick={handleChangePasswordOpen}
                      sx={{ cursor: 'pointer' }}
                    >
                      Change Password
                    </Link>
                  </Box>
                </Stack>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Box>

      {/* Change Password Dialog */}
      <Dialog open={changePasswordOpen} onClose={handleChangePasswordClose} maxWidth="sm" fullWidth>
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleChangePasswordSubmit} sx={{ mt: 2 }}>
            <Stack spacing={3}>
              {changePasswordError && (
                <Alert severity="error">{changePasswordError}</Alert>
              )}
              {changePasswordSuccess && (
                <Alert severity="success">{changePasswordSuccess}</Alert>
              )}

              <TextField
                fullWidth
                label="Username"
                name="username"
                value={changePasswordData.username}
                onChange={handleChangePasswordInputChange}
                variant="outlined"
                required
                placeholder="Enter your username"
              />

              <TextField
                fullWidth
                label="Current Password"
                name="currentPassword"
                type="password"
                value={changePasswordData.currentPassword}
                onChange={handleChangePasswordInputChange}
                variant="outlined"
                required
                placeholder="Enter your current password"
              />

              <TextField
                fullWidth
                label="New Password"
                name="newPassword"
                type="password"
                value={changePasswordData.newPassword}
                onChange={handleChangePasswordInputChange}
                variant="outlined"
                required
                placeholder="Enter your new password (min 6 characters)"
              />

              <TextField
                fullWidth
                label="Confirm New Password"
                name="confirmPassword"
                type="password"
                value={changePasswordData.confirmPassword}
                onChange={handleChangePasswordInputChange}
                variant="outlined"
                required
                placeholder="Confirm your new password"
              />
            </Stack>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleChangePasswordClose} disabled={changePasswordLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleChangePasswordSubmit}
            variant="contained"
            disabled={changePasswordLoading}
          >
            {changePasswordLoading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              'Change Password'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default LoginPage;