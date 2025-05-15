import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Card, Row, Col, Badge, Button, Alert, Spinner, Form, Modal } from 'react-bootstrap';
import axios from 'axios';
import { format } from 'date-fns';
import { courierServices } from '../utils/courierServices';
import { API_BASE_URL } from '../config';

const PAYMENT_STATUS_OPTIONS = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'PAID', label: 'Paid' },
  { value: 'FAILED', label: 'Failed' },
  { value: 'REFUNDED', label: 'Refunded' }
];

const AdminOrderDetails = () => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);
  const [showShippingModal, setShowShippingModal] = useState(false);
  const [shippingDetails, setShippingDetails] = useState({
    trackingNumber: '',
    courierProvider: '',
    trackingUrl: '',
    selectedCourier: ''
  });
  const { orderId } = useParams();
  const navigate = useNavigate();

  // Add state for cancellation request handling
  const [showCancellationModal, setShowCancellationModal] = useState(false);
  const [cancellationAction, setCancellationAction] = useState('');
  const [adminNote, setAdminNote] = useState('');

  // Add state for payment verification modal
  const [showPaymentVerificationModal, setShowPaymentVerificationModal] = useState(false);
  const [paymentVerificationAction, setPaymentVerificationAction] = useState('');
  const [paymentVerificationNote, setPaymentVerificationNote] = useState('');

  const [paymentStatusEdit, setPaymentStatusEdit] = useState('');
  const [savingPaymentStatus, setSavingPaymentStatus] = useState(false);

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  useEffect(() => {
    if (shippingDetails.selectedCourier && shippingDetails.trackingNumber) {
      const courier = courierServices.find(c => c.value === shippingDetails.selectedCourier);
      if (courier) {
        setShippingDetails(prev => ({
          ...prev,
          courierProvider: courier.name,
          trackingUrl: courier.value === 'other' ? prev.trackingUrl : courier.getTrackingUrl(prev.trackingNumber)
        }));
      }
    }
  }, [shippingDetails.selectedCourier, shippingDetails.trackingNumber]);

  useEffect(() => {
    if (order) setPaymentStatusEdit(order.paymentStatus);
  }, [order]);

  const fetchOrderDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:5000/api/orders/${orderId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setOrder(response.data);
      setError('');
    } catch (err) {
      console.error('Error fetching order details:', err);
      setError(err.response?.data?.message || 'Failed to load order details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (newStatus) => {
    try {
      setUpdating(true);
      setError('');

      // Show confirmation for cancel action
      if (newStatus === 'CANCELLED' && !window.confirm('Are you sure you want to cancel this order?')) {
        return;
      }

      const token = localStorage.getItem('token');

      // If status is SHIPPED, show shipping details modal
      if (newStatus === 'SHIPPED') {
        setShowShippingModal(true);
        setUpdating(false);
        return;
      }

      await axios.patch(
        `http://localhost:5000/api/orders/${orderId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      
      await fetchOrderDetails();
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update order status. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  const handlePaymentVerification = async () => {
    try {
      setUpdating(true);
      setError('');

      const token = localStorage.getItem('token');
      await axios.patch(
        `http://localhost:5000/api/orders/${orderId}/status`,
        { 
          status: paymentVerificationAction === 'CONFIRMED' ? 'CONFIRMED' : 'CANCELLED',
          adminNote: paymentVerificationNote
        },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      
      await fetchOrderDetails();
      setShowPaymentVerificationModal(false);
      setPaymentVerificationNote('');
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update order status. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  const openPaymentVerificationModal = (action) => {
    setPaymentVerificationAction(action);
    setPaymentVerificationNote('');
    setShowPaymentVerificationModal(true);
  };

  const handleShippingSubmit = async () => {
    try {
      setUpdating(true);
      setError('');

      if (!shippingDetails.trackingNumber || !shippingDetails.courierProvider) {
        setError('Tracking number and courier provider are required');
        return;
      }

      const token = localStorage.getItem('token');
      await axios.patch(
        `http://localhost:5000/api/orders/${orderId}/status`,
        {
          status: 'SHIPPED',
          trackingNumber: shippingDetails.trackingNumber,
          courierProvider: shippingDetails.courierProvider,
          trackingUrl: shippingDetails.trackingUrl
        },
        { headers: { Authorization: `Bearer ${token}` }}
      );

      await fetchOrderDetails();
      setShowShippingModal(false);
      setShippingDetails({
        trackingNumber: '',
        courierProvider: '',
        trackingUrl: '',
        selectedCourier: ''
      });
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update shipping details. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  const deleteOrder = async () => {
    try {
      // Show confirmation dialog
      if (!window.confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
        return;
      }

      setUpdating(true);
      setError('');

      const token = localStorage.getItem('token');
      await axios.delete(
        `http://localhost:5000/api/orders/${orderId}`,
        { headers: { Authorization: `Bearer ${token}` }}
      );

      // Navigate back to orders list
      navigate('/admin/orders', { replace: true });
    } catch (error) {
      console.error('Failed to delete order:', error);
      setError(error.response?.data?.message || 'Failed to delete order. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  // Function to handle cancellation request processing
  const processCancellationRequest = async (action, adminNote) => {
    try {
      setUpdating(true);
      setError('');

      if (!adminNote.trim()) {
        setError('Please provide a note for the customer');
        return false;
      }

      const token = localStorage.getItem('token');
      await axios.patch(
        `${API_BASE_URL}/api/orders/${orderId}/cancel-request`,
        { 
          action,
          adminNote 
        },
        { headers: { Authorization: `Bearer ${token}` }}
      );

      await fetchOrderDetails();
      setError('');
      return true;
    } catch (err) {
      console.error('Failed to process cancellation request:', err);
      setError(err.response?.data?.message || `Failed to ${action.toLowerCase()} cancellation request`);
      return false;
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadgeVariant = (status) => {
    switch (status?.toUpperCase()) {
      case 'PENDING': return 'warning';
      case 'CONFIRMED': return 'info';
      case 'SHIPPED': return 'primary';
      case 'DELIVERED': return 'success';
      case 'CANCELLED': return 'danger';
      case 'CANCELLATION_REQUESTED': return 'secondary';
      default: return 'secondary';
    }
  };

  const isStatusUpdateAllowed = (currentStatus, newStatus) => {
    const statusOrder = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED'];
    
    // Cannot update if order is already cancelled or delivered
    if (currentStatus === 'CANCELLED' || currentStatus === 'DELIVERED') {
      return false;
    }

    // Cannot update if there's a pending cancellation request
    if (currentStatus === 'CANCELLATION_REQUESTED') {
      return false;
    }

    // Can always cancel an order unless it's delivered
    if (newStatus === 'CANCELLED') {
      return true;
    }

    const currentIndex = statusOrder.indexOf(currentStatus);
    const newIndex = statusOrder.indexOf(newStatus);
    
    // Allow moving forward in the status chain
    // This allows skipping statuses (e.g., PENDING -> SHIPPED) if needed
    return newIndex > currentIndex;
  };

  const formatDate = (date) => {
    try {
      return format(new Date(date), 'dd/MM/yyyy HH:mm');
    } catch (error) {
      return 'Invalid date';
    }
  };

  const formatPrice = (amount, currency) => {
    return currency === 'INR' ? `₹${amount.toFixed(2)}` : `$${amount.toFixed(2)}`;
  };

  const handleCancellationAction = async () => {
    const success = await processCancellationRequest(cancellationAction, adminNote);
    if (success) {
      setShowCancellationModal(false);
      setAdminNote('');
    }
  };

  const openCancellationModal = (action) => {
    setCancellationAction(action);
    setAdminNote('');
    setShowCancellationModal(true);
  };

  const getFormattedStatus = (status) => {
    switch (status?.toUpperCase()) {
      case 'CANCELLATION_REQUESTED':
        return 'CANCELLATION REQUESTED';
      default:
        return status;
    }
  };

  const handleSavePaymentStatus = async () => {
    try {
      setSavingPaymentStatus(true);
      setError('');
      const token = localStorage.getItem('token');
      await axios.patch(
        `${API_BASE_URL}/api/orders/${orderId}/payment-status`,
        { paymentStatus: paymentStatusEdit },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchOrderDetails();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update payment status.');
    } finally {
      setSavingPaymentStatus(false);
    }
  };

  if (loading) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading order details...</span>
          </Spinner>
        </div>
      </Container>
    );
  }

  if (!order) {
    return (
      <Container className="py-5">
        <Alert variant="warning">Order not found</Alert>
      </Container>
    );
  }

  const currentStatus = order.orderStatus?.toUpperCase() || 'PENDING';

  return (
    <Container fluid className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Order Details</h2>
        <div>
          <Button 
            variant="outline-danger" 
            className="me-2"
            onClick={deleteOrder}
            disabled={updating}
          >
            Delete Order
          </Button>
          <Button 
            variant="outline-primary" 
            onClick={() => navigate('/admin/orders')}
          >
            Back to Orders
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="danger" className="mb-4" dismissible onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Row>
        <Col md={8}>
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">Order Information</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <p><strong>Order ID:</strong> {order._id}</p>
                  <p><strong>Order Date:</strong> {formatDate(order.orderDate || order.createdAt)}</p>
                  <p>
                    <strong>Status:</strong>{' '}
                    <Badge bg={getStatusBadgeVariant(currentStatus)}>
                      {getFormattedStatus(currentStatus)}
                    </Badge>
                  </p>
                </Col>
                <Col md={6}>
                  <p>
                    <strong>Payment Method:</strong>{' '}
                    Cash on Delivery
                  </p>
                  {order.paymentId && (
                    <p><strong>Payment ID:</strong> {order.paymentId}</p>
                  )}
                  <p>
                    <strong>Payment Status:</strong>{' '}
                    <Badge bg={order.paymentStatus === 'PAID' ? 'success' : 'warning'}>
                      {order.paymentStatus}
                    </Badge>
                  </p>
                  <p><strong>Total Amount:</strong> {formatPrice(order.totalAmount || 0, order.currency)}</p>
                </Col>
              </Row>

              {/* Display cancellation request information if applicable */}
              {currentStatus === 'CANCELLATION_REQUESTED' && order.cancellationRequest && (
                <div className="mt-3 p-3 border rounded bg-light">
                  <h6 className="mb-3">Cancellation Request Details</h6>
                  <p><strong>Requested by:</strong> Customer</p>
                  <p><strong>Requested on:</strong> {formatDate(order.cancellationRequest.requestedAt)}</p>
                  <p><strong>Reason:</strong> {order.cancellationRequest.reason}</p>
                  
                  <div className="d-flex gap-2 mt-3">
                    <Button 
                      variant="success" 
                      size="sm"
                      onClick={() => openCancellationModal('APPROVED')}
                      disabled={updating}
                    >
                      Approve Request
                    </Button>
                    <Button 
                      variant="danger" 
                      size="sm"
                      onClick={() => openCancellationModal('REJECTED')}
                      disabled={updating}
                    >
                      Reject Request
                    </Button>
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>

          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">Shipping Information</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <p><strong>Name:</strong> {order.shippingAddress?.name || 'N/A'}</p>
                  <p><strong>Email:</strong> {order.shippingAddress?.email || 'N/A'}</p>
                  <p><strong>Mobile:</strong> {order.shippingAddress?.mobileNo || 'N/A'}</p>
                  <p><strong>Address:</strong> {order.shippingAddress?.address || 'N/A'}</p>
                </Col>
                <Col md={6}>
                  <p><strong>City:</strong> {order.shippingAddress?.city || 'N/A'}</p>
                  <p><strong>State:</strong> {order.shippingAddress?.state || 'N/A'}</p>
                  <p><strong>Pincode:</strong> {order.shippingAddress?.pincode || 'N/A'}</p>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          <Card>
            <Card.Header>
              <h5 className="mb-0">Products</h5>
            </Card.Header>
            <Card.Body>
              {order.products?.map((item, index) => (
                <div key={index} className="border-bottom pb-3 mb-3">
                  <Row>
                    <Col md={6}>
                      <h6>{item.product?.name || 'Unknown Product'}</h6>
                      <p className="text-muted mb-0">Quantity: {item.quantity || 1}</p>
                    </Col>
                    <Col md={6} className="text-end">
                      <p className="mb-0"><strong>Price:</strong> {formatPrice(item.price || 0, order.currency)}</p>
                      <p className="mb-0"><strong>Total:</strong> {formatPrice((item.price || 0) * (item.quantity || 1), order.currency)}</p>
                    </Col>
                  </Row>
                </div>
              ))}

              <div className="mt-4">
                <Row>
                  <Col md={6} className="text-end">
                    <p><strong>Subtotal:</strong></p>
                    <p><strong>Shipping:</strong></p>
                    {order.currency === 'INR' && <p><strong>Tax (18% GST):</strong></p>}
                    <h5><strong>Total Amount:</strong></h5>
                  </Col>
                  <Col md={6} className="text-end">
                    <p>{formatPrice(order.subtotal || 0, order.currency)}</p>
                    <p>{formatPrice(order.shippingCost || 0, order.currency)}</p>
                    {order.currency === 'INR' && <p>{formatPrice(order.tax || 0, order.currency)}</p>}
                    <h5>{formatPrice(order.totalAmount || 0, order.currency)}</h5>
                  </Col>
                </Row>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Update Order Status</h5>
            </Card.Header>
            <Card.Body>
              {/* Payment Verification Buttons for Admin */}
              {currentStatus === 'PENDING_VERIFICATION' && (
                <div className="d-grid gap-2 mb-3">
                  <Button
                    variant="success"
                    onClick={() => openPaymentVerificationModal('CONFIRMED')}
                    disabled={updating}
                  >
                    Confirm Payment
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => openPaymentVerificationModal('CANCELLED')}
                    disabled={updating}
                  >
                    Cancel Payment
                  </Button>
                </div>
              )}
              <div className="d-grid gap-2">
                <Button
                  variant="outline-info"
                  onClick={() => updateOrderStatus('CONFIRMED')}
                  disabled={updating || !isStatusUpdateAllowed(currentStatus, 'CONFIRMED')}
                >
                  Confirm Order
                </Button>
                <Button
                  variant="outline-primary"
                  onClick={() => updateOrderStatus('SHIPPED')}
                  disabled={updating || !isStatusUpdateAllowed(currentStatus, 'SHIPPED')}
                >
                  Mark as Shipped
                </Button>
                <Button
                  variant="outline-success"
                  onClick={() => updateOrderStatus('DELIVERED')}
                  disabled={updating || !isStatusUpdateAllowed(currentStatus, 'DELIVERED')}
                >
                  Mark as Delivered
                </Button>
                <Button
                  variant="outline-danger"
                  onClick={() => updateOrderStatus('CANCELLED')}
                  disabled={updating || currentStatus === 'CANCELLED' || currentStatus === 'DELIVERED' || currentStatus === 'CANCELLATION_REQUESTED'}
                >
                  Cancel Order
                </Button>
              </div>
              <hr className="my-4" />
              <Form.Group className="mb-3">
                <Form.Label><strong>Payment Status</strong></Form.Label>
                <Form.Select
                  value={paymentStatusEdit}
                  onChange={e => setPaymentStatusEdit(e.target.value)}
                  disabled={savingPaymentStatus}
                >
                  {PAYMENT_STATUS_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </Form.Select>
              </Form.Group>
              <Button
                variant="dark"
                className="w-100 mb-2"
                onClick={handleSavePaymentStatus}
                disabled={savingPaymentStatus || paymentStatusEdit === order?.paymentStatus}
              >
                {savingPaymentStatus ? <Spinner animation="border" size="sm" className="me-2" /> : null}
                Save Payment Status
              </Button>
            </Card.Body>
          </Card>

          {order.trackingNumber && (
            <Card className="mt-3">
              <Card.Header>
                <h5 className="mb-0">Shipping Information</h5>
              </Card.Header>
              <Card.Body>
                <p><strong>Tracking Number:</strong> {order.trackingNumber}</p>
                <p><strong>Courier:</strong> {order.courierProvider}</p>
                {order.trackingUrl && (
                  <p>
                    <strong>Track Order:</strong>{' '}
                    <a href={order.trackingUrl} target="_blank" rel="noopener noreferrer">
                      Click here
                    </a>
                  </p>
                )}
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>

      <Modal show={showShippingModal} onHide={() => setShowShippingModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Enter Shipping Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Tracking Number*</Form.Label>
              <Form.Control
                type="text"
                value={shippingDetails.trackingNumber}
                onChange={(e) => setShippingDetails(prev => ({
                  ...prev,
                  trackingNumber: e.target.value
                }))}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Courier Service*</Form.Label>
              <Form.Select
                value={shippingDetails.selectedCourier}
                onChange={(e) => setShippingDetails(prev => ({
                  ...prev,
                  selectedCourier: e.target.value,
                }))}
                required
              >
                <option value="">Select Courier Service</option>
                {courierServices.map(courier => (
                  <option key={courier.value} value={courier.value}>
                    {courier.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            {shippingDetails.selectedCourier === 'other' && (
              <Form.Group className="mb-3">
                <Form.Label>Courier Provider Name*</Form.Label>
                <Form.Control
                  type="text"
                  value={shippingDetails.courierProvider}
                  onChange={(e) => setShippingDetails(prev => ({
                    ...prev,
                    courierProvider: e.target.value
                  }))}
                  required
                />
              </Form.Group>
            )}
            <Form.Group className="mb-3">
              <Form.Label>Tracking URL{shippingDetails.selectedCourier === 'other' ? '*' : ''}</Form.Label>
              <Form.Control
                type="url"
                value={shippingDetails.trackingUrl}
                onChange={(e) => setShippingDetails(prev => ({
                  ...prev,
                  trackingUrl: e.target.value
                }))}
                placeholder="https://"
                disabled={shippingDetails.selectedCourier !== 'other'}
                required={shippingDetails.selectedCourier === 'other'}
              />
              {shippingDetails.selectedCourier !== 'other' && shippingDetails.trackingUrl && (
                <Form.Text className="text-muted">
                  URL will be automatically generated based on the tracking number
                </Form.Text>
              )}
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowShippingModal(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleShippingSubmit}
            disabled={
              !shippingDetails.trackingNumber || 
              !shippingDetails.selectedCourier ||
              (shippingDetails.selectedCourier === 'other' && (!shippingDetails.courierProvider || !shippingDetails.trackingUrl))
            }
          >
            Update Shipping Details
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Cancellation Request Processing Modal */}
      <Modal show={showCancellationModal} onHide={() => setShowCancellationModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {cancellationAction === 'APPROVED' ? 'Approve' : 'Reject'} Cancellation Request
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            You are about to {cancellationAction === 'APPROVED' ? 'approve' : 'reject'} the cancellation request for order {order.orderNumber}.
          </p>
          <p>
            {cancellationAction === 'APPROVED' 
              ? 'The order will be marked as CANCELLED and inventory will be restored.' 
              : 'The order will return to its previous status.'}
          </p>
          
          <Form.Group className="mb-3">
            <Form.Label>Admin Note (will be shared with customer)</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              placeholder={cancellationAction === 'APPROVED' 
                ? "e.g., Your cancellation request has been approved. Your refund will be processed within 3-5 business days." 
                : "e.g., Your order is already in processing and cannot be cancelled at this time."}
              required
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCancellationModal(false)}>
            Cancel
          </Button>
          <Button
            variant={cancellationAction === 'APPROVED' ? 'success' : 'danger'}
            onClick={handleCancellationAction}
            disabled={updating || !adminNote.trim()}
          >
            {updating ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Processing...
              </>
            ) : (
              cancellationAction === 'APPROVED' ? 'Approve and Cancel Order' : 'Reject Request'
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Payment Verification Modal */}
      <Modal show={showPaymentVerificationModal} onHide={() => setShowPaymentVerificationModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {paymentVerificationAction === 'CONFIRMED' ? 'Confirm' : 'Cancel'} Payment
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            You are about to {paymentVerificationAction === 'CONFIRMED' ? 'confirm' : 'cancel'} the payment for order {order.orderNumber}.
          </p>
          <p>
            {paymentVerificationAction === 'CONFIRMED' 
              ? 'The order will be marked as CONFIRMED and proceed to the next stage.' 
              : 'The order will be marked as CANCELLED.'}
          </p>
          
          <Form.Group className="mb-3">
            <Form.Label>Admin Note (will be shared with customer)</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={paymentVerificationNote}
              onChange={(e) => setPaymentVerificationNote(e.target.value)}
              placeholder={paymentVerificationAction === 'CONFIRMED' 
                ? "e.g., Payment confirmed. Your order will be processed shortly." 
                : "e.g., Payment verification failed. Please contact support."}
              required
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPaymentVerificationModal(false)}>
            Cancel
          </Button>
          <Button
            variant={paymentVerificationAction === 'CONFIRMED' ? 'success' : 'danger'}
            onClick={handlePaymentVerification}
            disabled={updating || !paymentVerificationNote.trim()}
          >
            {updating ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Processing...
              </>
            ) : (
              paymentVerificationAction === 'CONFIRMED' ? 'Confirm Payment' : 'Cancel Payment'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AdminOrderDetails; 