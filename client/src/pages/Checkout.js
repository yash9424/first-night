import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import OrderForm from '../components/OrderForm';

const Checkout = () => {
  const [cartItems, setCartItems] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // If coming from "Buy Now", use the products from location state
    if (location.state?.products) {
      setCartItems(location.state.products);
      setTotalAmount(location.state.totalAmount);
    } else {
      // Otherwise, get products from cart in localStorage
      const cart = JSON.parse(localStorage.getItem('cart')) || [];
      if (cart.length === 0) {
        navigate('/cart');
        return;
      }
      setCartItems(cart);
      
      // Calculate total amount
      const total = cart.reduce((sum, item) => {
        return sum + (item.quantity || 1) * (item.discountedPrice || item.price);
      }, 0);
      setTotalAmount(total);
    }
  }, [location.state, navigate]);

  return (
    <Container className="py-5">
      <h2 className="mb-4">Checkout</h2>
      <Row>
        <Col md={8}>
          <OrderForm products={cartItems} totalAmount={totalAmount} />
        </Col>
        <Col md={4}>
          <Card className="mb-4">
            <Card.Header>
              <h4>Order Summary</h4>
            </Card.Header>
            <Card.Body>
              {cartItems.map((item, index) => (
                <div key={index} className={index > 0 ? 'mt-3 pt-3 border-top' : ''}>
                  <div className="d-flex justify-content-between">
                    <div>
                      <h6 className="mb-1">{item.name}</h6>
                      <p className="text-muted mb-0">Quantity: {item.quantity || 1}</p>
                      {item.size && <p className="text-muted mb-0">Size: {item.size}</p>}
                      {item.color && <p className="text-muted mb-0">Color: {item.color}</p>}
                    </div>
                    <div className="text-end">
                      <p className="mb-0">₹{((item.discountedPrice || item.price) * (item.quantity || 1)).toFixed(2)}</p>
                      {item.discountedPrice && (
                        <small className="text-muted text-decoration-line-through">
                          ₹{(item.price * (item.quantity || 1)).toFixed(2)}
                        </small>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <hr />
              <div className="d-flex justify-content-between">
                <h5>Total:</h5>
                <h5>₹{totalAmount.toFixed(2)}</h5>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Checkout; 