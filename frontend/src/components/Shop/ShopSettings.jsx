import React, { useState, useEffect } from "react";
import { Camera } from "lucide-react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { backend_url, server } from "../../server";
import { loadSeller } from "../../redux/actions/user";
import { toast } from "react-toastify";

const colors = {
  primary: '#c8a4a5',
  secondary: '#e6d8d8',
  tertiary: '#f5f0f0',
  light: '#faf7f7',
  white: '#ffffff',
  dark: '#5a4336',
  warning: '#f59e0b',
  danger: '#ef4444',
  success: '#10b981',
};

const ShopSettings = () => {
    const { seller } = useSelector((state) => state.seller);
    const [avatar, setAvatar] = useState(null);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [address, setAddress] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [zipCode, setZipcode] = useState("");
    const [area, setArea] = useState("");
    const [region, setRegion] = useState("");
    const dispatch = useDispatch();
    
    useEffect(() => {
        if (seller) {
            setName(seller.name || "");
            setDescription(seller.description || "");
            setAddress(seller.address || "");
            setPhoneNumber(seller.phoneNumber || "");
            setZipcode(seller.zipCode || "");
            setArea(seller.area || "");
            setRegion(seller.region || "");
        }
    }, [seller]);

    const handleImage = async (e) => {
        e.preventDefault();
        const file = e.target.files[0];
        setAvatar(file);

        const formData = new FormData();
        formData.append("image", e.target.files[0]);

        await axios.put(`${server}/shop/update-shop-avatar`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
            withCredentials: true,
        }).then((res) => {
            dispatch(loadSeller());
            toast.success("Avatar updated successfully!");
        }).catch((error) => {
            toast.error(error.response.data.message);
        });
    };

    const updateHandler = async (e) => {
        e.preventDefault();

        await axios.put(`${server}/shop/update-seller-info`, {
            name,
            description,
            area,
            region,
            address,
            phoneNumber,
            zipCode,
        }, { withCredentials: true }).then((res) => {
            toast.success("Shop info updated successfully!");
            dispatch(loadSeller());
        }).catch((error) => {
            toast.error(error.response.data.message);
        });
    };

    return (
        <div className="p-6" style={{ backgroundColor: colors.light }}>
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-3">
                    <h1 className="text-3xl font-bold" style={{ color: colors.dark }}>
                        Shop Settings
                    </h1>
                    <p className="text-gray-600">Manage your shop information and profile</p>
                </div>

                {/* Main Content */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="grid grid-cols-1 lg:grid-cols-6">
                        {/* Left Side - Profile Section */}
                        <div className="lg:col-span-2 p-4 flex flex-col items-center justify-center" style={{ backgroundColor: colors.tertiary }}>
                            <div className="text-center">
                                <div className="relative inline-block mb-3">
                                    <img
                                        src={avatar ? URL.createObjectURL(avatar) : `${backend_url}${seller?.avatar}`}
                                        alt="shop avatar"
                                        className="w-40 h-40 rounded-full object-cover border-4 shadow-lg"
                                        style={{ borderColor: colors.primary }}
                                    />
                                    <div 
                                        className="absolute -bottom-2 -right-2 w-12 h-12 rounded-full flex items-center justify-center cursor-pointer shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                                        style={{ backgroundColor: colors.primary }}
                                    >
                                        <input
                                            type="file"
                                            id="image"
                                            className="hidden"
                                            onChange={handleImage}
                                            accept="image/*"
                                        />
                                        <label htmlFor="image" className="cursor-pointer">
                                            <Camera size={20} className="text-white" />
                                        </label>
                                    </div>
                                </div>
                                <h2 className="text-xl font-semibold mb-2" style={{ color: colors.dark }}>
                                    {name || seller?.name || 'Shop Name'}
                                </h2>
                                
                                {/* Display current area and region */}
                                <div className="mb-2">
                                    {(area || seller?.area) && (
                                        <p className="text-gray-600 text-sm">
                                            <span className="font-medium">Area:</span> {area || seller?.area}
                                        </p>
                                    )}
                                    {(region || seller?.region) && (
                                        <p className="text-gray-600 text-sm">
                                            <span className="font-medium">Region:</span> {region || seller?.region}
                                        </p>
                                    )}
                                </div>
                                
                                <p className="text-gray-600 text-sm mt-2">
                                    Click the camera icon to update your profile picture
                                </p>
                            </div>
                        </div>

                        {/* Right Side - Form Section */}
                        <div className="lg:col-span-4 p-8">
                            <form onSubmit={updateHandler} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium mb-2" style={{ color: colors.dark }}>
                                            Shop Name *
                                        </label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none transition-all duration-200"
                                            style={{ 
                                                borderColor: colors.primary,
                                                backgroundColor: colors.light,
                                                color: colors.dark
                                            }}
                                            required
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="Enter your shop name"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-2" style={{ color: colors.dark }}>
                                            Phone Number *
                                        </label>
                                        <input
                                            type="tel"
                                            className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none transition-all duration-200"
                                            style={{ 
                                                borderColor: colors.primary,
                                                backgroundColor: colors.light,
                                                color: colors.dark
                                            }}
                                            required
                                            value={phoneNumber}
                                            onChange={(e) => setPhoneNumber(e.target.value)}
                                            placeholder="Enter phone number"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2" style={{ color: colors.dark }}>
                                        Shop Description
                                    </label>
                                    <textarea
                                        rows="3"
                                        className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none transition-all duration-200 resize-none"
                                        style={{ 
                                            borderColor: colors.primary,
                                            backgroundColor: colors.light,
                                            color: colors.dark
                                        }}
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Describe your shop..."
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium mb-2" style={{ color: colors.dark }}>
                                            Area *
                                        </label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none transition-all duration-200"
                                            style={{ 
                                                borderColor: colors.primary,
                                                backgroundColor: colors.light,
                                                color: colors.dark
                                            }}
                                            required
                                            value={area}
                                            onChange={(e) => setArea(e.target.value)}
                                            placeholder="Enter area"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-2" style={{ color: colors.dark }}>
                                            Region *
                                        </label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none transition-all duration-200"
                                            style={{ 
                                                borderColor: colors.primary,
                                                backgroundColor: colors.light,
                                                color: colors.dark
                                            }}
                                            required
                                            value={region}
                                            onChange={(e) => setRegion(e.target.value)}
                                            placeholder="Enter region"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium mb-2" style={{ color: colors.dark }}>
                                            Shop Address *
                                        </label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none transition-all duration-200"
                                            style={{ 
                                                borderColor: colors.primary,
                                                backgroundColor: colors.light,
                                                color: colors.dark
                                            }}
                                            required
                                            value={address}
                                            onChange={(e) => setAddress(e.target.value)}
                                            placeholder="Enter your shop address"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-2" style={{ color: colors.dark }}>
                                            Zip Code *
                                        </label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none transition-all duration-200"
                                            style={{ 
                                                borderColor: colors.primary,
                                                backgroundColor: colors.light,
                                                color: colors.dark
                                            }}
                                            required
                                            value={zipCode}
                                            onChange={(e) => setZipcode(e.target.value)}
                                            placeholder="12345"
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end pt-6">
                                    <button
                                        type="submit"
                                        className="px-8 py-3 rounded-lg font-medium text-white transition-all duration-200 transform hover:scale-105 hover:shadow-lg"
                                        style={{ backgroundColor: colors.dark }}
                                        onMouseEnter={(e) => e.target.style.backgroundColor = colors.primary}
                                        onMouseLeave={(e) => e.target.style.backgroundColor = colors.dark}
                                    >
                                        Update Shop Information
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShopSettings;