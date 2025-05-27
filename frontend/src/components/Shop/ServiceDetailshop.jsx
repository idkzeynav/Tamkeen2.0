import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Calendar, Clock, MapPin, Phone, Star, Check, AlertCircle } from 'lucide-react';
import ServiceCalendar from './ServiceCalender';
import DashboardSideBar from './Layout/DashboardSideBar';
import DashboardHeader from './Layout/DashboardHeader';

const ServiceDetailShopPage = () => {
  const { id } = useParams();
  const { services } = useSelector((state) => state.services);
  const [viewMode, setViewMode] = useState('list');

  const service = services.find((service) => service._id === id);

  // Function to format description with bullet points for new lines
  const formatDescription = (description) => {
    if (!description) return [];
    
    // Split by new lines and filter out empty lines
    const lines = description.split('\n').filter(line => line.trim() !== '');
    
    // If there's only one line, return it as a paragraph
    if (lines.length <= 1) {
      return [<p key="single-line" className="text-base text-[#5a4336]">{description}</p>];
    }
    
    // Otherwise, format as bullet points
    return lines.map((line, index) => (
      <div key={index} className="flex items-start mb-2">
        <div className="mt-1.5 min-w-4 h-1.5 w-1.5 rounded-full bg-[#a67d6d] mr-3"></div>
        <p className="text-base text-[#5a4336]">{line.trim()}</p>
      </div>
    ));
  };

  if (!service) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-[#d8c4b8]/20">
        <AlertCircle className="w-16 h-16 text-[#c8a4a5] mb-4" />
        <h1 className="text-xl font-bold text-[#5a4336]">Service not found!</h1>
        <p className="text-[#5a4336]/70 mt-2">The service you're looking for doesn't exist or has been removed.</p>
      </div>
    );
  }

  return (
    <div className="bg-[#f9f5f1]">
      {/* Dashboard Header */}
      <DashboardHeader />
      
      <div className="flex items-start">
        {/* Dashboard Sidebar */}
        <DashboardSideBar active={13} />
        
        {/* Main Content */}
        <div className="w-full 800px:w-[calc(100%-300px)] 800px:ml-[300px] bg-[#f9f5f1] min-h-screen py-0 mt-[2vh]">
          <div className="container mx-auto px-5 max-w-4xl">
            {/* Status Badge */}
            <div className="mb-4 flex justify-between items-center">
              <div className="flex items-center">
               
              </div>
              {service.rating && (
                <div className="flex items-center bg-[#d8c4b8]/20 px-3 py-1 rounded-full">
                  <Star className="w-4 h-4 text-[#a67d6d] fill-[#a67d6d]" />
                  <span className="ml-1 text-sm font-medium text-[#5a4336]">{service.rating.toFixed(1)}</span>
                </div>
              )}
            </div>

            {/* Header Card */}
            <div className="bg-white rounded-lg shadow-md mb-6 overflow-hidden border border-[#d8c4b8]/30">
              <div className="bg-gradient-to-r from-[#c8a4a5] to-[#a67d6d] px-6 py-5">
                <h1 className="text-2xl font-bold text-white">{service.name}</h1>
                
              </div>
              
              <div className="p-6">
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-[#5a4336] mb-3">Description</h2>
                  <div className="bg-[#f9f5f1] rounded-lg p-4 border border-[#d8c4b8]/30">
                    {formatDescription(service.description)}
                  </div>
                </div>
                
                {/* Additional info section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {service.location && (
                    <div className="flex items-start">
                      <div className="p-2 bg-[#d8c4b8]/20 rounded-lg mr-3">
                        <MapPin className="w-5 h-5 text-[#a67d6d]" />
                      </div>
                      <div>
                        <p className="text-sm text-[#5a4336]/70">Location</p>
                        <p className="text-[#5a4336] font-medium">{service.location}</p>
                      </div>
                    </div>
                  )}
                  
                  {service.contactInfo && (
                    <div className="flex items-start">
                      <div className="p-2 bg-[#d8c4b8]/20 rounded-lg mr-3">
                        <Phone className="w-5 h-5 text-[#a67d6d]" />
                      </div>
                      <div>
                        <p className="text-sm text-[#5a4336]/70">Contact</p>
                        <p className="text-[#5a4336] font-medium">{service.contactInfo}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Toggle Buttons */}
            <div className="flex justify-center space-x-4 mb-6">
              <button
                className={`flex items-center px-5 py-2.5 rounded-lg text-base transition-all duration-200 ${
                  viewMode === 'list'
                    ? 'bg-[#5a4336] text-white shadow-md'
                    : 'bg-[#d8c4b8] text-[#5a4336] hover:bg-[#c8a4a5] hover:text-white'
                }`}
                onClick={() => setViewMode('list')}
              >
                <Clock className="w-5 h-5 mr-2" />
                List View
              </button>
              <button
                className={`flex items-center px-5 py-2.5 rounded-lg text-base transition-all duration-200 ${
                  viewMode === 'calendar'
                    ? 'bg-[#5a4336] text-white shadow-md'
                    : 'bg-[#d8c4b8] text-[#5a4336] hover:bg-[#c8a4a5] hover:text-white'
                }`}
                onClick={() => setViewMode('calendar')}
              >
                <Calendar className="w-5 h-5 mr-2" />
                Calendar View
              </button>
            </div>

            {/* Availability Section */}
            <div className="bg-white rounded-lg shadow-md p-6 border border-[#d8c4b8]/30 mb-6">
              <h2 className="text-lg font-semibold text-[#5a4336] mb-4">Availability Schedule</h2>
              
              {viewMode === 'list' ? (
                <div className="space-y-3">
                  {Object.entries(service.availability).map(([day, info]) => (
                    <div 
                      key={day} 
                      className={`flex items-center justify-between rounded-lg px-4 py-3 transition-colors duration-200
                        ${info.available ? 'hover:bg-[#d8c4b8]/10' : 'bg-gray-50'}`}
                    >
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full mr-3 ${
                          info.available ? 'bg-[#a67d6d]' : 'bg-[#c8a4a5]/40'
                        }`} />
                        <span className={`text-base font-medium ${
                          info.available ? 'text-[#5a4336]' : 'text-[#c8a4a5] line-through'
                        }`}>
                          {day.charAt(0).toUpperCase() + day.slice(1)}
                        </span>
                      </div>
                      <div className="flex items-center">
                        {info.available ? (
                          <>
                            <span className="px-3 py-1.5 bg-[#d8c4b8]/20 rounded-md text-[#5a4336] border border-[#d8c4b8]/30">
                              {info.startTime}
                            </span>
                            <span className="text-[#5a4336] mx-2">to</span>
                            <span className="px-3 py-1.5 bg-[#d8c4b8]/20 rounded-md text-[#5a4336] border border-[#d8c4b8]/30">
                              {info.endTime}
                            </span>
                          </>
                        ) : (
                          <span className="text-[#c8a4a5] font-medium">Unavailable</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <ServiceCalendar availability={service.availability} />
              )}
            </div>
            
            {/* Information card at the bottom */}
            {service.shop && (
              <div className="bg-[#d8c4b8]/10 rounded-lg p-4 border border-[#d8c4b8]/30">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-[#a67d6d] rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {service.shop.name ? service.shop.name.charAt(0).toUpperCase() : 'S'}
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-[#5a4336]/70">Service provided by</p>
                    <p className="text-[#5a4336] font-medium">{service.shop?.name || "Unknown Shop"}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetailShopPage;