# CodeGenesis - Autonomous AI Software Architect

> **Text-to-App Platform** | Build applications at the speed of thought

![CodeGenesis Banner](https://via.placeholder.com/1200x400?text=CodeGenesis+AI+Architect)

CodeGenesis is a production-ready, open-source platform that uses a multi-agent AI swarm to autonomously plan, code, test, and deploy full-stack applications from natural language descriptions.

## 🌟 Features

- **Text-to-App Generation**: Describe your app in plain English, get a complete codebase
- **Multi-Agent Swarm**:
  - **Architect Agent**: Plans file structure and tech stack
  - **Engineer Agent**: Writes code for each file
  - **TestSprite Agent**: Generates Playwright tests automatically
- **OpenLovable Editor**: Click-to-edit visual interface
- **Live Preview**: See your app running in real-time
- **Production Ready**: Clerk authentication, Supabase data collection, Admin dashboard

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Python 3.10+
- Google Gemini API Key (Free tier available)

### Installation

#### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/CodeGenesis.git
cd CodeGenesis
```

#### 2. Backend Setup

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate

pip install -r requirements.txt
```

Create `.env` file in `backend/`:

```env
GEMINI_API_KEY=your_gemini_api_key_here
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
```

#### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

Create `.env.local` file in `frontend/`:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Running Locally

#### Terminal 1 - Backend

```bash
cd backend
venv\Scripts\activate  # or source venv/bin/activate
uvicorn main:app --reload --port 8000
```

#### Terminal 2 - Frontend

```bash
cd frontend
npm run dev
```

Visit `http://localhost:3000`

## 📖 Usage

1. **Sign Up**: Create an account using Clerk authentication
2. **Dashboard**: Click "New Project" to start
3. **Editor**: Describe your app in the chat (e.g., "Create a todo list with add/delete")
4. **Watch**: The AI agents plan, code, and test your app in real-time
5. **Preview**: See the generated app running live

## 🏗️ Architecture

```
CodeGenesis/
├── frontend/          # Next.js 14 + Tailwind + Clerk
│   ├── app/           # Pages (Landing, Dashboard, Editor, Admin)
│   ├── components/    # UI Components (Chat, Code Editor, Preview)
│   └── lib/           # API Client, Utils
├── backend/           # FastAPI + LangGraph
│   ├── agents/        # Architect, Engineer, TestSprite
│   ├── orchestrator.py # LangGraph Workflow
│   ├── vfs.py         # Virtual File System
│   └── main.py        # API Endpoints
└── docs/              # Documentation and Guides
```

## 🚢 Deployment

### Vercel (Frontend)

CodeGenesis is optimized for deployment on Vercel.

1.  **Push to GitHub**: Push your code to a GitHub repository.
2.  **Import to Vercel**: Go to [Vercel](https://vercel.com) and import your repository.
3.  **Environment Variables**: Add the following environment variables in Vercel project settings:
    *   `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
    *   `CLERK_SECRET_KEY`
    *   `NEXT_PUBLIC_CLERK_SIGN_IN_URL`
    *   `NEXT_PUBLIC_CLERK_SIGN_UP_URL`
    *   `NEXT_PUBLIC_API_URL` (URL of your deployed backend)
4.  **Deploy**: Click "Deploy".

**Note for Development Deployment:**
If you are deploying a development branch or preview, ensure your Clerk keys are for the correct environment (Development vs Production).

### Render (Backend)

1.  Create a new Web Service on [Render](https://render.com).
2.  Connect your GitHub repository.
3.  Set **Build Command**: `pip install -r requirements.txt`
4.  Set **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5.  Add environment variables from `.env`.

## 🤝 Contributing

We welcome contributions! Please see `CONTRIBUTING.md` (coming soon) for details.

1.  Fork the repo
2.  Create your feature branch (`git checkout -b feature/amazing-feature`)
3.  Commit your changes (`git commit -m 'Add some amazing feature'`)
4.  Push to the branch (`git push origin feature/amazing-feature`)
5.  Open a Pull Request

## 📄 License

MIT License - Free to use for personal and commercial projects.

## 🎓 Built For

Final Year CSE Project 2025 - Showcasing cutting-edge AI agent orchestration.

---

**Made with ❤️ using LangGraph, Gemini, Next.js, and FastAPI**
