import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useParams, useNavigate } from "react-router-dom";
import { getAllProductsShop } from "../../redux/actions/product";
import { backend_url, server } from "../../server";
import axios from "axios";
import { Star } from "lucide-react";
import Loader from "../Layout/Loader";

const ShopInfo = ({ isOwner }) => {
    const [data, setData] = useState({});
    const { products } = useSelector((state) => state.products);
    const [isLoading, setIsLoading] = useState(false);
    const { id } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        let isMounted = true;

        const fetchShopInfo = async () => {
            setIsLoading(true);
            try {
                const res = await axios.get(`${server}/shop/get-shop-info/${id}`, {
                    withCredentials: true,
                });
                if (isMounted) {
                    setData(res.data.shop || {});
                    setIsLoading(false);
                }
            } catch (error) {
                console.error("Error fetching shop info:", error);
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        dispatch(getAllProductsShop(id));
        fetchShopInfo();

        return () => {
            isMounted = false;
        };
    }, [dispatch, id]);

    const logoutHandler = async () => {
        await axios.get(`${server}/shop/logout`, {
            withCredentials: true,
        });
        navigate("/");
        window.location.reload(true);
    };

    const totalReviewsLength =
        products?.reduce((acc, product) => acc + (product.reviews?.length || 0), 0) || 0;

    const totalRatings =
        products?.reduce(
            (acc, product) => acc + (product.reviews?.reduce((sum, review) => sum + review.rating, 0) || 0),
            0
        ) || 0;

    const averageRating = totalReviewsLength ? (totalRatings / totalReviewsLength).toFixed(1) : 0;

    return (
        <>
            {isLoading ? (
                <Loader />
            ) : (
                <div className="bg-[#e6d8d8] rounded-lg shadow-lg border border-gray-100 p-6">
                    {/* Header with Avatar */}
                    <div className="text-center mb-6">
                        <div className="relative inline-block">
                            <img
                                src={data.avatar ? `${backend_url}${data.avatar.startsWith('/') ? data.avatar.slice(1) : data.avatar}` : "/default-avatar.png"}
                                alt="Shop Avatar"
                                className="w-20 h-20 object-cover rounded-full border-4 border-white shadow-md mx-auto"
                            />
                        </div>
                        <h3 className="text-xl font-bold text-[#5a4336] mt-3">{data.name || "Shop Name"}</h3>
                        <p className="mt-2 text-sm text-[#a66d] max-w-full">
                            {data.description || "No description available"}
                        </p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-white/50 p-4 rounded-lg text-center border border-[#a66d]/20">
                            <span className="text-sm text-[#a66d] font-medium">Products</span>
                            <p className="mt-1 text-lg font-bold text-[#5a4336]">{products?.length || 0}</p>
                        </div>
                        <div className="bg-white/50 p-4 rounded-lg text-center border border-[#a66d]/20">
                            <span className="text-sm text-[#a66d] font-medium">Rating</span>
                            <div className="mt-1 flex items-center justify-center">
                                <span className="text-lg font-bold text-[#5a4336]">{averageRating}</span>
                                <Star className="w-4 h-4 text-yellow-500 ml-1 fill-current" />
                            </div>
                        </div>
                    </div>

                    {/* Shop Details */}
                    <div className="space-y-4 mb-6">
                        <div className="bg-white/30 p-3 rounded-lg">
                            <div className="flex items-start">
                                <span className="text-sm text-[#a66d] font-medium w-20">Address:</span>
                                <span className="text-sm text-[#5a4336] flex-1">{data.address || "No address available"}</span>
                            </div>
                        </div>
                        <div className="bg-white/30 p-3 rounded-lg">
                            <div className="flex items-center">
                                <span className="text-sm text-[#a66d] font-medium w-20">Phone:</span>
                                <span className="text-sm text-[#5a4336]">{data.phoneNumber || "No phone number available"}</span>
                            </div>
                        </div>
                        <div className="bg-white/30 p-3 rounded-lg">
                            <div className="flex items-center">
                                <span className="text-sm text-[#a66d] font-medium w-20">Joined:</span>
                                <span className="text-sm text-[#5a4336]">
                                    {data?.createdAt ? data.createdAt.slice(0, 10) : "Date not available"}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    {isOwner && (
                        <div className="space-y-3">
                            <Link to="/settings" className="block">
                                <button className="w-full py-3 px-4 bg-[#a66d] text-white rounded-lg hover:bg-[#5a4336] transition duration-200 font-medium">
                                    Edit Shop
                                </button>
                            </Link>
                            <button 
                                onClick={logoutHandler}
                                className="w-full py-3 px-4 bg-white/70 text-[#5a4336] rounded-lg hover:bg-white transition duration-200 font-medium border border-[#a66d]/30"
                            >
                                Log Out
                            </button>
                        </div>
                    )}
                </div>
            )}
        </>
    );
};

export default ShopInfo;