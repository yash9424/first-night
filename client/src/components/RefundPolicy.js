import React from 'react';
import { Container } from 'react-bootstrap';

const RefundPolicy = () => {
  return (
    <Container className="py-5">
      <h1 className="mb-4 text-center">Refund Policy</h1>
      <div className="policy-content">
        <div className="card p-4 mb-4 shadow-sm">
          <h2 className="mb-3">Refund Eligibility</h2>
          <p>
            At First Night, we offer refunds <strong>only within 24 hours</strong> of order placement under the following conditions:
          </p>
          <ul>
            <li>The order must not have been shipped yet</li>
            <li>You must have your order confirmation and payment details</li>
          </ul>
          <p className="mt-3">
            <strong>Important:</strong> Once 24 hours have passed since placing your order, or if your order has already been shipped, no refunds will be provided.
          </p>
        </div>

        <div className="card p-4 mb-4 shadow-sm">
          <h2 className="mb-3">Refund Process</h2>
          <p>
            To request a refund within the eligible timeframe:
          </p>
          <ol>
            <li>Contact our customer service immediately through email or phone</li>
            <li>Provide your order number and reason for cancellation</li>
            <li>Wait for confirmation of order cancellation</li>
          </ol>
          <p>
            Once your cancellation is confirmed, the refund will be processed to your original payment method. Processing time may vary depending on your payment provider.
          </p>
        </div>

        <div className="card p-4 mb-4 shadow-sm">
          <h2 className="mb-3">Contact Us</h2>
          <p>
            If you wish to cancel your order within 24 hours of placement or have questions about our refund policy, please contact us immediately at:
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

export default RefundPolicy; 