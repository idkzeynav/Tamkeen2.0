import axios from "axios";
import { server } from "../../server";

// Get all wholesale markets
export const getAllWholesaleMarkets = () => async (dispatch) => {
  try {
    dispatch({
      type: "getAllWholesaleMarketsRequest",
    });

    const { data } = await axios.get(`${server}/wholesaleMarket/get-all-wholesale-markets`);

    dispatch({
      type: "getAllWholesaleMarketsSuccess",
      payload: data.wholesaleMarkets,
    });
  } catch (error) {
    dispatch({
      type: "getAllWholesaleMarketsFailed",
      payload: error.response.data.message,
    });
  }
};

// Create a new wholesale market with geocoding
export const createWholesaleMarket = (wholesaleMarketData) => async (dispatch) => {
  try {
    dispatch({
      type: "createWholesaleMarketRequest",
    });

    const { data } = await axios.post(
      `${server}/wholesaleMarket/create-wholesale-market`,
      wholesaleMarketData,
      { withCredentials: true }
    );

    dispatch({
      type: "createWholesaleMarketSuccess",
      payload: data.wholesaleMarket,
    });

    // Immediately fetch updated list
    await dispatch(getAllWholesaleMarkets());
    
    return data.wholesaleMarket;
  } catch (error) {
    dispatch({
      type: "createWholesaleMarketFailed",
      payload: error.response?.data?.message || "Creation failed",
    });
    throw error;
  }
};

// Update a wholesale market with geocoding
export const updateWholesaleMarket = (id, wholesaleMarketData) => async (dispatch) => {
  try {
    dispatch({
      type: "updateWholesaleMarketRequest",
    });

    // Get coordinates for the new location
    try {
      const geocodeResponse = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(wholesaleMarketData.location)}&key=YOUR_GOOGLE_MAPS_API_KEY`
      );

      if (geocodeResponse.data.results && geocodeResponse.data.results.length > 0) {
        wholesaleMarketData.coordinates = {
          lat: geocodeResponse.data.results[0].geometry.location.lat,
          lng: geocodeResponse.data.results[0].geometry.location.lng
        };
      }
    } catch (geocodeError) {
      console.error('Geocoding failed during update:', geocodeError);
    }

    const { data } = await axios.put(
      `${server}/wholesaleMarket/update-wholesale-market/${id}`, 
      wholesaleMarketData,
      { withCredentials: true }
    );

    dispatch({
      type: "updateWholesaleMarketSuccess",
      payload: data.wholesaleMarket,
    });
  } catch (error) {
    dispatch({
      type: "updateWholesaleMarketFailed",
      payload: error.response.data.message,
    });
  }
};

// Delete a wholesale market (unchanged)
export const deleteWholesaleMarket = (id) => async (dispatch) => {
  try {
    dispatch({
      type: "deleteWholesaleMarketRequest",
    });

    const { data } = await axios.delete(`${server}/wholesaleMarket/delete-wholesale-market/${id}`, {
      withCredentials: true,
    });

    dispatch({
      type: "deleteWholesaleMarketSuccess",
      payload: data.message,
    });
  } catch (error) {
    dispatch({
      type: "deleteWholesaleMarketFailed",
      payload: error.response.data.message,
    });
  }
};

// Clear errors (unchanged)
export const clearErrors = () => async (dispatch) => {
  dispatch({
    type: "clearErrors",
  });
};