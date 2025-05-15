import React from 'react';
import { Container, Row, Col, Button, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../Cartcontext';
import '../styles/actionButtons.css';

const gold = '#c4a03c';
const black = '#111';

const CartPage = () => {
  const { cart, removeFromCart, updateQuantity } = useCart();
  const navigate = useNavigate();

  const calculateTotal = () => {
    return cart.reduce((total, item) => 
        total + (item.price * item.quantity), 0);
  };

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    updateQuantity(productId, newQuantity);
  };

  const handleCheckout = () => {
    navigate('/payment');
  };

  if (cart.length === 0) {
    return (
      <Container className="py-5 text-center" style={{ background: black, minHeight: '100vh' }}>
        <h2 style={{ color: gold }}>Your cart is empty</h2>
        <Button 
          style={{ background: gold, border: 'none', color: black }}
          className="mt-3 px-4 py-2 rounded-pill fw-bold"
          onClick={() => navigate('/')}
        >
          Continue Shopping
        </Button>
      </Container>
    );
  }

  return (
    <Container fluid className="py-5" style={{ background: black, minHeight: '100vh' }}>
      <Row className="justify-content-center">
        <Col lg={8} md={12}>
          <h2 className="mb-4" style={{ color: gold, fontWeight: 700 }}>Shopping Cart</h2>
          {cart.map((item) => (
            <Card key={item._id} className="mb-4 shadow-lg border-0" style={{ background: '#181818', borderRadius: '1.5rem' }}>
              <Card.Body>
                <Row className="align-items-center">
                  <Col xs={12} md={3} className="mb-3 mb-md-0">
                    <div style={{ background: '#222', borderRadius: '1rem', padding: '1rem', textAlign: 'center' }}>
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        style={{ width: '100%', maxWidth: 120, borderRadius: '1rem', objectFit: 'cover' }} 
                      />
                    </div>
                  </Col>
                  <Col xs={12} md={4} className="mb-3 mb-md-0">
                    <h5 style={{ color: gold, fontWeight: 600 }}>{item.name}</h5>
                    <div className="text-muted" style={{ color: '#bbb' }}>₹{item.price}</div>
                  </Col>
                  <Col xs={12} md={3} className="mb-3 mb-md-0">
                    <div className="d-flex align-items-center justify-content-md-start justify-content-center">
                      <Button 
                        style={{ background: 'transparent', border: `1.5px solid ${gold}`, color: gold, fontWeight: 700, fontSize: 20, width: 36, height: 36, borderRadius: '50%' }}
                        onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                      >
                        -
                      </Button>
                      <span className="mx-3 fs-5 fw-bold" style={{ color: gold }}>{item.quantity}</span>
                      <Button 
                        style={{ background: gold, border: 'none', color: black, fontWeight: 700, fontSize: 20, width: 36, height: 36, borderRadius: '50%' }}
                        onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                      >
                        +
                      </Button>
                    </div>
                  </Col>
                  <Col xs={6} md={1} className="text-center mb-3 mb-md-0">
                    <div style={{ color: gold, fontWeight: 600 }}>₹{item.price * item.quantity}</div>
                  </Col>
                  <Col xs={6} md={1} className="text-center">
                    <Button 
                      style={{ background: 'transparent', border: `1.5px solid #ff4d4f`, color: '#ff4d4f', fontWeight: 700, borderRadius: '50%' }}
                      onClick={() => removeFromCart(item._id)}
                      title="Remove"
                    >
                      ×
                    </Button>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          ))}
        </Col>
        <Col lg={3} md={8} className="ms-lg-4 mt-4 mt-lg-0">
          <Card className="shadow-lg border-0 p-4" style={{ background: '#181818', borderRadius: '1.5rem' }}>
            <h4 style={{ color: gold, fontWeight: 700 }}>Order Summary</h4>
            <hr style={{ borderColor: gold, opacity: 0.3 }} />
            <div className="d-flex justify-content-between mb-3">
              <span style={{ color: '#bbb' }}>Subtotal:</span>
              <span style={{ color: gold, fontWeight: 600 }}>₹{calculateTotal()}</span>
            </div>
            <Button 
              style={{ background: gold, border: 'none', color: black, fontWeight: 700, borderRadius: '2rem', fontSize: '1.1rem', letterSpacing: 0.5 }}
              size="lg"
              className="w-100 mt-3 py-2"
              onClick={handleCheckout}
            >
              Proceed to Checkout
            </Button>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default CartPage; 