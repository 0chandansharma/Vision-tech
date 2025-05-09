import React, { ReactNode } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Box, Container, CssBaseline } from '@mui/material';
import Header from './Header';
import Sidebar from './Sidebar';

interface AppLayoutProps {
  children?: ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  const location = useLocation();

  // Don't show layout for login and other public pages
  const isPublicRoute = ['/login', '/forgot-password'].includes(location.pathname);
  if (isPublicRoute) {
    return <>{children || <Outlet />}</>;
  }

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
          {children || <Outlet />}
        </Container>
      </Box>
    </Box>
  );
};

export default AppLayout;