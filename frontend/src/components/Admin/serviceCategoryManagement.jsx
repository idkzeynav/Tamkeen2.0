import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { 
  createServiceCategory, 
  getAllServiceCategories, 
  deleteServiceCategory 
} from "../../redux/actions/serviceCategory";
import { PlusCircle, Trash2, Loader, AlertCircle, X } from "lucide-react";

const ServiceCategoryManagement = () => {
  const dispatch = useDispatch();
  const { isLoading, categories, error, success, message } = useSelector(
    (state) => state.serviceCategoryReducer
  );
  const { user } = useSelector((state) => state.user);

  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  useEffect(() => {
    dispatch(getAllServiceCategories());
  }, [dispatch]);

  useEffect(() => {
    console.log("State updated:", { isLoading, error, success, message });
    
    if (error) {
      console.log("Error detected:", error);
      toast.error(error);
      dispatch({ type: "clearErrors" });
      setIsSubmitting(false);
    }
    if (success) {
      console.log("Success detected");
      toast.success("Category created successfully!");
      setName("");
      dispatch({ type: "clearSuccess" });
      setIsSubmitting(false);
    }
    if (message) {
      console.log("Message detected:", message);
      toast.success(message);
      dispatch({ type: "clearMessage" });
      setIsSubmitting(false);
    }
  }, [dispatch, error, success, message, isLoading]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Category name is required");
      return;
    }
    
    console.log("Submitting category:", name);
    setIsSubmitting(true);
    dispatch(createServiceCategory(name));
  };

  const confirmDelete = (category) => {
    setCategoryToDelete(category);
    setShowDeleteModal(true);
  };

  const handleDelete = () => {
    if (categoryToDelete) {
      dispatch(deleteServiceCategory(categoryToDelete._id));
      // Remove the category from the local state immediately for better UX
      const updatedCategories = categories.filter(cat => cat._id !== categoryToDelete._id);
      dispatch({
        type: "getAllServiceCategoriesSuccess",
        payload: updatedCategories
      });
      setShowDeleteModal(false);
      setCategoryToDelete(null);
    }
  };

  const closeModal = () => {
    setShowDeleteModal(false);
    setCategoryToDelete(null);
  };

  // Check if user is admin
  if (!user || !user.role || user.role !== "Admin") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#d8c4b8]/20 to-[#d8c4b8]/10 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-[#5a4336] mx-auto mb-4" />
          <h2 className="text-2xl text-[#5a4336] font-semibold">Access Denied</h2>
          <p className="text-[#a67d6d] mt-4">You need admin privileges to access this page</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-[80vh] bg-gradient-to-b from-[#d8c4b8]/10 to-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#c8a4a5] to-[#8c6c6b] p-8">
            <h1 className="text-3xl font-bold text-white">Manage Service Categories</h1>
            <p className="text-[#f5e6e0] mt-2">
              Create and manage service categories for your platform
            </p>
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Add Category Form */}
            <form onSubmit={handleSubmit} className="mb-10">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-grow">
                  <label className="block text-[#5a4336] text-sm font-semibold mb-2">
                    Category Name <span className="text-[#c8a4a5]">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter service category name"
                    className="w-full p-3 border-2 border-[#c8a4a5]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a67d6d] focus:border-transparent transition-all duration-200 hover:border-[#c8a4a5]"
                    disabled={isSubmitting}
                  />
                </div>
                <div className="md:self-end">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full md:w-auto bg-gradient-to-r from-[#c8a4a5] to-[#8c6c6b] text-white py-3 px-6 rounded-lg font-semibold shadow-md
                      transform transition-all duration-200 hover:scale-[1.02] hover:shadow-lg flex items-center justify-center gap-2
                      ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {isSubmitting ? (
                      <Loader className="w-5 h-5 animate-spin" />
                    ) : (
                      <PlusCircle className="w-5 h-5" />
                    )}
                    {isSubmitting ? "Adding..." : "Add Category"}
                  </button>
                </div>
              </div>
            </form>

            {/* Categories List */}
            <div className="bg-[#f8f5f2] rounded-xl p-6">
              <h2 className="text-xl font-semibold text-[#5a4336] mb-4">
                Existing Categories
              </h2>

              {isLoading && !isSubmitting ? (
                <div className="flex justify-center p-8">
                  <Loader className="w-8 h-8 text-[#8c6c6b] animate-spin" />
                </div>
              ) : categories.length === 0 ? (
                <div className="text-center p-8 text-[#a67d6d]">
                  No categories found. Add your first category above.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {categories.map((category) => (
                    <div
                      key={category._id}
                      className="bg-white rounded-lg p-4 flex justify-between items-center border border-[#c8a4a5]/20 hover:shadow-md transition-all duration-200"
                    >
                      <span className="text-[#5a4336] font-medium">
                        {category.name}
                      </span>
                      <button
                        onClick={() => confirmDelete(category)}
                        className="text-[#c8a4a5] hover:text-red-500 transition-colors duration-200"
                        disabled={isSubmitting}
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Custom Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6 m-4 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-[#5a4336]">Confirm Deletion</h3>
              <button onClick={closeModal} className="text-[#a67d6d] hover:text-[#5a4336]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="py-4">
              <p className="text-[#5a4336]">
                Are you sure you want to delete the category "{categoryToDelete?.name}"?
                This action cannot be undone.
              </p>
            </div>
            <div className="flex justify-end gap-4 pt-2">
              <button
                onClick={closeModal}
                className="px-4 py-2 border border-[#c8a4a5]/30 text-[#5a4336] rounded hover:bg-[#f8f5f2] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-gradient-to-r from-[#c8a4a5] to-[#8c6c6b] text-white rounded hover:opacity-90 transition-opacity"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceCategoryManagement