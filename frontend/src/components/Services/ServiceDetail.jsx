import React, { useState } from 'react';    
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from "react-router-dom";
import { AiOutlineClockCircle, AiOutlineEnvironment, AiOutlinePhone, AiOutlineCalendar, AiOutlineUnorderedList, AiOutlineShop } from "react-icons/ai";
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
  
  const [viewMode, setViewMode] = useState('list');
  const [selectedDates, setSelectedDates] = useState([]);
  const [selectedTimeRange, setSelectedTimeRange] = useState({});
  const [isModalOpen, setModalOpen] = useState(false);

  const service = services.find((service) => service._id === id);

  if (!service) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#f8f4f1] to-[#e6d8d8] flex items-center justify-center">
        <div className="p-8 bg-white rounded-2xl shadow-xl text-center">
          <h1 className="text-3xl font-bold text-[#5a4336]">Service not found!</h1>
        </div>
      </div>
    );
  }

  const handleSelectDay = (day, timeSlot) => {
    const exists = selectedDates.find((d) => d.day === day);
    if (exists) {
      setSelectedDates(selectedDates.filter((d) => d.day !== day));
      setSelectedTimeRange((prev) => ({ ...prev, [day]: undefined }));
    } else {
      setSelectedDates([...selectedDates, { day, timeSlot }]);
    }
  };

  const handleTimeChange = (day, startTime, endTime) => {
    setSelectedTimeRange({ ...selectedTimeRange, [day]: { startTime, endTime } });
  };

  const handleBookingSubmit = async () => {
    if (isAuthenticated) {
      if (selectedDates.length === 0) {
        toast.error('Please select at least one day.');
        return;
      }
      const bookingData = selectedDates.map((date) => ({
        day: date.day,
        timeSlot: selectedTimeRange[date.day] || date.timeSlot,
      }));

      try {
        await dispatch(createBooking(service._id, user._id, bookingData));
        toast.success('Booking successfully made!');
        setModalOpen(false);
        navigate('/servicess');
      } catch (error) {
        toast.error(error.response.data.message);
      }
    } else {
      toast.error('Please login to make a booking');
    }
  };

  return (
    <>
      <Header activeHeading={6} />
      <div className="min-h-screen bg-gradient-to-b from-[#f8f4f1] to-[#e6d8d8] py-12">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden max-w-5xl mx-auto">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-[#d8c4b8] to-[#c8a4a5] p-8 relative">
              <div className="max-w-3xl">
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{service.name}</h1>
                <p className="text-white/90 text-lg leading-relaxed">{service.description}</p>
              </div>
            </div>

            {/* Main Content */}
            <div className="p-8">
              {/* Service Info Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-[#f8f4f1] rounded-xl p-4 flex items-center">
                  <AiOutlineEnvironment className="text-[#5a4336] text-2xl mr-3" />
                  <div>
                    <h3 className="text-sm font-semibold text-[#5a4336]">Location</h3>
                    <p className="text-[#a67d6d]">{service.location || 'Location not specified'}</p>
                  </div>
                </div>
                <div className="bg-[#f8f4f1] rounded-xl p-4 flex items-center">
                  <AiOutlinePhone className="text-[#5a4336] text-2xl mr-3" />
                  <div>
                    <h3 className="text-sm font-semibold text-[#5a4336]">Contact</h3>
                    <p className="text-[#a67d6d]">{service.contactInfo}</p>
                  </div>
                </div>
                <div className="bg-[#f8f4f1] rounded-xl p-4 flex items-center">
                  <AiOutlineClockCircle className="text-[#5a4336] text-2xl mr-3" />
                  <div>
                    <h3 className="text-sm font-semibold text-[#5a4336]">Availability</h3>
                    <p className="text-[#a67d6d]">{Object.entries(service.availability).filter(([, info]) => info.available).length} days available</p>
                  </div>
                </div>
              </div>

              {/* Shop Info Card */}
              <div className="bg-[#f8f4f1] rounded-xl p-6 mb-8">
                <Link to={`/shop/preview/${service.shop._id}`} className="flex items-center">
                  <div className="relative">
                    <img 
                      src={`${backend_url}${service.shop.avatar}`}
                      alt="Shop Avatar" 
                      className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-lg" 
                    />
                    <div className="absolute -bottom-2 -right-2  w-4 h-4 rounded-full border-2 border-white"></div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-xl font-semibold text-[#5a4336] mb-1">{service.shop.name}</h3>
                    <p className="text-[#a67d6d]">View Shop Profile</p>
                  </div>
                </Link>
              </div>

              {/* View Toggle */}
              <div className="flex justify-center space-x-4 mb-8">
                <button
                  className={`flex items-center px-6 py-3 rounded-xl transition-all duration-300 ${
                    viewMode === 'list'
                      ? 'bg-[#5a4336] text-white shadow-lg transform scale-105'
                      : 'bg-[#f8f4f1] text-[#5a4336] hover:bg-[#e6d8d8]'
                  }`}
                  onClick={() => setViewMode('list')}
                >
                  <AiOutlineUnorderedList className="mr-2" />
                  List View
                </button>
                <button
                  className={`flex items-center px-6 py-3 rounded-xl transition-all duration-300 ${
                    viewMode === 'calendar'
                      ? 'bg-[#5a4336] text-white shadow-lg transform scale-105'
                      : 'bg-[#f8f4f1] text-[#5a4336] hover:bg-[#e6d8d8]'
                  }`}
                  onClick={() => setViewMode('calendar')}
                >
                  <AiOutlineCalendar className="mr-2" />
                  Calendar View
                </button>
              </div>

              {/* Availability Section */}
              {viewMode === 'list' ? (
                <div className="bg-[#f8f4f1] rounded-xl p-6 overflow-auto max-h-[400px] scrollbar-thin scrollbar-thumb-[#5a4336] scrollbar-track-[#e6d8d8]">
                  {Object.entries(service.availability).map(([day, info]) => (
                    <div key={day} className="bg-white rounded-lg p-4 mb-4 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <input
                            type="checkbox"
                            checked={selectedDates.some((d) => d.day === day)}
                            onChange={() => info.available && handleSelectDay(day, { startTime: info.startTime, endTime: info.endTime })}
                            disabled={!info.available}
                            className="w-5 h-5 rounded-lg text-[#5a4336] focus:ring-[#5a4336] cursor-pointer"
                          />
                          <span className={`font-semibold ${!info.available ? 'text-gray-400' : 'text-[#5a4336]'}`}>
                            {day}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4">
                          {info.available ? (
                            <>
                              <select
                                value={selectedTimeRange[day]?.startTime || ''}
                                onChange={(e) => handleTimeChange(day, e.target.value, selectedTimeRange[day]?.endTime)}
                                className="bg-[#f8f4f1] border-none rounded-lg px-3 py-2 text-[#5a4336] focus:ring-[#5a4336]"
                              >
                                <option value="" disabled>Start Time</option>
                                {generateTimeOptions(info.startTime, info.endTime).map((time) => (
                                  <option key={time} value={time}>{time}</option>
                                ))}
                              </select>
                              <span className="text-[#5a4336]">to</span>
                              <select
                                value={selectedTimeRange[day]?.endTime || ''}
                                onChange={(e) => handleTimeChange(day, selectedTimeRange[day]?.startTime, e.target.value)}
                                className="bg-[#f8f4f1] border-none rounded-lg px-3 py-2 text-[#5a4336] focus:ring-[#5a4336]"
                              >
                                <option value="" disabled>End Time</option>
                                {generateTimeOptions(info.startTime, info.endTime).map((time) => (
                                  <option key={time} value={time}>{time}</option>
                                ))}
                              </select>
                            </>
                          ) : (
                            <span className="text-red-500 font-medium">Unavailable</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-[#f8f4f1] rounded-xl p-6">
                  <ServiceCalendar availability={service.availability} />
                </div>
              )}

              {/* Book Button */}
              <div className="mt-8 text-center">
                <button
                  onClick={() => setModalOpen(true)}
                  className="bg-gradient-to-r from-[#5a4336] to-[#a67d6d] text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                >
                  Book Now
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Booking Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md m-4">
              <h2 className="text-2xl font-bold text-[#5a4336] mb-6">Confirm Your Booking</h2>
              <div className="max-h-72 overflow-auto mb-6">
                {selectedDates.map((date) => (
                  <div key={date.day} className="bg-[#f8f4f1] rounded-lg p-4 mb-3">
                    <div className="font-semibold text-[#5a4336] mb-1">{date.day}</div>
                    <div className="text-[#a67d6d]">
                      {selectedTimeRange[date.day]?.startTime || (date.timeSlot ? date.timeSlot.startTime : 'N/A')} - 
                      {selectedTimeRange[date.day]?.endTime || (date.timeSlot ? date.timeSlot.endTime : 'N/A')}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  className="px-6 py-3 rounded-xl bg-[#f8f4f1] text-[#5a4336] hover:bg-[#e6d8d8] transition-colors duration-300"
                  onClick={() => setModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-6 py-3 rounded-xl bg-[#5a4336] text-white hover:bg-[#a67d6d] transition-colors duration-300"
                  onClick={handleBookingSubmit}
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

const generateTimeOptions = (startTime, endTime) => {
  const options = [];
  const startHour = parseInt(startTime.split(':')[0]);
  const endHour = parseInt(endTime.split(':')[0]);

  for (let hour = startHour; hour <= endHour; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const time = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
      options.push(time);
    }
  }
  return options.filter((time) => time >= startTime && time <= endTime);
};

export default ServiceDetailPage;