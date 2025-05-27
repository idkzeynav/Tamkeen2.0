import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getReportedServices, handleReportedService } from "../../redux/actions/service";
import { toast } from "react-toastify";
import { 
  AlertCircle, AlertTriangle, CheckCircle, XCircle, Calendar, 
  MapPin, Phone, MessageSquare, Shield, Clock, ArrowLeft, 
  Trash2, ChevronDown, ChevronUp, User, Info, RefreshCw,
  Flag, Users, FileText, BarChart2, Filter, ChevronRight
} from 'lucide-react';

const AdminReportedServices = () => {
  const dispatch = useDispatch();
  const { reportedServices, isLoading, error, success } = useSelector((state) => state.services);
  const [selectedService, setSelectedService] = useState(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [showActionModal, setShowActionModal] = useState(false);
  const [currentAction, setCurrentAction] = useState(""); // "block" or "dismiss"
  const [expandedReport, setExpandedReport] = useState(null);
  const [actionInProgress, setActionInProgress] = useState(false);
  const [processedServices, setProcessedServices] = useState([]);

  // Update handleServiceAction function
// Updated handleServiceAction function
const handleServiceAction = async () => {
  if (!selectedService || !currentAction) return;
  
  try {
    setActionInProgress(true);
    await dispatch(handleReportedService(selectedService._id, currentAction, adminNotes));
    
    // Add to processed services for immediate UI update
    setProcessedServices(prev => [...prev, selectedService._id]);
    
    // Close the modal and clear selection
    setShowActionModal(false);
    setSelectedService(null);
    setAdminNotes("");
    
    setActionInProgress(false);
  } catch (error) {
    setActionInProgress(false);
    console.error(`Error handling reported service: ${error}`);
  }
};

// Updated useEffect for success handling
useEffect(() => {
  if (error) {
    toast.error(error);
    dispatch({ type: 'clearErrors' });
  }
  
  if (success) {
    const actionText = currentAction === "block" ? "blocked" : "dismissed";
    toast.success(`Service report has been ${actionText} successfully`);
    
    // No need to refresh the list as the reducer now handles the removal
    // However, let's reset our local state
    setCurrentAction("");
    
    dispatch({ type: 'clearMessages' });
  }
}, [error, success, dispatch, currentAction]);



// Update useEffect for success handling
useEffect(() => {
  if (error) {
    toast.error(error);
    dispatch({ type: 'clearErrors' });
  }
  if (success) {
    const actionText = currentAction === "block" ? "blocked" : "dismissed";
    toast.success(`Service report has been ${actionText} successfully`);
    
    // Clear states
    setSelectedService(null);
    setShowActionModal(false);
    setAdminNotes("");
    
    // Refresh the list after short delay
    setTimeout(() => {
      dispatch(getReportedServices());
    }, 1000);
    
    dispatch({ type: 'clearMessages' });
  }
}, [error, success, dispatch, currentAction]);

  const openActionModal = (service, action) => {
    setSelectedService(service);
    setCurrentAction(action);
    setShowActionModal(true);
  };

  const closeActionModal = () => {
    setShowActionModal(false);
    setAdminNotes("");
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const toggleExpandReport = (reportId) => {
    setExpandedReport(expandedReport === reportId ? null : reportId);
  };

  // Filter out processed services
// Update filteredServices calculation
const filteredServices = reportedServices?.filter(
  service => !processedServices.includes(service._id)
) || [];

  // Render the Action Modal
  const renderActionModal = () => {
    if (!showActionModal || !selectedService) return null;
    
    const actionTitles = {
      block: "Block Service",
      dismiss: "Dismiss Reports"
    };
    
    const actionDescriptions = {
      block: "You are about to block this service due to user reports. The service will be removed from listings, and the seller will be notified.",
      dismiss: "You are about to dismiss all reports. The service will remain active."
    };
    
    const actionButtonStyles = {
      block: "bg-red-600 hover:bg-red-700",
      dismiss: "bg-blue-600 hover:bg-blue-700"
    };
    
    const actionButtonText = {
      block: "Block Service",
      dismiss: "Dismiss Reports"
    };
    
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-800">{actionTitles[currentAction]}</h3>
            <button onClick={closeActionModal} className="text-gray-500 hover:text-gray-700" disabled={actionInProgress}>
              <XCircle className="w-6 h-6" />
            </button>
          </div>
          
          <div className="mb-4">
            <p className="text-gray-600">
              {actionDescriptions[currentAction]}
            </p>
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-2">Admin Notes</label>
            <textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder={currentAction === "block" ? "Explain why this service is being blocked..." : "Add notes about this decision (optional)"}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={4}
              disabled={actionInProgress}
            />
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              onClick={closeActionModal}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
              disabled={actionInProgress}
            >
              Cancel
            </button>
            <button
              onClick={handleServiceAction}
              disabled={(currentAction === "block" && !adminNotes.trim()) || actionInProgress}
              className={`px-4 py-2 ${actionButtonStyles[currentAction]} text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                (currentAction === "block" && !adminNotes.trim()) || actionInProgress ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {actionInProgress ? (
                <span className="flex items-center">
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </span>
              ) : (
                actionButtonText[currentAction]
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Service Detail View with Reports
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
              onClick={() => openActionModal(selectedService, "dismiss")}
              className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              disabled={actionInProgress}
            >
              <CheckCircle className="w-5 h-5" />
              Dismiss
            </button>
            <button 
              onClick={() => openActionModal(selectedService, "block")}
              className="flex items-center gap-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              disabled={actionInProgress}
            >
              <XCircle className="w-5 h-5" />
              Block
            </button>
          </div>
        </div>
        
        <div className="bg-gray-100 rounded-lg p-4 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-1">{selectedService.name}</h2>
          <div className="flex items-center text-gray-600 mb-3">
            <Calendar className="w-4 h-4 mr-1" />
            Created on {formatDate(selectedService.createdAt)}
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium flex items-center gap-1">
              <Flag className="w-4 h-4" />
              Reported {selectedService.reportCount} {selectedService.reportCount === 1 ? 'time' : 'times'}
            </span>
            <span className={`px-3 py-1 ${
              selectedService.status === 'approved' ? 'bg-green-100 text-green-800' :
              selectedService.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            } rounded-full text-sm font-medium flex items-center gap-1`}>
              {selectedService.status === 'approved' ? <CheckCircle className="w-4 h-4" /> :
               selectedService.status === 'pending' ? <AlertTriangle className="w-4 h-4" /> :
               <XCircle className="w-4 h-4" />}
              Status: {selectedService.status.charAt(0).toUpperCase() + selectedService.status.slice(1)}
            </span>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium flex items-center gap-1">
              <User className="w-4 h-4" />
              Seller: {selectedService.shop.name}
            </span>
          </div>
        </div>
        
        {/* Reports Section */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Flag className="w-5 h-5 mr-2 text-red-500" />
            User Reports ({selectedService.reports ? selectedService.reports.length : 0})
          </h3>
          
          <div className="space-y-4">
            {selectedService.reports && selectedService.reports.length > 0 ? (
              selectedService.reports.map((report, index) => (
                <div 
                  key={index} 
                  className={`border rounded-lg overflow-hidden ${
                    report.status === 'pending' ? 'border-yellow-300 bg-yellow-50' :
                    report.status === 'reviewed' ? 'border-red-300 bg-red-50' :
                    'border-gray-300 bg-gray-50'
                  }`}
                >
                  <div 
                    className="p-4 cursor-pointer flex justify-between items-center"
                    onClick={() => toggleExpandReport(index)}
                  >
                    <div className="flex items-center">
                      <div className={`p-2 rounded-full mr-3 ${
                        report.status === 'pending' ? 'bg-yellow-200' :
                        report.status === 'reviewed' ? 'bg-red-200' :
                        'bg-gray-200'
                      }`}>
                        <Flag className={`w-5 h-5 ${
                          report.status === 'pending' ? 'text-yellow-700' :
                          report.status === 'reviewed' ? 'text-red-700' :
                          'text-gray-700'
                        }`} />
                      </div>
                      <div>
                        <div className="flex items-center">
                          <span className="font-medium text-gray-900">Reason: {report.reason}</span>
                          <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                            report.status === 'pending' ? 'bg-yellow-200 text-yellow-800' :
                            report.status === 'reviewed' ? 'bg-red-200 text-red-800' :
                            'bg-gray-200 text-gray-800'
                          }`}>
                            {report.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          Reported on {formatDate(report.reportedAt)}
                        </p>
                      </div>
                    </div>
                    <div>
                      {expandedReport === index ? (
                        <ChevronUp className="w-5 h-5 text-gray-600" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-600" />
                      )}
                    </div>
                  </div>
                  
                  {expandedReport === index && (
                    <div className="p-4 border-t border-gray-200 bg-white">
                      {report.description && (
                        <div className="mb-3">
                          <h4 className="text-sm font-medium text-gray-700 mb-1">Description:</h4>
                          <p className="text-gray-600 bg-gray-50 p-3 rounded border border-gray-200">
                            {report.description}
                          </p>
                        </div>
                      )}
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <h4 className="font-medium text-gray-700 mb-1">Reporter ID:</h4>
                          <p className="text-gray-600 bg-gray-50 p-2 rounded border border-gray-200 truncate">
                            {report.userId}
                          </p>
                        </div>
                        
                        {report.status !== 'pending' && (
                          <>
                            <div>
                              <h4 className="font-medium text-gray-700 mb-1">Reviewed By:</h4>
                              <p className="text-gray-600 bg-gray-50 p-2 rounded border border-gray-200 truncate">
                                {report.reviewedBy || 'N/A'}
                              </p>
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-700 mb-1">Reviewed On:</h4>
                              <p className="text-gray-600 bg-gray-50 p-2 rounded border border-gray-200">
                                {report.reviewedAt ? formatDate(report.reviewedAt) : 'N/A'}
                              </p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center h-24 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="text-gray-500">No reports found for this service</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Service Details */}
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Description</h3>
            <div className="p-4 rounded-lg border bg-gray-50 border-gray-200">
              <p className="text-gray-700 whitespace-pre-line">{selectedService.description}</p>
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
          
          {/* Show moderation notes if available */}
          {selectedService.moderationFlags && selectedService.moderationFlags.moderationNotes && (
            <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
              <h3 className="text-md font-semibold text-amber-800 mb-2 flex items-center">
                <Info className="w-5 h-5 mr-2" />
                Moderation Notes
              </h3>
              <p className="text-amber-700">{selectedService.moderationFlags.moderationNotes}</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  // List of reported services
  const renderServicesList = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-64">
          <RefreshCw className="w-10 h-10 text-gray-400 animate-spin mb-4" />
          <p className="text-gray-500">Loading reported services...</p>
        </div>
      );
    }
    
    if (!filteredServices || filteredServices.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-64 bg-gray-50 rounded-lg border border-gray-200">
          <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
          <h3 className="text-xl font-semibold text-gray-700">No Reported Services</h3>
          <p className="text-gray-500 mt-2 text-center">
            There are no services reported by users at this time.
          </p>
        </div>
      );
    }
    
    return (
      <div className="space-y-4">
        {filteredServices.map(service => (
          <div key={service._id} className="bg-white rounded-lg shadow border border-gray-200 hover:border-red-300 transition-all">
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-medium text-gray-800 flex items-center gap-2">
                  {service.name}
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    <Flag className="w-3 h-3 mr-1" />
                    {service.reportCount} {service.reportCount === 1 ? 'Report' : 'Reports'}
                  </span>
                  {service.status === 'pending' && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      Pending
                    </span>
                  )}
                </h3>
                <span className="text-xs text-gray-500">
                  Last reported: {formatDate(service.reports ? service.reports[service.reports.length - 1]?.reportedAt : service.lastModifiedAt)}
                </span>
              </div>
              
              <div className="flex items-center text-sm text-gray-600 mb-3">
                <User className="w-4 h-4 mr-1" />
                <span>{service.shop.name}</span>
                <span className="mx-2">•</span>
                <MapPin className="w-4 h-4 mr-1" />
                <span>{service.location}</span>
              </div>
              
              <div className="mb-3">
                <h4 className="text-sm font-medium text-gray-700 mb-1">Top Report Reasons:</h4>
                <div className="flex flex-wrap gap-2">
                  {service.reports && service.reports.slice(0, 2).map((report, index) => (
                    <span key={index} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                      {report.reason}
                    </span>
                  ))}
                  {service.reports && service.reports.length > 2 && (
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                      +{service.reports.length - 2} more
                    </span>
                  )}
                </div>
              </div>
              
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
                    onClick={() => openActionModal(service, "dismiss")}
                    className="flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                    disabled={actionInProgress}
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Dismiss
                  </button>
                  <button
                    onClick={() => openActionModal(service, "block")}
                    className="flex items-center px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
                    disabled={actionInProgress}
                  >
                    <XCircle className="w-4 h-4 mr-1" />
                    Block
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
      {/* Render the action modal */}
      {renderActionModal()}
      
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Service Reports</h1>
        </div>
        
        {/* Simplified info banner */}
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <Flag className="h-5 w-5 text-red-500" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">About Service Reports</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>
                  Services reported by users that need admin review. After taking action (block or dismiss), 
                  the service will be removed from this list automatically.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Simple count card */}
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-red-500 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Services Needing Review</p>
              <h3 className="text-2xl font-bold text-gray-800">{filteredServices.length}</h3>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <Flag className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <Flag className="w-6 h-6 text-red-600" />
              Reported Services
            </h2>
            <button 
              onClick={() => {
                dispatch(getReportedServices());
                setProcessedServices([]);
              }}
              className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
              disabled={actionInProgress}
            >
              <RefreshCw className={`w-4 h-4 ${actionInProgress ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
          
          {selectedService ? renderServiceDetail() : renderServicesList()}
        </div>
      </div>
    </div>
  );
};

export default AdminReportedServices;