# Render + Vercel Deployment Guide

This guide is specifically for deploying the Doraemon Chat Bot with **Render** for the backend and **Vercel** for the frontend.

## 🚀 Quick Deployment Steps

### Step 1: Deploy Backend to Render

1. **Go to [Render.com](https://render.com)** and sign up/login
2. **Click "New +" → "Web Service"**
3. **Connect your GitHub repository**
4. **Configure the service:**
   - **Name**: `doraemon-chat-bot-backend`
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free (or choose paid plan)

5. **Add Environment Variables** (click "Advanced" → "Add Environment Variable"):
   ```env
   NODE_ENV=production
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/doraemon-chat-bot
   JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters
   OPENAI_API_KEY=sk-your-openai-api-key
   OPENAI_API_BASE_URL=https://api.openai.com/v1
   GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   CLIENT_URL=https://your-vercel-app.vercel.app
   SERVER_URL=https://your-render-app.onrender.com
   ```

6. **Click "Create Web Service"**
7. **Wait for deployment** (usually 2-5 minutes)
8. **Note your Render URL** (e.g., `https://doraemon-chat-bot-backend.onrender.com`)

### Step 2: Deploy Frontend to Vercel

1. **Go to [Vercel.com](https://vercel.com)** and sign up/login
2. **Click "New Project"**
3. **Import your GitHub repository**
4. **Configure the project:**
   - **Framework Preset**: Create React App
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
   - **Install Command**: `npm install`

5. **Add Environment Variables** (click "Environment Variables"):
   ```env
   REACT_APP_SERVER_URL=https://your-render-app.onrender.com
   ```

6. **Click "Deploy"**
7. **Wait for deployment** (usually 1-3 minutes)
8. **Note your Vercel URL** (e.g., `https://doraemon-chat-bot.vercel.app`)

### Step 3: Update Environment Variables

After both deployments are complete, update the environment variables:

**In Render Dashboard:**
- Update `CLIENT_URL` to your Vercel URL
- Update `SERVER_URL` to your Render URL

**In Vercel Dashboard:**
- Update `REACT_APP_SERVER_URL` to your Render URL

## 🔧 Configuration Files

### render.yaml (Already configured)
```yaml
services:
  - type: web
    name: doraemon-chat-bot-backend
    env: node
    plan: free
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      # Other variables will be set in dashboard
```

### vercel.json (Root level)
```json
{
  "version": 2,
  "builds": [
    {
      "src": "client/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "build"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "env": {
    "REACT_APP_SERVER_URL": "@react_app_server_url"
  }
}
```

### client/vercel.json
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/static/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

## 🌐 Domain Configuration

### Custom Domain (Optional)
1. **Vercel**: Go to "Settings" → "Domains" → "Add Domain"
2. **Render**: Go to "Settings" → "Custom Domains" → "Add Domain"
3. **Update environment variables** with your custom domains

### SSL Certificates
- **Vercel**: Automatic SSL (Let's Encrypt)
- **Render**: Automatic SSL (Let's Encrypt)

## 🔒 Environment Variables Checklist

### Render (Backend) Environment Variables
- [ ] `NODE_ENV=production`
- [ ] `MONGODB_URI=mongodb+srv://...`
- [ ] `JWT_SECRET=your-secret-key`
- [ ] `OPENAI_API_KEY=sk-...`
- [ ] `OPENAI_API_BASE_URL=https://api.openai.com/v1`
- [ ] `GOOGLE_CLIENT_ID=...`
- [ ] `GOOGLE_CLIENT_SECRET=...`
- [ ] `CLIENT_URL=https://your-vercel-app.vercel.app`
- [ ] `SERVER_URL=https://your-render-app.onrender.com`

### Vercel (Frontend) Environment Variables
- [ ] `REACT_APP_SERVER_URL=https://your-render-app.onrender.com`

## 🐛 Troubleshooting

### Common Issues

#### 1. CORS Errors
**Symptoms**: Frontend can't connect to backend
**Solution**: 
- Check `CLIENT_URL` in Render matches your Vercel URL exactly
- Check `REACT_APP_SERVER_URL` in Vercel matches your Render URL exactly
- Ensure URLs include `https://` protocol

#### 2. Build Failures
**Symptoms**: Deployment fails during build
**Solution**:
- Check Node.js version (should be 16+)
- Verify all dependencies are in package.json
- Check for syntax errors in code

#### 3. MongoDB Connection Issues
**Symptoms**: Backend fails to start
**Solution**:
- Verify MongoDB URI format
- Check network access for MongoDB Atlas
- Ensure database user has proper permissions

#### 4. Environment Variables Not Working
**Symptoms**: App works locally but not deployed
**Solution**:
- Double-check variable names (case-sensitive)
- Ensure no extra spaces in values
- Redeploy after changing environment variables

#### 5. Vercel Routing Issues
**Symptoms**: Page refreshes show 404 errors
**Solution**:
- Ensure `vercel.json` is in the client directory
- Check that rewrites are configured correctly
- Verify SPA routing is working

### Debug Commands

```bash
# Check Render deployment status
# Go to Render dashboard → Your service → Logs

# Check Vercel deployment status
# Go to Vercel dashboard → Your project → Deployments

# Test backend health
curl https://your-render-app.onrender.com/health

# Test frontend
# Open your Vercel URL in browser
```

## 📊 Monitoring

### Render Monitoring
- **Logs**: View real-time logs in dashboard
- **Health**: Check `/health` endpoint
- **Metrics**: View performance metrics

### Vercel Monitoring
- **Build Logs**: View build process logs
- **Deploy Status**: Monitor deployment status
- **Analytics**: View site analytics (if enabled)
- **Functions**: Monitor serverless functions (if any)

## 🔄 Continuous Deployment

### Automatic Deployments
- **Render**: Automatically deploys on git push to main branch
- **Vercel**: Automatically deploys on git push to main branch

### Manual Deployments
- **Render**: Use "Manual Deploy" button in dashboard
- **Vercel**: Use "Redeploy" button in dashboard

## 🚀 Performance Tips

### Render Optimization
- Use connection pooling for MongoDB
- Implement caching strategies
- Monitor memory usage

### Vercel Optimization
- Enable automatic static optimization
- Use CDN for static assets
- Implement caching headers
- Use edge functions for dynamic content

## 📝 Post-Deployment Checklist

- [ ] Backend deployed successfully on Render
- [ ] Frontend deployed successfully on Vercel
- [ ] Environment variables configured correctly
- [ ] CORS working (no errors in browser console)
- [ ] Authentication working
- [ ] Chat functionality working
- [ ] Quiz functionality working
- [ ] Leaderboard working
- [ ] Health check endpoint responding
- [ ] Custom domain configured (if needed)
- [ ] SSL certificates active
- [ ] Monitoring set up
- [ ] SPA routing working correctly

## 🆘 Support

If you encounter issues:

1. **Check the troubleshooting section above**
2. **Verify all environment variables are set correctly**
3. **Check deployment logs in both Render and Vercel dashboards**
4. **Test the health endpoint**: `https://your-render-app.onrender.com/health`
5. **Check browser console for frontend errors**
6. **Ensure MongoDB Atlas is accessible from Render**

## 🔗 Useful Links

- [Render Documentation](https://render.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [MongoDB Atlas Setup](https://docs.atlas.mongodb.com/getting-started/)
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Google OAuth Setup](https://developers.google.com/identity/protocols/oauth2)

## 🎯 Vercel vs Netlify Comparison

### Vercel Advantages
- Better React/Next.js integration
- Automatic static optimization
- Edge functions support
- Better performance monitoring
- Automatic HTTPS and CDN

### Netlify Advantages
- More generous free tier
- Better form handling
- More deployment options
- Better for static sites

For this React application, **Vercel is recommended** due to better React integration and performance optimizations. 