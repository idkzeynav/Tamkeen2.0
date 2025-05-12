import React from 'react';
import DashboardHeader from '../../components/Shop/Layout/DashboardHeader';
import DashboardSideBar from '../../components/Shop/Layout/DashboardSideBar';
import AcceptedBulkOrders from '../../components/Shop/Acceptedoffers'; // Make sure this import is correct

const ShopAcceptedBulkOrders = ({ shopId }) => {
  return (
    <div>
      <DashboardHeader />
      <div className="flex items-center justify-between w-full">
        <div className="w-[80px] 800px:w-[330px]">
          <DashboardSideBar active={18} /> {/* Set the active sidebar option */}
        </div>
        <div className="w-full justify-center flex">
          {/* Pass the shopId here */}
          <AcceptedBulkOrders shopId={shopId} />
        </div>
      </div>
    </div>
  );
};

export default ShopAcceptedBulkOrders;
