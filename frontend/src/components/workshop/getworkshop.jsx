import React, { useState, useEffect } from "react";
import { AiOutlineDelete, AiOutlineEdit } from "react-icons/ai";
import axios from "axios";
import { server, backend_url  } from "../../server";
import { useSelector } from "react-redux";
import { useNavigate } from 'react-router-dom';

const WorkshopList = () => {
  const [workshops, setWorkshops] = useState([]);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, workshopId: null });
  const { user } = useSelector((state) => state.user);
  const isAdmin = user?.role === "Admin";
  const navigate = useNavigate();

  useEffect(() => {
    fetchWorkshops();
  }, []);

  const fetchWorkshops = async () => {
    try {
      const { data } = await axios.get(`${server}/workshop/all-workshops`);
      setWorkshops(data.workshops);
    } catch (error) {
      console.error("Error fetching workshops:", error);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await axios.delete(
        `${server}/workshop/delete-workshop/${deleteDialog.workshopId}`,
        { withCredentials: true }
      );
      if (response.data.success) {
        setDeleteDialog({ open: false, workshopId: null });
        fetchWorkshops();
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleEdit = (e, workshopId) => {
    e.stopPropagation();
    navigate(`/admin/workshop/update/${workshopId}`);
  };

  const handleCardClick = (workshopId) => {
    navigate(`/workshop/${workshopId}`);
  };

  return (
    <div className="min-h-screen bg-[#f7f1f1] py-8">
      
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
         <h1 className="text-2xl font-semibold text-[#5a4336]">
                All Workshops
              </h1>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workshops.map((workshop) => {
            const thumbnail = workshop.videos?.[0]?.thumbnail;
            
            return (
              <div 
                key={workshop._id} 
                className="bg-white rounded-xl shadow-lg overflow-hidden transform hover:scale-[1.02] transition-all duration-300 cursor-pointer"
                onClick={() => handleCardClick(workshop._id)}
              >
                <div className="relative">
                  {thumbnail ? (
                    <img
                      src={thumbnail.startsWith('/') 
                        ? `${backend_url}${thumbnail}` 
                        : thumbnail
                      }
                      alt={workshop.name}
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-400">No thumbnail available</span>
                    </div>
                  )}
                  
                  {/* Admin Action Buttons - Positioned over the image */}
                  {isAdmin && (
                    <div className="absolute top-2 right-2 flex gap-2">
                      <button 
                        onClick={(e) => handleEdit(e, workshop._id)}
                        className="bg-white bg-opacity-90 hover:bg-opacity-100 text-[#c8a4a5] hover:text-[#a67d6d] p-2 rounded-full shadow-md transition-all"
                        title="Edit Workshop"
                      >
                        <AiOutlineEdit size={18} />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteDialog({ open: true, workshopId: workshop._id });
                        }}
                        className="bg-white bg-opacity-90 hover:bg-opacity-100 text-red-500 hover:text-red-600 p-2 rounded-full shadow-md transition-all"
                        title="Delete Workshop"
                      >
                        <AiOutlineDelete size={18} />
                      </button>
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <div className="mb-2">
                    <h2 className="text-lg font-bold text-[#5a4336] line-clamp-2">
                      {workshop.name}
                    </h2>
                  </div>

                  <div className="flex gap-2 mb-3">
                    <span className="px-2 py-1 bg-[#d8c4b8] text-[#5a4336] text-xs rounded-full">
                      {workshop.category}
                    </span>
                    <span className="px-2 py-1 bg-[#c8a4a5] text-white text-xs rounded-full">
                      {workshop.level}
                    </span>
                  </div>

                  <p className="text-sm text-[#a67d6d] mb-4 line-clamp-2">
                    {workshop.description}
                  </p>

                  <div className="flex justify-between items-center mt-4">
                    <div className="text-xs text-[#a67d6d]">
                      <div>Duration: {workshop.totalDuration}</div>
                      <div className="mt-1">
                        Videos: {workshop.videos?.length || 0}
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/workshop/${workshop._id}`);
                      }}
                      className="px-4 py-2 bg-[#c8a4a5] text-white rounded-lg hover:bg-[#a67d6d] transition-colors"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {workshops.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg mb-4">No workshops found</div>
            {isAdmin && (
              <button
                onClick={() => navigate('/admin/workshop/create')}
                className="px-6 py-3 bg-[#c8a4a5] text-white rounded-lg hover:bg-[#a67d6d] transition-colors"
              >
                Create Your First Workshop
              </button>
            )}
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        {deleteDialog.open && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-6 max-w-sm w-full">
              <h3 className="text-xl font-bold text-[#5a4336] mb-4">Delete Workshop</h3>
              <p className="mb-6 text-[#a67d6d]">
                Are you sure you want to delete this workshop? This action cannot be undone and will affect all users who have enrolled in this workshop.
              </p>
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setDeleteDialog({ open: false, workshopId: null })}
                  className="px-4 py-2 text-[#a67d6d] hover:text-[#5a4336] border border-gray-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkshopList;