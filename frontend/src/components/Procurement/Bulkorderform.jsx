import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createBulkOrder } from '../../redux/actions/bulkOrderActions';
import { categoriesData } from '../../static/data';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Upload, AlertCircle } from 'lucide-react';

const BulkOrderForm = () => {
  const { user } = useSelector((state) => state.user);
  const { success, error } = useSelector((state) => state.bulkOrderReducer);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    productName: '',
    description: '',
    quantity: '',
    category: '',
    budget: '',
    deliveryDeadline: '',
    shippingAddress: '',
    packagingRequirements: '',
    supplierLocationPreference: '',
  });
  
  const [errors, setErrors] = useState({});
  const [inspoPic, setInspoPic] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (error) {
      toast.error(error);
      setIsSubmitting(false);
    }
    if (success) {
      setShowSuccess(true);
 dispatch({ type: 'clearSuccess' }); // Clear the success state
      setIsSubmitting(false);
      setTimeout(() => {
        navigate('/profile');
      }, 3000);
    }
  }, [error, success,dispatch, navigate]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5000000) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      setInspoPic(file);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.productName.trim()) newErrors.productName = 'Product name is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.quantity || formData.quantity <= 0) newErrors.quantity = 'Valid quantity is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.budget || formData.budget <= 0) newErrors.budget = 'Valid budget is required';
    if (!formData.deliveryDeadline) newErrors.deliveryDeadline = 'Delivery deadline is required';
    if (!formData.shippingAddress.trim()) newErrors.shippingAddress = 'Shipping address is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Please fill in all required fields correctly');
      return;
    }
    setIsSubmitting(true);

    const newForm = new FormData();
    Object.keys(formData).forEach(key => {
      newForm.append(key, formData[key]);
    });
    newForm.append('userId', user._id);
    if (inspoPic) newForm.append('inspoPic', inspoPic);

    await dispatch(createBulkOrder(newForm));
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#d8c4b8]/20 to-[#d8c4b8]/10 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full text-center">
          <div className="mb-6">
            <CheckCircle className="w-20 h-20 text-[#5a4336] mx-auto animate-bounce" />
          </div>
          <h2 className="text-3xl font-bold text-[#5a4336] mb-4">Order Placed Successfully!</h2>
          <p className="text-[#a67d6d] mb-8 text-lg">
            Your bulk order has been created and sent to relevant sellers. You'll receive updates soon.
          </p>
          <div className="w-full h-2 bg-[#d8c4b8] rounded-full overflow-hidden">
            <div className="w-full h-full bg-[#5a4336] rounded-full animate-pulse"></div>
          </div>
        
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#d8c4b8]/20 to-[#d8c4b8]/10 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-[#5a4336] mx-auto mb-4" />
          <h2 className="text-2xl text-[#5a4336] font-semibold">Authentication Required</h2>
          <p className="text-[#a67d6d] mt-4">Please log in to create a bulk order</p>
        </div>
      </div>
    );
  }

  const renderInput = (label, name, type = "text", placeholder, isTextarea = false, required = true) => {
    const Component = isTextarea ? 'textarea' : 'input';
    return (
      <div className="mb-6">
        <label className="block text-[#5a4336] text-sm font-semibold mb-2">
          {label} {required && <span className="text-[#c8a4a5]">*</span>}
        </label>
        <Component
          type={type}
          placeholder={placeholder}
          value={formData[name]}
          onChange={(e) => setFormData({ ...formData, [name]: e.target.value })}
          className={`w-full p-3 border-2 border-[#c8a4a5]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a67d6d] focus:border-transparent transition-all duration-200
            ${errors[name] ? 'border-red-500 bg-red-50' : 'hover:border-[#c8a4a5]'} 
            ${isTextarea ? 'h-32 resize-none' : ''}`}
        />
        {errors[name] && (
          <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {errors[name]}
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#d8c4b8]/20 to-[#d8c4b8]/10 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-[#c8a4a5] to-[#8c6c6b] text-white p-8">
            <h1 className="text-4xl font-bold text-white text-center">Create Bulk Order</h1>
            <p className="text-[#f5e6e0] mt-4 text-center text-lg">
              Complete the form below to submit your bulk order request
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {renderInput("Product Name", "productName", "text", "Enter product name")}
              {renderInput("Description", "description", "text", "Describe your product requirements", true)}
              
              <div className="mb-6">
                <label className="block text-[#5a4336] text-sm font-semibold mb-2">
                  Category <span className="text-[#c8a4a5]">*</span>
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full p-3 border-2 border-[#c8a4a5]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a67d6d] focus:border-transparent transition-all duration-200 hover:border-[#c8a4a5]"
                >
                  <option value="">Select Category</option>
                  {categoriesData.map((cat) => (
                    <option key={cat.title} value={cat.title}>{cat.title}</option>
                  ))}
                </select>
                {errors.category && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.category}
                  </p>
                )}
              </div>

              {renderInput("Quantity", "quantity", "number", "Enter quantity required")}
              {renderInput("Budget", "budget", "number", "Enter your budget")}
              {renderInput("Delivery Deadline", "deliveryDeadline", "date")}
              {renderInput("Shipping Address", "shippingAddress", "text", "Enter shipping address")}
              {renderInput("Packaging Requirements", "packagingRequirements", "text", "Specify packaging requirements", true, false)}
              {renderInput("Supplier Location Preference", "supplierLocationPreference", "text", "Enter preferred supplier location", false, false)}
              
              <div className="mb-6">
                <label className="block text-[#5a4336] text-sm font-semibold mb-2">Sample Image</label>
                <div className="border-2 border-dashed border-[#c8a4a5]/30 rounded-lg p-4 text-center hover:border-[#c8a4a5] transition-all duration-200">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Upload className="w-8 h-8 text-[#a67d6d] mx-auto mb-2" />
                    <p className="text-sm text-[#5a4336]">Click to upload or drag and drop</p>
                    <p className="text-xs text-[#a67d6d] mt-1">Maximum file size: 5MB</p>
                  </label>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full bg-gradient-to-r from-[#c8a4a5] to-[#8c6c6b] text-white py-4 px-6 rounded-lg text-lg font-semibold shadow-lg
                  transform transition-all duration-200 hover:scale-[1.02] hover:shadow-xl
                  ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : "Submit Bulk Order"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BulkOrderForm;