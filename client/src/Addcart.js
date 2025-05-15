import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Button, Table } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const Addcart = () => {
  const [cart, setCart] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem('cart')) || [];
    setCart(storedCart);
  }, []);

  const handleRemove = (productId) => {
    const updatedCart = cart.filter(item => item._id !== productId);
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  const getTotal = () => {
    return cart.reduce((sum, item) => sum + (item.discountedPrice || item.price) * (item.quantity || 1), 0);
  };

  const handleBuyNow = () => {
    if (cart.length > 0) {
      const totalAmount = cart.reduce((sum, item) => 
        sum + (item.discountedPrice || item.price) * (item.quantity || 1), 
        0
      );
      navigate('/buy', { 
        state: { 
          products: cart,
          totalAmount: totalAmount
        } 
      });
    }
  };

  return (
    <Container className="mt-5">
      <h2>Your Cart</h2>
      {cart.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          <Table bordered hover className="bg-white shadow-sm mt-4">
            <thead>
              <tr>
                <th>Product</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Total</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {cart.map(item => (
                <tr key={item._id}>
                  <td>{item.name}</td>
                  <td>₹{item.discountedPrice || item.price}</td>
                  <td>{item.quantity || 1}</td>
                  <td>₹{((item.discountedPrice || item.price) * (item.quantity || 1)).toLocaleString()}</td>
                  <td>
                    <Button variant="danger" size="sm" onClick={() => handleRemove(item._id)}>
                      Remove
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan="3" className="text-end"><strong>Grand Total:</strong></td>
                <td colSpan="2"><strong>₹{getTotal().toLocaleString()}</strong></td>
              </tr>
            </tfoot>
          </Table>
          <div className="d-flex justify-content-end">
            <Button variant="success" size="lg" onClick={handleBuyNow} disabled={cart.length === 0}>
              Buy Now
            </Button>
          </div>
        </>
      )}
    </Container>
  );
};

export default Addcart;
