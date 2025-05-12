import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { server } from '../../server';
import { Trophy, AlertCircle, ArrowRight, ArrowLeft, Award, Clock, Target, CheckCircle } from 'lucide-react';

const WorkshopQuiz = () => {
  const [quiz, setQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizResults, setQuizResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAnimation, setShowAnimation] = useState(false);
  const [shake, setShake] = useState(false);
  const [previousAttempts, setPreviousAttempts] = useState(null);
  const [passingAttempt, setPassingAttempt] = useState(null);
  const { user } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const { id: workshopId } = useParams();

  useEffect(() => {
    if (workshopId) {
      fetchQuiz();
      fetchPreviousAttempts();
    } else {
      setError("Workshop ID is missing");
      setLoading(false);
    }
  }, [workshopId]);

  const fetchPreviousAttempts = async () => {
    try {
      const response = await axios.get(
        `${server}/workshop/quiz-attempts/${workshopId}`,
        { withCredentials: true }
      );
      
      console.log("Previous attempts response:", response);
      
      if (response.data && response.data.attempts) {
        setPreviousAttempts(response.data.attempts);
        
        // If user has already passed, find the passing attempt
        const passedAttempt = response.data.attempts.find(attempt => attempt.passed);
        if (passedAttempt) {
          setPassingAttempt(passedAttempt);
          setError("You've already passed this quiz!");
        }
      }
    } catch (err) {
      console.error('Error fetching attempts:', err);
      // Don't set error state here - just log it since this is supplementary info
    }
  };

  const fetchQuiz = async () => {
    try {
      console.log("Fetching quiz for workshop ID:", workshopId);
      
      const response = await axios.get(
        `${server}/workshop/${workshopId}/quiz`,
        { 
          withCredentials: true,
          // Force credentials to be sent with the request
          headers: {
            'Accept': 'application/json'
          }
        }
      );
      
      console.log("Quiz response:", response);
      
      if (response.data && response.data.quiz) {
        setQuiz(response.data.quiz);
        setLoading(false);
      } else {
        throw new Error("Quiz data not found");
      }
    } catch (err) {
      console.error('Error fetching quiz:', err);
      const errorDetails = err.response ? `Status: ${err.response.status}, Message: ${err.response.data?.message || 'Unknown error'}` : err.message;
      console.error('Error details:', errorDetails);
      setError(err.response?.data?.message || 'Failed to load quiz');
      setLoading(false);
    }
  };

  const handleAnswerSelect = (questionIndex, optionIndex) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionIndex]: optionIndex
    }));
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const submitQuiz = async () => {
    try {
      // Validate all questions are answered
      if (!quiz || !quiz.questions || Object.keys(selectedAnswers).length !== quiz.questions.length) {
        setError('Please answer all questions before submitting');
        return;
      }
  
      const answers = quiz.questions.map((question, index) => ({
        questionId: question._id,
        selectedOption: selectedAnswers[index],
        isCorrect: selectedAnswers[index] === question.correctAnswer
      }));
  
      const correctAnswers = answers.filter(a => a.isCorrect).length;
      const score = (correctAnswers / quiz.questions.length) * 100;
      const passed = score >= quiz.passingScore;
      
      // Log the submission payload for debugging
      console.log("Submitting quiz with payload:", {
        workshopId,
        quizId: quiz._id,
        answers,
        score,
        passed
      });
  
      // Log the payload for debugging
      console.log("Submitting quiz with payload:", {
        workshopId,
        quizId: quiz._id,
        answers,
        score,
        passed
      });
      
      const response = await axios.post(
        `${server}/workshop/submit-quiz`,
        {
          workshopId,
          quizId: quiz._id,
          answers,
          score,
          passed
        },
        { 
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      // Log the response for debugging
      console.log("Quiz submission response:", response);
  
      if (response.data && response.data.success) {
        setQuizResults({
          score,
          passed,
          correctAnswers,
          totalQuestions: quiz.questions.length,
          passingScore: quiz.passingScore
        });
        
        setShowAnimation(true);
        setTimeout(() => {
          setQuizCompleted(true);
          setShowAnimation(false);
        }, 2000);
      } else {
        setError(response.data?.message || 'Quiz submission failed');
      }
    } catch (err) {
      console.error('Error submitting quiz:', err);
      const errorDetails = err.response 
        ? `Status: ${err.response.status}, Message: ${err.response.data?.message || 'Unknown error'}` 
        : err.message;
      console.error('Error details:', errorDetails);
      
      // Check if it's a routing error (like with the 'No routes matched location')
      if (err.message && err.message.includes('Failed to fetch') || err.message.includes('Network Error')) {
        setError('Connection error. Please check your network connection and try again.');
      } else {
        setError(err.response?.data?.message || 'Failed to submit quiz');
      }
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-[#d8c4b8] to-[#c8a4a5] flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-20 w-20 border-4 border-[#a67d6d] border-t-transparent"></div>
        <div className="animate-pulse text-[#5a4336] font-medium">Loading your quiz...</div>
      </div>
    </div>
  );

  if (error && passingAttempt) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#d8c4b8] to-[#c8a4a5] p-8">
        <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Trophy className="w-16 h-16 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-green-600 mb-2">Quiz Already Completed Successfully!</h2>
            <p className="text-gray-600">You've already mastered this quiz. Here are your results:</p>
          </div>

          <div className="grid grid-cols-3 gap-6 bg-gray-50 rounded-xl p-6 mb-8">
            <div className="text-center space-y-2">
              <Target className="w-6 h-6 text-[#a67d6d] mx-auto" />
              <div className="text-3xl font-bold text-[#5a4336]">{passingAttempt.score.toFixed(1)}%</div>
              <div className="text-gray-600">Your Score</div>
            </div>
            <div className="text-center space-y-2">
              <Trophy className="w-6 h-6 text-[#a67d6d] mx-auto" />
              <div className="text-3xl font-bold text-[#5a4336]">
                {passingAttempt.answers.filter(a => a.isCorrect).length}
              </div>
              <div className="text-gray-600">Correct Answers</div>
            </div>
            <div className="text-center space-y-2">
              <Clock className="w-6 h-6 text-[#a67d6d] mx-auto" />
              <div className="text-3xl font-bold text-[#5a4336]">
                {passingAttempt.answers.filter(a => !a.isCorrect).length}
              </div>
              <div className="text-gray-600">Incorrect Answers</div>
            </div>
          </div>

          <div className="space-y-4">
            <button 
              onClick={() => navigate(`/workshop/${workshopId}/certificate`)}
              className="w-full px-6 py-4 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
            >
              <Award className="w-5 h-5" />
              View Your Certificate 
            </button>
            
            <button 
              onClick={() => navigate(`/workshopdetail/${workshopId}`)}
              className="w-full px-6 py-4 border-2 border-[#a67d6d] text-[#a67d6d] rounded-xl hover:bg-[#d8c4b8]/10 transition-all duration-300 flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              Return to Workshop
            </button>
          </div>

          <div className="mt-8 p-4 bg-gray-50 rounded-xl">
            <h3 className="text-lg font-medium text-[#5a4336] mb-2">Quiz Attempt Details:</h3>
            <div className="text-gray-600">
              <p>Completed on: {new Date(passingAttempt.attemptedAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) return (
    <div className="min-h-screen bg-gradient-to-br from-[#d8c4b8] to-[#c8a4a5] p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center mb-4">
          <div className="flex items-center text-red-600">
            <AlertCircle className="w-6 h-6 mr-2 animate-pulse" />
            <span className="text-xl font-medium">Error</span>
          </div>
        </div>
        <p className="text-red-600">{error}</p>
        <button 
          onClick={() => navigate(`/workshopdetail/${workshopId}`)}
          className="mt-6 w-full px-6 py-3 bg-[#a67d6d] text-white rounded-lg hover:opacity-90 transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-5 h-5" />
          Return to Workshop
        </button>
      </div>
    </div>
  );

  if (!quiz) return null;

  if (showAnimation) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm">
        <div className="bg-white rounded-xl p-8 text-center animate-bounce shadow-2xl">
          {quizResults.passed ? (
            <div className="text-green-500">
              <div className="relative">
                <Trophy className="w-20 h-20 mx-auto mb-4" />
                <div className="absolute -top-2 -right-2">
                  <div className="animate-ping absolute w-4 h-4 rounded-full bg-[#a67d6d] opacity-75"></div>
                  <Award className="w-4 h-4 text-[#a67d6d] relative" />
                </div>
              </div>
              <h2 className="text-2xl font-bold">Congratulations!</h2>
              <p>You've passed the quiz!</p>
            </div>
          ) : (
            <div className="text-[#a67d6d]">
              <AlertCircle className="w-20 h-20 mx-auto mb-4 animate-pulse" />
              <h2 className="text-2xl font-bold">Keep Going!</h2>
              <p>You can do better next time!</p>
            </div>
          )}
        </div>
      </div>
    );
  }
  
  if (quizCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#d8c4b8] to-[#c8a4a5] p-8">
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-xl p-8 animate-fade-in">
          <div className="text-center mb-12">
            {quizResults.passed ? (
              <div className="space-y-4">
                <div className="relative">
                  <Trophy className="w-24 h-24 text-[#a67d6d] mx-auto animate-bounce" />
                  <div className="absolute -top-4 -right-4">
                    <div className="animate-ping absolute w-6 h-6 rounded-full bg-[#c8a4a5] opacity-75"></div>
                    <Award className="w-6 h-6 text-[#a67d6d] relative" />
                  </div>
                </div>
                <h2 className="text-4xl font-bold text-[#5a4336]">Congratulations!</h2>
                <p className="text-gray-600 text-lg">You've passed the quiz and earned your certificate!</p>
              </div>
            ) : (
              <div className="space-y-4">
                <AlertCircle className="w-24 h-24 text-[#a67d6d] mx-auto animate-pulse" />
                <h2 className="text-4xl font-bold text-[#5a4336]">Keep Learning!</h2>
                <p className="text-gray-600 text-lg">Review the material and try again</p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-6 bg-[#d8c4b8]/10 rounded-xl p-8 mb-8">
            <div className="text-center space-y-2">
              <Target className="w-8 h-8 text-[#a67d6d] mx-auto" />
              <div className="text-4xl font-bold text-[#5a4336]">{quizResults.score.toFixed(1)}%</div>
              <div className="text-gray-600">Your Score</div>
            </div>
            <div className="text-center space-y-2">
              <Trophy className="w-8 h-8 text-[#a67d6d] mx-auto" />
              <div className="text-4xl font-bold text-[#5a4336]">{quizResults.correctAnswers}</div>
              <div className="text-gray-600">Correct Answers</div>
            </div>
            <div className="text-center space-y-2">
              <Clock className="w-8 h-8 text-[#a67d6d] mx-auto" />
              <div className="text-4xl font-bold text-[#5a4336]">
                {quizResults.totalQuestions - quizResults.correctAnswers}
              </div>
              <div className="text-gray-600">Incorrect Answers</div>
            </div>
          </div>

           <div className="space-y-4">
            {quizResults.passed ? (
              <button 
                onClick={() => navigate(`/workshop/${workshopId}/certificate`)}
                className="w-full py-4 bg-gradient-to-r from-[#c8a4a5] to-[#a67d6d] text-white rounded-xl hover:opacity-90 transition-all duration-300 transform hover:scale-105 font-medium flex items-center justify-center gap-2"
              >
                <Award className="w-5 h-5" />
                Get Your Certificate
              </button>
            ) : (
              <button 
                onClick={() => {
                  setQuizCompleted(false);
                  setSelectedAnswers({});
                  setCurrentQuestion(0);
                }}
                className="w-full py-4 bg-gradient-to-r from-[#c8a4a5] to-[#a67d6d] text-white rounded-xl hover:opacity-90 transition-all duration-300 transform hover:scale-105 font-medium flex items-center justify-center gap-2"
              >
                <ArrowRight className="w-5 h-5" />
                Try Again
              </button>
            )}
            
            <button 
              onClick={() => navigate(`/workshopdetail/${workshopId}`)}
              className="w-full py-4 border-2 border-[#a67d6d] text-[#a67d6d] rounded-xl hover:bg-[#d8c4b8]/10 transition-all duration-300 transform hover:scale-105 font-medium flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              Return to Workshop
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#d8c4b8] to-[#c8a4a5] p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-xl p-8">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Award className="w-10 h-10 text-[#a67d6d]" />
            <h1 className="text-4xl font-bold text-[#5a4336]">{quiz.title}</h1>
          </div>
          <p className="text-gray-600 text-lg">{quiz.description}</p>
        </div>

        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2 text-[#a67d6d]">
              <Clock className="w-5 h-5" />
              <span className="font-medium">Question {currentQuestion + 1} of {quiz.questions.length}</span>
            </div>
            <div className="flex items-center gap-2 text-[#a67d6d]">
              <Target className="w-5 h-5" />
              <span className="font-medium">Required to pass: {quiz.passingScore}%</span>
            </div>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-[#c8a4a5] to-[#a67d6d] transition-all duration-500 ease-out"
              style={{ width: `${((currentQuestion + 1) / quiz.questions.length) * 100}%` }}
            />
          </div>
        </div>

        <div className={`bg-[#d8c4b8]/10 rounded-xl p-8 mb-8 transform transition-all duration-300 ${shake ? 'animate-shake' : ''}`}>
          <h2 className="text-2xl font-medium text-[#5a4336] mb-8">
            {quiz.questions[currentQuestion].question}
          </h2>
          
          <div className="space-y-4">
            {quiz.questions[currentQuestion].options.map((option, index) => (
              <div
                key={index}
                onClick={() => handleAnswerSelect(currentQuestion, index)}
                className={`p-6 rounded-xl border-2 cursor-pointer transition-all duration-300 transform hover:scale-102 ${
                  selectedAnswers[currentQuestion] === index
                    ? 'border-[#a67d6d] bg-[#d8c4b8]/20 shadow-md'
                    : 'border-gray-200 hover:border-[#c8a4a5]'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                    selectedAnswers[currentQuestion] === index
                      ? 'border-[#a67d6d] bg-[#a67d6d]'
                      : 'border-gray-300'
                  }`}>
                    {selectedAnswers[currentQuestion] === index && (
                      <div className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </div>
                  <span className="text-lg">{option}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-between">
          <button
            onClick={() => setCurrentQuestion(prev => prev - 1)}
            disabled={currentQuestion === 0}
            className={`px-8 py-3 rounded-xl border-2 flex items-center gap-2 transition-all duration-300 transform hover:scale-105 ${
              currentQuestion === 0 
                ? 'opacity-50 cursor-not-allowed' 
                : 'hover:bg-[#d8c4b8]/10 border-[#a67d6d] text-[#a67d6d]'
            }`}
          >
            <ArrowLeft className="w-5 h-5" />
            Previous
          </button>
          
          {currentQuestion < quiz.questions.length - 1 ? (
            <button
              onClick={() => setCurrentQuestion(prev => prev + 1)}
              disabled={selectedAnswers[currentQuestion] === undefined}
              className={`px-8 py-3 rounded-xl flex items-center gap-2 transition-all duration-300 transform hover:scale-105 ${
                selectedAnswers[currentQuestion] === undefined
                  ? 'opacity-50 cursor-not-allowed bg-gray-400'
                  : 'bg-gradient-to-r from-[#c8a4a5] to-[#a67d6d] hover:opacity-90 text-white'
              }`}
            >
              Next
              <ArrowRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={submitQuiz}
              disabled={Object.keys(selectedAnswers).length !== quiz.questions.length}
              className={`px-8 py-3 rounded-xl flex items-center gap-2 transition-all duration-300 transform hover:scale-105 ${
                Object.keys(selectedAnswers).length !== quiz.questions.length 
                  ? 'opacity-50 cursor-not-allowed bg-gray-400'
                  : 'bg-gradient-to-r from-[#c8a4a5] to-[#a67d6d] hover:opacity-90 text-white'
              }`}
            >
              Submit Quiz
              <Trophy className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkshopQuiz;