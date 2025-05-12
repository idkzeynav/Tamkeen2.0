import React, { useEffect, useState } from 'react';
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux';
import { addToWishlist, removeFromWishlist } from '../../../redux/actions/wishlist';
import { addTocart } from '../../../redux/actions/cart';
import { toast } from 'react-toastify';
import { Heart, Eye, ShoppingCart } from 'lucide-react';
import Ratings from "../../Products/Ratings";
import ProductDetailsCard from "../ProductDetailsCard/ProductDetailsCard";
import { backend_url } from "../../../server";

const ProductCard = ({ data, isEvent }) => {
  const { wishlist } = useSelector((state) => state.wishlist);
  const { cart } = useSelector((state) => state.cart);
  const [click, setClick] = useState(false);
  const [open, setOpen] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    setClick(wishlist?.some((i) => i._id === data._id));
  }, [wishlist, data]);

  const toggleWishlist = () => {
    setClick(!click);
    dispatch(click ? removeFromWishlist(data) : addToWishlist(data));
  };

  const addToCartHandler = () => {
    if (cart?.some((i) => i._id === data._id)) {
      toast.error("Item already in cart!");
      return;
    }
    
    if (data.stock < 1) {
      toast.error("Product stock limited!");
      return;
    }
    
    dispatch(addTocart({ ...data, qty: 1 }));
    toast.success("Item added to cart successfully!");
  };

  return (
    <div className="group relative bg-white rounded-2xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl">
      <Link to={`${isEvent ? `/product/${data._id}?isEvent=true` : `/product/${data._id}`}`}>
        <div className="aspect-square overflow-hidden">
          <img
            src={`${backend_url}${data.images?.[0]}`}
            alt={data.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
        </div>
      </Link>

      <div className="absolute top-4 right-4 flex flex-col gap-3">
        <button
          onClick={toggleWishlist}
          className="p-2 rounded-full bg-white/80 backdrop-blur-sm shadow-md transition-colors hover:bg-[#c8a4a5]/20"
        >
          <Heart
            size={20}
            className={click ? "fill-[#a67d6d] text-[#a67d6d]" : "text-[#5a4336]"}
          />
        </button>
        <button
          onClick={() => setOpen(true)}
          className="p-2 rounded-full bg-white/80 backdrop-blur-sm shadow-md transition-colors hover:bg-[#c8a4a5]/20"
        >
          <Eye size={20} className="text-[#5a4336]" />
        </button>
        <button
          onClick={addToCartHandler}
          className="p-2 rounded-full bg-white/80 backdrop-blur-sm shadow-md transition-colors hover:bg-[#c8a4a5]/20"
        >
          <ShoppingCart size={20} className="text-[#5a4336]" />
        </button>
      </div>

      <div className="p-4">
  <Link to={`/product/${data._id}`}>
    {/* Product Name */}
    <h3 className="font-medium text-[#5a4336] mb-2 line-clamp-2">
      {data.name}
    </h3>

    {/* Ratings */}
    <div className="mb-2">
      <Ratings rating={data?.ratings} />
    </div>

    {/* Price and Sold Out */}
    <div className="flex items-center justify-between">
      {/* Price Section */}
      <div className="flex gap-2 items-center">
        {/* Display Price */}
        {data.discountPrice ? (
          <>
            <span className="text-lg font-bold text-[#a67d6d]">
              {`${data.discountPrice} Rs`}
            </span>
            <span className="text-sm text-gray-500 line-through">
              {`${data.originalPrice} Rs`}
            </span>
          </>
        ) : (
          <span className="text-lg font-bold text-[#a67d6d]">
            {`${data.originalPrice} Rs`}
          </span>
        )}
      </div>

      {/* Sold Out Section */}
      <span className="text-xs text-[#c8a4a5]">{data?.sold_out} sold</span>
    </div>
  </Link>
</div>


      {open && <ProductDetailsCard setOpen={setOpen} data={data} />}
    </div>
  );
};

export default ProductCard;