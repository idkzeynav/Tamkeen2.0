import React, { useEffect, useState } from "react";
import Header from "../components/Layout/Header";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import Loader from "../components/Layout/Loader";
import Footer from "../components/Layout/Footer";
import { backend_url } from "../server";
import { addToWishlist, removeFromWishlist } from "../redux/actions/wishlist";
import { addTocart } from "../redux/actions/cart";
import { toast } from "react-toastify";
import ProductDetailsCard from "../components/Route/ProductDetailsCard/ProductDetailsCard";
import { Crown, TrendingUp, ShoppingBag, ThumbsUp, Star, ChevronLeft, ChevronRight, Heart, Eye, ShoppingCart } from "lucide-react";

const ProductCard = ({ data, badgeText, index }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { wishlist } = useSelector((state) => state.wishlist);
  const { cart } = useSelector((state) => state.cart);
  const [click, setClick] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setClick(wishlist?.some((i) => i._id === data._id));
  }, [wishlist, data]);

  const toggleWishlist = () => {
    setClick(!click);
    dispatch(click ? removeFromWishlist(data) : addToWishlist(data));
  };

  const addToCartHandler = (e) => {
    e.stopPropagation();
    if (cart?.some((i) => i._id === data._id)) {
      toast.error("Item already in cart!");
      return;
    }
    if (data.stock < 1) {
      toast.error("Product stock limited!");
      return;
    }
    dispatch(addTocart({ ...data, qty: 1 }));
    toast.success("Item added to cart successfully!");
  };

  const truncateText = (text, maxLength = 40) => {
    if (!text) return "";
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
  };

  const hasDiscount = data.discountPrice && 
                     data.originalPrice && 
                     data.discountPrice !== data.originalPrice;

  const getImageUrl = (imagePath) => {
    if (!imagePath) return 'https://via.placeholder.com/400x400';
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    return `${backend_url}${imagePath}`;
  };

  return (
    <div className="cursor-pointer w-full h-full relative">
      <div className="w-full relative pt-[75%]">
        <img
          src={getImageUrl(data.images?.[0])}
          alt={data.name}
          className="absolute top-0 left-0 w-full h-full object-cover object-center"
          onClick={() => navigate(`/product/${data._id}`)}
        />
        
        {/* Action Buttons */}
        <div className="absolute top-4 right-4 flex flex-col gap-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleWishlist();
            }}
            className="p-2 rounded-full bg-white/80 backdrop-blur-sm shadow-md transition-colors hover:bg-[#c8a4a5]/20"
          >
            <Heart
              size={20}
              className={click ? "fill-[#a67d6d] text-[#a67d6d]" : "text-[#5a4336]"}
            />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setOpen(true);
            }}
            className="p-2 rounded-full bg-white/80 backdrop-blur-sm shadow-md transition-colors hover:bg-[#c8a4a5]/20"
          >
            <Eye size={20} className="text-[#5a4336]" />
          </button>
          <button
            onClick={addToCartHandler}
            className="p-2 rounded-full bg-white/80 backdrop-blur-sm shadow-md transition-colors hover:bg-[#c8a4a5]/20"
          >
            <ShoppingCart size={20} className="text-[#5a4336]" />
          </button>
        </div>

        {badgeText && (
          <div className="absolute top-4 left-4 z-10 bg-gradient-to-r from-[#c8a4a5] to-[#8c6c6b] text-white text-xs px-3 py-1 rounded-full">
            {badgeText}
          </div>
        )}
      </div>
      
      <div className="p-4" onClick={() => navigate(`/product/${data._id}`)}>
        <h5 className="text-[#5a4336] font-medium text-base h-12 line-clamp-2">
          {truncateText(data.name, 45)}
        </h5>
        <div className="flex justify-between items-center mt-3">
          <div className="font-bold text-[#5a4336] text-lg">
            Rs{hasDiscount ? data.discountPrice : data.originalPrice}
          </div>
          {hasDiscount && (
            <span className="text-sm text-gray-500 line-through">
              Rs{data.originalPrice}
            </span>
          )}
        </div>
      </div>

      {open && <ProductDetailsCard setOpen={setOpen} data={data} />}
    </div>
  );
};




const BestSellingPage = () => {
  const [data, setData] = useState([]);
  const [sortOption, setSortOption] = useState("combined");
  const { allProducts, isLoading } = useSelector((state) => state.products);
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 20;

  useEffect(() => {
    if (Array.isArray(allProducts)) {
      sortProducts(sortOption);
      window.scrollTo(0, 0);
    }
  }, [allProducts, sortOption]);

  // Reset to first page when sort option changes
  useEffect(() => {
    setCurrentPage(1);
  }, [sortOption]);

  // Calculate a weighted score based on both sales and ratings
  const calculateProductScore = (product) => {
    // Get the product's rating (defaulting to 0 if not available)
    const rating = product.ratings ? parseFloat(product.ratings) : 0;
    
    // Get sales count
    const salesCount = product.sold_out || 0;
    
    // Rating multiplier (1.0 for average rating of 3, scales from 0.7 to 1.3)
    const ratingMultiplier = rating > 0 ? 0.7 + (rating / 5) * 0.6 : 1.0;
    
    // Calculate final score based only on sales and rating value
    let score = salesCount * ratingMultiplier;
    
    return {
      score,
      salesCount,
      rating
    };
  };

  const sortProducts = (option) => {
    if (!Array.isArray(allProducts)) return;
    
    let sortedProducts = [...allProducts];
    
    switch (option) {
      case "sales":
        // Sort by pure sales count
        sortedProducts.sort((a, b) => (b.sold_out || 0) - (a.sold_out || 0));
        break;
        
      case "rating":
        // Sort by rating only
        sortedProducts.sort((a, b) => {
          const aRating = a.ratings ? parseFloat(a.ratings) : 0;
          const bRating = b.ratings ? parseFloat(b.ratings) : 0;
          
          // Products with ratings come first
          if (aRating && !bRating) return -1;
          if (!aRating && bRating) return 1;
          
          // Then by rating value
          if (aRating !== bRating) return bRating - aRating;
          
          // If ratings are tied, use sales as tiebreaker
          return (b.sold_out || 0) - (a.sold_out || 0);
        });
        break;
        
      case "combined":
      default:
        // Sort using our combined scoring algorithm
        sortedProducts.sort((a, b) => {
          const aScore = calculateProductScore(a).score;
          const bScore = calculateProductScore(b).score;
          return bScore - aScore;
        });
        break;
    }
    
    setData(sortedProducts);
  };
  
  const getBadgeText = (product, index) => {
    // Calculate absolute index based on current page
    const absoluteIndex = (currentPage - 1) * productsPerPage + index;
    
    // For the first three products overall, show their rank
    if (absoluteIndex < 3) {
      return `Top #${absoluteIndex + 1}`;
    }
    
    // For other top performers, show why they're featured
    const { salesCount, rating } = calculateProductScore(product);
    
    // If it has exceptional ratings
    if (rating >= 4.5) {
      return "Top Rated";
    }
    
    // If it has good sales
    if (salesCount >= 50) {
      return "Best Seller";
    }
    
    return null;
  };

  // Get current products for pagination
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = data.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(data.length / productsPerPage);

  // Change page
  const paginate = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
      window.scrollTo(0, 0);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f1f1]">
      {/* Header with higher z-index to ensure it appears above all other content */}
      <div className="relative z-50">
        <Header activeHeading={2} />
        <div className="h-16" />
      </div>
      
      {/* Hero Section - with lower z-index than header */}
      <div className="bg-white/50 py-16 border-b border-[#d8c4b8]/20 relative z-0">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
              <h1 className="text-4xl font-bold text-[#5a4336]">
                Best Selling Products
              </h1>
          
          </div>
        </div>
      </div>

      {/* Sort Options Bar - with lower z-index than header */}
      <div className="bg-white/80 border-b border-[#d8c4b8]/20 relative z-0">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Left - Stats */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-[#5a4336]">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-[#c8a4a5]" />
                <span className="text-sm">Sales Volume</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-[#c8a4a5]" />
                <span className="text-sm">Customer Ratings</span>
              </div>
              <div className="flex items-center gap-2">
                <ThumbsUp className="w-5 h-5 text-[#c8a4a5]" />
                <span className="text-sm">Quality Assured</span>
              </div>
            </div>
            
            {/* Right - Sort Options */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-[#5a4336]">Sort by:</span>
              <div className="flex rounded-lg overflow-hidden bg-white border border-[#d8c4b8]/30">
                <button
                  className={`px-3 py-1 text-sm ${
                    sortOption === "combined" 
                    ? "bg-gradient-to-r from-[#c8a4a5] to-[#8c6c6b] text-white" 
                    : "text-[#5a4336] hover:bg-[#f7f1f1]"
                  }`}
                  onClick={() => setSortOption("combined")}
                >
                  Smart Rank
                </button>
                <button
                  className={`px-3 py-1 text-sm ${
                    sortOption === "sales" 
                    ? "bg-gradient-to-r from-[#c8a4a5] to-[#8c6c6b] text-white" 
                    : "text-[#5a4336] hover:bg-[#f7f1f1]"
                  }`}
                  onClick={() => setSortOption("sales")}
                >
                  By Sales
                </button>
                <button
                  className={`px-3 py-1 text-sm ${
                    sortOption === "rating" 
                    ? "bg-gradient-to-r from-[#c8a4a5] to-[#8c6c6b] text-white" 
                    : "text-[#5a4336] hover:bg-[#f7f1f1]"
                  }`}
                  onClick={() => setSortOption("rating")}
                >
                  By Rating
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sorting Explanation */}
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="text-[#a67d6d] text-sm bg-white/50 rounded-lg p-3 mb-6">
          {sortOption === "combined" && (
            <p><strong>Smart Rank:</strong> Our intelligent algorithm balances both sales performance and customer ratings, ensuring you see the most reliable top products.</p>
          )}
          {sortOption === "sales" && (
            <p><strong>Sales Rank:</strong> Products sorted purely by number of units sold. These are our traditional best-sellers by volume.</p>
          )}
          {sortOption === "rating" && (
            <p><strong>Rating Rank:</strong> Products sorted by customer satisfaction ratings. Higher star ratings appear first.</p>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 pb-12">
        {isLoading ? (
          <Loader />
        ) : (
          <>
            {/* Pagination Info */}
            <div className="flex justify-between items-center mb-4 text-sm text-[#5a4336]">
              <div>
                Showing {indexOfFirstProduct + 1}-{Math.min(indexOfLastProduct, data.length)} of {data.length} products
              </div>
              <div>
                Page {currentPage} of {totalPages}
              </div>
            </div>
          
            {/* Products Grid - Fixed to 4 cards per row */}
            <div className="grid grid-cols-1 gap-[20px] md:grid-cols-2 md:gap-[25px] lg:grid-cols-4 lg:gap-[25px] mb-8">
              {currentProducts?.map((product, index) => (
                <div key={index} className="group h-full">
                  <div className="relative overflow-hidden rounded-xl bg-white shadow-md transition-all duration-300 hover:shadow-lg h-full flex flex-col">
                    <div className="flex-grow">
                      <ProductCard 
                        data={product} 
                        badgeText={getBadgeText(product, index)}
                        index={index} 
                      />
                    </div>
                    
                    {/* Additional Rating & Sales Info - No Review Counts */}
                    <div className="flex justify-between items-center px-4 py-3 bg-[#f7f1f1]/50 text-xs text-[#5a4336]">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-[#c8a4a5]" fill={product.ratings ? "#c8a4a5" : "none"} />
                        <span>
                          {product.ratings ? parseFloat(product.ratings).toFixed(1) : "N/A"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <ShoppingBag className="w-4 h-4 text-[#c8a4a5]" />
                        <span>{product.sold_out || 0} sold</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`flex items-center justify-center w-10 h-10 rounded-full ${
                    currentPage === 1
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white text-[#5a4336] hover:bg-[#f7f1f1] border border-[#d8c4b8]/30"
                  }`}
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                
                {/* Page Numbers */}
                <div className="flex gap-2">
                  {/* Logic to show appropriate page numbers */}
                  {[...Array(totalPages)].map((_, i) => {
                    // Logic to show current page, 2 pages before and after, and first/last page
                    const pageNum = i + 1;
                    
                    // Always show first page, last page, current page and pages directly next to current page
                    if (
                      pageNum === 1 || 
                      pageNum === totalPages || 
                      (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={i}
                          onClick={() => paginate(pageNum)}
                          className={`flex items-center justify-center w-10 h-10 rounded-full ${
                            currentPage === pageNum
                            ? "bg-gradient-to-r from-[#c8a4a5] to-[#8c6c6b] text-white"
                            : "bg-white text-[#5a4336] hover:bg-[#f7f1f1] border border-[#d8c4b8]/30"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    }
                    
                    // Show ellipsis for breaks in sequence
                    // Only show ellipsis once for each break
                    if (
                      (pageNum === 2 && currentPage > 3) || 
                      (pageNum === totalPages - 1 && currentPage < totalPages - 2)
                    ) {
                      return (
                        <div 
                          key={i} 
                          className="flex items-center justify-center w-10 h-10 text-[#5a4336]"
                        >
                          ...
                        </div>
                      );
                    }
                    
                    return null;
                  })}
                </div>
                
                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`flex items-center justify-center w-10 h-10 rounded-full ${
                    currentPage === totalPages
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white text-[#5a4336] hover:bg-[#f7f1f1] border border-[#d8c4b8]/30"
                  }`}
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default BestSellingPage;