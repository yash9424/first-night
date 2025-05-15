import React from 'react';
import { Container } from 'react-bootstrap';

const PrivacyPolicy = () => {
  return (
    <Container className="py-5">
      <h1 className="mb-4">Privacy Policy</h1>
      <div className="policy-content">
        <h2>1. Information We Collect</h2>
        <p>
          We collect the following types of information:
        </p>
        <ul>
          <li>Personal information (name, email, address)</li>
          <li>Payment information</li>
          <li>Shopping preferences and history</li>
          <li>Device and browser information</li>
        </ul>

        <h2>2. How We Use Your Information</h2>
        <p>
          Your information is used for:
        </p>
        <ul>
          <li>Processing your orders</li>
          <li>Providing customer support</li>
          <li>Sending order updates and notifications</li>
          <li>Improving our services</li>
          <li>Marketing communications (with your consent)</li>
        </ul>

        <h2>3. Information Security</h2>
        <p>
          We protect your information through:
        </p>
        <ul>
          <li>Secure SSL encryption</li>
          <li>Regular security audits</li>
          <li>Limited employee access</li>
          <li>Secure data storage</li>
        </ul>

        <h2>4. Your Rights</h2>
        <p>
          You have the right to:
        </p>
        <ul>
          <li>Access your personal data</li>
          <li>Request data correction</li>
          <li>Request data deletion</li>
          <li>Opt-out of marketing communications</li>
          <li>Lodge a complaint with authorities</li>
        </ul>

        <h2>5. Contact Us</h2>
        <p>
          For privacy-related concerns:
        </p>
        <ul>
          <li>Email: privacy@brantamain.com</li>
          <li>Phone: 1-800-BRANTA</li>
          <li>Address: [Your Company Address]</li>
        </ul>
      </div>
    </Container>
  );
};

export default PrivacyPolicy; 