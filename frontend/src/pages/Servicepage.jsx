import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useSearchParams } from "react-router-dom";
import { getAllServices } from "../redux/actions/service";
import { getAllServiceCategories } from "../redux/actions/serviceCategory";
import { AiOutlineClockCircle, AiOutlineEnvironment, AiOutlinePhone, AiOutlineSearch, AiOutlineFlag, AiOutlineDown } from "react-icons/ai";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Header from "../components/Layout/Header";
import Footer from "../components/Layout/Footer";
import Loader from "../components/Layout/Loader";
import ReportServiceModal from "./reportservice";

const AllServicesPage = () => {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isLoading, services, error } = useSelector((state) => state.services);
  const { categories } = useSelector((state) => state.serviceCategoryReducer || { categories: [] });
  
  // Get URL parameters
  const pageParam = searchParams.get("page");
  const categoryParam = searchParams.get("category");
  const searchParam = searchParams.get("search");
  
  const [searchTerm, setSearchTerm] = useState(searchParam || "");
  const [selectedCategory, setSelectedCategory] = useState(categoryParam || "");
  const [filteredServices, setFilteredServices] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const searchInputRef = useRef(null);
  const dropdownRef = useRef(null);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [servicesPerPage] = useState(12);
  const [totalPages, setTotalPages] = useState(1);
  const [paginatedServices, setPaginatedServices] = useState([]);
  
  // Report Modal State
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [serviceToReport, setServiceToReport] = useState({
    id: null,
    name: ""
  });

  // Load all services and categories only once
  useEffect(() => {
    dispatch(getAllServices());
    dispatch(getAllServiceCategories());
  }, [dispatch]);

  // Initialize states from URL parameters
  useEffect(() => {
    const urlPage = parseInt(pageParam) || 1;
    const urlCategory = categoryParam || "";
    const urlSearch = searchParam || "";
    
    setCurrentPage(urlPage);
    setSelectedCategory(urlCategory);
    setSearchTerm(urlSearch);
  }, [pageParam, categoryParam, searchParam]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Helper function to check if a service belongs to "Others" category
  const isOthersCategory = (service) => {
    if (!service.category) return true;
    const categoryExists = categories && categories.some(cat => cat._id === service.category._id);
    return !categoryExists;
  };

  // Filter services and calculate pagination
  useEffect(() => {
    if (services && services.length > 0) {
      let results = services;

      // Filter by category first
      if (selectedCategory) {
        if (selectedCategory === "others") {
          results = results.filter(service => isOthersCategory(service));
        } else {
          results = results.filter(service => 
            service.category && service.category._id === selectedCategory
          );
        }
      }

      // Then filter by search term
      if (searchTerm.trim()) {
        const lowercasedTerm = searchTerm.toLowerCase();
        results = results.filter(
          service =>
            service.name.toLowerCase().includes(lowercasedTerm) ||
            service.description.toLowerCase().includes(lowercasedTerm) ||
            service.location.toLowerCase().includes(lowercasedTerm)
        );
      }

      setFilteredServices(results);
      
      // Calculate total pages
      const pages = Math.ceil((results?.length || 0) / servicesPerPage);
      setTotalPages(Math.max(1, pages));
      
      // Reset to page 1 when filters change
      if (searchTerm !== searchParam || selectedCategory !== categoryParam) {
        setCurrentPage(1);
      }
    } else {
      setFilteredServices([]);
      setTotalPages(1);
    }
  }, [services, searchTerm, selectedCategory, categories, servicesPerPage, searchParam, categoryParam]);

  // Handle pagination of filtered services
  useEffect(() => {
    const indexOfLastService = currentPage * servicesPerPage;
    const indexOfFirstService = indexOfLastService - servicesPerPage;
    
    const paginated = Array.isArray(filteredServices) 
      ? filteredServices.slice(indexOfFirstService, indexOfLastService) 
      : [];
    
    setPaginatedServices(paginated);
  }, [filteredServices, currentPage, servicesPerPage]);

  // Update URL parameters
  const updateSearchParams = (newParams) => {
    const updatedParams = new URLSearchParams();
    
    // Add non-empty parameters
    Object.entries(newParams).forEach(([key, value]) => {
      if (value && value !== "") {
        updatedParams.set(key, value);
      }
    });
    
    setSearchParams(updatedParams);
  };

  // Handle search input changes
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    // Update URL with search term and reset page
    updateSearchParams({
      search: value,
      category: selectedCategory,
      page: "1"
    });
  };

  // Clear search results
  const handleClearSearch = () => {
    setSearchTerm("");
    updateSearchParams({
      category: selectedCategory,
      page: "1"
    });
    
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  // Handle category selection
  const handleCategorySelect = (categoryId, categoryName) => {
    setSelectedCategory(categoryId);
    setIsDropdownOpen(false);
    
    // Update URL with category and reset page
    updateSearchParams({
      search: searchTerm,
      category: categoryId,
      page: "1"
    });
  };

  // Clear category filter
  const handleClearCategory = () => {
    setSelectedCategory("");
    updateSearchParams({
      search: searchTerm,
      page: "1"
    });
  };

  // Handle page change
  const handlePageChange = (pageNumber) => {
    if (pageNumber < 1 || pageNumber > totalPages || pageNumber === currentPage) {
      return;
    }
    
    setCurrentPage(pageNumber);
    updateSearchParams({
      search: searchTerm,
      category: selectedCategory,
      page: pageNumber.toString()
    });
    
    // Scroll to top when changing pages
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  // Generate pagination numbers with ellipsis
  const renderPaginationNumbers = () => {
    let pages = [];
    
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      
      if (currentPage <= 3) {
        pages.push(2, 3, 4, 5, "...", totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push("...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push("...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
      }
    }
    
    return pages;
  };

  // Get selected category name
  const getSelectedCategoryName = () => {
    if (!selectedCategory) return "All Categories";
    if (selectedCategory === "others") return "Others";
    
    if (!categories) return "All Categories";
    const category = categories.find(cat => cat._id === selectedCategory);
    return category ? category.name : "All Categories";
  };

  // Count services in "Others" category
  const getOthersCount = () => {
    if (!services) return 0;
    return services.filter(service => isOthersCategory(service)).length;
  };
  
  // Open report modal for a specific service
  const handleReportService = (service) => {
    setServiceToReport({
      id: service._id,
      name: service.name
    });
    setReportModalOpen(true);
  };
  
  // Close report modal
  const handleCloseReportModal = () => {
    setReportModalOpen(false);
    setTimeout(() => {
      setServiceToReport({
        id: null,
        name: ""
      });
    }, 300);
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
              <p className="text-[#a67d6d] text-lg mb-8">
                {filteredServices?.length} {filteredServices?.length === 1 ? "service" : "services"} available
              </p>
              
              {/* Search and Filter Section */}
              <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-8 max-w-4xl mx-auto">
                {/* Search Bar */}
                <div className="relative flex-1 max-w-md">
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

                {/* Category Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center justify-between w-48 py-2 px-4 rounded-full border border-[#a67d6d] bg-white/90 backdrop-blur-sm hover:bg-white transition-all focus:outline-none focus:ring-2 focus:ring-[#5a4336]"
                  >
                    <span className="text-[#5a4336] truncate">
                      {getSelectedCategoryName()}
                    </span>
                    <AiOutlineDown 
                      className={`text-[#a67d6d] transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} 
                    />
                  </button>
                  
                  {isDropdownOpen && (
                    <div className="absolute top-full mt-1 w-full bg-white rounded-lg shadow-lg border border-[#a67d6d]/20 z-10 max-h-60 overflow-y-auto">
                      <button
                        onClick={() => handleCategorySelect("", "All Categories")}
                        className={`w-full text-left px-4 py-2 hover:bg-[#5a4336]/10 transition-colors ${
                          !selectedCategory ? 'bg-[#5a4336]/20 text-[#5a4336] font-medium' : 'text-gray-700'
                        }`}
                      >
                        All Categories
                      </button>
                      
                      {categories && categories.map((category) => (
                        <button
                          key={category._id}
                          onClick={() => handleCategorySelect(category._id, category.name)}
                          className={`w-full text-left px-4 py-2 hover:bg-[#5a4336]/10 transition-colors ${
                            selectedCategory === category._id ? 'bg-[#5a4336]/20 text-[#5a4336] font-medium' : 'text-gray-700'
                          }`}
                        >
                          {category.name}
                        </button>
                      ))}
                      
                      <button
                        onClick={() => handleCategorySelect("others", "Others")}
                        className={`w-full text-left px-4 py-2 hover:bg-[#5a4336]/10 transition-colors border-t border-gray-200 ${
                          selectedCategory === "others" ? 'bg-[#5a4336]/20 text-[#5a4336] font-medium' : 'text-gray-700'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span>Others</span>
                          <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                            {getOthersCount()}
                          </span>
                        </div>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Active Filters Display */}
              {(selectedCategory || searchTerm) && (
                <div className="flex flex-wrap justify-center gap-2 mb-6">
                  {selectedCategory && (
                    <div className="flex items-center bg-[#5a4336] text-white px-3 py-1 rounded-full text-sm">
                      <span>Category: {getSelectedCategoryName()}</span>
                      <button
                        onClick={handleClearCategory}
                        className="ml-2 hover:text-gray-300"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                  {searchTerm && (
                    <div className="flex items-center bg-[#a67d6d] text-white px-3 py-1 rounded-full text-sm">
                      <span>Search: "{searchTerm}"</span>
                      <button
                        onClick={handleClearSearch}
                        className="ml-2 hover:text-gray-300"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Services Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {paginatedServices.length > 0 ? (
                paginatedServices.map((service) => (
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
                        <div className="mt-2">
                          <span className="inline-block bg-white/20 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
                            {service.category && categories && categories.some(cat => cat._id === service.category._id) 
                              ? service.category.name 
                              : 'Others'
                            }
                          </span>
                        </div>
                      </div>
                      
                      <button 
                        onClick={() => handleReportService(service)}
                        className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/30 rounded-full text-white backdrop-blur-sm transition-all duration-300"
                        title="Report this service"
                      >
                        <AiOutlineFlag size={18} />
                      </button>
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
                  {searchTerm || selectedCategory ? (
                    <>
                      <h3 className="text-2xl font-semibold text-[#5a4336] mb-4">
                        No Matches Found
                      </h3>
                      <p className="text-[#a67d6d] mb-4">
                        We couldn't find any services that match your current filters.
                      </p>
                      <div className="flex flex-wrap justify-center gap-2">
                        {searchTerm && (
                          <button
                            onClick={handleClearSearch}
                            className="py-2 px-4 bg-[#a67d6d] text-white rounded-lg hover:bg-[#5a4336] transition-colors"
                          >
                            Clear Search
                          </button>
                        )}
                        {selectedCategory && (
                          <button
                            onClick={handleClearCategory}
                            className="py-2 px-4 bg-[#a67d6d] text-white rounded-lg hover:bg-[#5a4336] transition-colors"
                          >
                            Clear Category
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setSearchTerm("");
                            setSelectedCategory("");
                            updateSearchParams({ page: "1" });
                          }}
                          className="py-2 px-4 bg-[#5a4336] text-white rounded-lg hover:bg-[#a67d6d] transition-colors"
                        >
                          Show All Services
                        </button>
                      </div>
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

            {/* Pagination */}
            {filteredServices?.length > 0 && totalPages > 1 && (
              <>
                <div className="flex justify-center items-center mb-8">
                  <div className="flex items-center space-x-2">
                    {/* Previous Button */}
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`flex items-center justify-center w-10 h-10 rounded-full 
                        ${currentPage === 1 
                          ? "bg-[#d8c4b8]/30 text-[#8c6c6b]/50 cursor-not-allowed" 
                          : "bg-white text-[#5a4336] hover:bg-gradient-to-r hover:from-[#c8a4a5] hover:to-[#8c6c6b] hover:text-white shadow-md"
                        }`}
                    >
                      <ChevronLeft size={18} />
                    </button>
                    
                    {/* Page Numbers */}
                    {renderPaginationNumbers().map((page, index) => (
                      page === "..." ? (
                        <span key={`ellipsis-${index}`} className="text-[#8c6c6b] px-2">...</span>
                      ) : (
                        <button
                          key={`page-${page}`}
                          onClick={() => handlePageChange(page)}
                          className={`flex items-center justify-center w-10 h-10 rounded-full text-sm font-medium transition-all shadow-md
                            ${currentPage === page
                              ? "bg-gradient-to-r from-[#c8a4a5] to-[#8c6c6b] text-white"
                              : "bg-white text-[#5a4336] hover:bg-gradient-to-r hover:from-[#c8a4a5] hover:to-[#8c6c6b] hover:text-white"
                            }`}
                        >
                          {page}
                        </button>
                      )
                    ))}
                    
                    {/* Next Button */}
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`flex items-center justify-center w-10 h-10 rounded-full 
                        ${currentPage === totalPages 
                          ? "bg-[#d8c4b8]/30 text-[#8c6c6b]/50 cursor-not-allowed" 
                          : "bg-white text-[#5a4336] hover:bg-gradient-to-r hover:from-[#c8a4a5] hover:to-[#8c6c6b] hover:text-white shadow-md"
                        }`}
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>

                {/* Current Page Indicator */}
                <div className="text-center text-sm text-[#8c6c6b]">
                  Page {currentPage} of {totalPages} • Showing {paginatedServices?.length} of {filteredServices?.length} services
                </div>
              </>
            )}
          </div>
        )}
      </div>
      
      {/* Report Service Modal */}
      <ReportServiceModal 
        serviceId={serviceToReport.id}
        serviceName={serviceToReport.name}
        isOpen={reportModalOpen}
        onClose={handleCloseReportModal}
      />
      
      <Footer />
    </>
  );
};

export default AllServicesPage;