import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getUserBookings, cancelBooking } from '../../redux/actions/booking';

import Loader from '../Layout/Loader';
import { 
  AiOutlineCalendar, 
  AiOutlineShop, 
  AiFillClockCircle, 
  AiOutlineEnvironment, 
  AiOutlineReload,
  AiOutlineCheckCircle,
  AiOutlineClose
} from 'react-icons/ai';

const UserBookingsPage = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user);
  const { bookings, isLoading, error } = useSelector((state) => state.bookings);
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    if (user) {
      dispatch(getUserBookings(user._id));
    }
  }, [dispatch, user]);

  // Handle booking cancellation
  const handleCancelBooking = (bookingId) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      setCancellingId(bookingId);
      dispatch(cancelBooking(bookingId));
      
      // Reset cancelling state after 2 seconds
      setTimeout(() => {
        setCancellingId(null);
      }, 2000);
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'canceled':
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Format time to AM/PM for better readability
  const formatTimeToAMPM = (time24) => {
    if (!time24) return '';
    const [hours, minutes] = time24.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const twelveHour = hours % 12 || 12;
    return `${twelveHour}:${minutes.toString().padStart(2, '0')} ${period}`;
  };
  
  // Format date to readable string
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric'
    });
  };
  
  // Render specific date bookings
  const renderSpecificDates = (specificDates) => {
    if (!specificDates || specificDates.length === 0) return null;
    
    return (
      <div className="mt-3 space-y-2">
        <div className="flex items-center text-[#5a4336] font-medium">
          <AiOutlineCheckCircle className="mr-2" size={20} />
          <span>Specific Dates</span>
        </div>
        
        {specificDates.map((date, index) => (
          <div key={index} className="ml-6 bg-[#f8f4f1] rounded-lg p-2">
            <div className="flex items-center text-[#a67d6d]">
              <AiOutlineCalendar className="mr-2" size={18} />
              <span>{formatDate(date.date)}</span>
            </div>
            <div className="flex items-center text-[#a67d6d] mt-1">
              <AiFillClockCircle className="mr-2" size={18} />
              <span>
                {formatTimeToAMPM(date.startTime)} - {formatTimeToAMPM(date.endTime)}
              </span>
            </div>
          </div>
        ))}
      </div>
    );
  };
  
  // Render recurring bookings
  const renderRecurringDetails = (recurringDetails) => {
    if (!recurringDetails || !recurringDetails.days || recurringDetails.days.length === 0) return null;
    
    return (
      <div className="mt-3 space-y-2">
        <div className="flex items-center text-[#5a4336] font-medium">
          <AiOutlineReload className="mr-2" size={20} />
          <span>Recurring Schedule</span>
        </div>
        
        <div className="ml-6 bg-[#f8f4f1] rounded-lg p-2">
          <div className="flex items-center text-[#a67d6d]">
            <AiOutlineCalendar className="mr-2" size={18} />
            <span>
              Starting {formatDate(recurringDetails.startDate)}
              {recurringDetails.endDate 
                ? ` until ${formatDate(recurringDetails.endDate)}` 
                : recurringDetails.weekCount 
                  ? ` for ${recurringDetails.weekCount} weeks` 
                  : ''}
            </span>
          </div>
          
          <div className="mt-2 space-y-1">
            {recurringDetails.days.map((day, index) => {
              // Extract time slots for the day
              const timeSlot = recurringDetails.timeSlots && 
                               typeof recurringDetails.timeSlots === 'object' && 
                               recurringDetails.timeSlots[day];
              
              return (
                <div key={index} className="flex items-center text-[#a67d6d]">
                  <span className="font-medium ml-5 mr-2">{day}:</span>
                  {timeSlot ? (
                    <span>{formatTimeToAMPM(timeSlot.startTime)} - {formatTimeToAMPM(timeSlot.endTime)}</span>
                  ) : (
                    <span className="text-gray-500 italic">Time not specified</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };
  
  // Render legacy bookings format
  const renderLegacyDates = (dates) => {
    if (!dates || dates.length === 0) return null;
    
    return (
      <div className="mt-3 space-y-2">
        <div className="flex items-center text-[#5a4336] font-medium">
          <AiOutlineCalendar className="mr-2" size={20} />
          <span>Booked Dates</span>
        </div>
        
        {dates.map((date, index) => (
          <div key={index} className="ml-6 bg-[#f8f4f1] rounded-lg p-2">
            <div className="flex items-center text-[#a67d6d]">
              <span>{date.day}</span>
            </div>
            <div className="flex items-center text-[#a67d6d] mt-1">
              <AiFillClockCircle className="mr-2" size={18} />
              <span>
                {formatTimeToAMPM(date.timeSlot.startTime)} - {formatTimeToAMPM(date.timeSlot.endTime)}
              </span>
            </div>
          </div>
        ))}
      </div>
    );
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
    <div className="min-h-screen bg-[#d8c4b8]/10">
      <div className="w-full p-8">
        <h2 className="text-4xl font-bold text-[#5a4336] mb-8 text-center">Your Bookings</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookings.length > 0 ? (
            bookings.map((booking) => (
              <div 
                key={booking._id} 
                className="relative overflow-hidden rounded-xl bg-white shadow-lg transition-transform transform hover:scale-105 hover:shadow-xl hover:bg-gradient-to-r hover:from-[#e6d8d8] hover:to-[#c8a4a5]"
              >
                <div className="p-6">
                  {/* Booking Header with Service Name and Status */}
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-2xl font-semibold text-[#5a4336]">
                      {booking.serviceId?.name || 'Service'}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(booking.status)}`}>
                      {booking.status}
                    </span>
                  </div>

                  {/* Service Provider Info */}
                  <div className="space-y-3">
                    <div className="flex items-center text-[#a67d6d]">
                      <AiOutlineShop className="mr-2" size={20} />
                      <span>{booking.sellerId?.name || 'Provider'}</span>
                    </div>

                    {booking.serviceId?.location && (
                      <div className="flex items-center text-[#a67d6d]">
                        <AiOutlineEnvironment className="mr-2" size={20} />
                        <span>{booking.serviceId.location}</span>
                      </div>
                    )}
                    
                    {/* Display dates based on booking type */}
                    {booking.isRecurring && renderRecurringDetails(booking.recurringDetails)}
                    {booking.specificDates?.length > 0 && renderSpecificDates(booking.specificDates)}
                    {!booking.isRecurring && (!booking.specificDates || booking.specificDates.length === 0) && 
                      renderLegacyDates(booking.dates)}
                  </div>
                  
                  {/* Cancel button for pending bookings */}
                  {booking.status === 'pending' && (
                    <div className="mt-4 text-center">
                      <button 
                        onClick={() => handleCancelBooking(booking._id)}
                        disabled={cancellingId === booking._id}
                        className={`flex items-center justify-center w-full py-2 px-4 rounded-md ${
                          cancellingId === booking._id 
                            ? 'bg-gray-300 cursor-not-allowed' 
                            : 'bg-red-500 hover:bg-red-600 text-white transition duration-200'
                        }`}
                      >
                        {cancellingId === booking._id ? (
                          'Cancelling...'
                        ) : (
                          <>
                            <AiOutlineClose className="mr-2" size={18} />
                            Cancel Booking
                          </>
                        )}
                      </button>
                    </div>
                  )}
                  
                  {/* Creation Date */}
                  <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-500">
                    Booked on: {new Date(booking.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-xl text-[#5a4336]">No bookings found</p>
              <p className="mt-2 text-[#a67d6d]">You haven't made any bookings yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserBookingsPage;