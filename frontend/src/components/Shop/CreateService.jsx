import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { createService } from "../../redux/actions/service";
import { getAllServiceCategories } from "../../redux/actions/serviceCategory";
import { toast } from "react-toastify";
import { 
  AlertCircle, Clock, ChevronDown, MapPin, Search, 
  AlertTriangle, Info, ShieldAlert, HelpCircle
} from 'lucide-react';
import { City } from "country-state-city";

const CreateService = () => {
  const { seller } = useSelector((state) => state.seller);
  const { success, error, requiresApproval } = useSelector((state) => state.services);
  const { categories } = useSelector((state) => state.serviceCategoryReducer);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    description: "",
    contactInfo: "",
  });
  
  // Info tooltip state
  const [showDescriptionInfo, setShowDescriptionInfo] = useState(false);
  
  // Show moderation info modal
  const [showModerationModal, setShowModerationModal] = useState(false);
  
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
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State for weekly availability
  const [availability, setAvailability] = useState({
    Sunday: { startTime: "09:00", endTime: "17:00", available: false },
    Monday: { startTime: "09:00", endTime: "17:00", available: true },
    Tuesday: { startTime: "09:00", endTime: "17:00", available: true },
    Wednesday: { startTime: "09:00", endTime: "17:00", available: true },
    Thursday: { startTime: "09:00", endTime: "17:00", available: true },
    Friday: { startTime: "09:00", endTime: "17:00", available: true },
    Saturday: { startTime: "09:00", endTime: "17:00", available: false },
  });

  useEffect(() => {
    // Fetch all service categories
    dispatch(getAllServiceCategories());
    
    // Get all cities in Pakistan - "PK" is the ISO code for Pakistan
    const cities = City.getCitiesOfCountry("PK");
    setPakistanCities(cities);
    setFilteredCities(cities);
  }, [dispatch]);

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

  useEffect(() => {
    if (error) {
      toast.error(error);
      setIsSubmitting(false);
    }
    if (success) {
      
      if (requiresApproval) {
        // Show moderation notification instead of redirecting
        setShowModerationModal(true);
        setIsSubmitting(false);
      } else {
        toast.success("Service created successfully!");
        setIsSubmitting(false);
        navigate("/dashboard-services");
        window.location.reload();
      }
    }
  }, [dispatch, error, success, navigate, requiresApproval]);

  const handleAvailabilityChange = (day, field, value) => {
    setAvailability((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value,
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

  const toggleDescriptionInfo = () => {
    setShowDescriptionInfo(!showDescriptionInfo);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!serviceName.trim()) newErrors.name = 'Service name is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (formData.description.trim().length < 5) newErrors.description = 'Description should have at least 5 characters';
    if (formData.description.trim().length > 500) newErrors.description = 'Description should not exceed 500 characters';
    if (!selectedCity) newErrors.location = 'City is required';
    
    // Validate at least one day is available
    const hasAvailableDay = Object.values(availability).some(day => day.available);
    if (!hasAvailableDay) {
      newErrors.availability = 'At least one day must be available';
    }

    // Validate contact info
    if (!formData.contactInfo.trim()) {
      newErrors.contactInfo = 'Contact information is required';
    } else if (!/^03[0-9]{2}-[0-9]{7}$/.test(formData.contactInfo)) {
      newErrors.contactInfo = 'Invalid Pakistani mobile number. Must be in format: 03XX-XXXXXXX';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Please fill in all required fields correctly');
      return;
    }
    setIsSubmitting(true);

    const newService = {
      ...formData,
      name: serviceName, // Using the serviceName state for the name field
      location: selectedCity, // Use the selected city as the location
      availability,
      shopId: seller._id,
      isCustomName: isCustomName,
      category: isCustomName ? null : selectedCategory, // Set to category ID if not custom
    };
    dispatch(createService(newService));
  };

  const handleCloseModerationModal = () => {
    
    setShowModerationModal(false);
    navigate("/dashboard-services");
    window.location.reload();
  };

const renderDescriptionField = () => {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-2">
        <label className="block text-[#5a4336] text-sm font-semibold">
          Description <span className="text-[#c8a4a5]">*</span>
        </label>
        <div className="relative">
          <button 
            type="button"
            onClick={toggleDescriptionInfo}
            className="text-[#8c6c6b] hover:text-[#c8a4a5] transition-colors focus:outline-none"
            aria-label="Description information"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
          
          {showDescriptionInfo && (
            <div className="absolute left-full top-0 ml-2 z-50 w-80 p-4 bg-white border border-[#c8a4a5]/30 rounded-lg shadow-xl text-sm text-[#5a4336]">
              <div className="flex items-start gap-1">
                <Info className="w-7 h-5 text-[#8c6c6b] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium mb-1"> How to write a good service description:</p>
                  <ul className="list-disc list-inside space-y-1 ml-1">
                    <li>Clearly explain service details</li>
                    <li>Mention experience/qualifications</li>
                    <li>Must include pricing </li>
                    <li>Add service limitations</li>
                  </ul>
                </div>
              </div>
              <button 
                className="absolute top-2 right-2 text-[#8c6c6b] hover:text-[#c8a4a5]"
                onClick={toggleDescriptionInfo}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
      
      <textarea
        placeholder="Describe service in detail, including what's offered, price etc"
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        className={`w-full p-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a67d6d] focus:border-transparent transition-all duration-200 h-32 resize-none
          ${errors.description ? 'border-red-500 bg-red-50' : 'border-[#c8a4a5]/30 hover:border-[#c8a4a5]'}`}
      />
      {errors.description && (
        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
          <AlertCircle className="w-4 h-4" />
          {errors.description}
        </p>
      )}
    </div>
  );
};

  const renderInput = (label, name, type = "text", placeholder, isTextarea = false) => {
    // Skip the description field as we're handling it separately
    if (name === "description") return null;
    
    const Component = isTextarea ? 'textarea' : 'input';
    return (
      <div className="mb-6">
        <label className="block text-[#5a4336] text-sm font-semibold mb-2">
          {label} <span className="text-[#c8a4a5]">*</span>
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

  // Moderation Modal
  const renderModerationModal = () => {
    if (!showModerationModal) return null;
    
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 mx-4">
          <div className="text-center mb-6">
            <div className="mx-auto w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="w-8 h-8 text-amber-500" />
            </div>
            <h3 className="text-2xl font-semibold text-[#5a4336]">Content Moderation Notice</h3>
          </div>
          
          <div className="mb-6">
            <p className="text-[#8c6c6b] mb-4">
              Your service has been submitted successfully, but requires approval from an administrator before it becomes visible.
            </p>
            <p className="text-[#8c6c6b] mb-4">
              This is because our automated system has flagged some content that may need review. This is a normal part of our quality control process.
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-amber-500 mt-0.5" />
                <div>
                  <p className="text-sm text-amber-700 font-medium">What happens next?</p>
                  <p className="text-sm text-amber-600 mt-1">
                    An administrator will review your service listing shortly. You'll be notified once it's approved or if any changes are needed.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-center">
            <button
              onClick={handleCloseModerationModal}
              className="bg-gradient-to-r from-[#c8a4a5] to-[#8c6c6b] text-white py-3 px-6 rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-200"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (!seller) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#d8c4b8]/20 to-[#d8c4b8]/10 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-[#5a4336] mx-auto mb-4" />
          <h2 className="text-2xl text-[#5a4336] font-semibold">Authentication Required</h2>
          <p className="text-[#a67d6d] mt-4">Please log in as a seller to create a service</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-[80vh]">
      {/* Content Moderation Modal */}
      {renderModerationModal()}
      
      {/* Main Form Content */}
      <div className="w-full max-w-5xl mx-auto py-8 px-4">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-[#c8a4a5] to-[#8c6c6b] text-white p-8">
            <h1 className="text-4xl font-bold text-white text-center">Create Service</h1>
            <p className="text-[#f5e6e0] mt-4 text-center text-lg">
              Complete the form below to create your new service
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {renderServiceNameField()}
              {renderDescriptionField()}
              {renderLocationField()}
              {renderInput("Contact Information", "contactInfo", "text", "Enter your contact number (Format: 03XX-XXXXXXX)")}

              <div className="col-span-2">
                <h3 className="text-[#5a4336] text-lg font-semibold mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Weekly Availability
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.keys(availability).map((day) => (
                    <div key={day} className="p-4 border-2 border-[#c8a4a5]/30 rounded-lg hover:border-[#c8a4a5] transition-all duration-200">
                      <div className="flex items-center justify-between mb-3">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={availability[day].available}
                            onChange={(e) => handleAvailabilityChange(day, "available", e.target.checked)}
                            className="w-4 h-4 text-[#8c6c6b] rounded focus:ring-[#8c6c6b]"
                          />
                          <span className="font-medium text-[#5a4336]">{day}</span>
                        </label>
                      </div>

                      {availability[day].available && (
                        <div className="flex items-center gap-2">
                          <input
                            type="time"
                            value={availability[day].startTime}
                            onChange={(e) => handleAvailabilityChange(day, "startTime", e.target.value)}
                            className="p-2 border border-[#c8a4a5]/30 rounded-md focus:outline-none focus:ring-2 focus:ring-[#a67d6d] focus:border-transparent"
                          />
                          <span className="text-[#5a4336]">to</span>
                          <input
                            type="time"
                            value={availability[day].endTime}
                            onChange={(e) => handleAvailabilityChange(day, "endTime", e.target.value)}
                            className="p-2 border border-[#c8a4a5]/30 rounded-md focus:outline-none focus:ring-2 focus:ring-[#a67d6d] focus:border-transparent"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                {errors.availability && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1 col-span-2">
                    <AlertCircle className="w-4 h-4" />
                    {errors.availability}
                  </p>
                )}
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
                ) : "Create Service"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateService;