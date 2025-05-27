import { createReducer } from "@reduxjs/toolkit";

const initialState = {
  isLoading: true,
  services: [],
  pendingServices: [],
  shopServices: [],
  error: null,
  success: false,
  message: null,
  requiresApproval: false,
  moderationSuccess: false,
  // New state for reporting functionality
  reportLoading: false,
  reportSuccess: false,
  reportMessage: null,
  reportError: null,
  reportedServices: [],
  reportStats: null
};

export const serviceReducer = createReducer(initialState, {
  // Create Service
  serviceCreateRequest: (state) => {
    state.isLoading = true;
    state.success = false;
    state.error = null;
  },
  serviceCreateSuccess: (state, action) => {
    state.isLoading = false;
    state.services.push(action.payload.service);
    state.success = true;
    state.requiresApproval = action.payload.requiresApproval;
  },
  serviceCreateFail: (state, action) => {
    state.isLoading = false;
    state.error = action.payload;
    state.success = false;
  },

  // Get all services of a shop
  getAllServicesShopRequest: (state) => {
    state.isLoading = true;
    state.error = null;
  },
  getAllServicesShopSuccess: (state, action) => {
    state.isLoading = false;
    // We'll store all services (including pending ones) for the shop owner
    state.shopServices = action.payload; 
  },
  getAllServicesShopFail: (state, action) => {
    state.isLoading = false;
    state.error = action.payload;
  },
  
  // Delete service of a shop
  deleteServiceRequest: (state) => {
    state.isLoading = true;
    state.error = null;
  },
  deleteServiceSuccess: (state, action) => {
    state.isLoading = false;
    state.message = action.payload;
  },
  deleteServiceFail: (state, action) => {
    state.isLoading = false;
    state.error = action.payload;
  },

  // Get all services
  getAllServicesRequest: (state) => {
    state.isLoading = true;
    state.error = null;
  },
  getAllServicesSuccess: (state, action) => {
    state.isLoading = false;
    // For normal users, we now only show approved services
    // This is filtered in the action already
    state.services = action.payload;
  },
  getAllServicesFail: (state, action) => {
    state.isLoading = false;
    state.error = action.payload;
  },
  
  // Update service
  updateServiceRequest: (state) => {
    state.isLoading = true;
    state.error = null;
    state.success = false;
  },
  updateServiceSuccess: (state, action) => {
    state.isLoading = false;
    state.message = action.payload.message;
    state.success = true;
    state.requiresApproval = action.payload.requiresApproval;
  },
  updateServiceFail: (state, action) => {
    state.isLoading = false;
    state.error = action.payload;
    state.success = false;
  },
  
  // Admin - Get pending services
  getPendingServicesRequest: (state) => {
    state.isLoading = true;
    state.error = null;
  },
  getPendingServicesSuccess: (state, action) => {
    state.isLoading = false;
    state.pendingServices = action.payload;
  },
  getPendingServicesFail: (state, action) => {
    state.isLoading = false;
    state.error = action.payload;
  },
  
  // Admin - Moderate service
  moderateServiceRequest: (state) => {
    state.isLoading = true;
    state.error = null;
    state.moderationSuccess = false;
  },
  moderateServiceSuccess: (state, action) => {
    state.isLoading = false;
    state.message = action.payload.message;
    state.moderationSuccess = true;
    
    // Remove the moderated service from pendingServices
    // Remove from pending regardless of status
    state.pendingServices = state.pendingServices.filter(
      service => service._id !== action.payload.service._id
    );
    // Update shopServices if the service exists there
    const shopIndex = state.shopServices.findIndex(s => s._id === action.payload.service._id);
    if (shopIndex !== -1) {
      state.shopServices[shopIndex] = action.payload.service;
    }

    // If the service was approved, add it to the services list
    if (action.payload.service.status === "approved") {
      // Find if service already exists in the list
      const existingIndex = state.services.findIndex(s => s._id === action.payload.service._id);
      if (existingIndex >= 0) {
        // Update existing service
        state.services[existingIndex] = action.payload.service;
      } else {
        // Add new service
        state.services.push(action.payload.service);
      }
    } else if (action.payload.service.status === "rejected") {
      // If rejected, remove from the services list if it exists
      state.services = state.services.filter(s => s._id !== action.payload.service._id);
    }
  },
  moderateServiceFail: (state, action) => {
    state.isLoading = false;
    state.error = action.payload;
    state.moderationSuccess = false;
  },
  
  // New reducer actions for reporting functionality
  // Report service
  reportServiceRequest: (state) => {
    state.reportLoading = true;
    state.reportSuccess = false;
    state.reportError = null;
    state.reportMessage = null;
  },
  reportServiceSuccess: (state, action) => {
    state.reportLoading = false;
    state.reportSuccess = true;
    state.reportMessage = action.payload;
  },
  reportServiceFail: (state, action) => {
    state.reportLoading = false;
    state.reportError = action.payload;
    state.reportSuccess = false;
  },

  // Admin - Get reported services
  getReportedServicesRequest: (state) => {
    state.isLoading = true;
    state.error = null;
  },
  getReportedServicesSuccess: (state, action) => {
    state.isLoading = false;
    state.reportedServices = action.payload;
  },
  getReportedServicesFail: (state, action) => {
    state.isLoading = false;
    state.error = action.payload;
  },

  handleReportRequest: (state) => {
  state.isLoading = true;
  state.error = null;
  state.success = false;
},
handleReportSuccess: (state, action) => {
  state.isLoading = false;
  state.message = action.payload.message;
  state.success = true;
  
  // Properly filter out the handled service
  state.reportedServices = state.reportedServices.filter(
    service => service._id !== action.payload.serviceId
  );
  
  // Also update services array if applicable
  if (action.payload.service) {
    // If the service was blocked, remove from services list
    if (action.payload.service.status === "rejected") {
      state.services = state.services.filter(s => s._id !== action.payload.serviceId);
    } 
    // If it was dismissed/approved, update it in the services list
    else if (action.payload.service.status === "approved") {
      const existingIndex = state.services.findIndex(s => s._id === action.payload.serviceId);
      if (existingIndex >= 0) {
        state.services[existingIndex] = action.payload.service;
      } else {
        state.services.push(action.payload.service);
      }
    }
  }
},
handleReportFail: (state, action) => {
  state.isLoading = false;
  state.error = action.payload;
  state.success = false;
},
  // Admin - Get report statistics
  getReportStatsRequest: (state) => {
    state.isLoading = true;
    state.error = null;
  },
  getReportStatsSuccess: (state, action) => {
    state.isLoading = false;
    state.reportStats = action.payload;
  },
  getReportStatsFail: (state, action) => {
    state.isLoading = false;
    state.error = action.payload;
  },
  
  // Clear errors and messages
  clearErrors: (state) => {
    state.error = null;
    state.reportError = null;
  },
clearMessages: (state) => {
  state.message = null;
  state.success = false; // This is the key state causing duplicates
  state.moderationSuccess = false;
  state.requiresApproval = false;
  state.reportMessage = null;
  state.reportSuccess = false;
  // Add these if you want to clear service-specific states
  state.isLoading = false;
  state.error = null;
},
});