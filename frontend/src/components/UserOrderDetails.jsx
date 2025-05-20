import React, { useEffect, useState } from "react"; 
import styles from "../styles/styles"; // Ensure styles include necessary classes
import { BsFillBagFill } from "react-icons/bs";
import { Link, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { backend_url, server } from "../server";
import { RxCross1 } from "react-icons/rx";
import { getAllOrdersOfUser } from "../redux/actions/order";
import { useDispatch, useSelector } from "react-redux";
import { AiFillStar, AiOutlineStar } from "react-icons/ai";

const UserOrderDetails = () => {
  const { orders } = useSelector((state) => state.order);
  const { user } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const [comment, setComment] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [rating, setRating] = useState(1);

  const { id } = useParams();

  useEffect(() => {
    dispatch(getAllOrdersOfUser(user._id));
  }, [dispatch, user._id]);

  const data = orders && orders.find((item) => item._id === id);

  const reviewHandler = async (type) => {
    try {
      const endpoint =
        type === "product"
          ? "/product/create-new-review"
          : "/event/create-new-review-event";

      const res = await axios.put(
        `${server}${endpoint}`,
        {
          user,
          rating,
          comment,
          productId: selectedItem?._id,
          orderId: id,
        },
        { withCredentials: true }
      );

      toast.success(res.data.message);
      dispatch(getAllOrdersOfUser(user._id));
      setComment("");
      setRating(1);
      setOpen(false);
    } catch (error) {
      console.error(error);
      toast.error("An error occurred. Please try again.");
    }
  };

  const combinedHandler = async () => {
    if (rating > 1) {
      await reviewHandler("product");
      await reviewHandler("event");
    }
  };

  return (
    <div className="min-h-screen py-8 border-[#c8a4a5]" style={{ 
      background: "gray-100", // Main background color
      color: "#5a4336" // Darker color for text
    }}>
      <div className="max-w-5xl mx-auto p-6 bg-[#e6d8d8] rounded-lg shadow-md border-[#c8a4a5]">
        <div className="flex items-center mb-6">
          <BsFillBagFill size={30} color="#5a4336" />
          <h1 className="pl-2 text-3xl font-bold">Order Details</h1>
        </div>

        <div className="flex items-center justify-between pt-4 text-[#5a4336] border-b border-gray-600 pb-4">
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
              <div key={index} className="flex items-start p-4 bg-[#c8a4a5] shadow-md rounded-lg  transition-transform transform hover:scale-105">
                <img
                  src={`${backend_url}/${item.images[0]}`}
                  alt="Product item order"
                  className="w-24 h-24 object-cover rounded-md"
                />
                <div className="flex-1 ml-4">
                  <h5 className="text-lg font-semibold text-[#fff]">{item.name}</h5>
                  <h5 className="text-lg text-gray-300">
                  Rs {item.discountPrice > 0 ? item.discountPrice : item.originalPrice} x {item.qty}
                  </h5>
                 
                </div>
                {!item.isReviewed && data?.status === "Delivered" ? (
                  <button
                    className="bg-gradient-to-r from-[#5a4336] to-[#5a4336] text-white py-2 px-3 rounded-md hover:bg-opacity-80 transition duration-200"
                    onClick={() => {
                      setOpen(true);
                      setSelectedItem(item);
                    }}
                  >
                    Write a Review
                  </button>
                ) : null}
              </div>
            ))}
        </div>

        {/* Review Popup */}
        {open && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
            <div className="bg-[#5D627A] rounded-md shadow-lg p-6 w-[90%] md:w-[50%]">
              <div className="flex justify-end">
                <RxCross1
                  size={30}
                  onClick={() => setOpen(false)}
                  className="cursor-pointer text-[#5a4336] hover:text-red-600 transition"
                />
              </div>
              <h2 className="text-2xl font-semibold text-center text-[#FCFBF4]">Give a Review</h2>
              <div className="flex mt-4">
                <img
                  src={`${backend_url}/${selectedItem?.images[0]}`}
                  alt=""
                  className="w-24 h-24 object-cover rounded-md"
                />
                <div className="ml-4">
                  <div className="text-lg font-semibold text-[#5a4336]">{selectedItem?.name}</div>
                  <h4 className="text-lg text-[#5a4336]">
                    Rs {selectedItem?.discountPrice} x {selectedItem?.qty}
                  </h4>
                  
                </div>
              </div>

              {/* Rating */}
              <h5 className="mt-4 text-lg font-medium text-[#FCFBF4]">Give a Rating <span className="text-red-500">*</span></h5>
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((i) =>
                  rating >= i ? (
                    <AiFillStar
                      key={i}
                      className="cursor-pointer text-yellow-500"
                      size={30}
                      onClick={() => setRating(i)}
                    />
                  ) : (
                    <AiOutlineStar
                      key={i}
                      className="cursor-pointer text-gray-400"
                      size={30}
                      onClick={() => setRating(i)}
                    />
                  )
                )}
              </div>

              {/* Comment */}
              <div className="mt-4">
                <label className="block text-lg font-medium text-[#FCFBF4]">Write a Comment (Optional)</label>
                <textarea
                  cols="30"
                  rows="5"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="How was your product? Write your experience about it!"
                  className="mt-2 w-full border p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FCFBF4] bg-[#89758c] text-[#FCFBF4]"
                />
              </div>

              <div className="mt-4">
                <button
                  className="bg-[#c8a4a5] text-white py-2 px-4 rounded-md hover:bg-opacity-80 transition duration-200 w-full"
                  onClick={rating > 1 ? combinedHandler : null}
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        )}
        
        <div className="border-b border-gray-600 pb-4 w-full text-right mt-4 text-[#5a4336]">
          <h5>
            Total Price: <strong>Rs {data?.totalPrice}</strong>
          </h5>
        </div>

        {/* Shipping Address */}
        <h2 className="mt-8 text-xl font-semibold text-[#5a4336]">Shipping Address</h2>
        <div className="text-[#5a4336] mt-2">
          <h4>{data?.shippingAddress.address1 + " " + data?.shippingAddress.address2}</h4>
          <h4>{data?.shippingAddress.country}</h4>
          <h4>{data?.shippingAddress.city}</h4>
          <h4>{data?.user?.phoneNumber}</h4>
        </div>

        {/* Payment Info */}
        <h2 className="mt-8 text-xl font-semibold text-[#5a4336]">Payment Info</h2>
        <div className="text-[#5a4336] mt-2">
          <h4>
            Status: {data?.paymentInfo?.status ? data?.paymentInfo?.status : "Not Paid"}
          </h4>
        </div>

        {/* Send Message Button */}
        {/* <Link to= "/inbox">
        <div className="bg-[#c8a4a5] text-white py-2 rounded-md hover:bg-opacity-80 transition duration-200 mt-4 text-center transition-transform transform hover:scale-105 w-1/2 mx-auto">
  Send Message
</div>

        </Link> */}
      </div>
    </div>
  );
};

export default UserOrderDetails;