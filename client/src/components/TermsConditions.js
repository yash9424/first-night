import React from 'react';
import { Container } from 'react-bootstrap';

const TermsConditions = () => {
  return (
    <Container className="py-5">
      <h1 className="mb-4 text-center">Terms & Conditions</h1>
      <div className="policy-content">
        <div className="card p-4 mb-4 shadow-sm">
          <h2 className="mb-3">Agreement to Terms</h2>
          <p>
            By accessing and using First Night's website and services, you agree to be bound by these Terms and Conditions.
            If you disagree with any part of these terms, you may not access our services.
          </p>
        </div>

        <div className="card p-4 mb-4 shadow-sm">
          <h2 className="mb-3">Order Policies</h2>
          <p>
            By placing an order with us, you agree to the following:
          </p>
          <ul>
            <li>Orders can only be cancelled within 24 hours of placement and before shipping</li>
            <li>After 24 hours or once shipped, all sales are final with no returns or exchanges</li>
            <li>We reserve the right to refuse service to anyone for any reason</li>
            <li>We may limit or cancel quantities purchased per person or per order</li>
          </ul>
        </div>

        <div className="card p-4 mb-4 shadow-sm">
          <h2 className="mb-3">Product Information</h2>
          <p>
            Please note:
          </p>
          <ul>
            <li>Product colors may vary slightly from images shown on our website</li>
            <li>We strive to display our products as accurately as possible, but cannot guarantee exact representation</li>
            <li>All prices are in Indian Rupees (₹) and are subject to change without notice</li>
            <li>Product availability is not guaranteed and may vary</li>
          </ul>
        </div>

        <div className="card p-4 mb-4 shadow-sm">
          <h2 className="mb-3">Payment & Security</h2>
          <p>
            When making a purchase:
          </p>
          <ul>
            <li>All payments are processed securely through our payment providers</li>
            <li>You must provide accurate and complete billing information</li>
            <li>You confirm that you are authorized to use the payment method</li>
            <li>We reserve the right to verify payment information before accepting orders</li>
          </ul>
        </div>

        <div className="card p-4 mb-4 shadow-sm">
          <h2 className="mb-3">Shipping & Delivery</h2>
          <p>
            Our shipping terms:
          </p>
          <ul>
            <li>Delivery times are estimates only and not guaranteed</li>
            <li>We are not responsible for delays due to customs, postal service issues, or events outside our control</li>
            <li>Shipping charges are non-refundable unless an order is cancelled within the 24-hour window</li>
            <li>Customers are responsible for providing accurate shipping information</li>
          </ul>
        </div>

        <div className="card p-4 mb-4 shadow-sm">
          <h2 className="mb-3">Intellectual Property</h2>
          <p>
            All content on our website is owned by First Night and protected by:
          </p>
          <ul>
            <li>Copyright laws</li>
            <li>Trademark rights</li>
            <li>Other intellectual property rights</li>
          </ul>
          <p>
            You may not use, reproduce, or distribute our content without explicit permission.
          </p>
        </div>

        <div className="card p-4 mb-4 shadow-sm">
          <h2 className="mb-3">Limitation of Liability</h2>
          <p>
            First Night shall not be liable for:
          </p>
          <ul>
            <li>Any indirect, special, or consequential damages</li>
            <li>Loss or damage resulting from use of our products</li>
            <li>Service interruptions or website inaccessibility</li>
            <li>Any issues beyond our reasonable control</li>
          </ul>
        </div>

        <div className="card p-4 mb-4 shadow-sm">
          <h2 className="mb-3">Contact Us</h2>
          <p>
            If you have any questions about our Terms & Conditions, please contact us at:
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

export default TermsConditions; 