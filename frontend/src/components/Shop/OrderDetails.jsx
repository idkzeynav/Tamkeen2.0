import React, { useEffect, useState } from "react";
import { 
  AiOutlineArrowLeft, 
  AiOutlineUser, 
  AiOutlineEnvironment, 
  AiOutlinePhone,
  AiOutlineCalendar,
  AiOutlineCreditCard,
  AiOutlineShoppingCart,
  AiOutlineCheckCircle,
  AiOutlineClockCircle,
  AiOutlineMail,
  AiOutlineInfoCircle
} from "react-icons/ai";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { backend_url, server } from "../../server";
import { getAllOrdersOfShop } from "../../redux/actions/order";
import { useDispatch, useSelector } from "react-redux";

const OrderDetails = () => {
  const { orders, isLoading } = useSelector((state) => state.order);
  const { seller } = useSelector((state) => state.seller);
  const dispatch = useDispatch();

  const [status, setStatus] = useState("");
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    dispatch(getAllOrdersOfShop(seller._id));
  }, [dispatch]);

  const data = orders && orders.find((item) => item._id === id);

  useEffect(() => {
    if (data?.status) {
      setStatus(data.status);
    }
  }, [data]);

  const orderUpdateHandler = async (e) => {
    await axios
      .put(
        `${server}/order/update-order-status/${id}`,
        { status },
        { withCredentials: true }
      )
      .then((res) => {
        toast.success("Order updated successfully!");
        navigate("/dashboard-orders");
      })
      .catch((error) => {
        toast.error(error.response.data.message);
      });
  };

  const refundOrderUpdateHandler = async (e) => {
    await axios
      .put(
        `${server}/order/order-refund-success/${id}`,
        { status },
        { withCredentials: true }
      )
      .then((res) => {
        toast.success("Refund processed successfully!");
        dispatch(getAllOrdersOfShop(seller._id));
      })
      .catch((error) => {
        toast.error(error.response.data.message);
      });
  };

  const getStatusColor = (orderStatus) => {
    switch (orderStatus) {
      case "Processing":
        return "bg-[#f59e0b]/10 text-[#f59e0b]";
      case "Shipping":
        return "bg-[#8b5cf6]/10 text-[#8b5cf6]";
      case "Delivered":
        return "bg-[#10b981]/10 text-[#10b981]";
      case "Processing refund":
        return "bg-[#ef4444]/10 text-[#ef4444]";
      case "Refund Success":
        return "bg-[#10b981]/10 text-[#10b981]";
      default:
        return "bg-[#6b7280]/10 text-[#6b7280]";
    }
  };

  if (!data) {
    return (
      <div className="w-full min-h-screen bg-[#faf7f7] p-8">
        <div className="bg-white max-w-2xl mx-auto p-8 rounded-lg shadow-md text-center">
          <h2 className="text-2xl font-bold text-[#5a4336] mb-4">Order Not Found</h2>
          <p className="text-[#6b7280] mb-6">The order you're looking for doesn't exist or may have been deleted.</p>
          <Link to="/dashboard-orders">
            <button className="px-6 py-2 bg-[#c8a4a5] text-white rounded-md hover:bg-[#b59293] transition-colors">
              Back to Orders
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#faf7f7] min-h-screen">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link to="/dashboard-orders">
                <button className="flex items-center gap-2 px-4 py-2 bg-[#f5f0f0] text-[#5a4336] rounded-md hover:bg-[#e6d8d8] transition-colors">
                  <AiOutlineArrowLeft size={16} />
                  Back to Orders
                </button>
              </Link>
              <div>
                <h1 className="text-xl font-bold text-[#5a4336]">
                  Order #{data?.universalId || data?._id?.slice(-8)}
                </h1>
                <p className="text-sm text-[#6b7280]">
                  Placed on {new Date(data.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className={`px-3 py-1 rounded-md text-sm font-medium ${getStatusColor(data.status)}`}>
                {data.status}
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-[#c8a4a5]">
                  Rs {data.totalPrice?.toLocaleString()}
                </p>
                <p className="text-xs text-[#6b7280]">Total Amount</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Order Items */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items Card */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-4 py-3 border-b border-[#e5e7eb] bg-[#f9fafb] flex items-center gap-2">
                <AiOutlineShoppingCart size={18} className="text-[#c8a4a5]" />
                <h3 className="font-semibold text-[#5a4336]">
                  Order Items ({data.cart?.length || 0})
                </h3>
              </div>
              
              <div className="divide-y divide-[#e5e7eb]">
                {data.cart && data.cart.map((item, index) => (
                  <div key={index} className="p-4 hover:bg-[#f9fafb] transition-colors">
                    <div className="flex gap-4">
                      <div className="flex-shrink-0">
                        <img 
                          src={item.images?.[0]?.startsWith('http') ? item.images[0] : `${backend_url}/${item.images?.[0]}`}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded-md border border-[#e5e7eb]"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "https://via.placeholder.com/64";
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-[#5a4336] mb-1 truncate">
                          {item.name}
                        </h4>
                        <div className="text-sm text-[#6b7280] mb-2">
                          SKU: {item._id.slice(-6).toUpperCase()}
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-[#6b7280]">Qty: {item.qty}</span>
                          <div className="flex items-center gap-2">
                            {item.discountPrice ? (
                              <>
                                <span className="font-medium text-[#c8a4a5]">
                                  Rs {item.discountPrice.toLocaleString()}
                                </span>
                                <span className="text-[#6b7280] line-through text-xs">
                                  Rs {item.originalPrice.toLocaleString()}
                                </span>
                              </>
                            ) : (
                              <span className="font-medium text-[#c8a4a5]">
                                Rs {item.originalPrice.toLocaleString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 text-right">
                      <span className="font-semibold text-[#5a4336]">
                        Rs {((item.discountPrice || item.originalPrice) * item.qty).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Customer Information Card */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-4 py-3 border-b border-[#e5e7eb] bg-[#f9fafb] flex items-center gap-2">
                <AiOutlineUser size={18} className="text-[#c8a4a5]" />
                <h3 className="font-semibold text-[#5a4336]">Customer Information</h3>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-[#6b7280] mb-2">Contact Information</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <AiOutlineUser size={14} className="text-[#6b7280]" />
                        <span className="text-sm text-[#5a4336]">{data.user?.name || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <AiOutlineMail size={14} className="text-[#6b7280]" />
                        <span className="text-sm text-[#5a4336]">{data.user?.email || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <AiOutlinePhone size={14} className="text-[#6b7280]" />
                        <span className="text-sm text-[#5a4336]">
                          {data.shippingAddress?.phoneNumber || data.user?.phoneNumber || 'Not provided'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-[#6b7280] mb-2">Shipping Address</h4>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <AiOutlineEnvironment size={14} className="text-[#6b7280] mt-0.5" />
                        <div>
                          <p className="text-sm text-[#5a4336]">
                            {data.shippingAddress.address1}
                            {data.shippingAddress.address2 && `, ${data.shippingAddress.address2}`}
                          </p>
                          <p className="text-sm text-[#5a4336]">
                            {data.shippingAddress.city}, {data.shippingAddress.state}, {data.shippingAddress.country}
                          </p>
                          <p className="text-sm text-[#5a4336]">
                            Postal Code: {data.shippingAddress.zipCode || 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="space-y-6">
            {/* Order Status Card */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-4 py-3 border-b border-[#e5e7eb] bg-[#f9fafb] flex items-center gap-2">
                <AiOutlineClockCircle size={18} className="text-[#c8a4a5]" />
                <h3 className="font-semibold text-[#5a4336]">Order Status</h3>
              </div>
              <div className="p-4">
                <div className="space-y-4">
                  <div>
                    <label htmlFor="status" className="block text-sm font-medium text-[#6b7280] mb-1">
                      Update Status
                    </label>
                    <select
                      id="status"
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full border-[#e5e7eb] rounded-md shadow-sm focus:border-[#c8a4a5] focus:ring-[#c8a4a5] text-sm"
                    >
                      {data?.status !== "Processing refund" && data?.status !== "Refund Success" ? (
                        ["Processing", "Shipping", "Delivered"]
                          .slice(["Processing", "Shipping", "Delivered"].indexOf(data?.status))
                          .map((option, index) => (
                            <option value={option} key={index}>
                              {option}
                            </option>
                          ))
                      ) : (
                        ["Processing refund", "Refund Success"]
                          .slice(["Processing refund", "Refund Success"].indexOf(data?.status))
                          .map((option, index) => (
                            <option value={option} key={index}>
                              {option}
                            </option>
                          ))
                      )}
                    </select>
                  </div>
                  <button
                    onClick={
                      data?.status !== "Processing refund"
                        ? orderUpdateHandler
                        : refundOrderUpdateHandler
                    }
                    className="w-full py-2 bg-[#c8a4a5] text-white rounded-md hover:bg-[#b59293] transition-colors"
                  >
                    Update Status
                  </button>
                </div>
              </div>
            </div>

            {/* Order Summary Card */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-4 py-3 border-b border-[#e5e7eb] bg-[#f9fafb] flex items-center gap-2">
                <AiOutlineCheckCircle size={18} className="text-[#c8a4a5]" />
                <h3 className="font-semibold text-[#5a4336]">Order Summary</h3>
              </div>
              <div className="p-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-[#6b7280]">Subtotal ({data.cart?.length || 0} items)</span>
                    <span className="text-sm font-medium text-[#5a4336]">Rs {data.totalPrice?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-[#6b7280]">Shipping</span>
                    <span className="text-sm font-medium text-[#5a4336]">Free</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-[#6b7280]">Tax</span>
                    <span className="text-sm font-medium text-[#5a4336]">Rs 0</span>
                  </div>
                  <div className="border-t border-[#e5e7eb] pt-2 mt-2">
                    <div className="flex justify-between">
                      <span className="text-base font-medium text-[#5a4336]">Total</span>
                      <span className="text-base font-bold text-[#c8a4a5]">Rs {data.totalPrice?.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Information Card */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-4 py-3 border-b border-[#e5e7eb] bg-[#f9fafb] flex items-center gap-2">
                <AiOutlineCreditCard size={18} className="text-[#c8a4a5]" />
                <h3 className="font-semibold text-[#5a4336]">Payment Information</h3>
              </div>
              <div className="p-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-[#6b7280]">Method</span>
                    <span className="text-sm font-medium text-[#5a4336]">
                      {data.paymentInfo?.type || 'Credit Card'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-[#6b7280]">Status</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      data.paymentInfo?.status === "succeeded" 
                        ? "bg-[#10b981]/10 text-[#10b981]" 
                        : "bg-[#f59e0b]/10 text-[#f59e0b]"
                    }`}>
                      {data.paymentInfo?.status === "succeeded" ? "Paid" : "Pending"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-[#6b7280]">Transaction ID</span>
                    <span className="text-sm font-medium text-[#5a4336] truncate max-w-[120px]">
                      {data.paymentInfo?.id?.slice(0, 8) || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline Card */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-4 py-3 border-b border-[#e5e7eb] bg-[#f9fafb] flex items-center gap-2">
                <AiOutlineInfoCircle size={18} className="text-[#c8a4a5]" />
                <h3 className="font-semibold text-[#5a4336]">Order Timeline</h3>
              </div>
              <div className="p-4">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-1.5 ${
                      data.status === "Processing" ? "bg-[#f59e0b]" : "bg-[#10b981]"
                    }`} />
                    <div>
                      <p className="text-sm font-medium text-[#5a4336]">Order Placed</p>
                      <p className="text-xs text-[#6b7280]">
                        {new Date(data.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-1.5 ${
                      ["Processing"].includes(data.status) ? "bg-[#6b7280]" : "bg-[#10b981]"
                    }`} />
                    <div>
                      <p className="text-sm font-medium text-[#5a4336]">Processing</p>
                      {data.status !== "Processing" && (
                        <p className="text-xs text-[#6b7280]">
                          {new Date(data.updatedAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-1.5 ${
                      ["Processing", "Shipping"].includes(data.status) ? "bg-[#6b7280]" : "bg-[#10b981]"
                    }`} />
                    <div>
                      <p className="text-sm font-medium text-[#5a4336]">Shipped</p>
                      {data.status === "Delivered" && (
                        <p className="text-xs text-[#6b7280]">
                          {new Date(data.updatedAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-1.5 ${
                      data.status === "Delivered" ? "bg-[#10b981]" : "bg-[#6b7280]"
                    }`} />
                    <div>
                      <p className="text-sm font-medium text-[#5a4336]">Delivered</p>
                      {data.status === "Delivered" && (
                        <p className="text-xs text-[#6b7280]">
                          {new Date(data.updatedAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;