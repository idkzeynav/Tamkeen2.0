const Joi = require('joi');

// Create bulk order validation schema
const bulkOrderSchema = Joi.object({
  userId: Joi.string().required().messages({
    'string.empty': 'User ID is required',
    'any.required': 'User ID is required'
  }),
  productName: Joi.string().required().trim().messages({
    'string.empty': 'Please enter the product name',
    'any.required': 'Product name is required'
  }),
  description: Joi.string().required().trim().messages({
    'string.empty': 'Please enter the product description',
    'any.required': 'Product description is required'
  }),
  quantity: Joi.number().integer().min(10).required().messages({
    'number.base': 'Quantity must be a number',
    'number.integer': 'Quantity must be an integer',
    'number.min': 'Quantity must be at least 10 units',
    'any.required': 'Quantity is required'
  }),
  category: Joi.string().required().trim().messages({
    'string.empty': 'Please enter the product category',
    'any.required': 'Product category is required'
  }),
  budget: Joi.number().positive().required().messages({
    'number.base': 'Budget must be a number',
    'number.positive': 'Budget must be positive',
    'any.required': 'Budget is required'
  }),
  deliveryDeadline: Joi.date().greater('now').required().messages({
    'date.base': 'Delivery deadline must be a valid date',
    'date.greater': 'Delivery deadline must be in the future',
    'any.required': 'Delivery deadline is required'
  }),
  shippingAddress: Joi.string().required().trim().messages({
    'string.empty': 'Please enter the shipping address',
    'any.required': 'Shipping address is required'
  }),
  packagingRequirements: Joi.string().allow('').optional(),
  supplierLocationPreference: Joi.string().allow('').optional()
});

module.exports = {
  bulkOrderSchema
};