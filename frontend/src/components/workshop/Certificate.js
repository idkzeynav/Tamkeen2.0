import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { server } from '../../server';
import { useSelector } from 'react-redux';
import { jsPDF } from 'jspdf';
import { Award, CheckCircle, Download, ArrowLeft, Lock, Loader, CreditCard, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import {
  CardNumberElement,
  CardCvcElement,
  CardExpiryElement,
  useStripe,
  useElements,
  Elements,
} from "@stripe/react-stripe-js";
import { loadStripe } from '@stripe/stripe-js';

// Stripe wrapper component to load API key
const CertificatePage = () => {
  const [stripeApiKey, setStripeApiKey] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch the Stripe API key from backend
    const getStripeApiKey = async () => {
      try {
        const { data } = await axios.get(`${server}/payment/stripeapikey`, { withCredentials: true });
        setStripeApiKey(data.stripeApikey);
      } catch (error) {
        console.error("Failed to load Stripe API key:", error);
        toast.error("Payment system is currently unavailable");
      } finally {
        setLoading(false);
      }
    };
    getStripeApiKey();
  }, []);

  // Show loading state while fetching Stripe API key
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#a67d6d]"></div>
      </div>
    );
  }

  // Show error if Stripe API key is not available
  if (!stripeApiKey) {
    return (
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-xl overflow-hidden p-8 mt-10">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 mx-auto text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-[#5a4336] mb-2">Payment System Unavailable</h2>
          <p className="text-gray-600 mb-6">
            The payment system is currently unavailable. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  // Initialize Stripe with the API key from backend
  const stripePromise = loadStripe(stripeApiKey);

  return (
    <Elements stripe={stripePromise}>
      <CertificateContent />
    </Elements>
  );
};

// Certificate content component with Stripe payment integration
const CertificateContent = () => {
  const { workshopId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.user);
  const [certificateData, setCertificateData] = useState(null);
  const [workshopInfo, setWorkshopInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [verifyingPayment, setVerifyingPayment] = useState(false);
  const [certificatePrice, setCertificatePrice] = useState(5000);
  const [paymentIntentId, setPaymentIntentId] = useState(null);

  const stripe = useStripe();
  const elements = useElements();

  // Card element styling
  const cardElementStyle = {
    style: {
      base: {
        fontSize: "16px",
        color: "#5a4336",
        fontFamily: "-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif",
        "::placeholder": {
          color: "#a67d6d",
        },
      },
      invalid: {
        color: "#c8a4a5",
        iconColor: "#c8a4a5",
      },
    },
  };

  // Store user ID in session storage for persistence through redirect
  useEffect(() => {
    if (user?._id) {
      sessionStorage.setItem('certificate_userId', user._id);
    }
  }, [user]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Check if user is logged in
        const userId = user?._id || sessionStorage.getItem('certificate_userId');
        if (!userId) {
          console.log("No user ID found, redirecting to login");
          toast.error("Please log in to continue");
          navigate('/login', { state: { redirectTo: `/certificate/${workshopId}` } });
          return;
        }
        
        // Get the workshop information
        const workshopRes = await axios.get(`${server}/workshop/workshop/${workshopId}`, { withCredentials: true });
        setWorkshopInfo(workshopRes.data.workshop);
        
        // Check for payment success or payment intent in URL params
        const queryParams = new URLSearchParams(location.search);
        const paymentIntentParam = queryParams.get('payment_intent');
        const paymentSuccessful = queryParams.get('payment') === 'success' || queryParams.get('redirect_status') === 'succeeded';
        
        // Handle payment verification if coming from redirect
        if (paymentSuccessful || paymentIntentParam) {
          setVerifyingPayment(true);
          try {
            const certData = await verifyPayment(userId, paymentIntentParam);
            setCertificateData(certData);
            setPaymentStatus(true);
            toast.success("Certificate payment verified successfully!");
            
            // Remove query params from URL
            navigate(`/certificate/${workshopId}`, { replace: true });
          } catch (error) {
            console.error("Payment verification failed:", error);
            setError(error.response?.data?.message || error.message || "Failed to verify payment. Please try again or contact support.");
            toast.error("Payment verification failed. Please try again or contact support.");
          } finally {
            setVerifyingPayment(false);
          }
        } else {
          // Check payment status - log values for debugging
          console.log("Checking payment status with:", {
            userId,
            workshopId,
            withCredentials: true
          });
          
          try {
            const statusRes = await axios.get(
              `${server}/payment/certificate-payment-status/${workshopId}`,
              { 
                params: { userId },
                withCredentials: true 
              }
            );
            
            console.log("Payment status response:", statusRes.data);
            setPaymentStatus(statusRes.data.paid);
            
            if (statusRes.data.paid) {
              // If already paid, fetch certificate data
              const certRes = await axios.get(
                `${server}/workshop/generate-certificate/${workshopId}`,
                { 
                  params: { userId },
                  withCredentials: true 
                }
              );
              setCertificateData(certRes.data);
            }
          } catch (err) {
            console.error("Error checking payment status:", err);
            if (err.response?.status === 401) {
              toast.error("Session expired. Please log in again.");
              navigate('/login', { state: { redirectTo: `/certificate/${workshopId}` } });
              return;
            }
            setError(err.response?.data?.message || "Failed to check payment status");
          }
        }
      } catch (err) {
        console.error("Error:", err);
        if (err.response?.status === 401) {
          toast.error("Please log in to continue");
          navigate('/login', { state: { redirectTo: `/certificate/${workshopId}` } });
          return;
        }
        setError(err.response?.data?.message || 'Failed to load certificate information');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [workshopId, location.search, navigate, user]);


  const generatePDF = () => {
    if (!certificateData) return;

    // Create PDF with landscape orientation
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });
    
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    // Background color (clean white)
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');
    
    // Simple elegant border with double lines
    const margin = 15;
    
    // Outer border - dark brown
    doc.setDrawColor(90, 67, 54);
    doc.setLineWidth(1.5);
    doc.rect(margin, margin, pageWidth - (margin * 2), pageHeight - (margin * 2), 'S');
    
    // Inner border - light brown
    doc.setDrawColor(166, 125, 109);
    doc.setLineWidth(0.8);
    doc.rect(margin + 7, margin + 7, pageWidth - (margin * 2) - 14, pageHeight - (margin * 2) - 14, 'S');
    
    // Add decorative corner elements
    const drawCornerElement = (x, y, cornerType) => {
      doc.setDrawColor(166, 125, 109);
      doc.setLineWidth(1);
      
      const size = 15;
      
      switch(cornerType) {
        case 'topLeft':
          doc.line(x, y + size, x, y);
          doc.line(x, y, x + size, y);
          doc.line(x + 5, y, x + 5, y + 5);
          doc.line(x, y + 5, x + 5, y + 5);
          break;
          
        case 'topRight':
          doc.line(x, y, x - size, y);
          doc.line(x, y, x, y + size);
          doc.line(x - 5, y, x - 5, y + 5);
          doc.line(x, y + 5, x - 5, y + 5);
          break;
          
        case 'bottomLeft':
          doc.line(x, y, x + size, y);
          doc.line(x, y, x, y - size);
          doc.line(x + 5, y, x + 5, y - 5);
          doc.line(x, y - 5, x + 5, y - 5);
          break;
          
        case 'bottomRight':
          doc.line(x, y, x - size, y);
          doc.line(x, y, x, y - size);
          doc.line(x - 5, y, x - 5, y - 5);
          doc.line(x, y - 5, x - 5, y - 5);
          break;
        default:
          break;
      }
    };
    
    // Draw corner elements
    drawCornerElement(margin + 7, margin + 7, 'topLeft');
    drawCornerElement(pageWidth - margin - 7, margin + 7, 'topRight');
    drawCornerElement(margin + 7, pageHeight - margin - 7, 'bottomLeft');
    drawCornerElement(pageWidth - margin - 7, pageHeight - margin - 7, 'bottomRight');
    
    // Add "TAMKEEN" text as a very subtle watermark
    doc.setFontSize(120);
    doc.setTextColor(245, 245, 245); // Very light gray, almost invisible
    doc.setFont('times', 'bold');
    doc.text('TAMKEEN', pageWidth / 2, pageHeight / 2, { align: 'center' });
    
    // Add header - Certificate title
    doc.setFontSize(38);
    doc.setFont('times', 'bold');
    doc.setTextColor(90, 67, 54); // Dark brown
    doc.text('Certificate of Completion', pageWidth / 2, 50, { align: 'center' });
    
    // Add decorative line under title
    doc.setDrawColor(166, 125, 109);
    doc.setLineWidth(1);
    doc.line(pageWidth / 2 - 65, 58, pageWidth / 2 + 65, 58);
    
    // Add subtitle
    doc.setFontSize(16);
    doc.setFont('times', 'italic');
    doc.setTextColor(90, 67, 54);
    doc.text('This is to certify that', pageWidth / 2, 75, { align: 'center' });
    
    // Add name of participant
    doc.setFontSize(30);
    doc.setFont('times', 'bold');
    doc.setTextColor(166, 125, 109); // Brown
    doc.text(user.name, pageWidth / 2, 95, { align: 'center' });
    
    // Add decorative line under name
    doc.setDrawColor(166, 125, 109);
    doc.setLineWidth(0.5);
    doc.line(pageWidth / 2 - 45, 100, pageWidth / 2 + 45, 100);
    
    // Add completion text
    doc.setFontSize(16);
    doc.setFont('times', 'italic'); 
    doc.setTextColor(90, 67, 54);
    doc.text('has successfully completed the workshop', pageWidth / 2, 115, { align: 'center' });
    
    // Add workshop name
    doc.setFontSize(24);
    doc.setFont('times', 'bold');
    doc.setTextColor(166, 125, 109);
    doc.text(`"${certificateData.workshop.name}"`, pageWidth / 2, 135, { align: 'center' });
    
    // Add score
    doc.setFontSize(18);
    doc.setFont('times', 'italic');
    doc.setTextColor(90, 67, 54);
    doc.text(`With a final score of ${certificateData.certificate.score}%`, pageWidth / 2, 155, { align: 'center' });
    
    // Add certificate ID and date
    doc.setFontSize(12);
    doc.setFont('times', 'normal');
    doc.setTextColor(90, 67, 54);
    doc.text(`Certificate ID: ${certificateData.certificate.certificateId}`, pageWidth / 2, 175, { align: 'center' });
    doc.text(`Issued on: ${new Date(certificateData.certificate.issueDate).toLocaleDateString()}`, pageWidth / 2, 185, { align: 'center' });
  
    // Add verification text
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(120, 120, 120);
    doc.text(
      `Verify this certificate at: ${window.location.host}/verify-certificate/${certificateData.certificate.certificateId}`, 
      pageWidth / 2, 
      pageHeight - 30,
      { align: 'center' }
    );

    // Save the PDF
    doc.save(`${user.name}_${certificateData.workshop.name}_Certificate.pdf`);
    toast.success("Certificate downloaded successfully!");
  };

  const verifyPayment = async (userId, paymentIntentId = null) => {
    try {
      // First verification attempt
      const verifyData = { userId };
      if (paymentIntentId) {
        verifyData.paymentIntentId = paymentIntentId;
      }
      
      let verifyRes = await axios.post(
        `${server}/payment/verify-certificate-payment/${workshopId}`,
        verifyData,
        { withCredentials: true }
      );
  
      // If not paid, wait a moment and try again (payments can take a moment to process)
      if (!verifyRes.data.paid) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        verifyRes = await axios.post(
          `${server}/payment/verify-certificate-payment/${workshopId}`,
          verifyData,
          { withCredentials: true }
        );
      }
  
      if (verifyRes.data.success && verifyRes.data.paid) {
        // Get certificate data
        const certRes = await axios.get(
          `${server}/workshop/generate-certificate/${workshopId}`,
          {
            params: { userId },
            withCredentials: true 
          }
        );
        return certRes.data;
      }
      
      throw new Error(verifyRes.data.message || "Payment verification failed");
    } catch (error) {
      console.error("Payment verification error:", error);
      throw error;
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      toast.error("Payment processing is not available. Please try again later.");
      return;
    }
    
    setProcessingPayment(true);
    setError(null);
    
    try {
      if (!user || !user._id) {
        throw new Error("Please log in to purchase a certificate");
      }
      
      // Initialize payment with backend
      const { data } = await axios.post(
        `${server}/payment/initiate-certificate-payment/${workshopId}`,
        { 
          userId: user._id,
          amount: 500000 // 5000 PKR in paisa
        },
        { withCredentials: true }
      );

      // If already paid, fetch certificate
      if (data.paid) {
        const certRes = await axios.get(
          `${server}/workshop/generate-certificate/${workshopId}`,
          {
            params: { userId: user._id },
            withCredentials: true
          }
        );
        setCertificateData(certRes.data);
        setPaymentStatus(true);
        toast.success("Certificate already paid for!");
        return;
      }

      if (!data.client_secret) {
        throw new Error("Payment initialization failed");
      }

      // Set certificate price from response if available
      if (data.price) {
        setCertificatePrice(data.price / 100); // Convert from paisa to PKR
      }

      // Confirm card payment
      const result = await stripe.confirmCardPayment(data.client_secret, {
        payment_method: {
          card: elements.getElement(CardNumberElement),
          billing_details: {
            name: user.name,
            email: user.email || ''
          },
        },
      });

      if (result.error) {
        throw new Error(result.error.message);
      }

      if (result.paymentIntent.status === "succeeded") {
        // Store payment intent ID for verification
        setPaymentIntentId(result.paymentIntent.id);
        
        // Verify payment and get certificate
        const certData = await verifyPayment(user._id, result.paymentIntent.id);
        setCertificateData(certData);
        setPaymentStatus(true);
        toast.success("Payment successful! Certificate unlocked.");
      } else {
        throw new Error("Payment processing failed. Please try again.");
      }
    } catch (err) {
      console.error("Payment error:", err);
      setError(err.response?.data?.message || err.message || 'Payment failed. Please try again.');
      toast.error(err.response?.data?.message || err.message || "Payment failed. Please try again later.");
    } finally {
      setProcessingPayment(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#a67d6d]"></div>
      </div>
    );
  }

  // Payment verification state
  if (verifyingPayment) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-lg text-center max-w-md mx-auto mt-10">
        <Loader className="animate-spin h-12 w-12 mx-auto mb-4 text-[#a67d6d]" />
        <h2 className="text-xl font-bold text-[#5a4336] mb-2">Verifying Payment</h2>
        <p className="text-gray-600">Please wait while we confirm your payment...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-lg text-center max-w-md mx-auto mt-10">
        <AlertCircle className="w-12 h-12 mx-auto text-red-500 mb-4" />
        <div className="text-red-500 mb-4">{error}</div>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-[#a67d6d] text-white rounded-lg hover:opacity-90 transition-opacity"
        >
          Go Back
        </button>
      </div>
    );
  }

  // Payment wall - show if not paid yet
  if (!paymentStatus) {
    return (
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-xl overflow-hidden p-8 mt-10">
        <div className="text-center">
          <Lock className="w-12 h-12 mx-auto text-[#a67d6d] mb-4" />
          <h2 className="text-2xl font-bold text-[#5a4336] mb-2">Certificate Locked</h2>
          <p className="text-gray-600 mb-6">
            Unlock permanent access to your {workshopInfo?.name || "Workshop Certificate"} certificate for Rs{certificatePrice}
          </p>
          
          <div className="bg-gradient-to-r from-[#f8f4f1] to-[#e6d8d8] rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-4">
              <CreditCard className="w-5 h-5 text-[#a67d6d]" />
              <span className="font-medium text-[#5a4336]">Credit/Debit Card</span>
            </div>

            <form onSubmit={handlePayment} className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[#5a4336]">Name on Card</label>
                <input
                  type="text"
                  defaultValue={user?.name}
                  className="w-full px-3 py-2 rounded-lg border border-[#d8c4b8] focus:ring-1 focus:ring-[#a67d6d] focus:border-transparent"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-[#5a4336]">Card Number</label>
                <div className="rounded-lg border border-[#d8c4b8] bg-white p-2">
                  <CardNumberElement options={cardElementStyle} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[#5a4336]">Expiry Date</label>
                  <div className="rounded-lg border border-[#d8c4b8] bg-white p-2">
                    <CardExpiryElement options={cardElementStyle} />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[#5a4336]">CVC</label>
                  <div className="rounded-lg border border-[#d8c4b8] bg-white p-2">
                    <CardCvcElement options={cardElementStyle} />
                  </div>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 text-red-500 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={!stripe || !elements || processingPayment}
                className="w-full py-3 bg-gradient-to-r from-[#5a4336] to-[#a67d6d] text-white rounded-lg hover:from-[#a67d6d] hover:to-[#5a4336] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processingPayment ? (
                  <>
                    <Loader className="animate-spin h-5 w-5 mx-auto" />
                    Processing...
                  </>
                ) : (
                  "Pay & Unlock Certificate"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Show certificate if payment is verified
  return (
    <div className="bg-white rounded-xl shadow-xl overflow-hidden max-w-2xl mx-auto mt-10">
      <div className="p-8">
        <div className="text-center mb-8">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-[#5a4336] mb-2">Certificate of Completion</h1>
          <p className="text-[#a67d6d]">You've successfully earned your certificate!</p>
        </div>

        <div className="border-2 border-[#d8c4b8] rounded-lg p-6 mb-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold text-[#5a4336]">{certificateData.workshop.name}</h2>
            <p className="text-[#a67d6d]">Completed by {user.name}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-[#d8c4b8]/10 p-4 rounded-lg">
              <p className="text-sm text-[#a67d6d]">Score</p>
              <p className="text-xl font-bold text-[#5a4336]">{certificateData.certificate.score}%</p>
            </div>
            <div className="bg-[#d8c4b8]/10 p-4 rounded-lg">
              <p className="text-sm text-[#a67d6d]">Certificate ID</p>
              <p className="text-lg font-medium text-[#5a4336]">{certificateData.certificate.certificateId}</p>
            </div>
          </div>

          <div className="text-center text-sm text-gray-500">
            <p>Issued on {new Date(certificateData.certificate.issueDate).toLocaleDateString()}</p>
            <p>Verify at: <a 
              href={`${window.location.origin}/verify-certificate/${certificateData.certificate.certificateId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              {window.location.host}/verify-certificate/{certificateData.certificate.certificateId}
            </a></p>
          </div>
        </div>

        <div className="flex flex-col space-y-4">
          <button
            onClick={generatePDF}
            className="w-full py-3 bg-gradient-to-r from-[#c8a4a5] to-[#a67d6d] text-white rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            <Download className="w-5 h-5" />
            Download Certificate (PDF)
          </button>
          <button
            onClick={() => navigate(`/workshopdetail/${workshopId}`)}
            className="w-full py-3 border-2 border-[#a67d6d] text-[#a67d6d] rounded-lg hover:bg-[#d8c4b8]/10 transition-colors flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Return to Workshop
          </button>
        </div>
      </div>
    </div>
  );
};

export default CertificatePage;