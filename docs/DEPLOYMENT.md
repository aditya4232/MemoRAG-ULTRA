# Deployment Guide

This document provides comprehensive instructions for deploying CodeGenesis to production environments.

## Overview

CodeGenesis consists of two main components that need to be deployed separately:
- **Frontend**: Next.js application (recommended: Vercel)
- **Backend**: FastAPI application (recommended: Render)

## Prerequisites

Before deploying, ensure you have:
- A GitHub account with your code pushed to a repository
- All API keys ready (Gemini, Clerk, Supabase)
- Domain name (optional, but recommended for production)

## Frontend Deployment (Vercel)

Vercel is the recommended platform for deploying Next.js applications due to its seamless integration and automatic optimizations.

### Step 1: Prepare Your Repository

Ensure your code is pushed to GitHub:

```bash
git add .
git commit -m "Prepare for deployment"
git push origin main
```

### Step 2: Create Vercel Account

1. Visit [Vercel.com](https://vercel.com)
2. Sign up using your GitHub account
3. Authorize Vercel to access your repositories

### Step 3: Import Project

1. Click "Add New Project" in the Vercel dashboard
2. Select "Import Git Repository"
3. Find and select your CodeGenesis repository
4. Click "Import"

### Step 4: Configure Build Settings

Vercel will auto-detect Next.js. Verify these settings:

- **Framework Preset**: Next.js
- **Root Directory**: `frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

### Step 5: Add Environment Variables

In the "Environment Variables" section, add:

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_API_URL=https://your-backend-url.onrender.com
```

**Important**: Update `NEXT_PUBLIC_API_URL` after deploying your backend.

### Step 6: Deploy

1. Click "Deploy"
2. Wait for the build to complete (typically 2-3 minutes)
3. Your frontend will be live at `https://your-project.vercel.app`

### Step 7: Configure Custom Domain (Optional)

1. Go to your project settings in Vercel
2. Navigate to "Domains"
3. Add your custom domain
4. Follow the DNS configuration instructions

## Backend Deployment (Render)

Render provides a free tier suitable for deploying FastAPI applications with automatic HTTPS and continuous deployment.

### Step 1: Create Render Account

1. Visit [Render.com](https://render.com)
2. Sign up using your GitHub account
3. Authorize Render to access your repositories

### Step 2: Create New Web Service

1. Click "New +" in the Render dashboard
2. Select "Web Service"
3. Connect your GitHub repository
4. Select your CodeGenesis repository

### Step 3: Configure Service

Fill in the following details:

- **Name**: `codegenesis-backend` (or your preferred name)
- **Region**: Choose the closest to your users
- **Branch**: `main`
- **Root Directory**: `backend`
- **Runtime**: `Python 3`
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`

### Step 4: Select Plan

- Choose the "Free" plan for testing
- Upgrade to "Starter" or higher for production use

### Step 5: Add Environment Variables

In the "Environment Variables" section, add:

```
GEMINI_API_KEY=your_gemini_api_key
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
OPENAI_API_KEY=your_openai_key (optional)
ANTHROPIC_API_KEY=your_anthropic_key (optional)
```

### Step 6: Deploy

1. Click "Create Web Service"
2. Wait for the initial deployment (typically 3-5 minutes)
3. Your backend will be live at `https://your-service.onrender.com`

### Step 7: Update Frontend Configuration

After your backend is deployed:

1. Copy the backend URL from Render
2. Go back to Vercel
3. Update the `NEXT_PUBLIC_API_URL` environment variable
4. Redeploy your frontend

## Alternative Deployment Options

### Frontend Alternatives

#### Netlify

1. Connect your GitHub repository
2. Set build command: `cd frontend && npm run build`
3. Set publish directory: `frontend/.next`
4. Add environment variables
5. Deploy

#### AWS Amplify

1. Connect your repository
2. Configure build settings for Next.js
3. Set root directory to `frontend`
4. Add environment variables
5. Deploy

### Backend Alternatives

#### Railway

1. Create new project from GitHub
2. Select your repository
3. Set root directory: `backend`
4. Add environment variables
5. Deploy

#### Heroku

1. Create new app
2. Connect GitHub repository
3. Add Python buildpack
4. Set `Procfile`: `web: uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Add environment variables
6. Deploy

#### Google Cloud Run

1. Build Docker image
2. Push to Google Container Registry
3. Deploy to Cloud Run
4. Configure environment variables
5. Set up domain mapping

## Post-Deployment Configuration

### Update Clerk Settings

1. Go to your Clerk dashboard
2. Navigate to "Paths"
3. Add your production domain to allowed origins
4. Update redirect URLs if using custom domain

### Configure CORS

If you encounter CORS issues, verify that your backend `main.py` includes:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://your-frontend-domain.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Set Up Monitoring

#### Vercel Analytics

1. Enable Analytics in your Vercel project settings
2. Monitor page views, performance, and errors

#### Render Monitoring

1. View logs in the Render dashboard
2. Set up email alerts for service failures
3. Monitor resource usage

### Database Backups

If using Supabase:

1. Enable automatic backups in Supabase settings
2. Configure backup retention period
3. Test restoration process

## Continuous Deployment

Both Vercel and Render support automatic deployments:

1. Push changes to your GitHub repository
2. Deployments trigger automatically
3. Monitor build status in respective dashboards

### Deployment Workflow

```bash
# Make changes locally
git add .
git commit -m "Description of changes"
git push origin main

# Automatic deployment begins
# Vercel deploys frontend
# Render deploys backend
```

## Security Considerations

### Environment Variables

- Never commit `.env` files to Git
- Use platform-specific environment variable management
- Rotate API keys regularly

### HTTPS

- Both Vercel and Render provide automatic HTTPS
- Ensure all API calls use HTTPS in production

### API Rate Limiting

Consider implementing rate limiting for production:

```python
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter

@app.post("/api/generate")
@limiter.limit("10/minute")
async def generate_app(request: Request, data: GenerateRequest):
    # Your code here
```

## Troubleshooting

### Build Failures

**Frontend Build Fails**:
- Check build logs in Vercel
- Verify all dependencies are in `package.json`
- Ensure TypeScript has no errors

**Backend Build Fails**:
- Check build logs in Render
- Verify `requirements.txt` is complete
- Check Python version compatibility

### Runtime Errors

**Frontend 500 Errors**:
- Check browser console for errors
- Verify environment variables are set
- Check API connectivity

**Backend 500 Errors**:
- Check Render logs
- Verify API keys are valid
- Check database connectivity

### Performance Issues

**Slow Response Times**:
- Upgrade to paid tier for better resources
- Implement caching where appropriate
- Optimize database queries

## Cost Optimization

### Free Tier Limits

**Vercel Free Tier**:
- 100GB bandwidth per month
- Unlimited deployments
- Automatic HTTPS

**Render Free Tier**:
- 750 hours per month
- Automatic sleep after inactivity
- Slower cold starts

### Recommendations

- Use free tiers for development and testing
- Upgrade to paid plans for production traffic
- Monitor usage to avoid unexpected charges

## Maintenance

### Regular Updates

```bash
# Update dependencies
cd frontend && npm update
cd backend && pip install --upgrade -r requirements.txt

# Test locally
npm run build
python -m pytest

# Deploy
git push origin main
```

### Monitoring Checklist

- [ ] Check error logs weekly
- [ ] Monitor API usage and costs
- [ ] Review security alerts
- [ ] Test critical user flows monthly
- [ ] Update dependencies quarterly

## Support

For deployment issues:
- Vercel: [Vercel Documentation](https://vercel.com/docs)
- Render: [Render Documentation](https://render.com/docs)
- General: Open an issue on GitHub

---

Your application is now live and ready for users.
