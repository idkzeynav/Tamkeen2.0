import React, { useEffect, useState, useRef } from 'react';
import { FaHandsHelping, FaBook, FaGlobe, FaUsers, FaLeaf } from 'react-icons/fa';

const Whyus = ({ navbarHeight = '80px' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const features = [
    {
      title: 'Empowering Women',
      description: 'Bridging economic and social barriers for women through innovative programs and initiatives.',
      icon: <FaHandsHelping size={28} />,
      stat: '10K+',
      statText: 'Women Empowered'
    },
    {
      title: 'Skill Development',
      description: 'Comprehensive training programs designed to enhance professional and personal growth.',
      icon: <FaBook size={28} />,
      stat: '50+',
      statText: 'Training Programs'
    },
    {
      title: 'Community Support',
      description: 'Building strong networks of support and collaboration among women globally.',
      icon: <FaUsers size={28} />,
      stat: '100+',
      statText: 'Community Events'
    }
  ];

  return (
    <div
      ref={sectionRef}
      className="relative min-h-screen py-20 px-4 overflow-hidden"
      style={{
        backgroundColor: '#d8c4b8',
        backgroundImage: 'radial-gradient(circle at 50% 50%, #c8a4a5 0%, transparent 75%)',
        paddingTop: `calc(${navbarHeight} + 2rem)`, // Add padding equal to navbar height plus some extra space
        marginTop: '0', // Remove any top margin
        zIndex: 0 // Ensure this section has a lower z-index than the navbar
      }}
    >
      {/* Shimmer Background */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(200)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              backgroundColor: '#ffffff',
              width: Math.random() * 8 + 1 + 'px',
              height: Math.random() * 8 + 1 + 'px',
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
              opacity: Math.random() * 0.5 + 0.1,
              animation: `shimmer ${Math.random() * 2 + 1}s linear infinite`,
              animationDelay: `-${Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header Section */}
        <div className="text-center mb-20">
          <h2
            className={`text-[#5a4336] text-5xl font-bold mb-6 transition-all duration-700 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            Why Choose Us
          </h2>
          <p
            className={`text-[#5a4336] text-lg max-w-2xl mx-auto transition-all duration-700 delay-200 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            Join us in our mission to create lasting impact and empower women across the globe
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`group bg-white rounded-2xl p-8 transition-all duration-700 ease-out hover:shadow-2xl relative ${
                isVisible
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-20'
              }`}
              style={{
                transitionDelay: `${200 + index * 100}ms`,
                backgroundColor: 'rgba(255, 255, 255, 0.85)', // Changed to a slightly transparent white for better visibility
                border: '1px solid rgba(166, 125, 109, 0.1)'
              }}
            >
              {/* Icon & Title Section */}
              <div className="flex items-center mb-6">
                <div
                  className="p-3 rounded-lg mr-4 transition-transform group-hover:scale-110 duration-500"
                  style={{ backgroundColor: '#a67d6d20' }}
                >
                  <div className="text-[#5a4336]">{feature.icon}</div>
                </div>
                <h3 className="text-xl font-semibold text-[#5a4336]">{feature.title}</h3>
              </div>

              {/* Description */}
              <p className="text-[#5a4336] mb-6 text-sm leading-relaxed">
                {feature.description}
              </p>

              {/* Stats Section */}
              <div className="pt-6 border-t border-[#a67d6d20]">
                <div className="text-2xl font-bold text-[#5a4336]">{feature.stat}</div>
                <div className="text-sm text-[#5a4336]">{feature.statText}</div>
              </div>

              {/* Hover Effect Border */}
              <div className="absolute inset-0 rounded-2xl transition-all duration-500 opacity-0 group-hover:opacity-100"
                   style={{ border: '2px solid #a67d6d30' }} />
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translate(0, 0);
            opacity: 0;
          }
          25% {
            opacity: 0.5;
          }
          50% {
            transform: translate(20vw, -50vh);
            opacity: 0.8;
          }
          75% {
            opacity: 0.5;
          }
          100% {
            transform: translate(0, -100vh);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default Whyus;