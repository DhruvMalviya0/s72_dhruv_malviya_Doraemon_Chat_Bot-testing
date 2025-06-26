const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: function() {
      // Password is required only if googleId is not provided
      return !this.googleId;
    },
    minlength: 6
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true // Allows multiple documents with null/undefined value
  },
  profile: {
    avatar: {
      type: String,
      default: ''
    },
    bio: {
      type: String,
      default: ''
    },
    interests: [{
      type: String,
      enum: ['Mathematics', 'Science', 'History', 'Literature', 'Technology']
    }],
    education: {
      type: String,
      default: ''
    },
    goals: {
      type: String,
      default: ''
    }
  },
  xp: {
    type: Number,
    default: 0
  },
  level: {
    type: Number,
    default: 1
  },
  badges: [{
    name: String,
    description: String,
    icon: String,
    earnedAt: Date
  }],
  quizHistory: [{
    topic: String,
    score: Number,
    date: {
      type: Date,
      default: Date.now
    }
  }],
  studyPlans: [{
    title: String,
    description: String,
    topics: [String],
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  avatar: String,
  lastActive: { type: Date, default: Date.now },
  quizStats: {
    totalQuizzes: { type: Number, default: 0 },
    totalCorrect: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 }
  },
  createdAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new) and exists
  if (!this.isModified('password') || !this.password) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  // If user is using Google authentication and doesn't have a password
  if (!this.password) return false;
  
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User; 