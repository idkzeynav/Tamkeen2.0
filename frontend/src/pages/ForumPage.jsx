import React, { useState, useEffect , useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { server } from '../server';
import Header from '../components/Layout/Header';
import Footer from '../components/Layout/Footer';
import Loader from '../components/Layout/Loader';
import HateSpeechAlert from '../components/HateSpeechAlert/HateSpeechAlert';
import { AiOutlineArrowUp, AiOutlineArrowDown, AiOutlineFire, AiOutlineClockCircle } from 'react-icons/ai';
import { BsPersonCheckFill, BsFlag, BsShieldExclamation } from 'react-icons/bs';
import { useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';

// Updated Color Scheme
const colors = {
  primary: '#c8a4a5', // Soft pink
  secondary: '#e6d8d8', // Light baby brown
  tertiary: '#f5f0f0', // Off-white
  light: '#faf7f7', // Very light background
  white: '#ffffff', // Pure white
  dark: '#5a4336', // Dark brown for text
  warning: '#f59e0b', // Warning color for flag
  danger: '#ef4444', // Error color for hate speech alerts
};

const ForumPage = () => {
  const [posts, setPosts] = useState([]);
   const [post, setPost] = useState(null);
  const [topContributors, setTopContributors] = useState([]);
  const [topHelpers, setTopHelpers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('latest');
  const [userVotes, setUserVotes] = useState({});
  const [flagModalOpen, setFlagModalOpen] = useState(false);
  const [flagReason, setFlagReason] = useState('');
  const [flaggedPostId, setFlaggedPostId] = useState(null);
  const [hateSpeechError, setHateSpeechError] = useState(false);
  const [hateSpeechMessage, setHateSpeechMessage] = useState('');
  const [isSubmittingFlag, setIsSubmittingFlag] = useState(false);
  const navigate = useNavigate();

  const { user } = useSelector((state) => state.user);

  const fetchPosts = async () => {
    try {
      const res = await axios.get(`${server}/forum/posts`);
      setPosts(res.data);

      // Calculate top contributors based on number posts of
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
      setError('Failed to fetch posts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleCreatePostClick = () => {
    setHateSpeechError(false);
    navigate('/forum/create-post');
  };

  const handleVote = async (postId, voteType, e) => {
    e.stopPropagation();
    if (!user) {
      setError('You must be logged in to vote.');
      return;
    }

    try {
      const currentVote = userVotes[postId];
      let updatedVote;

      if (currentVote === voteType) {
        // User is trying to vote the same way again, remove the vote
        updatedVote = null;
      } else if (currentVote) {
        // User is switching their vote
        updatedVote = voteType;
      } else {
        // User is casting a new vote
        updatedVote = voteType;
      }

      await axios.post(`${server}/forum/posts/${postId}/vote`, { voteType: updatedVote });
      const updatedPosts = posts.map((post) => {
        if (post._id === postId) {
          let newVotes = post.votes;
          if (currentVote === 'upvote') newVotes -= 1;
          else if (currentVote === 'downvote') newVotes += 1;
          if (updatedVote === 'upvote') newVotes += 1;
          else if (updatedVote === 'downvote') newVotes -= 1;
          return { ...post, votes: newVotes };
        }
        return post;
      });
      setPosts(updatedPosts);
      setUserVotes({ ...userVotes, [postId]: updatedVote });
    } catch (err) {
      setError('Failed to vote.');
    }
  };

  const handleFlagPost = (postId, e) => {
    e.stopPropagation();
    if (!user) {
      toast.error('You must be logged in to flag a post');
      return;
    }
    setFlaggedPostId(postId);
    setFlagModalOpen(true);
  // Reset flag reason when opening modal
  };

  const closeFlagModal = () => {
    setFlagModalOpen(false);
    setFlagReason('');
    setFlaggedPostId(null);
    setIsSubmittingFlag(false);
  };

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
    await axios.post(`${server}/forum/posts/${flaggedPostId}/flag`, {
      reason: flagReason,
      userId: user._id // Make sure to send the user ID
    }, {
      withCredentials: true // Important for sending cookies/session
    });
    
    toast.success('Post has been flagged for review');
    
    // Update the posts array to reflect the flagged status
    setPosts(posts.map(post => {
      if (post._id === flaggedPostId) {
        return { ...post, isFlagged: true };
      }
      return post;
    }));
    
    setFlagModalOpen(false);
    setFlagReason('');
  } catch (err) {
    console.error('Flagging error:', err);
    toast.error(err.response?.data?.error || 'Failed to flag post. Please try again.');
  } finally {
    setIsSubmittingFlag(false);
  }
};

  const getFilteredPosts = () => {
    if (activeTab === 'latest') {
      return [...posts].sort((a, b) => new Date(b.createdAt || Date.now()) - new Date(a.createdAt || Date.now()));
    } else {
      return [...posts].sort((a, b) => b.votes - a.votes);
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

  return (
    <>
      <Header activeHeading={7} />
      <div className="min-h-screen py-16" style={{ backgroundColor: colors.light }}>
        <div className="container mx-auto px-4 max-w-6xl">
          <header className="p-6 rounded-xl mb-8 shadow-lg" style={{ backgroundColor: colors.primary, color: colors.white }}>
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold">Community Forum</h1>
              <button
                onClick={handleCreatePostClick}
                className="py-2 px-4 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-md"
                style={{ backgroundColor: colors.secondary, color: colors.dark }}
              >
                Create a New Post
              </button>
            </div>
          </header>

          {/* Hate Speech Alert - Show when there's an error from the backend */}
          {hateSpeechError && (
            <HateSpeechAlert message={hateSpeechMessage} />
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {/* Posts Section */}
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="flex border-b">
                  <button
                    className={`flex-1 py-4 font-medium flex justify-center items-center ${activeTab === 'latest' ? 'border-b-2' : 'hover:text-gray-700'}`}
                    style={{
                      color: activeTab === 'latest' ? colors.primary : '#666',
                      borderColor: activeTab === 'latest' ? colors.primary : 'transparent',
                    }}
                    onClick={() => setActiveTab('latest')}
                  >
                    <AiOutlineClockCircle className="mr-2" size={20} />
                    Latest Posts
                  </button>
                  <button
                    className={`flex-1 py-4 font-medium flex justify-center items-center ${activeTab === 'popular' ? 'border-b-2' : 'hover:text-gray-700'}`}
                    style={{
                      color: activeTab === 'popular' ? colors.primary : '#666',
                      borderColor: activeTab === 'popular' ? colors.primary : 'transparent',
                    }}
                    onClick={() => setActiveTab('popular')}
                  >
                    <AiOutlineFire className="mr-2" size={20} />
                    Popular Posts
                  </button>
                </div>

                {loading ? (
                  <div className="p-8 flex justify-center">
                    <Loader />
                  </div>
                ) : error && !error.includes('hate speech') ? (
                  <div className="text-center text-red-500 p-8">
                    <h2 className="text-2xl font-bold mb-2">Oops!</h2>
                    <p>{error}</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {getFilteredPosts().map((post) => (
                      <div
                        key={post._id}
                        className="p-6 hover:bg-gray-50 cursor-pointer transition-colors flex items-start space-x-4 relative"
                        onClick={() => navigate(`/forum/${post._id}`)}
                      >
                        <div className="flex flex-col items-center space-y-2 pt-1">
                          <button
                            onClick={(e) => handleVote(post._id, 'upvote', e)}
                            className={`hover:text-green-500 transition-colors ${userVotes[post._id] === 'upvote' ? 'text-green-500' : ''}`}
                            style={{ color: '#888' }}
                          >
                            <AiOutlineArrowUp size={24} />
                          </button>
                          <span className="text-lg font-semibold" style={{
                            color: post.votes > 0 ? 'green' : post.votes < 0 ? 'red' : '#666',
                          }}>
                            {post.votes}
                          </span>
                          <button
                            onClick={(e) => handleVote(post._id, 'downvote', e)}
                            className={`hover:text-red-500 transition-colors ${userVotes[post._id] === 'downvote' ? 'text-red-500' : ''}`}
                            style={{ color: '#888' }}
                          >
                            <AiOutlineArrowDown size={24} />
                          </button>
                        </div>

                        <div className="flex-1">
                          <div className="flex justify-between">
                            <h2 className="text-xl font-bold mb-2 hover:underline" style={{ color: colors.dark }}>
                              {post.title}
                            </h2>
                            
                            {/* Flag Button */}
                            <button
                              onClick={(e) => handleFlagPost(post._id, e)}
                              className="flex items-center gap-1 px-2 py-1 rounded text-sm opacity-60 hover:opacity-100 transition-opacity"
                              style={{ color: colors.warning }}
                              title="Flag inappropriate content"
                            >
                              <BsFlag size={14} />
                              <span className="hidden sm:inline">Flag</span>
                            </button>
                          </div>
                          
                          {/* Flagged content warning */}
                          {post.isFlagged && (
                            <div className="mb-2 px-3 py-1 inline-flex items-center rounded-md"
                              style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', borderLeft: `3px solid ${colors.warning}` }}>
                              <BsShieldExclamation size={12} className="text-amber-500 mr-1" />
                              <span className="text-xs" style={{ color: colors.warning }}>
                                Content flagged for review
                              </span>
                            </div>
                          )}
                          
                          <p className="mb-3 line-clamp-2" style={{ color: '#555' }}>{post.content}</p>
                          <div className="flex items-center text-sm space-x-4" style={{ color: '#777' }}>
                            <div className="flex items-center">
                              <InitialsAvatar name={post.name} />
                              <span className="ml-2">{post.name}</span>
                            </div>
                            <span>
                              {new Date(post.createdAt || Date.now()).toLocaleDateString()}
                            </span>
                            <span>{post.replies?.length || 0} comments</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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
              
              {/* Community Guidelines Section */}
              <section className="bg-white rounded-xl shadow-md overflow-hidden">
                <h2 className="text-lg font-semibold p-4 border-b flex items-center" style={{
                  background: `linear-gradient(to right, ${colors.secondary}, ${colors.primary})`,
                  color: colors.dark,
                }}>
                  <BsShieldExclamation className="mr-2" size={20} style={{ color: colors.primary }} />
                  Community Guidelines
                </h2>
                <div className="p-4 text-sm" style={{ color: colors.dark }}>
                  <p className="mb-2">Our forum uses AI-powered content moderation to maintain a respectful environment.</p>
                  <ul className="pl-4 space-y-1">
                    <li>• Be kind and respectful to others</li>
                    <li>• Avoid hate speech and offensive language</li>
                    <li>• Flag content that violates guidelines</li>
                  </ul>
                </div>
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

export default ForumPage;