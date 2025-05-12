import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getBulkOrderOffers } from "../../redux/actions/bulkOrderActions";
import { Link, useParams, useNavigate } from "react-router-dom";
import { 
  Package, 
  Eye, 
  Clock, 
  Mail, 
  Store, 
  CreditCard,
  Loader2, 
  CheckCircle2,
  AlertCircle,
  ArrowUpDown
} from 'lucide-react';

const BulkOrderOffers = () => {
  const { bulkOrderId } = useParams();
  const dispatch = useDispatch();
  const { offers = [], isLoading } = useSelector((state) => state.bulkOrderReducer);
  const navigate = useNavigate();
  const [acceptedOfferId, setAcceptedOfferId] = useState(null);
  const [bulkOrderStatus, setBulkOrderStatus] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  useEffect(() => {
    dispatch(getBulkOrderOffers(bulkOrderId));
    setAcceptedOfferId(null);
  }, [dispatch, bulkOrderId]);

  useEffect(() => {
    const acceptedOffer = offers.find((offer) => offer.status === "Accepted");
    if (acceptedOffer) {
      setAcceptedOfferId(acceptedOffer._id);
    }
    if (offers.length > 0 && offers[0].bulkOrderStatus) {
      setBulkOrderStatus(offers[0].bulkOrderStatus);
    }
  }, [offers]);

  const handleAcceptOffer = (rfqId) => {
    setAcceptedOfferId(rfqId);
    navigate(`/bulkorderpayment/${rfqId}`);
  };

  const sortOffers = (key) => {
    setSortConfig((current) => {
      const newDirection = current.key === key && current.direction === 'asc' ? 'desc' : 'asc';
      return { key, direction: newDirection };
    });
  };

  const getSortedOffers = () => {
    if (!sortConfig.key) return offers;

    return [...offers].sort((a, b) => {
      if (sortConfig.key === 'shopName') {
        const aVal = a.shopId?.name || '';
        const bVal = b.shopId?.name || '';
        return sortConfig.direction === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];
      return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#d8c4b8]/20 to-[#d8c4b8]/10 flex items-center justify-center">
        <div className="flex items-center gap-3 text-[#5a4336]">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="text-lg">Loading offers...</span>
        </div>
      </div>
    );
  }

  const SortHeader = ({ label, sortKey }) => (
    <th className="px-6 py-4 font-semibold text-[#5a4336]">
      <button 
        onClick={() => sortOffers(sortKey)}
        className="flex items-center gap-2 hover:opacity-80 transition-opacity"
      >
        {label}
        <ArrowUpDown className="w-4 h-4" />
      </button>
    </th>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#d8c4b8]/20 to-[#d8c4b8]/10 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-[#c8a4a5] to-[#8c6c6b] p-8">
            <div className="flex items-center gap-4 mb-6">
              <Package className="w-10 h-10 text-white" />
              <h1 className="text-3xl font-bold text-white">Compare Bulk Order Offers</h1>
            </div>
            <p className="text-[#f5e6e0] text-lg">
              Compare offers side by side to find the best match for your bulk order requirements.
            </p>
          </div>

          <div className="p-6">
            {offers.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b-2 border-[#d8c4b8]">
                      <SortHeader label="Seller" sortKey="shopName" />
                      <th className="px-6 py-4 font-semibold text-[#5a4336]">Contact</th>
                      <SortHeader label="Price (Rs.)" sortKey="price" />
                      <SortHeader label="Price Per Unit" sortKey="pricePerUnit" />
                      <SortHeader label="Available Qty" sortKey="availableQuantity" />
                      <SortHeader label="Delivery (Days)" sortKey="deliveryTime" />
                      <th className="px-6 py-4 font-semibold text-[#5a4336]">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getSortedOffers().map((offer) => (
                      <tr 
                        key={offer._id} 
                        className="border-b border-[#d8c4b8]/30 hover:bg-[#d8c4b8]/5 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Store className="w-5 h-5 text-[#5a4336]" />
                            <span className="font-medium text-[#5a4336]">
                              {offer.shopId?.name || "N/A"}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-[#a67d6d]">
                            <Mail className="w-4 h-4" />
                            <span>{offer.shopId?.email || "N/A"}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-medium text-[#5a4336]">
                          {offer.price.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 font-medium text-[#5a4336]">
                          {offer.pricePerUnit.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 font-medium text-[#5a4336]">
                          {offer.availableQuantity.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 font-medium text-[#5a4336]">
                          {offer.deliveryTime}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <Link
                              to={`/offer-details/${offer._id}`}
                              className="p-2 rounded-lg hover:bg-[#d8c4b8]/10 transition-colors"
                            >
                              <Eye className="w-5 h-5 text-[#5a4336]" />
                            </Link>
                            {offer._id === acceptedOfferId ? (
                              <span className="flex items-center gap-2 text-green-600">
                                <CheckCircle2 className="w-5 h-5" />
                                Accepted
                              </span>
                            ) : (
                              <button
                                onClick={() => handleAcceptOffer(offer._id)}
                                disabled={bulkOrderStatus === "Processing"}
                                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 
                                  ${bulkOrderStatus === "Processing"
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-[#c8a4a5] to-[#8c6c6b] text-white hover:opacity-90'
                                  }`}
                              >
                                {bulkOrderStatus === "Processing" ? "Processing..." : "Accept"}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <AlertCircle className="w-16 h-16 text-[#c8a4a5] mx-auto mb-4" />
                <h3 className="text-xl font-bold text-[#5a4336] mb-2">No Offers Yet</h3>
                <p className="text-[#a67d6d]">
                  There are currently no offers for this bulk order. 
                  Please check back later.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkOrderOffers;