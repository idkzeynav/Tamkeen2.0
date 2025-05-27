const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const shopSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter your shop name!"],
  },
  email: {
    type: String,
    required: [true, "Please enter your shop email address"],
  },
  password: {
    type: String,
    required: function() {
      // Password only required if no googleId (not OAuth signup)
      return !this.googleId;
    },
    minLength: [6, "Password should be greater than 6 characters"],
    select: false,
  },
  description: {
    type: String,
  },
  region: {
    type: String,
    required: function() {
      // Only required for non-OAuth signups
      return !this.googleId;
    },
  },
  area: {
    type: String,
    required: function() {
      // Only required for non-OAuth signups
      return !this.googleId;
    },
  },
  address: {
    type: String,
    required: function() {
      // Only required for non-OAuth signups
      return !this.googleId;
    },
  },
  phoneNumber: {
    type: Number,
    required: function() {
      // Only required for non-OAuth signups
      return !this.googleId;
    },
  },
  role: {
    type: String,
    default: "Seller",
  },
  avatar: {
    type: String,
    required: function() {
      // Only required for non-OAuth signups
      return !this.googleId;
    },
  },
  zipCode: {
    type: Number,
    required: function() {
      // Only required for non-OAuth signups
      return !this.googleId;
    },
  },
  // Add Google OAuth fields
  googleId: {
    type: String,
  },
  
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  resetPasswordToken: String,
  resetPasswordTime: Date,
  // Add this new field
  universalId: {
    type: String,
    unique: true,
    index: true
  },

  isActive: {
    type: Boolean,
    default: false,
  },
  activationToken: String,
  activationTokenExpires: Date,
}, { timestamps: true });

// Pre-save hook to generate universal ID
shopSchema.pre('save', async function() {
  if (!this.universalId) {
    const date = new Date();
    const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
    const count = await this.constructor.countDocuments();
    
    // Generate universal ID (e.g., "SHOP-20240521-0042")
    this.universalId = `SHOP-${dateStr}-${(count + 1).toString().padStart(4, '0')}`;
  }
});

// Hash password only if it exists
shopSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) {
    next();
  }
  this.password = await bcrypt.hash(this.password, 10);
});

// jwt token
shopSchema.methods.getJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRES,
  });
};

// compare password
shopSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("Shop", shopSchema);