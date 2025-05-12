import React from 'react';
import DashboardHeader from '../../components/Shop/Layout/DashboardHeader';
import DashboardSideBar from '../../components/Shop/Layout/DashboardSideBar';
import BulkOrderList from '../../components/Shop/BulkOrder';

const ShopAllBulkOrders = ({ shopId }) => {
  return (
    <div>
      <DashboardHeader />
      <div className="flex items-center justify-between w-full">
        <div className="w-[80px] 800px:w-[330px]">
          <DashboardSideBar active={17} />
        </div>
        <div className="w-full justify-center flex">
          {/* Pass shopId here */}
          <BulkOrderList shopId={shopId} />
        </div>
      </div>
    </div>
  );
};

export default ShopAllBulkOrders;
