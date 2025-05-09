import React from 'react';
import { useSelector } from 'react-redux';
import { NavLink } from 'react-router-dom';
import { RootState } from '../../../store';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  VideoLibrary as VideoIcon,
  Folder as ProjectIcon,
  SupervisedUserCircle as AdminIcon,
  Home as HomeIcon,
} from '@mui/icons-material';

interface SidebarProps {
  open: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ open }) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const isAdmin = user?.role?.name === 'admin';

  return (
    <Drawer
      variant="persistent"
      anchor="left"
      open={open}
      sx={{
        width: 240,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 240,
          boxSizing: 'border-box',
          top: 64, // Below app bar
          height: 'calc(100% - 64px)',
        },
      }}
    >
      <Box sx={{ overflow: 'auto' }}>
        <List>
          <ListItem disablePadding>
            <ListItemButton component={NavLink} to="/dashboard">
              <ListItemIcon><HomeIcon /></ListItemIcon>
              <ListItemText primary="Home" />
            </ListItemButton>
          </ListItem>
          
          <ListItem disablePadding>
            <ListItemButton component={NavLink} to="/projects">
              <ListItemIcon><ProjectIcon /></ListItemIcon>
              <ListItemText primary="Projects" />
            </ListItemButton>
          </ListItem>
        </List>
        
        <Divider />
        
        {isAdmin && (
          <List>
            <ListItem disablePadding>
              <ListItemButton component={NavLink} to="/admin/users">
                <ListItemIcon><AdminIcon /></ListItemIcon>
                <ListItemText primary="User Management" />
              </ListItemButton>
            </ListItem>
          </List>
        )}
      </Box>
    </Drawer>
  );
};

export default Sidebar;