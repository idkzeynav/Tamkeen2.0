import React, { useState } from "react";
import axios from "axios";
import { server } from "../../server";
import { useNavigate } from "react-router-dom";
import { AlertCircle, CheckCircle2 } from "lucide-react";

const CreateWorkshop = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [workshopBasicInfo, setWorkshopBasicInfo] = useState({
    name: "",
    category: "",
    description: "",
    totalDuration: "",
    requirements: "",
    level: "Beginner",
    videos: []
  });

  const [quizData, setQuizData] = useState({
    title: "",
    description: "",
    passingScore: 70,
    timeLimit: 15,
    questions: [
      {
        question: "",
        options: ["", "", "", ""],
        correctAnswer: null,
        explanation: ""
      }
    ]
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleBasicInfoChange = (e) => {
    const { name, value } = e.target;
    setWorkshopBasicInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleVideoChange = (index, field, value) => {
    const newVideos = [...workshopBasicInfo.videos];
    newVideos[index] = {
      ...newVideos[index],
      [field]: value,
    };
    setWorkshopBasicInfo(prev => ({
      ...prev,
      videos: newVideos
    }));
  };

  const addVideo = () => {
    setWorkshopBasicInfo(prev => ({
      ...prev,
      videos: [...prev.videos, { title: "", youtubeUrl: "", duration: "" }]
    }));
  };

  const removeVideo = (index) => {
    const newVideos = workshopBasicInfo.videos.filter((_, i) => i !== index);
    setWorkshopBasicInfo(prev => ({
      ...prev,
      videos: newVideos
    }));
  };

  const handleQuizChange = (e) => {
    const { name, value } = e.target;
    setQuizData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleQuestionChange = (questionIndex, field, value) => {
    const newQuestions = [...quizData.questions];
    newQuestions[questionIndex] = {
      ...newQuestions[questionIndex],
      [field]: value,
    };
    setQuizData(prev => ({
      ...prev,
      questions: newQuestions
    }));
  };

  const handleOptionChange = (questionIndex, optionIndex, value) => {
    const newQuestions = [...quizData.questions];
    newQuestions[questionIndex].options[optionIndex] = value;
    setQuizData(prev => ({
      ...prev,
      questions: newQuestions
    }));
  };

  const addQuestion = () => {
    setQuizData(prev => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          question: "",
          options: ["", "", "", ""],
          correctAnswer: null,
          explanation: ""
        }
      ]
    }));
  };

  const removeQuestion = (index) => {
    const newQuestions = quizData.questions.filter((_, i) => i !== index);
    setQuizData(prev => ({
      ...prev,
      questions: newQuestions
    }));
  };

  const validateBasicInfo = () => {
    const requiredFields = ['name', 'category', 'description', 'totalDuration', 'level'];
    const missingFields = requiredFields.filter(field => !workshopBasicInfo[field]);
    
    if (missingFields.length > 0) {
      setError(`Please fill in the following fields: ${missingFields.join(', ')}`);
      return false;
    }

    if (workshopBasicInfo.videos.length === 0) {
      setError("Please add at least one video");
      return false;
    }

    const invalidVideos = workshopBasicInfo.videos.some(
      video => !video.title || !video.youtubeUrl || !video.duration
    );

    if (invalidVideos) {
      setError("Please complete all video details");
      return false;
    }

    return true;
  };

  const validateQuizData = () => {
    if (!quizData.title || !quizData.description) {
      setError("Quiz title and description are required");
      return false;
    }

    const invalidQuestions = quizData.questions.some(question => 
      !question.question || 
      question.options.some(opt => !opt) || 
      question.correctAnswer === null ||
      !question.explanation
    );

    if (invalidQuestions) {
      setError("Please complete all quiz question details");
      return false;
    }

    return true;
  };

  const proceedToQuiz = () => {
    if (validateBasicInfo()) {
      setStep(2);
      setError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!validateQuizData()) {
      return;
    }

    setLoading(true);

    try {
      const workshopData = {
        ...workshopBasicInfo,
        quiz: quizData
      };

      const response = await axios.post(
        `${server}/workshop/create-workshop`,
        workshopData,
        { withCredentials: true }
      );

      if (response.data.success) {
        setSuccessMessage("Workshop created successfully!");
        
        // Reset form
        setWorkshopBasicInfo({
          name: "",
          category: "",
          description: "",
          totalDuration: "",
          requirements: "",
          level: "Beginner",
          videos: []
        });

        setQuizData({
          title: "",
          description: "",
          passingScore: 70,
          timeLimit: 15,
          questions: [
            {
              question: "",
              options: ["", "", "", ""],
              correctAnswer: null,
              explanation: ""
            }
          ]
        });

        // Navigate after a short delay
        setTimeout(() => {
          navigate("/Adminworkshop");
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

 
  const renderBasicInfoStep = () => (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <label className="text-sm font-semibold text-[#5a4336] block">
              Workshop Name
            </label>
            <input
              type="text"
              name="name"
              value={workshopBasicInfo.name}
              onChange={handleBasicInfoChange}
              className="w-full px-4 py-3 border-2 border-[#a67d6d] rounded-lg focus:ring-2 focus:ring-[#c8a4a5] transition-all duration-200"
              placeholder="Enter workshop name"
              required
            />
          </div>
          <div className="space-y-3">
            <label className="text-sm font-semibold text-[#5a4336] block">
              Category
            </label>
            <input
              type="text"
              name="category"
              value={workshopBasicInfo.category}
              onChange={handleBasicInfoChange}
              className="w-full px-4 py-3 border-2 border-[#a67d6d] rounded-lg focus:ring-2 focus:ring-[#c8a4a5] transition-all duration-200"
              placeholder="e.g., Design, Programming"
              required
            />
          </div>
        </div>

        <div className="mt-8 space-y-3">
          <label className="text-sm font-semibold text-[#5a4336] block">
            Description
          </label>
          <textarea
            name="description"
            value={workshopBasicInfo.description}
            onChange={handleBasicInfoChange}
            rows="4"
            className="w-full px-4 py-3 border-2 border-[#a67d6d] rounded-lg focus:ring-2 focus:ring-[#c8a4a5] transition-all duration-200"
            placeholder="Provide a detailed workshop description"
            required
          />
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-3">
            <label className="text-sm font-semibold text-[#5a4336] block">
              Total Duration
            </label>
            <input
              type="text"
              name="totalDuration"
              value={workshopBasicInfo.totalDuration}
              onChange={handleBasicInfoChange}
              className="w-full px-4 py-3 border-2 border-[#a67d6d] rounded-lg focus:ring-2 focus:ring-[#c8a4a5] transition-all duration-200"
              placeholder="e.g., 2 hours"
              required
            />
          </div>
          <div className="space-y-3">
            <label className="text-sm font-semibold text-[#5a4336] block">
              Level
            </label>
            <select
              name="level"
              value={workshopBasicInfo.level}
              onChange={handleBasicInfoChange}
              className="w-full px-4 py-3 border-2 border-[#a67d6d] rounded-lg focus:ring-2 focus:ring-[#c8a4a5] transition-all duration-200"
              required
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
          <div className="space-y-3">
            <label className="text-sm font-semibold text-[#5a4336] block">
              Requirements
            </label>
            <input
              type="text"
              name="requirements"
              value={workshopBasicInfo.requirements}
              onChange={handleBasicInfoChange}
              className="w-full px-4 py-3 border-2 border-[#a67d6d] rounded-lg focus:ring-2 focus:ring-[#c8a4a5] transition-all duration-200"
              placeholder="e.g., yarn"
              required
            />
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-[#5a4336]">
            Workshop Videos
          </h3>
          <button
            type="button"
            onClick={addVideo}
            className="px-6 py-2 text-white rounded-lg bg-[#a67d6d] hover:bg-[#8d6b5d] transition-colors duration-200"
          >
            Add Video
          </button>
        </div>
        
        <div className="space-y-6">
          {workshopBasicInfo.videos.map((video, index) => (
            <div key={index} className="p-6 border-2 rounded-lg border-[#c8a4a5] bg-white/50">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-[#5a4336] block">
                    Video Title
                  </label>
                  <input
                    type="text"
                    value={video.title}
                    onChange={(e) => handleVideoChange(index, "title", e.target.value)}
                    className="w-full px-4 py-3 border-2 border-[#a67d6d] rounded-lg focus:ring-2 focus:ring-[#c8a4a5] transition-all duration-200"
                    placeholder="Enter video title"
                    required
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-[#5a4336] block">
                    YouTube URL
                  </label>
                  <input
                    type="url"
                    value={video.youtubeUrl}
                    onChange={(e) => handleVideoChange(index, "youtubeUrl", e.target.value)}
                    className="w-full px-4 py-3 border-2 border-[#a67d6d] rounded-lg focus:ring-2 focus:ring-[#c8a4a5] transition-all duration-200"
                    placeholder="https://youtube.com/watch?v=..."
                    required
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-[#5a4336] block">
                    Duration
                  </label>
                  <input
                    type="text"
                    value={video.duration}
                    onChange={(e) => handleVideoChange(index, "duration", e.target.value)}
                    className="w-full px-4 py-3 border-2 border-[#a67d6d] rounded-lg focus:ring-2 focus:ring-[#c8a4a5] transition-all duration-200"
                    placeholder="e.g., 10 mins"
                    required
                  />
                </div>
              </div>
              {index > 0 && (
                <div className="mt-4 text-right">
                  <button
                    type="button"
                    onClick={() => removeVideo(index)}
                    className="text-red-600 hover:text-red-800 font-medium transition-colors duration-200"
                  >
                    Remove Video
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border-2 border-red-200 text-red-600 p-4 rounded-lg">
          <AlertCircle className="w-5 h-5" />
          <p>{error}</p>
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="button"
          onClick={proceedToQuiz}
          className="px-8 py-3 text-white rounded-lg bg-[#5a4336] hover:bg-[#4a3a2c] transition-colors duration-200 font-medium"
        >
          Proceed to Quiz Setup
        </button>
      </div>
    </div>
  );
  const renderQuizStep = () => (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <label className="text-sm font-semibold text-[#5a4336] block">
              Quiz Title
            </label>
            <input
              type="text"
              name="title"
              value={quizData.title}
              onChange={handleQuizChange}
              className="w-full px-4 py-3 border-2 border-[#a67d6d] rounded-lg focus:ring-2 focus:ring-[#c8a4a5] transition-all duration-200"
              placeholder="Enter quiz title"
              required
            />
          </div>
          <div className="space-y-3">
            <label className="text-sm font-semibold text-[#5a4336] block">
              Quiz Description
            </label>
            <input
              type="text"
              name="description"
              value={quizData.description}
              onChange={handleQuizChange}
              className="w-full px-4 py-3 border-2 border-[#a67d6d] rounded-lg focus:ring-2 focus:ring-[#c8a4a5] transition-all duration-200"
              placeholder="Brief quiz description"
              required
            />
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <label className="text-sm font-semibold text-[#5a4336] block">
              Passing Score (%)
            </label>
            <input
              type="number"
              name="passingScore"
              value={quizData.passingScore}
              onChange={handleQuizChange}
              min="0"
              max="100"
              className="w-full px-4 py-3 border-2 border-[#a67d6d] rounded-lg focus:ring-2 focus:ring-[#c8a4a5] transition-all duration-200"
              required
            />
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-[#5a4336]">
            Quiz Questions
          </h3>
          <button
            type="button"
            onClick={addQuestion}
            className="px-6 py-2 text-white rounded-lg bg-[#a67d6d] hover:bg-[#8d6b5d] transition-colors duration-200"
          >
            Add Question
          </button>
        </div>

        <div className="space-y-6">
          {quizData.questions.map((question, questionIndex) => (
            <div
              key={questionIndex}
              className="p-6 border-2 rounded-lg border-[#c8a4a5] bg-white/50 space-y-6"
            >
              <div className="flex justify-between items-center">
                <h4 className="font-semibold text-[#5a4336]">
                  Question {questionIndex + 1}
                </h4>
                {quizData.questions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeQuestion(questionIndex)}
                    className="text-red-600 hover:text-red-800 font-medium transition-colors duration-200"
                  >
                    Remove Question
                  </button>
                )}
              </div>

              <div className="space-y-3">
                <label className="text-sm font-semibold text-[#5a4336] block">
                  Question Text
                </label>
                <input
                  type="text"
                  value={question.question}
                  onChange={(e) => handleQuestionChange(questionIndex, "question", e.target.value)}
                  className="w-full px-4 py-3 border-2 border-[#a67d6d] rounded-lg focus:ring-2 focus:ring-[#c8a4a5] transition-all duration-200"
                  placeholder="Enter question text"
                  required
                />
              </div>

              <div className="space-y-3">
                <label className="text-sm font-semibold text-[#5a4336] block">
                  Options
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {question.options.map((option, optionIndex) => (
                    <input
                      key={optionIndex}
                      type="text"
                      value={option}
                      onChange={(e) => handleOptionChange(questionIndex, optionIndex, e.target.value)}
                      className="w-full px-4 py-3 border-2 border-[#a67d6d] rounded-lg focus:ring-2 focus:ring-[#c8a4a5] transition-all duration-200"
                      placeholder={`Option ${optionIndex + 1}`}
                      required
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-semibold text-[#5a4336] block">
                  Correct Answer
                </label>
                <select
                  value={question.correctAnswer ?? ""}
                  onChange={(e) => handleQuestionChange(questionIndex, "correctAnswer", Number(e.target.value))}
                  className="w-full px-4 py-3 border-2 border-[#a67d6d] rounded-lg focus:ring-2 focus:ring-[#c8a4a5] transition-all duration-200"
                  required
                >
                  <option value="">Select Correct Option</option>
                  {question.options.map((_, index) => (
                    <option key={index} value={index}>
                      Option {index + 1}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-semibold text-[#5a4336] block">
                  Explanation
                </label>
                <textarea
                  value={question.explanation}
                  onChange={(e) => handleQuestionChange(questionIndex, "explanation", e.target.value)}
                  className="w-full px-4 py-3 border-2 border-[#a67d6d] rounded-lg focus:ring-2 focus:ring-[#c8a4a5] transition-all duration-200"
                  placeholder="Provide an explanation for the correct answer"
                  rows="3"
                  required
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border-2 border-red-200 text-red-600 p-4 rounded-lg">
          <AlertCircle className="w-5 h-5" />
          <p>{error}</p>
        </div>
      )}

      {successMessage && (
        <div className="flex items-center gap-2 bg-green-50 border-2 border-green-200 text-green-600 p-4 rounded-lg">
          <CheckCircle2 className="w-5 h-5" />
          <p>{successMessage}</p>
        </div>
      )}

      <div className="flex justify-between">
        <button
          type="button"
          onClick={() => setStep(1)}
          className="px-8 py-3 text-[#5a4336] border-2 border-[#5a4336] rounded-lg hover:bg-[#f0f0f0] transition-colors duration-200 font-medium"
        >
          Back to Workshop Details
        </button>
        <button
          type="submit"
          disabled={loading}
          className={`px-8 py-3 text-white rounded-lg font-medium transition-colors duration-200 ${
            loading 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-[#5a4336] hover:bg-[#4a3a2c]'
          }`}
        >
          {loading ? 'Creating Workshop...' : 'Create Workshop'}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#d8c4b8]">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-xl p-8">
          <h2 className="text-3xl font-bold mb-8 text-[#5a4336] border-b border-[#a67d6d]/20 pb-4">
            {step === 1 ? "Workshop Details" : "Quiz Configuration"}
          </h2>
          <form onSubmit={handleSubmit}>
            {step === 1 ? renderBasicInfoStep() : renderQuizStep()}
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateWorkshop;