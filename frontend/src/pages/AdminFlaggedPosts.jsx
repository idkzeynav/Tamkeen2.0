import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { server } from '../server';
import { toast } from 'react-hot-toast';
import { BsShieldExclamation, BsCheckCircle, BsXCircle, BsEye } from 'react-icons/bs';
import { AiOutlineClockCircle } from 'react-icons/ai';
import AdminHeader from '../components/Layout/AdminHeader';
import AdminSideBar from '../components/Admin/Layout/AdminSideBar';
import Loader from '../components/Layout/Loader';

// Updated Color Scheme (same as in ForumPage)
const colors = {
  primary: '#c8a4a5', // Soft pink
  secondary: '#e6d8d8', // Light baby brown
  tertiary: '#f5f0f0', // Off-white
  light: '#faf7f7', // Very light background
  white: '#ffffff', // Pure white
  dark: '#5a4336', // Dark brown for text
  warning: '#f59e0b', // Warning color for flag
  danger: '#ef4444', // Error color for hate speech alerts
  success: '#10b981', // Success color for approvals
};

const AdminFlaggedPosts = () => {
  const [flaggedPosts, setFlaggedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPost, setSelectedPost] = useState(null);
  const [postDetailsOpen, setPostDetailsOpen] = useState(false);
  const [processingAction, setProcessingAction] = useState(false);

  useEffect(() => {
    fetchFlaggedPosts();
  }, []);

  const fetchFlaggedPosts = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${server}/forum/admin/flagged-posts`, { withCredentials: true });
      setFlaggedPosts(res.data);
      setError('');
    } catch (err) {
      console.error('Error fetching flagged posts:', err);
      setError('Failed to fetch flagged posts. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (post) => {
    setSelectedPost(post);
    setPostDetailsOpen(true);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleApprovePost = async (postId) => {
    try {
      setProcessingAction(true);
      await axios.post(
        `${server}/forum/admin/flagged-posts/${postId}/approve`,
        {},
        { withCredentials: true }
      );
      
      setFlaggedPosts(flaggedPosts.filter(post => post._id !== postId));
      setPostDetailsOpen(false);
      toast.success('Post has been approved and flag removed');
    } catch (err) {
      console.error('Error approving post:', err);
      toast.error('Failed to approve post. Please try again.');
    } finally {
      setProcessingAction(false);
    }
  };

  const handleRemovePost = async (postId) => {
    try {
      setProcessingAction(true);
      await axios.delete(
        `${server}/forum/admin/flagged-posts/${postId}`,
        { withCredentials: true }
      );
      
      setFlaggedPosts(flaggedPosts.filter(post => post._id !== postId));
      setPostDetailsOpen(false);
      toast.success('Post has been removed');
    } catch (err) {
      console.error('Error removing post:', err);
      toast.error('Failed to remove post. Please try again.');
    } finally {
      setProcessingAction(false);
    }
  };

  // Post Details Modal Component
  const PostDetailsModal = () => {
    if (!postDetailsOpen || !selectedPost) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg w-full max-w-4xl h-[80vh] flex flex-col shadow-xl overflow-hidden">
          <div className="p-4 border-b flex items-center justify-between" style={{ backgroundColor: colors.secondary }}>
            <div className="flex items-center">
              <BsShieldExclamation size={20} className="mr-2" style={{ color: colors.warning }} />
              <h3 className="text-lg font-semibold" style={{ color: colors.dark }}>Flagged Content Review</h3>
            </div>
            <button 
              onClick={() => setPostDetailsOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2" style={{ color: colors.dark }}>{selectedPost.title}</h2>
              <div className="flex items-center text-sm text-gray-500 mb-4">
                <span className="mr-4">Posted by: {selectedPost.name}</span>
                <span className="flex items-center">
                  <AiOutlineClockCircle className="mr-1" />
                  {formatDate(selectedPost.createdAt)}
                </span>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <p className="whitespace-pre-line" style={{ color: colors.dark }}>{selectedPost.content}</p>
              </div>
            </div>
            
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold mb-3" style={{ color: colors.primary }}>Flag Reasons:</h3>
              {selectedPost.flags && selectedPost.flags.length > 0 ? (
                <div className="space-y-4">
                  {selectedPost.flags.map((flag, index) => (
                    <div 
                      key={index} 
                      className="bg-red-50 border-l-4 p-4 rounded"
                      style={{ borderColor: colors.warning }}
                    >
                      <p className="font-medium mb-1" style={{ color: colors.dark }}>
                        Reported by: {flag.userId?.name || 'Anonymous User'}
                      </p>
                      <p className="text-sm text-gray-600 mb-2">
                        {formatDate(flag.flaggedAt)}
                      </p>
                      <p className="italic" style={{ color: colors.dark }}>
                        "{flag.reason}"
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">No detailed flag reasons available.</p>
              )}
            </div>
          </div>
          
          <div className="border-t p-4 flex justify-end space-x-4 bg-gray-50">
            <button
              onClick={() => handleRemovePost(selectedPost._id)}
              disabled={processingAction}
              className="flex items-center px-4 py-2 rounded font-medium text-white transition-colors"
              style={{ backgroundColor: colors.danger }}
            >
              <BsXCircle className="mr-2" />
              Remove Post
            </button>
            <button
              onClick={() => handleApprovePost(selectedPost._id)}
              disabled={processingAction}
              className="flex items-center px-4 py-2 rounded font-medium text-white transition-colors"
              style={{ backgroundColor: colors.success }}
            >
              <BsCheckCircle className="mr-2" />
              Approve Post
            </button>
            <Link
              to={`/forum/${selectedPost._id}`}
              target="_blank"
              className="flex items-center px-4 py-2 rounded font-medium text-white transition-colors"
              style={{ backgroundColor: colors.primary }}
            >
              <BsEye className="mr-2" />
              View on Forum
            </Link>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      <AdminHeader />
      <div className="w-full flex">
        <div className="flex items-start justify-between w-full">
          <div className="w-[80px] 800px:w-[330px]">
            <AdminSideBar active={10} />
          </div>
          <div className="flex-1 p-8" style={{ backgroundColor: colors.light, minHeight: '100vh' }}>
            <h1 className="text-2xl md:text-3xl font-bold mb-6" style={{ color: colors.dark }}>
              <BsShieldExclamation className="inline-block mr-2 mb-1" style={{ color: colors.warning }} />
              Flagged Content Management
            </h1>
            
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <Loader />
              </div>
            ) : error ? (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-md">
                <p>{error}</p>
              </div>
            ) : flaggedPosts.length === 0 ? (
              <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-lg shadow-md text-center">
                <BsCheckCircle size={40} className="mx-auto mb-4 text-green-500" />
                <h2 className="text-xl font-semibold mb-2 text-green-800">No Flagged Content</h2>
                <p className="text-green-700">There are currently no flagged posts that require review.</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Post Title
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Author
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Flags
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date Flagged
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {flaggedPosts.map((post) => (
                      <tr key={post._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium" style={{ color: colors.dark }}>
                            {post.title.length > 50 ? post.title.substring(0, 50) + '...' : post.title}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm" style={{ color: colors.dark }}>{post.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm" style={{ color: colors.dark }}>
                            {post.flags ? post.flags.length : 1} {post.flags && post.flags.length === 1 ? 'flag' : 'flags'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {post.flags && post.flags[0] ? 
                              formatDate(post.flags[0].flaggedAt) : 
                              formatDate(post.updatedAt)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={() => handleViewDetails(post)}
                            className="px-3 py-1 rounded text-white transition-colors mr-2"
                            style={{ backgroundColor: colors.primary }}
                          >
                            Review
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <PostDetailsModal />
    </div>
  );
};

export default AdminFlaggedPosts;