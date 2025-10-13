import { BrowserRouter as Router } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, Container, Typography } from '@mui/material';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Container maxWidth="xl">
          <Box sx={{ my: 4, textAlign: 'center' }}>
            <Typography variant="h3" component="h1" gutterBottom>
              Fee Management System
            </Typography>
            <Typography variant="h6" component="h2" gutterBottom>
              Journey 2: Fee Collection & Reconciliation
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
              Backend: <a href="http://localhost:8000/docs" target="_blank" rel="noopener noreferrer">
                http://localhost:8000/docs
              </a>
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 4 }}>
              Ready to start development!
            </Typography>
          </Box>
        </Container>
      </Router>
    </ThemeProvider>
  );
}

export default App;
