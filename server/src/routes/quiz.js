const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const OpenAI = require('openai');
const User = require('../models/User');
const xpService = require('../services/xpService');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_API_BASE_URL
});

// Generate quiz
router.post('/generate', auth, async (req, res) => {
  try {
    const { topic, difficulty, numQuestions } = req.body;

    const prompt = `Generate a ${difficulty} level quiz about ${topic} with ${numQuestions} questions. 
    Format the response as a JSON object with the following structure:
    {
      "questions": [
        {
          "question": "Question text",
          "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
          "correctAnswer": 0
        }
      ]
    }`;

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" }
      });

      const quiz = JSON.parse(completion.choices[0].message.content);
      res.json(quiz);
    } catch (apiError) {
      console.error('API Error in quiz generation:', apiError);
      
      // Check if it's a rate limit error
      if (apiError.status === 429 || (apiError.response && apiError.response.status === 429)) {
        return res.status(429).json({
          message: "Daily quiz generation limit reached. Please try again after midnight, or consider upgrading to a premium API key.",
          error: "API rate limit exceeded",
          rateLimited: true
        });
      }
      
      // For other API errors, rethrow to be caught by the outer catch
      throw apiError;
    }
  } catch (error) {
    console.error('Quiz generation error:', error);
    res.status(500).json({ 
      message: 'Failed to generate quiz',
      error: error.message 
    });
  }
});

// Submit quiz
router.post('/submit', auth, async (req, res) => {
  try {
    const { quizId, answers, topic } = req.body;
    
    // Validate input data
    if (!quizId || !quizId.questions || !answers) {
      return res.status(400).json({
        message: 'Invalid quiz submission. Quiz ID with questions and answers are required.'
      });
    }
    
    // Calculate score
    const score = answers.reduce((acc, answer, index) => {
      return acc + (answer === quizId.questions[index].correctAnswer ? 1 : 0);
    }, 0);

    // Calculate XP earned (10 XP per correct answer)
    const xpEarned = score * xpService.XP_REWARDS.QUIZ_CORRECT_ANSWER;

    // Update user's quiz stats
    const user = await User.findById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update quiz stats
    user.quizStats = user.quizStats || {
      totalQuizzes: 0,
      totalCorrect: 0,
      averageScore: 0
    };
    
    user.quizStats.totalQuizzes += 1;
    user.quizStats.totalCorrect += score;
    user.quizStats.averageScore = 
      (user.quizStats.averageScore * (user.quizStats.totalQuizzes - 1) + score) / 
      user.quizStats.totalQuizzes;
    
    // Add to quiz history
    user.quizHistory.push({
      topic: topic || "General",
      score: score,
      date: new Date()
    });
    
    await user.save();
    
    // Award XP for quiz completion
    const xpResult = await xpService.awardXP(
      req.user.userId,
      xpEarned,
      'quiz_completion'
    );
    
    res.json({
      score,
      totalQuestions: quizId.questions.length,
      percentageScore: Math.round((score / quizId.questions.length) * 100),
      xp: {
        awarded: xpEarned,
        total: xpResult.currentXp,
        level: xpResult.newLevel,
        leveledUp: xpResult.leveledUp
      }
    });
  } catch (error) {
    console.error('Quiz submission error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get quiz history
router.get('/history/:userId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user.quizHistory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 