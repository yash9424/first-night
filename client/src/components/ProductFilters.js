import React, { useState, useEffect } from 'react';
import { Form, Dropdown, Row, Col } from 'react-bootstrap';
import './ProductFilters.css';

const ProductFilters = ({ onFilterChange, onSortChange }) => {
  const [filters, setFilters] = useState({
    availability: 'all',
    priceRange: 'all',
    productType: 'all',
  });

  const [sortBy, setSortBy] = useState('price-low-high');

  const handleFilterChange = (filterType, value) => {
    const newFilters = { ...filters, [filterType]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleSortChange = (value) => {
    setSortBy(value);
    onSortChange(value);
  };

  return (
    <div className="filters-container mb-4">
      <Row className="g-3">
        <Col md={3}>
          <Form.Group>
            <Form.Label>Availability</Form.Label>
            <Form.Select
              value={filters.availability}
              onChange={(e) => handleFilterChange('availability', e.target.value)}
            >
              <option value="all">All Items</option>
              <option value="in-stock">In Stock</option>
              <option value="out-of-stock">Out of Stock</option>
            </Form.Select>
          </Form.Group>
        </Col>

        <Col md={3}>
          <Form.Group>
            <Form.Label>Price Range</Form.Label>
            <Form.Select
              value={filters.priceRange}
              onChange={(e) => handleFilterChange('priceRange', e.target.value)}
            >
              <option value="all">All Prices</option>
              <option value="0-1000">Under ₹1,000</option>
              <option value="1000-5000">₹1,000 - ₹5,000</option>
              <option value="5000-10000">₹5,000 - ₹10,000</option>
              <option value="10000+">Above ₹10,000</option>
            </Form.Select>
          </Form.Group>
        </Col>

        <Col md={3}>
          <Form.Group>
            <Form.Label>Product Type</Form.Label>
            <Form.Select
              value={filters.productType}
              onChange={(e) => handleFilterChange('productType', e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="bracelet">Bracelets</option>
              <option value="necklace">Necklaces</option>
              <option value="earring">Earrings</option>
              <option value="ring">Rings</option>
            </Form.Select>
          </Form.Group>
        </Col>

        <Col md={3}>
          <Form.Group>
            <Form.Label>Sort By</Form.Label>
            <Form.Select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
            >
              <option value="price-low-high">Price: Low to High</option>
              <option value="price-high-low">Price: High to Low</option>
              <option value="newest">Newest First</option>
              <option value="popularity">Popularity</option>
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>

      <Row className="mt-3">
        <Col>
          <Dropdown>
            <Dropdown.Toggle variant="outline-secondary" id="more-filters">
              More Filters
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item>Material</Dropdown.Item>
              <Dropdown.Item>Style</Dropdown.Item>
              <Dropdown.Item>Occasion</Dropdown.Item>
              <Dropdown.Item>Collection</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </Col>
      </Row>
    </div>
  );
};

export default ProductFilters; 