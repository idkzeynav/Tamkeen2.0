import axios from "axios";
import { server } from "../../server";

// Create a booking
export const createBooking = (serviceId, userId, bookingData) => async (dispatch) => {
  try {
    dispatch({ type: "createBookingRequest" });

    const config = { headers: { "Content-Type": "application/json" } };

    const { data } = await axios.post(
      `${server}/book/create-booking`,
      { serviceId, userId, ...bookingData },
      config
    );

    dispatch({
      type: "createBookingSuccess",
      payload: data.booking,
    });
  } catch (error) {
    dispatch({
      type: "createBookingFail",
      payload: error.response ? error.response.data.message : "Something went wrong!",
    });
  }
};

// Get all bookings for a seller
export const getAllBookingsForSeller = (sellerId) => async (dispatch) => {
  try {
    dispatch({ type: "getAllBookingsRequest" });

    const { data } = await axios.get(
      `${server}/book/seller-bookings/${sellerId}`
    );

    dispatch({
      type: "getAllBookingsSuccess",
      payload: data.bookings,
    });
  } catch (error) {
    dispatch({
      type: "getAllBookingsFail",
      payload: error.response ? error.response.data.message : "Something went wrong!",
    });
  }
};

// Get all bookings for a user
export const getUserBookings = (userId) => async (dispatch) => {
  try {
    dispatch({ type: "getUserBookingsRequest" });

    const { data } = await axios.get(
      `${server}/book/user-bookings/${userId}`
    );

    dispatch({
      type: "getUserBookingsSuccess",
      payload: data.bookings,
    });
  } catch (error) {
    dispatch({
      type: "getUserBookingsFail",
      payload: error.response ? error.response.data.message : "Something went wrong!",
    });
  }
};

// Confirm booking
export const confirmBooking = (bookingId) => async (dispatch) => {
  try {
    dispatch({ type: "confirmBookingRequest" });

    const { data } = await axios.put(`${server}/book/confirm-booking/${bookingId}`);

    dispatch({
      type: "confirmBookingSuccess",
      payload: data.booking,
    });
  } catch (error) {
    dispatch({
      type: "confirmBookingFail",
      payload: error.response.data.message,
    });
  }
};

// Reject booking
export const rejectBooking = (bookingId) => async (dispatch) => {
  try {
    dispatch({ type: "rejectBookingRequest" });

    const { data } = await axios.put(`${server}/book/reject-booking/${bookingId}`);

    dispatch({
      type: "rejectBookingSuccess",
      payload: data.booking,
    });
  } catch (error) {
    dispatch({
      type: "rejectBookingFail",
      payload: error.response.data.message,
    });
  }
};


// Add to booking.js actions file
// Cancel booking
export const cancelBooking = (bookingId) => async (dispatch) => {
  try {
    dispatch({ type: "cancelBookingRequest" });

    const { data } = await axios.put(`${server}/book/cancel-booking/${bookingId}`);

    dispatch({
      type: "cancelBookingSuccess",
      payload: data.booking,
    });
  } catch (error) {
    dispatch({
      type: "cancelBookingFail",
      payload: error.response.data.message,
    });
  }
};

// NEW ACTION: Complete booking
export const completeBooking = (bookingId, completionData) => async (dispatch) => {
  try {
    dispatch({ type: "completeBookingRequest" });

    const config = { headers: { "Content-Type": "application/json" } };

    const { data } = await axios.put(
      `${server}/book/complete-booking/${bookingId}`,
      completionData,
      config
    );

    dispatch({
      type: "completeBookingSuccess",
      payload: data.booking,
    });
  } catch (error) {
    dispatch({
      type: "completeBookingFail",
      payload: error.response ? error.response.data.message : "Something went wrong!",
    });
  }
};