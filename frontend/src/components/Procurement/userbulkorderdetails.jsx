import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getUserBulkOrders } from "../../redux/actions/bulkOrderActions";
import { useParams, useNavigate } from "react-router-dom";
import { backend_url, server } from "../../server";
import { BsFillBagFill, BsBoxSeam } from "react-icons/bs";
import { FaShippingFast, FaUserCircle, FaCalendarAlt } from "react-icons/fa";
import { MdPayment, MdDescription, MdLocationOn } from "react-icons/md";

const UserBulkOrderDetails = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { orderId } = useParams();
  const { userBulkOrders, isLoading } = useSelector((state) => state.bulkOrderReducer);

  const selectedOrder = userBulkOrders.find((order) => order._id === orderId);

  useEffect(() => {
    if (!userBulkOrders.length) {
      dispatch(getUserBulkOrders());
    }
  }, [dispatch, userBulkOrders.length]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalImage, setModalImage] = useState("");

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

  if (!selectedOrder) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-[#5a4336]">Order not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header Section */}
        <div className="bg-[#e6d8d8] rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between border-b border-[#c8a4a5] pb-4">
            <div className="flex items-center">
              <BsFillBagFill size={32} className="text-[#5a4336]" />
              <h1 className="ml-3 text-3xl font-bold text-[#5a4336]">Bulk Order Details</h1>
            </div>
            <div className="text-right">
              <p className="text-sm text-[#5a4336]">Order ID: <span className="font-semibold">#{selectedOrder._id?.slice(0, 8)}</span></p>
              <p className="text-sm text-[#5a4336]">Placed On: <span className="font-semibold">{new Date(selectedOrder.createdAt).toLocaleDateString()}</span></p>
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
                <h3 className="text-lg font-semibold mb-2">{selectedOrder.productName}</h3>
                <p className="mb-4">{selectedOrder.description}</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm opacity-80">Quantity</p>
                    <p className="font-semibold">{selectedOrder.quantity}</p>
                  </div>
                  <div>
                    <p className="text-sm opacity-80">Category</p>
                    <p className="font-semibold">{selectedOrder.category}</p>
                  </div>
                  <div>
                    <p className="text-sm opacity-80">Budget</p>
                    <p className="font-semibold">Rs {selectedOrder.budget}</p>
                  </div>
                  <div>
                    <p className="text-sm opacity-80">Status</p>
                    <p className="font-semibold">{selectedOrder.status}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sample Image Card */}
            {selectedOrder.inspoPic && (
              <div className="bg-[#e6d8d8] rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-semibold text-[#5a4336] mb-4">Sample Image</h2>
                <div
                  className="relative rounded-lg overflow-hidden cursor-pointer group"
                  onClick={() => openModal(selectedOrder.inspoPic)}
                >
                  <img
                    src={`${backend_url}/${selectedOrder.inspoPic}`}
                    alt="Sample"
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
            {/* Delivery Information */}
            <div className="bg-[#e6d8d8] rounded-lg shadow-lg p-6">
              <div className="flex items-center mb-4">
                <FaCalendarAlt size={24} className="text-[#5a4336]" />
                <h2 className="text-xl font-semibold text-[#5a4336] ml-2">Delivery Information</h2>
              </div>
              <div className="space-y-3 text-[#5a4336]">
                <p>Deadline: <span className="font-semibold">{new Date(selectedOrder.deliveryDeadline).toLocaleDateString()}</span></p>
                {selectedOrder.leadTime && (
                  <p>Lead Time: <span className="font-semibold">{selectedOrder.leadTime} days</span></p>
                )}
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-[#e6d8d8] rounded-lg shadow-lg p-6">
              <div className="flex items-center mb-4">
                <MdLocationOn size={24} className="text-[#5a4336]" />
                <h2 className="text-xl font-semibold text-[#5a4336] ml-2">Shipping Address</h2>
              </div>
              <div className="text-[#5a4336]">
                <p>{selectedOrder.shippingAddress}</p>
              </div>
            </div>

            {/* Payment Information */}
            <div className="bg-[#e6d8d8] rounded-lg shadow-lg p-6">
              <div className="flex items-center mb-4">
                <MdPayment size={24} className="text-[#5a4336]" />
                <h2 className="text-xl font-semibold text-[#5a4336] ml-2">Payment Details</h2>
              </div>
              <div className="space-y-2 text-[#5a4336]">
                <p>Status: <span className="font-semibold">
                  {selectedOrder.paymentInfo?.type === "Credit Card" ? "Paid" : "Pending"}
                </span></p>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Requirements Section */}
        {(selectedOrder.packagingRequirements || selectedOrder.supplierLocationPreference) && (
          <div className="mt-6 bg-[#e6d8d8] rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-[#5a4336] mb-4">Additional Requirements</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {selectedOrder.packagingRequirements && (
                <div className="bg-[#c8a4a5] rounded-lg p-4 text-white">
                  <h3 className="font-semibold mb-2">Packaging Requirements</h3>
                  <p>{selectedOrder.packagingRequirements}</p>
                </div>
              )}
              {selectedOrder.supplierLocationPreference && (
                <div className="bg-[#c8a4a5] rounded-lg p-4 text-white">
                  <h3 className="font-semibold mb-2">Preferred Supplier Location</h3>
                  <p>{selectedOrder.supplierLocationPreference}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Image Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50" onClick={closeModal}>
          <div className="relative max-w-4xl w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <img
              src={`${backend_url}/${modalImage}`}
              alt="Expanded view"
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

export default UserBulkOrderDetails;