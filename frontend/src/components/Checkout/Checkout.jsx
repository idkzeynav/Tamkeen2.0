import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Country, State } from "country-state-city";
import { toast } from "react-toastify";

const Checkout = () => {
  const { user } = useSelector((state) => state.user);
  const { cart } = useSelector((state) => state.cart);
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [discountPrice, setDiscountPrice] = useState(0);
  const [userInfo, setUserInfo] = useState(false); // Toggle for saved addresses
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || "");
  const [phoneError, setPhoneError] = useState("");
  const navigate = useNavigate();

  const subTotalPrice = cart.reduce(
    (acc, item) => acc + item.qty * (item.discountPrice || item.originalPrice),
    0
  );
  const shipping = 150;
  const totalPrice = (subTotalPrice + shipping - discountPrice).toFixed(2);

  const validatePhoneNumber = (phone) => {
    // Phone validation for format: 0XXX-XXXXXXX (e.g., 0334-6030339)
    const phoneRegex = /^0\d{3}-\d{7}$/;
    
    if (!phone) {
      return "Phone number is required";
    }
    
    if (!phoneRegex.test(phone)) {
      return "Please enter a valid phone number in format: 0XXX-XXXXXXX";
    }
    
    return "";
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value;
    setPhoneNumber(value);
    setPhoneError(validatePhoneNumber(value));
  };

  const handleApplyCoupon = () => {
    if (couponCode === "DISCOUNT10") {
      const discount = (subTotalPrice * 10) / 100;
      setDiscountPrice(discount);
      toast.success("Coupon applied successfully!");
    } else {
      toast.error("Invalid coupon code!");
    }
  };

  const handleContinueToPayment = () => {
    // Validate phone number before proceeding
    const phoneValidationError = validatePhoneNumber(phoneNumber);
    if (phoneValidationError) {
      setPhoneError(phoneValidationError);
      toast.error("Please enter a valid phone number!");
      return;
    }

    if (!address1 || !address2 || !zipCode || !country || !city) {
      toast.error("Please fill all shipping details!");
      return;
    }

    const shippingAddress = { address1, address2, zipCode, country, city, phoneNumber };
    const orderData = { cart, subTotalPrice, shipping, discountPrice, totalPrice, shippingAddress, user };
    localStorage.setItem("latestOrder", JSON.stringify(orderData));
    navigate("/payment");
  };

  return (
    <div className="bg-gradient-to-b from-[#f8f4f1] to-[#e6d8d8] min-h-screen flex justify-center items-center">
      <div className="max-w-5xl w-full px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#5a4336] mb-2">Checkout</h1>
          <p className="text-[#a67d6d]">Enter your details to complete the order</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Shipping Information */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-[#5a4336] mb-4">Shipping Information</h3>
            <div className="grid grid-cols-2 gap-4">
              {/* Form Inputs */}
              <div>
                <label className="block text-sm font-medium text-[#5a4336]">Full Name</label>
                <input
                  type="text"
                  defaultValue={user?.name || ""}
                  className="w-full px-3 py-2 rounded-lg border border-[#d8c4b8] focus:ring-1 focus:ring-[#a67d6d] focus:border-transparent"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#5a4336]">Email</label>
                <input
                  type="email"
                  defaultValue={user?.email || ""}
                  className="w-full px-3 py-2 rounded-lg border border-[#d8c4b8] focus:ring-1 focus:ring-[#a67d6d] focus:border-transparent"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#5a4336]">Phone</label>
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={handlePhoneChange}
                  placeholder="e.g. 0334-6030339"
                  className={`w-full px-3 py-2 rounded-lg border ${
                    phoneError ? "border-red-500" : "border-[#d8c4b8]"
                  } focus:ring-1 focus:ring-[#a67d6d] focus:border-transparent`}
                />
                {phoneError && (
                  <p className="mt-1 text-xs text-red-500">{phoneError}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-[#5a4336]">Zip Code</label>
                <input
                  type="text"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[#d8c4b8] focus:ring-1 focus:ring-[#a67d6d] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#5a4336]">Country</label>
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[#d8c4b8] focus:ring-1 focus:ring-[#a67d6d] focus:border-transparent"
                >
                  <option value="">Select Country</option>
                  {Country.getAllCountries().map((item) => (
                    <option key={item.isoCode} value={item.isoCode}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#5a4336]">City</label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[#d8c4b8] focus:ring-1 focus:ring-[#a67d6d] focus:border-transparent"
                >
                  <option value="">Select City</option>
                  {State.getStatesOfCountry(country).map((item) => (
                    <option key={item.isoCode} value={item.isoCode}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#5a4336]">Address 1</label>
                <input
                  type="text"
                  value={address1}
                  onChange={(e) => setAddress1(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[#d8c4b8] focus:ring-1 focus:ring-[#a67d6d] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#5a4336]">Address 2</label>
                <input
                  type="text"
                  value={address2}
                  onChange={(e) => setAddress2(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[#d8c4b8] focus:ring-1 focus:ring-[#a67d6d] focus:border-transparent"
                />
              </div>
            </div>

            {/* Saved Addresses */}
            <div className="mt-6">
              <h4 className="text-sm font-bold text-[#5a4336] mb-3 cursor-pointer" onClick={() => setUserInfo(!userInfo)}>
                {userInfo ? "Hide Saved Addresses" : "Show Saved Addresses"}
              </h4>
              {userInfo &&
                user?.addresses.map((address, idx) => (
                  <div key={idx} className="flex items-center gap-4 mt-4 p-4 rounded-lg bg-gradient-to-r from-[#f8f4f1] to-[#e6d8d8] shadow-md hover:shadow-lg transition-all duration-300">
                    <input
                      type="radio"
                      name="saved-address"
                      value={address.addressType}
                      onClick={() => {
                        setAddress1(address.address1);
                        setAddress2(address.address2);
                        setZipCode(address.zipCode);
                        setCountry(address.country);
                        setCity(address.city);
                      }}
                      className="w-5 h-5 text-[#a67d6d] border-2 border-[#d8c4b8] focus:ring-2 focus:ring-[#a67d6d]"
                    />
                    <div className="flex flex-col text-[#5a4336]">
                      <p className="font-bold">{address.addressType}</p>
                      <p className="text-sm">
                        {address.address1}, {address.address2}, {address.city}, {address.zipCode}, {address.country}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Cart Summary */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-[#5a4336] mb-4">Order Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-[#a67d6d]">Subtotal</span>
                <span className="font-medium text-[#5a4336]">Rs{subTotalPrice}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#a67d6d]">Shipping</span>
                <span className="font-medium text-[#5a4336]">Rs{shipping}</span>
              </div>
              <div className="flex justify-between border-b border-[#d8c4b8] pb-3">
                <span className="text-[#a67d6d]">Discount</span>
                <span className="font-medium text-[#5a4336]">-Rs{discountPrice || 0}</span>
              </div>
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>Rs{totalPrice}</span>
              </div>
            </div>

        
            <button
              onClick={handleContinueToPayment}
              className="w-full mt-6 py-3 bg-gradient-to-r from-[#5a4336] to-[#a67d6d] text-white rounded-lg hover:opacity-90 transition-all"
            >
              Continue to Payment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;