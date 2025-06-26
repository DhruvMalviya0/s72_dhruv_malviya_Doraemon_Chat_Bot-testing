# Doraemon Chat Bot: AI-Powered Personalized Learning Platform

## 🚀 **Quick Deploy: Render + Vercel**

This project is optimized for deployment on **Render** (backend) and **Vercel** (frontend).

### **One-Click Setup**
```bash
# Run the setup script to configure environment variables
node setup-env.js

# Follow the generated configuration files
# See RENDER-VERCEL-DEPLOYMENT.md for detailed steps
```

### **Deployment Status**
- ✅ **Backend**: Ready for Render deployment
- ✅ **Frontend**: Ready for Vercel deployment  
- ✅ **Database**: MongoDB Atlas compatible
- ✅ **Environment**: Fully configured
- ✅ **SSL**: Automatic HTTPS

---

## 🌟 Capstone Project Idea Brief

The Doraemon Chat Bot is an intelligent learning platform designed to personalize education, provide instant doubt resolution, and foster collaboration through AI-powered tools. The platform enhances digital learning by leveraging artificial intelligence and real-time collaboration. It offers personalized study plan, AI-driven quizzes, real-time chat, and video summarization to create a comprehensive learning experience tailored to each user.

### 🚀 Key Features
- **Personalized Learning Paths:** AI-generated study plans based on initial assessments.
- **AI Chatbot:** Instant doubt-solving using OpenAI's GPT-4.
- **Quiz Generator:** AI-crafted quizzes tailored to topics and difficulty levels.
- **Real-Time Collaboration:** Group chats, discussion forums, and video study sessions.
- **Video Summarization:** AI-powered notes and summaries from educational videos.
- **Leaderboard:** Track top performers and foster healthy competition.

### 🎯 Core Elements of the Leveling System
- **XP System:** Assign XP for actions like completing lessons, quizzes, helping in forums, etc.
- **Level Calculation:** Formula: `Level = floor(sqrt(totalXP / 100))` (or define custom thresholds).
- **Rewards & Feedback:** Unlock badges, new content, or avatar customization options at higher levels.
- **UI Integration:** Show a progress bar with "Current Level" and "XP to Next Level."
- **Backend Setup:** Add XP tracking in the User model and create endpoints for XP updates and user progress.
- **Frontend Implementation:** Build a LevelProgress component to visualize user's XP and level.

### 🏆 Leaderboard System
- **Ranking:** Rank users based on total XP earned and display top performers.
- **Backend Setup:** Create an endpoint to fetch the top users sorted by XP.
- **Frontend Implementation:** Build a Leaderboard component to display ranked users with avatars, names, and XP points.

### 🛠️ Tech Stack
- **Frontend:** React.js with Tailwind CSS
- **Backend:** Node.js with Express.js, MongoDB with Mongoose, JWT and Firebase Authentication, Socket.io
- **AI/ML Integration:** OpenAI GPT-4, TensorFlow.js
- **Deployment & Storage:** Vercel (Frontend), Render (Backend), MongoDB Atlas (Database), AWS S3/Firebase (Storage), Redis (Caching)

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm (v8 or higher)
- MongoDB database (local or cloud)
- OpenAI API key
- Google OAuth credentials (optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd s72_dhruv_malviya_Doraemon_Chat_Bot
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Set up environment variables**
   - Copy `server/env.example` to `server/.env`
   - Copy `client/env.example` to `client/.env.local`
   - Fill in your configuration values

4. **Start the application**
   ```bash
   # Development mode (both frontend and backend)
   npm run dev
   
   # Or run separately:
   # Terminal 1: npm run server
   # Terminal 2: npm run client
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 📋 Environment Variables

### Backend (.env)
```env
MONGODB_URI=mongodb://localhost:27017/doraemon-chat-bot
JWT_SECRET=your-super-secret-jwt-key
OPENAI_API_KEY=your-openai-api-key
OPENAI_API_BASE_URL=https://api.openai.com/v1
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
CLIENT_URL=http://localhost:3000
SERVER_URL=http://localhost:5000
PORT=5000
NODE_ENV=development
```

### Frontend (.env.local)
```env
REACT_APP_SERVER_URL=http://localhost:5000
```

## 🌐 Deployment

### **🎯 Recommended: Render + Vercel**
- **Backend**: Deploy to Render using `render.yaml`
- **Frontend**: Deploy to Vercel using `vercel.json`
- **Database**: Use MongoDB Atlas
- **See**: [RENDER-VERCEL-DEPLOYMENT.md](./RENDER-VERCEL-DEPLOYMENT.md)

### Localhost
- Follow the Quick Start guide above
- Use local MongoDB instance
- Set `NODE_ENV=development`

### Other Options
- **Docker**: Use `docker-compose.yml` for containerized deployment
- **Netlify**: Alternative frontend deployment
- **Heroku**: Alternative backend deployment

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).

## 📁 Project Structure

```
s72_dhruv_malviya_Doraemon_Chat_Bot/
├── client/                 # React frontend
│   ├── public/            # Static files
│   ├── src/               # Source code
│   │   ├── components/    # React components
│   │   ├── utils/         # Utility functions
│   │   └── ...
│   ├── package.json
│   ├── vercel.json        # Vercel configuration
│   └── ...
├── server/                # Node.js backend
│   ├── src/               # Source code
│   │   ├── config/        # Configuration files
│   │   ├── controllers/   # Route controllers
│   │   ├── middleware/    # Express middleware
│   │   ├── models/        # MongoDB models
│   │   ├── routes/        # API routes
│   │   └── ...
│   ├── package.json
│   └── ...
├── package.json           # Root package.json
├── render.yaml            # Render deployment config
├── vercel.json            # Vercel deployment config
├── setup-env.js           # Environment setup script
├── RENDER-VERCEL-DEPLOYMENT.md  # Render + Vercel guide
└── DEPLOYMENT.md          # General deployment guide
```

## 🔧 Available Scripts

### Root Directory
- `npm run install-all` - Install all dependencies
- `npm run dev` - Start both frontend and backend in development
- `npm run server` - Start backend only
- `npm run client` - Start frontend only
- `npm run build` - Build frontend for production

### Client Directory
- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests

### Server Directory
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- CORS configuration
- Environment variable protection
- Input validation and sanitization
- Rate limiting (can be added)

## 🐛 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure `CLIENT_URL` is set correctly
   - Check that frontend and backend URLs match

2. **MongoDB Connection Issues**
   - Verify MongoDB URI format
   - Check network access for cloud databases
   - Ensure database user has proper permissions

3. **Build Failures**
   - Check Node.js version compatibility
   - Verify all dependencies are installed
   - Check for syntax errors in code

4. **Environment Variables**
   - Ensure all required variables are set
   - Check variable names match exactly
   - Restart services after changing environment variables

For more troubleshooting tips, see [DEPLOYMENT.md](./DEPLOYMENT.md).

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/google` - Google OAuth login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Chat
- `POST /api/chat/send` - Send chat message
- `POST /api/chat/study-doubt` - Send study doubt

### Quiz
- `POST /api/quiz/generate` - Generate quiz
- `POST /api/quiz/submit` - Submit quiz answers

### Progress
- `GET /api/progress/user` - Get user progress
- `POST /api/progress/update` - Update user progress

### Leaderboard
- `GET /api/leaderboard` - Get leaderboard

### Health Check
- `GET /health` - Server health status

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter issues:
1. Check the troubleshooting section
2. Verify all environment variables are set
3. Check the logs for error messages
4. Ensure all dependencies are installed
5. Verify network connectivity and firewall settings

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).

--- 

