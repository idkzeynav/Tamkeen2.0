import React, { useEffect, useState } from "react";
import { AiOutlineArrowRight, AiOutlineShop, AiOutlineInbox, AiOutlineDollar } from "react-icons/ai";
import { MdStorefront, MdTrendingUp } from "react-icons/md";
import { Link, useNavigate } from "react-router-dom";
import { DataGrid } from "@material-ui/data-grid";
import { useDispatch, useSelector } from "react-redux";
import { getAllOrdersOfAdmin } from "../../redux/actions/order";
import { getAllSellers } from "../../redux/actions/sellers";
import { getAllWholesaleMarkets, deleteWholesaleMarket } from "../../redux/actions/wholesaleMarketActions";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import Loader from "../Layout/Loader";

const AdminDashboardMain = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { adminOrders, adminOrderLoading } = useSelector((state) => state.order);
  const { sellers } = useSelector((state) => state.seller);
  const { wholesaleMarkets } = useSelector((state) => state.wholesaleMarket);
  
  // State for active card
  const [activeCard, setActiveCard] = useState(null);

  useEffect(() => {
    dispatch(getAllOrdersOfAdmin());
    dispatch(getAllSellers());
    dispatch(getAllWholesaleMarkets());
  }, [dispatch]);

  const adminEarning = adminOrders?.reduce((acc, item) => acc + item.totalPrice * 0.1, 0);
  const adminBalance = adminEarning?.toFixed(2);

 

  const processLast7DaysOrders = (orders) => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    const ordersByDay = last7Days.map(date => {
      const count = orders?.filter(order => 
        new Date(order.createdAt).toISOString().split('T')[0] === date
      ).length || 0;

      return {
        name: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
        orders: count
      };
    });

    return ordersByDay;
  };

   // Process orders data for status distribution
   const processOrderStatusData = (orders) => {
    const statusCounts = orders?.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {}) || {};

    return [
      { name: 'Delivered', value: statusCounts['Delivered'] || 0 },
      { name: 'Processing', value: statusCounts['Processing'] || 0 },
      { name: 'Pending', value: Object.entries(statusCounts)
        .filter(([status]) => !['Delivered', 'Processing'].includes(status))
        .reduce((sum, [_, count]) => sum + count, 0)
      }
    ];
  };

  const last7DaysOrders = processLast7DaysOrders(adminOrders);
  const orderStatusData = processOrderStatusData(adminOrders);
  const COLORS = ['#5a4336', '#a67d6d', '#d8c4b8'];

  const columns = [
    { 
      field: "id", 
      headerName: "Order ID", 
      minWidth: 150, 
      flex: 0.7,
      headerClassName: "text-[#5a4336] font-semibold"
    },
    {
      field: "status",
      headerName: "Status",
      minWidth: 130,
      flex: 0.7,
      headerClassName: "text-[#5a4336] font-semibold",
      renderCell: (params) => (
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
          params.value === "Delivered"
            ? "bg-[#d8c4b8] text-[#5a4336]"
            : params.value === "Processing"
            ? "bg-[#a67d6d] text-white"
            : "bg-[#c8a4a5] text-white"
        }`}>
          {params.value}
        </div>
      )
      
    },
    {
      field: "itemsQty",
      headerName: "Items Qty",
      minWidth: 130,
      flex: 0.7,
      headerClassName: "text-[#5a4336] font-semibold"
    },
    {
      field: "total",
      headerName: "Total",
      minWidth: 130,
      flex: 0.8,
      headerClassName: "text-[#5a4336] font-semibold"
    },
    {
      field: "createdAt",
      headerName: "Order Date",
      minWidth: 130,
      flex: 0.8,
      headerClassName: "text-[#5a4336] font-semibold"
    },
  ];

  const row = adminOrders?.map((item) => ({
    id: item._id,
    itemsQty: item?.cart?.reduce((acc, item) => acc + item.qty, 0),
    total: item?.totalPrice + " Rs",
    status: item?.status,
    createdAt: new Date(item?.createdAt).toLocaleDateString(),
  })) || [];

  const StatCard = ({ icon: Icon, title, value, link, linkText, trend }) => (
    <div 
      className={`w-full mb-4 800px:w-[48%] bg-white rounded-xl shadow-md transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg ${
        activeCard === title ? 'ring-2 ring-[#5a4336]' : ''
      }`}
      onMouseEnter={() => setActiveCard(title)}
      onMouseLeave={() => setActiveCard(null)}
    >
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="bg-[#f7f1f1] p-4 rounded-xl">
              <Icon size={32} className="text-[#5a4336]" />
            </div>
            <div className="ml-4">
              <h3 className="text-[#5a4336] text-lg font-medium">
                {title}
              </h3>
              <span className="text-3xl font-bold text-[#5a4336] mt-2 block">
                {value}
              </span>
            </div>
          </div>

        </div>
        
        <div className="pt-4 border-t border-[#d8c4b8]">
          <Link 
            to={link}
            className="flex items-center text-[#a67d6d] hover:text-[#5a4336] transition-colors duration-200 group"
          >
            <span className="text-sm font-medium">{linkText}</span>
            <AiOutlineArrowRight className="ml-2 transform group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {adminOrderLoading ? (
        <Loader />
      ) : (
        <div className="min-h-screen bg-[#f7f1f1] p-8">
          <div className="max-w-[1600px] mx-auto">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-3xl font-bold text-[#5a4336]">
                Dashboard Overview
              </h3>
              <div className="text-[#a67d6d]">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
            </div>

            <div className="w-full flex flex-wrap justify-between gap-6 mb-8">
              <StatCard
                icon={AiOutlineShop}
                title="Total Sellers"
                value={sellers?.length || 0}
                link="/admin-sellers"
                linkText="View All Sellers"
                trend="12"
              />

              <StatCard
                icon={AiOutlineInbox}
                title="Total Orders"
                value={adminOrders?.length || 0}
                link="/admin-orders"
                linkText="View All Orders"
                trend="8"
              />

              <StatCard
                icon={MdStorefront}
                title="Wholesale Markets"
                value={wholesaleMarkets?.length || 0}
                link="/admin-wholesale-markets"
                linkText="Manage Markets"
                trend="5"
              />

              <StatCard
                icon={AiOutlineDollar}
                title="Total Revenue"
                value={`Rs ${adminBalance}`}
                link="/admin-orders"
                linkText="View Details"
                trend="15"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Order Trends Chart */}
              <div className="bg-white p-6 rounded-xl shadow-md">
              <h4 className="text-lg font-semibold text-[#5a4336] mb-4">Last 7 Days Order Trends</h4>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={last7DaysOrders}>
                    <defs>
                      <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#5a4336" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#5a4336" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey="orders" 
                      stroke="#5a4336" 
                      fillOpacity={1} 
                      fill="url(#colorOrders)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

              {/* Order Status Distribution */}
              <div className="bg-white p-6 rounded-xl shadow-md">
              <h4 className="text-lg font-semibold text-[#5a4336] mb-4">Order Status Distribution</h4>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={orderStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      fill="#8884d8"
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {orderStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-4 mt-4">
                {orderStatusData.map((entry, index) => (
                  <div key={entry.name} className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-2" 
                      style={{ backgroundColor: COLORS[index] }}
                    />
                    <span className="text-sm text-[#5a4336]">
                      {entry.name} ({entry.value})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>



            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex justify-between items-center mb-6">
                <h4 className="text-lg font-semibold text-[#5a4336]">Recent Orders</h4>
                <Link 
                  to="/admin-orders"
                  className="text-[#a67d6d] hover:text-[#5a4336] transition-colors duration-200 flex items-center group"
                >
                  View All
                  <AiOutlineArrowRight className="ml-2 transform group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
              <DataGrid
                rows={row}
                columns={columns}
                pageSize={5}
                disableSelectionOnClick
                autoHeight
                className="!border-none"
                sx={{
                  '& .MuiDataGrid-cell': {
                    borderColor: '#d8c4b8'
                  },
                  '& .MuiDataGrid-columnHeaders': {
                    backgroundColor: '#f7f1f1',
                    borderBottom: '2px solid #d8c4b8'
                  },
                  '& .MuiDataGrid-row:hover': {
                    backgroundColor: '#f7f1f1'
                  }
                }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminDashboardMain;