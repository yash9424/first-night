import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';

const SearchResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [emptySearch, setEmptySearch] = useState(false);

  // Get search query from URL parameters
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const query = params.get('q') || '';
    setSearchQuery(query);
    if (query) {
      searchProducts(query);
    } else {
      setProducts([]); // Clear products if no search query
    }
  }, [location.search]);

  const searchProducts = async (query) => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`http://localhost:5000/api/products/search?q=${encodeURIComponent(query)}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch products');
      }

      // Filter products based on search query
      const filteredProducts = data.filter(product => {
        const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 0);
        
        // Search in multiple fields
        const searchableFields = [
          product.name,
          product.category,
          product.description,
          product.tags,
          product.brand
        ].filter(Boolean).map(field => field.toLowerCase());

        // Check if all search terms are found in any of the searchable fields
        return searchTerms.every(term => 
          searchableFields.some(field => field.includes(term))
        );
      });

      setProducts(filteredProducts);
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setEmptySearch(true);
      return;
    }
    setEmptySearch(false);
    navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  const getImageUrl = (product) => {
    const base = "http://localhost:5000";
    const img =
      product.imageUrl ||
      product.img ||
      product.imgs ||
      product.mainImage ||
      (product.images && product.images[0]);
    if (!img) return 'https://via.placeholder.com/200x200?text=No+Image';
    return img.startsWith('http') ? img : base + img;
  };

  return (
    <Container className="py-5">
      <h2 className="text-center mb-4">Search Products</h2>

      <Row className="justify-content-center mb-4">
        <Col md={6}>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="d-flex">
              <Form.Control
                type="text"
                placeholder="Search for products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
              <Button variant="primary" type="submit" className="ms-2">
                Search
              </Button>
            </Form.Group>
            {emptySearch && (
              <div className="text-danger small mt-2">Please enter a search term.</div>
            )}
          </Form>
        </Col>
      </Row>

      {loading && (
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}

      {error && (
        <div className="alert alert-danger text-center">
          {error}
        </div>
      )}

      {!loading && !error && products.length === 0 && searchQuery && (
        <div className="text-center">
          <p>No products found matching "{searchQuery}"</p>
          <p className="text-muted">Try different keywords or check your spelling</p>
        </div>
      )}

      {!loading && !error && !searchQuery && (
        <div className="text-center">
          <p>Enter a search term to find products</p>
        </div>
      )}

      <Row>
        {products.map((product) => (
          <Col key={product._id} xs={12} sm={6} md={4} lg={3} className="mb-4">
            <Card className="h-100">
              <Card.Img
                variant="top"
                src={getImageUrl(product)}
                alt={product.name || product.titles || product.titlesr || 'Product Image'}
                style={{ height: '200px', objectFit: 'cover' }}
              />
              <Card.Body className="d-flex flex-column">
                <Card.Title>{product.name}</Card.Title>
                <Card.Text className="text-muted mb-2">
                  {product.category}
                </Card.Text>
                <Card.Text className="mb-2">
                  ₹
                  {product.price ||
                   product.priceINR ||
                   product.prices ||
                   product.discountedPrice ||
                   product.discountedPriceINR ||
                   product.pricesr ||
                   'N/A'}
                </Card.Text>
                <Button
                  variant="primary"
                  className="mt-auto"
                  onClick={() => navigate(`/product/${product._id}`)}
                >
                  View Details
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default SearchResults; 