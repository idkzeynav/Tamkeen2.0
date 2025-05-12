import { createReducer } from "@reduxjs/toolkit";

const initialState = {
  isLoading: true,
  userBulkOrders: [],
  shopBulkOrders: [], 
  rfqs:[],
  bulkOrderStatus: "",
  offers: [],
  acceptedBulkOrders: [],
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
  },
  
  deleteBulkOrderFailed: (state, action) => {
    state.isLoading = false;
    state.error = action.payload;
  },
// Add these lines to the existing bulkOrderReducer
getBulkOrdersForShopRequest: (state) => {
  state.isLoading = true;
},
getBulkOrdersForShopSuccess: (state, action) => {
  state.isLoading = false;
  state.shopBulkOrders = action.payload; // Store bulk orders for the shop
},
getBulkOrdersForShopFail: (state, action) => {
  state.isLoading = false;
  state.error = action.payload;
},
submitOfferRequest: (state) => {
  state.isLoading = true;
},
submitOfferSuccess: (state , action) => {
  state.isLoading = false;
  console.log(action.payload); 
  state.rfqs = state.rfqs.map((rfq) =>
    rfq._id === action.payload._id ? action.payload : rfq
  ); // Update the specific RFQ with the new offer details
  state.success = true;
},
submitOfferFail: (state, action) => {
  state.isLoading = false;
  state.error = action.payload;
  state.success = false;
},

  clearErrors: (state) => {
    state.error = null;
  },

  getUserBulkOrdersRequest: (state) => {
    state.isLoading = true;
  },
  getUserBulkOrdersSuccess: (state, action) => {
    state.isLoading = false;
    state.userBulkOrders = action.payload; // Store user-specific bulk orders
  },
  getUserBulkOrdersFail: (state, action) => {
    state.isLoading = false;
    state.error = action.payload;
  },
  getBulkOrderOffersRequest: (state) => {
    state.isLoading = true;
  },
  getBulkOrderOffersSuccess: (state, action) => {
    state.isLoading = false;
    state.offers = action.payload; // Store offers for the specific bulk order
  },
  getBulkOrderOffersFail: (state, action) => {
    state.isLoading = false;
    state.error = action.payload;
   
  },
  
  getOfferDetailsRequest: (state) => {
    state.isLoading = true;
  },
  getOfferDetailsSuccess: (state, action) => {
    state.isLoading = false;
    state.offerDetails = action.payload;
    state.success = true;
  },
  getOfferDetailsFail: (state, action) => {
    state.isLoading = false;
    state.error = action.payload;
    state.success = false;
  },
  acceptOfferRequest: (state) => {
    state.isLoading = true;
  },
  acceptOfferSuccess: (state, action) => {
    state.isLoading = false;
    state.rfqs = state.rfqs.map((rfq) =>
      rfq._id === action.payload._id ? action.payload : { ...rfq, status: "Declined" }
    );
    state.success = true;
  },
  acceptOfferFail: (state, action) => {
    state.isLoading = false;
    state.error = action.payload;
    state.success = false;
  },
  
  bulkOrderPaymentRequest: (state) => {
    state.isLoading = true;
  },
  bulkOrderPaymentSuccess: (state, action) => {
    state.isLoading = false;
    state.paymentDetails = action.payload; // Store payment details
    state.success = true;
  },
  bulkOrderPaymentFail: (state, action) => {
    state.isLoading = false;
    state.error = action.payload;
    state.success = false;
  },
  getUserProcessingOrdersRequest: (state) => {
    state.isLoading = true;
  },
  getUserProcessingOrdersSuccess: (state, action) => {
    state.isLoading = false;
    state.processingOrders = action.payload; // Store processing orders
  },
  getUserProcessingOrdersFail: (state, action) => {
    state.isLoading = false;
    state.error = action.payload;
  },
  getAcceptedBulkOrdersForShopRequest: (state) => {
    state.isLoading = true;
  },
  getAcceptedBulkOrdersForShopSuccess: (state, action) => {
    state.isLoading = false;
    state.acceptedBulkOrders = action.payload; // Store accepted bulk orders
  },
  getAcceptedBulkOrdersForShopFail: (state, action) => {
    state.isLoading = false;
    state.error = action.payload;
  },
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
  },
  updateBulkOrderStatusFail: (state, action) => {
    state.isLoading = false;
    state.error = action.payload;
  },

  updateOfferRequest: (state) => {
    state.isLoading = true;
  },
  updateOfferSuccess: (state, action) => {
    state.isLoading = false;
    state.shopBulkOrders = state.shopBulkOrders.map((order) =>
      order._id === action.payload._id ? { ...order, offer: action.payload } : order
    );
    state.success = true;
  },
  updateOfferFail: (state, action) => {
    state.isLoading = false;
    state.error = action.payload;
  },
  
  deleteOfferRequest: (state) => {
    state.isLoading = true;
  },
  deleteOfferSuccess: (state, action) => {
    state.isLoading = false;
    state.shopBulkOrders = state.shopBulkOrders.filter((order) => order._id !== action.payload);
    state.success = true;
  },
  deleteOfferFail: (state, action) => {
    state.isLoading = false;
    state.error = action.payload;
  },
  
  clearSuccess: (state) => {
    state.success = false;
  },
  
});
