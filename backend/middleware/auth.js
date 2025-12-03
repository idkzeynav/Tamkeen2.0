require('dotenv').config();

const ErrorHandler = require("../utils/ErrorHandler");
const catchAsyncErrors = require("./catchAsyncErrors");
const jwt = require("jsonwebtoken");
const User = require("../model/user");
const Shop = require("../model/shop");

// Check if user is authenticated or not
exports.isAuthenticated = catchAsyncErrors(async (req, res, next) => {
  const { token } = req.cookies;
  if (!token) {
    return next(new ErrorHandler("Please login to continue", 401));
  }
  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

  req.user = await User.findById(decoded.id);
  next();
});

exports.isSeller = catchAsyncErrors(async (req, res, next) => {
  const { seller_token } = req.cookies;
  if (!seller_token) {
    return next(new ErrorHandler("Please login to continue", 401));
  }

  const decoded = jwt.verify(seller_token, process.env.JWT_SECRET_KEY);

  req.seller = await Shop.findById(decoded.id);

  next();
});

exports.isAdmin = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorHandler(`${req.user.role} can not access this resources!`)
      );
    }
    next();
  };
};

// FIXED: Unified authentication for both users and sellers
exports.isAuthenticatedUserOrSeller = catchAsyncErrors(async (req, res, next) => {
  let token;
  
  // FIXED: Check Authorization header FIRST (for API calls from frontend)
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }
  // Then check cookies (for web requests)
  else if (req.cookies.token || req.cookies.seller_token) {
    token = req.cookies.token || req.cookies.seller_token;
  }
  
  if (!token) {
    console.log("No token found in request"); // Debug log
    return next(new ErrorHandler("Please login to continue", 401));
  }

  try {
    console.log("Verifying token:", token.substring(0, 20) + "..."); // Debug log
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    console.log("Token decoded successfully, user ID:", decoded.id); // Debug log
    
    // Try to find user first
    let user = await User.findById(decoded.id);
    if (user) {
      console.log("User found:", user.email); // Debug log
      req.user = user;
      req.user.role = "User"; // Ensure role is set
      return next();
    }
    
    // If not found as user, try as seller
    let seller = await Shop.findById(decoded.id);
    if (seller) {
      console.log("Seller found:", seller.email); // Debug log
      req.user = seller;
      req.user.role = "Seller"; // Ensure role is set
      return next();
    }
    
    // If neither found
    console.log("No user or seller found with ID:", decoded.id); // Debug log
    return next(new ErrorHandler("User not found", 401));
    
  } catch (error) {
    console.error("Token verification error:", error.message); // Debug log
    return next(new ErrorHandler("Invalid token", 401));
  }
});

// FIXED: Role validation for users/sellers
exports.isUserOrSeller = (req, res, next) => {
  if (!req.user) {
    console.log("No user found in request object"); // Debug log
    return next(new ErrorHandler("User not authenticated", 401));
  }
  
  console.log("User role:", req.user.role); // Debug log
  
  if (!["User", "Seller"].includes(req.user.role)) {
    return next(
      new ErrorHandler(`${req.user.role} cannot access this resource`, 403)
    );
  }
  next();
};