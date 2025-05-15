import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import { Navbar, Nav, Container, Form, Button, NavDropdown } from 'react-bootstrap';
import { FaShoppingCart, FaUser, FaSearch } from 'react-icons/fa';
import axios from 'axios';
import './Header.css'; // We'll create this file next
import logo from './assets/images/Logo.png'; // Updated logo import

function Header() {
  const [searchQuery, setSearchQuery] = useState('');
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState('');
  const [categories, setCategories] = useState({
    men: [],
    women: [],
    collections: []
  });
  const [products, setProducts] = useState([]);
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();
  const { categorySlug } = useParams();
  const location = useLocation();

  useEffect(() => {
    // Update user info when component mounts and when auth state changes
    const token = localStorage.getItem('token');
    const storedUserName = localStorage.getItem('userName');
    const storedUserRole = localStorage.getItem('userRole');
    
    if (token && storedUserName && storedUserRole) {
      setUserName(storedUserName);
      setUserRole(storedUserRole);
    }

    // Fetch categories from server
    fetchCategories();
  }, []);

  // Sync search bar with URL query when on /search
  useEffect(() => {
    if (location.pathname === '/search') {
      const params = new URLSearchParams(location.search);
      const q = params.get('q') || '';
      setSearchQuery(q);
    }
  }, [location]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/categories');
      const categoriesData = response.data;
      
      // Organize categories by type
      const organizedCategories = {
        men: categoriesData.filter(cat => cat.type === 'men'),
        women: categoriesData.filter(cat => cat.type === 'women'),
        collections: categoriesData.filter(cat => cat.type === 'collections')
      };
      
      setCategories(organizedCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setExpanded(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    setUserName('');
    setUserRole('');
    setExpanded(false);
    navigate('/login');
  };

  const isAuthenticated = !!localStorage.getItem('token');

  const handleAddToCart = (product) => {
    // Example: Save to localStorage or call your server API
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart.push({ ...product, quantity: 1 });
    localStorage.setItem('cart', JSON.stringify(cart));
    alert('Product added to cart!');
  };

  const handleBuyNow = (product) => {
    // Implement the logic to handle buying now
    console.log('Buy Now clicked for product:', product);
  };

  useEffect(() => {
    axios.get('http://localhost:5000/api/products')
      .then(res => setProducts(res.data.filter(p => p.category === 'menssilverkada')))
      .catch(err => console.log(err));
  }, []);

  // Helper to close navbar after navigation
  const closeNavbar = () => setExpanded(false);

  return (
    <Navbar expand="lg" sticky="top" className="custom-navbar" expanded={expanded} onToggle={setExpanded}>
      <Container>
        <Navbar.Brand as={Link} to="/" onClick={closeNavbar}>
          <img
            src={logo}
            alt="First Night"
            style={{ maxWidth: '120px', maxHeight: '60px', height: 'auto', width: 'auto', display: 'block', verticalAlign: 'middle' }}
          />
        </Navbar.Brand>
        
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/" className="nav-link-custom" onClick={closeNavbar}>Home</Nav.Link>
            
            

            {/* Women's Category Dropdown */}
            <NavDropdown 
              title="Women" 
              id="women-nav-dropdown"
              className="custom-dropdown"
              onClick={(e) => e.stopPropagation()}
            >
              <NavDropdown.Item as={Link} to="/womenbracelet" onClick={closeNavbar}>Women's Bracelets</NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/womenearings" onClick={closeNavbar}>Earrings</NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/womennecles" onClick={closeNavbar}>Necklaces</NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/manglsutra" onClick={closeNavbar}>Mangalsutra</NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/womensmala" onClick={closeNavbar}>Women's Mala</NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/wstonebracelte" onClick={closeNavbar}>Stone Bracelet</NavDropdown.Item>
            </NavDropdown>

            {/* Collections Dropdown */}
            <NavDropdown 
              title="Collections" 
              id="collections-nav-dropdown"
              className="custom-dropdown"
              onClick={(e) => e.stopPropagation()}
            >
              <NavDropdown.Item as={Link} to="/wedding" onClick={closeNavbar}>Wedding Collection</NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/officewear" onClick={closeNavbar}>Office Wear</NavDropdown.Item>
            </NavDropdown>

            <Nav.Link as={Link} to="/track-order" className="nav-link-custom" onClick={closeNavbar}>Track Order</Nav.Link>
            <Nav.Link as={Link} to="/about" className="nav-link-custom" onClick={closeNavbar}>About</Nav.Link>
            <Nav.Link as={Link} to="/contact" className="nav-link-custom" onClick={closeNavbar}>Contact</Nav.Link>
          </Nav>

          <Form className="d-flex mx-3" onSubmit={handleSearch}>
            <Form.Control
              type="search"
              placeholder="Search products..."
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button variant="outline-dark" type="submit" className="search-button">
              <FaSearch />
            </Button>
          </Form>

          <Nav>
            {isAuthenticated && (
              <Nav.Link as={Link} to="/cart" className="nav-link-custom me-2" onClick={closeNavbar}>
                <FaShoppingCart /> Cart
              </Nav.Link>
            )}
            {isAuthenticated ? (
              <NavDropdown 
                title={
                  <span>
                    <FaUser /> {userName || 'Account'}
                    {userRole === 'admin' && ' (Admin)'}
                  </span>
                } 
                id="account-dropdown"
                className="custom-dropdown"
                onClick={(e) => e.stopPropagation()}
              >
                <NavDropdown.Item as={Link} to="/user/profile" onClick={closeNavbar}>Profile</NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/user/orders" onClick={closeNavbar}>My Orders</NavDropdown.Item>
                {userRole === 'admin' && (
                  <>
                    <NavDropdown.Divider />
                    <NavDropdown.Item as={Link} to="/admin/dashboard" onClick={closeNavbar}>Admin Dashboard</NavDropdown.Item>
                  </>
                )}
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={handleLogout}>Logout</NavDropdown.Item>
              </NavDropdown>
            ) : (
              <Nav.Link as={Link} to="/login" className="nav-link-custom" onClick={closeNavbar}>
                <FaUser /> Login
              </Nav.Link>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default Header;

















