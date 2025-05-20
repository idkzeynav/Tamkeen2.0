import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useSearchParams, useNavigate } from "react-router-dom";
import Footer from "../components/Layout/Footer";
import Header from "../components/Layout/Header";
import Loader from "../components/Layout/Loader";
import ProductCard from "../components/Route/ProductCard/ProductCard";
import { categoriesData } from "../static/data";
import { X, SlidersHorizontal } from "lucide-react";

const ProductsPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const categoryData = searchParams.get("category");
  const { allProducts, isLoading } = useSelector((state) => state.products);
  const [data, setData] = useState([]);
  const [priceRange, setPriceRange] = useState({ min: 0, max: Infinity });
  const [showCategories, setShowCategories] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    let filteredData = allProducts;

    if (categoryData) {
      // Make case-insensitive comparison
      filteredData = filteredData?.filter((product) => {
        // Handle both cases where category might be stored differently
        const productCategory = product.category?.toLowerCase() || "";
        return productCategory === categoryData.toLowerCase();
      });
      
      // Debug log to help identify category issues
      console.log("Category filter:", {
        requestedCategory: categoryData,
        availableCategories: [...new Set(allProducts?.map(p => p.category))],
        filteredCount: filteredData?.length
      });
    }

    if (priceRange.min !== 0 || priceRange.max !== Infinity) {
      filteredData = filteredData?.filter((product) => {
        // Get the effective price (discount price if it exists, otherwise original price)
        const effectivePrice = product.discountPrice || product.originalPrice;
        return effectivePrice >= priceRange.min && effectivePrice <= priceRange.max;
      });
    }

    setData(filteredData);
  }, [allProducts, categoryData, priceRange]);

  const handlePriceChange = (e) => {
    const { name, value } = e.target;
    setPriceRange((prev) => ({
      ...prev,
      [name]: value === "" ? (name === "max" ? Infinity : 0) : parseFloat(value),
    }));
  };

  // Function to handle category selection
  const handleCategoryClick = (categoryTitle) => {
    navigate(`/products?category=${encodeURIComponent(categoryTitle)}`);
    setShowCategories(false); // Hide categories after selection
  };

  // Close filter when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isFilterOpen && !e.target.closest('.filter-sidebar') && !e.target.closest('.filter-button')) {
        setIsFilterOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isFilterOpen]);

  return (
    <div className="min-h-screen bg-[#f7f1f1]">
      <Header activeHeading={3} />

      {/* Page Title */}
      <div className="bg-[#f7f1f1] py-12 border-b border-[#d8c4b8]/20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-[#5a4336] mb-3">
              {categoryData || "All Products"}
            </h1>
            <p className="text-[#a67d6d] text-lg">
              {data?.length} {data?.length === 1 ? "product" : "products"} available
            </p>
          </div>
        </div>
      </div>

      {/* Filter Bar with Categories */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-[#f7f1f1] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/products")}
                className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-all
                  ${!categoryData 
                    ? "bg-gradient-to-r from-[#c8a4a5] to-[#8c6c6b] text-white"
                    : "bg-[#f7f1f1] hover:bg-gradient-to-r hover:from-[#c8a4a5] hover:to-[#8c6c6b] hover:text-white text-[#5a4336]"
                  }`}
              >
                All Products
              </button>

              <button
                onClick={() => setShowCategories(!showCategories)}
                className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-all
                  ${showCategories 
                    ? "bg-gradient-to-r from-[#c8a4a5] to-[#8c6c6b] text-white"
                    : "bg-[#f7f1f1] hover:bg-gradient-to-r hover:from-[#c8a4a5] hover:to-[#8c6c6b] hover:text-white text-[#5a4336]"
                  }`}
              >
                Categories {showCategories ? "−" : "+"}
              </button>

              {/* Active Price Filter Display */}
              {(priceRange.min !== 0 || priceRange.max !== Infinity) && (
                <div className="px-4 py-2 bg-[#f7f1f1] rounded-full text-sm text-[#5a4336] flex items-center gap-2">
                  Price: Rs{priceRange.min} - Rs{priceRange.max === Infinity ? 'Any' : priceRange.max}
                  <button
                    onClick={() => setPriceRange({ min: 0, max: Infinity })}
                    className="ml-2 text-[#8c6c6b] hover:text-[#5a4336]"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>

            {/* Filter Toggle Button */}
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="filter-button px-4 py-2 bg-white rounded-full text-sm text-[#5a4336] flex items-center gap-2 hover:bg-[#f7f1f1] transition-all shadow-sm"
            >
              <SlidersHorizontal size={16} />
              Filters
            </button>
          </div>

          {/* Categories Sliding Menu (Original) */}
          <div className={`relative overflow-hidden transition-all duration-300 ease-in-out ${showCategories ? "max-h-96 opacity-100 mt-4" : "max-h-0 opacity-0"}`}>
            <div className="flex flex-wrap gap-4">
              {categoriesData.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryClick(category.title)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm whitespace-nowrap transition-all
                    ${categoryData?.toLowerCase() === category.title.toLowerCase()
                      ? "bg-gradient-to-r from-[#c8a4a5] to-[#8c6c6b] text-white"
                      : "bg-[#f7f1f1] hover:bg-gradient-to-r hover:from-[#c8a4a5] hover:to-[#8c6c6b] hover:text-white text-[#5a4336]"
                    }`}
                >
                  <img
                    src={category.image_Url}
                    alt={category.title}
                    className="w-4 h-4 rounded-full object-cover"
                  />
                  {category.title}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative max-w-7xl mx-auto px-4 py-8">
        {/* Product Grid */}
        <div className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 transition-all duration-300 ${isFilterOpen ? 'mr-80' : ''}`}>
          {isLoading ? (
            <Loader />
          ) : data?.length > 0 ? (
            data.map((product, index) => (
              <div key={index} className="group">
                <div className="relative overflow-hidden rounded-xl transition-transform duration-300 group-hover:scale-98">
                  <ProductCard data={product} />
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center h-64 bg-[#d8c4b8]/10 rounded-2xl p-8">
              <p className="text-xl text-[#5a4336] mb-4">No products found</p>
              <button
                onClick={() => navigate("/products")}
                className="px-6 py-2 bg-gradient-to-r from-[#c8a4a5] to-[#8c6c6b] text-white rounded-full hover:opacity-90 transition-all"
              >
                View All Products
              </button>
            </div>
          )}
        </div>

        {/* Price Filter Sidebar */}
        <div 
          className={`filter-sidebar fixed top-0 right-0 h-full w-80 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50 
            ${isFilterOpen ? 'translate-x-0' : 'translate-x-full'}`}
        >
          <div className="p-6 h-full overflow-y-auto">
            {/* Filter Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-[#5a4336]">Price Filter</h2>
              <button
                onClick={() => setIsFilterOpen(false)}
                className="text-[#8c6c6b] hover:text-[#5a4336] transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Price Filter Section */}
            <div className="mb-8">
              <h3 className="text-sm font-medium text-[#5a4336] mb-4">Price Range</h3>
              <div className="space-y-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm text-[#8c6c6b]">Minimum Price (Rs)</label>
                  <input
                    type="number"
                    name="min"
                    placeholder="Min"
                    value={priceRange.min === 0 ? "" : priceRange.min}
                    onChange={handlePriceChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-[#c8a4a5] text-sm"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm text-[#8c6c6b]">Maximum Price (Rs)</label>
                  <input
                    type="number"
                    name="max"
                    placeholder="Max"
                    value={priceRange.max === Infinity ? "" : priceRange.max}
                    onChange={handlePriceChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-[#c8a4a5] text-sm"
                  />
                </div>
              </div>

              {/* Category Selection in Sidebar */}
              <div className="mt-8">
                <h3 className="text-sm font-medium text-[#5a4336] mb-4">Categories</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => navigate("/products")}
                    className={`block w-full text-left px-3 py-2 rounded-lg text-sm ${!categoryData ? "bg-[#f7f1f1] font-medium" : "hover:bg-[#f7f1f1]"}`}
                  >
                    All Products
                  </button>
                  {categoriesData.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => handleCategoryClick(category.title)}
                      className={`block w-full text-left px-3 py-2 rounded-lg text-sm ${categoryData?.toLowerCase() === category.title.toLowerCase() ? "bg-[#f7f1f1] font-medium" : "hover:bg-[#f7f1f1]"}`}
                    >
                      {category.title}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ProductsPage;