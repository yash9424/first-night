import React from 'react';

function Aboutus() {
    return (
        <div className="container py-5">
            <h1 className="text-center mb-5">About First Night</h1>

            <div className="row align-items-center mb-5">
                <div className="col-md-6 mb-4 mb-md-0">
                    <img
                        src="https://brantashop.com/cdn/shop/files/Untitled_design.png?v=1695800318&width=1070"
                        className="img-fluid "
                        style={{ height: "500px", objectFit: "cover" }} // adjust height as needed
                        alt="First Night Woman"
                    />
                </div>


                <div className="col-md-6 text-start">
                    <h2 className="fw-bold">
                        Welcome to First Night –<br />Your Trusted E-Commerce Destination!
                    </h2>
                    <p className="mt-3">
                        Welcome to First Night – Your Trusted E-Commerce Destination!
                    </p>
                    <p>
                        At First Night, we are proud to be your go-to destination for a wide range of
                        products that cater to your every need. With over three years of expertise in
                        the industry, we aim to deliver the best online shopping experience for all our
                        customers.
                    </p>
                    <h3 > Our Journey </h3>
                    <p>
                        Our journey began with a simple idea: to create a platform where you can discover and
                        shop for high-quality products with ease. Over the years, we have tirelessly worked
                        towards turning that vision into reality. Today, we stand tall as a trusted name in
                        the e-commerce world, offering an extensive catalog of products that span across
                        various categories.
                    </p>
                   
                </div>
            </div>


            <div className="row align-items-center mb-5">


                <div className="col-md-6 text-start">
                    <h2 className="fw-bold mb-3"> Our Commitment  </h2>
                    <p>
                        Our commitment to our customers is unwavering. We believe in providing you with:
                    </p>
                    <p>
                        <strong>Quality:</strong>
                        Every product we offer is carefully curated and selected to meet the highest standards of quality.
                        We want you to have products that you can trust.
                    </p>
                    <p>
                        <strong>Convenience::</strong>
                        Shopping with First Night is a breeze. Our user-friendly website is designed to make your online 
                        shopping experience seamless and enjoyable.

                    </p>
                    <p>
                        <strong>Satisfaction:</strong>
                        With over 2 lakh satisfied customers, we take pride in knowing that we have made a difference
                        in your lives. Your satisfaction is our ultimate reward.

                    </p>
                   
                </div>

                <div className="col-md-6 mb-4 mb-md-0">
                    <img
                        src = "https://brantashop.com/cdn/shop/files/Untitled_design_1.png?v=1695800421&width=1070"
                        className="img-fluid"
                        style={{ height: "500px", objectFit: "cover" }} // adjust height as needed
                        alt="First Night Woman"
                    />
                </div>
            </div>


           
            <div className="row align-items-center mb-5">
                <div className="col-md-6 mb-4 mb-md-0">
                    <img
                        src="https://brantashop.com/cdn/shop/files/Untitled_design_3.png?v=1695801061&width=1070"
                        className="img-fluid"
                        style={{ height: "500px", objectFit: "cover" }} // adjust height as needed
                        alt="First Night Woman"
                    />
                </div>


                <div className="col-md-6 text-start">
                    <h2 className="fw-bold"> Our Team </h2>

                    <p>
                        Behind First Night's success is a dedicated team of individuals who are passionate about what they do.
                        Our team members work tirelessly to ensure that you receive the best products and service possible.
                        We are here to assist you every step of the way.

                    </p>
                    <h3 > Get in Touch </h3>
                    <p>
                        We love hearing from our customers. If you have any questions, 
                        feedback, or suggestions, please don't hesitate to reach out to us. Your input helps us continually 
                        improve and provide you with an even better shopping experience.

                    </p>
                    <p>
                        Thank you for choosing First Night as your trusted e-commerce destination. We look forward to serving you 
                        and exceeding your expectations.

                    </p>
                 
                </div>
            </div>

        </div>
    );
}

export default Aboutus;