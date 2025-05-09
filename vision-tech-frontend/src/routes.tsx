import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Auth Components
import LoginPage from './pages/auth/LoginPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminRoute from './components/auth/AdminRoute';

// Page Components
import DashboardPage from './pages/dashboard/DashboardPage';
import ProjectsListPage from './pages/projects/ProjectsListPage';
import ProjectDetailsPage from './pages/projects/ProjectDetailsPage';
import ProjectCreationPage from './pages/projects/ProjectCreationPage';
import UserManagementPage from './pages/admin/UserManagementPage';
import SystemMonitoringPage from './pages/admin/SystemMonitoringPage';
import ErrorPage from './pages/errors/ErrorPage';
import NotFoundPage from './pages/errors/NotFoundPage';

// Detection Pages
import DetectionResultsPage from './components/detection/DetectionResultsPage';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      
      {/* Protected Routes */}
      <Route 
        path="/" 
        element={<ProtectedRoute><Navigate to="/dashboard" replace /></ProtectedRoute>} 
      />
      <Route 
        path="/dashboard" 
        element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} 
      />
      
      {/* Project Routes */}
      <Route 
        path="/projects" 
        element={<ProtectedRoute><ProjectsListPage /></ProtectedRoute>} 
      />
      <Route 
        path="/projects/new" 
        element={<ProtectedRoute><ProjectCreationPage /></ProtectedRoute>} 
      />
      <Route 
        path="/projects/:id" 
        element={<ProtectedRoute><ProjectDetailsPage /></ProtectedRoute>} 
      />
      
      {/* Detection Routes */}
      <Route 
        path="/detection/:jobId/results" 
        element={<ProtectedRoute><DetectionResultsPage /></ProtectedRoute>} 
      />
      
      {/* Admin Routes */}
      <Route 
        path="/admin/users" 
        element={<AdminRoute><UserManagementPage /></AdminRoute>} 
      />
      <Route 
        path="/admin/system" 
        element={<AdminRoute><SystemMonitoringPage /></AdminRoute>} 
      />
      
      {/* Error Routes */}
      <Route path="/error" element={<ErrorPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;