import axios from "axios";
import { server } from "../../server";

// Create Bulk Order
export const createBulkOrder = (newForm) => async (dispatch) => {
  try {
    dispatch({ type: "bulkOrderCreateRequest" });

    const config = { headers: { "Content-Type": "multipart/form-data" } };

    const { data } = await axios.post(`${server}/bulk-order/create`, newForm, config);

    dispatch({
      type: "bulkOrderCreateSuccess",
      payload: data.bulkOrder,
      rfqs: data.rfqs || [],
    });
  } catch (error) {
    dispatch({
      type: "bulkOrderCreateFail",
      payload: error.response.data.message,
    });
  }
};

// Get All Bulk Orders
export const getAllBulkOrders = () => async (dispatch) => {
  try {
    dispatch({ type: "getAllBulkOrdersRequest" });

    const { data } = await axios.get(`${server}/bulk-order/get-all`);

    dispatch({
      type: "getAllBulkOrdersSuccess",
      payload: data.bulkOrders,
    });
  } catch (error) {
    dispatch({
      type: "getAllBulkOrdersFailed",
      payload: error.response.data.message,
    });
  }
};

// Delete Bulk Order
export const deleteBulkOrder = (id) => async (dispatch) => {
  try {
    dispatch({ type: "deleteBulkOrderRequest" });

    const { data } = await axios.delete(`${server}/bulk-order/delete/${id}`);

    dispatch({
      type: "deleteBulkOrderSuccess",
      payload: { id, message: data.message },
    });
  } catch (error) {
    dispatch({
      type: "deleteBulkOrderFailed",
      payload: error.response.data.message,
    });
  }
};


// Get Bulk Orders for a Specific Shop
export const getBulkOrdersForShop = (shopId) => async (dispatch) => {
  try {
    dispatch({ type: "getBulkOrdersForShopRequest" });

    const { data } = await axios.get(`${server}/bulk-order/get-orders/${shopId}`);

    dispatch({
      type: "getBulkOrdersForShopSuccess",
      payload: data.bulkOrders,
      
    });
    
  } catch (error) {
    dispatch({
      type: "getBulkOrdersForShopFail",
      payload: error.response.data.message,
    });
  }
};
// Submit Offer for RFQ
export const submitOffer = (rfqId, offerData) => async (dispatch) => {
  try {
    dispatch({ type: "submitOfferRequest" });

    
    const { data } = await axios.post(`${server}/bulk-order/submit-offer/${rfqId}`, offerData);
    console.log("Response from server:", data);
    dispatch({
      type: "submitOfferSuccess",
      payload: data.rfq,
      
    });
  } catch (error) {
   // Check if the error response exists and log it safely
   if (error.response && error.response.data) {
    console.log("Error in submitting offer:", error.response.data.message); 
    dispatch({
      type: "submitOfferFail",
      payload: error.response.data.message,
    });
  } else {
    console.log("Error in submitting offer:", error.message);
    dispatch({
      type: "submitOfferFail",
      payload: error.message || "An error occurred during offer submission.",
    });
  }
  }
};
// Get Bulk Orders for a User
export const getUserBulkOrders = (userId) => async (dispatch) => {
  try {
    dispatch({ type: "getUserBulkOrdersRequest" });

    const { data } = await axios.get(`${server}/bulk-order/user-orders/${userId}`);

    dispatch({
      type: "getUserBulkOrdersSuccess",
      payload: data.bulkOrders,
    });
  } catch (error) {
    dispatch({
      type: "getUserBulkOrdersFail",
      payload: error.response.data.message,
    });
  }
};

// Get Offers for a Specific Bulk Order
export const getBulkOrderOffers = (bulkOrderId) => async (dispatch) => {
  try {
    dispatch({ type: "getBulkOrderOffersRequest" });

    const { data } = await axios.get(`${server}/bulk-order/offers/${bulkOrderId}`);

    dispatch({
      type: "getBulkOrderOffersSuccess",
      payload: data.offers ,
    });
  } catch (error) {
    dispatch({
      type: "getBulkOrderOffersFail",
      payload: error.response.data.message || "Failed to fetch offers",
    });
  }
};
// Get details of a specific offer
export const getOfferDetails = (rfqId) => async (dispatch) => {
  try {
    dispatch({ type: "getOfferDetailsRequest" });

    const { data } = await axios.get(`${server}/bulk-order/offer-details/${rfqId}`);

    dispatch({
      type: "getOfferDetailsSuccess",
      payload: data.offer,
    });
  } catch (error) {
    dispatch({
      type: "getOfferDetailsFail",
      payload: error.response.data.message || "Failed to fetch offer details",
    });
  }
};
// Accept an Offer
export const acceptOffer = (rfqId) => async (dispatch) => {
  try {
    dispatch({ type: "acceptOfferRequest" });

    const { data } = await axios.post(`${server}/bulk-order/accept-offer/${rfqId}`);

    dispatch({
      type: "acceptOfferSuccess",
      payload: data.rfq,
    });
  } catch (error) {
    dispatch({
      type: "acceptOfferFail",
      payload: error.response.data.message,
    });
  }
};


// Confirm Bulk Order Payment
export const confirmBulkOrderPayment = (rfqId, paymentInfo) => async (dispatch) => {
  try {
    dispatch({ type: "bulkOrderPaymentRequest" });

    const { data } = await axios.post(`${server}/bulk-order/confirm-payment/${rfqId}`, {
      paymentInfo,
    });

    dispatch({
      type: "bulkOrderPaymentSuccess",
      payload: data,
    });
  } catch (error) {
    dispatch({
      type: "bulkOrderPaymentFail",
      payload: error.response?.data?.message || "An error occurred",
    });
  }
};

// Get User Processing Bulk Orders
export const getUserProcessingOrders = (userId) => async (dispatch) => {
  try {
    dispatch({ type: "getUserProcessingOrdersRequest" });

    const { data } = await axios.get(`${server}/bulk-order/user-processing-orders/${userId}`);

    dispatch({
      type: "getUserProcessingOrdersSuccess",
      payload: data.processingOrders,
    });
  } catch (error) {
    dispatch({
      type: "getUserProcessingOrdersFail",
      payload: error.response.data.message,
    });
  }
};
// Fetch Accepted Bulk Orders for a Specific Shop
export const getAcceptedBulkOrdersForShop = (shopId) => async (dispatch) => {
  try {
    dispatch({ type: "getAcceptedBulkOrdersForShopRequest" });

    const { data } = await axios.get(`${server}/bulk-order/get-accepted-orders/${shopId}`);

    dispatch({
      type: "getAcceptedBulkOrdersForShopSuccess",
      payload: data.acceptedBulkOrders,
    });
  } catch (error) {
    dispatch({
      type: "getAcceptedBulkOrdersForShopFail",
      payload: error.response.data.message,
    });
  }
};

// Action to update bulk order status
export const updateOrderStatus = (orderId, status) => async (dispatch) => {
  try {
    dispatch({ type: "updateBulkOrderStatusRequest" });

    const { data } = await axios.put(`${server}/bulk-order/update-order-status/${orderId}`, {
      status,
    });

    dispatch({
      type: "updateBulkOrderStatusSuccess",
      payload: data.bulkOrder,
    });
  } catch (error) {
    dispatch({
      type: "updateBulkOrderStatusFail",
      payload: error.response?.data?.message || "An error occurred",
    });
  }
};

// Update Offer
export const updateOffer = (rfqId, offerData) => async (dispatch) => {
  try {
    dispatch({ type: "updateOfferRequest" });

    const { data } = await axios.put(`${server}/bulk-order/update-offer/${rfqId}`, offerData);

    dispatch({
      type: "updateOfferSuccess",
      payload: data.rfq,
    });
  } catch (error) {
    dispatch({
      type: "updateOfferFail",
      payload: error.response.data.message,
    });
  }
};

// Delete Offer
export const deleteOffer = (rfqId) => async (dispatch) => {
  try {
    dispatch({ type: "deleteOfferRequest" });

    const { data } = await axios.delete(`${server}/bulk-order/delete-offer/${rfqId}`);

    dispatch({
      type: "deleteOfferSuccess",
      payload: rfqId,
    });
  } catch (error) {
    dispatch({
      type: "deleteOfferFail",
      payload: error.response.data.message,
    });
  }
};

