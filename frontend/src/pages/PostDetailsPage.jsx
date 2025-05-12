import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { server } from '../server';
import Header from '../components/Layout/Header';
import Footer from '../components/Layout/Footer';
import { useSelector } from 'react-redux';
import { 
  ArrowUp, 
  ArrowDown, 
  MessageSquare,
  Send
} from 'lucide-react';

// Color Scheme
const colors = {
  primary: '#c8a4a5', // Soft pink
  secondary: '#e6d8d8', // Light baby brown
  tertiary: '#f5f0f0', // Off-white
  light: '#faf7f7', // Very light background
  white: '#ffffff', // Pure white
  dark: '#5a4336', // Dark brown for text
  border: '#ebebeb', // Light border color
};

const PostDetailsPage = () => {
  const { postId } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [replyContent, setReplyContent] = useState('');
  const [nestedReplyContent, setNestedReplyContent] = useState({});
  const [activeReplyId, setActiveReplyId] = useState(null);
  const navigate = useNavigate();

  // Get the authenticated user's name from Redux
  const { user } = useSelector((state) => state.user);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await axios.get(`${server}/forum/posts/${postId}`);
        setPost(res.data);
      } catch (err) {
        setError('Failed to fetch post.');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [postId]);

  const handleVote = async (postId, voteType) => {
    try {
      await axios.post(`${server}/forum/posts/${postId}/vote`, { voteType });
      const updatedPost = { ...post, votes: post.votes + (voteType === 'upvote' ? 1 : -1) };
      setPost(updatedPost);
    } catch (err) {
      setError('Failed to vote.');
    }
  };

  const handleReplyVote = async (replyId, voteType) => {
    try {
      const res = await axios.post(
        `${server}/forum/posts/${postId}/replies/${replyId}/vote`,
        { voteType }
      );
      setPost(res.data);
    } catch (err) {
      setError('Failed to vote on reply.');
    }
  };

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${server}/forum/posts/${postId}/reply`, {
        content: replyContent,
        name: user.name,
      });
      setPost(res.data);
      setReplyContent('');
    } catch (err) {
      setError('Failed to add reply.');
    }
  };

  const handleNestedReplySubmit = async (replyId, e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        `${server}/forum/posts/${postId}/replies/${replyId}/reply`,
        { content: nestedReplyContent[replyId], name: user.name }
      );
      setPost(res.data);
      setNestedReplyContent({ ...nestedReplyContent, [replyId]: '' });
      setActiveReplyId(null);
    } catch (err) {
      setError('Failed to add nested reply.');
    }
  };

  const toggleNestedReplyForm = (replyId) => {
    setActiveReplyId(activeReplyId === replyId ? null : replyId);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.light }}>
      <div className="text-lg" style={{ color: colors.primary }}>Loading...</div>
    </div>
  );
  
  if (error) return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.light }}>
      <div className="p-4">
        <p>{error}</p>
        <button 
          onClick={() => navigate('/forum')} 
          className="mt-2 text-sm underline"
          style={{ color: colors.primary }}
        >
          Return to Forum
        </button>
      </div>
    </div>
  );

  // Format date if post has a createdAt property
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Recursive function to render nested replies with minimal styling
  const renderReplies = (replies, level = 0) => {
    return replies.map((reply) => (
      <div 
        key={reply._id} 
        className={`ml-${Math.min(level * 6, 12)} border-l-2 pl-4 py-4`}
        style={{ 
          borderColor: colors.primary,
          borderLeftWidth: '2px'
        }}
      >
        <div className="flex">
          {/* Vote Column */}
          <div className="flex flex-col items-center mr-4">
            <button onClick={() => handleReplyVote(reply._id, 'upvote')} className="text-gray-400 hover:text-gray-600">
              <ArrowUp size={16} />
            </button>
            <span className="my-1 text-sm">{reply.votes}</span>
            <button onClick={() => handleReplyVote(reply._id, 'downvote')} className="text-gray-400 hover:text-gray-600">
              <ArrowDown size={16} />
            </button>
          </div>

          {/* Content Column */}
          <div className="flex-1">
            <div className="flex items-center mb-1">
              <span className="text-sm font-medium" style={{ color: colors.primary }}>{reply.name}</span>
              {reply.createdAt && (
                <span className="text-xs text-gray-400 ml-2">
                  • {formatDate(reply.createdAt)}
                </span>
              )}
            </div>
            
            <p className="text-sm mb-2" style={{ color: colors.dark }}>
              {reply.content}
            </p>
            
            {/* Cute Reply Button from Previous Version */}
            <button
              onClick={() => toggleNestedReplyForm(reply._id)}
              className="text-xs flex items-center gap-1 hover:underline"
              style={{ color: colors.primary }}
            >
              <MessageSquare size={14} />
              Reply
            </button>

            {/* Nested Reply Form */}
            {activeReplyId === reply._id && (
              <form 
                onSubmit={(e) => handleNestedReplySubmit(reply._id, e)} 
                className="mt-3"
              >
                <textarea
                  value={nestedReplyContent[reply._id] || ''}
                  onChange={(e) =>
                    setNestedReplyContent({
                      ...nestedReplyContent,
                      [reply._id]: e.target.value,
                    })
                  }
                  placeholder="Write a reply..."
                  className="w-full p-2 text-sm border rounded focus:outline-none"
                  style={{ 
                    borderColor: colors.border,
                    backgroundColor: colors.tertiary
                  }}
                  required
                ></textarea>
                <div className="flex justify-end mt-2">
                  <button
                    type="button"
                    onClick={() => setActiveReplyId(null)}
                    className="mr-2 py-1 px-3 text-xs rounded"
                    style={{ color: colors.dark }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="py-1 px-3 text-xs text-white rounded flex items-center gap-1"
                    style={{ backgroundColor: colors.primary }}
                  >
                    <Send size={12} />
                    Submit
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Render nested replies recursively */}
        {reply.replies && reply.replies.length > 0 && (
          <div className="mt-3">
            {renderReplies(reply.replies, level + 1)}
          </div>
        )}
      </div>
    ));
  };

  return (
    <>
      <Header activeHeading={7} />
      <div className="min-h-screen py-8" style={{ backgroundColor: colors.light }}>
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Main Post */}
          <div className="bg-white rounded-xl shadow-md mb-6" style={{ borderColor: colors.border }}>
            <div className="p-6">
              <h2 
                className="text-xl font-medium mb-2"
                style={{ color: colors.dark }}
              >
                {post.title}
              </h2>
              
              <div className="text-sm mb-4" style={{ color: colors.primary }}>
                {post.name} • {formatDate(post.createdAt || new Date())}
              </div>
              
              <div className="mb-4 text-sm" style={{ color: colors.dark }}>
                <p>{post.content}</p>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleVote(post._id, 'upvote')}
                  className="flex items-center px-2 py-1 rounded hover:bg-gray-100"
                  style={{ color: 'gray' }}
                >
                  <ArrowUp size={16} />
                  <span className="ml-1">{post.votes}</span>
                </button>
                <button
                  onClick={() => handleVote(post._id, 'downvote')}
                  className="px-2 py-1 rounded hover:bg-gray-100"
                  style={{ color: 'gray' }}
                >
                  <ArrowDown size={16} />
                </button>
              </div>
            </div>
          </div>
          
          {/* Replies Section */}
          <div className="mb-6">
            <div className="flex items-center mb-4">
              <MessageSquare size={16} style={{ color: colors.primary }} />
              <h3 className="ml-2 text-lg font-medium" style={{ color: colors.dark }}>
                Replies ({post.replies.length})
              </h3>
            </div>
            
            {post.replies.length === 0 ? (
              <div className="bg-white p-4 rounded-xl shadow-md" style={{ borderColor: colors.border }}>
                <p className="text-sm text-gray-500">No replies yet.</p>
              </div>
            ) : (
              <div className="bg-white p-4 rounded-xl shadow-md" style={{ borderColor: colors.border }}>
                {renderReplies(post.replies)}
              </div>
            )}
          </div>

          {/* Main Reply Form */}
          <div 
                className="mt-8 p-6 rounded-xl"
                style={{ 
                  backgroundColor: colors.tertiary,
                  border: `1px solid ${colors.lightBorder}`
                }}
              >
                <h4 
                  className="text-lg font-semibold mb-3 flex items-center gap-2"
                  style={{ color: colors.dark }}
                >
                  <Send size={18} style={{ color: colors.primary }} />
                  Add Your Reply
                </h4>
                
                <form onSubmit={handleReplySubmit}>
                  <textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Share your thoughts..."
                    className="w-full p-4 border rounded-xl focus:outline-none focus:ring-2 text-gray-700"
                    style={{ 
                      borderColor: colors.lightBorder,
                      backgroundColor: colors.white,
                      minHeight: '120px',
                      focusRing: colors.primary
                    }}
                    required
                  ></textarea>
                  
                  <div className="flex justify-end mt-3">
                    <button
                      type="submit"
                      className="py-2.5 px-5 text-white rounded-xl flex items-center gap-2 transition-transform hover:scale-105"
                      style={{ 
                        background: `linear-gradient(to right, ${colors.primary}, ${colors.secondary})`,
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                      }}
                    >
                      <Send size={16} />
                      Post Reply
                    </button>
                  </div>
                </form>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default PostDetailsPage;