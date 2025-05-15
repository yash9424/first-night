import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Spinner } from 'react-bootstrap';
import axios from 'axios';
import { FaUsers, FaBox, FaShoppingCart, FaDollarSign } from 'react-icons/fa';

const DashboardStats = () => {
  const [stats, setStats] = useState(null);
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

        const { data } = await axios.get('http://localhost:5000/api/dashboard/stats', config);
        setStats(data);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch dashboard statistics');
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
      <div className="alert alert-danger" role="alert">
        {error}
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.users || 0,
      icon: <FaUsers size={24} />,
      color: '#4e73df'
    },
    {
      title: 'Total Products',
      value: stats?.products || 0,
      icon: <FaBox size={24} />,
      color: '#1cc88a'
    },
    {
      title: 'Total Orders',
      value: stats?.orders || 0,
      icon: <FaShoppingCart size={24} />,
      color: '#36b9cc'
    },
    {
      title: 'Total Revenue',
      value: `$${(stats?.revenue || 0).toFixed(2)}`,
      icon: <FaDollarSign size={24} />,
      color: '#f6c23e'
    }
  ];

  return (
    <div className="p-4">
      <h2 className="mb-4">Dashboard Overview</h2>
      <Row>
        {statCards.map((stat, index) => (
          <Col key={index} xl={3} md={6} className="mb-4">
            <Card className="h-100 py-2 shadow">
              <Card.Body>
                <Row className="align-items-center">
                  <Col>
                    <div className="text-xs font-weight-bold text-uppercase mb-1">
                      {stat.title}
                    </div>
                    <div className="h5 mb-0 font-weight-bold">
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
    </div>
  );
};

export default DashboardStats; 