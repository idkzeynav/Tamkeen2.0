import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AiOutlineDelete, AiOutlineEye, AiOutlineSearch } from "react-icons/ai";
import { RxCross1 } from "react-icons/rx";
import axios from "axios";
import { server } from "../../server";
import { toast } from "react-toastify";
import { getAllSellers } from "../../redux/actions/sellers";
import { Link } from "react-router-dom";

const AllSellers = () => {
  const dispatch = useDispatch();
  const { sellers, isLoading } = useSelector((state) => state.seller);
  const [open, setOpen] = useState(false);
  const [userId, setUserId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  // Debounce search term so that API isn't called on every keystroke
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300); // 300ms delay

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Only fetch data when the debounced search term changes
  useEffect(() => {
    dispatch(getAllSellers(debouncedSearchTerm));
  }, [dispatch, debouncedSearchTerm]);

  const handleDelete = async (id) => {
    await axios
      .delete(`${server}/shop/delete-seller/${id}`, { withCredentials: true })
      .then((res) => {
        toast.success(res.data.message);
      });

    dispatch(getAllSellers(debouncedSearchTerm));
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  if (isLoading) {
    return (
      <div className="w-full flex justify-center items-center pt-10 bg-[#f7f1f1] min-h-screen">
        <div className="text-[#5a4336] text-lg">Loading sellers...</div>
      </div>
    );
  }

  return (
    <div className="w-full flex justify-center pt-10 bg-[#f7f1f1] min-h-screen">
      <div className="w-[95%] bg-[#ffffff] shadow-md rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-[#5a4336]">
            All Sellers
          </h1>
          <div className="relative">
            <input
              type="text"
              placeholder="Search by name or email"
              value={searchTerm}
              onChange={handleSearch}
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
            <div className="col-span-2">Seller ID</div>
            <div className="col-span-2">Name</div>
            <div className="col-span-3">Email</div>
            <div className="col-span-2">Address</div>
            <div className="col-span-1">Joined At</div>
            <div className="col-span-2 text-center">Actions</div>
          </div>
          
          {/* Table Body */}
          <div className="max-h-[60vh] overflow-y-auto">
            {sellers && sellers.length > 0 ? (
              sellers.map((seller, index) => (
                <div 
                  key={seller._id} 
                  className={`grid grid-cols-12 gap-4 p-4 border-b border-[#f0f0f0] hover:bg-[#fafafa] transition-colors ${
                    index % 2 === 0 ? 'bg-white' : 'bg-[#fefefe]'
                  }`}
                >
                  <div className="col-span-2 text-[#5a4336] font-medium">
                    {seller.universalId || seller._id}
                  </div>
                  <div className="col-span-2 text-[#5a4336] font-medium">
                    {seller.name}
                  </div>
                  <div className="col-span-3 text-[#5a4336]">
                    {seller.email}
                  </div>
                  <div className="col-span-2 text-[#5a4336] text-sm">
                    {seller.address}
                  </div>
                  <div className="col-span-1 text-[#5a4336] text-sm">
                    {new Date(seller.createdAt).toLocaleDateString()}
                  </div>
                  <div className="col-span-2 flex justify-center gap-2">
                    <Link to={`/shop/preview/${seller._id}`}>
                      <button
                        className="text-[#c8a4a5] hover:text-[#8c6c6b] transition-colors p-2 rounded-full hover:bg-[#f7f1f1]"
                        title="Preview Shop"
                      >
                        <AiOutlineEye size={20} />
                      </button>
                    </Link>
                    <button
                      onClick={() => {
                        setUserId(seller._id);
                        setOpen(true);
                      }}
                      className="text-[#c8a4a5] hover:text-[#8c6c6b] transition-colors p-2 rounded-full hover:bg-[#f7f1f1]"
                      title="Delete Seller"
                    >
                      <AiOutlineDelete size={20} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-[#a67d6d]">
                {searchTerm ? "No sellers found matching your search." : "No sellers available."}
              </div>
            )}
          </div>
        </div>
        
        {/* Summary Footer */}
        <div className="mt-4 p-4 bg-[#f7f1f1] rounded-lg">
          <div className="flex justify-between items-center text-[#5a4336]">
            <span className="font-medium">
              Total Sellers: {sellers ? sellers.length : 0}
            </span>
            <span className="font-medium">
              {searchTerm && `Showing results for: "${searchTerm}"`}
            </span>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {open && (
          <div className="fixed top-0 left-0 w-full h-full bg-[#00000066] flex items-center justify-center z-50">
            <div className="w-[90%] md:w-[40%] bg-white rounded-lg shadow-lg p-6">
              <div className="flex justify-end">
                <RxCross1
                  size={24}
                  className="cursor-pointer text-[#c8a4a5] hover:text-[#8c6c6b] transition-colors"
                  onClick={() => setOpen(false)}
                />
              </div>
              <h3 className="text-center text-[20px] font-medium text-[#5a4336] mt-2">
                Are you sure you want to delete this seller?
              </h3>
              <div className="flex justify-center gap-4 mt-6">
                <button
                  onClick={() => setOpen(false)}
                  className="bg-[#c8a4a5] text-white px-6 py-2 rounded-lg hover:bg-[#8c6c6b] transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setOpen(false);
                    handleDelete(userId);
                  }}
                  className="bg-[#5a4336] text-white px-6 py-2 rounded-lg hover:bg-[#3e2e28] transition-all"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllSellers;