import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import styles from "../../styles/styles";
import { useSelector } from "react-redux";
import ProductCard from "../Route/ProductCard/ProductCard";
import Loader from "../Layout/Loader";
import { BiFilter } from "react-icons/bi";
import { FiSearch } from "react-icons/fi";
import { X } from "lucide-react";
import Header from "../Layout/Header";
import Footer from "../Layout/Footer";

const SearchResults = () => {
  const location = useLocation();
  const { allProducts, isLoading } = useSelector((state) => state.products);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [sortBy, setSortBy] = useState("default");
  const [priceRange, setPriceRange] = useState({ min: 0, max: Infinity });
  const [showFilters, setShowFilters] = useState(false);

  // Get search query from URL
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const query = searchParams.get("q");
    if (query) {
      setSearchQuery(query);
    }
  }, [location.search]);

  // Filter products based on search query, price range, and sorting
  useEffect(() => {
    if (searchQuery && allProducts && allProducts.length > 0) {
      // First filter by search query
      let filteredResults = allProducts.filter((product) => 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (product.category && product.category.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      
      // Then apply price filter - considering both discount price and original price
      if (priceRange.min !== 0 || priceRange.max !== Infinity) {
        filteredResults = filteredResults.filter(product => {
          // Get the effective price (discount price if exists, otherwise original price)
          const effectivePrice = product.discountPrice ? product.discountPrice : product.originalPrice;
          
          return effectivePrice >= priceRange.min && 
                 effectivePrice <= (priceRange.max === Infinity ? 1000000 : priceRange.max);
        });
      }
      
      // Apply sorting - updated to consider discount price if available
      let sortedResults = [...filteredResults];
      if (sortBy === "price-low-to-high") {
        sortedResults.sort((a, b) => {
          const priceA = a.discountPrice || a.originalPrice;
          const priceB = b.discountPrice || b.originalPrice;
          return priceA - priceB;
        });
      } else if (sortBy === "price-high-to-low") {
        sortedResults.sort((a, b) => {
          const priceA = a.discountPrice || a.originalPrice;
          const priceB = b.discountPrice || b.originalPrice;
          return priceB - priceA;
        });
      } else if (sortBy === "newest-first") {
        sortedResults.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }
      setSearchResults(sortedResults);
    }
  }, [searchQuery, allProducts, sortBy, priceRange]);

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  const handlePriceChange = (e) => {
    const { name, value } = e.target;
    setPriceRange((prev) => ({
      ...prev,
      [name]: value === "" ? (name === "max" ? Infinity : 0) : parseFloat(value),
    }));
  };

  // Reset price filter
  const resetPriceFilter = () => {
    setPriceRange({ min: 0, max: Infinity });
  };

  // Toggle filter sidebar
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  // Close filter when clicking outside (for mobile)
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showFilters && !e.target.closest('.filter-sidebar') && !e.target.closest('.filter-button')) {
        setShowFilters(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showFilters]);

  // Function to display the price range considering discounts
  const displayPriceRangeText = () => {
    const minPrice = priceRange.min;
    const maxPrice = priceRange.max === Infinity ? 'Any' : priceRange.max;
    return `Price: Rs${minPrice} - Rs${maxPrice}`;
  };

  return (
    <>
      <Header activeHeading={1} />
      <div className={`${styles.section} mt-8 mb-20`}>
        {/* Search results header */}
        <div className="bg-white p-4 rounded-md shadow-md mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FiSearch className="text-[#c8a4a5] mr-2" size={22} />
              <h2 className="text-xl font-medium">
                Search results for "{searchQuery}"
              </h2>
            </div>
            <p className="text-gray-500">
              {searchResults.length} {searchResults.length === 1 ? "product" : "products"} found
            </p>
          </div>
          
          {/* Active filters display */}
          {(priceRange.min !== 0 || priceRange.max !== Infinity) && (
            <div className="mt-3 flex items-center">
              <span className="text-sm text-gray-600 mr-2">Active filters:</span>
              <div className="px-3 py-1 bg-[#f7f1f1] rounded-full text-sm text-[#5a4336] flex items-center gap-2">
                {displayPriceRangeText()}
                <button
                  onClick={resetPriceFilter}
                  className="ml-2 text-[#8c6c6b] hover:text-[#5a4336]"
                >
                  ×
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          {/* Mobile filter toggle button */}
          <div className="md:hidden mb-4">
            <button
              onClick={toggleFilters}
              className="filter-button flex items-center justify-center px-4 py-2 bg-[#c8a4a5] text-white rounded-md w-full"
            >
              <BiFilter className="mr-2" />
              {showFilters ? "Hide Filters" : "Show Filters"}
            </button>
          </div>

          {/* Filter sidebar - desktop version always visible, mobile version toggleable */}
          <div className={`md:w-1/4 filter-sidebar p-4 bg-white rounded-md shadow-md transition-all duration-300 
            ${showFilters ? 'fixed inset-y-0 right-0 z-50 w-64 h-full overflow-y-auto' : 'hidden md:block'}`}>
            
            {/* Mobile close button */}
            {showFilters && (
              <div className="flex justify-between items-center mb-4 md:hidden">
                <h3 className="text-lg font-medium text-[#5a4336]">Filters</h3>
                <button
                  onClick={toggleFilters}
                  className="text-[#8c6c6b] hover:text-[#5a4336]"
                >
                  <X size={20} />
                </button>
              </div>
            )}

            <div className="mb-6">
              <h3 className="text-lg font-medium mb-3 text-[#5a4336] hidden md:block">Filters</h3>
              <hr className="mb-4" />
              
              <div className="mb-4">
                <h4 className="font-medium mb-2 text-gray-700">Price Range</h4>
             
                <div className="flex flex-col gap-2">
                  <label className="text-sm text-[#8c6c6b]">Minimum Price (Rs)</label>
                  <input
                    type="number"
                    name="min"
                    placeholder="Min"
                    value={priceRange.min === 0 ? "" : priceRange.min}
                    onChange={handlePriceChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#c8a4a5]"
                  />
                </div>
                <div className="flex flex-col gap-2 mt-2">
                  <label className="text-sm text-[#8c6c6b]">Maximum Price (Rs)</label>
                  <input
                    type="number"
                    name="max"
                    placeholder="Max"
                    value={priceRange.max === Infinity ? "" : priceRange.max}
                    onChange={handlePriceChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#c8a4a5]"
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <h4 className="font-medium mb-2 text-gray-700">Sort By</h4>
                <select
                  value={sortBy}
                  onChange={handleSortChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#c8a4a5]"
                >
                 
                  <option value="price-low-to-high">Price: Low to High</option>
                  <option value="price-high-to-low">Price: High to Low</option>
                  <option value="newest-first">Newest First</option>
                </select>
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="md:w-3/4">
            {/* Products grid */}
            {isLoading ? (
              <Loader />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {searchResults && searchResults.length > 0 ? (
                  searchResults.map((product, index) => (
                    <ProductCard data={product} key={index} />
                  ))
                ) : (
                  <div className="col-span-full flex flex-col items-center justify-center p-8 bg-white rounded-md shadow-md">
                    <img
                      src="/no-results.svg" // Add a no results SVG or image
                      alt="No results found"
                      className="w-40 h-40 mb-4 opacity-60"
                    />
                    <h3 className="text-xl font-medium text-gray-700 mb-2">No products found</h3>
                    <p className="text-gray-500 text-center">
                      We couldn't find any products matching "{searchQuery}".
                      <br />Try different keywords or browse our categories.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default SearchResults;