/**
 * One-time script to award medals to top 3 users on the leaderboard
 * Run with: node src/scripts/awardInitialMedals.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const { MEDALS } = require('../services/xpService');

// MongoDB connection with options from main app
mongoose.connect(process.env.MONGODB_URI, {
  serverApi: { version: '1', strict: true, deprecationErrors: true },
  ssl: true,
  tls: true,
  tlsAllowInvalidCertificates: true,
  retryWrites: true,
  w: 'majority',
})
.then(async () => {
  console.log('Connected to MongoDB successfully');
  
  try {
    // Get top 3 users by XP
    const topUsers = await User.find()
      .sort({ xp: -1 })
      .limit(3);
    
    console.log(`Found ${topUsers.length} top users to award medals to`);
    
    // Award medals to top 3 users
    const medals = [MEDALS.GOLD, MEDALS.SILVER, MEDALS.BRONZE];
    
    for (let i = 0; i < topUsers.length && i < 3; i++) {
      const user = topUsers[i];
      const medal = medals[i];
      
      // Check if user already has this medal
      const hasMedal = user.badges.some(badge => badge.name === medal.name);
      
      if (!hasMedal) {
        // Add medal to user's badges
        user.badges.push({
          name: medal.name,
          description: medal.description,
          icon: medal.icon,
          earnedAt: new Date()
        });
        
        await user.save();
        console.log(`Awarded ${medal.name} to ${user.username} (Rank ${i+1})`);
      } else {
        console.log(`${user.username} already has ${medal.name}`);
      }
    }
    
    console.log('Medal awarding complete');
  } catch (error) {
    console.error('Error awarding medals:', error);
  } finally {
    // Close MongoDB connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
    process.exit(0);
  }
})
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
}); 