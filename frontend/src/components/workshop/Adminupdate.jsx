import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import { AiOutlineUpload, AiOutlineEdit, AiOutlineSave, AiOutlineClose } from "react-icons/ai";
import { backend_url, server } from '../../server';
import AdminHeader from "../Layout/AdminHeader";
import AdminSideBar from "../Admin/Layout/AdminSideBar";

const UpdateWorkshop = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.user);

  const [workshop, setWorkshop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [errors, setErrors] = useState({});

  // Form data
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    description: "",
    totalDuration: "",
    requirements: "",
    level: "Beginner"
  });

  // Thumbnail management
  const [videoThumbnails, setVideoThumbnails] = useState({});
  const [uploadingThumbnail, setUploadingThumbnail] = useState(null);

  useEffect(() => {
    if (user?.role !== "Admin") {
      navigate("/");
      return;
    }
    fetchWorkshop();
  }, [id, user, navigate]);

  const fetchWorkshop = async () => {
    try {
      const { data } = await axios.get(`${server}/workshop/edit-workshop/${id}`, {
        withCredentials: true
      });
      
      if (data.success) {
        const workshopData = data.workshop;
        setWorkshop(workshopData);
        setFormData({
          name: workshopData.name || "",
          category: workshopData.category || "",
          description: workshopData.description || "",
          totalDuration: workshopData.totalDuration || "",
          requirements: workshopData.requirements || "",
          level: workshopData.level || "Beginner"
        });
      }
    } catch (error) {
      console.error("Error fetching workshop:", error);
      setErrors({ fetch: "Failed to load workshop data" });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear specific field error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = "Workshop name is required";
    if (!formData.category.trim()) newErrors.category = "Category is required";
    if (!formData.description.trim()) newErrors.description = "Description is required";
    if (!formData.totalDuration.trim()) newErrors.totalDuration = "Total duration is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdateWorkshop = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setUpdating(true);
    
    try {
      const formDataToSend = new FormData();
      
      // Add form fields
      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key]);
      });
      
      // Add video thumbnail updates if any
      if (Object.keys(videoThumbnails).length > 0) {
        formDataToSend.append('videoThumbnailUpdates', JSON.stringify(videoThumbnails));
      }

      const { data } = await axios.put(
        `${server}/workshop/update-workshop/${id}`,
        formDataToSend,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'multipart/form-data',
          }
        }
      );

      if (data.success) {
        alert("Workshop updated successfully!");
        navigate("/Adminworkshop");
      }
    } catch (error) {
      console.error("Error updating workshop:", error);
      setErrors({ 
        submit: error.response?.data?.message || "Failed to update workshop" 
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleVideoThumbnailUpload = async (videoIndex, file) => {
    if (!file) return;
    
    setUploadingThumbnail(videoIndex);
    
    try {
      const formData = new FormData();
      formData.append('videoThumbnail', file);
      
      const { data } = await axios.put(
        `${server}/workshop/update-video-thumbnail/${id}/${videoIndex}`,
        formData,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'multipart/form-data',
          }
        }
      );

      if (data.success) {
        // Update local state
        setWorkshop(prev => ({
          ...prev,
          videos: prev.videos.map((video, index) => 
            index === videoIndex 
              ? { ...video, thumbnail: data.thumbnail }
              : video
          )
        }));
        
        alert("Thumbnail updated successfully!");
      }
    } catch (error) {
      console.error("Error uploading thumbnail:", error);
      alert("Failed to upload thumbnail");
    } finally {
      setUploadingThumbnail(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f1f1]">
        <AdminHeader />
        <div className="flex">
          <div className="w-1/5">
            <AdminSideBar/>
          </div>
          <div className="w-4/5 flex items-center justify-center py-20">
            <div className="text-[#5a4336] text-xl">Loading workshop...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!workshop) {
    return (
      <div className="min-h-screen bg-[#f7f1f1]">
        <AdminHeader />
        <div className="flex">
          <div className="w-1/5">
            <AdminSideBar />
          </div>
          <div className="w-4/5 flex items-center justify-center py-20">
            <div className="text-red-600 text-xl">Workshop not found</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f1f1]">
      <AdminHeader />
      <div className="flex">
        <div className="w-1/5">
          <AdminSideBar />
        </div>
        <div className="w-4/5 py-8 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-[#5a4336]">Update Workshop</h1>
                <button
                  onClick={() => navigate("/Adminworkshop")}
                  className="text-[#a67d6d] hover:text-[#5a4336] p-2"
                >
                  <AiOutlineClose size={24} />
                </button>
              </div>

              {errors.fetch && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                  {errors.fetch}
                </div>
              )}

              <form onSubmit={handleUpdateWorkshop} className="space-y-6">
                {/* Workshop Name */}
                <div>
                  <label className="block text-[#5a4336] font-semibold mb-2">
                    Workshop Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c8a4a5] ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter workshop name"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                  )}
                </div>

                {/* Category */}
                <div>
                  <label className="block text-[#5a4336] font-semibold mb-2">
                    Category *
                  </label>
                  <input
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c8a4a5] ${
                      errors.category ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter category"
                  />
                  {errors.category && (
                    <p className="text-red-500 text-sm mt-1">{errors.category}</p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-[#5a4336] font-semibold mb-2">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c8a4a5] ${
                      errors.description ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter workshop description"
                  />
                  {errors.description && (
                    <p className="text-red-500 text-sm mt-1">{errors.description}</p>
                  )}
                </div>

                {/* Total Duration */}
                <div>
                  <label className="block text-[#5a4336] font-semibold mb-2">
                    Total Duration *
                  </label>
                  <input
                    type="text"
                    name="totalDuration"
                    value={formData.totalDuration}
                    onChange={handleInputChange}
                    className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c8a4a5] ${
                      errors.totalDuration ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="e.g., 2 hours 30 minutes"
                  />
                  {errors.totalDuration && (
                    <p className="text-red-500 text-sm mt-1">{errors.totalDuration}</p>
                  )}
                </div>

                {/* Requirements */}
                <div>
                  <label className="block text-[#5a4336] font-semibold mb-2">
                    Requirements
                  </label>
                  <textarea
                    name="requirements"
                    value={formData.requirements}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c8a4a5]"
                    placeholder="Enter any requirements (optional)"
                  />
                </div>

                {/* Level */}
                <div>
                  <label className="block text-[#5a4336] font-semibold mb-2">
                    Level *
                  </label>
                  <select
                    name="level"
                    value={formData.level}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c8a4a5]"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>

                {/* Videos Section (Read-only with thumbnail upload) */}
                <div>
                  <h3 className="text-xl font-semibold text-[#5a4336] mb-4">
                    Workshop Videos (Read-only)
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-[#a67d6d] mb-4">
                      Videos cannot be modified to preserve user progress. You can only update thumbnails.
                    </p>
                    
                    <div className="space-y-4">
                      {workshop.videos.map((video, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4 bg-white">
                          <div className="flex items-center gap-4">
                            <div className="w-24 h-16 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                              {video.thumbnail ? (
                                <img
                                  src={video.thumbnail.startsWith('/') 
                                    ? `${backend_url}${video.thumbnail}` 
                                    : video.thumbnail
                                  }
                                  alt={video.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                                  No Thumbnail
                                </div>
                              )}
                            </div>
                            
                            <div className="flex-1">
                              <h4 className="font-semibold text-[#5a4336]">{video.title}</h4>
                              <p className="text-sm text-[#a67d6d]">Duration: {video.duration}</p>
                              <p className="text-xs text-gray-500">Order: {video.order}</p>
                            </div>
                            
                            <div className="flex flex-col gap-2">
                              <label className="cursor-pointer">
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => {
                                    const file = e.target.files[0];
                                    if (file) {
                                      handleVideoThumbnailUpload(index, file);
                                    }
                                  }}
                                  className="hidden"
                                  disabled={uploadingThumbnail === index}
                                />
                                <div className="flex items-center gap-1 px-3 py-2 bg-[#c8a4a5] text-white rounded-lg hover:bg-[#a67d6d] transition-colors text-sm">
                                  {uploadingThumbnail === index ? (
                                    <span>Uploading...</span>
                                  ) : (
                                    <>
                                      <AiOutlineUpload size={16} />
                                      <span>Update Thumbnail</span>
                                    </>
                                  )}
                                </div>
                              </label>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Submit Error */}
                {errors.submit && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {errors.submit}
                  </div>
                )}

                {/* Submit Button */}
                <div className="flex gap-4 pt-6">
                  <button
                    type="submit"
                    disabled={updating}
                    className="flex items-center gap-2 px-6 py-3 bg-[#c8a4a5] text-white rounded-lg hover:bg-[#a67d6d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {updating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Updating...</span>
                      </>
                    ) : (
                      <>
                        <AiOutlineSave size={20} />
                        <span>Update Workshop</span>
                      </>
                    )}
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => navigate("/admin/workshops")}
                    className="px-6 py-3 border border-[#c8a4a5] text-[#c8a4a5] rounded-lg hover:bg-[#c8a4a5] hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateWorkshop;