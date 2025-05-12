import React, { useEffect } from "react";
import AdminHeader from "../components/Layout/AdminHeader";
import AdminSideBar from "../components/Admin/Layout/AdminSideBar";
import { DataGrid } from "@material-ui/data-grid";
import { useDispatch, useSelector } from "react-redux";
import { getAllOrdersOfAdmin } from "../redux/actions/order";

const AdminDashboardOrders = () => {
  const dispatch = useDispatch();

  const { adminOrders, adminOrderLoading } = useSelector(
    (state) => state.order
  );

  useEffect(() => {
    dispatch(getAllOrdersOfAdmin());
  }, [dispatch]);

  const columns = [
    {
      field: "id",
      headerName: "Order ID",
      minWidth: 150,
      flex: 0.8,
      renderCell: (params) => (
        <span className="text-[#5a4336] font-medium break-words">
          {params.value}
        </span>
      ),
    },
    {
      field: "customerName",
      headerName: "Customer",
      minWidth: 150,
      flex: 0.8,
      renderCell: (params) => (
        <span className="text-[#5a4336] font-medium">{params.value}</span>
      ),
    },
    {
      field: "shopName",
      headerName: "Shop",
      minWidth: 150,
      flex: 0.8,
      renderCell: (params) => (
        <span className="text-[#5a4336] font-medium">{params.value}</span>
      ),
    },
    {
      field: "status",
      headerName: "Status",
      minWidth: 120,
      flex: 0.6,
      renderCell: (params) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            params.value === "Delivered"
              ? "bg-[#d8c4b8] text-[#5a4336]"
              : params.value === "Processing"
              ? "bg-[#a67d6d] text-white"
              : "bg-[#c8a4a5] text-white"
          }`}
        >
          {params.value}
        </span>
      ),
    },
    {
      field: "itemsQty",
      headerName: "Items Qty",
      type: "number",
      minWidth: 100,
      flex: 0.5,
      renderCell: (params) => (
        <span className="text-[#5a4336] font-medium">{params.value}</span>
      ),
    },
    {
      field: "total",
      headerName: "Total",
      type: "number",
      minWidth: 130,
      flex: 0.7,
      renderCell: (params) => (
        <span className="text-[#5a4336] font-bold">
          Rs {params.value.toLocaleString()}
        </span>
      ),
    },
    {
      field: "createdAt",
      headerName: "Order Date",
      type: "string",
      minWidth: 130,
      flex: 0.7,
      renderCell: (params) => (
        <span className="text-[#5a4336]">{params.value}</span>
      ),
    },
  ];

  const rows = adminOrders?.map((item) => {
    // Get shop name from the first item in the cart
    // For orders with multiple shops, we could handle this differently
    const shopName = item.cart[0]?.shop?.name || "Unknown Shop";
    
    return {
      id: item._id,
      customerName: item.user?.email || "Unknown Customer",
      shopName: shopName,
      itemsQty: item.cart.reduce((acc, cartItem) => acc + cartItem.qty, 0),
      total: item.totalPrice,
      status: item.status,
      createdAt: item.createdAt.slice(0, 10),
    };
  });

  return (
    <div className="w-full min-h-screen bg-[#f7f1f1]">
      <AdminHeader />
      <div className="flex w-full">
        <div className="w-[80px] 800px:w-[330px]">
          <AdminSideBar active={2} />
        </div>
        <div className="w-full flex justify-center py-10">
          <div className="w-[95%] bg-white shadow-lg rounded-lg p-6">
            <h1 className="text-3xl font-bold text-[#5a4336] text-center mb-6">
              All Orders
            </h1>
            {adminOrderLoading ? (
              <div className="text-center text-[#5a4336]">Loading...</div>
            ) : (
              <DataGrid
                rows={rows}
                columns={columns}
                pageSize={5}
                disableSelectionOnClick
                autoHeight
                className="text-[#5a4336]"
                sx={{
                  "& .MuiDataGrid-columnHeaders": {
                    backgroundColor: "#a67d6d",
                    color: "#ffffff",
                    fontWeight: "bold",
                  },
                  "& .MuiDataGrid-footerContainer": {
                    backgroundColor: "#f7f1f1",
                  },
                  "& .MuiDataGrid-cell": {
                    borderBottom: "1px solid #f7f1f1",
                  },
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardOrders;