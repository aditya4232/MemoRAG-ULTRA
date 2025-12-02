# 🚀 CodeGenesis - Production Deployment Guide

## Table of Contents
1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Environment Setup](#environment-setup)
3. [Database Setup](#database-setup)
4. [Backend Deployment](#backend-deployment)
5. [Frontend Deployment](#frontend-deployment)
6. [Security Hardening](#security-hardening)
7. [Monitoring & Logging](#monitoring--logging)
8. [Troubleshooting](#troubleshooting)

---

## Pre-Deployment Checklist

### ✅ Required Accounts & Services
- [ ] **Clerk Account** - Authentication ([clerk.com](https://clerk.com))
- [ ] **Supabase Project** - Database ([supabase.com](https://supabase.com))
- [ ] **A4F API Key** - AI Provider ([api.a4f.co](https://api.a4f.co))
- [ ] **Vercel Account** (Frontend) - Optional ([vercel.com](https://vercel.com))
- [ ] **Railway/Render Account** (Backend) - Optional

### ✅ Security Requirements
- [ ] Generate strong encryption key for API keys
- [ ] Update all default secrets and passwords
- [ ] Configure CORS properly
- [ ] Enable HTTPS/SSL certificates
- [ ] Set up rate limiting
- [ ] Configure environment variables securely

---

## Environment Setup

### 1. Generate Secure Keys

```bash
# Generate API key encryption secret (32 bytes)
openssl rand -base64 32

# Generate JWT secret (if using custom auth)
openssl rand -hex 32
```

### 2. Configure Frontend Environment

Create `frontend/.env.production`:

```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_your_production_key
CLERK_SECRET_KEY=sk_live_your_production_secret

# Clerk URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key

# Backend API (Update with your production URL)
NEXT_PUBLIC_API_URL=https://api.yourdomain.com

# API Key Encryption (Use the generated key from step 1)
API_KEY_ENCRYPTION_SECRET=your_generated_encryption_key_here
```

### 3. Configure Backend Environment

Create `backend/.env.production`:

```bash
# AI Provider API Keys
A4F_API_KEY=your_a4f_production_key
A4F_BASE_URL=https://api.a4f.co/v1
A4F_MODEL=provider-2/gemini-2.5-flash

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_production_anon_key

# Server Configuration
HOST=0.0.0.0
PORT=8000
ENVIRONMENT=production

# CORS (Update with your frontend domain)
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Logging
LOG_LEVEL=WARNING

# Security
SECRET_KEY=your_generated_jwt_secret_here
```

---

## Database Setup

### 1. Run Schema on Supabase

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy the contents of `frontend/supabase/schema.sql`
4. Execute the SQL script
5. Verify all tables are created:
   - `profiles`
   - `projects`
   - `generations`
   - `user_settings`
   - `encrypted_api_keys`
   - `model_preferences`
   - `usage_tracking`

### 2. Enable Row Level Security (RLS)

The schema automatically enables RLS. Verify in Supabase:
- Go to **Authentication** → **Policies**
- Ensure all tables have policies enabled

### 3. Test Database Connection

```bash
# From backend directory
python -c "from supabase import create_client; client = create_client('YOUR_URL', 'YOUR_KEY'); print('✓ Connected')"
```

---

## Backend Deployment

### Option 1: Railway

1. **Install Railway CLI**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login and Initialize**
   ```bash
   railway login
   cd backend
   railway init
   ```

3. **Set Environment Variables**
   ```bash
   railway variables set A4F_API_KEY=your_key
   railway variables set SUPABASE_URL=your_url
   # ... set all other variables
   ```

4. **Deploy**
   ```bash
   railway up
   ```

### Option 2: Render

1. Create a new **Web Service** on Render
2. Connect your GitHub repository
3. Set build command: `pip install -r requirements.txt`
4. Set start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Add environment variables from `.env.production`
6. Deploy

### Option 3: Docker

```bash
# Build Docker image
cd backend
docker build -t codegenesis-backend .

# Run container
docker run -p 8000:8000 --env-file .env.production codegenesis-backend
```

---

## Frontend Deployment

### Option 1: Vercel (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy**
   ```bash
   cd frontend
   vercel --prod
   ```

3. **Set Environment Variables**
   - Go to Vercel dashboard → Settings → Environment Variables
   - Add all variables from `.env.production`

### Option 2: Netlify

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Build and Deploy**
   ```bash
   cd frontend
   npm run build
   netlify deploy --prod
   ```

### Option 3: Self-Hosted

```bash
# Build production bundle
cd frontend
npm run build

# Serve with PM2
npm install -g pm2
pm2 start npm --name "codegenesis-frontend" -- start
```

---

## Security Hardening

### 1. API Key Encryption

✅ **Already Implemented**: User API keys are encrypted using `pgcrypto` in Supabase

Verify encryption is working:
```sql
-- In Supabase SQL Editor
SELECT encrypt_api_key('test_key', 'your_encryption_secret');
```

### 2. HTTPS/SSL

- **Vercel/Netlify**: Automatic SSL
- **Self-hosted**: Use Let's Encrypt with Nginx

```nginx
server {
    listen 443 ssl;
    server_name yourdomain.com;
    
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    location / {
        proxy_pass http://localhost:3000;
    }
}
```

### 3. Rate Limiting

Add to `backend/main.py`:

```python
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

@app.post("/api/generate")
@limiter.limit("10/minute")
async def generate_code(request: Request):
    # ... existing code
```

### 4. CORS Configuration

Update `backend/main.py`:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "").split(","),
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)
```

---

## Monitoring & Logging

### 1. Error Tracking (Sentry)

**Frontend:**
```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

**Backend:**
```bash
pip install sentry-sdk
```

Add to `backend/main.py`:
```python
import sentry_sdk
sentry_sdk.init(dsn=os.getenv("SENTRY_DSN"))
```

### 2. Application Monitoring

- **Vercel Analytics**: Automatic for frontend
- **Railway Metrics**: Built-in for backend
- **Custom**: Use Prometheus + Grafana

### 3. Logging

Backend logs are automatically captured. For production:

```python
import logging

logging.basicConfig(
    level=logging.WARNING,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('app.log'),
        logging.StreamHandler()
    ]
)
```

---

## Troubleshooting

### Common Issues

#### 1. Database Connection Fails
```bash
# Check Supabase URL and key
curl https://your-project.supabase.co/rest/v1/ \
  -H "apikey: your_anon_key"
```

#### 2. Clerk Authentication Not Working
- Verify publishable key starts with `pk_live_` (production)
- Check domain is added in Clerk dashboard
- Ensure HTTPS is enabled

#### 3. API Generation Fails
- Check A4F API key is valid
- Verify rate limits not exceeded
- Check backend logs for errors

#### 4. CORS Errors
- Add frontend domain to `CORS_ORIGINS`
- Ensure protocol (http/https) matches
- Check browser console for exact error

### Health Checks

**Backend:**
```bash
curl https://api.yourdomain.com/health
```

**Frontend:**
```bash
curl https://yourdomain.com
```

**Database:**
```bash
curl https://your-project.supabase.co/rest/v1/profiles \
  -H "apikey: your_anon_key"
```

---

## Post-Deployment Checklist

- [ ] All services are running
- [ ] Database schema is applied
- [ ] Environment variables are set
- [ ] HTTPS is enabled
- [ ] CORS is configured
- [ ] Rate limiting is active
- [ ] Error tracking is set up
- [ ] Monitoring is configured
- [ ] Backups are scheduled
- [ ] Documentation is updated

---

## Support

For issues or questions:
- **Documentation**: Check `/docs` folder
- **GitHub Issues**: Create an issue
- **Email**: support@yourdomain.com

---

**Last Updated**: December 2025  
**Version**: 1.0.0
