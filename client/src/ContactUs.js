import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { FaPhone, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';
import ContactForm from './components/ContactForm';
import './ContactUs.css';

const ContactUs = () => {
    return (
        <div className="py-5">
            <Container>
                <h1 className="text-center mb-5">Get in Touch</h1>
                {/* Minimal Elegant Info Bar */}
                <Row className="justify-content-center mb-5">
                    <Col md={10}>
                        <div className="contact-info-bar d-flex flex-column flex-md-row justify-content-between align-items-stretch gap-4 p-4 rounded-4 shadow-sm bg-white">
                            <div className="info-section flex-fill text-center py-3 px-2">
                                <FaPhone size={36} className="icon-black mb-2" />
                                <div className="fw-bold fs-5 text-black">Phone</div>
                                <a href="tel:+91 94273 00816" className="text-decoration-none d-block mt-1 text-black">+91 94273 00816</a>
                            </div>
                            <div className="info-section flex-fill text-center py-3 px-2">
                                <FaEnvelope size={36} className="icon-black mb-2" />
                                <div className="fw-bold fs-5 text-black">Email</div>
                                <a href="mailto:firstnightjewellary@gmail.com" className="text-decoration-none d-block mt-1 text-black">firstnightjewellary@gmail.com   </a>
                            </div>
                            <div className="info-section flex-fill text-center py-3 px-2">
                                <FaMapMarkerAlt size={36} className="icon-black mb-2" />
                                <div className="fw-bold fs-5 text-black">Address</div>
                                <div className="mt-1 text-black">First Night Showroom<br />Rajkot, Gujrat<br />India</div>
                            </div>
                        </div>
                    </Col>
                </Row>
                {/* Contact Form */}
                <Row>
                    <Col>
                        <ContactForm />
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default ContactUs;