// models/serviceCategory.js
const mongoose = require("mongoose");

const serviceCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter category name!"],
    unique: true,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = mongoose.model("ServiceCategory", serviceCategorySchema);