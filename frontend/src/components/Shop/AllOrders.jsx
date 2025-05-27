import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { AiOutlineArrowRight, AiOutlineDownload } from "react-icons/ai";
import { getAllOrdersOfShop } from "../../redux/actions/order";
import Loader from "../Layout/Loader";
import ExportOrdersButton from '../../components/ui/ExportOrdersButton';

// Consistent color scheme
const colors = {
  primary: '#c8a4a5', // Soft pink
  secondary: '#e6d8d8', // Light baby brown
  tertiary: '#f5f0f0', // Off-white
  light: '#faf7f7', // Very light background
  white: '#ffffff', // Pure white
  dark: '#5a4336', // Dark brown for text
  warning: '#f59e0b', // Warning color
  danger: '#ef4444', // Error color
  success: '#10b981', // Success color
};

const AllOrders = () => {
  const { orders, isLoading } = useSelector((state) => state.order);
  const { seller } = useSelector((state) => state.seller);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getAllOrdersOfShop(seller._id));
  }, [dispatch, seller]);

  return (
    <div className="w-full p-8" style={{ backgroundColor: colors.light, minHeight: '100vh' }}>
      <h1 className="text-2xl md:text-3xl font-bold mb-6" style={{ color: colors.dark }}>
        All Orders
      </h1>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader />
        </div>
      ) : orders && orders.length === 0 ? (
        <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-lg shadow-md text-center">
          <AiOutlineDownload size={40} className="mx-auto mb-4 text-green-500" />
          <h2 className="text-xl font-semibold mb-2 text-green-800">No Orders Yet</h2>
          <p className="text-green-700">You haven't received any orders yet. They'll appear here when you do.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="flex justify-between items-center p-4 border-b">
            <h2 className="text-lg font-semibold" style={{ color: colors.dark }}>
              Order Summary
            </h2>
            {orders && orders.length > 0 && (
              <ExportOrdersButton orders={orders} />
            )}
          </div>
          
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Items Qty
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders && orders.map((order) => (
                <tr key={order._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium" style={{ color: colors.dark }}>
                      {order.shortId || order._id.substring(0, 8)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div 
                      className={`text-sm font-medium ${
                        order.status === "Delivered" ? "text-green-500" : "text-yellow-500"
                      }`}
                    >
                      {order.status}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm" style={{ color: colors.dark }}>
                      {order.cart.length}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm" style={{ color: colors.dark }}>
                      Rs {order.totalPrice}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <Link to={`/order/${order._id}`}>
                      <button
                        className="flex items-center px-3 py-1 rounded text-white transition-colors"
                        style={{ backgroundColor: colors.primary }}
                      >
                        <AiOutlineArrowRight className="mr-1" />
                        View
                      </button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AllOrders;