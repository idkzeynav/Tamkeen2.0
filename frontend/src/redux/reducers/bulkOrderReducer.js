import { createReducer } from "@reduxjs/toolkit";

const initialState = {
  isLoading: true,
  userBulkOrders: [],
  shopBulkOrders: [], 
  rfqs:[],
  bulkOrderStatus: "",
  offers: [],
  acceptedBulkOrders: [],
  processingOrders: [], // Added explicit property
};

export const bulkOrderReducer = createReducer(initialState, {
  bulkOrderCreateRequest: (state) => {
    state.isLoading = true;
  },
  bulkOrderCreateSuccess: (state, action) => {
    state.isLoading = false;
    state.bulkOrder = action.payload;
    state.rfqs = action.payload.rfqs; // Store RFQs
    state.success = true;
    state.error = null; // Clear any previous errors
  },
  bulkOrderCreateFail: (state, action) => {
    state.isLoading = false;
    state.error = action.payload;
    state.success = false;
  },

  getAllBulkOrdersRequest: (state) => {
    state.isLoading = true;
  },
  getAllBulkOrdersSuccess: (state, action) => {
    state.isLoading = false;
    state.bulkOrders = action.payload;
    state.error = null; // Clear any previous errors
  },
  getAllBulkOrdersFailed: (state, action) => {
    state.isLoading = false;
    state.error = action.payload;
  },

  deleteBulkOrderRequest: (state) => {
    state.isLoading = true;
  },
  deleteBulkOrderSuccess: (state, action) => {
    state.isLoading = false;
    state.userBulkOrders = state.userBulkOrders.filter(
      (order) => order._id !== action.payload.id
    ); // Update user orders
    state.message = action.payload.message;
    state.error = null; // Clear any previous errors
  },
  
  deleteBulkOrderFailed: (state, action) => {
    state.isLoading = false;
    state.error = action.payload;
  },
  
  // Shop bulk orders
  getBulkOrdersForShopRequest: (state) => {
    state.isLoading = true;
  },
  getBulkOrdersForShopSuccess: (state, action) => {
    state.isLoading = false;
    state.shopBulkOrders = action.payload; // Store bulk orders for the shop
    state.error = null; // Clear any previous errors
  },
  getBulkOrdersForShopFail: (state, action) => {
    state.isLoading = false;
    state.error = action.payload;
  },
  
  // Submit offers
  submitOfferRequest: (state) => {
    state.isLoading = true;
  },
  submitOfferSuccess: (state, action) => {
    state.isLoading = false;
    console.log(action.payload); 
    state.rfqs = state.rfqs.map((rfq) =>
      rfq._id === action.payload._id ? action.payload : rfq
    ); // Update the specific RFQ with the new offer details
    state.success = true;
    state.error = null; // Clear any previous errors
  },
  submitOfferFail: (state, action) => {
    state.isLoading = false;
    state.error = action.payload;
    state.success = false;
  },

  // Clear errors action
  clearErrors: (state) => {
    state.error = null;
  },

  // User bulk orders
  getUserBulkOrdersRequest: (state) => {
    state.isLoading = true;
  },
  getUserBulkOrdersSuccess: (state, action) => {
    state.isLoading = false;
    state.userBulkOrders = action.payload; // Store user-specific bulk orders
    state.error = null; // Clear any previous errors
  },
  getUserBulkOrdersFail: (state, action) => {
    state.isLoading = false;
    state.error = action.payload;
  },
  
  // Bulk order offers
  getBulkOrderOffersRequest: (state) => {
    state.isLoading = true;
  },
  getBulkOrderOffersSuccess: (state, action) => {
    state.isLoading = false;
    state.offers = action.payload; // Store offers for the specific bulk order
    state.error = null; // Clear any previous errors
  },
  getBulkOrderOffersFail: (state, action) => {
    state.isLoading = false;
    state.error = action.payload;
  },
  
  // Offer details
  getOfferDetailsRequest: (state) => {
    state.isLoading = true;
  },
  getOfferDetailsSuccess: (state, action) => {
    state.isLoading = false;
    state.offerDetails = action.payload;
    state.success = true;
    state.error = null; // Clear any previous errors
  },
  getOfferDetailsFail: (state, action) => {
    state.isLoading = false;
    state.error = action.payload;
    state.success = false;
  },
  
  // Accept offer
  acceptOfferRequest: (state) => {
    state.isLoading = true;
  },
  acceptOfferSuccess: (state, action) => {
    state.isLoading = false;
    state.rfqs = state.rfqs.map((rfq) =>
      rfq._id === action.payload._id ? action.payload : { ...rfq, status: "Declined" }
    );
    state.success = true;
    state.error = null; // Clear any previous errors
  },
  acceptOfferFail: (state, action) => {
    state.isLoading = false;
    state.error = action.payload;
    state.success = false;
  },
  
  // Payment
  bulkOrderPaymentRequest: (state) => {
    state.isLoading = true;
  },
  bulkOrderPaymentSuccess: (state, action) => {
    state.isLoading = false;
    state.paymentDetails = action.payload; // Store payment details
    state.success = true;
    state.error = null; // Clear any previous errors
  },
  bulkOrderPaymentFail: (state, action) => {
    state.isLoading = false;
    state.error = action.payload;
    state.success = false;
  },
  
  // Processing orders
  getUserProcessingOrdersRequest: (state) => {
    state.isLoading = true;
  },
  getUserProcessingOrdersSuccess: (state, action) => {
    state.isLoading = false;
    state.processingOrders = action.payload || []; // Store processing orders with empty array fallback
    // Important: Don't set an error if we get an empty array - that's a valid result
    state.error = null; // Clear any previous errors
  },
  getUserProcessingOrdersFail: (state, action) => {
    state.isLoading = false;
    state.error = action.payload;
    // Keep the previous processing orders if there's an error
    // Don't clear processingOrders here
  },
  
  // Accepted bulk orders
  getAcceptedBulkOrdersForShopRequest: (state) => {
    state.isLoading = true;
  },
  getAcceptedBulkOrdersForShopSuccess: (state, action) => {
    state.isLoading = false;
    state.acceptedBulkOrders = action.payload; // Store accepted bulk orders
    state.error = null; // Clear any previous errors
  },
  getAcceptedBulkOrdersForShopFail: (state, action) => {
    state.isLoading = false;
    state.error = action.payload;
  },
  
  // Update bulk order status
  updateBulkOrderStatusRequest: (state) => {
    state.isLoading = true;
  },
  updateBulkOrderStatusSuccess: (state, action) => {
    state.isLoading = false;
    // Update the status of the bulk order in the state
    const updatedOrderIndex = state.userBulkOrders.findIndex(
      (order) => order._id === action.payload._id
    );
    if (updatedOrderIndex !== -1) {
      state.userBulkOrders[updatedOrderIndex] = action.payload;
    }
    state.success = true;
    state.error = null; // Clear any previous errors
  },
  updateBulkOrderStatusFail: (state, action) => {
    state.isLoading = false;
    state.error = action.payload;
  },

  // Update offer
  updateOfferRequest: (state) => {
    state.isLoading = true;
  },
  updateOfferSuccess: (state, action) => {
    state.isLoading = false;
    state.shopBulkOrders = state.shopBulkOrders.map((order) =>
      order._id === action.payload._id ? { ...order, offer: action.payload } : order
    );
    state.success = true;
    state.error = null; // Clear any previous errors
  },
  updateOfferFail: (state, action) => {
    state.isLoading = false;
    state.error = action.payload;
  },
  
  // Delete offer
  deleteOfferRequest: (state) => {
    state.isLoading = true;
  },
  deleteOfferSuccess: (state, action) => {
    state.isLoading = false;
    state.shopBulkOrders = state.shopBulkOrders.filter((order) => order._id !== action.payload);
    state.success = true;
    state.error = null; // Clear any previous errors
  },
  deleteOfferFail: (state, action) => {
    state.isLoading = false;
    state.error = action.payload;
  },
  
  // Clear success flag
  clearSuccess: (state) => {
    state.success = false;
  },
});