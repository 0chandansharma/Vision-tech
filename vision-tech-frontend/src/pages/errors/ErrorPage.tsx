import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  Paper,
} from '@mui/material';
import { Error as ErrorIcon, Home as HomeIcon } from '@mui/icons-material';

interface ErrorInfo {
  status?: number;
  title: string;
  message: string;
}

const ErrorPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { error?: ErrorInfo } | null;
  
  // Default error if none provided
  const errorInfo: ErrorInfo = state?.error || {
    status: 500,
    title: 'Something went wrong',
    message: 'An unexpected error occurred. Please try again later.',
  };

  const handleGoHome = () => {
    navigate('/');
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <Container maxWidth="md">
      <Box
        sx={{
          mt: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper 
          elevation={3} 
          sx={{ 
            p: 5, 
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <ErrorIcon color="error" sx={{ fontSize: 80, mb: 2 }} />
          
          {errorInfo.status && (
            <Typography variant="h3" component="h1" color="error" gutterBottom>
              {errorInfo.status}
            </Typography>
          )}
          
          <Typography variant="h4" component="h2" gutterBottom>
            {errorInfo.title}
          </Typography>
          
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: '600px' }}>
            {errorInfo.message}
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <Button 
              variant="outlined" 
              onClick={handleGoBack}
            >
              Go Back
            </Button>
            <Button 
              variant="contained" 
              startIcon={<HomeIcon />}
              onClick={handleGoHome}
            >
              Home
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default ErrorPage;