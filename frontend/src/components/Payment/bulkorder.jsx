import React, { useEffect, useState } from "react"; 
import { useNavigate, useParams } from "react-router-dom";
import styles from "../../styles/styles";
import {
    CardNumberElement,
    CardCvcElement,
    CardExpiryElement,
    useStripe,
    useElements,
} from "@stripe/react-stripe-js";
import { useSelector } from "react-redux";
import axios from "axios";
import { server } from "../../server";
import { toast } from "react-toastify";

const BulkOrderPaymentPage = () => {
    const { rfqId } = useParams();
    const [bulkOrderDetails, setBulkOrderDetails] = useState({});
    const { user } = useSelector((state) => state.user);
    const [paymentMethod, setPaymentMethod] = useState("card");
    const navigate = useNavigate();
    const stripe = useStripe();
    const elements = useElements();

    useEffect(() => {
        const fetchBulkOrderDetails = async () => {
            try {
                const { data } = await axios.get(`${server}/bulk-order/offer-details/${rfqId}`);
                setBulkOrderDetails(data);
            } catch (error) {
                toast.error("Failed to fetch bulk order details");
            }
        };
        fetchBulkOrderDetails();
    }, [rfqId]);

    const paymentData = {
        amount: Math.round(bulkOrderDetails?.offer?.price * 100),
    };

    const paymentHandler = async (e) => {
        e.preventDefault();
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
            } else {
                if (result.paymentIntent.status === "succeeded") {
                    const paymentInfo = {
                        id: result.paymentIntent.id,
                        status: result.paymentIntent.status,
                        type: "Credit Card",
                    };

                    await axios.post(
                        `${server}/bulk-order/confirm-payment/${rfqId}`,
                        { paymentInfo },
                        config
                    );

                    toast.success("Payment successful!");
    
    // Show a success message and navigate to profile page
                    setTimeout(() => {
                        navigate("/profile");
                    }, 2000);
                }
            }
        } catch (error) {
            toast.error("Payment failed!");
        }
    };

    const cashOnDeliveryHandler = async (e) => {
        e.preventDefault();
        try {
            const config = {
                headers: { "Content-Type": "application/json" },
            };

            const paymentInfo = {
                type: "Cash On Delivery",
            };

            await axios.post(
                `${server}/bulk-order/confirm-payment/${rfqId}`,
                { paymentInfo },
                config
            );

            toast.success("Order placed successfully with COD!");
            setTimeout(() => {
                navigate("/profile");
            }, 2000);
            
        } catch (error) {
            toast.error("Failed to place the order.");
        }
    };

    return (
        <div className="w-full flex flex-col items-center py-8">
            <div className="w-[90%] 1000px:w-[70%] block 800px:flex">
                <div className="w-full 800px:w-[65%]">
                    <PaymentInfo
                        user={user}
                        paymentHandler={paymentHandler}
                        cashOnDeliveryHandler={cashOnDeliveryHandler}
                        setPaymentMethod={setPaymentMethod}
                        paymentMethod={paymentMethod}
                    />
                </div>
                <div className="w-full 800px:w-[35%] 800px:mt-0 mt-8">
                    <OrderSummary bulkOrderDetails={bulkOrderDetails} />
                </div>
            </div>
        </div>
    );
};

const PaymentInfo = ({ user, paymentHandler, cashOnDeliveryHandler, setPaymentMethod, paymentMethod }) => (
    <div className="w-full 800px:w-[95%] bg-[#fff] rounded-md p-5 pb-8">
        <h4 className="text-[18px] font-[600] mb-4">Select Payment Method</h4>

        {/* Card Payment Option */}
        <div className="flex w-full pb-5 border-b mb-2">
            <div
                className="w-[25px] h-[25px] rounded-full bg-transparent border-[3px] border-[#1d1a1ab4] relative flex items-center justify-center"
                onClick={() => setPaymentMethod("card")}
            >
                {paymentMethod === "card" && (
                    <div className="w-[13px] h-[13px] bg-[#1d1a1acb] rounded-full" />
                )}
            </div>
            <h4 className="text-[18px] pl-2 font-[600] text-[#000000b1]">
                Pay with Debit/Credit Card
            </h4>
        </div>

        {paymentMethod === "card" && (
            <form className="w-full" onSubmit={paymentHandler}>
                <div className="w-full flex pb-3">
                    <input
                        required
                        defaultValue={user && user.name}
                        className={`${styles.input} !w-full`}
                        placeholder="Name on Card"
                    />
                </div>
                <div className="w-full flex pb-3">
                    <CardNumberElement className={`${styles.input} !h-[35px]`} />
                </div>
                <div className="w-full flex pb-3">
                    <CardExpiryElement className={`${styles.input}`} />
                </div>
                <div className="w-full flex pb-3">
                    <CardCvcElement className={`${styles.input}`} />
                </div>
                <input
                    type="submit"
                    value="Pay Now"
                    className={`${styles.button} bg-[#f63b60] text-white`}
                />
            </form>
        )}

        {/* Cash on Delivery Option */}
        <div className="flex w-full pb-5 border-b mb-2">
            <div
                className="w-[25px] h-[25px] rounded-full bg-transparent border-[3px] border-[#1d1a1ab4] relative flex items-center justify-center"
                onClick={() => setPaymentMethod("cod")}
            >
                {paymentMethod === "cod" && (
                    <div className="w-[13px] h-[13px] bg-[#1d1a1acb] rounded-full" />
                )}
            </div>
            <h4 className="text-[18px] pl-2 font-[600] text-[#000000b1]">
                Cash on Delivery
            </h4>
        </div>

        {paymentMethod === "cod" && (
            <form className="w-full" onSubmit={cashOnDeliveryHandler}>
                <input
                    type="submit"
                    value="Confirm Order"
                    className={`${styles.button} bg-[#f63b60] text-white`}
                />
            </form>
        )}
    </div>
);

const OrderSummary = ({ bulkOrderDetails }) => (
    <div className="w-full bg-[#fff] rounded-md p-5 pb-8">
        <h3 className="text-[18px] font-[600] mb-4">Order Summary</h3>
       
        <div className="flex justify-between">
            <h4>Total:</h4>
            <h5>Rs {bulkOrderDetails?.offer?.price}</h5>
        </div>
        <div className="flex justify-between">
            <h4>Delivery Time:</h4>
            <h5>{bulkOrderDetails?.offer?.deliveryTime} days</h5>
        </div>
        <div className="flex justify-between">
            <h4>No. of items:</h4>
            <h5>{bulkOrderDetails?.offer?.availableQuantity} items</h5>
        </div>
        
    </div>
);

export default BulkOrderPaymentPage;
