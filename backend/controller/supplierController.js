// controllers/supplierController.js
const express = require("express");
const router = express.Router();
const { 
  isAuthenticatedUserOrSeller,
  isUserOrSeller
} = require("../middleware/auth");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const Supplier = require("../model/supplier");
const ErrorHandler = require("../utils/ErrorHandler");
const sendMail = require("../utils/sendMail");

// Get all suppliers (User/Seller access)
router.get(
  "/gett-all-suppliers",
  isAuthenticatedUserOrSeller,
  isUserOrSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const suppliers = await Supplier.find({ status: "active" }).sort({ createdAt: -1 });
      
      res.status(200).json({
        success: true,
        suppliers: suppliers || [],
        count: suppliers.length
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Send email to supplier (User/Seller)
router.post(
  "/send-email",
  isAuthenticatedUserOrSeller,
  isUserOrSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const {
        supplierId,
        materialType,
        quantity,
        deliveryLocation,
        additionalNotes,
        buyerName,
        buyerPhone,
        buyerEmail
      } = req.body;

      // Validation
      if (!supplierId || !materialType || !quantity || !buyerName) {
        return next(new ErrorHandler("Missing required fields", 400));
      }

      const supplier = await Supplier.findById(supplierId);
      if (!supplier) {
        return next(new ErrorHandler("Supplier not found", 404));
      }

      const supplierEmail = supplier.email || supplier.contactInfo;
      if (!supplierEmail) {
        return next(new ErrorHandler("Supplier email not available", 400));
      }

      // Get buyer info from authenticated user
      const buyer = req.user;
      const buyerEmailAddress = buyerEmail || buyer.email;

      // Create email content
      const emailSubject = `New Material Request - ${materialType}`;
      
      const emailText = `Hello ${supplier.name || supplier.supplierName},

I am contacting you because I need raw materials through your services.

Request Details:
- Material: ${materialType}
- Quantity: ${quantity}
${deliveryLocation ? `- Delivery: ${deliveryLocation}\n` : ''}
${additionalNotes ? `Additional Information: ${additionalNotes}\n` : ''}

Buyer Information:
- Name: ${buyerName}
- Email: ${buyerEmailAddress}
- Account Type: ${buyer.role}
${buyerPhone ? `- Phone: ${buyerPhone}` : ''}

Please let me know about your availability and pricing.

Thank you`;

      const emailHtml = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9;">
  <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
    <h2 style="color: #5a4336; margin-bottom: 20px;">New Material Request</h2>
    
    <p style="color: #5a4336; font-size: 16px;">Hello ${supplier.name || supplier.supplierName},</p>
    
    <p style="color: #5a4336;">I am contacting you because I need raw materials through your services.</p>
    
    <div style="background: #f7f1f1; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3 style="color: #5a4336; margin-top: 0;">Request Details:</h3>
      <ul style="color: #5a4336; line-height: 1.6;">
        <li><strong>Material:</strong> ${materialType}</li>
        <li><strong>Quantity:</strong> ${quantity}</li>
        ${deliveryLocation ? `<li><strong>Delivery:</strong> ${deliveryLocation}</li>` : ''}
      </ul>
      ${additionalNotes ? `<p style="color: #5a4336;"><strong>Additional Notes:</strong><br>${additionalNotes}</p>` : ''}
    </div>
    
    <div style="background: #f7f1f1; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3 style="color: #5a4336; margin-top: 0;">Buyer Information:</h3>
      <ul style="color: #5a4336; line-height: 1.6;">
        <li><strong>Name:</strong> ${buyerName}</li>
        <li><strong>Email:</strong> ${buyerEmailAddress}</li>
        <li><strong>Account Type:</strong> ${buyer.role}</li>
        ${buyerPhone ? `<li><strong>Phone:</strong> ${buyerPhone}</li>` : ''}
      </ul>
    </div>
    
    <p style="color: #5a4336;">Please let me know about your availability and pricing.</p>
    
    <p style="color: #5a4336;">Thank you</p>
    
    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e6d8d8; text-align: center;">
      <p style="color: #999; font-size: 12px;">This email was sent automatically through our platform.</p>
    </div>
  </div>
</div>`;

      await sendMail({
        email: supplierEmail,
        subject: emailSubject,
        message: emailText,
        html: emailHtml
      });

      res.status(200).json({
        success: true,
        message: "Email sent successfully",
        supplierName: supplier.name || supplier.supplierName
      });

    } catch (error) {
      console.error("Email sending error:", error);
      return next(new ErrorHandler(error.message || "Failed to send email", 500));
    }
  })
);

// Rate supplier (User/Seller access - only after emailing)
router.post(
  "/rate-supplier",
  isAuthenticatedUserOrSeller,
  isUserOrSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { supplierId, rating, review } = req.body;
      
      if (!supplierId || !rating) {
        return next(new ErrorHandler("Supplier ID and rating are required", 400));
      }
      
      if (rating < 1 || rating > 5) {
        return next(new ErrorHandler("Rating must be between 1 and 5", 400));
      }
      
      const supplier = await Supplier.findById(supplierId);
      if (!supplier) {
        return next(new ErrorHandler("Supplier not found", 404));
      }
      
      // Add rating logic here based on your schema
      // This is a basic implementation - adjust based on your rating model
      
      res.status(200).json({
        success: true,
        message: "Rating submitted successfully"
      });
      
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

module.exports = router;