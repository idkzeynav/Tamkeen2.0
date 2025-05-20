import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { server } from '../../server';
import Footer from '../Layout/Footer';
import Header from '../Layout/Header';

import { 
  Award, 
  Clock, 
  Target, 
  TrophyIcon, 
  PlayCircle, 
  CheckCircle2,
  FileText,
  BookOpen
} from 'lucide-react';

const UserWorkshops = () => {
  const [workshops, setWorkshops] = useState([]);
  const [motivationalMessage, setMotivationalMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchWorkshops();
    generateMotivationalMessage();
  }, []);

  const fetchWorkshops = async () => {
    setIsLoading(true);
    try {
      const { data } = await axios.get(`${server}/workshop/user-workshops`, {
        withCredentials: true
      });
      
      setWorkshops(data.workshops);
    } catch (error) {
      console.error('Error fetching workshops:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateMotivationalMessage = () => {
    const messages = [
      "Your learning journey is just beginning!",
      "Every video watched brings you closer to your goals.",
      "Consistency is key to mastering new skills.",
      "Challenge yourself to learn something new every day!",
      "Your potential is limitless. Keep learning!"
    ];
    setMotivationalMessage(messages[Math.floor(Math.random() * messages.length)]);
  };

  const getStatusColor = (progress) => {
    if (progress >= 85) return 'bg-green-100 text-green-800';
    if (progress > 50) return 'bg-blue-100 text-blue-800';
    if (progress > 0) return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getProgressIcon = (progress) => {
    if (progress >= 85) return <CheckCircle2 className="w-5 h-5 text-green-600" />;
    if (progress > 0) return <Clock className="w-5 h-5 text-yellow-600" />;
    return <PlayCircle className="w-5 h-5 text-gray-600" />;
  };

  const completedWorkshops = workshops.filter(w => w.progress >= 85);
  const pendingWorkshops = workshops.filter(w => w.progress < 85);

  const WorkshopCard = ({ workshop, completed = false }) => (
    <div 
      className="bg-white rounded-2xl shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-102 hover:shadow-xl cursor-pointer"
      onClick={() => navigate(`/workshopdetail/${workshop._id}`)}
    >
      <div className="p-6 relative">
        <div className="absolute top-4 right-4">
          {getProgressIcon(workshop.progress)}
        </div>
        <h2 className="text-xl font-bold text-[#5a4336] mb-3 pr-6">
          {workshop.name}
        </h2>
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="text-sm px-3 py-1 bg-[#d8c4b8]/30 rounded-full text-[#a67d6d] font-medium">
            {workshop.category}
          </span>
          <span className={`text-sm px-3 py-1 rounded-full font-medium ${getStatusColor(workshop.progress)}`}>
            {workshop.progress}% Complete
          </span>
        </div>
        
        {/* Progress bar */}
        <div className="w-full h-2 bg-gray-200 rounded-full mb-4">
          <div 
            className="h-2 rounded-full bg-gradient-to-r from-[#c8a4a5] to-[#a67d6d]" 
            style={{ width: `${workshop.progress}%` }}
          ></div>
        </div>
        
        <div className="text-sm text-gray-600 space-y-2">
          <p className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#a67d6d]" />
            <span className="font-medium">Total Videos:</span> {workshop.videos.length}
          </p>
          <p className="flex items-center gap-2">
            <Target className="w-4 h-4 text-[#a67d6d]" />
            <span className="font-medium">Videos Watched:</span> {Object.values(workshop.videoProgress || {})
              .filter(progress => progress >= 85).length}
          </p>
          {workshop.lastWatched && (
            <p className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#a67d6d]" />
              <span className="font-medium">Last watched:</span> {new Date(workshop.lastWatched).toLocaleDateString()}
            </p>
          )}
        </div>
        
        {completed && (
          <div className="mt-4 flex items-center gap-2 text-green-600 bg-green-50 p-2 rounded-lg">
            <TrophyIcon className="w-5 h-5" />
            <span className="font-medium">Workshop Mastered!</span>
          </div>
        )}
        
        {!completed && workshop.progress >= 85 && (
          <div className="mt-4 flex items-center gap-2 text-[#c8a4a5] bg-[#f7f1f1] p-2 rounded-lg">
            <FileText className="w-5 h-5" />
            <span className="font-medium">Quiz Available</span>
          </div>
        )}
      </div>
    </div>
  );

  return (

    <div className="relative">
    <Header  />
    <div className="min-h-screen bg-gradient-to-br from-[#f7f1f1] to-[#e6d6d6] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Motivational Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 mb-8 shadow-lg border border-[#d8c4b8]/30">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[#5a4336] mb-2">My Learning Journey</h1>
              <div className="flex items-center gap-3">
                <Award className="w-8 h-8 text-[#c8a4a5]" />
                <p className="text-[#5a4336] text-lg font-medium">{motivationalMessage}</p>
              </div>
            </div>
            
            <button 
              onClick={() => navigate('/workshops')}
              className="mt-4 md:mt-0 bg-[#c8a4a5] text-white px-5 py-2 rounded-full hover:bg-[#a67d6d] transition-colors flex items-center gap-2 shadow-md"
            >
              <BookOpen className="w-4 h-4" />
              <span>Browse More Workshops</span>
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 border-4 border-[#c8a4a5] border-t-transparent rounded-full mx-auto animate-spin"></div>
            <p className="mt-4 text-[#5a4336] font-medium">Loading your workshops...</p>
          </div>
        ) : (
          <>
            {/* In Progress Workshops */}
            {pendingWorkshops.length > 0 && (
              <div className="mb-10">
                <h2 className="text-2xl font-semibold text-[#5a4336] mb-4 flex items-center gap-2">
                  <Clock className="w-6 h-6 text-[#a67d6d]" />
                  In Progress Workshops
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pendingWorkshops.map((workshop) => (
                    <WorkshopCard key={workshop._id} workshop={workshop} />
                  ))}
                </div>
              </div>
            )}

            {/* Completed Workshops */}
            {completedWorkshops.length > 0 && (
              <div className="mb-10">
                <h2 className="text-2xl font-semibold text-[#5a4336] mb-4 flex items-center gap-2">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                  Completed Workshops
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {completedWorkshops.map((workshop) => (
                    <WorkshopCard 
                      key={workshop._id} 
                      workshop={workshop} 
                      completed={true} 
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {workshops.length === 0 && (
              <div className="text-center py-16 bg-white rounded-xl shadow-lg border border-[#d8c4b8]/30">
                <TrophyIcon className="mx-auto w-20 h-20 text-[#c8a4a5] mb-6 opacity-75" />
                <h3 className="text-[#5a4336] text-2xl font-bold mb-2">
                  Your learning adventure starts here!
                </h3>
                <p className="text-[#a67d6d] mb-8 max-w-md mx-auto">
                  Explore and enroll in workshops to begin your journey. Track your progress and earn achievements.
                </p>
                <button 
                  onClick={() => navigate('/workshops')}
                  className="bg-[#c8a4a5] text-white px-6 py-3 rounded-full hover:bg-[#a67d6d] transition-colors shadow-md flex items-center gap-2 mx-auto"
                >
                  <BookOpen className="w-5 h-5" />
                  <span>Browse Workshops</span>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
    <Footer></Footer>
    </div>
  );
};

export default UserWorkshops;