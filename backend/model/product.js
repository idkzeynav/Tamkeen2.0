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

// Pre-save hook to generate universal ID
productSchema.pre('save', async function() {
  if (!this.universalId) {
    const date = new Date();
    const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
    const count = await this.constructor.countDocuments();
    
    // Generate universal ID (e.g., "PROD-20240521-0042")
    this.universalId = `PROD-${dateStr}-${(count + 1).toString().padStart(4, '0')}`;
  }
});

module.exports = mongoose.model("Product", productSchema);
