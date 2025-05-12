import React, { useState } from 'react';
import { useSpring, animated } from 'react-spring';
import { Eye, EyeOff, Mail, Lock, User, Upload } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { server } from '../../server';
import { toast } from 'react-toastify';

const Signup = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const [avatar, setAvatar] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Animation for the main card
  const cardAnimation = useSpring({
    from: { opacity: 0, transform: 'scale(0.8)' },
    to: { opacity: 1, transform: 'scale(1)' },
    config: { tension: 200, friction: 20 }
  });

  // Animation for form elements
  const formAnimation = useSpring({
    from: { opacity: 0, transform: 'translateY(50px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
    delay: 300,
  });

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    setAvatar(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast.error("Please fill in all fields.");
      return;
    }

    setIsLoading(true);
    const config = { headers: { "Content-Type": "multipart/form-data" } };
    const newForm = new FormData();
    newForm.append("file", avatar);
    newForm.append("name", name);
    newForm.append("email", email);
    newForm.append("password", password);

    try {
      const response = await axios.post(`${server}/user/create-user`, newForm, config);
      toast.success(response.data.message);
      setName("");
      setEmail("");
      setPassword("");
      setAvatar(null);
      navigate("/login");
    } catch (error) {
      toast.error(error.response?.data?.message || "An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#d8c4b8] via-[#c8a4a5] to-[#a67d6d] p-4 overflow-hidden relative">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="butterfly butterfly1"></div>
        <div className="butterfly butterfly2"></div>
        <div className="butterfly butterfly3"></div>
        
        <div className="floating-circle circle1"></div>
        <div className="floating-circle circle2"></div>
        <div className="floating-circle circle3"></div>
      </div>

      <animated.div style={cardAnimation} className="w-full max-w-md relative z-10">
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl p-8 relative overflow-hidden">
          <div className="flex justify-center mb-8">
            <span className="text-[#5a4336] text-4xl font-bold">تمكين</span>
          </div>

          <animated.form style={formAnimation} onSubmit={handleSubmit} className="space-y-6">
            {/* Name Input */}
            <div className="input-container group">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-[#a67d6d] transition-all duration-300" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:border-[#a67d6d] focus:ring-2 focus:ring-[#d8c4b8] transition-all duration-300 outline-none hover:shadow-lg"
                placeholder="Full Name"
                required
              />
              <div className="input-glow"></div>
            </div>

            {/* Email Input */}
            <div className="input-container group">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-[#a67d6d] transition-all duration-300" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:border-[#a67d6d] focus:ring-2 focus:ring-[#d8c4b8] transition-all duration-300 outline-none hover:shadow-lg"
                placeholder="Email"
                required
              />
              <div className="input-glow"></div>
            </div>

            {/* Password Input */}
            <div className="input-container group relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-[#a67d6d] transition-all duration-300" />
              <input
                type={visible ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-12 py-3 rounded-lg border border-gray-200 focus:border-[#a67d6d] focus:ring-2 focus:ring-[#d8c4b8] transition-all duration-300 outline-none hover:shadow-lg"
                placeholder="Password"
                required
              />
              <button
                type="button"
                onClick={() => setVisible(!visible)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#a67d6d] transition-all duration-300"
              >
                {visible ? (
                  <Eye className="w-5 h-5 hover:scale-110" />
                ) : (
                  <EyeOff className="w-5 h-5 hover:scale-110" />
                )}
              </button>
              <div className="input-glow"></div>
            </div>

            {/* Avatar Upload */}
            <div className="input-container group">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                  {avatar ? (
                    <img
                      src={URL.createObjectURL(avatar)}
                      alt="avatar"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <User className="w-6 h-6 text-gray-400" />
                  )}
                </div>
                <label className="flex-1">
                  <div className="w-full py-3 px-4 rounded-lg border border-gray-200 hover:border-[#a67d6d] hover:shadow-lg cursor-pointer transition-all duration-300 flex items-center justify-center space-x-2 bg-white">
                    <Upload className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-600">Upload Avatar</span>
                  </div>
                  <input
                    type="file"
                    onChange={handleFileInputChange}
                    accept=".jpg,.jpeg,.png"
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-gradient-to-r from-[#a67d6d] to-[#5a4336] text-white font-medium rounded-lg 
                       relative overflow-hidden button-shine hover:shadow-xl 
                       disabled:opacity-70 disabled:cursor-not-allowed
                       transform hover:scale-105 transition-all duration-300"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating account...
                </span>
              ) : (
                "Create Account"
              )}
            </button>
          </animated.form>

          <div className="mt-8 text-center">
            <span className="text-gray-600">Already have an account? </span>
            <Link 
              to="/login" 
              className="text-[#a67d6d] hover:text-[#5a4336] font-medium transition-colors duration-300 hover:underline link-shine"
            >
              Sign in
            </Link>
          </div>
        </div>
      </animated.div>

      <style jsx>{`
        /* Butterfly Animation */
        .butterfly {
          position: absolute;
          width: 30px;
          height: 30px;
          background: rgba(255, 255, 255, 0.6);
          clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
          animation: flutter 20s infinite linear;
        }

        .butterfly1 { top: 20%; left: 10%; animation-delay: 0s; }
        .butterfly2 { top: 50%; right: 15%; animation-delay: -5s; }
        .butterfly3 { bottom: 30%; left: 50%; animation-delay: -10s; }

        @keyframes flutter {
          0% { transform: translate(0, 0) rotate(0deg) scale(1); }
          25% { transform: translate(100px, -50px) rotate(90deg) scale(1.2); }
          50% { transform: translate(200px, 0) rotate(180deg) scale(1); }
          75% { transform: translate(100px, 50px) rotate(270deg) scale(1.2); }
          100% { transform: translate(0, 0) rotate(360deg) scale(1); }
        }

        /* Floating Circles */
        .floating-circle {
          position: absolute;
          border-radius: 50%;
          filter: blur(20px);
          opacity: 0.3;
          animation: float 10s infinite ease-in-out;
        }

        .circle1 {
          width: 150px;
          height: 150px;
          background: #d8c4b8;
          top: 20%;
          left: 20%;
          animation-delay: 0s;
        }

        .circle2 {
          width: 100px;
          height: 100px;
          background: #c8a4a5;
          top: 60%;
          right: 20%;
          animation-delay: -3s;
        }

        .circle3 {
          width: 200px;
          height: 200px;
          background: #a67d6d;
          bottom: 10%;
          left: 30%;
          animation-delay: -6s;
        }

        @keyframes float {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          50% { transform: translate(-20px, -20px) rotate(180deg); }
        }

        /* Input Glow Effect */
        .input-container {
          position: relative;
        }

        .input-glow {
          position: absolute;
          inset: -2px;
          background: linear-gradient(90deg, #d8c4b8, #a67d6d, #5a4336, #c8a4a5);
          background-size: 400% 400%;
          border-radius: lg;
          z-index: -1;
          animation: glow 3s ease-in-out infinite;
          opacity: 0;
          transition: opacity 0.3s;
        }

        .input-container:hover .input-glow {
          opacity: 0.5;
        }

        @keyframes glow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        /* Button Shine Effect */
        .button-shine {
          position: relative;
          overflow: hidden;
        }

        .button-shine::after {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: linear-gradient(
            to bottom right,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 0.1) 50%,
            rgba(255, 255, 255, 0) 100%
          );
          transform: rotate(45deg);
          animation: shine 3s infinite;
        }

        @keyframes shine {
          0% { transform: translateX(-100%) rotate(45deg); }
          100% { transform: translateX(100%) rotate(45deg); }
        }

        /* Link Shine Effect */
        .link-shine {
          position: relative;
          overflow: hidden;
        }

        .link-shine::after {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.2),
            transparent
          );
          animation: linkShine 2s infinite;
        }

        @keyframes linkShine {
          100% { left: 100%; }
        }
      `}</style>
    </div>
  );
};

export default Signup;