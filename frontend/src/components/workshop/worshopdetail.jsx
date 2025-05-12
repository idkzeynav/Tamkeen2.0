import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { server } from '../../server';
import { useSelector } from 'react-redux';
import { Trophy, Play, Pause, CheckCircle, Lock, Unlock, Clock, Award, BookOpen } from 'lucide-react';
import WorkshopQuiz from './workshopquiz';

const WorkshopNotification = () => {
  const [isOpen, setIsOpen] = useState(true);

  const handleClose = () => {
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-6 right-6 max-w-sm bg-white rounded-xl shadow-lg overflow-hidden border-l-4 border-[#c8a4a5] z-50">
      <div className="p-5">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <BookOpen className="h-6 w-6 text-[#c8a4a5]" />
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-medium text-[#5a4336]">How to Complete This Workshop</h3>
            <div className="mt-2 text-sm text-[#a67d6d]">
              <p>To advance through this workshop:</p>
              <ul className="mt-1 ml-4 space-y-1">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-1 text-green-500" />
                  Watch at least 85% of each video
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-1 text-green-500" />
                  Complete videos to unlock the next ones
                </li>
                <li className="flex items-center">
                  <Trophy className="h-4 w-4 mr-1 text-[#c8a4a5]" />
                  Finish all videos to access certification quiz
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-gray-50 px-5 py-3">
        <div className="flex justify-end">
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-[#c8a4a5] to-[#a67d6d] hover:opacity-90 focus:outline-none"
            onClick={handleClose}
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
};

const WorkshopDetails = () => {
  const COMPLETION_THRESHOLD = 85;
  
  const [workshop, setWorkshop] = useState(null);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [videoProgress, setVideoProgress] = useState({});
  const [overallProgress, setOverallProgress] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [unlockedVideos, setUnlockedVideos] = useState(new Set([0]));
  const [showQuiz, setShowQuiz] = useState(false);
  const [showNotification, setShowNotification] = useState(true);
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.user);
  const playerRef = useRef(null);
  const progressInterval = useRef(null);
  const maxProgress = useRef({}); // Add this to track maximum progress
  // Track time watched for each video
  const videoWatchTime = useRef({});
  const videoDurations = useRef({});
  const lastSavedProgress = useRef({});

  const [quizStatus, setQuizStatus] = useState({
    hasTaken: false,
    hasPassed: false
  });
  useEffect(() => {
    if (isAuthenticated && user && isCompleted) {
      fetchQuizStatus();
    }
  }, [id, isAuthenticated, user, isCompleted]);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchWorkshopDetails();
      fetchUserProgress();
    }
  }, [id, isAuthenticated, user]);
  const handleQuizClick = () => {
    // Navigate to the quiz page with the workshop ID
    navigate(`/workshop/${id}/quiz`);
  };
  const getVideoId = (url) => {
    if (!url) return '';
    
    // Handle standard watch URLs (youtube.com/watch?v=VIDEO_ID)
    const watchMatch = url.match(/[?&]v=([^&]+)/);
    if (watchMatch) return watchMatch[1];
    
    // Handle shortened URLs (youtu.be/VIDEO_ID)
    const shortMatch = url.match(/youtu\.be\/([^?&]+)/);
    if (shortMatch) return shortMatch[1];
    
    // Handle embed URLs (youtube.com/embed/VIDEO_ID)
    const embedMatch = url.match(/youtube\.com\/embed\/([^?&]+)/);
    if (embedMatch) return embedMatch[1];
    
    // Handle share URLs (youtube.com/v/VIDEO_ID)
    const shareMatch = url.match(/youtube\.com\/v\/([^?&]+)/);
    if (shareMatch) return shareMatch[1];
    
    return '';
  };
  useEffect(() => {
    if (workshop?.videos[currentVideoIndex]) {
      // Add a small delay to ensure state is fully updated
      const timer = setTimeout(() => {
        setupYouTubePlayer();
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [currentVideoIndex, workshop]);
  useEffect(() => {
    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, []);
  const fetchQuizStatus = async () => {
    try {
      const config = { headers: { "Content-Type": "application/json" }, withCredentials: true };
      const { data } = await axios.get(`${server}/workshop/quiz-attempts/${id}`, config);
      
      setQuizStatus({
        hasTaken: data.attempts.length > 0,
        hasPassed: data.hasPassed
      });
    } catch (error) {
      console.error('Error fetching quiz status:', error);
    }
  };
  const getQuizButtonText = () => {
    if (quizStatus.hasPassed) {
      return "Get Certified";
    }
    if (quizStatus.hasTaken) {
      return "Retake Quiz";
    }
    return "Take Quiz & Get Certified";
  };
  const fetchWorkshopDetails = async () => {
    try {
      const { data } = await axios.get(`${server}/workshop/workshop/${id}`);
      setWorkshop(data.workshop);
    } catch (error) {
      console.error('Error fetching workshop:', error);
    }
  };

  const fetchUserProgress = async () => {
    try {
      const config = { headers: { "Content-Type": "application/json" }, withCredentials: true };
      const { data } = await axios.get(`${server}/workshop/user-progress/${id}/${user._id}`, config);

      if (data.userWorkshop) {
        const progress = data.userWorkshop.videoProgress || {};
        setVideoProgress(progress);
        setOverallProgress(data.userWorkshop.totalProgress || 0);
        setIsCompleted(data.userWorkshop.completed);
  // Initialize maxProgress with fetched progress
  // Set the current video index from saved data
  if (data.userWorkshop.lastVideoIndex !== undefined) {
    setCurrentVideoIndex(data.userWorkshop.lastVideoIndex);
  }
  
  // Store the timestamp to seek to when the player is ready
  if (data.userWorkshop.lastVideoTime) {
    videoWatchTime.current[data.userWorkshop.lastVideoIndex] = data.userWorkshop.lastVideoTime;
  }
  

  Object.entries(progress).forEach(([index, value]) => {
    maxProgress.current[index] = value;
    lastSavedProgress.current[index] = value;
  });
        const unlocked = new Set([0]);
        Object.entries(progress).forEach(([index, progress]) => {
          if (progress >= COMPLETION_THRESHOLD) {
            unlocked.add(parseInt(index));
            unlocked.add(parseInt(index) + 1);
          }
        });
        setUnlockedVideos(unlocked);
      }
    } catch (error) {
      console.error('Error fetching progress:', error);
    }
  };

  const setupYouTubePlayer = () => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      document.body.appendChild(tag);
      
      window.onYouTubeIframeAPIReady = createPlayer;
    } else {
      createPlayer();
    }
  };

  const createPlayer = () => {
    if (!workshop?.videos[currentVideoIndex]?.youtubeUrl) return;
    
    const videoUrl = workshop.videos[currentVideoIndex].youtubeUrl;
    const videoId = getVideoId(videoUrl);
    
    if (!videoId) {
      console.error('Could not extract video ID from URL:', videoUrl);
      return;
    }
  
    if (playerRef.current) {
      playerRef.current.destroy();
    }
  
    playerRef.current = new window.YT.Player('youtube-player', {
      videoId,
      events: {
        onReady: onPlayerReady,
        onStateChange: onPlayerStateChange
      },
      playerVars: {
        enablejsapi: 1,
        origin: window.location.origin,
        modestbranding: 1,
        rel: 0,
        autoplay: 0, // Explicitly prevent autoplay
        playsinline: 1
      }
    });
  };

  const onPlayerReady = (event) => {
    const duration = event.target.getDuration();
    videoDurations.current[currentVideoIndex] = duration;
  
  
    // Seek to the saved position if available
    const savedTime = videoWatchTime.current[currentVideoIndex];
    if (savedTime && savedTime > 0) {
      // Add a small delay to ensure seeking works
      setTimeout(() => {
        event.target.seekTo(savedTime);
        // Optionally start playing automatically
         //event.target.playVideo();
         event.target.pauseVideo();
      }, 500);
    }
  };
  

  const onPlayerStateChange = (event) => {
    const PlayerState = window.YT.PlayerState;
    
    switch (event.data) {
      case PlayerState.PLAYING:
        setIsPlaying(true);
        startWatchTimer();
        break;
      case PlayerState.PAUSED:
      case PlayerState.ENDED:
        setIsPlaying(false);
        updateVideoProgress();
        break;
      default:
        break;
    }
  };
 const startWatchTimer = () => {
  if (progressInterval.current) {
    clearInterval(progressInterval.current);
  }

  if (!videoWatchTime.current[currentVideoIndex]) {
    videoWatchTime.current[currentVideoIndex] = 0;
  }

  progressInterval.current = setInterval(() => {
    if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
      const currentTime = playerRef.current.getCurrentTime();
      const duration = videoDurations.current[currentVideoIndex];
      
      if (duration) {
        videoWatchTime.current[currentVideoIndex] = currentTime;
        const currentProgress = Math.min(100, Math.floor((currentTime / duration) * 100));
        
        // Update progress only if it exceeds the previous maximum
        const existingMax = maxProgress.current[currentVideoIndex] || 0;
        const newProgress = Math.max(currentProgress, existingMax);
        
        if (newProgress > (lastSavedProgress.current[currentVideoIndex] || 0)) {
          const newProgressState = {
            ...videoProgress,
            [currentVideoIndex]: newProgress
          };
          
          setVideoProgress(newProgressState);
          maxProgress.current[currentVideoIndex] = newProgress;
          lastSavedProgress.current[currentVideoIndex] = newProgress;
          
          const total = Object.values(newProgressState).reduce((sum, val) => sum + val, 0);
          const newOverallProgress = Math.floor(total / workshop.videos.length);
          setOverallProgress(newOverallProgress);
          
          // Check if ALL videos have reached the threshold
          const allVideosCompleted = workshop.videos.every((_, index) => 
            (newProgressState[index] || 0) >= COMPLETION_THRESHOLD
          );
            
          // Only mark as completed if ALL videos have reached the threshold
          setIsCompleted(allVideosCompleted);
          
          saveProgress(newProgressState, newOverallProgress, allVideosCompleted);
          
          if (newProgress >= COMPLETION_THRESHOLD) {
            setUnlockedVideos(prev => new Set([...prev, currentVideoIndex + 1]));
          }
        }
      }
    }
  }, 1000);
};
  const handleVideoChange = (index) => {
    if (!unlockedVideos.has(index)) return;
     // Save progress of current video before switching
  if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
    const currentTime = playerRef.current.getCurrentTime();
    videoWatchTime.current[currentVideoIndex] = currentTime;
    
    // Save current video time and index explicitly
    saveProgress(
      videoProgress,
      overallProgress,
      isCompleted
    );
  }
  
    // Clear existing interval before changing video
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
    }
    
    setCurrentVideoIndex(index);
    setIsPlaying(false);
    
    // Restore saved progress for the new video
    videoWatchTime.current[index] = videoDurations.current[index] * (videoProgress[index] || 0) / 100;
  };
 const updateVideoProgress = () => {
  const watchTime = videoWatchTime.current[currentVideoIndex] || 0;
  const duration = videoDurations.current[currentVideoIndex];
  
  if (duration) {
    const progress = Math.min(100, Math.floor((watchTime / duration) * 100));
    
    // Only update if new progress is higher than last saved
    if (progress > (lastSavedProgress.current[currentVideoIndex] || 0)) {
      const newProgress = {
        ...videoProgress,
        [currentVideoIndex]: progress
      };
      
      setVideoProgress(newProgress);
      lastSavedProgress.current[currentVideoIndex] = progress;
      
      const total = Object.values(newProgress).reduce((sum, val) => sum + val, 0);
      const newOverallProgress = Math.floor(total / workshop.videos.length);
      setOverallProgress(newOverallProgress);
      
      // Check if ALL videos have reached the threshold
      const allVideosCompleted = workshop.videos.every((_, index) => 
        (newProgress[index] || 0) >= COMPLETION_THRESHOLD
      );
      
      // Only mark as completed if ALL videos have reached the threshold
      setIsCompleted(allVideosCompleted);

      saveProgress(newProgress, newOverallProgress, allVideosCompleted);
    }
  }
};

  const saveProgress = async (progress, totalProgress, completed) => {
    if (!isAuthenticated || !user) return;

    try {
      const config = { 
        headers: { "Content-Type": "application/json" }, 
        withCredentials: true 
      };
  // Get current video time from player if available
  let currentTime = 0;
  if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
    currentTime = playerRef.current.getCurrentTime();
  }
      await axios.post(
        `${server}/workshop/track-progress`,
        {
          workshopId: id,
          userId: user._id,
          videoProgress: progress,
          totalProgress,
          completed,
          lastVideoIndex: currentVideoIndex,   // Add current video index
          lastVideoTime: currentTime           // Add current timestamp
        },
        config
      );
    } catch (error) {
      console.error('Error saving progress:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      }
    }
  };



  const getYouTubeEmbedUrl = (url) => {
    const videoId = getVideoId(url);
    if (!videoId) return '';
    return `https://www.youtube.com/embed/${videoId}?enablejsapi=1&origin=${window.location.origin}&modestbranding=1&rel=0&showinfo=0`;
  };
  

  const getStatusColor = (index, progress) => {
    if (!unlockedVideos.has(index)) return 'text-gray-400';
    if (progress >= COMPLETION_THRESHOLD) return 'text-green-600';
    if (progress > 0) return 'text-yellow-500';
    return 'text-[#a67d6d]';
  };

  const getProgressIndicatorStyle = (progress) => {
    if (progress >= COMPLETION_THRESHOLD) return 'bg-green-600';
    if (progress > 0) return 'bg-yellow-500';
    return 'bg-gray-200';
  };

  const currentVideo = workshop?.videos[currentVideoIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#d8c4b8] to-[#c8a4a5] py-8 px-4">
      {showNotification && <WorkshopNotification />}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Video Player and Progress */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Player */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="relative">
                {currentVideo && (
                  <iframe
                    id="youtube-player"
                    key={currentVideo.youtubeUrl}
                    src={getYouTubeEmbedUrl(currentVideo.youtubeUrl)}
                    title={currentVideo.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full aspect-video"
                  />
                )}
                <div className="absolute top-4 right-4 bg-black/50 rounded-full p-2">
                  {isPlaying ? 
                    <Pause className="text-white" /> : 
                    <Play className="text-white" />
                  }
                </div>
              </div>
            </div>

            {/* Current Video Info */}
            {currentVideo && (
              <div className="bg-white/90 backdrop-blur rounded-xl p-6 shadow-lg">
                <h2 className="text-xl font-semibold text-[#5a4336] mb-2">
                  {currentVideo.title}
                </h2>
                <div className="flex items-center gap-4 text-sm text-[#a67d6d]">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{currentVideo.duration}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Award className="w-4 h-4" />
                    <span>{videoProgress[currentVideoIndex] || 0}% Complete</span>
                  </div>
                </div>
              </div>
            )}

            {/* Overall Progress Bar */}
            <div className="bg-white/90 backdrop-blur rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-[#5a4336]">Overall Progress</h3>
                <span className="text-[#5a4336] font-medium">{overallProgress}%</span>
              </div>
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden mb-4">
                <div
                  className="h-full bg-gradient-to-r from-[#c8a4a5] to-[#a67d6d] transition-all duration-300"
                  style={{ width: `${overallProgress}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  {isCompleted ? (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-medium">Workshop Completed!</span>
                    </div>
                  ) : (
                    <span className="text-[#a67d6d]">
                      Complete {COMPLETION_THRESHOLD}% of each video to unlock the next
                    </span>
                  )}
                </div>
                <span className="font-medium text-[#5a4336]">
                  {Object.values(videoProgress).filter(p => p >= COMPLETION_THRESHOLD).length} / {workshop?.videos?.length} videos
                </span>
              </div>
            </div>
            {isCompleted && (
      <div className="bg-white/90 backdrop-blur rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-[#c8a4a5]" />
            <h3 className="font-semibold text-[#5a4336]">Workshop Completed!</h3>
          </div>
          <button 
            onClick={handleQuizClick}
            className="px-6 py-2 rounded-lg bg-gradient-to-r from-[#c8a4a5] to-[#a67d6d] text-white hover:opacity-90 transition-opacity"
          >
            {getQuizButtonText()}
          </button>
        </div>
      </div>
    )}
            {/* Learning Path */}
            <div className="bg-white/90 backdrop-blur rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-[#5a4336] mb-6">Learning Path</h3>
              <div className="space-y-4">
                {workshop?.videos.map((video, index) => (
                  <div
                    key={index}
                    onClick={() => handleVideoChange(index)}
                    className={`relative p-4 rounded-lg border-l-4 transition-all duration-300 ${
                      unlockedVideos.has(index)
                        ? index === currentVideoIndex
                          ? 'border-[#c8a4a5] bg-[#d8c4b8]/10'
                          : 'border-gray-200 hover:border-[#c8a4a5] hover:bg-gray-50 cursor-pointer'
                        : 'border-gray-200 opacity-60 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      {/* Status Icon */}
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                        unlockedVideos.has(index) ? 'border-[#c8a4a5]' : 'border-gray-200'
                      }`}>
                        {videoProgress[index] >= COMPLETION_THRESHOLD ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : unlockedVideos.has(index) ? (
                          <Unlock className="w-5 h-5 text-[#c8a4a5]" />
                        ) : (
                          <Lock className="w-5 h-5 text-gray-400" />
                        )}
                      </div>

                     
                          {/* Video Info */}
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium text-[#5a4336]">{video.title}</h4>
                              <span className={`text-sm font-medium ${getStatusColor(index, videoProgress[index] || 0)}`}>
                                {videoProgress[index] || 0}%
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-[#a67d6d] mt-1">
                              <Clock className="w-4 h-4" />
                              <span>{video.duration}</span>
                            </div>
                          </div>
                        </div>
    
                        {/* Progress Bar */}
                        <div className="mt-3 h-1 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 ${getProgressIndicatorStyle(videoProgress[index] || 0)}`}
                            style={{ width: `${videoProgress[index] || 0}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
    
              {/* Right Column - Workshop Info */}
              <div className="bg-white/90 backdrop-blur rounded-2xl shadow-xl p-8">
                <h1 className="text-3xl font-bold text-[#5a4336] mb-6">{workshop?.name}</h1>
                
                {/* Tags */}
                <div className="flex flex-wrap gap-3 mb-6">
                  {workshop && [workshop.category, workshop.level, workshop.totalDuration].map((tag, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-[#d8c4b8]/30 to-[#c8a4a5]/30 text-[#5a4336]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
    
                {/* Description */}
                <p className="text-[#5a4336] leading-relaxed mb-8">{workshop?.description}</p>
    
                {/* Requirements */}
                {workshop?.requirements && (
                  <div className="border-t border-[#d8c4b8] pt-6">
                    <div className="flex items-center gap-2 text-[#5a4336] mb-4">
                      <BookOpen className="w-5 h-5" />
                      <h3 className="text-xl font-semibold">Requirements</h3>
                    </div>
                    <p className="text-[#a67d6d] leading-relaxed">{workshop.requirements}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    };
    
    export default WorkshopDetails;