import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AiOutlineCheck, AiOutlineClose, AiOutlineClock, AiOutlineUser, AiOutlineTag } from "react-icons/ai";
import { confirmBooking, getAllBookingsForSeller } from "../../redux/actions/booking";
import Loader from "../Layout/Loader";
import { toast } from "react-toastify";

const SellerBookings = () => {
  const { bookings, isLoading } = useSelector((state) => state.bookings);
  const { seller } = useSelector((state) => state.seller);
  const dispatch = useDispatch();

  useEffect(() => {
    if (seller?._id) {
      dispatch(getAllBookingsForSeller(seller._id));
    }
  }, [dispatch, seller]);

  const handleConfirm = (bookingId) => {
    dispatch(confirmBooking(bookingId, "confirmed"))
      .then(() => toast.success("Booking confirmed!"))
      .catch((error) => toast.error(error.message));
  };

  const handleReject = (bookingId) => {
    dispatch(confirmBooking(bookingId, "canceled"))
      .then(() => toast.success("Booking canceled!"))
      .catch((error) => toast.error(error.message));
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'canceled': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      {isLoading ? (
        <Loader />
      ) : (
        <div className="w-full p-8 bg-[#d8c4b8]/10 min-h-screen">
          <h2 className="text-4xl font-bold text-[#5a4336] mb-8 text-center">Your Bookings</h2>
          
          <div className="grid grid-cols-1 gap-6">
            {bookings?.map((booking) => (
              <div key={booking._id} 
                className="relative overflow-hidden rounded-xl bg-white shadow-lg transition-transform transform hover:scale-[1.02] hover:shadow-xl">
                <div className="p-6">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <AiOutlineTag className="text-[#a67d6d]" size={20} />
                        <h3 className="text-2xl font-semibold text-[#5a4336]">
                          {booking.serviceId.name}
                        </h3>
                      </div>
                      
                      <div className="flex items-center gap-2 mb-2">
                        <AiOutlineUser className="text-[#a67d6d]" size={20} />
                        <span className="text-[#5a4336]">{booking.userId.name}</span>
                      </div>
                    </div>

                    <div className="mt-4 md:mt-0">
                      <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-6 mb-4">
                    <div className="flex items-center gap-2">
                      <AiOutlineClock className="text-[#a67d6d]" size={20} />
                      <div className="text-[#5a4336]">
                        <span className="font-medium">{booking.dates[0]?.day || "N/A"}</span>
                        <span className="mx-2">|</span>
                        <span>{booking.dates[0]?.timeSlot.startTime || "N/A"} - {booking.dates[0]?.timeSlot.endTime || "N/A"}</span>
                      </div>
                    </div>
                  </div>

                  {booking.status === "pending" && (
                    <div className="flex gap-3 mt-4">
                      <button
                        onClick={() => handleConfirm(booking._id)}
                        className="flex items-center gap-2 px-4 py-2 bg-[#d8c4b8] hover:bg-[#a67d6d] text-[#5a4336] hover:text-white rounded-lg transition-colors duration-300"
                      >
                        <AiOutlineCheck size={20} />
                        Confirm
                      </button>
                      <button
                        onClick={() => handleReject(booking._id)}
                        className="flex items-center gap-2 px-4 py-2 bg-[#c8a4a5] hover:bg-red-400 text-white rounded-lg transition-colors duration-300"
                      >
                        <AiOutlineClose size={20} />
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {bookings?.length === 0 && (
              <div className="text-center py-12">
                <p className="text-xl text-[#5a4336]">No bookings found</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default SellerBookings;