import React, { useState } from "react";
import { useStripe, useElements, CardNumberElement } from "@stripe/react-stripe-js";
import axios from "axios";
import { server } from "../../server";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { CreditCard, Loader, CheckCircle } from "lucide-react";

const CertificatePayment = ({ onPaymentSuccess }) => {
  const { workshopId } = useParams();
  const { user } = useSelector((state) => state.user);
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      // 1. Create payment intent
      const { data } = await axios.post(
        `${server}/payment/process-workshop-certificate`,
        { workshopId, userId: user._id },
        { withCredentials: true }
      );

      // 2. Confirm payment
      const result = await stripe.confirmCardPayment(data.client_secret, {
        payment_method: {
          card: elements.getElement(CardNumberElement),
          billing_details: {
            name: user.name,
          },
        },
      });

      if (result.error) {
        toast.error(result.error.message);
      } else if (result.paymentIntent.status === "succeeded") {
        toast.success("Payment successful! You can now attempt the quiz.");
        onPaymentSuccess();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Payment failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 max-w-md mx-auto">
      <div className="text-center mb-6">
        <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
        <h2 className="text-2xl font-bold text-[#5a4336]">Certificate Payment</h2>
        <p className="text-[#a67d6d]">Pay Rs. 100 to attempt the quiz and get certified</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[#5a4336]">
            Card Number
          </label>
          <div className="border border-[#d8c4b8] rounded-lg p-3">
            <CardNumberElement className="w-full" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#5a4336]">
              Expiry Date
            </label>
            <div className="border border-[#d8c4b8] rounded-lg p-3">
              <CardExpiryElement className="w-full" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#5a4336]">
              CVC
            </label>
            <div className="border border-[#d8c4b8] rounded-lg p-3">
              <CardCvcElement className="w-full" />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={!stripe || loading}
          className="w-full py-3 bg-gradient-to-r from-[#5a4336] to-[#a67d6d] text-white rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <CreditCard className="w-5 h-5" />
              Pay Rs. 100
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default CertificatePayment;