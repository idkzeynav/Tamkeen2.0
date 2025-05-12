import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { getUserProcessingOrders } from "../../redux/actions/bulkOrderActions";
import { backend_url } from "../../server";
import { BsFillBagFill, BsBoxSeam } from "react-icons/bs";
import { FaShippingFast, FaUserCircle } from "react-icons/fa";
import { MdPayment, MdDescription } from "react-icons/md";
import { Link } from "react-router-dom";

const ProcessingOrderDetail = () => {
  const dispatch = useDispatch();
  const { orderId } = useParams();
  const { processingOrders, isLoading } = useSelector((state) => state.bulkOrderReducer);

  const selectedOrder = processingOrders?.find(
    (order) => order.bulkOrder._id === orderId
  );

  useEffect(() => {
    if (!processingOrders.length) {
      dispatch(getUserProcessingOrders());
    }
  }, [dispatch, processingOrders.length]);

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

  if (!selectedOrder) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-xl text-[#5a4336]">Order not found.</p>
    </div>
  );

  const {
    bulkOrder,
    OfferDetails: { price, deliveryTime, terms, shopId, warranty, pricePerUnit, PackagingDetails, availableQuantity },
  } = selectedOrder;

  return (
    <div className="min-h-screen py-8 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header Section */}
        <div className="bg-[#e6d8d8] rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between border-b border-[#c8a4a5] pb-4">
            <div className="flex items-center">
              <BsFillBagFill size={32} className="text-[#5a4336]" />
              <h1 className="ml-3 text-3xl font-bold text-[#5a4336]">Order Details</h1>
            </div>
            <div className="text-right">
              <p className="text-sm text-[#5a4336]">Order ID: <span className="font-semibold">#{bulkOrder._id?.slice(0, 8)}</span></p>
              <p className="text-sm text-[#5a4336]">Placed On: <span className="font-semibold">{new Date(bulkOrder.createdAt).toLocaleDateString()}</span></p>
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
                <h3 className="text-lg font-semibold mb-2">{bulkOrder.productName}</h3>
                <p className="mb-2">{bulkOrder.description}</p>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <p className="text-sm opacity-80">Quantity</p>
                    <p className="font-semibold">{availableQuantity}</p>
                  </div>
                  <div>
                    <p className="text-sm opacity-80">Category</p>
                    <p className="font-semibold">{bulkOrder.category}</p>
                  </div>
                  <div>
                    <p className="text-sm opacity-80">Total Price</p>
                    <p className="font-semibold">Rs {price}</p>
                  </div>
                  <div>
                    <p className="text-sm opacity-80">Status</p>
                    <p className="font-semibold">{bulkOrder.status}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sample Image Card */}
            {bulkOrder.inspoPic && (
              <div className="bg-[#e6d8d8] rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-semibold text-[#5a4336] mb-4">Sample Image</h2>
                <div
                  className="relative rounded-lg overflow-hidden cursor-pointer group"
                  onClick={() => openModal(bulkOrder.inspoPic)}
                >
                  <img
                    src={`${backend_url}${bulkOrder.inspoPic}`}
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
            {/* Shipping Address Card */}
            <div className="bg-[#e6d8d8] rounded-lg shadow-lg p-6">
              <div className="flex items-center mb-4">
                <FaShippingFast size={24} className="text-[#5a4336]" />
                <h2 className="text-xl font-semibold text-[#5a4336] ml-2">Shipping Address</h2>
              </div>
              <div className="text-[#5a4336]">
                <p>{bulkOrder.shippingAddress}</p>
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
                  {bulkOrder.paymentInfo?.type === "Credit Card" ? "Paid" : "Pending"}
                </span></p>
                <p>Method: <span className="font-semibold">
                  {bulkOrder.paymentInfo?.type === "Credit Card" ? "Card" : "Cash on Delivery (COD)"}
                </span></p>
              </div>
            </div>

            {/* Seller Information Card */}
            {shopId && (
              <div className="bg-[#e6d8d8] rounded-lg shadow-lg p-6">
                <div className="flex items-center mb-4">
                  <FaUserCircle size={24} className="text-[#5a4336]" />
                  <h2 className="text-xl font-semibold text-[#5a4336] ml-2">Seller Information</h2>
                </div>
                <div className="space-y-2 text-[#5a4336]">
                  <p>Shop Name: <span className="font-semibold">{shopId?.name}</span></p>
                  <p>Email: <span className="font-semibold">{shopId?.email}</span></p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Additional Information Section */}
        {(warranty || PackagingDetails || terms) && (
          <div className="mt-6 bg-[#e6d8d8] rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-[#5a4336] mb-4">Additional Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {warranty && (
                <div className="bg-[#c8a4a5] rounded-lg p-4 text-white">
                  <h3 className="font-semibold mb-2">Warranty</h3>
                  <p>{warranty}</p>
                </div>
              )}
              {PackagingDetails && (
                <div className="bg-[#c8a4a5] rounded-lg p-4 text-white">
                  <h3 className="font-semibold mb-2">Packaging Details</h3>
                  <p>{PackagingDetails}</p>
                </div>
              )}
              {terms && (
                <div className="bg-[#c8a4a5] rounded-lg p-4 text-white">
                  <h3 className="font-semibold mb-2">Terms</h3>
                  <p>{terms}</p>
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

export default ProcessingOrderDetail;