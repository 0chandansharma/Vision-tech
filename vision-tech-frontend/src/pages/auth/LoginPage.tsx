// src/pages/auth/LoginPage.tsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { login } from '../../store/auth/authSlice';
import {
  Box,
  Container,
  Typography,
  Paper,
  CssBaseline,
} from '@mui/material';
import LoginForm from '../../components/auth/LoginForm';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          <Box sx={{ mb: 3, textAlign: 'center' }}>
            <Typography component="h1" variant="h4" gutterBottom>
              Vision Tech
            </Typography>
            <Typography component="h2" variant="h5">
              Sign In
            </Typography>
          </Box>
          
          <LoginForm />
        </Paper>
      </Box>
    </Container>
  );
};

export default LoginPage;