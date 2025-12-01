# MemoRAG ULTRA - Quick Start Guide

## Prerequisites

1. **Python 3.11+** installed
2. **Node.js 18+** installed (for frontend)
3. **LM Studio** downloaded and running

## Step 1: Install LM Studio

1. Download from [lmstudio.ai](https://lmstudio.ai)
2. Install and open LM Studio
3. Download a model (recommended: `Phi-3-mini-4k-instruct-Q4_K_M`)
4. Start the local server:
   - Click "Local Server" tab
   - Click "Start Server"
   - Default URL: `http://localhost:1234`

## Step 2: Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (Mac/Linux)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Download spaCy model
python -m spacy download en_core_web_sm

# Copy config
copy ..\config\config.example.yaml ..\config\config.yaml

# Edit config.yaml if needed (update LM Studio model name)
```

## Step 3: Test the System

```bash
# Run system test
python ..\scripts\test_system.py
```

Expected output:
- ✓ Configuration loaded
- ✓ Database connected
- ✓ LM Studio connected
- ✓ Embedding generation successful
- ✓ All components working

## Step 4: Start the Backend

```bash
# Start FastAPI server
python -m app.main
```

Backend will run on `http://localhost:8000`

Visit `http://localhost:8000/docs` for interactive API documentation

## Step 5: Test API Endpoints

### Test Health Check
```bash
curl http://localhost:8000/health
```

### Test Document Ingestion

Create a test file `test.txt`:
```
MemoRAG ULTRA is a powerful local AI knowledge engine.
It uses hybrid retrieval with Speed and Deep modes.
The system runs entirely on your laptop with no cloud dependencies.
```

Ingest the document:
```bash
curl -X POST "http://localhost:8000/api/ingest" \
  -F "file=@test.txt" \
  -F "doc_type=text" \
  -F "title=Test Document"
```

### Test Query
```bash
curl -X POST "http://localhost:8000/api/query" \
  -H "Content-Type: application/json" \
  -d "{\"question\": \"What is MemoRAG ULTRA?\", \"mode\": \"auto\"}"
```

### Check System Status
```bash
curl http://localhost:8000/api/system/status
```

## Step 6: Frontend Setup (Optional)

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

Frontend will run on `http://localhost:5173`

## Common Issues

### LM Studio Not Connected
- Ensure LM Studio server is running
- Check the URL in `config/config.yaml` matches LM Studio
- Verify the model name is correct

### Import Errors
- Make sure virtual environment is activated
- Run `pip install -r requirements.txt` again
- Check Python version (must be 3.11+)

### Database Errors
- The database is created automatically
- Check `data/` directory exists and is writable

## Next Steps

1. **Ingest More Documents**: Upload PDFs, DOCX, or URLs
2. **Try Different Query Modes**: Test Speed vs Deep mode
3. **Explore the API**: Visit `/docs` for full API documentation
4. **Build the Frontend**: Complete the React UI for better UX

## API Endpoints Summary

- `GET /` - Root endpoint
- `GET /health` - Health check
- `POST /api/ingest` - Upload document
- `GET /api/documents` - List documents
- `POST /api/query` - Query knowledge base
- `POST /api/query/stream` - Streaming query
- `GET /api/system/status` - System status
- `GET /api/system/metrics` - Detailed metrics
- `GET /api/knowledge/timeline` - Knowledge evolution

## Performance Tips

1. **Use Speed Mode** for simple factual questions
2. **Use Deep Mode** for complex, multi-hop queries
3. **Let Auto Mode** decide for best results
4. **Monitor memory** usage via `/api/system/status`

## Support

For issues or questions:
- Check the logs in `data/logs/`
- Review API docs at `/docs`
- Ensure all dependencies are installed
