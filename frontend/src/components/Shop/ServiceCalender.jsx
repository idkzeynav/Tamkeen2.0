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
      <div className="flex flex-col items-center absolute bottom-1
left-0 right-0">
        <div className="text-emerald-600 text-[10px] font-medium">
          {availabilityEntry.startTime}
        </div>
        <div className="text-emerald-600 text-[10px] font-medium">
          {availabilityEntry.endTime}
        </div>
      </div>
    ) : (
      <div className="text-rose-500 text-[10px] font-medium absolute
bottom-2 left-0 right-0">
        Closed
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-[#faf5f1] rounded-2xl shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center text-[#5a4336]">
        Service Availability
      </h2>
      <div className="flex justify-center">
        <Calendar
          tileContent={tileContent}
          className="custom-calendar"
          tileClassName={({ date }) => {
            const dayOfWeek = dayOfWeekMap[date.getDay()];
            const isAvailable = availability[dayOfWeek]?.available;
            return `calendar-tile ${isAvailable ? 'available-tile' :
'unavailable-tile'}`;
          }}
          view="month"
          prevLabel="←"
          nextLabel="→"
          minDetail="month"
          calendarType="US"
        />
      </div>
      <style jsx global>{`
        .custom-calendar {
          width: 100%;
          max-width: 700px;
          background: white;
          border: none;
          border-radius: 1rem;
          padding: 1rem;
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
          font-family: inherit;
        }

        .custom-calendar .react-calendar__navigation {
          margin-bottom: 1.5rem;
        }

        .custom-calendar .react-calendar__navigation button {
          color: #5a4336;
          font-size: 1.2rem;
          font-weight: 600;
          padding: 0.5rem;
          background: none;
          border-radius: 0.5rem;
          transition: all 0.2s;
        }

        .custom-calendar .react-calendar__navigation button:enabled:hover,
        .custom-calendar .react-calendar__navigation button:enabled:focus {
          background-color: #f3e8e3;
        }

        .custom-calendar .react-calendar__month-view__weekdays {
          color: #a67d6d;
          font-weight: 600;
          font-size: 0.9rem;
          text-transform: uppercase;
          margin-bottom: 0.5rem;
        }

        .custom-calendar .react-calendar__month-view__weekdays abbr {
          text-decoration: none;
        }

        .custom-calendar .react-calendar__tile {
          aspect-ratio: 1;
          height: 90px;
          max-width: none !important;
          font-size: 0.9rem;
          color: #5a4336;
          border-radius: 0.5rem;
          transition: all 0.2s;
          position: relative;
          padding: 0.75rem 0.5rem;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .calendar-tile {
          position: relative;
          height: 100%;
        }

        .available-tile {
          background-color: #f0f9f0;
        }

        .unavailable-tile {
          background-color: #fff1f1;
        }

        .custom-calendar .react-calendar__tile:enabled:hover,
        .custom-calendar .react-calendar__tile:enabled:focus {
          background-color: #f3e8e3;
        }

        .custom-calendar .react-calendar__tile--active {
          background-color: #f3e8e3 !important;
          color: #5a4336 !important;
          border: 2px solid #a67d6d !important;
        }

        .custom-calendar .react-calendar__tile--now {
          background-color: #f3e8e3;
          font-weight: bold;
        }

        .custom-calendar .react-calendar__month-view__days__day--weekend {
          color: #a67d6d;
        }

        .custom-calendar
.react-calendar__month-view__days__day--neighboringMonth {
          color: #d8c4b8;
        }

        /* Fix the width of the month view */
        .custom-calendar .react-calendar__month-view {
          width: 100%;
        }

        /* Ensure days row takes full width */
        .custom-calendar .react-calendar__month-view__days {
          display: grid !important;
          grid-template-columns: repeat(7, 1fr);
          gap: 0.5rem;
        }
      `}</style>
    </div>
  );
};

export default ServiceCalendar;
