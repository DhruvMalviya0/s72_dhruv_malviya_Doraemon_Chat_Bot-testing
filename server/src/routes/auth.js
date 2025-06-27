const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');
const mongoose = require('mongoose');
const passport = require('../config/passport');

const router = express.Router();

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, profile } = req.body;

    // Check MongoDB connection status
    if (mongoose.connection.readyState !== 1) {
      return res.status(500).json({ message: 'Database connection is not ready' });
    }

    // Check if user already exists with timeout handling
    const existingUser = await Promise.race([
      User.findOne({ $or: [{ email }, { username }] }),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Database operation timed out')), 10000)
      )
    ]);

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    const user = new User({
      username,
      email,
      password,
      profile: profile || {} // Handle case where profile is not provided
    });

    // Save user with timeout handling
    await Promise.race([
      user.save(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Database operation timed out')), 10000)
      )
    ]);

    // Generate token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

    res.status(201).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profile: user.profile,
        xp: user.xp,
        level: user.level,
        badges: user.badges
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    if (error.message === 'Database operation timed out') {
      return res.status(504).json({ message: 'Registration timed out. Please try again.' });
    }
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Invalid input data' });
    }
    res.status(500).json({ message: 'Registration failed. Please try again.' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profile: user.profile,
        xp: user.xp,
        level: user.level,
        badges: user.badges
      }
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Google OAuth login route
router.get('/google', (req, res, next) => {
  console.log('Initiating Google OAuth flow');
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    // Add some additional params that might help with the error
    prompt: 'consent',
    accessType: 'offline'
  })(req, res, next);
});

// Google OAuth callback route
router.get('/google/callback', 
  (req, res, next) => {
    console.log('Received callback from Google OAuth');
    passport.authenticate('google', { 
      session: false, 
      failureRedirect: 'https://s72-dhruv-malviya-doraemon-chat-bot.vercel.app/login?error=auth_failed' 
    })(req, res, next);
  },
  (req, res) => {
    try {
      console.log('Google authentication successful, generating token for user:', req.user._id);
      // Generate JWT token
      const token = jwt.sign({ userId: req.user._id }, process.env.JWT_SECRET, {
        expiresIn: '7d'
      });
      
      // Redirect to frontend dashboard with token
      res.redirect(`https://s72-dhruv-malviya-doraemon-chat-bot.vercel.app/dashboard?token=${token}&auth=success`);
    } catch (error) {
      console.error('Google auth callback error:', error);
      res.redirect(`https://s72-dhruv-malviya-doraemon-chat-bot.vercel.app/login?error=${encodeURIComponent(error.message || 'authentication_failed')}`);
    }
  }
);

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    res.json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { avatar, bio, interests, education, goals } = req.body;
    const user = await User.findById(req.user._id);

    user.profile = {
      ...user.profile,
      avatar: avatar || user.profile.avatar,
      bio: bio || user.profile.bio,
      interests: interests || user.profile.interests,
      education: education || user.profile.education,
      goals: goals || user.profile.goals
    };

    await user.save();
    res.json(user.profile);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router; 