// redux/actions/supplierActions.js
import axios from "axios";
import { server } from "../../server";

// Action Types
export const CREATE_SUPPLIER_REQUEST = "CREATE_SUPPLIER_REQUEST";
export const CREATE_SUPPLIER_SUCCESS = "CREATE_SUPPLIER_SUCCESS";
export const CREATE_SUPPLIER_FAIL = "CREATE_SUPPLIER_FAIL";

export const GET_ALL_SUPPLIERS_REQUEST = "GET_ALL_SUPPLIERS_REQUEST";
export const GET_ALL_SUPPLIERS_SUCCESS = "GET_ALL_SUPPLIERS_SUCCESS";
export const GET_ALL_SUPPLIERS_FAIL = "GET_ALL_SUPPLIERS_FAIL";

export const GET_SUPPLIER_REQUEST = "GET_SUPPLIER_REQUEST";
export const GET_SUPPLIER_SUCCESS = "GET_SUPPLIER_SUCCESS";
export const GET_SUPPLIER_FAIL = "GET_SUPPLIER_FAIL";

export const UPDATE_SUPPLIER_REQUEST = "UPDATE_SUPPLIER_REQUEST";
export const UPDATE_SUPPLIER_SUCCESS = "UPDATE_SUPPLIER_SUCCESS";
export const UPDATE_SUPPLIER_FAIL = "UPDATE_SUPPLIER_FAIL";

export const DELETE_SUPPLIER_REQUEST = "DELETE_SUPPLIER_REQUEST";
export const DELETE_SUPPLIER_SUCCESS = "DELETE_SUPPLIER_SUCCESS";
export const DELETE_SUPPLIER_FAIL = "DELETE_SUPPLIER_FAIL";

export const VERIFY_SUPPLIER_REQUEST = "VERIFY_SUPPLIER_REQUEST";
export const VERIFY_SUPPLIER_SUCCESS = "VERIFY_SUPPLIER_SUCCESS";
export const VERIFY_SUPPLIER_FAIL = "VERIFY_SUPPLIER_FAIL";

export const UPDATE_SUPPLIER_STATUS_REQUEST = "UPDATE_SUPPLIER_STATUS_REQUEST";
export const UPDATE_SUPPLIER_STATUS_SUCCESS = "UPDATE_SUPPLIER_STATUS_SUCCESS";
export const UPDATE_SUPPLIER_STATUS_FAIL = "UPDATE_SUPPLIER_STATUS_FAIL";

export const GET_SUPPLIER_STATS_REQUEST = "GET_SUPPLIER_STATS_REQUEST";
export const GET_SUPPLIER_STATS_SUCCESS = "GET_SUPPLIER_STATS_SUCCESS";
export const GET_SUPPLIER_STATS_FAIL = "GET_SUPPLIER_STATS_FAIL";

export const BULK_IMPORT_SUPPLIERS_REQUEST = "BULK_IMPORT_SUPPLIERS_REQUEST";
export const BULK_IMPORT_SUPPLIERS_SUCCESS = "BULK_IMPORT_SUPPLIERS_SUCCESS";
export const BULK_IMPORT_SUPPLIERS_FAIL = "BULK_IMPORT_SUPPLIERS_FAIL";

export const CLEAR_SUPPLIER_ERRORS = "CLEAR_SUPPLIER_ERRORS";
export const CLEAR_SUPPLIER_MESSAGES = "CLEAR_SUPPLIER_MESSAGES";

// Create supplier
export const createSupplier = (supplierData) => async (dispatch) => {
  try {
    dispatch({
      type: CREATE_SUPPLIER_REQUEST,
    });

    const config = {
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true,
    };

    const { data } = await axios.post(
      `${server}/admin-supplier/create-supplier`,
      supplierData,
      config
    );

    dispatch({
      type: CREATE_SUPPLIER_SUCCESS,
      payload: data,
    });
  } catch (error) {
    dispatch({
      type: CREATE_SUPPLIER_FAIL,
      payload: error.response?.data?.message || error.message,
    });
  }
};

// Get all suppliers
export const getAllSuppliers = (params = {}) => async (dispatch) => {
  try {
    dispatch({
      type: GET_ALL_SUPPLIERS_REQUEST,
    });

    const queryParams = new URLSearchParams(params).toString();
    const { data } = await axios.get(
      `${server}/admin-supplier/get-all-suppliers?${queryParams}`,
      { withCredentials: true }
    );

    dispatch({
      type: GET_ALL_SUPPLIERS_SUCCESS,
      payload: data,
    });
  } catch (error) {
    dispatch({
      type: GET_ALL_SUPPLIERS_FAIL,
      payload: error.response?.data?.message || error.message,
    });
  }
};

// Get single supplier
export const getSupplier = (id) => async (dispatch) => {
  try {
    dispatch({
      type: GET_SUPPLIER_REQUEST,
    });

    const { data } = await axios.get(
      `${server}/admin-supplier/get-supplier/${id}`,
      { withCredentials: true }
    );

    dispatch({
      type: GET_SUPPLIER_SUCCESS,
      payload: data.supplier,
    });
  } catch (error) {
    dispatch({
      type: GET_SUPPLIER_FAIL,
      payload: error.response?.data?.message || error.message,
    });
  }
};

// Update supplier
export const updateSupplier = (id, supplierData) => async (dispatch) => {
  try {
    dispatch({
      type: UPDATE_SUPPLIER_REQUEST,
    });

    const config = {
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true,
    };

    const { data } = await axios.put(
      `${server}/admin-supplier/update-supplier/${id}`,
      supplierData,
      config
    );

    dispatch({
      type: UPDATE_SUPPLIER_SUCCESS,
      payload: data,
    });
  } catch (error) {
    dispatch({
      type: UPDATE_SUPPLIER_FAIL,
      payload: error.response?.data?.message || error.message,
    });
  }
};

// Delete supplier
export const deleteSupplier = (id) => async (dispatch) => {
  try {
    dispatch({
      type: DELETE_SUPPLIER_REQUEST,
    });

    const { data } = await axios.delete(
      `${server}/admin-supplier/delete-supplier/${id}`,
      { withCredentials: true }
    );

    dispatch({
      type: DELETE_SUPPLIER_SUCCESS,
      payload: data.message,
    });
  } catch (error) {
    dispatch({
      type: DELETE_SUPPLIER_FAIL,
      payload: error.response?.data?.message || error.message,
    });
  }
};

// Verify supplier
export const verifySupplier = (id, isVerified) => async (dispatch) => {
  try {
    dispatch({
      type: VERIFY_SUPPLIER_REQUEST,
    });

    const config = {
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true,
    };

    const { data } = await axios.patch(
      `${server}/admin-supplier/verify-supplier/${id}`,
      { isVerified },
      config
    );

    dispatch({
      type: VERIFY_SUPPLIER_SUCCESS,
      payload: data,
    });
  } catch (error) {
    dispatch({
      type: VERIFY_SUPPLIER_FAIL,
      payload: error.response?.data?.message || error.message,
    });
  }
};

// Update supplier status
export const updateSupplierStatus = (id, status) => async (dispatch) => {
  try {
    dispatch({
      type: UPDATE_SUPPLIER_STATUS_REQUEST,
    });

    const config = {
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true,
    };

    const { data } = await axios.patch(
      `${server}/admin-supplier/update-supplier-status/${id}`,
      { status },
      config
    );

    dispatch({
      type: UPDATE_SUPPLIER_STATUS_SUCCESS,
      payload: data,
    });
  } catch (error) {
    dispatch({
      type: UPDATE_SUPPLIER_STATUS_FAIL,
      payload: error.response?.data?.message || error.message,
    });
  }
};

// Get supplier statistics
export const getSupplierStats = () => async (dispatch) => {
  try {
    dispatch({
      type: GET_SUPPLIER_STATS_REQUEST,
    });

    const { data } = await axios.get(
      `${server}/admin-supplier/supplier-stats`,
      { withCredentials: true }
    );

    dispatch({
      type: GET_SUPPLIER_STATS_SUCCESS,
      payload: data.stats,
    });
  } catch (error) {
    dispatch({
      type: GET_SUPPLIER_STATS_FAIL,
      payload: error.response?.data?.message || error.message,
    });
  }
};

// Bulk import suppliers
export const bulkImportSuppliers = (suppliers) => async (dispatch) => {
  try {
    dispatch({
      type: BULK_IMPORT_SUPPLIERS_REQUEST,
    });

    const config = {
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true,
    };

    const { data } = await axios.post(
      `${server}/admin-supplier/bulk-import-suppliers`,
      { suppliers },
      config
    );

    dispatch({
      type: BULK_IMPORT_SUPPLIERS_SUCCESS,
      payload: data,
    });
  } catch (error) {
    dispatch({
      type: BULK_IMPORT_SUPPLIERS_FAIL,
      payload: error.response?.data?.message || error.message,
    });
  }
};

// Clear errors
export const clearErrors = () => async (dispatch) => {
  dispatch({
    type: CLEAR_SUPPLIER_ERRORS,
  });
};

// Clear messages
export const clearMessages = () => async (dispatch) => {
  dispatch({
    type: CLEAR_SUPPLIER_MESSAGES,
  });
};

// Add these action types and actions to your supplierActions.js

// New Action Types
export const SEND_EMAIL_TO_SUPPLIER_REQUEST = "SEND_EMAIL_TO_SUPPLIER_REQUEST";
export const SEND_EMAIL_TO_SUPPLIER_SUCCESS = "SEND_EMAIL_TO_SUPPLIER_SUCCESS";
export const SEND_EMAIL_TO_SUPPLIER_FAIL = "SEND_EMAIL_TO_SUPPLIER_FAIL";

export const RATE_SUPPLIER_REQUEST = "RATE_SUPPLIER_REQUEST";
export const RATE_SUPPLIER_SUCCESS = "RATE_SUPPLIER_SUCCESS";
export const RATE_SUPPLIER_FAIL = "RATE_SUPPLIER_FAIL";

// Send email to supplier
export const sendEmailToSupplier = (emailData) => async (dispatch) => {
  try {
    dispatch({
      type: SEND_EMAIL_TO_SUPPLIER_REQUEST,
    });

    const config = {
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true,
    };

    const { data } = await axios.post(
      `${server}/admin-supplier/send-email-to-supplier`,
      emailData,
      config
    );

    dispatch({
      type: SEND_EMAIL_TO_SUPPLIER_SUCCESS,
      payload: data,
    });
  } catch (error) {
    dispatch({
      type: SEND_EMAIL_TO_SUPPLIER_FAIL,
      payload: error.response?.data?.message || error.message,
    });
  }
};

// Rate supplier
export const rateSupplier = (supplierId, ratingData) => async (dispatch) => {
  try {
    dispatch({
      type: RATE_SUPPLIER_REQUEST,
    });

    const config = {
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true,
    };

    const { data } = await axios.post(
      `${server}/admin-supplier/rate-supplier/${supplierId}`,
      ratingData,
      config
    );

    dispatch({
      type: RATE_SUPPLIER_SUCCESS,
      payload: data,
    });
  } catch (error) {
    dispatch({
      type: RATE_SUPPLIER_FAIL,
      payload: error.response?.data?.message || error.message,
    });
  }
};