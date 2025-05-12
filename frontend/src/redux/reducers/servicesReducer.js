import { createReducer } from "@reduxjs/toolkit";

const initialState = {
  isLoading: true,
  services: [],
  error: null,
  success: false,
};

export const serviceReducer = createReducer(initialState, {
  // Create Service
  serviceCreateRequest: (state) => {
    state.isLoading = true;
  },
  serviceCreateSuccess: (state, action) => {
    state.isLoading = false;
    state.services.push(action.payload); // Assuming you want to add the new service to the array
    state.success = true;
  },
  serviceCreateFail: (state, action) => {
    state.isLoading = false;
    state.error = action.payload;
    state.success = false;
  },


    // Get all services of a shop
    getAllServicesShopRequest: (state) => {
      state.isLoading = true;
    },
    getAllServicesShopSuccess: (state, action) => {
      state.isLoading = false;
      state.services = action.payload; // Set services for the shop
    },
    getAllServicesShopFail: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },
  
  // Delete service of a shop
deleteServiceRequest: (state) => {
  state.isLoading = true;
},
deleteServiceSuccess: (state, action) => {
  state.isLoading = false;
  state.message = action.payload; // Set delete message
},
deleteServiceFail: (state, action) => {
  state.isLoading = false;
  state.error = action.payload;
},

  
    // Get all services
    getAllServicesRequest: (state) => {
      state.isLoading = true;
    },
    getAllServicesSuccess: (state, action) => {
      state.isLoading = false;
      state.services = action.payload; // Set all services
    },
    getAllServicesFail: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },
  // Update service
updateServiceRequest: (state) => {
  state.isLoading = true;
},
updateServiceSuccess: (state, action) => {
  state.isLoading = false;
  state.message = action.payload;  // Set update message
},
updateServiceFail: (state, action) => {
  state.isLoading = false;
  state.error = action.payload;
},

  
    clearErrors: (state) => {
      state.error = null;
    },


});
