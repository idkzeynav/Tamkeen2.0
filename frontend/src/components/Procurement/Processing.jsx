import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getUserProcessingOrders } from "../../redux/actions/bulkOrderActions";
import Loader from "../Layout/Loader";
import { FaBox, FaShippingFast, FaCheckCircle, FaShoppingCart } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const ProcessingOrdersPage = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user);
  const { processingOrders, isLoading } = useSelector((state) => state.bulkOrderReducer);
  const [localError, setLocalError] = useState(null);
  const navigate = useNavigate(); 

  useEffect(() => {
    if (user) {
      dispatch(getUserProcessingOrders(user._id))
        .then((response) => {
          if (!response || !response.success) {
            // Handle the case when no orders are found without affecting other parts of the state
            console.log("No processing orders found");
            setLocalError("No processing orders found at this time.");
          }
        })
        .catch((error) => {
          // Handle any actual errors
          console.error("Error fetching orders:", error);
          setLocalError("Error fetching your orders. Please try again later.");
        });
    }
    
    // No need to clear errors on unmount since clearErrors is not available
  }, [dispatch, user]);

  const getStatusStep = (status) => {
    switch (status) {
      case "Ordered":
        return 1;
      case "Processing":
        return 2;
      case "Shipping":
        return 3;
      case "Delivered":
        return 4;
      default:
        return 0;
    }
  };

  const getStatusLabel = (status) => {
    const statusColors = {
      Ordered: "bg-pink-200 text-pink-800",
      Processing: "bg-yellow-200 text-yellow-800",
      Shipping: "bg-blue-200 text-blue-800",
      Delivered: "bg-green-200 text-green-800",
    };
    return (
      <span
        className={`absolute top-4 right-4 px-4 py-1 rounded-full text-sm font-semibold shadow-md ${
          statusColors[status] || "bg-gray-200 text-gray-800"
        }`}
      >
        {status}
      </span>
    );
  };

  if (isLoading) return <Loader />;

  return (
    <div className="bg-gray-100 min-h-screen p-8">
      <h1 className="text-3xl font-bold text-[#5a4336] mb-6">Your Bulk Orders</h1>
      {processingOrders && processingOrders.length > 0 ? (
        <div className="space-y-6">
          {processingOrders.map((order) => {
            const currentStep = getStatusStep(order.status);
            return (
              <div
                key={order.bulkOrder?._id}
                className="bg-white shadow-md rounded-lg p-6 border border-[#c8a4a5] relative transition-transform transform hover:scale-105"
              >
                {getStatusLabel(order.status)}
                <div className="flex justify-between items-center mb-4">
                  <p className="font-semibold text-[#5a4336]">
                    <strong>Order ID:</strong> {order.bulkOrder?._id || "N/A"}
                  </p>
                </div>
                <div className="space-y-2 mb-6">
                  <h2 className="text-xl font-semibold text-[#5a4336]">
                    {order.bulkOrder?.productName || "N/A"}
                  </h2>
                  <p className="text-sm text-[#a67d6d]">
                    <strong>Total Price:</strong> {order.bulkOrder?.acceptedOffer?.price || "N/A"}
                  </p>
                </div>
                {/* Status Timeline */}
                <div className="flex items-center justify-between mb-6">
                  {/* Ordered */}
                  <div className="flex flex-col items-center">
                    <FaShoppingCart
                      className={`text-2xl ${
                        currentStep >= 1 ? "text-[#5a4336]" : "text-gray-400"
                      }`}
                    />
                    <span
                      className={`text-sm font-semibold ${
                        currentStep >= 1 ? "text-[#5a4336]" : "text-gray-400"
                      }`}
                    >
                      Ordered
                    </span>
                  </div>
                  <div
                    className={`flex-grow h-1 mx-2 ${
                      currentStep >= 2 ? "bg-[#c8a4a5]" : "bg-gray-300"
                    }`}
                  />
                  {/* Processing */}
                  <div className="flex flex-col items-center">
                    <FaBox
                      className={`text-2xl ${
                        currentStep >= 2 ? "text-[#5a4336]" : "text-gray-400"
                      }`}
                    />
                    <span
                      className={`text-sm font-semibold ${
                        currentStep >= 2 ? "text-[#5a4336]" : "text-gray-400"
                      }`}
                    >
                      Processing
                    </span>
                  </div>
                  <div
                    className={`flex-grow h-1 mx-2 ${
                      currentStep >= 3 ? "bg-[#c8a4a5]" : "bg-gray-300"
                    }`}
                  />
                  {/* Shipping */}
                  <div className="flex flex-col items-center">
                    <FaShippingFast
                      className={`text-2xl ${
                        currentStep >= 3 ? "text-[#5a4336]" : "text-gray-400"
                      }`}
                    />
                    <span
                      className={`text-sm font-semibold ${
                        currentStep >= 3 ? "text-[#5a4336]" : "text-gray-400"
                      }`}
                    >
                      Shipping
                    </span>
                  </div>
                  <div
                    className={`flex-grow h-1 mx-2 ${
                      currentStep >= 4 ? "bg-[#c8a4a5]" : "bg-gray-300"
                    }`}
                  />
                  {/* Delivered */}
                  <div className="flex flex-col items-center">
                    <FaCheckCircle
                      className={`text-2xl ${
                        currentStep >= 4 ? "text-[#5a4336]" : "text-gray-400"
                      }`}
                    />
                    <span
                      className={`text-sm font-semibold ${
                        currentStep >= 4 ? "text-[#5a4336]" : "text-gray-400"
                      }`}
                    >
                      Delivered
                    </span>
                  </div>
                </div>
                {/* View Details Button */}
                <div className="flex justify-end">
                  <button
                    className="bg-[#5a4336] text-white px-6 py-2 rounded-lg shadow-md hover:bg-[#a67d6d] transition duration-300"
                    onClick={() => navigate(`/FinalBulkorder/details/${order.bulkOrder?._id}`)}
                  >
                    View Details →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-10">
          <div className="bg-white p-8 rounded-lg shadow-md max-w-lg mx-auto">
            <FaBox className="text-5xl text-[#c8a4a5] mx-auto mb-4" />
            <p className="text-gray-600 text-xl mb-4">
              {localError || "No processing orders found."}
            </p>
            <p className="text-gray-500 mb-6">
              When you place and confirm a bulk order, it will appear here.
            </p>
            <button
              onClick={() => navigate('/create-bulk-order')}
              className="bg-[#5a4336] text-white px-6 py-3 rounded-lg shadow-md hover:bg-[#a67d6d] transition duration-300"
            >
              Create a Bulk Order
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProcessingOrdersPage;