import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import { server } from "../../server";
import { toast } from "react-toastify";
import {
    CardNumberElement,
    CardCvcElement,
    CardExpiryElement,
    useStripe,
    useElements,
} from "@stripe/react-stripe-js";
import { CreditCard, Truck, AlertCircle } from "lucide-react";

const Payment = () => {
    const [orderData, setOrderData] = useState([]);
    const [loading, setLoading] = useState(false);
    const { user } = useSelector((state) => state.user);
    const navigate = useNavigate();
    const stripe = useStripe();
    const elements = useElements();

    useEffect(() => {
        const orderData = JSON.parse(localStorage.getItem("latestOrder"));
        setOrderData(orderData);
    }, []);

    // Payment handlers remain the same
    const order = {
        cart: orderData?.cart,
        shippingAddress: orderData?.shippingAddress,
        user: user && user,
        totalPrice: orderData?.totalPrice,
    };

    const paymentData = {
        amount: Math.round(orderData?.totalPrice * 100),
    };

    const paymentHandler = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const config = {
                headers: { "Content-Type": "application/json" },
            };

            const { data } = await axios.post(
                `${server}/payment/process`,
                paymentData,
                config
            );

            const client_secret = data.client_secret;

            if (!stripe || !elements) return;
            const result = await stripe.confirmCardPayment(client_secret, {
                payment_method: {
                    card: elements.getElement(CardNumberElement),
                },
            });

            if (result.error) {
                toast.error(result.error.message);
            } else if (result.paymentIntent.status === "succeeded") {
                order.paymentInfo = {
                    id: result.paymentIntent.id,
                    status: result.paymentIntent.status,
                    type: "Credit Card",
                };

                await axios.post(`${server}/order/create-order`, order, config);
                navigate("/order/success");
                toast.success("Order successful!");
                localStorage.setItem("cartItems", JSON.stringify([]));
                localStorage.setItem("latestOrder", JSON.stringify([]));
                window.location.reload();
            }
        } catch (error) {
            toast.error(error.message || "Payment failed");
        }
        setLoading(false);
    };

    const cashOnDeliveryHandler = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const config = {
                headers: { "Content-Type": "application/json" },
            };

            order.paymentInfo = {
                type: "Cash On Delivery",
            };

            await axios.post(`${server}/order/create-order`, order, config);
            navigate("/order/success");
            toast.success("Order successful!");
            localStorage.setItem("cartItems", JSON.stringify([]));
            localStorage.setItem("latestOrder", JSON.stringify([]));
            window.location.reload();
        } catch (error) {
            toast.error(error.message || "Order failed");
        }
        setLoading(false);
    };

    return (
        <div className="bg-gradient-to-b from-[#f8f4f1] to-[#e6d8d8]">
            <div className="max-w-5xl mx-auto px-4 py-8">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-[#5a4336] mb-2">
                        Complete Your Payment
                    </h1>
                    <p className="text-[#a67d6d]">
                        Choose your preferred payment method
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <PaymentInfo
                            user={user}
                            loading={loading}
                            paymentHandler={paymentHandler}
                            cashOnDeliveryHandler={cashOnDeliveryHandler}
                        />
                    </div>
                    <div>
                        <CartData orderData={orderData} />
                    </div>
                </div>
            </div>
        </div>
    );
};

const PaymentInfo = ({
    user,
    loading,
    paymentHandler,
    cashOnDeliveryHandler,
}) => {
    const [paymentMethod, setPaymentMethod] = useState("card");

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

    return (
        <div className="group relative overflow-hidden rounded-xl bg-white shadow-lg p-5">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#d8c4b8] to-[#c8a4a5]"></div>
            
            <div className="space-y-4">
                {/* Card Payment Option */}
                <div 
                    className={`rounded-lg transition-all duration-300 ${
                        paymentMethod === "card" 
                            ? "bg-gradient-to-r from-[#f8f4f1] to-[#e6d8d8]" 
                            : "bg-white hover:bg-[#f8f4f1]"
                    }`}
                    onClick={() => setPaymentMethod("card")}
                >
                    <div className="p-3 cursor-pointer">
                        <div className="flex items-center space-x-3">
                            <CreditCard className="w-5 h-5 text-[#a67d6d]" />
                            <span className="font-medium text-[#5a4336]">Credit/Debit Card</span>
                        </div>

                        {paymentMethod === "card" && (
                            <form className="mt-4 space-y-3" onSubmit={paymentHandler}>
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-[#5a4336]">
                                        Name on Card
                                    </label>
                                    <input
                                        type="text"
                                        defaultValue={user?.name}
                                        className="w-full px-3 py-2 rounded-lg border border-[#d8c4b8] focus:ring-1 focus:ring-[#a67d6d] focus:border-transparent"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-[#5a4336]">
                                        Card Number
                                    </label>
                                    <div className="rounded-lg border border-[#d8c4b8] bg-white">
                                        <CardNumberElement 
                                            options={cardElementStyle}
                                            className="p-3"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-[#5a4336]">
                                            Expiry Date
                                        </label>
                                        <div className="rounded-lg border border-[#d8c4b8] bg-white">
                                            <CardExpiryElement 
                                                options={cardElementStyle}
                                                className="p-3"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-[#5a4336]">
                                            CVC
                                        </label>
                                        <div className="rounded-lg border border-[#d8c4b8] bg-white">
                                            <CardCvcElement 
                                                options={cardElementStyle}
                                                className="p-3"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-2.5 px-4 bg-gradient-to-r from-[#5a4336] to-[#a67d6d] text-white rounded-lg hover:from-[#a67d6d] hover:to-[#5a4336] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? "Processing..." : "Pay Now"}
                                </button>
                            </form>
                        )}
                    </div>
                </div>

                {/* Cash on Delivery Option */}
                <div 
                    className={`rounded-lg transition-all duration-300 ${
                        paymentMethod === "cod" 
                            ? "bg-gradient-to-r from-[#f8f4f1] to-[#e6d8d8]" 
                            : "bg-white hover:bg-[#f8f4f1]"
                    }`}
                    onClick={() => setPaymentMethod("cod")}
                >
                    <div className="p-3 cursor-pointer">
                        <div className="flex items-center space-x-3">
                            <Truck className="w-5 h-5 text-[#a67d6d]" />
                            <span className="font-medium text-[#5a4336]">Cash on Delivery</span>
                        </div>

                        {paymentMethod === "cod" && (
                            <div className="mt-4 space-y-3">
                                <div className="flex items-start space-x-3 p-3 rounded-lg bg-white">
                                    <AlertCircle className="w-5 h-5 text-[#c8a4a5] flex-shrink-0 mt-0.5" />
                                    <p className="text-sm text-[#5a4336]">
                                        Payment will be collected upon delivery. Please ensure someone is available to receive the package.
                                    </p>
                                </div>
                                <button
                                    onClick={cashOnDeliveryHandler}
                                    disabled={loading}
                                    className="w-full py-2.5 px-4 bg-gradient-to-r from-[#5a4336] to-[#a67d6d] text-white rounded-lg hover:from-[#a67d6d] hover:to-[#5a4336] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? "Processing..." : "Confirm Order"}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const CartData = ({ orderData }) => {
    const shipping = orderData?.shipping?.toFixed(2);

    return (
        <div className="group relative overflow-hidden rounded-xl bg-white shadow-lg p-5">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#d8c4b8] to-[#c8a4a5]"></div>
            
            <h3 className="text-lg font-bold text-[#5a4336] mb-4">Order Summary</h3>
            <div className="space-y-3">
                <div className="flex justify-between items-center">
                    <span className="text-[#a67d6d]">Subtotal</span>
                    <span className="font-medium text-[#5a4336]">Rs{orderData?.subTotalPrice}</span>
                </div>
                
                <div className="flex justify-between items-center">
                    <span className="text-[#a67d6d]">Shipping</span>
                    <span className="font-medium text-[#5a4336]">Rs{shipping}</span>
                </div>
                
                <div className="flex justify-between items-center pb-3 border-b border-[#d8c4b8]">
                    <span className="text-[#a67d6d]">Discount</span>
                    <span className="font-medium text-[#5a4336]">
                        {orderData?.discountPrice ? `Rs${orderData.discountPrice}` : "-"}
                    </span>
                </div>
                
                <div className="flex justify-between items-center pt-1">
                    <span className="font-bold text-[#5a4336]">Total</span>
                    <span className="font-bold text-[#5a4336]">Rs{orderData?.totalPrice}</span>
                </div>
            </div>
        </div>
    );
};

export default Payment;