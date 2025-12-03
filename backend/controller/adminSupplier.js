// controller/adminSupplier.js
require('dotenv').config();
const express = require("express");
const { isAuthenticated, isAdmin } = require("../middleware/auth");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const router = express.Router();
const Supplier = require("../model/supplier");
const ErrorHandler = require("../utils/ErrorHandler");


// Create a supplier
router.post(
  "/create-supplier",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const {
        name,
        email,
        phone,
        address,
        coordinates,
        materials,
        businessHours,
        description,
        minimumOrder,
        paymentMethods,
        deliveryOptions,
        tags,
        socialMedia,
        images
      } = req.body;

      // Validate required fields
      if (!name || !email || !phone || !address || !coordinates) {
        return next(new ErrorHandler("Name, email, phone, address, and coordinates are required.", 400));
      }

      // Validate coordinates
      if (!coordinates.latitude || !coordinates.longitude) {
        return next(new ErrorHandler("Both latitude and longitude are required.", 400));
      }

      // Validate materials array
      if (!materials || !Array.isArray(materials) || materials.length === 0) {
        return next(new ErrorHandler("At least one material category is required.", 400));
      }

      // Validate phone format
     if (!/^(\+92[3][0-5]\d{8}|051\d{7,8})$/.test(phone)) {
  return next(new ErrorHandler("Invalid phone format. Use +923XXXXXXXXX  or 051XXXXXXX .", 400));
}

      // Check if supplier with same email already exists
      const existingSupplier = await Supplier.findOne({ email: email.toLowerCase() });
      if (existingSupplier) {
        return next(new ErrorHandler("Supplier with this email already exists.", 400));
      }

      // Create the supplier
      const supplier = await Supplier.create({
        name,
        email: email.toLowerCase(),
        phone,
        address,
        coordinates: {
          latitude: parseFloat(coordinates.latitude),
          longitude: parseFloat(coordinates.longitude)
        },
        materials,
        businessHours: businessHours || {},
        description,
        minimumOrder,
        paymentMethods: paymentMethods || [],
        deliveryOptions: deliveryOptions || [],
        tags: tags || [],
        socialMedia: socialMedia || {},
        images: images || [],
        createdBy: req.user.id
      });

      res.status(201).json({
        success: true,
        message: "Supplier created successfully",
        supplier,
      });
    } catch (error) {
      console.error("Error creating supplier:", error);
      if (error.code === 11000) {
        return next(new ErrorHandler("Supplier with this email already exists.", 400));
      }
      return next(new ErrorHandler(error.message || "Failed to create supplier. Please try again.", 500));
    }
  })
);

// Get all suppliers (Admin view)
router.get(
  "/get-all-suppliers",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        category,
        status,
        verified,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = req.query;

      const query = {};

      // Search filter
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { address: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ];
      }

      // Category filter
      if (category && category !== 'all') {
        query['materials.category'] = category;
      }

      // Status filter (now using lowercase)
      if (status && status !== 'all') {
        query.status = status;
      }

      // Verified filter
      if (verified !== undefined) {
        query.isVerified = verified === 'true';
      }

      const sortOptions = {};
      sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

      const suppliers = await Supplier.find(query)
        .populate('createdBy', 'name email')
        .populate('verifiedBy', 'name email')
        .sort(sortOptions)
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await Supplier.countDocuments(query);

      res.status(200).json({
        success: true,
        suppliers,
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalSuppliers: total,
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Get a single supplier by ID
router.get(
  "/get-supplier/:id",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const supplier = await Supplier.findById(req.params.id)
        .populate('createdBy', 'name email')
        .populate('verifiedBy', 'name email')
        .populate('reviews.sellerId', 'name email');

      if (!supplier) {
        return next(new ErrorHandler("Supplier not found!", 404));
      }

      res.status(200).json({
        success: true,
        supplier,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Update a supplier
router.put(
  "/update-supplier/:id",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const supplierId = req.params.id;
      const updateData = req.body;

     // Validate phone format if provided - support both mobile and PTCL
if (updateData.phone) {
 const phoneRegex = /^(\+92[3][0-5]\d{8}|051\d{7,8})$/;
if (!phoneRegex.test(updateData.phone)) {
  return next(new ErrorHandler("Invalid phone format. Use +923XXXXXXXXX or 051XXXXXXX ", 400));
}
}

      // Validate coordinates if provided
      if (updateData.coordinates) {
        if (!updateData.coordinates.latitude || !updateData.coordinates.longitude) {
          return next(new ErrorHandler("Both latitude and longitude are required.", 400));
        }
        updateData.coordinates.latitude = parseFloat(updateData.coordinates.latitude);
        updateData.coordinates.longitude = parseFloat(updateData.coordinates.longitude);
      }

      // Validate materials if provided
      if (updateData.materials && (!Array.isArray(updateData.materials) || updateData.materials.length === 0)) {
        return next(new ErrorHandler("At least one material category is required.", 400));
      }

      // Check email uniqueness if email is being updated
      if (updateData.email) {
        const existingSupplier = await Supplier.findOne({ 
          email: updateData.email.toLowerCase(),
          _id: { $ne: supplierId }
        });
        if (existingSupplier) {
          return next(new ErrorHandler("Supplier with this email already exists.", 400));
        }
        updateData.email = updateData.email.toLowerCase();
      }

      const supplier = await Supplier.findByIdAndUpdate(
        supplierId,
        updateData,
        { new: true, runValidators: true }
      ).populate('createdBy', 'name email').populate('verifiedBy', 'name email');

      if (!supplier) {
        return next(new ErrorHandler("Supplier not found!", 404));
      }

      res.status(200).json({
        success: true,
        message: "Supplier updated successfully",
        supplier,
      });
    } catch (error) {
      if (error.code === 11000) {
        return next(new ErrorHandler("Supplier with this email already exists.", 400));
      }
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Delete a supplier
router.delete(
  "/delete-supplier/:id",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const supplierId = req.params.id;

      const supplier = await Supplier.findByIdAndDelete(supplierId);

      if (!supplier) {
        return next(new ErrorHandler("Supplier not found with this id!", 404));
      }

      res.status(200).json({
        success: true,
        message: "Supplier deleted successfully!",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Verify/Unverify a supplier
router.patch(
  "/verify-supplier/:id",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const supplierId = req.params.id;
      const { isVerified } = req.body;

      const updateData = {
        isVerified: Boolean(isVerified),
        verifiedBy: isVerified ? req.user.id : null,
        verificationDate: isVerified ? new Date() : null
      };

      const supplier = await Supplier.findByIdAndUpdate(
        supplierId,
        updateData,
        { new: true }
      ).populate('verifiedBy', 'name email');

      if (!supplier) {
        return next(new ErrorHandler("Supplier not found!", 404));
      }

      res.status(200).json({
        success: true,
        message: `Supplier ${isVerified ? 'verified' : 'unverified'} successfully`,
        supplier,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Update supplier status
router.patch(
  "/update-supplier-status/:id",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const supplierId = req.params.id;
      const { status } = req.body;

      if (!["active", "inactive", "pending_verification", "suspended"].includes(status)) {
        return next(new ErrorHandler("Invalid status. Must be active, inactive, pending_verification, or suspended.", 400));
      }

      const supplier = await Supplier.findByIdAndUpdate(
        supplierId,
        { status },
        { new: true }
      );

      if (!supplier) {
        return next(new ErrorHandler("Supplier not found!", 404));
      }

      res.status(200).json({
        success: true,
        message: `Supplier status updated to ${status}`,
        supplier,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Get supplier statistics (Dashboard)
router.get(
  "/supplier-stats",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const totalSuppliers = await Supplier.countDocuments();
      const verifiedSuppliers = await Supplier.countDocuments({ isVerified: true });
      const activeSuppliers = await Supplier.countDocuments({ status: "active" });
      
      // Suppliers by category
      const suppliersByCategory = await Supplier.aggregate([
        { $unwind: "$materials" },
        { $group: { _id: "$materials.category", count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]);

      // Recent suppliers (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const recentSuppliers = await Supplier.countDocuments({
        createdAt: { $gte: thirtyDaysAgo }
      });

      // Average rating
      const avgRatingResult = await Supplier.aggregate([
        { $match: { "rating.count": { $gt: 0 } } },
        { $group: { _id: null, avgRating: { $avg: "$rating.average" } } }
      ]);
      const averageRating = avgRatingResult.length > 0 ? avgRatingResult[0].avgRating.toFixed(1) : 0;

      res.status(200).json({
        success: true,
        stats: {
          totalSuppliers,
          verifiedSuppliers,
          activeSuppliers,
          recentSuppliers,
          averageRating,
          suppliersByCategory
        }
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Bulk import suppliers (CSV)
router.post(
  "/bulk-import-suppliers",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { suppliers } = req.body;

      if (!Array.isArray(suppliers) || suppliers.length === 0) {
        return next(new ErrorHandler("No supplier data provided", 400));
      }

      const results = {
        successful: 0,
        failed: 0,
        errors: []
      };

      for (let i = 0; i < suppliers.length; i++) {
        try {
          const supplierData = {
            ...suppliers[i],
            createdBy: req.user.id,
            coordinates: {
              latitude: parseFloat(suppliers[i].latitude),
              longitude: parseFloat(suppliers[i].longitude)
            }
          };

          // Remove individual lat/lng fields
          delete supplierData.latitude;
          delete supplierData.longitude;

          await Supplier.create(supplierData);
          results.successful++;
        } catch (error) {
          results.failed++;
          results.errors.push({
            row: i + 1,
            error: error.message
          });
        }
      }

      res.status(200).json({
        success: true,
        message: "Bulk import completed",
        results
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);


module.exports = router;