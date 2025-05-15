import React, { useState, useEffect } from 'react';
import { Container, Card, Table, Badge, Button, Modal, Spinner, Alert, Form } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { formatOrderId, formatDate } from '../utils/formatters';
import { API_BASE_URL } from '../config';
import '../styles/actionButtons.css';

const UserOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  // Add formatPrice helper function
  const formatPrice = (amount, currency) => {
    return currency === 'INR' ? `₹${amount.toFixed(2)}` : `$${amount.toFixed(2)}`;
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/api/orders/my-orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Handle the new response structure where orders are nested
      setOrders(response.data.orders || []);
      setError('');
    } catch (err) {
      console.error('Error fetching orders:', err);
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        setError(err.response?.data?.message || 'Failed to load orders');
      }
    } finally {
      setLoading(false);
    }
  };

  // Check if order is within 24 hours cancellation window
  const isWithin24Hours = (orderDate) => {
    if (!orderDate) return false;
    const orderTime = new Date(orderDate).getTime();
    const currentTime = new Date().getTime();
    const hoursDifference = (currentTime - orderTime) / (1000 * 60 * 60);
    return hoursDifference <= 24;
  };

  // Check if order can be cancelled
  const canCancelOrder = (order) => {
    if (!order) return false;
    return (
      (order.orderStatus === 'PENDING' || order.orderStatus === 'CONFIRMED') &&
      isWithin24Hours(order.createdAt || order.orderDate)
    );
  };

  const handleCancelRequest = async () => {
    if (!selectedOrder || !cancelReason.trim()) {
      setError('Please provide a reason for cancellation');
      return;
    }
    
    setCancelLoading(true);
    setError('');
    setSuccessMessage('');
    
    try {
      const token = localStorage.getItem('token');
      // Using the cancel-request endpoint instead
      const response = await axios.post(
        `${API_BASE_URL}/api/orders/${selectedOrder._id}/cancel-request`,
        { reason: cancelReason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update order in state with the new status
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order._id === selectedOrder._id ? { ...order, orderStatus: 'CANCELLATION_REQUESTED' } : order
        )
      );
      
      // Update selected order if modal is open
      setSelectedOrder({ ...selectedOrder, orderStatus: 'CANCELLATION_REQUESTED' });
      setShowCancelConfirm(false);
      
      // Show success message
      setSuccessMessage('Cancellation request submitted successfully. Admin will review your request shortly.');
      
      // Reset cancellation reason
      setCancelReason('');
    } catch (err) {
      console.error('Error requesting cancellation:', err);
      setError(err.response?.data?.message || 'Failed to submit cancellation request');
    } finally {
      setCancelLoading(false);
    }
  };

  const getStatusBadgeVariant = (status) => {
    switch (status?.toUpperCase()) {
      case 'PENDING':
        return 'warning';
      case 'CONFIRMED':
        return 'info';
      case 'SHIPPED':
        return 'primary';
      case 'DELIVERED':
        return 'success';
      case 'CANCELLED':
        return 'danger';
      case 'CANCELLATION_REQUESTED':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const getOrderStatusLabel = (status) => {
    switch (status?.toUpperCase()) {
      case 'CANCELLATION_REQUESTED':
        return 'CANCELLATION REQUESTED';
      default:
        return status || 'PENDING';
    }
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  const showCancellationRequestForm = () => {
    setShowModal(false);
    setCancelReason('');
    setShowCancelConfirm(true);
  };

  if (loading) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading orders...</span>
          </Spinner>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      {successMessage && (
        <Alert variant="success" className="mb-4" dismissible onClose={() => setSuccessMessage('')}>
          {successMessage}
        </Alert>
      )}
      
      <Card>
        <Card.Header className="bg-dark text-white">
          <h4 className="mb-0">My Orders</h4>
        </Card.Header>
        <Card.Body>
          {error && <div className="alert alert-danger">{error}</div>}
          
          {!orders || orders.length === 0 ? (
            <div className="text-center py-5">
              <h5>No orders found</h5>
              <p className="text-muted">You haven't placed any orders yet.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover>
                <thead>
                  <tr>
                    <th>Order Number</th>
                    <th>Date</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order._id}>
                      <td>
                        {order.orderNumber || formatOrderId(order._id)}
                        <small className="text-muted d-block">
                          ID: {formatOrderId(order._id)}
                        </small>
                      </td>
                      <td>
                        {formatDate(order.createdAt || order.orderDate)}
                        {isWithin24Hours(order.createdAt || order.orderDate) && 
                          (order.orderStatus !== 'CANCELLED' && order.orderStatus !== 'CANCELLATION_REQUESTED') && (
                          <small className="text-success d-block">
                            <Badge bg="success" pill>Eligible for cancellation</Badge>
                          </small>
                        )}
                        {order.orderStatus === 'CANCELLATION_REQUESTED' && (
                          <small className="text-secondary d-block">
                            <Badge bg="secondary" pill>Awaiting admin approval</Badge>
                          </small>
                        )}
                      </td>
                      <td>
                        <div>{formatPrice(order.totalAmount, order.currency)}</div>
                        <small className="text-muted">
                          {order.currency === 'INR' ? 'Indian Rupees' : 'US Dollars'}
                        </small>
                      </td>
                      <td>
                        <Badge bg={getStatusBadgeVariant(order.orderStatus)}>
                          {getOrderStatusLabel(order.orderStatus)}
                        </Badge>
                      </td>
                      <td>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="btn-view-order me-2"
                          onClick={() => handleViewDetails(order)}
                        >
                          View Details
                        </Button>
                        {canCancelOrder(order) && (
                          <Button
                            variant="outline-danger"
                            size="sm"
                            className="btn-cancel-order"
                            onClick={() => {
                              setSelectedOrder(order);
                              showCancellationRequestForm();
                            }}
                          >
                            Cancel
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Order Details Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            Order Details
            {selectedOrder?.orderNumber ? (
              <span className="ms-2 text-primary">{selectedOrder.orderNumber}</span>
            ) : (
              <span className="ms-2">{formatOrderId(selectedOrder?._id)}</span>
            )}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedOrder && (
            <>
              <div className="mb-4">
                <h6>Order Information</h6>
                <p className="mb-1">
                  <strong>Order Number:</strong> {selectedOrder.orderNumber || 'N/A'}
                </p>
                <p className="mb-1">
                  <strong>Order ID:</strong> {formatOrderId(selectedOrder._id)}
                </p>
                <p className="mb-1">Date: {formatDate(selectedOrder.createdAt || selectedOrder.orderDate)}</p>
                <p className="mb-1">
                  Status: <Badge bg={getStatusBadgeVariant(selectedOrder.orderStatus)}>
                    {getOrderStatusLabel(selectedOrder.orderStatus)}
                  </Badge>
                </p>
                {selectedOrder.orderStatus === 'CANCELLATION_REQUESTED' && (
                  <Alert variant="secondary" className="my-2">
                    <small>Your cancellation request is being reviewed by our team. We'll notify you when a decision is made.</small>
                  </Alert>
                )}
                <p className="mb-1">
                  Total Amount: {formatPrice(selectedOrder.totalAmount, selectedOrder.currency)}
                  <small className="text-muted ms-2">
                    ({selectedOrder.currency === 'INR' ? 'Indian Rupees' : 'US Dollars'})
                  </small>
                </p>
                <p className="mb-1">Payment Method: {selectedOrder.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}</p>
                <p className="mb-1">
                  Payment Status: <Badge bg={selectedOrder.paymentStatus === 'PAID' ? 'success' : 'warning'}>
                    {selectedOrder.paymentStatus || 'PENDING'}
                  </Badge>
                </p>
                {isWithin24Hours(selectedOrder.createdAt || selectedOrder.orderDate) && 
                  (selectedOrder.orderStatus !== 'CANCELLED' && selectedOrder.orderStatus !== 'CANCELLATION_REQUESTED') && (
                  <Alert variant="info" className="mt-2">
                    <small>Orders can be cancelled within 24 hours of placement. Admin approval is required.</small>
                  </Alert>
                )}
                
                {selectedOrder.cancellationRequest && (
                  <div className="mt-3 p-3 border rounded">
                    <h6>Cancellation Request Details</h6>
                    <p className="mb-1"><strong>Status:</strong> {selectedOrder.cancellationRequest.status}</p>
                    <p className="mb-1"><strong>Reason:</strong> {selectedOrder.cancellationRequest.reason}</p>
                    <p className="mb-1"><strong>Requested on:</strong> {formatDate(selectedOrder.cancellationRequest.requestedAt)}</p>
                    {selectedOrder.cancellationRequest.adminNote && (
                      <p className="mb-1"><strong>Admin Response:</strong> {selectedOrder.cancellationRequest.adminNote}</p>
                    )}
                  </div>
                )}
              </div>

              <div className="mb-4">
                <h6>Shipping Address</h6>
                <p className="mb-1">{selectedOrder.shippingAddress?.name || 'N/A'}</p>
                <p className="mb-1">{selectedOrder.shippingAddress?.address || 'N/A'}</p>
                <p className="mb-1">
                  {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} {selectedOrder.shippingAddress?.pincode}
                </p>
                <p className="mb-1">{selectedOrder.shippingAddress?.country}</p>
                <p className="mb-1">Phone: {selectedOrder.shippingAddress?.mobileNo || 'N/A'}</p>
                <p className="mb-1">Email: {selectedOrder.shippingAddress?.email || 'N/A'}</p>
              </div>

              <div className="mb-4">
                <h6>Order Summary</h6>
                <Table hover>
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Quantity</th>
                      <th>Price</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.products.map((item) => (
                      <tr key={item._id || item.product._id}>
                        <td>
                          {item.product?.name || 'N/A'}
                          {item.size && <small className="text-muted d-block">Size: {item.size}</small>}
                          {item.color && <small className="text-muted d-block">Color: {item.color}</small>}
                        </td>
                        <td>{item.quantity || 1}</td>
                        <td>{formatPrice(item.price, selectedOrder.currency)}</td>
                        <td>{formatPrice((item.quantity || 1) * (item.price || 0), selectedOrder.currency)}</td>
                      </tr>
                    ))}
                    <tr>
                      <td colSpan="3" className="text-end"><strong>Subtotal:</strong></td>
                      <td>{formatPrice(selectedOrder.subtotal, selectedOrder.currency)}</td>
                    </tr>
                    <tr>
                      <td colSpan="3" className="text-end"><strong>Shipping:</strong></td>
                      <td>
                        {formatPrice(selectedOrder.shippingCost, selectedOrder.currency)}
                        <small className="text-muted d-block">
                          {selectedOrder.currency === 'INR' ? 'Flat rate: ₹50' : 'Flat rate: $17'}
                        </small>
                      </td>
                    </tr>
                    {selectedOrder.currency === 'INR' && (
                      <tr>
                        <td colSpan="3" className="text-end"><strong>Tax (18% GST):</strong></td>
                        <td>{formatPrice(selectedOrder.tax, selectedOrder.currency)}</td>
                      </tr>
                    )}
                    <tr className="table-active">
                      <td colSpan="3" className="text-end"><strong>Total Amount:</strong></td>
                      <td>
                        <strong>{formatPrice(selectedOrder.totalAmount, selectedOrder.currency)}</strong>
                        <small className="text-muted d-block">
                          {selectedOrder.currency === 'INR' ? 'Indian Rupees' : 'US Dollars'}
                        </small>
                      </td>
                    </tr>
                  </tbody>
                </Table>
                {selectedOrder.currency === 'USD' && (
                  <small className="text-muted mt-2 d-block">
                    International orders are exempt from tax. Flat rate shipping of $17 applies.
                  </small>
                )}
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          {selectedOrder && canCancelOrder(selectedOrder) && (
            <Button 
              variant="danger" 
              onClick={showCancellationRequestForm}
              disabled={cancelLoading}
            >
              Request Cancellation
            </Button>
          )}
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
          {selectedOrder?.trackingNumber && (
            <Button 
              variant="primary" 
              onClick={() => navigate(`/track-order?orderNumber=${selectedOrder.orderNumber}&email=${selectedOrder.shippingAddress?.email}`)}
            >
              Track Order
            </Button>
          )}
        </Modal.Footer>
      </Modal>

      {/* Cancel Order Request Modal */}
      <Modal show={showCancelConfirm} onHide={() => setShowCancelConfirm(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Request Order Cancellation</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          
          <p><strong>Order Number:</strong> {selectedOrder?.orderNumber}</p>
          
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Please provide a reason for cancellation</Form.Label>
              <Form.Control 
                as="textarea" 
                rows={3} 
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="e.g., Ordered by mistake, found a better price elsewhere, etc."
                required
              />
              <Form.Text className="text-muted">
                Your cancellation request will be reviewed by our team. You'll be notified once a decision is made.
              </Form.Text>
            </Form.Group>
          </Form>
          
          <p className="text-info mt-3">
            <small>
              <strong>Note:</strong> Orders can only be cancelled within 24 hours of placement and before they are shipped.
              Cancellation is subject to admin approval.
            </small>
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCancelConfirm(false)}>
            Back
          </Button>
          <Button 
            variant="danger" 
            onClick={handleCancelRequest}
            disabled={cancelLoading || !cancelReason.trim()}
          >
            {cancelLoading ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-2"
                />
                Submitting...
              </>
            ) : (
              'Submit Cancellation Request'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default UserOrders; 