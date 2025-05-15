import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Link } from 'react-router-dom';
import { FaFacebookF, FaInstagram, FaYoutube } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

const Divinecollection = () => {
  return (
    <div className="container mt-5">

      
      <div className="d-flex justify-content-between align-items-center flex-wrap mb-4">
        <h2 className="mb-3">Divine Collection</h2>
        <img 
          src="https://brantashop.com/cdn/shop/collections/Mahadev_Collection.png?v=1724924868&width=750" 
          alt="Bracelet Banner" 
          className="img-fluid rounded" 
          style={{ width: '726px',maxHeight: '235px', objectFit: 'cover' }} 
        />
      </div>

      {/* Filters and Sort */}
      <div className="d-flex justify-content-between align-items-center flex-wrap mb-4">
        <div className="d-flex flex-wrap gap-2">
          <div className="dropdown">
            <button className="btn btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown">
              Availability
            </button>
            <ul className="dropdown-menu">
              <li><a className="dropdown-item" href="#">In stock</a></li>
              <li><a className="dropdown-item" href="#">Out of stock</a></li>
            </ul>
          </div>

          <div className="dropdown">
            <button className="btn btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown">
              Price
            </button>
            <ul className="dropdown-menu">
              <li><a className="dropdown-item" href="#">Low to High</a></li>
              <li><a className="dropdown-item" href="#">High to Low</a></li>
            </ul>
          </div>

          <div className="dropdown">
            <button className="btn btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown">
              Product type
            </button>
            <ul className="dropdown-menu">
              <li><a className="dropdown-item" href="#">Bracelet</a></li>
            </ul>
          </div>

          <div className="dropdown">
            <button className="btn btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown">
              More filters
            </button>
            <ul className="dropdown-menu">
              <li><a className="dropdown-item" href="#">Gold</a></li>
              <li><a className="dropdown-item" href="#">Steel</a></li>
            </ul>
          </div>
        </div>

        <div className="d-flex align-items-center gap-2">
          <span className="me-1">Sort by:</span>
          <select className="form-select w-auto">
            <option>Featured</option>
            <option>Price: Low to High</option>
            <option>Price: High to Low</option>
          </select>
          <span className="ms-3 text-muted">64 products</span>
        </div>
      </div>

      {/* Product Cards */}
      <div className="row">

      {/* Product 1 */}
      <div class="col-md-3 mb-4">
    <div class="position-relative">
      <span class="badge bg-danger position-absolute top-0 start-0 m-2">45% OFF</span>
      <div class="position-relative hover-img-wrapper">
        <img src="https://brantashop.com/cdn/shop/files/Untitleddesign-2024-05-09T175125.798.png?v=1715257413&width=720" class="img-fluid rounded default-img" alt="Bracelet 2" />
        <img src="https://brantashop.com/cdn/shop/files/Untitleddesign-2024-05-09T175220.902.png?v=1715257413&width=720                                                                                        " class="img-fluid rounded hover-img" alt="Bracelet 2 Hover" />
      </div>
    </div>
    <div class="mt-2">
      <strong>₹1,149</strong>
      <span class="text-muted text-decoration-line-through">₹2,100</span>
      <p class="mb-0">Om Matte Finish Necklace For Men (24 Inch)
      </p>
    </div>
  </div>
 

  {/* Product 2 */}
  <div class="col-md-3 mb-4">
    <div class="position-relative">
      <span class="badge bg-danger position-absolute top-0 start-0 m-2">45% OFF</span>
      <div class="position-relative hover-img-wrapper">
        <img src="https://brantashop.com/cdn/shop/files/zivia_6647_6fdffba1-ea93-43c8-8d4e-a92a5f359591.jpg?v=1722530189&width=720" class="img-fluid rounded default-img" alt="Bracelet 3" />
        <img src="https://brantashop.com/cdn/shop/files/BS-ProductPhoto_9d5b871c-8e9e-4b86-9411-3282cc570525.png?v=1722530197&width=720" class="img-fluid rounded hover-img" alt="Bracelet 3 Hover" />
      </div>
    </div>
    <div class="mt-2">
      <strong>₹1,199</strong>
      <span class="text-muted text-decoration-line-through">₹3,000</span>
      <p class="mb-0">Premium Om Gold Bracelet For Men</p>
    </div>
  </div>
 

  {/* Product 3 */}

  <div class="col-md-3 mb-4">
    <div class="position-relative">
      <span class="badge bg-danger position-absolute top-0 start-0 m-2">46% OFF</span>
      <div class="position-relative hover-img-wrapper">
        <img src="https://brantashop.com/cdn/shop/files/Untitleddesign-2024-05-09T181751.830.png?v=1717760323&width=720" class="img-fluid rounded default-img" alt="Bracelet 4" />
        <img src="https://brantashop.com/cdn/shop/files/BS-ProductPhoto_f94e11f0-e4d0-4375-9938-275cf99fc7db.png?v=1717760323&width=720" class="img-fluid rounded hover-img" alt="Bracelet 4 Hover" />
      </div>
    </div>
    <div class="mt-2">
      <strong>₹1,149</strong>
      <span class="text-muted text-decoration-line-through">₹2,100</span>
      <p class="mb-0">Om Pendant Dotted Design Gold Chain For Men (24 Inch)</p>
    </div>
  </div>
  {/* Product 4 */}
  <div class="col-md-3 mb-4">
    <div class="position-relative">
      <span class="badge bg-danger position-absolute top-0 start-0 m-2">46% OFF</span>
      <div class="position-relative hover-img-wrapper">
        <img src="https://brantashop.com/cdn/shop/files/Untitleddesign-2024-05-09T180502.428.png?v=1735976678&width=720" class="img-fluid rounded default-img" alt="Bracelet 4" />
        <img src="https://brantashop.com/cdn/shop/files/Untitleddesign-2024-05-09T180533.715.png?v=1735976678&width=720" class="img-fluid rounded hover-img" alt="Bracelet 4 Hover" />
      </div>
    </div>
    <div class="mt-2">
      <strong>₹1,169</strong>
      <span class="text-muted text-decoration-line-through">₹2,100</span>
      <p class="mb-0">Om Trishul Pendant Gold Stainless Steel Necklace Chain For Men (24 Inch)</p>
    </div>
  </div>

  {/* Product 5 */}
  <div class="col-md-3 mb-4">
    <div class="position-relative">
      <span class="badge bg-danger position-absolute top-0 start-0 m-2">60% OFF</span>
      <div class="position-relative hover-img-wrapper">
        <img src="https://brantashop.com/cdn/shop/files/Untitled_design_-_2024-12-30T174803.227.png?v=1735561352&width=720" class="img-fluid rounded default-img" alt="Bracelet 5" />
        <img src="https://brantashop.com/cdn/shop/files/Untitled_design_-_2024-12-30T175130.860.png?v=1735561352&width=720" class="img-fluid rounded hover-img" alt="Bracelet 5 Hover" />
      </div>
    </div>
    <div class="mt-2">
      <strong>₹499</strong>
      <span class="text-muted text-decoration-line-through">₹1,050</span>
      <p class="mb-0">Magnetic Hand Unisex Combo Crystal Bracelet</p>
    </div>
  </div>

  {/* Product 6 */}
  <div class="col-md-3 mb-4">
    <div class="position-relative">
      <span class="badge bg-danger position-absolute top-0 start-0 m-2">43% OFF</span>
      <div class="position-relative hover-img-wrapper">
        <img src="https://brantashop.com/cdn/shop/files/Untitled_design_-_2024-12-30T175507.236.png?v=1735562487&width=720" class="img-fluid rounded default-img" alt="Bracelet 6" />
        <img src="https://brantashop.com/cdn/shop/files/Untitled_design_-_2024-12-30T175550.101.png?v=1735562487&width=720" class="img-fluid rounded hover-img" alt="Bracelet 6 Hover" />
      </div>
    </div>
    <div class="mt-2">
      <strong>₹499</strong>
      <span class="text-muted text-decoration-line-through">₹1,750</span>
      <p class="mb-0">Dual Heart Unisex Charm Bracelets</p>
    </div>
  </div>

  {/* Product 7 */}
  <div class="col-md-3 mb-4">
    <div class="position-relative">
      <span class="badge bg-danger position-absolute top-0 start-0 m-2">Sold Out</span>
      <div class="position-relative hover-img-wrapper">
        <img src="https://brantashop.com/cdn/shop/files/Untitled_design_-_2024-10-01T115154.871.png?v=1727763779&width=720" class="img-fluid rounded default-img" alt="Bracelet 7" />
        <img src="https://brantashop.com/cdn/shop/files/5_Logo.png?v=1711462156&width=720" class="img-fluid rounded hover-img" alt="Bracelet 7 Hover" />
      </div>
    </div>
    <div class="mt-2">
      <strong>₹499</strong>
      <span class="text-muted text-decoration-line-through">₹1,000</span>
      <p class="mb-0">7 Chakra Black Stone Bracelet For Men Combo</p>
    </div>
  </div>

  {/* Product 8 */}
  <div class="col-md-3 mb-4">
    <div class="position-relative">
      <span class="badge bg-danger position-absolute top-0 start-0 m-2">43% OFF</span>
      <div class="position-relative hover-img-wrapper">
        <img src="https://brantashop.com/cdn/shop/files/Untitled_design_-_2024-10-01T115523.707.png?v=1727763968&width=720" class="img-fluid rounded default-img" alt="Bracelet 6" />
        <img src="https://brantashop.com/cdn/shop/files/3_Logo.png?v=1711462458&width=720" class="img-fluid rounded hover-img" alt="Bracelet 6 Hover" />
      </div>
    </div>
    <div class="mt-2">
      <strong>₹399</strong>
      <span class="text-muted text-decoration-line-through">₹1,750</span>
      <p class="mb-0">White Howlite Natural Crystals Bracelet For Men</p>
    </div>
  </div>


</div>
    </div>
  );
};

export default Divinecollection;
