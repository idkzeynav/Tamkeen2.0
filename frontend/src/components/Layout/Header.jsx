import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom"; // Import useNavigate
import styles from "../../styles/styles";
import {categoriesData } from "../../static/data";
import {
  AiOutlineHeart,
  AiOutlineSearch,
  AiOutlineShoppingCart,
  AiOutlineCheckCircle,
} from "react-icons/ai";
import { IoIosArrowDown, IoIosArrowForward } from "react-icons/io";
import { BiMenuAltLeft } from "react-icons/bi";
import { CgProfile } from "react-icons/cg";
import { FiLogOut, FiUser, FiLock } from "react-icons/fi"; // Added icons for dropdown
import DropDown from "./DropDown";
import Navbar from "./Navbar";
import { useSelector, useDispatch } from "react-redux"; // Added useDispatch
import { backend_url, server } from "../../server";
import Cart from "../cart/Cart";
import Wishlist from "../Wishlist/Wishlist";
import { RxCross1 } from "react-icons/rx";
import axios from "axios"; // Added axios for the logout API call
import { toast } from "react-toastify"; // Added toast for success notification

const Header = ({ activeHeading }) => {
  const navigate = useNavigate(); // Initialize useNavigate
  const dispatch = useDispatch(); // Initialize useDispatch
  const { isSeller } = useSelector((state) => state.seller);
  const { cart } = useSelector((state) => state.cart);
  const { wishlist } = useSelector((state) => state.wishlist);
  const { isAuthenticated, user } = useSelector((state) => state.user);
  const { allProducts } = useSelector((state) => state.products);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchData, setSearchData] = useState(null);
  const [active, setActive] = useState(false);
  const [dropDown, setDropDown] = useState(false);
  const [openCart, setOpenCart] = useState(false);
  const [openWishlist, setOpenWishlist] = useState(false);
  const [open, setOpen] = useState(false); // mobile menu
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const [showProfileMenu, setShowProfileMenu] = useState(false); // New state for profile dropdown
  const [showLogoutSuccess, setShowLogoutSuccess] = useState(false); // For custom logout success popup
  
  // Reference for handling clicks outside the dropdown
  const profileDropdownRef = useRef(null);

  // Handle logout with API call
  const handleLogout = () => {
    setIsLoading(true); // Show loading indicator
    axios
      .get(`${server}/user/logout`, { withCredentials: true })
      .then((res) => {
        // Show custom success popup instead of toast
        setShowLogoutSuccess(true);
        
        // Hide the popup and redirect after 2 seconds
        setTimeout(() => {
          setShowLogoutSuccess(false);
          navigate("/");
          window.location.reload(true); // Reload to reset state
        }, 2000);
      })
      .catch((error) => {
        console.log(error.response?.data?.message || "Logout failed");
        toast.error("Logout failed. Please try again.");
        setIsLoading(false);
      });
  };

  // Handle search change
  const handleSearchChange = (e) => {
    const term = e.target.value.toLowerCase(); // Ensure case-insensitive comparison
    setSearchTerm(term);
  
    // Filter products to match names containing the search term (not just starting with it)
    const filteredProducts =
      allProducts &&
      allProducts.filter((product) =>
        product.name.toLowerCase().includes(term)
      );
  
    setSearchData(filteredProducts);
  };

  // Handle product click with loading animation
  const handleProductClick = (productId) => {
    // Show loading animation
    setIsLoading(true);
    
    // Clear search results
    setSearchData(null);
    setSearchTerm("");
    
    // Navigate to product page after a small delay to show animation
    setTimeout(() => {
      window.location.href = `/product/${productId}`;
    }, 600); // Animation will show for 600ms
  };

  // Handle search form submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    
    if (searchTerm.trim()) {
      // Clear dropdown results
      setSearchData(null);
      
      // Show loading animation
      setIsLoading(true);
      
      // Navigate to search results page with the search term as query parameter
      setTimeout(() => {
        navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
        setIsLoading(false);
      }, 600);
    }
  };

  // Handle profile menu toggle
  const toggleProfileMenu = () => {
    setShowProfileMenu(!showProfileMenu);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [profileDropdownRef]);

  // Clean up loading state if user navigates away
  useEffect(() => {
    return () => {
      setIsLoading(false);
    };
  }, []);

  window.addEventListener("scroll", () => {
    if (window.scrollY > 70) {
      setActive(true);
    } else {
      setActive(false);
    }
  });

  return (
    <>
      {/* Loading overlay - only shown when isLoading is true */}
      {isLoading && (
        <div className="fixed inset-0 bg-white bg-opacity-80 z-50 flex justify-center items-center transition-opacity duration-300 ease-in-out">
          <div className="flex flex-col items-center">
            {/* Spinner using only Tailwind classes */}
            <div className="w-16 h-16 border-4 border-t-[#c8a4a5] border-r-[#c8a4a5] border-b-transparent border-l-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-[#5a4336] font-medium">Loading...</p>
          </div>
        </div>
      )}

      {/* Beautiful Logout Success Popup */}
      {showLogoutSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center transition-opacity duration-300 ease-in-out">
          <div className="bg-white rounded-lg shadow-2xl p-6 transform transition-all duration-300 ease-in-out scale-100 opacity-100 max-w-sm w-full mx-4">
            <div className="flex flex-col items-center text-center">
              <div className="rounded-full bg-green-100 p-3 mb-4">
                <AiOutlineCheckCircle className="text-green-500 text-4xl" />
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">Logout Successful!</h2>
              <p className="text-gray-600 mb-4">You have been successfully logged out of your account.</p>
              <div className="w-full bg-gray-200 h-1 rounded-full overflow-hidden">
                <div className="bg-[#c8a4a5] h-1 rounded-full animate-logout-progress"></div>
              </div>
              <p className="text-gray-500 text-sm mt-3">Redirecting to homepage...</p>
            </div>
          </div>
        </div>
      )}

      <div className={`${styles.section} bg-[#f6f6f5]`}>
        <div className="hidden 800px:h-[50px] 800px:my-[20px]
800px:flex items-center justify-between ">
          <div>
            <Link to="/">
              <img
                 src="/TamkeenLogo.jpeg"
                 style={{ height: "70px", width: "250px" }}
                alt=""
              />
            </Link>
          </div>
          {/*Search box  */}
          <div className="relative w-[50%]">
            <form onSubmit={handleSearchSubmit}>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search for product..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="h-10 w-full px-4 pr-10 rounded-md bg-white
                  focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#c8a4a5]
                  focus:border-transparent shadow-md"
                />
                <button 
                  type="submit" 
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                >
                  <AiOutlineSearch size={20} className="text-gray-500" />
                </button>
              </div>
            </form>
            {searchTerm && searchData && searchData.length > 0 && (
              <div className="absolute min-h-[30vh] bg-white shadow-lg z-[9] p-4 rounded-lg w-full mt-2">
                {searchData.map((product, index) => (
                  <div 
                    key={index} 
                    className="flex items-center py-2 hover:bg-gray-100 rounded-md cursor-pointer transition-all duration-200"
                    onClick={() => handleProductClick(product._id)}
                  >
                    <img
                      src={`${backend_url}${product.images[0]}`}
                      alt="img"
                      className="w-10 h-10 mr-3 rounded"
                    />
                    <h1 className="text-gray-700">{product.name}</h1>
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* Search end */}

          {/* Become a Seller */}
          <div>
            <Link
              to={`${isSeller ? "/dashboard" : "/shop-login"}`}
              className="inline-flex items-center px-4 py-2 bg-[#c8a4a5]
              hover:bg-[#b88f90] text-white font-medium rounded-md shadow-sm
              transition-colors duration-300"
            >
              <span className="mr-2">{isSeller ? "Go Dashboard" : "Login as Seller"}</span>
              <IoIosArrowForward />
            </Link>
          </div>
          {/* Become a Seller end */}
        </div>
      </div>

      {/* Mobile Header Search Form */}
      <div className="w-[92%] m-auto 800px:hidden mt-2">
        <form onSubmit={handleSearchSubmit}>
          <div className="relative">
            <input
              type="text"
              placeholder="Search for products"
              className="h-[40px] w-full px-2 border-[#c8a4a5] border-[2px] rounded-md"
              value={searchTerm}
              onChange={handleSearchChange}
            />
            <button 
              type="submit" 
              className="absolute right-2 top-2"
            >
              <AiOutlineSearch size={25} className="text-[#c8a4a5]" />
            </button>
          </div>
        </form>
      </div>

      {/*  2nd part of header start */}
      <div
        className={`${
          active === true ? "shadow-sm fixed top-0 left-0 z-10" : null
        } transition hidden 800px:flex items-center justify-between
w-full bg-[#c8a4a5] h-[70px]`}
      >
        <div
          className={`${styles.section} relative ${styles.noramlFlex}
justify-between`}
        >
          {/* Catagories */}
          

          {/* NavItems */}
          <div className={`${styles.noramlFlex} ml-[200px]`}>
            <Navbar active={activeHeading} />

          </div>

          <div className="flex items-center space-x-4">
            <div className={`${styles.noramlFlex}`}>
              <div
                className="relative cursor-pointer mr-[15px]"
                onClick={() => setOpenWishlist(true)}
              >
                <AiOutlineHeart size={30} className="text-[#5a4336]
cursor-pointer" />
                <span className="absolute right-0 top-0 rounded-full
bg-[#3bc177] w-4 h-4 top right p-0 m-0 text-white font-mono
text-[12px] leading-tight text-center">
                  {wishlist && wishlist.length}
                </span>
              </div>
            </div>

            <div className={`${styles.noramlFlex}`}>
              <div
                className="relative cursor-pointer mr-[15px]"
                onClick={() => setOpenCart(true)}
              >
                <AiOutlineShoppingCart
                  size={30} className="text-[#5a4336] cursor-pointer"
                />
                <span className="absolute right-0 top-0 rounded-full
bg-[#3bc177] w-4 h-4 top right p-0 m-0 text-white font-mono
text-[12px] leading-tight text-center">
                  {cart && cart.length}
                </span>
              </div>
            </div>

            {/* Profile Avatar with Dropdown */}
            <div className={`${styles.noramlFlex}`} ref={profileDropdownRef}>
              <div className="relative cursor-pointer mr-[15px]">
                {isAuthenticated ? (
                  <div onClick={toggleProfileMenu}>
                    <img
                      src={`${backend_url}${user.avatar}`}
                      className="w-[35px] h-[35px] rounded-full"
                      alt="User Avatar"
                    />
                    
                    {/* Profile Dropdown Menu */}
                    {showProfileMenu && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                        <Link 
                          to="/profile" 
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <FiUser className="mr-2 text-[#5a4336]" />
                          <span>Profile</span>
                        </Link>
                        
                        <div className="border-t border-gray-100"></div>
                        <button 
                          onClick={handleLogout}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                        >
                          <FiLogOut className="mr-2 text-[#5a4336]" />
                          <span>Logout</span>
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link to="/login">
                    <CgProfile size={30} color="rgb(255 255 255 / 83%)" />
                  </Link>
                )}
              </div>
            </div>
            {/* Avatar end */}
            
            {/* card  popup start */}
            {openCart ? <Cart setOpenCart={setOpenCart} /> : null}
            {/* card popup end */}

            {/* Wish list pop uo Start */}
            {openWishlist ? (
              <Wishlist setOpenWishlist={setOpenWishlist} />
            ) : null}
            {/* Wish list pop uo end */}
          </div>
        </div>
      </div>

      {/* Mobile Header */}
      <div
        className={`${
          active === true ? "shadow-sm fixed top-0 left-0 z-10" : null
        }
            w-full h-[60px] bg-[#fff] z-50 top-0 left-0 shadow-sm 800px:hidden`}
      >
        <div className="w-full flex items-center justify-between">
          <div>
            <BiMenuAltLeft
              size={40}
              className="ml-4"
              onClick={() => setOpen(true)}
            />
          </div>
          <div>
            <Link to="/">
              <img
                src="/TamkeenLogo.jpeg"
                style={{ height: "70px", width: "250px" }}
                alt=""
                className="mt-3 cursor-pointer"
              />
            </Link>
          </div>

          <div>
            <div
              className="relative mr-[20px]"
              onClick={() => setOpenCart(true)}
            >
              <AiOutlineShoppingCart size={30} />
              <span className="absolute right-0 top-0 rounded-full
bg-[#3bc177] w-4 h-4 top right p-0 m-0 text-white font-mono
text-[12px]  leading-tight text-center">
                {cart && cart.length}
              </span>
            </div>
          </div>
          {/* cart popup */}
          {openCart ? <Cart setOpenCart={setOpenCart} /> : null}

          {/* wishlist popup */}
          {openWishlist ? <Wishlist setOpenWishlist={setOpenWishlist} /> : null}
        </div>
      </div>

      {/*  side bar*/}
      {open ? (
        <div className={`fixed w-full bg-[#0000005f] z-20 h-full top-0 left-0`}>
          <div className="fixed w-[70%] bg-[#fff] h-screen top-0
left-0 z-10 overflow-y-scroll">
            <div className="w-full justify-between flex pr-3">
              <div>
                <div
                  className="relative mr-[15px]"
                  onClick={() => setOpenWishlist(true) || setOpen(false)}
                >
                  <AiOutlineHeart size={30} className="mt-5 ml-3" />
                  <span className="absolute right-0 top-0 rounded-full
bg-[#3bc177] w-4 h-4 top right p-0 m-0 text-white font-mono
text-[12px]  leading-tight text-center">
                    {wishlist && wishlist.length}
                  </span>
                </div>
              </div>

              <RxCross1
                size={30}
                className="ml-4 mt-5 cursor-pointer"
                onClick={() => setOpen(false)}
              />
            </div>

            {/* Search Bar */}
            <div className="my-8 w-[92%] m-auto h-[40px relative]">
              <form onSubmit={handleSearchSubmit}>
                <div className="relative">
                  <input
                    type="search"
                    placeholder="Search for products"
                    className="h-[40px] w-full px-2 border-[#c8a4a5] border-[2px] rounded-md"
                    value={searchTerm}
                    onChange={handleSearchChange}
                  />
                  <button 
                    type="submit" 
                    className="absolute right-2 top-2"
                  >
                    <AiOutlineSearch size={25} className="text-[#c8a4a5]" />
                  </button>
                </div>
              </form>

              {searchData && searchData.length > 0 && (
                <div className="absolute bg-[#fff] z-10 shadow w-full left-0 p-3">
                  {searchData.map((product) => (
                    <div 
                      key={product._id} 
                      className="flex items-center py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => handleProductClick(product._id)}
                    >
                      <img
                        src={`${backend_url}${product.images[0]}`}
                        alt=""
                        className="w-[50px] mr-2"
                      />
                      <h5>{product.name}</h5>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <Navbar active={activeHeading} />
            <div className={`${styles.button} ml-4 !rounded-[4px]`}>
              <Link to={`${isSeller ? "/dashboard" : "/shop-create"}`}>
                <h1 className="text-[#ff] flex items-center">
                  {isSeller ? "Go Dashboard" : "Become Seller"}{" "}
                  <IoIosArrowForward className="ml-1" />
                </h1>
              </Link>
            </div>
            <br />
            <br />
            <br />

            {/* Mob Login */}
            <div className="flex w-full justify-center">
              {isAuthenticated ? (
                <div className="relative" ref={profileDropdownRef}>
                  <div onClick={toggleProfileMenu}>
                    <img
                      src={`${backend_url}${user.avatar}`}
                      alt="Profile img"
                      className="w-[35px] h-[35px] rounded-full"
                    />
                  </div>
                  
                  {/* Mobile profile dropdown */}
                  {showProfileMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                      <Link 
                        to="/profile" 
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setOpen(false)}
                      >
                        <FiUser className="mr-2 text-[#5a4336]" />
                        <span>Profile</span>
                      </Link>
                      <Link 
                        to="/change-password" 
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setOpen(false)}
                      >
                        <FiLock className="mr-2 text-[#5a4336]" />
                        <span>Change Password</span>
                      </Link>
                      <div className="border-t border-gray-100"></div>
                      <button 
                        onClick={() => {
                          handleLogout();
                          setOpen(false);
                        }}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                      >
                        <FiLogOut className="mr-2 text-[#5a4336]" />
                        <span>Logout</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-[18px] pr-[10px] bg-[#3bc177]"
                  >
                    Login{" "}
                  </Link>
                  <Link to="/sign-up" className="text-[18px] className=text-[#5a4336]">
                    Sign up{" "}
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
};

export default Header;