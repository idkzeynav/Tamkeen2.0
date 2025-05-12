import React, { useState, useEffect, useRef } from 'react';
import { Search, Filter, PlayCircle, ChevronLeft, Menu, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { server } from '../../server';
import Footer from '../Layout/Footer'
const words = ["Create", "Learn", "Grow", "Inspire", "Master"];

const UserWorkshopView = () => {
  const navigate = useNavigate();
  const [workshops, setWorkshops] = useState([]);
  const [allWorkshops, setAllWorkshops] = useState([]); // Store all workshops
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [level, setLevel] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [wordIndex, setWordIndex] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const workshopsRef = useRef(null); // Reference for workshops section

  const levels = ['Beginner', 'Intermediate', 'Advanced'];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % words.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Fetch all workshops only once
  useEffect(() => {
    const fetchAllWorkshops = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`${server}/workshop/all-workshops`);
        setAllWorkshops(data.workshops);
        
        const uniqueCategories = [...new Set(data.workshops.map(workshop => workshop.category))];
        setCategories(uniqueCategories);
        
        setWorkshops(data.workshops);
      } catch (error) {
        console.error('Error fetching workshops:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllWorkshops();
  }, []);

  // Filter workshops based on search, level, and category
  useEffect(() => {
    let filteredWorkshops = [...allWorkshops];

    if (search) {
      const searchLower = search.toLowerCase();
      filteredWorkshops = filteredWorkshops.filter(workshop =>
        workshop.name.toLowerCase().includes(searchLower) ||
        workshop.description.toLowerCase().includes(searchLower)||
        workshop.category.toLowerCase().includes(searchLower) 
      );
    }

    if (level) {
      filteredWorkshops = filteredWorkshops.filter(workshop =>
        workshop.level === level
      );
    }

    if (category) {
      filteredWorkshops = filteredWorkshops.filter(workshop =>
        workshop.category === category
      );
    }

    setWorkshops(filteredWorkshops);
  }, [search, level, category, allWorkshops]);

  // Handle search input without scrolling
  const handleSearch = (e) => {
    e.preventDefault(); // Prevent form submission
    setSearch(e.target.value);
  };

  const getVideoId = (url) => {
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

  // Hero section component with slower animations
  const Hero = () => (
    <div className="relative h-[70vh] mb-12" style={{
      backgroundColor: '#d8c4b8',
      backgroundImage: 'radial-gradient(circle at 50% 50%, #c8a4a5 0%, transparent 75%)'
    }}>
      <button 
        onClick={() => navigate(-1)}
        className="absolute top-4 left-4 z-10 flex items-center gap-2 text-[#5a4336] hover:text-[#a67d6d] transition-colors duration-300"
      >
        <ChevronLeft size={24} />
        <span>Back</span>
      </button>

      {/* Menu Button */}
      <div className="absolute top-4 right-4 z-20" ref={menuRef}>
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="flex items-center justify-center w-10 h-10 rounded-full bg-white/90 hover:bg-white transition-colors duration-300 shadow-md hover:shadow-lg"
        >
          <Menu className="w-5 h-5 text-[#5a4336]" />
        </button>

        {/* Dropdown Menu */}
        {isMenuOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border-2 border-[#d8c4b8] overflow-hidden">
            <div 
              className="flex items-center gap-2 px-4 py-3 text-[#5a4336] hover:bg-[#d8c4b8]/20 cursor-pointer"
              onClick={() => {
                navigate('/Userworkshops');
                setIsMenuOpen(false);
              }}
            >
              <BookOpen className="w-4 h-4" />
              <span>Your Workshops</span>
            </div>
          </div>
        )}
      </div>

      <div className="absolute inset-0 bg-black/10" />
      <div className="relative h-full flex items-center justify-center text-[#5a4336]">
        <div className="text-center space-y-8">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-6xl md:text-7xl font-bold"
          >
            Time to{' '}
            <motion.span
              key={words[wordIndex]}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="inline-block"
              style={{ color: '#5a4336' }}
            >
              {words[wordIndex]}
            </motion.span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
            className="text-xl md:text-2xl max-w-2xl mx-auto"
          >
            Discover workshops that inspire creativity and fuel your passion for learning
          </motion.p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f7f1f1]">
      <Hero />
      
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md py-4 shadow-md mb-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-3 text-[#a67d6d]" size={20} />
              <input
                type="text"
                placeholder="Search workshops..."
                value={search}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-2 border-2 border-[#a67d6d] rounded-lg 
                         focus:outline-none focus:ring-2 focus:ring-[#c8a4a5] bg-white/90"
              />
            </div>
            
            <div className="relative w-full md:w-48">
              <Filter className="absolute left-3 top-3 text-[#a67d6d]" size={20} />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border-2 border-[#a67d6d] rounded-lg 
                         focus:outline-none focus:ring-2 focus:ring-[#c8a4a5] bg-white/90"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="relative w-full md:w-48">
              <Filter className="absolute left-3 top-3 text-[#a67d6d]" size={20} />
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border-2 border-[#a67d6d] rounded-lg 
                         focus:outline-none focus:ring-2 focus:ring-[#c8a4a5] bg-white/90"
              >
                <option value="">All Levels</option>
                {levels.map((lvl) => (
                  <option key={lvl} value={lvl}>{lvl}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div ref={workshopsRef} className="max-w-7xl mx-auto px-4 pb-12">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#5a4336] border-t-[#c8a4a5] mx-auto"></div>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {workshops.map((workshop, index) => {
              const firstVideoUrl = workshop.videos && workshop.videos[0] ? workshop.videos[0].youtubeUrl : '';
              const videoId = getVideoId(firstVideoUrl);
              
              return (
                <motion.div
                  key={workshop._id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.8,
                    delay: index * 0.1,
                    ease: "easeOut"
                  }}
                >
                  <Link to={`/workshopdetail/${workshop._id}`} className="group block">
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-all 
                                duration-500 hover:scale-[1.02] hover:shadow-xl">
                      <div className="aspect-w-16 aspect-h-9 relative">
                        <img
                          src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
                          alt={workshop.name}
                          className="w-full h-48 object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 
                                    transition-opacity duration-500 flex items-center justify-center">
                          <div className="flex items-center gap-2">
                            <PlayCircle className="text-white" size={24} />
                            <span className="text-white font-medium">
                              {workshop.videos?.length || 0} {workshop.videos?.length === 1 ? 'Lesson' : 'Lessons'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="p-4 bg-gradient-to-b from-white to-[#d8c4b8]/20">
                        <h2 className="text-xl font-semibold text-[#5a4336] mb-2">{workshop.name}</h2>
                        <div className="flex flex-wrap items-center gap-2 text-sm text-[#a67d6d] mb-3">
                          <span className="px-2 py-1 bg-[#d8c4b8]/30 rounded-full">{workshop.category}</span>
                          <span>•</span>
                          <span className="px-2 py-1 bg-[#c8a4a5]/30 rounded-full">{workshop.level}</span>
                          <span>•</span>
                          <span>{workshop.totalDuration}</span>
                        </div>
                        <p className="text-[#5a4336] line-clamp-2 mb-4">{workshop.description}</p>
                        {workshop.requirements && (
                          <div className="text-sm text-[#a67d6d]">
                            <strong>Requirements:</strong> {workshop.requirements}
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
      <Footer/>
    </div>
  );
};

export default UserWorkshopView;