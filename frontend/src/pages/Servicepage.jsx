import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { getAllServices } from "../redux/actions/service";
import { AiOutlineClockCircle, AiOutlineEnvironment, AiOutlinePhone, AiOutlineSearch } from "react-icons/ai";
import Header from "../components/Layout/Header";
import Footer from "../components/Layout/Footer";
import Loader from "../components/Layout/Loader";

const AllServicesPage = () => {
  const dispatch = useDispatch();
  const { isLoading, services, error } = useSelector((state) => state.services);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredServices, setFilteredServices] = useState([]);
  const searchInputRef = useRef(null);

  // Load all services only once
  useEffect(() => {
    dispatch(getAllServices());
  }, [dispatch]);

  // Filter services client-side whenever services or searchTerm changes
  useEffect(() => {
    if (services && services.length > 0) {
      if (!searchTerm.trim()) {
        setFilteredServices(services);
      } else {
        const lowercasedTerm = searchTerm.toLowerCase();
        const results = services.filter(
          service =>
            service.name.toLowerCase().includes(lowercasedTerm) ||
            service.description.toLowerCase().includes(lowercasedTerm) ||
            service.location.toLowerCase().includes(lowercasedTerm)
        );
        setFilteredServices(results);
      }
    } else {
      setFilteredServices([]);
    }
  }, [services, searchTerm]);

  // Handle search input changes - no debounce needed as we're filtering client-side
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Clear search results
  const handleClearSearch = () => {
    setSearchTerm("");
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  return (
    <>
      <Header activeHeading={5} />
      <div className="min-h-screen bg-gradient-to-b from-[#f8f4f1] to-[#e6d8d8] py-16">
        {isLoading ? (
          <Loader />
        ) : error ? (
          <div className="text-center text-red-500 p-8 bg-white/80 rounded-lg mx-auto max-w-2xl">
            <h2 className="text-2xl font-bold mb-2">Oops!</h2>
            <p>{error}</p>
          </div>
        ) : (
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h1 className="text-5xl font-bold text-[#5a4336] mb-4">
                Discover Amazing Services
              </h1>
              
              {/* Elegant, Compact Search Bar */}
              <div className="relative mx-auto mb-8 max-w-md">
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search services..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="w-full py-2 px-4 pl-10 rounded-full border border-[#a67d6d] focus:outline-none focus:ring-2 focus:ring-[#5a4336] bg-white/90 backdrop-blur-sm transition-all"
                />
                <AiOutlineSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#a67d6d]" />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#a67d6d] hover:text-[#5a4336] text-sm"
                  >
                    ✕
                  </button>
                )}
              </div>
              
              {/* Search Results Indicator - Only show when searching */}
              {searchTerm && (
                <p className="text-[#a67d6d] text-sm mb-4">
                  {filteredServices.length} {filteredServices.length === 1 ? "result" : "results"} found
                </p>
              )}
              
              <p className="text-[#a67d6d] text-lg max-w-2xl mx-auto mb-8">
                Explore our curated collection of premium services designed to meet your needs
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredServices.length > 0 ? (
                filteredServices.map((service) => (
                  <div
                    key={service._id}
                    className="group relative overflow-hidden rounded-2xl bg-white shadow-xl transition-all duration-300 hover:shadow-2xl hover:translate-y-[-5px]"
                  >
                    {/* Service Card Header */}
                    <div className="relative h-48 bg-gradient-to-r from-[#d8c4b8] to-[#c8a4a5] p-6">
                      <div className="absolute bottom-4 left-6">
                        <h3 className="text-2xl font-bold text-white mb-2">
                          {service.name}
                        </h3>
                        <div className="flex items-center text-white/90">
                          <AiOutlineEnvironment className="mr-2" />
                          <span>{service.location}</span>
                        </div>
                      </div>
                    </div>

                    {/* Service Card Body */}
                    <div className="p-6">
                      <p className="text-gray-600 mb-6 line-clamp-3">
                        {service.description}
                      </p>

                      <div className="space-y-3 mb-6">
                        <div className="flex items-center text-[#a67d6d]">
                          <AiOutlinePhone className="mr-2" />
                          <span>{service.contactInfo}</span>
                        </div>
                        <div className="flex items-center text-[#a67d6d]">
                          <AiOutlineClockCircle className="mr-2" />
                          <span>
                            {Object.entries(service.availability || {})
                              .filter(([, info]) => info.available)
                              .length} days available
                          </span>
                        </div>
                      </div>

                      <Link
                        to={`/service/${service._id}`}
                        className="block w-full text-center py-3 px-6 bg-gradient-to-r from-[#5a4336] to-[#a67d6d] text-white rounded-xl hover:from-[#a67d6d] hover:to-[#5a4336] transition-all duration-300 transform hover:scale-105"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center p-12 bg-white/80 rounded-2xl">
                  {searchTerm ? (
                    <>
                      <h3 className="text-2xl font-semibold text-[#5a4336] mb-4">
                        No Matches Found
                      </h3>
                      <p className="text-[#a67d6d] mb-4">
                        We couldn't find any services that match "{searchTerm}".
                      </p>
                      <button
                        onClick={handleClearSearch}
                        className="py-2 px-4 bg-[#a67d6d] text-white rounded-lg hover:bg-[#5a4336] transition-colors"
                      >
                        Show All Services
                      </button>
                    </>
                  ) : (
                    <>
                      <h3 className="text-2xl font-semibold text-[#5a4336] mb-4">
                        No Services Available
                      </h3>
                      <p className="text-[#a67d6d]">
                        Check back soon for new service offerings!
                      </p>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default AllServicesPage;