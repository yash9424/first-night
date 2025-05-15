import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";
import { FaImage } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import { Button, Alert, Spinner } from "react-bootstrap";

const Manglsutra = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [filters, setFilters] = useState({
    availability: 'all',
    priceSort: 'none'
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [error, setError] = useState('');

  // Handler functions for demonstration
  const handleAddToCart = (product) => {
    // Add to cart in localStorage (guest cart)
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    // Check if product already in cart
    const existing = cart.find(item => item._id === product._id);
    if (existing) {
      existing.quantity = (existing.quantity || 1) + 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    navigate('/cart');
  };
  
  const handleBuyNow = (product) => {
    // Navigate to buy page with single product
    navigate('/buy', { 
      state: { 
        products: [{ ...product, quantity: 1 }],
        totalAmount: product.discountedPriceINR || product.discountedPrice || product.priceINR || product.price
      } 
    });
  };

  useEffect(() => {
    setLoading(true);
    // Fetch products from server
    axios.get("http://localhost:5000/api/products") // Update URL if your server is hosted elsewhere
      .then(res => {
        console.log("All products:", res.data);
        
        // Filter for 'manglsutra' category - exact category name from AdminProducts.js
        const mangalsutraProducts = res.data.filter(p => p.category === 'manglsutra');
        
        // Normalize price fields for consistent UI display
        const normalizedProducts = mangalsutraProducts.map(product => {
          return {
            ...product,
            // Ensure price field exists for component usage
            price: product.priceINR || product.price || 0,
            discountedPrice: product.discountedPriceINR || product.discountedPrice,
            discountPercentage: product.discountPercentageINR || product.discountPercentage || 0
          };
        });
        
        console.log("Filtered mangalsutra products:", normalizedProducts);
        setProducts(normalizedProducts);
        setFilteredProducts(normalizedProducts);
        setError('');
      })
      .catch(err => {
        console.error("Error fetching products:", err);
        console.log("Response data:", err.response?.data);
        setError("Failed to load products. Please try again later.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Apply filters
  useEffect(() => {
    let result = [...products];

    // Availability filter based on stock value
    if (filters.availability === 'in-stock') {
      result = result.filter(product => product.stock > 0);
    } else if (filters.availability === 'out-of-stock') {
      result = result.filter(product => product.stock === 0);
    }

    // Price sorting
    if (filters.priceSort === 'low-to-high') {
      result.sort((a, b) => (a.discountedPrice || a.price) - (b.discountedPrice || b.price));
    } else if (filters.priceSort === 'high-to-low') {
      result.sort((a, b) => (b.discountedPrice || b.price) - (a.discountedPrice || a.price));
    }

    setFilteredProducts(result);
  }, [filters, products]);

  // Filter handlers
  const handleAvailabilityFilter = (value) => {
    setFilters(prev => ({ ...prev, availability: value }));
  };

  const handlePriceSort = (value) => {
    setFilters(prev => ({ ...prev, priceSort: value }));
  };

  return (
    <div className="container mt-5">
      {/* Top Banner and Title */}
      <div className="d-flex justify-content-between align-items-center flex-wrap mb-4">
        <h2 className="mb-3">Mangalsutra</h2>
        <img 
          src="https://brantashop.com/cdn/shop/collections/Men.png?v=1722530043" 
          alt="Mangalsutra Banner" 
          className="img-fluid rounded" 
          style={{ width: '726px', maxHeight: '235px', objectFit: 'cover' }} 
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "https://via.placeholder.com/726x235?text=Mangalsutra+Banner";
          }}
        />
      </div>

      {/* Error Message */}
      {error && (
        <Alert variant="danger" className="mb-4">
          {error}
        </Alert>
      )}

      {/* Loading Indicator */}
      {loading && (
        <div className="text-center my-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Loading products...</p>
        </div>
      )}

      {/* Simplified Filters and Sort */}
      <div className="d-flex justify-content-between align-items-center flex-wrap mb-4">
        <div className="d-flex flex-wrap gap-2">
          <div className="dropdown">
            <button className="btn btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown">
              Availability
            </button>
            <ul className="dropdown-menu">
              <li><button className="dropdown-item" onClick={() => handleAvailabilityFilter('all')}>All</button></li>
              <li><button className="dropdown-item" onClick={() => handleAvailabilityFilter('in-stock')}>In stock</button></li>
              <li><button className="dropdown-item" onClick={() => handleAvailabilityFilter('out-of-stock')}>Out of stock</button></li>
            </ul>
          </div>
        </div>

        <div className="d-flex align-items-center gap-2">
          <span className="me-1">Sort by:</span>
          <select 
            className="form-select w-auto"
            onChange={(e) => handlePriceSort(e.target.value)}
            value={filters.priceSort}
          >
            <option value="none">Featured</option>
            <option value="low-to-high">Price: Low to High</option>
            <option value="high-to-low">Price: High to Low</option>
          </select>
          <span className="ms-3 text-muted">{filteredProducts.length} products</span>
        </div>
      </div>

      {/* No Products Message */}
      {!loading && filteredProducts.length === 0 && (
        <div className="text-center my-5">
          <Alert variant="info">
            No mangalsutra found. Please check back later or try different filters.
          </Alert>
        </div>
      )}

      {/* Dynamic Product Cards */}
      <div className="row">
        {filteredProducts.map(product => (
          <div className="col-md-3 mb-4" key={product._id}>
            <div className="position-relative">
              {product.discountPercentage > 0 && (
                <span className="badge bg-danger position-absolute top-0 start-0 m-2">
                  {product.discountPercentage}% OFF
                </span>
              )}
              <div className="position-relative hover-img-wrapper">
                {product.mainImage ? (
                  <img
                    src={`http://localhost:5000${product.mainImage}`}
                    alt={product.name}
                    className="img-fluid rounded"
                    style={{ width: '100%', height: '220px', objectFit: 'cover' }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://via.placeholder.com/220x220?text=Image+Not+Found";
                    }}
                  />
                ) : (
                  <div className="d-flex align-items-center justify-content-center bg-light" style={{ width: '100%', height: '220px' }}>
                    <FaImage size={48} className="text-muted" />
                  </div>
                )}
                {product.hoverImage && (
                  <img 
                    src={`http://localhost:5000${product.hoverImage}`}
                    className="img-fluid rounded hover-img" 
                    alt={`${product.name} Hover`}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.style.display = 'none';
                    }}
                  />
                )}
              </div>
              <span className={`badge ${product.stock > 0 ? 'bg-success' : 'bg-danger'} position-absolute top-0 end-0 m-2`}>
                {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
              </span>
            </div>
            <div className="mt-2">
              {product.discountedPrice ? (
                <>
                  <strong className="text-success">₹{product.discountedPrice}</strong>
                  <span className="text-muted text-decoration-line-through ms-2">
                    ₹{product.price}
                  </span>
                </>
              ) : (
                <strong>₹{product.price}</strong>
              )}
              <p className="mb-0">{product.name}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Manglsutra;