import React from 'react';
import { Calendar } from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

const ServiceCalendar = ({ availability }) => {
  const dayOfWeekMap = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 
    'Thursday', 'Friday', 'Saturday'];

  const tileContent = ({ date }) => {
    const dayOfWeek = dayOfWeekMap[date.getDay()];
    const availabilityEntry = availability[dayOfWeek];

    return availabilityEntry && availabilityEntry.available ? (
      <div className="flex flex-col items-center">
        <div className="text-emerald-600 text-xs font-medium">
          {formatTimeDisplay(availabilityEntry.startTime)}
        </div>
        <div className="text-emerald-600 text-xs font-medium">
          {formatTimeDisplay(availabilityEntry.endTime)}
        </div>
      </div>
    ) : (
      <div className="text-rose-500 text-xs font-medium">
        Closed
      </div>
    );
  };

  // Helper function to simplify time display
  const formatTimeDisplay = (time) => {
    // Convert "14:00" to "2p" and "09:30" to "9:30a" for more compact display
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'p' : 'a';
    const displayHour = hour % 12 || 12;
    
    // Only show minutes if they're not zero
    return minutes === '00' 
      ? `${displayHour}${ampm}` 
      : `${displayHour}:${minutes}${ampm}`;
  };

  return (
    <div className="w-full mx-auto bg-[#faf5f1] rounded-2xl shadow-md">
      <h2 className="text-lg font-semibold py-2 text-center text-[#5a4336]">
        Service Availability
      </h2>
      <div className="flex justify-center">
        <Calendar
          tileContent={tileContent}
          className="compact-calendar"
          tileClassName={({ date }) => {
            const dayOfWeek = dayOfWeekMap[date.getDay()];
            const isAvailable = availability[dayOfWeek]?.available;
            return `calendar-tile ${isAvailable ? 'available-tile' : 'unavailable-tile'}`;
          }}
          view="month"
          prevLabel="←"
          nextLabel="→"
          minDetail="month"
          calendarType="US"
        />
      </div>
      <style jsx global>{`
        .compact-calendar {
          width: 100%;
          max-width: 100%;
          background: white;
          border: none;
          border-radius: 1rem;
          padding: 0.75rem;
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
          font-family: inherit;
        }

        .compact-calendar .react-calendar__navigation {
          margin-bottom: 0.5rem;
        }

        .compact-calendar .react-calendar__navigation button {
          color: #5a4336;
          font-size: 1rem;
          font-weight: 600;
          padding: 0.5rem;
          background: none;
          border-radius: 0.5rem;
          transition: all 0.2s;
        }

        .compact-calendar .react-calendar__month-view__weekdays {
          color: #a67d6d;
          font-weight: 600;
          font-size: 0.75rem;
          margin-bottom: 0.25rem;
        }

        .compact-calendar .react-calendar__tile {
          max-width: none !important;
          font-size: 0.75rem;
          color: #5a4336;
          border-radius: 0.5rem;
          transition: all 0.2s;
          padding: 0.25rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 3rem;
        }

        .available-tile {
          background-color: #f0f9f0;
        }

        .unavailable-tile {
          background-color: #fff1f1;
        }

        .compact-calendar .react-calendar__month-view__days {
          display: grid !important;
          grid-template-columns: repeat(7, 1fr);
          gap: 0.25rem;
        }

        @media (min-width: 768px) {
          .compact-calendar .react-calendar__tile {
            font-size: 0.875rem;
            padding: 0.5rem;
            height: 4rem;
          }
        }
      `}</style>
    </div>
  );
};

export default ServiceCalendar;