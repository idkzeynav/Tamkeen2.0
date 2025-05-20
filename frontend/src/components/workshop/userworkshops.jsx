import React, { useState, useEffect, useRef } from 'react';
import { Search, Filter, PlayCircle, ChevronLeft, Menu, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { server } from '../../server';
import Footer from '../Layout/Footer';
import Header from '../Layout/Header';

const UserWorkshopView = () => {
  const navigate = useNavigate();
  const [workshops, setWorkshops] = useState([]);
  const [allWorkshops, setAllWorkshops] = useState([]); // Store all workshops
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [level, setLevel] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);
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

  // Simple header section with navigation without animation
  const SimpleHeader = () => (
    <div className="relative py-6 mb-8 bg-[#f7f1f1]">
      <Header />
      
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-[#5a4336] hover:text-[#a67d6d] transition-colors duration-300"
          >
     
            
          </button>

          {/* Menu Button */}
          <div className="relative z-20" ref={menuRef}>
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
        </div>
        
        <div className="text-center mt-8 mb-4">
          <h1 className="text-4xl font-bold text-[#5a4336]">Workshop Gallery</h1>
          <p className="text-xl text-[#5a4336] mt-2">
            Discover workshops that inspire creativity and fuel your passion for learning
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f7f1f1]">
      <SimpleHeader />
      
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