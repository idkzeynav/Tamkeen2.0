import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getOfferDetails } from "../../redux/actions/bulkOrderActions";
import { useParams, useNavigate } from "react-router-dom";
import { backend_url, server } from "../../server";
import { AiOutlineMessage } from "react-icons/ai";
import { BsFillBagFill } from "react-icons/bs";
import { MdDescription, MdStorefront } from "react-icons/md";
import { FaCalendarAlt } from "react-icons/fa";
import axios from "axios";
import { toast } from "react-toastify";

const OfferDetails = () => {
  const { rfqId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { offerDetails, isLoading, error } = useSelector((state) => state.bulkOrderReducer);
  const { user, isAuthenticated } = useSelector((state) => state.user);

  useEffect(() => {
    dispatch(getOfferDetails(rfqId));
  }, [dispatch, rfqId]);

  const handleMessageSubmit = async () => {
    if (isAuthenticated) {
      try {
        const userId = user._id;
        const sellerId = offerDetails.shop._id;

        const response = await axios.get(
          `${server}/conversation/get-all-conversation-user/${userId}`,
          {
            withCredentials: true,
          }
        );

        const existingConversation = response.data.conversations.find(conv => 
          conv.members.includes(sellerId)
        );

        let conversationId;

        if (existingConversation) {
          conversationId = existingConversation._id;
        } else {
          const groupTitle = rfqId + user._id;
          const newConversation = await axios.post(
            `${server}/conversation/create-new-conversation`,
            {
              groupTitle,
              userId,
              sellerId,
            }
          );
          conversationId = newConversation.data.conversation._id;
        }

        navigate(`/inbox?${conversationId}`);
      } catch (error) {
        console.log(error);
        toast.error("Error creating conversation");
      }
    } else {
      toast.error("Please login to create a conversation");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-[#c8a4a5]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-red-500">Error: {error}</p>
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
              <h1 className="ml-3 text-3xl font-bold text-[#5a4336]">Offer Details</h1>
            </div>
            <div className="text-right">
              <p className="text-sm text-[#5a4336]">RFQ ID: <span className="font-semibold">#{rfqId}</span></p>
              <p className="text-sm text-[#5a4336]">Date: <span className="font-semibold">
                {offerDetails?.createdAt ? new Date(offerDetails.createdAt).toLocaleDateString() : "N/A"}
              </span></p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Offer Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Offer Details Card */}
            <div className="bg-[#e6d8d8] rounded-lg shadow-lg p-6">
              <div className="flex items-center mb-4">
                <MdDescription size={24} className="text-[#5a4336]" />
                <h2 className="text-xl font-semibold text-[#5a4336] ml-2">Offer Information</h2>
              </div>
              <div className="bg-[#c8a4a5] rounded-lg p-4 text-white">
                <h3 className="text-lg font-semibold mb-2">{offerDetails?.bulkOrder?.productName || "N/A"}</h3>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <p className="text-sm opacity-80">Price</p>
                    <p className="font-semibold">Rs {offerDetails?.price || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm opacity-80">Price Per Unit</p>
                    <p className="font-semibold">Rs {offerDetails?.pricePerUnit || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm opacity-80">Delivery Time</p>
                    <p className="font-semibold">{offerDetails?.deliveryTime || "N/A"} days</p>
                  </div>
                  <div>
                    <p className="text-sm opacity-80">Production Capacity</p>
                    <p className="font-semibold">{offerDetails?.availableQuantity || "N/A"}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="bg-[#e6d8d8] rounded-lg shadow-lg p-6">
              <div className="flex items-center mb-4">
                <FaCalendarAlt size={24} className="text-[#5a4336]" />
                <h2 className="text-xl font-semibold text-[#5a4336] ml-2">Terms and Conditions</h2>
              </div>
              <div className="bg-[#c8a4a5] rounded-lg p-4 text-white">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <p className="text-sm opacity-80">Terms</p>
                    <p className="font-semibold">{offerDetails?.terms || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm opacity-80">Warranty</p>
                    <p className="font-semibold">{offerDetails?.warranty || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm opacity-80">Packaging Details</p>
                    <p className="font-semibold">{offerDetails?.packagingDetails || "N/A"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Side Information */}
          <div className="space-y-6">
            {/* Seller Information */}
            <div className="bg-[#e6d8d8] rounded-lg shadow-lg p-6">
              <div className="flex items-center mb-4">
                <MdStorefront size={24} className="text-[#5a4336]" />
                <h2 className="text-xl font-semibold text-[#5a4336] ml-2">Seller Information</h2>
              </div>
              <div className="bg-[#c8a4a5] rounded-lg p-4 text-white">
                <div className="space-y-3">
                  <div>
                    <p className="text-sm opacity-80">Shop Name</p>
                    <p className="font-semibold">{offerDetails?.shop?.name || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm opacity-80">Email</p>
                    <p className="font-semibold">{offerDetails?.shop?.email || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm opacity-80">Phone Number</p>
                    <p className="font-semibold">{offerDetails?.shop?.phoneNumber || "N/A"}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Button */}
            <div className="bg-[#e6d8d8] rounded-lg shadow-lg p-6">
              <button
                className="w-full h-12 rounded-lg bg-[#5a4336] text-white flex items-center justify-center space-x-2 hover:bg-[#4a3326] transition-colors"
                onClick={handleMessageSubmit}
              >
                <span>Send Message</span>
                <AiOutlineMessage size={20} />
              </button>
            </div>

            {/* Status Card */}
            <div className="bg-[#e6d8d8] rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-[#5a4336] mb-4">Offer Status</h2>
              <div className="bg-[#c8a4a5] rounded-lg p-4 text-white">
                <p className="font-semibold">{offerDetails?.status || "N/A"}</p>
                <p className="text-sm mt-2">
                  Expires: {offerDetails?.expirationDate || "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfferDetails;