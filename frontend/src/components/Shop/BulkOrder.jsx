import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { DataGrid } from '@material-ui/data-grid';
import { getBulkOrdersForShop } from '../../redux/actions/bulkOrderActions';

const BulkOrderList = () => {
  const dispatch = useDispatch();
  const { isLoading, shopBulkOrders, error } = useSelector((state) => state.bulkOrderReducer);
  const { seller } = useSelector((state) => state.seller);

  useEffect(() => {
    dispatch(getBulkOrdersForShop(seller._id));
  }, [dispatch, seller._id]);

  if (isLoading)
    return <div className="text-center mt-20 text-2xl text-[#5a4336]">Loading...</div>;
  if (error)
    return (
      <div className="text-center mt-20 text-xl text-red-500">
        {error}
      </div>
    );
    const filteredOrders = shopBulkOrders?.filter(order => order.status !== 'Accepted' && order.status !== 'Declined');

  // Prepare data for DataGrid
  const rows = filteredOrders?.map((order) => ({
    id: order._id,
    productName: order.bulkOrderId.productName,
    quantity: order.bulkOrderId.quantity,
    budget: `Rs ${order.bulkOrderId.budget}`,
    status: order.status,
  }));

  const columns = [
    { field: 'id', headerName: 'Order ID', minWidth: 150, flex: 1 },
    { field: 'productName', headerName: 'Product Name', minWidth: 180, flex: 1.5 },
    { field: 'quantity', headerName: 'Quantity', minWidth: 100, flex: 1 },
    { field: 'budget', headerName: 'Budget', minWidth: 150, flex: 1 },
    { field: 'status', headerName: 'Status', minWidth: 150, flex: 1 },
    {
      field: 'preview',
      headerName: 'Preview',
      minWidth: 120,
      flex: 1,
      renderCell: (params) => (
        <Link to={`/bulk-order/${params.id}`}>
          <button className="bg-[#c8a4a5] hover:bg-[#5a4336] text-white px-3 py-1 rounded transition duration-300">
            Preview
          </button>
        </Link>
      ),
    },
  ];

  return (
    <div className="w-full px-8 py-6 bg-[#e6d8d8] min-h-screen">
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-3xl font-bold text-[#5a4336] mb-6">
          Welcome to Your Bulk Orders
        </h2>
        <p className="text-[#5a4336] mb-6">
          Explore the requests you’ve received for bulk orders. Stay on top of
          your offers!
        </p>
        <DataGrid
          rows={rows}
          columns={columns}
          pageSize={10}
          disableSelectionOnClick
          autoHeight
          className="bg-[#f8f3f1]"
        />
      </div>
    </div>
  );
};

export default BulkOrderList;
