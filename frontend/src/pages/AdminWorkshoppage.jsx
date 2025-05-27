import React from "react";
import AdminHeader from "../components/Layout/AdminHeader";
import AdminSideBar from "../components/Admin/Layout/AdminSideBar";
import AllUsers from "../components/Admin/AllUsers";
import WorkshopList from "../components/workshop/getworkshop";

const AdminDashboardWorkshop =() =>
{
  return (
    <div>
      <AdminHeader />
      <div className="w-full flex">
        <div className="flex items-start justify-between w-full">
          <div className="w-[80px] 800px:w-[330px]">
            <AdminSideBar active={11} />
          </div>
          <div className="w-full flex-8 px-3 py-1">
          <WorkshopList />
          </div>
        </div>
      </div>
    </div>
  );
}
export default AdminDashboardWorkshop;