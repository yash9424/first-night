import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Link } from 'react-router-dom';
import { FaFacebookF, FaInstagram, FaYoutube } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { NavDropdown } from "react-bootstrap";
import axios from 'axios';
import { formatPrice, formatDiscountedPrice, getUserCurrency } from './utils/formatters';

const Causel = () => {
  const [userCountry, setUserCountry] = useState(localStorage.getItem('userCountry') || 'India');
  const [currency, setCurrency] = useState(getUserCurrency());
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const country = localStorage.getItem('userCountry');
    if (country) {
      setUserCountry(country);
      setCurrency(country === 'India' ? 'INR' : 'USD');
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/products');
      setProducts(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch products');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handler functions for demonstration
  const handleAddToCart = (productName) => {
    alert(`Added to cart: ${productName}`);
  };
  const handleBuyNow = (productName) => {
    alert(`Buy now: ${productName}`);
  };

  if (loading) {
    return <div className="text-center mt-5">Loading products...</div>;
  }

  if (error) {
    return <div className="text-center mt-5 text-danger">{error}</div>;
  }

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center flex-wrap mb-4">
        <h2 className="mb-3">Casual Wear Jewellery</h2>
        <img 
          src="https://brantashop.com/cdn/shop/collections/42_1.jpg?v=1701153103&width=750" 
          alt="Bracelet Banner" 
          className="img-fluid rounded" 
          style={{ width: '726px',maxHeight: '235px', objectFit: 'cover' }} 
        />
      </div>

      {/* Filters and Sort */}
      <div className="d-flex justify-content-between align-items-center flex-wrap mb-4">
        <div className="d-flex flex-wrap gap-2">
          <div className="dropdown">
            <button className="btn btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown">
              Availability
            </button>
            <ul className="dropdown-menu">
              <li><a className="dropdown-item" href="#">In stock</a></li>
              <li><a className="dropdown-item" href="#">Out of stock</a></li>
            </ul>
          </div>

          <div className="dropdown">
            <button className="btn btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown">
              Price
            </button>
            <ul className="dropdown-menu">
              <li><a className="dropdown-item" href="#">Low to High</a></li>
              <li><a className="dropdown-item" href="#">High to Low</a></li>
            </ul>
          </div>

          <div className="dropdown">
            <button className="btn btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown">
              Product type
            </button>
            <ul className="dropdown-menu">
              <li><a className="dropdown-item" href="#">Bracelet</a></li>
            </ul>
          </div>

          <div className="dropdown">
            <button className="btn btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown">
              More filters
            </button>
            <ul className="dropdown-menu">
              <li><a className="dropdown-item" href="#">Gold</a></li>
              <li><a className="dropdown-item" href="#">Steel</a></li>
            </ul>
          </div>
        </div>

        <div className="d-flex align-items-center gap-2">
          <span className="me-1">Sort by:</span>
          <select className="form-select w-auto">
            <option>Featured</option>
            <option>Price: Low to High</option>
            <option>Price: High to Low</option>
          </select>
          <span className="ms-3 text-muted">64 products</span>
        </div>
      </div>

      {/* Product Cards */}
      <div className="row">
        {products.map(product => (
          <div key={product._id} className="col-md-3 mb-4">
            <div className="position-relative">
              {(product.discountPercentageINR > 0 || product.discountPercentageUSD > 0) && (
                <span className="badge bg-danger position-absolute top-0 start-0 m-2">
                  {currency === 'INR' ? product.discountPercentageINR : product.discountPercentageUSD}% OFF
                </span>
              )}
              <div className="position-relative hover-img-wrapper">
                <img src={product.mainImage} className="img-fluid rounded default-img" alt={product.name} />
                {product.hoverImage && (
                  <img src={product.hoverImage} className="img-fluid rounded hover-img" alt={`${product.name} Hover`} />
                )}
              </div>
            </div>
            <div className="mt-2">
              <strong>{formatPrice(product.priceINR, product.priceUSD, currency)}</strong>
              {(product.discountPercentageINR > 0 || product.discountPercentageUSD > 0) && (
                <span className="text-muted text-decoration-line-through ms-2">
                  {formatDiscountedPrice(product.discountedPriceINR, product.discountedPriceUSD, currency)}
                </span>
              )}
              <p className="mb-0">{product.name}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Causel;
