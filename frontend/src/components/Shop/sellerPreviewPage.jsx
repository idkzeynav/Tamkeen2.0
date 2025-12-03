import React from "react";
import styles from "../../styles/styles";
import ShopInfo from "../../components/Shop/ShopInfo";
import SellerProfileData from "../../components/Shop/sellerviewtoshop";

const ShopPreviewPage = () => {
  return (
    <div className={`${styles.section} bg-[#f5f5f5] min-h-screen`}>
      <div className="w-full flex py-6 gap-6 h-screen">
        {/* Shop Info Sidebar - Fixed height, no scroll */}
        <div className="w-[300px] flex-shrink-0">
          <div className="bg-white rounded-lg shadow-sm h-fit">
            <ShopInfo isOwner={true} />
          </div>
        </div>
        
        {/* Main Content Area - Takes remaining space */}
        <div className="flex-1 min-w-0">
          <SellerProfileData isOwner={true} />
        </div>
      </div>
    </div>
  );
};

export default ShopPreviewPage;