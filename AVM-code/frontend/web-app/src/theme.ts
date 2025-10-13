import { createTheme } from '@mui/material/styles';

// Sparky Color Palette - Exact colors from SparkEd Logo
const theme = createTheme({
  palette: {
    primary: {
      main: '#203C64', // Dark Blue (Book Covers from logo)
      light: '#3A5A8A', // Lighter blue
      dark: '#0E1826', // Darker blue (background gradient)
    },
    secondary: {
      main: '#47C752', // Green (Bookmark from logo)
      light: '#6FFF8F', // Glow Green (soft glow effect)
      dark: '#36A03E', // Darker green
    },
    success: {
      main: '#47C752', // Green bookmark
      light: '#6FFF8F', // Glow green
      dark: '#36A03E',
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
          borderRadius: 20,
          fontWeight: 600,
          padding: '12px 32px',
          position: 'relative',
          overflow: 'hidden',
          '&.MuiButton-contained': {
            color: '#ffffff !important',
          },
        },
        contained: {
          background: 'linear-gradient(180deg, #3A5A8A 0%, #203C64 50%, #0E1826 100%)',
          boxShadow: `
            0 1px 0 0 rgba(255,255,255,0.3) inset,
            0 -1px 0 0 rgba(0,0,0,0.2) inset,
            0 8px 20px -5px rgba(32, 60, 100, 0.5),
            0 4px 10px -3px rgba(0,0,0,0.25),
            0 0 0 0 rgba(111, 255, 143, 0)
          `,
          border: '1px solid rgba(58, 90, 138, 0.5)',
          color: '#ffffff !important',
          '&:hover': {
            background: 'linear-gradient(180deg, #4A6A9A 0%, #2A4C74 50%, #203C64 100%)',
            boxShadow: `
              0 1px 0 0 rgba(255,255,255,0.4) inset,
              0 -1px 0 0 rgba(0,0,0,0.3) inset,
              0 12px 30px -7px rgba(32, 60, 100, 0.6),
              0 6px 15px -4px rgba(0,0,0,0.3),
              0 0 20px 2px rgba(111, 255, 143, 0.3)
            `,
            transform: 'translateY(-2px)',
            color: '#ffffff !important',
          },
          '&:active': {
            transform: 'translateY(0px)',
            boxShadow: `
              0 1px 0 0 rgba(255,255,255,0.2) inset,
              0 -1px 0 0 rgba(0,0,0,0.3) inset,
              0 4px 12px -3px rgba(32, 60, 100, 0.4)
            `,
          },
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        },
        containedSecondary: {
          background: 'linear-gradient(180deg, #6FFF8F 0%, #47C752 50%, #36A03E 100%)',
          boxShadow: `
            0 1px 0 0 rgba(255,255,255,0.4) inset,
            0 -1px 0 0 rgba(0,0,0,0.15) inset,
            0 8px 20px -5px rgba(71, 199, 82, 0.5),
            0 4px 10px -3px rgba(0,0,0,0.25),
            0 0 0 0 rgba(111, 255, 143, 0)
          `,
          border: '1px solid rgba(111, 255, 143, 0.6)',
          '&:hover': {
            background: 'linear-gradient(180deg, #8FFFAB 0%, #6FFF8F 50%, #47C752 100%)',
            boxShadow: `
              0 1px 0 0 rgba(255,255,255,0.5) inset,
              0 -1px 0 0 rgba(0,0,0,0.2) inset,
              0 12px 30px -7px rgba(71, 199, 82, 0.6),
              0 6px 15px -4px rgba(0,0,0,0.3),
              0 0 30px 4px rgba(111, 255, 143, 0.6)
            `,
            transform: 'translateY(-2px)',
          },
          '&:active': {
            transform: 'translateY(0px)',
            boxShadow: `
              0 1px 0 0 rgba(255,255,255,0.3) inset,
              0 -1px 0 0 rgba(0,0,0,0.15) inset,
              0 4px 12px -3px rgba(71, 199, 82, 0.4)
            `,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 24,
          boxShadow: `
            0 1px 0 0 rgba(255,255,255,0.6) inset,
            0 10px 30px -8px rgba(32, 60, 100, 0.2),
            0 4px 12px -4px rgba(0,0,0,0.12),
            0 0 40px -8px rgba(111, 255, 143, 0.15)
          `,
          border: '1px solid rgba(32, 60, 100, 0.08)',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            boxShadow: `
              0 1px 0 0 rgba(255,255,255,0.7) inset,
              0 16px 40px -10px rgba(32, 60, 100, 0.3),
              0 6px 16px -4px rgba(0,0,0,0.18),
              0 0 50px 0px rgba(111, 255, 143, 0.3)
            `,
            transform: 'translateY(-4px)',
            borderColor: 'rgba(111, 255, 143, 0.25)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 24,
          fontWeight: 500,
        },
        filled: {
          boxShadow: '0 2px 8px -2px rgba(0,0,0,0.2), 0 0 15px -5px rgba(111, 255, 143, 0.2)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(180deg, #3A5A8A 0%, #203C64 70%, #0E1826 100%)',
          boxShadow: `
            0 1px 0 0 rgba(255,255,255,0.25) inset,
            0 4px 20px -2px rgba(32, 60, 100, 0.4),
            0 0 40px -10px rgba(111, 255, 143, 0.1)
          `,
          color: '#ffffff',
          '& .MuiTypography-root': {
            color: '#ffffff',
          },
          '& .MuiIconButton-root': {
            color: '#ffffff',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
        elevation1: {
          boxShadow: `
            0 1px 0 0 rgba(255,255,255,0.6) inset,
            0 4px 12px -4px rgba(32, 60, 100, 0.15),
            0 0 20px -8px rgba(111, 255, 143, 0.1)
          `,
        },
        elevation2: {
          boxShadow: `
            0 1px 0 0 rgba(255,255,255,0.7) inset,
            0 8px 20px -6px rgba(32, 60, 100, 0.2),
            0 0 30px -8px rgba(111, 255, 143, 0.15)
          `,
        },
        elevation3: {
          boxShadow: `
            0 1px 0 0 rgba(255,255,255,0.8) inset,
            0 12px 28px -8px rgba(32, 60, 100, 0.25),
            0 0 40px -8px rgba(111, 255, 143, 0.2)
          `,
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          background: 'linear-gradient(180deg, #fafbfc 0%, #f5f6f8 100%)',
          boxShadow: `
            0 1px 0 0 rgba(255,255,255,0.8) inset,
            4px 0 30px -8px rgba(32, 60, 100, 0.15)
          `,
          borderRight: '1px solid rgba(32, 60, 100, 0.1)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 16,
            transition: 'all 0.3s ease',
            '&:hover': {
              boxShadow: '0 0 20px -5px rgba(111, 255, 143, 0.2)',
            },
            '&.Mui-focused': {
              boxShadow: '0 0 25px -3px rgba(111, 255, 143, 0.3)',
            },
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 24,
          boxShadow: `
            0 1px 0 0 rgba(255,255,255,0.7) inset,
            0 20px 60px -10px rgba(32, 60, 100, 0.3),
            0 0 60px 0px rgba(111, 255, 143, 0.2)
          `,
        },
      },
    },
  },
  shape: {
    borderRadius: 16,
  },
});

export default theme;