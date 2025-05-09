// src/components/admin/UserAddEditDialog.tsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { createUser, updateUser } from '../../store/admin/adminSlice';
import { fetchRoles } from '../../store/admin/adminSlice';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Grid,
  Alert,
  CircularProgress,
} from '@mui/material';

interface UserAddEditDialogProps {
  open: boolean;
  onClose: () => void;
  user?: any; // User object for editing, undefined for adding
}

const UserAddEditDialog: React.FC<UserAddEditDialogProps> = ({
  open,
  onClose,
  user,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { roles, isLoading, error } = useSelector((state: RootState) => state.admin);
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    role_id: 0,
    is_active: true,
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Load roles when dialog opens
  useEffect(() => {
    if (open && roles.length === 0) {
      dispatch(fetchRoles());
    }
  }, [open, roles.length, dispatch]);
  
  // Set form data when editing a user
  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username,
        email: user.email,
        password: '', // Don't show password
        first_name: user.first_name,
        last_name: user.last_name,
        role_id: user.role.id,
        is_active: user.is_active,
      });
    } else {
      // Reset form for adding
      setFormData({
        username: '',
        email: '',
        password: '',
        first_name: '',
        last_name: '',
        role_id: 0,
        is_active: true,
      });
    }
  }, [user]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name!]: value,
    });
  };
  
  const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.checked,
    });
  };
  
  const handleSubmit = async () => {
    // Validate required fields
    if (!formData.username || !formData.email || (!user && !formData.password) || 
        !formData.first_name || !formData.last_name || !formData.role_id) {
      // Show validation error
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (user) {
        // Update existing user
        const updateData = { ...formData };
        // Only include password if it was changed
        if (!updateData.password) {
          delete updateData.password;
        }
        
        await dispatch(updateUser({ id: user.id, data: updateData }));
      } else {
        // Create new user
        await dispatch(createUser(formData));
      }
      
      onClose();
    } catch (err) {
      console.error('Failed to save user:', err);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{user ? 'Edit User' : 'Add New User'}</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} sm={6}>
            <TextField
              name="username"
              label="Username"
              value={formData.username}
              onChange={handleChange}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              name="email"
              label="Email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              name="password"
              label={user ? "New Password (leave blank to keep current)" : "Password"}
              type="password"
              value={formData.password}
              onChange={handleChange}
              fullWidth
              required={!user}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              name="first_name"
              label="First Name"
              value={formData.first_name}
              onChange={handleChange}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              name="last_name"
              label="Last Name"
              value={formData.last_name}
              onChange={handleChange}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth required>
              <InputLabel id="role-select-label">Role</InputLabel>
              <Select
                labelId="role-select-label"
                id="role-select"
                name="role_id"
                value={formData.role_id}
                label="Role"
                onChange={handleChange}
              >
                <MenuItem value={0} disabled>Select a role</MenuItem>
                {roles.map((role) => (
                  <MenuItem key={role.id} value={role.id}>
                    {role.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.is_active}
                  onChange={handleSwitchChange}
                  name="is_active"
                  color="primary"
                />
              }
              label="Active"
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={isLoading || isSubmitting}
          startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
        >
          {isSubmitting ? 'Saving...' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserAddEditDialog;