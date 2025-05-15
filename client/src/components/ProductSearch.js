import React, { useState } from 'react';
import { Form, Row, Col, Button } from 'react-bootstrap';
import axios from 'axios';

const ProductSearch = ({ onSearch }) => {
    const [searchParams, setSearchParams] = useState({
        query: '',
        category: '',
        minPrice: '',
        maxPrice: ''
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setSearchParams(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Filter out empty values
        const params = Object.fromEntries(
            Object.entries(searchParams).filter(([_, value]) => value !== '')
        );
        onSearch(params);
    };

    const handleReset = () => {
        setSearchParams({
            query: '',
            category: '',
            minPrice: '',
            maxPrice: ''
        });
        onSearch({});
    };

    const handleLogin = async (credentials) => {
        try {
            const response = await axios.post('/api/users/login', credentials);
            localStorage.setItem('token', response.data.token);
            // ... rest of login logic
        } catch (error) {
            // ... error handling
        }
    };

    return (
        <Form onSubmit={handleSubmit} className="mb-4 p-3 bg-light rounded">
            <Row className="g-3">
                <Col md={6} lg={3}>
                    <Form.Group>
                        <Form.Label>Search</Form.Label>
                        <Form.Control
                            type="text"
                            name="query"
                            value={searchParams.query}
                            onChange={handleInputChange}
                            placeholder="Search products..."
                        />
                    </Form.Group>
                </Col>
                <Col md={6} lg={3}>
                    <Form.Group>
                        <Form.Label>Category</Form.Label>
                        <Form.Control
                            type="text"
                            name="category"
                            value={searchParams.category}
                            onChange={handleInputChange}
                            placeholder="Enter category"
                        />
                    </Form.Group>
                </Col>
                <Col md={6} lg={2}>
                    <Form.Group>
                        <Form.Label>Min Price</Form.Label>
                        <Form.Control
                            type="number"
                            name="minPrice"
                            value={searchParams.minPrice}
                            onChange={handleInputChange}
                            placeholder="Min price"
                            min="0"
                        />
                    </Form.Group>
                </Col>
                <Col md={6} lg={2}>
                    <Form.Group>
                        <Form.Label>Max Price</Form.Label>
                        <Form.Control
                            type="number"
                            name="maxPrice"
                            value={searchParams.maxPrice}
                            onChange={handleInputChange}
                            placeholder="Max price"
                            min="0"
                        />
                    </Form.Group>
                </Col>
                <Col lg={2} className="d-flex align-items-end">
                    <div className="d-flex gap-2">
                        <Button type="submit" variant="primary">
                            Search
                        </Button>
                        <Button type="button" variant="secondary" onClick={handleReset}>
                            Reset
                        </Button>
                    </div>
                </Col>
            </Row>
        </Form>
    );
};

export default ProductSearch; 