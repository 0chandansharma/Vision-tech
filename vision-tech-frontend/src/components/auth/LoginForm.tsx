import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { login, clearAuthError } from '../../store/auth/authSlice';
import { TextField, Button, Paper, Typography, Box, Alert } from '@mui/material';
import { Lock as LockIcon } from '@mui/icons-material';

const LoginForm: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, error } = useSelector((state: RootState) => state.auth);
  // Parse validation errors or convert to string
  const formatValidationError = (error: any): string => {
    if (typeof error === 'string') {
      try {
        // Try to parse the error as JSON
        const parsedError = JSON.parse(error);
        if (Array.isArray(parsedError)) {
          // Format validation errors
          return parsedError.map(err => {
            const field = err.loc?.slice(-1)[0] || 'field';
            return `${field.charAt(0).toUpperCase() + field.slice(1)}: ${err.msg}`;
          }).join(', ');
        }
      } catch {
        // Not JSON, return as is
        return error;
      }
    }

    // For non-string errors
    return typeof error === 'object' ? JSON.stringify(error) : String(error);
  };

  const errorMessage = error ? formatValidationError(error) : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (username && password) {
      await dispatch(login({ username, password }));
    }
  };

  const handleChange = () => {
    if (error) {
      dispatch(clearAuthError());
    }
  };

  return (
    <Paper elevation={3} sx={{ padding: 4, maxWidth: 400, mx: 'auto' }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
        <LockIcon sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
        <Typography component="h1" variant="h5">
          Sign in to Vision Tech
        </Typography>
      </Box>

      {errorMessage && <Alert severity="error" sx={{ mb: 2 }}>{errorMessage}</Alert>}

      <Box component="form" onSubmit={handleSubmit}>
        <TextField
          margin="normal"
          required
          fullWidth
          id="username"
          label="Username"
          name="username"
          autoComplete="username"
          autoFocus
          value={username}
          onChange={(e) => {
            setUsername(e.target.value);
            handleChange();
          }}
        />
        <TextField
          margin="normal"
          required
          fullWidth
          name="password"
          label="Password"
          type="password"
          id="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            handleChange();
          }}
        />
        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2 }}
          disabled={isLoading}
        >
          {isLoading ? 'Signing in...' : 'Sign In'}
        </Button>
      </Box>
    </Paper>
  );
};

export default LoginForm;