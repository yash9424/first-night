import React from 'react';
import { Link } from 'react-router-dom';

const OrderSuccess = () => {
  return (
    <div className="container mt-5 text-center">
      <div className="card p-5">
        <div className="mb-4">
          <i className="fas fa-check-circle text-success" style={{ fontSize: '4rem' }}></i>
        </div>
        <h2 className="mb-4">Order Placed Successfully!</h2>
        <p className="mb-4">Thank you for your order. We'll send you a confirmation email shortly.</p>
        <div className="d-flex justify-content-center gap-3">
          <Link to="/my-orders" className="btn btn-primary">View Orders</Link>
          <Link to="/" className="btn btn-outline-primary">Continue Shopping</Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess; 