const mongoose = require('mongoose');

// Define the reply schema
const replySchema = new mongoose.Schema({
  content: String,
  votes: { type: Number, default: 0 },
  // replies: [/* recursive definition handled below */],
  replies: [this],
  name: { type: String },
  createdAt: { type: Date, default: Date.now },
});

// Add the recursive reference after schema definition
replySchema.add({ replies: [replySchema] });

// Define the forum post schema
const forumPostSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  name: { type: String, required: true },
  votes: { type: Number, default: 0 },
  replies: [replySchema], // Use the nested reply schema
  createdAt: { type: Date, default: Date.now },
  flags: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reason: String,
    flaggedAt: { type: Date, default: Date.now }
  }],
  isFlagged: { type: Boolean, default: false }
});

// Create and export the ForumPost model
const ForumPost = mongoose.model('ForumPost', forumPostSchema);
module.exports = ForumPost;
