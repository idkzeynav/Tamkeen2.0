import React, { useEffect, useState } from 'react'
import { backend_url, server } from "../../server";
import { useDispatch, useSelector } from 'react-redux';
import { Lock } from 'lucide-react';
import UserBulkOrders from '../Procurement/getUserBulkOrders';
import ProcessingOrdersPage from '../Procurement/Processing';

import UserBookingsPage from '../Booking/Bookingpage';
import {
    deleteUserAddress,
    loadUser,
    updatUserAddress,
    updateUserInformation,
} from "../../redux/actions/user";
import { AiOutlineArrowRight, AiOutlineCamera, AiOutlineDelete } from 'react-icons/ai';
import { Link } from 'react-router-dom';
import styles from "../../styles/styles";
import { DataGrid } from "@material-ui/data-grid";
import { Button } from "@material-ui/core";
import { RxCross1 } from 'react-icons/rx'
import { MdTrackChanges } from "react-icons/md";
import { toast } from "react-toastify";
import axios from 'axios';
import { Country, State } from "country-state-city";
import { getAllOrdersOfUser } from '../../redux/actions/order';
import { MdPendingActions } from "react-icons/md";
import { FaBox, FaShippingFast, FaCheckCircle } from "react-icons/fa";
import BulkOrderForm from '../Procurement/Bulkorderform';
import UserWorkshops from '../workshop/Userworkshopprogress';
import { AlertCircle } from 'lucide-react';

const girlyStyles = {
    container: "flex justify-center items-center min-h-screen bg-gray-100 p-12", 
    card: "bg-[#e6d8d8] p-10 rounded-lg shadow-xl transition-shadow duration-300 border border-[#c8a4a5] w-full max-w-3xl h-auto", // Adjusted width and height
    input: "bg-[gray-100] text-[#5a4336] border border-[#c8a4a5] focus:outline-none focus:border-[#a67d6d] p-4 rounded-lg mb-6 w-full duration-300 transition-transform transform hover:scale-105",
    button: "bg-[#5a4336] text-white hover:bg-[#a67d6d] transition-all duration-300 p-4 rounded-md text-center w-full cursor-pointer",
    imageWrapper: "relative flex justify-center items-center",
    profileImage: "w-[150px] h-[150px] rounded-full border-4 border-[#c8a4a5] shadow-lg",
    cameraIconWrapper: "absolute bottom-0 right-0 bg-[#c8a4a5] text-white rounded-full p-2 cursor-pointer hover:bg-[#FF4F80] transition-all",
    header: "text-3xl font-semibold text-[#5a4336] mb-6 text-center flex items-center justify-center",
    sectionTitle: "text-xl font-medium text-[#5a4336] mb-4",
    smallText: "text-sm text-[#A9A9A9] mb-4",
    formTitle: "text-2xl font-bold text-[#5a4336] mb-4",
    formContainer: "flex items-center justify-between",
    formWrapper: "w-[60%] pl-10",  // Take 60% width for the form
    profileContainer: "w-[30%]" ,
    tableCard: "bg-white shadow-lg rounded-lg p-6",
    tableTitle: "text-2xl font-semibold text-[#FF6F91] mb-6",
    dataGridContainer: "w-full",
    tableRow: "transition-all hover:bg-[#FCE4EC] rounded-lg",
    button: "bg-[#c8a4a5] text-white duration-300 ease-in-out p-3 rounded-md text-center cursor-pointer transition-transform transform hover:scale-105",
    greenColor: "text-green-500 font-semibold",
    redColor: "text-red-500 font-semibold",
    actionButton: "bg-[#FF6F91] hover:bg-[#FF4F80] text-white transition-all duration-300 ease-in-out p-2 rounded-full",// Keep the profile picture in 30% width
    greenColor: "text-green-500",
    orangeColor: "text-orange-500",
    redColor: "text-red-500",
    icon: "text-4xl text-[#a67d6d] mr-2", 
    animationWrapper: "w-[300px] md:w-[400px] lg:w-[500px] xl:w-[600px] ml-10"
  };

  const orderStyles = {
    container: "bg-gray-100 min-h-screen p-8",
    title: "text-3xl font-bold text-[#5a4336] mb-6",
    gridContainer: "bg-white rounded-lg shadow-md p-6",
    actionButton: "bg-[#a67d6d] text-white p-2 rounded-full hover:bg-[#c8a4a5] transition-colors",
    timeline: "flex items-center justify-between w-full my-6 relative z-0",
    timelineStep: "flex flex-col items-center relative z-10",
    timelineLine: "absolute top-1/2 left-0 w-full h-1 bg-[#c8a4a5] transform -translate-y-1/2",
    timelineDot: "w-10 h-10 rounded-full bg-white border-2 border-[#c8a4a5] flex items-center justify-center text-[#5a4336] transition-all duration-300 ease-in-out cursor-pointer hover:text-[#c8a4a5] hover:border-[#c8a4a5]",  // Adjust hover styles here
    timelineActiveDot: "border-[#5a4336] text-[#a67d6d] scale-110",
    timelineIcon: "text-xl transition-colors duration-300", // Added transition for smooth color change
    timelineText: "mt-2 text-sm font-medium transition-all duration-300 ease-in-out text-[#5a4336]",
    timelineActiveText: "text-[#a67d6d]",
    productImage: "w-10 h-10 object-cover rounded mr-2",
    orderCard: "bg-white rounded-lg shadow-md p-6 mb-4 border border-[#c8a4a5] transition-transform transform hover:scale-105",
    orderHeader: "flex justify-between items-center mb-4",
    orderId: "font-semibold text-[#5a4336]",
    orderStatus: "px-2 py-1 rounded-full text-sm font-semibold",
    productList: "space-y-2",
    product: "flex items-center",
    productInfo: "ml-2",
    productName: "font-semibold text-[#5a4336]",
    productDetails: "text-sm text-[#a67d6d]",
    viewButton: "bg-[#5a4336] text-white px-4 py-2 rounded-md hover:bg-[#a67d6d] transition-colors transition-transform transform hover:scale-105", 
};



const ProfileContent = ({ active }) => {
    const { user, error, successMessage } = useSelector((state) => state.user);
    const [name, setName] = useState(user && user.name);
    const [email, setEmail] = useState(user && user.email);
    const [phoneNumber, setPhoneNumber] = useState(user && user.phoneNumber);
    const [password, setPassword] = useState("");
    const [avatar, setAvatar] = useState(null);

    const dispatch = useDispatch();

    useEffect(() => {
        if (error) {
            toast.error(error);
            dispatch({ type: "clearErrors" });
        }
        if (successMessage) {
            toast.success(successMessage);
            dispatch({ type: "clearMessages" });
        }
    }, [error, successMessage]);


    const handleSubmit = (e) => {
        e.preventDefault();
        dispatch(updateUserInformation(name, email, phoneNumber, password));
    }

    // Image update
    const handleImage = async (e) => {
        const file = e.target.files[0];
        setAvatar(file);

        const formData = new FormData();

        formData.append("image", e.target.files[0]);

        await axios
            .put(`${server}/user/update-avatar`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
                withCredentials: true,
            })
            .then((response) => {
                dispatch(loadUser());
                toast.success("avatar updated successfully!");
            })
            .catch((error) => {
                toast.error(error);
            });
    };

      return (
        <div className="w-full">
            {active === 1 && (
                <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden border border-white/20">
                            {/* Decorative header with modern gradient */}
                            <div className="h-48 bg-gradient-to-r from-[#e6d8d8] via-[#c8a4a5] to-[#5a4336] relative overflow-hidden">
                                <div className="absolute inset-0 bg-grid-white/10" />
                                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/50" />
                            </div>
                            
                            <div className="px-6 sm:px-8 lg:px-12 pb-12 relative">
                                {/* Profile section with glassmorphism */}
                                <div className="sm:flex sm:items-end sm:justify-between sm:-mt-24 relative z-10">
                                    <div className="relative group">
                                        <div className="w-40 h-40 rounded-2xl overflow-hidden border-4 border-white shadow-2xl transform -rotate-3 transition-transform group-hover:rotate-0 duration-300">
                                            <img
                                                src={`${backend_url}${user?.avatar}`}
                                                alt="Profile"
                                                className="w-full h-full object-cover transform scale-105"
                                            />
                                        </div>
                                        <label 
                                            htmlFor="avatar-upload" 
                                            className="absolute -bottom-2 -right-2 bg-white/90 p-3 rounded-xl cursor-pointer shadow-lg hover:bg-[#5a4336] hover:text-white transition-all duration-300 group-hover:scale-110"
                                        >
                                            <AiOutlineCamera className="w-5 h-5" />
                                            <input
                                                type="file"
                                                id="avatar-upload"
                                                onChange={handleImage}
                                                className="hidden"
                                                accept="image/*"
                                            />
                                        </label>
                                    </div>

                                    <div className="mt-8 sm:mt-0 text-center sm:text-left">
                                        <h1 className="text-3xl font-bold text-gray-900 mb-1">{user?.name}</h1>
                                        <p className="text-lg text-gray-600">{user?.email}</p>
                                    </div>
                                </div>

                                {/* Modern form with neumorphic elements */}
                                <form onSubmit={handleSubmit} className="mt-12 space-y-8">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                        <div className="col-span-2">
                                            <label className="block text-sm font-medium text-gray-600 mb-2">Full Name</label>
                                            <input
                                                type="text"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl shadow-inner focus:ring-2 focus:ring-[#c8a4a5] focus:border-transparent transition duration-200 ease-in-out hover:bg-white"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-600 mb-2">Email Address</label>
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl shadow-inner focus:ring-2 focus:ring-[#c8a4a5] focus:border-transparent transition duration-200 ease-in-out hover:bg-white"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-600 mb-2">Phone Number</label>
                                            <input
                                                type="tel"
                                                value={phoneNumber}
                                                onChange={(e) => setPhoneNumber(e.target.value)}
                                                className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl shadow-inner focus:ring-2 focus:ring-[#c8a4a5] focus:border-transparent transition duration-200 ease-in-out hover:bg-white"
                                            />
                                        </div>

                                        <div className="col-span-2">
                                            <label className="block text-sm font-medium text-gray-600 mb-2">Password</label>
                                            <input
                                                type="password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                placeholder="Enter your password to update your profile"
                                                className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl shadow-inner focus:ring-2 focus:ring-[#c8a4a5] focus:border-transparent transition duration-200 ease-in-out hover:bg-white"
                                              
                                            />
                       <p className="mt-1 text-xs text-gray-500">
                    Your password is required to save these changes
                  </p>
                    </div>
                  </div>
                                    <div className="flex justify-end pt-4">
                                        <button
                                            type="submit"
                                            className="px-8 py-4 bg-gradient-to-r from-[#5a4336] to-[#a67d6d] text-white text-lg font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#c8a4a5]"
                                        >
                                            Update Profile
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}
    


            {/* Odder  */}
            {
                active === 2 && (
                    <div>
                        <AllOrders />
                    </div>
                )
            }

        

            {/* Track order */}
            {active === 5 && (
                <div>
                    <TrackOrder />
                </div>
            )}

            {/* Change Password */}
            {active === 6 && (
                <div>
                    <ChangePassword />
                </div>
            )}

            {/* user Address */}
            {active === 7 && (
                <div>
                    <Address />
                </div>
            )}

{active === 9 && (
                <div>
                    <UserBulkOrders />
                </div>
            )}

 {active === 11 && (
                <div>
                    <ProcessingOrdersPage />
                </div>
            )}
            
            {active === 12 && (
                <div>
                    <UserBookingsPage />
                </div>
            )}

{active === 13 && (
                <div>
                    <BulkOrderForm />
                </div>
            )}
{active === 14 && (
                <div>
                    <UserWorkshops />
                </div>
            )}

        </div >
    )
}

const getStatusColor = (status) => {
    switch (status) {
      case "Delivered": return "bg-green-200 text-green-800";
      case "Processing": return "bg-yellow-200 text-yellow-800";
      case "Shipping": return "bg-blue-200 text-blue-800";
      default: return "bg-gray-200 text-gray-800";
    }
  };
  
  const OrderTimeline = ({ status }) => {
    const steps = [
      { name: "Ordered", icon: MdPendingActions },
      { name: "Processing", icon: FaBox },
      { name: "Shipping", icon: FaShippingFast },
      { name: "Delivered", icon: FaCheckCircle }
    ];
    const currentStep = steps.findIndex(step => step.name === status);
  
    return (
        <div className={orderStyles.timeline}>
          <div className={orderStyles.timelineLine}></div>
          {steps.map((step, index) => (
            <div key={step.name} className={orderStyles.timelineStep}>
              <div 
                className={`${orderStyles.timelineDot} ${
                  index <= currentStep ? orderStyles.timelineActiveDot : ''
                } group hover:scale-125 hover:border-[#ccc0ba] hover:text-[#ccc0ba]`}
              >
                <step.icon className={`${orderStyles.timelineIcon} group-hover:animate-bounce`} />
              </div>
              <span className={`${orderStyles.timelineText} ${
                index <= currentStep ? orderStyles.timelineActiveText : ''
              } group-hover:text[#ccc0ba]`}>{step.name}</span>
            </div>
          ))}
        </div>
      );
    };

    const OrderCard = ({ order }) => (
      <div className={orderStyles.orderCard}>
        <div className={orderStyles.orderHeader}>
          <span className={orderStyles.orderId}>Order ID: {order._id}</span>
          <span className={`${orderStyles.orderStatus} ${getStatusColor(order.status)}`}>{order.status}</span>
        </div>
        <div className={orderStyles.productList}>
          {order.cart.map((item, index) => (
            <div key={index} className={orderStyles.product}>
              <img src={`${backend_url}${item.images[0]}`} alt={item.name} className={orderStyles.productImage} />
              <div className={orderStyles.productInfo}>
                <h3 className={orderStyles.productName}>{item.name}</h3>
                <p className={orderStyles.productDetails}>
                  Quantity: {item.qty} | Price: Rs {item.discountPrice ? (
                    <>
                      <span className={orderStyles.discountPrice}>{item.discountPrice}</span>
                      {item.originalPrice && (
                        <span className="text-gray-500 text-xs line-through ml-2">Rs {item.originalPrice}</span>
                      )}
                    </>
                  ) : (
                    item.originalPrice || item.price
                  )}
                </p>
              </div>
            </div>
          ))}
        </div>
        <OrderTimeline status={order.status} />
        <div className="mt-4 text-right">
          <Link to={`/user/order/${order._id}`}>
            <button className={orderStyles.viewButton}>
              View Details <AiOutlineArrowRight className="inline ml-2" />
            </button>
          </Link>
        </div>
      </div>
    );

      const OrderDetails = ({ order }) => {
        const columns = [
          { field: "id", headerName: "Order ID", minWidth: 150, flex: 0.7 },
          {
            field: "status",
            headerName: "Status",
            minWidth: 130,
            flex: 0.7,
            cellClassName: (params) => {
              return params.getValue(params.id, "status") === "Delivered"
                ? "text-green-600"
                : "text-red-600";
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
        ];
      
        const row = [
          {
            id: order._id,
            itemsQty: order.cart.length,
            total: "Rs " + order.totalPrice,
            status: order.status,
          },
        ];
      
        return (
          <div className={orderStyles.gridContainer}>
            <DataGrid
              rows={row}
              columns={columns}
              pageSize={10}
              disableSelectionOnClick
              autoHeight
            />
          </div>
        );
      };

      export const AllOrders = () => {
        const { user } = useSelector((state) => state.user);
        const { orders } = useSelector((state) => state.order);
        const [selectedOrder, setSelectedOrder] = useState(null);
        const dispatch = useDispatch();
      
        useEffect(() => {
          dispatch(getAllOrdersOfUser(user._id));
        }, [dispatch, user._id]);
      
        return (
          <div className={orderStyles.container}>
            <h2 className={orderStyles.title}>Your Orders</h2>
            {selectedOrder ? (
              <>
                <Button onClick={() => setSelectedOrder(null)} className={orderStyles.actionButton}>
                  Back to All Orders
                </Button>
                <OrderDetails order={selectedOrder} />
              </>
            ) : (
              <div className={orderStyles.orderList}>
                {orders && orders.map((order) => (
                  <OrderCard 
                    key={order._id} 
                    order={order}
                    onClick={() => setSelectedOrder(order)}
                  />
                ))}
              </div>
            )}
          </div>
        );
      };
  


export const TrackOrder = () => {
    const { user } = useSelector((state) => state.user);
    const { orders } = useSelector((state) => state.order);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const dispatch = useDispatch();
  
    useEffect(() => {
      dispatch(getAllOrdersOfUser(user._id));
    }, [dispatch, user._id]);
  
    return (
      <div className={orderStyles.container}>
        <h2 className={orderStyles.title}>Track Your Orders</h2>
        {selectedOrder ? (
          <>
            <Button onClick={() => setSelectedOrder(null)} className={orderStyles.actionButton}>
              Back to All Orders
            </Button>
            <OrderDetails order={selectedOrder} />
          </>
        ) : (
          <div className={orderStyles.orderList}>
            {orders && orders.map((order) => (
              <OrderCard 
                key={order._id} 
                order={order}
                onClick={() => setSelectedOrder(order)}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

// Payment method

const ChangePassword = () => {

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [focusedInput, setFocusedInput] = useState(null);
    

    const passwordChangeHandler = async (e) => {
        e.preventDefault();

        await axios
            .put(
                `${server}/user/update-user-password`,
                { oldPassword, newPassword, confirmPassword },
                { withCredentials: true }
            )
            .then((res) => {
                toast.success("Pawword is updated");
                setOldPassword("");
                setNewPassword("");
                setConfirmPassword("");
            })
            .catch((error) => {
                toast.error(error.response.data.message);
            });
    };
    return (
        
      <div className="w-full h-screen">
      <div className="h-full bg-gradient-to-br from-[#d8c4b8]/20 to-white p-4">
          <div className="h-full max-w-md mx-auto">
              {/* Floating Card */}
              <div className="relative top-1/2 -translate-y-1/2 bg-white rounded-3xl shadow-2xl overflow-hidden border border-[#d8c4b8]/20 backdrop-blur-lg transition-all duration-500 hover:shadow-[0_20px_60px_-15px_rgba(166,125,109,0.3)]">
                  {/* Decorative Elements */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#c8a4a5]/20 to-[#a67d6d]/20 rounded-full -translate-y-16 translate-x-16" />
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-[#5a4336]/10 to-[#d8c4b8]/20 rounded-full translate-y-16 -translate-x-16" />

                  {/* Content Container */}
                  <div className="relative p-8">
                      {/* Header */}
                      <div className="text-center mb-8">
                          <div className="w-16 h-16 mx-auto bg-gradient-to-tr from-[#a67d6d] to-[#c8a4a5] rounded-2xl shadow-xl transform -rotate-6 transition-transform duration-300 hover:rotate-0 mb-4 flex items-center justify-center">
                              <Lock className="w-8 h-8 text-white" />
                          </div>
                          <h1 className="text-2xl font-bold text-[#5a4336]">Change Password</h1>
                          <p className="text-sm text-[#a67d6d]/80 mt-2">Keep your account secure</p>
                      </div>

                      {/* Form */}
                      <form onSubmit={passwordChangeHandler} className="space-y-6">
                          <div className="space-y-4">
                              {/* Current Password */}
                              <div className="relative">
                                  <input
                                      type="password"
                                      value={oldPassword}
                                      onChange={(e) => setOldPassword(e.target.value)}
                                      onFocus={() => setFocusedInput('current')}
                                      onBlur={() => setFocusedInput(null)}
                                      placeholder="Current Password"
                                      className={`w-full px-4 py-3 bg-[#d8c4b8]/5 rounded-xl border-2 transition-all duration-300 outline-none
                                          ${focusedInput === 'current' 
                                              ? 'border-[#c8a4a5] shadow-[0_0_20px_rgba(200,164,165,0.15)]' 
                                              : 'border-transparent hover:border-[#d8c4b8]/50'}`}
                                      required
                                  />
                              </div>

                              {/* New Password */}
                              <div className="relative">
                                  <input
                                      type="password"
                                      value={newPassword}
                                      onChange={(e) => setNewPassword(e.target.value)}
                                      onFocus={() => setFocusedInput('new')}
                                      onBlur={() => setFocusedInput(null)}
                                      placeholder="New Password"
                                      className={`w-full px-4 py-3 bg-[#d8c4b8]/5 rounded-xl border-2 transition-all duration-300 outline-none
                                          ${focusedInput === 'new' 
                                              ? 'border-[#c8a4a5] shadow-[0_0_20px_rgba(200,164,165,0.15)]' 
                                              : 'border-transparent hover:border-[#d8c4b8]/50'}`}
                                      required
                                  />
                              </div>

                              {/* Confirm Password */}
                              <div className="relative">
                                  <input
                                      type="password"
                                      value={confirmPassword}
                                      onChange={(e) => setConfirmPassword(e.target.value)}
                                      onFocus={() => setFocusedInput('confirm')}
                                      onBlur={() => setFocusedInput(null)}
                                      placeholder="Confirm New Password"
                                      className={`w-full px-4 py-3 bg-[#d8c4b8]/5 rounded-xl border-2 transition-all duration-300 outline-none
                                          ${focusedInput === 'confirm' 
                                              ? 'border-[#c8a4a5] shadow-[0_0_20px_rgba(200,164,165,0.15)]' 
                                              : 'border-transparent hover:border-[#d8c4b8]/50'}`}
                                      required
                                  />
                              </div>
                          </div>

                          {/* Submit Button */}
                          <div className="pt-4">
                              <button
                                  type="submit"
                                  className="w-full bg-gradient-to-r from-[#5a4336] via-[#a67d6d] to-[#c8a4a5] text-white py-4 rounded-xl font-medium 
                                      shadow-lg hover:shadow-xl transition-all duration-300 
                                      hover:scale-[1.02] active:scale-[0.98]
                                      bg-[length:200%_100%] bg-left hover:bg-right"
                              >
                                  Update Password
                              </button>
                          </div>
                      </form>
                  </div>
              </div>
          </div>
      </div>
  </div>
  );
};


const Address = () => {
  const [open, setOpen] = useState(false);
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [zipCode, setZipCode] = useState();
  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");
  const [addressType, setAddressType] = useState("");
  const { user } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  const addressTypeData = [
    { name: "Default" },
    { name: "Home" },
    { name: "Office" },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (addressType === "" || country === "" || city === "") {
      toast.error("Please fill all the fields!");
    } else {
      dispatch(updatUserAddress(country, city, address1, address2,
zipCode, addressType));
      setOpen(false);
      setCountry("");
      setCity("");
      setAddress1("");
      setAddress2("");
      setZipCode(null);
      setAddressType("");
    }
  };

  const handleDelete = (item) => {
    const id = item._id;
    dispatch(deleteUserAddress(id));
  };

  return (
    <div className="w-full px-5">
      {/* Add New Address Modal */}
      {open && (
        <div className="fixed inset-0 bg-[#0000004b] flex items-center
justify-center">
          <div className="w-full max-w-lg bg-white rounded-lg
shadow-xl p-6 relative overflow-y-auto">
            <button
              className="absolute top-4 right-4 text-gray-500
hover:text-gray-700"
              onClick={() => setOpen(false)}
            >
              <RxCross1 size={24} />
            </button>
            <h1 className="text-3xl font-bold text-center
text-[#5a4336] mb-6">Add New Address</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Country */}
              <div>
                <label className="block text-base text-[#5a4336]
font-medium">Country</label>
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full p-3 rounded-md bg-gray-100
hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-[#b88f90]
focus:bg-white transition-all duration-300 transform hover:scale-105"
                >
                  <option value="">Choose your country</option>
                  {Country &&
                    Country.getAllCountries().map((item) => (
                      <option key={item.isoCode} value={item.isoCode}>
                        {item.name}
                      </option>
                    ))}
                </select>
              </div>

              {/* City */}
              <div>
                <label className="block text-base text-[#5a4336]
font-medium">City</label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full p-3 rounded-md bg-gray-100
hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-[#b88f90]
focus:bg-white transition-all duration-300 transform hover:scale-105"
                >
                  <option value="">Choose your city</option>
                  {State &&
                    State.getStatesOfCountry(country).map((item) => (
                      <option key={item.isoCode} value={item.isoCode}>
                        {item.name}
                      </option>
                    ))}
                </select>
              </div>

              {/* Address 1 */}
              <div>
                <label className="block text-base text-[#5a4336]
font-medium">Address 1</label>
                <input
                  type="text"
                  value={address1}
                  onChange={(e) => setAddress1(e.target.value)}
                  className="w-full p-3 rounded-md bg-gray-100
hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-[#b88f90]
focus:bg-white transition-all duration-300 transform hover:scale-105"
                  required
                />
              </div>

              {/* Address 2 */}
              <div>
                <label className="block text-base text-[#5a4336]
font-medium">Address 2</label>
                <input
                  type="text"
                  value={address2}
                  onChange={(e) => setAddress2(e.target.value)}
                  className="w-full p-3 rounded-md bg-gray-100
hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-[#b88f90]
focus:bg-white transition-all duration-300 transform hover:scale-105"
                />
              </div>

              {/* Zip Code */}
              <div>
                <label className="block text-base text-[#5a4336]
font-medium">Zip Code</label>
                <input
                  type="number"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  className="w-full p-3 rounded-md bg-gray-100
hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-[#b88f90]
focus:bg-white transition-all duration-300 transform hover:scale-105"
                  required
                />
              </div>

              {/* Address Type */}
              <div>
                <label className="block text-base text-[#5a4336]
font-medium">Address Type</label>
                <select
                  value={addressType}
                  onChange={(e) => setAddressType(e.target.value)}
                  className="w-full p-3 rounded-md bg-gray-100
hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-[#b88f90]
focus:bg-white transition-all duration-300 transform hover:scale-105"
                >
                  <option value="">Choose your address type</option>
                  {addressTypeData.map((item) => (
                    <option key={item.name} value={item.name}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Submit Button */}
              <div className="text-center">
                <button
                  type="submit"
                  className="bg-[#c8a4a5] text-white px-6 py-3
rounded-md transition-transform transform hover:scale-105
hover:bg-[#b88f90]"
                >
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* My Address Section */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-[#5a4336]">My Addresses</h1>
        <button
          className="bg-[#5a4336] text-white px-4 py-2 rounded-md
hover:bg-[#a67d6d] transition-transform transform hover:scale-105"
          onClick={() => setOpen(true)}
        >
          Add New Address
        </button>
      </div>

      {/* Display Saved Addresses */}
      {user && user.addresses.length > 0 ? (
        user.addresses.map((item, index) => (
          <div
            key={index}
            className="w-full bg-white shadow-lg rounded-lg p-4 mb-4
flex justify-between items-center"
          >
            <div className="flex-1">
              <h5 className="font-semibold text-lg
text-[#5a4336]">{item.addressType}</h5>
              <p>{item.address1} {item.address2}</p>
              <p>{user.phoneNumber}</p>
            </div>
            <AiOutlineDelete
              size={24}
              className="cursor-pointer text-red-500 hover:text-red-700"
              onClick={() => handleDelete(item)}
            />
          </div>
        ))
      ) : (
        <p className="text-center text-gray-600">You don't have any
saved addresses.</p>
      )}
    </div>
  );
};




export default ProfileContent;