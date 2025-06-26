const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const xpService = require('../services/xpService');

// Get global leaderboard with filters
router.get('/', auth, async (req, res) => {
  try {
    const { 
      timeframe = 'all', 
      page = 1, 
      limit = 10, 
      minXp = 0,
      sortBy = 'xp' // Allow sorting by different criteria (xp, level, quizzes)
    } = req.query;
    
    console.log('Leaderboard request:', req.query);
    
    const leaderboardData = await xpService.getLeaderboard({
      timeframe,
      page,
      limit,
      minXp: parseInt(minXp) || 0,
      sortBy
    });
    
    // Update user medals in database (only for global all-time leaderboard)
    if (timeframe === 'all' && (page === 1 || parseInt(page) === 1) && sortBy === 'xp') {
      try {
        // Update medals for top 3 users
        const updatePromises = leaderboardData.users
          .filter(user => user.medal)
          .map(async (user) => {
            // Get current user data
            const currentUser = await User.findById(user._id);
            if (!currentUser) return null;
            
            // Check if user already has this medal
            const hasMedal = currentUser.badges.some(
              badge => badge.name === user.medal.name
            );
            
            // Add medal if not present
            if (!hasMedal) {
              currentUser.badges.push({
                name: user.medal.name,
                description: user.medal.description,
                icon: user.medal.icon,
                earnedAt: new Date()
              });
              
              await currentUser.save();
              console.log(`Medal ${user.medal.name} awarded to ${user.username}`);
            }
            
            return user.username;
          });
          
        await Promise.all(updatePromises);
      } catch (medalError) {
        console.error('Error updating medals:', medalError);
      }
    }
    
    res.json(leaderboardData);
  } catch (error) {
    console.error('Leaderboard Error:', error);
    res.status(500).json({ 
      message: 'Error fetching leaderboard',
      error: error.message 
    });
  }
});

// Get user rank in leaderboard
router.get('/rank/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const { timeframe = 'all' } = req.query;
    
    // Find user to ensure it exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Prepare query based on timeframe
    let query = {};
    const now = new Date();
    
    if (timeframe === 'daily') {
      const today = new Date(now);
      today.setHours(0, 0, 0, 0);
      query.lastActive = { $gte: today };
    } else if (timeframe === 'weekly') {
      const weekAgo = new Date(now);
      weekAgo.setDate(weekAgo.getDate() - 7);
      query.lastActive = { $gte: weekAgo };
    } else if (timeframe === 'monthly') {
      const monthAgo = new Date(now);
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      query.lastActive = { $gte: monthAgo };
    }
    
    // Count users with more XP
    const usersWithMoreXp = await User.countDocuments({
      ...query,
      xp: { $gt: user.xp }
    });
    
    // Get total users in the leaderboard
    const totalUsers = await User.countDocuments(query);
    
    // Determine if user has a medal based on rank
    let medal = null;
    const rank = usersWithMoreXp + 1;
    
    if (rank === 1) {
      medal = xpService.MEDALS.GOLD;
    } else if (rank === 2) {
      medal = xpService.MEDALS.SILVER;
    } else if (rank === 3) {
      medal = xpService.MEDALS.BRONZE;
    }
    
    res.json({
      userId: user._id,
      username: user.username,
      xp: user.xp,
      level: user.level,
      rank: rank,
      totalUsers,
      percentile: Math.round(((totalUsers - usersWithMoreXp) / totalUsers) * 100),
      medal: medal
    });
  } catch (error) {
    console.error('Error fetching user rank:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get top performers for a specific timeframe (for dashboard widgets)
router.get('/top', auth, async (req, res) => {
  try {
    const { timeframe = 'weekly', limit = 5 } = req.query;
    
    // Get top users using the service
    const topUsersData = await xpService.getLeaderboard({
      timeframe,
      page: 1,
      limit,
      minXp: 0
    });
    
    // Return just the users without pagination
    res.json(topUsersData.users);
  } catch (error) {
    console.error('Error fetching top performers:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 