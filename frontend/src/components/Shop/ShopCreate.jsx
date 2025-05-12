import React, { useState } from 'react';
import { Eye, EyeOff, Mail, User, Phone, MapPin, Hash, Globe } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { server } from '../../server';
import { toast } from 'react-toastify';
import { RxAvatar } from 'react-icons/rx';

const ShopCreate = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [phoneNumber, setPhoneNumber] = useState();
    const [address, setAddress] = useState("");
    const [zipCode, setZipCode] = useState();
    const [region, setRegion] = useState("");
    const [area, setArea] = useState("");
    const [avatar, setAvatar] = useState();
    const [password, setPassword] = useState("");
    const [visible, setVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        const config = { headers: { "Content-Type": "multipart/form-data" } };

        const newForm = new FormData();
        newForm.append("file", avatar);
        newForm.append("name", name);
        newForm.append("email", email);
        newForm.append("password", password);
        newForm.append("zipCode", zipCode);
        newForm.append("address", address);
       
        // Only append region if it has a value
    if (region) {
      newForm.append("region", region);
  }
  
  if (area) {
      newForm.append("area", area);
  }
        newForm.append("phoneNumber", phoneNumber);

        try {
            const res = await axios.post(`${server}/shop/create-shop`, newForm, config);
            toast.success(res.data.message);
            // Reset form fields
            setName("");
            setEmail("");
            setPassword("");
            setAvatar();
            setZipCode();
            setAddress("");
            setRegion("");
            setArea("");
            setPhoneNumber();
            navigate("/shop-login");
        } catch (error) {
            toast.error(error.response.data.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileInputChange = (e) => {
        const file = e.target.files[0];
        setAvatar(file);
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

                    <h2 className="text-center text-2xl font-bold text-gray-800 mb-6">Create your Shop</h2>

                    <form onSubmit={handleSubmit} className="space-y-6 animate-slideUp">
                        {/* Shop Name Input */}
                        <div className="input-container group">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-[#a67d6d] transition-all duration-300" />
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:border-[#a67d6d] focus:ring-2 focus:ring-[#d8c4b8] transition-all duration-300 outline-none hover:shadow-lg"
                                placeholder="Shop Name"
                            />
                            <div className="input-glow"></div>
                        </div>

                        {/* Phone Number Input */}
                        <div className="input-container group">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-[#a67d6d] transition-all duration-300" />
                            <input
                                type="number"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:border-[#a67d6d] focus:ring-2 focus:ring-[#d8c4b8] transition-all duration-300 outline-none hover:shadow-lg"
                                placeholder="Phone Number"
                            />
                            <div className="input-glow"></div>
                        </div>

                        {/* Email Input */}
                        <div className="input-container group">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-[#a67d6d] transition-all duration-300" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:border-[#a67d6d] focus:ring-2 focus:ring-[#d8c4b8] transition-all duration-300 outline-none hover:shadow-lg"
                                placeholder="Email"
                            />
                            <div className="input-glow"></div>
                        </div>

                        {/* Address Input */}
                        <div className="input-container group">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-[#a67d6d] transition-all duration-300" />
                            <input
                                type="text"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:border-[#a67d6d] focus:ring-2 focus:ring-[#d8c4b8] transition-all duration-300 outline-none hover:shadow-lg"
                                placeholder="Address"
                            />
                            <div className="input-glow"></div>
                        </div>

                        {/* Zip Code Input */}
                        <div className="input-container group">
                            <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-[#a67d6d] transition-all duration-300" />
                            <input
                                type="number"
                                value={zipCode}
                                onChange={(e) => setZipCode(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:border-[#a67d6d] focus:ring-2 focus:ring-[#d8c4b8] transition-all duration-300 outline-none hover:shadow-lg"
                                placeholder="Zip Code"
                            />
                            <div className="input-glow"></div>
                        </div>

                        {/* Region Input */}
                        <div className="input-container group">
                            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-[#a67d6d] transition-all duration-300" />
                            <input
                                type="text"
                                value={region}
                                onChange={(e) => setRegion(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:border-[#a67d6d] focus:ring-2 focus:ring-[#d8c4b8] transition-all duration-300 outline-none hover:shadow-lg"
                                placeholder="Region"
                            />
                            <div className="input-glow"></div>
                        </div>

                        {/* Area Input */}
                        <div className="input-container group">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-[#a67d6d] transition-all duration-300" />
                            <input
                                type="text"
                                value={area}
                                onChange={(e) => setArea(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:border-[#a67d6d] focus:ring-2 focus:ring-[#d8c4b8] transition-all duration-300 outline-none hover:shadow-lg"
                                placeholder="Area"
                            />
                            <div className="input-glow"></div>
                        </div>

                        {/* Password Input */}
                        <div className="input-container group relative">
                            <Eye className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-[#a67d6d] transition-all duration-300" />
                            <input
                                type={visible ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-10 pr-12 py-3 rounded-lg border border-gray-200 focus:border-[#a67d6d] focus:ring-2 focus:ring-[#d8c4b8] transition-all duration-300 outline-none hover:shadow-lg"
                                placeholder="Password"
                            />
                            <button
                                type="button"
                                onClick={() => setVisible(!visible)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#a67d6d] transition-all duration-300"
                            >
                                {visible ? (
                                    <Eye className="w-5 h-5 hover:scale-110" />
                                ) : (
                                    <EyeOff className="w-5 h-5 hover:scale-110" />
                                )}
                            </button>
                            <div className="input-glow"></div>
                        </div>

                        {/* Avatar Upload */}
                        <div className="flex items-center space-x-4 p-3 border border-gray-200 rounded-lg hover:shadow-lg transition-all duration-300">
                            <label htmlFor="file-input" className="cursor-pointer flex items-center group">
                                <RxAvatar className="h-8 w-8 text-gray-400 group-hover:text-[#a67d6d] transition-all duration-300" />
                                <span className="ml-2 text-sm text-gray-700">Upload Avatar</span>
                                <input
                                    type="file"
                                    id="file-input"
                                    onChange={handleFileInputChange}
                                    className="sr-only"
                                />
                            </label>
                            {avatar && (
                                <img
                                    src={URL.createObjectURL(avatar)}
                                    alt="avatar"
                                    className="h-8 w-8 rounded-full object-cover"
                                />
                            )}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3 px-4 bg-gradient-to-r from-[#a67d6d] to-[#5a4336] text-white font-medium rounded-lg 
                                     relative overflow-hidden button-shine hover:shadow-xl 
                                     disabled:opacity-70 disabled:cursor-not-allowed
                                     transform hover:scale-105 transition-all duration-300"
                        >
                            {isLoading ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Creating Shop...
                                </span>
                            ) : (
                                "Create Shop"
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <span className="text-gray-600">Already have a shop account? </span>
                        <Link 
                            to="/shop-login" 
                            className="text-[#a67d6d] hover:text-[#5a4336] font-medium transition-colors duration-300 hover:underline link-shine"
                        >
                            Sign In
                        </Link>
                    </div>
                </div>
            </div>

            <style jsx>{`
                /* Existing styles from previous component */
                
                /* Custom Animations */
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

export default ShopCreate;