const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Service",
    required: true,
  },
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Shop",
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  // Individual specific dates for one-time bookings
  specificDates: [
    {
      date: {
        type: Date,
        required: function() { return !this.isRecurring; }
      },
      startTime: { 
        type: String, 
        required: function() { return !this.isRecurring; }
      },
      endTime: { 
        type: String, 
        required: function() { return !this.isRecurring; }
      }
    }
  ],
  // Recurring booking details
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringDetails: {
    days: [{ 
      type: String,
      enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    }],
    startDate: { 
      type: Date
    },
    endDate: { 
      type: Date
    },
    // For weekly recurring sessions
    weekCount: {
      type: Number
    },
    // Time slots for each recurring day
    timeSlots: {
      type: Map,
      of: {
        startTime: String,
        endTime: String
      }
    }
  },
  // Keep original dates field for backward compatibility
  dates: [
    {
      day: {
        type: String
      },
      timeSlot: {
        startTime: { type: String },
        endTime: { type: String }
      },
    }
  ],
  status: {
    type: String,
    enum: ["pending", "confirmed", "canceled", "rejected","completed"],
    default: "pending",
  },
  completedAt: {
    type: Date
  },
  
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Booking", bookingSchema);