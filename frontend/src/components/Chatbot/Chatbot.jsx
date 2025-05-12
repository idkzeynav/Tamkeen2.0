import React, { useState } from 'react';
import { Send } from 'lucide-react';

const Chatbot = () => {
  const [messages, setMessages] = useState([
    { role: 'user', text: 'Hey, how are you today?' },
    { role: 'ai', text: 'Hi! I am Tammy, your friendly Tamkeen assistant. How can I help you today?' },
  ]);
  const [input, setInput] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim()) {
      setMessages([...messages, { role: 'user', text: input }]);
      setInput('');
      // Here you would typically make an API call to get the AI response
      // For demo purposes, we'll just add a mock response
      setTimeout(() => {
        setMessages(prev => [...prev, {
          role: 'ai',
          text: "This is a placeholder response. You would typically integrate your AI service here."
        }]);
      }, 1000);
    }
  };

  return (
    <div className="w-[350px] h-[500px] bg-[#faf5f1] rounded-2xl
shadow-md flex flex-col">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end'
: 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] p-3 rounded-xl shadow-sm
                ${message.role === 'user'
                  ? 'bg-white text-[#5a4336]'
                  : 'bg-[#f3e8e3] text-[#5a4336]'
                }`}
            >
              {message.text}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="p-4 bg-[#faf5f1]">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Tammy anything..."
            className="flex-1 p-2 rounded-xl bg-white border
border-[#e8d8d0] focus:border-[#a67d6d] focus:ring-2
focus:ring-[#a67d6d] focus:ring-opacity-20 text-[#5a4336]
outline-none"
          />
          <button
            type="submit"
            className="p-2 rounded-xl bg-[#f3e8e3] hover:bg-[#e8d8d0]
active:bg-[#e8d8d0] text-[#5a4336]"
          >
            <Send size={20} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default Chatbot;
