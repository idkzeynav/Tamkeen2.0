import React, { useState } from "react";
import { AiOutlineLogin, AiOutlineMessage } from "react-icons/ai";
import { RiLockPasswordLine } from "react-icons/ri";
import { HiOutlineReceiptRefund, HiOutlineShoppingBag } from "react-icons/hi";
import { RxPerson } from "react-icons/rx";
import { Link, useNavigate } from "react-router-dom";
import { MdOutlineAddShoppingCart, MdOutlineAssignmentTurnedIn } from "react-icons/md";

import {
  MdOutlineAdminPanelSettings,
  MdOutlinePassword,
  MdOutlineTrackChanges,
} from "react-icons/md";
import { TbAddressBook } from "react-icons/tb";
import axios from "axios";
import { server } from "../../server";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";

const ProfileSidebar = ({ active, setActive }) => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.user);
  const [isOpen, setIsOpen] = useState(false);
  const [isProcurementOpen, setIsProcurementOpen] = useState(false); // State to manage Procurement menu toggle
  const [isPopupVisible, setIsPopupVisible] = useState(false); // For Procurement info popup
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

  const togglePopup = () => {
    setIsPopupVisible((prev) => !prev);
  };
  return (
    <div className="flex">
      {/* Hamburger Button */}
      <button
        className="p-4 bg-red-500 text-white rounded-md md:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? 'Close' : 'Menu'}
      </button>

      {/* Sidebar */}
      <div
        className={`${
          isOpen ? 'block' : 'hidden'
        } md:block w-full bg-white shadow-lg rounded-lg p-4 pt-8 transition-transform duration-300 ease-in-out md:w-64`}
      >
        <div
          className="flex items-center cursor-pointer w-full mb-8"
          onClick={() => setActive(1)}
        >
          <RxPerson size={20} color={active === 1 ? "red" : ""} />
          <span className={`pl-3 ${active === 1 ? "text-red-500" : ""} font-semibold`}>
            Profile
          </span>
        </div>

        <div
          className="flex items-center cursor-pointer w-full mb-8"
          onClick={() => setActive(2)}
        >
          <HiOutlineShoppingBag size={20} color={active === 2 ? "red" : ""} />
          <span className={`pl-3 ${active === 2 ? "text-red-500" : ""} font-semibold`}>
            Orders
          </span>
        </div>

        <div
          className="flex items-center cursor-pointer w-full mb-8"
          onClick={() => setActive(4) || navigate("/inbox")}
        >
          <AiOutlineMessage size={20} color={active === 4 ? "red" : ""} />
          <span className={`pl-3 ${active === 4 ? "text-red-500" : ""} font-semibold`}>
            Inbox
          </span>
        </div>

        <div
          className="flex items-center cursor-pointer w-full mb-8"
          onClick={() => setActive(5)}
        >
          <MdOutlineTrackChanges size={20} color={active === 5 ? "red" : ""} />
          <span className={`pl-3 ${active === 5 ? "text-red-500" : ""} font-semibold`}>
            Track Order
          </span>
        </div>

        <div
          className="flex items-center cursor-pointer w-full mb-8"
          onClick={() => setActive(6)}
        >
          <RiLockPasswordLine size={20} color={active === 6 ? "red" : ""} />
          <span className={`pl-3 ${active === 6 ? "text-red-500" : ""} font-semibold`}>
            Change Password
          </span>
        </div>

        <div
          className="flex items-center cursor-pointer w-full mb-8"
          onClick={() => setActive(7)}
        >
          <TbAddressBook size={20} color={active === 7 ? "red" : ""} />
          <span className={`pl-3 ${active === 7 ? "text-red-500" : ""} font-semibold`}>
            Address
          </span>
        </div>

        
        <div
          className="flex items-center cursor-pointer w-full mb-8"
          onClick={() => setActive(12)}
        >
          <TbAddressBook size={20} color={active === 12 ? "red" : ""} />
          <span className={`pl-3 ${active === 12 ? "text-red-500" : ""} font-semibold`}>
            My bookings 
          </span>
        </div>
    {/* Procurement Menu */}
    <div
          className="flex items-center cursor-pointer w-full mb-8"
          onClick={() => setIsProcurementOpen(!isProcurementOpen)} // Toggle Procurement menu
        >
           <HiOutlineShoppingBag size={20} />
          <span className="pl-3 font-semibold">Procurement</span>
        </div>

        {/* Procurement Pages (visible when Procurement menu is open) */}
        {isProcurementOpen && (
          <div className="pl-6">
            <div
              className="flex items-center cursor-pointer w-full mb-8"
              onClick={() => {
                setActive(9);
               
              }}
            >
             <HiOutlineReceiptRefund size={20} color={active === 9 ? "red" : ""} />
              <span className={`pl-3 ${active === 9 ? "text-red-500" : ""} font-semibold`}>
             Bulk Order & Offers
              </span>
            </div>


            <div
              className="flex items-center cursor-pointer w-full mb-8"
              onClick={() => {
                setActive(13);
               
              }}
            >
             <HiOutlineReceiptRefund size={20} color={active === 13 ? "red" : ""} />
              <span className={`pl-3 ${active === 13 ? "text-red-500" : ""} font-semibold`}>
              Create Bulk Order
              </span>
            </div>


            <div
              className="flex items-center cursor-pointer w-full mb-8"
              onClick={() => {
                setActive(11);
          
              }}
            >
              <MdOutlineAssignmentTurnedIn size={20} color={active === 11 ? "red" : ""} />
              <span className={`pl-3 ${active === 11 ? "text-red-500" : ""} font-semibold`}>
              Order In Process 
              </span>
            </div>
          </div>
        )}
      
      <div
              className="flex items-center cursor-pointer w-full mb-8"
              onClick={() => {
                setActive(14);
               
              }}
            >
             <HiOutlineReceiptRefund size={20} color={active === 14 ? "red" : ""} />
              <span className={`pl-3 ${active === 14 ? "text-red-500" : ""} font-semibold`}>
            Workshops
              </span>
            </div>


        {user && user?.role === "Admin" && (
          <Link to="/admin/dashboard">
            <div
              className="flex items-center cursor-pointer w-full mb-8"
              onClick={() => setActive(8)}
            >
              <MdOutlineAdminPanelSettings size={20} color={active === 8 ? "red" : ""} />
              <span className={`pl-3 ${active === 8 ? "text-red-500" : ""} font-semibold`}>
                Admin Dashboard
              </span>
            </div>
          </Link>
        )}

        <div
          className="flex items-center cursor-pointer w-full mb-8"
          onClick={logoutHandler}
        >
          <AiOutlineLogin size={20} color={active === 8 ? "red" : ""} />
          <span className={`pl-3 ${active === 8 ? "text-red-500" : ""} font-semibold`}>
            Logout
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProfileSidebar;