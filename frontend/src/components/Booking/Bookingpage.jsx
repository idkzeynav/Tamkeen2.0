import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getUserBookings } from '../../redux/actions/booking';

import Loader from '../Layout/Loader';
import { AiOutlineCalendar, AiOutlineShop, AiFillClockCircle, AiOutlineEnvironment } from 'react-icons/ai';

const UserBookingsPage = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user);
  const { bookings, isLoading, error } = useSelector((state) => state.bookings);

  useEffect(() => {
    if (user) {
      dispatch(getUserBookings(user._id));
    }
  }, [dispatch, user]);

  const getStatusBadgeColor = (status) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#d8c4b8]/10 flex items-center justify-center">
        <div className="text-[#5a4336] text-xl">{error}</div>
      </div>
    );
  }

  return (
    <>
      
      <div className="min-h-screen bg-[#d8c4b8]/10">
        <div className="w-full p-8">
          <h2 className="text-4xl font-bold text-[#5a4336] mb-8 text-center">Your Bookings</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bookings.map((booking) => (
              <div 
                key={booking._id} 
                className="relative overflow-hidden rounded-xl bg-white shadow-lg transition-transform transform hover:scale-105 hover:shadow-xl hover:bg-gradient-to-r hover:from-[#e6d8d8] hover:to-[#c8a4a5]"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-2xl font-semibold text-[#5a4336]">
                      {booking.serviceId.name}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(booking.status)}`}>
                      {booking.status}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center text-[#a67d6d]">
                      <AiOutlineShop className="mr-2" size={20} />
                      <span>{booking.sellerId.name}</span>
                    </div>

                    {booking.serviceId.location && (
                      <div className="flex items-center text-[#a67d6d]">
                        <AiOutlineEnvironment className="mr-2" size={20} />
                        <span>{booking.serviceId.location}</span>
                      </div>
                    )}

                    {booking.dates.map((date, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center text-[#a67d6d]">
                          <AiOutlineCalendar className="mr-2" size={20} />
                          <span>{date.day}</span>
                        </div>
                        <div className="flex items-center text-[#a67d6d] ml-6">
                          <AiFillClockCircle className="mr-2" size={20} />
                          <span>
                            {date.timeSlot.startTime} - {date.timeSlot.endTime}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}

            {bookings.length === 0 && (
              <div className="col-span-full text-center py-12">
                <p className="text-xl text-[#5a4336]">No bookings found</p>
              </div>
            )}
          </div>
        </div>
      </div>
     
    </>
  );
};

export default UserBookingsPage;