import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Card, Alert, Row, Col, Spinner } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const PaymentPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: ''
    });
    const [profileData, setProfileData] = useState(null);
    const [useProfileInfo, setUseProfileInfo] = useState(true);
    const [paymentMethod, setPaymentMethod] = useState('CASH_ON_DELIVERY');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [productDetails, setProductDetails] = useState(null);
    const [loadingProfile, setLoadingProfile] = useState(true);

    const navigate = useNavigate();
    const location = useLocation();

    // Check authentication status
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login', { state: { from: location.pathname } });
        }
    }, [navigate, location]);

    // Fetch user profile
    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                setLoadingProfile(true);
                setError('');
                
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error('No authentication token found');
                }

                const response = await axios.get('http://localhost:5000/api/users/profile', {
                    headers: { 
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.data) {
                    throw new Error('No profile data received');
                }

                const profileInfo = {
                    name: response.data.name || '',
                    email: response.data.email || '',
                    phone: response.data.phone || '',
                    address: response.data.address || ''
                };

                setProfileData(profileInfo);
                
                // Always set initial form data with profile info if available
                if (useProfileInfo) {
                    setFormData(profileInfo);
                }
            } catch (error) {
                console.error('Profile fetch error:', error);
                if (error.response?.status === 401) {
                    // Token is invalid or expired
                    localStorage.removeItem('token');
                    navigate('/login', { state: { from: location.pathname } });
                } else {
                    setError('Failed to load profile information. Please try logging in again.');
                }
            } finally {
                setLoadingProfile(false);
            }
        };

        fetchUserProfile();
    }, [navigate, location.pathname, useProfileInfo]);

    useEffect(() => {
        const getProductDetails = async () => {
            if (location.state?.product) {
                setProductDetails(location.state.product);
            } else {
                navigate('/');
            }
        };

        getProductDetails();
    }, [navigate, location.state]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleUseProfileInfo = (e) => {
        const useProfile = e.target.checked;
        setUseProfileInfo(useProfile);
        
        if (useProfile && profileData) {
            setFormData(profileData);
        } else {
            // Clear form data if user unchecks the box
            setFormData({
                name: '',
                email: '',
                phone: '',
                address: ''
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        // Validate form data
        if (!formData.name || !formData.email || !formData.phone || !formData.address) {
            setError('Please fill in all shipping information fields');
            setLoading(false);
            return;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setError('Please enter a valid email address');
            setLoading(false);
            return;
        }

        // Validate phone number (basic validation)
        const phoneRegex = /^\d{10}$/;
        if (!phoneRegex.test(formData.phone.replace(/[^0-9]/g, ''))) {
            setError('Please enter a valid 10-digit phone number');
            setLoading(false);
            return;
        }

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            // Create order
            const orderData = {
                products: [{
                    product: productDetails._id,
                    quantity: 1,
                    price: productDetails.discountedPrice || productDetails.price
                }],
                shippingAddress: formData,
                paymentMethod,
                totalAmount: productDetails.discountedPrice || productDetails.price
            };

            const response = await axios.post(
                'http://localhost:5000/api/orders',
                orderData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            setSuccess('Order placed successfully!');
            
            // Redirect to order confirmation page after 2 seconds
            setTimeout(() => {
                navigate(`/order/${response.data._id}`);
            }, 2000);

        } catch (err) {
            setError(err.response?.data?.message || 'Error placing order');
        } finally {
            setLoading(false);
        }
    };

    if (!productDetails) {
        return (
            <Container className="py-5">
                <div className="text-center">
                    <Spinner animation="border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </Spinner>
                </div>
            </Container>
        );
    }

    return (
        <Container className="py-5">
            <Row>
                <Col md={8}>
                    <Card className="mb-4">
                        <Card.Header className="bg-primary text-white">
                            <h4 className="mb-0">Shipping Information</h4>
                        </Card.Header>
                        <Card.Body>
                            {error && (
                                <Alert 
                                    variant="danger" 
                                    dismissible 
                                    onClose={() => setError('')}
                                >
                                    {error}
                                </Alert>
                            )}
                            {success && <Alert variant="success">{success}</Alert>}

                            {loadingProfile ? (
                                <div className="text-center py-4">
                                    <Spinner animation="border" role="status">
                                        <span className="visually-hidden">Loading profile...</span>
                                    </Spinner>
                                </div>
                            ) : (
                                <Form onSubmit={handleSubmit}>
                                    {profileData && (
                                        <Form.Group className="mb-4">
                                            <Form.Check
                                                type="checkbox"
                                                label="Use my profile information"
                                                checked={useProfileInfo}
                                                onChange={handleUseProfileInfo}
                                                className="mb-2"
                                            />
                                        </Form.Group>
                                    )}

                                    <Form.Group className="mb-3">
                                        <Form.Label>Full Name</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            required
                                            placeholder="Enter your full name"
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label>Email</Form.Label>
                                        <Form.Control
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            required
                                            placeholder="Enter your email address"
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label>Phone Number</Form.Label>
                                        <Form.Control
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            required
                                            placeholder="Enter your phone number"
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label>Delivery Address</Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            rows={3}
                                            name="address"
                                            value={formData.address}
                                            onChange={handleInputChange}
                                            required
                                            placeholder="Enter your complete delivery address"
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-4">
                                        <Form.Label>Payment Method</Form.Label>
                                        <div>
                                            <Form.Check
                                                type="radio"
                                                label="Cash on Delivery"
                                                name="paymentMethod"
                                                checked={paymentMethod === 'CASH_ON_DELIVERY'}
                                                onChange={() => setPaymentMethod('CASH_ON_DELIVERY')}
                                                className="mb-2"
                                            />
                                            <Form.Check
                                                type="radio"
                                                label="Online Payment"
                                                name="paymentMethod"
                                                checked={paymentMethod === 'ONLINE_PAYMENT'}
                                                onChange={() => setPaymentMethod('ONLINE_PAYMENT')}
                                            />
                                        </div>
                                    </Form.Group>

                                    <div className="d-grid">
                                        <Button 
                                            variant="primary" 
                                            type="submit"
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
                                                    Processing...
                                                </>
                                            ) : (
                                                'Place Order'
                                            )}
                                        </Button>
                                    </div>
                                </Form>
                            )}
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={4}>
                    <Card>
                        <Card.Header className="bg-primary text-white">
                            <h4 className="mb-0">Order Summary</h4>
                        </Card.Header>
                        <Card.Body>
                            <div className="mb-3">
                                <h5>{productDetails.name}</h5>
                                <p className="text-muted mb-1">Quantity: 1</p>
                                <p className="mb-0">
                                    <strong>Price: </strong>
                                    ₹{productDetails.discountedPrice || productDetails.price}
                                </p>
                            </div>
                            <hr />
                            <div className="d-flex justify-content-between">
                                <h5>Total Amount:</h5>
                                <h5>₹{productDetails.discountedPrice || productDetails.price}</h5>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default PaymentPage;