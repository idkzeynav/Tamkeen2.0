const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter your product name!"],
  },
  description: {
    type: String,
    required: [true, "Please enter your product description!"],
  },
  category: {
    type: String,
    required: [true, "Please enter your product category!"],
  },
  tags: {
    type: String,
  },
  originalPrice: {
    type: Number,
    required: [true, "Please enter your product original price!"],
  },
  discountPrice: {
    type: Number,
    default: 0, 
  },
  stock: {
    type: Number,
    required: [true, "Please enter your product stock!"],
  },
  images: [
    {
      type: String,
      required: [true, "Please enter your product image"],
    },
  ],
  reviews: [
    {
      user: {
        type: Object,
      },
      rating: {
        type: Number,
      },
      comment: {
        type: String,
      },
      productId: {
        type: String,
      },
      createdAt: {
        type: Date,
        default: Date.now(),
      },
    },
  ],
  ratings: {
    type: Number,
  },
  shopId: {
    type: String,
    required: true,
  },
  shop: {
    type: Object,
    required: true,
  },
  sold_out: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  universalId: {
    type: String,
    unique: true,
    index: true
  }
}, { timestamps: true });

// OPTION 1: Using MongoDB's ObjectId + timestamp (Recommended)
productSchema.pre('save', async function() {
  if (!this.universalId) {
    const date = new Date();
    const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
    const timeStr = Date.now().toString().slice(-6); // Last 6 digits of timestamp
    const objectIdStr = this._id.toString().slice(-4); // Last 4 chars of ObjectId
    
    // Generate universal ID (e.g., "PROD-20240521-123456-a1b2")
    this.universalId = `PROD-${dateStr}-${timeStr}-${objectIdStr}`;
  }
});

// OPTION 2: Using findOneAndUpdate with retry logic (Alternative)
/*
productSchema.pre('save', async function() {
  if (!this.universalId) {
    const maxRetries = 5;
    let retries = 0;
    
    while (retries < maxRetries) {
      try {
        const date = new Date();
        const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
        const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        
        this.universalId = `PROD-${dateStr}-${randomNum}`;
        
        // Check if this ID already exists
        const existing = await this.constructor.findOne({ universalId: this.universalId });
        if (!existing) {
          break; // ID is unique, we can use it
        }
        
        retries++;
      } catch (error) {
        retries++;
        if (retries >= maxRetries) {
          throw new Error('Failed to generate unique universal ID after multiple attempts');
        }
      }
    }
  }
});
*/

module.exports = mongoose.model("Product", productSchema);