import React, { useEffect, useState } from "react";
import { AiOutlineEye, AiOutlineSearch } from "react-icons/ai";
import { Link } from "react-router-dom";
import axios from "axios";
import { server } from "../../server";

const AllProducts = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get(`${server}/product/admin-all-products`, { 
        withCredentials: true 
      });
      setData(res.data.products);
      setFilteredData(res.data.products);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle search input changes
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    if (value === "") {
      setFilteredData(data);
    } else {
      const filtered = data.filter(product =>
        product.name.toLowerCase().includes(value.toLowerCase()) ||
        product.universalId?.toLowerCase().includes(value.toLowerCase()) ||
        product._id.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredData(filtered);
    }
  };

  const getStockBadge = (stock) => {
    if (stock === 0) {
      return (
        <span className="bg-red-500 text-white text-xs px-3 py-1 rounded-full shadow-md">
          Out of Stock
        </span>
      );
    } else if (stock <= 10) {
      return (
        <span className="bg-orange-500 text-white text-xs px-3 py-1 rounded-full shadow-md">
          Low Stock ({stock})
        </span>
      );
    } else {
      return (
        <span className="bg-green-500 text-white text-xs px-3 py-1 rounded-full shadow-md">
          In Stock ({stock})
        </span>
      );
    }
  };

  if (isLoading) {
    return (
      <div className="w-full flex justify-center items-center pt-10 bg-[#f7f1f1] min-h-screen">
        <div className="text-[#5a4336] text-lg">Loading products...</div>
      </div>
    );
  }

  return (
    <div className="w-full flex justify-center pt-10 bg-[#f7f1f1] min-h-screen">
      <div className="w-[95%] bg-[#ffffff] shadow-md rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-[#5a4336]">
            All Products
          </h1>
          <div className="relative">
            <input
              type="text"
              placeholder="Search by name or ID"
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-[300px] px-4 py-2 pl-10 border border-[#d8c4b8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a67d6d] focus:border-transparent"
            />
            <AiOutlineSearch 
              size={20} 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#a67d6d]" 
            />
          </div>
        </div>
        
        <div className="w-full bg-[#fff] rounded-lg border border-[#d8c4b8] overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 p-4 bg-[#f7f1f1] border-b border-[#d8c4b8] font-semibold text-[#5a4336]">
            <div className="col-span-2">Product ID</div>
            <div className="col-span-3">Name</div>
            <div className="col-span-2">Price</div>
            <div className="col-span-2">Stock Status</div>
            <div className="col-span-2">Sold</div>
            <div className="col-span-1 text-center">Actions</div>
          </div>
          
          {/* Table Body */}
          <div className="max-h-[60vh] overflow-y-auto">
            {filteredData && filteredData.length > 0 ? (
              filteredData.map((product, index) => (
                <div 
                  key={product._id} 
                  className={`grid grid-cols-12 gap-4 p-4 border-b border-[#f0f0f0] hover:bg-[#fafafa] transition-colors ${
                    index % 2 === 0 ? 'bg-white' : 'bg-[#fefefe]'
                  }`}
                >
                  <div className="col-span-2 text-[#5a4336] font-medium">
                    {product.universalId || product._id}
                  </div>
                  <div className="col-span-3 text-[#5a4336] font-medium">
                    {product.name}
                  </div>
                  <div className="col-span-2 text-[#5a4336] font-semibold">
                    Rs. {product.originalPrice}
                  </div>
                  <div className="col-span-2">
                    {getStockBadge(product.stock)}
                  </div>
                  <div className="col-span-2 text-[#5a4336]">
                    {product.sold_out || 0} units
                  </div>
                  <div className="col-span-1 flex justify-center">
                    <Link to={`/product/${product._id}`}>
                      <button
                        className="text-[#c8a4a5] hover:text-[#8c6c6b] transition-colors p-2 rounded-full hover:bg-[#f7f1f1]"
                        title="View Product"
                      >
                        <AiOutlineEye size={20} />
                      </button>
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-[#a67d6d]">
                {searchTerm ? "No products found matching your search." : "No products available."}
              </div>
            )}
          </div>
        </div>
        
        {/* Summary Footer */}
        <div className="mt-4 p-4 bg-[#f7f1f1] rounded-lg">
          <div className="flex justify-between items-center text-[#5a4336]">
            <span className="font-medium">
              Total Products: {filteredData.length}
            </span>
            <span className="font-medium">
              {searchTerm && `Showing results for: "${searchTerm}"`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllProducts;