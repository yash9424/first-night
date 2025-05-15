import React from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Container, Row, Col, Nav } from 'react-bootstrap';
import { FaUsers, FaBox, FaShoppingCart, FaTachometerAlt, FaSignOutAlt } from 'react-icons/fa';

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === `/admin/${path}`;
  };

  return (
    <Container fluid>
      <Row>
        {/* Sidebar */}
        <Col md={3} lg={2} className="bg-dark sidebar">
          <div className="sidebar-sticky">
            <h3 className="text-light p-3">Admin Panel</h3>
            <Nav className="flex-column">
              <Nav.Item>
                <Link
                  to="/admin/dashboard"
                  className={`nav-link ${isActive('dashboard') ? 'active' : ''}`}
                >
                  <FaTachometerAlt /> Dashboard
                </Link>
              </Nav.Item>
              <Nav.Item>
                <Link
                  to="/admin/users"
                  className={`nav-link ${isActive('users') ? 'active' : ''}`}
                >
                  <FaUsers /> Users
                </Link>
              </Nav.Item>
              <Nav.Item>
                <Link
                  to="/admin/products"
                  className={`nav-link ${isActive('products') ? 'active' : ''}`}
                >
                  <FaBox /> Products
                </Link>
              </Nav.Item>
              <Nav.Item>
                <Link
                  to="/admin/orders"
                  className={`nav-link ${isActive('orders') ? 'active' : ''}`}
                >
                  <FaShoppingCart /> Orders
                </Link>
              </Nav.Item>
              <Nav.Item>
                <button
                  onClick={handleLogout}
                  className="nav-link btn btn-link text-danger"
                >
                  <FaSignOutAlt /> Logout
                </button>
              </Nav.Item>
            </Nav>
          </div>
        </Col>

        {/* Main Content */}
        <Col md={9} lg={10} className="ms-sm-auto px-md-4 py-4">
          <Outlet />
        </Col>
      </Row>
    </Container>
  );
};

export default AdminLayout; 