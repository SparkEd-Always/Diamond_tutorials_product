import { ThemeProvider, createTheme, CssBaseline, Container, Typography, Box } from '@mui/material'

const theme = createTheme({
  palette: {
    primary: { main: '#1976d2' },
    secondary: { main: '#dc004e' },
  },
})

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="xl">
        <Box sx={{ my: 4 }}>
          <Typography variant="h3" component="h1" gutterBottom>
            Parent Communication System
          </Typography>
          <Typography variant="h5" color="text.secondary">
            Frontend skeleton ready. Start building Phase 1!
          </Typography>
        </Box>
      </Container>
    </ThemeProvider>
  )
}

export default App
