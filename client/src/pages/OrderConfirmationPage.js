import React, { useState, useEffect } from 'react';
import { Container, Card, Row, Col, Alert, Button, Spinner } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { formatOrderId, formatPrice, formatDate } from '../utils/formatters';
import { API_BASE_URL } from '../config';

const OrderConfirmationPage = () => {
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { orderNumber } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    navigate('/login');
                    return;
                }

                const response = await axios.get(
                    `${API_BASE_URL}/api/orders/by-number/${orderNumber}`,
                    {
                        headers: { Authorization: `Bearer ${token}` }
                    }
                );

                if (!response.data) {
                    throw new Error('No order data received');
                }

                setOrder(response.data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching order:', err);
                setError(err.response?.data?.message || 'Error fetching order details');
                setLoading(false);
            }
        };

        if (orderNumber) {
            fetchOrder();
        }
    }, [orderNumber, navigate]);

    const handleCancelOrder = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            await axios.patch(
                `${API_BASE_URL}/api/orders/${order.orderNumber}/cancel`,
                {},
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            // Refresh order details
            const response = await axios.get(
                `${API_BASE_URL}/api/orders/by-number/${orderNumber}`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            setOrder(response.data);

        } catch (err) {
            setError(err.response?.data?.message || 'Error cancelling order');
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

    if (error) {
        return (
            <Container className="py-5">
                <Alert variant="danger">{error}</Alert>
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

    return (
        <Container className="py-5">
            <Card className="mb-4">
                <Card.Header className="bg-success text-white">
                    <h4 className="mb-0">Order Confirmed!</h4>
                </Card.Header>
                <Card.Body>
                    <Alert variant="success">
                        Thank you for your order! Your order has been successfully placed.
                        <br />
                        <strong>Order ID: {formatOrderId(order._id)}</strong>
                    </Alert>

                    <Row className="mb-4">
                        <Col md={6}>
                            <h5>Order Details</h5>
                            <p><strong>Order ID:</strong> {formatOrderId(order._id)}</p>
                            <p><strong>Order Date:</strong> {formatDate(order.orderDate || order.createdAt)}</p>
                            <p><strong>Order Status:</strong> {order.orderStatus || 'PENDING'}</p>
                            <p><strong>Payment Method:</strong> {order.paymentMethod === 'CASH_ON_DELIVERY' ? 'Cash on Delivery' : 'Online Payment'}</p>
                            <p><strong>Payment Status:</strong> {order.paymentStatus || 'PENDING'}</p>
                        </Col>
                        <Col md={6}>
                            <h5>Shipping Information</h5>
                            <p><strong>Name:</strong> {order.shippingAddress?.name || 'N/A'}</p>
                            <p><strong>Email:</strong> {order.shippingAddress?.email || 'N/A'}</p>
                            <p><strong>Phone:</strong> {order.shippingAddress?.phone || 'N/A'}</p>
                            <p><strong>Address:</strong> {order.shippingAddress?.address || 'N/A'}</p>
                        </Col>
                    </Row>

                    <h5>Products</h5>
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
                                    <tr key={item._id || index}>
                                        <td>{item.product?.name || 'N/A'}</td>
                                        <td>{item.quantity || 1}</td>
                                        <td>{formatPrice(item.price)}</td>
                                        <td>{formatPrice((item.quantity || 1) * (item.price || 0))}</td>
                                    </tr>
                                ))}
                                <tr>
                                    <td colSpan="3" className="text-end"><strong>Total Amount:</strong></td>
                                    <td><strong>{formatPrice(order.totalAmount)}</strong></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div className="text-center mt-4">
                        <Button variant="primary" onClick={() => navigate('/user/orders')}>
                            View All Orders
                        </Button>
                    </div>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default OrderConfirmationPage; 