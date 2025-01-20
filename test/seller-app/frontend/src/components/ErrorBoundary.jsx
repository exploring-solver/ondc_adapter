import { useRouteError } from 'react-router-dom';
import { Button, Container, Typography, Box } from '@mui/material';
import { Error as ErrorIcon } from '@mui/icons-material';

export default function ErrorBoundary() {
  const error = useRouteError();

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          textAlign: 'center',
        }}
      >
        <ErrorIcon sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
        <Typography variant="h4" gutterBottom>
          Oops! Something went wrong
        </Typography>
        <Typography color="text.secondary" paragraph>
          {error.statusText || error.message}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => window.location.href = '/'}
        >
          Go to Homepage
        </Button>
      </Box>
    </Container>
  );
} 