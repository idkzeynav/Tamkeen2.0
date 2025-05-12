import React from "react";
import { FiShoppingBag } from "react-icons/fi";
import { GrWorkshop } from "react-icons/gr";
import { RxDashboard } from "react-icons/rx";
import { CiMoneyBill, CiSettings } from "react-icons/ci";
import { useNavigate } from "react-router-dom";
import { HiOutlineUserGroup } from "react-icons/hi";
import { BsHandbag } from "react-icons/bs";
import { MdOutlineLocalOffer } from "react-icons/md";
import { AiFillShop,AiOutlineLogin } from "react-icons/ai";
import axios from "axios";
import { server } from "../../../server";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import {Link } from "react-router-dom";

const AdminSideBar = ({ active }) => {
const navigate = useNavigate();

  const logoutHandler = () => {
    axios
      .get(`${server}/user/logout`, { withCredentials: true })
      .then((res) => {
        toast.success(res.data.message);
        navigate("/");
        window.location.reload(true);
      })
      .catch((error) => {
        console.log(error.response.data.message);
      });
  };
  return (
    <div className="fixed top-0 left-0 h-screen bg-[#f7f1f1] shadow-lg w-[80px] md:w-[250px] flex flex-col transition-all duration-300 z-20">
      <div className="text-center py-6 border-b border-[#e6d8d8]">
        <h2 className="text-[#5a4336] font-bold text-lg md:text-2xl">Admin</h2>
      </div>
      <nav className="flex-1 mt-4 overflow-y-auto">
        <ul className="space-y-2">
          {/* Dashboard */}
          <li>
            <Link
              to="/admin/dashboard"
              className={`flex items-center gap-4 p-4 hover:bg-[#c8a4a5]/20 transition-colors rounded-lg ${
                active === 1 ? "bg-[#c8a4a5]/20 text-[#c8a4a5]" : "text-[#5a4336]"
              }`}
            >
              <RxDashboard
                size={24}
                className={`${active === 1 ? "text-[#c8a4a5]" : "text-[#5a4336]"}`}
              />
              <span className="hidden md:block text-lg font-medium">Dashboard</span>
            </Link>
          </li>
          {/* Orders */}
          <li>
            <Link
              to="/admin-orders"
              className={`flex items-center gap-4 p-4 hover:bg-[#c8a4a5]/20 transition-colors rounded-lg ${
                active === 2 ? "bg-[#c8a4a5]/20 text-[#c8a4a5]" : "text-[#5a4336]"
              }`}
            >
              <FiShoppingBag
                size={24}
                className={`${active === 2 ? "text-[#c8a4a5]" : "text-[#5a4336]"}`}
              />
              <span className="hidden md:block text-lg font-medium">All Orders</span>
            </Link>
          </li>
          {/* Sellers */}
          <li>
            <Link
              to="/admin-sellers"
              className={`flex items-center gap-4 p-4 hover:bg-[#c8a4a5]/20 transition-colors rounded-lg ${
                active === 3 ? "bg-[#c8a4a5]/20 text-[#c8a4a5]" : "text-[#5a4336]"
              }`}
            >
              <GrWorkshop
                size={24}
                className={`${active === 3 ? "text-[#c8a4a5]" : "text-[#5a4336]"}`}
              />
              <span className="hidden md:block text-lg font-medium">All Sellers</span>
            </Link>
          </li>
          {/* Users */}
          <li>
            <Link
              to="/admin-users"
              className={`flex items-center gap-4 p-4 hover:bg-[#c8a4a5]/20 transition-colors rounded-lg ${
                active === 4 ? "bg-[#c8a4a5]/20 text-[#c8a4a5]" : "text-[#5a4336]"
              }`}
            >
              <HiOutlineUserGroup
                size={24}
                className={`${active === 4 ? "text-[#c8a4a5]" : "text-[#5a4336]"}`}
              />
              <span className="hidden md:block text-lg font-medium">All Users</span>
            </Link>
          </li>
          {/* Products */}
          <li>
            <Link
              to="/admin-products"
              className={`flex items-center gap-4 p-4 hover:bg-[#c8a4a5]/20 transition-colors rounded-lg ${
                active === 5 ? "bg-[#c8a4a5]/20 text-[#c8a4a5]" : "text-[#5a4336]"
              }`}
            >
              <BsHandbag
                size={24}
                className={`${active === 5 ? "text-[#c8a4a5]" : "text-[#5a4336]"}`}
              />
              <span className="hidden md:block text-lg font-medium">All Products</span>
            </Link>
          </li>
          {/* Wholesale Markets */}
          <li>
            <Link
              to="/admin-wholesale-markets"
              className={`flex items-center gap-4 p-4 hover:bg-[#c8a4a5]/20 transition-colors rounded-lg ${
                active === 6 ? "bg-[#c8a4a5]/20 text-[#c8a4a5]" : "text-[#5a4336]"
              }`}
            >
              < AiFillShop 
                size={24}
                className={`${active === 6 ? "text-[#c8a4a5]" : "text-[#5a4336]"}`}
              />
              <span className="hidden md:block text-lg font-medium">Wholesale Markets</span>
            </Link>
          </li>
          {/* Settings */}
          <li>


          <li>
            <Link
              to="/createworkshop"
              className={`flex items-center gap-4 p-4 hover:bg-[#c8a4a5]/20 transition-colors rounded-lg ${
                active === 8 ? "bg-[#c8a4a5]/20 text-[#c8a4a5]" : "text-[#5a4336]"
              }`}
            >
              <BsHandbag
                size={24}
                className={`${active === 8 ? "text-[#c8a4a5]" : "text-[#5a4336]"}`}
              />
              <span className="hidden md:block text-lg font-medium">Create Workshop</span>
            </Link>
          </li>

          <li>
            <Link
              to="/Adminworkshop"
              className={`flex items-center gap-4 p-4 hover:bg-[#c8a4a5]/20 transition-colors rounded-lg ${
                active === 9 ? "bg-[#c8a4a5]/20 text-[#c8a4a5]" : "text-[#5a4336]"
              }`}
            >
              <BsHandbag
                size={24}
                className={`${active === 9 ? "text-[#c8a4a5]" : "text-[#5a4336]"}`}
              />
              <span className="hidden md:block text-lg font-medium">All Workshops</span>
            </Link>
          </li>
            <Link
              onClick={logoutHandler}
              className={`flex items-center gap-4 p-4 hover:bg-[#c8a4a5]/20 transition-colors rounded-lg ${
                active === 7 ? "bg-[#c8a4a5]/20 text-[#c8a4a5]" : "text-[#5a4336]"
              }`}
            >
              <AiOutlineLogin
                size={24}
                className={`${active === 7 ? "text-[#c8a4a5]" : "text-[#5a4336]"}`}
              />
              <span className="hidden md:block text-lg font-medium">Logout</span>
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default AdminSideBar;
