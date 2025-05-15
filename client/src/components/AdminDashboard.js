import React from 'react';
import { Container, Row, Col, Nav } from 'react-bootstrap';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { FaUsers, FaBox, FaShoppingCart, FaTachometerAlt, FaSignOutAlt, FaEnvelope } from 'react-icons/fa';
import DashboardStats from './DashboardStats';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === `/admin/${path}`;
  };

  // If we're at the root dashboard path, show the stats
  const showStats = location.pathname === '/admin' || location.pathname === '/admin/dashboard';

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <div className="admin-sidebar">
        <div className="sidebar-header">
          <h5 className="text-white mb-0">Admin Panel</h5>
        </div>
        <Nav className="flex-column">
          <Nav.Link
            as={Link}
            to="/admin/dashboard"
            className={`nav-item ${isActive('dashboard') ? 'active' : ''}`}
          >
            <FaTachometerAlt className="me-2" /> Dashboard
          </Nav.Link>
          <Nav.Link
            as={Link}
            to="/admin/users"
            className={`nav-item ${isActive('users') ? 'active' : ''}`}
          >
            <FaUsers className="me-2" /> Users
          </Nav.Link>
          <Nav.Link
            as={Link}
            to="/admin/products"
            className={`nav-item ${isActive('products') ? 'active' : ''}`}
          >
            <FaBox className="me-2" /> Products
          </Nav.Link>
          <Nav.Link
            as={Link}
            to="/admin/orders"
            className={`nav-item ${isActive('orders') ? 'active' : ''}`}
          >
            <FaShoppingCart className="me-2" /> Orders
          </Nav.Link>
         
          <Nav.Link
            as={Link}
            to="/admin/contacts"
            className={`nav-item ${isActive('contacts') ? 'active' : ''}`}
          >
            <FaEnvelope className="me-2" /> Contact Messages
          </Nav.Link>
          <Nav.Link
            onClick={handleLogout}
            className="nav-item text-danger mt-auto"
            style={{ cursor: 'pointer' }}
          >
            <FaSignOutAlt className="me-2" /> Logout
          </Nav.Link>
        </Nav>
      </div>

      {/* Main Content */}
      <div className="admin-main">
        {showStats ? <DashboardStats /> : <Outlet />}
      </div>
    </div>
  );
};

export default AdminDashboard; 