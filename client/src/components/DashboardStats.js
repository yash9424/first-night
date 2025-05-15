import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Spinner, Alert, Table, Badge, ProgressBar } from 'react-bootstrap';
import axios from 'axios';
import { 
  FaUsers, FaUserShield, FaBox, FaShoppingCart, 
  FaDollarSign, FaExclamationTriangle, FaBoxOpen, 
  FaHourglassHalf, FaCheck, FaTruck, FaCheckCircle, 
  FaTimesCircle, FaClock, FaMoneyBillWave, FaCreditCard, 
  FaCalendarDay
} from 'react-icons/fa';
import { API_BASE_URL } from '../config';

const DashboardStats = () => {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [outOfStockProducts, setOutOfStockProducts] = useState([]);
  const [topSellingProducts, setTopSellingProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };

        const { data } = await axios.get(`${API_BASE_URL}/api/dashboard/stats`, config);
        setStats(data.stats);
        setRecentOrders(data.recentOrders || []);
        setLowStockProducts(data.lowStockProductsList || []);
        setOutOfStockProducts(data.outOfStockProductsList || []);
        setTopSellingProducts(data.topSellingProducts || []);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch dashboard statistics');
        console.error('Dashboard stats error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="text-center p-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger" className="m-3">
        {error}
      </Alert>
    );
  }

  // Format currency
  const formatCurrency = (amount, currency = 'INR') => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Calculate order fulfillment rate
  const totalProcessedOrders = 
    (stats.deliveredOrders + stats.cancelledOrders) || 1; // Avoid division by zero
  const fulfillmentRate = Math.round(
    (stats.deliveredOrders / totalProcessedOrders) * 100
  );

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

  // Organize the stat cards
  const userStats = [
    {
      title: 'Total Users',
      value: stats.totalUsers || 0,
      icon: <FaUsers size={24} />,
      color: '#4e73df',
      bgColor: '#eaecf4'
    },
    {
      title: 'Customers',
      value: stats.customerUsers || 0,
      icon: <FaUsers size={24} />,
      color: '#1cc88a',
      bgColor: '#eafaf1'
    },
    {
      title: 'Admins',
      value: stats.adminUsers || 0,
      icon: <FaUserShield size={24} />,
      color: '#36b9cc',
      bgColor: '#e8f6f8'
    }
  ];

  const inventoryStats = [
    {
      title: 'Total Products',
      value: stats.totalProducts || 0,
      icon: <FaBox size={24} />,
      color: '#4e73df',
      bgColor: '#eaecf4'
    },
    {
      title: 'In Stock',
      value: stats.inStockProducts || 0,
      icon: <FaBoxOpen size={24} />,
      color: '#1cc88a',
      bgColor: '#eafaf1'
    },
    {
      title: 'Low Stock',
      value: stats.lowStockProducts || 0,
      icon: <FaExclamationTriangle size={24} />,
      color: '#f6c23e',
      bgColor: '#fff9e6'
    },
    {
      title: 'Out of Stock',
      value: stats.outOfStockProducts || 0,
      icon: <FaTimesCircle size={24} />,
      color: '#e74a3b',
      bgColor: '#fde8e6'
    }
  ];

  const orderStats = [
    {
      title: 'Total Orders',
      value: stats.totalOrders || 0,
      icon: <FaShoppingCart size={24} />,
      color: '#4e73df',
      bgColor: '#eaecf4'
    },
    {
      title: 'Pending',
      value: stats.pendingOrders || 0,
      icon: <FaHourglassHalf size={24} />,
      color: '#f6c23e',
      bgColor: '#fff9e6'
    },
    {
      title: 'Confirmed',
      value: stats.confirmedOrders || 0,
      icon: <FaCheck size={24} />,
      color: '#36b9cc',
      bgColor: '#e8f6f8'
    },
    {
      title: 'Shipped',
      value: stats.shippedOrders || 0,
      icon: <FaTruck size={24} />,
      color: '#4e73df',
      bgColor: '#eaecf4'
    },
    {
      title: 'Delivered',
      value: stats.deliveredOrders || 0,
      icon: <FaCheckCircle size={24} />,
      color: '#1cc88a',
      bgColor: '#eafaf1'
    },
    {
      title: 'Cancelled',
      value: stats.cancelledOrders || 0,
      icon: <FaTimesCircle size={24} />,
      color: '#e74a3b',
      bgColor: '#fde8e6'
    },
    {
      title: 'Cancellation Requests',
      value: stats.cancellationRequests || 0,
      icon: <FaClock size={24} />,
      color: '#f6c23e',
      bgColor: '#fff9e6'
    }
  ];

  const salesStats = [
    {
      title: 'Total Revenue (INR)',
      value: formatCurrency(stats.totalRevenue || 0, 'INR'),
      icon: <FaDollarSign size={24} />,
      color: '#1cc88a',
      bgColor: '#eafaf1'
    },
    {
      title: 'Total Revenue (USD)',
      value: formatCurrency(stats.totalRevenueUSD || 0, 'USD'),
      icon: <FaDollarSign size={24} />,
      color: '#4e73df',
      bgColor: '#eaecf4'
    },
    {
      title: 'Products Sold',
      value: stats.totalProductsSold || 0,
      icon: <FaBox size={24} />,
      color: '#4e73df',
      bgColor: '#eaecf4'
    },
    {
      title: 'Online Payment Orders',
      value: stats.onlinePaymentOrders || 0,
      icon: <FaCreditCard size={24} />,
      color: '#36b9cc',
      bgColor: '#e8f6f8'
    }
  ];

  const todayStats = [
    {
      title: "Today's Orders",
      value: stats.todayOrders || 0,
      icon: <FaCalendarDay size={24} />,
      color: '#4e73df',
      bgColor: '#eaecf4'
    },
    {
      title: "Today's Revenue (INR)",
      value: formatCurrency(stats.todayRevenue || 0, 'INR'),
      icon: <FaDollarSign size={24} />,
      color: '#1cc88a',
      bgColor: '#eafaf1'
    },
    {
      title: "Today's Revenue (USD)",
      value: formatCurrency(stats.todayRevenueUSD || 0, 'USD'),
      icon: <FaDollarSign size={24} />,
      color: '#1cc88a',
      bgColor: '#eafaf1'
    },
    {
      title: "Today's Cancellations",
      value: stats.todayCancellations || 0,
      icon: <FaTimesCircle size={24} />,
      color: '#e74a3b',
      bgColor: '#fde8e6'
    }
  ];

  return (
    <div className="p-4">
      <h2 className="mb-4">Dashboard Overview</h2>

      {/* Today's Stats */}
      <h4 className="mb-3">Today's Summary</h4>
      <Row className="mb-4">
        {todayStats.map((stat, index) => (
          <Col key={index} md={3} className="mb-4">
            <Card className="h-100 border-0 shadow-sm">
              <Card.Body style={{ backgroundColor: stat.bgColor }}>
                <Row className="align-items-center">
                  <Col>
                    <div className="text-uppercase mb-1 font-weight-bold text-muted">
                      {stat.title}
                    </div>
                    <div className="h4 mb-0 font-weight-bold" style={{ color: stat.color }}>
                      {stat.value}
                    </div>
                  </Col>
                  <Col xs="auto">
                    <div style={{ color: stat.color }}>
                      {stat.icon}
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* User Stats */}
      <h4 className="mb-3">User Statistics</h4>
      <Row className="mb-4">
        {userStats.map((stat, index) => (
          <Col key={index} md={4} className="mb-4">
            <Card className="h-100 border-0 shadow-sm">
              <Card.Body style={{ backgroundColor: stat.bgColor }}>
                <Row className="align-items-center">
                  <Col>
                    <div className="text-uppercase mb-1 font-weight-bold text-muted">
                      {stat.title}
                    </div>
                    <div className="h4 mb-0 font-weight-bold" style={{ color: stat.color }}>
                      {stat.value}
                    </div>
                  </Col>
                  <Col xs="auto">
                    <div style={{ color: stat.color }}>
                      {stat.icon}
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Sales & Revenue Stats */}
      <h4 className="mb-3">Sales & Revenue</h4>
      <Row className="mb-4">
        {salesStats.map((stat, index) => (
          <Col key={index} lg={3} md={6} className="mb-4">
            <Card className="h-100 border-0 shadow-sm">
              <Card.Body style={{ backgroundColor: stat.bgColor }}>
                <Row className="align-items-center">
                  <Col>
                    <div className="text-uppercase mb-1 font-weight-bold text-muted">
                      {stat.title}
                    </div>
                    <div className="h4 mb-0 font-weight-bold" style={{ color: stat.color }}>
                      {stat.value}
                    </div>
                  </Col>
                  <Col xs="auto">
                    <div style={{ color: stat.color }}>
                      {stat.icon}
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Order Stats */}
      <h4 className="mb-3">Order Statistics</h4>
      <Row className="mb-4">
        {orderStats.map((stat, index) => (
          <Col key={index} lg={3} md={6} sm={6} className="mb-4">
            <Card className="h-100 border-0 shadow-sm">
              <Card.Body style={{ backgroundColor: stat.bgColor }}>
                <Row className="align-items-center">
                  <Col>
                    <div className="text-uppercase mb-1 font-weight-bold text-muted">
                      {stat.title}
                    </div>
                    <div className="h4 mb-0 font-weight-bold" style={{ color: stat.color }}>
                      {stat.value}
                    </div>
                  </Col>
                  <Col xs="auto">
                    <div style={{ color: stat.color }}>
                      {stat.icon}
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Order Fulfillment Rate */}
      <Row className="mb-4">
        <Col lg={6} md={12}>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white border-0">
              <h5 className="mb-0">Order Fulfillment Rate</h5>
            </Card.Header>
            <Card.Body>
              <h2 className="text-center mb-4">{fulfillmentRate}%</h2>
              <ProgressBar>
                <ProgressBar variant="success" now={fulfillmentRate} key={1} />
                <ProgressBar variant="danger" now={100-fulfillmentRate} key={2} />
              </ProgressBar>
              <div className="d-flex justify-content-between mt-2">
                <small className="text-success">Delivered: {stats.deliveredOrders || 0}</small>
                <small className="text-danger">Cancelled: {stats.cancelledOrders || 0}</small>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={6} md={12}>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white border-0">
              <h5 className="mb-0">Inventory Status</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                {inventoryStats.map((stat, index) => (
                  <Col key={index} md={6} sm={6} className="mb-3">
                    <div className="d-flex align-items-center">
                      <div style={{ color: stat.color, marginRight: '10px' }}>
                        {stat.icon}
                      </div>
                      <div>
                        <div className="small text-muted">{stat.title}</div>
                        <div className="font-weight-bold">{stat.value}</div>
                      </div>
                    </div>
                  </Col>
                ))}
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Recent Orders and Top Products */}
      <Row>
        <Col lg={6} className="mb-4">
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white border-0">
              <h5 className="mb-0">Recent Orders</h5>
            </Card.Header>
            <Card.Body>
              <div className="table-responsive">
                <Table hover size="sm">
                  <thead>
                    <tr>
                      <th>Order #</th>
                      <th>Customer</th>
                      <th>Status</th>
                      <th>Amount (INR/USD)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((order) => (
                      <tr key={order._id}>
                        <td>{order.orderNumber}</td>
                        <td>{order.shippingAddress?.name || 'N/A'}</td>
                        <td>
                          <Badge bg={getStatusBadgeVariant(order.orderStatus)}>
                            {order.orderStatus}
                          </Badge>
                        </td>
                        <td>
                          {formatCurrency(order.totalAmount, 'INR')} / 
                          {formatCurrency(order.totalAmount * 0.012, 'USD')}
                        </td>
                      </tr>
                    ))}
                    {recentOrders.length === 0 && (
                      <tr>
                        <td colSpan="4" className="text-center">No recent orders</td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={6} className="mb-4">
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white border-0">
              <h5 className="mb-0">Top Selling Products</h5>
            </Card.Header>
            <Card.Body>
              <div className="table-responsive">
                <Table hover size="sm">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Units Sold</th>
                      <th>Revenue (INR/USD)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topSellingProducts.map((product) => (
                      <tr key={product._id}>
                        <td>{product.name}</td>
                        <td>{product.totalSold}</td>
                        <td>
                          {formatCurrency(product.revenue, 'INR')} / 
                          {formatCurrency(product.revenue * 0.012, 'USD')}
                        </td>
                      </tr>
                    ))}
                    {topSellingProducts.length === 0 && (
                      <tr>
                        <td colSpan="3" className="text-center">No sales data available</td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Inventory Warnings */}
      <Row>
        <Col lg={6} className="mb-4">
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white border-0 text-warning">
              <h5 className="mb-0"><FaExclamationTriangle className="me-2" /> Low Stock Products</h5>
            </Card.Header>
            <Card.Body>
              <div className="table-responsive">
                <Table hover size="sm">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Stock</th>
                      <th>Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lowStockProducts.map((product) => (
                      <tr key={product._id}>
                        <td>{product.name}</td>
                        <td>
                          <Badge bg="warning" text="dark">
                            {product.stock} left
                          </Badge>
                        </td>
                        <td>{formatCurrency(product.price)}</td>
                      </tr>
                    ))}
                    {lowStockProducts.length === 0 && (
                      <tr>
                        <td colSpan="3" className="text-center">No low stock products</td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={6} className="mb-4">
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white border-0 text-danger">
              <h5 className="mb-0"><FaTimesCircle className="me-2" /> Out of Stock Products</h5>
            </Card.Header>
            <Card.Body>
              <div className="table-responsive">
                <Table hover size="sm">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Status</th>
                      <th>Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {outOfStockProducts.map((product) => (
                      <tr key={product._id}>
                        <td>{product.name}</td>
                        <td>
                          <Badge bg="danger">
                            Out of Stock
                          </Badge>
                        </td>
                        <td>{formatCurrency(product.price)}</td>
                      </tr>
                    ))}
                    {outOfStockProducts.length === 0 && (
                      <tr>
                        <td colSpan="3" className="text-center">No out of stock products</td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardStats; 