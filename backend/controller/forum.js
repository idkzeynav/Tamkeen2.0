const express = require('express');
const router = express.Router();
const ForumPost = require('../model/forumPost');
const hateSpeechCheck = require('../middleware/hateSpeechCheck');
const { isAuthenticated, isAdmin } = require('../middleware/auth');
const mongoose = require('mongoose');

// Get all posts
router.get('/posts', async (req, res) => {
  try {
    const posts = await ForumPost.find().sort({ votes: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

// Create a new post
router.post('/posts', hateSpeechCheck(), async (req, res) => {
  const { title, content, name } = req.body;

  if (!title || !content || !name) {
    return res.status(400).json({ error: 'Title, content, and name are required' });
  }

  try {
    const newPost = new ForumPost({ title, content, name });
    await newPost.save();
    res.json(newPost);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// Vote on a post
router.post('/posts/:postId/vote', async (req, res) => {
  const { postId } = req.params;
  const { voteType } = req.body;
  try {
    const post = await ForumPost.findById(postId);
    if (voteType === 'upvote') {
      post.votes += 1;
    } else if (voteType === 'downvote') {
      post.votes -= 1;
    }
    await post.save();
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: 'Failed to vote on post' });
  }
});

// Add a reply to a post
router.post('/posts/:postId/reply', hateSpeechCheck(), async (req, res) => {
  const { postId } = req.params;
  const { content, name } = req.body;

  try {
    const post = await ForumPost.findById(postId);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    post.replies.push({ content, name }); // Include the authenticated user's name
    await post.save();
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add reply' });
  }
});

router.get('/posts/:postId', async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch post' });
  }
});

router.post('/posts/:postId/replies/:replyId/vote', async (req, res) => {
  const { postId, replyId } = req.params;
  const { voteType } = req.body;

  try {
    const post = await ForumPost.findById(postId);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const reply = post.replies.id(replyId);
    if (!reply) {
      return res.status(404).json({ error: 'Reply not found' });
    }

    if (voteType === 'upvote') {
      reply.votes += 1;
    } else if (voteType === 'downvote') {
      reply.votes -= 1;
    }

    await post.save();
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: 'Failed to vote on reply' });
  }
});

router.post('/posts/:postId/replies/:replyId/reply', hateSpeechCheck(), async (req, res) => {
  const { postId, replyId } = req.params;
  const { content , name } = req.body; //yeh name nahi tha toh check in reply if ussue remove

  try {
    const post = await ForumPost.findById(postId);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const parentReply = post.replies.id(replyId);
    if (!parentReply) {
      return res.status(404).json({ error: 'Reply not found' });
    }

    parentReply.replies.push({ content , name });
    await post.save();
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add nested reply' });
  }
});

router.post('/posts/:postId/replies/:replyId/vote', async (req, res) => {
  const { postId, replyId } = req.params;
  const { voteType } = req.body;

  try {
    const post = await ForumPost.findById(postId);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const reply = post.replies.id(replyId);
    if (!reply) {
      return res.status(404).json({ error: 'Reply not found' });
    }

    if (voteType === 'upvote') {
      reply.votes += 1;
    } else if (voteType === 'downvote') {
      reply.votes -= 1;
    }

    await post.save();
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: 'Failed to vote on reply' });
  }
});

///flagging posts
router.post('/posts/:postId/flag', isAuthenticated, async (req, res) => {
  try {
    const { postId } = req.params;
    const { reason } = req.body;
    const userId = req.user._id;
    
    // Validate input
    if (!reason || reason.trim() === '') {
      return res.status(400).json({ 
        success: false, 
        error: 'Please provide a reason for flagging this post'
      });
    }
    
    // Find the post
    const post = await ForumPost.findById(postId);
    if (!post) {
      return res.status(404).json({ 
        success: false, 
        error: 'Post not found'
      });
    }
    
    // Add the flag (simplified - no duplicate check)
    post.flags.push({
      user: userId,
      reason: reason.trim(),
      flaggedAt: new Date()
    });
    
    // Set the post as flagged
    post.isFlagged = true;
    
    // Save the post
    await post.save();
    
    res.status(200).json({
      success: true,
      message: 'Post has been flagged for review'
    });
    
  } catch (err) {
    console.error('Flag post error:', err);
    res.status(500).json({ 
      success: false,
      error: 'Failed to flag post. Please try again.'
    });
  }
});


//admin flagged posts  (del this shayid)
router.get('/admin/flagged-posts', isAuthenticated, isAdmin('Admin'), async (req, res) => {
  try {
    const flaggedPosts = await ForumPost.find({ isFlagged: true })
      .populate({
        path: 'flags.user',
        select: 'name email'
      })
      .sort({ createdAt: -1 });
    
    res.status(200).json(flaggedPosts);
  } catch (err) {
    res.status(500).json({ 
      success: false,
      error: 'Failed to retrieve flagged posts'
    });
  }
});

// Approve post and remove flag - admin only
router.post('/admin/flagged-posts/:id/approve', isAuthenticated, isAdmin('Admin'), async (req, res) => {
  try {
    const postId = req.params.id;
    
    // Find and update the post to remove flagged status
    const post = await ForumPost.findById(postId);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        error: "Post not found"
      });
    }
    
    // Update the post to remove flags
    post.isFlagged = false;
    post.flags = []; // Clear all flags
    await post.save();
    
    res.status(200).json({
      success: true,
      message: "Post has been approved and flags have been removed"
    });
    
  } catch (err) {
    res.status(500).json({ 
      success: false,
      error: 'Failed to approve post'
    });
  }
});

// Admin route: Remove flagged post
router.delete('/admin/flagged-posts/:id', isAuthenticated, isAdmin('Admin'), async (req, res) => {
  try {
    const postId = req.params.id;
    
    // Find and delete the post
    const post = await ForumPost.findById(postId);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        error: "Post not found"
      });
    }
    
    // Delete the post
    await ForumPost.findByIdAndDelete(postId);
    
    res.status(200).json({
      success: true,
      message: "Post has been removed"
    });
    
  } catch (err) {
    res.status(500).json({ 
      success: false,
      error: 'Failed to remove post'
    });
  }
});


module.exports = router; // Export the router