import React, { useEffect, useState, useCallback } from "react";
import { AiOutlineArrowRight, AiOutlineMoneyCollect, AiOutlineShop, AiOutlineInbox } from "react-icons/ai";
import { MdBorderClear, MdTrendingUp, MdStorefront } from "react-icons/md";
import { Link } from "react-router-dom";
import { DataGrid } from "@material-ui/data-grid";
import { Button } from "@material-ui/core";
import { useDispatch, useSelector } from "react-redux";
import { getAllOrdersOfShop } from "../../redux/actions/order";
import { getAllProductsShop } from "../../redux/actions/product";
import { getAllServicesShop } from "../../redux/actions/service";
import axios from "axios";
import { server } from "../../server";
import { PieChart, Line, Pie, Cell, ComposedChart, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { toast } from "react-toastify";

// Debounce function to limit excessive calls
const debounce = (func, delay) => {
  let timer;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => func.apply(this, args), delay);
  };
};

const DashboardHero = () => {
    const dispatch = useDispatch();
    const { orders } = useSelector((state) => state.order);
    const { seller } = useSelector((state) => state.seller);
    const { products } = useSelector((state) => state.products);
    const { services } = useSelector((state) => state.services);
    const [salesData, setSalesData] = useState([]);
    const [timeBasedData, setTimeBasedData] = useState([]);
    const [totalItemsSold, setTotalItemsSold] = useState(0);
    const [totalProfit, setTotalProfit] = useState(0);
    const [userStartDate, setUserStartDate] = useState("2024-01-01");
    const [userEndDate, setUserEndDate] = useState("2025-12-31");
    const [activeCard, setActiveCard] = useState(null);

    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = String(currentDate.getMonth() + 1).padStart(2, '0');
    const currentDay = String(currentDate.getDate()).padStart(2, '0');

    const [interval, setInterval] = useState('daily');
    const [userDate, setUserDate] = useState(`${currentYear}-${currentMonth}-${currentDay}`);
    const [userMonth, setUserMonth] = useState(`${currentYear}-${currentMonth}`);
    const [userYear, setUserYear] = useState(`${currentYear}`);

    // Memoize the fetch functions with useCallback to prevent unnecessary re-renders
    const fetchSalesData = useCallback(async () => {
        try {
            const response = await axios.get(`${server}/shop/sales-data/${seller._id}`, {
                params: {
                    startDate: userStartDate,
                    endDate: userEndDate,
                },
            });
            const breakdownResponse = await axios.get(`${server}/shop/sales-data/breakdown/${seller._id}`, {
                params: {
                    date: interval === 'daily' ? userDate : undefined,
                    month: interval === 'monthly' ? userMonth : undefined,
                    year: interval === 'yearly' ? userYear : undefined,
                    interval,
                },
            });

            setSalesData(formatSalesData(response.data.salesData));
            setTimeBasedData(formatTimeBasedData(breakdownResponse.data.salesBreakdown));
        } catch (error) {
            console.error("Error fetching sales data:", error);
            toast.error(error.response?.data?.message || "Error fetching sales data");
        }
    }, [seller._id, userStartDate, userEndDate, interval, userDate, userMonth, userYear]);

    const fetchSalesSummary = useCallback(async () => {
        try {
            const response = await axios.get(`${server}/shop/sales-summary/${seller._id}`, {
                params: {
                    startDate: userStartDate,
                    endDate: userEndDate,
                },
            });

            setTotalItemsSold(response.data.totalItemsSold);
            setTotalProfit(response.data.totalProfit);
        } catch (error) {
            console.error("Error fetching sales summary:", error);
            toast.error(error.response?.data?.message || "Error fetching sales summary");
        }
    }, [seller._id, userStartDate, userEndDate]);

    // Debounced data fetching
    const debouncedFetchData = useCallback(
        debounce(() => {
            fetchSalesData();
            fetchSalesSummary();
        }, 300),
        [fetchSalesData, fetchSalesSummary]
    );

    useEffect(() => {
        dispatch(getAllOrdersOfShop(seller._id));
        dispatch(getAllProductsShop(seller._id));
        dispatch(getAllServicesShop(seller._id));
        debouncedFetchData();
    }, [dispatch, seller, interval, userStartDate, userEndDate, userDate, userMonth, userYear, debouncedFetchData]);

    const formatSalesData = (data) => {
        return Object.keys(data).map((productId) => ({
            name: data[productId].productName,
            quantity: data[productId].totalQuantity,
            profit: data[productId].totalProfit,
        }));
    };

    const formatTimeBasedData = (data) => {
        if (!data || typeof data !== 'object') {
            console.warn("Invalid data format:", data);
            return [];
        }

        const formattedData = [];
        Object.keys(data).forEach((period) => {
            Object.keys(data[period]).forEach((productId) => {
                formattedData.push({
                    period,
                    product: data[period][productId].productName,
                    quantity: data[period][productId].totalQuantity,
                    profit: data[period][productId].totalProfit,
                });
            });
        });

        // Limit the data to prevent overloading
        return formattedData.slice(0, 50); 
    };

    const COLORS = [
        '#ff9999', '#ffc658', '#82ca9d', '#8dd1e1', '#8884d8',
        '#d0ed57', '#ffc0cb', '#ffcc99', '#c3c3e5', '#d4a5a5',
        '#ffb3e6', '#a5d6a7', '#90caf9', '#f48fb1', '#ffeb3b'
    ];

    const CustomPieTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div className="custom-tooltip bg-white shadow-lg p-2 rounded">
                    <p className="label font-bold">{`Product: ${payload[0].name}`}</p>
                    <p className="desc">{`Quantity Sold: ${payload[0].payload.quantity}`}</p>
                    <p className="desc">{`Profit: Rs ${payload[0].payload.profit}`}</p>
                </div>
            );
        }
        return null;
    };

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="custom-tooltip bg-white shadow-lg p-2 rounded">
                    <p className="label font-bold">{`Time Period: ${label}`}</p>
                    {payload.map((item, index) => (
                        <p key={index} className="desc">
                            {item.dataKey === "quantity" ?
                                `Product: ${item.payload.product}, Quantity Sold: ${item.value}` :
                                `Profit: Rs ${item.value}`}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    const columns = [
        {
            field: "id",
            headerName: "Order ID",
            minWidth: 150,
            flex: 0.7,
        },
        {
            field: "status",
            headerName: "Status",
            minWidth: 130,
            flex: 0.7,
            renderCell: (params) => {
                const status = params.getValue(params.id, "status");
                const statusStyles = {
                    Delivered: "bg-[#d8c4b8] text-[#5a4336]",
                    Processing: "bg-[#a67d6d] text-white",
                    Pending: "bg-[#c8a4a5] text-white"
                };
    
                return (
                    <div
                        className={`px-3 py-1 rounded-full font-bold text-sm ${statusStyles[status] || "bg-gray-200 text-gray-800"}`}
                    >
                        {status}
                    </div>
                );
            },
        },
        
        {
            field: "itemsQty",
            headerName: "Items Qty",
            type: "number",
            minWidth: 130,
            flex: 0.7,
        },
        {
            field: "total",
            headerName: "Total",
            type: "number",
            minWidth: 130,
            flex: 0.8,
        },
        {
            field: "View",
            flex: 1,
            minWidth: 150,
            headerName: "",
            sortable: false,
            renderCell: (params) => (
                <Link to={`/order/${params.id}`}>
                    <Button className="bg-[#f4eceb] text-white p-3 rounded-full shadow-lg hover:scale-105 transform transition duration-300 !bg-[#f4eceb]">
                        <AiOutlineArrowRight size={20} className="text-[#5a4336]" />
                    </Button>
                </Link>
            ),
        },
    ];

    const row = [];
    orders && orders.forEach((item) => {
        row.push({
            id: item._id,
            itemsQty: item.cart.reduce((acc, item) => acc + item.qty, 0),
            total: "Rs " + item.totalPrice,
            status: item.status,
        });
    });

    const handleIntervalChange = (e) => {
        const selectedInterval = e.target.value;
        setInterval(selectedInterval);

        if (selectedInterval === 'daily') {
            setUserMonth("");
            setUserYear(new Date().getFullYear().toString());
            setUserDate("2024-10-09");
        } else if (selectedInterval === 'monthly') {
            setUserDate("");
        } else if (selectedInterval === 'yearly') {
            setUserDate("");
            setUserMonth("");
        }
    };

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
                    {trend && (
                        <div className="flex items-center text-green-600">
                            <MdTrendingUp size={20} className="mr-1" />
                            <span>+{trend}%</span>
                        </div>
                    )}
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
                        title="Total Products"
                        value={products?.length || 0}
                        link="/dashboard-products"
                        linkText="View All Products"
                    />

                    <StatCard
                        icon={AiOutlineInbox}
                        title="Total Orders"
                        value={orders?.length || 0}
                        link="/dashboard-orders"
                        linkText="View All Orders"
                    />

                    <StatCard
                        icon={MdStorefront}
                        title="Total Services"
                        value={services?.length || 0}
                        link="/dashboard-services"
                        linkText="View Services"
                    />

                    <StatCard
                        icon={AiOutlineMoneyCollect}
                        title="Total Revenue"
                        value={`Rs ${totalProfit}`}
                        link="/dashboard-orders"
                        linkText="View Details"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-xl shadow-md">
                        <h4 className="text-lg font-semibold text-[#5a4336] mb-4">Profit Per Product</h4>
                        <div className="h-[300px]">
                            {salesData.length > 0 ? (
                                <ResponsiveContainer width="99%" height="99%">
                                    <PieChart>
                                        <Pie
                                            data={salesData.slice(0, 10)} // Limit to prevent overloading
                                            dataKey="profit"
                                            nameKey="name"
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={80}
                                            fill="#82ca9d"
                                            label
                                        >
                                            {salesData.slice(0, 10).map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip content={<CustomPieTooltip />} />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex items-center justify-center h-full">
                                    <p className="text-gray-500">No data available</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-md">
                        <h4 className="text-lg font-semibold text-[#5a4336] mb-4">Total Summary</h4>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="99%" height="99%">
                                <BarChart 
                                    data={[{ 
                                        name: 'Total', 
                                        itemsSold: Number(totalItemsSold) || 0,
                                        profit: Number(totalProfit) || 0
                                    }]}
                                    layout="vertical"
                                    margin={{ top: 20, right: 30, left: 60, bottom: 20 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis 
                                        type="number"
                                        label={{ value: 'Value', position: 'insideBottom', offset: -10 }}
                                    />
                                    <YAxis 
                                        dataKey="name" 
                                        type="category"
                                        width={100}
                                    />
                                    <Tooltip 
                                        formatter={(value, name) => {
                                            if (name === "itemsSold") return [value, "Items Sold"];
                                            if (name === "profit") return [`Rs ${value}`, "Total Profit"];
                                            return [value, name];
                                        }}
                                    />
                                    <Legend 
                                        verticalAlign="top" 
                                        height={36}
                                    />
                                    <Bar 
                                        dataKey="itemsSold" 
                                        fill="#8884d8" 
                                        name="Items Sold"
                                        barSize={40}
                                        yAxisId={0}
                                    />
                                    <Bar 
                                        dataKey="profit" 
                                        fill="#82ca9d" 
                                        name="Total Profit"
                                        barSize={40}
                                        yAxisId={0}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
                
                <div className="w-full mb-8">
                    <div className="bg-white p-6 rounded-xl shadow-md">
                        <div className="mb-4">
                            <h4 className="text-lg font-semibold text-[#5a4336] mb-4">Sales Analysis</h4>
                            <select onChange={handleIntervalChange} value={interval} className="mb-2 p-2 border rounded">
                                <option value="daily">Daily</option>
                                <option value="monthly">Monthly</option>
                                <option value="yearly">Yearly</option>
                            </select>
                            {interval === 'daily' && (
                                <input
                                    type="date"
                                    value={userDate}
                                    onChange={(e) => setUserDate(e.target.value)}
                                    className="mr-4 p-2 border rounded"
                                />
                            )}
                            {interval === 'monthly' && (
                                <input
                                    type="month"
                                    value={userMonth}
                                    onChange={(e) => setUserMonth(e.target.value)}
                                    className="mr-4 p-2 border rounded"
                                />
                            )}
                            {interval === 'yearly' && (
                                <div className="flex items-center">
                                    <label htmlFor="userYear" className="mr-2">Year:</label>
                                    <input
                                        type="number"
                                        id="userYear"
                                        value={userYear}
                                        onChange={(e) => setUserYear(e.target.value)}
                                        className="mr-4 p-2 border rounded w-24"
                                        min="2000"
                                        max={new Date().getFullYear()}
                                    />
                                </div>
                            )}
                        </div>
                        <div className="h-[300px]">
                            {timeBasedData.length > 0 ? (
                                <ResponsiveContainer width="99%" height="99%">
                                    <ComposedChart data={timeBasedData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="period" />
                                        <YAxis yAxisId="left" />
                                        <YAxis yAxisId="right" orientation="right" />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend />
                                        <Bar 
                                            yAxisId="left" 
                                            dataKey="quantity" 
                                            fill="#ffc658" 
                                            name="Quantity Sold" 
                                        />
                                        <Line 
                                            yAxisId="right" 
                                            type="monotone" 
                                            dataKey="profit" 
                                            stroke="#ff7300" 
                                            strokeWidth={5} 
                                            name="Total Profit" 
                                        />
                                    </ComposedChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex items-center justify-center h-full">
                                    <p className="text-gray-500">No data available</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                    
                <div className="bg-white rounded-xl shadow-md p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h4 className="text-lg font-semibold text-[#5a4336]">Recent Orders</h4>
                        <Link 
                            to="/dashboard-orders"
                            className="text-[#a67d6d] hover:text-[#5a4336] transition-colors duration-200 flex items-center group"
                        >
                            View All
                            <AiOutlineArrowRight className="ml-2 transform group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                    <div style={{ height: 400, width: '100%' }}>
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
        </div>
    );
};

export default DashboardHero;