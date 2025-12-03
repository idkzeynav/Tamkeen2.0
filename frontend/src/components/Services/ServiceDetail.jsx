import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from "react-router-dom";
import { 
  AiOutlineClockCircle, AiOutlineEnvironment, AiOutlinePhone, 
  AiOutlineCalendar, AiOutlineUnorderedList, AiOutlineShop, 
  AiOutlineCheckCircle, AiOutlineReload, AiOutlineInfoCircle,
  AiOutlineUp, AiOutlineDown
} from "react-icons/ai";
import Header from '../Layout/Header';
import Footer from '../Layout/Footer';
import ServiceCalendar from '../Shop/ServiceCalender';
import { toast } from 'react-toastify';
import { createBooking } from '../../redux/actions/booking';
import { backend_url } from "../../server";

const ServiceDetailPage = () => {
  const { id } = useParams();
  const { services } = useSelector((state) => state.services);
  const { user, isAuthenticated } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // UI states
  const [viewMode, setViewMode] = useState('availability');
  const [bookingType, setBookingType] = useState('specific');
  const [isModalOpen, setModalOpen] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  
  // Specific date booking states
  const [specificDates, setSpecificDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  
  // Recurring booking states
  const [recurringDetails, setRecurringDetails] = useState({
    days: [],
    startDate: '',
    weekCount: 4,
    timeSlots: {}
  });

  // Backward compatibility states
  const [selectedDates, setSelectedDates] = useState([]);
  const [selectedTimeRange, setSelectedTimeRange] = useState({});

  const service = services.find((service) => service._id === id);

  useEffect(() => {
    // When a date is selected, update available time slots based on service availability
    if (selectedDate) {
      const date = new Date(selectedDate);
      const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
      
      if (service?.availability[dayOfWeek]?.available) {
        const slots = generateTimeOptions(
          service.availability[dayOfWeek].startTime,
          service.availability[dayOfWeek].endTime
        );
        setAvailableTimeSlots(slots);
      } else {
        setAvailableTimeSlots([]);
      }
    }
  }, [selectedDate, service]);

  if (!service) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#f8f4f1] to-[#e6d8d8] flex items-center justify-center p-4">
        <div className="p-6 bg-white rounded-xl shadow-lg">
          <h1 className="text-2xl font-bold text-[#5a4336]">Service not found!</h1>
        </div>
      </div>
    );
  }

  // Check if a specific date is available based on service availability
  const isDateAvailable = (date) => {
    const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
    return service.availability[dayOfWeek]?.available;
  };

  const handleDateChange = (e) => {
    const newDate = e.target.value;
    const selectedDateObj = new Date(newDate);
    
    // Validate if selected date is available
    if (isDateAvailable(selectedDateObj)) {
      setSelectedDate(newDate);
    } else {
      toast.error('This date is not available for booking');
    }
  };

  const handleSpecificDateAdd = () => {
    const startTimeInput = document.getElementById('specific-start-time');
    const endTimeInput = document.getElementById('specific-end-time');
    
    if (!selectedDate || !startTimeInput.value || !endTimeInput.value) {
      toast.error('Please select date and time');
      return;
    }
    
    const selectedDateObj = new Date(selectedDate);
    const dayOfWeek = selectedDateObj.toLocaleDateString('en-US', { weekday: 'long' });
    
    if (!service.availability[dayOfWeek] || !service.availability[dayOfWeek].available) {
      toast.error(`${dayOfWeek} is not available`);
      return;
    }
    
    // Convert times to minutes for validation
    const startMinutes = timeToMinutes(startTimeInput.value);
    let endMinutes = timeToMinutes(endTimeInput.value);
    const availableStart = service.availability[dayOfWeek].startTime;
    const availableEnd = service.availability[dayOfWeek].endTime;
    const availableStartMinutes = timeToMinutes(availableStart);
    let availableEndMinutes = timeToMinutes(availableEnd);

    // Handle midnight crossover for availability end time
    if (availableEnd === '00:00') availableEndMinutes = 1440; // 24*60
    if (endTimeInput.value === '00:00') endMinutes = 1440;

    // Validate against availability
    if (startMinutes < availableStartMinutes || endMinutes > availableEndMinutes) {
      toast.error(`Time must be between ${formatTimeToAMPM(availableStart)} and ${formatTimeToAMPM(availableEnd)}`);
      return;
    }

    // Validate time order (allow midnight crossover)
    if (endMinutes <= startMinutes && endMinutes !== 1440) {
      toast.error('End time must be after start time');
      return;
    }
    
    const exists = specificDates.some(d => 
      d.date === selectedDate && 
      d.startTime === startTimeInput.value && 
      d.endTime === endTimeInput.value
    );
    
    if (exists) {
      toast.error('This date and time is already selected');
      return;
    }
    
    setSpecificDates([
      ...specificDates,
      {
        date: selectedDate,
        startTime: startTimeInput.value,
        endTime: endTimeInput.value
      }
    ]);
    
    startTimeInput.value = '';
    endTimeInput.value = '';
  };

  const handleSpecificDateRemove = (index) => {
    setSpecificDates(specificDates.filter((_, i) => i !== index));
  };
  
  const handleRecurringDayToggle = (day) => {
    if (recurringDetails.days.includes(day)) {
      setRecurringDetails({
        ...recurringDetails,
        days: recurringDetails.days.filter(d => d !== day),
        timeSlots: {
          ...recurringDetails.timeSlots,
          [day]: undefined
        }
      });
    } else {
      // Set the actual service availability time as default
      const defaultStartTime = service.availability[day]?.startTime;
      const defaultEndTime = service.availability[day]?.endTime;
      
      setRecurringDetails({
        ...recurringDetails,
        days: [...recurringDetails.days, day],
        timeSlots: {
          ...recurringDetails.timeSlots,
          [day]: { startTime: defaultStartTime, endTime: defaultEndTime }
        }
      });
    }
  };
  
  const handleRecurringTimeChange = (day, field, value) => {
    setRecurringDetails({
      ...recurringDetails,
      timeSlots: {
        ...recurringDetails.timeSlots,
        [day]: {
          ...recurringDetails.timeSlots[day],
          [field]: value
        }
      }
    });
  };

  const handleWeekCountChange = (e) => {
    const value = e.target.value;
    // Only allow numerical values
    if (/^\d*$/.test(value)) {
      setRecurringDetails({
        ...recurringDetails,
        weekCount: value === '' ? '' : parseInt(value)
      });
    }
  };
  
  const handleBookingSubmit = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to make a booking');
      return;
    }
    
    try {
      let bookingData = {};
      
      if (bookingType === 'specific') {
        if (specificDates.length === 0) {
          toast.error('Please select at least one date');
          return;
        }
        
        bookingData = {
          specificDates: specificDates.map(date => ({
            date: new Date(date.date).toISOString(),
            startTime: date.startTime,
            endTime: date.endTime
          }))
        };
      } else {
        if (recurringDetails.days.length === 0) {
          toast.error('Please select at least one day');
          return;
        }
        
        if (!recurringDetails.startDate) {
          toast.error('Please select a start date');
          return;
        }

        // Validate weekCount is a valid number
        if (!recurringDetails.weekCount || recurringDetails.weekCount <= 0) {
          toast.error('Please enter a valid number of weeks');
          return;
        }
        
        const formattedTimeSlots = {};
        recurringDetails.days.forEach(day => {
          if (recurringDetails.timeSlots[day]) {
            formattedTimeSlots[day] = {
              startTime: recurringDetails.timeSlots[day].startTime,
              endTime: recurringDetails.timeSlots[day].endTime
            };
          }
        });
        
        bookingData = {
          isRecurring: true,
          recurringDetails: {
            days: recurringDetails.days,
            startDate: new Date(recurringDetails.startDate).toISOString(),
            weekCount: parseInt(recurringDetails.weekCount),
            timeSlots: formattedTimeSlots
          }
        };
      }
      
      await dispatch(createBooking(service._id, user._id, bookingData));
      toast.success('Booking successfully made!');
      setModalOpen(false);
      navigate('/servicess');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'An error occurred');
    }
  };

  // Get minimum date (today)
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Format available days for display
  const getAvailableDays = () => {
    return Object.entries(service.availability)
      .filter(([, info]) => info.available)
      .map(([day]) => day);
  };

  // Function to disable unavailable dates in date pickers
  const disableUnavailableDates = (date) => {
    const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
    return !service.availability[dayOfWeek]?.available;
  };

  // Split description by newline to handle bullet points properly
  const descriptionPoints = service.description.split('\n');
  const shortDescription = descriptionPoints.length > 3 
    ? descriptionPoints.slice(0, 2) 
    : descriptionPoints;

  return (
    <>
      <Header activeHeading={5} />
      <div className="bg-gradient-to-b from-[#f8f4f1] to-[#e6d8d8] min-h-screen py-8">
        <div className="container mx-auto px-4">
          {/* Main Content Wrapper */}
          <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Service Header */}
            <div className="bg-gradient-to-r from-[#d8c4b8] to-[#c8a4a5] p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-white mb-4">{service.name}</h1>
                  
                  <div className="flex flex-wrap gap-4 mb-6">
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2 flex items-center">
                      <AiOutlineEnvironment className="text-white mr-2 text-lg" />
                      <span className="text-white text-sm">{service.location || 'Location not specified'}</span>
                    </div>
                    
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2 flex items-center">
                      <AiOutlinePhone className="text-white mr-2 text-lg" />
                      <span className="text-white text-sm">{service.contactInfo}</span>
                    </div>
                    
                    <Link to={`/shop/preview/${service.shop._id}`} className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2 flex items-center">
                      <AiOutlineShop className="text-white mr-2 text-lg" />
                      <span className="text-white text-sm">{service.shop.name}</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Prominent Service Description Section */}
            <div className="bg-white border-b border-gray-200">
              <div className="max-w-6xl mx-auto px-6 py-8">
                <div className="flex items-center mb-4">
                  <AiOutlineInfoCircle className="text-[#5a4336] mr-3 text-2xl" />
                  <h2 className="text-2xl font-bold text-[#5a4336]">Service Description</h2>
                </div>
                
                <div className="bg-gradient-to-r from-[#f8f4f1] to-[#f0e6e6] rounded-xl p-6 shadow-sm">
                  {showFullDescription ? (
                    <div className="space-y-3">
                      {descriptionPoints.map((point, index) => {
                        // Check if this line looks like a heading (all caps, short, etc.)
                        const isHeading = point.length < 50 && (
                          point === point.toUpperCase() || 
                          point.includes(':') || 
                          point.startsWith('*') ||
                          !point.includes(' ')
                        );
                        
                        return (
                          <div key={index} className={isHeading ? "mb-4 mt-6 first:mt-0" : "mb-2"}>
                            {isHeading ? (
                              <h3 className="text-lg font-bold text-[#5a4336] border-b-2 border-[#d8c4b8] pb-2 mb-3">
                                {point.replace(/[*:]/g, '').trim()}
                              </h3>
                            ) : (
                              <div className="flex items-start">
                                <span className="text-[#a67d6d] mr-3 mt-1 text-lg">•</span>
                                <p className="text-[#5a4336] text-base leading-relaxed font-medium">
                                  {point.trim()}
                                </p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                      <button 
                        onClick={() => setShowFullDescription(false)}
                        className="mt-6 bg-[#a67d6d] hover:bg-[#5a4336] text-white px-4 py-2 rounded-lg text-sm font-medium transition duration-300 flex items-center"
                      >
                        Show Less <AiOutlineUp className="ml-2" />
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {shortDescription.map((point, index) => {
                        const isHeading = point.length < 50 && (
                          point === point.toUpperCase() || 
                          point.includes(':') || 
                          point.startsWith('*') ||
                          !point.includes(' ')
                        );
                        
                        return (
                          <div key={index} className={isHeading ? "mb-4 mt-6 first:mt-0" : "mb-2"}>
                            {isHeading ? (
                              <h3 className="text-lg font-bold text-[#5a4336] border-b-2 border-[#d8c4b8] pb-2 mb-3">
                                {point.replace(/[*:]/g, '').trim()}
                              </h3>
                            ) : (
                              <div className="flex items-start">
                                <span className="text-[#a67d6d] mr-3 mt-1 text-lg">•</span>
                                <p className="text-[#5a4336] text-base leading-relaxed font-medium">
                                  {point.trim()}
                                </p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                      
                      {descriptionPoints.length > 3 && (
                        <div className="mt-6 pt-4 border-t border-[#e6d8d8]">
                          <button 
                            onClick={() => setShowFullDescription(true)}
                            className="bg-[#5a4336] hover:bg-[#a67d6d] text-white px-6 py-3 rounded-lg text-sm font-medium transition duration-300 flex items-center shadow-md"
                          >
                            Show Full Description ({descriptionPoints.length - 2} more sections)
                            <AiOutlineDown className="ml-2" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Two Column Layout */}
            <div className="flex flex-col md:flex-row">
              {/* Left Column - Always Visible Service Info */}
              <div className="md:w-1/3 p-6 border-r border-gray-100">
                {/* Shop Info */}
                <div className="mb-6">
                  <Link to={`/shop/preview/${service.shop._id}`} className="flex items-center mb-4">
                    <img 
                      src={`${backend_url}${service.shop.avatar}`}
                      alt="Shop" 
                      className="w-12 h-12 rounded-full object-cover border-2 border-white shadow" 
                    />
                    <div className="ml-3">
                      <h3 className="text-lg font-medium text-[#5a4336]">{service.shop.name}</h3>
                      <p className="text-xs text-[#a67d6d]">View Shop Details</p>
                    </div>
                  </Link>
                </div>
                
                {/* Availability Section */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-[#5a4336] mb-3 flex items-center">
                    <AiOutlineClockCircle className="mr-2" />
                    Available Times
                  </h3>
                  <div className="bg-[#f8f4f1] rounded-lg p-4">
                    {Object.entries(service.availability)
                      .filter(([, info]) => info.available)
                      .map(([day, info]) => (
                        <div key={day} className="flex justify-between items-center py-2 border-b border-[#e6d8d8] last:border-0">
                          <span className="font-medium text-[#5a4336]">{day}</span>
                          <span className="text-[#a67d6d]">
                            {formatTimeToAMPM(info.startTime)} - {formatTimeToAMPM(info.endTime)}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
                
                {/* Calendar Preview */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-[#5a4336] mb-3 flex items-center">
                    <AiOutlineCalendar className="mr-2" />
                    Calendar View
                  </h3>
                  <div className="bg-[#f8f4f1] rounded-lg p-2">
                    <ServiceCalendar availability={service.availability} />
                  </div>
                </div>
              </div>
              
              {/* Right Column - Booking Interface */}
              <div className="md:w-2/3 p-6">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-[#5a4336] mb-4">Book This Service</h2>
                  
                  {/* Booking Type Selection */}
                  <div className="flex mb-6">
                    <button 
                      onClick={() => setBookingType('specific')}
                      className={`flex-1 py-3 px-4 text-center rounded-l-lg ${
                        bookingType === 'specific' 
                          ? 'bg-[#5a4336] text-white font-medium' 
                          : 'bg-[#f8f4f1] text-[#5a4336]'
                      }`}
                    >
                      <AiOutlineCheckCircle className="inline-block mr-2" />
                      Specific Dates
                    </button>
                    <button 
                      onClick={() => setBookingType('recurring')}
                      className={`flex-1 py-3 px-4 text-center rounded-r-lg ${
                        bookingType === 'recurring' 
                          ? 'bg-[#5a4336] text-white font-medium' 
                          : 'bg-[#f8f4f1] text-[#5a4336]'
                      }`}
                    >
                      <AiOutlineReload className="inline-block mr-2" />
                      Recurring Schedule
                    </button>
                  </div>
                  
                  {/* Booking Forms */}
                  <div className="bg-[#f8f4f1] rounded-lg p-6">
                    {bookingType === 'specific' ? (
                      <div className="space-y-5">
                        <h3 className="text-lg font-medium text-[#5a4336] mb-3">Book Specific Dates</h3>
                        
                        {/* Date and Time Selection */}
                        <div className="bg-white rounded-lg p-4 shadow-sm">
                          <div className="mb-4">
                            <label className="block text-sm font-medium text-[#5a4336] mb-2">Select Date:</label>
                            <input 
                              type="date"
                              value={selectedDate}
                              onChange={handleDateChange}
                              min={getMinDate()}
                              className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[#a67d6d]"
                            />
                            <p className="text-xs text-[#a67d6d] mt-1">
                              Available days: {getAvailableDays().join(', ')}
                            </p>
                          </div>
                          
                          {selectedDate && (
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-[#5a4336] mb-2">Start Time:</label>
                                <select 
                                  id="specific-start-time"
                                  className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[#a67d6d]"
                                >
                                  <option value="">Select start time</option>
                                  {availableTimeSlots.map((time) => (
                                    <option key={`start-${time}`} value={time}>
                                      {formatTimeToAMPM(time)}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium text-[#5a4336] mb-2">End Time:</label>
                                <select 
                                  id="specific-end-time"
                                  className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[#a67d6d]"
                                >
                                  <option value="">Select end time</option>
                                  {availableTimeSlots.map((time) => (
                                    <option key={`end-${time}`} value={time}>
                                      {formatTimeToAMPM(time)}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          )}
                          
                          <button
                            onClick={handleSpecificDateAdd}
                            className="w-full mt-4 bg-[#a67d6d] text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-[#5a4336] transition duration-300"
                            disabled={!selectedDate}
                          >
                            Add Date
                          </button>
                        </div>
                        
                        {/* Selected Dates List */}
                        <div className="bg-white rounded-lg p-4 shadow-sm">
                          <h4 className="text-sm font-medium text-[#5a4336] mb-3">Selected Dates</h4>
                          
                          <div className="max-h-60 overflow-y-auto pr-1">
                            {specificDates.length === 0 ? (
                              <p className="text-sm text-gray-500 italic py-2">No dates selected yet</p>
                            ) : (
                              <div className="space-y-2">
                                {specificDates.map((date, index) => (
                                  <div key={index} className="bg-[#f8f4f1] rounded-md p-3 flex justify-between items-center text-sm">
                                    <div>
                                      <p className="font-medium text-[#5a4336]">
                                        {new Date(date.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                      </p>
                                      <p className="text-xs text-[#a67d6d]">{formatTimeToAMPM(date.startTime)} - {formatTimeToAMPM(date.endTime)}</p>
                                    </div>
                                    <button
                                      onClick={() => handleSpecificDateRemove(index)}
                                      className="h-6 w-6 flex items-center justify-center rounded-full bg-white/70 text-red-500 hover:bg-red-100"
                                    >
                                      ✕
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-5">
                        <h3 className="text-lg font-medium text-[#5a4336] mb-3">Set Recurring Schedule</h3>
                        
                        {/* Recurring Options */}
                        <div className="bg-white rounded-lg p-4 shadow-sm">
                          <div className="mb-4">
                            <label className="block text-sm font-medium text-[#5a4336] mb-2">Select Days:</label>
                            <div className="flex flex-wrap gap-2">
                              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                                <button
                                  key={day}
                                  onClick={() => service.availability[day]?.available && handleRecurringDayToggle(day)}
                                  disabled={!service.availability[day]?.available}
                                  className={`px-3 py-2 rounded text-sm ${
                                    recurringDetails.days.includes(day)
                                      ? 'bg-[#5a4336] text-white'
                                      : service.availability[day]?.available
                                        ? 'bg-[#f8f4f1] text-[#5a4336] hover:bg-[#e6d8d8]'
                                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                  }`}
                                  title={service.availability[day]?.available ? 
                                    `Available: ${formatTimeToAMPM(service.availability[day].startTime)} - ${formatTimeToAMPM(service.availability[day].endTime)}` : 
                                    'Not available'}
                                >
                                  {day}
                                </button>
                              ))}
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                              <label className="block text-sm font-medium text-[#5a4336] mb-2">Start Date:</label>
                              <input
                                type="date"
                                value={recurringDetails.startDate}
                                onChange={(e) => {
                                  const newDate = e.target.value;
                                  // Check if selected start date is on one of the selected days
                                  const selectedDate = new Date(newDate);
                                  const dayOfWeek = selectedDate.toLocaleDateString('en-US', { weekday: 'long' });
                                  
                                  if (service.availability[dayOfWeek]?.available) {
                                    setRecurringDetails({...recurringDetails, startDate: newDate});
                                  } else {
                                    toast.warning(`${dayOfWeek} is not available for this service.`);
                                  }
                                }}
                                min={getMinDate()}
                                className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[#a67d6d]"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-[#5a4336] mb-2">Duration (weeks):</label>
                              <input
                                type="number"
                                min="1"
                                max="52"
                                value={recurringDetails.weekCount}
                                onChange={handleWeekCountChange}
                                className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[#a67d6d]"
                              />
                            </div>
                          </div>
                        </div>
                        
                        {/* Selected Days Time Slots */}
                        {recurringDetails.days.length > 0 && (
                          <div className="bg-white rounded-lg p-4 shadow-sm">
                            <h4 className="text-sm font-medium text-[#5a4336] mb-3">Time Slots for Selected Days</h4>
                            <div className="max-h-60 overflow-y-auto space-y-3">
                              {recurringDetails.days.map((day) => (
                                <div key={day} className="bg-[#f8f4f1] rounded-md p-3">
                                  <div className="text-sm font-medium text-[#5a4336] mb-2">{day}</div>
                                  <div className="grid grid-cols-2 gap-3">
                                    <div>
                                      <label className="block text-xs text-[#a67d6d] mb-1">Start Time:</label>
                                      <select
                                        value={recurringDetails.timeSlots[day]?.startTime || ''}
                                        onChange={(e) => handleRecurringTimeChange(day, 'startTime', e.target.value)}
                                        className="w-full border border-gray-200 rounded-md px-2 py-1 text-sm focus:outline-none focus:border-[#a67d6d]"
                                      >
                                        {generateTimeOptions(
                                          service.availability[day]?.startTime,
                                          service.availability[day]?.endTime
                                        ).map((time) => (
                                          <option key={`start-${time}`} value={time}>
                                            {formatTimeToAMPM(time)}
                                          </option>
                                        ))}
                                      </select>
                                    </div>
                                    <div>
                                      <label className="block text-xs text-[#a67d6d] mb-1">End Time:</label>
                                      <select
                                        value={recurringDetails.timeSlots[day]?.endTime || ''}
                                        onChange={(e) => handleRecurringTimeChange(day, 'endTime', e.target.value)}
                                        className="w-full border border-gray-200 rounded-md px-2 py-1 text-sm focus:outline-none focus:border-[#a67d6d]"
                                      >
                                        {generateTimeOptions(
                                          service.availability[day]?.startTime,
                                          service.availability[day]?.endTime
                                        ).map((time) => (
                                          <option key={`start-${time}`} value={time}>
                                            {formatTimeToAMPM(time)}
                                          </option>
                                        ))}
                                      </select>
                                    </div>
                                    <div>
                                      <label className="block text-xs text-[#a67d6d] mb-1">End Time:</label>
                                      <select
                                        value={recurringDetails.timeSlots[day]?.endTime || ''}
                                        onChange={(e) => handleRecurringTimeChange(day, 'endTime', e.target.value)}
                                        className="w-full border border-gray-200 rounded-md px-2 py-1 text-sm focus:outline-none focus:border-[#a67d6d]"
                                      >
                                        {generateTimeOptions(
                                          service.availability[day]?.startTime,
                                          service.availability[day]?.endTime
                                        ).map((time) => (
                                          <option key={`start-${time}`} value={time}>
                                            {formatTimeToAMPM(time)}
                                          </option>
                                        ))}
                                      </select>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* Book Now Button */}
                  <div className="mt-6 text-center">
                    <button
                      onClick={() => setModalOpen(true)}
                      className="bg-gradient-to-r from-[#5a4336] to-[#a67d6d] text-white px-6 py-3 rounded-lg text-lg font-medium hover:opacity-90 transition duration-300 shadow-md"
                      disabled={
                        (bookingType === 'specific' && specificDates.length === 0) ||
                        (bookingType === 'recurring' && (recurringDetails.days.length === 0 || !recurringDetails.startDate))
                      }
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
{isModalOpen && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-lg shadow-lg p-4 w-full max-w-sm">
      <h2 className="text-lg font-bold text-[#5a4336] mb-3">Confirm Booking</h2>

      {bookingType === 'specific' ? (
        // Specific Dates Booking Details
        <div className="max-h-48 overflow-auto mb-4">
          {specificDates.length > 0 ? (
            specificDates.map((date, index) => (
              <div key={index} className="bg-[#f8f4f1] rounded p-2 mb-2 text-sm">
                <div className="font-medium text-[#5a4336]">
                  {/* Formatted Date */}
                  {new Date(date.date).toLocaleDateString('en-US', { 
                    weekday: 'short', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </div>
                <div className="text-xs text-[#a67d6d]">
                  {/* Convert times to AM/PM */}
                  {formatTimeToAMPM(date.startTime)} - {formatTimeToAMPM(date.endTime)}
                </div>
              </div>
            ))
          ) : (
            <p className="text-red-500 text-sm">Please select at least one date</p>
          )}
        </div>
      ) : (
        // Recurring Booking Details
        <div className="max-h-48 overflow-auto mb-4">
          {recurringDetails.days.length > 0 && recurringDetails.startDate ? (
            <>
              <div className="bg-[#f8f4f1] rounded p-2 mb-2 text-sm">
                <div className="font-medium text-[#5a4336]">Recurring Schedule</div>
                <div className="text-xs text-[#a67d6d]">
                  Every {recurringDetails.days.join(', ')} for {recurringDetails.weekCount} weeks
                </div>
                <div className="text-xs text-[#a67d6d]">
                  Starting {new Date(recurringDetails.startDate).toLocaleDateString()}
                </div>
              </div>

              {recurringDetails.days.map((day) => (
                <div key={day} className="bg-[#f8f4f1] rounded p-2 mb-1 text-xs">
                  <span className="font-medium text-[#5a4336]">{day}:</span>
                  <span className="text-[#a67d6d] ml-1">
                    {/* Convert times to AM/PM */}
                    {formatTimeToAMPM(recurringDetails.timeSlots[day]?.startTime)} - 
                    {formatTimeToAMPM(recurringDetails.timeSlots[day]?.endTime)}
                  </span>
                </div>
              ))}
            </>
          ) : (
            <p className="text-red-500 text-sm">Please select days and start date</p>
          )}
        </div>
      )}

      {/* Service Details Section */}
      <div className="bg-[#f8f4f1] rounded p-2 mb-4 text-sm">
        <div className="font-medium text-[#5a4336]">Service Details</div>
        <div className="text-xs text-[#a67d6d]">{service.name}</div>
        <div className="text-xs text-[#a67d6d]">{service.shop.name}</div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-2">
        <button
          onClick={() => setModalOpen(false)}
          className="flex-1 bg-white border border-gray-300 text-gray-700 px-3 py-2 rounded text-sm"
        >
          Cancel
        </button>
        <button
          onClick={handleBookingSubmit}
          className="flex-1 bg-[#5a4336] text-white px-3 py-2 rounded text-sm"
        >
          Confirm Booking
        </button>
      </div>
    </div>
  </div>
)}
      </div>
      <Footer />
    </>
  );
};
// Convert 24h time string to 12h format with AM/PM
const formatTimeToAMPM = (time24) => {
  const [hours, minutes] = time24.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const twelveHour = hours % 12 || 12;
  return `${twelveHour}:${minutes.toString().padStart(2, '0')} ${period}`;
};

// Convert 12h AM/PM time to 24h format
const convertAMPMto24 = (time12) => {
  const [time, period] = time12.split(' ');
  let [hours, minutes] = time.split(':').map(Number);
  if (period === 'PM' && hours !== 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

// Convert time string to minutes since midnight
const timeToMinutes = (time24) => {
  const [hours, minutes] = time24.split(':').map(Number);
  return hours * 60 + minutes;
};



// Updated function to handle time ranges that cross midnight
const generateTimeOptions = (startTime, endTime) => {
  const options = [];
  
  // Parse start and end hours/minutes
  const [startHourStr, startMinStr] = startTime.split(':');
  const [endHourStr, endMinStr] = endTime.split(':');
  
  let startHour = parseInt(startHourStr);
  let startMin = parseInt(startMinStr);
  let endHour = parseInt(endHourStr);
  let endMin = parseInt(endMinStr);
  
  // Check if the time range crosses midnight
  const crossesMidnight = (startHour > endHour) || 
                          (startHour === endHour && startMin > endMin);
  
  // Generate all possible time slots in 30-minute increments
  let currentHour = startHour;
  let currentMin = startMin;
  
  // Continue until we reach the end time
  // If crossing midnight, we'll do a full 24-hour cycle to ensure we capture all times
  const maxIterations = 48; // Prevent infinite loops (48 half-hours = 24 hours)
  let iterations = 0;
  
  while (iterations < maxIterations) {
    iterations++;
    
    // Format current time
    const timeStr = `${String(currentHour).padStart(2, '0')}:${String(currentMin).padStart(2, '0')}`;
    options.push(timeStr);
    
    // Check if we've reached the end time
    if (!crossesMidnight && 
        currentHour === endHour && 
        currentMin === endMin) {
      break;
    }
    
    if (crossesMidnight && 
        currentHour === endHour && 
        currentMin === endMin && 
        iterations > 1) { // Make sure we didn't just start
      break;
    }
    
    // Increment time by 30 minutes
    currentMin += 30;
    if (currentMin >= 60) {
      currentMin = 0;
      currentHour = (currentHour + 1) % 24; // Wrap around to 0 after 23
    }
  }
  
  return options;
};

export default ServiceDetailPage;