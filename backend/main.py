from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from orchestrator import CodeGenesisOrchestrator
from dotenv import load_dotenv
from api_config import api_config
from langchain_core.messages import HumanMessage, SystemMessage

load_dotenv()

app = FastAPI(title="CodeGenesis API")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class GenerateRequest(BaseModel):
    prompt: str
    user_api_key: Optional[str] = None
    user_provider: Optional[str] = None  # "openai", "anthropic", "gemini", "a4f", "custom"
    user_base_url: Optional[str] = None  # For custom API endpoints

class ChatRequest(BaseModel):
    message: str
    context: Optional[str] = None

@app.get("/")
def read_root():
    return {"message": "CodeGenesis Architect Engine is Online"}

@app.post("/api/generate")
def generate_app(request: GenerateRequest):
    """
    Generate an application from a text prompt.
    REQUIRES user's API key - platform API is NOT used for project generation.
    """
    # Validate that user provided API credentials
    if not request.user_api_key or not request.user_provider:
        return {
            "error": "API_KEY_REQUIRED",
            "message": "Please configure your API key in Settings to generate projects.",
            "status": "error"
        }
    
    # Initialize orchestrator with user's API credentials
    orchestrator = CodeGenesisOrchestrator(
        user_api_key=request.user_api_key,
        user_provider=request.user_provider,
        user_base_url=request.user_base_url
    )
    
    try:
        result = orchestrator.generate_app(request.prompt)
        return result
    except ValueError as e:
        return {
            "error": "INVALID_API_CONFIG",
            "message": str(e),
            "status": "error"
        }

@app.post("/api/chat")
def chat(request: ChatRequest):
    """
    AI chatbot for platform features (recommendations, help, etc.)
    Always uses platform A4F API - not user's API key.
    """
    # Get platform LLM (always A4F)
    llm = api_config.get_llm(context="platform", temperature=0.7)
    
    system_prompt = """You are CodeGenesis AI Assistant. Help users with:
- Recommendations for their projects
- Best practices for app development
- Suggestions for features and improvements
- General coding questions

Be helpful, concise, and friendly."""
    
    messages = [
        SystemMessage(content=system_prompt),
        HumanMessage(content=request.message)
    ]
    
    response = llm.invoke(messages)
    return {"response": response.content}

@app.post("/api/validate-key")
def validate_api_key(request: GenerateRequest):
    """Validate user's API key."""
    if not request.user_api_key or not request.user_provider:
        return {"valid": False, "message": "API key and provider required"}
    
    is_valid = api_config.validate_user_api_key(
        request.user_api_key,
        request.user_provider
    )
    
    return {
        "valid": is_valid,
        "message": "API key is valid" if is_valid else "API key validation failed"
    }

@app.get("/api/health")
def health_check():
    return {"status": "healthy", "agents": ["architect", "engineer", "testsprite"]}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
