import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');

  if (!token) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (location.pathname.startsWith('/admin') && userRole !== 'admin') {
    // Redirect to home if not an admin trying to access admin routes
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute; 