import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { server } from '../../server';
import { toast } from 'react-toastify';
import { Lock, Eye, EyeOff, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';

const ResetPassword = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [validatingToken, setValidatingToken] = useState(true);
    const [tokenValid, setTokenValid] = useState(false);
    const [resetSuccess, setResetSuccess] = useState(false);
    const [visible, setVisible] = useState(false);
    const [confirmVisible, setConfirmVisible] = useState(false);
    const [passwordError, setPasswordError] = useState('');
    const [confirmError, setConfirmError] = useState('');
    const [passwordStrength, setPasswordStrength] = useState(0);
    const navigate = useNavigate();
    const { type, token } = useParams();
    
    // Validate token on component mount
    useEffect(() => {
        const validateToken = async () => {
            try {
                const data= await axios.get(`${server}/user/validate-reset-token/${token}`);
                //console.log(data);
                setTokenValid(true);
            } catch (err) {
                console.log(err);
                toast.error('Invalid or expired reset token');
                // We'll show the error state but not navigate away
            } finally {
                setValidatingToken(false);
            }
        };
        
        // Validate the route parameters
        if (!type || (type !== 'user' && type !== 'shop')) {
            toast.error('Invalid user type');
            navigate('/');
            return;
        }
        
        if (!token) {
            toast.error('Reset token is missing');
            navigate('/');
            return;
        }
        
        validateToken();
    }, [type, token, navigate]);

    // Check password strength
    const checkPasswordStrength = (password) => {
        let score = 0;
        
        // Length check
        if (password.length >= 6) score += 1;
        if (password.length >= 12) score += 1;
        
        // Complexity checks
        if (/[A-Z]/.test(password)) score += 1; // Has uppercase
        if (/[a-z]/.test(password)) score += 1; // Has lowercase
        if (/[0-9]/.test(password)) score += 1; // Has number
        if (/[^A-Za-z0-9]/.test(password)) score += 1; // Has special char
        
        return Math.min(Math.floor(score * (10/6)), 10); // Score from 0-10
    };
    
    const handlePasswordChange = (e) => {
        const value = e.target.value;
        setPassword(value);
        
        // Check password requirements
        const strength = checkPasswordStrength(value);
        setPasswordStrength(strength);
        
        if (value.length < 8) {
            setPasswordError('Password must be at least 8 characters long');
        } else if (strength < 5) {
            setPasswordError('Password is too weak. Add uppercase, numbers, or special characters');
        } else {
            setPasswordError('');
        }
        
        // Clear confirm error if passwords match now
        if (confirmPassword && value === confirmPassword) {
            setConfirmError('');
        }
    };
    
    const handleConfirmChange = (e) => {
        const value = e.target.value;
        setConfirmPassword(value);
        
        if (password && value && password !== value) {
            setConfirmError('Passwords do not match');
        } else {
            setConfirmError('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate password
        if (password.length < 6) {
            setPasswordError('Password must be at least 6 characters long');
            return;
        }
        
        // Validate password strength
        if (passwordStrength < 5) {
            setPasswordError('Please choose a stronger password');
            return;
        }
        
        // Check if passwords match
        if (password !== confirmPassword) {
            setConfirmError('Passwords do not match!');
            return;
        }
        
        setLoading(true);
        try {
            await axios.put(`${server}/user/reset-password/${token}`, { password, confirmPassword });
            setResetSuccess(true);
            toast.success('Password reset successfully!');
            
            // Delay navigation to show success message
            setTimeout(() => {
                navigate(type === 'user' ? '/login' : '/shop-login');
            }, 5000);
        } catch (err) {
            toast.error(err.response?.data?.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    // Get strength color for password meter
    const getStrengthColor = () => {
        if (passwordStrength <= 3) return 'bg-red-500';
        if (passwordStrength <= 6) return 'bg-yellow-500';
        return 'bg-green-500';
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

                    <h2 className="text-center text-2xl font-bold text-gray-800 mb-6">Reset Password</h2>

                    {validatingToken ? (
                        <div className="flex justify-center items-center py-8">
                            <svg className="animate-spin h-8 w-8 text-[#a67d6d]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span className="ml-3 text-gray-700">Validating your reset link...</span>
                        </div>
                    ) : !tokenValid ? (
                        <div className="animate-scaleUp">
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                                <div className="flex items-center mb-2">
                                    <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                                    <h3 className="text-red-800 font-medium">Invalid or Expired Link</h3>
                                </div>
                                <p className="text-red-700 text-sm">
                                    This password reset link is either invalid or has expired.
                                    Please request a new password reset link.
                                </p>
                            </div>
                            <div className="mt-6 flex justify-center">
                                <Link 
                                    to={`/forgot-password/${type}`}
                                    className="py-2 px-4 bg-gradient-to-r from-[#a67d6d] to-[#5a4336] text-white font-medium rounded-lg 
                                           relative overflow-hidden button-shine hover:shadow-xl transition-all duration-300"
                                >
                                    Request New Reset Link
                                </Link>
                            </div>
                        </div>
                    ) : resetSuccess ? (
                        <div className="animate-scaleUp bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                            <div className="flex items-center mb-3">
                                <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                                <h3 className="text-green-800 font-medium">Password Reset Successfully!</h3>
                            </div>
                            <p className="text-green-700 text-sm">
                                Your password has been updated successfully. You can now log in with your new password.
                            </p>
                            <p className="text-green-700 text-sm mt-2">
                                You'll be redirected to the login page in a few seconds...
                            </p>
                            <div className="mt-6 flex justify-center">
                                <Link 
                                    to={type === 'user' ? '/login' : '/shop-login'}
                                    className="py-2 px-4 bg-gradient-to-r from-[#5a8d77] to-[#3c6351] text-white font-medium rounded-lg 
                                           relative overflow-hidden button-shine hover:shadow-xl transition-all duration-300"
                                >
                                    Go to Login
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="animate-slideUp">
                            <div className="space-y-5">
                                {/* Password Field */}
                                <div className="input-container">
                                    <div className="input-glow"></div>
                                    <label className="block text-gray-700 text-sm font-medium mb-1">New Password</label>
                                    <div className="relative">
                                        <input
                                            type={visible ? "text" : "password"}
                                            value={password}
                                            onChange={handlePasswordChange}
                                            className={`w-full pl-10 pr-10 py-2.5 border ${
                                                passwordError ? 'border-red-300' : 'border-gray-300'
                                            } rounded-lg focus:ring-2 focus:ring-[#d8c4b8] focus:border-transparent transition duration-200 bg-white/70`}
                                            placeholder="Enter your new password"
                                        />
                                        <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                        <button
                                            type="button"
                                            onClick={() => setVisible(!visible)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            {visible ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                    {passwordError && (
                                        <p className="mt-1 text-red-500 text-xs">{passwordError}</p>
                                    )}
                                    
                                    {/* Password Strength Meter */}
                                    {password && (
                                        <div className="mt-2">
                                            <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                                                <div 
                                                    className={`h-full ${getStrengthColor()} transition-all duration-300`} 
                                                    style={{ width: `${passwordStrength * 10}%` }}
                                                ></div>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {passwordStrength <= 3 && 'Weak password'}
                                                {passwordStrength > 3 && passwordStrength <= 6 && 'Moderate password'}
                                                {passwordStrength > 6 && 'Strong password'}
                                            </p>
                                        </div>
                                    )}
                                </div>
                                
                                {/* Confirm Password Field */}
                                <div className="input-container">
                                    <div className="input-glow"></div>
                                    <label className="block text-gray-700 text-sm font-medium mb-1">Confirm Password</label>
                                    <div className="relative">
                                        <input
                                            type={confirmVisible ? "text" : "password"}
                                            value={confirmPassword}
                                            onChange={handleConfirmChange}
                                            className={`w-full pl-10 pr-10 py-2.5 border ${
                                                confirmError ? 'border-red-300' : 'border-gray-300'
                                            } rounded-lg focus:ring-2 focus:ring-[#d8c4b8] focus:border-transparent transition duration-200 bg-white/70`}
                                            placeholder="Confirm your new password"
                                        />
                                        <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                        <button
                                            type="button"
                                            onClick={() => setConfirmVisible(!confirmVisible)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            {confirmVisible ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                    {confirmError && (
                                        <p className="mt-1 text-red-500 text-xs">{confirmError}</p>
                                    )}
                                </div>
                                
                                {/* Password Requirements */}
                                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                    <p className="text-xs text-gray-700 font-medium mb-2">Password Requirements:</p>
                                    <ul className="text-xs text-gray-600 space-y-1">
                                        <li className="flex items-center">
                                            <span className={`mr-1.5 ${password.length >= 8 ? 'text-green-500' : 'text-gray-400'}`}>
                                                {password.length >= 6 ? '✓' : '○'}
                                            </span>
                                            At least 8 characters long
                                        </li>
                                        <li className="flex items-center">
                                            <span className={`mr-1.5 ${/[A-Z]/.test(password) ? 'text-green-500' : 'text-gray-400'}`}>
                                                {/[A-Z]/.test(password) ? '✓' : '○'}
                                            </span>
                                            Contains uppercase letters
                                        </li>
                                        <li className="flex items-center">
                                            <span className={`mr-1.5 ${/[0-9]/.test(password) ? 'text-green-500' : 'text-gray-400'}`}>
                                                {/[0-9]/.test(password) ? '✓' : '○'}
                                            </span>
                                            Contains numbers
                                        </li>
                                        <li className="flex items-center">
                                            <span className={`mr-1.5 ${/[^A-Za-z0-9]/.test(password) ? 'text-green-500' : 'text-gray-400'}`}>
                                                {/[^A-Za-z0-9]/.test(password) ? '✓' : '○'}
                                            </span>
                                            Contains special characters
                                        </li>
                                    </ul>
                                </div>
                            </div>

                            <div className="mt-8">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`w-full py-2.5 bg-gradient-to-r from-[#a67d6d] to-[#5a4336] text-white font-medium rounded-lg 
                                           relative overflow-hidden button-shine hover:shadow-xl transition-all duration-300 ${
                                        loading ? 'opacity-70 cursor-not-allowed' : ''
                                    }`}
                                >
                                    {loading ? (
                                        <div className="flex items-center justify-center">
                                            <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Resetting Password...
                                        </div>
                                    ) : (
                                        'Reset Password'
                                    )}
                                </button>
                            </div>

                            <div className="mt-6 flex justify-center">
                                <Link
                                    to={type === 'user' ? '/login' : '/shop-login'}
                                    className="inline-flex items-center text-[#5a4336] hover:text-[#a67d6d] transition-colors"
                                >
                                    <ArrowLeft className="w-4 h-4 mr-1" />
                                    Back to Login
                                </Link>
                            </div>
                        </form>
                    )}
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

export default ResetPassword;