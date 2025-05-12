import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { server } from '../server';
import Header from '../components/Layout/Header';
import Footer from '../components/Layout/Footer';
import Loader from '../components/Layout/Loader';
import { AiOutlineArrowUp, AiOutlineArrowDown, AiOutlineFire, AiOutlineClockCircle } from 'react-icons/ai';
import { BsPersonCheckFill } from 'react-icons/bs';
import { useSelector } from 'react-redux';

// Updated Color Scheme
const colors = {
  primary: '#c8a4a5', // Soft pink
  secondary: '#e6d8d8', // Light baby brown
  tertiary: '#f5f0f0', // Off-white
  light: '#faf7f7', // Very light background
  white: '#ffffff', // Pure white
  dark: '#5a4336', // Dark brown for text
};

const ForumPage = () => {
  const [posts, setPosts] = useState([]);
  const [topContributors, setTopContributors] = useState([]);
  const [topHelpers, setTopHelpers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('latest');
  const [userVotes, setUserVotes] = useState({}); // Track user votes
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
                ) : error ? (
                  <div className="text-center text-red-500 p-8">
                    <h2 className="text-2xl font-bold mb-2">Oops!</h2>
                    <p>{error}</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {getFilteredPosts().map((post) => (
                      <div
                        key={post._id}
                        className="p-6 hover:bg-gray-50 cursor-pointer transition-colors flex items-start space-x-4"
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
                          <h2 className="text-xl font-bold mb-2 hover:underline" style={{ color: colors.dark }}>
                            {post.title}
                          </h2>
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
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ForumPage;