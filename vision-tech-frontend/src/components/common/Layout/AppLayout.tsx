import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Container, CssBaseline } from '@mui/material';
import Header from './Header';
import Sidebar from './Sidebar';

const AppLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = React.useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <CssBaseline />
      <Header toggleSidebar={toggleSidebar} />
      <Sidebar open={sidebarOpen} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          pt: 8, // Space for header
          pl: sidebarOpen ? 8 : 0, // Space for sidebar
          transition: 'padding-left 0.3s',
        }}
      >
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
};

export default AppLayout;