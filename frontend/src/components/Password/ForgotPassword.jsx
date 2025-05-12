import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { server } from '../../server';
import { toast } from 'react-toastify';
import { Mail, ArrowLeft, Info } from 'lucide-react';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [emailError, setEmailError] = useState('');
    const [showInfo, setShowInfo] = useState(false);
    const [emailSent, setEmailSent] = useState(false);
    const navigate = useNavigate();
    const { type } = useParams();
    
    // Validate the type param to prevent errors
    useEffect(() => {
        if (!type || (type !== 'user' && type !== 'shop')) {
            toast.error('Invalid user type');
            navigate('/');
        }
    }, [type, navigate]);

    // Email validation function
    const validateEmail = (email) => {
        const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    };

    const handleEmailChange = (e) => {
        const value = e.target.value;
        setEmail(value);
        
        if (value && !validateEmail(value)) {
            setEmailError('Please enter a valid email address');
        } else {
            setEmailError('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate email format
        if (!validateEmail(email)) {
            setEmailError('Please enter a valid email address');
            return;
        }
        
        setLoading(true);
        try {
// ForgotPassword.js
await axios.post(`${server}/user/forgot-password`, { email, type }); // Add 'type' here
            toast.success('Password reset link sent to your email!');
            setEmailSent(true);
            // Don't navigate away immediately so user can see confirmation
            setTimeout(() => {
                navigate(type === 'user' ? '/login' : '/shop-login');
            }, 5000);
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'An error occurred';
            toast.error(errorMessage);
            
            // Provide more helpful messages based on common errors
            if (errorMessage.includes('not found') || errorMessage.includes('exist')) {
                setEmailError('This email is not registered in our system');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#d8c4b8] via-[#c8a4a5] to-[#a67d6d] p-4 overflow-hidden relative">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="butterfly butterfly1"></div>
                <div className="butterfly butterfly2"></div>
                <div className="butterfly butterfly3"></div>
                
                <div className="floating-circle circle1"></div>
                <div className="floating-circle circle2"></div>
                <div className="floating-circle circle3"></div>
            </div>

            <div className="w-full max-w-md relative z-10 animate-fadeIn">
                <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl p-8 relative overflow-hidden animate-scaleUp">
                    <div className="flex justify-center mb-8">
                        <span className="text-[#5a4336] text-4xl font-bold">تمكين</span>
                    </div>

                    <h2 className="text-center text-2xl font-bold text-gray-800 mb-6">Forgot Password</h2>

                    {emailSent ? (
                        <div className="animate-scaleUp bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                            <div className="flex items-center mb-3">
                                <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <h3 className="text-green-800 font-medium">Email Sent Successfully</h3>
                            </div>
                            <p className="text-green-700 text-sm">
                                We've sent a password reset link to <strong>{email}</strong>. 
                                Please check your inbox and follow the instructions.
                            </p>
                            <p className="text-green-700 text-sm mt-2">
                                You'll be redirected to the login page automatically in a few seconds.
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6 animate-slideUp">
                            <div className="relative mb-2">
                                <button 
                                    type="button" 
                                    onClick={() => setShowInfo(!showInfo)}
                                    className="absolute right-0 top-0 text-gray-500 hover:text-[#a67d6d] transition-all"
                                >
                                    <Info className="w-5 h-5" />
                                </button>
                                
                                {showInfo && (
                                    <div className="p-3 bg-blue-50 rounded-lg text-sm text-blue-800 mt-2 mb-4 animate-fadeIn">
                                        Enter the email address you used when you registered. 
                                        We'll send you a link to reset your password.
                                    </div>
                                )}
                            </div>
                            
                            {/* Email Input */}
                            <div className="input-container group">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-[#a67d6d] transition-all duration-300" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={handleEmailChange}
                                    className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                                        emailError ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 'border-gray-200 focus:border-[#a67d6d] focus:ring-[#d8c4b8]'
                                    } transition-all duration-300 outline-none hover:shadow-lg`}
                                    placeholder="Email"
                                    required
                                    aria-invalid={emailError ? "true" : "false"}
                                    aria-describedby={emailError ? "email-error" : undefined}
                                />
                                <div className={`input-glow ${emailError ? 'error-glow' : ''}`}></div>
                            </div>
                            
                            {/* Email validation error message */}
                            {emailError && (
                                <div id="email-error" className="text-red-500 text-sm -mt-3 pl-2 flex items-center">
                                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    {emailError}
                                </div>
                            )}

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading || !!emailError}
                                className="w-full py-3 px-4 bg-gradient-to-r from-[#a67d6d] to-[#5a4336] text-white font-medium rounded-lg 
                                         relative overflow-hidden button-shine hover:shadow-xl 
                                         disabled:opacity-70 disabled:cursor-not-allowed
                                         transform hover:scale-105 transition-all duration-300"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Sending...
                                    </span>
                                ) : (
                                    "Send Reset Link"
                                )}
                            </button>
                        </form>
                    )}

                    <div className="mt-8 text-center">
                        <Link 
                            to={type === 'user' ? '/login' : '/shop-login'} 
                            className="text-[#a67d6d] hover:text-[#5a4336] font-medium transition-colors duration-300 hover:underline link-shine flex items-center justify-center"
                        >
                            <ArrowLeft className="w-4 h-4 mr-1" />
                            Back to Login
                        </Link>
                    </div>
                </div>
            </div>

            <style jsx>{`
                /* Butterfly animations */
                @keyframes flutter {
                    0%, 100% { transform: translate(0, 0) rotate(0deg); }
                    25% { transform: translate(10px, -15px) rotate(5deg); }
                    50% { transform: translate(0, -25px) rotate(0deg); }
                    75% { transform: translate(-10px, -15px) rotate(-5deg); }
                }
                
                .butterfly {
                    position: absolute;
                    width: 20px;
                    height: 20px;
                    opacity: 0.6;
                    background-image: radial-gradient(circle, #f0d4c4, #d8b4a0);
                    border-radius: 50% 50% 0 50%;
                    animation: flutter 8s infinite ease-in-out;
                    filter: blur(1px);
                }
                
                .butterfly1 {
                    top: 20%;
                    left: 10%;
                    animation-delay: 0s;
                }
                
                .butterfly2 {
                    top: 15%;
                    right: 20%;
                    animation-delay: 2s;
                }
                
                .butterfly3 {
                    bottom: 30%;
                    left: 30%;
                    animation-delay: 4s;
                }
                
                /* Floating circles */
                @keyframes float {
                    0%, 100% { transform: translate(0, 0); }
                    50% { transform: translate(15px, -15px); }
                }
                
                .floating-circle {
                    position: absolute;
                    border-radius: 50%;
                    opacity: 0.3;
                    animation: float 10s infinite ease-in-out;
                }
                
                .circle1 {
                    width: 100px;
                    height: 100px;
                    background-color: #e3d5cd;
                    top: 10%;
                    right: 15%;
                    animation-delay: 0s;
                }
                
                .circle2 {
                    width: 150px;
                    height: 150px;
                    background-color: #c8a4a5;
                    bottom: 15%;
                    right: 10%;
                    animation-delay: 3s;
                }
                
                .circle3 {
                    width: 80px;
                    height: 80px;
                    background-color: #a67d6d;
                    bottom: 25%;
                    left: 10%;
                    animation-delay: 6s;
                }
                
                /* Input glow effect */
                .input-container {
                    position: relative;
                }
                
                .input-glow {
                    position: absolute;
                    inset: 0;
                    border-radius: 0.5rem;
                    opacity: 0;
                    transition: opacity 0.3s;
                    pointer-events: none;
                    box-shadow: 0 0 15px rgba(216, 196, 184, 0.5);
                }
                
                .input-container:focus-within .input-glow {
                    opacity: 1;
                }
                
                .error-glow {
                    box-shadow: 0 0 15px rgba(239, 68, 68, 0.3);
                }
                
                /* Button shine effect */
                @keyframes shine {
                    0% { left: -100%; }
                    100% { left: 100%; }
                }
                
                .button-shine::after {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: -100%;
                    width: 50%;
                    height: 100%;
                    background: linear-gradient(
                        to right,
                        rgba(255, 255, 255, 0) 0%,
                        rgba(255, 255, 255, 0.3) 50%,
                        rgba(255, 255, 255, 0) 100%
                    );
                    transform: skewX(-25deg);
                    animation: shine 3s infinite;
                }
                
                /* Link shine effect */
                .link-shine {
                    position: relative;
                    overflow: hidden;
                }
                
                .link-shine::after {
                    content: '';
                    position: absolute;
                    left: -100%;
                    bottom: -2px;
                    width: 100%;
                    height: 2px;
                    background: linear-gradient(to right, #a67d6d, #5a4336);
                    transition: left 0.3s ease;
                }
                
                .link-shine:hover::after {
                    left: 0;
                }
                
                /* Animations */
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                @keyframes scaleUp {
                    from { transform: scale(0.8); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }

                @keyframes slideUp {
                    from { transform: translateY(50px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }

                .animate-fadeIn {
                    animation: fadeIn 0.5s ease-out;
                }

                .animate-scaleUp {
                    animation: scaleUp 0.5s ease-out;
                }

                .animate-slideUp {
                    animation: slideUp 0.5s ease-out 0.3s backwards;
                }
            `}</style>
        </div>
    );
};

export default ForgotPassword;