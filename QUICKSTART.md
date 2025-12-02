# 🚀 CodeGenesis - Quick Start Guide

## Prerequisites

Before you begin, ensure you have the following installed:
- **Python 3.8+** - [Download](https://python.org)
- **Node.js 18+** - [Download](https://nodejs.org)
- **Git** - [Download](https://git-scm.com)

## 📦 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/CodeGenesis.git
cd CodeGenesis
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy environment template
copy .env.example .env  # Windows
# OR
cp .env.example .env    # Linux/Mac

# Edit .env and add your API keys
# Required: A4F_API_KEY, SUPABASE_URL, SUPABASE_KEY
```

### 3. Frontend Setup

```bash
# Navigate to frontend directory (from project root)
cd frontend

# Install dependencies
npm install

# Copy environment template
copy .env.example .env.local  # Windows
# OR
cp .env.example .env.local    # Linux/Mac

# Edit .env.local and add your keys
# Required: CLERK keys, SUPABASE keys, API_KEY_ENCRYPTION_SECRET
```

### 4. Database Setup

1. Go to [Supabase](https://supabase.com) and create a new project
2. Navigate to **SQL Editor** in your Supabase dashboard
3. Copy the contents of `frontend/supabase/schema.sql`
4. Execute the SQL script
5. Verify tables are created in the **Table Editor**

## 🎯 Running the Application

### Start Backend (Terminal 1)

```bash
cd backend
python main.py
```

You should see:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete.
```

### Start Frontend (Terminal 2)

```bash
cd frontend
npm run dev
```

You should see:
```
  ▲ Next.js 16.0.6
  - Local:        http://localhost:3000
  - Ready in 2.3s
```

### Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

## 🧪 Testing

### Run All Tests

**Windows:**
```bash
run_tests.bat
```

**Linux/Mac:**
```bash
chmod +x run_tests.sh
./run_tests.sh
```

### Manual Testing

1. **Test Backend Health:**
   ```bash
   curl http://localhost:8000/health
   ```

2. **Test Frontend:**
   - Open http://localhost:3000
   - Sign up for a new account
   - Navigate to Dashboard

3. **Test Code Generation:**
   - Go to Dashboard
   - Click "New Project"
   - Enter a prompt (see `EXAMPLE_PROMPTS.md`)
   - Click "Generate"

## 📝 Example Usage

### Create Your First Project

1. **Sign In/Sign Up**
   - Go to http://localhost:3000
   - Click "Sign Up" and create an account
   - Verify your email (if required)

2. **Add API Key**
   - Navigate to Settings → API Keys
   - Add your OpenRouter or OpenAI API key
   - Save

3. **Create a Project**
   - Go to Dashboard
   - Click "New Project"
   - Fill in project details:
     - **Name**: "My Landing Page"
     - **Description**: "A modern landing page for my SaaS"
     - **Type**: Web App
     - **Tech Stack**: React, TailwindCSS

4. **Generate Code**
   - Enter your prompt (see examples in `EXAMPLE_PROMPTS.md`)
   - Example:
     ```
     Create a modern landing page with:
     - Hero section with CTA buttons
     - Features section (3 features)
     - Pricing table (3 tiers)
     - Newsletter signup
     
     Use React and TailwindCSS. Make it responsive and modern.
     ```
   - Click "Generate"
   - Wait for generation (10-30 seconds)

5. **View & Download Code**
   - Review generated files in the editor
   - Download as ZIP
   - Run locally or deploy

## 🔑 Required API Keys

### 1. Clerk (Authentication)
- Go to [Clerk Dashboard](https://dashboard.clerk.com)
- Create a new application
- Copy **Publishable Key** and **Secret Key**
- Add to `frontend/.env.local`

### 2. Supabase (Database)
- Go to [Supabase Dashboard](https://supabase.com/dashboard)
- Create a new project
- Go to Settings → API
- Copy **URL** and **anon public** key
- Add to both `frontend/.env.local` and `backend/.env`

### 3. A4F API (AI Provider)
- Go to [A4F API](https://api.a4f.co)
- Sign up and get API key
- Add to `backend/.env`

### 4. API Key Encryption Secret
- Generate a strong key:
  ```bash
  # Windows (PowerShell)
  [Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
  
  # Linux/Mac
  openssl rand -base64 32
  ```
- Add to `frontend/.env.local` as `API_KEY_ENCRYPTION_SECRET`

## 🛠️ Troubleshooting

### Backend Won't Start

**Error: Module not found**
```bash
# Ensure virtual environment is activated
# Reinstall dependencies
pip install -r requirements.txt
```

**Error: Port 8000 already in use**
```bash
# Find and kill the process
# Windows:
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Linux/Mac:
lsof -ti:8000 | xargs kill -9
```

### Frontend Won't Start

**Error: Module not found**
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Error: Port 3000 already in use**
```bash
# Use a different port
npm run dev -- -p 3001
```

### Database Connection Issues

1. Check Supabase URL and keys in `.env` files
2. Verify schema is applied (check Supabase Table Editor)
3. Test connection:
   ```bash
   curl https://your-project.supabase.co/rest/v1/ \
     -H "apikey: your_anon_key"
   ```

### Code Generation Fails

1. **Check API Key**: Ensure your AI provider API key is valid
2. **Check Rate Limits**: You may have exceeded API rate limits
3. **Check Backend Logs**: Look for error messages in terminal
4. **Try Different Model**: Switch to a different AI model

## 📚 Next Steps

1. **Read Example Prompts**: Check `EXAMPLE_PROMPTS.md` for inspiration
2. **Explore Features**: Try different project types and tech stacks
3. **Customize**: Modify generated code to fit your needs
4. **Deploy**: Follow `PRODUCTION_DEPLOYMENT.md` for deployment guide

## 🆘 Getting Help

- **Documentation**: Check `/docs` folder
- **Example Prompts**: See `EXAMPLE_PROMPTS.md`
- **Deployment Guide**: See `PRODUCTION_DEPLOYMENT.md`
- **Issues**: Create an issue on GitHub
- **Security**: See `SECURITY.md`

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Happy Coding! 🎉**
