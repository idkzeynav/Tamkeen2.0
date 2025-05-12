import { Button } from "@material-ui/core";
import { DataGrid } from "@material-ui/data-grid";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import Loader from "../Layout/Loader";
import { getAllOrdersOfShop } from "../../redux/actions/order";
import { AiOutlineArrowRight } from "react-icons/ai";

const AllOrders = () => {
  const { orders, isLoading } = useSelector((state) => state.order);
  const { seller } = useSelector((state) => state.seller);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getAllOrdersOfShop(seller._id));
  }, [dispatch, seller]);

  const columns = [
    {
      field: "id",
      headerName: "Order ID",
      minWidth: 150,
      flex: 0.7,
      headerClassName: "header-theme",
    },
    {
      field: "status",
      headerName: "Status",
      minWidth: 130,
      flex: 0.7,
      headerClassName: "header-theme",
      cellClassName: (params) =>
        params.getValue(params.id, "status") === "Delivered"
          ? "text-green-400 font-bold"
          : "text-red-400 font-bold",
    },
    {
      field: "itemsQty",
      headerName: "Items Qty",
      type: "number",
      minWidth: 130,
      flex: 0.7,
      headerClassName: "header-theme",
    },
    {
      field: "total",
      headerName: "Total",
      type: "number",
      minWidth: 130,
      flex: 0.8,
      headerClassName: "header-theme",
    },
    {
      field: "View",
      flex: 1,
      minWidth: 150,
      headerName: "",
      sortable: false,
      renderCell: (params) => (
        <Link to={`/order/${params.id}`}>
        <Button className="bg-[#f4eceb] text-white p-3 rounded-full shadow-lg hover:scale-105 transform transition duration-300 !bg-[#f4eceb]">
  <AiOutlineArrowRight size={20} />
</Button>

        </Link>
      ),
    },
  ];

  const rows = [];

  orders &&
    orders.forEach((item) => {
      rows.push({
        id: item._id,
        itemsQty: item.cart.length,
        total: "Rs " + item.totalPrice,
        status: item.status,
      });
    });

  return (
    <>
      {isLoading ? (
        <Loader />
      ) : (
        <div className="w-full min-h-screen bg-gray-100 flex justify-center items-start py-10">
          <div className="w-full max-w-6xl bg-[#c8a4a5] backdrop-blur-md rounded-2xl shadow-2xl p-10 transform hover:scale-105 transition-transform duration-500">
            <h1 className="text-2xl font-semibold text-[#5a4336] mb-8 text-center">
              All Orders
            </h1>
            <DataGrid
              rows={rows}
              columns={columns}
              pageSize={10}
              disableSelectionOnClick
              autoHeight
              className="text-[#5a4336] font-semibold bg-white rounded-lg border-none shadow-xl"
            />
          </div>
        </div>
      )}
    </>
  );
};

export default AllOrders;