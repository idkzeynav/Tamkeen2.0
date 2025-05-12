import React, { useState } from 'react';
import Chatbot from './Chatbot';

const Avatar = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);

  const handleAvatarClick = () => {
    setIsChatOpen(!isChatOpen);
  };

  return (
    <div>
      {!isChatOpen && (
        <div
          className="fixed bottom-6 right-6 cursor-pointer transform
transition-transform duration-300 hover:scale-110 animate-bounce"
          onClick={handleAvatarClick}
        >
          <div className="relative">
            <div className="absolute -top-2 -right-2 bg-[#a67d6d]
text-white text-xs px-2 py-1 rounded-full animate-pulse">
              Hi there! 👋
            </div>
            <div className="bg-[#faf5f1] p-3 rounded-full shadow-lg
hover:shadow-xl transition-shadow duration-300">
              <img
                src="eva.png"
                alt="Chat Avatar"
                className="w-12 h-12 rounded-full"
              />
            </div>
          </div>
        </div>
      )}

      {isChatOpen && (
        <div
          className="fixed bottom-6 right-6 bg-white rounded-2xl
shadow-2xl transform transition-all duration-300 ease-in-out
animate-slideIn"
          style={{
            animation: 'slideIn 0.3s ease-out',
          }}
        >
          <div className="relative">
            <button
              className="absolute -top-3 -right-3 bg-[#5a4336]
text-white w-8 h-8 rounded-full flex items-center justify-center
hover:bg-[#a67d6d] focus:outline-none focus:ring-2
focus:ring-[#a67d6d] focus:ring-offset-2 transition-all duration-300"
              onClick={handleAvatarClick}
            >
              ✖
            </button>
            <div className="p-4">
              <Chatbot />
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }

        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        .animate-bounce {
          animation: bounce 2s infinite;
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }

        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  );
};

export default Avatar;
