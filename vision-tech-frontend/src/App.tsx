import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from './store';
import LoginPage from './pages/auth/LoginPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import ProjectsListPage from './pages/projects/ProjectsListPage';
import ProjectDetailsPage from './pages/projects/ProjectDetailsPage';
import ProjectCreationPage from './pages/projects/ProjectCreationPage';
import UserManagementPage from './pages/admin/UserManagementPage';
import NotFoundPage from './pages/errors/NotFoundPage';
import AppLayout from './components/common/Layout/AppLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminRoute from './components/auth/AdminRoute';

const App: React.FC = () => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  return (
    <Routes>
      <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to="/dashboard" />} />
      
      <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/dashboard" />} />
        <Route path="dashboard" element={<DashboardPage />} />
        
        <Route path="projects">
          <Route index element={<ProjectsListPage />} />
          <Route path="new" element={<ProjectCreationPage />} />
          <Route path=":projectId" element={<ProjectDetailsPage />} />
        </Route>
        
        <Route path="admin">
          <Route index element={<Navigate to="users" />} />
          <Route path="users" element={<AdminRoute><UserManagementPage /></AdminRoute>} />
        </Route>
      </Route>
      
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default App;