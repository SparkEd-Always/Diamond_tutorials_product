import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Box,
  Paper,
  Typography,
  TextField,
  Link,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import LoadingButton from '../components/common/LoadingButton';
import SchoolIcon from '@mui/icons-material/School';
import config from '../config';
import { loginSchema } from '../utils/validationSchemas';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showSuccess, showError } = useNotification();
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setValidationErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setValidationErrors({});

    try {
      // Validate form
      await loginSchema.validate(formData, { abortEarly: false });

      // Proceed with login
      await login(formData);
      showSuccess('Login successful!');
      navigate('/dashboard');
    } catch (err: any) {
      if (err.name === 'ValidationError') {
        const errors: Record<string, string> = {};
        err.inner.forEach((error: any) => {
          if (error.path) {
            errors[error.path] = error.message;
          }
        });
        setValidationErrors(errors);
        showError('Please fix the validation errors');
      } else {
        showError(err.response?.data?.detail || 'Login failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        width: '100vw',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
      }}
    >
      <Container maxWidth="sm">
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            py: 4,
          }}
        >
        {/* Logo */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <SchoolIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
          <Typography variant="h4" gutterBottom fontWeight={700}>
            {config.schoolName}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Admission Portal
          </Typography>
        </Box>

        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom fontWeight={600}>
            Login
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Enter your credentials to access your account
          </Typography>

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              autoComplete="email"
              error={!!validationErrors.email}
              helperText={validationErrors.email}
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
              autoComplete="current-password"
              error={!!validationErrors.password}
              helperText={validationErrors.password}
              sx={{ mb: 3 }}
            />

            <LoadingButton
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              loading={loading}
              loadingText="Logging in..."
              sx={{ mb: 2 }}
            >
              Login
            </LoadingButton>

            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Don't have an account?{' '}
                <Link component={RouterLink} to="/register" underline="hover">
                  Register here
                </Link>
              </Typography>
            </Box>
          </form>
        </Paper>

        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Link component={RouterLink} to="/" underline="hover">
            ← Back to Home
          </Link>
        </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default LoginPage;
