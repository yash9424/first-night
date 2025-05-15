import React, { useState } from 'react';
import { Container, Card, Form, Button, Alert, Row, Col, Badge, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { formatDate } from '../utils/formatters';
import { isValidOrderNumber, getOrderNumberFormat } from '../utils/validation';

const TrackOrder = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [order, setOrder] = useState(null);
  const [trackingInput, setTrackingInput] = useState({
    orderNumber: '',
    email: ''
  });
  const [touched, setTouched] = useState({
    orderNumber: false,
    email: false
  });

  const token = localStorage.getItem('token');
  if (!token) {
    // You need to log in first
    window.location.href = '/login';
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // Remove any spaces from order number
    const sanitizedValue = name === 'orderNumber' ? value.trim().toUpperCase() : value;
    setTrackingInput(prev => ({
      ...prev,
      [name]: sanitizedValue
    }));
  };

  const handleBlur = (field) => {
    setTouched(prev => ({
      ...prev,
      [field]: true
    }));
  };

  const validateForm = () => {
    const errors = {};
    
    if (!trackingInput.orderNumber) {
      errors.orderNumber = 'Order number is required';
    } else if (!isValidOrderNumber(trackingInput.orderNumber)) {
      errors.orderNumber = 'Invalid order number format';
    }

    if (!trackingInput.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(trackingInput.email)) {
      errors.email = 'Invalid email format';
    }

    return errors;
  };

  const handleTrackOrder = async (e) => {
    e.preventDefault();
    
    // Validate form
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setError('Please correct the errors before submitting.');
      setTouched({
        orderNumber: true,
        email: true
      });
      return;
    }

    setLoading(true);
    setError('');
    setOrder(null);

    try {
      console.log('Tracking order with:', {
        orderNumber: trackingInput.orderNumber,
        email: trackingInput.email
      });

      const response = await axios.post(`${API_BASE_URL}/api/orders/track`, {
        orderNumber: trackingInput.orderNumber,
        email: trackingInput.email
      });

      console.log('Track order response:', response.data);

      if (response.data.order) {
        setOrder(response.data.order);
      } else {
        setError('No order information received from server');
      }
    } catch (err) {
      console.error('Track order error:', err);
      if (err.response?.status === 404) {
        setError('No order found with the provided details. Please check your order number and email.');
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Unable to track order. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeVariant = (status) => {
    switch (status?.toUpperCase()) {
      case 'PENDING': return 'warning';
      case 'CONFIRMED': return 'info';
      case 'SHIPPED': return 'primary';
      case 'DELIVERED': return 'success';
      case 'CANCELLED': return 'danger';
      default: return 'secondary';
    }
  };

  const formatPrice = (amount, currency) => {
    return currency === 'INR' ? `₹${amount.toFixed(2)}` : `$${amount.toFixed(2)}`;
  };

  const errors = validateForm();

  return (
    <Container className="py-5 bg-light min-vh-100 d-flex align-items-center justify-content-center" style={{fontFamily: 'inherit'}}>
      <Row className="justify-content-center w-100">
        <Col md={7} lg={6} sm={10} xs={12}>
          <Card className="track-order-card shadow rounded-4 border-0">
            <Card.Header className="bg-dark text-white rounded-top-4 border-0">
              <h4 className="mb-0">Track Your Order</h4>
            </Card.Header>
            <Card.Body className="p-4">
              <Form onSubmit={handleTrackOrder}>
                <Form.Group className="mb-3">
                  <Form.Label>Order Number*</Form.Label>
                  <Form.Control
                    type="text"
                    name="orderNumber"
                    value={trackingInput.orderNumber}
                    onChange={handleInputChange}
                    onBlur={() => handleBlur('orderNumber')}
                    placeholder="Enter your order number"
                    isInvalid={touched.orderNumber && errors.orderNumber}
                    required
                  />
                  <Form.Text className="text-muted">
                    Format: {getOrderNumberFormat()}
                  </Form.Text>
                  {touched.orderNumber && errors.orderNumber && (
                    <Form.Control.Feedback type="invalid">
                      {errors.orderNumber}
                    </Form.Control.Feedback>
                  )}
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Email Address*</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={trackingInput.email}
                    onChange={handleInputChange}
                    onBlur={() => handleBlur('email')}
                    placeholder="Enter the email used for order"
                    isInvalid={touched.email && errors.email}
                    required
                  />
                  {touched.email && errors.email && (
                    <Form.Control.Feedback type="invalid">
                      {errors.email}
                    </Form.Control.Feedback>
                  )}
                </Form.Group>

                {error && (
                  <Alert variant="danger" className="mb-3">
                    {error}
                  </Alert>
                )}

                <div className="d-grid">
                  <Button 
                    type="submit" 
                    variant="primary"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          role="status"
                          aria-hidden="true"
                          className="me-2"
                        />
                        Tracking Order...
                      </>
                    ) : (
                      'Track Order'
                    )}
                  </Button>
                </div>
              </Form>

              {order && (
                <div className="mt-4">
                  <h5 className="border-bottom pb-2">Order Status</h5>
                  <Row className="mb-4">
                    <Col md={6}>
                      <p><strong>Order Number:</strong> {order.orderNumber}</p>
                      <p><strong>Order Date:</strong> {formatDate(order.createdAt)}</p>
                      <p>
                        <strong>Status:</strong>{' '}
                        <Badge bg={getStatusBadgeVariant(order.orderStatus)}>
                          {order.orderStatus}
                        </Badge>
                      </p>
                    </Col>
                    <Col md={6}>
                      <p><strong>Total Amount:</strong> {formatPrice(order.totalAmount, order.currency)}</p>
                      <p>
                        <strong>Payment Status:</strong>{' '}
                        <Badge bg={order.paymentStatus === 'PAID' ? 'success' : 'warning'}>
                          {order.paymentStatus}
                        </Badge>
                      </p>
                    </Col>
                  </Row>

                  {order.orderStatus === 'SHIPPED' && order.trackingNumber && (
                    <div className="mb-4">
                      <h6>Shipping Information</h6>
                      <p><strong>Tracking Number:</strong> {order.trackingNumber}</p>
                      <p><strong>Courier:</strong> {order.courierProvider}</p>
                      {order.trackingUrl && (
                        <Button
                          variant="outline-primary"
                          href={order.trackingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Track Package
                        </Button>
                      )}
                    </div>
                  )}

                  <div className="border-top pt-3 mt-3">
                    <small className="text-muted">
                      For more details, please{' '}
                      <Link to="/login">login to your account</Link>.
                    </small>
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>

          <div className="text-center mt-4">
            <p className="mb-2">Already have an account?</p>
            <Link to="/login" className="btn btn-outline-primary">
              Login to View All Orders
            </Link>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default TrackOrder; 