import React from 'react';
import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const AdminRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  
  // If not authenticated at all, redirect to login
  if (!token) {
    return <Navigate to="/login" replace state={{ from: window.location.pathname }} />;
  }

  try {
    // Decode the token to check if user is admin
    const decoded = jwtDecode(token);
    if (decoded.role !== 'admin') {
      // If not admin, redirect to home page
      return <Navigate to="/" replace />;
    }
  } catch (error) {
    // If token is invalid, remove it and redirect to login
    console.error('Invalid token:', error);
    localStorage.removeItem('token');
    return <Navigate to="/login" replace state={{ from: window.location.pathname }} />;
  }

  // If admin, render the protected component
  return children;
};

export default AdminRoute; 