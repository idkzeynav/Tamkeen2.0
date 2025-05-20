import React, { useState } from "react";
import { RxCross1 } from "react-icons/rx";
import styles from "../../styles/styles";
import { Link } from "react-router-dom";
import { IoBagHandleOutline } from "react-icons/io5";
import { HiOutlineMinus, HiPlus } from "react-icons/hi";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { backend_url } from "../../server";
import { addTocart, removeFromCart } from "../../redux/actions/cart";

const Cart = ({ setOpenCart }) => {
  const { cart } = useSelector((state) => state.cart);
  const dispatch = useDispatch();

  //remove from cart
  const removeFromCartHandler = (data) => {
    dispatch(removeFromCart(data));
  };

  // Total price
  const totalPrice = cart.reduce((acc, item) => {
    const itemPrice = item.discountPrice ? item.discountPrice :
item.originalPrice;
    return acc + item.qty * itemPrice;
  }, 0);

  const quantityChangeHandler = (data) => {
    dispatch(addTocart(data));
  };

  return (
    <div className="fixed top-0 left-0 w-full bg-[#0000004b] h-screen z-50">
      <div className="fixed top-0 right-0 h-full w-[80%] 800px:w-[25%]
bg-white flex flex-col overflow-y-scroll justify-between shadow-sm">
        {cart && cart.length === 0 ? (
          <div className="w-full h-screen flex items-center justify-center">
            <div className="flex w-full justify-end pt-5 pr-5 fixed
top-3 right-3">
              <RxCross1
                size={20}
                className="cursor-pointer text-[#a67d6d]"
                onClick={() => setOpenCart(false)}
              />
            </div>
            <h5 className="text-[#5a4336]">Cart is empty!</h5>
          </div>
        ) : (
          <>
            <div>
              <div className="flex w-full justify-end pt-5 pr-5 ">
                <RxCross1
                  size={20}
                  className="cursor-pointer text-[#a67d6d]"
                  onClick={() => setOpenCart(false)}
                />
              </div>
              {/* item length */}
              <div className={`${styles.noramlFlex} p-4 text-[#5a4336]`}>
                <IoBagHandleOutline size={25} color="#5a4336" />
                <h5 className="pl-2 text-[20px] font-[500]">
                  {cart && cart.length} items
                </h5>
              </div>

              {/* Cart Single item */}
              <br />
              <div className="w-full border-t border-[#c8a4a5]">
                {cart &&
                  cart.map((i, index) => {
                    return (
                      <CartSingle
                        data={i}
                        key={index}
                        quantityChangeHandler={quantityChangeHandler}
                        removeFromCartHandler={removeFromCartHandler}
                      />
                    );
                  })}
              </div>
            </div>

            <div className="px-5 mb-3">
              {/* Check out btn */}
              <Link to="/checkout">
                <div
                  className={`h-[45px] flex items-center
justify-center w-[100%] bg-[#a67d6d] rounded-[5px] text-[#d8c4b8]`}
                >
                  <h1 className="text-[18px] font-[600]">
                    Checkout Now (Rs{totalPrice})
                  </h1>
                </div>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const CartSingle = ({ data, quantityChangeHandler, removeFromCartHandler }) => {
  const [value, setValue] = useState(data.qty);
  const itemPrice = data.discountPrice ? data.discountPrice :
data.originalPrice;
  const totalPrice = itemPrice * value;

  const increment = (data) => {
    if (value < data.stock) {
      setValue(value + 1);
      const updateCartData = { ...data, qty: value + 1 };
      quantityChangeHandler(updateCartData);
    } else {
      toast.error("Product stock limited!");
    }
  };

  // Decrement
  const decrement = (data) => {
    if (value > 1) {
      setValue(value - 1);
      const updateCartData = { ...data, qty: value - 1 };
      quantityChangeHandler(updateCartData);
    }
  };

  return (
    <>
      <div className="border-b p-4 border-[#c8a4a5]">
        <div className="w-full flex items-center">
          <div>
            <div
              className={`bg-[#a67d6d] border border-[#a67d6d73]
rounded-full w-[25px] h-[25px] ${styles.noramlFlex} justify-center
cursor-pointer`}
              onClick={() => increment(data)}
            >
              <HiPlus size={18} color="#d8c4b8" />
            </div>
            <span className="pl-[10px] text-[#5a4336]">{data.qty}</span>
            <div
              className="bg-[#c8a4a54f] rounded-full w-[25px] h-[25px]
flex items-center justify-center cursor-pointer"
              onClick={() => decrement(data)}
            >
              <HiOutlineMinus size={16} color="#5a4336" />
            </div>
          </div>
          <img
            src={`${backend_url}${data?.images[0]}`}
            className="w-[130px] h-min ml-2 mr-2 rounded-[5px]"
            alt="side card"
          />

          <div className="pl-[15px] text-[#5a4336]">
            <h1>{data.name}</h1>
            <h4 className="font-[400] text-[15px] text-[#00000082]">
              Rs{itemPrice} * {value}
            </h4>
            <h4 className="font-[400] text-[17px] pt-[3px]
text-[#a67d6d] font-Roboto">
              Rs{totalPrice}
            </h4>
          </div>
          <RxCross1
            size={20}
            color="#a67d6d"
            className="cursor-pointer"
            onClick={() => removeFromCartHandler(data)}
          />
        </div>
      </div>
    </>
  );
};

export default Cart;