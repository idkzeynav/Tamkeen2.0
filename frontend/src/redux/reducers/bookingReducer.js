import { createReducer } from "@reduxjs/toolkit";

const initialState = {
  isLoading: true,
  bookings: [],
  error: null,
  success: false,
};

export const bookingReducer = createReducer(initialState, {
  // Create Booking
  createBookingRequest: (state) => {
    state.isLoading = true;
  },
  createBookingSuccess: (state, action) => {
    state.isLoading = false;
    state.bookings.push(action.payload); // Add new booking to the array
    state.success = true;
  },
  createBookingFail: (state, action) => {
    state.isLoading = false;
    state.error = action.payload;
    state.success = false;
  },

  // Get all bookings for a seller
  getAllBookingsRequest: (state) => {
    state.isLoading = true;
  },
  getAllBookingsSuccess: (state, action) => {
    state.isLoading = false;
    state.bookings = action.payload; // Set bookings for the seller
  },
  getAllBookingsFail: (state, action) => {
    state.isLoading = false;
    state.error = action.payload;
  },

  clearErrors: (state) => {
    state.error = null;
  },
  getUserBookingsRequest: (state) => {
    state.isLoading = true;
  },
  getUserBookingsSuccess: (state, action) => {
    state.isLoading = false;
    state.bookings = action.payload; // Set bookings for the user
  },
  getUserBookingsFail: (state, action) => {
    state.isLoading = false;
    state.error = action.payload;
  },
  confirmBookingRequest: (state) => {
    state.isLoading = true;
  },
  confirmBookingSuccess: (state, action) => {
    state.isLoading = false;
    state.bookings = state.bookings.map((booking) =>
      booking._id === action.payload._id ? action.payload : booking
    );
  },
  confirmBookingFail: (state, action) => {
    state.isLoading = false;
    state.error = action.payload;
  },
  // Add to your bookingReducer
rejectBookingRequest: (state) => {
  state.isLoading = true;
},
rejectBookingSuccess: (state, action) => {
  state.isLoading = false;
  state.bookings = state.bookings.map((booking) =>
    booking._id === action.payload._id ? action.payload : booking
  );
},
rejectBookingFail: (state, action) => {
  state.isLoading = false;
  state.error = action.payload;
},

// Add to your bookingReducer
cancelBookingRequest: (state) => {
  state.isLoading = true;
},
cancelBookingSuccess: (state, action) => {
  state.isLoading = false;
  state.bookings = state.bookings.map((booking) =>
    booking._id === action.payload._id ? action.payload : booking
  );
},
cancelBookingFail: (state, action) => {
  state.isLoading = false;
  state.error = action.payload;
},
  // NEW: Complete booking
  completeBookingRequest: (state) => {
    state.isLoading = true;
  },
  completeBookingSuccess: (state, action) => {
    state.isLoading = false;
    state.bookings = state.bookings.map((booking) =>
      booking._id === action.payload._id ? action.payload : booking
    );
  },
  completeBookingFail: (state, action) => {
    state.isLoading = false;
    state.error = action.payload;
  },
});
