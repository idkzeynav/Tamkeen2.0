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
                <div className="h-screen max-h-screen overflow-hidden bg-[#e6d8d8] rounded-lg shadow-xl border border-gray-100">
                    <div className="relative h-32 bg-gradient-to-r from-[#a66d] to-[#e6d8d8]">
                        <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
                            <img
                                src={data.avatar ? `${backend_url}${data.avatar.startsWith('/') ? data.avatar.slice(1) : data.avatar}` : "/default-avatar.png"}
                                alt="Shop Avatar"
                                className="w-24 h-24 object-cover rounded-full border-4 border-white shadow-md"
                            />
                        </div>
                    </div>
                    
                    <div className="pt-14 px-6">
                        <div className="text-center">
                            <h3 className="text-xl font-bold text-gray-900">{data.name || "Shop Name"}</h3>
                            <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                                {data.description || "No description available"}
                            </p>
                        </div>

                        <div className="mt-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gray-50 p-4 rounded-lg text-center">
                                    <span className="text-sm text-gray-500">Products</span>
                                    <p className="mt-1 font-semibold text-gray-900">{products?.length || 0}</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg text-center">
                                    <span className="text-sm text-gray-500">Rating</span>
                                    <div className="mt-1 flex items-center justify-center">
                                        <span className="font-semibold text-gray-900">{averageRating}</span>
                                        <Star className="w-4 h-4 text-yellow-400 ml-1" />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center text-sm">
                                    <span className="text-gray-500 w-24">Address:</span>
                                    <span className="text-gray-900">{data.address || "No address available"}</span>
                                </div>
                                <div className="flex items-center text-sm">
                                    <span className="text-gray-500 w-24">Phone:</span>
                                    <span className="text-gray-900">{data.phoneNumber || "No phone number available"}</span>
                                </div>
                                <div className="flex items-center text-sm">
                                    <span className="text-gray-500 w-24">Joined:</span>
                                    <span className="text-gray-900">
                                        {data?.createdAt ? data.createdAt.slice(0, 10) : "Date not available"}
                                    </span>
                                </div>
                            </div>

                            {isOwner && (
                                <div className="pt-4 space-y-2">
                                    <Link to="/settings" className="block">
                                        <button className="w-full py-2 px-4 bg-[#a66d] text-white rounded-lg hover:bg-[#5a4336] transition duration-200">
                                            Edit Shop
                                        </button>
                                    </Link>
                                    <button 
                                        onClick={logoutHandler}
                                        className="w-full py-2 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition duration-200"
                                    >
                                        Log Out
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ShopInfo;