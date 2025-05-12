import React from "react";
import DashboardHeader from "../../components/Shop/Layout/DashboardHeader";
import DashboardSideBar from "../../components/Shop/Layout/DashboardSideBar";
import Bookings from "../../components/Shop/Bookings";

const ShopBookings = () => {
  return (
    <div>
      <DashboardHeader />
      <div className="flex justify-between w-full">
        <div className="w-[80px] 800px:w-[330px]">
          <DashboardSideBar active={14} /> {/* Set the correct active tab */}
        </div>
        <div className="w-full justify-center flex">
          <Bookings />
        </div>
      </div>
    </div>
  );
};

export default ShopBookings;
