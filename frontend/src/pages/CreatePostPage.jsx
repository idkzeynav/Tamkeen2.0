import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { server } from '../server';
import Header from '../components/Layout/Header';
import Footer from '../components/Layout/Footer';
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

const CreatePostPage = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Get the authenticated user's name from Redux
  const { user } = useSelector((state) => state.user);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!title || !content) {
      setError('Title and content are required.');
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post(
        `${server}/forum/posts`,
        { title, content, name: user.name }, // Use the authenticated user's name
        { withCredentials: true } // Include credentials if needed
      );
      if (res.data) {
        navigate('/forum'); // Redirect to the forum page after successful post creation
      }
    } catch (err) {
      console.error('Error creating post:', err); // Debugging
      setError('Failed to create post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header activeHeading={7} />
      <div className="min-h-screen py-16" style={{ backgroundColor: colors.light }}>
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-xl">
            <h2 className="text-3xl font-bold mb-6" style={{ color: colors.dark }}>
              Create a New Post
            </h2>
            <form onSubmit={handleSubmit}>
              {/* Title Field */}
              <div className="mb-6">
                <label htmlFor="title" className="block font-semibold mb-2" style={{ color: colors.dark }}>
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#a67d6d]"
                  required
                />
              </div>

              {/* Content Field */}
              <div className="mb-6">
                <label htmlFor="content" className="block font-semibold mb-2" style={{ color: colors.dark }}>
                  Content
                </label>
                <textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#a67d6d]"
                  rows="5"
                  required
                ></textarea>
              </div>

              {/* Error Message */}
              {error && <p className="text-red-500 mb-4">{error}</p>}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-6 bg-gradient-to-r from-[#c8a4a5] to-[#e6d8d8] text-white rounded-xl hover:from-[#e6d8d8] hover:to-[#c8a4a5] transition"
              >
                {loading ? 'Creating Post...' : 'Create Post'}
              </button>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default CreatePostPage;