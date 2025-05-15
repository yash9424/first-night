// src/pages/HomePage.js
import React from 'react';
import { FiUser, FiShoppingBag, FiSearch } from 'react-icons/fi';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FaFacebookF, FaInstagram, FaWhatsapp, FaYoutube } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import { Link } from 'react-router-dom';
import Footer from './Footer';
import './hover.css';
import './img.css';
import { SiAmeba } from 'react-icons/si';

const HomePage = () => {


  const products = [
    {
      img: 'https://brantashop.com/cdn/shop/files/BrantaWhiteProduct_8.png?v=1691425785&width=720',
      discount: '43% OFF',
      price: '₹1,149',
      oldPrice: '₹2,000',
      title: 'Om Carving Premium Gold Bracelet For Men',
    },
    {
      img: 'https://brantashop.com/cdn/shop/files/Untitled-1.jpg?v=1706175335&width=720',
      discount: '45% OFF',
      price: '₹1,099',
      oldPrice: '₹2,000',
      title: "Jai Shree Ram Men's Gold Bracelet",
    },
    {
      img: 'https://brantashop.com/cdn/shop/files/BrantaWhiteProduct_23.png?v=1691426307&width=720',
      discount: '45% OFF',
      price: '₹1,099',
      oldPrice: '₹2,000',
      title: "Stunning Om Men's Gold Bracelet",
    },
    {
      img: 'https://brantashop.com/cdn/shop/files/BrantaWhiteProduct_11.png?v=1691425882&width=720',
      discount: '46% OFF',
      price: '₹1,080',
      oldPrice: '₹2,000',
      title: "Heartbeat Lifeline Gold Men's Bracelet",
    },
    {
      imgs: 'https://brantashop.com/cdn/shop/files/Untitled_design_29.png?v=1736401540&width=720',
      discounts: '53% OFF',
      prices: '₹799',
      oldPrices: '₹1,700',
      titles: 'Greek Circle Pendant Necklace',
    },
    {
      imgs: 'https://brantashop.com/cdn/shop/files/NewProject_a5ec4fe0-49e0-48e0-8753-079f9c1e1c2f.jpg?v=1744112207&width=720',
      discounts: '53% OFF',
      prices: '₹799',
      oldPrices: '₹1,700',
      titles: 'Butterfly Pearl Charm Necklace',
    },
    {
      imgs: 'https://brantashop.com/cdn/shop/files/image.png?v=1744111659&width=720',
      discounts: '53% OFF',
      prices: '₹799',
      oldPrices: '₹1,700',
      titles: 'Trendy Blue Diamond Layered Necklace',
    },
    {
      imgs: 'https://brantashop.com/cdn/shop/files/Untitled_design_3_da319fa6-d35f-42c4-8270-a28e0d9e5fd0.png?v=1736257119&width=720',
      discounts: '53% OFF',
      prices: '₹799',
      oldPrices: '₹1,700',
      titles: 'Round Evil Eye Pendant Necklace',
    },
    {
      imgse: 'https://brantashop.com/cdn/shop/files/Untitleddesign-2024-05-09T181546.158.png?v=1715258824&width=360',
      discountse: '53% OFF',
      pricese: '₹1,299',
      oldPricese: '₹2,100',
      titlese: 'Ram Pendant Gold Stainless Steel Necklace Chain For Men (24 Inch)',
    },
    {
      imgse: 'https://brantashop.com/cdn/shop/files/BS-ProductPhoto_f94e11f0-e4d0-4375-9938-275cf99fc7db.png?v=1717760323&width=360',
      discountse: '53% OFF',
      pricese: '₹1,149',
      oldPricese: '₹2,100',
      titlese: 'Om Pendant Dotted Design Gold Chain For Men (24 Inch)',
    },
    {
      imgse: 'https://brantashop.com/cdn/shop/files/Untitleddesign-2024-05-09T182255.050.png?v=1715259231&width=360',
      discountse: '53% OFF',
      pricese: '₹1,199',
      oldPricese: '₹2,100',
      titlese: 'Hanuman Gold Plated Pendant Chain For Men (24 Inch)',
    },
    {
      imgse: 'https://brantashop.com/cdn/shop/files/Untitleddesign-2024-05-09T181256.271.png?v=1715258677&width=360',
      discountse: '53% OFF',
      pricese: '₹1,160',
      oldPricese: '₹2,100',
      titlese: 'Ganeshas Blessing Pendant Gold Stainless Steel Necklace Chain For Men (24 Inch)',
    },
    
    {
      imgsr: 'https://brantashop.com/cdn/shop/files/Untitleddesign-2024-03-22T173938.725.png?v=1711109435&width=360',
      discountsr: '53% OFF',
      pricesr: '₹799',
      oldPricesr: '₹1,750',
      titlesr: 'Heartbeat Necklace',
    },
    {
      imgsr: 'https://brantashop.com/cdn/shop/files/Untitled_design_55.png?v=1737112309&width=360',
      discountsr: '53% OFF',
      pricesr: '₹799',
      oldPricesr: '₹1,700',
      titlesr: 'Evil Eye Heart Necklace',
    },
    {
      imgsr: 'https://brantashop.com/cdn/shop/files/Untitleddesign-2024-03-22T153602.952.png?v=1711108854&width=360',
      discountsr: '53% OFF',
      pricesr: '₹799',
      oldPricesr: '₹1,700',
      titlesr: 'Roman Alphabet Black and White Double Sided Round Necklace',
    },
    {
      imgsr: 'https://brantashop.com/cdn/shop/files/Untitleddesign-2024-03-22T171318.651.png?v=1711108701&width=360',
      discountsr: '53% OFF',
      pricesr: '₹799',
      oldPricesr: '₹1,750',
      titlesr: 'Eternity Roman Numerals Circle Necklace',
    },    
  ];
  return (
    <div className="font-sans">
     
     

     {/* Hero Carousel */}
<div className="container-fluid px-0 section-spacing">
  <div className="carousel-container" style={{ marginTop: '50px' }}>
    <div id="heroCarousel" className="carousel slide" data-bs-ride="carousel">
      <div className="carousel-inner">

        {/* Slide 1 */}
        <div className="carousel-item active">
          <a href='/women-bracelet'  className="text-decoration-none text-dark">
          <div className="position-relative carousel-image-container">
            <img
              src="https://brantashop.com/cdn/shop/files/Shop_Now_1.png?v=1722536974"
              className="d-block w-100 h-100"
              style={{ objectFit: 'cover' }}
              alt="Womens Necklace 1"
            />
          </div>
          </a>
        </div>

        {/* Slide 2 */}
        <div className="carousel-item">
        <a href='/Womenchain'  className="text-decoration-none text-dark">
          <div className="position-relative carousel-image-container">
            <img
              src="https://brantashop.com/cdn/shop/files/Shop_Now_4.png?v=1722538773"
              className="d-block w-100 h-100"
              style={{ objectFit: 'cover' }}
              alt="Womens Necklace 2"
            />
          </div>
          </a>
        </div>

        {/* Slide 3 */}
        <div className="carousel-item">
          <div className="position-relative carousel-image-container">
            <img
              src="https://brantashop.com/cdn/shop/files/Shop_Now_5.png?v=1722538910"
              className="d-block w-100 h-100"
              style={{ objectFit: 'cover' }}
              alt="Womens Necklace 3"
            />
          </div>
        </div>

        {/* Slide 4 */}
        <div className="carousel-item">
          <div className="position-relative carousel-image-container">
            <img
              src="https://brantashop.com/cdn/shop/files/Shop_Now_2.png?v=1722537058"
              className="d-block w-100 h-100"
              style={{ objectFit: 'cover' }}
              alt="Womens Necklace 4"
            />
          </div>
        </div>

      </div>


      {/* Carousel Controls */}
      <button className="carousel-control-prev" type="button" data-bs-target="#heroCarousel" data-bs-slide="prev">
        <span className="carousel-control-prev-icon" aria-hidden="true"></span>
        <span className="visually-hidden">Previous</span>
      </button>
      <button className="carousel-control-next" type="button" data-bs-target="#heroCarousel" data-bs-slide="next">
        <span className="carousel-control-next-icon" aria-hidden="true"></span>
        <span className="visually-hidden">Next</span>
      </button>
    </div>
  </div>
</div>
<div className="container my-2 pt-0 section-spacing">
  
      <div className="row g-3">




        {/* Card 1 */}
        <div className="col-md-4">
  <a href="/wstonebracelte" className="text-decoration-none text-dark">
    <div className="card border-0 rounded-4 overflow-hidden">
      <div className="image-hover-zoom">
        <img
          src="https://brantashop.com/cdn/shop/collections/Men.png?v=1722530043"
          className="card-img-top"
          alt="Women's Stone Bracelets"
        />
      </div>
      <div className="card-body text-center">
        <span className="fw-medium">
          Women's Stone Bracelets <span className="ms-1">&rarr;</span>
        </span>
      </div>
    </div>
  </a>
</div>



        {/* Card 2 */}
        <div className="col-md-4">
          <a href="/Womensmala" className="text-decoration-none text-dark">
          <div className="card border-0 rounded-4 overflow-hidden">
            <img
              src="https://brantashop.com/cdn/shop/collections/CH390_1_1100x_2d9a71a6-4419-4189-b851-67fcc4baa487.webp?v=1722530658&width=750"
              className="card-img-top"
              alt="Malas for Women"
            />
            <div className="card-body text-center">
              <span className="fw-medium">
                Women's Mala <span className="ms-1">&rarr;</span>
              </span>
            </div>
          </div>
          </a>
        </div>

        {/* Card 3 */}
        <div className="col-md-4">
        <a href="/womennecles" className="text-decoration-none text-dark">
          <div className="card border-0 rounded-4 overflow-hidden">
            <img
              src="https://brantashop.com/cdn/shop/collections/56.jpg?v=1722531104&width=750"
              className="card-img-top"
              alt="Women's Necklace"
            />
            <div className="card-body text-center">
              <span className="fw-medium">
                Women's Necklace <span className="ms-1">&rarr;</span>
              </span>
            </div>
          </div>
          </a>
        </div>
      </div>
    </div>
    <div className="container my-2 pt-0 section-spacing">
      <div className="row g-3">
        {/* Card 1 */}
        <div className="col-md-4">
        <a href="/Womenearings" className="text-decoration-none text-dark">
          <div className="card border-0 rounded-4 overflow-hidden">
            <img
              src="https://brantashop.com/cdn/shop/collections/Branta_White_Product_3.jpg?v=1722531257&width=750"
              className="card-img-top"
              alt="Men's Bracelets"
            />
            <div className="card-body text-center">
              <span className="fw-medium">
                Women's Earrings <span className="ms-1">&rarr;</span>
              </span>
            </div>
          </div>
          </a>
        </div>

        {/* Card 2 */}
        <div className="col-md-4">
        <a href="/Manglsutra" className="text-decoration-none text-dark">
          <div className="card border-0 rounded-4 overflow-hidden">
            <img
              src="https://brantashop.com/cdn/shop/collections/IMG_1980.jpg?v=1722531457&width=750"
              className="card-img-top"
              alt="Chains for Men"
            />
            <div className="card-body text-center">
              <span className="fw-medium">
                Mangalsutra <span className="ms-1">&rarr;</span>
              </span>
            </div>
          </div>
          </a>
        </div>

        {/* Card 3 */}
        <div className="col-md-4">
        <a href="/Womenbracelet" className="text-decoration-none text-dark">
          <div className="card border-0 rounded-4 overflow-hidden">
            <img
              src="https://brantashop.com/cdn/shop/collections/img-1.png?v=1722531791&width=750"
              className="card-img-top"
              alt="Women's Necklace"
            />
            <div className="card-body text-center">
              <span className="fw-medium">
                Women's Bracelet <span className="ms-1">&rarr;</span>
              </span>
            </div>
          </div>
          </a>
        </div>

    <div className="container my-2 pt-0 section-spacing">
      <h3 className="text-center mb-2 fw-bold">Wedding's Collection</h3>
      <div className="row g-3">
        {products.map((product, index) => (
          <div className="col-6 col-md-3" key={index}>
            <div className="position-relative">
              <span
                className="badge bg-danger position-absolute"
                style={{ top: '10px', left: '10px', fontSize: '0.8rem' }}
              >
                {product.discounts}
              </span>
              <img
                src={product.imgs}
                alt={product.titles}
                className="img-fluid rounded-3 w-100"
              />
            </div>
            <div className="mt-2">
              <p className="mb-1 fw-bold fs-6">
                {product.prices}{' '}
                <span className="text-muted text-decoration-line-through fw-normal">
                  {product.oldPrices}
                </span>
              </p>
              <a href="/WeddingCollection" className="text-dark text-decoration-none">
                {product.titles}
              </a>
            </div>
          </div>
        ))}
      </div>  
      <div className="text-center mt-2 mb-0">
        <a href="/Wedding" className="btn btn-dark px-4 py-2 fw-medium">View all</a>
      </div>
    </div>

    <div className="container my-2 pt-0 section-spacing">
      <h3 className="text-center mb-2 fw-bold">OFFICE WEAR</h3>
      <div className="row g-3">
        {products.map((product, index) => (
          <div className="col-6 col-md-3" key={index}>
            <div className="position-relative">
              <span
                className="badge bg-danger position-absolute"
                style={{ top: '10px', left: '10px', fontSize: '0.8rem' }}
              >
                {product.discountsr}
              </span>
              <img
                src={product.imgsr}
                alt={product.titlesr}
                className="img-fluid rounded-3 w-100"
              />
            </div>
            <div className="mt-2">
              <p className="mb-1 fw-bold fs-6">
                {product.pricesr}{' '}
                <span className="text-muted text-decoration-line-through fw-normal">
                  {product.oldPricesr}
                </span>
              </p>
              <a href="/Officewear" className="text-dark text-decoration-none">
                {product.titlesr}
              </a>
            </div>
            
          </div>
        ))}
      </div>

      <div className="text-center mt-2 mb-0">
        <a href="/Officewear" className="btn btn-dark px-4 py-2 fw-medium">View all</a>
      </div>
    </div>
  
    

      
      </div>
    </div>
    </div>

    
  );
};

export default HomePage;

<style>
{`
  .carousel-image-container {
    height: 500px;
    overflow: hidden;
  }

  @media (max-width: 768px) {
    .carousel-image-container {
      height: 300px;
    }
  }

  @media (max-width: 576px) {
    .carousel-image-container {
      height: 200px;
    }
  }

  .carousel-item img {
    transition: transform 0.3s ease;
  }

  .carousel-item:hover img {
    transform: scale(1.05);
  }

  .carousel-container {
    margin-top: 70px;
  }

  .section-spacing {
    padding-top: 40px;
    padding-bottom: 40px;
  }
`}
</style>
