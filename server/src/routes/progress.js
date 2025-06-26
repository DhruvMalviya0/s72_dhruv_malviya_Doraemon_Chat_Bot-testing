const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const mongoose = require('mongoose');
const xpService = require('../services/xpService');

// Get leaderboard with filters and pagination
router.get('/leaderboard', auth, async (req, res) => {
  try {
    console.log('User from auth middleware:', req.user);
    
    const { timeframe = 'all', page = 1, limit = 10, minXp = 0 } = req.query;
    
    console.log('Query parameters:', { query: req.query, timeframe, page, limit, minXp });
    
    const leaderboardData = await xpService.getLeaderboard({
      timeframe,
      page,
      limit,
      minXp: parseInt(minXp) || 0
    });
    
    console.log('Sending response:', {
      userCount: leaderboardData.users.length,
      pagination: leaderboardData.pagination
    });

    res.json(leaderboardData);
  } catch (error) {
    console.error('Leaderboard Error:', {
      error: error.message,
      stack: error.stack,
      query: req.query
    });
    
    res.status(500).json({
      message: 'Error fetching leaderboard',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? {
        stack: error.stack,
        query: req.query
      } : undefined
    });
  }
});

// Get user progress
router.get('/:userId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update user XP
router.post('/xp', auth, async (req, res) => {
  try {
    const { userId, xpAmount, action } = req.body;
    
    if (!userId || !xpAmount) {
      return res.status(400).json({ message: 'UserId and xpAmount are required' });
    }
    
    const result = await xpService.awardXP(userId, xpAmount, action);
    res.json(result);
  } catch (error) {
    console.error('XP Update Error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get user's study plans
router.get('/study-plans/:userId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user.studyPlans);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new study plan
router.post('/study-plans', auth, async (req, res) => {
  try {
    const { userId, title, description, topics } = req.body;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.studyPlans.push({
      title,
      description,
      topics,
      createdAt: new Date()
    });

    await user.save();
    res.json(user.studyPlans[user.studyPlans.length - 1]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 