import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { getAcceptedBulkOrdersForShop, updateOrderStatus } from "../../redux/actions/bulkOrderActions";
import { backend_url } from "../../server";
import { BsFillBagFill, BsBoxSeam } from "react-icons/bs";
import { FaShippingFast, FaUserCircle } from "react-icons/fa";
import { MdPayment, MdDescription } from "react-icons/md";

const FinalBulkOrder = () => {
  const dispatch = useDispatch();
  const { id } = useParams();
  const { acceptedBulkOrders, isLoading } = useSelector((state) => state.bulkOrderReducer);
  const { seller } = useSelector((state) => state.seller);
  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalImage, setModalImage] = useState("");

  useEffect(() => {
    dispatch(getAcceptedBulkOrdersForShop(seller._id));
  }, [dispatch, seller._id]);

  useEffect(() => {
    if (acceptedBulkOrders.length > 0) {
      const foundOrder = acceptedBulkOrders.find((order) => order._id === id);
      if (foundOrder) {
        setOrder(foundOrder);
        setStatus(foundOrder.bulkOrderId?.status);
      }
    }
  }, [acceptedBulkOrders, id]);

  const handleStatusUpdate = (newStatus) => {
    if (!order) return;
    dispatch(updateOrderStatus(order.bulkOrderId._id, newStatus));
    setStatus(newStatus);
  };

  const openModal = (image) => {
    setModalImage(image);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalImage("");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-[#c8a4a5]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 bg-gray-50">
      {order ? (
        <div className="max-w-6xl mx-auto px-4">
          {/* Header Section */}
          <div className="bg-[#e6d8d8] rounded-lg shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between border-b border-[#c8a4a5] pb-4">
              <div className="flex items-center">
                <BsFillBagFill size={32} className="text-[#5a4336]" />
                <h1 className="ml-3 text-3xl font-bold text-[#5a4336]">Order Details</h1>
              </div>
              <div className="text-right">
                <p className="text-sm text-[#5a4336]">Order ID: <span className="font-semibold">#{order.bulkOrderId._id?.slice(0, 8)}</span></p>
                <p className="text-sm text-[#5a4336]">Placed On: <span className="font-semibold">{order.bulkOrderId.createdAt?.slice(0, 10)}</span></p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Order Information */}
            <div className="lg:col-span-2 space-y-6">
              {/* Product Details Card */}
              <div className="bg-[#e6d8d8] rounded-lg shadow-lg p-6">
                <div className="flex items-center mb-4">
                  <MdDescription size={24} className="text-[#5a4336]" />
                  <h2 className="text-xl font-semibold text-[#5a4336] ml-2">Product Details</h2>
                </div>
                <div className="bg-[#c8a4a5] rounded-lg p-4 text-white">
                  <h3 className="text-lg font-semibold mb-2">{order.bulkOrderId.productName}</h3>
                  <p className="mb-2">{order.bulkOrderId.description}</p>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <p className="text-sm opacity-80">Quantity</p>
                      <p className="font-semibold">{order.availableQuantity}</p>
                    </div>
                    <div>
                      <p className="text-sm opacity-80">Category</p>
                      <p className="font-semibold">{order.bulkOrderId.category}</p>
                    </div>
                    <div>
                      <p className="text-sm opacity-80">Total Price</p>
                      <p className="font-semibold">Rs.{order.price}</p>
                    </div>
                    <div>
                      <p className="text-sm opacity-80">Delivery Time</p>
                      <p className="font-semibold">{order.deliveryTime} days</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sample Image Card */}
              {order.bulkOrderId.inspoPic && (
                <div className="bg-[#e6d8d8] rounded-lg shadow-lg p-6">
                  <h2 className="text-xl font-semibold text-[#5a4336] mb-4">Sample Image</h2>
                  <div
                    className="relative rounded-lg overflow-hidden cursor-pointer group"
                    onClick={() => openModal(order.bulkOrderId.inspoPic)}
                  >
                    <img
                      src={`${backend_url}${order.bulkOrderId.inspoPic}`}
                      alt="Inspiration"
                      className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <span className="text-white font-semibold">Click to expand</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Side Information */}
            <div className="space-y-6">
              {/* Status Update Card */}
              <div className="bg-[#e6d8d8] rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-semibold text-[#5a4336] mb-4">Order Status</h2>
                <div className="space-y-4">
                  <p className="text-[#5a4336]">Current Status: <span className="font-semibold">{status}</span></p>
                  <select
                    value={status}
                    onChange={(e) => handleStatusUpdate(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-[#c8a4a5] focus:ring-2 focus:ring-[#c8a4a5] focus:border-transparent"
                  >
                    <option value="Processing">Processing</option>
                    <option value="Shipping">Shipping</option>
                    <option value="Delivered">Delivered</option>
                  </select>
                </div>
              </div>

              {/* User Information Card */}
              <div className="bg-[#e6d8d8] rounded-lg shadow-lg p-6">
                <div className="flex items-center mb-4">
                  <FaUserCircle size={24} className="text-[#5a4336]" />
                  <h2 className="text-xl font-semibold text-[#5a4336] ml-2">Customer Details</h2>
                </div>
                <div className="space-y-2 text-[#5a4336]">
                  <p>Name: <span className="font-semibold">{order.userId?.name}</span></p>
                  <p>Email: <span className="font-semibold">{order.userId?.email}</span></p>
                </div>
              </div>

              {/* Payment Information Card */}
              <div className="bg-[#e6d8d8] rounded-lg shadow-lg p-6">
                <div className="flex items-center mb-4">
                  <MdPayment size={24} className="text-[#5a4336]" />
                  <h2 className="text-xl font-semibold text-[#5a4336] ml-2">Payment Details</h2>
                </div>
                <div className="space-y-2 text-[#5a4336]">
                  <p>Status: <span className="font-semibold">
                    {order.bulkOrderId.paymentInfo?.type === "Credit Card" ? "Paid" : "Pending"}
                  </span></p>
                  <p>Method: <span className="font-semibold">
                    {order.bulkOrderId.paymentInfo?.type === "Credit Card" ? "Card" : "Cash on Delivery (COD)"}
                  </span></p>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Information Section */}
          {(order.warranty || order.PackagingDetails || order.terms) && (
            <div className="mt-6 bg-[#e6d8d8] rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-[#5a4336] mb-4">Additional Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {order.warranty && (
                  <div className="bg-[#c8a4a5] rounded-lg p-4 text-white">
                    <h3 className="font-semibold mb-2">Warranty</h3>
                    <p>{order.warranty}</p>
                  </div>
                )}
                {order.PackagingDetails && (
                  <div className="bg-[#c8a4a5] rounded-lg p-4 text-white">
                    <h3 className="font-semibold mb-2">Packaging Details</h3>
                    <p>{order.PackagingDetails}</p>
                  </div>
                )}
                {order.terms && (
                  <div className="bg-[#c8a4a5] rounded-lg p-4 text-white">
                    <h3 className="font-semibold mb-2">Terms</h3>
                    <p>{order.terms}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center text-[#5a4336]">
          <p className="text-xl">Order details not found.</p>
        </div>
      )}

      {/* Image Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50" onClick={closeModal}>
          <div className="relative max-w-4xl w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <img
              src={`${backend_url}/${modalImage}`}
              alt="Inspiration"
              className="w-full rounded-lg"
            />
            <button
              className="absolute top-4 right-4 text-white text-4xl hover:text-gray-300 transition-colors"
              onClick={closeModal}
            >
              &times;
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinalBulkOrder;