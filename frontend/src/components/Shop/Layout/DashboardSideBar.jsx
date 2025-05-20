import React, { useState } from "react";
import { Link } from "react-router-dom";
import { RxDashboard } from "react-icons/rx";
import { FiPackage, FiShoppingBag } from "react-icons/fi";
import { AiOutlineFolderAdd, AiOutlineInfoCircle, AiOutlineRight } from "react-icons/ai";
import { BiMessageSquareDetail } from "react-icons/bi";
import { CiSettings } from "react-icons/ci";
import { MdOutlineLocalOffer } from "react-icons/md";
import { GiBuyCard } from "react-icons/gi";

const MenuItem = ({ icon: Icon, label, isActive, onClick, children, isOpen, showInfoIcon, onInfoClick }) => {
  return (
    <div className="w-full">
      <div 
        onClick={onClick}
        className={`w-full flex items-center p-3 cursor-pointer rounded-lg transition-colors hover:bg-gray-50 
          ${isActive ? "bg-gray-50" : ""}`}
      >
        <Icon 
          size={22} 
          className={`${isActive ? "text-[#c8a4a5]" : "text-[#5a4336]"}`}
        />
        <span className={`hidden 800px:block pl-3 text-[15px] font-medium ${
          isActive ? "text-[#c8a4a5]" : "text-[#5a4336]"
        }`}>
          {label}
        </span>
        
        {/* Info Icon (if needed) */}
        {showInfoIcon && (
          <AiOutlineInfoCircle
            size={18}
            className="ml-auto mr-2 text-gray-400 cursor-pointer hover:text-[#c8a4a5]"
            onClick={(e) => {
              e.stopPropagation();
              onInfoClick();
            }}
          />
        )}
        
        {/* Dropdown Arrow (if has children) */}
        {children && (
          <AiOutlineRight
            size={16}
            className={`${showInfoIcon ? 'ml-1' : 'ml-auto'} transition-transform ${isOpen ? "rotate-90" : ""}`}
          />
        )}
      </div>
      {children && isOpen && (
        <div className="ml-6 mt-1 border-l-2 border-gray-100">
          {children}
        </div>
      )}
    </div>
  );
};

const DashboardSideBar = ({ active }) => {
  const [openMenus, setOpenMenus] = useState({
    products: false,
    services: false,
    procurement: false
  });
  const [isPopupVisible, setIsPopupVisible] = useState(false);

  const toggleMenu = (menu) => {
    setOpenMenus(prev => ({
      ...prev,
      [menu]: !prev[menu]
    }));
  };

  return (
    <div className="w-[300px] h-[90vh] bg-white shadow-sm fixed top-[10vh] left-0 z-10">
      <div className="px-3 py-4 space-y-1">
        <Link to="/dashboard">
          <MenuItem 
            icon={RxDashboard} 
            label="Dashboard" 
            isActive={active === 1} 
          />
        </Link>

        <Link to="/dashboard-orders">
          <MenuItem 
            icon={FiShoppingBag} 
            label="All Orders" 
            isActive={active === 2} 
          />
        </Link>

        {/* Products Section */}
        <MenuItem 
          icon={FiPackage} 
          label="Products" 
          isActive={active === 3 || active === 4}
          isOpen={openMenus.products}
          onClick={() => toggleMenu('products')}
        >
          <Link to="/dashboard-products">
            <MenuItem 
              icon={FiPackage} 
              label="All Products" 
              isActive={active === 3} 
            />
          </Link>
          <Link to="/dashboard-create-product">
            <MenuItem 
              icon={AiOutlineFolderAdd} 
              label="Add Product" 
              isActive={active === 4} 
            />
          </Link>
        </MenuItem>

        {/* Services Section */}
        <MenuItem 
          icon={FiPackage} 
          label="Services" 
          isActive={active === 12 || active === 13 || active === 14}
          isOpen={openMenus.services}
          onClick={() => toggleMenu('services')}
        >
          <Link to="/dashboard-services">
            <MenuItem 
              icon={FiPackage} 
              label="All Services" 
              isActive={active === 13} 
            />
          </Link>
          <Link to="/dashboard-create-service">
            <MenuItem 
              icon={AiOutlineFolderAdd} 
              label="Add Service" 
              isActive={active === 12} 
            />
          </Link>
          <Link to="/dashboard-sellerbooking">
            <MenuItem 
              icon={FiPackage} 
              label="All Bookings" 
              isActive={active === 14} 
            />
          </Link>
        </MenuItem>

        {/* Procurement Section - Fixed with properly aligned info icon */}
        <MenuItem 
          icon={AiOutlineFolderAdd} 
          label="Procurement" 
          isActive={active === 17 || active === 18}
          isOpen={openMenus.procurement}
          onClick={() => toggleMenu('procurement')}
          showInfoIcon={true}
          onInfoClick={() => setIsPopupVisible(true)}
        >
          <Link to="/RFQ">
            <MenuItem 
              icon={MdOutlineLocalOffer} 
              label="RFQ" 
              isActive={active === 17} 
            />
          </Link>
          <Link to="/sellerbulkorders">
            <MenuItem 
              icon={GiBuyCard} 
              label="Bulk Orders" 
              isActive={active === 18} 
            />
          </Link>
        </MenuItem>

        <Link to="/dashboard-messages">
          <MenuItem 
            icon={BiMessageSquareDetail} 
            label="Shop Inbox" 
            isActive={active === 8} 
          />
        </Link>

        <Link to="/settings">
          <MenuItem 
            icon={CiSettings} 
            label="Settings" 
            isActive={active === 11} 
          />
        </Link>
      </div>

      {/* Procurement Info Popup */}
      {isPopupVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white w-[90%] max-w-[400px] rounded-lg shadow-lg p-6 relative">
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
              onClick={() => setIsPopupVisible(false)}
            >
              <span className="text-xl font-medium">×</span>
            </button>
            <h2 className="text-xl font-semibold text-[#5a4336] mb-4">
              What is Procurement?
            </h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              Procurement module makes it easy for you to find bulk orders that match your product category. Simply browse through the available bulk orders created by users, review their requirements, and submit your best offer. If your offer is accepted, you can move forward with fulfilling the order. Keep the buyer updated on the progress to ensure a smooth transaction. This is your opportunity to grow your business by connecting directly with buyers who need what you offer!
            </p>
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setIsPopupVisible(false)}
                className="bg-[#c8a4a5] text-white px-4 py-2 rounded-md hover:bg-[#b89394] transition-colors"
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardSideBar;