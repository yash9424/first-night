import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Table, Badge, Button, Container, Alert, Form, 
  Spinner, Row, Col, InputGroup, Pagination, Modal 
} from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { formatOrderId, formatDate } from '../utils/formatters';
import { API_BASE_URL } from '../config';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingOrders, setUpdatingOrders] = useState(new Set());
  const navigate = useNavigate();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Filtering and search state
  const [filters, setFilters] = useState({
    status: '',
    dateRange: 'all',
    paymentMethod: '',
    searchQuery: ''
  });

  // Bulk action state
  const [selectedOrders, setSelectedOrders] = useState(new Set());
  const [showBulkActionModal, setShowBulkActionModal] = useState(false);
  const [bulkAction, setBulkAction] = useState('');

  const fetchOrders = async (page = currentPage) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login', { replace: true });
        return;
      }

      const params = new URLSearchParams({
        page,
        limit: pageSize,
        status: filters.status,
        dateRange: filters.dateRange,
        paymentMethod: filters.paymentMethod,
        search: filters.searchQuery
      });

      const response = await axios.get(
        `${API_BASE_URL}/api/orders?${params}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 10000
        }
      );
      
      setOrders(response.data.orders);
      setTotalPages(Math.ceil(response.data.total / pageSize));
      setError('');
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [currentPage, pageSize, filters]);

  const handleError = (error) => {
    console.error('Operation failed:', error);
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      navigate('/login', { replace: true });
      return;
    }
    
    if (error.response?.status === 403) {
      setError('Access denied. Admin privileges required.');
      return;
    }

    setError(error.response?.data?.message || 'Operation failed. Please try again.');
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleBulkAction = async () => {
    try {
      if (!window.confirm(`Are you sure you want to update ${selectedOrders.size} orders to ${bulkAction} status?`)) {
        return;
      }

      setLoading(true);
      const token = localStorage.getItem('token');
      
      const promises = Array.from(selectedOrders).map(orderId =>
        axios.patch(
          `${API_BASE_URL}/api/orders/${orderId}/status`,
          { status: bulkAction },
          { headers: { Authorization: `Bearer ${token}` } }
        )
      );

      await Promise.all(promises);
      await fetchOrders();
      setSelectedOrders(new Set());
      setShowBulkActionModal(false);
      setError('');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const exportOrders = async (format) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_BASE_URL}/api/orders/export`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: format === 'xlsx' ? 'arraybuffer' : 'json'
        }
      );

      if (format === 'xlsx') {
        const blob = new Blob([response.data], { 
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
        });
        saveAs(blob, `orders_${new Date().toISOString().split('T')[0]}.xlsx`);
      } else {
        const blob = new Blob([JSON.stringify(response.data, null, 2)], { 
          type: 'application/json' 
        });
        saveAs(blob, `orders_${new Date().toISOString().split('T')[0]}.json`);
      }
    } catch (error) {
      handleError(error);
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

  const deleteOrder = async (orderId) => {
    try {
      // Show confirmation dialog
      if (!window.confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
        return;
      }

      setUpdatingOrders(prev => new Set([...prev, orderId]));
      setError('');

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await axios.delete(
        `${API_BASE_URL}/api/orders/${orderId}`,
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.status === 200) {
        // Remove the order from the state
        setOrders(prevOrders => prevOrders.filter(order => order._id !== orderId));
        setError('');
      } else {
        throw new Error('Failed to delete order');
      }
    } catch (error) {
      console.error('Failed to delete order:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login', { replace: true });
        return;
      }
      
      if (error.response?.status === 403) {
        setError('Access denied. Admin privileges required.');
        return;
      }

      if (error.response?.status === 404) {
        setError('Order not found. It may have been already deleted.');
        // Remove from state if it's not found
        setOrders(prevOrders => prevOrders.filter(order => order._id !== orderId));
        return;
      }

      setError(error.response?.data?.message || 'Failed to delete order. Please try again.');
    } finally {
      setUpdatingOrders(prev => {
        const next = new Set(prev);
        next.delete(orderId);
        return next;
      });
    }
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

  const filteredOrders = orders.filter(order => {
    if (filters.status && order.orderStatus !== filters.status) {
      return false;
    }
    if (filters.paymentMethod && order.paymentMethod !== filters.paymentMethod) {
      return false;
    }
    if (filters.searchQuery) {
      const searchLower = filters.searchQuery.toLowerCase();
      return (
        order.orderNumber?.toLowerCase().includes(searchLower) ||
        order.user?.name?.toLowerCase().includes(searchLower) ||
        order.user?.email?.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  // Add formatPrice helper function
  const formatPrice = (amount, currency) => {
    return currency === 'INR' ? `₹${amount.toFixed(2)}` : `$${amount.toFixed(2)}`;
  };

  return (
    <Container fluid className="py-4">
      <h2 className="mb-4">Order Management</h2>
      
      {error && <Alert variant="danger">{error}</Alert>}

      {/* Filters */}
      <Row className="mb-4">
        <Col md={3}>
          <Form.Group>
            <Form.Label>Status</Form.Label>
            <Form.Select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="SHIPPED">Shipped</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group>
            <Form.Label>Date Range</Form.Label>
            <Form.Select
              value={filters.dateRange}
              onChange={(e) => handleFilterChange('dateRange', e.target.value)}
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group>
            <Form.Label>Payment Method</Form.Label>
            <Form.Select
              value={filters.paymentMethod}
              onChange={(e) => handleFilterChange('paymentMethod', e.target.value)}
            >
              <option value="">All Methods</option>
              <option value="cod">Cash on Delivery</option>
              <option value="razorpay">Razorpay</option>
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group>
            <Form.Label>Search</Form.Label>
            <InputGroup>
              <Form.Control
                type="text"
                placeholder="Search orders..."
                value={filters.searchQuery}
                onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
              />
              <Button variant="outline-secondary" onClick={() => fetchOrders()}>
                <i className="fas fa-search"></i>
              </Button>
            </InputGroup>
          </Form.Group>
        </Col>
      </Row>

      {/* Bulk Actions */}
      <Row className="mb-3">
        <Col>
          <Button
            variant="primary"
            className="me-2"
            disabled={selectedOrders.size === 0}
            onClick={() => setShowBulkActionModal(true)}
          >
            Bulk Update ({selectedOrders.size})
          </Button>
          <Button
            variant="outline-primary"
            className="me-2"
            onClick={() => exportOrders('xlsx')}
          >
            Export to Excel
          </Button>
          <Button
            variant="outline-primary"
            onClick={() => exportOrders('json')}
          >
            Export to JSON
          </Button>
        </Col>
      </Row>

      {/* Orders Table */}
      <Table responsive striped bordered hover>
        <thead>
          <tr>
            <th>
              <Form.Check
                type="checkbox"
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedOrders(new Set(orders.map(order => order._id)));
                  } else {
                    setSelectedOrders(new Set());
                  }
                }}
                checked={selectedOrders.size === orders.length && orders.length > 0}
              />
            </th>
            <th>Order Number</th>
            <th>Date</th>
            <th>Customer</th>
            <th>Total</th>
            <th>Payment Method</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredOrders.map(order => (
            <tr key={order._id}>
              <td>
                <Form.Check
                  type="checkbox"
                  checked={selectedOrders.has(order._id)}
                  onChange={(e) => {
                    const newSelected = new Set(selectedOrders);
                    if (e.target.checked) {
                      newSelected.add(order._id);
                    } else {
                      newSelected.delete(order._id);
                    }
                    setSelectedOrders(newSelected);
                  }}
                />
              </td>
              <td>
                <div>{order.orderNumber}</div>
                <small className="text-muted">ID: {formatOrderId(order._id)}</small>
              </td>
              <td>{formatDate(order.createdAt)}</td>
              <td>
                {order.shippingAddress.name}
                <br />
                <small>{order.shippingAddress.email}</small>
              </td>
              <td>
                <div>{formatPrice(order.totalAmount, order.currency)}</div>
                <small className="text-muted">
                  {order.currency === 'INR' ? 'Indian Rupees' : 'US Dollars'}
                </small>
              </td>
              <td>
                {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Razorpay'}
              </td>
              <td>
                <Badge bg={getStatusBadgeVariant(order.orderStatus)}>
                  {order.orderStatus}
                </Badge>
              </td>
              <td>
                <Button
                  variant="outline-primary"
                  size="sm"
                  className="me-2"
                  href={`/admin/orders/${order._id}`}
                >
                  View
                </Button>
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={() => deleteOrder(order._id)}
                  disabled={updatingOrders.has(order._id)}
                >
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Pagination */}
      <Row className="mt-4">
        <Col md={6}>
          <Form.Select
            style={{ width: 'auto' }}
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
          >
            <option value="10">10 per page</option>
            <option value="25">25 per page</option>
            <option value="50">50 per page</option>
            <option value="100">100 per page</option>
          </Form.Select>
        </Col>
        <Col md={6}>
          <Pagination className="justify-content-end">
            <Pagination.First
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
            />
            <Pagination.Prev
              onClick={() => setCurrentPage(prev => prev - 1)}
              disabled={currentPage === 1}
            />
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(page => {
                const diff = Math.abs(page - currentPage);
                return diff === 0 || diff === 1 || page === 1 || page === totalPages;
              })
              .map((page, index, array) => {
                if (index > 0 && array[index - 1] !== page - 1) {
                  return [
                    <Pagination.Ellipsis key={`ellipsis-${page}`} />,
                    <Pagination.Item
                      key={page}
                      active={page === currentPage}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </Pagination.Item>
                  ];
                }
                return (
                  <Pagination.Item
                    key={page}
                    active={page === currentPage}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Pagination.Item>
                );
              })}
            <Pagination.Next
              onClick={() => setCurrentPage(prev => prev + 1)}
              disabled={currentPage === totalPages}
            />
            <Pagination.Last
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
            />
          </Pagination>
        </Col>
      </Row>

      {/* Bulk Action Modal */}
      <Modal show={showBulkActionModal} onHide={() => setShowBulkActionModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Bulk Update Orders</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Select Status</Form.Label>
            <Form.Select
              value={bulkAction}
              onChange={(e) => setBulkAction(e.target.value)}
            >
              <option value="">Select Status</option>
              <option value="CONFIRMED">Confirm</option>
              <option value="CANCELLED">Cancel</option>
            </Form.Select>
            <Form.Text className="text-muted">
              Note: Bulk actions are limited to confirming or cancelling orders. Shipping and delivery status must be updated individually.
            </Form.Text>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowBulkActionModal(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleBulkAction}
            disabled={!bulkAction || loading}
          >
            {loading ? 'Updating...' : 'Update Orders'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default OrdersPage; 