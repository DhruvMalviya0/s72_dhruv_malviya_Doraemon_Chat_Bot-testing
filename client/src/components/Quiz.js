import React, { useState } from 'react';
import axios from 'axios';

const Quiz = () => {
  const [quiz, setQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [quizConfig, setQuizConfig] = useState({
    topic: '',
    difficulty: 'medium',
    numQuestions: 5
  });
  const [error, setError] = useState('');

  // Available topics and difficulties
  const topics = [
    'Mathematics',
    'Science',
    'History',
    'Geography',
    'Literature',
    'Computer Science',
    'General Knowledge'
  ];

  const difficulties = [
    { value: 'easy', label: 'Easy' },
    { value: 'medium', label: 'Medium' },
    { value: 'hard', label: 'Hard' }
  ];

  const handleConfigChange = (e) => {
    const { name, value } = e.target;
    setQuizConfig(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const generateQuiz = async () => {
    if (!quizConfig.topic) {
      setError('Please select a topic');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${process.env.REACT_APP_SERVER_URL}/api/quiz/generate`,
        quizConfig,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      setQuiz(response.data);
      setCurrentQuestion(0);
      setScore(0);
      setShowResults(false);
      setSelectedAnswer(null);
    } catch (error) {
      console.error('Error generating quiz:', error);
      setError(error.response?.data?.message || 'Failed to generate quiz');
    }
    setLoading(false);
  };

  const handleAnswerSelect = (index) => {
    setSelectedAnswer(index);
  };

  const handleNext = async () => {
    if (selectedAnswer === quiz.questions[currentQuestion].correctAnswer) {
      setScore(score + 1);
    }

    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
    } else {
      setShowResults(true);
      try {
        // Submit quiz results
        const token = localStorage.getItem('token');
        await axios.post(
          `${process.env.REACT_APP_SERVER_URL}/api/quiz/submit`,
          {
            quizId: quiz,
            answers: Array(quiz.questions.length).fill(null).map((_, i) => 
              i === currentQuestion ? selectedAnswer : quiz.questions[i].correctAnswer
            )
          },
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
      } catch (error) {
        console.error('Error submitting quiz results:', error);
      }
    }
  };

  const handleRestart = () => {
    setQuiz(null);
    setCurrentQuestion(0);
    setScore(0);
    setShowResults(false);
    setSelectedAnswer(null);
    setQuizConfig({
      topic: '',
      difficulty: 'medium',
      numQuestions: 5
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-6">Create a Quiz</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Topic
            </label>
            <select
              name="topic"
              value={quizConfig.topic}
              onChange={handleConfigChange}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">Select a topic</option>
              {topics.map(topic => (
                <option key={topic} value={topic}>
                  {topic}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Difficulty
            </label>
            <select
              name="difficulty"
              value={quizConfig.difficulty}
              onChange={handleConfigChange}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              {difficulties.map(diff => (
                <option key={diff.value} value={diff.value}>
                  {diff.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Questions
            </label>
            <input
              type="number"
              name="numQuestions"
              min="1"
              max="10"
              value={quizConfig.numQuestions}
              onChange={handleConfigChange}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <button
            onClick={generateQuiz}
            className="w-full bg-primary text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Generate Quiz
          </button>
        </div>
      </div>
    );
  }

  if (showResults) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg text-center">
        <h2 className="text-2xl font-bold mb-4">Quiz Complete!</h2>
        <div className="mb-6">
          <p className="text-xl mb-2">
            Your score: {score} out of {quiz.questions.length}
          </p>
          <p className="text-lg text-gray-600">
            Percentage: {Math.round((score / quiz.questions.length) * 100)}%
          </p>
        </div>
        
        <div className="space-y-4">
          <button
            onClick={handleRestart}
            className="w-full bg-primary text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Try Another Quiz
          </button>
          
          <button
            onClick={() => setShowResults(false)}
            className="w-full bg-gray-100 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Review Answers
          </button>
        </div>
      </div>
    );
  }

  const question = quiz.questions[currentQuestion];

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm text-gray-600">
            Question {currentQuestion + 1} of {quiz.questions.length}
          </span>
          <span className="text-sm text-gray-600">Score: {score}</span>
        </div>
        
        <div className="mb-6">
          <div className="h-2 bg-gray-200 rounded-full">
            <div
              className="h-2 bg-primary rounded-full transition-all duration-300"
              style={{
                width: `${((currentQuestion + 1) / quiz.questions.length) * 100}%`
              }}
            />
          </div>
        </div>

        <h3 className="text-xl font-semibold mb-4">{question.question}</h3>
        
        <div className="space-y-3">
          {question.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswerSelect(index)}
              className={`w-full p-4 text-left rounded-lg border transition-colors ${
                selectedAnswer === index
                  ? 'bg-primary text-white border-primary'
                  : 'hover:bg-gray-50'
              }`}
            >
              <span className="inline-block w-6 h-6 mr-3 text-center rounded-full border">
                {String.fromCharCode(65 + index)}
              </span>
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-between">
        <button
          onClick={() => currentQuestion > 0 && setCurrentQuestion(prev => prev - 1)}
          className={`px-6 py-2 rounded-lg transition-colors ${
            currentQuestion > 0
              ? 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
          disabled={currentQuestion === 0}
        >
          Previous
        </button>
        
        <button
          onClick={handleNext}
          disabled={selectedAnswer === null}
          className={`px-6 py-2 rounded-lg transition-colors ${
            selectedAnswer !== null
              ? 'bg-primary text-white hover:bg-blue-600'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
          }`}
        >
          {currentQuestion === quiz.questions.length - 1 ? 'Finish' : 'Next'}
        </button>
      </div>
    </div>
  );
};

export default Quiz; 