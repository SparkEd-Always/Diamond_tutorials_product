import { createTheme } from '@mui/material/styles';

// AVM Tutorial Management System Color Palette
const theme = createTheme({
  palette: {
    primary: {
      main: '#4F46E5', // Primary Blue
      light: '#7C3AED', // Purple Accent
      dark: '#3730A3',
    },
    secondary: {
      main: '#10B981', // Success Green
      light: '#34D399',
      dark: '#059669',
    },
    success: {
      main: '#10B981', // Success Green
      light: '#34D399',
      dark: '#059669',
    },
    warning: {
      main: '#F59E0B', // Warning Orange
      light: '#FBBF24',
      dark: '#D97706',
    },
    error: {
      main: '#EF4444', // Danger Red
      light: '#F87171',
      dark: '#DC2626',
    },
    info: {
      main: '#3B82F6', // Light Blue
      light: '#60A5FA',
      dark: '#2563EB',
    },
    background: {
      default: '#F8FAFC',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1F2937',
      secondary: '#6B7280',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 600,
      fontSize: '2.5rem',
      color: '#1F2937',
    },
    h2: {
      fontWeight: 600,
      fontSize: '2rem',
      color: '#1F2937',
    },
    h3: {
      fontWeight: 500,
      fontSize: '1.5rem',
      color: '#1F2937',
    },
    h4: {
      fontWeight: 500,
      fontSize: '1.25rem',
      color: '#1F2937',
    },
    h5: {
      fontWeight: 500,
      fontSize: '1.125rem',
      color: '#1F2937',
    },
    h6: {
      fontWeight: 500,
      fontSize: '1rem',
      color: '#1F2937',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          fontWeight: 500,
        },
        contained: {
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          '&:hover': {
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        },
      },
    },
  },
  shape: {
    borderRadius: 8,
  },
});

export default theme;