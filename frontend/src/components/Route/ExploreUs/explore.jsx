import React from "react";
import { Link } from "react-router-dom";

const Explore = () => {
  const exploreus = [
    {
      title: "Product and Service Listings",
      description:
        "Empower women to showcase and sell their products and services, reaching a wider audience through the platform.",
      image: "PRODUCTSANDSERVICES.jpg", // Replace with your image path
      link: "/products", // Path to the products page
    },
    {
      title: "Skill Development through Online Videos",
      description:
        "Offering a variety of online video tutorials to help women develop new skills and enhance their knowledge for personal and professional growth.",
      image: "image.png", 
      link: "/Workshops", // Path to the Workshops page
    },
    {
      title: "Data Analytics and Reports",
      description:
        "Providing detailed insights into product trends, demographic reports, and GIS-based demand forecasting to guide business decisions.",
      image: "data.jpg", 
      link: "/sales-analysis", // Path to the GIS page
    },
  ];

  return (
    <div className="bg-[#f3e7df] py-12 px-4">
      <div className="text-center mb-12">
        <p className="text-sm text-[#b28b67] uppercase">This is what we do</p>
        <h1 className="text-4xl font-semibold text-[#2b2b2b]">Our Services</h1>
      </div>
      <div className="max-w-6xl mx-auto grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {exploreus.map((service, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-lg overflow-hidden transition-transform transform hover:scale-105"
          >
            {/* Wrap the entire card in Link */}
            <Link to={service.link}>
              <div className="h-64 bg-cover bg-center" style={{ backgroundImage: `url(${service.image})` }}></div>
              <div className="p-6 text-center">
                <h2 className="text-2xl font-bold mb-4 text-[#2b2b2b]">{service.title}</h2>
                <p className="text-sm text-[#5f5f5f] mb-4">{service.description}</p>
                <button className="text-[#b28b67] font-semibold">EXPLORE</button>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Explore;