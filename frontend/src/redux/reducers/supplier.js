// redux/reducers/supplierReducer.js
import {
  CREATE_SUPPLIER_REQUEST,
  CREATE_SUPPLIER_SUCCESS,
  CREATE_SUPPLIER_FAIL,
  GET_ALL_SUPPLIERS_REQUEST,
  GET_ALL_SUPPLIERS_SUCCESS,
  GET_ALL_SUPPLIERS_FAIL,
  GET_SUPPLIER_REQUEST,
  GET_SUPPLIER_SUCCESS,
  GET_SUPPLIER_FAIL,
  UPDATE_SUPPLIER_REQUEST,
  UPDATE_SUPPLIER_SUCCESS,
  UPDATE_SUPPLIER_FAIL,
  DELETE_SUPPLIER_REQUEST,
  DELETE_SUPPLIER_SUCCESS,
  DELETE_SUPPLIER_FAIL,
  VERIFY_SUPPLIER_REQUEST,
  VERIFY_SUPPLIER_SUCCESS,
  VERIFY_SUPPLIER_FAIL,
  UPDATE_SUPPLIER_STATUS_REQUEST,
  UPDATE_SUPPLIER_STATUS_SUCCESS,
  UPDATE_SUPPLIER_STATUS_FAIL,
  GET_SUPPLIER_STATS_REQUEST,
  GET_SUPPLIER_STATS_SUCCESS,
  GET_SUPPLIER_STATS_FAIL,
  BULK_IMPORT_SUPPLIERS_REQUEST,
  BULK_IMPORT_SUPPLIERS_SUCCESS,
  BULK_IMPORT_SUPPLIERS_FAIL,
  CLEAR_SUPPLIER_ERRORS,
  CLEAR_SUPPLIER_MESSAGES,
   SEND_EMAIL_TO_SUPPLIER_REQUEST,
  SEND_EMAIL_TO_SUPPLIER_SUCCESS,
  SEND_EMAIL_TO_SUPPLIER_FAIL,
  RATE_SUPPLIER_REQUEST,
  RATE_SUPPLIER_SUCCESS,
  RATE_SUPPLIER_FAIL,
} from "../actions/supplier";

const initialState = {
  suppliers: [],
  supplier: null,
  stats: null,
  isLoading: false,
  error: null,
  message: null,
  success: false,
  totalSuppliers: 0,
  suppliersCount: 0,
  resultPerPage: 10,
  filteredSuppliersCount: 0,
};

export const supplierReducer = (state = initialState, action) => {
  switch (action.type) {
    case CREATE_SUPPLIER_REQUEST:
    case UPDATE_SUPPLIER_REQUEST:
    case DELETE_SUPPLIER_REQUEST:
    case VERIFY_SUPPLIER_REQUEST:
    case UPDATE_SUPPLIER_STATUS_REQUEST:
    case BULK_IMPORT_SUPPLIERS_REQUEST:
      return {
        ...state,
        isLoading: true,
        error: null,
        success: false,
      };

    case GET_ALL_SUPPLIERS_REQUEST:
    case GET_SUPPLIER_REQUEST:
    case GET_SUPPLIER_STATS_REQUEST:
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case CREATE_SUPPLIER_SUCCESS:
      return {
        ...state,
        isLoading: false,
        success: true,
        message: action.payload.message,
        supplier: action.payload.supplier,
        suppliers: [...state.suppliers, action.payload.supplier],
        error: null,
      };

    case GET_ALL_SUPPLIERS_SUCCESS:
      return {
        ...state,
        isLoading: false,
        suppliers: action.payload.suppliers,
        totalSuppliers: action.payload.totalSuppliers,
        suppliersCount: action.payload.suppliersCount,
        resultPerPage: action.payload.resultPerPage,
        filteredSuppliersCount: action.payload.filteredSuppliersCount,
        error: null,
      };

    case GET_SUPPLIER_SUCCESS:
      return {
        ...state,
        isLoading: false,
        supplier: action.payload,
        error: null,
      };

    case UPDATE_SUPPLIER_SUCCESS:
      return {
        ...state,
        isLoading: false,
        success: true,
        message: action.payload.message,
        supplier: action.payload.supplier,
        suppliers: state.suppliers.map(supplier =>
          supplier._id === action.payload.supplier._id
            ? action.payload.supplier
            : supplier
        ),
        error: null,
      };

    case DELETE_SUPPLIER_SUCCESS:
      return {
        ...state,
        isLoading: false,
        success: true,
        message: action.payload,
        suppliers: state.suppliers.filter(
          supplier => supplier._id !== action.meta?.supplierId
        ),
        error: null,
      };

    case VERIFY_SUPPLIER_SUCCESS:
    case UPDATE_SUPPLIER_STATUS_SUCCESS:
      return {
        ...state,
        isLoading: false,
        success: true,
        message: action.payload.message,
        suppliers: state.suppliers.map(supplier =>
          supplier._id === action.payload.supplier._id
            ? action.payload.supplier
            : supplier
        ),
        error: null,
      };

    case GET_SUPPLIER_STATS_SUCCESS:
      return {
        ...state,
        isLoading: false,
        stats: action.payload,
        error: null,
      };

    case BULK_IMPORT_SUPPLIERS_SUCCESS:
      return {
        ...state,
        isLoading: false,
        success: true,
        message: action.payload.message,
        suppliers: [...state.suppliers, ...action.payload.suppliers],
        error: null,
      };

    case CREATE_SUPPLIER_FAIL:
    case GET_ALL_SUPPLIERS_FAIL:
    case GET_SUPPLIER_FAIL:
    case UPDATE_SUPPLIER_FAIL:
    case DELETE_SUPPLIER_FAIL:
    case VERIFY_SUPPLIER_FAIL:
    case UPDATE_SUPPLIER_STATUS_FAIL:
    case GET_SUPPLIER_STATS_FAIL:
    case BULK_IMPORT_SUPPLIERS_FAIL:
      return {
        ...state,
        isLoading: false,
        error: action.payload,
        success: false,
      };

     case SEND_EMAIL_TO_SUPPLIER_REQUEST:
      return {
        ...state,
        isLoading: true,
      };
    case SEND_EMAIL_TO_SUPPLIER_SUCCESS:
      return {
        ...state,
        isLoading: false,
        success: true,
        message: action.payload.message,
      };
    case SEND_EMAIL_TO_SUPPLIER_FAIL:
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };

    case RATE_SUPPLIER_REQUEST:
      return {
        ...state,
        isLoading: true,
      };
    case RATE_SUPPLIER_SUCCESS:
      return {
        ...state,
        isLoading: false,
        success: true,
        message: action.payload.message,
        // Update the specific supplier's rating in the suppliers array
        suppliers: state.suppliers.map(supplier =>
          supplier._id === action.payload.supplierId
            ? { ...supplier, rating: action.payload.rating }
            : supplier
        ),
      };
    case RATE_SUPPLIER_FAIL:
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };

    case CLEAR_SUPPLIER_ERRORS:
      return {
        ...state,
        error: null,
      };

    case CLEAR_SUPPLIER_MESSAGES:
      return {
        ...state,
        message: null,
        success: false,
      };

    default:
      return state;
  }
};