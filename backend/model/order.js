const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  cart: {
    type: Array,
    required: true,
  },
  shippingAddress: {
    type: Object,
    required: true,
  },
  user: {
    type: Object,
    required: true,
  },
  totalPrice: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    default: "Processing",
  },
  paymentInfo: {
    id: {
      type: String,
    },
    status: {
      type: String,
    },
    type: {
      type: String,
    },
  },
  paidAt: {
    type: Date,
    default: Date.now(),
  },
  deliveredAt: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  universalId: {
    type: String,
    unique: true,
    index: true
  },
  shortId: {
    type: String,
    unique: true,
    index: true
  }
}, { timestamps: true });

// Pre-save hook to generate IDs
orderSchema.pre('save', async function() {
  if (!this.universalId) {
    const date = new Date();
    const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
    const count = await this.constructor.countDocuments();
    
    // Generate universal ID (e.g., "ORD-20240521-0042")
    this.universalId = `ORD-${dateStr}-${(count + 1).toString().padStart(4, '0')}`;
    
    // Generate short ID (e.g., "ORD-0042")
    this.shortId = `ORD-${(count + 1).toString().padStart(4, '0')}`;
  }
});

module.exports = mongoose.model("Order", orderSchema);
