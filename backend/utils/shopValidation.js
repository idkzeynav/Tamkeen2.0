// utils/shopValidation.js
const Joi = require("joi");

const createShopValidationSchema = Joi.object({
  name: Joi.string().min(3).max(100).required().messages({
    "string.empty": "Shop name is required.",
    "string.min": "Shop name should have at least 3 characters.",
    "string.max": "Shop name should not exceed 100 characters.",
  }),
  email: Joi.string().email().required().messages({
    "string.empty": "Email is required.",
    "string.email": "Please enter a valid email address.",
  }),
  password: Joi.string().min(6).required().messages({
    "string.empty": "Password is required.",
    "string.min": "Password should have at least 6 characters.",
  }),
  phoneNumber: Joi.string()
    .pattern(/^(\+92|0092|92|0)?3[0-9]{2}[0-9]{7}$/)
    .required()
    .messages({
      "string.empty": "Phone number is required.",
      "string.pattern.base": "Please enter a valid Pakistani mobile number (e.g., 03001234567, +923001234567, or 923001234567).",
    }),
  address: Joi.string().min(5).required().messages({
    "string.empty": "Address is required.",
    "string.min": "Address should have at least 5 characters.",
  }),
  zipCode: Joi.string().min(4).required().messages({
    "string.empty": "Zip code is required.",
    "string.min": "Zip code should have at least 4 characters.",
  }),
  region: Joi.string().min(2).required().messages({
    "string.empty": "Region is required.",
    "string.min": "Region should have at least 2 characters.",
  }),
  area: Joi.string().min(2).required().messages({
    "string.empty": "Area is required.",
    "string.min": "Area should have at least 2 characters.",
  }),
});

module.exports = { createShopValidationSchema };