import React from 'react';
import { Container } from 'react-bootstrap';

const ReturnPolicy = () => {
  return (
    <Container className="py-5">
      <h1 className="mb-4 text-center">Return Policy</h1>
      <div className="policy-content">
        <div className="card p-4 mb-4 shadow-sm">
          <h2 className="mb-3">No Return Policy</h2>
          <p>
            At First Night, we have a <strong>strict no-return policy</strong>. Once an order is shipped, it cannot be returned or exchanged under any circumstances.
          </p>
          <p>
            We take utmost care to ensure every piece of jewelry is thoroughly inspected before shipping. Each product is crafted with precision and undergoes quality checks to deliver the best to our customers.
          </p>
        </div>

        <div className="card p-4 mb-4 shadow-sm">
          <h2 className="mb-3">Order Cancellation</h2>
          <p>
            If you wish to cancel your order, you may do so only within 24 hours of placing it and before it is shipped. After this window, cancellations are not accepted.
          </p>
          <p>
            To cancel an order within the 24-hour window, please contact our customer service immediately with your order details.
          </p>
        </div>

        <div className="card p-4 mb-4 shadow-sm">
          <h2 className="mb-3">Product Quality Assurance</h2>
          <p>
            We stand behind the quality of our products. Every item is:
          </p>
          <ul>
            <li>Made with high-quality materials</li>
            <li>Thoroughly inspected before shipping</li>
            <li>Carefully packaged to prevent damage during transit</li>
          </ul>
          <p>
            Please carefully review product descriptions and images before placing your order, as we do not accept returns based on change of mind.
          </p>
        </div>

        <div className="card p-4 mb-4 shadow-sm">
          <h2 className="mb-3">Contact Us</h2>
          <p>
            If you have any questions about our policies or your order, please contact us at:
          </p>
          <p>
            Email: <a href="mailto:support@brantashop.com">support@brantashop.com</a><br />
            Phone: +91 XXXXXXXXXX (Available Mon-Sat, 10 AM - 6 PM)
          </p>
        </div>
      </div>
    </Container>
  );
};

export default ReturnPolicy; 