import React, { useState, useEffect } from 'react';
import { Container, Card, Form, Button, Alert, Row, Col, InputGroup } from 'react-bootstrap';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const UserProfile = () => {
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordVisibility, setPasswordVisibility] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.get('http://localhost:5000/api/users/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Profile data:', response.data);
      setProfile(response.data);
      setLoading(false);
      setError('');
    } catch (err) {
      console.error('Error details:', err);
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        setError(err.response?.data?.message || 'Failed to load profile');
      }
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const togglePasswordVisibility = (field) => {
    setPasswordVisibility(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const validatePasswordChange = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      return false;
    }
    if (passwordData.newPassword.length < 6) {
      setError('New password must be at least 6 characters long');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      // If changing password, validate the inputs
      if (isChangingPassword) {
        if (!validatePasswordChange()) {
          return;
        }
      }

      const updateData = {
        ...profile,
        ...(isChangingPassword && {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      };

      const response = await axios.put(
        'http://localhost:5000/api/users/profile',
        updateData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setProfile(response.data);
      setSuccess('Profile updated successfully' + (isChangingPassword ? ' (including password)' : ''));
      setIsEditing(false);
      setIsChangingPassword(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setError('');
    } catch (err) {
      console.error('Update error:', err);
      if (err.response?.status === 401) {
        if (err.response.data.message.includes('Current password is incorrect')) {
          setError('Current password is incorrect');
        } else {
          localStorage.removeItem('token');
          navigate('/login');
        }
      } else {
        setError(err.response?.data?.message || 'Failed to update profile');
      }
    }
  };

  if (loading) {
    return (
      <Container className="py-5">
        <div className="text-center">Loading...</div>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <Card>
        <Card.Header className="bg-dark text-white d-flex justify-content-between align-items-center">
          <h4 className="mb-0">My Profile</h4>
          <div>
            <Button 
              variant={isEditing ? "light" : "outline-light"}
              onClick={() => {
                setIsEditing(!isEditing);
                setIsChangingPassword(false);
                setError('');
                setSuccess('');
              }}
              className="me-2"
            >
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </Button>
            {!isChangingPassword && (
              <Button 
                variant="outline-light"
                onClick={() => {
                  setIsChangingPassword(true);
                  setIsEditing(false);
                  setError('');
                  setSuccess('');
                }}
              >
                Change Password
              </Button>
            )}
          </div>
        </Card.Header>
        <Card.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}
          
          <Form onSubmit={handleSubmit}>
            {!isChangingPassword ? (
              // Profile Information Form
              <>
                <Form.Group className="mb-3">
                  <Form.Label>Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={profile.name || ''}
                    onChange={handleChange}
                    disabled={!isEditing}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={profile.email || ''}
                    onChange={handleChange}
                    disabled={!isEditing}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Phone</Form.Label>
                  <Form.Control
                    type="tel"
                    name="phone"
                    value={profile.phone || ''}
                    onChange={handleChange}
                    disabled={!isEditing}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Address</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="address"
                    value={profile.address || ''}
                    onChange={handleChange}
                    disabled={!isEditing}
                    required
                  />
                </Form.Group>
              </>
            ) : (
              // Password Change Form
              <>
                <Form.Group className="mb-3">
                  <Form.Label>Current Password</Form.Label>
                  <InputGroup>
                    <Form.Control
                      type={passwordVisibility.currentPassword ? "text" : "password"}
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      required
                      placeholder="Enter current password"
                    />
                    <Button
                      variant="outline-secondary"
                      onClick={() => togglePasswordVisibility('currentPassword')}
                    >
                      {passwordVisibility.currentPassword ? <FaEyeSlash /> : <FaEye />}
                    </Button>
                  </InputGroup>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>New Password</Form.Label>
                  <InputGroup>
                    <Form.Control
                      type={passwordVisibility.newPassword ? "text" : "password"}
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      required
                      minLength={6}
                      placeholder="Enter new password"
                    />
                    <Button
                      variant="outline-secondary"
                      onClick={() => togglePasswordVisibility('newPassword')}
                    >
                      {passwordVisibility.newPassword ? <FaEyeSlash /> : <FaEye />}
                    </Button>
                  </InputGroup>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Confirm New Password</Form.Label>
                  <InputGroup>
                    <Form.Control
                      type={passwordVisibility.confirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      required
                      minLength={6}
                      placeholder="Confirm new password"
                    />
                    <Button
                      variant="outline-secondary"
                      onClick={() => togglePasswordVisibility('confirmPassword')}
                    >
                      {passwordVisibility.confirmPassword ? <FaEyeSlash /> : <FaEye />}
                    </Button>
                  </InputGroup>
                </Form.Group>
              </>
            )}

            {(isEditing || isChangingPassword) && (
              <Button variant="primary" type="submit">
                {isChangingPassword ? 'Update Password' : 'Save Changes'}
              </Button>
            )}
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default UserProfile; 