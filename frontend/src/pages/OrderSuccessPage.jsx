import React from 'react';
import { CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const OrderSuccessPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#d8c4b8] to-[#c8a4a5] flex items-center justify-center">
      <div className="container mx-auto px-4">
        <Success />
        <Footer />
      </div>
    </div>
  );
};

const Success = () => {
  return (
    <div className="flex flex-col items-center justify-center text-center">
      <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full space-y-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 bg-[#d8c4b8] rounded-full animate-pulse opacity-50" />
          </div>
          <div className="relative flex justify-center">
            <CheckCircle className="w-24 h-24 text-[#5a4336] animate-bounce" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-[#5a4336] mt-6">
          Order Successful! 🎉
        </h1>

        <p className="text-[#a67d6d] text-lg">
          Thank you for your purchase! Your order has been confirmed.
        </p>

        <div className="space-y-4">
          <Link to="/products" className="w-full block">
            <button className="w-full bg-gradient-to-r from-[#a67d6d] to-[#5a4336] text-white font-semibold py-3 px-6 rounded-lg hover:opacity-90 transition-all duration-300 shadow-md">
              Continue Shopping
            </button>
          </Link>
        </div>
      </div>

      <div className="mt-8 text-sm text-[#5a4336]">
        Order confirmation sent to your email
      </div>
    </div>
  );
};

const Footer = () => (
  <footer className="py-6 text-center text-[#a67d6d]">
    <p>© 2024 Tamkeen. All rights reserved.</p>
  </footer>
);

export default OrderSuccessPage;