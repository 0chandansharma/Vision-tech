import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { logout } from '../../store/auth/authSlice';
import {
  Avatar,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Box,
  Divider,
} from '@mui/material';
import {
  Person as PersonIcon,
  Settings as SettingsIcon,
  ExitToApp as LogoutIcon,
} from '@mui/icons-material';

const UserMenu: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleCloseMenu();
    dispatch(logout());
    navigate('/login');
  };

  const handleProfile = () => {
    handleCloseMenu();
    // Navigate to profile page
  };

  const handleSettings = () => {
    handleCloseMenu();
    // Navigate to settings page
  };

  if (!user) {
    return (
      <Button
        variant="outlined"
        color="inherit"
        startIcon={<PersonIcon />}
        onClick={() => navigate('/login')}
      >
        Sign In
      </Button>
    );
  }

  // Get initials for avatar
  const getInitials = () => {
    if (!user.first_name && !user.last_name) return 'U';
    return `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`;
  };

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <IconButton
          onClick={handleOpenMenu}
          sx={{ p: 0 }}
          aria-controls="user-menu"
          aria-haspopup="true"
        >
          <Avatar sx={{ bgcolor: 'primary.main' }}>{getInitials()}</Avatar>
        </IconButton>
        <Typography sx={{ ml: 1, display: { xs: 'none', sm: 'block' } }}>
          {user.first_name} {user.last_name}
        </Typography>
      </Box>
      
      <Menu
        id="user-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={handleProfile}>
          <PersonIcon fontSize="small" sx={{ mr: 1 }} />
          Profile
        </MenuItem>
        <MenuItem onClick={handleSettings}>
          <SettingsIcon fontSize="small" sx={{ mr: 1 }} />
          Settings
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <LogoutIcon fontSize="small" sx={{ mr: 1 }} />
          Logout
        </MenuItem>
      </Menu>
    </>
  );
};

export default UserMenu;