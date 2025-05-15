import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Card, Badge, Table, Spinner, Alert } from 'react-bootstrap';
import axios from 'axios';
import { formatPrice, formatDate } from '../utils/formatters';
import { API_BASE_URL } from '../config';
import { useLocation, useNavigate } from 'react-router-dom';

const TrackOrder = () => {
  const [orderNumber, setOrderNumber] = useState('');
  const [email, setEmail] = useState('');
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const location = useLocation();
  const navigate = useNavigate();

  // Extract order number and email from URL query parameters
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const orderNumberParam = params.get('orderNumber');
    const emailParam = params.get('email');
    
    if (orderNumberParam) {
      setOrderNumber(orderNumberParam);
    }
    
    if (emailParam) {
      setEmail(emailParam);
    }
    
    // If both parameters are present, automatically track order
    if (orderNumberParam && emailParam) {
      handleSubmit(null, true);
    }
  }, [location.search]);

  // Helper function to validate order number format
  const isValidOrderNumber = (orderNum) => {
    const orderNumberRegex = /^BO-\d{6}-\d{4}-\d{3}-[A-F0-9]{8}$/;
    return orderNumberRegex.test(orderNum);
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

  const getStatusTimeline = (order) => {
    const timeline = [
      { status: 'PENDING', label: 'Order Placed', icon: '📝' },
      { status: 'CONFIRMED', label: 'Order Confirmed', icon: '✅' },
      { status: 'SHIPPED', label: 'Order Shipped', icon: '🚚' },
      { status: 'DELIVERED', label: 'Order Delivered', icon: '📦' }
    ];

    const currentIndex = timeline.findIndex(item => item.status === order.orderStatus);
    return timeline.map((item, index) => ({
      ...item,
      completed: index <= currentIndex && order.orderStatus !== 'CANCELLED',
      current: index === currentIndex,
      timestamp: order.statusUpdates?.[item.status]?.timestamp
    }));
  };

  const validateInputs = () => {
    const errors = {};
    
    // Validate order number
    const cleanOrderNumber = orderNumber.trim().toUpperCase();
    if (!cleanOrderNumber) {
      errors.orderNumber = 'Order number is required';
    } else if (!isValidOrderNumber(cleanOrderNumber)) {
      errors.orderNumber = 'Invalid order number format. Format should be: BO-YYMMDD-HHMM-MSS-RRRR';
    }
    
    // Validate email
    if (!email) {
      errors.email = 'Email is required';
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      errors.email = 'Invalid email format';
    }
    
    return errors;
  };

  const handleSubmit = async (e, autoSubmit = false) => {
    if (e && !autoSubmit) {
      e.preventDefault();
    }
    
    setError('');
    setOrderDetails(null);
    setValidationErrors({});
    
    // Validate inputs
    const errors = validateInputs();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
    
    setLoading(true);

    try {
      // Clean order number
      const cleanOrderNumber = orderNumber.trim().toUpperCase();
      
      const response = await axios.post(`${API_BASE_URL}/api/orders/track`, {
        orderNumber: cleanOrderNumber,
        email: email
      });
      
      setOrderDetails(response.data.order);
      
      // Update URL with the current order and email (without reloading)
      if (!autoSubmit) {
        const params = new URLSearchParams();
        params.set('orderNumber', cleanOrderNumber);
        params.set('email', email);
        navigate(`/track-order?${params.toString()}`, { replace: true });
      }
    } catch (err) {
      console.error('Error tracking order:', err);
      if (err.response?.status === 404) {
        setError('Order not found. Please check the order number and email and try again.');
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError(err.message || 'Failed to track order. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const renderTimeline = (order) => {
    const timeline = getStatusTimeline(order);
    
    return (
      <div className="order-timeline my-4">
        {timeline.map((item, index) => (
          <div key={item.status} className={`timeline-item ${item.completed ? 'completed' : ''} ${item.current ? 'current' : ''}`}>
            <div className="timeline-icon">{item.icon}</div>
            <div className="timeline-content">
              <h6>{item.label}</h6>
              {item.timestamp && (
                <small>{formatDate(item.timestamp)}</small>
              )}
            </div>
            {index < timeline.length - 1 && (
              <div className={`timeline-line ${item.completed ? 'completed' : ''}`} />
            )}
          </div>
        ))}
      </div>
    );
  };

  const handleOrderNumberChange = (e) => {
    const value = e.target.value;
    
    // Auto-format the order number as user types
    let formatted = value.toUpperCase();
    
    // Remove any non-alphanumeric characters except hyphens
    formatted = formatted.replace(/[^A-Z0-9-]/g, '');
    
    // Auto-add BO- prefix if user starts typing numbers
    if (formatted.length > 0 && !formatted.startsWith('BO-') && !/^BO-?$/.test(formatted)) {
      if (/^\d+$/.test(formatted[0])) {
        formatted = 'BO-' + formatted;
      }
    }
    
    setOrderNumber(formatted);
  };

  return (
    <Container className="py-4">
      <Card>
        <Card.Header className=" bg-dark text-white">
          <h4 className="mb-0">Track Your Order</h4>
        </Card.Header>
        <Card.Body>
          <Form onSubmit={(e) => handleSubmit(e)}>
            <Form.Group className="mb-3">
              <Form.Label>Order Number</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter your order number (e.g., BO-230915-1430-123-A1B2C3D4)"
                value={orderNumber}
                onChange={handleOrderNumberChange}
                isInvalid={!!validationErrors.orderNumber}
                required
              />
              <Form.Text className="text-muted">
                Please enter the order number from your order confirmation email. Format: BO-YYMMDD-HHMM-MSS-RRRR
              </Form.Text>
              {validationErrors.orderNumber && (
                <Form.Control.Feedback type="invalid">
                  {validationErrors.orderNumber}
                </Form.Control.Feedback>
              )}
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Email Address</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter the email used for the order"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                isInvalid={!!validationErrors.email}
                required
              />
              <Form.Text className="text-muted">
                Enter the email address you used when placing the order
              </Form.Text>
              {validationErrors.email && (
                <Form.Control.Feedback type="invalid">
                  {validationErrors.email}
                </Form.Control.Feedback>
              )}
            </Form.Group>
            
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Tracking Order...
                </>
              ) : (
                'Track Order'
              )}
            </Button>
          </Form>

          {error && (
            <Alert variant="danger" className="mt-3">
              {error}
            </Alert>
          )}

          {orderDetails && (
            <div className="mt-4">
              <Card>
                <Card.Header className="bg-primary text-white">
                  <div className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">Order Details</h5>
                    <Badge bg={getStatusBadgeVariant(orderDetails.orderStatus)} className="ms-2 fs-6">
                      {orderDetails.orderStatus}
                    </Badge>
                  </div>
                </Card.Header>
                <Card.Body>
                  <div className="mb-3">
                    <h6 className="fw-bold">Order Number</h6>
                    <p className="fs-5">{orderDetails.orderNumber}</p>
                  </div>
                
                  {renderTimeline(orderDetails)}

                  <Table responsive className="mt-4">
                    <tbody>
                      <tr>
                        <th>Order Date:</th>
                        <td>{formatDate(orderDetails.createdAt)}</td>
                      </tr>
                      <tr>
                        <th>Total Amount:</th>
                        <td>{formatPrice(orderDetails.totalAmount, orderDetails.currency)}</td>
                      </tr>
                      <tr>
                        <th>Payment Status:</th>
                        <td>
                          <Badge bg={orderDetails.paymentStatus === 'PAID' ? 'success' : 'warning'}>
                            {orderDetails.paymentStatus}
                          </Badge>
                        </td>
                      </tr>
                      {orderDetails.estimatedDeliveryDate && (
                        <tr>
                          <th>Estimated Delivery:</th>
                          <td>{formatDate(orderDetails.estimatedDeliveryDate)}</td>
                        </tr>
                      )}
                      {orderDetails.trackingNumber && (
                        <tr>
                          <th>Tracking Number:</th>
                          <td>{orderDetails.trackingNumber}</td>
                        </tr>
                      )}
                    </tbody>
                  </Table>

                  {orderDetails.orderStatus === 'SHIPPED' && orderDetails.courierProvider && (
                    <Alert variant="info">
                      Your order is being shipped via {orderDetails.courierProvider}.
                      {orderDetails.trackingUrl && (
                        <div className="mt-2">
                          <a href={orderDetails.trackingUrl} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-primary">
                            Track with Courier
                          </a>
                        </div>
                      )}
                    </Alert>
                  )}
                </Card.Body>
              </Card>
            </div>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default TrackOrder; 