import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { user } = useSelector((state: RootState) => state.auth);

  if (!user || user.role.name !== 'admin') {
    return <Navigate to="/dashboard" />;
  }

  return <>{children}</>;
};

export default AdminRoute;