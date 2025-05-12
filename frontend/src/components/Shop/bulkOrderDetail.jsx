import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { getBulkOrdersForShop, submitOffer, updateOffer, deleteOffer } from "../../redux/actions/bulkOrderActions";
import { backend_url } from "../../server";
import { BsFillBagFill, BsBoxSeam, BsFillEyeFill, BsFillPencilFill, BsFillTrashFill } from "react-icons/bs";
import { FaShippingFast, FaUserCircle } from "react-icons/fa";
import { MdPayment, MdDescription } from "react-icons/md";

const BulkOrderDetails = () => {
  const dispatch = useDispatch();
  const { id } = useParams();
  const { shopBulkOrders, isLoading } = useSelector((state) => state.bulkOrderReducer);
  const { seller } = useSelector((state) => state.seller);
  const [order, setOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [offerSent, setOfferSent] = useState(false);
  const [offerData, setOfferData] = useState({
    price: "",
    pricePerUnit: "",
    deliveryTime: "",
    terms: "",
    warranty: "",
    availableQuantity: "",
    expirationDate: "",
    packagingDetails: "",
  });
  const [errors, setErrors] = useState({});
  const [modalImage, setModalImage] = useState("");

  useEffect(() => {
    dispatch(getBulkOrdersForShop(seller._id));
  }, [dispatch, seller._id]);

  useEffect(() => {
    if (shopBulkOrders.length > 0) {
      const foundOrder = shopBulkOrders.find((o) => o._id === id);
      if (foundOrder) {
        setOrder(foundOrder);
        if (foundOrder.offer && foundOrder.offer.price > 0) {
          setOfferData({
            price: foundOrder.offer.price,
            pricePerUnit: foundOrder.offer.pricePerUnit,
            deliveryTime: foundOrder.offer.deliveryTime,
            terms: foundOrder.offer.terms,
            warranty: foundOrder.offer.warranty,
            availableQuantity: foundOrder.offer.availableQuantity,
            expirationDate: foundOrder.offer.expirationDate,
            packagingDetails: foundOrder.offer.packagingDetails,
          });
          setOfferSent(true);
        }
      }
    }
  }, [shopBulkOrders, id]);


  const closeImageModal = () => setIsImageModalOpen(false);


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setOfferData((prevData) => ({ ...prevData, [name]: value }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!offerData.price) newErrors.price = "Price is required";
    if (!offerData.pricePerUnit) newErrors.pricePerUnit = "Price per unit is required";
    if (!offerData.deliveryTime) newErrors.deliveryTime = "Delivery time is required";
    if (!offerData.availableQuantity) newErrors.availableQuantity = "Available quantity is required";
    return newErrors;
  };

  const handleSubmitOffer = () => {
    const validationErrors = validateForm();
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    if (offerSent) {
      dispatch(updateOffer(order._id, offerData));
    } else {
      dispatch(submitOffer(order._id, offerData));
    }

    setOrder((prevOrder) => ({
      ...prevOrder,
      offer: { ...offerData },
    }));

    setOfferSent(true);
    setIsModalOpen(false);
  };

  const handleDeleteOffer = () => {
    if (window.confirm("Are you sure you want to delete this offer?")) {
      dispatch(deleteOffer(order._id));
      setOfferSent(false);
      setOfferData({
        price: "",
        pricePerUnit: "",
        deliveryTime: "",
        terms: "",
        warranty: "",
        availableQuantity: "",
        expirationDate: "",
        packagingDetails: "",
      });
    }
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  const openOfferModal = () => setIsOfferModalOpen(true);
  const closeOfferModal = () => setIsOfferModalOpen(false);

  const openImageModal = (image) => {
    setModalImage(image);
    setIsImageModalOpen(true); // Use the correct state variable for the image modal
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
                <h1 className="ml-3 text-3xl font-bold text-[#5a4336]">Bulk Order Details</h1>
              </div>
              <div className="text-right">
                <p className="text-sm text-[#5a4336]">Order ID: <span className="font-semibold">#{order.bulkOrderId?._id?.slice(0, 8)}</span></p>
                <p className="text-sm text-[#5a4336]">Placed On: <span className="font-semibold">{new Date(order.bulkOrderId?.createdAt).toLocaleDateString()}</span></p>
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
                      <p className="text-sm opacity-80">Required Quantity</p>
                      <p className="font-semibold">{order.bulkOrderId.quantity}</p>
                    </div>
                    <div>
                      <p className="text-sm opacity-80">Category</p>
                      <p className="font-semibold">{order.bulkOrderId.category}</p>
                    </div>
                    <div>
                      <p className="text-sm opacity-80">Budget</p>
                      <p className="font-semibold">Rs {order.bulkOrderId.budget}</p>
                    </div>
                    <div>
                      <p className="text-sm opacity-80">Delivery Deadline</p>
                      <p className="font-semibold">{new Date(order.bulkOrderId.deliveryDeadline).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Inspiration Image Card */}
              {order.bulkOrderId.inspoPic && (
                <div className="bg-[#e6d8d8] rounded-lg shadow-lg p-6">
                  <h2 className="text-xl font-semibold text-[#5a4336] mb-4">Inspiration Image</h2>
                  <div
                    className="relative rounded-lg overflow-hidden cursor-pointer group"
                    onClick={() => openImageModal(order.bulkOrderId.inspoPic)}
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
               {/* Image Modal */}
          
            </div>

            {/* Side Information */}
            <div className="space-y-6">
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

              {/* Shipping Information Card */}
              <div className="bg-[#e6d8d8] rounded-lg shadow-lg p-6">
                <div className="flex items-center mb-4">
                  <FaShippingFast size={24} className="text-[#5a4336]" />
                  <h2 className="text-xl font-semibold text-[#5a4336] ml-2">Shipping Details</h2>
                </div>
                <div className="space-y-2 text-[#5a4336]">
                  <p>Address: <span className="font-semibold">{order.bulkOrderId.shippingAddress}</span></p>
                  {order.bulkOrderId.supplierLocationPreference && (
                    <p>Location Preference: <span className="font-semibold">{order.bulkOrderId.supplierLocationPreference}</span></p>
                  )}
                </div>
              </div>

              {/* Offer Actions Card */}
              <div className="bg-[#e6d8d8] rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-semibold text-[#5a4336] mb-4">Offer Actions</h2>
                {offerSent ? (
                  <div className="space-y-4">
                    <div className="flex space-x-4">
                      <button
                        onClick={openOfferModal}
                        className="flex items-center space-x-2 px-4 py-2 bg-[#c8a4a5] text-white rounded-md hover:bg-[#5a4336]"
                      >
                        <BsFillEyeFill size={18} />
                        <span>View</span>
                      </button>
                      <button
                        onClick={openModal}
                        className="flex items-center space-x-2 px-4 py-2 bg-[#c8a4a5] text-white rounded-md hover:bg-[#5a4336]"
                      >
                        <BsFillPencilFill size={18} />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={handleDeleteOffer}
                        className="flex items-center space-x-2 px-4 py-2 bg-[#c8a4a5] text-white rounded-md hover:bg-[#5a4336]"
                      >
                        <BsFillTrashFill size={18} />
                        <span>Delete</span>
                      </button>
                    </div>
                    <div className="p-4 bg-white rounded-lg">
                      <p className="font-semibold">Current Offer Summary:</p>
                      <p>Price: Rs {offerData.price}</p>
                      <p>Delivery Time: {offerData.deliveryTime} days</p>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={openModal}
                    className="w-full py-2 bg-[#c8a4a5] text-white rounded-md hover:bg-[#5a4336]"
                  >
                    Submit Offer
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Modals */}
          {/* Offer View Modal */}
          {isOfferModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
              <div className="bg-white w-full max-w-lg p-6 rounded-lg shadow-xl">
                <h3 className="text-xl font-semibold text-[#5a4336] mb-4">Offer Details</h3>
                <div className="space-y-3 text-[#5a4336]">
                  <p><strong>Price:</strong> Rs {offerData.price}</p>
                  <p><strong>Price Per Unit:</strong> Rs {offerData.pricePerUnit}</p>
                  <p><strong>Delivery Time:</strong> {offerData.deliveryTime} days</p>
                  <p><strong>Terms:</strong> {offerData.terms}</p>
                  <p><strong>Warranty:</strong> {offerData.warranty}</p>
                  <p><strong>Available Quantity:</strong> {offerData.availableQuantity}</p>
                  <p><strong>Expiration Date:</strong> {offerData.expirationDate}</p>
                  <p><strong>Packaging Details:</strong> {offerData.packagingDetails}</p>
                </div>
                <button
                  onClick={closeOfferModal}
                  className="mt-4 px-4 py-2 bg-[#c8a4a5] text-white rounded-md hover:bg-[#5a4336]"
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {/* Offer Edit Modal */}
          {isModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
              <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-3xl overflow-y-auto max-h-[80vh]">
                <h3 className="text-xl font-semibold text-[#5a4336] mb-4">
                  {offerSent ? "Update Your Offer" : "Submit Your Offer"}
                </h3>
                {/* Form Fields */}
                <div className="space-y-4">
                  {/* Price */}
                  <div>
                    <label className="block text-sm font-medium text-[#5a4336]">Price</label>
                    <input
                      type="number"
                      name="price"
                      value={offerData.price}
                      onChange={handleInputChange}
                      className="mt-1 w-full p-2 border rounded-md"
                    />
                    {errors.price && <p className="text-red-500 text-sm">{errors.price}</p>}
                  </div>

                  {/* Price per Unit */}
                  <div>
                    <label className="block text-sm font-medium text-[#5a4336]">Price per Unit</label>
                    <input
                      type="number"
                      name="pricePerUnit"
                      value={offerData.pricePerUnit}
                      onChange={handleInputChange}
                      className="mt-1 w-full p-2 border rounded-md"
                    />
                    {errors.pricePerUnit && <p className="text-red-500 text-sm">{errors.pricePerUnit}</p>}
                  </div>

                  {/* Delivery Time */}
                  <div>
                    <label className="block text-sm font-medium text-[#5a4336]">Delivery Time (days)</label>
                    <input
                      type="number"
                      name="deliveryTime"
                      value={offerData.deliveryTime}
                      onChange={handleInputChange}
                      className="mt-1 w-full p-2 border rounded-md"
                    />
                    {errors.deliveryTime && <p className="text-red-500 text-sm">{errors.deliveryTime}</p>}
                  </div>

                  {/* Terms */}
                  <div>
                    <label className="block text-sm font-medium text-[#5a4336]">Terms</label>
                    <textarea
                      name="terms"
                      value={offerData.terms}
                      onChange={handleInputChange}
                      className="mt-1 w-full p-2 border rounded-md"
                      rows="3"
                    />
                  </div>

                  {/* Warranty */}
                  <div>
                    <label className="block text-sm font-medium text-[#5a4336]">Warranty</label>
                    <textarea
                      name="warranty"
                      value={offerData.warranty}
                      onChange={handleInputChange}
                      className="mt-1 w-full p-2 border rounded-md"
                      rows="3"
                    />
                  </div>

                  {/* Available Quantity */}
                  <div>
                    <label className="block text-sm font-medium text-[#5a4336]">Available Quantity</label>
                    <input
                      type="number"
                      name="availableQuantity"
                      value={offerData.availableQuantity}
                      onChange={handleInputChange}
                      className="mt-1 w-full p-2 border rounded-md"
                    />
                    {errors.availableQuantity && (
                      <p className="text-red-500 text-sm">{errors.availableQuantity}</p>
                    )}
                  </div>

                  {/* Expiration Date */}
                  <div>
                    <label className="block text-sm font-medium text-[#5a4336]">Offer Expiration Date</label>
                    <input
                      type="date"
                      name="expirationDate"
                      value={offerData.expirationDate}
                      onChange={handleInputChange}
                      className="mt-1 w-full p-2 border rounded-md"
                    />
                  </div>

                  {/* Packaging Details */}
                  <div>
                    <label className="block text-sm font-medium text-[#5a4336]">Packaging Details</label>
                    <textarea
                      name="packagingDetails"
                      value={offerData.packagingDetails}
                      onChange={handleInputChange}
                      className="mt-1 w-full p-2 border rounded-md"
                      rows="3"
                    />
                  </div>
                </div>

                {/* Modal Actions */}
                <div className="mt-6 flex justify-end space-x-4">
<button
                    onClick={closeModal}
                    className="px-4 py-2 bg-gray-200 text-[#5a4336] rounded-md hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitOffer}
                    className="px-4 py-2 bg-[#c8a4a5] text-white rounded-md hover:bg-[#5a4336]"
                  >
                    {offerSent ? "Update Offer" : "Submit Offer"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Image Modal */}
          {modalImage && (
            <div 
              className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50" 
              onClick={() => setModalImage("")}
            >
              <div 
                className="relative max-w-4xl w-full mx-4" 
                onClick={(e) => e.stopPropagation()}
              >
                <img
                  src={`${backend_url}${modalImage}`}
                  alt="Enlarged view"
                  className="w-full rounded-lg"
                />
                <button
                  className="absolute top-4 right-4 text-white text-4xl hover:text-gray-300 transition-colors"
                  onClick={() => setModalImage("")}
                >
                  &times;
                </button>
              </div>
            </div>
          )}

          {/* Additional Requirements Section */}
          {(order.bulkOrderId.packagingRequirements || 
            order.bulkOrderId.supplierLocationPreference || 
            order.bulkOrderId.leadTime) && (
            <div className="mt-6 bg-[#e6d8d8] rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-[#5a4336] mb-4">Additional Requirements</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {order.bulkOrderId.packagingRequirements && (
                  <div className="bg-[#c8a4a5] rounded-lg p-4 text-white">
                    <h3 className="font-semibold mb-2">Packaging Requirements</h3>
                    <p>{order.bulkOrderId.packagingRequirements}</p>
                  </div>
                )}
                {order.bulkOrderId.supplierLocationPreference && (
                  <div className="bg-[#c8a4a5] rounded-lg p-4 text-white">
                    <h3 className="font-semibold mb-2">Location Preference</h3>
                    <p>{order.bulkOrderId.supplierLocationPreference}</p>
                  </div>
                )}
                {order.bulkOrderId.leadTime && (
                  <div className="bg-[#c8a4a5] rounded-lg p-4 text-white">
                    <h3 className="font-semibold mb-2">Lead Time</h3>
                    <p>{order.bulkOrderId.leadTime} days</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center text-[#5a4336]">
            <p className="text-xl">Order not found</p>
            <p className="mt-2">The requested order details could not be found.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default BulkOrderDetails;