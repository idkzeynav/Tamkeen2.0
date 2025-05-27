import axios from "axios";
import { server } from "../../server";

// Create service category (admin only)
export const createServiceCategory = (name) => async (dispatch) => {
  try {
    dispatch({
      type: "createServiceCategoryRequest",
    });

    console.log("Sending request to create category:", name);

    const { data } = await axios.post(
      `${server}/service-categories/create-category`,
      { name },
      { withCredentials: true }
    );

    console.log("Success response:", data);

    dispatch({
      type: "createServiceCategorySuccess",
      payload: data.category,
    });
  } catch (error) {
    console.error("Error creating service category:", error);
    
    // Improved error handling to capture more details
    const errorMessage = 
      error.response?.data?.message || 
      error.message || 
      "An error occurred while creating the category";
    
    console.log("Error details:", {
      status: error.response?.status,
      message: errorMessage
    });

    dispatch({
      type: "createServiceCategoryFail",
      payload: errorMessage,
    });
  }
};

// Get all service categories
export const getAllServiceCategories = () => async (dispatch) => {
  try {
    dispatch({
      type: "getAllServiceCategoriesRequest",
    });

    const { data } = await axios.get(
      `${server}/service-categories/get-all-categories`
    );

    dispatch({
      type: "getAllServiceCategoriesSuccess",
      payload: data.categories,
    });
  } catch (error) {
    dispatch({
      type: "getAllServiceCategoriesFail",
      payload: error.response?.data?.message || "Failed to fetch categories",
    });
  }
};

// Delete service category (admin only)
export const deleteServiceCategory = (id) => async (dispatch) => {
  try {
    dispatch({
      type: "deleteServiceCategoryRequest",
    });

    const { data } = await axios.delete(
      `${server}/service-categories/delete-category/${id}`,
      { withCredentials: true }
    );

    dispatch({
      type: "deleteServiceCategorySuccess",
      payload: {
        message: data.message,
        categoryId: id
      },
    });
  } catch (error) {
    dispatch({
      type: "deleteServiceCategoryFail",
      payload: error.response?.data?.message || "Failed to delete category",
    });
  }
};