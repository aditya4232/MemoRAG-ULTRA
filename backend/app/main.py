"""
MemoRAG ULTRA - FastAPI Main Application
"""
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core import get_config, get_lm_studio_client
from app.db import get_db

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events"""
    # Startup
    logger.info("Starting MemoRAG ULTRA...")
    
    # Load configuration
    config = get_config()
    logger.info(f"Configuration loaded from {config}")
    
    # Initialize database
    db = get_db()
    logger.info("Database initialized")
    
    # Check LM Studio connection
    lm_client = get_lm_studio_client()
    is_connected = await lm_client.check_connection()
    if is_connected:
        logger.info(f"✓ LM Studio connected at {config.lm_studio.base_url}")
    else:
        logger.warning(f"✗ LM Studio not connected at {config.lm_studio.base_url}")
        logger.warning("Please start LM Studio server before using the system")
    
    logger.info("MemoRAG ULTRA started successfully!")
    
    yield
    
    # Shutdown
    logger.info("Shutting down MemoRAG ULTRA...")


# Create FastAPI app
app = FastAPI(
    title="MemoRAG ULTRA",
    description="Production-grade, research-level AI knowledge engine",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
config = get_config()
app.add_middleware(
    CORSMiddleware,
    allow_origins=config.api.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================================
# Root Endpoints
# ============================================================================

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "name": "MemoRAG ULTRA",
        "version": "1.0.0",
        "description": "Production-grade, research-level AI knowledge engine",
        "features": [
            "Multi-Modal RAG",
            "Hybrid Retrieval (Speed + Deep)",
            "5 AI Agents",
            "Continual Learning",
            "3D Knowledge Graph",
            "Fact-Checking",
            "Semantic Caching",
            "Research Metrics"
        ],
        "status": "running"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    lm_client = get_lm_studio_client()
    lm_connected = await lm_client.check_connection()
    
    # TODO: Check Redis connection when implemented
    redis_connected = False
    
    status = "healthy" if lm_connected else "degraded"
    
    return {
        "status": status,
        "lm_studio": "connected" if lm_connected else "disconnected",
        "redis": "connected" if redis_connected else "not_configured",
        "database": "connected"
    }


# ============================================================================
# API Routers
# ============================================================================

from app.api import ingest, query, system
app.include_router(ingest.router, prefix="/api", tags=["ingestion"])
app.include_router(query.router, prefix="/api", tags=["query"])
app.include_router(system.router, prefix="/api", tags=["system"])


# ============================================================================
# Error Handlers
# ============================================================================

@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Global exception handler"""
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "message": str(exc)
        }
    )


if __name__ == "__main__":
    import uvicorn
    config = get_config()
    uvicorn.run(
        "app.main:app",
        host=config.api.host,
        port=config.api.port,
        reload=True,
        log_level="info"
    )
