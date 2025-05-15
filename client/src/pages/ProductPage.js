import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Container, Row, Col, Button, Image, Alert } from 'react-bootstrap';
import { useCart } from '../Cartcontext';

const ProductPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [mainImage, setMainImage] = useState(null);
  const [cartError, setCartError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/products/${id}`);
        setProduct(response.data);
        // Set main image to mainImage, image, or first in images array
        const img = response.data.mainImage || response.data.image || (response.data.images && response.data.images[0]) || response.data.hoverImage;
        setMainImage(img);
        setLoading(false);
      } catch (err) {
        setError('Failed to load product details');
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) return <div className="text-center mt-5">Loading...</div>;
  if (error) return <div className="text-center mt-5 text-danger">{error}</div>;
  if (!product) return <div className="text-center mt-5">Product not found</div>;

  // Helper to get correct image URL
  const getImageUrl = (img) => {
    if (!img) return 'https://via.placeholder.com/400x400?text=No+Image';
    return img.startsWith('http') ? img : `http://localhost:5000${img}`;
  };

  // Collect all images for the gallery
  const galleryImages = [
    product.mainImage,
    product.image,
    ...(product.images || []),
    product.hoverImage
  ].filter(Boolean).map(getImageUrl);

  const handleAddToCart = async () => {
    try {
      setCartError(null);
      await addToCart(product);
      navigate('/cart');
    } catch (err) {
      if (err.response?.status === 401) {
        // User is not authenticated
        navigate('/login', { state: { from: `/product/${id}` } });
      } else {
        setCartError(err.response?.data?.message || 'Failed to add item to cart');
      }
    }
  };

  const handleBuyNow = async () => {
    try {
      setCartError(null);
      await addToCart(product);
      navigate('/buy', { 
        state: { 
          products: [{ ...product, quantity: 1 }], 
          totalAmount: product.price || product.priceINR || product.discountedPrice || product.discountedPriceINR 
        } 
      });
    } catch (err) {
      if (err.response?.status === 401) {
        // User is not authenticated
        navigate('/login', { state: { from: `/product/${id}` } });
      } else {
        setCartError(err.response?.data?.message || 'Failed to add item to cart');
      }
    }
  };

  return (
    <Container className="py-5">
      {cartError && (
        <Alert variant="danger" onClose={() => setCartError(null)} dismissible className="mb-4">
          {cartError}
        </Alert>
      )}
      <Row>
        <Col md={6}>
          <div className="mb-3">
            <Image src={galleryImages[galleryImages.indexOf(mainImage) !== -1 ? galleryImages.indexOf(mainImage) : 0] || galleryImages[0]} alt={product.name} fluid style={{ maxHeight: 400, objectFit: 'contain', width: '100%' }} />
          </div>
          {galleryImages.length > 1 && (
            <div style={{ display: 'flex', overflowX: 'auto', gap: 10 }}>
              {galleryImages.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`thumb-${idx}`}
                  style={{ height: 70, width: 70, objectFit: 'cover', border: mainImage === img ? '2px solid #007bff' : '1px solid #ccc', borderRadius: 6, cursor: 'pointer' }}
                  onClick={() => setMainImage(img)}
                />
              ))}
            </div>
          )}
        </Col>
        <Col md={6}>
          <h2>{product.name}</h2>
          <div className="price-section my-3">
            <h3 className="text-primary">₹{product.price || product.priceINR || product.discountedPrice || product.discountedPriceINR || 'N/A'}</h3>
            {product.originalPrice && (
              <span className="text-muted text-decoration-line-through ms-2">
                ₹{product.originalPrice}
              </span>
            )}
            {product.discount && (
              <span className="text-success ms-2">({product.discount}% OFF)</span>
            )}
          </div>
          <p className="description">{product.description}</p>
          <div className="d-flex gap-2 mt-4">
            <Button
              variant="outline-dark"
              className="flex-grow-1"
              onClick={handleAddToCart}
              disabled={product.stock === 0}
            >
              Add to Cart
            </Button>
            <Button
              variant="dark"
              className="flex-grow-1"
              onClick={handleBuyNow}
              disabled={product.stock === 0}
            >
              Buy Now
            </Button>
          </div>
          {product.stock === 0 && (
            <div className="text-danger mt-2">
              This product is currently out of stock
            </div>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default ProductPage; 