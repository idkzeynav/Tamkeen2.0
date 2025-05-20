import React from 'react';
import { BsShieldExclamation } from 'react-icons/bs';

const HateSpeechAlert = ({ message }) => {
  return (
    <div className="mb-6 p-4 rounded-lg flex items-start"
      style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', borderLeft: '4px solid #ef4444' }}>
      <div className="mr-3 mt-0.5">
        <BsShieldExclamation size={20} className="text-red-500" />
      </div>
      <div>
        <h3 className="font-medium text-red-600 mb-1">Content Moderation Alert</h3>
        <p className="text-sm text-gray-700">
          {message || "Your post contains content that violates our community guidelines on respectful communication. Please revise your message and try again."}
        </p>
      </div>
    </div>
  );
};

export default HateSpeechAlert;