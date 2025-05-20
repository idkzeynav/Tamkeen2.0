import React, { useState } from "react";
import { RxCross1 } from "react-icons/rx";
import styles from "../../styles/styles";
import { Link } from "react-router-dom";
import { BsCartPlus } from "react-icons/bs";
import { AiOutlineHeart } from "react-icons/ai";
import { useDispatch, useSelector } from "react-redux";
import { removeFromWishlist } from "../../redux/actions/wishlist";
import { addTocart } from "../../redux/actions/cart";
import { backend_url } from "../../server";

const Wishlist = ({ setOpenWishlist }) => {
  const { wishlist } = useSelector((state) => state.wishlist);
  const dispatch = useDispatch();

  const removeFromWishlistHandler = (data) => {
    dispatch(removeFromWishlist(data));
  };

  const addToCartHandler = (data) => {
    const newData = { ...data, qty: 1 };
    dispatch(addTocart(newData));
    setOpenWishlist(false);
  };

  return (
    <div className="fixed top-0 left-0 w-full bg-[#0000004b] h-screen z-50">
      <div className="fixed top-0 right-0 h-full w-[80%]
overflow-y-scroll 800px:w-[25%] bg-white flex flex-col justify-between
shadow-sm">
        {wishlist && wishlist.length === 0 ? (
          <div className="w-full h-screen flex items-center justify-center">
            <div className="flex w-full justify-end pt-5 pr-5 fixed
top-3 right-3">
              <RxCross1
                size={20}
                className="cursor-pointer text-[#a67d6d]"
                onClick={() => setOpenWishlist(false)}
              />
            </div>
            <h5 className="text-[#5a4336]">Wish items empty!</h5>
          </div>
        ) : (
          <>
            <div>
              <div className="flex w-full justify-end pt-5 pr-5 ">
                <RxCross1
                  size={20}
                  className="cursor-pointer text-[#a67d6d]"
                  onClick={() => setOpenWishlist(false)}
                />
              </div>
              {/* item length */}
              <div className={`${styles.noramlFlex} p-4 text-[#5a4336]`}>
                <AiOutlineHeart size={25} color="#5a4336" />
                <h5 className="pl-2 text-[20px] font-[500]">
                  {wishlist && wishlist.length} items
                </h5>
              </div>

              {/* Cart Single item */}
              <br />
              <div className="w-full border-t border-[#c8a4a5]">
                {wishlist &&
                  wishlist.map((i, index) => {
                    return (
                      <CartSingle
                        data={i}
                        key={index}
                        removeFromWishlistHandler={removeFromWishlistHandler}
                        addToCartHandler={addToCartHandler}
                      />
                    );
                  })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const CartSingle = ({ data, removeFromWishlistHandler, addToCartHandler }) => {
  const [value, setValue] = useState(1);
  
  // Get the effective price (discountPrice if available, otherwise originalPrice)
  const effectivePrice = data.discountPrice || data.originalPrice;
  const totalPrice = effectivePrice * value;

  return (
    <>
      <div className="border-b p-4 border-[#c8a4a5]">
        <div className="w-full 800px:flex items-center">
          <RxCross1
            size={20}
            className="cursor-pointer 800px:mb-['unset']
800px:ml-['unset'] mb-2 ml-2 text-[#a67d6d]"
            onClick={() => removeFromWishlistHandler(data)}
          />
          <img
            src={data?.images && data.images.length > 0 ?
`${backend_url}${data.images[0]}` : '/path-to-default-image.jpg'}
            alt=""
            className="w-[130px] h-min ml-2 mr-2 rounded-[5px]"
          />

          <div className="pl-[15px] text-[#5a4336]">
            <h1>{data.name}</h1>

            <div className="pt-3 800px:pt-[3px]">
              {data.discountPrice ? (
                <div className="flex items-center gap-2">
                  <h4 className="font-[600] text-[17px] text-[#a67d6d] font-Roboto">
                    Rs{totalPrice}
                  </h4>
                  <h4 className="text-[15px] line-through text-[#a67d6d]/70">
                    Rs{data.originalPrice * value}
                  </h4>
                </div>
              ) : (
                <h4 className="font-[600] text-[17px] text-[#a67d6d] font-Roboto">
                  Rs{totalPrice}
                </h4>
              )}
            </div>
          </div>

          <div className="ml-auto">
            <BsCartPlus
              size={20}
              className="cursor-pointer text-[#a67d6d]"
              title="Add to cart"
              onClick={() => addToCartHandler(data)}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default Wishlist;