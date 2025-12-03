import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { MapPin, X, Navigation, AlertCircle, Check, Filter, ArrowLeft, Loader, Mail, Star, Package, Users, Phone } from 'lucide-react';
import axios from 'axios';
import { server } from '../../server'; // Import server configuration
import { toast } from 'react-toastify'; // Import toast for notifications

// Predefined categories for suppliers
const SUPPLIER_CATEGORIES = [
    'Clothing and Textiles',
    'Electronics',
    'Groceries and Food Items',
    'Household Items', 
    'Jewelry and Accessories',
    'Miscellaneous'
];

// Custom Alert Component
const CustomAlert = ({ message, type = 'success' }) => (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
      <div className={`bg-white border-2 ${type === 'success' ? 'border-[#c8a4a5]' : 'border-red-300'} text-[#5a4336] px-8 py-6 rounded-xl shadow-xl flex items-center gap-4 transform animate-slideIn`}>
        <div className={`${type === 'success' ? 'bg-[#c8a4a5]/20' : 'bg-red-100'} rounded-full p-2`}>
          {type === 'success' ? (
            <Check className="w-6 h-6 text-[#c8a4a5]" />
          ) : (
            <AlertCircle className="w-6 h-6 text-red-500" />
          )}
        </div>
        <span className="text-lg font-medium">{message}</span>
      </div>
    </div>
);

// Email Template Modal
const EmailModal = ({ supplier, onClose, onSend }) => {



     const getSupplierMaterials = (supplier) => {
        let materials = [];
        
        // Check materialType (string)
        if (supplier?.materialType) {
            materials.push(supplier.materialType);
        }
        
        // Check materials array
        if (supplier?.materials && Array.isArray(supplier.materials)) {
            supplier.materials.forEach(material => {
                if (material.category && !materials.includes(material.category)) {
                    materials.push(material.category);
                }
            });
        }
        
        return materials.length > 0 ? materials.join(', ') : 'Not specified';
    };

    const [emailData, setEmailData] = useState({
        materialType: supplier?.materialType || (supplier?.materials && supplier?.materials[0]?.category) || '', // Pre-fill with supplier's material type
        quantity: '',
        additionalNotes: '',
        deliveryLocation: '',
        buyerName: '',
        buyerPhone: ''
    });
    const [isLoading, setIsLoading] = useState(false);

   // Validation function for quantity
    const validateQuantity = (quantity) => {
        const numericValue = parseFloat(quantity.replace(/[^\d.]/g, ''));
        return numericValue >= 100;
    };

    
    

 const emailTemplate = `
Hello ${supplier?.supplierName || supplier?.name || 'Dear Supplier'},

I am contacting you because I need raw materials through your services.

Details:
• Required Material: ${emailData.materialType}
• Quantity: ${emailData.quantity}
${emailData.deliveryLocation ? `• Delivery Address: ${emailData.deliveryLocation}` : ''}

${emailData.additionalNotes ? `Additional Information: ${emailData.additionalNotes}` : ''}

Buyer Details:
• Name: ${emailData.buyerName}
${emailData.buyerPhone ? `• Phone: ${emailData.buyerPhone}` : ''}

Please let me know about your availability and pricing.

Thank you
    `.trim();

   const handleSend = async () => {
        if (!emailData.materialType || !emailData.quantity || !emailData.buyerName) {
            toast.error('Please enter material type, quantity, and your name');
            return;
        }
        // Validate minimum quantity
        if (!validateQuantity(emailData.quantity)) {
            toast.error('Minimum bulk order quantity must be at least 100 kg');
            return;
        }
        
        setIsLoading(true);
        
        try {
            await onSend({
                supplierId: supplier._id,
                materialType: emailData.materialType,
                quantity: emailData.quantity,
                deliveryLocation: emailData.deliveryLocation,
                additionalNotes: emailData.additionalNotes,
                buyerName: emailData.buyerName,
                buyerPhone: emailData.buyerPhone
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-white rounded-2xl p-6 max-w-2xl w-full shadow-xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <Mail className="text-[#c8a4a5]" />
                        <h3 className="text-xl font-semibold text-[#5a4336]">
                            Send Email to {supplier?.supplierName || supplier?.name}
                        </h3>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600" disabled={isLoading}>
                        <X size={24} />
                    </button>
                </div>

                <div className="space-y-4 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-[#5a4336] mb-2">
                            Your Name *
                        </label>
                        <input
                            type="text"
                            value={emailData.buyerName}
                            onChange={(e) => setEmailData({...emailData, buyerName: e.target.value})}
                            placeholder="Your name"
                            className="w-full p-3 rounded-lg border border-[#c8a4a5] focus:outline-none focus:ring-2 focus:ring-[#c8a4a5]"
                            disabled={isLoading}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[#5a4336] mb-2">
                            Your Phone Number
                        </label>
                        <input
                            type="text"
                            value={emailData.buyerPhone}
                            onChange={(e) => setEmailData({...emailData, buyerPhone: e.target.value})}
                            placeholder="+92 300 0000000"
                            className="w-full p-3 rounded-lg border border-[#c8a4a5] focus:outline-none focus:ring-2 focus:ring-[#c8a4a5]"
                            disabled={isLoading}
                        />
                    </div>

 <div>
                        <label className="block text-sm font-medium text-[#5a4336] mb-2">
                            Required Material Type *
                        </label>
                        <textarea
                            value={emailData.materialType}
                            onChange={(e) => setEmailData({...emailData, materialType: e.target.value})}
                            placeholder="Material types offered by this supplier"
                            rows={2}
                            className="w-full p-3 rounded-lg border border-[#c8a4a5] focus:outline-none focus:ring-2 focus:ring-[#c8a4a5] bg-gray-50 resize-none"
                            disabled={true} // Keep it read-only since it's supplier-specific
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            This supplier specializes in: {getSupplierMaterials(supplier)}
                        </p>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-[#5a4336] mb-2">
                            Quantity * (Minimum 100 kg)
                        </label>
                        <input
                            type="text"
                            value={emailData.quantity}
                            onChange={(e) => setEmailData({...emailData, quantity: e.target.value})}
                            placeholder="e.g. 150 kg, 200 pieces, etc. (min 100 kg)"
                            className={`w-full p-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#c8a4a5] ${
                                emailData.quantity && !validateQuantity(emailData.quantity) 
                                    ? 'border-red-300 bg-red-50' 
                                    : 'border-[#c8a4a5]'
                            }`}
                            disabled={isLoading}
                        />
                        {emailData.quantity && !validateQuantity(emailData.quantity) && (
                            <p className="text-xs text-red-500 mt-1">
                                ⚠️ Minimum bulk order quantity must be at least 100 kg
                            </p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                            Bulk orders start from 100 kg minimum
                        </p>
                    </div>        
                    <div>
                        <label className="block text-sm font-medium text-[#5a4336] mb-2">
                            Delivery Address
                        </label>
                        <input
                            type="text"
                            value={emailData.deliveryLocation}
                            onChange={(e) => setEmailData({...emailData, deliveryLocation: e.target.value})}
                            placeholder="Your address"
                            className="w-full p-3 rounded-lg border border-[#c8a4a5] focus:outline-none focus:ring-2 focus:ring-[#c8a4a5]"
                            disabled={isLoading}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[#5a4336] mb-2">
                            Additional Notes
                        </label>
                        <textarea
                            value={emailData.additionalNotes}
                            onChange={(e) => setEmailData({...emailData, additionalNotes: e.target.value})}
                            placeholder="Any special requirements or notes"
                            rows={3}
                            className="w-full p-3 rounded-lg border border-[#c8a4a5] focus:outline-none focus:ring-2 focus:ring-[#c8a4a5]"
                            disabled={isLoading}
                        />
                    </div>
                </div>

                <div className="mb-6">
                    <label className="block text-sm font-medium text-[#5a4336] mb-2">
                        Email Preview:
                    </label>
                    <div className="bg-gray-50 p-4 rounded-lg text-sm whitespace-pre-line border max-h-48 overflow-y-auto">
                        {emailTemplate}
                    </div>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={handleSend}
                        disabled={isLoading || !emailData.materialType || !emailData.quantity || !emailData.buyerName}
                        className="flex-1 bg-[#c8a4a5] text-white py-3 px-4 rounded-lg hover:bg-[#8c6c6b] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <Loader size={20} className="animate-spin" />
                        ) : (
                            <Mail size={20} />
                        )}
                        {isLoading ? 'Sending...' : 'Send Email'}
                    </button>
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="flex-1 border border-[#c8a4a5] text-[#c8a4a5] py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

// Rating Component
const StarRating = ({ rating, onRatingChange = null, size = 20 }) => {
    const [hoverRating, setHoverRating] = useState(0);
    
    return (
        <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    onClick={() => onRatingChange && onRatingChange(star)}
                    onMouseEnter={() => onRatingChange && setHoverRating(star)}
                    onMouseLeave={() => onRatingChange && setHoverRating(0)}
                    disabled={!onRatingChange}
                    className={`${onRatingChange ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
                >
                    <Star
                        size={size}
                        className={`${
                            star <= (hoverRating || rating)
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                        }`}
                    />
                </button>
            ))}
           <span className="ml-2 text-sm text-[#5a4336]">
    ({rating ? (Number(rating) || 0).toFixed(1) : '0'}/5)
</span>
        </div>
    );
};

const RatingModal = ({ supplier, onClose, onSubmit, isLoading }) => {
    const [rating, setRating] = useState(0);
    const [review, setReview] = useState('');

    const handleSubmit = () => {
        if (rating === 0) {
            toast.error('Please provide a rating');
            return;
        }
        onSubmit(supplier._id, { rating, review });
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <Star className="text-yellow-400" />
                        <h3 className="text-xl font-semibold text-[#5a4336]">
                            Rate Supplier
                        </h3>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600" disabled={isLoading}>
                        <X size={24} />
                    </button>
                </div>

                <div className="text-center mb-6">
                    <p className="text-[#5a4336] mb-4">Rate {supplier?.supplierName || supplier?.name}</p>
                    <StarRating 
                        rating={rating} 
                        onRatingChange={setRating}
                        size={30}
                        isLoading={isLoading}
                    />
                </div>

                <div className="mb-6">
                    <label className="block text-sm font-medium text-[#5a4336] mb-2">
                        Review (Optional)
                    </label>
                    <textarea
                        value={review}
                        onChange={(e) => setReview(e.target.value)}
                        placeholder="Write your review..."
                        rows={3}
                        className="w-full p-3 rounded-lg border border-[#c8a4a5] focus:outline-none focus:ring-2 focus:ring-[#c8a4a5]"
                        disabled={isLoading}
                    />
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={handleSubmit}
                        disabled={isLoading || rating === 0}
                        className="flex-1 bg-[#c8a4a5] text-white py-3 px-4 rounded-lg hover:bg-[#8c6c6b] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <Loader size={20} className="animate-spin" />
                        ) : (
                            <Star size={20} />
                        )}
                        {isLoading ? 'Submitting...' : 'Submit Rating'}
                    </button>
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="flex-1 border border-[#c8a4a5] text-[#c8a4a5] py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

// Supplier Card Component
const SupplierCard = ({ supplier, onEmail, onRate, hasEmailedSupplier }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [showFullDescription, setShowFullDescription] = useState(false);
    
    if (!supplier) return null;
    
    // Format minimum bulk orders
    const formatBulkOrders = (capacity) => {
        if (!capacity) return 'Not specified';
        return typeof capacity === 'number' ? `${capacity}+ units` : capacity;
    };

    // Truncate description
    const description = supplier.description || '';
    const shouldTruncate = description.length > 150;
    const displayDescription = shouldTruncate && !showFullDescription 
        ? description.substring(0, 150) + '...' 
        : description;
    
    return (
        <div 
            className={`bg-white rounded-2xl shadow-md transition-all duration-300 ${
                isHovered ? 'transform -translate-y-2 shadow-xl' : ''
            }`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="p-6">
                {/* Header Section */}
                <div className="border-b border-[#e6d8d8] pb-4 mb-4">
                    <div className="flex justify-between items-start mb-3">
                        <h3 className="text-xl font-semibold text-[#5a4336]">{supplier.supplierName || supplier.name}</h3>
                        <div className="flex items-center gap-2">
                            <div className="bg-[#f7f1f1] px-3 py-1 rounded-full text-sm text-[#5a4336] flex items-center gap-1">
                                <Package size={14} />
                                {supplier.materialType || (supplier.materials && supplier.materials[0]?.category)}
                            </div>
                        </div>
                    </div>
                    
                    {/* Rating */}
                    <div className="mb-3">
                        <StarRating rating={supplier.rating?.average || supplier.rating || 0} />
                    </div>
                    
                    {/* Contact Info */}
                    <div className="space-y-2 mb-3">
                        <div className="flex items-center gap-2 text-[#5a4336]">
                            <Mail size={16} className="text-[#c8a4a5]" />
                            <span className="text-sm">{supplier.contactInfo || supplier.email}</span>
                        </div>
                        {supplier.phone && (
                            <div className="flex items-center gap-2 text-[#5a4336]">
                                <Phone size={16} className="text-[#c8a4a5]" />
                                <span className="text-sm">{supplier.phone}</span>
                            </div>
                        )}
                    </div>
                    
                    {/* Description */}
                    {description && (
                        <div className="text-[#5a4336] text-sm bg-gray-50 p-3 rounded-lg mt-3">
                            {displayDescription}
                            {shouldTruncate && (
                                <button 
                                    onClick={() => setShowFullDescription(!showFullDescription)}
                                    className="text-[#c8a4a5] hover:text-[#8c6c6b] ml-2 font-medium"
                                >
                                    {showFullDescription ? 'Show less' : 'Show more'}
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Location Section */}
                <div className="mb-4">
                    <h4 className="text-lg font-medium text-[#5a4336] mb-2 flex items-center gap-2">
                        <MapPin size={18} className="text-[#c8a4a5]" />
                        Location:
                    </h4>
                    <div className="space-y-2">
                        {supplier.address ? (
                            <div className="flex items-center gap-2 text-[#5a4336] text-sm">
                                <div className="w-2 h-2 bg-[#c8a4a5] rounded-full"></div>
                                <span>{supplier.address}</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 text-[#5a4336] text-sm">
                                <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                                <span>Location not specified</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Minimum Bulk Orders */}
                <div className="mb-4">
                    <div className="bg-[#f7f1f1] p-3 rounded-lg text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                            <Package size={16} className="text-[#c8a4a5]" />
                            <span className="text-sm font-medium text-[#5a4336]">Min Bulk Order</span>
                        </div>
                        <span className="text-lg font-bold text-[#c8a4a5]">
                            {formatBulkOrders(supplier.orderCapacity || supplier.minBulkOrder || supplier.minimumOrder)}
                        </span>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                    <button
                        onClick={() => onEmail(supplier)}
                        className="flex-1 bg-gradient-to-r from-[#c8a4a5] to-[#8c6c6b] text-white py-3 px-4 rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                    >
                        <Mail size={18} />
                        Send Email
                    </button>
                    
                    {hasEmailedSupplier && (
                        <button
                            onClick={() => onRate(supplier)}
                            className="px-4 py-3 border border-[#c8a4a5] text-[#c8a4a5] rounded-lg hover:bg-[#f7f1f1] transition-colors flex items-center justify-center"
                        >
                            <Star size={18} />
                        </button>
                    )}
                </div>
                
                {/* Rating message for users who haven't emailed */}
                {!hasEmailedSupplier && (
                    <div className="mt-3 text-xs text-gray-500 text-center">
                        Rating available after sending email
                    </div>
                )}
            </div>
        </div>
    );
};

// Main Suppliers Component
const WholesaleSuppliers = ({ userLocation }) => {
    const [suppliers, setSuppliers] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    
    const [filteredSuppliers, setFilteredSuppliers] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [showFilterOptions, setShowFilterOptions] = useState(false);
    const [selectedSupplier, setSelectedSupplier] = useState(null);
    const [showEmailModal, setShowEmailModal] = useState(false);
    const [showRatingModal, setShowRatingModal] = useState(false);
    const [emailedSuppliers, setEmailedSuppliers] = useState(new Set()); // Track emailed suppliers
    const [showAlert, setShowAlert] = useState({ show: false, message: '', type: 'success' });

    // Fetch suppliers using axios with proper server configuration
    const fetchSuppliers = async () => {
        setIsLoading(true);
        setError(null);
        
        try {
            console.log('Fetching suppliers from:', `${server}/suppliers/gett-all-suppliers`);
            
            const response = await axios.get(`${server}/suppliers/gett-all-suppliers`, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            console.log('Suppliers response:', response.data);
            
            if (response.data.success) {
                setSuppliers(response.data.suppliers || []);
                toast.success('Suppliers loaded successfully!');
            } else {
                throw new Error(response.data.message || 'Failed to fetch suppliers');
            }
        } catch (error) {
            console.error('Error fetching suppliers:', error);
            
            let errorMessage = 'Failed to fetch suppliers';
            
            if (error.response) {
                // Server responded with error status
                const status = error.response.status;
                const data = error.response.data;
                
                if (status === 401) {
                    errorMessage = 'Please login to view suppliers';
                } else if (status === 403) {
                    errorMessage = 'Access denied. Please check your account permissions.';
                } else if (status === 404) {
                    errorMessage = 'Suppliers service not found. Please contact support.';
                } else {
                    errorMessage = data.message || `Server error: ${status}`;
                }
            } else if (error.request) {
                // Request made but no response received
                errorMessage = 'Network error. Please check your connection and try again.';
            } else {
                // Something else happened
                errorMessage = error.message || 'An unexpected error occurred';
            }
            
            setError(errorMessage);
            setSuppliers([]);
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchSuppliers();
    }, []);

    useEffect(() => {
        if (error) {
            setShowAlert({ show: true, message: error, type: 'error' });
            setTimeout(() => {
                setShowAlert({ show: false, message: '', type: 'error' });
                setError(null);
            }, 5000);
        }
    }, [error]);

    // Filter suppliers by category
    useEffect(() => {
        if (suppliers?.length > 0) {
            let filtered = suppliers;
            
            if (selectedCategory !== 'all') {
                filtered = filtered.filter(supplier => {
                    const supplierCategory = supplier.materialType || 
                                           (supplier.materials && supplier.materials[0]?.category) || 
                                           '';
                    return supplierCategory.toLowerCase().includes(selectedCategory.toLowerCase()) ||
                           selectedCategory.toLowerCase().includes(supplierCategory.toLowerCase());
                });
            }
            
            setFilteredSuppliers(filtered);
        } else {
            setFilteredSuppliers([]);
        }
    }, [suppliers, selectedCategory]);

    // Handle email sending
    const handleSendEmail = async (emailData) => {
        try {
            console.log('Sending email with data:', emailData);
            
            const response = await axios.post(`${server}/suppliers/send-email`, emailData, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            console.log('Email response:', response.data);

            if (response.data.success) {
                setEmailedSuppliers(prev => new Set([...prev, emailData.supplierId]));
                setShowEmailModal(false);
                setSelectedSupplier(null);
                setShowAlert({ 
                    show: true, 
                    message: 'Email sent successfully!', 
                    type: 'success' 
                });
                toast.success('Email sent successfully!');
            } else {
                throw new Error(response.data.message || 'Failed to send email');
            }
        } catch (error) {
            console.error('Error sending email:', error);
            
            let errorMessage = 'Failed to send email';
            
            if (error.response) {
                const status = error.response.status;
                const data = error.response.data;
                
                if (status === 401) {
                    errorMessage = 'Please login to send emails';
                } else if (status === 403) {
                    errorMessage = 'Access denied. Please check your permissions.';
                } else {
                    errorMessage = data.message || `Server error: ${status}`;
                }
            } else if (error.request) {
                errorMessage = 'Network error. Please check your connection.';
            } else {
                errorMessage = error.message || 'An unexpected error occurred';
            }
            
            setShowAlert({ 
                show: true, 
                message: errorMessage, 
                type: 'error' 
            });
            toast.error(errorMessage);
        }
    };

    // Handle rating submission
    const handleRatingSubmit = async (supplierId, ratingData) => {
        try {
            console.log('Submitting rating:', { supplierId, ratingData });
            
            const response = await axios.post(`${server}/suppliers/rate-supplier`, {
                supplierId,
                ...ratingData
            }, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            console.log('Rating response:', response.data);

            if (response.data.success) {
                // Update the supplier's rating in the local state
                setSuppliers(prev => prev.map(supplier => 
                    supplier._id === supplierId 
                        ? { ...supplier, rating: response.data.updatedRating }
                        : supplier
                ));
                
                setShowRatingModal(false);
                setSelectedSupplier(null);
                setShowAlert({ 
                    show: true, 
                    message: 'Rating submitted successfully!', 
                    type: 'success' 
                });
                toast.success('Rating submitted successfully!');
            } else {
                throw new Error(response.data.message || 'Failed to submit rating');
            }
        } catch (error) {
            console.error('Error submitting rating:', error);
            
            let errorMessage = 'Failed to submit rating';
            
            if (error.response) {
                const status = error.response.status;
                const data = error.response.data;
                
                if (status === 401) {
                    errorMessage = 'Please login to submit ratings';
                } else if (status === 403) {
                    errorMessage = 'Access denied. Please check your permissions.';
                } else {
                    errorMessage = data.message || `Server error: ${status}`;
                }
            } else if (error.request) {
                errorMessage = 'Network error. Please check your connection.';
            } else {
                errorMessage = error.message || 'An unexpected error occurred';
            }
            
            setShowAlert({ 
                show: true, 
                message: errorMessage, 
                type: 'error' 
            });
            toast.error(errorMessage);
        }
    };

    // Auto-hide alert after 5 seconds
    useEffect(() => {
        if (showAlert.show) {
            const timer = setTimeout(() => {
                setShowAlert({ show: false, message: '', type: 'success' });
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [showAlert.show]);

    if (isLoading) {
        return (
            <div className="p-6 bg-gradient-to-br from-[#f7f1f1] to-[#fefcfc] min-h-screen">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center py-12">
                        <Loader size={48} className="animate-spin text-[#c8a4a5] mx-auto mb-4" />
                        <p className="text-[#5a4336] text-lg">Loading suppliers...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 bg-gradient-to-br from-[#f7f1f1] to-[#fefcfc] min-h-screen">
            <div className="max-w-7xl mx-auto">
                
                {/* New Filter Bar Design */}
                <div className="mb-6 bg-white rounded-lg shadow overflow-hidden">
                    <div className="flex items-center justify-between p-4 border-b border-[#e6d8d8]">
                        <div className="flex items-center space-x-3">
                            <Filter size={20} className="text-[#c8a4a5]" />
                            <h3 className="font-medium text-[#5a4336]">Filter Suppliers</h3>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="text-sm text-[#5a4336] bg-[#f7f1f1] px-3 py-1 rounded-full">
                                Total: {suppliers.length} • Showing: {filteredSuppliers.length}
                            </div>
                            <button 
                                onClick={() => setShowFilterOptions(!showFilterOptions)}
                                className="text-[#c8a4a5] hover:text-[#8c6c6b] transition-colors"
                            >
                                {showFilterOptions ? (
                                    <X size={20} />
                                ) : (
                                    <span className="text-sm bg-[#f7f1f1] px-3 py-1 rounded-full">
                                        {selectedCategory !== 'all' ? selectedCategory : 'All Categories'}
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>
                    
                    {showFilterOptions && (
                        <div className="p-4 space-y-4 animate-fadeIn">
                            <div className="flex flex-wrap items-center gap-3">
                                <label className="text-[#5a4336] font-medium">Category:</label>
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className="p-2 rounded-lg border border-[#c8a4a5] text-[#5a4336] focus:outline-none focus:ring-2 focus:ring-[#c8a4a5] appearance-none bg-white hover:border-[#8c6c6b] transition-colors select-none"
                                    style={{
                                        backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23c8a4a5' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                                        backgroundRepeat: 'no-repeat',
                                        backgroundPosition: 'right 1rem center',
                                        backgroundSize: '1em',
                                        WebkitAppearance: 'none',
                                        MozAppearance: 'none'
                                    }}
                                >
                                    <option value="all" className="text-[#5a4336] bg-white hover:bg-[#f7f1f1]">All Categories</option>
                                    {SUPPLIER_CATEGORIES.map(category => (
                                        <option 
                                            key={category} 
                                            value={category} 
                                            className="text-[#5a4336] bg-white hover:bg-[#f7f1f1]"
                                        >
                                            {category}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            <div className="flex items-center gap-3">
                              
                            </div>
                            
                            <div className="pt-2 flex justify-end">
                                <button
                                    onClick={() => setShowFilterOptions(false)}
                                    className="bg-[#c8a4a5] text-white py-2 px-4 rounded-lg hover:bg-[#8c6c6b] transition-colors text-sm font-medium"
                                >
                                    Apply Filters
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center gap-3">
                        <AlertCircle className="text-red-500" size={20} />
                        <div>
                            <p className="text-red-700 font-medium">Error Loading Suppliers</p>
                            <p className="text-red-600 text-sm">{error}</p>
                        </div>
                        <button
                            onClick={fetchSuppliers}
                            className="ml-auto bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded text-sm transition-colors"
                        >
                            Retry
                        </button>
                    </div>
                )}

                {/* Suppliers Grid */}
                {filteredSuppliers.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredSuppliers.map((supplier) => (
                            <SupplierCard
                                key={supplier._id}
                                supplier={supplier}
                                onEmail={(sup) => {
                                    setSelectedSupplier(sup);
                                    setShowEmailModal(true);
                                }}
                                onRate={(sup) => {
                                    setSelectedSupplier(sup);
                                    setShowRatingModal(true);
                                }}
                                hasEmailedSupplier={emailedSuppliers.has(supplier._id)}
                            />
                        ))}
                    </div>
                ) : suppliers.length > 0 ? (
                    <div className="text-center py-12">
                        <div className="bg-white rounded-2xl shadow-md p-8 max-w-md mx-auto">
                            <Filter size={48} className="text-gray-300 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-[#5a4336] mb-2">No suppliers match your filters</h3>
                            <p className="text-[#8c6c6b] mb-4">
                                Try adjusting your search criteria.
                            </p>
                            <button
                                onClick={() => {
                                    setSelectedCategory('all');
                                }}
                                className="bg-[#c8a4a5] text-white px-6 py-2 rounded-lg hover:bg-[#8c6c6b] transition-colors"
                            >
                                Reset Filters
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <div className="bg-white rounded-2xl shadow-md p-8 max-w-md mx-auto">
                            <Package size={48} className="text-gray-300 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-[#5a4336] mb-2">No suppliers available</h3>
                            <p className="text-[#8c6c6b] mb-4">
                                There are currently no suppliers in our database. Please check back later.
                            </p>
                           
                        </div>
                    </div>
                )}

                {/* Modals */}
                {showEmailModal && selectedSupplier && (
                    <EmailModal
                        supplier={selectedSupplier}
                        onClose={() => {
                            setShowEmailModal(false);
                            setSelectedSupplier(null);
                        }}
                        onSend={handleSendEmail}
                    />
                )}

                {showRatingModal && selectedSupplier && (
                    <RatingModal
                        supplier={selectedSupplier}
                        onClose={() => {
                            setShowRatingModal(false);
                            setSelectedSupplier(null);
                        }}
                        onSubmit={handleRatingSubmit}
                        isLoading={false}
                    />
                )}

                {/* Custom Alert */}
                {showAlert.show && (
                    <CustomAlert 
                        message={showAlert.message} 
                        type={showAlert.type}
                    />
                )}
            </div>

            {/* Custom Styles */}
            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                
                @keyframes slideIn {
                    from { transform: translateY(-20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                
                .animate-fadeIn {
                    animation: fadeIn 0.3s ease-out;
                }
                
                .animate-slideIn {
                    animation: slideIn 0.3s ease-out;
                }
            `}</style>
        </div>
    );
};

export default WholesaleSuppliers;