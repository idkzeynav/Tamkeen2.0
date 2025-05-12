import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Calendar, Clock } from 'lucide-react';
import ServiceCalendar from './ServiceCalender';

const ServiceDetailShopPage = () => {
  const { id } = useParams();
  const { services } = useSelector((state) => state.services);
  const [viewMode, setViewMode] = useState('list');

  const service = services.find((service) => service._id === id);

  if (!service) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#d8c4b8]">
        <h1 className="text-2xl font-bold text-[#5a4336]">Service not found!</h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#d8c4b8]/30">
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
          <div className="bg-[#c8a4a5] px-8 py-6">
            <h1 className="text-4xl font-bold text-white">{service.name}</h1>
          </div>
          <div className="p-8">
            <p className="text-lg text-[#5a4336] leading-relaxed">{service.description}</p>
          </div>
        </div>

        {/* View Toggle Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex justify-center space-x-4">
            <button
              className={`flex items-center px-6 py-3 rounded-lg transition-all duration-200 ${
                viewMode === 'list'
                  ? 'bg-[#5a4336] text-white shadow-lg transform scale-105'
                  : 'bg-[#d8c4b8] text-[#5a4336] hover:bg-[#c8a4a5] hover:text-white'
              }`}
              onClick={() => setViewMode('list')}
            >
              <Clock className="w-5 h-5 mr-2" />
              List View
            </button>
            <button
              className={`flex items-center px-6 py-3 rounded-lg transition-all duration-200 ${
                viewMode === 'calendar'
                  ? 'bg-[#5a4336] text-white shadow-lg transform scale-105'
                  : 'bg-[#d8c4b8] text-[#5a4336] hover:bg-[#c8a4a5] hover:text-white'
              }`}
              onClick={() => setViewMode('calendar')}
            >
              <Calendar className="w-5 h-5 mr-2" />
              Calendar View
            </button>
          </div>
        </div>

        {/* Content Section */}
        {viewMode === 'list' ? (
          <div className="bg-white rounded-xl shadow-lg p-8">
            {Object.entries(service.availability).map(([day, info]) => (
              <div key={day} className="mb-6 last:mb-0">
                <div className="flex items-center justify-between p-4 rounded-lg hover:bg-[#d8c4b8]/10 transition-colors duration-200">
                  <div className="flex items-center space-x-4">
                    <div className={`w-4 h-4 rounded-full ${info.available ? 'bg-[#a67d6d]' : 'bg-[#c8a4a5]'}`} />
                    <span className={`font-medium text-lg ${
                      info.available ? 'text-[#5a4336]' : 'text-[#c8a4a5] line-through'
                    }`}>
                      {day}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    {info.available ? (
                      <>
                        <span className="px-4 py-2 bg-[#d8c4b8]/20 rounded-lg text-[#5a4336] font-medium">
                          {info.startTime}
                        </span>
                        <span className="text-[#5a4336]">to</span>
                        <span className="px-4 py-2 bg-[#d8c4b8]/20 rounded-lg text-[#5a4336] font-medium">
                          {info.endTime}
                        </span>
                      </>
                    ) : (
                      <span className="text-[#c8a4a5] font-medium">Unavailable</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <ServiceCalendar availability={service.availability} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceDetailShopPage;