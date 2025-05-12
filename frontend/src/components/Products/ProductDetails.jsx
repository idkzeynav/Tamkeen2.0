import React, { useEffect, useState } from "react"; 
import { Link, useNavigate } from "react-router-dom";
import styles from "../../styles/styles";
import { AiFillHeart, AiOutlineHeart, AiOutlineMessage, AiOutlineShoppingCart } from "react-icons/ai";
import { useDispatch, useSelector } from "react-redux";
import { getAllProductsShop } from "../../redux/actions/product";
import { backend_url, server } from "../../server";
import { addToWishlist, removeFromWishlist } from "../../redux/actions/wishlist";
import { addTocart } from "../../redux/actions/cart";
import { toast } from "react-toastify";
import Ratings from "./Ratings";
import axios from "axios";

const ProductDetails = ({ data }) => {
  const { products } = useSelector((state) => state.products);
  const { user, isAuthenticated } = useSelector((state) => state.user);
  const { wishlist } = useSelector((state) => state.wishlist);
  const { cart } = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  const [count, setCount] = useState(1);
  const [click, setClick] = useState(false);
  const [select, setSelect] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(getAllProductsShop(data && data?.shop._id));
    
    if (wishlist && wishlist.find((i) => i._id === data?._id)) {
      setClick(true);
    } else {
      setClick(false);
    }
  }, [data, wishlist]);

 // Remove from wish list
 const removeFromWishlistHandler = (data) => {
  setClick(!click);
  dispatch(removeFromWishlist(data));
};

// add to wish list
const addToWishlistHandler = (data) => {
  setClick(!click);
  dispatch(addToWishlist(data));
};


  // Add to cart
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

  //REVIEWS
  const totalReviewsLength =
  products &&
  products.reduce((acc, product) => acc + product.reviews.length, 0);

const totalRatings =
  products &&
  products.reduce(
    (acc, product) =>
      acc + product.reviews.reduce((sum, review) => sum + review.rating, 0),
    0
  );

const avg = totalRatings / totalReviewsLength || 0;

const averageRating = avg.toFixed(2);



  return (
    <div className="bg-[#faf5f1] py-10">
      {data && (
        <div className={`${styles.section} w-[90%] lg:w-[80%] mx-auto`}>
          <div className="flex flex-col lg:flex-row gap-10">
            {/* Left Side: Images */}
            <div className="w-full lg:w-1/2 relative">
            <div className="absolute top-2 left-2 flex items-center gap-2">
            <Link to={`/shop/preview/${data?.shop._id}`}>
              <img
                src={`${backend_url}${data.shop.avatar}`}
                alt="Seller Avatar"
                className="w-8 h-8 rounded-full object-cover"
              />
            </Link>
            <Link to={`/shop/preview/${data?.shop._id}`}>
              <h3 className="text-sm font-semibold">{data.shop.name}</h3>
            </Link>
          </div>

              <img
                src={data.images && data.images[select].startsWith('http')
                  ? data.images[select]
                  : `${backend_url}${data.images[select]}`}
                alt="Product"
                className="w-full h-[500px] object-contain rounded-lg mt-11 ml-20 "
              />
              <div className="absolute top-2 flex-col gap-3 mt-10 overflow-x-auto object-contain">
                {data.images.map((img, index) => (
                  <img
                    key={index}
                    src={img.startsWith('http') ? img : `${backend_url}${img}`}
                    alt={`Image ${index}`}
                    className={`w-[100px] h-[100px] object-cover rounded-lg cursor-pointer border ${select === index ? "border-[#a67d6d]" : "border-transparent"}`}
                    onClick={() => setSelect(index)}
                  />
                ))}
              </div>
            </div>
           
            {/* Right Side: Details */}
            <div className="w-full lg:w-1/2 space-y-6 lg:pl-4 mt-10 ml-10 font-sans">
            <div className="flex items-center gap-9 font-sans">
              <h1 className="text-4xl font-bold text-[#5a4336] font-sans ">{data.name}</h1>
              {click ? (
                <AiFillHeart
                  size={30}
                  className="cursor-pointer"
                  onClick={() => removeFromWishlistHandler(data)}
                  color="#a67d6d"
                  title="Remove from wishlist"
                />
              ) : (
                <AiOutlineHeart
                  size={30}
                  className="cursor-pointer"
                  onClick={() => addToWishlistHandler(data)}
                  title="Add to wishlist"
               color="#5a4336"
                />
              )}
            </div>
              <p className="text-[#5a4336] mb-4 font-sans">{data.description}</p>

              <div className="flex items-center gap-3">
                {/* Display discounted price or original price based on availability */}
                {data.discountPrice ? ( // Check if discount price is available
                  <>
                    <h4 className="text-3xl font-semibold text-[#a67d6d]">
                      {data.discountPrice} Rs
                    </h4>
                    {data.originalPrice && ( // Check if original price exists
                      <h3 className="line-through text-lg text-[#d8c4b8]">
                        {data.originalPrice} Rs
                      </h3>
                    )}
                  </>
                ) : (
                  <h4 className="text-3xl font-semibold text-[#a67d6d]">
                    {data.originalPrice} Rs
                  </h4>
                )}
              </div>

              {/* Quantity Selector */}
              <div className="flex items-center gap-4">
                <button
                  className="bg-[#a67d6d] text-white text-xl font-semibold px-4 py-2 rounded-l"
                  onClick={decrementCount}
                  disabled={data.stock === 0}
                >
                  -
                </button>
                <span className="bg-gray-100 px-6 py-2 text-lg">{count}</span>
                <button
                  className="bg-[#a67d6d] text-white text-xl font-semibold px-4 py-2 rounded-r"
                  onClick={incrementCount}
                  disabled={data.stock === 0}
                >
                  +
                </button>
              </div>

              {/* Add to Cart */}
              <div>
                {data.stock === 0 ? (
                  <span className="text-red-500 font-bold">OUT OF STOCK</span>
                ) : (
                  <button
                       
                    className={`px-[30px] h-[40px] rounded-[10px] bg-[#5a4336] flex items-center justify-center cursor-pointer`}
                    onClick={() => addToCartHandler(data._id)}
                    
                  >
                    <span className="text-white flex items-center">
                      Add to Cart <AiOutlineShoppingCart className="ml-1" />
                    </span>
                  </button>
                )}
              </div>
            </div>
          </div>

            {/* Product Details info */}
            <ProductDetailsInfo
            data={data}
            products={products}
            totalReviewsLength={totalReviewsLength}
            averageRating={averageRating}
          />
        </div>
      )}
    </div>
  );
};

const ProductDetailsInfo = ({
  data,
  products,
  totalReviewsLength,
  averageRating,
}) => {
  const [active, setActive] = useState(1);
  const { user, isAuthenticated } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const handleMessageSubmit = async () => {
    if (isAuthenticated) {
      try {
        const userId = user._id;
        const sellerId = data.shop._id;
  
        // First check for existing conversations
        const response = await axios.get(
          `${server}/conversation/get-all-conversation-user/${userId}`,
          {
            withCredentials: true,
          }
        );
  
        // Find if there's an existing conversation with this seller
        const existingConversation = response.data.conversations.find(conv => 
          conv.members.includes(sellerId)
        );
  
        let conversationId;
  
        if (existingConversation) {
          // Use existing conversation
          conversationId = existingConversation._id;
        } else {
          // Create new conversation if none exists
          const groupTitle = data._id + user._id;
          const newConversation = await axios.post(
            `${server}/conversation/create-new-conversation`,
            {
              groupTitle,
              userId,
              sellerId,
            }
          );
          conversationId = newConversation.data.conversation._id;
        }
  
        // Navigate to the inbox with the conversation ID
        navigate(`/inbox?${conversationId}`);
      } catch (error) {
        console.log(error);
        toast.error("Error creating conversation");
      }
    } else {
      toast.error("Please login to create a conversation");
    }
  };

  return (
    <div className="bg-[#faf5f1] px-3 800px:px-10 py-2 rounded">
      <div className="w-full flex justify-between border-b pt-10 pb-2 border-gray-300">
        <div className="relative">
          <h5
            className={`text-[#5a4336] font-semibold cursor-pointer ${
              active === 1 ? "text-lg" : "text-base"
            }`}
            onClick={() => setActive(1)}
          >
            Product Details
          </h5>
          {active === 1 ? <div className={`${styles.active_indicator}`} /> : null}
        </div>

        <div className="relative">
          <h5
            className={`text-[#5a4336] font-semibold cursor-pointer ${
              active === 2 ? "text-lg" : "text-base"
            }`}
            onClick={() => setActive(2)}
          >
            Product Reviews
          </h5>
          {active === 2 ? <div className={`${styles.active_indicator}`} /> : null}
        </div>

        <div className="relative">
          <h5
            className={`text-[#5a4336] font-semibold cursor-pointer ${
              active === 3 ? "text-lg" : "text-base"
            }`}
            onClick={() => setActive(3)}
          >
            Seller Information
          </h5>
          {active === 3 ? <div className={`${styles.active_indicator}`} /> : null}
        </div>
      </div>

      {active === 1 ? (
        <>
          <p className="py-4 text-base leading-7 pb-10 text-[#5a4336]">
            {data.description}
          </p>
        </>
      ) : null}

{active === 2 ? (
  <div className="w-full min-h-[40vh] flex flex-col items-center py-3 overflow-y-scroll">
    {data && data.reviews.length > 0 ? (
      data.reviews.map((item, index) => (
        <div className="w-full flex my-4 border-b pb-4" key={index}>
          <img
            src={`${backend_url}/${item.user.avatar}`}
            alt="avatar"
            className="w-[50px] h-[50px] rounded-full"
          />
          <div className="pl-2 w-full">
            <div className="w-full flex items-center">
              <h1 className="font-semibold pr-2">{item.user.name}</h1>
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <i 
                    key={i} 
                    className={`fa fa-star ${i < item.rating ? "text-[#f6ba00]" : "text-gray-300"}`}
                    style={{ fontSize: "15px" }}
                  ></i>
                ))}
                <span className="ml-1 text-sm text-gray-500">({item.rating}/5)</span>
              </div>
            </div>
            <p className="text-[#5a4336] mt-1">{item.comment}</p>
            <p className="text-xs text-gray-500 mt-1">
              {new Date(item.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}
            </p>
          </div>
        </div>
      ))
    ) : (
      <p className="text-center text-gray-500 my-8">No reviews yet for this product.</p>
    )}

    <div className="w-full flex justify-center mt-4">
      {products && products.length > 0 && (
        <div className="w-full">
          <h5 className="text-[#5a4336] font-semibold">
            Average Rating: {averageRating} / 5.00
          </h5>
          <h5 className="text-[#5a4336] mb-4">
            Total Reviews: {totalReviewsLength}
          </h5>
        </div>
      )}
    </div>
  </div>
) : null}
      {active === 3 && (
        <div className="w-full block 800px:flex p-5">
          <div className="w-full 800px:w-[50%]">
            <div className="flex items-center">
            <Link to={`/shop/preview/${data.shop._id}`}>
            <div className="flex items-center">
              <img
                src={`${backend_url}${data?.shop.avatar}`}
                className="w-[50px] h-[50px] rounded-full mr-2"
                alt="Seller Avatar"
              />
              <div>
                <h3 className={`${styles.shop_name}`}>{data.shop.name}</h3>
                <h5 className="pb-3 text-[15px]">({averageRating}/5) Ratings</h5>
              </div>
              </div>
              </Link>
             
            </div>
           
            <p className="pt-2 text-[#5a4336]">{data.shop.description}</p>
            <div className="mt-3">
              <h4 className="text-[#5a4336] font-semibold">
                Location: <span className="font-light">{data.shop.address}</span>
              </h4>
              <div className="w-full 800px:w-[50%] mt-7 800px:mt-3 flex flex-col justify-end">
            <div
              className={`x-[10px] h-[40px] w-[200px] rounded-[10px] bg-[#5a4336] flex items-center justify-center cursor-pointer`}
              onClick={handleMessageSubmit}
            >
              <span className="text-white flex items-center">
                Send Message <AiOutlineMessage className="ml-1" />
              </span>
            </div>
          
          </div>
            </div>
          </div>
          
        </div>
      )}
    </div>
  );
};

export default ProductDetails;
