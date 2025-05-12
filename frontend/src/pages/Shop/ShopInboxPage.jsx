import React, { useState, useEffect } from 'react';
import DashboardHeader from '../../components/Shop/Layout/DashboardHeader'
import DashboardSideBar from '../../components/Shop/Layout/DashboardSideBar'
import DashboardMessages from "../../components/Shop/DashboardMessages";

const ShopInboxPage = () => {
    const [isSidebarVisible, setIsSidebarVisible] = useState(true);
    useEffect(() => {
        // Hide the sidebar when DashboardMessages is rendered
        setIsSidebarVisible(false);
        
        // Optionally, reset the sidebar visibility when leaving the component
        return () => setIsSidebarVisible(true);
    }, []);
    return (
        <div>
            <DashboardHeader />
            <div className="flex items-start justify-between w-full">
                {isSidebarVisible && (
                    <div className="w-[80px] 800px:w-[330px]">
                        <DashboardSideBar active={8} />
                    </div>
                )}
                <DashboardMessages />
            </div>
        </div>
    )
}

export default ShopInboxPage