const express = require('express');
const router = express.Router();
const axios = require('axios');
const auth = require('../middleware/auth');
const User = require('../models/User');
const xpService = require('../services/xpService');

// ChatAnywhere API configuration
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_API_BASE_URL = process.env.OPENAI_API_BASE_URL || "https://api.chatanywhere.tech/v1";

// Debug logging for API key
console.log('OpenAI API Key:', OPENAI_API_KEY ? 'Present' : 'Missing');
if (!OPENAI_API_KEY) {
  console.error('OpenAI API key is missing. Please check your .env file.');
}

// Get chat history
router.get('/history', auth, async (req, res) => {
  try {
    // TODO: Implement chat history storage and retrieval
    res.json({ messages: [] });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Send message to AI
router.post('/send', auth, async (req, res) => {
  try {
    console.log('Received chat request:', {
      body: req.body,
      user: req.user,
      headers: req.headers
    });

    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ 
        message: 'Message is required',
        error: 'Missing message in request body'
      });
    }

    // Debug logging before API call
    console.log('Attempting to send message to ChatGPT...');
    
    try {
      const response = await axios.post(
        `${OPENAI_API_BASE_URL}/chat/completions`,
        {
          model: "gpt-3.5-turbo",
          messages: [
            { role: "system", content: "You are a helpful AI assistant named Doraemon, designed to help students learn and understand various topics." },
            { role: "user", content: message }
          ]
        },
        {
          headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Received response from ChatGPT');

      const aiResponse = response.data.choices[0].message.content;
      
      // Award XP for chatting using the XP service
      const xpResult = await xpService.awardXP(
        req.user.userId, 
        xpService.XP_REWARDS.CHAT_MESSAGE, 
        'chat_message'
      );
      
      console.log('XP awarded for chat:', xpResult);
      
      res.json({ 
        message: aiResponse,
        timestamp: new Date(),
        xp: {
          awarded: xpService.XP_REWARDS.CHAT_MESSAGE,
          total: xpResult.currentXp,
          level: xpResult.newLevel,
          leveledUp: xpResult.leveledUp
        }
      });
    } catch (apiError) {
      console.error('API Error:', apiError.response?.data || apiError.message);
      
      // Check if it's a rate limit error (status code 429)
      if (apiError.response?.status === 429) {
        // Still award XP for the attempt
        const xpResult = await xpService.awardXP(
          req.user.userId, 
          xpService.XP_REWARDS.CHAT_MESSAGE, 
          'chat_message_rate_limited'
        );
        
        // Return a friendly message about the rate limit
        return res.status(429).json({
          message: "I've reached my daily message limit. Please try again after midnight, or consider upgrading to a premium API key.",
          error: "API rate limit exceeded",
          xp: {
            awarded: xpService.XP_REWARDS.CHAT_MESSAGE,
            total: xpResult.currentXp,
            level: xpResult.newLevel,
            leveledUp: xpResult.leveledUp
          },
          rateLimited: true
        });
      }
      
      // For other API errors, rethrow to be caught by the outer catch
      throw apiError;
    }
  } catch (error) {
    console.error('Error in chat:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      type: error.type,
      stack: error.stack,
      response: error.response?.data
    });
    
    res.status(500).json({ 
      message: 'Failed to process message',
      error: error.message,
      details: error.response?.data || 'No additional details available'
    });
  }
});

// Study doubt resolution endpoint
router.post('/study-doubt', auth, async (req, res) => {
  try {
    console.log('Received study doubt request:', {
      body: req.body,
      user: req.user,
      headers: req.headers
    });

    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ 
        message: 'Message is required',
        error: 'Missing message in request body'
      });
    }

    console.log('Attempting to send study doubt to ChatGPT...');
    
    try {
      const response = await axios.post(
        `${OPENAI_API_BASE_URL}/chat/completions`,
        {
          model: "gpt-3.5-turbo",
          messages: [
            { 
              role: "system", 
              content: "You are Doraemon, an AI educational assistant. Provide detailed, clear explanations for academic questions. Break down complex topics into understandable parts and use examples when helpful." 
            },
            { role: "user", content: message }
          ]
        },
        {
          headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Received response from ChatGPT');

      const aiResponse = response.data.choices[0].message.content;

      // Award XP for asking a study doubt using the XP service
      const xpResult = await xpService.awardXP(
        req.user.userId, 
        xpService.XP_REWARDS.STUDY_DOUBT, 
        'study_doubt'
      );
      
      console.log('XP awarded for study doubt:', xpResult);

      res.json({ 
        message: aiResponse,
        xp: {
          awarded: xpService.XP_REWARDS.STUDY_DOUBT,
          total: xpResult.currentXp,
          level: xpResult.newLevel,
          leveledUp: xpResult.leveledUp
        }
      });
    } catch (apiError) {
      console.error('API Error:', apiError.response?.data || apiError.message);
      
      // Check if it's a rate limit error (status code 429)
      if (apiError.response?.status === 429) {
        // Still award XP for the attempt
        const xpResult = await xpService.awardXP(
          req.user.userId, 
          xpService.XP_REWARDS.STUDY_DOUBT, 
          'study_doubt_rate_limited'
        );
        
        // Return a friendly message about the rate limit
        return res.status(429).json({
          message: "I've reached my daily question limit. Please try again after midnight, or consider upgrading to a premium API key.",
          error: "API rate limit exceeded",
          xp: {
            awarded: xpService.XP_REWARDS.STUDY_DOUBT,
            total: xpResult.currentXp,
            level: xpResult.newLevel,
            leveledUp: xpResult.leveledUp
          },
          rateLimited: true
        });
      }
      
      // For other API errors, rethrow to be caught by the outer catch
      throw apiError;
    }
  } catch (error) {
    console.error('Error in study doubt resolution:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      type: error.type,
      stack: error.stack,
      response: error.response?.data
    });
    
    res.status(500).json({ 
      message: 'Failed to process study doubt',
      error: error.message,
      details: error.response?.data || 'No additional details available'
    });
  }
});

module.exports = router; 