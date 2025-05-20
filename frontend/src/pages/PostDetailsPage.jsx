import React, { useState, useEffect, useRef } from 'react';
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
import { AiOutlineFire } from 'react-icons/ai';
import { BsPersonCheckFill } from 'react-icons/bs';
import { BsShieldExclamation, BsFlag } from 'react-icons/bs';
import { toast } from 'react-toastify';
import HateSpeechAlert from '../components/HateSpeechAlert/HateSpeechAlert';
// Color Scheme
const colors = {
  primary: '#c8a4a5', // Soft pink
  secondary: '#e6d8d8', // Light baby brown
  tertiary: '#f5f0f0', // Off-white
  light: '#faf7f7', // Very light background
  white: '#ffffff', // Pure white
  dark: '#5a4336', // Dark brown for text
  border: '#ebebeb', // Light border color
  danger: '#ef4444', // Red for alerts
  warning: '#f59e0b', // Amber for warnings
};

const PostDetailsPage = () => {
  const { postId } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [replyContent, setReplyContent] = useState('');
  const [nestedReplyContent, setNestedReplyContent] = useState({});
  const [activeReplyId, setActiveReplyId] = useState(null);
  const [topContributors, setTopContributors] = useState([]);
  const [topHelpers, setTopHelpers] = useState([]);
  const [hateSpeechError, setHateSpeechError] = useState(false);
  const [hateSpeechMessage, setHateSpeechMessage] = useState('');
  const [flagModalOpen, setFlagModalOpen] = useState(false);
  const [flagReason, setFlagReason] = useState('');
  const [flaggedPostId, setFlaggedPostId] = useState(null);
  const [isSubmittingFlag, setIsSubmittingFlag] = useState(false);
  
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

    const fetchAllPosts = async () => {
      try {
        const res = await axios.get(`${server}/forum/posts`);
        
        // Calculate top contributors based on number of posts
        const contributorsMap = {};
        res.data.forEach((post) => {
          if (!contributorsMap[post.name]) {
            contributorsMap[post.name] = {
              name: post.name,
              contributions: 1,
            };
          } else {
            contributorsMap[post.name].contributions += 1;
          }
        });

        // Convert to array and sort by contributions
        const sortedContributors = Object.values(contributorsMap)
          .sort((a, b) => b.contributions - a.contributions)
          .slice(0, 3); // Top 3 contributors

        setTopContributors(sortedContributors);

        // Calculate top helpers based on number of replies
        const helpersMap = {};
        res.data.forEach((post) => {
          if (post.replies && post.replies.length > 0) {
            post.replies.forEach((reply) => {
              if (!helpersMap[reply.name]) {
                helpersMap[reply.name] = {
                  name: reply.name,
                  helpfulAnswers: 1,
                };
              } else {
                helpersMap[reply.name].helpfulAnswers += 1;
              }
            });
          }
        });

        // Convert to array and sort by helpful answers
        const sortedHelpers = Object.values(helpersMap)
          .sort((a, b) => b.helpfulAnswers - a.helpfulAnswers)
          .slice(0, 3); // Top 3 helpers

        setTopHelpers(sortedHelpers);
      } catch (err) {
        console.error('Failed to fetch all posts for contributors and helpers');
      }
    };

    fetchPost();
    fetchAllPosts();
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
    setHateSpeechError(false);
    
    try {
      const res = await axios.post(`${server}/forum/posts/${postId}/reply`, {
        content: replyContent,
        name: user.name,
      });
      setPost(res.data);
      setReplyContent('');
    } catch (err) {
      if (err.response && err.response.status === 403 && 
          err.response.data.error.toLowerCase().includes('hate speech')) {
        setHateSpeechError(true);
        setHateSpeechMessage(err.response.data.error || 'Your reply contains content that violates our community guidelines.');
      } else {
        setError('Failed to add reply.');
      }
    }
  };

  const handleNestedReplySubmit = async (replyId, e) => {
    e.preventDefault();
    setHateSpeechError(false);
    
    try {
      const res = await axios.post(
        `${server}/forum/posts/${postId}/replies/${replyId}/reply`,
        { content: nestedReplyContent[replyId], name: user.name }
      );
      setPost(res.data);
      setNestedReplyContent({ ...nestedReplyContent, [replyId]: '' });
      setActiveReplyId(null);
    } catch (err) {
      if (err.response && err.response.status === 403 && 
          err.response.data.error.toLowerCase().includes('hate speech')) {
        setHateSpeechError(true);
        setHateSpeechMessage(err.response.data.error || 'Your reply contains content that violates our community guidelines.');
      } else {
        setError('Failed to add nested reply.');
      }
    }
  };

const handleFlagPost = (postId, e) => {
  e.preventDefault();
  e.stopPropagation();
  
  if (!user) {
    toast.error('You must be logged in to flag a post');
    return;
  }
  
  setFlaggedPostId(postId);
  setFlagModalOpen(true);
  setFlagReason('');
};

const toggleNestedReplyForm = (replyId) => { setActiveReplyId(activeReplyId === replyId ? null : replyId)};

 const submitFlag = async () => {
  if (!flagReason.trim()) {
    toast.error('Please provide a reason for flagging this post');
    return;
  }

  if (!user || !user._id) {
    toast.error('You must be logged in to flag a post');
    return;
  }

  try {
    setIsSubmittingFlag(true);
    const response = await axios.post(
      `${server}/forum/posts/${flaggedPostId}/flag`,
      {
        reason: flagReason,
        userId: user._id
      },
      {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
    
    if (response.data.success) {
      toast.success('Post has been flagged for review');
      setPost(prev => ({ ...prev, isFlagged: true }));
      setFlagModalOpen(false);
      setFlagReason('');
    } else {
      throw new Error(response.data.error || 'Failed to flag post');
    }
  } catch (err) {
    console.error('Flagging error:', err);
    toast.error(err.response?.data?.error || 'Failed to flag post. Please try again.');
  } finally {
    setIsSubmittingFlag(false);
  }
};

  const getInitialsAvatar = (name) => {
    if (!name) return 'U';
    const nameParts = name.split(' ');
    if (nameParts.length > 1) {
      return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const getAvatarColor = (name) => {
    if (!name) return colors.primary;

    const colorOptions = [
      colors.primary,
      colors.secondary,
      '#d48c8f', // Slightly darker pink
      '#b38d82', // Muted brown
    ];

    const charCode = name.charCodeAt(0);
    return colorOptions[charCode % colorOptions.length];
  };

  const InitialsAvatar = ({ name }) => {
    const initials = getInitialsAvatar(name);
    const bgColor = getAvatarColor(name);

    return (
      <div
        className="flex items-center justify-center rounded-full flex-shrink-0"
        style={{
          backgroundColor: bgColor,
          color: colors.white,
          width: '36px',
          height: '36px',
          fontSize: '14px',
          fontWeight: 'bold',
        }}
      >
        {initials}
      </div>
    );
  };
 const closeFlagModal = () => {
    setFlagModalOpen(false);
    setFlagReason('');
    setFlaggedPostId(null);
    setIsSubmittingFlag(false);
  };
  // Flag Modal Component
 const FlagModal = () => {
   const textareaRef = useRef(null);
   
   useEffect(() => {
     if (flagModalOpen && textareaRef.current) {
       textareaRef.current.focus();
     }
   }, [flagModalOpen]);
 
   if (!flagModalOpen) return null;
   
   return (
     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
       <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
         <div className="flex items-center mb-4">
           <BsShieldExclamation size={24} className="text-red-500 mr-2" />
           <h3 className="text-lg font-semibold" style={{ color: colors.dark }}>Flag Inappropriate Content</h3>
         </div>
         
         <div className="mb-4">
           <p className="text-sm mb-2" style={{ color: colors.dark }}>
             Please let us know why you're flagging this content:
           </p>
           <textarea
             ref={textareaRef}
             key="flag-reason-textarea"  // Add a key to prevent re-creation
             value={flagReason}
             onChange={(e) => setFlagReason(e.target.value)}
             className="w-full border rounded p-2 text-sm"
             style={{ borderColor: colors.secondary }}
             rows="4"
             placeholder="Explain why this post violates community guidelines..."
           ></textarea>
         </div>
         
         <div className="flex justify-end space-x-2">
           <button
             onClick={closeFlagModal}
             className="px-4 py-2 rounded text-sm"
             style={{ color: colors.dark }}
           >
             Cancel
           </button>
           <button
             onClick={submitFlag}
             disabled={isSubmittingFlag}
             className="px-4 py-2 rounded text-sm text-white"
             style={{ backgroundColor: colors.danger || '#ef4444' }}
           >
             {isSubmittingFlag ? 'Submitting...' : 'Submit Report'}
           </button>
         </div>
       </div>
     </div>
   );
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
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {/* Main Post */}
              <div className="bg-white rounded-xl shadow-md mb-6" style={{ borderColor: colors.border }}>
                <div className="p-6">
                  {/* Hate Speech Alert */}
                  {hateSpeechError && <HateSpeechAlert message={hateSpeechMessage} />}
                  
                  {/* Post Title with Flag Button */}
                  <div className="flex justify-between items-center mb-2">
                    <h2 
                      className="text-xl font-medium"
                      style={{ color: colors.dark }}
                    >
                      {post.title}
                    </h2>
                    
                    <button
                      onClick={(e) => handleFlagPost(post._id, e)}
                      className="flex items-center gap-1 px-2 py-1 rounded text-sm opacity-60 hover:opacity-100 transition-opacity"
                      style={{ color: colors.warning || '#f59e0b' }}
                      title="Flag inappropriate content"
                    >
                      <BsFlag size={14} />
                      <span className="hidden sm:inline">Flag</span>
                    </button>
                  </div>

                  {/* Show flagged warning if post is flagged */}
                  {post.isFlagged && (
                    <div className="mb-2 px-3 py-1 inline-flex items-center rounded-md"
                      style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', borderLeft: '3px solid #f59e0b' }}>
                      <BsShieldExclamation size={12} className="text-amber-500 mr-1" />
                      <span className="text-xs" style={{ color: colors.warning || '#f59e0b' }}>
                        Content flagged for review
                      </span>
                    </div>
                  )}
                  
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
                  border: `1px solid ${colors.border}`
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
                      borderColor: colors.border,
                      backgroundColor: colors.white,
                      minHeight: '120px'
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

            <div className="space-y-8">
              {/* Top Contributors Section */}
              <section className="bg-white rounded-xl shadow-md overflow-hidden">
                <h2 className="text-lg font-semibold p-4 border-b flex items-center" style={{
                  background: `linear-gradient(to right, ${colors.secondary}, ${colors.primary})`,
                  color: colors.dark,
                }}>
                  <AiOutlineFire className="mr-2" size={20} style={{ color: colors.primary }} />
                  Top Contributors
                </h2>
                <ul className="divide-y">
                  {topContributors.length > 0 ? (
                    topContributors.map((contributor) => (
                      <li key={contributor.name} className="p-4 hover:bg-gray-50">
                        <div className="flex items-center">
                          <InitialsAvatar name={contributor.name} />
                          <div className="ml-3 flex-1">
                            <h3 className="font-medium" style={{ color: colors.dark }}>{contributor.name}</h3>
                            <p style={{ color: '#777' }} className="text-sm">{contributor.contributions} contributions</p>
                          </div>
                        </div>
                      </li>
                    ))
                  ) : (
                    <li className="p-4 text-center" style={{ color: '#777' }}>No contributors yet</li>
                  )}
                </ul>
              </section>

              {/* Top Helpers Section */}
              <section className="bg-white rounded-xl shadow-md overflow-hidden">
                <h2 className="text-lg font-semibold p-4 border-b flex items-center" style={{
                  background: `linear-gradient(to right, ${colors.secondary}, ${colors.primary})`,
                  color: colors.dark,
                }}>
                  <BsPersonCheckFill className="mr-2" size={20} style={{ color: colors.primary }} />
                  Top Helpers
                </h2>
                <ul className="divide-y">
                  {topHelpers.length > 0 ? (
                    topHelpers.map((helper) => (
                      <li key={helper.name} className="p-4 hover:bg-gray-50">
                        <div className="flex items-center">
                          <InitialsAvatar name={helper.name} />
                          <div className="ml-3 flex-1">
                            <h3 className="font-medium" style={{ color: colors.dark }}>{helper.name}</h3>
                            <p style={{ color: '#777' }} className="text-sm">{helper.helpfulAnswers} helpful answers</p>
                          </div>
                        </div>
                      </li>
                    ))
                  ) : (
                    <li className="p-4 text-center" style={{ color: '#777' }}>No helpers yet</li>
                  )}
                </ul>
              </section>
            </div>
          </div>
        </div>
      </div>
      
      {/* Flag Modal */}
      <FlagModal />
      
      <Footer />
    </>
  );
};

export default PostDetailsPage;