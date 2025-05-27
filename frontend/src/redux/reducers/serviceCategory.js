import { createReducer } from "@reduxjs/toolkit";

const initialState = {
  isLoading: true,
  categories: [],
  error: null,
  success: false,
  message: null,
};

export const serviceCategoryReducer = createReducer(initialState, {
  // Create service category
  createServiceCategoryRequest: (state) => {
    state.isLoading = true;
  },
  createServiceCategorySuccess: (state, action) => {
    state.isLoading = false;
    state.categories.push(action.payload);
    state.success = true;
  },
  createServiceCategoryFail: (state, action) => {
    state.isLoading = false;
    state.error = action.payload;
  },

  // Get all service categories
  getAllServiceCategoriesRequest: (state) => {
    state.isLoading = true;
  },
  getAllServiceCategoriesSuccess: (state, action) => {
    state.isLoading = false;
    state.categories = action.payload;
  },
  getAllServiceCategoriesFail: (state, action) => {
    state.isLoading = false;
    state.error = action.payload;
  },

  // Delete service category
  deleteServiceCategoryRequest: (state) => {
    state.isLoading = true;
  },
  deleteServiceCategorySuccess: (state, action) => {
    state.isLoading = false;
    state.message = action.payload.message;
    // Remove the deleted category from the state
    state.categories = state.categories.filter(
      category => category._id !== action.payload.categoryId
    );
  },
  deleteServiceCategoryFail: (state, action) => {
    state.isLoading = false;
    state.error = action.payload;
  },

  clearErrors: (state) => {
    state.error = null;
  },
  clearSuccess: (state) => {
    state.success = false;
  },
  clearMessage: (state) => {
    state.message = null;
  },
});