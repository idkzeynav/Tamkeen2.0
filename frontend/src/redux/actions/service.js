// redux/actions/service.js
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
      payload: data.service,
    });
  } catch (error) {
    console.log(error.response.data); 
    dispatch({
      type: "serviceCreateFail",
      payload: error.response.data.message,
    });
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
  } catch (error) {
    dispatch({
      type: "getAllServicesShopFail",
      payload: error.response.data.message,
    });
  }
};

// Delete service
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
  } catch (error) {
    dispatch({
      type: "deleteServiceFail",
      payload: error.response.data.message,
    });
  }
};

export const getAllServices = () => async (dispatch) => {
  try {
    dispatch({ type: "getAllServicesRequest" });

    const { data } = await axios.get(`${server}/services/get-all-services`);
    
    dispatch({
      type: "getAllServicesSuccess",
      payload: data.services,
    });
  } catch (error) {
    dispatch({
      type: "getAllServicesFail",
      payload: error.response.data.message,
    });
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
      payload: data.message,
    });
  } catch (error) {
    dispatch({
      type: "updateServiceFail",
      payload: error.response.data.message,
    });
  }
};
