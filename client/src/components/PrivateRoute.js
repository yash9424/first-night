import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  // Get authentication status from localStorage
  const isAuthenticated = localStorage.getItem('token') !== null;

  // If not authenticated, redirect to login page with the return url
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: window.location.pathname }} />;
  }

  // If authenticated, render the protected component
  return children;
};

export default PrivateRoute; 