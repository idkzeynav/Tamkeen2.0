import React from "react";
import AdminHeader from "../components/Layout/AdminHeader";
import AdminSideBar from "../components/Admin/Layout/AdminSideBar";
import AllUsers from "../components/Admin/AllUsers";
import AdminReportedServices from "../components/Admin/Adminservicereporting";

const AdminDashboardReport =() =>
{
  return (
    <div>
      <AdminHeader />
      <div className="w-full flex">
        <div className="flex items-start justify-between w-full">
          <div className="w-[80px] 800px:w-[330px]">
            <AdminSideBar active={10} />
          </div>
          <div className="w-full flex-6 px-1 py-3">
          <AdminReportedServices />
          </div>
        </div>
      </div>
    </div>
  );
}
export default AdminDashboardReport