import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { AiOutlineDelete, AiOutlineEye, AiOutlineEdit, AiOutlineClockCircle, AiOutlineEnvironment, AiOutlinePhone } from "react-icons/ai";
import { getAllServicesShop, deleteService, updateService } from "../../redux/actions/service";
import { getAllServiceCategories } from "../../redux/actions/serviceCategory";
import { AlertCircle, ChevronDown, Search, MapPin, Clock, AlertTriangle, XCircle } from 'lucide-react';
import { City } from "country-state-city";
import Loader from "../Layout/Loader";
import { toast } from "react-toastify";

const AllServices = () => {
  const { shopServices, isLoading } = useSelector((state) => state.services);
  
  const { categories } = useSelector((state) => state.serviceCategoryReducer);
  const { seller } = useSelector((state) => state.seller);
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [serviceToDelete, setServiceToDelete] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Location dropdown state
  const [selectedCity, setSelectedCity] = useState("");
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);
  const [pakistanCities, setPakistanCities] = useState([]);
  const [citySearchTerm, setCitySearchTerm] = useState("");
  const [filteredCities, setFilteredCities] = useState([]);

  // For the combined name/category field
  const [serviceName, setServiceName] = useState("");
  const [isCustomName, setIsCustomName] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  
  // Initialize with default weekly availability
  const defaultAvailability = {
    Monday: { available: false, startTime: "09:00", endTime: "17:00" },
    Tuesday: { available: false, startTime: "09:00", endTime: "17:00" },
    Wednesday: { available: false, startTime: "09:00", endTime: "17:00" },
    Thursday: { available: false, startTime: "09:00", endTime: "17:00" },
    Friday: { available: false, startTime: "09:00", endTime: "17:00" },
    Saturday: { available: false, startTime: "09:00", endTime: "17:00" },
    Sunday: { available: false, startTime: "09:00", endTime: "17:00" },
  };
  
  const [formData, setFormData] = useState({
    description: '',
    contactInfo: '',
    availability: defaultAvailability,
  });

  // Add state to track and clear moderation notifications
  const [moderationNotice, setModerationNotice] = useState(null);

  useEffect(() => {
    dispatch(getAllServicesShop(seller._id));
    dispatch(getAllServiceCategories());
    
    // Get all cities in Pakistan - "PK" is the ISO code for Pakistan
    const cities = City.getCitiesOfCountry("PK");
    setPakistanCities(cities);
    setFilteredCities(cities);
    
    // Clear any moderation notices when component mounts
    setModerationNotice(null);
  }, [dispatch, seller._id]);

  // Filter cities based on search term
  useEffect(() => {
    if (!citySearchTerm.trim()) {
      setFilteredCities(pakistanCities);
    } else {
      const filtered = pakistanCities.filter(city => 
        city.name.toLowerCase().includes(citySearchTerm.toLowerCase())
      );
      setFilteredCities(filtered);
    }
  }, [citySearchTerm, pakistanCities]);

  // Handle confirmation dialog for delete
  const handleDeleteConfirmation = (id) => {
    setServiceToDelete(id);
    setDeleteDialogOpen(true);
  };

  // Handle actual delete of service
  const handleDelete = () => {
    if (!serviceToDelete) return;
    
    setIsDeleting(true);
    dispatch(deleteService(serviceToDelete))
      .then(() => {
        toast.success("Service deleted successfully!");
        dispatch(getAllServicesShop(seller._id));
        setDeleteDialogOpen(false);
        setIsDeleting(false);
      })
      .catch((error) => {
        toast.error("Error deleting service");
        console.error("Error deleting service:", error);
        setIsDeleting(false);
      });
  };

  // Open edit dialog and populate fields
  const handleEdit = (service) => {
    // Check if service is rejected - don't allow editing
    if (service.status === "rejected") {
      toast.error("This service was rejected by the admin and cannot be edited.");
      return;
    }
    
    setSelectedService(service);
    setServiceName(service.name || '');
    setSelectedCategory(service.category || '');
    setIsCustomName(service.isCustomName || false);
    setSelectedCity(service.location || '');
    
    // Ensure the availability has all days and default values if needed
    const completeAvailability = { ...defaultAvailability };
    
    // Merge existing availability data with defaults
    if (service.availability) {
      Object.keys(service.availability).forEach(day => {
        if (completeAvailability[day]) {
          completeAvailability[day] = {
            ...completeAvailability[day],
            ...service.availability[day]
          };
        }
      });
    }
    
    setFormData({
      description: service.description || '',
      contactInfo: service.contactInfo || '',
      availability: completeAvailability,
    });
    
    setErrors({});
    setOpen(true);
  };

  const handleAvailabilityChange = (day, field, value) => {
    setFormData((prev) => ({
      ...prev,
      availability: {
        ...prev.availability,
        [day]: {
          ...prev.availability[day],
          [field]: value,
        },
      },
    }));
  };

  const handleCategorySelection = (categoryId, categoryName) => {
    if (categoryId === "custom") {
      setIsCustomName(true);
      setSelectedCategory("");
      setServiceName(""); // Clear the service name field for custom input
    } else {
      setIsCustomName(false);
      setSelectedCategory(categoryId);
      setServiceName(categoryName); // Set the service name to the selected category name
    }
    setDropdownOpen(false);
  };

  const handleCitySelection = (cityName) => {
    setSelectedCity(cityName);
    setCityDropdownOpen(false);
    setCitySearchTerm(""); // Clear search when a city is selected
  };

  const handleCitySearchChange = (e) => {
    setCitySearchTerm(e.target.value);
    if (!cityDropdownOpen) {
      setCityDropdownOpen(true);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!serviceName.trim()) newErrors.name = 'Service name is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!selectedCity) newErrors.location = 'City is required';
    
    // Validate contact info for Pakistani mobile number
    if (!formData.contactInfo.trim()) {
      newErrors.contactInfo = 'Contact information is required';
    } else if (!/^03[0-9]{2}-[0-9]{7}$/.test(formData.contactInfo)) {
      newErrors.contactInfo = 'Invalid Pakistani mobile number. Must be in format: 03XX-XXXXXXX';
    }
    
    // Check if at least one day is available
    const hasAvailableDay = Object.values(formData.availability).some(day => day.available);
    if (!hasAvailableDay) {
      newErrors.availability = 'At least one day must be selected as available';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Update the service
  const handleUpdate = () => {
    if (!selectedService) return;
    
    if (!validateForm()) {
      toast.error('Please fill in all required fields correctly');
      return;
    }
    
    setIsSubmitting(true);

    const updatedService = {
      name: serviceName,
      location: selectedCity,
      isCustomName: isCustomName,
      category: isCustomName ? null : selectedCategory,
      description: formData.description,
      contactInfo: formData.contactInfo,
      availability: formData.availability,
    };

    console.log("Sending update data:", updatedService);

    dispatch(updateService(selectedService._id, updatedService))
      .then((data) => {
        setOpen(false);
        setIsSubmitting(false);
        
        if (data.requiresApproval) {
          setModerationNotice({
            message: "Your updated service has been sent for moderation review. It will be temporarily unavailable to customers until approved.",
            type: "warning"
          });
        } else {
          toast.success("Service updated successfully!");
        }
        
        dispatch(getAllServicesShop(seller._id));  // Refresh service list after update
      })
      .catch((error) => {
        setIsSubmitting(false);
        
        // Improved error handling
        let errorMessage = "Error updating service";
        
        if (error && typeof error === 'object') {
          if (error.message) {
            errorMessage = error.message;
          } else if (error.error) {
            errorMessage = error.error;
          }
          
          // Handle Joi validation errors
          if (error.details && Array.isArray(error.details)) {
            const firstError = error.details[0];
            if (firstError && firstError.message) {
              errorMessage = firstError.message;
            }
          }
        }
        
        toast.error(errorMessage);
        console.error("Error updating service: ", error);
      });
  };

  // Function to dismiss moderation notice
  const dismissModerationNotice = () => {
    setModerationNotice(null);
  };

  const renderServiceNameField = () => {
    const selectedCategoryName = categories.find(cat => cat._id === selectedCategory)?.name || "Select a service";
    
    return (
      <div className="mb-6">
        <label className="block text-[#5a4336] text-sm font-semibold mb-2">
          Service Name <span className="text-[#c8a4a5]">*</span>
        </label>
        
        <div className="relative">
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className={`w-full p-3 border-2 text-left flex justify-between items-center rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a67d6d] focus:border-transparent transition-all duration-200
              ${errors.name ? 'border-red-500 bg-red-50' : 'border-[#c8a4a5]/30 hover:border-[#c8a4a5]'}`}
          >
            <span className={selectedCategory || isCustomName ? "text-[#5a4336]" : "text-gray-400"}>
              {isCustomName ? (serviceName || "Enter custom service name") : (selectedCategory ? selectedCategoryName : "Select a service")}
            </span>
            <ChevronDown className="w-5 h-5 text-[#5a4336]" />
          </button>
          
          {dropdownOpen && (
            <div className="absolute z-10 mt-1 w-full bg-white border border-[#c8a4a5]/30 rounded-lg shadow-lg max-h-60 overflow-auto">
              {categories.map((category) => (
                <div
                  key={category._id}
                  onClick={() => handleCategorySelection(category._id, category.name)}
                  className="p-3 hover:bg-[#f8f5f2] cursor-pointer text-[#5a4336] transition-colors"
                >
                  {category.name}
                </div>
              ))}
              <div
                onClick={() => handleCategorySelection("custom")}
                className="p-3 hover:bg-[#f8f5f2] cursor-pointer text-[#5a4336] border-t border-[#c8a4a5]/20 transition-colors"
              >
                others
              </div>
            </div>
          )}
        </div>
        
        {errors.name && (
          <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {errors.name}
          </p>
        )}
        
        {isCustomName && (
          <div className="mt-3">
            <input
              type="text"
              placeholder="Enter custom service name"
              value={serviceName}
              onChange={(e) => setServiceName(e.target.value)}
              className={`w-full p-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a67d6d] focus:border-transparent transition-all duration-200
                ${errors.name ? 'border-red-500 bg-red-50' : 'border-[#c8a4a5]/30 hover:border-[#c8a4a5]'}`}
            />
          </div>
        )}
      </div>
    );
  };

  const renderLocationField = () => {
    return (
      <div className="mb-6">
        <label className="block text-[#5a4336] text-sm font-semibold mb-2">
          Location <span className="text-[#c8a4a5]">*</span>
        </label>
        
        <div className="relative">
          <button
            type="button"
            onClick={() => setCityDropdownOpen(!cityDropdownOpen)}
            className={`w-full p-3 border-2 text-left flex justify-between items-center rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a67d6d] focus:border-transparent transition-all duration-200
              ${errors.location ? 'border-red-500 bg-red-50' : 'border-[#c8a4a5]/30 hover:border-[#c8a4a5]'}`}
          >
            <span className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#8c6c6b]" />
              <span className={selectedCity ? "text-[#5a4336]" : "text-gray-400"}>
                {selectedCity || "Select a city in Pakistan"}
              </span>
            </span>
            <ChevronDown className="w-5 h-5 text-[#5a4336]" />
          </button>
          
          {cityDropdownOpen && (
            <div className="absolute z-10 mt-1 w-full bg-white border border-[#c8a4a5]/30 rounded-lg shadow-lg max-h-60 overflow-auto">
              <div className="sticky top-0 bg-white p-2 border-b border-[#c8a4a5]/20">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search cities..."
                    value={citySearchTerm}
                    onChange={handleCitySearchChange}
                    className="w-full p-2 pl-8 border border-[#c8a4a5]/30 rounded-md focus:outline-none focus:ring-2 focus:ring-[#a67d6d] focus:border-transparent"
                    autoFocus
                  />
                  <Search className="w-4 h-4 text-[#8c6c6b] absolute left-2 top-3" />
                </div>
              </div>
              
              {filteredCities.length > 0 ? (
                filteredCities.map((city) => (
                  <div
                    key={city.name + city.stateCode}
                    onClick={() => handleCitySelection(city.name)}
                    className="p-3 hover:bg-[#f8f5f2] cursor-pointer text-[#5a4336] transition-colors"
                  >
                    {city.name}
                  </div>
                ))
              ) : (
                <div className="p-3 text-center text-gray-500">No cities found</div>
              )}
            </div>
          )}
        </div>
        
        {errors.location && (
          <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {errors.location}
          </p>
        )}
      </div>
    );
  };

  if (!seller) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#d8c4b8]/20 to-[#d8c4b8]/10 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-[#5a4336] mx-auto mb-4" />
          <h2 className="text-2xl text-[#5a4336] font-semibold">Authentication Required</h2>
          <p className="text-[#a67d6d] mt-4">Please log in as a seller to manage services</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {isLoading ? (
        <Loader />
      ) : (
        <div className="w-full p-10">
          <h2 className="text-4xl font-bold text-[#5a4336] mb-8 text-center">Your Services</h2>
          
          {moderationNotice && (
            <div className={`mb-6 p-4 rounded-lg shadow-md flex justify-between items-center
              ${moderationNotice.type === "warning" ? "bg-amber-50 border-l-4 border-amber-500" : "bg-blue-50 border-l-4 border-blue-500"}`}>
              <div className="flex items-center gap-3">
                <AlertTriangle className={`w-6 h-6 ${moderationNotice.type === "warning" ? "text-amber-500" : "text-blue-500"}`} />
                <p className="text-gray-700">{moderationNotice.message}</p>
              </div>
              <button 
                onClick={dismissModerationNotice}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {shopServices?.map((service) => (
              <div 
                key={service._id} 
                className={`relative overflow-hidden rounded-xl bg-white shadow-lg transition-transform transform hover:scale-105 hover:shadow-xl
                  ${service.status === "pending" ? "border-2 border-amber-500" : ""}
                  ${service.status === "rejected" ? "border-2 border-red-500" : ""}`}
              >
                {service.status === "pending" && (
                  <div className="absolute top-0 left-0 right-0 bg-amber-500 text-white text-center py-1 flex items-center justify-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm font-medium">Pending Approval</span>
                  </div>
                )}
                
                {service.status === "rejected" && (
                  <div className="absolute top-0 left-0 right-0 bg-red-500 text-white text-center py-1 flex items-center justify-center gap-2">
                    <XCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">Rejected by Admin</span>
                  </div>
                )}
                
                <div className={`p-6 ${(service.status === "pending" || service.status === "rejected") ? "pt-10" : ""}`}>
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-2xl font-semibold text-[#5a4336]">{service.name}</h3>
                    <div className="flex gap-2">
                      {/* View button */}
                      <Link to={`/serviceShop/${service._id}`}>
                        <button className="p-2 rounded-full bg-[#d8c4b8] hover:bg-[#c8a4a5] transition-colors duration-300">
                          <AiOutlineEye size={20} className="text-[#5a4336]" />
                        </button>
                      </Link>
                      {/* Edit button - disabled for rejected services */}
                      <button 
                        onClick={() => handleEdit(service)}
                        className={`p-2 rounded-full transition-colors duration-300 ${
                          service.status === "rejected" 
                            ? "bg-gray-300 cursor-not-allowed" 
                            : "bg-[#d8c4b8] hover:bg-[#c8a4a5]"
                        }`}
                      >
                        <AiOutlineEdit size={20} className={`${service.status === "rejected" ? "text-gray-500" : "text-[#5a4336]"}`} />
                      </button>
                      {/* Delete button - always enabled */}
                      <button 
                        onClick={() => handleDeleteConfirmation(service._id)}
                        className="p-2 rounded-full bg-[#d8c4b8] hover:bg-[#c8a4a5] transition-colors duration-300"
                      >
                        <AiOutlineDelete size={20} className="text-[#5a4336]" />
                      </button>
                    </div>
                  </div>

                  <p className="text-gray-600 mb-4 line-clamp-2">{service.description}</p>
                  
                  <div className="space-y-2">
                    <div className="flex items-center text-[#a67d6d]">
                      <AiOutlineEnvironment className="mr-2" />
                      <span>{service.location}</span>
                    </div>
                    <div className="flex items-center text-[#a67d6d]">
                      <AiOutlinePhone className="mr-2" />
                      <span>{service.contactInfo}</span>
                    </div>
                    <div className="flex items-center text-[#a67d6d]">
                      <AiOutlineClockCircle className="mr-2" />
                      <span>
                        {Object.entries(service.availability || {})
                          .filter(([, info]) => info && info.available)
                          .length} days available
                      </span>
                    </div>
                    
                    {service.status === "pending" && (
                      <div className="mt-2 pt-2 border-t border-amber-200">
                        <p className="text-amber-600 text-sm">
                          <AlertTriangle className="w-4 h-4 inline mr-1" />
                          Under review - not visible to customers
                        </p>
                      </div>
                    )}
                    
                    {service.status === "rejected" && (
                      <div className="mt-2 pt-2 border-t border-red-200">
                        <p className="text-red-600 text-sm">
                          <XCircle className="w-4 h-4 inline mr-1" />
                          This service was rejected by the admin
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                
              </div>
            ))}
          </div>

          {/* Edit Service Dialog */}
          <Dialog 
            open={open}
            onClose={() => setOpen(false)}
            maxWidth="md"
            fullWidth
            PaperProps={{
              style: {
                borderRadius: '0.75rem',
                background: '#ffffff' 
              }
            }}
          >
            <DialogTitle>
              <h2 className="text-2xl font-bold text-[#5a4336]">Edit Service</h2>
            </DialogTitle>
            <DialogContent>
              <div className="pt-4 grid grid-cols-1 gap-4">
                <div>
                  {renderServiceNameField()}
                </div>
                <div>
                  <div className="mb-6">
                    <label className="block text-[#5a4336] text-sm font-semibold mb-2">
                      Description <span className="text-[#c8a4a5]">*</span>
                    </label>
                    <textarea
                      rows={4}
                      placeholder="Describe your service"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className={`w-full p-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a67d6d] focus:border-transparent transition-all duration-200 resize-none h-32
                        ${errors.description ? 'border-red-500 bg-red-50' : 'border-[#c8a4a5]/30 hover:border-[#c8a4a5]'}`}
                    />
                    {errors.description && (
                      <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    {renderLocationField()}
                  </div>
                  <div>
                    <div className="mb-6">
                      <label className="block text-[#5a4336] text-sm font-semibold mb-2">
                        Contact Information <span className="text-[#c8a4a5]">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Enter your contact information (Format: 03XX-XXXXXXX)"
                        value={formData.contactInfo}
                        onChange={(e) => setFormData({ ...formData, contactInfo: e.target.value })}
                        className={`w-full p-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a67d6d] focus:border-transparent transition-all duration-200
                          ${errors.contactInfo ? 'border-red-500 bg-red-50' : 'border-[#c8a4a5]/30 hover:border-[#c8a4a5]'}`}
                      />
                      {errors.contactInfo && (
                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {errors.contactInfo}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-[#5a4336] mb-4">Weekly Availability</h3>
                  {errors.availability && (
                    <p className="text-red-500 text-xs mb-3 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.availability}
                    </p>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(formData.availability || {}).map(([day, info]) => (
                      <div key={day} className="p-4 border-2 border-[#c8a4a5]/30 rounded-lg hover:border-[#c8a4a5] transition-all duration-200">
                        <div className="flex items-center justify-between mb-3">
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={info?.available}
                              onChange={(e) => handleAvailabilityChange(day, "available", e.target.checked)}
                              className="w-4 h-4 text-[#8c6c6b] rounded focus:ring-[#8c6c6b]"
                            />
                            <span className="font-medium text-[#5a4336]">{day}</span>
                          </label>
                        </div>

                        {info?.available && (
                          <div className="flex items-center gap-2">
                            <input
                              type="time"
                              value={info?.startTime || "09:00"}
                              onChange={(e) => handleAvailabilityChange(day, "startTime", e.target.value)}
                              className="p-2 border border-[#c8a4a5]/30 rounded-md focus:outline-none focus:ring-2 focus:ring-[#a67d6d] focus:border-transparent"
                            />
                            <span className="text-[#5a4336]">to</span>
                            <input
                              type="time"
                              value={info?.endTime || "17:00"}
                              onChange={(e) => handleAvailabilityChange(day, "endTime", e.target.value)}
                              className="p-2 border border-[#c8a4a5]/30 rounded-md focus:outline-none focus:ring-2 focus:ring-[#a67d6d] focus:border-transparent"
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </DialogContent>

            <DialogActions className="p-6 bg-gradient-to-r from-[#d8c4b8] to-[#c8a4a5]">
              <button
                onClick={() => setOpen(false)}
                className="px-6 py-2 rounded-lg bg-white/80 text-[#5a4336] hover:bg-white transition-colors duration-300"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                className={`px-6 py-2 rounded-lg bg-[#5a4336] text-white hover:bg-[#a67d6d] transition-colors duration-300 ml-4 flex items-center justify-center gap-2
                  ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                   
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : "Update Service"}
              </button>
            </DialogActions>
          </Dialog>

          {/* Delete Confirmation Dialog */}
          <Dialog
            open={deleteDialogOpen}
            onClose={() => setDeleteDialogOpen(false)}
            PaperProps={{
              style: {
                borderRadius: '0.75rem',
                background: '#ffffff'
              }
            }}
          >
            <DialogTitle>
              <h2 className="text-2xl font-bold text-[#5a4336]">Confirm Deletion</h2>
            </DialogTitle>
            <DialogContent>
              <p className="text-gray-700 py-2">
                Are you sure you want to delete this service? This action cannot be undone.
              </p>
            </DialogContent>
            <DialogActions className="p-4">
              <button
                onClick={() => setDeleteDialogOpen(false)}
                className="px-6 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors duration-300"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className={`px-6 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors duration-300 ml-4 flex items-center justify-center gap-2
                  ${isDeleting ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Deleting...
                  </>
                ) : "Delete"}
              </button>
            </DialogActions>
          </Dialog>

          {shopServices && shopServices.length === 0 && (
            <div className="text-center py-16">
              <div className="bg-white p-8 rounded-2xl shadow-lg inline-block">
                <AlertCircle className="w-16 h-16 text-[#c8a4a5] mx-auto mb-4" />
                <h3 className="text-2xl font-semibold text-[#5a4336] mb-4">No Services Yet</h3>
                <p className="text-[#a67d6d] mb-6">You haven't added any services to your shop.</p>
                <Link to="/dashboard-create-service">
                  <button className="px-6 py-3 bg-gradient-to-r from-[#d8c4b8] to-[#c8a4a5] text-white rounded-lg hover:opacity-90 transition-opacity duration-300">
                    Create Your First Service
                  </button>
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default AllServices;