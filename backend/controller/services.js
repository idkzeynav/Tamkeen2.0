const express = require("express");
const { isSeller, isAuthenticated, isAdmin } = require("../middleware/auth");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const router = express.Router();
const Service = require("../model/services");
const Shop = require("../model/shop");
const User = require("../model/user");
const ErrorHandler = require("../utils/ErrorHandler");
const Booking = require("../model/bookings");
const { createServiceValidationSchema, updateServiceValidationSchema } = require("../utils/serviceValidation.js");
const { moderateContentWithCache } = require("../utils/contentModeration.js");
const mongoose = require('mongoose');
const ServiceCategory = require("../model/serviceCategory");
const sendMail = require('../utils/sendMail');

// Create service - with content moderation
router.post(
  "/create-service",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { error } = createServiceValidationSchema.validate(req.body);
      if (error) {
        return next(new ErrorHandler(error.details[0].message, 400));
      }
      
      const shopId = req.body.shopId;
      const shop = await Shop.findById(shopId);
      if (!shop) {
        return next(new ErrorHandler("Shop Id is invalid!", 400));
      }

      const serviceData = req.body;
      serviceData.shop = shop;
      
      // Check if this is a custom category (others option)
      if (serviceData.isCustomName) {
        // For custom categories, we just store the name directly
        serviceData.category = null;
        console.log("Creating service with custom name:", serviceData.name);
      } else {
        // For standard categories, ensure the category exists
        if (!serviceData.category) {
          return next(new ErrorHandler("Service category is required for standard services", 400));
        }
        
        // Verify the category exists
        const categoryExists = await ServiceCategory.findById(serviceData.category);
        if (!categoryExists) {
          return next(new ErrorHandler("Selected category does not exist", 400));
        }
        
        console.log("Creating service with standard category:", categoryExists.name);
      }

      // Apply content moderation to name and description - now using the cached version
      const contentToModerate = {
        name: serviceData.name,
        description: serviceData.description
      };

      // Use the enhanced moderateContentWithCache with options
      const moderationResult = await moderateContentWithCache(contentToModerate, {
        confidenceThreshold: 0.6, // Slightly more sensitive detection
        excludeFields: [] // No fields excluded
      });
      
      // If content is flagged, set status to pending and store moderation flags
      if (!moderationResult.isValid) {
        serviceData.status = "pending";
        
        // Enhanced moderation data storage - more comprehensive
        serviceData.moderationFlags = {
          isAbusive: moderationResult.isAbusive || false,
          flaggedFields: moderationResult.flaggedFields || [],
          moderationNotes: moderationResult.message || "Content flagged for review",
          detectedIssues: {}
        };
        
        // Store detailed toxicity/hate scores for admin review
        if (moderationResult.detailedResults) {
          const detectedIssues = {};
          
          // Process flagged fields to include detailed scoring
          moderationResult.flaggedFields.forEach(field => {
            detectedIssues[field.field] = {
              toxicScore: field.toxicScore,
              hateScore: field.hateScore,
              reason: field.reason,
              sample: field.text
            };
          });
          
          serviceData.moderationFlags.detectedIssues = detectedIssues;
        }
        
        console.log("Service content flagged for moderation:", moderationResult);
      }

      const service = await Service.create(serviceData);

      // Check if we need to notify admins about flagged content
      if (service.status === "pending") {
        // Here you would implement admin notification logic
        // This could be through email, notifications, etc.
        console.log("Admin notification: New service requires moderation approval");
        // notifyAdmins(service); // Implement this function based on your notification system
      }

      res.status(201).json({
        success: true,
        service,
        requiresApproval: service.status === "pending"
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
  })
);

// Get all services
router.get(
  "/get-all-services",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const services = await Service.find()
       .populate('category', 'name') // This populates the category field with name
        .sort({ createdAt: -1 });

      const transformedServices = services.map(service => ({
        ...service.toObject(),
        availability: Object.fromEntries(service.availability) // Convert Map to object
      }));

      res.status(200).json({
        success: true,
        services: transformedServices,
      });
    } catch (error) {
      return next(new ErrorHandler(error, 400));
    }
  })
);

// Get all services of a shop
router.get(
  "/get-all-services-shop/:id",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const services = await Service.find({ shopId: req.params.id });

      const transformedServices = services.map(service => ({
        ...service.toObject(),
        availability: Object.fromEntries(service.availability) // Convert Map to object
      }));
      
      res.status(200).json({
        success: true,
        services,
      });
    } catch (error) {
      return next(new ErrorHandler(error, 400));
    }
  })
);

// Delete service of a shop
router.delete(
  "/delete-shop-service/:id",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const serviceId = req.params.id;

      // Find the service by ID and delete it
      const service = await Service.findByIdAndDelete(serviceId);

      if (!service) {
        return next(new ErrorHandler("Service not found with this id!", 500));
      }
      await Booking.deleteMany({ serviceId: serviceId });

      res.status(201).json({
        success: true,
        message: "Service and related bookings deleted successfully!",
      });
    } catch (error) {
      return next(new ErrorHandler(error, 400));
    }
  })
);

// Update service
router.put(
  "/update-service/:id",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const serviceId = req.params.id.trim();
      
      const { error } = updateServiceValidationSchema.validate(req.body);
      if (error) {
        console.error("Validation error:", error.details);
        return next(new ErrorHandler(error.details[0].message, 400));
      }

      const serviceData = req.body;

      // Find the service by ID
      const service = await Service.findById(serviceId);
      if (!service) {
        return next(new ErrorHandler("Service not found!", 404));
      }

      // Ensure that the shop field remains unchanged if not explicitly provided
      if (!serviceData.shop) {
        serviceData.shop = service.shop;  
      }
      
      // Apply content moderation if name or description has changed
      if (serviceData.name !== service.name || serviceData.description !== service.description) {
        const contentToModerate = {
          name: serviceData.name || service.name,
          description: serviceData.description || service.description
        };
        
        // Use the enhanced moderateContentWithCache with options
        const moderationResult = await moderateContentWithCache(contentToModerate, {
          confidenceThreshold: 0.6, // Slightly more sensitive detection
          excludeFields: [] // No fields excluded
        });
        
        // If content is flagged, set status to pending and store moderation flags
        if (!moderationResult.isValid) {
          serviceData.status = "pending";
          
          // Enhanced moderation data storage
          serviceData.moderationFlags = {
            isAbusive: moderationResult.isAbusive || false,
            flaggedFields: moderationResult.flaggedFields || [],
            moderationNotes: moderationResult.message || "Content flagged for review during update",
            detectedIssues: {}
          };
          
          // Store detailed toxicity/hate scores for admin review
          if (moderationResult.detailedResults) {
            const detectedIssues = {};
            
            // Process flagged fields to include detailed scoring
            moderationResult.flaggedFields.forEach(field => {
              detectedIssues[field.field] = {
                toxicScore: field.toxicScore,
                hateScore: field.hateScore,
                reason: field.reason,
                sample: field.text
              };
            });
            
            serviceData.moderationFlags.detectedIssues = detectedIssues;
          }
          
          console.log("Updated service content flagged for moderation:", moderationResult);
          
          // Notify admins logic would go here
        }
      }
      
      serviceData.lastModifiedAt = Date.now();

      // Update service fields
      const updatedService = await Service.findByIdAndUpdate(serviceId, serviceData, { new: true });

      res.status(200).json({
        success: true,
        message: "Service updated successfully!",
        requiresApproval: updatedService.status === "pending"
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
  })
);

// Admin routes for service moderation

// Get pending services requiring moderation
router.get(
  "/admin/pending-services",
  isAuthenticated,
 isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const pendingServices = await Service.find({ status: "pending" }).sort({ createdAt: -1 });
      
      const transformedServices = pendingServices.map(service => ({
        ...service.toObject(),
        availability: Object.fromEntries(service.availability)
      }));
      
      res.status(200).json({
        success: true,
        services: transformedServices,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
  })
);

// Approve or reject a service
router.put(
  "/admin/moderate-service/:id",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { status, moderationNotes } = req.body;
      const serviceId = req.params.id;
      
      if (!["approved", "rejected"].includes(status)) {
        return next(new ErrorHandler("Invalid status. Must be 'approved' or 'rejected'", 400));
      }
      
      const service = await Service.findById(serviceId);
      if (!service) {
        return next(new ErrorHandler("Service not found", 404));
      }
      
      service.status = status;
      if (moderationNotes) {
        if (!service.moderationFlags) {
          service.moderationFlags = {};
        }
        service.set('moderationFlags.moderationNotes', moderationNotes);
        service.moderationFlags.moderatedAt = Date.now();
        service.moderationFlags.moderatedBy = req.user._id;
      }
      service.lastModifiedAt = Date.now();
      
      await service.save();
  
      // Function to notify seller when their service is rejected
const notifySellerServiceRejected = async (service, moderationNotes) => {
  // Get the shop information to find the seller's email
  const shop = await Shop.findById(service.shopId);
  
  if (!shop || !shop.email) {
    console.warn(`No email defined for the shop with ID: ${service.shopId}`);
    return;
  }
  
  const plainTextMessage = `
    Dear ${shop.name},
    
    We regret to inform you that your service "${service.name}" has been rejected during our moderation process.
    
    Reason for rejection: ${moderationNotes || "Does not meet our platform guidelines"}
    
    If you have any questions or need further clarification, please contact our support team.
    
    Best regards,
    The Admin Team
  `;

  const htmlMessage = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Service Rejection Notice</title>
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; background-color: #faf7f7; color: #5a4336;">
  <!-- Header with logo area and gradient background -->
  <div style="background-image: linear-gradient(135deg, #c8a4a5 0%, #d48c8f 100%); padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: #ffffff; margin: 0; font-size: 28px; text-shadow: 1px 1px 2px rgba(0,0,0,0.1);">Service Moderation Update</h1>
  </div>
  
  <!-- Main content area with card gradient effect -->
  <div style="padding: 35px 25px; border-left: 1px solid #e6d8d8; border-right: 1px solid #e6d8d8; border-bottom: 1px solid #e6d8d8; background-image: linear-gradient(to bottom, #ffffff, #f5f0f0); border-radius: 0 0 8px 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
    <h2 style="color: #d48c8f; margin-top: 0; font-size: 24px;">Service Rejection Notice</h2>
    
    <p style="font-size: 16px; line-height: 1.6; color: #5a4336;">Dear ${shop.name},</p>
    
    <p style="font-size: 16px; line-height: 1.6; color: #5a4336;">We regret to inform you that your service has been rejected during our moderation process.</p>
    
    <!-- Service details section -->
    <div style="margin: 30px 0; padding: 25px; border-radius: 8px; background-image: linear-gradient(to right, #f5f0f0, #e6d8d8);">
      <h3 style="color: #c8a4a5; margin-top: 0; font-size: 20px;">Service Details</h3>
      
      <div style="background-color: #ffffff; border-radius: 6px; padding: 15px; margin-bottom: 10px;">
        <p style="font-size: 16px; line-height: 1.5; color: #5a4336; margin: 5px 0;">
          <strong style="color: #c8a4a5;">Service Title:</strong> ${service.name}
        </p>
      </div>
      
      <div style="background-color: #ffffff; border-radius: 6px; padding: 15px; margin-bottom: 10px;">
        <p style="font-size: 16px; line-height: 1.5; color: #5a4336; margin: 5px 0;">
          <strong style="color: #c8a4a5;">Service ID:</strong> ${service._id}
        </p>
      </div>
      
      <div style="background-color: #ffffff; border-radius: 6px; padding: 15px;">
        <p style="font-size: 16px; line-height: 1.5; color: #5a4336; margin: 5px 0;">
          <strong style="color: #c8a4a5;">Status:</strong> <span style="color: #d63031; font-weight: bold;">Rejected</span>
        </p>
      </div>
    </div>
    
    <!-- Rejection Reason section -->
    <div style="margin: 30px 0; padding: 20px; border-radius: 6px; background-color: #f5f0f0; border-left: 4px solid #d63031;">
      <h3 style="color: #d48c8f; margin-top: 0; font-size: 18px;">Reason for Rejection</h3>
      <p style="font-size: 16px; line-height: 1.6; color: #5a4336; padding: 10px; background-color: #ffffff; border-radius: 4px;">
        ${moderationNotes || "Does not meet our platform guidelines"}
      </p>
    </div>
    
    <!-- Next steps section -->
    <div style="margin: 30px 0; padding: 20px; border-radius: 6px; background-color: #f5f0f0; border-left: 4px solid #d48c8f;">
      <h3 style="color: #c8a4a5; margin-top: 0; font-size: 18px;">Next Steps</h3>
      <ul style="font-size: 16px; line-height: 1.6; color: #5a4336; padding-left: 20px;">
        <li>Review the provided feedback carefully</li>
        <li>Make the necessary changes to your service</li>
        <li>Contact support if you need clarification on the rejection reasons</li>
      </ul>
    </div>
    
    <div style="text-align: center; margin-top: 30px;">
      <a href="#" style="display: inline-block; background-image: linear-gradient(135deg, #c8a4a5 0%, #d48c8f 100%); color: white; text-decoration: none; padding: 12px 30px; border-radius: 6px; font-weight: bold; font-size: 16px; box-shadow: 0 2px 4px rgba(0,0,0,0.15);">Update Service</a>
    </div>
    
    <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e6d8d8; text-align: center;">
      <p style="font-size: 14px; color: #b38d82; margin-bottom: 5px;">If you have any questions, please contact our support team.</p>
      <p style="font-size: 16px; font-weight: bold; color: #c8a4a5; margin-top: 0;">We're here to help you succeed!</p>
    </div>
  </div>
  
  <!-- Footer area with soft gradient -->
  <div style="background-image: linear-gradient(to right, #e6d8d8, #c8a4a5); padding: 20px; text-align: center; font-size: 14px; color: #ffffff; border-radius: 0 0 8px 8px; box-shadow: 0 -2px 5px rgba(0,0,0,0.03);">
    <p style="margin: 0 0 10px 0;">© ${new Date().getFullYear()} Your Company Name. All rights reserved.</p>
    <p style="margin: 0;">This is an automated message. Please do not reply to this email.</p>
  </div>
</body>
</html>`;

  try {
    await sendMail({
      email: shop.email,
      subject: `Service Rejected - ${service.title}`,
      message: plainTextMessage,
      html: htmlMessage
    });
    console.log(`Service rejection notification email sent to seller: ${shop.email}`);
  } catch (error) {
    console.error(`Error sending service rejection notification email: ${error.message}`);
  }
};

// Function to notify seller when their service is approved
const notifySellerServiceApproved = async (service) => {
  // Get the shop information to find the seller's email
  const shop = await Shop.findById(service.shopId);
  
  if (!shop || !shop.email) {
    console.warn(`No email defined for the shop with ID: ${service.shopId}`);
    return;
  }
  
  const plainTextMessage = `
    Dear ${shop.name},
    
   Your service "${service.name}" has been approved and is now live on our platform.
    
    Your service is now visible to potential customers and you can start receiving bookings.
    
    Thank you for being a valued partner on our platform.
    
    Best regards,
    The Admin Team
  `;

  const htmlMessage = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Service Approval Notice</title>
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; background-color: #faf7f7; color: #5a4336;">
  <!-- Header with logo area and gradient background -->
  <div style="background-image: linear-gradient(135deg, #c8a4a5 0%, #d48c8f 100%); padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: #ffffff; margin: 0; font-size: 28px; text-shadow: 1px 1px 2px rgba(0,0,0,0.1);">Good News!</h1>
  </div>
  
  <!-- Main content area with card gradient effect -->
  <div style="padding: 35px 25px; border-left: 1px solid #e6d8d8; border-right: 1px solid #e6d8d8; border-bottom: 1px solid #e6d8d8; background-image: linear-gradient(to bottom, #ffffff, #f5f0f0); border-radius: 0 0 8px 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
    <h2 style="color: #4CAF50; margin-top: 0; font-size: 24px;">Service Approved!</h2>
    
    <p style="font-size: 16px; line-height: 1.6; color: #5a4336;">Dear ${shop.name},</p>
    
    <p style="font-size: 16px; line-height: 1.6; color: #5a4336;">Congratulations! Your service has been approved and is now live on our platform.</p>
    
    <!-- Service details section -->
    <div style="margin: 30px 0; padding: 25px; border-radius: 8px; background-image: linear-gradient(to right, #f5f0f0, #e6d8d8);">
      <h3 style="color: #c8a4a5; margin-top: 0; font-size: 20px;">Service Details</h3>
      
      <div style="background-color: #ffffff; border-radius: 6px; padding: 15px; margin-bottom: 10px;">
        <p style="font-size: 16px; line-height: 1.5; color: #5a4336; margin: 5px 0;">
          <strong style="color: #c8a4a5;">Service Title:</strong> ${service.name}
        </p>
      </div>
      
      <div style="background-color: #ffffff; border-radius: 6px; padding: 15px; margin-bottom: 10px;">
        <p style="font-size: 16px; line-height: 1.5; color: #5a4336; margin: 5px 0;">
          <strong style="color: #c8a4a5;">Service ID:</strong> ${service._id}
        </p>
      </div>
      
      <div style="background-color: #ffffff; border-radius: 6px; padding: 15px;">
        <p style="font-size: 16px; line-height: 1.5; color: #5a4336; margin: 5px 0;">
          <strong style="color: #c8a4a5;">Status:</strong> <span style="color: #4CAF50; font-weight: bold;">Approved</span>
        </p>
      </div>
    </div>
    
    <!-- Next steps section -->
    <div style="margin: 30px 0; padding: 20px; border-radius: 6px; background-color: #f5f0f0; border-left: 4px solid #4CAF50;">
      <h3 style="color: #c8a4a5; margin-top: 0; font-size: 18px;">What's Next</h3>
      <ul style="font-size: 16px; line-height: 1.6; color: #5a4336; padding-left: 20px;">
        <li>Your service is now visible to potential customers</li>
        <li>Make sure your availability settings are up to date</li>
        <li>Respond promptly to any order inquiries</li>
        <li>Maintain high-quality service to build your reputation</li>
      </ul>
    </div>
    
    <div style="text-align: center; margin-top: 30px;">
      <a href="#" style="display: inline-block; background-image: linear-gradient(135deg, #c8a4a5 0%, #d48c8f 100%); color: white; text-decoration: none; padding: 12px 30px; border-radius: 6px; font-weight: bold; font-size: 16px; box-shadow: 0 2px 4px rgba(0,0,0,0.15);">View Service</a>
    </div>
    
    <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e6d8d8; text-align: center;">
      <p style="font-size: 14px; color: #b38d82; margin-bottom: 5px;">Thank you for being a valued partner!</p>
      <p style="font-size: 16px; font-weight: bold; color: #c8a4a5; margin-top: 0;">We look forward to your success on our platform</p>
    </div>
  </div>
  
  <!-- Footer area with soft gradient -->
  <div style="background-image: linear-gradient(to right, #e6d8d8, #c8a4a5); padding: 20px; text-align: center; font-size: 14px; color: #ffffff; border-radius: 0 0 8px 8px; box-shadow: 0 -2px 5px rgba(0,0,0,0.03);">
    <p style="margin: 0 0 10px 0;">© ${new Date().getFullYear()} Your Company Name. All rights reserved.</p>
    <p style="margin: 0;">This is an automated message. Please do not reply to this email.</p>
  </div>
</body>
</html>`;

  try {
    await sendMail({
      email: shop.email,
      subject: `Service Approved - ${service.name}`,
      message: plainTextMessage,
      html: htmlMessage
    });
    console.log(`Service approval notification email sent to seller: ${shop.email}`);
  } catch (error) {
    console.error(`Error sending service approval notification email: ${error.message}`);
  }
};

       if (status === "rejected") {
        await notifySellerServiceRejected(service, moderationNotes);
      } else if (status === "approved") {
        await notifySellerServiceApproved(service);
      }
      
      res.status(200).json({
        success: true,
        message: `Service has been ${status}`,
        service
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
  })
);


//reporting routes
// Report a service
router.post(
  "/report-service/:id",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const serviceId = req.params.id;
      const { reason, description } = req.body;
      const userId = req.user._id;

      // Validate input
      if (!reason) {
        return next(new ErrorHandler("Please provide a reason for reporting", 400));
      }

      // Find the service
      const service = await Service.findById(serviceId);
      if (!service) {
        return next(new ErrorHandler("Service not found", 404));
      }

      // Check if user has already reported this service
      const alreadyReported = service.reports && service.reports.some(
        report => report.userId.toString() === userId.toString()
      );

      if (alreadyReported) {
        return next(new ErrorHandler("You have already reported this service", 400));
      }

      // Add the report
      const newReport = {
        userId: userId,
        reason: reason,
        description: description || "",
        reportedAt: Date.now(),
        status: "pending"
      };

      // Add report to service
      service.reports = service.reports || [];
      service.reports.push(newReport);
      service.isReported = true;
      service.reportCount = service.reportCount + 1;

      // If this is the first report, set status to pending if configured to do so
      // Alternatively, you can set a threshold before changing status
      const reportThreshold = 3; // Example threshold
      if (service.reportCount >= reportThreshold && service.status === "approved") {
        service.status = "pending";
        service.moderationFlags = {
          ...service.moderationFlags,
          moderationNotes: `Service reported ${service.reportCount} times by users`
        };
      }

      await service.save();

      // Notify admins of the reported service (you can use the same email mechanism)
    

      res.status(200).json({
        success: true,
        message: "Service reported successfully",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
  })
);

// Admin get reported services
router.get(
  "/admin/reported-services",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const reportedServices = await Service.find({ isReported: true })
        .sort({ reportCount: -1 })
        .populate("shop", "name email");
      
      // Transform services for consistent frontend handling
      const transformedServices = reportedServices.map(service => ({
        ...service.toObject(),
        availability: Object.fromEntries(service.availability || {})
      }));
      
      res.status(200).json({
        success: true,
        services: transformedServices,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
  })
);

// Admin handle reported service
router.put(
  "/admin/handle-report/:id",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const serviceId = req.params.id;
      const { action, adminNotes } = req.body;
      
      if (!["block", "dismiss"].includes(action)) {
        return next(new ErrorHandler("Invalid action. Must be 'block' or 'dismiss'", 400));
      }
      
      const service = await Service.findById(serviceId);
      if (!service) {
        return next(new ErrorHandler("Service not found", 404));
      }
      
      // Handle the reports based on action
      if (action === "block") {
        service.status = "rejected";
        if (!service.moderationFlags) {
          service.moderationFlags = {};
        }
        service.moderationFlags.moderationNotes = adminNotes || "Service blocked after being reported by users";
        service.moderationFlags.moderatedAt = Date.now();
        service.moderationFlags.moderatedBy = req.user._id;
        
        // Mark all reports as reviewed
        if (service.reports && service.reports.length > 0) {
          service.reports.forEach(report => {
            report.status = "reviewed";
            report.reviewedBy = req.user._id;
            report.reviewedAt = Date.now();
          });
        }
        
        // Set isReported to false since it's been handled
        service.isReported = false;
        
        // Notify the seller that their service has been blocked
        await notifySellerServiceBlocked(service, adminNotes);
      } 
      else if (action === "dismiss") {
        // Just dismiss the reports without changing service status
        service.isReported = false;
        service.status = "approved"; // Automatically approve when dismissing reports
        
        if (service.reports && service.reports.length > 0) {
          service.reports.forEach(report => {
            report.status = "dismissed";
            report.reviewedBy = req.user._id;
            report.reviewedAt = Date.now();
          });
        }
        
        if (!service.moderationFlags) {
          service.moderationFlags = {};
        }
        service.moderationFlags.moderationNotes = adminNotes || "Reports reviewed and dismissed by admin";
      }
      
      service.lastModifiedAt = Date.now();
      await service.save();
      
      res.status(200).json({
        success: true,
        message: `Reports ${action === "dismiss" ? "dismissed and service approved" : "accepted and service blocked"}`,
        service: service,
        serviceId: service._id
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
  })
);
// Get report statistics
router.get(
  "/admin/report-stats",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const stats = {
        totalReported: await Service.countDocuments({ isReported: true }),
        pendingReview: await Service.countDocuments({ 
          isReported: true, 
          "reports.status": "pending" 
        }),
        reportDismissed: await Service.countDocuments({ 
          isReported: true, 
          "reports.status": "dismissed" 
        }),
        reportReviewed: await Service.countDocuments({ 
          isReported: true, 
          "reports.status": "reviewed" 
        }),
        recentReports: await Service.find({ isReported: true })
          .sort({ "reports.reportedAt": -1 })
          .limit(5)
          .select('name reportCount reports')
      };
      
      res.status(200).json({
        success: true,
        stats
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
  })
);

// Function to notify admins of reported service
const notifyAdminsOfReportedService = async (service, report) => {
  try {
    // Find all admin users
    const admins = await User.find({ role: "Admin" }).select('email');
    
    if (!admins || admins.length === 0) {
      console.warn("No admin users found to notify about reported service");
      return;
    }
    
    // Get the user who reported
    const reportingUser = await User.findById(report.userId).select('name email');
    const reporterName = reportingUser ? reportingUser.name : "Anonymous User";
    
    const plainTextMessage = `
      A service has been reported by a user:
      
      Service Name: ${service.name}
      Service ID: ${service._id}
      Reported by: ${reporterName}
      Reason: ${report.reason}
      Description: ${report.description || "No additional details provided"}
      
      Total Reports: ${service.reportCount}
      
      Please review this service as soon as possible.
    `;

    const htmlMessage = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Service Reported</title>
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; background-color: #faf7f7; color: #5a4336;">
  <!-- Header with logo area and gradient background -->
  <div style="background-image: linear-gradient(135deg, #c8a4a5 0%, #d48c8f 100%); padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: #ffffff; margin: 0; font-size: 28px; text-shadow: 1px 1px 2px rgba(0,0,0,0.1);">Service Reported</h1>
  </div>
  
  <!-- Main content area with card gradient effect -->
  <div style="padding: 35px 25px; border-left: 1px solid #e6d8d8; border-right: 1px solid #e6d8d8; border-bottom: 1px solid #e6d8d8; background-image: linear-gradient(to bottom, #ffffff, #f5f0f0); border-radius: 0 0 8px 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
    <h2 style="color: #d48c8f; margin-top: 0; font-size: 24px;">Admin Attention Required</h2>
    
    <p style="font-size: 16px; line-height: 1.6; color: #5a4336;">A service has been reported by a user and requires your review.</p>
    
    <!-- Service details section -->
    <div style="margin: 30px 0; padding: 25px; border-radius: 8px; background-image: linear-gradient(to right, #f5f0f0, #e6d8d8);">
      <h3 style="color: #c8a4a5; margin-top: 0; font-size: 20px;">Service Details</h3>
      
      <div style="background-color: #ffffff; border-radius: 6px; padding: 15px; margin-bottom: 10px;">
        <p style="font-size: 16px; line-height: 1.5; color: #5a4336; margin: 5px 0;">
          <strong style="color: #c8a4a5;">Service Name:</strong> ${service.name}
        </p>
      </div>
      
      <div style="background-color: #ffffff; border-radius: 6px; padding: 15px; margin-bottom: 10px;">
        <p style="font-size: 16px; line-height: 1.5; color: #5a4336; margin: 5px 0;">
          <strong style="color: #c8a4a5;">Service ID:</strong> ${service._id}
        </p>
      </div>
      
      <div style="background-color: #ffffff; border-radius: 6px; padding: 15px; margin-bottom: 10px;">
        <p style="font-size: 16px; line-height: 1.5; color: #5a4336; margin: 5px 0;">
          <strong style="color: #c8a4a5;">Total Reports:</strong> <span style="color: #d63031; font-weight: bold;">${service.reportCount}</span>
        </p>
      </div>
    </div>
    
    <!-- Report details section -->
    <div style="margin: 30px 0; padding: 20px; border-radius: 6px; background-color: #f5f0f0; border-left: 4px solid #d63031;">
      <h3 style="color: #d48c8f; margin-top: 0; font-size: 18px;">Report Details</h3>
      
      <div style="background-color: #ffffff; border-radius: 6px; padding: 15px; margin-bottom: 10px;">
        <p style="font-size: 16px; line-height: 1.5; color: #5a4336; margin: 5px 0;">
          <strong style="color: #c8a4a5;">Reported By:</strong> ${reporterName}
        </p>
      </div>
      
      <div style="background-color: #ffffff; border-radius: 6px; padding: 15px; margin-bottom: 10px;">
        <p style="font-size: 16px; line-height: 1.5; color: #5a4336; margin: 5px 0;">
          <strong style="color: #c8a4a5;">Reason:</strong> ${report.reason}
        </p>
      </div>
      
      ${report.description ? `
      <div style="background-color: #ffffff; border-radius: 6px; padding: 15px;">
        <p style="font-size: 16px; line-height: 1.5; color: #5a4336; margin: 5px 0;">
          <strong style="color: #c8a4a5;">Additional Details:</strong> ${report.description}
        </p>
      </div>
      ` : ''}
    </div>
    
    <div style="text-align: center; margin-top: 30px;">
      <a href="#" style="display: inline-block; background-image: linear-gradient(135deg, #c8a4a5 0%, #d48c8f 100%); color: white; text-decoration: none; padding: 12px 30px; border-radius: 6px; font-weight: bold; font-size: 16px; box-shadow: 0 2px 4px rgba(0,0,0,0.15);">Review Service</a>
    </div>
  </div>
  
  <!-- Footer area with soft gradient -->
  <div style="background-image: linear-gradient(to right, #e6d8d8, #c8a4a5); padding: 20px; text-align: center; font-size: 14px; color: #ffffff; border-radius: 0 0 8px 8px; box-shadow: 0 -2px 5px rgba(0,0,0,0.03);">
    <p style="margin: 0 0 10px 0;">© ${new Date().getFullYear()} Your Company Name. All rights reserved.</p>
    <p style="margin: 0;">This is an automated message. Please do not reply to this email.</p>
  </div>
</body>
</html>`;

    // Send notification to all admins
    for (const admin of admins) {
      await sendMail({
        email: admin.email,
        subject: `Service Reported: ${service.name}`,
        message: plainTextMessage,
        html: htmlMessage
      });
    }
    
    console.log(`Service report notification sent to ${admins.length} admins`);
  } catch (error) {
    console.error(`Error sending service report notification: ${error.message}`);
  }
};

// Function to notify seller when their service is blocked after being reported
const notifySellerServiceBlocked = async (service, adminNotes) => {
  // Get the shop information to find the seller's email
  const shop = await Shop.findById(service.shopId);
  
  if (!shop || !shop.email) {
    console.warn(`No email defined for the shop with ID: ${service.shopId}`);
    return;
  }
  
  const plainTextMessage = `
    Dear ${shop.name},
    
    We regret to inform you that your service "${service.name}" has been blocked after being reported by users.
    
    Reason for blocking: ${adminNotes || "Does not meet our platform guidelines or was reported by multiple users"}
    
    If you have any questions or need further clarification, please contact our support team.
    
    Best regards,
    The Admin Team
  `;

  const htmlMessage = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Service Blocked Notice</title>
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; background-color: #faf7f7; color: #5a4336;">
  <!-- Header with logo area and gradient background -->
  <div style="background-image: linear-gradient(135deg, #c8a4a5 0%, #d48c8f 100%); padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: #ffffff; margin: 0; font-size: 28px; text-shadow: 1px 1px 2px rgba(0,0,0,0.1);">Service Blocked</h1>
  </div>
  
  <!-- Main content area with card gradient effect -->
  <div style="padding: 35px 25px; border-left: 1px solid #e6d8d8; border-right: 1px solid #e6d8d8; border-bottom: 1px solid #e6d8d8; background-image: linear-gradient(to bottom, #ffffff, #f5f0f0); border-radius: 0 0 8px 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
    <h2 style="color: #d48c8f; margin-top: 0; font-size: 24px;">Service Blocked Notice</h2>
    
    <p style="font-size: 16px; line-height: 1.6; color: #5a4336;">Dear ${shop.name},</p>
    
    <p style="font-size: 16px; line-height: 1.6; color: #5a4336;">We regret to inform you that your service has been blocked after being reported by users.</p>
    
    <!-- Service details section -->
    <div style="margin: 30px 0; padding: 25px; border-radius: 8px; background-image: linear-gradient(to right, #f5f0f0, #e6d8d8);">
      <h3 style="color: #c8a4a5; margin-top: 0; font-size: 20px;">Service Details</h3>
      
      <div style="background-color: #ffffff; border-radius: 6px; padding: 15px; margin-bottom: 10px;">
        <p style="font-size: 16px; line-height: 1.5; color: #5a4336; margin: 5px 0;">
          <strong style="color: #c8a4a5;">Service Title:</strong> ${service.name}
        </p>
      </div>
      
      <div style="background-color: #ffffff; border-radius: 6px; padding: 15px; margin-bottom: 10px;">
        <p style="font-size: 16px; line-height: 1.5; color: #5a4336; margin: 5px 0;">
          <strong style="color: #c8a4a5;">Service ID:</strong> ${service._id}
        </p>
      </div>
      
      <div style="background-color: #ffffff; border-radius: 6px; padding: 15px;">
        <p style="font-size: 16px; line-height: 1.5; color: #5a4336; margin: 5px 0;">
          <strong style="color: #c8a4a5;">Status:</strong> <span style="color: #d63031; font-weight: bold;">Blocked</span>
        </p>
      </div>
    </div>
    
    <!-- Blocking Reason section -->
    <div style="margin: 30px 0; padding: 20px; border-radius: 6px; background-color: #f5f0f0; border-left: 4px solid #d63031;">
      <h3 style="color: #d48c8f; margin-top: 0; font-size: 18px;">Reason for Blocking</h3>
      <p style="font-size: 16px; line-height: 1.6; color: #5a4336; padding: 10px; background-color: #ffffff; border-radius: 4px;">
        ${adminNotes || "This service was reported by multiple users and after review has been found to violate our platform guidelines."}
      </p>
    </div>
    
    <!-- Next steps section -->
    <div style="margin: 30px 0; padding: 20px; border-radius: 6px; background-color: #f5f0f0; border-left: 4px solid #d48c8f;">
      <h3 style="color: #c8a4a5; margin-top: 0; font-size: 18px;">Next Steps</h3>
      <ul style="font-size: 16px; line-height: 1.6; color: #5a4336; padding-left: 20px;">
        <li>Review our platform guidelines</li>
        <li>Make necessary changes to your service description</li>
        <li>Contact support if you need clarification on the violation</li>
        <li>Submit a new service that meets our guidelines</li>
      </ul>
    </div>
    
    <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e6d8d8; text-align: center;">
      <p style="font-size: 14px; color: #b38d82; margin-bottom: 5px;">If you have any questions, please contact our support team.</p>
    </div>
  </div>
  
  <!-- Footer area with soft gradient -->
  <div style="background-image: linear-gradient(to right, #e6d8d8, #c8a4a5); padding: 20px; text-align: center; font-size: 14px; color: #ffffff; border-radius: 0 0 8px 8px; box-shadow: 0 -2px 5px rgba(0,0,0,0.03);">
    <p style="margin: 0 0 10px 0;">© ${new Date().getFullYear()} Your Company Name. All rights reserved.</p>
    <p style="margin: 0;">This is an automated message. Please do not reply to this email.</p>
  </div>
</body>
</html>`;

  try {
    await sendMail({
      email: shop.email,
      subject: `Service Blocked - ${service.name}`,
      message: plainTextMessage,
      html: htmlMessage
    });
    console.log(`Service blocked notification email sent to seller: ${shop.email}`);
  } catch (error) {
    console.error(`Error sending service blocked notification email: ${error.message}`);
  }
};

module.exports = router;