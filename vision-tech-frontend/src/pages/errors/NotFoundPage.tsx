// src/pages/errors/NotFoundPage.tsx
import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Button, Container, Typography } from '@mui/material';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

const NotFoundPage: React.FC = () => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  return (
    <Container maxWidth="md">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          textAlign: 'center',
          py: 5,
        }}
      >
        <Typography variant="h1" component="h1" gutterBottom>
          404
        </Typography>
        <Typography variant="h4" component="h2" gutterBottom>
          Page Not Found
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          The page you're looking for doesn't exist or has been moved.
        </Typography>
        <Button
          variant="contained"
          component={RouterLink}
          to={isAuthenticated ? '/dashboard' : '/login'}
          sx={{ mt: 2 }}
        >
          {isAuthenticated ? 'Back to Dashboard' : 'Back to Login'}
        </Button>
      </Box>
    </Container>
  );
};

export default NotFoundPage;