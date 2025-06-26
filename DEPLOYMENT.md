# Doraemon Chat Bot - Deployment Guide

This guide will help you deploy the Doraemon Chat Bot application on localhost, Render, and Netlify.

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm (v8 or higher)
- MongoDB database (local or cloud)
- OpenAI API key
- Google OAuth credentials (optional)

## 📋 Environment Setup

### 1. Clone and Install Dependencies

```bash
# Clone the repository
git clone <your-repo-url>
cd s72_dhruv_malviya_Doraemon_Chat_Bot

# Install all dependencies
npm run install-all
```

### 2. Environment Variables

#### Backend (.env file in server directory)
Copy `server/env.example` to `server/.env` and fill in your values:

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/doraemon-chat-bot

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Server Configuration
PORT=5000
NODE_ENV=development

# Client URL (for CORS)
CLIENT_URL=http://localhost:3000

# Server URL (for OAuth callbacks)
SERVER_URL=http://localhost:5000

# OpenAI Configuration
OPENAI_API_KEY=your-openai-api-key
OPENAI_API_BASE_URL=https://api.openai.com/v1

# Google OAuth Configuration (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

#### Frontend (.env.local file in client directory)
Copy `client/env.example` to `client/.env.local`:

```env
REACT_APP_SERVER_URL=http://localhost:5000
```

## 🏠 Localhost Deployment

### Option 1: Run Both Services Together
```bash
# From the root directory
npm run dev
```

### Option 2: Run Services Separately
```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd client
npm start
```

### Option 3: Using Startup Scripts
```bash
# Windows
start.bat

# Linux/Mac
./start.sh
```

### Option 4: Using Docker (Recommended for Development)
```bash
# Make sure you have Docker and Docker Compose installed
docker-compose up --build
```

### Access the Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Health Check: http://localhost:5000/health

## 🐳 Docker Deployment

### Prerequisites
- Docker
- Docker Compose

### Quick Start with Docker
```bash
# Clone the repository
git clone <your-repo-url>
cd s72_dhruv_malviya_Doraemon_Chat_Bot

# Set environment variables
export OPENAI_API_KEY=your-openai-api-key
export GOOGLE_CLIENT_ID=your-google-client-id
export GOOGLE_CLIENT_SECRET=your-google-client-secret

# Start all services
docker-compose up --build
```

### Docker Services
- **MongoDB**: Database service on port 27017
- **Backend**: API service on port 5000
- **Frontend**: React development server on port 3000

### Docker Commands
```bash
# Start services
docker-compose up

# Start services in background
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs

# Rebuild and start
docker-compose up --build

# Remove all containers and volumes
docker-compose down -v
```

## ☁️ Render Deployment (Backend)

### 1. Create Render Account
- Sign up at [render.com](https://render.com)
- Connect your GitHub repository

### 2. Deploy Backend Service
1. Click "New +" → "Web Service"
2. Connect your GitHub repository
3. Configure the service:
   - **Name**: `doraemon-chat-bot-backend`
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

### 3. Environment Variables
Add these environment variables in Render dashboard:

```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/doraemon-chat-bot
JWT_SECRET=your-super-secret-jwt-key
OPENAI_API_KEY=your-openai-api-key
OPENAI_API_BASE_URL=https://api.openai.com/v1
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
CLIENT_URL=https://your-frontend-domain.netlify.app
SERVER_URL=https://your-backend-service.onrender.com
```

### 4. Deploy
- Click "Create Web Service"
- Wait for deployment to complete
- Note your service URL (e.g., `https://doraemon-chat-bot-backend.onrender.com`)

## 🌐 Netlify Deployment (Frontend)

### 1. Create Netlify Account
- Sign up at [netlify.com](https://netlify.com)
- Connect your GitHub repository

### 2. Deploy Frontend
1. Click "New site from Git"
2. Choose your repository
3. Configure build settings:
   - **Base directory**: `client`
   - **Build command**: `npm run build`
   - **Publish directory**: `build`

### 3. Environment Variables
Add environment variables in Netlify dashboard:

```env
REACT_APP_SERVER_URL=https://your-backend-service.onrender.com
```

### 4. Deploy
- Click "Deploy site"
- Wait for deployment to complete
- Your site will be available at `https://your-site-name.netlify.app`

## 🔧 Configuration Files

### render.yaml (Backend)
The `render.yaml` file is already configured for Render deployment.

### netlify.toml (Frontend)
The `netlify.toml` file is already configured for Netlify deployment.

### _redirects (Frontend)
The `client/public/_redirects` file handles SPA routing for Netlify.

### Docker Configuration
- `Dockerfile`: Production build for the entire application
- `docker-compose.yml`: Multi-service setup with MongoDB
- `client/Dockerfile.dev`: Development build for frontend

## 🔒 Security Considerations

### Production Environment Variables
- Use strong, unique JWT secrets
- Store sensitive data in environment variables
- Never commit `.env` files to version control
- Use HTTPS in production

### CORS Configuration
- Update `CLIENT_URL` to match your frontend domain
- Configure CORS properly for production

### Database Security
- Use MongoDB Atlas for production
- Enable network access controls
- Use strong database passwords

### Docker Security
- Use non-root users in containers
- Keep base images updated
- Scan images for vulnerabilities
- Use secrets management for sensitive data

## 🐛 Troubleshooting

### Common Issues

#### 1. CORS Errors
- Ensure `CLIENT_URL` is set correctly
- Check that frontend and backend URLs match

#### 2. MongoDB Connection Issues
- Verify MongoDB URI format
- Check network access for cloud databases
- Ensure database user has proper permissions

#### 3. Build Failures
- Check Node.js version compatibility
- Verify all dependencies are installed
- Check for syntax errors in code

#### 4. Environment Variables
- Ensure all required variables are set
- Check variable names match exactly
- Restart services after changing environment variables

#### 5. Docker Issues
- Check Docker and Docker Compose versions
- Ensure ports are not already in use
- Check container logs: `docker-compose logs`
- Verify environment variables are set correctly

### Debug Commands

```bash
# Check Node.js version
node --version

# Check npm version
npm --version

# Check Docker version
docker --version
docker-compose --version

# Check MongoDB connection
curl http://localhost:5000/health

# Check frontend build
cd client && npm run build

# Check backend logs
cd server && npm run dev

# Check Docker containers
docker-compose ps

# Check Docker logs
docker-compose logs backend
docker-compose logs frontend
docker-compose logs mongodb
```

## 📊 Monitoring

### Health Check Endpoint
- Backend: `GET /health`
- Returns server status and environment info

### Logs
- Render: View logs in dashboard
- Netlify: View build logs in dashboard
- Local: Check terminal output
- Docker: `docker-compose logs`

### Docker Health Checks
- Backend service includes health check
- MongoDB service is monitored
- Frontend service status can be checked

## 🔄 Continuous Deployment

### Automatic Deployments
- Render: Automatically deploys on git push
- Netlify: Automatically deploys on git push
- Docker: Rebuild on code changes
- Configure branch protection rules

### Manual Deployments
```bash
# Trigger manual deployment on Render
# Use the "Manual Deploy" button in dashboard

# Trigger manual deployment on Netlify
# Use the "Trigger deploy" button in dashboard

# Rebuild Docker containers
docker-compose up --build
```

## 📝 Additional Notes

- The application supports both local and cloud MongoDB
- Google OAuth is optional but recommended for better UX
- All API endpoints are prefixed with `/api`
- The frontend is a Single Page Application (SPA)
- Socket.io is used for real-time features
- Docker provides isolated development environment
- Health checks ensure service availability

## 🆘 Support

If you encounter issues:
1. Check the troubleshooting section
2. Verify all environment variables are set
3. Check the logs for error messages
4. Ensure all dependencies are installed
5. Verify network connectivity and firewall settings
6. For Docker issues, check container status and logs

## 🚀 Performance Optimization

### Production Optimizations
- Enable gzip compression
- Use CDN for static assets
- Implement caching strategies
- Optimize database queries
- Use connection pooling

### Docker Optimizations
- Use multi-stage builds
- Minimize image size
- Use .dockerignore files
- Implement health checks
- Use volume mounts for development 