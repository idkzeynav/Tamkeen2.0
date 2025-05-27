const express = require("express");
const { isAuthenticated, isAdmin } = require("../middleware/auth");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const router = express.Router();
const ServiceCategory = require("../model/serviceCategory");
const ErrorHandler = require("../utils/ErrorHandler");

// Create service category (admin only)


// Fixed admin middleware usage
router.post(
  "/create-category",
  isAuthenticated,
  isAdmin("Admin"), // Added role parameter
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { name } = req.body;
      
      // Add request logging
      console.log("[CREATE CATEGORY] Request received:", { name, user: req.user });

      if (!name) {
        return next(new ErrorHandler("Category name is required", 400));
      }

      const existingCategory = await ServiceCategory.findOne({ name });
      if (existingCategory) {
        return next(new ErrorHandler("Category already exists", 400));
      }

      const category = await ServiceCategory.create({ name });
      
      console.log("[CREATE CATEGORY] Success:", category);
      res.status(201).json({ success: true, category });
      
    } catch (error) {
      console.error("[CREATE CATEGORY] Error:", error);
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// ... keep other routes the same but verify admin middleware usage

// Get all service categories
router.get(
  "/get-all-categories",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const categories = await ServiceCategory.find().sort({ name: 1 });
      
      res.status(200).json({
        success: true,
        categories,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
  })
);

// Delete service category (admin only)
router.delete(
  "/delete-category/:id",
  isAuthenticated,
 isAdmin("Admin"), // Added role parameter
  catchAsyncErrors(async (req, res, next) => {
    try {
      const categoryId = req.params.id;
      
      const category = await ServiceCategory.findByIdAndDelete(categoryId);
      
      if (!category) {
        return next(new ErrorHandler("Category not found", 404));
      }
      
      res.status(200).json({
        success: true,
        message: "Category deleted successfully",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
  })
);

module.exports = router;