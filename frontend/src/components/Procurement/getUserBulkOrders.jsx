import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getUserBulkOrders, deleteBulkOrder } from "../../redux/actions/bulkOrderActions";
import { Link } from "react-router-dom";
import { Package, MoreVertical, ExternalLink, Trash2, AlertCircle, Loader2 } from 'lucide-react';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, orderName }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 transition-opacity">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md transform transition-all">
        <div className="flex items-center gap-3 mb-6">
          <AlertCircle className="w-8 h-8 text-red-500" />
          <h2 className="text-2xl font-bold text-[#5a4336]">
            Confirm Deletion
          </h2>
        </div>
        <p className="text-[#a67d6d] mb-8 text-lg">
          Are you sure you want to delete the order <span className="font-semibold text-[#5a4336]">{orderName}</span>?
        </p>
        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-lg text-[#5a4336] hover:bg-[#d8c4b8]/10 transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-3 rounded-lg bg-gradient-to-r from-red-500 to-red-600 text-white hover:opacity-90 transition-opacity duration-200 shadow-lg"
          >
            Delete Order
          </button>
        </div>
      </div>
    </div>
  );
};

const UserBulkOrders = () => {
  const dispatch = useDispatch();
  const { userBulkOrders, isLoading } = useSelector((state) => state.bulkOrderReducer);
  const { user } = useSelector((state) => state.user);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [deleteMessage, setDeleteMessage] = useState("");
  const [isMessageVisible, setIsMessageVisible] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);

  useEffect(() => {
    dispatch(getUserBulkOrders(user._id));
  }, [dispatch, user._id]);

  const openModal = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  const handleConfirmDelete = () => {
    if (selectedOrder) {
      dispatch(deleteBulkOrder(selectedOrder._id));
      setDeleteMessage("Order deleted successfully");
      setIsMessageVisible(true);
      setTimeout(() => setIsMessageVisible(false), 3000);
    }
    closeModal();
  };

  const toggleDropdown = (id) => {
    setOpenDropdown((prev) => (prev === id ? null : id));
    
  };

  const pendingOrders = userBulkOrders?.filter((order) => order.status === "Pending");

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#d8c4b8]/20 to-[#d8c4b8]/10 flex items-center justify-center">
        <div className="flex items-center gap-3 text-[#5a4336]">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="text-lg">Loading your orders...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#d8c4b8]/20 to-[#d8c4b8]/10 py-12 px-4">
      {isMessageVisible && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-[#5a4336] to-[#8c6c6b] text-white py-3 px-6 rounded-lg shadow-xl z-50 animate-fade-in-down">
          {deleteMessage}
        </div>
      )}

      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-[#c8a4a5] to-[#8c6c6b] p-8">
            <div className="flex items-center gap-4">
              <Package className="w-10 h-10 text-white" />
              <h1 className="text-3xl font-bold text-white">Your Pending Bulk Orders</h1>
            </div>
          </div>

          <div className="p-8 mb-5">
            {pendingOrders && pendingOrders.length > 0 ? (
              <div className="grid gap-6">
                {pendingOrders.map((order) => (
                  <div
                    key={order._id}
                    className="bg-white rounded-xl p-6 shadow-lg border-2 border-[#c8a4a5]/20 hover:border-[#c8a4a5]/40 transition-all duration-200"
                  >
                     <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-[#5a4336]">
                          {order.productName}
                        </h3>
                        <p className="mt-2 text-[#a67d6d]">{order.description}</p>
                        <div className="mt-4 flex items-center gap-6">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-[#5a4336]">Quantity:</span>
                            <span className="text-[#a67d6d]">{order.quantity}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-[#5a4336]">Status:</span>
                            <span className="px-3 py-1 bg-[#d8c4b8]/20 text-[#5a4336] rounded-full text-sm">
                              {order.status}
                            </span>
                          </div>
                        </div>
                      </div>
                       
                     <div className="relative ">
                        <button
                          onClick={() => toggleDropdown(order._id)}
                          className="p-2 rounded-lg hover:bg-[#d8c4b8]/10 transition-colors duration-200"
                        >
                          <MoreVertical className="w-5 h-5 text-[#5a4336]" />
                        </button>
                        
                        {openDropdown === order._id && (
                          <div 
                            className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-xl border border-[#c8a4a5]/20 w-48"
                            style={{
                              zIndex: 1000,
                              transform: 'translateY(-10%)',
                               marginBottom: '2.5rem'
                            }}
                          >
                            <div className="py-1">
                              <Link
                                to={`/userdetails/${order._id}`}
                                className="flex items-center gap-2 px-4 py-3 text-[#5a4336] hover:bg-[#d8c4b8]/10 transition-colors duration-200"
                              >
                                <ExternalLink className="w-4 h-4" />
                                View Details
                              </Link>
                              <Link
                                to={`/bulk-order/${order._id}/offers`}
                                className="flex items-center gap-2 px-4 py-3 text-[#5a4336] hover:bg-[#d8c4b8]/10 transition-colors duration-200"
                              >
                                <Package className="w-4 h-4" />
                                View Offers
                              </Link>
                              <button
                                onClick={() => openModal(order)}
                                className="w-full flex items-center gap-2 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors duration-200"
                              >
                                <Trash2 className="w-4 h-4" />
                                Delete Order
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-[#c8a4a5] mx-auto mb-4" />
                <p className="text-lg text-[#5a4336]">No pending bulk orders found.</p>
                <p className="text-[#a67d6d] mt-2">Create a new order to get started!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onConfirm={handleConfirmDelete}
        orderName={selectedOrder?.productName || ""}
      />
    </div>
  );
};

export default UserBulkOrders;