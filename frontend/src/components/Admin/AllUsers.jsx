import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllUsers } from "../../redux/actions/user";
import { AiOutlineDelete, AiOutlineSearch } from "react-icons/ai";
import { RxCross1 } from "react-icons/rx";
import axios from "axios";
import { server } from "../../server";
import { toast } from "react-toastify";

const AllUsers = () => {
  const dispatch = useDispatch();
  const { users, isLoading } = useSelector((state) => state.user);
  const [open, setOpen] = useState(false);
  const [userId, setUserId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Handle search input changes with immediate dispatch
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    // Dispatch immediately without any character minimum
    dispatch(getAllUsers(value));
  };

  // Initial load
  useEffect(() => {
    dispatch(getAllUsers(""));
  }, [dispatch]);

  const handleDelete = async (id) => {
    await axios
      .delete(`${server}/user/delete-user/${id}`, { withCredentials: true })
      .then((res) => {
        toast.success(res.data.message);
      });

    dispatch(getAllUsers(searchTerm));
  };

  const getRoleBadge = (role) => {
    const roleStyles = {
      Admin: "bg-red-500 text-white text-xs px-3 py-1 rounded-full shadow-md",
      User: "bg-blue-500 text-white text-xs px-3 py-1 rounded-full shadow-md",
      Seller: "bg-green-500 text-white text-xs px-3 py-1 rounded-full shadow-md",
    };
    return (
      <span className={roleStyles[role] || "bg-gray-300 text-black text-xs px-3 py-1 rounded-full shadow-md"}>
        {role}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="w-full h-screen flex justify-center items-center bg-[#f7f1f1]">
        <div className="text-[#5a4336] text-lg">Loading users...</div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-[#f7f1f1] p-6 flex flex-col">
      <div className="w-full h-full bg-[#ffffff] shadow-md rounded-lg p-6 flex flex-col min-h-0">
        <div className="flex justify-between items-center mb-6 flex-shrink-0">
          <h1 className="text-2xl font-semibold text-[#5a4336]">
            All Users
          </h1>
          <div className="relative">
            <input
              type="text"
              placeholder="Search by name, email or Universal ID"
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
        
        <div className="flex-1 bg-[#fff] rounded-lg border border-[#d8c4b8] flex flex-col min-h-0">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 p-4 bg-[#f7f1f1] border-b border-[#d8c4b8] font-semibold text-[#5a4336] flex-shrink-0">
            <div className="col-span-3">Universal ID</div>
            <div className="col-span-2">Name</div>
            <div className="col-span-3">Email</div>
            <div className="col-span-1">Role</div>
            <div className="col-span-2">Joined At</div>
            <div className="col-span-1 text-center">Actions</div>
          </div>
          
          {/* Table Body - This is where the scroll happens */}
          <div className="flex-1 overflow-y-auto min-h-0">
            {users && users.length > 0 ? (
              users.map((user, index) => (
                <div 
                  key={user._id} 
                  className={`grid grid-cols-12 gap-4 p-4 border-b border-[#f0f0f0] hover:bg-[#fafafa] transition-colors ${
                    index % 2 === 0 ? 'bg-white' : 'bg-[#fefefe]'
                  }`}
                >
                  <div className="col-span-3 text-[#5a4336] font-medium break-all">
                    {user.universalId}
                  </div>
                  <div className="col-span-2 text-[#5a4336] font-medium">
                    {user.name}
                  </div>
                  <div className="col-span-3 text-[#5a4336] break-all">
                    {user.email}
                  </div>
                  <div className="col-span-1">
                    {getRoleBadge(user.role)}
                  </div>
                  <div className="col-span-2 text-[#5a4336] text-sm">
                    {new Date(user.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </div>
                  <div className="col-span-1 flex justify-center">
                    <button
                      onClick={() => {
                        setUserId(user.universalId);
                        setOpen(true);
                      }}
                      className="text-[#c8a4a5] hover:text-[#8c6c6b] transition-colors p-2 rounded-full hover:bg-[#f7f1f1]"
                      title="Delete User"
                    >
                      <AiOutlineDelete size={20} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-[#a67d6d]">
                {searchTerm ? "No users found matching your search." : "No users available."}
              </div>
            )}
          </div>
        </div>
        
        {/* Summary Footer - Fixed at bottom */}
        <div className="mt-4 p-4 bg-[#f7f1f1] rounded-lg flex-shrink-0">
          <div className="flex justify-between items-center text-[#5a4336]">
            <span className="font-medium">
              Total Users: {users ? users.length : 0}
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
                Are you sure you want to delete this user?
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

export default AllUsers;