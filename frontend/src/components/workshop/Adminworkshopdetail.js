import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { server } from '../../server';
import { BsChevronLeft, BsChevronRight } from 'react-icons/bs';

const AdminWorkshopDetail = () => {
  const { id } = useParams();
  const [workshop, setWorkshop] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchWorkshopDetails = async () => {
      try {
        const [workshopRes, quizRes] = await Promise.all([
          axios.get(`${server}/workshop/workshop/${id}`),
          axios.get(`${server}/workshop/workshop/${id}/quiz`)
        ]);
        
        const workshopData = workshopRes.data.workshop;
        workshopData.requirements = Array.isArray(workshopData.requirements) 
          ? workshopData.requirements 
          : workshopData.requirements 
            ? [workshopData.requirements] 
            : [];
            
        setWorkshop(workshopData);
        setQuiz(quizRes.data.quiz);
      } catch (error) {
        console.error('Error fetching workshop details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkshopDetails();
  }, [id]);

  const getVideoId = (url) => {
    if (!url) return '';
    const match = url.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/watch\?v=|\/watch\?.+&v=))([^&?]+)/);
    return match ? match[1] : '';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f1f1] flex items-center justify-center">
        <div className="text-[#5a4336]">Loading...</div>
      </div>
    );
  }

  if (!workshop) {
    return (
      <div className="min-h-screen bg-[#f7f1f1] flex items-center justify-center">
        <div className="text-[#5a4336]">Workshop not found</div>
      </div>
    );
  }

  const currentVideo = workshop.videos[currentVideoIndex];
  const videoId = currentVideo ? getVideoId(currentVideo.youtubeUrl) : '';

  const requirements = Array.isArray(workshop.requirements) 
    ? workshop.requirements 
    : [];

  return (
    <div className="min-h-screen bg-[#f7f1f1] py-8 flex justify-center">
      <div className="max-w-4xl w-full px-4">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="aspect-w-16 aspect-h-9 mb-4">
            <iframe
              className="w-full h-[400px] rounded-lg"
              src={`https://www.youtube.com/embed/${videoId}`}
              title={currentVideo?.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          
          {workshop.videos.length > 1 && (
            <div className="flex items-center justify-between mt-4">
              <button
                onClick={() => setCurrentVideoIndex(prev => 
                  prev > 0 ? prev - 1 : workshop.videos.length - 1
                )}
                className="p-2 text-[#5a4336] hover:text-[#a67d6d]"
              >
                <BsChevronLeft size={20} />
              </button>
              <span className="text-[#5a4336]">
                {currentVideo?.title} ({currentVideoIndex + 1}/{workshop.videos.length})
              </span>
              <button
                onClick={() => setCurrentVideoIndex(prev => 
                  prev < workshop.videos.length - 1 ? prev + 1 : 0
                )}
                className="p-2 text-[#5a4336] hover:text-[#a67d6d]"
              >
                <BsChevronRight size={20} />
              </button>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="flex border-b">
            <button
              className={`px-6 py-3 font-medium ${
                activeTab === 'overview'
                  ? 'text-[#5a4336] border-b-2 border-[#5a4336]'
                  : 'text-[#a67d6d]'
              }`}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>
            <button
              className={`px-6 py-3 font-medium ${
                activeTab === 'curriculum'
                  ? 'text-[#5a4336] border-b-2 border-[#5a4336]'
                  : 'text-[#a67d6d]'
              }`}
              onClick={() => setActiveTab('curriculum')}
            >
              Curriculum
            </button>
            {quiz && (
              <button
                className={`px-6 py-3 font-medium ${
                  activeTab === 'quiz'
                    ? 'text-[#5a4336] border-b-2 border-[#5a4336]'
                    : 'text-[#a67d6d]'
                }`}
                onClick={() => setActiveTab('quiz')}
              >
                Quiz
              </button>
            )}
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div>
                <h2 className="text-2xl font-bold text-[#5a4336] mb-4">{workshop.name}</h2>
                <p className="text-[#a67d6d] mb-6">{workshop.description}</p>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-[#5a4336] mb-2">Requirements</h3>
                    <ul className="list-disc list-inside text-[#a67d6d]">
                      {requirements.map((req, index) => (
                        <li key={index}>{req}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="flex gap-4">
                    <span className="px-3 py-1 bg-[#d8c4b8] text-[#5a4336] rounded-full">
                      {workshop.category}
                    </span>
                    <span className="px-3 py-1 bg-[#c8a4a5] text-white rounded-full">
                      {workshop.level}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'curriculum' && (
              <div className="space-y-4">
                {workshop.videos.map((video, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg cursor-pointer ${
                      currentVideoIndex === index
                        ? 'bg-[#d8c4b8]'
                        : 'bg-white hover:bg-[#f7f1f1]'
                    }`}
                    onClick={() => setCurrentVideoIndex(index)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-[#5a4336] text-white flex items-center justify-center">
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="font-medium text-[#5a4336]">{video.title}</h3>
                        <p className="text-sm text-[#a67d6d]">{video.duration}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'quiz' && quiz && (
              <div>
                <h2 className="text-2xl font-bold text-[#5a4336] mb-6">Workshop Quiz</h2>
                <div className="space-y-6">
                  {quiz.questions?.map((question, index) => (
                    <div key={index} className="space-y-4">
                      <h3 className="font-medium text-[#5a4336]">
                        {index + 1}. {question.question}
                      </h3>
                      <div className="ml-4 space-y-2">
                        {question.options.map((option, optIndex) => (
                          <div key={optIndex} className="flex items-center gap-2">
                            <div className={`p-3 rounded-lg w-full ${
                              question.correctAnswer === optIndex ? 'bg-green-100' : ''
                            }`}>
                              {option}
                              {question.correctAnswer === optIndex && (
                                <span className="ml-2 text-green-600">(Correct Answer)</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminWorkshopDetail;