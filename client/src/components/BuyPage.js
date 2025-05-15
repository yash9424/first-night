import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Container, Row, Col, Form, Button, Card, Alert, Spinner, Modal } from 'react-bootstrap';
import { API_BASE_URL, API_CONFIG, ERROR_MESSAGES, CURRENCY_CONFIG } from '../config';
import './BuyPage.css';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  ...API_CONFIG
});

// Add request interceptor to handle token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('Request config:', {
      url: config.url,
      method: config.method,
      headers: config.headers,
      data: config.data
    });
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    console.log('Response received:', {
      status: response.status,
      data: response.data
    });
    return response;
  },
  async (error) => {
    console.error('Response error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      statusText: error.response?.statusText
    });
    if (error.response) {
      // Server responded with error
      if (error.response.status === 401) {
        localStorage.removeItem('token');
        throw new Error(ERROR_MESSAGES.UNAUTHORIZED);
      }
      throw error;
    } else if (error.request) {
      // Request made but no response
      throw new Error(ERROR_MESSAGES.NETWORK_ERROR);
    }
    throw error;
  }
);

// Add utility function for retry logic
const retryWithBackoff = async (fn, maxRetries = 3) => {
  let retries = 0;
  let lastError = null;

  while (retries < maxRetries) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Don't retry on client errors (4xx) except for 429 (too many requests)
      if (error.response && error.response.status < 500 && error.response.status !== 429) {
        throw error;
      }

      retries++;
      if (retries === maxRetries) {
        break;
      }

      // Exponential backoff with jitter
      const backoffTime = Math.min(1000 * Math.pow(2, retries) + Math.random() * 1000, 10000);
      console.log(`Attempt ${retries} failed. Retrying in ${Math.round(backoffTime/1000)}s...`);
      await new Promise(resolve => setTimeout(resolve, backoffTime));
    }
  }

  // If we get here, all retries failed
  console.error(`Failed after ${maxRetries} retries:`, lastError);
  throw lastError;
};

// Add response validation utility
const validateOrderResponse = (data, requestData) => {
  if (!data) {
    throw new Error('Empty response received from server');
  }

  if (!data.order) {
    throw new Error('No order data in server response');
  }

  const { order } = data;

  // Required fields validation
  const requiredFields = ['_id', 'orderNumber', 'totalAmount', 'orderStatus'];
  const missingFields = requiredFields.filter(field => !order[field]);
  
  if (missingFields.length > 0) {
    throw new Error(`Invalid order data: Missing required fields - ${missingFields.join(', ')}`);
  }

  // Validate amount matches
  if (Math.abs(order.totalAmount - requestData.totalAmount) > 0.01) {
    throw new Error('Order amount mismatch between request and response');
  }

  return order;
};

// Add request validation utility
const validateOrderRequest = (requestData) => {
  if (!requestData) {
    throw new Error('Request data is required');
  }

  // Validate products array
  if (!Array.isArray(requestData.products) || requestData.products.length === 0) {
    throw new Error('Order must contain at least one product');
  }

  // Validate each product
  requestData.products.forEach((product, index) => {
    if (!product.product || !product.quantity || !product.price) {
      throw new Error(`Invalid product data at index ${index}`);
    }
    if (product.quantity <= 0) {
      throw new Error(`Invalid quantity for product at index ${index}`);
    }
    if (product.price <= 0) {
      throw new Error(`Invalid price for product at index ${index}`);
    }
  });

  // Validate shipping address
  const requiredAddressFields = ['name', 'email', 'mobileNo', 'address', 'city', 'state', 'pincode'];
  const missingAddressFields = requiredAddressFields.filter(field => !requestData.shippingAddress[field]);
  if (missingAddressFields.length > 0) {
    throw new Error(`Missing required shipping address fields: ${missingAddressFields.join(', ')}`);
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(requestData.shippingAddress.email)) {
    throw new Error('Invalid email format in shipping address');
  }

  // Validate mobile number
  const mobileRegex = /^[0-9]{10}$/;
  if (!mobileRegex.test(requestData.shippingAddress.mobileNo)) {
    throw new Error('Invalid mobile number format in shipping address');
  }

  // Validate pincode
  const pincodeRegex = /^[0-9]{6}$/;
  if (!pincodeRegex.test(requestData.shippingAddress.pincode)) {
    throw new Error('Invalid pincode format in shipping address');
  }

  // Validate payment method
  if (!['cod', 'razorpay'].includes(requestData.paymentMethod)) {
    throw new Error('Invalid payment method');
  }

  // Validate amounts
  if (typeof requestData.totalAmount !== 'number' || requestData.totalAmount <= 0) {
    throw new Error('Invalid total amount');
  }

  return true;
};

// Add request ID generator utility
const generateRequestId = () => `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Add request metadata utility
const getRequestMetadata = () => {
  return {
    timestamp: new Date().toISOString(),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    userAgent: navigator.userAgent,
    language: navigator.language,
    screenResolution: `${window.screen.width}x${window.screen.height}`,
    windowSize: `${window.innerWidth}x${window.innerHeight}`
  };
};

// Add error handling utility
const getErrorMessage = (error) => {
  if (error.response) {
    // Server responded with an error
    const errorData = error.response.data;
    if (typeof errorData === 'string') {
      return errorData;
    }
    return errorData?.message || errorData?.error || 'Server error occurred';
  }

  if (error.request) {
    // Request was made but no response received
    if (error.code === 'ECONNABORTED') {
      return 'Request timed out. Please try again.';
    }
    return 'No response received from server. Please check your internet connection.';
  }

  // Something happened in setting up the request
  return error.message || 'An unexpected error occurred';
};

// Add API request configuration utility
const createApiRequest = (requestData, { token, requestId, metadata }) => {
  const controller = new AbortController();
  const startTime = Date.now();

  return {
    url: '/api/orders',
    method: 'POST',
    data: requestData,
    signal: controller.signal,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Request-ID': requestId,
      'X-Client-Timezone': metadata.timezone,
      'X-Client-Language': metadata.language,
      'X-Client-Platform': 'web',
      'X-Client-Version': process.env.REACT_APP_VERSION || '1.0.0',
      'X-Device-Info': JSON.stringify({
        userAgent: metadata.userAgent,
        screen: metadata.screenResolution,
        window: metadata.windowSize
      })
    },
    timeout: 30000,
    validateStatus: null, // Don't reject any status codes, handle them manually
    transformRequest: [(data) => {
      try {
        console.log('Request payload:', {
          requestId,
          timestamp: new Date().toISOString(),
          data: {
            ...data,
            products: data.products.map(p => ({
              ...p,
              product: p.product.substring(0, 10) + '...'
            }))
          }
        });
        return JSON.stringify(data);
      } catch (error) {
        console.error('Error transforming request:', error);
        throw new Error('Failed to process request data');
      }
    }],
    transformResponse: [(data) => {
      try {
        const parsedData = typeof data === 'string' ? JSON.parse(data) : data;
        console.log('Response payload:', {
          requestId,
          timestamp: new Date().toISOString(),
          duration: `${Date.now() - startTime}ms`,
          data: parsedData
        });
        return parsedData;
      } catch (error) {
        console.error('Error transforming response:', error);
        return data; // Return original data if parsing fails
      }
    }],
    metadata: {
      requestId,
      startTime,
      ...metadata
    }
  };
};

// Add shipping and tax calculation functions
const calculateShippingCost = (country, subtotal) => {
  if (country === 'India') {
    return 50; // Flat ₹50 shipping for India
  } else {
    return 17; // 17 USD flat rate for international shipping
  }
};

const calculateTax = (country, subtotal) => {
  if (country === 'India') {
    return Number((subtotal * 0.18).toFixed(2)); // 18% GST for India
  }
  return 0; // No tax for international orders
};

const formatPrice = (amount, country) => {
  if (country === 'India') {
    return `₹${amount.toFixed(2)}`;
  }
  return `$${amount.toFixed(2)}`;
};

const requestQueue = new Map();
const MAX_CONCURRENT_REQUESTS = 3;

const logRequest = (requestId, type, data) => {
  console.log(`[${requestId}] ${type}:`, {
    timestamp: new Date().toISOString(),
    ...data
  });
};

const addToQueue = async (requestId, requestFn) => {
  // Queue management logic
};

const BuyPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPayment, setShowPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  
  // Get products and total from location state or redirect to cart
  const products = location.state?.products || [];
  const totalAmount = location.state?.totalAmount || 0;

  // Initialize form data with user info if available
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobileNo: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
    paymentMethod: 'cod'
  });

  // Add countries list
  const countries = [
    { code: 'IN', name: 'India' },
    { code: 'US', name: 'United States' },
    { code: 'GB', name: 'United Kingdom' },
    { code: 'CA', name: 'Canada' },
    { code: 'AU', name: 'Australia' },
    { code: 'SG', name: 'Singapore' }
  ];

  // Load user data if logged in
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || ''
      }));
    }
  }, []);

  // Redirect if no products
  useEffect(() => {
    if (!products.length || !totalAmount) {
      navigate('/cart');
    }
  }, [products, totalAmount, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const errors = {};
    
    // Validate shipping address
    if (!formData.name?.trim()) {
      errors.name = 'Name is required';
    } else if (formData.name.length < 2) {
      errors.name = 'Name must be at least 2 characters long';
    }

    if (!formData.email?.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!formData.mobileNo?.trim()) {
      errors.mobileNo = 'Mobile number is required';
    } else if (!/^[0-9]{10}$/.test(formData.mobileNo)) {
      errors.mobileNo = 'Please enter a valid 10-digit mobile number';
    }

    if (!formData.address?.trim()) {
      errors.address = 'Address is required';
    } else if (formData.address.length < 10) {
      errors.address = 'Please enter a complete address';
    }

    if (!formData.city?.trim()) {
      errors.city = 'City is required';
    }

    if (!formData.state?.trim()) {
      errors.state = 'State is required';
    }

    if (!formData.pincode?.trim()) {
      errors.pincode = 'Pincode is required';
    } else if (!/^[0-9]{6}$/.test(formData.pincode)) {
      errors.pincode = 'Please enter a valid 6-digit pincode';
    }

    if (!formData.country?.trim()) {
      errors.country = 'Country is required';
    } else if (!countries.some(c => c.name === formData.country)) {
      errors.country = 'Please select a valid country';
    }

    // Validate cart items
    if (!products || products.length === 0) {
      errors.cart = 'Your cart is empty';
    }

    // Validate payment method
    if (!formData.paymentMethod) {
      errors.payment = 'Please select a payment method';
    }

    setError(Object.keys(errors).length > 0 ? Object.values(errors).join('\n') : null);
    return Object.keys(errors).length === 0;
  };

  const createOrder = async () => {
    try {
      setLoading(true);
      setError('');

      // Check authentication
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Please login to place an order');
      }

      // Validate form before proceeding
      if (!validateForm()) {
        throw new Error('Please fix the errors in the form');
      }

      // Validate cart
      if (!products || products.length === 0) {
        throw new Error('Your cart is empty');
      }

      const isInternational = formData.country !== 'India';
      const currency = isInternational ? 'USD' : 'INR';
      const subtotal = products.reduce((sum, item) => 
        sum + (Number(item.discountedPrice || item.price) * Number(item.quantity || 1)), 0);
      const shippingCost = isInternational ? 17 : 50;
      const tax = isInternational ? 0 : (subtotal * 0.18);
      const finalTotal = subtotal + shippingCost + tax;

      const orderData = {
        products: products.map(item => ({
          product: item._id,
          quantity: Number(item.quantity || 1),
          price: Number(item.discountedPrice || item.price),
          size: item.size || '',
          color: item.color || '',
          name: item.name
        })),
        shippingAddress: {
          name: formData.name.trim(),
          email: formData.email.trim(),
          mobileNo: formData.mobileNo.trim(),
          address: formData.address.trim(),
          city: formData.city.trim(),
          state: formData.state.trim(),
          pincode: formData.pincode.trim(),
          country: formData.country,
          addressType: 'Home'
        },
        billingAddress: {
          sameAsShipping: true,
          name: formData.name.trim(),
          email: formData.email.trim(),
          mobileNo: formData.mobileNo.trim(),
          address: formData.address.trim(),
          city: formData.city.trim(),
          state: formData.state.trim(),
          pincode: formData.pincode.trim(),
          country: formData.country
        },
        paymentMethod: formData.paymentMethod,
        currency: currency,
        subtotal: Number(subtotal.toFixed(2)),
        shippingCost: Number(shippingCost.toFixed(2)),
        tax: Number(tax.toFixed(2)),
        totalAmount: Number(finalTotal.toFixed(2)),
        orderDate: new Date(),
        specialInstructions: '',
        giftWrap: false,
        giftMessage: ''
      };

      // Log the complete order data for debugging
      console.log('Complete order data:', JSON.stringify(orderData, null, 2));

      // First validate stock availability
      console.log('Validating stock...');
      try {
        const stockValidation = await api.post('/api/orders/validate-stock', {
          products: orderData.products.map(item => ({
            id: item.product,
            quantity: item.quantity
          }))
        });

        if (!stockValidation.data.valid) {
          throw new Error(stockValidation.data.message || 'Stock validation failed');
        }
      } catch (error) {
        console.error('Stock validation error:', error);
        throw new Error(error.response?.data?.message || 'Failed to validate product stock');
      }

      // Create the order
      console.log('Creating order...');
      const response = await api.post('/api/orders', orderData);

      if (!response.data || !response.data.order) {
        console.error('Invalid server response:', response.data);
        throw new Error('Invalid response from server');
      }

      const order = response.data.order;
      console.log('Order created successfully:', order);

      // Clear cart after successful order
      try {
        await api.delete('/api/cart/clear');
        localStorage.removeItem('cart');
        console.log('Cart cleared successfully');
      } catch (clearError) {
        console.error('Failed to clear cart:', clearError);
        // Don't throw error here as order was successful
      }

      // Navigate to order confirmation
      navigate('/order-confirmation/' + order.orderNumber);
    } catch (error) {
      console.error('Order creation failed:', error);
      
      if (!navigator.onLine) {
        setError('Please check your internet connection and try again.');
        return;
      }

      if (error.response?.status === 400) {
        setError(error.response?.data?.message || 'Invalid order data. Please check your information and try again.');
      } else if (error.response?.status === 401) {
        setError('Your session has expired. Please login again.');
        navigate('/login', { state: { from: location } });
      } else if (error.response?.status === 429) {
        setError('Too many requests. Please wait a moment and try again.');
      } else if (error.response?.status >= 500) {
        setError('Server error. Please try again later.');
      } else {
        setError(error.message || 'Failed to create order. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    // Validate form before showing payment
    if (!validateForm()) return;
    setShowPayment(true);
  };

  const handleFakePayment = async () => {
    setLoading(true);
    setError('');
    try {
      await createOrder();
      setPaymentSuccess(true);
    } catch (error) {
      setError(error.message || 'Failed to place order');
    } finally {
      setLoading(false);
      setShowPayment(false);
    }
  };

  if (!products.length) {
    return (
      <Container className="py-5">
        <Alert variant="warning">
          No products found. Please add items to your cart first.
          <Button variant="link" onClick={() => navigate('/cart')}>
            Go to Cart
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <Row>
        <Col md={8}>
          <Card className="mb-4">
            <Card.Body>
              <Card.Title className="mb-4">Shipping Details</Card.Title>
              {error && <Alert variant="danger">{error}</Alert>}
              
              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Full Name*</Form.Label>
                      <Form.Control
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
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
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Mobile Number*</Form.Label>
                  <Form.Control
                    type="tel"
                    name="mobileNo"
                    value={formData.mobileNo}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Address*</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter your complete address"
                  />
                </Form.Group>

                <Row>
                  <Col md={3}>
                    <Form.Group className="mb-3">
                      <Form.Label>City*</Form.Label>
                      <Form.Control
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group className="mb-3">
                      <Form.Label>State*</Form.Label>
                      <Form.Control
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group className="mb-3">
                      <Form.Label>Pincode*</Form.Label>
                      <Form.Control
                        type="text"
                        name="pincode"
                        value={formData.pincode}
                        onChange={handleInputChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group className="mb-3">
                      <Form.Label>Country*</Form.Label>
                      <Form.Select
                        name="country"
                        value={formData.country}
                        onChange={handleInputChange}
                        required
                      >
                        {countries.map(country => (
                          <option key={country.code} value={country.name}>
                            {country.name}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-4">
                  <Form.Label>Payment Method*</Form.Label>
                  <div>
                    <Form.Check
                      type="radio"
                      label="Cash on Delivery"
                      name="paymentMethod"
                      value="cod"
                      checked={formData.paymentMethod === 'cod'}
                      onChange={handleInputChange}
                      className="mb-2"
                    />
                    <Form.Check
                      type="radio"
                      label="Pay Online (Razorpay)"
                      name="paymentMethod"
                      value="razorpay"
                      checked={formData.paymentMethod === 'razorpay'}
                      onChange={handleInputChange}
                    />
                  </div>
                </Form.Group>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-100"
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
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card>
            <Card.Body>
              <Card.Title className="mb-4">Order Summary</Card.Title>
              {products.map((item, index) => (
                <div key={item._id} className={index > 0 ? 'mt-3 pt-3 border-top' : ''}>
                  <div className="d-flex justify-content-between">
                    <div>
                      <h6 className="mb-1">{item.name}</h6>
                      <small className="text-muted">
                        Quantity: {item.quantity}
                        {item.size && ` | Size: ${item.size}`}
                        {item.color && ` | Color: ${item.color}`}
                      </small>
                    </div>
                    <div className="text-end">
                      <strong>{formatPrice((item.discountedPrice || item.price) * item.quantity, formData.country)}</strong>
                    </div>
                  </div>
                </div>
              ))}

              <hr />

              <div className="d-flex justify-content-between mb-2">
                <span>Subtotal:</span>
                <strong>{formatPrice(totalAmount, formData.country)}</strong>
              </div>

              <div className="d-flex justify-content-between mb-2">
                <span>Shipping:</span>
                <strong>{formatPrice(calculateShippingCost(formData.country, totalAmount), formData.country)}</strong>
                {formData.country === 'India' && (
                  <small className="text-muted ms-2">(Flat rate: ₹50)</small>
                )}
              </div>

              {formData.country === 'India' && (
                <div className="d-flex justify-content-between mb-2">
                  <span>Tax (18% GST):</span>
                  <strong>{formatPrice(calculateTax(formData.country, totalAmount), formData.country)}</strong>
                </div>
              )}

              <hr />

              <div className="d-flex justify-content-between">
                <h5>Total:</h5>
                <h5>
                  {formatPrice(
                    totalAmount + 
                    calculateShippingCost(formData.country, totalAmount) + 
                    calculateTax(formData.country, totalAmount),
                    formData.country
                  )}
                </h5>
              </div>

              {formData.country !== 'India' && (
                <small className="text-muted mt-2 d-block">
                  International orders are exempt from tax. Flat rate shipping of $17 applies.
                </small>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Modal show={showPayment} onHide={() => setShowPayment(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Fake Payment</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          <p className="mb-4">This is a demo payment step. Click below to simulate payment success.</p>
          <Button
            variant="success"
            size="lg"
            className="w-100"
            onClick={handleFakePayment}
            disabled={loading}
          >
            {loading ? 'Processing Payment...' : 'Pay Now'}
          </Button>
        </Modal.Body>
      </Modal>
      {paymentSuccess && (
        <Alert variant="success" className="mt-4 text-center">
          Payment received! Your order will be confirmed after admin verification.
        </Alert>
      )}
    </Container>
  );
};

export default BuyPage; 