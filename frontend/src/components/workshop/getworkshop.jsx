import React, { useState, useEffect } from "react";
import { AiOutlineDelete } from "react-icons/ai";
import axios from "axios";
import { server } from "../../server";
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

  const handleCardClick = (workshopId) => {
    navigate(`/workshop/${workshopId}`);
  };

  return (
    <div className="min-h-screen bg-[#f7f1f1] py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-[#5a4336] mb-8">Creative Workshops</h1>
        
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
                      src={thumbnail}
                      alt={workshop.name}
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-400">No thumbnail available</span>
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h2 className="text-lg font-bold text-[#5a4336] line-clamp-2">
                      {workshop.name}
                    </h2>
                    {isAdmin && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteDialog({ open: true, workshopId: workshop._id });
                        }}
                        className="text-[#c8a4a5] hover:text-[#a67d6d] p-1"
                      >
                        <AiOutlineDelete size={20} />
                      </button>
                    )}
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
                      Duration: {workshop.totalDuration}
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

        {deleteDialog.open && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-6 max-w-sm w-full">
              <h3 className="text-xl font-bold text-[#5a4336] mb-4">Delete Workshop</h3>
              <p className="mb-6 text-[#a67d6d]">Are you sure you want to delete this workshop?</p>
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setDeleteDialog({ open: false, workshopId: null })}
                  className="px-4 py-2 text-[#a67d6d] hover:text-[#5a4336]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-[#c8a4a5] text-white rounded-lg hover:bg-[#a67d6d]"
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