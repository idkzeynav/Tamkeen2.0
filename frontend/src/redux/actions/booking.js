import axios from "axios";
import { server } from "../../server";

// Create a booking
export const createBooking = (serviceId,userId, dates) => async (dispatch) => {
  try {
    dispatch({ type: "createBookingRequest" });

    const config = { headers: { "Content-Type": "application/json" } };

    const { data } = await axios.post(
      `${server}/book/create-booking`,
      { serviceId,userId, dates },
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

