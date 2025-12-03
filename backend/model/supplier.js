// model/supplier.js
const mongoose = require("mongoose");

const supplierSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Supplier name is required"],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please enter a valid email"]
  },
 phone: {
  type: String,
  required: [true, "Phone number is required"],
  validate: {
    validator: function(v) {
      return /^(\+92[3][0-5]\d{8}|051\d{7,8})$/.test(v);
    },
    message: props => `Invalid phone format. Use +923XXXXXXXXX for mobile or 051XXXXXXX for PTCL.`
  }
},
  address: {
    type: String,
    required: [true, "Area/Address is required"],
    trim: true,
  },
  coordinates: {
    latitude: {
      type: Number,
      required: [true, "Latitude is required"],
      min: [-90, "Invalid latitude"],
      max: [90, "Invalid latitude"]
    },
    longitude: {
      type: Number,
      required: [true, "Longitude is required"],
      min: [-180, "Invalid longitude"],
      max: [180, "Invalid longitude"]
    }
  },
  materials: [{
    category: {
      type: String,
      required: true,
      enum: [
        'Clothing and Textiles',
        'Electronics',
        'Groceries and Food Items',
        'Household Items',
        'Jewelry and Accessories',
        'Miscellaneous'
      ]
    },
    subcategories: [String], // e.g., ["Cotton Fabric", "Silk", "Wool"]
    priceRange: {
      min: Number,
      max: Number,
      unit: String // e.g., "per kg", "per meter", "per piece"
    },
    bulkDiscount: {
      minQuantity: Number,
      discountPercentage: Number
    }
  }],
  businessHours: {
    monday: { open: String, close: String, closed: { type: Boolean, default: false } },
    tuesday: { open: String, close: String, closed: { type: Boolean, default: false } },
    wednesday: { open: String, close: String, closed: { type: Boolean, default: false } },
    thursday: { open: String, close: String, closed: { type: Boolean, default: false } },
    friday: { open: String, close: String, closed: { type: Boolean, default: false } },
    saturday: { open: String, close: String, closed: { type: Boolean, default: false } },
    sunday: { open: String, close: String, closed: { type: Boolean, default: false } }
  },
  description: {
    type: String,
    maxlength: [500, "Description cannot exceed 500 characters"]
  },
  minimumOrder: {
    quantity: Number,
    unit: String
  },
  rating: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 }
  },
  reviews: [{
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationDate: Date,
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  status: {
    type: String,
    enum: ["active", "inactive", "pending_verification", "suspended"],
    default: "active"
  },
  tags: [String], // e.g., ["Wholesale", "Bulk Orders", "Quality Certified"]
  socialMedia: {
    facebook: String,
    whatsapp: String,
    instagram: String
  },
  images: [String], // URLs to supplier photos/certificates
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for geospatial queries
supplierSchema.index({ "coordinates.latitude": 1, "coordinates.longitude": 1 });

// Index for text search
supplierSchema.index({ 
  name: "text", 
  description: "text", 
  "materials.subcategories": "text" 
});

// Method to calculate average rating
supplierSchema.methods.calculateAverageRating = function() {
  if (this.reviews.length === 0) {
    this.rating.average = 0;
    this.rating.count = 0;
  } else {
    const sum = this.reviews.reduce((acc, review) => acc + review.rating, 0);
    this.rating.average = (sum / this.reviews.length).toFixed(1);
    this.rating.count = this.reviews.length;
  }
  return this.save();
};

// Pre-save middleware to update lastUpdated
supplierSchema.pre('save', function(next) {
  this.lastUpdated = new Date();
  next();
});

module.exports = mongoose.model("Supplier", supplierSchema);