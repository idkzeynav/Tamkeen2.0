import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { createService } from "../../redux/actions/service";
import { toast } from "react-toastify";
import { AlertCircle, Clock } from 'lucide-react';

const CreateService = () => {
  const { seller } = useSelector((state) => state.seller);
  const { success, error } = useSelector((state) => state.services);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    location: "",
    contactInfo: "",
  });

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
    if (error) {
      toast.error(error);
      setIsSubmitting(false);
    }
    if (success) {
      toast.success("Service created successfully!");
      setIsSubmitting(false);
      navigate("/dashboard-services");
      window.location.reload();
    }
  }, [dispatch, error, success, navigate]);

  const handleAvailabilityChange = (day, field, value) => {
    setAvailability((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value,
      },
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Service name is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    if (!formData.contactInfo.trim()) newErrors.contactInfo = 'Contact information is required';

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
      availability,
      shopId: seller._id,
    };
    dispatch(createService(newService));
  };

  const renderInput = (label, name, type = "text", placeholder, isTextarea = false) => {
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


    <div className="w-full h-[80vh] ">
      <div className="w-full max-w-4xl mx-auto py-8 px-4">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-[#c8a4a5] to-[#8c6c6b] text-white p-8">
            <h1 className="text-4xl font-bold text-white text-center">Create Service</h1>
            <p className="text-[#f5e6e0] mt-4 text-center text-lg">
              Complete the form below to create your new service
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {renderInput("Service Name", "name", "text", "Enter your service name")}
              {renderInput("Description", "description", "text", "Describe your service", true)}
              {renderInput("Location", "location", "text", "Enter service location")}
              {renderInput("Contact Information", "contactInfo", "text", "Enter your contact information")}

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