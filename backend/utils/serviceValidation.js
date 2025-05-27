// utils/serviceValidation.js

const Joi = require("joi");

const createServiceValidationSchema = Joi.object({
  name: Joi.string().min(3).max(100).required().messages({
    "string.empty": "Name is required.",
    "string.min": "Name should have at least 3 characters.",
    "string.max": "Name should not exceed 100 characters.",
  }),
  description: Joi.string().min(5).max(500).required().messages({
    "string.empty": "Description is required.",
    "string.min": "Description should have at least 5 characters.",
    "string.max": "Description should not exceed 500 characters.",
  }),
  location: Joi.string().required().messages({
    "string.empty": "Location is required.",
  }),
  contactInfo: Joi.string()
    .pattern(/^03[0-9]{2}-[0-9]{7}$/)
    .required()
    .messages({
      "string.empty": "Contact info is required.",
      "string.pattern.base": "Invalid Pakistani mobile number. Must be in format: 03XX-XXXXXXX",
    }),
  availability: Joi.object()
    .pattern(
      Joi.string(),
      Joi.object({
        startTime: Joi.string().required(),
        endTime: Joi.string().required(),
        available: Joi.boolean().required(),
      })
    )
    .custom((value, helpers) => {
      // Check if at least one day is available
      const hasAvailableDay = Object.values(value).some(day => day.available);
      if (!hasAvailableDay) {
        return helpers.error('availability.noDays');
      }
      return value;
    })
    .messages({
      'availability.noDays': 'At least one day must be selected as available',
    }),
  shopId: Joi.string().required().messages({
    "string.empty": "Shop ID is required.",
  }),
  // Modified to handle simplified approach
  category: Joi.alternatives().conditional('isCustomName', {
    is: true,
    then: Joi.any().optional(), // If custom name, category is optional
    otherwise: Joi.string().optional() // If not custom name, category is required (will be selected from dropdown)
  }),
  isCustomName: Joi.boolean().default(false),
  shop: Joi.object().optional(),
});

// For update operations
const updateServiceValidationSchema = Joi.object({
  name: Joi.string().min(3).max(100).optional().messages({
    "string.min": "Name should have at least 3 characters.",
    "string.max": "Name should not exceed 100 characters.",
  }),
  description: Joi.string().min(5).max(500).optional().messages({
    "string.min": "Description should have at least 5 characters.",
    "string.max": "Description should not exceed 500 characters.",
  }),
  location: Joi.string().optional(),
  contactInfo: Joi.string()
    .pattern(/^03[0-9]{2}-[0-9]{7}$/)
    .optional()
    .messages({
      "string.pattern.base": "Invalid Pakistani mobile number. Must be in format: 03XX-XXXXXXX",
    }),
  availability: Joi.object()
    .pattern(
      Joi.string(),
      Joi.object({
        startTime: Joi.string().optional(),
        endTime: Joi.string().optional(),
        available: Joi.boolean().optional(),
        _id: Joi.string().optional(),
      })
    )
    .custom((value, helpers) => {
      // Check if at least one day is available
      const hasAvailableDay = Object.values(value).some(day => day.available);
      if (!hasAvailableDay) {
        return helpers.error('availability.noDays');
      }
      return value;
    })
    .messages({
      'availability.noDays': 'At least one day must be selected as available',
    })
    .optional(),
  shopId: Joi.string().optional(),
  // Modified to handle simplified approach for updates
  category: Joi.alternatives().conditional('isCustomName', {
    is: true,
    then: Joi.any().optional(),
    otherwise: Joi.string().optional()
  }),
  isCustomName: Joi.boolean().optional(),
  shop: Joi.object().optional(),
});

module.exports = { createServiceValidationSchema, updateServiceValidationSchema };