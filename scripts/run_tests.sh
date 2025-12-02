#!/bin/bash
# ============================================
# CodeGenesis - Quick Test Script (Linux/Mac)
# ============================================

echo ""
echo "============================================"
echo "   CODEGENESIS - QUICK TEST SUITE"
echo "============================================"
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "[ERROR] Python 3 is not installed"
    echo "Please install Python 3.8+ from https://python.org"
    exit 1
fi

echo "[INFO] Python found: $(python3 --version)"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "[ERROR] Node.js is not installed"
    echo "Please install Node.js from https://nodejs.org"
    exit 1
fi

echo "[INFO] Node.js found: $(node --version)"
echo ""

# Check if backend is running
echo "[INFO] Checking if backend is running..."
if curl -s http://localhost:8000/health > /dev/null 2>&1; then
    echo "[SUCCESS] Backend is running"
else
    echo "[WARNING] Backend is not running"
    echo "[INFO] Please start the backend in a separate terminal:"
    echo "   cd backend"
    echo "   python main.py"
fi
echo ""

# Check if frontend is running
echo "[INFO] Checking if frontend is running..."
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "[SUCCESS] Frontend is running"
else
    echo "[WARNING] Frontend is not running"
    echo "[INFO] Please start the frontend in a separate terminal:"
    echo "   cd frontend"
    echo "   npm run dev"
fi
echo ""

# Check for OpenRouter API key
if [ -z "$OPENROUTER_API_KEY" ]; then
    echo "[WARNING] OPENROUTER_API_KEY environment variable not set"
    echo "[INFO] Set it with: export OPENROUTER_API_KEY=your_key_here"
    echo "[INFO] Or add it to your ~/.bashrc or ~/.zshrc"
else
    echo "[SUCCESS] OPENROUTER_API_KEY is set"
fi
echo ""

# Install test dependencies if needed
echo "[INFO] Installing test dependencies..."
pip3 install requests > /dev/null 2>&1
echo "[SUCCESS] Dependencies installed"
echo ""

# Run the test suite
echo "============================================"
echo "   RUNNING TESTS"
echo "============================================"
echo ""

python3 test_all_features.py

echo ""
echo "============================================"
echo "   TEST COMPLETE"
echo "============================================"
echo ""
