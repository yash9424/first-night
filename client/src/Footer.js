import React from 'react';
import { FaFacebookF, FaInstagram, FaYoutube, FaWhatsapp } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import { FaCommentDots, FaBoxOpen, FaUndoAlt, FaPlane } from 'react-icons/fa';
import { Link } from 'react-router-dom';

function Footer() {
  return (
    <>
      {/* Top Info Section */}
      <div className="container-fluid py-4 border-top border-bottom">
        <div className="row text-center justify-content-center g-4">
          <div className="col-6 col-md-3">
            <div className="footer-icon">
              <FaCommentDots size={32} />
            </div>
            <h6 className="fw-bold mt-2 mb-0">Happy to help</h6>
            <small className="text-muted">Chat or email</small>
          </div>
          <div className="col-6 col-md-3">
            <div className="footer-icon">
              <FaBoxOpen size={32} />
            </div>
            <h6 className="fw-bold mt-2 mb-0">Check order status</h6>
            <small className="text-muted">Updates & tracking</small>
          </div>
          <div className="col-6 col-md-3">
            <div className="footer-icon">
              <FaUndoAlt size={32} />
            </div>
            <h6 className="fw-bold mt-2 mb-0">Exchanges</h6>
            <small className="text-muted">Quick & hassle-free</small>
          </div>
          <div className="col-6 col-md-3">
            <div className="footer-icon">
              <FaPlane size={32} />
            </div>
            <h6 className="fw-bold mt-2 mb-0">Express Shipping</h6>
            <small className="text-muted">All over India</small>
          </div>
        </div>
      </div>


      {/* Footer Section */}
      <footer className="bg-black text-white pt-5 pb-4">
        <div className="container-fluid text-start text-md-left px-5">
          <div className="row">
            {/* CUSTOMER CARE */}
            <div className="col-md-3 col-lg-3 col-xl-3 mb-4">
              <h5 className="text-uppercase fw-bold mb-4">CUSTOMER CARE</h5>
              <p><strong>Mo:</strong>+91 94273 00816</p>
              <p><strong>Email:</strong> firstnightjewellary@gmail.com</p>
              <p>(Mon to Sat 10 AM to 6 PM)</p>
            </div>

            {/* SHOP NOW */}
      {/* SHOP NOW */}
<div className="col-md-2 col-lg-2 col-xl-2 mb-4">
  <h5 className="text-uppercase fw-bold mb-4">SHOP NOW</h5>
  <ul className="list-unstyled">
    <li><Link to="/Womenbracelet" className="text-white text-decoration-none">For Women</Link></li>
    <li><Link to="/bestseller" className="text-white text-decoration-none">Best Seller</Link></li>
    <li><Link to="/Divinecollection" className="text-white text-decoration-none">Divine Collection</Link></li>
    <li><Link to="/Aboutus" className="text-white text-decoration-none">About Us</Link></li>
    <li><Link to="/ContactUs" className="text-white text-decoration-none">Contact Us</Link></li>
    
  </ul>
</div>


            {/* QUICK LINKS */}
            <div className="col-md-3 col-lg-3 col-xl-3 mb-4">
              <h5 className="text-uppercase fw-bold mb-4">QUICK LINKS</h5>
              <ul className="list-unstyled">
                <li><Link to="/track-order" className="text-white text-decoration-none">🚚 Track my order</Link></li>
                <li><Link to="/user/profile" className="text-white text-decoration-none">My Account</Link></li>
                <li><Link to="/refund-policy" className="text-white text-decoration-none">Refund Policy</Link></li>
                <li><Link to="/return-policy" className="text-white text-decoration-none">Return Order</Link></li>
                <li><Link to="/privacy-policy" className="text-white text-decoration-none">Privacy Policy</Link></li>
                <li><Link to="/terms-conditions" className="text-white text-decoration-none">Terms & Conditions</Link></li>
              </ul>
            </div>

            {/* OUR MISSION */}
            <div className="col-md-4 col-lg-4 col-xl-4 mb-4">
              <h5 className="text-uppercase fw-bold mb-4">OUR MISSION</h5>
              <p>
                We at <strong>First Night</strong> focus solely on presenting our customers with the most{" "}
                <strong>authentic</strong> and <strong>intricate designs</strong> for routine and special
                occasions, at a very affordable price with assured quality.
              </p>
            </div>
          </div>

          {/* Subscribe Section
          <div className="row justify-content-center text-center">
            <h6 className="mb-3">Subscribe & Stay Updated with Our Upcoming Launch</h6>
            <div className="col-md-6">
              <div className="input-group">
                <input type="email" className="form-control" placeholder="Email" />
                <button className="btn btn-light" type="button">→</button>
              </div>
            </div>
          </div> */}

          {/* Footer Bottom */}
          <div className="row mt-4 pt-3 border-top border-secondary">
            <div className="col-md-6 text-center text-md-start">
              <p className=" mb-0">© 2025, First Night Pvt. Ltd.</p>
            </div>
            <div className="col-md-6 text-center text-md-end">
              <div className="d-inline-flex gap-3">
                {/* <FaFacebookF className="text-white fs-5" /> */}
                <a href="https://www.instagram.com/firstnightjewellery?igsh=MTJpaWZnYWozMWE5Yw==" target="_blank" rel="noopener noreferrer">
                  <FaInstagram className="text-white fs-5" />
                </a>
                <a href="https://wa.me/+919427300816" target="_blank" rel="noopener noreferrer">
                  <FaWhatsapp className="text-white fs-5" />
                </a>
                {/* <FaYoutube className="text-white fs-5" />
                <FaXTwitter className="text-white fs-5" /> */}
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}

export default Footer;
