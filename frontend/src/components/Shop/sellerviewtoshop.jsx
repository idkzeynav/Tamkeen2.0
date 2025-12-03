import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";
import { backend_url } from "../../server";
import Ratings from "../Products/Ratings";

const SellerProfileData = ({ isOwner }) => {
    const { products } = useSelector((state) => state.products);
    const { seller } = useSelector((state) => state.seller);
    const { id } = useParams();
    const dispatch = useDispatch();
    const [active, setActive] = useState(1);

    const allReviews = products && products.map((product) => product.reviews).flat();

    const getImageUrl = (imagePath) => {
        if (!imagePath) return '';
        if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
            return imagePath;
        }
        return `${backend_url}${imagePath}`;
    };

    return (
        <div className="bg-[#e6d8d8] rounded-lg shadow-lg p-4 h-fit">
            {/* Navigation Header */}
            <div className="flex items-center justify-between mb-6 pb-3 border-b-2 border-[#a66d]/30">
                <div className="flex space-x-6">
                    <button
                        onClick={() => setActive(1)}
                        className={`font-medium text-base transition-all duration-300 pb-1 border-b-2 ${
                            active === 1 
                                ? "text-[#5a4336] border-[#5a4336]" 
                                : "text-[#a66d] border-transparent hover:text-[#5a4336]"
                        }`}
                    >
                        Shop Products
                    </button>
                    <button
                        onClick={() => setActive(3)}
                        className={`font-medium text-base transition-all duration-300 pb-1 border-b-2 ${
                            active === 3 
                                ? "text-[#5a4336] border-[#5a4336]" 
                                : "text-[#a66d] border-transparent hover:text-[#5a4336]"
                        }`}
                    >
                        Shop Reviews
                    </button>
                </div>
                
                {isOwner && (
                    <Link to="/dashboard">
                        <button className="py-1.5 px-4 bg-[#a66d] text-white rounded-md hover:bg-[#5a4336] transition duration-200 font-medium text-sm shadow-md hover:shadow-lg">
                            Go to Dashboard
                        </button>
                    </Link>
                )}
            </div>

            {/* Products Section */}
            {active === 1 && (
                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-[#5a4336] mb-4">Our Products</h2>
                    
                    {products && products.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                            {products.map((product, index) => (
                                <div key={index} className="bg-white rounded-md shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group">
                                    <div className="relative overflow-hidden aspect-square">
                                        <img
                                            src={getImageUrl(product.images?.[0])}
                                            alt={product.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                        {product.discountPrice && (
                                            <div className="absolute top-1 right-1 bg-red-500 text-white px-1.5 py-0.5 rounded text-[10px] font-medium">
                                                Sale
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-2">
                                        <h3 className="font-medium text-[#5a4336] mb-1 line-clamp-2 text-sm">
                                            {product.name}
                                        </h3>

                                        <div className="mb-1">
                                            <Ratings rating={product?.ratings} iconSize={14} />
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-1">
                                                {product.discountPrice ? (
                                                    <>
                                                        <span className="text-sm font-bold text-[#a66d]">
                                                            Rs.{product.discountPrice}
                                                        </span>
                                                        <span className="text-[10px] text-gray-400 line-through">
                                                            Rs.{product.originalPrice}
                                                        </span>
                                                    </>
                                                ) : (
                                                    <span className="text-sm font-bold text-[#a66d]">
                                                        Rs.{product.originalPrice}
                                                    </span>
                                                )}
                                            </div>

                                            <span className="text-[10px] text-[#a66d] font-medium">
                                                {product?.sold_out || 0} sold
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-sm text-[#a66d]">No products available yet.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Reviews Section */}
            {active === 3 && (
                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-[#5a4336] mb-4">Customer Reviews</h2>
                    
                    {allReviews && allReviews.length > 0 ? (
                        <div className="space-y-3">
                            {allReviews.map((item, index) => (
                                <div key={index} className="bg-white rounded-md p-3 shadow-sm hover:shadow-md transition-all duration-300">
                                    <div className="flex items-start space-x-3">
                                        <img
                                            src={getImageUrl(item.user.avatar)}
                                            className="w-8 h-8 rounded-full object-cover border border-[#a66d]/20"
                                            alt="User Avatar"
                                        />
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-1">
                                                <h3 className="font-medium text-[#5a4336] text-sm">{item.user.name}</h3>
                                                <span className="text-xs text-[#a66d]">
                                                    {item.createdAt?.substring(0, 10)}
                                                </span>
                                            </div>
                                            
                                            <div className="mb-1">
                                                <Ratings rating={item.rating} iconSize={14} />
                                            </div>
                                            
                                            <p className="text-gray-700 text-sm leading-tight">{item?.comment}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-sm text-[#a66d]">No reviews for this shop yet.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SellerProfileData;