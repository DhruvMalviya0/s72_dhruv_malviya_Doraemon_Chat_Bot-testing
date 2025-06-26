// Remove the insecure TLS bypass
// process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"; // Only for development!
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const passport = require('./config/passport');
const path = require('path');

const app = express();

// CORS: Only enable in development (when frontend and backend are on different origins)
if (process.env.NODE_ENV !== 'production') {
  const allowedOrigins = [
    'https://s72-dhruv-malviya-doraemon-chat-bot.vercel.app',
    'http://localhost:3000'
  ];
  app.use(cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS: ' + origin));
    },
    credentials: true
  }));
}
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Initialize passport
app.use(passport.initialize());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// MongoDB connection with updated options
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverApi: {
        version: '1',
        strict: true,
        deprecationErrors: true
      },
      ssl: process.env.NODE_ENV === 'production',
      tls: process.env.NODE_ENV === 'production',
      tlsAllowInvalidCertificates: process.env.NODE_ENV !== 'production',
      retryWrites: true,
      w: 'majority',
      connectTimeoutMS: 30000,
      socketTimeoutMS: 30000,
      serverSelectionTimeoutMS: 30000,
      heartbeatFrequencyMS: 1000,
      maxPoolSize: 10,
      minPoolSize: 1,
      maxIdleTimeMS: 30000
    });
    console.log('Connected to MongoDB successfully');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

// Connect to database
connectDB();

// Add connection error handlers
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

mongoose.connection.on('reconnected', () => {
  console.log('MongoDB reconnected');
});

// Import routes
const authRoutes = require('./routes/auth');
const chatRoutes = require('./routes/chat');
const quizRoutes = require('./routes/quiz');
const progressRoutes = require('./routes/progress');
const leaderboardRoutes = require('./routes/leaderboard');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/leaderboard', leaderboardRoutes);

// Serve React static files in production
if (process.env.NODE_ENV === 'production') {
  const clientBuildPath = path.join(__dirname, '../../client/build');
  app.use(express.static(clientBuildPath));

  // Wildcard route: serve index.html for any non-API route
  app.get('*', (req, res) => {
    // If the request starts with /api, skip to next handler
    if (req.path.startsWith('/api')) return res.status(404).json({ message: 'API route not found' });
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });
}

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('join', (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined their room`);
  });

  socket.on('sendMessage', async (data) => {
    try {
      // Handle message sending logic here
      io.to(data.receiverId).emit('receiveMessage', data);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(500).json({
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Client URL: ${process.env.CLIENT_URL || 'http://localhost:3000'}`);
});

// Handle process termination
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    console.log('MongoDB connection closed through app termination');
    process.exit(0);
  } catch (err) {
    console.error('Error during app termination:', err);
    process.exit(1);
  }
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  process.exit(1);
}); 