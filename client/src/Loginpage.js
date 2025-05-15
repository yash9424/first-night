import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Container, Form, Button, Alert, Modal } from 'react-bootstrap';
import './styles/login.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Forgot password state
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMsg, setForgotMsg] = useState('');
  const [forgotError, setForgotError] = useState('');

  const [lastRequestTime, setLastRequestTime] = useState(0);

  const handleSubmit = async (e) => {
    e.preventDefault(); 
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password
      });

      const { token, name, email: userEmail, role, country } = response.data;
      
      // Store auth data
      localStorage.setItem('token', token);
      localStorage.setItem('userRole', role);
      localStorage.setItem('userName', name);
      localStorage.setItem('userEmail', userEmail);
      if (country) {
        localStorage.setItem('userCountry', country);
      }

      // Clear form
      setEmail('');
      setPassword('');

      // Redirect based on role
      if (role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
      // Clear stored data on error
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userName');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userCountry');
    } finally {
      setLoading(false);
    }
  };

  // Forgot password handler
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    
    // Check if enough time has passed since last request (e.g., 1 minute)
    const now = Date.now();
    if (now - lastRequestTime < 60000) {
        setForgotError('Please wait a minute before requesting another reset link');
        return;
    }
    
    setLastRequestTime(now);
    setForgotLoading(true);
    setForgotError('');
    setForgotMsg('');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(forgotEmail)) {
        setForgotError('Please enter a valid email address');
        setForgotLoading(false);
        return;
    }

    const maxRetries = 3;
    let retryCount = 0;

    const makeRequest = async () => {
        try {
            const apiUrl = 'http://localhost:5000';
            return await axios.post(`${apiUrl}/api/auth/forgot-password`, 
                { email: forgotEmail },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    }
                }
            );
        } catch (err) {
            console.error('Forgot password request error:', err);
            if (retryCount < maxRetries && err.response?.status >= 500) {
                retryCount++;
                await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
                return makeRequest();
            }
            throw err;
        }
    };

    try {
        const response = await makeRequest();
        setForgotMsg('Password reset link has been sent to your email.');
        setTimeout(() => setShowForgot(false), 3000);
    } catch (err) {
        console.error('Forgot password error:', err);
        setForgotError(err.response?.data?.message || 'Failed to send reset link. Please try again later.');
    } finally {
        setForgotLoading(false);
    }
  };

  return (
    <div className="login-page">
      <Container>
        <div className="login-container">
          <div className="login-box">
            <div className="login-header">
              <h2>Welcome Back</h2>
              <p>Sign in to continue to First Night</p>
            </div>

            {error && (
              <Alert variant="danger" className="alert-custom">
                {error}
              </Alert>
            )}

            <Form onSubmit={handleSubmit} className="login-form">
              <Form.Group className="form-group-custom">
                <Form.Label>Email Address</Form.Label>
                <Form.Control
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="form-control-custom"
                />
              </Form.Group>

              <Form.Group className="form-group-custom">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="form-control-custom"
                />
              </Form.Group>

              <div className="forgot-password-link">
                <Button 
                  variant="link" 
                  className="p-0" 
                  onClick={() => setShowForgot(true)}
                >
                  Forgot Password?
                </Button>
              </div>

              <Button 
                type="submit" 
                className="login-button"
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>

              <div className="register-link">
                <p>
                  Don't have an account?{' '}
                  <Link to="/register" className="register-link-text">
                    Create Account
                  </Link>
                </p>
              </div>
            </Form>
          </div>
        </div>
      </Container>

      {/* Forgot Password Modal */}
      <Modal 
        show={showForgot} 
        onHide={() => setShowForgot(false)} 
        centered
        className="forgot-password-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>Reset Password</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {forgotMsg && <Alert variant="success">{forgotMsg}</Alert>}
          {forgotError && <Alert variant="danger">{forgotError}</Alert>}
          <Form onSubmit={handleForgotPassword}>
            <Form.Group className="form-group-custom">
              <Form.Label>Email Address</Form.Label>
              <Form.Control
                type="email"
                value={forgotEmail}
                onChange={e => setForgotEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="form-control-custom"
                disabled={forgotLoading}
              />
            </Form.Group>
            <Button 
              type="submit" 
              className="login-button w-100"
              disabled={forgotLoading}
            >
              {forgotLoading ? 'Sending...' : 'Send Reset Link'}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default LoginPage;
