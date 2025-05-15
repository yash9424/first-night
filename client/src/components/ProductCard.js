import React, { useState } from 'react';
import { Card, Button, Badge, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FaShoppingCart, FaBolt } from 'react-icons/fa';
import axios from 'axios';
import { formatPrice, formatDiscountedPrice, getUserCurrency } from '../utils/formatters';

const ProductCard = ({ product }) => {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const currency = getUserCurrency();

  const handleAddToCart = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      await axios.post(
        'http://localhost:5000/api/cart/add',
        {
          productId: product._id,
          quantity: 1
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setShowModal(true);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Error adding to cart');
    } finally {
      setLoading(false);
    }
  };

  const handleBuyNow = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      // First add to cart
      await axios.post(
        'http://localhost:5000/api/cart/add',
        {
          productId: product._id,
          quantity: 1
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // Then navigate to checkout
      navigate('/checkout');
    } catch (err) {
      setError(err.response?.data?.message || 'Error processing purchase');
    } finally {
      setLoading(false);
    }
  };

  const handleContinueShopping = () => {
    setShowModal(false);
  };

  const handleGoToCart = () => {
    navigate('/cart');
  };

  const validateRequestPayload = (payload) => {
    // Validate payload structure
    // Validate email format
    // Validate timestamp
    // Validate request type
    // Validate client info
  };

  const validateResponse = (response) => {
    // Validate response structure
    // Validate success flag
    // Validate error messages
  };

  const compressRequest = async (data) => {
    // Compress request data using gzip
    // Fallback to uncompressed if not supported
  };

  const decompressResponse = async (data) => {
    // Decompress response data
    // Handle different response formats
  };

  const handleRequest = async (payload, controller) => {
    // Validate request
    // Compress data
    // Add headers
    // Make request
    // Handle response
    // Handle errors
  };

  // Rate limiting
  if (error && error.response?.status === 429) {
    const retryAfter = error.response.headers['retry-after'] || 60;
    await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
  }

  // Timeout handling
  if (error && error.code === 'ECONNABORTED') {
    throw new Error('Request timed out. Please try again.');
  }

  // Network status
  if (!navigator.onLine) {
    throw new Error('No internet connection. Please check your network.');
  }

  const handleForgotPassword = async () => {
    setForgotLoading(true);
    setForgotError('');
    try {
      await axios.post('http://localhost:5000/api/auth/forgotpassword', { email: forgotEmail });
      setForgotMsg('Password reset link has been sent to your email.');
      setTimeout(() => setShowForgot(false), 3000);
    } catch (err) {
      if (err.response?.status === 429) {
        const retryAfter = err.response.headers['retry-after'] || 60;
        setForgotError(`Too many requests. Please try again in ${retryAfter} seconds.`);
        await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
      } else {
        setForgotError(err.response?.data?.message || 'Failed to send reset link.');
      }
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <>
      <Card className="h-100 product-card">
        <div className="product-image-container">
          <Card.Img
            variant="top"
            src={product.mainImage ? `http://localhost:5000${product.mainImage}` : 'https://via.placeholder.com/300x300?text=No+Image'}
            className="product-image main"
            alt={product.name}
            onError={(e) => {
              console.error('Error loading main image:', product.mainImage);
              e.target.onerror = null;
              e.target.src = 'https://via.placeholder.com/300x300?text=No+Image';
            }}
            onLoad={() => console.log('Main image loaded successfully:', product.mainImage)}
          />
          {product.hoverImage && (
            <Card.Img
              variant="top"
              src={`http://localhost:5000${product.hoverImage}`}
              className="product-image hover"
              alt={`${product.name} hover`}
              onError={(e) => {
                console.error('Error loading hover image:', product.hoverImage);
                e.target.onerror = null;
                e.target.src = 'https://via.placeholder.com/300x300?text=No+Hover+Image';
              }}
              onLoad={() => console.log('Hover image loaded successfully:', product.hoverImage)}
            />
          )}
          {/* Debug info */}
          <div style={{ display: 'none' }}>
            <p>Main Image Path: {product.mainImage}</p>
            <p>Hover Image Path: {product.hoverImage}</p>
          </div>
          {product.discountPercentage > 0 && (
            <Badge 
              bg="danger" 
              className="position-absolute top-0 start-0 m-2 z-1"
            >
              {product.discountPercentage}% OFF
            </Badge>
          )}
        </div>
        <Card.Body className="d-flex flex-column">
          <Card.Title className="text-truncate">{product.name}</Card.Title>
          <div className="mb-2">
            <span className="h5 me-2">
              {formatPrice(product.priceINR, product.priceUSD, currency)}
            </span>
            {(product.discountPercentageINR > 0 || product.discountPercentageUSD > 0) && (
              <small className="text-muted text-decoration-line-through">
                {formatDiscountedPrice(product.discountedPriceINR, product.discountedPriceUSD, currency)}
              </small>
            )}
          </div>
          <Card.Text className="text-muted mb-3 flex-grow-1">
            {product.description}
          </Card.Text>
          {error && (
            <div className="text-danger mt-2 small">
              {error}
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Added to Cart Modal */}
      <Modal show={showModal} onHide={handleContinueShopping} centered>
        <Modal.Header closeButton>
          <Modal.Title>Added to Cart!</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>The item has been successfully added to your cart.</p>
          <div className="d-flex justify-content-between">
            <Button variant="outline-primary" onClick={handleContinueShopping}>
              Continue Shopping
            </Button>
            <Button variant="primary" onClick={handleGoToCart}>
              Go to Cart
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default ProductCard; 