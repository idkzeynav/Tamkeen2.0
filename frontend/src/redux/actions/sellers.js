import axios from "axios";
import { server } from "../../server";

// get all sellers --- admin
export const getAllSellers = (searchTerm = "") => async (dispatch) => {
  try {
    dispatch({
      type: "getAllSellersRequest",
    });

    const { data } = await axios.get(
      `${server}/shop/admin-all-sellers?search=${searchTerm}`, 
      {
        withCredentials: true,
      }
    );

    dispatch({
      type: "getAllSellersSuccess",
      payload: data.sellers,
    });
  } catch (error) {
    dispatch({
      type: "getAllSellerFailed",
      payload: error.response?.data?.message || "Failed to fetch sellers",
    });
  }
};