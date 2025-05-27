import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { RxDashboard } from "react-icons/rx";
import { FiShoppingBag } from "react-icons/fi";
import { GrWorkshop } from "react-icons/gr";
import { HiOutlineUserGroup } from "react-icons/hi";
import { BsHandbag, BsShieldExclamation } from "react-icons/bs";
import { AiFillShop, AiOutlineLogin , AiOutlineRight } from "react-icons/ai";
import { MdOutlineLocalOffer } from "react-icons/md";
import axios from "axios";
import { server } from "../../../server";
import { toast } from "react-toastify";

const AdminSideBar = ({ active }) => {
  const navigate = useNavigate();
  const [openMenus, setOpenMenus] = useState({
    workshops: false
  });

  const toggleMenu = (menu) => {
    setOpenMenus(prev => ({
      ...prev,
      [menu]: !prev[menu]
    }));
  };

  const closeAllMenus = () => {
    setOpenMenus({
      workshops: false
    });
  };

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
    <div className="w-[270px] h-[90vh] bg-white shadow-sm fixed top-[10vh] left-0 z-10">
      <div className="px-3 py-4 space-y-1">
        {/* Dashboard */}
        <Link to="/admin/dashboard" onClick={closeAllMenus}>
          <div 
            className={`w-full flex items-center p-3 cursor-pointer rounded-lg transition-colors hover:bg-gray-50 
              ${active === 1 ? "bg-gray-50" : ""}`}
          >
            <RxDashboard 
              size={22} 
              className={`${active === 1 ? "text-[#c8a4a5]" : "text-[#5a4336]"}`}
            />
            <span className={`hidden 800px:block pl-3 text-[15px] font-medium ${
              active === 1 ? "text-[#c8a4a5]" : "text-[#5a4336]"
            }`}>
              Dashboard
            </span>
          </div>
        </Link>

        {/* Orders */}
        <Link to="/admin-orders" onClick={closeAllMenus}>
          <div 
            className={`w-full flex items-center p-3 cursor-pointer rounded-lg transition-colors hover:bg-gray-50 
              ${active === 2 ? "bg-gray-50" : ""}`}
          >
            <FiShoppingBag 
              size={22} 
              className={`${active === 2 ? "text-[#c8a4a5]" : "text-[#5a4336]"}`}
            />
            <span className={`hidden 800px:block pl-3 text-[15px] font-medium ${
              active === 2 ? "text-[#c8a4a5]" : "text-[#5a4336]"
            }`}>
              All Orders
            </span>
          </div>
        </Link>

        {/* Sellers */}
        <Link to="/admin-sellers" onClick={closeAllMenus}>
          <div 
            className={`w-full flex items-center p-3 cursor-pointer rounded-lg transition-colors hover:bg-gray-50 
              ${active === 3 ? "bg-gray-50" : ""}`}
          >
            <GrWorkshop 
              size={22} 
              className={`${active === 3 ? "text-[#c8a4a5]" : "text-[#5a4336]"}`}
            />
            <span className={`hidden 800px:block pl-3 text-[15px] font-medium ${
              active === 3 ? "text-[#c8a4a5]" : "text-[#5a4336]"
            }`}>
              All Sellers
            </span>
          </div>
        </Link>

        {/* Users */}
        <Link to="/admin-users" onClick={closeAllMenus}>
          <div 
            className={`w-full flex items-center p-3 cursor-pointer rounded-lg transition-colors hover:bg-gray-50 
              ${active === 4 ? "bg-gray-50" : ""}`}
          >
            <HiOutlineUserGroup 
              size={22} 
              className={`${active === 4 ? "text-[#c8a4a5]" : "text-[#5a4336]"}`}
            />
            <span className={`hidden 800px:block pl-3 text-[15px] font-medium ${
              active === 4 ? "text-[#c8a4a5]" : "text-[#5a4336]"
            }`}>
              All Users
            </span>
          </div>
        </Link>

        {/* Products */}
        <Link to="/admin-products" onClick={closeAllMenus}>
          <div 
            className={`w-full flex items-center p-3 cursor-pointer rounded-lg transition-colors hover:bg-gray-50 
              ${active === 5 ? "bg-gray-50" : ""}`}
          >
            <BsHandbag 
              size={22} 
              className={`${active === 5 ? "text-[#c8a4a5]" : "text-[#5a4336]"}`}
            />
            <span className={`hidden 800px:block pl-3 text-[15px] font-medium ${
              active === 5 ? "text-[#c8a4a5]" : "text-[#5a4336]"
            }`}>
              All Products
            </span>
          </div>
        </Link>

         {/* Flagged Posts */}
        <Link to="/admin-flagged-posts" onClick={closeAllMenus}>
          <div 
            className={`w-full flex items-center p-3 cursor-pointer rounded-lg transition-colors hover:bg-gray-50 
              ${active === 10 ? "bg-gray-50" : ""}`}
          >
            <BsShieldExclamation 
              size={22} 
              className={`${active === 10 ? "text-[#c8a4a5]" : "text-[#5a4336]"}`}
            />
            <span className={`hidden 800px:block pl-3 text-[15px] font-medium ${
              active === 10 ? "text-[#c8a4a5]" : "text-[#5a4336]"
            }`}>
              Flagged Posts
            </span>
          </div>
        </Link>

        {/* Wholesale Markets */}
        <Link to="/admin-wholesale-markets" onClick={closeAllMenus}>
          <div 
            className={`w-full flex items-center p-3 cursor-pointer rounded-lg transition-colors hover:bg-gray-50 
              ${active === 6 ? "bg-gray-50" : ""}`}
          >
            <AiFillShop 
              size={22} 
              className={`${active === 6 ? "text-[#c8a4a5]" : "text-[#5a4336]"}`}
            />
            <span className={`hidden 800px:block pl-3 text-[15px] font-medium ${
              active === 6 ? "text-[#c8a4a5]" : "text-[#5a4336]"
            }`}>
              Wholesale Markets
            </span>
          </div>
        </Link>

        {/* Workshops Dropdown */}
        <div 
          className={`w-full flex items-center p-3 cursor-pointer rounded-lg transition-colors hover:bg-gray-50 
            ${(active === 8 || active === 9) ? "bg-gray-50" : ""}`}
          onClick={() => toggleMenu('workshops')}
        >
          <BsHandbag 
            size={22} 
            className={`${(active === 8 || active === 9) ? "text-[#c8a4a5]" : "text-[#5a4336]"}`}
          />
          <span className={`hidden 800px:block pl-3 text-[15px] font-medium ${
            (active === 8 || active === 9) ? "text-[#c8a4a5]" : "text-[#5a4336]"
          }`}>
            Workshops
          </span>
          <AiOutlineRight
            size={16}
            className={`ml-auto transition-transform ${openMenus.workshops ? "rotate-90" : ""}`}
          />
        </div>
        
        {openMenus.workshops && (
          <div className="ml-6 mt-1 border-l-2 border-gray-100">
            <Link to="/createworkshop" onClick={closeAllMenus}>
              <div 
                className={`w-full flex items-center p-3 cursor-pointer rounded-lg transition-colors hover:bg-gray-50 
                  ${active === 8 ? "bg-gray-50" : ""}`}
              >
                <MdOutlineLocalOffer 
                  size={20} 
                  className={`${active === 8 ? "text-[#c8a4a5]" : "text-[#5a4336]"}`}
                />
                <span className={`hidden 800px:block pl-3 text-[14px] font-medium ${
                  active === 8 ? "text-[#c8a4a5]" : "text-[#5a4336]"
                }`}>
                  Create Workshop
                </span>
              </div>
            </Link>
            
            <Link to="/Adminworkshop" onClick={closeAllMenus}>
              <div 
                className={`w-full flex items-center p-3 cursor-pointer rounded-lg transition-colors hover:bg-gray-50 
                  ${active === 9 ? "bg-gray-50" : ""}`}
              >
                <MdOutlineLocalOffer 
                  size={20} 
                  className={`${active === 9 ? "text-[#c8a4a5]" : "text-[#5a4336]"}`}
                />
                <span className={`hidden 800px:block pl-3 text-[14px] font-medium ${
                  active === 9 ? "text-[#c8a4a5]" : "text-[#5a4336]"
                }`}>
                  All Workshops
                </span>
              </div>
            </Link>
          </div>
        )}

        {/* Logout */}
        <div 
          onClick={logoutHandler}
          className={`w-full flex items-center p-3 cursor-pointer rounded-lg transition-colors hover:bg-gray-50 
            ${active === 7 ? "bg-gray-50" : ""}`}
        >
          <AiOutlineLogin 
            size={22} 
            className={`${active === 7 ? "text-[#c8a4a5]" : "text-[#5a4336]"}`}
          />
          <span className={`hidden 800px:block pl-3 text-[15px] font-medium ${
            active === 7 ? "text-[#c8a4a5]" : "text-[#5a4336]"
          }`}>
            Logout
          </span>
        </div>
      </div>
    </div>
  );
};

export default AdminSideBar;