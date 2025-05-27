import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getPendingServices, moderateService } from "../../redux/actions/service";
import { toast } from "react-toastify";
import { 
  AlertCircle, AlertTriangle, CheckCircle, XCircle, Calendar, 
  MapPin, Phone, MessageSquare, Shield, Clock, ArrowLeft, 
  Trash2, ChevronDown, ChevronUp, User, Info, RefreshCw 
} from 'lucide-react';

const AdminServiceModeration = () => {
  const dispatch = useDispatch();
  const { pendingServices, isLoading, error, moderationSuccess } = useSelector((state) => state.services);
  const [selectedService, setSelectedService] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);

  useEffect(() => {
    dispatch(getPendingServices());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
    if (moderationSuccess) {
      toast.success("Service moderation completed successfully");
      setSelectedService(null);
      setShowRejectModal(false);
      setRejectionReason("");
    }
  }, [error, moderationSuccess]);

  const handleApproveService = async (serviceId) => {
    try {
      await dispatch(moderateService(serviceId, "approved", ""));
    } catch (error) {
      console.error("Error approving service:", error);
    }
  };

  const handleRejectService = async () => {
    if (!selectedService) return;
    
    try {
      await dispatch(moderateService(selectedService._id, "rejected", rejectionReason));
    } catch (error) {
      console.error("Error rejecting service:", error);
    }
  };

  const openRejectModal = (service) => {
    setSelectedService(service);
    setShowRejectModal(true);
  };

  const closeRejectModal = () => {
    setShowRejectModal(false);
    setRejectionReason("");
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // Function to render the moderation flags for a service
  const renderModerationFlags = (service) => {
    if (!service.moderationFlags) return null;
    
    const { isAbusive, isGibberish, flaggedFields } = service.moderationFlags;
    
    return (
      <div className="mb-6 bg-amber-50 rounded-lg p-4 border border-amber-200">
        <h4 className="font-semibold text-amber-800 mb-2 flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Content Moderation Flags
        </h4>
        
        <div className="space-y-2">
          {isAbusive && (
            <div className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-4 h-4" />
              <span>Potentially abusive content detected</span>
            </div>
          )}
          
          {isGibberish && (
            <div className="flex items-center gap-2 text-orange-600">
              <AlertCircle className="w-4 h-4" />
              <span>Potential gibberish or nonsensical text detected</span>
            </div>
          )}
          
          {flaggedFields && flaggedFields.length > 0 && (
            <div className="mt-2">
              <p className="text-sm font-medium text-amber-800">Flagged fields:</p>
              <ul className="mt-1 ml-6 list-disc text-sm text-amber-700">
                {flaggedFields.map((field, index) => (
                  <li key={index}>
                    <span className="font-medium">{field.field}</span>: 
                    {field.reason === "abusive" ? " Potentially inappropriate language" : " Potentially nonsensical text"}
                    {field.confidence && ` (${Math.round(field.confidence * 100)}% confidence)`}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {service.moderationFlags.moderationNotes && (
            <div className="mt-2 text-sm bg-amber-100 p-2 rounded border border-amber-200">
              <p className="font-medium text-amber-800">System notes:</p>
              <p className="text-amber-700">{service.moderationFlags.moderationNotes}</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render the Reject Modal
  const renderRejectModal = () => {
    if (!showRejectModal || !selectedService) return null;
    
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-800">Reject Service</h3>
            <button onClick={closeRejectModal} className="text-gray-500 hover:text-gray-700">
              <XCircle className="w-6 h-6" />
            </button>
          </div>
          
          <div className="mb-4">
            <p className="text-gray-600">
              You are about to reject the service "{selectedService.name}".
              Please provide a reason for rejection that will be shared with the service provider.
            </p>
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-2">Rejection Reason</label>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Explain why this service is being rejected..."
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={4}
            />
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              onClick={closeRejectModal}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cancel
            </button>
            <button
              onClick={handleRejectService}
              disabled={!rejectionReason.trim()}
              className={`px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 ${
                !rejectionReason.trim() ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              Confirm Rejection
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Service Detail View
  const renderServiceDetail = () => {
    if (!selectedService) return null;
    
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 overflow-y-auto max-h-[calc(100vh-200px)]">
        <div className="flex justify-between items-center mb-6">
          <button 
            onClick={() => setSelectedService(null)}
            className="flex items-center text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="w-5 h-5 mr-1" />
            Back to list
          </button>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => handleApproveService(selectedService._id)}
              className="flex items-center gap-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              <CheckCircle className="w-5 h-5" />
              Approve
            </button>
            <button 
              onClick={() => openRejectModal(selectedService)}
              className="flex items-center gap-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              <XCircle className="w-5 h-5" />
              Reject
            </button>
          </div>
        </div>
        
        <div className="bg-gray-100 rounded-lg p-4 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-1">{selectedService.name}</h2>
          <div className="flex items-center text-gray-600 mb-3">
            <Calendar className="w-4 h-4 mr-1" />
            Submitted on {formatDate(selectedService.createdAt)}
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium flex items-center gap-1">
              <AlertTriangle className="w-4 h-4" />
              Pending Review
            </span>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium flex items-center gap-1">
              <User className="w-4 h-4" />
              Seller: {selectedService.shop.name}
            </span>
            {selectedService.category && (
              <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                {selectedService.isCustomName ? "Custom Service" : "Standard Service"}
              </span>
            )}
          </div>
        </div>
        
        {/* Moderation Flags */}
        {renderModerationFlags(selectedService)}
        
        {/* Service Details */}
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Description</h3>
            <div className={`p-4 rounded-lg border ${
              selectedService.moderationFlags.flaggedFields?.some(f => f.field === 'description')
                ? 'bg-red-50 border-red-200'
                : 'bg-gray-50 border-gray-200'
            }`}>
              <p className="text-gray-700 whitespace-pre-line">{selectedService.description}</p>
              
              {selectedService.moderationFlags.flaggedFields?.some(f => f.field === 'description') && (
                <div className="mt-2 flex items-center gap-2 text-red-600 text-sm">
                  <AlertTriangle className="w-4 h-4" />
                  <span>This field has been flagged by content moderation</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Contact Information</h3>
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center gap-2">
                  <Phone className="w-5 h-5 text-gray-600" />
                  <span className="text-gray-700">{selectedService.contactInfo}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Location</h3>
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-gray-600" />
                  <span className="text-gray-700">{selectedService.location}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Availability</h3>
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(selectedService.availability).map(([day, schedule]) => (
                  <div key={day} className="flex items-center gap-2">
                    <Clock className={`w-5 h-5 ${schedule.available ? 'text-green-600' : 'text-gray-400'}`} />
                    <span className={`font-medium ${schedule.available ? 'text-gray-800' : 'text-gray-400'}`}>
                      {day}:
                    </span>
                    <span className={schedule.available ? 'text-gray-700' : 'text-gray-400'}>
                      {schedule.available 
                        ? `${schedule.startTime} - ${schedule.endTime}` 
                        : 'Not Available'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Shop Information</h3>
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5 text-gray-600" />
                  <span className="font-medium text-gray-800">Shop Name:</span>
                  <span className="text-gray-700">{selectedService.shop.name}</span>
                </div>
                {selectedService.shop.address && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-gray-600" />
                    <span className="font-medium text-gray-800">Shop Address:</span>
                    <span className="text-gray-700">{selectedService.shop.address}</span>
                  </div>
                )}
                {selectedService.shop.description && (
                  <div className="flex items-start gap-2">
                    <MessageSquare className="w-5 h-5 text-gray-600 mt-1" />
                    <span className="font-medium text-gray-800">Shop Description:</span>
                    <span className="text-gray-700">{selectedService.shop.description}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // List of pending services
  const renderServicesList = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-64">
          <RefreshCw className="w-10 h-10 text-gray-400 animate-spin mb-4" />
          <p className="text-gray-500">Loading pending services...</p>
        </div>
      );
    }
    
    if (!pendingServices || pendingServices.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-64 bg-gray-50 rounded-lg border border-gray-200">
          <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
          <h3 className="text-xl font-semibold text-gray-700">No Pending Services</h3>
          <p className="text-gray-500 mt-2 text-center">
            There are no services requiring moderation at this time.
          </p>
        </div>
      );
    }
    
    return (
      <div className="space-y-4">
        {pendingServices.map(service => (
          <div key={service._id} className="bg-white rounded-lg shadow border border-gray-200 hover:border-blue-300 transition-all">
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-medium text-gray-800 flex items-center gap-2">
                  {service.name}
                  {service.moderationFlags.isAbusive && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      Abusive
                    </span>
                  )}
                  {service.moderationFlags.isGibberish && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Gibberish
                    </span>
                  )}
                </h3>
                <span className="text-xs text-gray-500">
                  {formatDate(service.createdAt)}
                </span>
              </div>
              
              <div className="flex items-center text-sm text-gray-600 mb-3">
                <User className="w-4 h-4 mr-1" />
                <span>{service.shop.name}</span>
                <span className="mx-2">•</span>
                <MapPin className="w-4 h-4 mr-1" />
                <span>{service.location}</span>
              </div>
              
              <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                {service.description}
              </p>
              
              <div className="flex justify-between items-center mt-2">
                <button
                  onClick={() => setSelectedService(service)}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
                >
                  Review Details
                  <ChevronRight className="w-4 h-4 ml-1" />
                </button>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleApproveService(service._id)}
                    className="flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors"
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Approve
                  </button>
                  <button
                    onClick={() => openRejectModal(service)}
                    className="flex items-center px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
                  >
                    <XCircle className="w-4 h-4 mr-1" />
                    Reject
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      {/* Render the rejection modal */}
      {renderRejectModal()}
      
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Service Moderation</h1>
         
        </div>
        
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <Info className="h-5 w-5 text-blue-500" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">About Content Moderation</h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  Services offered by the sellers are automatically screened for abusive or inappropriate language. 
                  Those flagged as potentially problematic require manual review before they can be published.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <Shield className="w-6 h-6 text-blue-600" />
              Pending Services
              <span className="ml-2 px-2.5 py-0.5 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                {pendingServices?.length || 0}
              </span>
            </h2>
            <button 
              onClick={() => dispatch(getPendingServices())}
              className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
          
          {selectedService ? renderServiceDetail() : renderServicesList()}
        </div>
      </div>
    </div>
  );
};

// Helper component for the arrow icon
const ChevronRight = (props) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={props.width || 24} 
      height={props.height || 24} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={props.className}
    >
      <path d="m9 18 6-6-6-6"/>
    </svg>
  );
};

export default AdminServiceModeration;