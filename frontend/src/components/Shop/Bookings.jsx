import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllBookingsForSeller, confirmBooking } from "../../redux/actions/booking";
import { AiOutlineCalendar, AiOutlineUser, AiOutlineMail, AiOutlinePhone, AiOutlineClockCircle, AiOutlineCheckCircle } from "react-icons/ai";
import Loader from "../Layout/Loader";

const Bookings = () => {
  const dispatch = useDispatch();
  const { seller } = useSelector((state) => state.seller);
  const { bookings, isLoading } = useSelector((state) => state.bookings);

  useEffect(() => {
    dispatch(getAllBookingsForSeller(seller._id));
  }, [dispatch, seller._id]);

  const handleConfirmBooking = (bookingId) => {
    dispatch(confirmBooking(bookingId));
    window.location.reload(true);
  };

  const getStatusColor = (status) => {
    return status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';
  };

  const formatDateTime = (dates) => {
    return dates.map(date => `${date.day} (${date.timeSlot.startTime} - ${date.timeSlot.endTime})`).join(", ");
  };

  return (
    <>
      {isLoading ? (
        <Loader />
      ) : (
        <div className="w-full p-8">
          <h2 className="text-4xl font-bold text-[#5a4336] mb-8 text-center">Your Booked Services</h2>
          
          {bookings.length === 0 ? (
            <div className="text-center p-8 bg-white rounded-xl shadow-lg">
              <div className="text-6xl mb-4 text-[#a67d6d]">
                <AiOutlineCalendar className="mx-auto" />
              </div>
              <p className="text-xl text-[#5a4336]">No bookings found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bookings.map((booking) => (
                <div key={booking._id} 
                  className="relative overflow-hidden rounded-xl bg-white shadow-lg transition-transform transform hover:scale-105 hover:shadow-xl hover:bg-gradient-to-r hover:from-[#e6d8d8] hover:to-[#c8a4a5]"
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-2xl font-semibold text-[#5a4336]">
                        {booking.serviceId.name}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                    </div>

                    <div className="space-y-3 mb-6">
                      <div className="flex items-center text-[#a67d6d]">
                        <AiOutlineUser className="mr-2" />
                        <span>{booking.userId.name}</span>
                      </div>
                      <div className="flex items-center text-[#a67d6d]">
                        <AiOutlineMail className="mr-2" />
                        <span>{booking.userId.email}</span>
                      </div>
                      <div className="flex items-center text-[#a67d6d]">
                        <AiOutlinePhone className="mr-2" />
                        <span>{booking.userId.phoneNumber}</span>
                      </div>
                      <div className="flex items-center text-[#a67d6d]">
                        <AiOutlineClockCircle className="mr-2" />
                        <span className="text-sm">{formatDateTime(booking.dates)}</span>
                      </div>
                    </div>

                    {booking.status === "pending" && (
                      <button
                        onClick={() => handleConfirmBooking(booking._id)}
                        className="w-full py-3 rounded-lg bg-[#5a4336] text-white hover:bg-[#a67d6d] transition-colors duration-300 flex items-center justify-center gap-2"
                      >
                        <AiOutlineCheckCircle size={20} />
                        <span>Confirm Booking</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default Bookings;