import React, { useState, useEffect } from 'react';
import { Form, Button, Row, Col, Card, Alert, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import '../styles/actionButtons.css';

const OrderForm = ({ products, totalAmount, clearCart }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [formData, setFormData] = useState({
    shippingAddress: {
      name: '',
      email: '',
      mobileNo: '',
      alternatePhone: '',
      address: '',
      apartment: '',
      landmark: '',
      city: '',
      state: '',
      country: 'India',
      pincode: '',
      addressType: 'Home'
    },
    billingAddress: {
      sameAsShipping: true,
      name: '',
      email: '',
      mobileNo: '',
      address: '',
      apartment: '',
      landmark: '',
      city: '',
      state: '',
      country: 'India',
      pincode: ''
    },
    paymentMethod: 'cod',
    specialInstructions: '',
    giftWrap: false,
    giftMessage: ''
  });

  // Load user data if logged in
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      setFormData(prev => ({
        ...prev,
        shippingAddress: {
          ...prev.shippingAddress,
          name: user.name || '',
          email: user.email || ''
        }
      }));
    }
  }, []);

  const handleInputChange = (e, addressType = 'shipping') => {
    const { name, value } = e.target;
    
    if (addressType === 'shipping') {
      setFormData(prev => ({
        ...prev,
        shippingAddress: {
          ...prev.shippingAddress,
          [name]: value
        }
      }));

      // Update billing address if same as shipping
      if (formData.billingAddress.sameAsShipping) {
        setFormData(prev => ({
          ...prev,
          billingAddress: {
            ...prev.billingAddress,
            [name]: value
          }
        }));
      }
    } else if (addressType === 'billing') {
      setFormData(prev => ({
        ...prev,
        billingAddress: {
          ...prev.billingAddress,
          [name]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleBillingAddressToggle = (e) => {
    const sameAsShipping = e.target.checked;
    setFormData(prev => ({
      ...prev,
      billingAddress: {
        ...prev.billingAddress,
        sameAsShipping,
        ...(sameAsShipping ? prev.shippingAddress : {})
      }
    }));
  };

  const validateStock = async () => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/orders/validate-stock`,
        { products: products.map(item => ({ id: item._id, quantity: item.quantity })) }
      );
      return response.data.valid;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to validate stock');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Prevent multiple submissions
    if (loading) {
      return;
    }

    setSubmitAttempted(true);
    setLoading(true);
    setError('');

    try {
      // Add submission lock
      const submissionLock = localStorage.getItem('orderSubmissionLock');
      if (submissionLock) {
        const lockTime = parseInt(submissionLock);
        if (Date.now() - lockTime < 5000) { // 5 seconds lock
          throw new Error('Please wait before submitting another order');
        }
      }
      localStorage.setItem('orderSubmissionLock', Date.now().toString());

      // Validate products
      if (!products || products.length === 0) {
        throw new Error('No products in cart');
      }

      // Validate stock availability
      const stockValid = await validateStock();
      if (!stockValid) {
        throw new Error('Some products are out of stock');
      }

      // Validate shipping address
      const requiredFields = ['name', 'email', 'mobileNo', 'address', 'city', 'state', 'pincode'];
      for (const field of requiredFields) {
        if (!formData.shippingAddress[field] || formData.shippingAddress[field].trim() === '') {
          throw new Error(`${field.charAt(0).toUpperCase() + field.slice(1)} is required in shipping address`);
        }
      }

      // Validate billing address if not same as shipping
      if (!formData.billingAddress.sameAsShipping) {
        for (const field of requiredFields) {
          if (!formData.billingAddress[field] || formData.billingAddress[field].trim() === '') {
            throw new Error(`${field.charAt(0).toUpperCase() + field.slice(1)} is required in billing address`);
          }
        }
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.shippingAddress.email)) {
        throw new Error('Please enter a valid email address');
      }

      // Validate mobile number (assuming Indian format)
      const mobileRegex = /^[6-9]\d{9}$/;
      if (!mobileRegex.test(formData.shippingAddress.mobileNo)) {
        throw new Error('Please enter a valid 10-digit mobile number');
      }

      // Validate pincode (6 digits for India)
      const pincodeRegex = /^\d{6}$/;
      if (!pincodeRegex.test(formData.shippingAddress.pincode)) {
        throw new Error('Please enter a valid 6-digit pincode');
      }

      const orderData = {
        products: products.map(item => ({
          product: item._id,
          quantity: item.quantity,
          price: item.discountedPrice || item.price,
          size: item.size,
          color: item.color
        })),
        shippingAddress: {
          ...formData.shippingAddress,
          name: formData.shippingAddress.name.trim(),
          email: formData.shippingAddress.email.trim(),
          mobileNo: formData.shippingAddress.mobileNo.trim(),
          address: formData.shippingAddress.address.trim(),
          city: formData.shippingAddress.city.trim(),
          state: formData.shippingAddress.state.trim(),
          pincode: formData.shippingAddress.pincode.trim()
        },
        billingAddress: formData.billingAddress.sameAsShipping 
          ? { ...formData.shippingAddress, sameAsShipping: true }
          : {
              ...formData.billingAddress,
              name: formData.billingAddress.name.trim(),
              email: formData.billingAddress.email.trim(),
              mobileNo: formData.billingAddress.mobileNo.trim(),
              address: formData.billingAddress.address.trim(),
              city: formData.billingAddress.city.trim(),
              state: formData.billingAddress.state.trim(),
              pincode: formData.billingAddress.pincode.trim()
            },
        paymentMethod: formData.paymentMethod,
        totalAmount,
        specialInstructions: formData.specialInstructions.trim(),
        giftWrap: formData.giftWrap,
        giftMessage: formData.giftMessage.trim()
      };

      const token = localStorage.getItem('token');
      const config = {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        timeout: 10000 // 10 second timeout
      };

      const response = await axios.post(
        `${API_BASE_URL}/api/orders`,
        orderData,
        config
      );

      // Clear cart after successful order
      if (clearCart) clearCart();

      // Redirect to order confirmation with the order number
      navigate(`/order-confirmation/${response.data.order.orderNumber}`);
    } catch (error) {
      console.error('Order submission error:', error);
      if (error.response?.status === 401) {
        navigate('/login', { state: { from: '/checkout' } });
        return;
      }
      
      setError(error.response?.data?.message || error.message || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
      // Clear submission lock in case of error
      localStorage.removeItem('orderSubmissionLock');
    }
  };

  return (
    <Form onSubmit={handleSubmit} className="order-form">
      {error && <Alert variant="danger">{error}</Alert>}
      
      <Card className="mb-4">
        <Card.Header>
          <h4>Shipping Address</h4>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Full Name*</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={formData.shippingAddress.name}
                  onChange={(e) => handleInputChange(e, 'shipping')}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Email*</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={formData.shippingAddress.email}
                  onChange={(e) => handleInputChange(e, 'shipping')}
                  required
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Mobile Number*</Form.Label>
                <Form.Control
                  type="tel"
                  name="mobileNo"
                  value={formData.shippingAddress.mobileNo}
                  onChange={(e) => handleInputChange(e, 'shipping')}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Alternate Phone</Form.Label>
                <Form.Control
                  type="tel"
                  name="alternatePhone"
                  value={formData.shippingAddress.alternatePhone}
                  onChange={(e) => handleInputChange(e, 'shipping')}
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Address*</Form.Label>
            <Form.Control
              type="text"
              name="address"
              value={formData.shippingAddress.address}
              onChange={(e) => handleInputChange(e, 'shipping')}
              required
            />
          </Form.Group>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Apartment/Suite</Form.Label>
                <Form.Control
                  type="text"
                  name="apartment"
                  value={formData.shippingAddress.apartment}
                  onChange={(e) => handleInputChange(e, 'shipping')}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Landmark</Form.Label>
                <Form.Control
                  type="text"
                  name="landmark"
                  value={formData.shippingAddress.landmark}
                  onChange={(e) => handleInputChange(e, 'shipping')}
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>City*</Form.Label>
                <Form.Control
                  type="text"
                  name="city"
                  value={formData.shippingAddress.city}
                  onChange={(e) => handleInputChange(e, 'shipping')}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>State*</Form.Label>
                <Form.Control
                  type="text"
                  name="state"
                  value={formData.shippingAddress.state}
                  onChange={(e) => handleInputChange(e, 'shipping')}
                  required
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Pincode*</Form.Label>
                <Form.Control
                  type="text"
                  name="pincode"
                  value={formData.shippingAddress.pincode}
                  onChange={(e) => handleInputChange(e, 'shipping')}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Address Type</Form.Label>
                <Form.Select
                  name="addressType"
                  value={formData.shippingAddress.addressType}
                  onChange={(e) => handleInputChange(e, 'shipping')}
                >
                  <option value="Home">Home</option>
                  <option value="Office">Office</option>
                  <option value="Other">Other</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Card className="mb-4">
        <Card.Header>
          <h4>Billing Address</h4>
        </Card.Header>
        <Card.Body>
          <Form.Group className="mb-3">
            <Form.Check
              type="checkbox"
              label="Same as shipping address"
              checked={formData.billingAddress.sameAsShipping}
              onChange={handleBillingAddressToggle}
            />
          </Form.Group>

          {!formData.billingAddress.sameAsShipping && (
            <>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Full Name*</Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      value={formData.billingAddress.name}
                      onChange={(e) => handleInputChange(e, 'billing')}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Email*</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      value={formData.billingAddress.email}
                      onChange={(e) => handleInputChange(e, 'billing')}
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Mobile Number*</Form.Label>
                    <Form.Control
                      type="tel"
                      name="mobileNo"
                      value={formData.billingAddress.mobileNo}
                      onChange={(e) => handleInputChange(e, 'billing')}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Address</Form.Label>
                    <Form.Control
                      type="text"
                      name="address"
                      value={formData.billingAddress.address}
                      onChange={(e) => handleInputChange(e, 'billing')}
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Apartment/Suite</Form.Label>
                    <Form.Control
                      type="text"
                      name="apartment"
                      value={formData.billingAddress.apartment}
                      onChange={(e) => handleInputChange(e, 'billing')}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Landmark</Form.Label>
                    <Form.Control
                      type="text"
                      name="landmark"
                      value={formData.billingAddress.landmark}
                      onChange={(e) => handleInputChange(e, 'billing')}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>City*</Form.Label>
                    <Form.Control
                      type="text"
                      name="city"
                      value={formData.billingAddress.city}
                      onChange={(e) => handleInputChange(e, 'billing')}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>State*</Form.Label>
                    <Form.Control
                      type="text"
                      name="state"
                      value={formData.billingAddress.state}
                      onChange={(e) => handleInputChange(e, 'billing')}
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Pincode*</Form.Label>
                    <Form.Control
                      type="text"
                      name="pincode"
                      value={formData.billingAddress.pincode}
                      onChange={(e) => handleInputChange(e, 'billing')}
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>
            </>
          )}
        </Card.Body>
      </Card>

      <Card className="mb-4">
        <Card.Header>
          <h4>Additional Information</h4>
        </Card.Header>
        <Card.Body>
          <Form.Group className="mb-3">
            <Form.Label>Special Instructions</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="specialInstructions"
              value={formData.specialInstructions}
              onChange={handleInputChange}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Check
              type="checkbox"
              label="Gift wrap"
              name="giftWrap"
              checked={formData.giftWrap}
              onChange={(e) => handleInputChange({
                target: {
                  name: 'giftWrap',
                  value: e.target.checked
                }
              })}
            />
          </Form.Group>

          {formData.giftWrap && (
            <Form.Group className="mb-3">
              <Form.Label>Gift Message</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="giftMessage"
                value={formData.giftMessage}
                onChange={handleInputChange}
              />
            </Form.Group>
          )}
        </Card.Body>
      </Card>

      <Card className="mb-4">
        <Card.Header>
          <h4>Payment Method</h4>
        </Card.Header>
        <Card.Body>
          <Form.Group>
            <Form.Check
              type="radio"
              label="Cash on Delivery"
              name="paymentMethod"
              value="cod"
              checked={true}
              readOnly
              className="mb-2"
            />
          </Form.Group>
        </Card.Body>
      </Card>

      <div className="d-grid">
        <Button 
          type="submit" 
          variant="primary" 
          size="lg" 
          className="btn-place-order" 
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
  );
};

export default OrderForm; 