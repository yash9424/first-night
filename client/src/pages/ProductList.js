import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form } from 'react-bootstrap';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import '../styles/ProductCard.css';
import ProductSearch from '../components/ProductSearch';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async (searchParams = {}) => {
    setLoading(true);
    try {
      let url = 'http://localhost:5000/api/products';
      if (Object.keys(searchParams).length > 0) {
        const queryString = new URLSearchParams(searchParams).toString();
        url += `/search?${queryString}`;
      }
      const response = await axios.get(url);
      setProducts(response.data);
      setError(null);
    } catch (err) {
      setError('Error fetching products: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (searchParams) => {
    fetchProducts(searchParams);
  };

  const sortedProducts = [...products].sort((a, b) => {
    switch (sortBy) {
      case 'price-low-high':
        return (a.discountedPrice || a.price) - (b.discountedPrice || b.price);
      case 'price-high-low':
        return (b.discountedPrice || b.price) - (a.discountedPrice || a.price);
      case 'name-a-z':
        return a.name.localeCompare(b.name);
      case 'name-z-a':
        return b.name.localeCompare(a.name);
      default:
        return 0;
    }
  });

  if (loading) {
    return (
      <Container className="py-4">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-4">
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <h1 className="mb-4">Our Products</h1>
      
      <ProductSearch onSearch={handleSearch} />

      {/* Sort Options */}
      <Row className="mb-4">
        <Col md={4} className="ms-auto">
          <Form.Select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="">Sort By</option>
            <option value="price-low-high">Price: Low to High</option>
            <option value="price-high-low">Price: High to Low</option>
            <option value="name-a-z">Name: A to Z</option>
            <option value="name-z-a">Name: Z to A</option>
          </Form.Select>
        </Col>
      </Row>

      {/* Products Grid */}
      <Row xs={1} sm={2} md={3} lg={4} className="g-4">
        {sortedProducts.map(product => (
          <Col key={product._id}>
            <ProductCard product={product} />
          </Col>
        ))}
        {sortedProducts.length === 0 && (
          <Col xs={12}>
            <div className="text-center py-5">
              <h3>No products found</h3>
              <p className="text-muted">Try adjusting your search or filter criteria</p>
            </div>
          </Col>
        )}
      </Row>
    </Container>
  );
};

export default ProductList; 