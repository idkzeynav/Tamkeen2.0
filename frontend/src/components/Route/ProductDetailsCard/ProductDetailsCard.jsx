import React, { useEffect, useState } from 'react'
import {
    AiFillHeart,
    AiOutlineHeart,
    AiOutlineMessage,
    AiOutlineShoppingCart,
} from "react-icons/ai";
import { RxCross1 } from "react-icons/rx";
import { Link } from "react-router-dom";
import { backend_url } from "../../../server";
import styles from "../../../styles/styles";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify"
import { addTocart } from "../../../redux/actions/cart"
import { addToWishlist, removeFromWishlist } from
'../../../redux/actions/wishlist';


const ProductDetailsCard = ({ setOpen, data }) => {
    const { cart } = useSelector((state) => state.cart);
    const { wishlist } = useSelector((state) => state.wishlist);
    const dispatch = useDispatch();
    const [count, setCount] = useState(1)
    const [click, setClick] = useState(false)


    const handleMessageSubmit = () => {

    }

    const addToCartHandler = (id) => {
        const isItemExists = cart && cart.find((i) => i._id === id);

        if (isItemExists) {
          toast.error("Item already in cart!");
        } else {
          if (data.stock < count) {
            toast.error("Requested quantity exceeds stock available!");
          } else {
            const cartData = { ...data, qty: count };
            dispatch(addTocart(cartData));
            toast.success("Item added to cart successfully!");
          }
        }
      };

      const incrementCount = () => {
        if (count < data.stock) {
          setCount(count + 1);
        } else {
          toast.error("Cannot add more than available stock!");
        }
      };

      const decrementCount = () => {
        if (count > 1) {
          setCount(count - 1);
        }
      };



    useEffect(() => {
        if (wishlist && wishlist.find((i) => i._id === data._id)) {
            setClick(true);
        } else {
            setClick(false);
        }
    }, [wishlist,data]);

    // Remove from wish list
    const removeFromWishlistHandler = (data) => {
        setClick(!click);
        dispatch(removeFromWishlist(data));
    }

    // add to wish list
    const addToWishlistHandler = (data) => {
        setClick(!click);
        dispatch(addToWishlist(data))
    }


    return (
        <>
            <div className='bg-[#f5f0eb]'> {/* Very light beige background */}
                {
                    data ? (
                        <div className='fixed w-full h-screen top-0
left-0 bg-[#00000030] z-40 flex items-center justify-center'>
                            <div className='w-[90%] 800px:w-[60%]
h-[90vh] overflow-y-scroll 800px:h-[90vh] bg-[#f5f0eb] rounded-md
shadow-sm relative p-4'>
                                <RxCross1
                                    size={30}
                                    className="absolute right-3 top-3
z-50 text-[#5a4336]"
                                    onClick={() => setOpen(false)}
                                />

                                <div className="block w-full 800px:flex">
                                    <div className='w-full 800px:w-[50%]'>
                                        <img
                                            src={data.images &&
data.images[0].startsWith('http')
                                                ? data.images[0]
                                                :
`${backend_url}${data.images[0]}`}
                                            alt="img"
                                        />

                                        <div className='flex mt-4' >
                                            <Link
to={`/shop/preview/${data.shop._id}`} className="flex">
                                                <img

src={`${backend_url}${data?.shop?.avatar}`}
                                                    alt=""

className='w-[50px] h-[50px] rounded-full mr-2'
                                                />
                                                <div>
                                                    <h3
className={`${styles.shop_name} text-[#5a4336]`}>
                                                        {data.shop.name}
                                                    </h3>
                                                    <h5
className="pb-3 text-[15px] text-[#a67d6d]">
                                                        (4.5) Ratings
                                                    </h5>
                                                </div>
                                            </Link>
                                        </div>
                                    
                                    </div>
                                    {/* right */}
                                    <div className='w-full
800px:w-[50%] pt-5 pl-[5px] pr-[5px]'>
                                        <h1
className={`${styles.productTitle} text-[20px] text-[#5a4336]`} >
                                            {data.name}
                                        </h1>
                                        <p
className="text-[#a67d6d]">{data.description}</p>

                                        <div className='flex pt-3'>
                                            {data.discountPrice ? (
                                                <>
                                                    <h4
className="text-2xl font-semibold text-[#5a4336]">
                                                        {data.discountPrice} Rs
                                                    </h4>
                                                    {data.originalPrice && (
                                                        <h3
className="line-through text-lg text-[#a67d6d] ml-2">

{data.originalPrice} Rs
                                                        </h3>
                                                    )}
                                                </>
                                            ) : (
                                                <h4
className="text-2xl font-semibold text-[#5a4336]">
                                                    {data.originalPrice} Rs
                                                </h4>
                                            )}
                                        </div>

                                        <div className="flex
items-center mt-12 justify-between pr-3">
                                            <div>
                                                <button

className='bg-[#a67d6d] text-[#f5f0eb] font-bold rounded-l px-4 py-2
shadow-lg hover:opacity-75 transition duration-300 ease-in-out'
                                                    onClick={decrementCount}
                                                    disabled={data.stock === 0}
                                                >
                                                    -
                                                </button>
                                                <span
className='bg-[#d8c4b8] text-[#5a4336] font-medium px-4 py-[11px]' >
                                                    {count}
                                                </span>
                                                <button

className='bg-[#a67d6d] text-[#f5f0eb] font-bold rounded-r px-4 py-2
shadow-lg hover:opacity-75 transition duration-300 ease-in-out'
                                                    onClick={incrementCount}
                                                    disabled={data.stock === 0}
                                                >
                                                    +
                                                </button>
                                            </div>

                                            <div>
                                                {click ? (
                                                    <AiFillHeart
                                                        size={30}

className='cursor-pointer'
                                                        onClick={() =>
removeFromWishlistHandler(data)}
                                                        color="#a67d6d"
                                                        title="Remove
from wishlist"
                                                    />
                                                ) : (
                                                    <AiOutlineHeart
                                                        size={30}

className="cursor-pointer"
                                                        onClick={() =>
addToWishlistHandler(data)}
                                                        color="#5a4336"
                                                        title="Add to wishlist"
                                                    />
                                                )}
                                            </div>
                                        </div>

                                        <div className="mt-6">
                                            {data.stock === 0 ? (
                                                <span
className="text-[#a67d6d] font-bold">OUT OF STOCK</span>
                                            ) : (
                                                <div

className={`${styles.button} !rounded !h-11 flex items-center
bg-[#5a4336]`}
                                                    onClick={() =>
addToCartHandler(data._id)}
                                                >
                                                    <span
className="text-[#f5f0eb] flex items-center">
                                                        Add to Cart
<AiOutlineShoppingCart className="ml-1" />
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : null
                }
            </div>
        </>
    )
}

export default ProductDetailsCard

