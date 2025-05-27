const mongoose = require("mongoose");
const serviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter your service name!"],
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ServiceCategory",
  },
  isCustomName: {
    type: Boolean,
    default: false,
  },
  description: {
    type: String,
    required: [true, "Please enter your service description!"],
  },
  location: {
    type: String,
    required: [true, "Please enter the service location!"],
  },
  contactInfo: {
    type: String,
    required: [true, "Please enter the contact information!"],
  },
  availability: {
    type: Map,
    of: {
      startTime: String,
      endTime: String,
      available: Boolean,
    },
    default: {},
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  shopId: {
    type: String,
    required: true,
  },
  shop: {
    type: Object,
    required: true,
  },
  // New fields for content moderation
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "approved" // Default to approved, will be changed to pending if content is flagged
  },
  moderationFlags: {
    type: Object,
    default: {
      isAbusive: false,
      isGibberish: false,
      flaggedFields: [],
      moderationNotes: ""
    }
  },
  lastModifiedAt: {
    type: Date,
    default: Date.now()
  }
   ,
  // New fields for service reporting functionality
  reports: [{
    userId: {
      type: String,
      required: true
    },
    reason: {
      type: String,
      required: true
    },
    description: {
      type: String,
      default: ""
    },
    reportedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ["pending", "reviewed", "dismissed"],
      default: "pending"
    },
    reviewedBy: {
      type: String,
      default: null
    },
    reviewedAt: {
      type: Date,
      default: null
    }
  }],
  isReported: {
    type: Boolean,
    default: false
  },
  reportCount: {
    type: Number,
    default: 0
  }

});

module.exports = mongoose.model("Service", serviceSchema);