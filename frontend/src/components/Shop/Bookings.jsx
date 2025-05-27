import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllBookingsForSeller, confirmBooking, rejectBooking } from "../../redux/actions/booking";
import { 
  AiOutlineCalendar, 
  AiOutlineUser, 
  AiOutlineMail, 
  AiOutlinePhone, 
  AiOutlineClockCircle, 
  AiOutlineCheckCircle,
  AiOutlineCloseCircle,
  AiOutlineEnvironment,
  AiOutlineInfoCircle,
  AiOutlineReload,
  AiOutlineDesktop
} from "react-icons/ai";
import Loader from "../Layout/Loader";

const Bookings = () => {
  const dispatch = useDispatch();
  const { seller } = useSelector((state) => state.seller);
  const { bookings, isLoading } = useSelector((state) => state.bookings);
  const [expandedBookings, setExpandedBookings] = useState({});

  useEffect(() => {
    dispatch(getAllBookingsForSeller(seller._id));
  }, [dispatch, seller._id]);

  const handleConfirmBooking = (bookingId) => {
    dispatch(confirmBooking(bookingId));
    window.location.reload(true);
  };

  const handleRejectBooking = (bookingId) => {
    dispatch(rejectBooking(bookingId));
    window.location.reload(true);
  };

  const toggleExpandBooking = (bookingId) => {
    setExpandedBookings(prev => ({
      ...prev,
      [bookingId]: !prev[bookingId]
    }));
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'canceled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  // Format time from 24h to 12h format
  const formatTimeToAMPM = (time) => {
    if (!time) return "";
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const twelveHour = hours % 12 || 12;
    return `${twelveHour}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  // Format date to readable string
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Extract booking details based on type (specific or recurring)
  const getBookingDetails = (booking) => {
    // For backward compatibility
    if (booking.dates && booking.dates.length > 0) {
      return {
        type: "Legacy",
        display: booking.dates.map(date => 
          `${date.day} (${date.timeSlot.startTime} - ${date.timeSlot.endTime})`
        ).join(", ")
      };
    }
    
    // Handle specific dates booking
    if (!booking.isRecurring && booking.specificDates && booking.specificDates.length > 0) {
      return {
        type: "Specific Dates",
        dates: booking.specificDates.map(slot => ({
          date: formatDate(slot.date),
          time: `${formatTimeToAMPM(slot.startTime)} - ${formatTimeToAMPM(slot.endTime)}`
        }))
      };
    }
    
    // Handle recurring booking
    if (booking.isRecurring && booking.recurringDetails) {
      const { days, startDate, weekCount, timeSlots } = booking.recurringDetails;
      
      // Convert timeSlots Map to array for display
      const timeSlotsArray = [];
      if (timeSlots) {
        // Handle if timeSlots is stored as a Map
        if (timeSlots instanceof Map) {
          for (const [day, slot] of timeSlots.entries()) {
            timeSlotsArray.push({
              day,
              time: `${formatTimeToAMPM(slot.startTime)} - ${formatTimeToAMPM(slot.endTime)}`
            });
          }
        } 
        // Handle if timeSlots is stored as a regular object
        else if (typeof timeSlots === 'object') {
          Object.entries(timeSlots).forEach(([day, slot]) => {
            timeSlotsArray.push({
              day,
              time: `${formatTimeToAMPM(slot.startTime)} - ${formatTimeToAMPM(slot.endTime)}`
            });
          });
        }
      }
      
      return {
        type: "Recurring",
        startDate: formatDate(startDate),
        weekCount,
        days,
        timeSlots: timeSlotsArray
      };
    }
    
    return { type: "Unknown", display: "Booking details not available" };
  };

  return (
    <>
      {isLoading ? (
        <Loader />
      ) : (
        <div className="w-full p-4">
          <h2 className="text-3xl font-bold text-[#5a4336] mb-6 text-center">Your Booked Services</h2>
          
          {bookings.length === 0 ? (
            <div className="text-center p-6 bg-white rounded-xl shadow-lg">
              <div className="text-4xl mb-3 text-[#a67d6d]">
                <AiOutlineCalendar className="mx-auto" />
              </div>
              <p className="text-lg text-[#5a4336]">No bookings found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {bookings.map((booking) => {
                const bookingDetails = getBookingDetails(booking);
                const isExpanded = expandedBookings[booking._id] || false;
                
                return (
                  <div 
                    key={booking._id} 
                    className="relative overflow-hidden rounded-lg bg-white shadow-md transition-transform transform hover:shadow-lg flex flex-col h-full"
                  >
                    <div className="p-3 flex-grow">
                      {/* Header with service name and status */}
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-lg font-semibold text-[#5a4336] leading-tight">
                          {booking.serviceId.name}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                          {booking.status}
                        </span>
                      </div>

                      {/* Customer Information - clearly labeled */}
                      <div className="bg-blue-50 rounded-md p-2 mb-3 border-l-4 border-blue-400">
                        <h4 className="text-sm font-semibold text-blue-800 mb-2 flex items-center">
                          <AiOutlineUser className="mr-1 text-sm" />
                          Customer Details
                        </h4>
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center text-gray-700">
                            <span className="font-medium w-12 text-xs">Name:</span>
                            <span className="truncate">{booking.userId.name}</span>
                          </div>
                          <div className="flex items-center text-gray-700">
                            <span className="font-medium w-12 text-xs">Email:</span>
                            <span className="truncate">{booking.userId.email}</span>
                          </div>
                          <div className="flex items-center text-gray-700">
                            <span className="font-medium w-12 text-xs">Phone:</span>
                            <span className="truncate">{booking.userId.phoneNumber}</span>
                          </div>
                        </div>
                      </div>

                      {/* Service Description */}
                      {booking.serviceId.description && (
                        <div className="flex items-center text-[#a67d6d] mb-3 text-sm">
                          <AiOutlineDesktop className="mr-2 text-xs flex-shrink-0" />
                          <span className="truncate">{booking.serviceId.description}</span>
                        </div>
                      )}

                      {/* Booking Details Section - compact */}
                      <div className="bg-[#f8f4f1] rounded-md p-2 mb-3">
                        <div className="flex justify-between items-center mb-1">
                          <h4 className="text-sm font-medium text-[#5a4336] flex items-center">
                            {bookingDetails.type === "Recurring" ? (
                              <AiOutlineReload className="mr-1 text-xs" />
                            ) : (
                              <AiOutlineCalendar className="mr-1 text-xs" />
                            )}
                            <span>{bookingDetails.type}</span>
                          </h4>
                          <button 
                            onClick={() => toggleExpandBooking(booking._id)}
                            className="text-xs text-[#a67d6d] hover:text-[#5a4336]"
                          >
                            {isExpanded ? "Hide" : "Show"}
                          </button>
                        </div>

                        {/* Legacy bookings display */}
                        {bookingDetails.type === "Legacy" && (
                          <div className="text-xs text-[#a67d6d]">
                            {bookingDetails.display}
                          </div>
                        )}

                        {/* Specific Dates booking display */}
                        {bookingDetails.type === "Specific Dates" && (
                          <div className="text-xs">
                            {isExpanded ? (
                              <div className="space-y-1 mt-1">
                                {bookingDetails.dates.map((slot, index) => (
                                  <div key={index} className="bg-white rounded p-1">
                                    <div className="font-medium text-[#5a4336] text-xs">{slot.date}</div>
                                    <div className="text-xs text-[#a67d6d]">{slot.time}</div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-[#a67d6d]">
                                {bookingDetails.dates.length} date{bookingDetails.dates.length !== 1 ? 's' : ''}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Recurring booking display */}
                        {bookingDetails.type === "Recurring" && (
                          <div className="text-xs">
                            <div className="text-[#a67d6d]">
                              {bookingDetails.startDate} • {bookingDetails.weekCount}w
                            </div>
                            
                            {isExpanded && (
                              <div className="space-y-1 mt-1">
                                <div className="bg-white rounded p-1">
                                  <div className="font-medium text-[#5a4336] text-xs">Days:</div>
                                  <div className="text-xs text-[#a67d6d]">
                                    {bookingDetails.days ? bookingDetails.days.join(', ') : 'None'}
                                  </div>
                                </div>
                                
                                {bookingDetails.timeSlots && bookingDetails.timeSlots.length > 0 && (
                                  <div className="bg-white rounded p-1">
                                    <div className="font-medium text-[#5a4336] text-xs">Times:</div>
                                    <div className="space-y-0.5">
                                      {bookingDetails.timeSlots.map((slot, index) => (
                                        <div key={index} className="text-xs text-[#a67d6d]">
                                          {slot.day}: {slot.time}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Created date - compact */}
                      <div className="text-xs text-gray-500">
                        {formatDate(booking.createdAt)}
                      </div>
                    </div>

                    {/* Action buttons - compact */}
                    {booking.status === "pending" && (
                      <div className="p-2 border-t border-gray-200 mt-auto">
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleConfirmBooking(booking._id)}
                            className="flex-1 py-2 rounded-md bg-green-600 text-white hover:bg-green-700 transition-colors duration-300 flex items-center justify-center gap-1 text-sm"
                          >
                            <AiOutlineCheckCircle size={16} />
                            <span>Confirm</span>
                          </button>
                          <button
                            onClick={() => handleRejectBooking(booking._id)}
                            className="flex-1 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors duration-300 flex items-center justify-center gap-1 text-sm"
                          >
                            <AiOutlineCloseCircle size={16} />
                            <span>Reject</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default Bookings;