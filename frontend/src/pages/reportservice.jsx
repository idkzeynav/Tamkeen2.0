import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AiOutlineClose } from 'react-icons/ai';
import { reportService } from '../redux/actions/service';

const ReportServiceModal = ({ serviceId, serviceName, isOpen, onClose }) => {
  const dispatch = useDispatch();
  const { reportLoading, reportSuccess, reportError, reportMessage } = useSelector((state) => state.services);
  
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [formErrors, setFormErrors] = useState({});

  // Common report reasons
  const reportReasons = [
    "Misleading information",
    "Inappropriate content",
    "Service unavailable",
    "False advertising",
    "Harassment or hate speech",
    "Spam or scam",
    "Other"
  ];

  // Reset form after successful submission
  useEffect(() => {
    if (reportSuccess) {
      setReason('');
      setDescription('');
      setFormErrors({});
      
      // Auto close after success
      const timer = setTimeout(() => {
        onClose();
        dispatch({ type: 'clearMessages' });
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [reportSuccess, dispatch, onClose]);

  // Validate form before submission
  const validateForm = () => {
    const errors = {};
    
    if (!reason) {
      errors.reason = "Please select a reason for reporting";
    }
    
    if (reason === "Other" && !description.trim()) {
      errors.description = "Please provide details for your report";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      await dispatch(reportService(serviceId, { 
        reason, 
        description 
      }));
    } catch (error) {
      console.error("Error reporting service:", error);
    }
  };

  // If modal is not open, don't render
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-auto bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="relative w-full max-w-md p-6 mx-4 bg-gradient-to-br from-white to-[#f8f4f1] rounded-2xl shadow-xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-[#a67d6d] hover:text-[#5a4336] transition-colors"
        >
          <AiOutlineClose size={20} />
        </button>
        
        {/* Modal Header */}
        <div className="mb-6 text-center">
          <h3 className="text-2xl font-bold text-[#5a4336]">Report Service</h3>
          <p className="text-[#a67d6d] mt-2">
            {serviceName && `Reporting: ${serviceName}`}
          </p>
        </div>
        
        {/* Success Message */}
        {reportSuccess && (
          <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded-lg">
            <p className="font-medium">Thank you for your report!</p>
            <p className="text-sm mt-1">Your report has been submitted and will be reviewed by our team.</p>
          </div>
        )}
        
        {/* Error Message */}
        {reportError && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg">
            <p className="font-medium">Error</p>
            <p className="text-sm mt-1">{reportError}</p>
          </div>
        )}
        
        {/* Report Form */}
        {!reportSuccess && (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Reason Selection */}
            <div>
              <label className="block text-[#5a4336] font-medium mb-2">
                Reason for reporting*
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className={`w-full px-4 py-2 border ${
                  formErrors.reason ? 'border-red-500' : 'border-[#d8c4b8]'
                } rounded-lg bg-white/80 focus:outline-none focus:ring-2 focus:ring-[#a67d6d]`}
                disabled={reportLoading}
              >
                <option value="">Select a reason</option>
                {reportReasons.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              {formErrors.reason && (
                <p className="mt-1 text-sm text-red-500">{formErrors.reason}</p>
              )}
            </div>
            
            {/* Description */}
            <div>
              <label className="block text-[#5a4336] font-medium mb-2">
                Additional details {reason === "Other" && "*"}
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Please provide more information about your report..."
                rows="4"
                className={`w-full px-4 py-2 border ${
                  formErrors.description ? 'border-red-500' : 'border-[#d8c4b8]'
                } rounded-lg bg-white/80 focus:outline-none focus:ring-2 focus:ring-[#a67d6d]`}
                disabled={reportLoading}
              ></textarea>
              {formErrors.description && (
                <p className="mt-1 text-sm text-red-500">{formErrors.description}</p>
              )}
            </div>
            
            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={reportLoading}
                className="w-full py-3 px-6 bg-gradient-to-r from-[#5a4336] to-[#a67d6d] text-white rounded-xl hover:from-[#a67d6d] hover:to-[#5a4336] transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {reportLoading ? "Submitting..." : "Submit Report"}
              </button>
            </div>
            
            <p className="text-xs text-[#a67d6d] text-center mt-4">
              Our team will review your report and take appropriate action if necessary.
            </p>
          </form>
        )}
      </div>
    </div>
  );
};

export default ReportServiceModal;