# Setup Guide

This document provides detailed instructions for setting up the CodeGenesis development environment on your local machine.

## System Requirements

### Hardware
- Minimum 8GB RAM (16GB recommended)
- At least 5GB free disk space
- Stable internet connection for API calls

### Software
- **Node.js**: Version 18.0.0 or higher
- **Python**: Version 3.10 or higher
- **Git**: Latest version
- **Code Editor**: VS Code recommended

## Step-by-Step Setup

### 1. Repository Setup

Clone the repository to your local machine:

```bash
git clone <repository-url>
cd GiblerXT
```

### 2. Backend Environment Setup

#### Create Virtual Environment

Navigate to the backend directory:

```bash
cd backend
```

Create a Python virtual environment:

```bash
python -m venv venv
```

#### Activate Virtual Environment

**Windows (PowerShell):**
```bash
venv\Scripts\activate
```

**Windows (Command Prompt):**
```bash
venv\Scripts\activate.bat
```

**Linux/macOS:**
```bash
source venv/bin/activate
```

You should see `(venv)` appear in your terminal prompt.

#### Install Python Dependencies

With the virtual environment activated, install all required packages:

```bash
pip install -r requirements.txt
```

This will install:
- FastAPI (web framework)
- Uvicorn (ASGI server)
- LangGraph (agent orchestration)
- LangChain (LLM framework)
- Google Generative AI SDK
- Supabase client
- Python-dotenv (environment variables)
- Playwright (testing)
- Pytest (testing framework)

#### Configure Environment Variables

Create a `.env` file in the backend directory:

```bash
# On Windows
type nul > .env

# On Linux/macOS
touch .env
```

Add the following configuration:

```env
# Required: Google Gemini API Key
GEMINI_API_KEY=your_actual_gemini_api_key_here

# Optional: Alternative LLM providers
OPENAI_API_KEY=
ANTHROPIC_API_KEY=

# Optional: Database configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_key
```

### 3. Frontend Environment Setup

Open a new terminal window and navigate to the frontend directory:

```bash
cd frontend
```

#### Install Node Dependencies

Install all required npm packages:

```bash
npm install
```

This will install:
- Next.js 14 (React framework)
- TypeScript (type safety)
- Tailwind CSS (styling)
- Shadcn UI (component library)
- Monaco Editor (code editor)
- Framer Motion (animations)
- Clerk (authentication)
- Lucide React (icons)

#### Configure Environment Variables

Create a `.env.local` file in the frontend directory:

```bash
# On Windows
type nul > .env.local

# On Linux/macOS
touch .env.local
```

Add the following configuration:

```env
# Required: Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# Clerk URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Obtaining Required API Keys

### Google Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key" or "Get API Key"
4. Select "Create API key in new project" or choose an existing project
5. Copy the generated key
6. Paste it into your backend `.env` file as `GEMINI_API_KEY`

**Note**: The free tier provides generous limits suitable for development and testing.

### Clerk Authentication Keys

1. Go to [Clerk.com](https://clerk.com) and sign up for a free account
2. Click "Add Application" in the dashboard
3. Choose your application name (e.g., "CodeGenesis")
4. Select your preferred authentication methods (Email, Google, GitHub, etc.)
5. After creation, navigate to "API Keys" in the sidebar
6. Copy the "Publishable Key" and "Secret Key"
7. Paste them into your frontend `.env.local` file

### Supabase Database (Optional)

1. Create an account at [Supabase.com](https://supabase.com)
2. Click "New Project"
3. Fill in project details and choose a region
4. Wait for the project to be created
5. Go to Settings > API
6. Copy the "Project URL" and "anon public" key
7. Paste them into your backend `.env` file

## Verification

### Test Backend Setup

With your backend virtual environment activated:

```bash
cd backend
python -c "import fastapi, langchain, langgraph; print('All imports successful')"
```

You should see "All imports successful" without any errors.

### Test Frontend Setup

```bash
cd frontend
npm run build
```

This will verify that all dependencies are correctly installed and the project can build successfully.

## Running the Development Servers

### Start Backend Server

In your backend terminal:

```bash
cd backend
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac
uvicorn main:app --reload --port 8000
```

Expected output:
```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

### Start Frontend Server

In your frontend terminal:

```bash
cd frontend
npm run dev
```

Expected output:
```
  ▲ Next.js 14.x.x
  - Local:        http://localhost:3000
  - Environments: .env.local

 ✓ Ready in 2.3s
```

## Troubleshooting

### Backend Issues

**Problem**: `ModuleNotFoundError` when starting the server

**Solution**: Ensure your virtual environment is activated and all dependencies are installed:
```bash
pip install -r requirements.txt
```

**Problem**: `GEMINI_API_KEY not found`

**Solution**: Verify that your `.env` file exists in the backend directory and contains the API key.

### Frontend Issues

**Problem**: `Module not found` errors

**Solution**: Delete `node_modules` and reinstall:
```bash
rm -rf node_modules package-lock.json
npm install
```

**Problem**: Clerk authentication not working

**Solution**: Verify that your `.env.local` file contains valid Clerk keys and restart the development server.

### Port Conflicts

If port 3000 or 8000 is already in use:

**Frontend**: Use a different port
```bash
PORT=3001 npm run dev
```

**Backend**: Specify a different port
```bash
uvicorn main:app --reload --port 8001
```

## Next Steps

After completing the setup:

1. Visit `http://localhost:3000` in your browser
2. Sign up for an account using Clerk
3. Navigate to the Dashboard
4. Create a new project and test the application generation

For deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md)
