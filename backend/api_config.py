"""
API Configuration Manager for CodeGenesis
Handles dual API system: Platform API (A4F) and User BYOK (Bring Your Own Key)
"""
import os
from typing import Optional, Literal
from langchain_openai import ChatOpenAI
from dotenv import load_dotenv

load_dotenv()

APIContext = Literal["platform", "user_project"]


class APIConfigManager:
    """
    Manages API configurations for different contexts.
    
    - Platform features (chatbot, recommendations): Always use A4F API
    - User projects (code generation): Use user's API key if provided, fallback to A4F
    """
    
    def __init__(self):
        # Platform API (A4F) - Always available
        self.platform_api_key = os.getenv("A4F_API_KEY")
        self.platform_base_url = os.getenv("A4F_BASE_URL", "https://api.a4f.co/v1")
        self.platform_model = os.getenv("A4F_MODEL", "provider-2/gemini-2.5-flash")
        
        # User BYOK defaults (can be overridden per-user)
        self.default_user_provider = os.getenv("DEFAULT_USER_PROVIDER", "a4f")  # a4f, openai, anthropic, gemini
    
    def get_llm(
        self, 
        context: APIContext = "platform",
        user_api_key: Optional[str] = None,
        user_provider: Optional[str] = None,
        user_base_url: Optional[str] = None,
        temperature: float = 0.7
    ) -> ChatOpenAI:
        """
        Get LLM instance based on context and user configuration.
        
        Args:
            context: "platform" for chatbot/recommendations, "user_project" for code generation
            user_api_key: User's own API key (REQUIRED for user_project)
            user_provider: User's preferred provider (REQUIRED for user_project)
            user_base_url: Custom base URL (optional, for custom endpoints)
            temperature: Model temperature
            
        Returns:
            Configured ChatOpenAI instance
            
        Raises:
            ValueError: If user_project context is used without API credentials
        """
        if context == "platform":
            # Always use A4F API for platform features (chatbot, recommendations)
            return self._get_a4f_llm(temperature)
        
        elif context == "user_project":
            # For user projects, API key is REQUIRED
            if not user_api_key or not user_provider:
                raise ValueError(
                    "User API key and provider are required for project generation. "
                    "Please configure your API settings."
                )
            
            return self._get_user_llm(user_api_key, user_provider, user_base_url, temperature)
        
        raise ValueError(f"Invalid context: {context}")
    
    def _get_a4f_llm(self, temperature: float) -> ChatOpenAI:
        """Get A4F API LLM instance (platform features only)"""
        return ChatOpenAI(
            model=self.platform_model,
            openai_api_key=self.platform_api_key,
            openai_api_base=self.platform_base_url,
            temperature=temperature
        )
    
    def _get_user_llm(
        self, 
        api_key: str, 
        provider: str, 
        base_url: Optional[str],
        temperature: float
    ) -> ChatOpenAI:
        """Get user's custom LLM instance based on their provider"""
        
        # If custom base URL is provided, use it
        if base_url:
            return ChatOpenAI(
                model="default",  # Model name might be specified in base URL
                openai_api_key=api_key,
                openai_api_base=base_url,
                temperature=temperature
            )
        
        # Predefined providers
        if provider == "openai":
            return ChatOpenAI(
                model="gpt-4o-mini",
                openai_api_key=api_key,
                temperature=temperature
            )
        
        elif provider == "anthropic":
            return ChatOpenAI(
                model="claude-3-5-sonnet-20241022",
                openai_api_key=api_key,
                openai_api_base="https://api.anthropic.com/v1",
                temperature=temperature
            )
        
        elif provider == "gemini":
            # Google AI Studio / Gemini
            return ChatOpenAI(
                model="gemini-1.5-flash",
                openai_api_key=api_key,
                openai_api_base="https://generativelanguage.googleapis.com/v1beta",
                temperature=temperature
            )
        
        elif provider == "openrouter":
            # OpenRouter
            return ChatOpenAI(
                model="anthropic/claude-3.5-sonnet", # Default, can be overridden
                openai_api_key=api_key,
                openai_api_base="https://openrouter.ai/api/v1",
                temperature=temperature,
                default_headers={"HTTP-Referer": "https://codegenesis.app", "X-Title": "CodeGenesis"}
            )
        
        elif provider == "a4f":
            # User's own A4F key
            return ChatOpenAI(
                model="provider-2/gemini-2.5-flash",
                openai_api_key=api_key,
                openai_api_base="https://api.a4f.co/v1",
                temperature=temperature
            )
        
        else:
            raise ValueError(f"Unsupported provider: {provider}")

    
    def validate_user_api_key(self, api_key: str, provider: str, base_url: Optional[str] = None) -> bool:
        """
        Validate user's API key by making a test call.
        
        Args:
            api_key: User's API key
            provider: Provider name
            base_url: Custom base URL (optional)
            
        Returns:
            True if valid, False otherwise
        """
        try:
            # Fix: Pass None for base_url if not provided, and pass temperature as keyword arg
            llm = self._get_user_llm(api_key, provider, base_url, temperature=0.1)
            # Make a simple test call
            response = llm.invoke("Say 'OK'")
            return True
        except Exception as e:
            print(f"API key validation failed: {e}")
            return False


# Global instance
api_config = APIConfigManager()
