const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

// Log OAuth configuration for debugging
console.log('Google OAuth Config:', {
  clientID: process.env.GOOGLE_CLIENT_ID ? 'Set' : 'Missing',
  clientSecret: process.env.GOOGLE_CLIENT_SECRET ? 'Set' : 'Missing',
  callbackURL: `${process.env.SERVER_URL || 'http://localhost:5000'}/api/auth/google/callback`
});

// Set up passport with Google strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${process.env.SERVER_URL || 'http://localhost:5000'}/api/auth/google/callback`,
    scope: ['profile', 'email']
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      console.log('Google profile received:', {
        id: profile.id,
        displayName: profile.displayName,
        email: profile.emails?.[0]?.value
      });
      
      // Check if user already exists
      let user = await User.findOne({ googleId: profile.id });
      
      // If user exists, return the user
      if (user) {
        console.log('Existing Google user found:', user.username);
        return done(null, user);
      }
      
      // Check if the email is already in use by a non-Google user
      const existingUser = await User.findOne({ email: profile.emails[0].value });
      
      if (existingUser) {
        // Link Google account to existing user
        console.log('Linking Google account to existing user:', existingUser.username);
        existingUser.googleId = profile.id;
        await existingUser.save();
        return done(null, existingUser);
      }
      
      // Create a new user with Google profile data
      console.log('Creating new user from Google profile');
      const newUser = new User({
        googleId: profile.id,
        email: profile.emails[0].value,
        username: profile.displayName.replace(/\s+/g, '') || `user${profile.id.substring(0, 8)}`,
        profile: {
          avatar: profile.photos && profile.photos.length > 0 ? profile.photos[0].value : ''
        }
      });
      
      // Award XP for completing profile with Google login
      newUser.xp = 20; // COMPLETE_PROFILE reward
      
      // Save the new user
      await newUser.save();
      console.log('New Google user created:', newUser.username);
      
      return done(null, newUser);
    } catch (error) {
      console.error('Google authentication error:', error);
      return done(error, null);
    }
  }
));

// Serialize user to store in session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport; 