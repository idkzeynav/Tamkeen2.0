import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";

import styles from "../../styles/styles";
import ProductCard from "../Route/ProductCard/ProductCard";
import { backend_url } from "../../server";
import Ratings from "../Products/Ratings";

const ShopProfileData = ({ isOwner }) => {
    const { products } = useSelector((state) => state.products);
    const { seller } = useSelector((state) => state.seller);
    const { id } = useParams();

    const dispatch = useDispatch();

    const [active, setActive] = useState(1);

    const allReviews = products && products.map((product) => product.reviews).flat();

    return (
        <div className="w-full p-6 bg-[#e6d8d8] rounded-lg shadow-lg">
            {/* Header Section */}
            <div className="flex w-full items-center justify-between mb-6 border-b border-[#a66d] pb-3">
                <div className="flex">
                    <div className="flex items-center" onClick={() => setActive(1)}>
                        <h5
                            className={`font-semibold text-lg ${active === 1 ? "text-[#5a4336]" : "text-[#a66d]"} cursor-pointer pr-6 transition duration-300 ease-in-out hover:text-[#a66d]`}
                        >
                            Shop Products
                        </h5>
                    </div>

                    <div className="flex items-center" onClick={() => setActive(3)}>
                        <h5
                            className={`font-semibold text-lg ${active === 3 ? "text-[#5a4336]" : "text-[#a66d]"} cursor-pointer pr-6 transition duration-300 ease-in-out hover:text-[#a66d]`}
                        >
                            Shop Reviews
                        </h5>
                    </div>
                </div>
                {isOwner && (
                    <Link to="/dashboard">
                                        <button className="w-full py-2 px-4 bg-[#a66d] text-white rounded-lg hover:bg-[#5a4336] transition duration-200">
                                        <span className="text-white">Go Dashboard</span>
                        </button>
                    </Link>
                )}
            </div>

            {/* Products Section */}
            {active === 1 && (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mb-12">
                    {products && products.map((i, index) => (
                        <div className="hover:scale-105 transition duration-300" key={index}>
                            <ProductCard data={i} isShop={true} />
                        </div>
                    ))}
                </div>
            )}

            {/* Reviews Section */}
            {active === 3 && (
                <div className="w-full">
                    {allReviews && allReviews.length > 0 ? (
                        allReviews.map((item, index) => (
                            <div className="flex items-start my-4 p-4 bg-white rounded-lg shadow-md hover:shadow-xl transition duration-300" key={index}>
                                <img
                                    src={`${item.user.avatar}`}
                                    className="w-12 h-12 rounded-full"
                                    alt="User Avatar"
                                />
                                <div className="pl-3 flex-1">
                                    <div className="flex w-full items-center">
                                        <h1 className="font-semibold pr-2">{item.user.name}</h1>
                                        <Ratings rating={item.rating} />
                                    </div>
                                    <p className="font-normal text-gray-700 mt-1">{item?.comment}</p>
                                    <p className="text-gray-500 text-sm mt-1">{item.createdAt.substring(0, 10)}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <h5 className="w-full text-center py-5 text-lg text-gray-500">No Reviews for this shop!</h5>
                    )}
                </div>
            )}
        </div>
    );
};

export default ShopProfileData;