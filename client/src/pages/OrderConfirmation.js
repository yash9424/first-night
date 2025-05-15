import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Container, Card, Row, Col, Alert, Spinner, Button, Table } from 'react-bootstrap';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { formatPrice, formatDate } from '../utils/formatters';
import '../styles/OrderTimeline.css';
import '../styles/UserOrders.css';

const OrderConfirmation = () => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const { orderNumber } = useParams();
  const navigate = useNavigate();

  const fetchOrder = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login', { state: { from: `/order-confirmation/${orderNumber}` } });
        return;
      }

      const config = {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000
      };

      const response = await axios.get(
        `${API_BASE_URL}/api/orders/by-number/${orderNumber}`,
        config
      );

      setOrder(response.data);
      setError('');
    } catch (error) {
      console.error('Error fetching order:', error);
      
      if (error.response?.status === 401) {
        navigate('/login', { state: { from: `/order-confirmation/${orderNumber}` } });
        return;
      } else if (error.response?.status === 404) {
        setError('Order not found. Please check the order number.');
      } else {
        setError(error.response?.data?.message || 'Failed to load order details');
      }
      
      // Retry up to 3 times with exponential backoff
      if (retryCount < 3) {
        const timeout = Math.pow(2, retryCount) * 1000;
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          fetchOrder();
        }, timeout);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orderNumber) {
      fetchOrder();
    }
  }, [orderNumber]);

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'PENDING': return 'warning';
      case 'CONFIRMED': return 'info';
      case 'SHIPPED': return 'primary';
      case 'DELIVERED': return 'success';
      case 'CANCELLED': return 'danger';
      default: return 'secondary';
    }
  };

  const getStatusTimeline = () => {
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

  const renderTimeline = () => {
    const timeline = getStatusTimeline();
    
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

  const formatPrice = (amount, currency) => {
    return currency === 'INR' ? `₹${amount.toFixed(2)}` : `$${amount.toFixed(2)}`;
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading order details...</span>
        </Spinner>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          {error}
          <Button
            variant="outline-danger"
            size="sm"
            className="ms-3"
            onClick={() => {
              setLoading(true);
              setRetryCount(0);
              fetchOrder();
            }}
          >
            Retry
          </Button>
        </Alert>
        <div className="mt-3">
          <Link to="/orders" className="btn btn-primary">View All Orders</Link>
        </div>
      </Container>
    );
  }

  if (!order) {
    return (
      <Container className="py-5">
        <Alert variant="warning">Order not found</Alert>
        <Link to="/orders" className="btn btn-primary mt-3">View All Orders</Link>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <Card className="text-center mb-4">
        <Card.Body>
          <div className="mb-4">
            <i className="fas fa-check-circle text-success" style={{ fontSize: '48px' }}></i>
          </div>
          <h2 className="mb-4">Thank You for Your Order!</h2>
          <p className="lead mb-0">Your order has been successfully placed.</p>
          
          <div className="order-number-box mt-3 p-3 border border-success rounded bg-light">
            <h5 className="text-muted mb-2">Order Number</h5>
            <h3 className="text-success">{order.orderNumber}</h3>
            <small className="text-muted d-block mt-2">
              Please save this number for tracking your order
            </small>
          </div>

          {order.paymentMethod === 'cod' && (
            <Alert variant="info" className="mt-3">
              Please keep cash ready at the time of delivery.
              Amount to be paid: {formatPrice(order.totalAmount, order.currency)}
            </Alert>
          )}

          <div className="mt-4">
            <Button
              variant="primary"
              onClick={() => navigate(`/track-order?orderNumber=${order.orderNumber}&email=${order.shippingAddress.email}`)}
            >
              Track Your Order
            </Button>
          </div>
        </Card.Body>
      </Card>

      {/* Order Status Timeline */}
      <Card className="mb-4">
        <Card.Header>
          <h4>Order Status</h4>
        </Card.Header>
        <Card.Body>
          {renderTimeline()}
        </Card.Body>
      </Card>

      <Row>
        <Col md={8}>
          <Card className="mb-4">
            <Card.Header>
              <h4>Order Details</h4>
            </Card.Header>
            <Card.Body>
              <Row className="mb-3">
                <Col sm={4}>
                  <strong>Order Number:</strong>
                </Col>
                <Col sm={8}>
                  {order.orderNumber}
                </Col>
              </Row>
              
              <Row className="mb-3">
                <Col sm={4}>
                  <strong>Order Status:</strong>
                </Col>
                <Col sm={8}>
                  <span className={`badge bg-${getStatusColor(order.orderStatus)}`}>
                    {order.orderStatus}
                  </span>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col sm={4}>
                  <strong>Payment Method:</strong>
                </Col>
                <Col sm={8}>
                  {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
                </Col>
              </Row>

              <Row className="mb-3">
                <Col sm={4}>
                  <strong>Payment Status:</strong>
                </Col>
                <Col sm={8}>
                  <span className={`badge bg-${order.paymentStatus === 'PAID' ? 'success' : 'warning'}`}>
                    {order.paymentStatus}
                  </span>
                </Col>
              </Row>

              {order.estimatedDeliveryDate && (
                <Row className="mb-3">
                  <Col sm={4}>
                    <strong>Estimated Delivery:</strong>
                  </Col>
                  <Col sm={8}>
                    {formatDate(order.estimatedDeliveryDate)}
                  </Col>
                </Row>
              )}
            </Card.Body>
          </Card>

          {/* Products */}
          <Card className="mb-4">
            <Card.Header>
              <h4>Products</h4>
            </Card.Header>
            <Card.Body>
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Quantity</th>
                      <th>Price</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.products.map((item, index) => (
                      <tr key={item.product?._id || index}>
                        <td>
                          {item.product?.name || 'N/A'}
                          {item.size && <small className="text-muted d-block">Size: {item.size}</small>}
                          {item.color && <small className="text-muted d-block">Color: {item.color}</small>}
                        </td>
                        <td>{item.quantity}</td>
                        <td>{formatPrice(item.price, order.currency)}</td>
                        <td>{formatPrice(item.quantity * item.price, order.currency)}</td>
                      </tr>
                    ))}
                    <tr>
                      <td colSpan="3" className="text-end"><strong>Total Amount:</strong></td>
                      <td><strong>{formatPrice(order.totalAmount, order.currency)}</strong></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Card.Body>
          </Card>

          <Card className="mb-4">
            <Card.Header>
              <h4>Order Summary</h4>
            </Card.Header>
            <Card.Body>
              {order.products.map((item, index) => (
                <div key={index} className={`${index > 0 ? 'mt-3 pt-3 border-top' : ''}`}>
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <h6 className="mb-1">{item.name}</h6>
                      <small className="text-muted">
                        Quantity: {item.quantity}
                        {item.size && ` | Size: ${item.size}`}
                        {item.color && ` | Color: ${item.color}`}
                      </small>
                    </div>
                    <div className="text-end">
                      <strong>{formatPrice(item.price * item.quantity, order.currency)}</strong>
                    </div>
                  </div>
                </div>
              ))}

              <hr />

              <div className="d-flex justify-content-between mb-2">
                <span>Subtotal:</span>
                <strong>{formatPrice(order.subtotal, order.currency)}</strong>
              </div>

              <div className="d-flex justify-content-between mb-2">
                <span>Shipping:</span>
                <strong>{formatPrice(order.shippingCost, order.currency)}</strong>
                {order.currency === 'INR' ? (
                  <small className="text-muted ms-2">(Flat rate: ₹50)</small>
                ) : (
                  <small className="text-muted ms-2">(Flat rate: $17)</small>
                )}
              </div>

              {order.currency === 'INR' && (
                <div className="d-flex justify-content-between mb-2">
                  <span>Tax (18% GST):</span>
                  <strong>{formatPrice(order.tax, order.currency)}</strong>
                </div>
              )}

              <hr />

              <div className="d-flex justify-content-between">
                <h5>Total:</h5>
                <h5>{formatPrice(order.totalAmount, order.currency)}</h5>
              </div>

              {order.currency === 'USD' && (
                <small className="text-muted mt-2 d-block">
                  International orders are exempt from tax. Flat rate shipping of $17 applies.
                </small>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Shipping Information */}
        <Col md={4}>
          <Card className="mb-4">
            <Card.Header>
              <h4>Shipping Information</h4>
            </Card.Header>
            <Card.Body>
              <p className="mb-1"><strong>{order.shippingAddress.name}</strong></p>
              <p className="mb-1">{order.shippingAddress.address}</p>
              {order.shippingAddress.apartment && (
                <p className="mb-1">{order.shippingAddress.apartment}</p>
              )}
              <p className="mb-1">
                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode}
              </p>
              <p className="mb-1">{order.shippingAddress.country}</p>
              <p className="mb-1">Phone: {order.shippingAddress.mobileNo}</p>
              {order.shippingAddress.alternatePhone && (
                <p className="mb-1">Alt. Phone: {order.shippingAddress.alternatePhone}</p>
              )}
              <p className="mb-0">Email: {order.shippingAddress.email}</p>
            </Card.Body>
          </Card>

          {/* Special Instructions */}
          {order.specialInstructions && (
            <Card className="mb-4">
              <Card.Header>
                <h4>Special Instructions</h4>
              </Card.Header>
              <Card.Body>
                <p className="mb-0">{order.specialInstructions}</p>
              </Card.Body>
            </Card>
          )}

          {/* Gift Options */}
          {(order.giftWrap || order.giftMessage) && (
            <Card className="mb-4">
              <Card.Header>
                <h4>Gift Options</h4>
              </Card.Header>
              <Card.Body>
                {order.giftWrap && (
                  <p className="mb-2">🎁 Gift wrapped</p>
                )}
                {order.giftMessage && (
                  <>
                    <p className="mb-1"><strong>Gift Message:</strong></p>
                    <p className="mb-0">{order.giftMessage}</p>
                  </>
                )}
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>

      <div className="text-center mt-4">
        <Link to="/orders" className="btn btn-primary me-3">
          View All Orders
        </Link>
        <Link to="/" className="btn btn-outline-primary">
          Continue Shopping
        </Link>
      </div>
    </Container>
  );
};

export default OrderConfirmation; 