import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Alert, Row, Col, Card, Badge } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaUserPlus, FaEdit, FaTrash, FaEye } from 'react-icons/fa';

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [currentUser, setCurrentUser] = useState({
    name: '',
    email: '',
    role: 'user',
    password: '',
    phone: '',
    address: '',
    country: 'India',
    preferredCurrency: 'INR'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [stats, setStats] = useState({
    totalUsers: 0,
    adminUsers: 0,
    regularUsers: 0,
    activeToday: 0
  });
  const navigate = useNavigate();

  // Get auth headers with token
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return null;
    }
    return {
      headers: { Authorization: `Bearer ${token}` }
    };
  };

  // Fetch all users
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const headers = getAuthHeaders();
      if (!headers) return;

      const response = await axios.get('http://localhost:5000/api/users', headers);
      setUsers(response.data);
      
      // Calculate stats
      const adminCount = response.data.filter(user => user.role === 'admin').length;
      const userCount = response.data.filter(user => user.role === 'user').length;
      const activeTodayCount = response.data.filter(user => {
        const lastActive = new Date(user.updatedAt);
        const today = new Date();
        return lastActive.toDateString() === today.toDateString();
      }).length;

      setStats({
        totalUsers: response.data.length,
        adminUsers: adminCount,
        regularUsers: userCount,
        activeToday: activeTodayCount
      });
      
      setError('');
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        navigate('/login');
      }
      setError('Failed to fetch users: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Handle user form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const headers = getAuthHeaders();
      if (!headers) return;

      // Ensure required fields are present
      if (!currentUser.country) {
        setError('Country is required');
        setLoading(false);
        return;
      }

      // Set default preferredCurrency based on country if not set
      const userData = {
        ...currentUser,
        preferredCurrency: currentUser.preferredCurrency || (currentUser.country === 'India' ? 'INR' : 'USD')
      };

      if (currentUser._id) {
        // Update existing user
        await axios.put(
          `http://localhost:5000/api/users/${currentUser._id}`,
          {
            name: userData.name,
            email: userData.email,
            role: userData.role,
            phone: userData.phone,
            address: userData.address,
            country: userData.country,
            preferredCurrency: userData.preferredCurrency
          },
          headers
        );
        setSuccess('User updated successfully');
      } else {
        // Create new user
        await axios.post(
          'http://localhost:5000/api/auth/register',
          userData,
          headers
        );
        setSuccess('User created successfully');
      }
      setShowModal(false);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving user');
    } finally {
      setLoading(false);
    }
  };

  // Handle user deletion
  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    
    setLoading(true);
    try {
      const headers = getAuthHeaders();
      if (!headers) return;

      await axios.delete(`http://localhost:5000/api/users/${userId}`, headers);
      setSuccess('User deleted successfully');
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Error deleting user');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="p-4">
      <h2 className="mb-4">Users Management</h2>

      {/* Stats Cards */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="bg-primary text-white">
            <Card.Body>
              <h6>Total Users</h6>
              <h2>{stats.totalUsers}</h2>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="bg-success text-white">
            <Card.Body>
              <h6>Regular Users</h6>
              <h2>{stats.regularUsers}</h2>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="bg-info text-white">
            <Card.Body>
              <h6>Admin Users</h6>
              <h2>{stats.adminUsers}</h2>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="bg-warning text-white">
            <Card.Body>
              <h6>Active Today</h6>
              <h2>{stats.activeToday}</h2>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}
          {success && <Alert variant="success" onClose={() => setSuccess('')} dismissible>{success}</Alert>}
        </div>
        <Button 
          variant="primary" 
          onClick={() => {
            setCurrentUser({ 
              name: '', 
              email: '', 
              role: 'user', 
              password: '', 
              phone: '', 
              address: '',
              country: 'India',
              preferredCurrency: 'INR'
            });
            setShowModal(true);
          }}
          className="d-flex align-items-center"
        >
          <FaUserPlus className="me-2" /> Add New User
        </Button>
      </div>

      {loading ? (
        <div className="text-center p-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <div className="table-responsive">
          <Table striped bordered hover className="bg-white shadow-sm">
            <thead className="bg-light">
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Phone</th>
                <th>Country</th>
                <th>Currency</th>
                <th>Created</th>
                <th>Last Active</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user._id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    <Badge bg={user.role === 'admin' ? 'danger' : 'success'}>
                      {user.role}
                    </Badge>
                  </td>
                  <td>{user.phone}</td>
                  <td>{user.country}</td>
                  <td>{user.preferredCurrency}</td>
                  <td>{formatDate(user.createdAt)}</td>
                  <td>{formatDate(user.updatedAt)}</td>
                  <td>
                    <Button
                      variant="outline-info"
                      size="sm"
                      className="me-2"
                      onClick={() => {
                        setCurrentUser(user);
                        setShowViewModal(true);
                      }}
                    >
                      <FaEye /> View
                    </Button>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="me-2"
                      onClick={() => {
                        setCurrentUser(user);
                        setShowModal(true);
                      }}
                    >
                      <FaEdit /> Edit
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleDelete(user._id)}
                    >
                      <FaTrash /> Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}

      {/* Add/Edit User Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton className="bg-light">
          <Modal.Title>{currentUser._id ? 'Edit User' : 'Add New User'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter name"
                    value={currentUser.name}
                    onChange={(e) => setCurrentUser({ ...currentUser, name: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Enter email"
                    value={currentUser.email}
                    onChange={(e) => setCurrentUser({ ...currentUser, email: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Phone</Form.Label>
                  <Form.Control
                    type="tel"
                    placeholder="Enter phone number"
                    value={currentUser.phone}
                    onChange={(e) => setCurrentUser({ ...currentUser, phone: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Role</Form.Label>
                  <Form.Select
                    value={currentUser.role}
                    onChange={(e) => setCurrentUser({ ...currentUser, role: e.target.value })}
                    required
                  >
                    <option value="user">Regular User</option>
                    <option value="admin">Admin</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Country</Form.Label>
                  <Form.Select
                    value={currentUser.country}
                    onChange={(e) => setCurrentUser({ 
                      ...currentUser, 
                      country: e.target.value,
                      preferredCurrency: e.target.value === 'India' ? 'INR' : 'USD'
                    })}
                    required
                  >
                    <option value="India">India</option>
                    <option value="United States">United States</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Canada">Canada</option>
                    <option value="Australia">Australia</option>
                    <option value="Singapore">Singapore</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Preferred Currency</Form.Label>
                  <Form.Select
                    value={currentUser.preferredCurrency}
                    onChange={(e) => setCurrentUser({ ...currentUser, preferredCurrency: e.target.value })}
                    required
                  >
                    <option value="INR">INR</option>
                    <option value="USD">USD</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            {!currentUser._id && (
              <Form.Group className="mb-3">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Enter password"
                  value={currentUser.password}
                  onChange={(e) => setCurrentUser({ ...currentUser, password: e.target.value })}
                  required={!currentUser._id}
                />
                <Form.Text className="text-muted">
                  Password must be at least 6 characters long
                </Form.Text>
              </Form.Group>
            )}

            <Form.Group className="mb-3">
              <Form.Label>Address</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Enter address"
                value={currentUser.address}
                onChange={(e) => setCurrentUser({ ...currentUser, address: e.target.value })}
                required
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? 'Saving...' : (currentUser._id ? 'Update User' : 'Add User')}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* View User Details Modal */}
      <Modal show={showViewModal} onHide={() => setShowViewModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>User Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-3">
            <strong>Name:</strong> {currentUser.name}
          </div>
          <div className="mb-3">
            <strong>Email:</strong> {currentUser.email}
          </div>
          <div className="mb-3">
            <strong>Role:</strong> <Badge bg={currentUser.role === 'admin' ? 'danger' : 'success'}>{currentUser.role}</Badge>
          </div>
          <div className="mb-3">
            <strong>Phone:</strong> {currentUser.phone}
          </div>
          <div className="mb-3">
            <strong>Country:</strong> {currentUser.country}
          </div>
          <div className="mb-3">
            <strong>Preferred Currency:</strong> {currentUser.preferredCurrency}
          </div>
          <div className="mb-3">
            <strong>Address:</strong>
            <p className="mt-1">{currentUser.address}</p>
          </div>
          <div className="mb-3">
            <strong>Created At:</strong> {formatDate(currentUser.createdAt)}
          </div>
          <div className="mb-3">
            <strong>Last Active:</strong> {formatDate(currentUser.updatedAt)}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowViewModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default AdminUsers; 