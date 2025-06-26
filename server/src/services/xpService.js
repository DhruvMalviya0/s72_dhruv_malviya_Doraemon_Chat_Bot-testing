/**
 * XP Service - Handles XP calculations, awards, and level progression
 */
const User = require('../models/User');

// XP reward constants
const XP_REWARDS = {
  CHAT_MESSAGE: 2,         // Regular chat messages
  STUDY_DOUBT: 5,          // Study-related questions
  QUIZ_CORRECT_ANSWER: 10, // Each correct quiz answer
  DAILY_LOGIN: 5,          // Daily login bonus
  COMPLETE_PROFILE: 20     // One-time reward for completing profile
};

// Medal constants
const MEDALS = {
  GOLD: {
    name: 'Gold Medal',
    icon: '🥇',
    rank: 1,
    description: 'Top rank on the leaderboard'
  },
  SILVER: {
    name: 'Silver Medal',
    icon: '🥈',
    rank: 2,
    description: 'Second rank on the leaderboard'
  },
  BRONZE: {
    name: 'Bronze Medal',
    icon: '🥉',
    rank: 3,
    description: 'Third rank on the leaderboard'
  }
};

// Calculate level based on XP
const calculateLevel = (xp) => {
  return Math.floor(Math.sqrt(xp / 100)) + 1;
};

// Award XP to a user
const awardXP = async (userId, xpAmount, action) => {
  try {
    const user = await User.findById(userId);
    
    if (!user) {
      throw new Error('User not found');
    }

    // Record previous level for comparison
    const previousLevel = user.level;
    
    // Add XP
    user.xp += xpAmount;
    
    // Update level based on new XP
    user.level = calculateLevel(user.xp);
    
    // Update last active time
    user.lastActive = new Date();
    
    // Check for level up and award badge if needed
    if (user.level > previousLevel) {
      const levelUpBadge = {
        name: `Level ${user.level}`,
        description: `Reached level ${user.level}`,
        icon: '🏆',
        earnedAt: new Date()
      };
      
      // Check if badge already exists
      const badgeExists = user.badges.some(badge => 
        badge.name === levelUpBadge.name
      );
      
      if (!badgeExists) {
        user.badges.push(levelUpBadge);
      }
    }
    
    // Check if user may qualify for a medal (only if significant XP change)
    if (xpAmount >= 10) {
      // Get current global top 3 users by XP to see if medals should be updated
      const topUsers = await User.find()
        .sort({ xp: -1 })
        .limit(3)
        .select('_id xp username')
        .lean();
      
      // Check if the current user is in the top 3
      const userRank = topUsers.findIndex(topUser => 
        topUser._id.toString() === userId.toString()
      );
      
      if (userRank !== -1) {
        // User is in top 3, determine which medal
        let medal = null;
        
        if (userRank === 0) {
          medal = MEDALS.GOLD;
        } else if (userRank === 1) {
          medal = MEDALS.SILVER;
        } else if (userRank === 2) {
          medal = MEDALS.BRONZE;
        }
        
        if (medal) {
          // Check if the user already has this medal
          const hasMedal = user.badges.some(badge => 
            badge.name === medal.name
          );
          
          if (!hasMedal) {
            // Add the medal to user's badges
            user.badges.push({
              name: medal.name,
              description: medal.description,
              icon: medal.icon,
              earnedAt: new Date()
            });
            
            console.log(`Medal ${medal.name} awarded to ${user.username}`);
          }
        }
      }
    }
    
    // Save user changes
    await user.save();
    
    return {
      userId: user._id,
      username: user.username,
      currentXp: user.xp,
      xpGained: xpAmount,
      newLevel: user.level,
      leveledUp: user.level > previousLevel,
      badges: user.badges
    };
  } catch (error) {
    console.error('Error awarding XP:', error);
    throw error;
  }
};

// Get leaderboard with filters
const getLeaderboard = async (options = {}) => {
  try {
    const { 
      timeframe = 'all', 
      page = 1, 
      limit = 10, 
      minXp = 0,
      sortBy = 'xp'
    } = options;
    
    const skip = (page - 1) * parseInt(limit);
    
    let query = { xp: { $gte: minXp } };
    const now = new Date();
    
    // Apply timeframe filter
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

    // Get total count for pagination
    const total = await User.countDocuments(query);

    // Determine sort order based on sortBy parameter
    let sortOptions = {};
    
    switch (sortBy) {
      case 'level':
        sortOptions = { level: -1, xp: -1, lastActive: -1 };
        break;
      case 'quizzes':
        sortOptions = { 'quizStats.totalQuizzes': -1, xp: -1, lastActive: -1 };
        break;
      case 'accuracy':
        sortOptions = { 'quizStats.averageScore': -1, xp: -1, lastActive: -1 };
        break;
      case 'recent':
        sortOptions = { lastActive: -1, xp: -1 };
        break;
      case 'xp':
      default:
        sortOptions = { xp: -1, lastActive: -1 };
        break;
    }

    // Get users with pagination
    const topUsers = await User.find(query)
      .select('username xp level badges profile.avatar lastActive quizStats')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Calculate ranks and format user data
    const users = topUsers.map((user, index) => {
      // Determine if user gets a medal (only on page 1)
      let medal = null;
      if (page === 1 || parseInt(page) === 1) {
        if (index === 0) {
          medal = MEDALS.GOLD;
        } else if (index === 1) {
          medal = MEDALS.SILVER;
        } else if (index === 2) {
          medal = MEDALS.BRONZE;
        }
      }
      
      return {
        _id: user._id,
        username: user.username,
        xp: user.xp || 0,
        level: user.level || 1,
        badges: user.badges || [],
        avatar: user.profile?.avatar || '',
        lastActive: user.lastActive || new Date(),
        quizStats: {
          totalQuizzes: user.quizStats?.totalQuizzes || 0,
          totalCorrect: user.quizStats?.totalCorrect || 0,
          averageScore: user.quizStats?.averageScore || 0
        },
        rank: skip + index + 1,
        medal: medal
      };
    });

    return {
      users,
      pagination: {
        total,
        pages: Math.ceil(total / parseInt(limit)),
        currentPage: parseInt(page),
        hasMore: skip + users.length < total
      },
      sortedBy: sortBy,
      medals: MEDALS
    };
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    throw error;
  }
};

module.exports = {
  XP_REWARDS,
  MEDALS,
  calculateLevel,
  awardXP,
  getLeaderboard
}; 