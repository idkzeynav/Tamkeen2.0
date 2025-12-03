import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createSupplier, updateSupplier, getSupplier, clearErrors, clearMessages } from "../../redux/actions/supplier";
import { useParams, useNavigate } from "react-router-dom";
import { AiOutlinePlusCircle, AiOutlineMinusCircle } from 'react-icons/ai';
import { MapPin, Phone, Mail, Globe, Check, X } from 'lucide-react';

const PREDEFINED_CATEGORIES = [
        'Clothing and Textiles',
        'Electronics',
        'Groceries and Food Items',
        'Household Items',
        'Jewelry and Accessories',
        'Miscellaneous'
];

const SUPPLIER_STATUSES = [
  'active',
  'inactive',
  'pending_verification',
  'suspended'
];

const AdminSupplierForm = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { supplier, isLoading, error, message, success } = useSelector((state) => state.supplier);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    email: "",
    phone: "",
    website: "",
    address: "", // Added address field
    coordinates: { latitude: "", longitude: "" },
    materials: [],
    businessHours: "",
    minimumOrder: "",
    status: "active",
    tags: [],
    socialMedia: {},
    images: []
  });

  const [formErrors, setFormErrors] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);

  useEffect(() => {
    if (id) {
      setIsEditing(true);
      dispatch(getSupplier(id));
    }
  }, [id, dispatch]);

  useEffect(() => {
    if (isEditing && supplier && supplier._id === id) {
      setFormData({
        name: supplier.name || "",
        description: supplier.description || "",
        email: supplier.email || "",
        phone: supplier.phone || "",
        website: supplier.website || "",
        address: supplier.address || "",
        coordinates: supplier.coordinates || { latitude: "", longitude: "" },
        materials: supplier.materials ? supplier.materials.map(m => m.category) : [],
        businessHours: supplier.businessHours || "",
        minimumOrder: supplier.minimumOrder || "",
        status: supplier.status || "active",
        tags: supplier.tags || [],
        socialMedia: supplier.socialMedia || {},
        images: supplier.images || []
      });
    }
  }, [supplier, isEditing, id]);

// AdminSupplierForm.js
useEffect(() => {
  if (success && message) {
    setShowSuccessAlert(true);
    const timer = setTimeout(() => {
      setShowSuccessAlert(false);
      dispatch(clearMessages()); // Clear success message
      navigate("/admin/suppliers");
    }, 2000);

    return () => clearTimeout(timer);
  }
}, [success, message, navigate, dispatch]);

  const validatePhone = (phone) => {
    if (!phone) return false;
    // Match backend regex: /^(\+92[3][0-5]\d{8}|051\d{7,8})$/
    return /^(\+92[3][0-5]\d{8}|051\d{7,8})$/.test(phone);
  };

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    setFormErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleCoordinateChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      coordinates: { ...prev.coordinates, [field]: value }
    }));
  };

  const handleCategoryToggle = (category) => {
    setFormData(prev => ({
      ...prev,
      materials: prev.materials.includes(category)
        ? prev.materials.filter(cat => cat !== category)
        : [...prev.materials, category]
    }));
  };

  const handleArrayField = (field, index, value) => {
    const newArray = [...formData[field]];
    newArray[index] = value;
    setFormData(prev => ({ ...prev, [field]: newArray }));
  };

  const addArrayField = (field) => {
    setFormData(prev => ({ ...prev, [field]: [...prev[field], ""] }));
  };

  const removeArrayField = (field, index) => {
    if (formData[field].length > 1) {
      const newArray = formData[field].filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, [field]: newArray }));
    }
  };

 const validateForm = () => {
  const errors = {};
  const lat = parseFloat(formData.coordinates.latitude);
  const lng = parseFloat(formData.coordinates.longitude);

  // Existing validations
  if (!formData.name.trim()) errors.name = "Supplier name is required";
  if (!formData.email.trim()) errors.email = "Email is required";
  else if (!validateEmail(formData.email)) errors.email = "Invalid email format";
  if (!formData.phone.trim()) errors.phone = "Phone number is required";
  else if (!validatePhone(formData.phone)) errors.phone = "Invalid phone format. Use +923XXXXXXXXX for mobile or 051XXXXXXX for PTCL";
  if (!formData.address.trim()) errors.address = "Address is required";
  
  // Coordinate validation
if (formData.coordinates.latitude === "" || formData.coordinates.longitude === "") {
    errors.coordinates = "Both latitude and longitude are required";
  } else if (isNaN(lat) || isNaN(lng)) {
    errors.coordinates = "Invalid latitude or longitude values";
  } else if (lat < -90 || lat > 90) {
    errors.coordinates = "Latitude must be between -90 and 90";
  } else if (lng < -180 || lng > 180) {
    errors.coordinates = "Longitude must be between -180 and 180";
  }
  
  if (formData.materials.length === 0) errors.materials = "Select at least one material";

  // Minimum order validation
  if (formData.minimumOrder.trim()) {
    const orderValue = parseFloat(formData.minimumOrder.replace(/[^\d.]/g, ''));
    if (isNaN(orderValue) || orderValue < 100) {
      errors.minimumOrder = "Minimum order must be at least 100kg";
    }
  }

  setFormErrors(errors);
  return Object.keys(errors).length === 0;
};

const handleSubmit = (e) => {
  e.preventDefault();
  if (!validateForm()) return;
  
  // Transform materials to match backend model structure
  const transformedMaterials = formData.materials.map(material => ({
    category: material,
    subcategories: [],
    priceRange: {},
    bulkDiscount: {}
  }));

  const supplierData = {
    ...formData,
    materials: transformedMaterials,
    coordinates: {
      latitude: parseFloat(formData.coordinates.latitude),
      longitude: parseFloat(formData.coordinates.longitude)
    }
  };

  if (isEditing) {
    // For updates, keep existing material data structure if it exists
    const existingSupplier = supplier;
    if (existingSupplier && existingSupplier.materials) {
      supplierData.materials = formData.materials.map(categoryName => {
        // Find existing material data for this category
        const existingMaterial = existingSupplier.materials.find(m => m.category === categoryName);
        return existingMaterial || {
          category: categoryName,
          subcategories: [],
          priceRange: {},
          bulkDiscount: {}
        };
      });
    }
    dispatch(updateSupplier(id, supplierData));
  } else {
    dispatch(createSupplier(supplierData));
  }
};

const handlePhoneChange = (e) => {
  const value = e.target.value;
  const phoneType = value.startsWith('051') ? 'ptcl' : 'mobile';
  
  let formattedPhone = value;
  if (phoneType === 'mobile') {
    // Remove all non-digit characters except leading '+'
    let cleanValue = value.replace(/[^+\d]/g, '');
    // Ensure starts with +92 and followed by exactly 10 digits starting with 3[0-5]
    if (cleanValue.startsWith('+92')) {
      cleanValue = '+92' + cleanValue.substring(3).replace(/\D/g, '');
      if (cleanValue.length > 3) {
        const thirdDigit = cleanValue.charAt(3);
        if (thirdDigit < '0' || thirdDigit > '5') {
          // Invalid third digit, truncate
          cleanValue = cleanValue.substring(0, 3) + cleanValue.substring(4);
        }
      }
      formattedPhone = cleanValue.substring(0, 13); // +92 3 0-5 followed by 8 digits
    }
  } else {
    // PTCL: 051 followed by 7-8 digits
    let cleanValue = value.replace(/\D/g, '');
    if (cleanValue.startsWith('051')) {
      formattedPhone = cleanValue.substring(0, 11); // 051 + 7-8 digits (max 11)
    }
  }
  
  setFormData(prev => ({ ...prev, phone: formattedPhone }));
};

  if (showSuccessAlert) {
    return (
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white border-2 border-green-500 text-green-700 px-8 py-6 rounded-xl shadow-xl flex items-center gap-4">
          <Check className="w-6 h-6 text-green-600" />
          <span className="text-lg font-medium">{message}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#e6d8d8] py-8">
      <div className="max-w-4xl w-full p-6 bg-white rounded-lg shadow-lg mx-4">
        <h2 className="text-2xl font-semibold text-[#5a4336] mb-6 text-center">
          {isEditing ? "Update Supplier" : "Create Supplier"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg flex items-center gap-2">
              <X className="w-5 h-5" />
              <span>{error}</span>
            </div>
          )}

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col">
              <label htmlFor="name" className="text-[#5a4336] text-lg">
                Supplier Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="p-3 mt-2 rounded-lg border border-[#c8a4a5] focus:outline-none focus:ring-2 focus:ring-[#c8a4a5] transition-all"
                placeholder="Supplier name"
                required
              />
              {formErrors.name && <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>}
            </div>

            <div className="flex flex-col">
              <label htmlFor="status" className="text-[#5a4336] text-lg">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="p-3 mt-2 rounded-lg border border-[#c8a4a5] focus:outline-none focus:ring-2 focus:ring-[#c8a4a5] transition-all"
              >
                {SUPPLIER_STATUSES.map(status => (
                  <option key={status} value={status}>
                    {status.replace('_', ' ').toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col">
            <label htmlFor="description" className="text-[#5a4336] text-lg">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="3"
              className="p-3 mt-2 rounded-lg border border-[#c8a4a5] focus:outline-none focus:ring-2 focus:ring-[#c8a4a5] transition-all"
              placeholder="Supplier description"
            />
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col">
              <label htmlFor="email" className="text-[#5a4336] text-lg">
                Email *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="p-3 mt-2 rounded-lg border border-[#c8a4a5] focus:outline-none focus:ring-2 focus:ring-[#c8a4a5] transition-all"
                placeholder="supplier@email.com"
                required
              />
              {formErrors.email && <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>}
            </div>

            <div className="flex flex-col">
              <label htmlFor="phone" className="text-[#5a4336] text-lg">
                Phone *
              </label>
              <input
                type="text"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handlePhoneChange}
                className="p-3 mt-2 rounded-lg border border-[#c8a4a5] focus:outline-none focus:ring-2 focus:ring-[#c8a4a5] transition-all"
                placeholder="+923xxxxxxxxx or 051xxxxxxx"
                required
              />
              {formErrors.phone && <p className="text-red-500 text-sm mt-1">{formErrors.phone}</p>}
            </div>
          </div>

          <div className="flex flex-col">
            <label htmlFor="address" className="text-[#5a4336] text-lg">
              Address *
            </label>
            <textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              rows="2"
              className="p-3 mt-2 rounded-lg border border-[#c8a4a5] focus:outline-none focus:ring-2 focus:ring-[#c8a4a5] transition-all"
              placeholder="Write down the address or area"
              required
            />
            {formErrors.address && <p className="text-red-500 text-sm mt-1">{formErrors.address}</p>}
          </div>

          <div className="flex flex-col">
            <label htmlFor="website" className="text-[#5a4336] text-lg">
              Website
            </label>
            <input
              type="url"
              id="website"
              name="website"
              value={formData.website}
              onChange={handleInputChange}
              className="p-3 mt-2 rounded-lg border border-[#c8a4a5] focus:outline-none focus:ring-2 focus:ring-[#c8a4a5] transition-all"
              placeholder="https://example.com"
            />
          </div>

          {/* Location Coordinates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col">
              <label htmlFor="latitude" className="text-[#5a4336] text-lg">
                Latitude *
              </label>
              <input
                type="number"
                id="latitude"
                step="any"
                value={formData.coordinates.latitude}
                onChange={(e) => handleCoordinateChange('latitude', e.target.value)}
                className="p-3 mt-2 rounded-lg border border-[#c8a4a5] focus:outline-none focus:ring-2 focus:ring-[#c8a4a5] transition-all"
                placeholder="Enter latitude"
                required
              />
            </div>
            
            <div className="flex flex-col">
              <label htmlFor="longitude" className="text-[#5a4336] text-lg">
                Longitude *
              </label>
              <input
                type="number"
                id="longitude"
                step="any"
                value={formData.coordinates.longitude}
                onChange={(e) => handleCoordinateChange('longitude', e.target.value)}
                className="p-3 mt-2 rounded-lg border border-[#c8a4a5] focus:outline-none focus:ring-2 focus:ring-[#c8a4a5] transition-all"
                placeholder="Enter longitude"
                required
              />
            </div>
          </div>
          {formErrors.coordinates && <p className="text-red-500 text-sm mt-2">{formErrors.coordinates}</p>}

          {/* Materials */}
          <div className="flex flex-col">
            <label className="text-[#5a4336] text-lg mb-4">
              Materials Offered *
            </label>
            <div className="grid grid-cols-2 gap-4">
              {PREDEFINED_CATEGORIES.map((category) => (
                <div key={category} className="flex items-center">
                  <input
                    type="checkbox"
                    id={category}
                    checked={formData.materials.includes(category)}
                    onChange={() => handleCategoryToggle(category)}
                    className="w-4 h-4 text-[#c8a4a5] border-[#c8a4a5] rounded focus:ring-[#c8a4a5] focus:ring-offset-0"
                    style={{
                      '--tw-ring-color': '#c8a4a5',
                      'accentColor': '#c8a4a5'
                    }}
                  />
                  <label htmlFor={category} className="ml-2 text-[#5a4336]">
                    {category}
                  </label>
                </div>
              ))}
            </div>
            {formErrors.materials && <p className="text-red-500 text-sm mt-2">{formErrors.materials}</p>}
          </div>

          {/* Business Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col">
              <label htmlFor="businessHours" className="text-[#5a4336] text-lg">
                Business Hours
              </label>
              <input
                type="text"
                id="businessHours"
                name="businessHours"
                value={formData.businessHours}
                onChange={handleInputChange}
                className="p-3 mt-2 rounded-lg border border-[#c8a4a5] focus:outline-none focus:ring-2 focus:ring-[#c8a4a5] transition-all"
                placeholder="Mon-Fri: 9AM-6PM"
              />
            </div>

            <div className="flex flex-col">
              <label htmlFor="minimumOrder" className="text-[#5a4336] text-lg">
                Minimum Order
              </label>
              <input
                type="text"
                id="minimumOrder"
                name="minimumOrder"
                value={formData.minimumOrder}
                onChange={handleInputChange}
                className="p-3 mt-2 rounded-lg border border-[#c8a4a5] focus:outline-none focus:ring-2 focus:ring-[#c8a4a5] transition-all"
                placeholder="e.g., 100 kg (minimum 100kg required)"
              />
              {formErrors.minimumOrder && <p className="text-red-500 text-sm mt-1">{formErrors.minimumOrder}</p>}
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 justify-end pt-6">
            <button
              type="button"
              onClick={() => navigate("/admin-suppliers")}
              className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-all duration-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="bg-[#c8a4a5] text-white py-3 px-8 rounded-full transition-all duration-300 hover:bg-[#8c6c6b] transform hover:scale-105 disabled:opacity-50 disabled:transform-none flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  {isEditing ? "Saving..." : "Creating..."}
                </>
              ) : isEditing ? "Update Supplier" : "Create Supplier"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminSupplierForm;