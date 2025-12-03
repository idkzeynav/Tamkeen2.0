import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getUserBookings, cancelBooking, completeBooking } from '../../redux/actions/booking';

import Loader from '../Layout/Loader';
import { 
  AiOutlineCalendar, 
  AiOutlineShop, 
  AiFillClockCircle, 
  AiOutlineEnvironment, 
  AiOutlineReload,
  AiOutlineCheckCircle,
  AiOutlineClose,
  AiOutlineEye,
  AiOutlinePhone,
  AiOutlineMail,
  AiOutlineInfoCircle,
  AiOutlineDollarCircle,
  AiOutlineWarning,
  AiFillStar,
  AiOutlineStar,
  AiOutlineCheck
} from 'react-icons/ai';

const UserBookingsPage = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user);
  const { bookings, isLoading, error } = useSelector((state) => state.bookings);
  const [cancellingId, setCancellingId] = useState(null);
  const [completingId, setCompletingId] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Store original booking data to prevent data loss after status updates
  const [bookingDataCache, setBookingDataCache] = useState({});
  
  // Confirmation modal states
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState(null);
  
  // Complete booking modal states
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [bookingToComplete, setBookingToComplete] = useState(null);

  useEffect(() => {
    if (user) {
      dispatch(getUserBookings(user._id));
    }
  }, [dispatch, user]);

  // Cache booking data when bookings are loaded to preserve service/seller info
  useEffect(() => {
    if (bookings && bookings.length > 0) {
      const cache = {};
      bookings.forEach(booking => {
        if (booking.serviceId && booking.sellerId) {
          cache[booking._id] = {
            serviceId: booking.serviceId,
            sellerId: booking.sellerId
          };
        }
      });
      setBookingDataCache(prevCache => ({ ...prevCache, ...cache }));
    }
  }, [bookings]);

  // Helper function to get service data (from booking or cache)
  const getServiceData = (booking) => {
    return booking.serviceId || bookingDataCache[booking._id]?.serviceId || null;
  };

  // Helper function to get seller data (from booking or cache)
  const getSellerData = (booking) => {
    return booking.sellerId || bookingDataCache[booking._id]?.sellerId || null;
  };

  // Handle booking cancellation - show confirmation modal
  const handleCancelBooking = (bookingId) => {
    setBookingToCancel(bookingId);
    setShowConfirmModal(true);
  };

  // Confirm cancellation
  const confirmCancellation = async () => {
    if (bookingToCancel) {
      setCancellingId(bookingToCancel);
      
      try {
        await dispatch(cancelBooking(bookingToCancel));
        
        // Keep the booking data in state but update status locally
        // This prevents data loss while waiting for Redux state update
        const updatedBookings = bookings.map(booking => 
          booking._id === bookingToCancel 
            ? { ...booking, status: 'canceled' }
            : booking
        );
        
        // If you have access to update bookings directly in Redux store, do it here
        // Otherwise, the component will re-render when Redux state updates
        
      } catch (error) {
        console.error('Error canceling booking:', error);
      } finally {
        setCancellingId(null);
      }
    }
    
    // Close confirmation modal
    setShowConfirmModal(false);
    setBookingToCancel(null);
  };

  // Cancel the cancellation
  const cancelCancellation = () => {
    setShowConfirmModal(false);
    setBookingToCancel(null);
  };

  // Handle complete booking - show complete modal
  const handleCompleteBooking = (bookingId) => {
    setBookingToComplete(bookingId);
    setShowCompleteModal(true);
  };

  // Confirm completion
  const confirmCompletion = async () => {
    if (bookingToComplete) {
      setCompletingId(bookingToComplete);
      
      try {
        await dispatch(completeBooking(bookingToComplete));
        
        // Keep the booking data in state but update status locally
        const updatedBookings = bookings.map(booking => 
          booking._id === bookingToComplete 
            ? { 
                ...booking, 
                status: 'completed',
                completedAt: new Date()
              }
            : booking
        );
        
      } catch (error) {
        console.error('Error completing booking:', error);
      } finally {
        setCompletingId(null);
      }
    }
    
    // Close complete modal
    setShowCompleteModal(false);
    setBookingToComplete(null);
  };

  // Cancel the completion
  const cancelCompletion = () => {
    setShowCompleteModal(false);
    setBookingToComplete(null);
  };

  // Open modal with booking details
  const openBookingModal = (booking) => {
    // Ensure we have the complete booking data with cached service/seller info
    const completeBooking = {
      ...booking,
      serviceId: getServiceData(booking),
      sellerId: getSellerData(booking)
    };
    setSelectedBooking(completeBooking);
    setIsModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedBooking(null);
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
      case 'completed':
        return 'bg-blue-100 text-blue-800';
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

  // Star Rating Component (for displaying existing ratings only)
  const StarRating = ({ rating, interactive = false }) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <div key={star} className="cursor-default">
            {star <= rating ? (
              <AiFillStar className="text-yellow-400" size={16} />
            ) : (
              <AiOutlineStar className="text-gray-300" size={16} />
            )}
          </div>
        ))}
      </div>
    );
  };

  // Complete Booking Modal Component - Simplified
  const CompleteBookingModal = () => {
    if (!showCompleteModal) return null;

    const booking = bookings.find(b => b._id === bookingToComplete);
    const service = getServiceData(booking);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-md w-full shadow-2xl">
          {/* Modal Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 bg-green-100 rounded-full">
                <AiOutlineCheck className="text-green-600" size={32} />
              </div>
            </div>
            <h3 className="text-xl font-bold text-[#5a4336] text-center">
              Mark as Complete
            </h3>
          </div>

          {/* Modal Content */}
          <div className="p-6">
            <p className="text-[#a67d6d] text-center mb-4">
              Are you sure you want to mark this booking as completed?
            </p>
            <div className="bg-[#f8f4f1] rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-[#5a4336] text-center">
                {service?.name || 'Service'}
              </h4>
              {getSellerData(booking)?.name && (
                <p className="text-[#a67d6d] text-center text-sm mt-1">
                  at {getSellerData(booking).name}
                </p>
              )}
            </div>
            <p className="text-green-600 text-center text-sm">
              This will mark the service as successfully completed.
            </p>
          </div>

          {/* Modal Actions */}
          <div className="p-6 border-t border-gray-200 flex space-x-4">
            <button
              onClick={cancelCompletion}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              onClick={confirmCompletion}
              className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200 flex items-center justify-center"
            >
              <AiOutlineCheck className="mr-2" size={18} />
              Yes, Complete
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Confirmation Modal Component
  const ConfirmationModal = () => {
    if (!showConfirmModal) return null;

    const booking = bookings.find(b => b._id === bookingToCancel);
    const service = getServiceData(booking);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-md w-full shadow-2xl">
          {/* Modal Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 bg-red-100 rounded-full">
                <AiOutlineWarning className="text-red-600" size={32} />
              </div>
            </div>
            <h3 className="text-xl font-bold text-[#5a4336] text-center">
              Cancel Booking
            </h3>
          </div>

          {/* Modal Content */}
          <div className="p-6">
            <p className="text-[#a67d6d] text-center mb-4">
              Are you sure you want to cancel your booking for
            </p>
            <div className="bg-[#f8f4f1] rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-[#5a4336] text-center">
                {service?.name || 'Service'}
              </h4>
              {getSellerData(booking)?.name && (
                <p className="text-[#a67d6d] text-center text-sm mt-1">
                  at {getSellerData(booking).name}
                </p>
              )}
            </div>
            <p className="text-red-600 text-center text-sm">
              This action cannot be undone.
            </p>
          </div>

          {/* Modal Actions */}
          <div className="p-6 border-t border-gray-200 flex space-x-4">
            <button
              onClick={cancelCancellation}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors duration-200"
            >
              Keep Booking
            </button>
            <button
              onClick={confirmCancellation}
              className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200 flex items-center justify-center"
            >
              <AiOutlineClose className="mr-2" size={18} />
              Yes, Cancel
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Modal component
  const BookingModal = () => {
    if (!isModalOpen || !selectedBooking) return null;

    const service = getServiceData(selectedBooking);
    const seller = getSellerData(selectedBooking);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Modal Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center rounded-t-xl">
            <h3 className="text-2xl font-bold text-[#5a4336]">
              {service?.name || 'Service'} - Booking Details
            </h3>
            <button
              onClick={closeModal}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
            >
              <AiOutlineClose className="text-[#5a4336]" size={24} />
            </button>
          </div>

          {/* Modal Content */}
          <div className="p-6 space-y-6">
            {/* Quick Info Section */}
            <div className="bg-[#f8f4f1] rounded-lg p-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(selectedBooking.status)}`}>
                    {selectedBooking.status}
                  </span>
                  <div className="text-sm text-[#a67d6d]">
                    Booking ID: <span className="font-mono">{selectedBooking._id}</span>
                  </div>
                </div>
                <div className="text-sm text-[#a67d6d]">
                  Booked on: {new Date(selectedBooking.createdAt).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            </div>

            {/* Completion Info for completed bookings */}
            {selectedBooking.status === 'completed' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-blue-700 mb-3 flex items-center">
                  <AiOutlineCheck className="mr-2" size={20} />
                  Booking Completed
                </h4>
                <div className="space-y-2">
                  <p className="text-blue-600">
                    Completed on: {new Date(selectedBooking.completedAt).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                  {selectedBooking.userRating && (
                    <div className="flex items-center space-x-2">
                      <span className="text-blue-600">Your Rating:</span>
                      <StarRating rating={selectedBooking.userRating} />
                    </div>
                  )}
                  {selectedBooking.userReview && (
                    <div>
                      <span className="text-blue-600 font-medium">Your Review:</span>
                      <p className="text-blue-700 mt-1 italic">"{selectedBooking.userReview}"</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Schedule Information */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h4 className="text-lg font-semibold text-[#5a4336] mb-3 flex items-center">
                <AiOutlineCalendar className="mr-2" size={20} />
                Schedule Information
              </h4>
              
              {selectedBooking.isRecurring && renderRecurringDetails(selectedBooking.recurringDetails)}
              {selectedBooking.specificDates?.length > 0 && renderSpecificDates(selectedBooking.specificDates)}
              {!selectedBooking.isRecurring && (!selectedBooking.specificDates || selectedBooking.specificDates.length === 0) && 
                renderLegacyDates(selectedBooking.dates)}
            </div>

            {/* Service Information */}
            {service && (
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-[#5a4336] mb-3 flex items-center">
                  <AiOutlineInfoCircle className="mr-2" size={20} />
                  Service Information
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="font-medium text-[#5a4336]">Service Name:</span>
                    <p className="text-[#a67d6d] mt-1">{service.name}</p>
                  </div>
                  
                  {service.category && (
                    <div>
                      <span className="font-medium text-[#5a4336]">Category:</span>
                      <p className="text-[#a67d6d] mt-1">{service.category}</p>
                    </div>
                  )}
                  
                  {service.price && (
                    <div className="flex items-center">
                      <AiOutlineDollarCircle className="mr-1 text-[#5a4336]" size={16} />
                      <span className="font-medium text-[#5a4336]">Price:</span>
                      <span className="ml-2 text-[#a67d6d]">${service.price}</span>
                    </div>
                  )}
                  
                  {service.duration && (
                    <div className="flex items-center">
                      <AiFillClockCircle className="mr-1 text-[#5a4336]" size={16} />
                      <span className="font-medium text-[#5a4336]">Duration:</span>
                      <span className="ml-2 text-[#a67d6d]">{service.duration} minutes</span>
                    </div>
                  )}
                </div>
                
                {service.description && (
                  <div className="mt-4">
                    <span className="font-medium text-[#5a4336]">Description:</span>
                    <p className="text-[#a67d6d] mt-1">{service.description}</p>
                  </div>
                )}
              </div>
            )}

            {/* Shop Information */}
            {seller && (
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-[#5a4336] mb-3 flex items-center">
                  <AiOutlineShop className="mr-2" size={20} />
                  Shop Information
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="font-medium text-[#5a4336]">Shop Name:</span>
                    <p className="text-[#a67d6d] mt-1">{seller.name}</p>
                  </div>
                  
                  {seller.email && (
                    <div className="flex items-center">
                      <AiOutlineMail className="mr-1 text-[#5a4336]" size={16} />
                      <span className="font-medium text-[#5a4336]">Email:</span>
                      <span className="ml-2 text-[#a67d6d]">{seller.email}</span>
                    </div>
                  )}
                  
                  {seller.phoneNumber && (
                    <div className="flex items-center">
                      <AiOutlinePhone className="mr-1 text-[#5a4336]" size={16} />
                      <span className="font-medium text-[#5a4336]">Phone:</span>
                      <span className="ml-2 text-[#a67d6d]">{seller.phoneNumber}</span>
                    </div>
                  )}
                  
                  {seller.address && (
                    <div className="flex items-start">
                      <AiOutlineEnvironment className="mr-1 text-[#5a4336] mt-0.5" size={16} />
                      <span className="font-medium text-[#5a4336]">Address:</span>
                      <span className="ml-2 text-[#a67d6d]">{seller.address}</span>
                    </div>
                  )}
                </div>
                
                {seller.description && (
                  <div className="mt-4">
                    <span className="font-medium text-[#5a4336]">About Shop:</span>
                    <p className="text-[#a67d6d] mt-1">{seller.description}</p>
                  </div>
                )}
              </div>
            )}

            {/* Notes */}
            {selectedBooking.notes && (
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-[#5a4336] mb-3">Notes</h4>
                <p className="text-[#a67d6d]">{selectedBooking.notes}</p>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex space-x-4">
              {/* Cancel button for pending bookings */}
              {selectedBooking.status === 'pending' && (
                <button
                  onClick={() => {
                    closeModal();
                    handleCancelBooking(selectedBooking._id);
                  }}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200 flex items-center justify-center"
                  disabled={cancellingId === selectedBooking._id}
                >
                  {cancellingId === selectedBooking._id ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <AiOutlineClose className="mr-2" size={18} />
                      Cancel Booking
                    </>
                  )}
                </button>
              )}

              {/* Complete button for confirmed bookings */}
              {selectedBooking.status === 'confirmed' && (
                <button
                  onClick={() => {
                    closeModal();
                    handleCompleteBooking(selectedBooking._id);
                  }}
                  className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200 flex items-center justify-center"
                  disabled={completingId === selectedBooking._id}
                >
                  {completingId === selectedBooking._id ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <AiOutlineCheck className="mr-2" size={18} />
                      Mark as Complete
                    </>
                  )}
                </button>
              )}

              {/* Close button */}
              <button
                onClick={closeModal}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors duration-200"
              >
                Close
              </button>
            </div>
          </div>
       </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f8f4f1] flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f8f4f1] flex items-center justify-center">
        <div className="text-center">
          <AiOutlineWarning className="mx-auto text-red-500 mb-4" size={48} />
          <h2 className="text-xl font-semibold text-[#5a4336] mb-2">Error Loading Bookings</h2>
          <p className="text-[#a67d6d]">{error}</p>
          <button
            onClick={() => dispatch(getUserBookings(user._id))}
            className="mt-4 px-6 py-2 bg-[#5a4336] text-white rounded-lg hover:bg-[#4a3429] transition-colors duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f4f1] py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#5a4336] mb-2">My Bookings</h1>
          <p className="text-[#a67d6d]">Manage and track your service bookings</p>
        </div>

        {/* Bookings List */}
        {!bookings || bookings.length === 0 ? (
          <div className="text-center py-12">
            <AiOutlineCalendar className="mx-auto text-[#a67d6d] mb-4" size={64} />
            <h2 className="text-xl font-semibold text-[#5a4336] mb-2">No Bookings Found</h2>
            <p className="text-[#a67d6d]">You haven't made any bookings yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bookings.map((booking) => {
              const service = getServiceData(booking);
              const seller = getSellerData(booking);

              return (
                <div
                  key={booking._id}
                  className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden"
                >
                  {/* Card Header */}
                  <div className="p-6 border-b border-gray-100">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-lg font-semibold text-[#5a4336] truncate flex-1 mr-2">
                        {service?.name || 'Service'}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getStatusBadgeColor(booking.status)}`}>
                        {booking.status}
                      </span>
                    </div>

                    {seller?.name && (
                      <div className="flex items-center text-[#a67d6d] mb-2">
                        <AiOutlineShop className="mr-2 flex-shrink-0" size={16} />
                        <span className="text-sm truncate">{seller.name}</span>
                      </div>
                    )}

                    {service?.price && (
                      <div className="flex items-center text-[#a67d6d]">
                        <AiOutlineDollarCircle className="mr-2 flex-shrink-0" size={16} />
                        <span className="text-sm font-medium">${service.price}</span>
                      </div>
                    )}
                  </div>

                  {/* Card Content */}
                  <div className="p-6">
                    {/* Schedule Preview */}
                    {booking.isRecurring && booking.recurringDetails ? (
                      <div className="mb-4">
                        <div className="flex items-center text-[#5a4336] mb-2">
                          <AiOutlineReload className="mr-2" size={16} />
                          <span className="text-sm font-medium">Recurring</span>
                        </div>
                        <div className="text-xs text-[#a67d6d] ml-6">
                          {booking.recurringDetails.days?.slice(0, 2).join(', ')}
                          {booking.recurringDetails.days?.length > 2 && ` +${booking.recurringDetails.days.length - 2} more`}
                        </div>
                      </div>
                    ) : booking.specificDates?.length > 0 ? (
                      <div className="mb-4">
                        <div className="flex items-center text-[#5a4336] mb-2">
                          <AiOutlineCalendar className="mr-2" size={16} />
                          <span className="text-sm font-medium">Specific Dates</span>
                        </div>
                        <div className="text-xs text-[#a67d6d] ml-6">
                          {formatDate(booking.specificDates[0].date)}
                          {booking.specificDates.length > 1 && ` +${booking.specificDates.length - 1} more`}
                        </div>
                      </div>
                    ) : booking.dates?.length > 0 ? (
                      <div className="mb-4">
                        <div className="flex items-center text-[#5a4336] mb-2">
                          <AiOutlineCalendar className="mr-2" size={16} />
                          <span className="text-sm font-medium">Booked Dates</span>
                        </div>
                        <div className="text-xs text-[#a67d6d] ml-6">
                          {booking.dates[0].day}
                          {booking.dates.length > 1 && ` +${booking.dates.length - 1} more`}
                        </div>
                      </div>
                    ) : null}

                    {/* Booking Date */}
                    <div className="flex items-center text-[#a67d6d] text-xs mb-4">
                      <AiFillClockCircle className="mr-2" size={14} />
                      <span>Booked on {new Date(booking.createdAt).toLocaleDateString()}</span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openBookingModal(booking)}
                        className="flex-1 px-3 py-2 bg-[#c8a4a5] text-white rounded-lg hover:bg-[#b89495] transition-colors duration-200  flex items-center justify-center text-sm"
                      >
                        <AiOutlineEye className="mr-1" size={16} />
                        View Details
                      </button>

                      {/* Cancel button for pending bookings */}
                      {booking.status === 'pending' && (
                        <button
                          onClick={() => handleCancelBooking(booking._id)}
                          className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200 flex items-center justify-center text-sm"
                          disabled={cancellingId === booking._id}
                        >
                          {cancellingId === booking._id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          ) : (
                            <AiOutlineClose size={16} />
                          )}
                        </button>
                      )}

                      {/* Complete button for confirmed bookings */}
                      {booking.status === 'confirmed' && (
                        <button
                          onClick={() => handleCompleteBooking(booking._id)}
                          className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200 flex items-center justify-center text-sm"
                          disabled={completingId === booking._id}
                        >
                          {completingId === booking._id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          ) : (
                            <AiOutlineCheck size={16} />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modals */}
        <BookingModal />
        <ConfirmationModal />
        <CompleteBookingModal />
      </div>
    </div>
  );
};

export default UserBookingsPage;