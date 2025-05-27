import axios from "axios";
import { server } from "../../server";

// Create service
export const createService = (newForm) => async (dispatch) => {
  try {
    dispatch({
      type: "serviceCreateRequest",
    });

    const config = { headers: { "Content-Type": "application/json" } };

    const { data } = await axios.post(
      `${server}/services/create-service`,
      newForm,
      config
    );

    dispatch({
      type: "serviceCreateSuccess",
      payload: {
        service: data.service,
        requiresApproval: data.requiresApproval || false
      },
    });
    
    return data;
  } catch (error) {
    console.log(error.response.data); 
    dispatch({
      type: "serviceCreateFail",
      payload: error.response.data.message,
    });
    throw error;
  }
};

export const getAllServicesShop = (id) => async (dispatch) => {
  try {
    dispatch({ type: "getAllServicesShopRequest" });

    const { data } = await axios.get(
      `${server}/services/get-all-services-shop/${id}`
    );
    dispatch({
      type: "getAllServicesShopSuccess",
      payload: data.services,
    });
    
    return data;
  } catch (error) {
    dispatch({
      type: "getAllServicesShopFail",
      payload: error.response.data.message,
    });
    throw error;
  }
};

// Delete service
export const deleteService = (id) => async (dispatch) => {
  try {
    dispatch({ type: "deleteServiceRequest" });

    const { data } = await axios.delete(
      `${server}/services/delete-shop-service/${id}`,
      { withCredentials: true }
    );

    dispatch({
      type: "deleteServiceSuccess",
      payload: data.message,
    });
    
    return data;
  } catch (error) {
    dispatch({
      type: "deleteServiceFail",
      payload: error.response.data.message,
    });
    throw error;
  }
};

export const getAllServices = () => async (dispatch) => {
  try {
    dispatch({ type: "getAllServicesRequest" });

    const { data } = await axios.get(`${server}/services/get-all-services`);
    
    // Filter out services with "pending" or "rejected" status for regular users
    const filteredServices = data.services.filter(
      service => service.status === "approved"
    );
    
    dispatch({
      type: "getAllServicesSuccess",
      payload: filteredServices,
    });
    
    return {
      ...data,
      services: filteredServices
    };
  } catch (error) {
    dispatch({
      type: "getAllServicesFail",
      payload: error.response.data.message,
    });
    throw error;
  }
};

// Update service
export const updateService = (id, updatedForm) => async (dispatch) => {
  try {
    dispatch({
      type: "updateServiceRequest",
    });

    const config = { headers: { "Content-Type": "application/json" } };

    const { data } = await axios.put(
      `${server}/services/update-service/${id}`,
      updatedForm,
      config
    );

    dispatch({
      type: "updateServiceSuccess",
      payload: {
        message: data.message,
        requiresApproval: data.requiresApproval || false
      },
    });

      // Refetch shop services to get updated list
    dispatch(getAllServicesShop(updatedForm.shopId));
    return Promise.resolve(data);
  } catch (error) {
    console.error("Update service error:", error.response?.data);
    dispatch({
      type: "updateServiceFail",
      payload: error.response?.data?.message || "An error occurred",
    });
    return Promise.reject(error.response?.data);
  }
};

// Admin actions for service moderation
export const getPendingServices = () => async (dispatch) => {
  try {
    dispatch({ type: "getPendingServicesRequest" });

    const { data } = await axios.get(`${server}/services/admin/pending-services`, 
      { withCredentials: true }
    );
    
    dispatch({
      type: "getPendingServicesSuccess",
      payload: data.services,
    });
    
    return data;
  } catch (error) {
    dispatch({
      type: "getPendingServicesFail",
      payload: error.response?.data?.message || "Failed to fetch pending services",
    });
    throw error;
  }
};

export const moderateService = (id, status, moderationNotes) => async (dispatch) => {
  try {
    dispatch({ type: "moderateServiceRequest" });

    const config = { headers: { "Content-Type": "application/json" } };
    
    const { data } = await axios.put(
      `${server}/services/admin/moderate-service/${id}`,
      { status, moderationNotes },
      { ...config, withCredentials: true }
    );
    
    dispatch({
      type: "moderateServiceSuccess",
      payload: data,
    });
    
    return data;
  } catch (error) {
    dispatch({
      type: "moderateServiceFail",
      payload: error.response?.data?.message || "Failed to moderate service",
    });
    throw error;
  }
};

// Report a service
export const reportService = (serviceId, reportData) => async (dispatch) => {
  try {
    dispatch({
      type: "reportServiceRequest",
    });

    const config = { 
      headers: { "Content-Type": "application/json" },
      withCredentials: true
    };

    const { data } = await axios.post(
      `${server}/services/report-service/${serviceId}`,
      reportData,
      config
    );

    dispatch({
      type: "reportServiceSuccess",
      payload: data.message,
    });
    
    return data;
  } catch (error) {
    dispatch({
      type: "reportServiceFail",
      payload: error.response?.data?.message || "Failed to report service",
    });
    throw error;
  }
};
export const getReportedServices = () => async (dispatch) => {
  try {
    dispatch({ type: "getReportedServicesRequest" });

    const { data } = await axios.get(
      `${server}/services/admin/reported-services`,
      { withCredentials: true }
    );
    
    dispatch({
      type: "getReportedServicesSuccess",
      payload: data.services,
    });
    
    return data;
  } catch (error) {
    dispatch({
      type: "getReportedServicesFail",
      payload: error.response?.data?.message || "Failed to fetch reported services",
    });
    throw error;
  }
};

// Handle reported service (admin only)
export const handleReportedService = (serviceId, action, adminNotes) => async (dispatch) => {
  try {
    dispatch({ type: "handleReportRequest" });

    const config = { headers: { "Content-Type": "application/json" } };
    
    const { data } = await axios.put(
      `${server}/services/admin/handle-report/${serviceId}`,
      { action, adminNotes },
      { ...config, withCredentials: true }
    );
    
    dispatch({
      type: "handleReportSuccess",
      payload: {
        message: data.message,
        serviceId: serviceId, // Explicitly pass the serviceId for state updates
        service: data.service
      },
    });
    
    return data;
  } catch (error) {
    dispatch({
      type: "handleReportFail",
      payload: error.response?.data?.message || "Failed to handle reported service",
    });
    throw error;
  }
};
// Get report statistics (admin only)
export const getReportStats = () => async (dispatch) => {
  try {
    dispatch({ type: "getReportStatsRequest" });

    const { data } = await axios.get(
      `${server}/services/admin/report-stats`,
      { withCredentials: true }
    );
    
    dispatch({
      type: "getReportStatsSuccess",
      payload: data.stats,
    });
    
    return data;
  } catch (error) {
    dispatch({
      type: "getReportStatsFail",
      payload: error.response?.data?.message || "Failed to fetch report statistics",
    });
    throw error;
  }
};