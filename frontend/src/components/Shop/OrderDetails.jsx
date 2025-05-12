import React, { useEffect, useState } from "react";
import styles from "../../styles/styles";
import { BsFillBagFill } from "react-icons/bs";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { backend_url, server } from "../../server";
import { getAllOrdersOfShop } from "../../redux/actions/order";
import { useDispatch, useSelector } from "react-redux";

const OrderDetails = () => {
  const { orders, isLoading } = useSelector((state) => state.order);
  const { seller } = useSelector((state) => state.seller);
  const dispatch = useDispatch();

  const [status, setStatus] = useState("");
  const navigate = useNavigate();

  const { id } = useParams();

  useEffect(() => {
    dispatch(getAllOrdersOfShop(seller._id));
  }, [dispatch]);

  const data = orders && orders.find((item) => item._id === id);

  const orderUpdateHandler = async (e) => {
    await axios
      .put(
        `${server}/order/update-order-status/${id}`,
        {
          status,
        },
        { withCredentials: true }
      )
      .then((res) => {
        toast.success("Order updated!");
        navigate("/dashboard-orders");
      })
      .catch((error) => {
        toast.error(error.response.data.message);
      });
  };

  const refundOrderUpdateHandler = async (e) => {
    await axios
      .put(
        `${server}/order/order-refund-success/${id}`,
        {
          status,
        },
        { withCredentials: true }
      )
      .then((res) => {
        toast.success("Order updated!");
        dispatch(getAllOrdersOfShop(seller._id));
      })
      .catch((error) => {
        toast.error(error.response.data.message);
      });
  };

  return (
    <div className="py-8 min-h-screen bg-[#d8c4b8]">
      <div className="max-w-5xl mx-auto p-6 bg-[#f4eceb] rounded-lg shadow-md">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <BsFillBagFill size={30} color="#5a4336" />
            <h1 className="pl-2 text-3xl font-bold text-[#5a4336]">Order Details</h1>
          </div>
          <Link to="/dashboard-orders">
            <div className="bg-[#c8a4a5] text-white font-semibold py-2 px-4 rounded-md hover:bg-[#c8a4a5] transition duration-200">
              Order List
            </div>
          </Link>
        </div>

        {/* Order Information */}
        <div className="flex items-center justify-between border-b pb-4 text-[#5a4336]">
          <h5>
            Order ID: <span className="font-bold">#{data?._id?.slice(0, 8)}</span>
          </h5>
          <h5>
            Placed On: <span className="font-bold">{data?.createdAt?.slice(0, 10)}</span>
          </h5>
        </div>

        {/* Order Items */}
        <h2 className="mt-8 text-xl font-semibold text-[#5a4336]">Order Items</h2>
        <div className="mt-4 space-y-4">
          {data &&
            data.cart.map((item, index) => (
              <div
                key={index}
                className="flex items-start p-4 bg-[#c8a4a5] shadow-md rounded-lg hover:scale-105 transition-transform"
              >
                <img
                  src={`${backend_url}/${item.images[0]}`}
                  alt="Product item"
                  className="w-24 h-24 object-cover rounded-md"
                />
                <div className="flex-1 ml-4">
                  <h5 className="text-lg font-semibold text-[#fff]">{item.name}</h5>
                  <h5 className="text-lg text-gray-200">
                    {item.discountPrice ? (
                      <div>
                        Rs {item.discountPrice} x {item.qty}
                        {item.originalPrice && (
                          <span className="text-gray-300 text-sm line-through ml-2">
                            Rs {item.originalPrice}
                          </span>
                        )}
                      </div>
                    ) : (
                      <div>
                        Rs {item.originalPrice || item.price} x {item.qty}
                      </div>
                    )}
                  </h5>
                </div>
              </div>
            ))}
        </div>

        {/* Total Price */}
        <div className="border-t border-gray-400 mt-6 text-right text-[#5a4336]">
          <h5 className="pt-4">
            Total Price: <strong>Rs{data?.totalPrice}</strong>
          </h5>
        </div>

        {/* Shipping Address */}
        <h2 className="mt-8 text-xl font-semibold text-[#5a4336]">Shipping Address</h2>
        <div className="text-[#5a4336] mt-2">
          <h4>
            {data?.shippingAddress.address1 + " " + data?.shippingAddress.address2}
          </h4>
          <h4>{data?.shippingAddress.country}</h4>
          <h4>{data?.shippingAddress.city}</h4>
          <h4>{data?.user?.phoneNumber}</h4>
        </div>

        {/* Payment Info */}
        <h2 className="mt-8 text-xl font-semibold text-[#5a4336]">Payment Info</h2>
        <div className="text-[#5a4336] mt-2">
          <h4>
            Status:{" "}
            {data?.paymentInfo?.status ? data?.paymentInfo?.status : "Not Paid"}
          </h4>
        </div>

        {/* Order Status */}
        <h4 className="mt-8 text-xl font-semibold text-[#5a4336]">Order Status</h4>
        {data?.status !== "Processing refund" &&
        data?.status !== "Refund Success" ? (
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-52 mt-2 border h-10 rounded-md bg-white text-[#5a4336]"
          >
            {[
              "Processing",
 
              "Shipping",
     
              "Delivered",
            ]
              .slice(
                [
                  "Processing",
              
                  "Shipping",
                  
              
                  "Delivered",
                ].indexOf(data?.status)
              )
              .map((option, index) => (
                <option value={option} key={index}>
                  {option}
                </option>
              ))}
          </select>
        ) : (
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-52 mt-2 border h-10 rounded-md bg-white text-[#5a4336]"
          >
            {["Processing refund", "Refund Success"]
              .slice(
                ["Processing refund", "Refund Success"].indexOf(data?.status)
              )
              .map((option, index) => (
                <option value={option} key={index}>
                  {option}
                </option>
              ))}
          </select>
        )}

        {/* Update Status Button */}
        <div
          className="bg-[#c8a4a5] text-white font-semibold py-2 px-4 rounded-md hover:bg-[#c8a4a5] transition duration-200 mt-6 text-center cursor-pointer w-1/2 mx-auto"
          onClick={
            data?.status !== "Processing refund"
              ? orderUpdateHandler
              : refundOrderUpdateHandler
          }
        >
          Update Status
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;