import React, { useEffect, useState } from "react";
import Header from "../components/Layout/Header";
import { useSelector } from "react-redux";
import Loader from "../components/Layout/Loader";
import ProductCard from "../components/Route/ProductCard/ProductCard";
import { Crown, TrendingUp, Star } from "lucide-react";

const BestSellingPage = () => {
  const [data, setData] = useState([]);
  const { allProducts, isLoading } = useSelector((state) => state.products);

  useEffect(() => {
    if (Array.isArray(allProducts)) {
      const sortedProducts = [...allProducts].sort(
        (a, b) => b.sold_out - a.sold_out
      );
      setData(sortedProducts);
      window.scrollTo(0, 0);
    }
  }, [allProducts]);

  return (
    <div className="min-h-screen bg-[#f7f1f1]">
      <Header activeHeading={2} />
      
      {/* Hero Section */}
      <div className="bg-white/50 py-16 border-b border-[#d8c4b8]/20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Crown className="w-8 h-8 text-[#c8a4a5]" />
              <h1 className="text-4xl font-bold text-[#5a4336]">
                Best Selling Products
              </h1>
              <Crown className="w-8 h-8 text-[#c8a4a5]" />
            </div>
            <p className="text-[#a67d6d] text-lg max-w-2xl mx-auto">
              Discover our most popular items loved by customers. Each product is carefully selected based on quality and satisfaction.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-white/80 border-b border-[#d8c4b8]/20">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center justify-center gap-3 text-[#5a4336]">
              <TrendingUp className="w-5 h-5 text-[#c8a4a5]" />
              <span className="text-sm">Top Rated Products</span>
            </div>
            <div className="flex items-center justify-center gap-3 text-[#5a4336]">
              <Star className="w-5 h-5 text-[#c8a4a5]" />
              <span className="text-sm">Customer Favorites</span>
            </div>
            <div className="flex items-center justify-center gap-3 text-[#5a4336]">
              <div className="w-5 h-5 bg-gradient-to-r from-[#c8a4a5] to-[#8c6c6b] rounded-full" />
              <span className="text-sm">Premium Quality</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {isLoading ? (
          <Loader />
        ) : (
          <>
           

            {/* Products Grid */}
            <div className="grid grid-cols-1 gap-[20px] md:grid-cols-2 md:gap-[25px] lg:grid-cols-4 lg:gap-[25px] xl:grid-cols-5 xl:gap-[30px] mb-12">
              {data?.map((product, index) => (
                <div key={index} className="group">
                  <div className="relative overflow-hidden rounded-xl bg-white shadow-md transition-all duration-300 ">
                    {index < 3 && (
                      <div className="absolute top-4 left-4 z-10 bg-gradient-to-r from-[#c8a4a5] to-[#8c6c6b] text-white text-xs px-3 py-1 rounded-full">
                        Top #{index + 1}
                      </div>
                    )}
                    <ProductCard data={product} />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BestSellingPage;