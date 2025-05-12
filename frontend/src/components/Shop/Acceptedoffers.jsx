import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAcceptedBulkOrdersForShop } from '../../redux/actions/bulkOrderActions';
import Loader from '../Layout/Loader';
import { Link } from 'react-router-dom';
import { AiOutlineArrowRight } from 'react-icons/ai';

const AcceptedBulkOrders = () => {
  const dispatch = useDispatch();
  const { acceptedBulkOrders, isLoading, error } = useSelector((state) => state.bulkOrderReducer);
  const { seller } = useSelector((state) => state.seller);

  useEffect(() => {
    dispatch(getAcceptedBulkOrdersForShop(seller._id));
  }, [dispatch, seller._id]);

  if (isLoading) return <Loader />;
  if (error) return <div className="text-center mt-20 text-xl text-red-500">Error: {error}</div>;

  return (
    <div className="w-full px-8 py-6 bg-[#e6d8d8] min-h-screen">
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-3xl font-bold text-[#5a4336] mb-6">
          Accepted Bulk Orders
        </h2>
        <p className="text-[#5a4336] mb-6">
          Review the bulk orders and manage them seamlessly!
        </p>

        {acceptedBulkOrders.length === 0 ? (
          <div className="text-center text-[#5a4336] text-lg">
            No accepted orders found for this shop.
          </div>
        ) : (
          <div className="overflow-x-auto bg-[#f8f3f1] rounded-lg shadow">
            <table className="min-w-full table-auto">
              <thead className="bg-[#f8f3f1]">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-medium text-[#5a4336]">
                    Order ID
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-[#5a4336]">
                    Product Name
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-[#5a4336]">
                    Quantity
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-[#5a4336]">
                    Accepted by
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-[#5a4336]">
                    Status
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-[#5a4336]">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody>
                {acceptedBulkOrders.map((rfq) => (
                  <tr key={rfq._id} className="border-t hover:bg-[#f8f3f1]">
                    <td className="px-4 py-2 text-sm text-[#5a4336]">{rfq.bulkOrderId._id}</td>
                    <td className="px-4 py-2 text-sm text-[#5a4336]">{rfq.bulkOrderId.productName}</td>
                    <td className="px-4 py-2 text-sm text-[#5a4336]">{rfq.availableQuantity}</td>
                    <td className="px-4 py-2 text-sm text-[#5a4336]">{rfq.userId.name}</td>
                    <td className="px-4 py-2 text-sm">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-white ${
                          rfq.status === 'Accepted' ? 'bg-[#c8a4a5]' : 'bg-red-500'
                        }`}
                      >
                        {rfq.bulkOrderId.status}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-sm">
                      <Link to={`/Finalbulk-order/${rfq._id}`}>
                        <button className="bg-[#c8a4a5] hover:bg-[#5a4336] text-white px-3 py-1 rounded transition duration-300 flex items-center">
                          <AiOutlineArrowRight size={20} />
                          <span className="ml-2">Details</span>
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
    </div>
  );
};

export default AcceptedBulkOrders;
